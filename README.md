# Credit Card Fraud Detection System

> An AI-assisted credit card fraud detection and investigation operations platform combining deterministic rule heuristics with supervised machine learning for real-time transaction scoring and fraud management.

---

## 1. Overview

The **Credit Card Fraud Detection System** is an end-to-end fraud management platform designed for risk operations teams. The system combines:

- **Rule-based detection**: Immediate heuristic validation of transaction anomalies.
- **Supervised Machine Learning**: Predictive inference using a trained XGBoost model (`xgb-ulb-v1`).
- **Hybrid risk scoring**: Weighted integration of rule and ML scores.
- **Real-time alerts**: Automated alert generation for high-risk transactions (risk score $\ge 60$).
- **Investigation workflow**: Dedicated analyst workspace with idempotency and duplicate prevention.
- **Analyst decisions**: Persistent record of analyst actions (`APPROVE`, `BLOCK`, `ESCALATE`) and audit trails.
- **Dashboard & Model monitoring**: Real-time operational KPIs, transaction velocity tracking, and ML model performance status.

---

## 2. Architecture

### Tech Stack
- **Frontend**: React 19 + Vite
- **Backend**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL / Supabase (with automatic SQLite fallback for local dev)
- **ML Engine**: XGBoost 2.0.3, Scikit-learn, Joblib, NumPy

### Architecture Flow

```
Frontend (React + Vite)
       │
       ▼ HTTP REST API
FastAPI Backend
       │
       ▼
  Fraud Engine
   ├── Rule Engine (Heuristics)
   └── XGBoost ML Model (xgb-ulb-v1)
       │
       ▼
Hybrid Risk Score (0 - 100)
       │
       ▼
  Decision Engine (APPROVE / REVIEW / BLOCK)
       │
       ▼
Transaction / Alert Generation
       │
       ▼
Investigation Workflow
       │
       ▼
Analyst Decision (Audit Persistence)
```

---

## 3. Hybrid Scoring

The application evaluates overall risk using a weighted hybrid combination:

$$\text{final\_score} = (\text{rule\_score} \times 0.6) + (\text{ml\_score} \times 0.4)$$

The calculated final risk score is clamped between `0` and `100`.

### Decision Thresholds
| Risk Score Range | Decision | Severity | Action |
|---|---|---|---|
| **0 – 29** | `APPROVE` | Low | Transaction auto-approved |
| **30 – 69** | `REVIEW` | Medium | Flagged for analyst investigation |
| **70 – 100** | `BLOCK` | Critical | Transaction blocked; alert generated |

---

## 4. ML Model

- **Model Type**: XGBoost Classifier (`XGBClassifier`)
- **Model Version**: `xgb-ulb-v1`
- **Features**: 30 input features
- **Feature Order**:
  `Time`, `V1`, `V2`, `V3`, `V4`, `V5`, `V6`, `V7`, `V8`, `V9`, `V10`, `V11`, `V12`, `V13`, `V14`, `V15`, `V16`, `V17`, `V18`, `V19`, `V20`, `V21`, `V22`, `V23`, `V24`, `V25`, `V26`, `V27`, `V28`, `Amount`

> **Note**: `V1`–`V28` are anonymized PCA-transformed features from the ULB benchmark dataset. They represent mathematical principal components rather than human-readable business fields.

---

## 5. Verified Model Metrics

Offline evaluation metrics for the `xgb-ulb-v1` model:

- **Precision**: `91.57%`
- **Recall**: `80.00%`
- **F1 Score**: `85.39%`
- **ROC-AUC**: `97.68%`
- **PR-AUC**: `82.03%`

---

## 6. Verified Hybrid Example

Demonstrating the exact runtime hybrid score computation for ULB dataset Row `541`:

- **ULB Dataset Row**: `541`
- **Rule Score**: `0`
- **ML Score**: `99.96` (Fraud probability: `0.9996`)
- **Raw Hybrid Score**:
  $$0 \times 0.6 + 99.96 \times 0.4 = 39.984$$
- **API Risk Score**: `39`
- **Decision**: `REVIEW`

> **Backend Behavior**: The backend applies integer conversion (`int(raw_final)`) to produce a discrete risk score integer (`39`). The float `39.984` is truncated to `39` by integer casting, not mathematically rounded up.

---

## 7. Features

