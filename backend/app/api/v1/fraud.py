"""
Fraud Check Endpoint  —  POST /api/v1/fraud/check
==================================================

Architecture
------------
1. Rule engine (always runs):
   Evaluates HIGH_AMOUNT, NEW_DEVICE, HIGH_VELOCITY, LOCATION_MISMATCH
   using the application's transaction fields.  This is the primary live
   fraud engine.

2. ML engine (optional — only when caller supplies a valid 30-feature
   ULB vector via the `ulb_features` field):
   Calls the XGBoost model trained on the ULB Credit Card Fraud Detection
   dataset.  Features MUST be in the order: Time, V1...V28, Amount.

   DO NOT map velocity/isNewDevice/locationMismatch to V1-V28.
   V1-V28 are anonymised PCA components with no semantic equivalent in
   the application's transaction schema.

3. Hybrid scoring (only when ML is available AND ulb_features provided):
   final_score = rule_score * RULE_WEIGHT + ml_score * ML_WEIGHT
   Weights come from settings (RULE_WEIGHT=0.6, ML_WEIGHT=0.4 by default).
   final_score is clamped to [0, 100].

4. Decision thresholds (same as before):
   0-30   → APPROVE
   30-70  → REVIEW
   70-100 → BLOCK
"""

import time

from fastapi import APIRouter

from app.schemas.fraud import (
    FraudCheckRequest,
    FraudCheckResponse,
)

from app.services.fraud_engine import (
    calculate_fraud_risk,
)

from app.services.transaction_service import (
    save_transaction,
)

from app.services.alert_service import (
    create_alert,
)

from app.ml.predict import (
    predict_fraud,
    is_model_available,
    ModelNotAvailableError,
)
from app.ml.feature_engineering import FeatureCompatibilityError

from app.core.config import settings


router = APIRouter(
    prefix="/api/v1/fraud",
    tags=["Fraud Detection"],
)


def _apply_decision_threshold(score: float) -> tuple:
    """Map a 0-100 score to (decision, severity)."""
    if score >= 70:
        return "BLOCK", "Critical"
    elif score >= 30:
        return "REVIEW", "Medium"
    else:
        return "APPROVE", "Low"


@router.post(
    "/check",
    response_model=FraudCheckResponse,
)
def check_fraud(
    transaction: FraudCheckRequest,
):
    start_time = time.perf_counter()

    transaction_data = transaction.model_dump()

    # ── Step 1: Rule engine (always runs) ─────────────────────────────────────
    rule_result = calculate_fraud_risk(transaction_data)
    rule_score = float(rule_result["score"])

    # ── Step 2: ML engine (only if ulb_features supplied) ─────────────────────
    ml_result = None
    ml_used = False
    ml_error = None

    if transaction.ulb_features is not None:
        if is_model_available():
            try:
                ml_result = predict_fraud(transaction.ulb_features)
                ml_used = True
            except (ModelNotAvailableError, FeatureCompatibilityError) as e:
                ml_error = str(e)
        else:
            ml_error = "XGBoost model is not loaded."

    # ── Step 3: Compute final score ────────────────────────────────────────────
    if ml_used and ml_result is not None:
        # Hybrid: weighted combination of rule score and ML score
        ml_score = ml_result["ml_score"]

        raw_final = (
            rule_score * settings.RULE_WEIGHT
            + ml_score * settings.ML_WEIGHT
        )
        final_score = int(max(0.0, min(100.0, raw_final)))
        scoring_mode = "hybrid"
    else:
        # Rule engine only (ML unavailable or features not provided)
        final_score = int(max(0.0, min(100.0, rule_score)))
        ml_score = None
        scoring_mode = "rule_only"

    # ── Step 4: Apply decision threshold ──────────────────────────────────────
    decision, severity = _apply_decision_threshold(final_score)

    latency_ms = int((time.perf_counter() - start_time) * 1000)

    # ── Step 5: Build explainability sections ─────────────────────────────────
    # Rule reasons — human-readable, derived from application fields
    rule_reasons = rule_result["reasons"]

    # ML info — separate from rule reasons; V1-V28 are NOT human-interpretable
    ml_info = None
    if ml_used and ml_result is not None:
        ml_info = {
            "fraud_probability": ml_result["fraud_probability"],
            "ml_score": ml_result["ml_score"],
            "model_version": ml_result["model_version"],
            "note": (
                "V1-V28 are anonymised PCA components from the ULB dataset. "
                "They have no semantic mapping to application transaction fields."
            ),
        }

    # ── Step 6: Build response ────────────────────────────────────────────────
    response = {
        "transaction_id": transaction.transaction_id,
        "risk_score": final_score,
        "decision": decision,
        "severity": severity,
        "reason_codes": [r["code"] for r in rule_reasons],
        "reasons": rule_reasons,
        "probability": final_score / 100,
        "model_version": (
            ml_result["model_version"]
            if (ml_used and ml_result)
            else rule_result["model_version"]
        ),
        "scoring_mode": scoring_mode,
        "rule_score": int(rule_score),
        "ml_score": ml_score,
        "ml_info": ml_info,
        "ml_error": ml_error,
        "latency_ms": latency_ms,
    }

    # ── Step 7: Persist transaction ───────────────────────────────────────────
    saved_transaction = {
        **transaction_data,
        **response,
        "reasons": rule_reasons,
    }
    save_transaction(saved_transaction)

    # ── Step 8: Create alert for high-risk transactions ───────────────────────
    if final_score >= 60:
        create_alert(saved_transaction)

    return response