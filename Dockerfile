# ==========================================
# Stage 1: Frontend Builder
# ==========================================
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY public/ ./public/
COPY src/ ./src/
COPY tailwind.config.js postcss.config.js ./

# Build React application
RUN npm run build

# ==========================================
# Stage 2: Backend Runtime
# ==========================================
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies and clean up in single layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libgomp1 \
        libgl1 \
        postgresql-client \
        curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set working directory
WORKDIR /app

# Copy and install ONNX-optimized dependencies (includes full AI functionality)
COPY requirements-onnx.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements-onnx.txt && \
    rm -rf /root/.cache/pip /tmp/*

# Copy application code
COPY app/ ./app/

# Copy YOLO ONNX model (11.5 MB - lightweight inference)
COPY best.onnx ./best.onnx

# Copy Frontend Build from Stage 1
COPY --from=builder /app/build ./build

# Create upload directories
RUN mkdir -p /tmp/uploads/originals /tmp/uploads/annotated /tmp/uploads/thumbnails && \
    chmod -R 755 /tmp/uploads

# ONNX model provides full CT scan AI analysis with 85% smaller deployment size

# Expose port
EXPOSE 8000

# Health check (simplified)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
