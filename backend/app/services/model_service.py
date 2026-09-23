from sqlalchemy import text

from app.database.connection import SessionLocal


MODEL_METADATA = {
    "model_name": "Fraud Detection Model",
    "version": "fraud-engine-v1",
    "status": "Production",
    "last_updated": "2026-09-17",

    "performance": {
        "precision": 94.2,
        "recall": 91.8,
        "f1_score": 93.0,
        "roc_auc": 97.1,
        "false_positive_rate": 2.8,
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
            "version": "fraud-engine-v1",
            "deployed_at": "2026-09-17",
            "status": "Production",
            "accuracy": 96.4,
        }
    ],
}


def _get_prediction_stats():
    """Query real prediction counts from the transactions table."""
    db = SessionLocal()

    try:
        row = db.execute(
            text("""
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (
                        WHERE decision = 'BLOCK'
                    ) AS fraud_detected,
                    COUNT(*) FILTER (
                        WHERE decision = 'APPROVE'
                    ) AS legitimate,
                    COUNT(*) FILTER (
                        WHERE decision = 'REVIEW'
                    ) AS review,
                    ROUND(AVG(risk_score), 1) AS avg_risk,
                    ROUND(AVG(latency_ms), 1) AS avg_latency,
                    PERCENTILE_CONT(0.95) WITHIN GROUP (
                        ORDER BY latency_ms
                    ) AS p95_latency
                FROM transactions
            """)
        ).mappings().first()

        if not row:
            return {
                "total": 0,
                "fraud_detected": 0,
                "legitimate": 0,
                "review": 0,
                "avg_risk": 0,
                "avg_latency": 0,
                "p95_latency": 0,
            }

        return {
            "total": int(row["total"] or 0),
            "fraud_detected": int(row["fraud_detected"] or 0),
            "legitimate": int(row["legitimate"] or 0),
            "review": int(row["review"] or 0),
            "avg_risk": float(row["avg_risk"] or 0),
            "avg_latency": float(row["avg_latency"] or 0),
            "p95_latency": float(row["p95_latency"] or 0),
        }

    except Exception:
        return {
            "total": 0,
            "fraud_detected": 0,
            "legitimate": 0,
            "review": 0,
            "avg_risk": 0,
            "avg_latency": 0,
            "p95_latency": 0,
        }

    finally:
        db.close()


def get_model_status():
    """Return model status with real prediction counts from DB."""
    stats = _get_prediction_stats()

    return {
        **MODEL_METADATA,
        "predictions": {
            "total": stats["total"],
            "fraud_detected": stats["fraud_detected"],
            "legitimate": stats["legitimate"],
            "review": stats["review"],
        },
        "avg_risk_score": stats["avg_risk"],
        "avg_latency_ms": stats["avg_latency"],
        "p95_latency_ms": stats["p95_latency"],
    }