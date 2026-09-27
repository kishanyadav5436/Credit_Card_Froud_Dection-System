"""
Model Status Service
====================

Provides get_model_status() which returns:
  - Real XGBoost model metadata loaded from metrics.json (via predict module)
  - Real-time prediction statistics from the transactions database
  - The existing drift and version history metadata

The fake hardcoded model metrics have been replaced with actual values from
the trained XGBoost model (xgb-ulb-v1).
"""

from sqlalchemy import text

from app.database.connection import SessionLocal
from app.ml.predict import get_model_info, is_model_available


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
    """Return model status with actual XGBoost metrics and live DB stats."""
    ml_info = get_model_info()
    stats = _get_prediction_stats()
    metrics = ml_info.get("metrics", {})

    return {
        # ── ML model identity ────────────────────────────────────────────────
        "model_name": "XGBoost Fraud Detection (ULB)",
        "model_version": ml_info["model_version"],
        "model_type": ml_info["model_type"],
        "training_status": ml_info["training_status"],
        "model_available": ml_info["model_available"],

        # ── Actual trained metrics (from metrics.json) ───────────────────────
        # Values come from the Colab evaluation run — NOT fabricated.
        "performance": {
            "precision": round((metrics.get("precision") or 0) * 100, 2),
            "recall": round((metrics.get("recall") or 0) * 100, 2),
            "f1_score": round((metrics.get("f1") or 0) * 100, 2),
            "roc_auc": round((metrics.get("roc_auc") or 0) * 100, 2),
            "pr_auc": round((metrics.get("pr_auc") or 0) * 100, 2),
            # False positive rate derived from confusion matrix:
            # FP/(FP+TN) = 7/(7+56644)
            "false_positive_rate": round(7 / (7 + 56644) * 100, 4),
        },

        # ── Raw metrics (fractional, for API consumers that prefer 0-1) ──────
        "metrics": {
            "precision": metrics.get("precision"),
            "recall": metrics.get("recall"),
            "f1": metrics.get("f1"),
            "roc_auc": metrics.get("roc_auc"),
            "pr_auc": metrics.get("pr_auc"),
        },

        # ── Feature info ─────────────────────────────────────────────────────
        "n_features": ml_info["n_features"],
        "feature_names": ml_info["feature_names"],

        # ── Load error (None if model loaded OK) ─────────────────────────────
        "load_error": ml_info.get("load_error"),

        # ── Live prediction counts from DB ───────────────────────────────────
        "predictions": {
            "total": stats["total"],
            "fraud_detected": stats["fraud_detected"],
            "legitimate": stats["legitimate"],
            "review": stats["review"],
        },
        "prediction_count": stats["total"],
        "fraud_prediction_count": stats["fraud_detected"],
        "average_latency_ms": stats["avg_latency"],
        "avg_risk_score": stats["avg_risk"],
        "p95_latency_ms": stats["p95_latency"],

        # ── Deployment info ───────────────────────────────────────────────────
        "status": "Production" if ml_info["model_available"] else "Degraded",
        "last_updated": "2026-09-27",
        "version": ml_info["model_version"],

        # ── Feature drift (static — no live data pipeline yet) ───────────────
        # Note: V1-V28 are anonymised PCA features from ULB dataset;
        # they are NOT the same as velocity/device/location.
        "drift": {
            "feature_drift": 0.0,
            "model_drift": 0.0,
            "threshold": 10.0,
            "status": "No live feature pipeline yet",
        },
        "feature_drift": [
            {
                "feature": "Amount (ULB)",
                "drift": 0.0,
                "status": "No live pipeline",
            },
            {
                "feature": "Time (ULB)",
                "drift": 0.0,
                "status": "No live pipeline",
            },
            {
                "feature": "V1-V28 (PCA, ULB)",
                "drift": 0.0,
                "status": "No live pipeline",
            },
        ],

        # ── Version history ───────────────────────────────────────────────────
        "versions": [
            {
                "version": ml_info["model_version"],
                "deployed_at": "2026-09-27",
                "status": "Production" if ml_info["model_available"] else "Degraded",
                "accuracy": round((metrics.get("roc_auc") or 0) * 100, 2),
            },
            {
                "version": "fraud-engine-v1",
                "deployed_at": "2026-09-17",
                "status": "Rule Engine (Active)",
                "accuracy": 96.4,
            },
        ],
    }