"""
App-Level Feature Engineering
==============================

Extracts application-level features from a transaction dict for the
Random Forest fraud detection model (rf-app-v1).

These features are semantically interpretable — unlike the ULB XGBoost
model's V1-V28 PCA components, every feature here maps directly to a
real transaction attribute.

Feature Set (10 features — must match train_model.py):
    1. amount               : Transaction amount (INR)
    2. velocity             : Transactions in last hour (int)
    3. is_new_device        : 1 if new device, else 0
    4. location_mismatch    : 1 if location differs, else 0
    5. amount_deviation     : (amount - avg) / (avg + 1)  — deviation from customer norm
    6. transaction_frequency: Rolling 24h transaction count
    7. merchant_risk        : Merchant risk score 0.0–1.0
    8. amount_log           : log1p(amount) — stabilises skewed distribution
    9. hour_of_day          : Hour extracted from current time (0–23)
   10. weekend              : 1 if Sat/Sun, else 0

Usage:
    from app.services.feature_engineering import extract_features, APP_FEATURE_NAMES

    feature_vector = extract_features(transaction_dict)
    # Returns list of 10 floats in the order above.
"""

import math
from datetime import datetime, timezone
from typing import List

# ── Feature contract ──────────────────────────────────────────────────────────

APP_FEATURE_NAMES: List[str] = [
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

APP_FEATURE_COUNT: int = len(APP_FEATURE_NAMES)  # must be 10


# ── Public API ─────────────────────────────────────────────────────────────────

def extract_features(transaction: dict) -> List[float]:
    """
    Extract and return a 10-element feature vector from a transaction dict.

    Parameters
    ----------
    transaction : dict
        Must contain at minimum:
            amount          float
        Optionally:
            velocity        int    (default 0)
            isNewDevice     bool   (default False)
            locationMismatch bool  (default False)
            customer_avg_amount float (default 0.0) — caller provides if known
            transaction_frequency int (default 1)
            merchant_risk   float  (default 0.1)

    Returns
    -------
    list of 10 floats in APP_FEATURE_NAMES order.
    """
    amount = float(transaction.get("amount", 0.0))
    velocity = float(transaction.get("velocity", 0))
    is_new_device = 1.0 if transaction.get("isNewDevice", False) else 0.0
    location_mismatch = 1.0 if transaction.get("locationMismatch", False) else 0.0

    # Amount deviation from customer average
    customer_avg = float(transaction.get("customer_avg_amount", 0.0))
    amount_deviation = (amount - customer_avg) / (customer_avg + 1.0)

    # Transaction frequency (rolling 24h)
    transaction_frequency = float(transaction.get("transaction_frequency", 1))

    # Merchant risk score
    merchant_risk = float(transaction.get("merchant_risk", 0.1))
    merchant_risk = max(0.0, min(1.0, merchant_risk))

    # Log-scaled amount
    amount_log = math.log1p(amount)

    # Time features
    now = datetime.now(timezone.utc)
    hour_of_day = float(now.hour)
    weekend = 1.0 if now.weekday() >= 5 else 0.0

    return [
        amount,
        velocity,
        is_new_device,
        location_mismatch,
        amount_deviation,
        transaction_frequency,
        merchant_risk,
        amount_log,
        hour_of_day,
        weekend,
    ]


def features_as_dict(feature_vector: List[float]) -> dict:
    """Map a 10-element feature vector back to a named dict."""
    if len(feature_vector) != APP_FEATURE_COUNT:
        raise ValueError(
            f"Expected {APP_FEATURE_COUNT} features, got {len(feature_vector)}"
        )
    return dict(zip(APP_FEATURE_NAMES, feature_vector))