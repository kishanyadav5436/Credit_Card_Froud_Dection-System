"""
Random Forest Fraud Detection — Training Pipeline
===================================================

IMPORTANT — SYNTHETIC DATA NOTICE:
    This training script uses synthetically generated data for
    development and demonstration purposes ONLY.

    This data does NOT represent real banking fraud patterns.
    It is designed solely to produce a working Random Forest model
    that operates on application-level features (amount, velocity,
    isNewDevice, locationMismatch, etc.).

    In production, replace this with a real labeled fraud dataset.

Feature Set (app-level — semantically interpretable):
    - amount                      : Transaction amount (INR)
    - velocity                    : Number of transactions in last hour
    - is_new_device               : 1 if device is new, 0 otherwise
    - location_mismatch           : 1 if location differs from norm, 0 otherwise
    - amount_deviation            : (amount - customer_avg_amount) / (customer_avg_amount + 1)
    - transaction_frequency       : Rolling count of transactions in 24h
    - merchant_risk               : Merchant risk score 0.0–1.0
    - amount_log                  : log1p(amount) — stabilises skewed distribution
    - hour_of_day                 : 0–23 (night-time transactions higher risk)
    - weekend                     : 1 if Saturday/Sunday, 0 otherwise

Outputs:
    - backend/ml/rf_model.pkl     : Trained RandomForestClassifier
    - backend/ml/rf_scaler.pkl    : StandardScaler fitted on training data
    - backend/ml/rf_metrics.json  : Training & evaluation metrics

Run from backend/:
    python -m ml.train_model
    OR
    cd backend && python ml/train_model.py
"""

import json
import logging
import os
import sys
import warnings

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    average_precision_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────────────────────────

_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_OUT_DIR = _SCRIPT_DIR  # backend/ml/

MODEL_PATH = os.path.join(_OUT_DIR, "rf_model.pkl")
SCALER_PATH = os.path.join(_OUT_DIR, "rf_scaler.pkl")
METRICS_PATH = os.path.join(_OUT_DIR, "rf_metrics.json")

# ── Feature names (must match feature_engineering.py) ─────────────────────────

FEATURE_NAMES = [
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

# ── Reproducible seed ─────────────────────────────────────────────────────────

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)


# ── Synthetic Data Generation ──────────────────────────────────────────────────

def generate_synthetic_dataset(n_samples: int = 50_000) -> tuple:
    """
    Generate a synthetic fraud detection dataset.

    SYNTHETIC DATA — FOR DEVELOPMENT / DEMO ONLY.
    Does NOT represent real banking fraud patterns.

    Distribution:
        - ~3% fraud (class=1), ~97% legitimate (class=0)
        Reflects realistic class imbalance in payment fraud.

    Fraud signals embedded:
        - High amount (>= 50,000)
        - High velocity (>= 3)
        - New device
        - Location mismatch
        - High merchant risk
        - Unusual hours (0-5 AM)
        - Large amount deviation from customer average

    Returns:
        X  : np.ndarray shape (n_samples, 10)
        y  : np.ndarray shape (n_samples,)  — 0=legitimate, 1=fraud
    """
    logger.info(
        "[SYNTHETIC DATA] Generating %d samples for training. "
        "THIS IS NOT REAL BANKING DATA.",
        n_samples,
    )

    n_fraud = int(n_samples * 0.03)
    n_legit = n_samples - n_fraud

    # ── Legitimate transactions ────────────────────────────────────────────────
    legit_amount = np.random.lognormal(mean=8.5, sigma=1.2, size=n_legit)  # ~5k avg
    legit_amount = np.clip(legit_amount, 10, 200_000)

    legit = {
        "amount": legit_amount,
        "velocity": np.random.choice([0, 1, 2, 3], p=[0.5, 0.3, 0.15, 0.05], size=n_legit),
        "is_new_device": np.random.choice([0, 1], p=[0.92, 0.08], size=n_legit),
        "location_mismatch": np.random.choice([0, 1], p=[0.95, 0.05], size=n_legit),
        "amount_deviation": np.random.normal(0.0, 0.3, size=n_legit),
        "transaction_frequency": np.random.poisson(2, size=n_legit),
        "merchant_risk": np.random.beta(1.5, 10, size=n_legit),  # Mostly low risk
        "hour_of_day": np.random.choice(range(24), p=_daytime_weights(), size=n_legit),
        "weekend": np.random.choice([0, 1], p=[0.72, 0.28], size=n_legit),
    }
    legit["amount_log"] = np.log1p(legit["amount"])

    # ── Fraudulent transactions ────────────────────────────────────────────────
    fraud_amount = np.random.lognormal(mean=10.5, sigma=1.5, size=n_fraud)  # Higher
    fraud_amount = np.clip(fraud_amount, 5_000, 500_000)

    fraud = {
        "amount": fraud_amount,
        "velocity": np.random.choice([0, 1, 2, 3, 4, 5], p=[0.05, 0.1, 0.2, 0.25, 0.25, 0.15], size=n_fraud),
        "is_new_device": np.random.choice([0, 1], p=[0.25, 0.75], size=n_fraud),
        "location_mismatch": np.random.choice([0, 1], p=[0.2, 0.8], size=n_fraud),
        "amount_deviation": np.random.normal(2.5, 1.5, size=n_fraud),  # High deviation
        "transaction_frequency": np.random.poisson(6, size=n_fraud),
        "merchant_risk": np.random.beta(5, 2, size=n_fraud),  # Mostly high risk
        "hour_of_day": np.random.choice(range(24), p=_nighttime_weights(), size=n_fraud),
        "weekend": np.random.choice([0, 1], p=[0.45, 0.55], size=n_fraud),
    }
    fraud["amount_log"] = np.log1p(fraud["amount"])

    # ── Stack into arrays ──────────────────────────────────────────────────────
    X_legit = np.column_stack([legit[f] for f in FEATURE_NAMES])
    X_fraud = np.column_stack([fraud[f] for f in FEATURE_NAMES])
    y_legit = np.zeros(n_legit, dtype=int)
    y_fraud = np.ones(n_fraud, dtype=int)

    X = np.vstack([X_legit, X_fraud])
    y = np.concatenate([y_legit, y_fraud])

    # Shuffle
    idx = np.random.permutation(len(y))
    X, y = X[idx], y[idx]

    logger.info(
        "Dataset: %d total | %d legitimate | %d fraud (%.1f%% fraud rate)",
        len(y),
        n_legit,
        n_fraud,
        n_fraud / len(y) * 100,
    )

    return X, y


