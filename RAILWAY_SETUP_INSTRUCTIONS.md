# Railway Manual Setup Instructions for PneumAI

**Follow these steps exactly to get your PneumAI deployment working on Railway.**

---

## Prerequisites

Before you start, make sure you have:
- [ ] GitHub account with `PneumAI-Production` repository
- [ ] Railway account (sign up at https://railway.app if needed)
- [ ] This repository pushed to GitHub (already done ✅)

---

## Part 1: Create Railway Project (5 minutes)

### Step 1.1: Create New Railway Project

1. Go to https://railway.app/dashboard
2. Click the **"New Project"** button
3. Select **"Deploy from GitHub repo"**
4. If prompted, authorize Railway to access your GitHub account
5. Search for and select **`PneumAI-Production`** repository
6. Railway will automatically detect the `Dockerfile` and start building

**Wait for the initial build to complete (this will fail - that's expected!)**

---

## Part 2: Add PostgreSQL Database (2 minutes)

### Step 2.1: Add PostgreSQL Service

1. In your Railway project dashboard
2. Click **"New"** button (top right)
3. Select **"Database"**
4. Choose **"PostgreSQL"**
5. Wait 1-2 minutes for PostgreSQL to provision
6. You should now see TWO services in your project:
   - `PneumAI-Production` (your backend)
   - `Postgres` (your database)

### Step 2.2: Verify Database Connection

1. Click on the **`Postgres`** service
2. Go to **"Variables"** tab
3. You should see variables like:
   - `DATABASE_URL`
   - `POSTGRES_DB`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`

**Keep this tab open - you'll need these values!**

---

## Part 3: Configure Backend Environment Variables (5 minutes)

### Step 3.1: Open Backend Service Settings

1. Click on the **`PneumAI-Production`** service (your backend)
2. Go to **"Variables"** tab
3. You should see one variable already: `DATABASE_URL` (auto-injected from Postgres)

### Step 3.2: Add Required Environment Variables

Click **"New Variable"** for each of these:

#### Variable 1: SECRET_KEY
```
Name:  SECRET_KEY
Value: <GENERATE THIS - SEE BELOW>
```

**How to generate SECRET_KEY:**

**Option A (Mac/Linux Terminal):**
```bash
openssl rand -base64 32
```

**Option B (Python):**
```python
import secrets
print(secrets.token_urlsafe(32))
```

**Option C (Online Generator):**
Go to https://www.random.org/strings/ and generate a 32+ character string

Copy the generated value and paste it as the `SECRET_KEY` value.

#### Variable 2: ENVIRONMENT
```
Name:  ENVIRONMENT
Value: production
```

#### Variable 3: UPLOAD_DIR
```
Name:  UPLOAD_DIR
Value: /tmp/uploads
```

#### Variable 4: MODEL_PATH
```
Name:  MODEL_PATH
Value: best.onnx
```

#### Variable 5: YOLO_CONFIDENCE_THRESHOLD
```
Name:  YOLO_CONFIDENCE_THRESHOLD
Value: 0.25
```

#### Variable 6: FRONTEND_URL (Temporary)
```
Name:  FRONTEND_URL
Value: https://placeholder.railway.app
```

**Note:** We'll update this with the real URL in Step 4.3

### Step 3.3: Save and Trigger Redeploy

1. After adding all 6 variables, Railway will automatically trigger a new deployment
2. Wait 3-5 minutes for the build to complete
3. Watch the **"Deployments"** tab for progress

---

## Part 4: Get Your Railway URL and Update FRONTEND_URL (2 minutes)

### Step 4.1: Find Your Railway Public URL

1. In the **`PneumAI-Production`** service
2. Go to **"Settings"** tab
3. Scroll down to **"Networking"** section
4. Click **"Generate Domain"** button
5. Railway will generate a URL like: `pneumai-production-abc123.up.railway.app`
6. **COPY THIS URL** - you'll need it!

### Step 4.2: Update FRONTEND_URL Variable

1. Go back to **"Variables"** tab
2. Find the `FRONTEND_URL` variable
3. Click on it to edit
4. Replace the value with your actual Railway URL (include `https://`):
   ```
   https://pneumai-production-abc123.up.railway.app
   ```
5. Click **"Update"**

### Step 4.3: Wait for Redeploy

Railway will automatically redeploy (1-2 minutes). Wait for it to complete.

---

## Part 5: Test Initial Deployment (2 minutes)

### Step 5.1: Check Health Endpoint

Open this URL in your browser (replace with YOUR Railway URL):
```
https://your-railway-url.up.railway.app/health
```

**You should see JSON like this:**

✅ **GOOD Response (Everything working):**
```json
{
  "status": "healthy",
  "database": true,
  "model_loaded": true,
  "upload_dir_writable": true,
  "timestamp": "2025-11-19T..."
}
```

⚠️ **DEGRADED Response (Database needs initialization):**
```json
{
  "status": "degraded",
  "database": false,
  "model_loaded": true,
  "upload_dir_writable": true,
  "timestamp": "2025-11-19T..."
}
```

If you see `"database": false`, continue to Part 6 to initialize the database.

❌ **BAD Response (Model or app issue):**
```json
{
  "status": "degraded",
  "database": true,
  "model_loaded": false,
  "upload_dir_writable": true
}
```

If `model_loaded: false`, check the deployment logs in Railway.

---

## Part 6: Initialize PostgreSQL Database (10 minutes)

You need to run SQL files to create tables and add sample data.

### Step 6.1: Install Railway CLI

**Mac/Linux:**
```bash
npm install -g @railway/cli
```

**Windows:**
```powershell
npm install -g @railway/cli
```

### Step 6.2: Login to Railway

```bash
railway login
```

This will open a browser window. Click **"Verify"** to authorize the CLI.

### Step 6.3: Link to Your Project

```bash
cd /Users/monskiemonmon427/PneumAI-Production
railway link
```

You'll see a list of your Railway projects. Select **`PneumAI-Production`**.

### Step 6.4: Run Database Schema

This creates all 11 tables:

```bash
railway run psql $DATABASE_URL -f database/init/01_schema.sql
```

**Expected output:**
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
... (11 times)
```

### Step 6.5: Run Seed Data

This adds sample users, doctors, and patients:

```bash
railway run psql $DATABASE_URL -f database/init/02_seed_data.sql
```

**Expected output:**
```
INSERT 0 3
INSERT 0 5
INSERT 0 10
...
```

### Step 6.6: Verify Database Tables

```bash
railway run psql $DATABASE_URL -c "\dt"
```

**You should see 11 tables:**
```
                List of relations
 Schema |       Name        | Type  |     Owner
--------+-------------------+-------+----------------
 public | appointments      | table | postgres
 public | audit_log         | table | postgres
 public | ct_scans          | table | postgres
 public | doctors           | table | postgres
 public | messages          | table | postgres
 public | notifications     | table | postgres
 public | patients          | table | postgres
 public | scan_comments     | table | postgres
 public | sessions          | table | postgres
 public | system_settings   | table | postgres
 public | users             | table | postgres
(11 rows)
```

---

## Part 7: Final Verification (5 minutes)

### Step 7.1: Check Health Endpoint Again

Open in browser:
```
https://your-railway-url.up.railway.app/health
```

**Should now show:**
```json
{
  "status": "healthy",
  "database": true,
  "model_loaded": true,
  "upload_dir_writable": true
}
```

### Step 7.2: Check API Documentation

Open in browser:
```
https://your-railway-url.up.railway.app/docs
```

You should see FastAPI's interactive documentation (Swagger UI) with all your API endpoints.

### Step 7.3: Check Frontend

Open in browser:
```
https://your-railway-url.up.railway.app/
```

**Expected:** React app loads (you should see the PneumAI interface)

**If you see JSON instead:** Frontend build might have failed. Check deployment logs.

### Step 7.4: Test Login

Try logging in with sample credentials:

**Admin User:**
- Email: `admin@pneumai.com`
- Password: `admin123`

**Doctor User:**
- Email: `dr.smith@pneumai.com`
- Password: `doctor123`

---

## Part 8: Troubleshooting (If Things Don't Work)

### Issue: "database": false in health check

**Solution:**
1. Make sure you ran both SQL files (Step 6.4 and 6.5)
2. Verify DATABASE_URL is set in backend variables
3. Check PostgreSQL service is running in Railway

**Verify with:**
```bash
railway run psql $DATABASE_URL -c "SELECT count(*) FROM users;"
```

Should return a number greater than 0.

### Issue: "model_loaded": false in health check

**Solution:**
1. Check Railway deployment logs for ONNX errors
2. Verify `MODEL_PATH=best.onnx` in variables
3. Make sure `best.onnx` file is in GitHub repo

**Check repo:**
```bash
git ls-files | grep best.onnx
```

Should output: `best.onnx`

### Issue: Frontend shows JSON instead of React app

**Solution:**
1. Check if `npm run build` succeeded in deployment logs
2. Look for errors in the Railway logs
3. Verify these files exist in repo:
   - `package.json`
   - `src/App.js`
   - `public/index.html`

### Issue: CORS errors in browser console

**Solution:**
Update `FRONTEND_URL` variable to match your exact Railway URL (with https://)

### Issue: Build exceeds 4GB limit

**Solution:**
1. Verify using `requirements-onnx.txt` (NOT `requirements.txt`)
2. Check Dockerfile has: `COPY requirements-onnx.txt .`
3. Make sure `best.onnx` is used (NOT `best.pt`)

---

## Part 9: Important Credentials and URLs

### Sample Login Credentials (from seed data)

**Admin:**
- Email: `admin@pneumai.com`
- Password: `admin123`
- Role: Admin

**Doctor 1:**
- Email: `dr.smith@pneumai.com`
- Password: `doctor123`
- Specialty: Pulmonology

**Doctor 2:**
- Email: `dr.johnson@pneumai.com`
- Password: `doctor123`
- Specialty: Radiology

**Patient 1:**
- Email: `john.doe@email.com`
- Password: `patient123`

### Your Deployment URLs

**Frontend:**
```
https://your-railway-url.up.railway.app
```

**API Root:**
```
https://your-railway-url.up.railway.app/api/v1
```

**API Docs (Swagger):**
```
https://your-railway-url.up.railway.app/docs
```

**Health Check:**
```
https://your-railway-url.up.railway.app/health
```

**Status (Detailed):**
```
https://your-railway-url.up.railway.app/status
```

---

## Part 10: Next Steps After Deployment

### Optional Enhancements

1. **Custom Domain:**
   - Go to Railway Settings → Networking
   - Click "Add Custom Domain"
   - Follow instructions to point your domain to Railway

2. **Environment Monitoring:**
   - Watch Railway dashboard for memory/CPU usage
   - Set up alerts in Railway settings

3. **Database Backup:**
   - Railway Pro plan includes automated backups
   - Or manually backup with: `railway run pg_dump $DATABASE_URL > backup.sql`

4. **Update Sample Data:**
   - Use pgAdmin to connect to Railway Postgres
   - Or use Railway CLI: `railway run psql $DATABASE_URL`

---

## Summary Checklist

Use this checklist to track your progress:

- [ ] Created Railway project from GitHub repo
- [ ] Added PostgreSQL database service
- [ ] Added all 6 environment variables to backend
- [ ] Generated and set SECRET_KEY
- [ ] Generated Railway domain URL
- [ ] Updated FRONTEND_URL with actual Railway URL
- [ ] Installed Railway CLI
- [ ] Logged in to Railway CLI
- [ ] Linked CLI to project
- [ ] Ran schema SQL file (01_schema.sql)
- [ ] Ran seed data SQL file (02_seed_data.sql)
- [ ] Verified 11 tables exist in database
- [ ] Checked /health endpoint (status: "healthy")
- [ ] Verified /docs endpoint loads
- [ ] Tested frontend loads in browser
- [ ] Tested login with sample credentials

---

## Need Help?

If you get stuck:

1. **Check Railway Logs:**
   - Go to Railway dashboard → Your service → Deployments
   - Click on latest deployment → View logs

2. **Check Database:**
   ```bash
   railway run psql $DATABASE_URL
   ```

3. **Restart Service:**
   - Railway dashboard → Settings → Restart

4. **Review Documentation:**
   - See `AI_AGENT_DEPLOYMENT_GUIDE.md` for detailed troubleshooting
   - See `RAILWAY_DEPLOYMENT_CHECKLIST.md` for step-by-step guide

---

**Good luck! 🚀**

Your PneumAI system should be fully operational after completing these steps.
