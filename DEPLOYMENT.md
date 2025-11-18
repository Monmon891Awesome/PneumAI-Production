# PneumAI Production Deployment

This repository contains the production-ready PneumAI application optimized for Railway deployment.

## Key Features
- **YOLOv12 ONNX Model**: Lightweight lung cancer detection (1.5 GB deployment vs 8.2 GB PyTorch)
- **FastAPI Backend**: High-performance REST API
- **PostgreSQL Database**: Production-ready data persistence
- **React Frontend**: Modern, responsive UI with Tailwind CSS

## Deployment Size Optimization
- Original PyTorch deployment: **8.2 GB** (exceeds Railway 4 GB limit)
- ONNX optimized deployment: **~1.5 GB** ✅ (Railway free tier compatible)

## Quick Deploy to Railway

### Backend + Database
1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository
4. Railway will auto-detect the Dockerfile
5. Add PostgreSQL database from "New" → "Database" → "PostgreSQL"
6. Set environment variables:
   - `DATABASE_URL` (auto-injected by Railway)
   - `SECRET_KEY` (generate secure 32+ char string)
   - `FRONTEND_URL` (your Vercel URL)
   - `ENVIRONMENT=production`
   - `UPLOAD_DIR=/tmp/uploads`

### Frontend to Vercel
1. Go to [Vercel](https://vercel.com)
2. Import this repository
3. Configure:
   - Framework: Next.js (or React)
   - Build command: `npm run build`
   - Output directory: `build`
4. Set environment variable:
   - `REACT_APP_API_URL` (your Railway backend URL)

## Local Development
```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Install Python dependencies
pip install -r requirements-onnx.txt

# Run backend
uvicorn app.main:app --reload

# In another terminal, install frontend dependencies
npm install

# Run frontend
npm start
```

## ONNX Model Details
- **Model file**: `best.onnx` (11.5 MB)
- **Runtime**: ONNX Runtime (CPU optimized)
- **Inference time**: ~200-500ms per CT scan
- **Detection classes**: normal, benign, malignant, nodule, mass, suspicious

## Database Schema
PostgreSQL schema and seed data are in `database/init/`:
- `01_schema.sql`: Complete database structure
- `02_seed_data.sql`: Sample data for testing

## Tech Stack
- **Backend**: FastAPI, ONNX Runtime, OpenCV, Pillow, PyDICOM
- **Frontend**: React, Tailwind CSS
- **Database**: PostgreSQL 15
- **AI Model**: YOLOv12 (ONNX format)
- **Deployment**: Railway (backend), Vercel (frontend)

---
Generated with [Claude Code](https://claude.com/claude-code)
