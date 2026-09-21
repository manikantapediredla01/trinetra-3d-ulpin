# TRINETRA — 3D ULPIN & Property Intelligence Platform
## Complete Architecture, Technology Stack & System Design Document

> **Department of Land Resources (DoLR) | Ministry of Rural Development | SIH26011**  
> *Next-Generation 3D Cadastre, Volumetric Land Records, Quantum-Assisted Optimization & Digital Twin System*

---

## 1. Executive Summary & Objective

**TRINETRA** is an enterprise-grade 3D Land Information & Digital Twin platform designed to transform conventional 2D cadastral records into mathematically verified, vertically stratified **3D Unique Land Parcel Identification Numbers (3D ULPIN)**. 

The platform integrates:
- **LiDAR, Drone Imagery & Cadastral GIS Data Ingestion**
- **AI-Powered Footprint & Floor Extrusion Segmentation**
- **Quantum Approximate Optimization Algorithm (QAOA) / QUBO Matrix Formulation** for candidate resolution
- **8-Check Statutory Rule Engine** (encroachment, setback, Floor Area Ratio, elevation)
- **CesiumJS 3D WebGL Digital Twin** with multi-layer underground and utility visualization
- **Cryptographically Sealed Property Passport** with dynamic public QR code verification

---

## 2. Overall System Architecture

TRINETRA employs a **decoupled, 5-tier microservice architecture** engineered for high throughput, sub-second GIS queries, and deterministic statutory validation.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                               TIER 1: PRESENTATION (Frontend SPA)                            │
│  React 19 · TypeScript · Vite 8.2 · CesiumJS 1.145 · Tailwind CSS v4 · Zustand · Recharts    │
│                                                                                              │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────────────────────┐  │
│   │  3D Cesium Explorer  │  │  Digital Twin Workbench│ │  6 Role Dashboards (RBAC)         │  │
│   │  (Terrain + 3D Mesh) │  │  (LoD-2 Sliced Floors)│ │  Admin, Authority, Officer, etc.  │  │
│   └──────────────────────┘  └──────────────────────┘  └───────────────────────────────────┘  │
└──────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                               │ HTTPS / JSON (Fast-Path Demo Auth ~2.0ms)
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                               TIER 2: APPLICATION API (Backend)                              │
│  FastAPI (ASGI / Uvicorn) · Python 3.11/3.14 · Pydantic v2 · SlowAPI Rate Limiter            │
│                                                                                              │
│   ┌─────────────────────┐   ┌─────────────────────┐   ┌───────────────────────────────────┐  │
│   │  Authentication &   │   │  Spatial Pipelines  │   │  Statutory Verification Engine    │  │
│   │  Fast-Path RBAC     │   │  & Preprocessing    │   │  (8 Automated Legal Checks)       │  │
│   └─────────────────────┘   └─────────────────────┘   └───────────────────────────────────┘  │
└──────────────────────┬───────────────────────┬──────────────────────────────┬────────────────┘
                       │                       │                              │
                       ▼                       ▼                              ▼
