from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.fraud import router as fraud_router


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