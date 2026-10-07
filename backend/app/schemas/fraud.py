"""
Fraud Check Schemas
===================

FraudCheckRequest is backward-compatible: all existing fields continue to
work without any changes.

Phase 2 additions:
  - ulb_features     : Optional 30-float ULB vector (XGBoost premium path)
  - customer_avg_amount, transaction_frequency, merchant_risk : Optional
    app-level enrichment fields for better RF predictions.

Phase 5/6 additions:
  - rf_info          : RF model result block
  - explanation      : LLM or template-based analyst explanation
  - explanation_source : "gemini" | "openai" | "template"

DO NOT map velocity/isNewDevice/locationMismatch into ulb_features.
V1-V28 are anonymised PCA components — they have no semantic mapping.
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class FraudCheckRequest(BaseModel):
    # ── Core fields (unchanged) ────────────────────────────────────────────
    transaction_id: str
    customer_id: str
    merchant_id: str

    amount: float = Field(..., ge=0, description="Transaction amount (must be >= 0)")

    currency: Optional[str] = "INR"

    velocity: Optional[int] = Field(default=0, ge=0)

    isNewDevice: Optional[bool] = False

    locationMismatch: Optional[bool] = False

    # ── Optional app-level enrichment (improve RF predictions) ────────────
    # These are NOT required — safe to omit; defaults produce conservative scores.
    customer_avg_amount: Optional[float] = Field(
        default=0.0,
        description="Customer's historical average transaction amount"
    )
    transaction_frequency: Optional[int] = Field(
        default=1,
        ge=0,
        description="Number of transactions by this customer in the last 24h"
    )
    merchant_risk: Optional[float] = Field(
        default=0.1,
        ge=0.0,
        le=1.0,
        description="Merchant risk score 0.0–1.0"
    )

    # ── Optional ULB model features (XGBoost premium path) ────────────────
    # If provided, must be exactly 30 floats in this order:
    #   Time, V1, V2, ..., V28, Amount
    # If None, XGBoost path is skipped; RF model always runs.
    # DO NOT populate this with fake/mapped values.
    ulb_features: Optional[List[float]] = None


class FraudReason(BaseModel):
    code: str
    label: str
    score: int


class FraudCheckResponse(BaseModel):
    transaction_id: str

    risk_score: int

    decision: str

    severity: str

    reason_codes: List[str]

    reasons: List[FraudReason]

    probability: float

    model_version: str

    # ── Scoring transparency ───────────────────────────────────────────────
    scoring_mode: Optional[str] = None      # "rule_only" | "rf_hybrid" | "full_hybrid"

    rule_score: Optional[int] = None        # Raw rule engine score (0-100)

    ml_score: Optional[float] = None        # Final ML score used in hybrid (0-100)

    rf_score: Optional[float] = None        # RF model score (0-100); always present when RF available

    rf_info: Optional[dict] = None          # RF model detail block

    ml_info: Optional[dict] = None          # XGBoost ULB model detail block

    ml_error: Optional[str] = None          # XGBoost error if applicable

    # ── Explainability ─────────────────────────────────────────────────────
    explanation: Optional[str] = None           # Analyst-readable explanation
    explanation_source: Optional[str] = None    # "gemini" | "openai" | "template"

    latency_ms: int