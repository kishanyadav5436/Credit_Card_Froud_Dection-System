MODEL_STATUS = {
    "model_name": "Fraud Detection Model",
    "version": "fraud-v1.0",
    "status": "Production",
    "last_updated": "2026-09-17",

    "performance": {
        "precision": 94.2,
        "recall": 91.8,
        "f1_score": 93.0,
        "roc_auc": 97.1,
        "false_positive_rate": 2.8,
    },

    "predictions": {
        "total": 0,
        "fraud_detected": 0,
        "legitimate": 0,
    },

    "drift": {
        "feature_drift": 4.2,
        "model_drift": 1.8,
        "threshold": 10.0,
        "status": "Healthy",
    },

    "feature_drift": [
        {
            "feature": "transaction_amount",
            "drift": 3.2,
            "status": "Healthy",
        },
        {
            "feature": "device_age",
            "drift": 6.8,
            "status": "Healthy",
        },
        {
            "feature": "transaction_velocity",
            "drift": 12.4,
            "status": "Warning",
        },
        {
            "feature": "location_distance",
            "drift": 4.7,
            "status": "Healthy",
        },
        {
            "feature": "merchant_risk",
            "drift": 8.1,
            "status": "Healthy",
        },
    ],

    "versions": [
        {
            "version": "fraud-v1.0",
            "deployed_at": "2026-09-17",
            "status": "Production",
            "accuracy": 96.4,
        }
    ],
}


def get_model_status():
    return MODEL_STATUS