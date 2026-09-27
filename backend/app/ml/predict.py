"""
ULB XGBoost Fraud Detection — Prediction Service
=================================================

Loads the trained XGBoost model and scaler from disk once at module
import time.  Provides a single public function, predict_fraud(), that:

  1. Validates the input feature vector (30 values, exact ULB order).
  2. Scales features using the saved StandardScaler.
  3. Calls model.predict_proba() to obtain the fraud probability.
  4. Returns a structured dict with fraud_probability, ml_score, and
     model metadata.

Feature order (must match training):
  Time, V1, V2, ..., V28, Amount  (30 features total)

IMPORTANT:
  - This module does NOT accept application-level fields
    (velocity, isNewDevice, locationMismatch) as model inputs.
  - V1-V28 are anonymised PCA components from the ULB dataset.
    They have no semantic mapping to application transaction fields.
  - If the model or scaler files are missing or corrupted, this
    module sets _MODEL_AVAILABLE = False and predict_fraud() raises
    ModelNotAvailableError.  The rule engine then remains the sole
    live fraud scorer.

Loading notes:
  - XGBoost model was trained with XGBoost 2.0.x (Google Colab).
    We require xgboost==2.0.3 in requirements.txt for compatibility.
  - Scaler was trained with sklearn 1.6.1. Loaded via joblib to avoid
    scipy DLL issues on Windows with Application Control policies.
"""

import os
import json
import logging
import pickle
import time as _time
import warnings

import numpy as np
import joblib

from app.ml.feature_engineering import (
    ULB_FEATURE_NAMES,
    ULB_FEATURE_COUNT,
    FeatureCompatibilityError,
    validate_ulb_feature_vector,
)

logger = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────────────────────────

_ML_DIR = os.path.dirname(os.path.abspath(__file__))
_MODEL_PATH = os.path.join(_ML_DIR, "xgb_fraud_model.pkl")
_SCALER_PATH = os.path.join(_ML_DIR, "scaler.pkl")
_METRICS_PATH = os.path.join(_ML_DIR, "metrics.json")

# ── Load artefacts at module startup ─────────────────────────────────────────

_MODEL_AVAILABLE = False
_model = None
_scaler = None
_metrics: dict = {}
_load_error: str = ""


def _load_artifacts() -> None:
    global _MODEL_AVAILABLE, _model, _scaler, _metrics, _load_error

    # Load metrics.json (non-fatal if missing)
    if os.path.exists(_METRICS_PATH):
        try:
            with open(_METRICS_PATH, "r") as f:
                _metrics = json.load(f)
            logger.info("ML metrics loaded from metrics.json")
        except Exception as e:
            logger.warning("Could not load metrics.json: %s", e)

    # Load scaler via joblib (avoids scipy DLL path on Windows)
    if not os.path.exists(_SCALER_PATH):
        _load_error = f"Scaler file not found: {_SCALER_PATH}"
        logger.error(_load_error)
        return

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            _scaler = joblib.load(_SCALER_PATH)

        scaler_features = (
            int(_scaler.n_features_in_)
            if hasattr(_scaler, "n_features_in_")
            else len(_scaler.mean_)
        )
        if scaler_features != ULB_FEATURE_COUNT:
            _load_error = (
                f"Scaler was fitted on {scaler_features} features, "
                f"expected {ULB_FEATURE_COUNT}."
            )
            logger.error(_load_error)
            return
        logger.info("Scaler loaded via joblib (%d features).", scaler_features)
    except Exception as e:
        _load_error = f"Failed to load scaler: {e}"
        logger.error(_load_error)
        return

    # Load XGBoost model via pickle (requires xgboost==2.0.3 for compatibility)
    if not os.path.exists(_MODEL_PATH):
        _load_error = f"Model file not found: {_MODEL_PATH}"
        logger.error(_load_error)
        return

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            with open(_MODEL_PATH, "rb") as f:
                _model = pickle.load(f)

        # Verify feature count
        n_features = None
        if hasattr(_model, "n_features_in_"):
            n_features = int(_model.n_features_in_)
        elif hasattr(_model, "get_booster"):
            n_features = int(_model.get_booster().num_features())

        if n_features is not None and n_features != ULB_FEATURE_COUNT:
            _load_error = (
                f"Model expects {n_features} features, "
                f"but ULB contract defines {ULB_FEATURE_COUNT}."
            )
            logger.error(_load_error)
            return

        logger.info(
            "XGBoost model loaded. Type=%s, features=%s.",
            type(_model).__name__,
            n_features if n_features else "unknown",
        )
        _MODEL_AVAILABLE = True

    except Exception as e:
        _load_error = f"Failed to load XGBoost model: {e}"
        logger.error(_load_error)


_load_artifacts()


# ── Public API ────────────────────────────────────────────────────────────────

class ModelNotAvailableError(RuntimeError):
    """Raised when the XGBoost model could not be loaded."""


def is_model_available() -> bool:
    """Return True if the model and scaler loaded successfully."""
    return _MODEL_AVAILABLE


def get_load_error() -> str:
    """Return the error message recorded during artifact loading, or ''."""
    return _load_error


def get_model_info() -> dict:
    """
    Return static model metadata loaded from metrics.json plus
    runtime availability status.
    """
    return {
        "model_version": _metrics.get("model_version", "xgb-ulb-v1"),
        "model_type": _metrics.get("model_type", "XGBClassifier"),
        "training_status": _metrics.get("training_status", "trained"),
        "model_available": _MODEL_AVAILABLE,
        "load_error": _load_error or None,
        "n_features": ULB_FEATURE_COUNT,
        "feature_names": ULB_FEATURE_NAMES,
        "metrics": {
            "precision": _metrics.get("precision"),
            "recall": _metrics.get("recall"),
            "f1": _metrics.get("f1"),
            "roc_auc": _metrics.get("roc_auc"),
            "pr_auc": _metrics.get("pr_auc"),
        },
    }


def predict_fraud(features) -> dict:
    """
    Run XGBoost fraud prediction on a validated 30-feature ULB vector.

    Parameters
    ----------
    features : list or tuple of 30 floats
        Values in the canonical ULB order:
        Time, V1, V2, ..., V28, Amount

    Returns
    -------
    dict with keys:
        fraud_probability  float  — raw probability in [0, 1]
        ml_score           float  — fraud_probability * 100 (no precision loss)
        model_version      str
        latency_ms         float

    Raises
    ------
    ModelNotAvailableError
        If the model or scaler could not be loaded at startup.
    FeatureCompatibilityError
        If *features* has wrong length or non-numeric values.
    """
    if not _MODEL_AVAILABLE:
        raise ModelNotAvailableError(
            f"XGBoost model is not available. Reason: {_load_error}"
        )

    # Validate before any numpy work
    validate_ulb_feature_vector(features)

    t0 = _time.perf_counter()

    # Build (1, 30) numpy array in exact feature order
    X = np.array(features, dtype=np.float64).reshape(1, ULB_FEATURE_COUNT)

    # Scale — pass as numpy array to match how model was trained
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        X_scaled = _scaler.transform(X)

    # Predict
    proba = _model.predict_proba(X_scaled)  # shape (1, 2)
    fraud_probability = float(proba[0][1])

    latency_ms = (_time.perf_counter() - t0) * 1000

    return {
        "fraud_probability": fraud_probability,
        "ml_score": fraud_probability * 100,          # NOT rounded
        "model_version": _metrics.get("model_version", "xgb-ulb-v1"),
        "latency_ms": latency_ms,
    }
