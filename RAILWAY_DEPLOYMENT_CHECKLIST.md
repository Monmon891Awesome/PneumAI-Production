# Railway Full-Stack Deployment Checklist

Follow these steps to deploy PneumAI to Railway:

## Pre-Deployment (Local)

- [x] ONNX model converted (`best.onnx` - 11.5 MB)
- [x] Dockerfile configured for full-stack
- [x] Frontend serving added to FastAPI
- [x] Environment variables documented
- [x] `.dockerignore` optimized
- [x] `railway.toml` configured
- [x] Database schema ready (`database/init/01_schema.sql`)
- [x] Seed data ready (`database/init/02_seed_data.sql`)

## Step 1: Create Railway Project

- [ ] Go to https://railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `PneumAI-Production` repository
- [ ] Railway auto-detects Dockerfile ✅

## Step 2: Add PostgreSQL Database

- [ ] In Railway dashboard, click "New"
- [ ] Select "Database" → "PostgreSQL"
- [ ] Wait for provisioning (2-3 minutes)
- [ ] Note: `DATABASE_URL` is auto-injected into backend service

## Step 3: Configure Environment Variables

In Railway backend service → Settings → Variables, add:

```bash
# Database (auto-injected by Railway PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Application
SECRET_KEY=<run: openssl rand -base64 32>
ENVIRONMENT=production
UPLOAD_DIR=/tmp/uploads

# Model
MODEL_PATH=best.onnx
YOLO_CONFIDENCE_THRESHOLD=0.25

# CORS - Update after first deployment with actual Railway URL
FRONTEND_URL=https://pneumai-production-xxxxx.up.railway.app
```

**Generate SECRET_KEY:**
```bash
openssl rand -base64 32
```

- [ ] Added all environment variables
- [ ] Generated secure SECRET_KEY (32+ characters)
- [ ] Saved changes

## Step 4: First Deployment

- [ ] Railway automatically deploys on variable save
- [ ] Monitor build logs (3-5 minutes for first build)
- [ ] Wait for "Deployment successful" message
- [ ] Copy Railway public URL from dashboard

## Step 5: Update FRONTEND_URL

- [ ] Update `FRONTEND_URL` variable with actual Railway URL
- [ ] Save (triggers redeploy - 1-2 minutes)

## Step 6: Initialize Database

**Option A: Railway CLI (Recommended)**

Install Railway CLI:
```bash
npm install -g @railway/cli
railway login
railway link  # Select your project
```

Run schema:
```bash
railway run psql $DATABASE_URL -f database/init/01_schema.sql
```

Run seed data:
```bash
railway run psql $DATABASE_URL -f database/init/02_seed_data.sql
```

**Option B: Manual (if CLI fails)**

1. Get database credentials from Railway dashboard
2. Use pgAdmin or any PostgreSQL client
3. Connect to Railway database
4. Run `01_schema.sql` first
5. Run `02_seed_data.sql` second

- [ ] Schema initialized (11 tables created)
- [ ] Seed data loaded (test users, doctors, patients)

## Step 7: Verify Deployment

**Health Check:**
```bash
curl https://your-railway-url.up.railway.app/health
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

- [ ] `/health` returns status: "healthy"
- [ ] `database: true`
- [ ] `model_loaded: true`

**Frontend:**
- [ ] Open `https://your-railway-url.up.railway.app` in browser
- [ ] React app loads correctly
- [ ] Can navigate to `/login`, `/dashboard`

**API Docs:**
- [ ] Visit `https://your-railway-url.up.railway.app/docs`
- [ ] FastAPI Swagger UI loads
- [ ] Can see all API endpoints

## Step 8: Test Functionality

**Login Test:**
```bash
curl -X POST https://your-railway-url.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@pneumai.com", "password": "admin123"}'
```

- [ ] Login successful
- [ ] Returns session token

**CT Scan Upload Test:**
```bash
curl -X POST https://your-railway-url.up.railway.app/api/v1/scans/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@test_ct_scan.jpg" \
  -F "patient_id=1"
```

- [ ] Upload successful
- [ ] YOLO analysis runs
- [ ] Returns detection results

## Troubleshooting

### Build Fails
- Check Railway logs for specific error
- Verify `requirements-onnx.txt` is used (not `requirements.txt`)
- Ensure `best.onnx` is in repository

### Healthcheck Fails
- Check `/health` response for specific failure
- If `database: false` → Verify DATABASE_URL and schema initialization
- If `model_loaded: false` → Check model path and file exists

### Frontend Not Loading
- Verify frontend built in Docker (check logs for `npm run build`)
- Check `/build` directory exists in container
- Verify FastAPI static file mounting

### CORS Errors
- Update `FRONTEND_URL` to match Railway URL
- Check `ALLOWED_ORIGINS` in config

## Deployment Complete! 🎉

**Your URLs:**
- Frontend: https://your-railway-url.up.railway.app
- API: https://your-railway-url.up.railway.app/api/v1
- Docs: https://your-railway-url.up.railway.app/docs
- Health: https://your-railway-url.up.railway.app/health

**Next Steps:**
- [ ] Share Railway URL with users
- [ ] Monitor resource usage in Railway dashboard
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerts

---

**For detailed troubleshooting, see:**
[AI_AGENT_DEPLOYMENT_GUIDE.md](./AI_AGENT_DEPLOYMENT_GUIDE.md)
