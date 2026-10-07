"""
Random Forest Fraud Model — Inference Service
==============================================

Loads the trained Random Forest classifier (rf-app-v1) and scaler from
disk once at module import time. Provides a single public function,
predict_rf_fraud(), that:

  1. Accepts a 10-element app-level feature vector.
  2. Scales features using the saved StandardScaler.
  3. Calls model.predict_proba() for fraud probability.
  4. Returns structured dict with fraud_probability, ml_score, feature
     importances, and model metadata.

Feature order (must match train_model.py and feature_engineering.py):
    amount, velocity, is_new_device, location_mismatch,
    amount_deviation, transaction_frequency, merchant_risk,
    amount_log, hour_of_day, weekend

IMPORTANT:
  - This model runs on EVERY fraud/check request (no special vector needed).
  - If model files are missing, _RF_MODEL_AVAILABLE = False and
    predict_rf_fraud() returns a safe fallback (0 probability).
  - This is the app-level ML layer. The XGBoost ULB model (predict.py)
    remains the premium scoring path when ulb_features are supplied.

SYNTHETIC DATA WARNING:
  This model was trained on synthetically generated data for demo purposes.
  It does NOT reflect real banking fraud statistics.
"""

import json
import logging
import os
import time as _time
import warnings

import numpy as np
import joblib

logger = logging.getLogger(__name__)

# ── Paths ──────────────────────────────────────────────────────────────────────
# The RF model lives in backend/ml/ (one level up from backend/app/ml/).
# We try multiple candidate paths in order to handle different working
# directories (pytest, uvicorn, direct script, installed package).

_THIS_FILE = os.path.abspath(__file__)            # .../backend/app/ml/model.py
_APP_ML_DIR = os.path.dirname(_THIS_FILE)         # .../backend/app/ml
_APP_DIR = os.path.dirname(_APP_ML_DIR)           # .../backend/app
_BACKEND_DIR = os.path.dirname(_APP_DIR)          # .../backend

# Candidate directories for rf_model.pkl (tried in order)
_RF_DIR_CANDIDATES = [
    os.path.join(_BACKEND_DIR, "ml"),             # absolute: backend/ml  ← primary
    os.path.join(os.getcwd(), "ml"),              # CWD-relative: ./ml
    os.path.join(os.getcwd(), "backend", "ml"),   # project-root: ./backend/ml
]


def _find_rf_dir() -> str:
    """Return the first candidate directory that contains rf_model.pkl."""
    for candidate in _RF_DIR_CANDIDATES:
        if os.path.exists(os.path.join(candidate, "rf_model.pkl")):
            return candidate
    # Default to absolute path even if not found (error will be reported at load)
    return _RF_DIR_CANDIDATES[0]


_RF_DIR = _find_rf_dir()
_RF_MODEL_PATH = os.path.join(_RF_DIR, "rf_model.pkl")
_RF_SCALER_PATH = os.path.join(_RF_DIR, "rf_scaler.pkl")
_RF_METRICS_PATH = os.path.join(_RF_DIR, "rf_metrics.json")

# Feature names — must match train_model.py
RF_FEATURE_NAMES = [
    "amount",
    "velocity",
    "is_new_device",
    "location_mismatch",
    "amount_deviation",
    "transaction_frequency",
    "merchant_risk",
    "amount_log",
    "hour_of_day",
    "weekend",
]
RF_FEATURE_COUNT = len(RF_FEATURE_NAMES)

# ── Artifact Loading ───────────────────────────────────────────────────────────

_RF_MODEL_AVAILABLE = False
_rf_model = None
_rf_scaler = None
_rf_metrics: dict = {}
_rf_load_error: str = ""


def _load_rf_artifacts() -> None:
    global _RF_MODEL_AVAILABLE, _rf_model, _rf_scaler, _rf_metrics, _rf_load_error

    # Load metrics (non-fatal)
    if os.path.exists(_RF_METRICS_PATH):
        try:
            with open(_RF_METRICS_PATH, "r") as f:
                _rf_metrics = json.load(f)
            logger.info("RF metrics loaded from rf_metrics.json")
        except Exception as e:
            logger.warning("Could not load rf_metrics.json: %s", e)

    # Load scaler
    if not os.path.exists(_RF_SCALER_PATH):
        _rf_load_error = f"RF scaler not found: {_RF_SCALER_PATH}. Run: python ml/train_model.py"
        logger.warning(_rf_load_error)
        return

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            _rf_scaler = joblib.load(_RF_SCALER_PATH)

        n_feat = (
            int(_rf_scaler.n_features_in_)
            if hasattr(_rf_scaler, "n_features_in_")
            else len(_rf_scaler.mean_)
        )
        if n_feat != RF_FEATURE_COUNT:
            _rf_load_error = (
                f"RF scaler expects {n_feat} features, "
                f"but RF_FEATURE_COUNT={RF_FEATURE_COUNT}."
            )
            logger.error(_rf_load_error)
            return

        logger.info("RF scaler loaded (%d features).", n_feat)
    except Exception as e:
        _rf_load_error = f"Failed to load RF scaler: {e}"
        logger.error(_rf_load_error)
        return

    # Load RF model
    if not os.path.exists(_RF_MODEL_PATH):
        _rf_load_error = f"RF model not found: {_RF_MODEL_PATH}. Run: python ml/train_model.py"
        logger.warning(_rf_load_error)
        return

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            _rf_model = joblib.load(_RF_MODEL_PATH)

        logger.info(
            "RF model loaded. Type=%s, estimators=%s.",
            type(_rf_model).__name__,
            getattr(_rf_model, "n_estimators", "?"),
        )
        _RF_MODEL_AVAILABLE = True

    except Exception as e:
        _rf_load_error = f"Failed to load RF model: {e}"
        logger.error(_rf_load_error)


