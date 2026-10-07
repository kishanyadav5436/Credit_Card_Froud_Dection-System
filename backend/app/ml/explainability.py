"""
Explainable AI — Feature Contribution Layer
============================================

Generates human-readable explanations for fraud decisions using:

1. Rule-based reasons (from the rule engine) — always present.
2. RF model feature importances — present when RF model is available.
3. Combined narrative summary.

Design principle:
    - NO LLM makes the actual fraud decision.
    - This layer only EXPLAINS what the deterministic rule + ML engines decided.
    - If SHAP is available (optional dependency), it is used for instance-level
      attribution. Otherwise, model.feature_importances_ is used as fallback.
    - Falls back gracefully if nothing is available.

SHAP Integration (optional):
    shap is NOT added to requirements.txt to avoid a heavy mandatory dependency.
    If you install it manually (pip install shap), it will be used automatically.
    pip install shap
"""

import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

# ── SHAP optional import ───────────────────────────────────────────────────────

try:
    import shap as _shap
    _SHAP_AVAILABLE = True
    logger.info("SHAP is available — will use SHAP for instance-level explainability.")
except ImportError:
    _SHAP_AVAILABLE = False
    logger.info("SHAP not installed — using feature_importances_ fallback for explainability.")


# ── Threshold for flagging a feature as "important" in explanations ────────────

_IMPORTANCE_THRESHOLD = 0.05   # features with importance > 5% are reported


# ── Public API ─────────────────────────────────────────────────────────────────

def generate_ml_explanations(
    feature_vector: List[float],
    feature_names: List[str],
    feature_importances: dict,
    fraud_probability: float,
    rf_model=None,
    rf_scaler=None,
) -> List[dict]:
    """
    Generate ML-based reason items for the fraud explanation.

    Returns a list of reason dicts compatible with FraudReason schema:
        {"code": str, "label": str, "score": int}

    Parameters
    ----------
    feature_vector       : list of feature values (10 elements)
    feature_names        : list of feature names
    feature_importances  : dict {name: global_importance} from RF model
    fraud_probability    : float [0, 1] from RF prediction
    rf_model             : optional — RF model object (for SHAP if available)
    rf_scaler            : optional — scaler (for SHAP if available)
    """
    if not feature_importances:
        return []

    # Prefer SHAP instance-level explanations if available
    if _SHAP_AVAILABLE and rf_model is not None and rf_scaler is not None:
        try:
            return _shap_explanations(
                feature_vector, feature_names, fraud_probability,
                rf_model, rf_scaler
            )
        except Exception as e:
            logger.warning("SHAP explanation failed, falling back: %s", e)

    # Fallback: global feature importance explanations
    return _importance_explanations(
        feature_vector, feature_names, feature_importances, fraud_probability
    )


def _importance_explanations(
    feature_vector: List[float],
    feature_names: List[str],
    feature_importances: dict,
    fraud_probability: float,
) -> List[dict]:
    """
    Generate explanations based on global RF feature importances
    filtered by the actual feature values that are "suspicious".
    """
    reasons = []
    feature_dict = dict(zip(feature_names, feature_vector))

    # Only flag features whose importance is meaningful AND whose value is suspicious
    suspicious_checks = {
        "amount": lambda v: v >= 50_000,
        "velocity": lambda v: v >= 3,
        "is_new_device": lambda v: v >= 1,
        "location_mismatch": lambda v: v >= 1,
        "amount_deviation": lambda v: v >= 1.5,
        "transaction_frequency": lambda v: v >= 5,
        "merchant_risk": lambda v: v >= 0.5,
        "hour_of_day": lambda v: v <= 5 or v >= 23,
        "amount_log": lambda v: False,   # covered by amount
        "weekend": lambda v: False,      # low signal alone
    }

    human_labels = {
        "amount": "Transaction amount is significantly above normal",
        "velocity": "High transaction velocity — multiple transactions in short period",
        "is_new_device": "Transaction initiated from a new/unrecognised device",
        "location_mismatch": "Transaction location differs from customer's normal activity",
        "amount_deviation": "Transaction amount significantly deviates from customer's average",
        "transaction_frequency": "Unusually high transaction frequency in 24h window",
        "merchant_risk": "High-risk merchant category detected",
        "hour_of_day": "Transaction at unusual hour (overnight)",
    }

    reason_codes = {
        "amount": "ML_AMOUNT_ANOMALY",
        "velocity": "ML_VELOCITY_HIGH",
        "is_new_device": "ML_NEW_DEVICE",
        "location_mismatch": "ML_LOCATION_MISMATCH",
        "amount_deviation": "ML_AMOUNT_DEVIATION",
        "transaction_frequency": "ML_HIGH_FREQUENCY",
        "merchant_risk": "ML_MERCHANT_RISK",
        "hour_of_day": "ML_UNUSUAL_HOUR",
    }

    # Score contribution proportional to importance × fraud_probability
    for feat in feature_names:
        if feat not in suspicious_checks:
            continue
        if feat not in human_labels:
            continue

        val = feature_dict.get(feat, 0.0)
        importance = feature_importances.get(feat, 0.0)

        if importance < _IMPORTANCE_THRESHOLD:
            continue

        if suspicious_checks[feat](val):
            contribution = round(importance * fraud_probability * 100)
            reasons.append({
                "code": reason_codes[feat],
                "label": human_labels[feat],
                "score": contribution,
            })

    # Sort by contribution descending
    reasons.sort(key=lambda r: r["score"], reverse=True)

    return reasons