def _daytime_weights():
    """Higher probability during business hours (8-22)."""
    w = np.ones(24)
    w[0:6] = 0.5   # Night: lower
    w[8:22] = 2.0  # Day: higher
    return w / w.sum()


def _nighttime_weights():
    """Higher probability at night (0-6 AM) for fraud."""
    w = np.ones(24)
    w[0:6] = 3.5   # Night: much higher for fraud
    w[8:18] = 0.8
    return w / w.sum()


# ── Training ───────────────────────────────────────────────────────────────────

def train(n_samples: int = 50_000):
    """
    Full training pipeline:
    1. Generate synthetic dataset
    2. Split train/test (80/20)
    3. Scale features
    4. Train RandomForestClassifier
    5. Evaluate
    6. Save model, scaler, and metrics
    """

    logger.info("=" * 60)
    logger.info("SYNTHETIC DATA — FOR DEVELOPMENT/DEMO ONLY")
    logger.info("NOT real banking fraud data")
    logger.info("=" * 60)

    # Step 1: Data
    X, y = generate_synthetic_dataset(n_samples)

    # Step 2: Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=y,
    )
    logger.info(
        "Train: %d samples | Test: %d samples",
        len(X_train),
        len(X_test),
    )

    # Step 3: Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Step 4: Train
    logger.info("Training RandomForestClassifier (n_estimators=200)...")
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight="balanced",  # Handle class imbalance
            random_state=RANDOM_SEED,
            n_jobs=-1,
        )
        model.fit(X_train_scaled, y_train)
    logger.info("Training complete.")

    # Step 5: Evaluate
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_proba)
    pr_auc = average_precision_score(y_test, y_proba)

    logger.info("Evaluation Results:")
    logger.info("  Precision : %.4f", precision)
    logger.info("  Recall    : %.4f", recall)
    logger.info("  F1        : %.4f", f1)
    logger.info("  ROC-AUC   : %.4f", roc_auc)
    logger.info("  PR-AUC    : %.4f", pr_auc)
    logger.info("\n%s", classification_report(y_test, y_pred, target_names=["Legitimate", "Fraud"]))

    # Step 6: Save
    os.makedirs(_OUT_DIR, exist_ok=True)

    joblib.dump(model, MODEL_PATH)
    logger.info("Model saved to: %s", MODEL_PATH)

    joblib.dump(scaler, SCALER_PATH)
    logger.info("Scaler saved to: %s", SCALER_PATH)

    metrics = {
        "model_version": "rf-app-v1",
        "model_type": "RandomForestClassifier",
        "training_status": "trained",
        "dataset": "SYNTHETIC — FOR DEVELOPMENT/DEMO ONLY. NOT real banking data.",
        "n_samples": n_samples,
        "n_features": len(FEATURE_NAMES),
        "feature_names": FEATURE_NAMES,
        "n_estimators": 200,
        "max_depth": 12,
        "class_weight": "balanced",
        "random_seed": RANDOM_SEED,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "trained_at": __import__("datetime").date.today().isoformat(),
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    logger.info("Metrics saved to: %s", METRICS_PATH)
    logger.info("Training pipeline complete.")

    return model, scaler, metrics


# ── Entry Point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Support running from backend/ directory
    backend_dir = os.path.dirname(_SCRIPT_DIR)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    train()
