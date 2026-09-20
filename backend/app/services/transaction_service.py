import json

from sqlalchemy import text

from app.database.connection import SessionLocal


def save_transaction(transaction):
    db = SessionLocal()

    try:
        existing = db.execute(
            text("""
                SELECT transaction_id
                FROM transactions
                WHERE transaction_id = :transaction_id
            """),
            {
                "transaction_id": transaction["transaction_id"]
            },
        ).fetchone()

        if existing:
            return get_transaction(transaction["transaction_id"])

        db.execute(
            text("""
                INSERT INTO transactions (
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
                    latency_ms
                )
                VALUES (
                    :transaction_id,
                    :customer_id,
                    :merchant_id,
                    :amount,
                    :currency,
                    :velocity,
                    :is_new_device,
                    :location_mismatch,
                    :risk_score,
                    :decision,
                    :severity,
                    :probability,
                    CAST(:reason_codes AS JSONB),
                    CAST(:reasons AS JSONB),
                    :model_version,
                    :latency_ms
                )
            """),
            {
                "transaction_id": transaction["transaction_id"],
                "customer_id": transaction["customer_id"],
                "merchant_id": transaction["merchant_id"],
                "amount": transaction["amount"],
                "currency": transaction.get("currency", "INR"),
                "velocity": transaction.get("velocity", 0),
                "is_new_device": transaction.get(
                    "isNewDevice", False
                ),
                "location_mismatch": transaction.get(
                    "locationMismatch", False
                ),
                "risk_score": transaction.get(
                    "risk_score", 0
                ),
                "decision": transaction.get("decision"),
                "severity": transaction.get("severity"),
                "probability": transaction.get(
                    "probability", 0
                ),
                "reason_codes": json.dumps(
                    transaction.get("reason_codes", [])
                ),
                "reasons": json.dumps(
                    transaction.get("reasons", [])
                ),
                "model_version": transaction.get(
                    "model_version"
                ),
                "latency_ms": transaction.get(
                    "latency_ms", 0
                ),
            },
        )

        db.commit()

        return get_transaction(
            transaction["transaction_id"]
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def get_transaction(transaction_id):
    db = SessionLocal()

    try:
        result = db.execute(
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
                WHERE transaction_id = :transaction_id
            """),
            {
                "transaction_id": transaction_id
            },
        ).mappings().first()

        if not result:
            return None

        return normalize_transaction(dict(result))

    finally:
        db.close()


def get_all_transactions():
    db = SessionLocal()

    try:
        results = db.execute(
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
            """)
        ).mappings().all()

        return [
            normalize_transaction(dict(row))
            for row in results
        ]

    finally:
        db.close()


def normalize_transaction(transaction):
    if transaction.get("created_at"):
        transaction["created_at"] = (
            transaction["created_at"].isoformat()
        )

    transaction["isNewDevice"] = transaction.pop(
        "is_new_device",
        False,
    )

    transaction["locationMismatch"] = transaction.pop(
        "location_mismatch",
        False,
    )

    return transaction