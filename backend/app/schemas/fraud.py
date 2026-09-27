"""
Fraud Check Schemas
===================

FraudCheckRequest is backward-compatible: all existing fields continue to
work without any changes.  The new optional `ulb_features` field is the
ONLY way to supply the trained XGBoost model's 30-feature ULB vector.

DO NOT map velocity/isNewDevice/locationMismatch into ulb_features.
V1-V28 are anonymised PCA components — they have no semantic mapping.
"""

from typing import Optional, List
from pydantic import BaseModel


class FraudCheckRequest(BaseModel):
    # ── Existing application fields (unchanged) ────────────────────────────
    transaction_id: str
    customer_id: str
    merchant_id: str

    amount: float

    currency: Optional[str] = "INR"

    velocity: Optional[int] = 0

    isNewDevice: Optional[bool] = False

    locationMismatch: Optional[bool] = False

    # ── Optional ULB model features ────────────────────────────────────────
    # If provided, must be exactly 30 floats in this order:
    #   Time, V1, V2, ..., V28, Amount
    # If None (default), the ML engine is skipped and only the rule engine runs.
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
    scoring_mode: Optional[str] = None   # "rule_only" or "hybrid"

    rule_score: Optional[int] = None     # Raw rule engine score (0-100)

    ml_score: Optional[float] = None     # ML score (0-100); None if ML unused

    ml_info: Optional[dict] = None       # ML explainability block

    ml_error: Optional[str] = None       # Error message if ML failed

    latency_ms: int