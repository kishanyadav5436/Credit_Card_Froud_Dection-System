"""
Fraud Check Endpoint  —  POST /api/v1/fraud/check
==================================================

HYBRID AI FRAUD DETECTION PIPELINE (Phase 7)

Step 1  : Validate transaction (Pydantic schema)
Step 2  : Extract app-level features (feature_engineering.py)
Step 3  : Run Rule Engine (fraud_engine.py) — always runs
Step 4  : Run RF ML Model (ml/model.py) — always runs (fallback if unavailable)
Step 5  : Calculate combined risk score
           • rf_hybrid  : rule_score * RULE_WEIGHT + rf_score * ML_WEIGHT
           • full_hybrid: rule_score * RULE_WEIGHT + xgb_score * ML_WEIGHT
             (when ulb_features are also supplied)
Step 6  : Apply decision thresholds (decision_engine.py)
           0 – 30  → APPROVE
           30 – 70 → REVIEW
           70 – 100 → BLOCK
Step 7  : Generate reason codes (rule + ML explanations)
Step 8  : Generate XAI explanation (explainability.py)
Step 9  : Optionally call LLM for analyst narrative (llm_service.py)
Step 10 : Save transaction to DB (transaction_service.py)
Step 11 : Create alert for high-risk transactions (alert_service.py)
Step 12 : Return response

IMPORTANT:
  - Rule engine + ML model produce the actual fraud decision.
  - LLM (if used) ONLY generates a human-readable explanation.
  - ulb_features are optional — for XGBoost premium path.
  - RF model runs automatically on every request.
"""

import time

from fastapi import APIRouter

from app.schemas.fraud import (
    FraudCheckRequest,
    FraudCheckResponse,
)

from app.services.fraud_engine import calculate_fraud_risk
from app.services.feature_engineering import extract_features
from app.services.decision_engine import apply_decision
from app.services.transaction_service import save_transaction
from app.services.alert_service import create_alert
from app.services.llm_service import generate_llm_explanation, is_llm_available

from app.ml.model import predict_rf_fraud, is_rf_model_available, RF_FEATURE_NAMES
from app.ml.predict import (
    predict_fraud as predict_xgb_fraud,
    is_model_available as is_xgb_available,
    ModelNotAvailableError,
)
from app.ml.feature_engineering import FeatureCompatibilityError
from app.ml.explainability import generate_ml_explanations, build_explanation_summary

from app.core.config import settings


router = APIRouter(
    prefix="/api/v1/fraud",
    tags=["Fraud Detection"],
)


def _apply_decision_threshold(score: float) -> tuple:
    """
    Map a 0-100 score to (decision, severity).
    Kept for backward-compat with existing tests that import this directly.
    Delegates to decision_engine.apply_decision().
    """
    return apply_decision(score)


