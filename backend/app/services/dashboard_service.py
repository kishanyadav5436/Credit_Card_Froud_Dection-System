from sqlalchemy import text

from app.database.connection import SessionLocal
from app.services.transaction_service import normalize_transaction
from app.services.alert_service import normalize_alert


def get_dashboard_stats():
    """
    Return real-time dashboard statistics from PostgreSQL.
    Queries transactions, alerts, and investigations tables.
    """
    db = SessionLocal()

    try:
        # ── Transaction counts ──────────────────────────────
        txn_stats = db.execute(
            text("""
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (
                        WHERE decision = 'BLOCK'
                    ) AS blocked,
                    COUNT(*) FILTER (
                        WHERE decision = 'REVIEW'
                    ) AS review,
                    COUNT(*) FILTER (
                        WHERE decision = 'APPROVE'
                    ) AS approved,
                    ROUND(AVG(risk_score), 1) AS avg_risk,
                    COUNT(*) FILTER (
                        WHERE risk_score >= 70
                    ) AS high_risk
                FROM transactions
            """)
        ).mappings().first()

        # ── Alert counts ────────────────────────────────────
        alert_stats = db.execute(
            text("""
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (
                        WHERE status = 'Active'
                    ) AS active
                FROM alerts
            """)
        ).mappings().first()

        # ── Investigation counts ────────────────────────────
        inv_stats = db.execute(
            text("""
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (
                        WHERE status = 'Open'
                    ) AS open_count
                FROM investigations
            """)
        ).mappings().first()

        # ── Recent transactions (last 5) ────────────────────
        recent_txn_rows = db.execute(
            text("""
                SELECT
                    transaction_id,
                    customer_id,
                    merchant_id,
                    amount,
                    currency,
                    velocity,
                    is_new_device,
                    location_mismatch,
                    risk_score,
                    decision,
                    severity,
                    probability,
                    reason_codes,
                    reasons,
                    model_version,
                    latency_ms,
                    created_at
                FROM transactions
                ORDER BY created_at DESC
                LIMIT 5
            """)
        ).mappings().all()

        recent_transactions = [
            normalize_transaction(dict(row))
            for row in recent_txn_rows
        ]

        # ── Recent alerts (last 5) ──────────────────────────
        recent_alert_rows = db.execute(
            text("""
                SELECT
                    alert_id,
                    type,
                    severity,
                    status,
                    risk_score,
                    transaction_id,
                    customer_id,
                    merchant_id,
                    amount,
                    trigger,
                    reason_codes,
                    detected_at
                FROM alerts
                ORDER BY detected_at DESC
                LIMIT 5
            """)
        ).mappings().all()

        recent_alerts = [
            normalize_alert(dict(row))
            for row in recent_alert_rows
        ]

        # ── Fraud rate ──────────────────────────────────────
        total = int(txn_stats["total"] or 0)
        blocked = int(txn_stats["blocked"] or 0)

        fraud_rate = (
            round(blocked / total * 100, 2)
            if total > 0
            else 0
        )

        return {
            "transactions": {
                "total": total,
                "blocked": blocked,
                "review": int(txn_stats["review"] or 0),
                "approved": int(txn_stats["approved"] or 0),
                "high_risk": int(txn_stats["high_risk"] or 0),
                "avg_risk_score": float(
                    txn_stats["avg_risk"] or 0
                ),
                "fraud_rate": fraud_rate,
            },
            "alerts": {
                "total": int(alert_stats["total"] or 0),
                "active": int(alert_stats["active"] or 0),
            },
            "investigations": {
                "total": int(inv_stats["total"] or 0),
                "open": int(inv_stats["open_count"] or 0),
            },
            "recent_transactions": recent_transactions,
            "recent_alerts": recent_alerts,
        }

    finally:
        db.close()
