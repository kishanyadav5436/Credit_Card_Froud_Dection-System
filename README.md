# 🛡️ FraudGuard — Credit Card Fraud Detection System

> **AI-powered, real-time fraud intelligence platform** built with FastAPI + React (Vite) + Recharts.

---

## 📋 Table of Contents

1. [Project Vision](#-project-vision)
2. [Architecture Overview](#-architecture-overview)
3. [Tech Stack](#-tech-stack)
4. [Feature Modules](#-feature-modules)
5. [Project Structure — Full Map](#-project-structure--full-map)
6. [File Status: Completed vs Missing](#-file-status-completed-vs-missing)
7. [Missing Components — Detailed Completion Guide](#-missing-components--detailed-completion-guide)
8. [API Reference](#-api-reference)
9. [Data Models](#-data-models)
10. [Getting Started](#-getting-started)
11. [Environment Variables](#-environment-variables)
12. [Demo Credentials](#-demo-credentials)
13. [Roadmap](#-roadmap)

---

## 🎯 Project Vision

**FraudGuard** is a full-stack, production-grade Credit Card Fraud Detection System for bank fraud operation teams combining:

- **Rule-based fraud scoring engine** (4 rules, score 0–100) ✅
- **Explainable AI with reason codes** ✅
- **Real-time alert streaming** via custom browser events ✅
- **Full investigation workflow** — open → analyze → decide → resolve ✅
- **Model performance monitoring and feature drift tracking** ✅
- **Analyst feedback loop** for model retraining ✅
- **Fraud Simulator** for manual QA testing ✅

The goal: a **self-contained fraud operations center** — no external SaaS — that an analyst opens in the browser and uses end-to-end, from a suspicious transaction arriving in real-time to filing a resolution decision.

---

## 🏛️ Architecture Overview

```
BROWSER
  └── React + Vite Frontend (port 5173)
        Pages: Dashboard | Transactions | Alerts | Investigations | ModelMonitoring | FraudSimulator | Login
        State: TanStack React-Query (server) + Zustand (UI)
        Charts: Recharts | Icons: Lucide React | Router: React Router v7
              │
              │ HTTP REST  ── VITE_API_BASE_URL (default: http://localhost:8000)
              │
  └── FastAPI Backend (port 8000)
        Routers: /api/v1/fraud | /api/v1/transactions | /api/v1/fraud/alerts
                 /api/v1/investigations | /api/v1/customers | /api/v1/models
                 /api/v1/fraud/feedback
        Services: FraudEngine | AlertService | InvestigationService
                  TransactionService | CustomerService | ModelService | FeedbackService
        Storage: In-memory Python lists (Phase 1) → PostgreSQL planned (Phase 2)
```

---

## 🧰 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn |
| Validation | Pydantic v2 |
| Storage (current) | In-memory Python lists |
| Storage (planned) | PostgreSQL + SQLAlchemy |
| Auth (planned) | python-jose + passlib bcrypt |
| ML (planned) | scikit-learn, pandas, numpy |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router v7 |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 |
| Charts | Recharts v3 |
| Icons | Lucide React |
| HTTP Client | Native fetch wrapped in apiClient |

---

## 🗂️ Feature Modules

| Module | Route | Status |
|---|---|---|
| Dashboard | /dashboard | ✅ Complete |
| Fraud Simulator | /fraud-simulator | ✅ Complete |
| Transactions | /transactions | ✅ Complete |
| Fraud Alerts | /alerts | ✅ Complete |
| Investigation Workflow | /investigations | ✅ Complete |
| Model Monitoring | /model-monitoring | ✅ Complete |
| Login / Auth | /login | ✅ Complete (demo) |

---

## 📁 Project Structure — Full Map

### Backend

```
backend/
├── .env                             # Environment config
├── requirements.txt                 # Python dependencies
├── structre.md                      # Architecture notes
└── app/
    ├── main.py                      # FastAPI app + routers + CORS
    ├── api/v1/
    │   ├── alerts.py                # GET /api/v1/fraud/alerts, /alerts/{id}
    │   ├── customers.py             # GET /api/v1/customers/{id}/risk
    │   ├── feedback.py              # POST/GET /api/v1/fraud/feedback
    │   ├── fraud.py                 # POST /api/v1/fraud/check
    │   ├── investigations.py        # POST/GET /api/v1/investigations + decision
    │   ├── models.py                # GET /api/v1/models/status
    │   └── transactions.py          # GET /api/v1/transactions, /{id}
    ├── core/
    │   ├── config.py                # ❌ EMPTY — pydantic-settings Settings class
    │   └── security.py              # ❌ EMPTY — JWT create/verify token helpers
    ├── database/
    │   ├── base.py                  # ❌ EMPTY — SQLAlchemy declarative Base
    │   ├── connection.py            # ⚠️ STUB  — placeholder only
    │   └── repository.py            # ⚠️ STUB  — SQL strings, not wired to DB
    ├── ml/
    │   ├── anomaly.py               # ❌ EMPTY — Isolation Forest anomaly detector
    │   ├── explainability.py        # ❌ EMPTY — SHAP / feature importance
    │   └── model.py                 # ❌ EMPTY — scikit-learn model loader
    ├── models/
    │   ├── alert.py                 # ❌ EMPTY — SQLAlchemy Alert ORM model
    │   ├── feedback.py              # Pydantic feedback response
    │   ├── investigation.py         # Investigation ORM/schema
    │   └── transaction.py           # ❌ EMPTY — SQLAlchemy Transaction ORM
    ├── schemas/
    │   ├── feedback.py              # ✅ FraudFeedbackRequest
    │   ├── fraud.py                 # ✅ FraudCheckRequest + Response
    │   ├── investigation.py         # ✅ InvestigationCreate + DecisionRequest
    │   └── transaction.py           # ✅ TransactionResponse
    └── services/
        ├── alert_service.py         # ✅ In-memory alert CRUD
        ├── customer_service.py      # ✅ Customer risk aggregation
        ├── database_service.py      # ⚠️ STUB — stub class only
        ├── decision_engine.py       # ❌ EMPTY — Decision orchestrator
        ├── feature_engineering.py   # ⚠️ DUPLICATE of fraud_engine.py
        ├── feedback_service.py      # ✅ In-memory feedback CRUD
        ├── fraud_engine.py          # ✅ Rule-based scoring (4 rules)
        ├── investigation_service.py # ✅ In-memory investigation CRUD
        ├── model_service.py         # ✅ Static model status + drift
        └── transaction_service.py   # ✅ In-memory transaction CRUD
```

### Frontend

```
frontend/src/
├── App.jsx                          # ✅ useRoutes() wiring
├── main.jsx                         # ✅ QueryClientProvider + BrowserRouter
├── router.jsx                       # ✅ All 7 route definitions
├── api/
│   ├── alerts.js                    # ✅ getAlerts, resolveAlert, subscribe
│   ├── auth.js                      # ✅ login / logout / getCurrentUser
│   ├── client.js                    # ✅ fetch wrapper apiClient
│   ├── dashboard.js                 # ✅ Static mock data
│   ├── fraud.js                     # ⚠️ STUB — no exported functions
│   ├── fraudEngine.js               # ✅ submitFraudCheck → backend POST
│   ├── investigations.js            # ✅ getInvestigation + mock + decision
│   ├── models.js                    # ✅ getModelStatus → backend GET
│   ├── transactionSimulator.js      # ✅ createSimulatedTransaction
│   └── transactions.js              # ✅ getTransactions + getStoredTransactions
├── components/
│   ├── charts/
│   │   ├── DriftTable.jsx           # ❌ EMPTY — Feature drift data table
│   │   ├── FeatureDriftChart.jsx    # ✅ Recharts BarChart
│   │   ├── MetricTrendChart.jsx     # ❌ EMPTY — Precision/Recall trend line
│   │   ├── ModelPerformanceChart.jsx# ✅ Recharts RadarChart
│   │   ├── PredictionDistributionChart.jsx # ❌ EMPTY — Fraud vs Legit donut
│   │   ├── RiskDistributionChart.jsx# ✅ Recharts PieChart
│   │   └── RiskTrendChart.jsx       # ❌ EMPTY — Risk score area chart
│   ├── domain/
│   │   ├── AlertTypeBadge.jsx       # ✅ Alert type badge
│   │   ├── ModelVersionTag.jsx      # ❌ EMPTY — Model version chip
│   │   ├── ReasonCodeList.jsx       # ❌ EMPTY — Reason code list
│   │   ├── RiskScoreBadge.jsx       # ✅ Color-coded score badge
│   │   ├── SeverityTag.jsx          # ✅ Low/Medium/Critical tag
│   │   ├── StatTile.jsx             # ❌ EMPTY — KPI stat tile
│   │   └── StatusPill.jsx           # ✅ Active/Resolved pill
│   ├── layout/
│   │   ├── PageHeader.jsx           # ✅ Page title + subtitle
│   │   ├── ProtectedRoute.jsx       # ✅ Auth guard
│   │   ├── Sidebar.jsx              # ✅ Left nav + brand + logout
│   │   └── TopBar.jsx               # ✅ Search + alerts + user profile
│   └── ui/
│       ├── Button.jsx               # ❌ EMPTY — Reusable button
│       ├── Drawer.jsx               # ✅ Slide-in detail drawer
│       ├── Input.jsx                # ❌ EMPTY — Styled input
│       ├── Panel.jsx                # ❌ EMPTY — Card container
│       ├── Skeleton.jsx             # ❌ EMPTY — Loading shimmer
│       ├── StatCard.jsx             # ✅ Stat card with trend
│       ├── Table.jsx                # ❌ EMPTY — Sortable data table
│       └── Tabs.jsx                 # ❌ EMPTY — Tab bar switcher
├── hooks/
│   ├── useAlertStream.js            # ✅ Real-time alert listener
│   ├── useAlerts.js                 # ✅ React-Query alerts hook
│   ├── useFeatureDrift.js           # ✅ React-Query drift hook
│   ├── useFraudCheck.js             # ✅ React-Query mutation
│   ├── useInvestigation.js          # ✅ React-Query investigation
│   ├── useModelMetrics.js           # ✅ React-Query model metrics
│   ├── useTransactions.js           # ✅ React-Query transactions
│   └── useauth.js                   # ✅ login/logout mutation
├── pages/
│   ├── AlertsPage.jsx + .css        # ✅ Alert list + drawer + resolve
│   ├── DashboardPage.jsx + .css     # ✅ KPIs + charts + activity
│   ├── FraudSimulatorPage.jsx + .css# ✅ Manual fraud form + results
│   ├── LoginPage.jsx + .css         # ✅ Login form
│   ├── ModelMonitoringPage.jsx + .css# ✅ Metrics + drift + versions
│   ├── TransactionsPage.jsx + .css  # ✅ Filtered table + drawer
│   └── investigation/
│       ├── CustomerHistoryTab.jsx   # ✅ Customer history tab
│       ├── DecisionPanel.jsx        # ✅ APPROVE/BLOCK/ESCALATE form
│       ├── DeviceHistoryTab.jsx     # ✅ Device fingerprint tab
│       ├── InvestigationPage.jsx + .css # ✅ Full investigation detail
│       └── MerchantHistoryTab.jsx   # ✅ Merchant risk tab
├── store/
│   ├── filterStore.js               # ❌ EMPTY — Zustand filter state
│   ├── sessionStore.js              # ❌ EMPTY — Zustand session state
│   └── uiStore.js                   # ❌ EMPTY — Zustand UI state
├── styles/
│   └── index.css                    # ✅ Full design system (45 KB)
├── tests/
│   ├── components/                  # ❌ EMPTY DIR — Component tests
│   ├── hooks/                       # ❌ EMPTY DIR — Hook tests
│   └── pages/                       # ❌ EMPTY DIR — Page tests
└── utils/
    ├── formatters.js                # ❌ EMPTY — Currency/date/percent formatters
    ├── permissions.js               # ❌ EMPTY — Role-based permission helpers
    └── riskBand.js                  # ❌ EMPTY — Risk score to band/color mapping
```

---

## 🔴 File Status Summary

**Total: 39 files complete ✅ | 13 files empty ❌ | 7 files stub ⚠️**

### Backend
| File | Status |
|---|---|
| app/main.py | ✅ Complete |
| app/core/config.py | ❌ Empty |
| app/core/security.py | ❌ Empty |
| app/database/base.py | ❌ Empty |
| app/database/connection.py | ⚠️ Stub |
| app/database/repository.py | ⚠️ Stub |
| app/ml/model.py | ❌ Empty |
| app/ml/anomaly.py | ❌ Empty |
| app/ml/explainability.py | ❌ Empty |
| app/models/alert.py | ❌ Empty |
| app/models/transaction.py | ❌ Empty |
| app/services/decision_engine.py | ❌ Empty |
| app/services/feature_engineering.py | ⚠️ Duplicate of fraud_engine |
| All api/v1/*.py (7 files) | ✅ Complete |
| All schemas/*.py (4 files) | ✅ Complete |
| 5 core services (alert/customer/feedback/investigation/model/transaction) | ✅ Complete |

### Frontend
| File | Status |
|---|---|
| All pages (12 files) | ✅ Complete |
| All hooks (8 files) | ✅ Complete |
| layout/* (4 files) | ✅ Complete |
| ui/Drawer.jsx, StatCard.jsx | ✅ Complete |
| domain/AlertTypeBadge, RiskScoreBadge, SeverityTag, StatusPill | ✅ Complete |
| charts/FeatureDrift, ModelPerformance, RiskDistribution | ✅ Complete |
| api/* (9 of 10 files) | ✅ Complete |
| api/fraud.js | ⚠️ Stub |
| ui/Button, Input, Panel, Skeleton, Table, Tabs | ❌ Empty |
| domain/ModelVersionTag, ReasonCodeList, StatTile | ❌ Empty |
| charts/DriftTable, MetricTrend, PredictionDistribution, RiskTrend | ❌ Empty |
| store/sessionStore, filterStore, uiStore | ❌ Empty |
| utils/formatters, permissions, riskBand | ❌ Empty |


---

## 🔧 Missing Components — Detailed Completion Guide

> All implementations below use ONLY packages already installed. No npm install or pip install required.

---

### BACKEND — 7 Empty Files to Complete

---

#### 1. `app/core/config.py` — App Settings

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "Credit Card Fraud Detection API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/fraudguard"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

settings = Settings()
```

---

#### 2. `app/core/security.py` — JWT Helpers

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
```

---

#### 3. `app/database/base.py` — SQLAlchemy Base

```python
from sqlalchemy.orm import declarative_base

Base = declarative_base()
```

---

#### 4. `app/database/connection.py` — DB Session Factory

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

#### 5. `app/models/transaction.py` — Transaction ORM

```python
from sqlalchemy import Column, String, Float, Integer, Boolean, JSON, DateTime
from sqlalchemy.sql import func
from app.database.base import Base

class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id    = Column(String, primary_key=True, index=True)
    customer_id       = Column(String, nullable=False, index=True)
    merchant_id       = Column(String, nullable=False)
    amount            = Column(Float, nullable=False)
    currency          = Column(String, default="INR")
    velocity          = Column(Integer, default=0)
    is_new_device     = Column(Boolean, default=False)
    location_mismatch = Column(Boolean, default=False)
    risk_score        = Column(Integer, nullable=False)
    decision          = Column(String, nullable=False)   # APPROVE | REVIEW | BLOCK
    severity          = Column(String, nullable=False)   # Low | Medium | Critical
    probability       = Column(Float, nullable=False)
    reason_codes      = Column(JSON, default=list)
    reasons           = Column(JSON, default=list)
    model_version     = Column(String, nullable=False)
    latency_ms        = Column(Integer, default=0)
    created_at        = Column(DateTime(timezone=True), server_default=func.now())
```

---

#### 6. `app/models/alert.py` — Alert ORM

```python
from sqlalchemy import Column, String, Integer, JSON, DateTime
from sqlalchemy.sql import func
from app.database.base import Base

class Alert(Base):
    __tablename__ = "alerts"

    alert_id       = Column(String, primary_key=True, index=True)
    type           = Column(String, nullable=False)
    severity       = Column(String, nullable=False)
    status         = Column(String, default="Active")   # Active | Resolved
    risk_score     = Column(Integer, nullable=False)
    transaction_id = Column(String, nullable=False, index=True)
    customer_id    = Column(String, nullable=False)
    merchant_id    = Column(String, nullable=False)
    amount         = Column(Integer, nullable=False)
    trigger        = Column(String, nullable=False)
    reason_codes   = Column(JSON, default=list)
    detected_at    = Column(DateTime(timezone=True), server_default=func.now())
```

---

#### 7. `app/services/decision_engine.py` — Decision Orchestrator

```python
def make_decision(risk_score: int, ml_probability: float | None = None) -> dict:
    """
    Combine rule-based risk score with optional ML probability.
    When ml_probability is provided, blends scores 60 / 40.
    Returns: { decision, severity, score }
    """
    effective_score = risk_score

    if ml_probability is not None:
        ml_score = int(ml_probability * 100)
        effective_score = int(risk_score * 0.6 + ml_score * 0.4)

    if effective_score >= 80:
        return {"decision": "BLOCK",   "severity": "Critical", "score": effective_score}
    elif effective_score >= 30:
        return {"decision": "REVIEW",  "severity": "Medium",   "score": effective_score}
    else:
        return {"decision": "APPROVE", "severity": "Low",      "score": effective_score}
```

---

#### 8. `app/ml/model.py` — scikit-learn Model Loader
(scikit-learn already in requirements.txt)

```python
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier

class FraudModel:
    FEATURES = ["amount", "velocity", "is_new_device", "location_mismatch", "hour_of_day"]

    def __init__(self):
        self.model = GradientBoostingClassifier(n_estimators=100, random_state=42)
        self._train_on_seed_data()

    def _train_on_seed_data(self):
        X = np.array([
            [1000,  1, 0, 0, 14],
            [80000, 5, 1, 1,  3],
            [500,   1, 0, 0, 10],
            [95000, 4, 1, 1,  2],
            [2000,  2, 0, 0, 12],
            [60000, 3, 1, 0,  1],
        ])
        y = [0, 1, 0, 1, 0, 1]
        self.model.fit(X, y)

    def predict_proba(self, features: dict) -> float:
        X = [[
            features.get("amount", 0),
            features.get("velocity", 0),
            int(features.get("isNewDevice", False)),
            int(features.get("locationMismatch", False)),
            features.get("hour_of_day", 12),
        ]]
        return float(self.model.predict_proba(X)[0][1])

fraud_model = FraudModel()
```

---

#### 9. `app/ml/anomaly.py` — Isolation Forest
(scikit-learn already in requirements.txt)

```python
import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self._fit_seed()

    def _fit_seed(self):
        amounts = np.array([[500],[800],[1200],[600],[950],[1100],[750],[82000],[95000],[300]])
        self.model.fit(amounts)

    def is_anomaly(self, amount: float) -> bool:
        return self.model.predict([[amount]])[0] == -1

anomaly_detector = AnomalyDetector()
```

---

#### 10. `app/ml/explainability.py` — Feature Importance

```python
from app.ml.model import fraud_model

FEATURE_LABELS = {
    "amount":            "Transaction Amount",
    "velocity":          "Transaction Velocity",
    "is_new_device":     "New Device Detected",
    "location_mismatch": "Location Mismatch",
    "hour_of_day":       "Unusual Transaction Hour",
}

def get_top_reasons(features: dict, top_n: int = 3) -> list[dict]:
    importances = fraud_model.model.feature_importances_
    scored = []
    for name, imp in zip(fraud_model.FEATURES, importances):
        if features.get(name, 0):
            scored.append({
                "code":  name.upper(),
                "label": FEATURE_LABELS.get(name, name),
                "score": round(float(imp) * 100),
            })
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_n]
```

---

### FRONTEND — 13 Empty Files to Complete
(All use packages already in package.json — no npm install needed)

---

#### 11. `src/utils/formatters.js`

```js
export function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(isoString) {
  if (!isoString) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(isoString));
}

export function formatPercent(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function truncate(str, maxLength = 20) {
  if (!str) return "—";
  return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
}
```

---

#### 12. `src/utils/riskBand.js`

```js
export function getRiskBand(score) {
  if (score >= 80) return { label: "Critical", className: "risk-critical", color: "#ef4444" };
  if (score >= 60) return { label: "High",     className: "risk-high",     color: "#f97316" };
  if (score >= 30) return { label: "Medium",   className: "risk-medium",   color: "#eab308" };
  return             { label: "Low",      className: "risk-low",      color: "#22c55e" };
}

export function getDecisionStyle(decision) {
  switch ((decision ?? "").toUpperCase()) {
    case "BLOCK":   return { label: "Blocked",  className: "decision-block"   };
    case "REVIEW":  return { label: "Review",   className: "decision-review"  };
    case "APPROVE": return { label: "Approved", className: "decision-approve" };
    default:        return { label: decision,   className: ""                 };
  }
}
```

---

#### 13. `src/utils/permissions.js`

```js
const ROLE_PERMISSIONS = {
  "Fraud Analyst": [
    "view:dashboard", "view:transactions", "view:alerts",
    "view:investigations", "submit:decision", "submit:feedback", "run:simulator",
  ],
  "Supervisor": [
    "view:dashboard", "view:transactions", "view:alerts",
    "view:investigations", "submit:decision", "submit:feedback",
    "run:simulator", "view:model-monitoring", "manage:users",
  ],
  "Admin": ["*"],
};

export function can(user, action) {
  if (!user?.role) return false;
  const perms = ROLE_PERMISSIONS[user.role] ?? [];
  return perms.includes("*") || perms.includes(action);
}
```

---

#### 14. `src/store/sessionStore.js`

```js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSessionStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: "fraudguard-session" }
  )
);

export default useSessionStore;
```

---

#### 15. `src/store/filterStore.js`

```js
import { create } from "zustand";

const useFilterStore = create((set) => ({
  transactionFilters: { search: "", decision: "all", severity: "all", dateRange: null },
  setTransactionFilters: (f) =>
    set((s) => ({ transactionFilters: { ...s.transactionFilters, ...f } })),
  resetTransactionFilters: () =>
    set({ transactionFilters: { search: "", decision: "all", severity: "all", dateRange: null } }),
  alertFilters: { search: "", status: "all", severity: "all" },
  setAlertFilters: (f) =>
    set((s) => ({ alertFilters: { ...s.alertFilters, ...f } })),
}));

export default useFilterStore;
```

---

#### 16. `src/store/uiStore.js`

```js
import { create } from "zustand";

const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  activeDrawer: null,
  drawerPayload: null,
  openDrawer: (type, payload) => set({ activeDrawer: type, drawerPayload: payload }),
  closeDrawer: () => set({ activeDrawer: null, drawerPayload: null }),
  globalLoading: false,
  setGlobalLoading: (v) => set({ globalLoading: v }),
}));

export default useUiStore;
```

---

#### 17. `src/api/fraud.js`

```js
import apiClient from "./client";

export async function checkFraud(transactionData) {
  return apiClient.post("/api/v1/fraud/check", transactionData);
}
```

---

#### 18. `src/components/ui/Button.jsx`

```jsx
function Button({ children, variant="primary", size="md", loading=false,
  disabled=false, icon:Icon, onClick, type="button", className="" }) {
  return (
    <button type={type} className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading} onClick={onClick}>
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}
export default Button;
```

---

#### 19. `src/components/ui/Input.jsx`

```jsx
function Input({ label, id, error, icon:Icon, type="text", ...props }) {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && <Icon size={16} className="input-icon" />}
        <input id={id} type={type}
          className={`input-field${Icon?" input-with-icon":""}${error?" input-error":""}`}
          {...props} />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
}
export default Input;
```

---

#### 20. `src/components/ui/Panel.jsx`

```jsx
function Panel({ title, subtitle, action, children, className="" }) {
  return (
    <div className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-header">
          <div>
            {title && <h3 className="panel-title">{title}</h3>}
            {subtitle && <p className="panel-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="panel-action">{action}</div>}
        </div>
      )}
      <div className="panel-body">{children}</div>
    </div>
  );
}
export default Panel;
```

---

#### 21. `src/components/ui/Skeleton.jsx`

```jsx
function Skeleton({ width, height="1rem", borderRadius="0.5rem", className="" }) {
  return (
    <div className={`skeleton ${className}`}
      style={{ width, height, borderRadius }} aria-hidden="true" />
  );
}
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton width="40%" height="1.25rem" />
      <Skeleton width="100%" height="3rem" />
      <Skeleton width="60%" height="0.875rem" />
    </div>
  );
}
export default Skeleton;
```

---

#### 22. `src/components/ui/Table.jsx`

```jsx
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

function Table({ columns, rows, emptyMessage="No data found." }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...rows].sort((a, b) => {
    if (!sortKey) return 0;
    if (a[sortKey] < b[sortKey]) return sortDir === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} onClick={col.sortable ? () => handleSort(col.key) : undefined}
                className={col.sortable ? "sortable" : ""}>
                {col.label}
                {col.sortable && sortKey === col.key && (
                  sortDir === "asc" ? <ChevronUp size={14}/> : <ChevronDown size={14}/>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length} className="table-empty">{emptyMessage}</td></tr>
          ) : sorted.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Table;
```

---

#### 23. `src/components/ui/Tabs.jsx`

```jsx
function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="tabs-bar" role="tablist">
      {tabs.map(tab => (
        <button key={tab.value} role="tab" aria-selected={activeTab === tab.value}
          className={`tab-btn${activeTab === tab.value ? " tab-active" : ""}`}
          onClick={() => onChange(tab.value)}>
          {tab.icon && <tab.icon size={15} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
export default Tabs;
```

---

#### 24. `src/components/domain/ModelVersionTag.jsx`

```jsx
function ModelVersionTag({ version }) {
  return <span className="model-version-tag">🤖 {version ?? "—"}</span>;
}
export default ModelVersionTag;
```

---

#### 25. `src/components/domain/ReasonCodeList.jsx`

```jsx
import { AlertTriangle, Info } from "lucide-react";

const IMPACT = {
  High:   { color: "#ef4444", Icon: AlertTriangle },
  Medium: { color: "#f97316", Icon: Info },
  Low:    { color: "#eab308", Icon: Info },
};

function ReasonCodeList({ reasons = [] }) {
  if (!reasons.length) return <p className="no-reasons">No reason codes.</p>;
  return (
    <ul className="reason-code-list">
      {reasons.map((r, i) => {
        const s = IMPACT[r.impact] ?? IMPACT.Low;
        return (
          <li key={i} className="reason-code-item">
            <s.Icon size={16} color={s.color} />
            <div>
              <span className="reason-code">{r.code}</span>
              <span className="reason-desc">{r.label ?? r.description ?? ""}</span>
            </div>
            {r.score != null && <span className="reason-score">+{r.score}</span>}
          </li>
        );
      })}
    </ul>
  );
}
export default ReasonCodeList;
```

---

#### 26. `src/components/domain/StatTile.jsx`

```jsx
function StatTile({ label, value, trend, trendLabel, icon:Icon, color }) {
  const isUp = trend > 0;
  return (
    <div className="stat-tile">
      {Icon && <div className="stat-tile-icon" style={{background:color}}><Icon size={20}/></div>}
      <div className="stat-tile-body">
        <span className="stat-tile-label">{label}</span>
        <span className="stat-tile-value">{value}</span>
        {trend != null && (
          <span className={`stat-tile-trend ${isUp ? "trend-up" : "trend-down"}`}>
            {isUp ? "▲" : "▼"} {Math.abs(trend)}%{trendLabel ? ` ${trendLabel}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}
export default StatTile;
```

---

#### 27. `src/components/charts/DriftTable.jsx`

```jsx
import StatusPill from "../domain/StatusPill";

function DriftTable({ features = [] }) {
  return (
    <div className="drift-table-wrapper">
      <table className="drift-table">
        <thead><tr><th>Feature</th><th>Drift %</th><th>Threshold</th><th>Status</th></tr></thead>
        <tbody>
          {features.map((f, i) => {
            const pct = Math.min(f.drift ?? 0, 100);
            return (
              <tr key={i}>
                <td className="feat-name">{f.feature}</td>
                <td>
                  <div className="drift-bar-wrapper">
                    <div className="drift-bar" style={{
                      width:`${pct}%`, background: f.status==="Warning" ? "#f97316" : "#22c55e"
                    }}/>
                    <span>{pct.toFixed(1)}%</span>
                  </div>
                </td>
                <td>10.0%</td>
                <td><StatusPill status={f.status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export default DriftTable;
```

---

#### 28. `src/components/charts/MetricTrendChart.jsx`

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const SEED = [
  { date:"Sep 1",  precision:93.1, recall:90.4, f1:91.7 },
  { date:"Sep 7",  precision:93.8, recall:91.2, f1:92.5 },
  { date:"Sep 14", precision:94.0, recall:91.5, f1:92.7 },
  { date:"Sep 17", precision:94.2, recall:91.8, f1:93.0 },
];

function MetricTrendChart({ data = SEED }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
        <XAxis dataKey="date" tick={{fill:"#9ca3af",fontSize:11}}/>
        <YAxis domain={[85,100]} tick={{fill:"#9ca3af",fontSize:11}} unit="%"/>
        <Tooltip contentStyle={{background:"#1f2937",border:"none",borderRadius:"8px"}}/>
        <Legend/>
        <Line type="monotone" dataKey="precision" stroke="#6366f1" strokeWidth={2} dot={false}/>
        <Line type="monotone" dataKey="recall"    stroke="#22c55e" strokeWidth={2} dot={false}/>
        <Line type="monotone" dataKey="f1"        stroke="#f59e0b" strokeWidth={2} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}
export default MetricTrendChart;
```

---

#### 29. `src/components/charts/PredictionDistributionChart.jsx`

```jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#22c55e","#ef4444"];
const SEED = [{ name:"Legitimate", value:121578 }, { name:"Fraud", value:6842 }];

function PredictionDistributionChart({ data = SEED }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
          paddingAngle={4} dataKey="value">
          {data.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
        </Pie>
        <Tooltip contentStyle={{background:"#1f2937",border:"none",borderRadius:"8px"}}
          formatter={v => v.toLocaleString()}/>
        <Legend/>
      </PieChart>
    </ResponsiveContainer>
  );
}
export default PredictionDistributionChart;
```

---

#### 30. `src/components/charts/RiskTrendChart.jsx`

```jsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SEED = [
  {time:"Day 1",avgRisk:28},{time:"Day 2",avgRisk:34},{time:"Day 3",avgRisk:31},
  {time:"Day 4",avgRisk:42},{time:"Day 5",avgRisk:38},{time:"Day 6",avgRisk:55},
  {time:"Day 7",avgRisk:49},
];

function RiskTrendChart({ data = SEED }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
        <XAxis dataKey="time" tick={{fill:"#9ca3af",fontSize:11}}/>
        <YAxis domain={[0,100]} tick={{fill:"#9ca3af",fontSize:11}}/>
        <Tooltip contentStyle={{background:"#1f2937",border:"none",borderRadius:"8px"}}/>
        <Area type="monotone" dataKey="avgRisk" stroke="#ef4444" strokeWidth={2} fill="url(#riskGrad)"/>
      </AreaChart>
    </ResponsiveContainer>
  );
}
export default RiskTrendChart;
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/fraud/check | Submit transaction for fraud scoring |
| GET  | /api/v1/transactions | List all scored transactions |
| GET  | /api/v1/transactions/{id} | Get single transaction |
| GET  | /api/v1/fraud/alerts | List all alerts |
| GET  | /api/v1/fraud/alerts/{id} | Get single alert |
| POST | /api/v1/investigations | Create investigation |
| GET  | /api/v1/investigations | List all investigations |
| GET  | /api/v1/investigations/{id} | Get investigation detail |
| POST | /api/v1/investigations/{id}/decision | Submit APPROVE/BLOCK/ESCALATE |
| GET  | /api/v1/customers/{id}/risk | Get customer risk profile |
| GET  | /api/v1/models/status | Model performance and drift data |
| POST | /api/v1/fraud/feedback | Submit analyst feedback |
| GET  | /api/v1/fraud/feedback | List all feedback |

---

## 📦 Data Models

### FraudCheckRequest
```json
{
  "transaction_id": "TXN-12345",
  "customer_id": "CUS-48291",
  "merchant_id": "MER-AMZ-102",
  "amount": 82450,
  "currency": "INR",
  "velocity": 3,
  "isNewDevice": true,
  "locationMismatch": true
}
```

### FraudCheckResponse
```json
{
  "transaction_id": "TXN-12345",
  "risk_score": 75,
  "decision": "REVIEW",
  "severity": "Medium",
  "reason_codes": ["AMOUNT_ANOMALY", "NEW_DEVICE", "VELOCITY_HIGH"],
  "reasons": [{ "code": "AMOUNT_ANOMALY", "label": "Unusually high amount", "score": 30 }],
  "probability": 0.75,
  "model_version": "fraud-engine-v1",
  "latency_ms": 4
}
```

### Risk Score Rules (Current Engine)
| Rule | Condition | Score Added |
|---|---|---|
| HIGH_AMOUNT | amount >= 50,000 | +30 |
| NEW_DEVICE | isNewDevice = true | +25 |
| HIGH_VELOCITY | velocity >= 3 | +25 |
| LOCATION_MISMATCH | locationMismatch = true | +20 |

### Decision Thresholds
| Score Range | Decision | Severity |
|---|---|---|
| 80 – 100 | BLOCK | Critical |
| 30 – 79 | REVIEW | Medium |
| 0 – 29 | APPROVE | Low |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm 9+

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000
Swagger docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173

---

## 🔐 Environment Variables

### `backend/.env`
```
APP_NAME=Credit Card Fraud Detection API
APP_VERSION=1.0.0
DEBUG=True
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/fraudguard
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### `frontend/.env`
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🔑 Demo Credentials

| Email | Password | Role |
|---|---|---|
| admin@fraudguard.com | admin123 | Fraud Analyst |

> Auth is demo-only (localStorage). No backend JWT enforced in Phase 1.

---

## 📝 Developer Notes

1. **In-memory storage** — all data resets on server restart. PostgreSQL is Phase 2.
2. **feature_engineering.py duplicates fraud_engine.py** — refactor so fraud_engine imports helpers from feature_engineering.
3. **alerts.py and feedback.py both use prefix `/api/v1/fraud`** — intentional, exposes `/alerts` and `/feedback` sub-paths.
4. **api/fraud.js is a stub** — implement `checkFraud()` as shown in item 17 above.
5. **Zustand stores are empty** — hooks already import from correct paths; just add the store code.

---

## 🗺️ Roadmap

### Phase 1 — Core (Complete ✅)
- Rule-based fraud scoring (4 rules)
- In-memory transaction/alert/investigation storage
- Full frontend: all 7 pages, all hooks, all layout components

### Phase 2 — Robustness (Next)
- Complete all 20 empty files (code provided above)
- PostgreSQL via SQLAlchemy
- JWT authentication
- Zustand stores and reusable UI components

### Phase 3 — ML Integration
- Train scikit-learn model on labelled dataset
- Blend ML into decision_engine.py
- SHAP explainability, Isolation Forest anomaly detection

### Phase 4 — Production
- Docker + docker-compose
- WebSocket real-time alert push
- RBAC, audit log, CI/CD, unit tests

---

*FraudGuard v1.0.0 — Built for fraud operations teams*