┌──────────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────────┐
│   TIER 3: GEOSPATIAL & AI    │ │  TIER 4: QUANTUM ENGINE   │ │  TIER 5: DATA PERSISTENCE     │
│ - GDAL / OGR / GEOS          │ │ - IBM Qiskit Aer          │ │ - PostgreSQL 16 + PostGIS 3.4 │
│ - Copernicus GLO-30 DEM      │ │ - QUBO Matrix Formulator  │ │ - Redis 7 (Cache & Limits)    │
│ - Point Cloud LAS/LAZ Engine │ │ - QAOA Parameterized p=1  │ │ - In-Memory Demo Registry     │
│ - AI Floor Extractor         │ │ - Classical Fallback Opt  │ │ - Document Storage (/data)    │
└──────────────────────────────┘ └───────────────────────────┘ └───────────────────────────────┘
```

---

## 3. Detailed Technology Stack

### 3.1 Frontend Web Application
| Technology | Version | Purpose & Responsibilities |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Declarative UI components, stateful dashboards, reactive forms |
| **TypeScript** | `~6.0.2` | Compile-time type safety, spatial interface definitions |
| **Vite** | `^8.2.2` | Modern lightning-fast build tool, local dev server with HMR |
| **CesiumJS** | `^1.145.0` | 3D WebGL Virtual Globe, Copernicus terrain streaming, 3D building models |
| **Tailwind CSS** | `^4.3.3` | Utility-first design tokens matching DoLR / NIC national government guidelines |
| **Zustand** | `^5.0.15` | Lightweight persistent global state management (Auth tokens, active roles) |
| **Lucide React** | `^1.41.0` | Crisp SVG icon library for GIS, tools, and UI indicators |
| **Recharts** | `^3.10.1` | Interactive data charts for confidence scores, QAOA convergence, and analytics |
| **qrcode** | `^1.5.4` | Client-side QR generation linking to verified Property Passports |

### 3.2 Backend API & Computation Engine
| Technology | Version | Purpose & Responsibilities |
| :--- | :--- | :--- |
| **Python** | `3.11 / 3.14` | High-performance core execution environment |
| **FastAPI** | `^0.115.0` | High-speed asynchronous REST API framework |
| **Uvicorn** | `^0.32.0` | ASGI production server supporting HTTP/1.1 and WebSockets |
| **Pydantic** | `v2` | Strict data validation, schema serialization, settings management |
| **SQLAlchemy** | `^2.0.36` | Modern asynchronous ORM with asyncpg connection pooling |
| **GeoAlchemy2** | `^0.16.0` | PostGIS spatial extensions, geometry/geography column bindings |
| **Alembic** | `^1.14.0` | Database schema migrations and versioning |
| **SlowAPI** | `^0.1.9` | IP-based endpoint rate limiting and DDoS protection |
| **Passlib & BCrypt** | `^1.7.4` | Cryptographic password hashing and validation |
| **Python-Jose** | `^3.3.0` | Cryptographic JWT token generation and validation |

### 3.3 Quantum & Mathematical Optimization Engine
| Technology | Version | Purpose & Responsibilities |
| :--- | :--- | :--- |
| **IBM Qiskit** | `^1.2.0` | Quantum circuit construction, Hamiltonian operator definitions |
| **Qiskit Aer** | `^0.15.0` | High-performance noisy and ideal quantum simulator backend (`aer_simulator`) |
| **QUBO Builder** | Native | Formulates land configuration candidates as quadratic penalty matrices |
| **QAOA Solver** | Native | Parameterized Ansatz optimization ($p=1$, 1024 shots) with classical fallback |

### 3.4 Database, Cache & Storage
| Technology | Version | Purpose & Responsibilities |
| :--- | :--- | :--- |
| **PostgreSQL** | `16` | Enterprise relational database |
| **PostGIS** | `3.4` | Spatial indexing (R-Tree / GiST), 3D volumetric operations (`ST_3DIntersects`) |
| **Redis** | `7-Alpine` | In-memory key-value cache, session store, rate-limit counters |

---

## 4. Key Endpoints & Featured APIs

The backend exposes a modular REST API grouped under `/api/v1/`:

```
/api/v1
 ├── /auth           # Authentication, Token Refresh & Profile
 ├── /datasets       # Ingestion of LiDAR, GeoJSON, CAD & PDF
 ├── /preprocessing  # Coordinate transforms, DEM normalization, filtering
 ├── /extraction     # AI Building Footprint & Floor Height Extraction
 ├── /candidates     # Volumetric configuration generator
 ├── /qubo           # Quadratic Unconstrained Binary Optimization formulation
 ├── /qaoa           # Quantum Approximate Optimization Algorithm solver
 ├── /validation     # 8-Check Statutory Legal Rule Engine
 ├── /ulpin          # Official 14-character 3D ULPIN Derivation
 ├── /passport       # Property Passport records & PDF generation
 ├── /gis            # Spatial layers & Digital Twin geometry queries
 ├── /utilities      # Underground water, sewer, and power networks
 ├── /encroachment   # Boundary deviation review & analytics
 └── /demo           # In-memory demo data reset and verification
