"""
ULB Credit Card Fraud Detection — Feature Engineering Contract
==============================================================

This module defines the EXACT feature order expected by the trained
XGBoost model (xgb_fraud_model.pkl).

The model was trained on the ULB Credit Card Fraud Detection dataset:
  - 283,726 rows (after deduplication)
  - 30 input features: Time, V1-V28, Amount
  - Binary target: Class (0 = legitimate, 1 = fraud)

CRITICAL — Do NOT:
  - Map application fields (velocity, isNewDevice, locationMismatch)
    to V1-V28. These are anonymised PCA components with no semantic
    equivalent in the application's transaction schema.
  - Generate random or constant values for V1-V28 in production.
  - Reorder or drop features; the scaler and model both depend on
    this exact 30-column structure.

The ML prediction layer is intentionally kept separate from the rule
engine.  The rule engine continues operating on application fields.
The ML model can only be invoked when a caller supplies a full,
legitimate 30-feature ULB-compatible vector.
"""

# -- Canonical feature order ---------------------------------------------------

ULB_FEATURE_NAMES: list = (
    ["Time"]
    + [f"V{i}" for i in range(1, 29)]  # V1 ... V28
    + ["Amount"]
)

ULB_FEATURE_COUNT: int = len(ULB_FEATURE_NAMES)  # must be 30


# -- Validation ----------------------------------------------------------------

class FeatureCompatibilityError(ValueError):
    """Raised when the supplied feature vector is incompatible with the model."""


def validate_ulb_feature_vector(features) -> None:
    """
    Validate that *features* is a list of exactly 30 numeric values.

    Raises:
        FeatureCompatibilityError -- if length is wrong or values are
            non-numeric.
    """
    if not isinstance(features, (list, tuple)):
        raise FeatureCompatibilityError(
            f"Feature vector must be a list or tuple, got {type(features).__name__}."
        )

    if len(features) != ULB_FEATURE_COUNT:
        raise FeatureCompatibilityError(
            f"Model expects {ULB_FEATURE_COUNT} features "
            f"({', '.join(ULB_FEATURE_NAMES)}), "
            f"but received {len(features)} values."
        )

    for i, v in enumerate(features):
        if not isinstance(v, (int, float)):
            raise FeatureCompatibilityError(
                f"Feature '{ULB_FEATURE_NAMES[i]}' (index {i}) must be numeric, "
                f"got {type(v).__name__}: {v!r}."
            )


def features_as_dict(values) -> dict:
    """Return a mapping of feature name -> value for the given vector."""
    validate_ulb_feature_vector(values)
    return dict(zip(ULB_FEATURE_NAMES, values))
