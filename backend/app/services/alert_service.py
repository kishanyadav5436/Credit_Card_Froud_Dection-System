import json
from datetime import datetime

from sqlalchemy import text

from app.database.connection import SessionLocal


def create_alert(transaction):
    db = SessionLocal()

    try:
        alert_id = f"ALT-{int(datetime.utcnow().timestamp() * 1000)}"

        db.execute(
            text("""
                INSERT INTO alerts (
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
                )
                VALUES (
                    :alert_id,
                    :type,
                    :severity,
                    :status,
                    :risk_score,
                    :transaction_id,
                    :customer_id,
                    :merchant_id,
                    :amount,
                    :trigger,
                    CAST(:reason_codes AS JSONB),
                    :detected_at
                )
            """),
            {
                "alert_id": alert_id,
                "type": "Fraud Risk Detected",
                "severity": transaction["severity"],
                "status": "Active",
                "risk_score": transaction["risk_score"],
                "transaction_id": transaction["transaction_id"],
                "customer_id": transaction["customer_id"],
                "merchant_id": transaction["merchant_id"],
                "amount": transaction["amount"],
                "trigger": (
                    f'Fraud engine detected a '
                    f'{transaction["severity"].lower()} risk transaction.'
                ),
                "reason_codes": json.dumps(
                    transaction.get("reason_codes", [])
                ),
                "detected_at": datetime.utcnow(),
            },
        )

        db.commit()

        return get_alert(alert_id)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def get_all_alerts():
    db = SessionLocal()

    try:
        results = db.execute(
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
            """)
        ).mappings().all()

        return [
            normalize_alert(dict(row))
            for row in results
        ]

    finally:
        db.close()


def get_alert(alert_id):
    db = SessionLocal()

    try:
        result = db.execute(
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
                WHERE alert_id = :alert_id
            """),
            {
                "alert_id": alert_id
            },
        ).mappings().first()

        if not result:
            return None

        return normalize_alert(dict(result))

    finally:
        db.close()


def normalize_alert(alert):
    if alert.get("detected_at"):
        alert["detected_at"] = alert["detected_at"].isoformat()

    return alert