```

### Important API Details

#### 1. Fast-Path Authentication (`/api/v1/auth/login`)
- Authenticates in **~2.0ms** using an in-memory resilient fallback matrix.
- Automatically returns JWT bearer tokens, role identifiers, and pre-calculated dashboard route redirects (`/admin/dashboard`, `/officer/dashboard`, etc.).

#### 2. Quantum Optimization APIs (`/api/v1/qubo` & `/api/v1/qaoa`)
- `POST /api/v1/qubo/formulate`: Converts multi-floor boundary constraints into an $N \times N$ QUBO matrix:
  $$\min \quad x^T Q x + c^T x$$
  penalizing boundary errors, height mismatches, and setback infringements.
- `POST /api/v1/qaoa/solve`: Executes parameterized QAOA circuit on `aer_simulator`:
  $$|\gamma, \beta\rangle = e^{-i\beta_p B} e^{-i\gamma_p C} \cdots e^{-i\beta_1 B} e^{-i\gamma_1 C} |+\rangle^{\otimes n}$$
  selecting the ground-state volumetric configuration.

#### 3. Statutory Verification Engine (`/api/v1/validation/verify`)
Executes **8 mandatory statutory compliance checks**:
1. **Cadastral Containment**: Property boundary falls 100% within revenue parcel.
2. **Terrain Elevation Consistency**: Matches Copernicus GLO-30 30m DEM ground baseline.
3. **Floor Count Compliance**: Building levels match municipal sanctioned plan.
4. **Floor Area Ratio (FAR)**: Total built-up area conforms to zonal regulations.
5. **Utility Setback**: Clearance from underground water mains (≥ 1.5m) and electric feeders.
6. **Encroachment Tolerance**: Boundary deviation strictly $\le 0.05\text{m}$.
7. **Inter-Floor Height Uniformity**: Variance across floors does not exceed $\pm 5\%$.
8. **Geometric Closure**: 3D mesh is fully watertight and manifold.

#### 4. 3D ULPIN Generator (`/api/v1/ulpin/generate`)
- Generates a permanent, immutable 14-character spatial identifier:
  $$\text{IN-3D-}[\text{District Code}]-[\text{Year}]-[\text{Serial}]$$
  *Example*: `IN-3D-HYD0-2024-0001`

---

## 5. Configuration Keys & Environment Variables

All critical credentials and runtime options are centralized in [`.env`](file:///c:/Users/pediredla%20manikanta/OneDrive/Documents/Pictures/Documents/trinetra/trinetra-final/trinetra/.env):

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `CESIUM_ION_TOKEN`<br>`VITE_CESIUM_ION_TOKEN` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` | **Cesium Ion Access Token** used for streaming global satellite imagery and Cesium World Terrain. |
| `DATABASE_URL` | `postgresql+asyncpg://trinetra:...@localhost:5432/trinetra` | Async database URI for SQLAlchemy + asyncpg. |
| `REDIS_URL` | `redis://localhost:6379/0` | Connection string for Redis cache & task queue. |
| `QAOA_BACKEND` | `aer_simulator` | Qiskit simulator backend name. |
| `QAOA_MAX_SHOTS` | `1024` | Shot count for quantum probability distribution estimation. |
| `ALLOWED_ORIGINS` | `["http://localhost:5173", ...]` | CORS origin whitelist for web client security. |
| `JWT_ALGORITHM` | `HS256` | Algorithm for signing JWT auth tokens. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Lifetime for short-lived access tokens. |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Lifetime for long-lived refresh tokens. |

---

## 6. Pre-Configured Demo Personas

TRINETRA includes 6 built-in role-based demo accounts for instant evaluation:

| Persona | Username | Password | Role | Redirect Route |
| :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | `admin.trinetra` | `Trinetra@Admin2024` | `system_administrator` | `/admin/dashboard` |
| **Land Record Authority** | `land.authority` | `Trinetra@LandAuth2024` | `land_record_authority` | `/authority/dashboard` |
| **Survey / GIS Officer** | `gis.officer` | `Trinetra@GIS2024` | `survey_gis_officer` | `/officer/dashboard` |
| **Urban Infrastructure Planner** | `urban.planner` | `Trinetra@Urban2024` | `urban_infrastructure_planner` | `/planner/dashboard` |
| **Authorized Reviewer** | `review.officer` | `Trinetra@Review2024` | `authorized_reviewer` | `/reviewer/dashboard` |
| **Authorized Citizen** | `citizen.demo` | `Trinetra@Citizen2024` | `authorized_citizen` | `/citizen/dashboard` |

