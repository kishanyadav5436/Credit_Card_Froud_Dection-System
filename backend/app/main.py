from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.fraud import router as fraud_router
from app.api.v1.transactions import router as transaction_router
from app.api.v1.alerts import router as alert_router
from app.api.v1.investigations import (
    router as investigation_router
)
from app.api.v1.customers import (
    router as customer_router
)
app = FastAPI(
    title="Credit Card Fraud Detection API",
    description="AI-powered Credit Card Fraud Detection System",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    fraud_router
)
app.include_router(
    transaction_router
)
app.include_router(
    alert_router
)
app.include_router(
    investigation_router
)
app.include_router(
    customer_router
)

@app.get("/")
def root():
    return {
        "message": "Credit Card Fraud Detection API",
        "status": "running",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "fraud-detection-backend",
    }