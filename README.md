# AI Support Automation

A full-stack, AI-powered customer support ticketing system built with React, Vite, FastAPI, PostgreSQL (via Supabase), and the Gemini API.

## Architecture

```
Frontend (React + Vite + Tailwind CSS)
  │
  │ HTTPS REST API
  ↓
Backend (FastAPI + Python + SQLAlchemy)
  │
  ├──────────────→ Gemini AI API (Support Analysis)
  │
  ↓
Supabase (PostgreSQL + Authentication + Row Level Security)
```

## Features
- **AI Triage**: Automatically categorizes tickets, gauges sentiment, and prioritizes based on the request using Gemini AI.
- **Enterprise Dashboard**: Beautiful, dark-mode analytics dashboard tracking KPI metrics like resolved tickets and AI confidence score.
- **Automation Rules**: Automatically flags critical tickets, angry customers, and assigns actions (e.g., immediate human review).
- **Secure Architecture**: JWT-based authentication via Supabase Auth seamlessly integrated with Row Level Security (RLS) policies in PostgreSQL.

---

## Local Development Setup

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to the SQL Editor in your Supabase dashboard.
3. Run the migrations located in `supabase/migrations/` sequentially:
   - `001_initial_schema.sql`
   - `002_indexes.sql`
   - `003_rls_policies.sql`
4. Optionally, run `supabase/seed.sql` to populate sample data.

### 2. Backend Setup
The backend requires Python 3.11+.

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
SUPABASE_DB_URL=postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=["http://localhost:5173", "https://your-frontend.vercel.app"]
DEBUG=True
```

Run the backend:
```bash
python run.py
```
*(The backend runs on http://localhost:8000 by default)*

### 3. Frontend Setup
The frontend requires Node.js.

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

Run the frontend:
```bash
npm run dev
```
*(The frontend runs on http://localhost:5173 by default)*

---

## Deployment Guide

### Deploying the Backend to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Set the Root Directory to `backend`.
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python run.py`
6. Add the Environment Variables:
   - `SUPABASE_DB_URL`
   - `SUPABASE_JWT_SECRET`
   - `GEMINI_API_KEY`
   - `CORS_ORIGINS` (Set this to your expected Vercel domain later, e.g., `["https://your-app.vercel.app"]`)
   - `DEBUG=False`

### Deploying the Frontend to Vercel
1. Create a new Project on [Vercel](https://vercel.com).
2. Connect your GitHub repository.
3. Framework Preset: **Vite**
4. Root Directory: `frontend`
5. Add the Environment Variables:
   - `VITE_API_URL`: Use your Render backend URL (e.g., `https://your-backend.onrender.com/api/v1`).
   - `VITE_SUPABASE_URL`: Your Supabase URL.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key.
6. Deploy!
