# Rentillect 🏢🇵🇰

> Modern Rental Property Management Platform tailored for the Pakistani real estate market.

Rentillect bridges the trust deficit between Pakistani landlords and tenants with digital lease management, automated rent tracking in PKR, identity verification (CNIC), and an AI-powered Lease Assistant aware of provincial rental tenancy acts (Punjab, Sindh, ICT, KPK, Balochistan).

---

## 🏗 Project Structure (Monorepo)

```
Rentillect/
├── backend/                  # FastAPI (Python 3.12)
│   ├── app/
│   │   ├── main.py           # Application entrypoint & CORS
│   │   ├── config.py         # Settings & environment variables
│   │   ├── dependencies.py   # Auth & Supabase client providers
│   │   └── routers/          # API route definitions (/api/v1/...)
│   │       └── health.py     # System health check
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment template
│
├── frontend/                 # Next.js 15 (App Router, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── app/              # App router pages & layouts
│   │   ├── components/       # UI & shared components
│   │   └── lib/              # API and Supabase client helpers
│   └── package.json
│
├── database/
│   ├── migrations/           # Supabase PostgreSQL DDL
│   │   └── 001_initial_schema.sql
│   └── seeds/                # Seed data (Pakistani cities, areas, laws)
│       └── 001_pakistan_cities_areas.sql
│
├── implementation_plan.md    # Multi-phase engineering roadmap
└── system_design_and_schema.md # Complete architectural specification
```

---

## 🚀 Quick Start

### 1. Database Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Enable the `vector` extension in the Supabase Dashboard (`Database -> Extensions -> vector`).
3. Run `database/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
4. Run `database/seeds/001_pakistan_cities_areas.sql` to populate major Pakistani cities and sectors.

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env # Configure your credentials
uvicorn app.main:app --reload --port 8000
```
- API Root: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/v1/health`

### 3. Frontend (Next.js 15)
```bash
cd frontend
npm install
cp .env.example .env.local # Configure your credentials
npm run dev
```
- Web Application: `http://localhost:3000`
