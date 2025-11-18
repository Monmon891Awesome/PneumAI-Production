"""
PneumAI - Unified FastAPI Backend
Lung Cancer Detection System with YOLOv12 Integration

Main application entry point with:
- FastAPI app initialization
- CORS middleware
- Static file serving
- Router registration
- Database connection pooling
- Startup/shutdown events
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging

from app.config import settings
from app.database import Database
from app.services.yolo_service import yolo_service

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PneumAI API",
    description="Unified backend API for lung cancer detection and patient management",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# ============================================================
# CORS MIDDLEWARE
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"✅ CORS enabled for origins: {settings.ALLOWED_ORIGINS}")

# ============================================================
# STATIC FILE SERVING
# ============================================================

# Mount uploads directory for serving images
app.mount(
    "/uploads",
    StaticFiles(directory=str(settings.UPLOAD_DIR)),
    name="uploads"
)

logger.info(f"✅ Static files mounted at /uploads → {settings.UPLOAD_DIR}")

# ============================================================
# STARTUP & SHUTDOWN EVENTS
# ============================================================

@app.on_event("startup")
async def startup_event():
    """Initialize resources on application startup"""
    logger.info("🚀 Starting PneumAI Backend...")

    # Validate configuration
    if not settings.validate():
        logger.error("❌ Configuration validation failed")
        raise Exception("Invalid configuration")

    # Initialize database connection pool
    if not Database.initialize():
        logger.error("❌ Database initialization failed")
        raise Exception("Database connection failed")

    # Load YOLO model
    if not yolo_service.load_model():
        logger.warning("⚠️  YOLO model failed to load - scan functionality will be limited")
    else:
        logger.info("✅ YOLO model loaded successfully")

    logger.info("✅ PneumAI Backend started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on application shutdown"""
    logger.info("🛑 Shutting down PneumAI Backend...")

    # Close database connections
    Database.close()

    logger.info("✅ PneumAI Backend shutdown complete")


# ============================================================
# ROUTER REGISTRATION
# ============================================================

# Import routers
from app.routers import health, auth, patients, doctors, scans, appointments, messages

# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "PneumAI Unified Backend API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if settings.DEBUG else "Documentation disabled in production",
        "endpoints": {
            "health": "/health",
            "auth": "/api/v1/auth",
            "patients": "/api/v1/patients",
            "doctors": "/api/v1/doctors",
            "scans": "/api/v1/scans",
            "appointments": "/api/v1/appointments",
            "messages": "/api/v1/messages"
        }
    }


# ============================================================
# REGISTER ROUTERS
# ============================================================

# Health checks (no prefix - at root level)
app.include_router(health.router, tags=["Health"])

# Authentication
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])

# Patients
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])

# Doctors
app.include_router(doctors.router, prefix="/api/v1/doctors", tags=["Doctors"])

# Scans (CT scan upload and analysis)
app.include_router(scans.router, prefix="/api/v1/scans", tags=["Scans"])

# Appointments
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Appointments"])

# Messages
app.include_router(messages.router, prefix="/api/v1/messages", tags=["Messages"])

logger.info("✅ All routers registered successfully")


# ============================================================
# APPLICATION ENTRY POINT
# ============================================================

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL
    )