- **Hybrid Fraud Scoring**: Dual-engine weighted calculation (Rule + XGBoost).
- **Transaction Management**: Ingestion, normalization, and persistence of transaction records.
- **Risk Scoring & Thresholding**: Dynamic decision classification (`APPROVE`, `REVIEW`, `BLOCK`).
- **Alert Generation**: Automatic alert generation for transactions with risk score $\ge 60$.
- **Investigation Workflow**: Tabbed analyst workspace (Customer, Merchant, Device history).
- **Analyst Decisions**: Formal disposition filing with note persistence and status updates.
- **Operations Dashboard**: System KPIs, volume trends, and risk distribution charts.
- **Model Monitoring**: Live status endpoint reporting artifact availability and model metadata.
- **Fraud Simulator**: Interactive UI for testing single transactions with custom or ULB feature vectors.
- **Reason Codes**: Human-interpretable heuristic indicators attached to scored transactions.
- **Customer Risk Profiles**: Historical customer summary and risk aggregation.
- **PostgreSQL Persistence**: DB schema supporting customer, transaction, alert, and investigation tables.

---

## 8. API Endpoints

- `GET /api/health` — System health check
- `POST /api/v1/fraud/check` — Evaluate transaction risk score and decision
- `GET /api/v1/transactions` — Fetch all recorded transactions
- `GET /api/v1/transactions/{transaction_id}` — Fetch specific transaction by ID
- `GET /api/v1/fraud/alerts` — Fetch all generated fraud alerts
- `POST /api/v1/investigations` — Open/create investigation (idempotent)
- `GET /api/v1/investigations` — List all investigations
- `GET /api/v1/investigations/{investigation_id}` — Fetch investigation details by ID
- `POST /api/v1/investigations/{investigation_id}/decision` — Save analyst decision (`APPROVE`, `BLOCK`, `ESCALATE`)
- `GET /api/v1/customers/{customer_id}/risk` — Fetch customer risk summary
- `GET /api/v1/models/status` — ML model status and performance metrics
- `GET /api/v1/dashboard/stats` — Operations dashboard statistics

---

## 9. Investigation Workflow

```
Alert / Transaction
         │
         ▼
Start Investigation
         │
         ▼
Check Existing Investigation (WHERE transaction_id = :id)
   ├── Exists     ──> Re-open and return existing investigation
   └── Not Exists ──> Create new investigation record
         │
         ▼
Open Analyst Workspace
         │
         ▼
Analyst Decision (APPROVE / BLOCK / ESCALATE)
         │
         ▼
Persist Decision & Update Status (Resolved / Escalated)
```

**Duplicate Prevention**: The backend checks if an investigation already exists for a transaction ID before creating a new one. Subsequent calls return the existing investigation.

---

## 10. Setup

### Frontend (Windows / Node.js)

```powershell
cd frontend
npm install
npm run dev
```
The frontend will run at `http://localhost:5173`.

### Backend (Windows / Python)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The API documentation will be available at `http://localhost:8000/docs`.

---

## 11. Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```env
# Database Connection URL (PostgreSQL / Supabase)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/fraudguard

# CORS Allowed Origins (comma-separated)
CORS_ORIGINS=http://localhost:5173

# Authentication & Security
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Hybrid Engine Scoring Weights
RULE_WEIGHT=0.6
ML_WEIGHT=0.4
```

---

## 12. Testing

### Backend Unit & Integration Tests

Run Pytest:
```powershell
cd backend
pytest
```
**Verified Result**: `7 passed` in test suite (`test_backend.py`).

### Frontend Production Build

Run Vite build:
```powershell
cd frontend
npm run build
```
**Verified Result**: **PASS**. Vite output notes a chunk-size warning for standard bundle size, but the build compiles cleanly (`dist/` created).

---

## 13. Limitations

- **Feature Drift**: Feature drift tracking is currently unavailable / static because no real-time feature drift streaming pipeline exists.
- **ULB PCA Features**: Features `V1`–`V28` are anonymized mathematical components from PCA transformation and are not directly interpretable business attributes.
- **Compliance Scope**: The system includes PCI-aligned design considerations (separation of auth vectors and transaction metadata), but it is a portfolio/demonstration project and is not formally certified PCI-DSS compliant.
- **Retraining Pipeline**: Continuous online ML retraining is not active in this release; the model artifact (`xgb-ulb-v1`) is static.