*(All accounts also accept flexible shorthand testing passwords like `demo` or `trinetra`).*

---

## 7. Deployment & Hosting Options

### 7.1 Static Frontend (Vercel / Netlify / Cloudflare Pages)
- **Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Configuration**: [`frontend/vercel.json`](file:///c:/Users/pediredla%20manikanta/OneDrive/Documents/Pictures/Documents/trinetra/trinetra-final/trinetra/frontend/vercel.json) (enables SPA fallback rewrites and 30-day Cesium 3D asset caching).

### 7.2 Containerized Full Stack (Docker Compose)
Use the included Docker files to launch the entire stack on any Linux VPS (AWS EC2, DigitalOcean, Hetzner, GCP):
```bash
docker compose up -d --build
```
This deploys:
1. `trinetra-db`: PostgreSQL 16 + PostGIS 3.4
2. `trinetra-redis`: Redis 7
3. `trinetra-backend`: FastAPI with GDAL libraries
4. `trinetra-frontend`: Nginx serving the built React + Cesium application

---

## 8. Complete End-to-End Platform Workflows

The TRINETRA platform is structured around **5 primary role-based user journeys** connected into a single, unified 15-stage workflow:

```
[1. Multi-Modal Ingestion]
        │ (LiDAR Point Cloud, TGRAC Cadastral GeoJSON, Copernicus DEM, Sanctioned Plans)
        ▼
[2. AI Geometry Extraction]
        │ (Ground Filtering, Footprint Segmentation, Z-Elevation Histogram Floor Slicing)
        ▼
[3. Quantum Optimization (QUBO / QAOA)]
        │ (Formulate Penalty Matrix, Run QAOA on Qiskit Aer, Select Optimal 3D Envelope)
        ▼
[4. 8-Point Statutory Validation]
        │ (Parcel Containment, Elevation Match, FAR Check, Utility Clearance, Encroachment <=0.05m)
        ▼
[5. 3D ULPIN Issuance & Cryptographic Digital Seal]
        │ (Generate IN-3D-HYD0-2024-0001, Apply Digital Authority Signature)
        ▼
[6. Public Property Passport & 3D Digital Twin]
        │ (Printable Official Card, Live CesiumJS WebGL Twin, Mobile QR Code Verification)
```

---

### Workflow 1: Survey / GIS Officer — 15-Stage Pipeline Journey
*Role: `gis.officer` (`Trinetra@GIS2024`) -> Route: `/officer/dashboard`*

1. **Upload & Ingestion (`/officer/ingestion`)**:
   - The officer selects or uploads multi-modal survey assets:
     - LiDAR Point Clouds (`.las`, `.laz`, `.pcd`)
     - Cadastral GeoJSON Boundaries (`tgrac_cadastral.geojson`)
     - Ground Elevation Model (`cop30_dem.tif`)
     - Building Sanction Documents (`sanction_plan.pdf`)
   - Files are validated against max size limits (500MB) and indexed.

2. **Preprocessing & Filtering (`/officer/preprocessing`)**:
   - Runs outlier removal, statistical ground filtering (CSF / SMRF), and projects all layers into uniform UTM coordinates (`EPSG:32644`).
   - Normalizes ground datum against the Copernicus GLO-30 Digital Elevation Model.

3. **AI Feature Extraction (`/officer/extraction`)**:
   - Automated 2D building footprint extraction from boundary vectors.
   - Slices point cloud Z-elevations to automatically detect individual floor plates, ceiling heights, and underground basement depth (e.g. 7 floors: B1 + GF + 5 Levels).

4. **Candidate Generation (`/officer/candidates`)**:
   - Generates multiple 3D volumetric bounding box candidates accounting for sensor noise and building offsets.

5. **Quantum Optimization Workbench (`/officer/qubo` & `/officer/qaoa`)**:
   - **QUBO Formulation**: Assembles penalty coefficients for parcel overlap, boundary distortion, and floor height deviations into a Hamiltonian matrix.
   - **QAOA Solver**: Executes parameterized quantum simulation ($p=1$, 1024 shots) on the Qiskit Aer backend to pick the candidate with minimum energy (maximum statutory compliance).

6. **Statutory Validation (`/officer/validation`)**:
   - Executes the automated **8-check compliance rule engine**.
   - Inspects green/red badges: Parcel containment, DEM ground clearance, FAR compliance, and checks if west encroachment exceeds the legal tolerance threshold ($\le 0.05\text{m}$).

7. **3D ULPIN & Passport Generation (`/officer/ulpin` & `/officer/passport`)**:
   - Upon 8/8 check validation, the system derives the 14-character code `IN-3D-HYD0-2024-0001`.
   - Generates the official digital **Property Passport** with an embeddable QR code and cryptographic HMAC hash.

---

### Workflow 2: Land Record Authority — Inspection & Sealing Journey
*Role: `land.authority` (`Trinetra@LandAuth2024`) -> Route: `/authority/dashboard`*

1. **Pending Approvals Queue**:
   - The authority views high-priority properties awaiting state certification.
2. **Side-by-Side Evidence Audit**:
   - Cross-examines AI extraction confidence scores (e.g. 94% confidence) against official municipal deed records.
3. **Digital Signature & Seal (`Digital Sign & Seal`)**:
   - With one click, applies the Department of Land Resources (DoLR) digital cryptographic seal, upgrading the ULPIN draft into an **Official State Record**.
4. **Export Legal Record**:
   - Downloads certified PDF passports, GeoJSON boundary bundles, or pushes certified records to the state land ledger.

---

### Workflow 3: Review Officer — Encroachment & Dispute Resolution
*Role: `review.officer` (`Trinetra@Review2024`) -> Route: `/reviewer/dashboard`*

1. **Discrepancy & Encroachment Queue**:
   - Reviews properties flagged with boundary infringements (e.g. Srinivas Commercial Complex, where the west wall extends +2.3m past the legal revenue line).
2. **Volumetric Slicing**:
   - Inspects exactly which floor levels are violating airspace or property lines.
3. **Formal Resolution Verdict**:
   - Issues a legal finding: *Demolition Notice*, *Regularization Penalty*, or *Survey Correction*.

---

### Workflow 4: Urban Planner & GIS Analyst — 3D Twin Exploration
*Role: `urban.planner` (`Trinetra@Urban2024`) -> Route: `/gis/explorer` & `/gis/twin`*

1. **Full 3D GIS Explorer (`/gis/explorer`)**:
   - Interacts with a high-performance **CesiumJS 3D WebGL Globe** centered on the property (Banjara Hills, Hyderabad).
   - Explores terrain elevation streamed from Copernicus DEM.
2. **Spatial Layer Control**:
   - Toggles on/off real and synthetic layers from the right-hand panel:
     - TGRAC HMDA Cadastral Parcel
     - GHMC Building Footprints
     - Demo Property 3D Volumetric Floors (distinct color per level)
     - Encroachment Zones (flashing red warning mesh)
     - Underground Utility Networks (potable water main, sewer collector, electricity feeder)
3. **Interactive Click Inspection**:
   - Clicks on any individual 3D floor or utility line to inspect floor area ($252\,\text{m}^2$), MSL elevation ($536.0\text{m}$), and statutory status in real time.
4. **LoD-2 Sliced Digital Twin (`/gis/twin`)**:
   - Features an exploded-view isometric workbench with interactive rotation, wireframe toggles, and individual floor unit breakdowns (Units 101 to 502).

---

### Workflow 5: Citizen & Public Verification
*Role: `citizen.demo` (`Trinetra@Citizen2024`) or Public QR Scan -> Route: `/citizen/dashboard` & `/passport/{id}`*

1. **Public Property Search**:
   - Any citizen or prospective buyer enters a ULPIN or property ID to verify legal status.
2. **Instant QR Verification**:
   - Citizens scan the physical Property Card QR code using any standard smartphone camera.
   - Instantly opens the public verification page (`/passport/PROP-HYD-2024-001`).
3. **Permitted Public Disclosure**:
   - Displays ownership verification, 3D floor volume, land use classification, and DoLR digital seal while protecting sensitive biometric or personal data.