_load_rf_artifacts()


# ── Public API ─────────────────────────────────────────────────────────────────

def is_rf_model_available() -> bool:
    """Return True if the RF model loaded successfully."""
    return _RF_MODEL_AVAILABLE


def get_rf_load_error() -> str:
    """Return load error message or ''."""
    return _rf_load_error


def get_rf_model_info() -> dict:
    """Return RF model metadata."""
    return {
        "model_version": _rf_metrics.get("model_version", "rf-app-v1"),
        "model_type": _rf_metrics.get("model_type", "RandomForestClassifier"),
        "training_status": _rf_metrics.get("training_status", "not_trained"),
        "dataset": _rf_metrics.get("dataset", "SYNTHETIC — FOR DEMO ONLY"),
        "model_available": _RF_MODEL_AVAILABLE,
        "load_error": _rf_load_error or None,
        "n_features": RF_FEATURE_COUNT,
        "feature_names": RF_FEATURE_NAMES,
        "metrics": {
            "precision": _rf_metrics.get("precision"),
            "recall": _rf_metrics.get("recall"),
            "f1": _rf_metrics.get("f1"),
            "roc_auc": _rf_metrics.get("roc_auc"),
            "pr_auc": _rf_metrics.get("pr_auc"),
        },
    }


def predict_rf_fraud(features: list) -> dict:
    """
    Run RF fraud prediction on a 10-element app-level feature vector.

    Parameters
    ----------
    features : list of 10 floats
        In order: amount, velocity, is_new_device, location_mismatch,
        amount_deviation, transaction_frequency, merchant_risk,
        amount_log, hour_of_day, weekend

    Returns
    -------
    dict with keys:
        fraud_probability   float   — raw probability [0, 1]
        ml_score            float   — fraud_probability * 100
        feature_importances dict    — {feature_name: importance_score}
        model_version       str
        latency_ms          float
        model_available     bool
        fallback            bool    — True if model unavailable (returns 0.0)
    """
    if not _RF_MODEL_AVAILABLE:
        # Safe fallback — rule engine takes over entirely
        return {
            "fraud_probability": 0.0,
            "ml_score": 0.0,
            "feature_importances": {},
            "model_version": "rf-app-v1",
            "latency_ms": 0.0,
            "model_available": False,
            "fallback": True,
            "fallback_reason": _rf_load_error or "RF model not loaded",
        }

    if len(features) != RF_FEATURE_COUNT:
        return {
            "fraud_probability": 0.0,
            "ml_score": 0.0,
            "feature_importances": {},
            "model_version": "rf-app-v1",
            "latency_ms": 0.0,
            "model_available": True,
            "fallback": True,
            "fallback_reason": f"Expected {RF_FEATURE_COUNT} features, got {len(features)}",
        }

    t0 = _time.perf_counter()

    X = np.array(features, dtype=np.float64).reshape(1, RF_FEATURE_COUNT)

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        X_scaled = _rf_scaler.transform(X)

    proba = _rf_model.predict_proba(X_scaled)  # shape (1, 2)
    fraud_probability = float(proba[0][1])

    # Feature importances from the RF model
    importances = _rf_model.feature_importances_  # array of shape (n_features,)
    feature_importances = {
        name: round(float(imp), 4)
        for name, imp in zip(RF_FEATURE_NAMES, importances)
    }

    latency_ms = (_time.perf_counter() - t0) * 1000

    return {
        "fraud_probability": fraud_probability,
        "ml_score": fraud_probability * 100,
        "feature_importances": feature_importances,
        "model_version": _rf_metrics.get("model_version", "rf-app-v1"),
        "latency_ms": latency_ms,
        "model_available": True,
        "fallback": False,
    }