def _shap_explanations(
    feature_vector: List[float],
    feature_names: List[str],
    fraud_probability: float,
    rf_model,
    rf_scaler,
) -> List[dict]:
    """
    Generate SHAP-based instance-level explanations.
    Only called when shap is installed and RF model is available.
    """
    import numpy as np

    X = np.array(feature_vector, dtype=np.float64).reshape(1, -1)
    X_scaled = rf_scaler.transform(X)

    explainer = _shap.TreeExplainer(rf_model)
    shap_values = explainer.shap_values(X_scaled)

    # shap_values[1] = SHAP values for class=1 (fraud)
    fraud_shap = shap_values[1][0] if isinstance(shap_values, list) else shap_values[0]

    human_labels = {
        "amount": "Transaction amount is significantly above normal",
        "velocity": "High transaction velocity",
        "is_new_device": "Transaction from a new/unrecognised device",
        "location_mismatch": "Transaction location differs from customer norm",
        "amount_deviation": "Amount significantly deviates from customer average",
        "transaction_frequency": "Unusually high transaction frequency",
        "merchant_risk": "High-risk merchant detected",
        "hour_of_day": "Transaction at unusual overnight hour",
        "amount_log": "Log-scaled amount indicates high value",
        "weekend": "Weekend transaction (slightly elevated risk)",
    }

    reasons = []
    for i, feat in enumerate(feature_names):
        shap_val = float(fraud_shap[i])
        if shap_val > 0.02:  # only positive SHAP contributions
            label = human_labels.get(feat, f"Feature '{feat}' contributed to fraud score")
            reasons.append({
                "code": f"SHAP_{feat.upper()}",
                "label": label,
                "score": min(100, int(abs(shap_val) * 100)),
            })

    reasons.sort(key=lambda r: r["score"], reverse=True)
    return reasons[:6]  # top 6 SHAP reasons


def build_explanation_summary(
    final_score: float,
    decision: str,
    rule_reasons: List[dict],
    ml_reasons: List[dict],
    fraud_probability: float,
    scoring_mode: str,
) -> str:
    """
    Build a plain-text analyst-friendly explanation summary.

    This is a template-based summary (NOT LLM-generated).
    The LLM service (llm_service.py) may enhance this if available.
    """
    decision_verb = {
        "BLOCK": "blocked",
        "REVIEW": "flagged for review",
        "APPROVE": "approved",
    }.get(decision, decision.lower())

    lines = [
        f"Transaction {decision_verb} with risk score {int(final_score)}/100.",
        f"ML fraud probability: {fraud_probability:.1%}.",
        f"Scoring mode: {scoring_mode}.",
    ]

    all_reasons = rule_reasons + ml_reasons
    if all_reasons:
        lines.append("Risk factors identified:")
        for r in all_reasons[:5]:  # top 5
            lines.append(f"  • {r['label']}")

    return " ".join(lines[:3]) + (
        "\n" + "\n".join(lines[3:]) if len(lines) > 3 else ""
    )
