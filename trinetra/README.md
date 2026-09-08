# TRINETRA — 3D ULPIN & Vertical Property Intelligence Platform

> **SIH26011 | Smart India Hackathon 2026**  
> Ministry of Rural Development | Department of Land Resources (DoLR)

---

## 🏛️ About TRINETRA

TRINETRA is a production-style prototype for **3D ULPIN Generation and Vertical Property Mapping**. It transforms physical multi-storey properties into validated, queryable 3D digital assets through a complete AI/geospatial/quantum pipeline.

### Core Workflow

```
Physical Property
  → Multi-source 3D Evidence (LiDAR / Drone / GIS / DEM / Floor Plans)
  → Data Preprocessing & Fusion (11 stages)
  → AI/Geometric Building & Floor Extraction
  → Candidate 3D Property Volumes
  → QUBO Formulation (from measurable geometry metrics)
  → QAOA Simulation (Qiskit Aer)
  → Bitstring Decode → Geometry Reconstruction
  → 8-Point Validation Engine
  → Confidence Scoring
  → Verified Digital Property Twin
  → 3D ULPIN Generation (only after validation)
  → QR Property Passport
  → Change Detection (T1 vs T2)
  → 3D GIS Explorer
  → Underground Utility Mapping
  → Controlled NL GIS Assistant
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker** + **Docker Compose** (recommended)
- OR:
  - Python 3.10+
  - Node.js 18+ / npm
  - PostgreSQL 16 + PostGIS 3.4

### Option A: Docker Compose (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/your-org/trinetra.git
cd trinetra

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env — set POSTGRES_PASSWORD and SECRET_KEY
# (demo passwords are pre-configured for development)

# 4. Start all services
docker compose up -d

# 5. Access
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

### Option B: Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env with your PostgreSQL credentials

# Create tables and seed demo accounts
python -m app.scripts.seed

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# App available at http://localhost:5173
```

---

## 🔐 Demo Accounts

> ⚠️ **DEMONSTRATION ENVIRONMENT ONLY** — These accounts exist for the hackathon demo.  
> Change all passwords before any production deployment.

| Username | Role | Default Password |
|---|---|---|
| `admin.trinetra` | System Administrator | `Trinetra@Admin2024` |
| `land.authority` | Land Record Authority | `Trinetra@LandAuth2024` |
| `gis.officer` | Survey/GIS Officer | `Trinetra@GIS2024` |
| `urban.planner` | Urban/Infrastructure Planner | `Trinetra@Urban2024` |
| `review.officer` | Authorized Reviewer | `Trinetra@Review2024` |
| `citizen.demo` | Authorized Citizen | `Trinetra@Citizen2024` |

Passwords are configured via environment variables (see `.env.example`) — never hard-coded in source.

---

## 🗂️ Project Structure

```
trinetra/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/          # Landing, Login, PropertyPassport
│   │   │   ├── officer/         # Ingestion, Pipeline, QUBO, QAOA, Validation, ULPIN
│   │   │   ├── gis/             # 3D GIS Explorer, Digital Twin, UtilityLayers, ChangeDetection
│   │   │   ├── review/          # EncroachmentReview, DiscrepancyReview, ValidationReview
│   │   │   ├── admin/           # AdminDashboard, UserManagement, AuditLogs, SystemHealth
│   │   │   ├── analytics/       # ConfidenceAnalytics, QAOABenchmark, ChangeAnalytics
│   │   │   ├── citizen/         # CitizenDashboard
│   │   │   ├── authority/       # AuthorityDashboard
│   │   │   ├── demo/            # DemoMode (15-step guided walkthrough)
│   │   │   └── assistant/       # GIS Assistant (controlled NL queries)
│   │   ├── layouts/             # OfficerLayout, AdminLayout, GISLayout, CitizenLayout
│   │   ├── services/api.ts      # Axios API client with JWT auto-refresh
│   │   └── store/authStore.ts   # Zustand auth state
│   └── tailwind.config.js       # TRINETRA design system tokens
│
├── backend/                     # Python FastAPI
│   ├── app/
│   │   ├── api/v1/              # REST API routers (22 endpoints)
│   │   ├── auth/rbac.py         # Role-Based Access Control
│   │   ├── core/                # Config, DB, Security, Dependencies, Audit
│   │   ├── demo/generator.py    # Synthetic demo data generator
│   │   ├── models/__init__.py   # SQLAlchemy ORM models (18 tables)
│   │   ├── quantum/
│   │   │   ├── qaoa.py          # Real Qiskit QAOA + classical fallback
│   │   │   ├── qubo.py          # QUBO formulation from geometry metrics
│   │   │   └── geometry_reconstruction.py
│   │   ├── validation/validator.py  # 8-check geometric validation
│   │   └── scripts/seed.py      # Database seeder
│   └── requirements.txt
│
├── data/
│   ├── demo/                    # Static demo data files
│   ├── generated/               # AI-generated outputs
│   └── uploads/                 # User uploaded datasets
│
├── quantum/                     # Standalone quantum modules
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── init-postgis.sql
├── docker-compose.yml
├── .env.example                 # Template — copy to .env
└── README.md
```

---

