# PneumAI Deployment Guide for AI Coding Agents
**Compatible with: Claude Code, Blackbox AI, Sixth AI, Cursor, Codeium, and other agentic coding assistants**

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Railway Full-Stack Deployment](#railway-full-stack-deployment)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)
7. [Testing & Verification](#testing--verification)

---

## Project Overview

**PneumAI** is a lung cancer detection system using YOLOv12 ONNX model.

### Technology Stack
- **Backend**: FastAPI (Python 3.11)
- **Frontend**: React 18 with Tailwind CSS
- **Database**: PostgreSQL 15
- **AI Model**: YOLOv12 ONNX (11.5 MB)
- **Deployment**: Railway (full-stack)

### Key Files
```
PneumAI-Production/
├── app/                    # FastAPI backend
│   ├── main.py            # Application entry point
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic (YOLO, file manager)
│   └── database.py        # PostgreSQL connection
├── src/                    # React frontend
│   ├── App.js             # Main React app
│   ├── components/        # UI components
│   └── services/          # API client
├── database/
│   └── init/
│       ├── 01_schema.sql  # Database schema
│       └── 02_seed_data.sql # Sample data
├── best.onnx              # YOLOv12 model (11.5 MB)
├── Dockerfile             # Backend container
├── railway.toml           # Railway config
└── requirements-onnx.txt  # Python dependencies
```

---

## Architecture

### Deployment Model: Railway Full-Stack (Option 2)

```
┌─────────────────────────────────────┐
│         Railway Platform            │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   FastAPI Backend Service    │  │
│  │   - Port: 8000               │  │
│  │   - ONNX Model (1.5 GB)      │  │
│  │   - Serves React build       │  │
│  │   - API endpoints            │  │
│  └──────────────┬───────────────┘  │
│                 │                   │
│  ┌──────────────▼───────────────┐  │
│  │   PostgreSQL Database        │  │
│  │   - Port: 5432               │  │
│  │   - Tables: 11               │  │
│  │   - Seed data included       │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
          │
          │ HTTPS
          ▼
    User's Browser
```

**Why Full-Stack on Railway?**
- ✅ Single platform = easier management
- ✅ Backend serves frontend static files
- ✅ No CORS issues
- ✅ Cheaper than multi-platform deployment
- ✅ Railway free tier: 512MB RAM, 1GB storage

---

## Railway Full-Stack Deployment

### Step 1: Prepare Repository

The repository is already optimized:
- ✅ ONNX model converted (8.2 GB → 1.5 GB deployment)
- ✅ Dockerfile configured
- ✅ railway.toml configured
- ✅ .dockerignore optimized
- ✅ Frontend build process ready

### Step 2: Create Railway Project

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `PneumAI-Production` repository
5. Railway auto-detects Dockerfile

### Step 3: Add PostgreSQL Database

1. In Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway automatically:
   - Creates database
   - Generates `DATABASE_URL`
   - Injects into backend service

### Step 4: Configure Environment Variables

In Railway backend service settings, add:

```bash
# Database (auto-injected by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Application
SECRET_KEY=<generate-secure-32-char-string>
ENVIRONMENT=production
UPLOAD_DIR=/tmp/uploads

# Model
MODEL_PATH=best.onnx
YOLO_CONFIDENCE_THRESHOLD=0.25

# CORS (Railway backend URL)
FRONTEND_URL=https://your-backend-url.up.railway.app
```

**Generate SECRET_KEY:**
```bash
openssl rand -base64 32
```

### Step 5: Update Frontend API URL

Before deploying, update frontend to use Railway backend:

**Edit `src/services/api.js`:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.up.railway.app';
```

Or set as Railway environment variable:
```bash
REACT_APP_API_URL=https://your-backend-url.up.railway.app
```

### Step 6: Build Frontend in Dockerfile

The Dockerfile already includes frontend build:
```dockerfile
# Install frontend dependencies and build
COPY package*.json ./
RUN npm ci --only=production
COPY public/ ./public/
COPY src/ ./src/
COPY tailwind.config.js postcss.config.js ./
RUN npm run build

# Serve frontend from FastAPI
# Static files mounted at /app/build
```

### Step 7: Initialize Database

**Option A: Using Railway CLI (Recommended)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run schema
railway run psql $DATABASE_URL -f database/init/01_schema.sql

# Run seed data
railway run psql $DATABASE_URL -f database/init/02_seed_data.sql
```

**Option B: Using pgAdmin (Web UI)**
1. Get Railway database credentials from dashboard
2. Connect via pgAdmin
3. Run SQL files manually

**Option C: Direct psql (if credentials available)**
```bash
psql postgresql://user:pass@host:port/db -f database/init/01_schema.sql
psql postgresql://user:pass@host:port/db -f database/init/02_seed_data.sql
```

### Step 8: Deploy & Monitor

1. Railway auto-deploys on git push
2. Monitor deployment logs
3. Check healthcheck: `https://your-app.railway.app/health`
4. Access frontend: `https://your-app.railway.app`
5. Access API docs: `https://your-app.railway.app/docs`

---

## Database Setup

### Schema Overview (11 Tables)

```sql
-- Core tables
users               -- System users
doctors             -- Doctor profiles
patients            -- Patient profiles
ct_scans            -- CT scan images & AI results
appointments        -- Doctor-patient appointments

-- Supporting tables
scan_comments       -- Doctor comments on scans
messages            -- Internal messaging
notifications       -- User notifications
sessions            -- Auth sessions
audit_log           -- System audit trail
system_settings     -- Application config
```

### Sample Data Included

`02_seed_data.sql` includes:
- 3 admin users
- 5 doctors (specialties: Pulmonology, Radiology, Oncology)
- 10 patients with medical histories
- Sample CT scans with AI analysis results
- Appointments and comments

### Database Connection in FastAPI

Located in `app/database.py`:
```python
from app.config import settings

DATABASE_URL = settings.DATABASE_URL
# Railway injects: postgresql://user:pass@host:port/pneumai_db
```

---

## Environment Variables

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | Auto-injected | PostgreSQL connection string |
| `SECRET_KEY` | ✅ | - | 32+ char secret for sessions |
| `MODEL_PATH` | ✅ | `best.onnx` | ONNX model file path |
| `UPLOAD_DIR` | ✅ | `/tmp/uploads` | File upload directory |
| `ENVIRONMENT` | ❌ | `development` | `production` or `development` |
| `FRONTEND_URL` | ❌ | `http://localhost:3000` | CORS allowed origin |
| `YOLO_CONFIDENCE_THRESHOLD` | ❌ | `0.25` | AI detection threshold |
| `PORT` | ❌ | `8000` | Backend server port |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_URL` | ✅ | - | Backend API URL |
| `NODE_ENV` | ❌ | `production` | Build environment |

---

## Troubleshooting

### Issue 1: ONNX Model Not Found
**Error:** `❌ Model file not found: /app/best.onnx`

**Solution:**
1. Check `.dockerignore` has exception: `!best.onnx`
2. Verify file in repo: `git ls-files | grep best.onnx`
3. Check Dockerfile copies model: `COPY best.onnx ./best.onnx`

### Issue 2: Database Connection Failed
**Error:** `connection to server at "localhost", port 5432 failed`

**Solution:**
1. Verify `DATABASE_URL` environment variable set
2. Check Railway PostgreSQL service is running
3. Ensure database initialized with schema

### Issue 3: Healthcheck Failing
**Error:** Railway shows service as "degraded"

**Check `/health` endpoint response:**
```json
{
  "status": "degraded",
  "database": false,      // ❌ Database issue
  "model_loaded": false,  // ❌ Model issue
  "upload_dir_writable": true
}
```

**Solutions:**
- `database: false` → Check DATABASE_URL and schema
- `model_loaded: false` → Check model file and path
- `upload_dir_writable: false` → Check UPLOAD_DIR permissions

### Issue 4: CORS Errors in Frontend
**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS`

**Solution:**
Update `FRONTEND_URL` in Railway backend settings to match your frontend URL.

### Issue 5: Build Exceeds Size Limit
**Error:** `Image of size X GB exceeded limit of 4.0 GB`

**Verify ONNX optimization:**
1. Model should be `best.onnx` (11.5 MB), NOT `best.pt` (5.3 MB but requires 8.2 GB dependencies)
2. Using `requirements-onnx.txt` (not `requirements.txt`)
3. Final image size should be ~1.5 GB

### Issue 6: Frontend Not Loading
**Check these items:**
1. Frontend built in Dockerfile: `RUN npm run build`
2. Static files mounted in `app/main.py`:
   ```python
   app.mount("/", StaticFiles(directory="build", html=True), name="static")
   ```
3. Build directory exists in container: `/app/build`

---

## Testing & Verification

### Local Testing (Before Deployment)

**1. Start Local Database:**
```bash
docker-compose up -d
```

**2. Install Dependencies:**
```bash
pip3 install -r requirements-onnx.txt
npm install
```

**3. Start Backend:**
```bash
uvicorn app.main:app --reload --port 8000
```

**4. Build & Serve Frontend:**
```bash
npm run build
# Backend serves from /app/build
```

**5. Test Endpoints:**
```bash
# Health check
curl http://localhost:8000/health

# API docs
open http://localhost:8000/docs

# Frontend
open http://localhost:8000
```

### Production Testing (After Railway Deployment)

**1. Health Check:**
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": true,
  "model_loaded": true,
  "upload_dir_writable": true,
  "timestamp": "2025-11-19T..."
}
```

**2. Test CT Scan Upload:**
```bash
curl -X POST https://your-app.railway.app/api/ct-scans/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_ct_scan.jpg" \
  -F "patient_id=1"
```

**3. Check Database Tables:**
```bash
railway run psql $DATABASE_URL -c "\dt"
```

Expected: 11 tables listed

**4. Frontend Routes:**
- `/` - Landing page
- `/login` - Authentication
- `/dashboard` - Main dashboard
- `/ct-scans` - CT scan management
- `/patients` - Patient management
- `/doctors` - Doctor management

---

## Quick Reference: Key Commands

### Railway CLI
```bash
# Deploy
git push origin main

# View logs
railway logs

# Run commands
railway run <command>

# Environment variables
railway variables
```

### Database Management
```bash
# Connect to Railway PostgreSQL
railway run psql $DATABASE_URL

# List tables
railway run psql $DATABASE_URL -c "\dt"

# Run migrations
railway run psql $DATABASE_URL -f database/init/01_schema.sql
```

### Local Development
```bash
# Start all services (Docker)
docker-compose up -d

# Backend only (Python)
uvicorn app.main:app --reload

# Frontend only (React)
npm start

# Build frontend
npm run build
```

---

## AI Agent Notes

**For Claude Code, Blackbox, Sixth, Cursor:**

When assisting with PneumAI deployment:

1. **Always verify ONNX optimization** - deployment must use `best.onnx` with `requirements-onnx.txt`
2. **Database initialization is critical** - schema + seed data required before testing
3. **Railway-specific configs:**
   - `railway.toml` uses `DOCKERFILE` builder
   - Health check path: `/health`
   - Timeout: 300 seconds
4. **Environment variables** - Never commit secrets, use Railway dashboard
5. **Full-stack deployment** - Backend serves frontend from `/app/build`

**Common user requests:**
- "Railway deployment failing" → Check logs, verify ONNX, check DATABASE_URL
- "Frontend not connecting" → Update REACT_APP_API_URL to Railway backend URL
- "Database errors" → Verify schema initialization
- "Model not loading" → Check .dockerignore, Dockerfile COPY statement

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **ONNX Runtime**: https://onnxruntime.ai/docs/
- **React**: https://react.dev

---

**Generated with Claude Code**
https://claude.com/claude-code
