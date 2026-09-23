import json
from datetime import datetime

from sqlalchemy import text

from app.database.connection import SessionLocal
from app.services.transaction_service import get_transaction


def _generate_investigation_id():
    """Generate a unique investigation ID using timestamp."""
    ts = int(datetime.utcnow().timestamp() * 1000)
    return f"INV-{ts}"


def create_investigation(transaction):
    """
    Create a new investigation record in PostgreSQL.
    Checks if one already exists for this transaction_id.
    """
    db = SessionLocal()

    try:
        # Check if investigation already exists for this transaction
        existing = db.execute(
            text("""
                SELECT investigation_id
                FROM investigations
                WHERE transaction_id = :transaction_id
                LIMIT 1
            """),
            {"transaction_id": transaction["transaction_id"]},
        ).fetchone()

        if existing:
            return get_investigation(existing[0])

        investigation_id = _generate_investigation_id()

        db.execute(
            text("""
                INSERT INTO investigations (
                    investigation_id,
                    transaction_id,
                    alert_id,
                    status,
                    created_at,
                    updated_at
                )
                VALUES (
                    :investigation_id,
                    :transaction_id,
                    :alert_id,
                    'Open',
                    NOW(),
                    NOW()
                )
            """),
            {
                "investigation_id": investigation_id,
                "transaction_id": transaction["transaction_id"],
                "alert_id": transaction.get("alert_id"),
            },
        )

        db.commit()

        return get_investigation(investigation_id)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def _build_investigation_from_row(row, transaction):
    """
    Build the full investigation object from a DB row and the related transaction.
    """
    investigation_id = row["investigation_id"]
    transaction_id = row["transaction_id"]
    status = row["status"] or "Open"
    db_decision = row["decision"]
    analyst = row["analyst"]
    analyst_note = row["analyst_note"]
    created_at = row["created_at"]
    updated_at = row["updated_at"]

    # If transaction not found, use minimal placeholder
    if not transaction:
        transaction = {
            "transaction_id": transaction_id,
            "customer_id": "Unknown",
            "merchant_id": "Unknown",
            "amount": 0,
            "currency": "INR",
            "risk_score": 0,
            "decision": "Unknown",
            "severity": "Low",
            "probability": 0,
            "model_version": "fraud-engine-v1",
            "reasons": [],
            "isNewDevice": False,
            "locationMismatch": False,
        }

    reasons = transaction.get("reasons") or []
    if isinstance(reasons, str):
        try:
            reasons = json.loads(reasons)
        except Exception:
            reasons = []

    saved_decision = None
    if db_decision:
        saved_decision = {
            "decision": db_decision,
            "note": analyst_note or "",
            "analyst": analyst or "Fraud Analyst",
            "saved_at": (
                updated_at.isoformat()
                if updated_at and hasattr(updated_at, "isoformat")
                else str(updated_at or "")
            ),
        }

    return {
        "investigation_id": investigation_id,

        "status": status,

        "alert_id": row.get("alert_id"),

        "transaction": {
            "id": transaction["transaction_id"],
            "amount": float(transaction.get("amount", 0) or 0),
            "merchant": transaction.get("merchant_id", "Unknown"),
            "category": "Unknown",
            "location": (
                "Location mismatch detected"
                if transaction.get("locationMismatch")
                else "Normal"
            ),
            "timestamp": transaction.get("created_at", ""),
            "payment_method": "Credit Card",
        },

        "customer": {
            "id": transaction.get("customer_id", "Unknown"),
            "name": transaction.get("customer_id", "Unknown Customer"),
            "account_age": "Unknown",
            "avg_transaction": 0,
            "total_transactions": 0,
            "previous_fraud_cases": 0,
        },

        "device": {
            "current": {
                "name": (
                    "New Device"
                    if transaction.get("isNewDevice")
                    else "Known Device"
                ),
                "os": "Unknown",
                "browser": "Unknown",
                "fingerprint": "Unknown",
                "trusted": not transaction.get("isNewDevice", False),
            },
            "history": [],
        },

        "merchant": {
            "id": transaction.get("merchant_id", "Unknown"),
            "name": transaction.get("merchant_id", "Unknown"),
            "category": "Unknown",
            "risk_score": 0,
            "total_transactions": 0,
            "fraud_rate": 0,
        },

        "risk": {
            "score": int(transaction.get("risk_score", 0) or 0),
            "severity": transaction.get("severity", "Low"),
            "decision": transaction.get("decision", "APPROVE"),
            "model": transaction.get("model_version", "fraud-engine-v1"),
            "probability": float(
                transaction.get("probability", 0) or 0
            ),
        },

        "reasons": reasons,

        "customer_transactions": [],

        "decision": saved_decision,

        "analyst": analyst,

        "analyst_note": analyst_note,

        "created_at": (
            created_at.isoformat()
            if created_at and hasattr(created_at, "isoformat")
            else str(created_at or "")
        ),

        "updated_at": (
            updated_at.isoformat()
            if updated_at and hasattr(updated_at, "isoformat")
            else str(updated_at or "")
        ),
    }


def get_all_investigations():
    """Fetch all investigations from PostgreSQL, ordered by newest first."""
    db = SessionLocal()

    try:
        rows = db.execute(
            text("""
                SELECT
                    investigation_id,
                    transaction_id,
                    alert_id,
                    status,
                    decision,
                    analyst,
                    analyst_note,
                    created_at,
                    updated_at
                FROM investigations
                ORDER BY created_at DESC
            """)
        ).mappings().all()

        results = []

        for row in rows:
            row_dict = dict(row)
            txn = get_transaction(row_dict["transaction_id"])
            results.append(
                _build_investigation_from_row(row_dict, txn)
            )

        return results

    finally:
        db.close()


def get_investigation(investigation_id):
    """Fetch a single investigation by ID from PostgreSQL."""
    db = SessionLocal()

    try:
        row = db.execute(
            text("""
                SELECT
                    investigation_id,
                    transaction_id,
                    alert_id,
                    status,
                    decision,
                    analyst,
                    analyst_note,
                    created_at,
                    updated_at
                FROM investigations
                WHERE investigation_id = :investigation_id
            """),
            {"investigation_id": investigation_id},
        ).mappings().first()

        if not row:
            return None

        row_dict = dict(row)
        txn = get_transaction(row_dict["transaction_id"])

        return _build_investigation_from_row(row_dict, txn)

    finally:
        db.close()


def save_investigation_decision(
    investigation_id,
    decision,
    note,
    analyst="Fraud Analyst",
):
    """Persist an analyst decision for an investigation to PostgreSQL."""
    db = SessionLocal()

    try:
        # Verify investigation exists
        existing = db.execute(
            text("""
                SELECT investigation_id
                FROM investigations
                WHERE investigation_id = :investigation_id
            """),
            {"investigation_id": investigation_id},
        ).fetchone()

        if not existing:
            return None

        new_status = (
            "Resolved"
            if decision in ["APPROVE", "BLOCK"]
            else "Escalated"
        )

        db.execute(
            text("""
                UPDATE investigations
                SET
                    decision = :decision,
                    analyst = :analyst,
                    analyst_note = :note,
                    status = :status,
                    updated_at = NOW()
                WHERE investigation_id = :investigation_id
            """),
            {
                "decision": decision,
                "analyst": analyst,
                "note": note or "",
                "status": new_status,
                "investigation_id": investigation_id,
            },
        )

        db.commit()

        return get_investigation(investigation_id)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()