## 🧪 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 |
| **3D GIS** | CesiumJS (via Resium), Three.js |
| **State** | Zustand, TanStack Query |
| **Backend** | Python, FastAPI, Pydantic, SQLAlchemy |
| **Database** | PostgreSQL 16 + PostGIS 3.4 |
| **Geospatial** | GeoPandas, Shapely, PyProj, Rasterio, laspy |
| **AI/ML** | scikit-learn, NumPy, SciPy |
| **Quantum** | Qiskit 1.x, Qiskit Aer (simulator) |
| **Auth** | JWT (python-jose), bcrypt (passlib) |
| **Infra** | Docker, Docker Compose, Redis |

---

## 🔒 Security Model

- **JWT access + refresh tokens** (15 min / 7 days)
- **Bcrypt password hashing** (no plaintext)
- **Role-Based Access Control** — 6 roles, granular permissions
- **Audit logging** — every critical operation recorded
- **Rate limiting** — 60 req/min (10 req/min for auth)
- **CORS** — restricted origin list
- **Security headers** — X-Frame-Options, X-XSS-Protection, etc.
- **Input validation** — Pydantic schemas on all endpoints
- **File validation** — type whitelist, size limits, path traversal protection

### Role Permissions Summary

| Capability | Admin | LRA | GIS Officer | Planner | Reviewer | Citizen |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Upload Datasets | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Run QAOA | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Generate ULPIN | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve/Reject | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| View 3D GIS | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Property Passport | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📊 Data Model

Key database tables (PostgreSQL + PostGIS):

| Table | Purpose |
|---|---|
| `users` | Authentication + RBAC |
| `properties` | Core property records with 3D geometry |
| `floor_units` | Individual floor/unit geometries |
| `parcels` | Cadastral parcel boundaries |
| `datasets` | Uploaded datasets with provenance |
| `candidate_configurations` | QUBO candidate geometries |
| `qubo_runs` | QUBO problem matrices |
| `qaoa_runs` | QAOA simulation results |
| `validations` | 8-check validation results |
| `encroachment_cases` | Potential encroachment flags |
| `discrepancies` | Record vs reality discrepancies |
| `change_events` | T1 vs T2 temporal changes |
| `utility_assets` | Underground utility 3D geometries |
| `audit_logs` | Immutable system audit trail |

---

## 🔬 QAOA Implementation

The quantum module uses **Qiskit 1.x + Qiskit Aer** for a real QAOA simulation:

- **Not a quantum computer** — runs on classical Aer simulator
- **No quantum speedup claimed** — benchmarked against classical baseline
- **Honest fallback** — if Qiskit unavailable, classical brute-force used and labeled
- **Proper workflow**: Candidates → QUBO → Ising Hamiltonian → QAOA Circuit → Bitstring → Geometry → Validation → ULPIN
- **A QAOA bitstring is NEVER a ULPIN** — it is a candidate selection vector

---

## 🗺️ Demo Property

The reference demo property used throughout the platform:

- **Name**: Srinivas Commercial Complex
- **Location**: Banjara Hills, Hyderabad (17.4235°N, 78.4483°E)
- **Parcel**: HYD/BH/123/4
- **Floors**: Basement + Ground + 5 Upper Floors (7 levels)
- **Units**: 12 commercial units
- **Survey T1**: 2022-03-15 (baseline)
- **Survey T2**: 2026-06-01 (current)
- **Notable**: Unauthorized 6th floor addition + 2.3m west boundary encroachment

**Data provenance:**
- 5% Real: TGRAC/HMDA cadastral, Copernicus GLO-30 DEM, IITH LiDAR ground clip
- 95% Synthetic: AI-generated multi-storey building geometry

---

## ⚠️ Data Disclaimers

- **SYNTHETIC DEMO DATA** — All generated data is clearly labeled
- **NOT official government data** — Platform is a research prototype
- **Prototype ULPIN** — Not an officially issued government identifier
- **Potential Encroachment** — AI detection flags only, not legal confirmation
- **Evidence Confidence** — Decision-support indicator, not legal certification
- **QAOA Simulator** — Classical simulation, not a quantum computer

---

## 📋 API Documentation

When running in DEBUG mode, interactive API docs are available at:
- **Swagger UI**: `http://localhost:8000/api/docs`
- **ReDoc**: `http://localhost:8000/api/redoc`

---

## 🏗️ Environment Variables

See [`.env.example`](.env.example) for all required variables.

**Critical variables to set:**
```bash
SECRET_KEY=your-secure-random-key-here
POSTGRES_PASSWORD=your-db-password
DATABASE_URL=postgresql+asyncpg://trinetra:password@localhost:5432/trinetra
```

**Never commit real passwords to version control.**

---

## 📚 References

- [National Generic Document Registration System (NGDRS)](https://ngdrs.gov.in)
- [ULPIN — Unique Land Parcel Identification Number](https://dolr.gov.in)
- [Department of Land Resources](https://dolr.gov.in)
- [QISKIT Documentation](https://qiskit.org/documentation/)
- [PostGIS Reference](https://postgis.net/documentation/)
- [CesiumJS](https://cesium.com/platform/cesiumjs/)

---

## 🤝 Team

Built for **Smart India Hackathon 2026** — Problem Statement SIH26011.

---

*This is a demonstration prototype. It does not constitute an official government system or issue legally binding property identifiers.*