@router.post(
    "/check",
    response_model=FraudCheckResponse,
)
def check_fraud(
    transaction: FraudCheckRequest,
):
    start_time = time.perf_counter()

    transaction_data = transaction.model_dump()

    # ── Step 3: Rule Engine (always runs) ─────────────────────────────────────
    rule_result = calculate_fraud_risk(transaction_data)
    rule_score = float(rule_result["score"])
    rule_reasons = rule_result["reasons"]

    # ── Step 2: Extract app-level features ────────────────────────────────────
    feature_vector = extract_features(transaction_data)

    # ── Step 4a: RF ML Model (always runs) ────────────────────────────────────
    rf_result = predict_rf_fraud(feature_vector)
    rf_used = rf_result.get("model_available", False)
    rf_score = rf_result["ml_score"]    # 0-100; 0.0 if fallback

    # ── Step 4b: XGBoost ULB Model (only when ulb_features supplied) ──────────
    xgb_result = None
    xgb_used = False
    xgb_error = None

    if transaction.ulb_features is not None:
        if is_xgb_available():
            try:
                xgb_result = predict_xgb_fraud(transaction.ulb_features)
                xgb_used = True
            except (ModelNotAvailableError, FeatureCompatibilityError) as e:
                xgb_error = str(e)
        else:
            xgb_error = "XGBoost model is not loaded."

    # ── Step 5: Compute final score ────────────────────────────────────────────
    if xgb_used and xgb_result is not None:
        # Full hybrid: rule + XGBoost (premium path — ulb_features supplied)
        # Use XGBoost score as the ML signal (overrides RF when available)
        ml_score_for_hybrid = xgb_result["ml_score"]
        scoring_mode = "full_hybrid"
    elif rf_used:
        # RF hybrid: rule + Random Forest (standard path)
        ml_score_for_hybrid = rf_score
        scoring_mode = "rf_hybrid"
    else:
        # Rule only fallback — both ML models unavailable
        ml_score_for_hybrid = 0.0
        scoring_mode = "rule_only"

    raw_hybrid = (
        rule_score * settings.RULE_WEIGHT
        + ml_score_for_hybrid * settings.ML_WEIGHT
    )
    # Safety guarantee: final score is never lower than the rule score.
    # This ensures that deterministic rule triggers (e.g. all 4 rules fired → 100)
    # cannot be diluted by ML into a lower risk category.
    # ML can only ELEVATE risk, never SUPPRESS a rule-engine decision.
    raw_final = max(raw_hybrid, rule_score)
    final_score = float(max(0.0, min(100.0, raw_final)))

    # ── Step 6: Apply decision threshold ──────────────────────────────────────
    decision, severity = apply_decision(final_score)

    latency_ms = int((time.perf_counter() - start_time) * 1000)

    # ── Step 7: Generate ML explanations ──────────────────────────────────────
    ml_reasons = generate_ml_explanations(
        feature_vector=feature_vector,
        feature_names=RF_FEATURE_NAMES,
        feature_importances=rf_result.get("feature_importances", {}),
        fraud_probability=rf_result["fraud_probability"],
    )

    # Combine rule + ML reasons (deduplicate by code)
    seen_codes = {r["code"] for r in rule_reasons}
    combined_reasons = list(rule_reasons)
    for r in ml_reasons:
        if r["code"] not in seen_codes:
            combined_reasons.append(r)
            seen_codes.add(r["code"])

    all_reason_codes = [r["code"] for r in combined_reasons]

    # ── Step 8: Template-based explanation ────────────────────────────────────
    explanation_text = build_explanation_summary(
        final_score=final_score,
        decision=decision,
        rule_reasons=rule_reasons,
        ml_reasons=ml_reasons,
        fraud_probability=rf_result["fraud_probability"],
        scoring_mode=scoring_mode,
    )
    explanation_source = "template"

    # ── Step 9: Optional LLM explanation ──────────────────────────────────────
    if is_llm_available():
        try:
            llm_result = generate_llm_explanation(
                risk_score=int(final_score),
                decision=decision,
                severity=severity,
                reason_codes=all_reason_codes,
                reasons=combined_reasons,
                fraud_probability=rf_result["fraud_probability"],
                scoring_mode=scoring_mode,
                rule_score=int(rule_score),
                rf_score=rf_score if rf_used else None,
            )
            if llm_result["available"]:
                explanation_text = llm_result["explanation"]
                explanation_source = llm_result["source"]
        except Exception:
            pass  # LLM failure is non-fatal — keep template explanation

    # ── Build result blocks ────────────────────────────────────────────────────
    rf_info = {
        "fraud_probability": rf_result["fraud_probability"],
        "rf_score": rf_score,
        "model_version": rf_result.get("model_version", "rf-app-v1"),
        "feature_importances": rf_result.get("feature_importances", {}),
        "fallback": rf_result.get("fallback", False),
        "note": (
            "Trained on synthetic data for demo purposes. "
            "NOT a real banking fraud model."
        ),
    } if rf_used else None

    xgb_info = None
    if xgb_used and xgb_result is not None:
        xgb_info = {
            "fraud_probability": xgb_result["fraud_probability"],
            "ml_score": xgb_result["ml_score"],
            "model_version": xgb_result["model_version"],
            "note": (
                "V1-V28 are anonymised PCA components from the ULB dataset. "
                "They have no semantic mapping to application transaction fields."
            ),
        }

    # Model version in response: XGBoost if used, else RF if used, else rule engine
    if xgb_used and xgb_result:
        model_version = xgb_result["model_version"]
    elif rf_used:
        model_version = rf_result.get("model_version", "rf-app-v1")
    else:
        model_version = rule_result["model_version"]

    # ── Step 10: Build response ───────────────────────────────────────────────
    response = {
        "transaction_id": transaction.transaction_id,
        "risk_score": int(final_score),
        "decision": decision,
        "severity": severity,
        "reason_codes": all_reason_codes,
        "reasons": combined_reasons,
        "probability": round(final_score / 100, 4),
        "model_version": model_version,
        "scoring_mode": scoring_mode,
        "rule_score": int(rule_score),
        "ml_score": round(ml_score_for_hybrid, 2) if scoring_mode != "rule_only" else None,
        "rf_score": round(rf_score, 2) if rf_used else None,
        "rf_info": rf_info,
        "ml_info": xgb_info,
        "ml_error": xgb_error,
        "explanation": explanation_text,
        "explanation_source": explanation_source,
        "latency_ms": latency_ms,
    }

    # ── Step 11: Persist transaction ──────────────────────────────────────────
    saved_transaction = {
        **transaction_data,
        **response,
        "reasons": combined_reasons,
    }
    save_transaction(saved_transaction)

    # ── Step 12: Create alert for high-risk transactions ──────────────────────
    if final_score >= settings.ALERT_THRESHOLD:
        create_alert(saved_transaction)

    return response