from datetime import datetime

from sqlalchemy import text

from app.database.connection import SessionLocal


def save_feedback(feedback):
    """Persist fraud feedback to PostgreSQL fraud_feedback table."""
    db = SessionLocal()

    try:
        feedback_id = (
            f"FDB-{int(datetime.utcnow().timestamp() * 1000)}"
        )

        db.execute(
            text("""
                INSERT INTO fraud_feedback (
                    feedback_id,
                    transaction_id,
                    actual_outcome,
                    analyst,
                    comment,
                    created_at
                )
                VALUES (
                    :feedback_id,
                    :transaction_id,
                    :actual_outcome,
                    :analyst,
                    :comment,
                    NOW()
                )
            """),
            {
                "feedback_id": feedback_id,
                "transaction_id": feedback["transaction_id"],
                "actual_outcome": feedback["actual_outcome"],
                "analyst": feedback.get(
                    "analyst", "Fraud Analyst"
                ),
                "comment": feedback.get("comment", ""),
            },
        )

        db.commit()

        return get_feedback_by_id(feedback_id)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def get_feedback_by_id(feedback_id):
    db = SessionLocal()

    try:
        row = db.execute(
            text("""
                SELECT
                    feedback_id,
                    transaction_id,
                    actual_outcome,
                    analyst,
                    comment,
                    created_at
                FROM fraud_feedback
                WHERE feedback_id = :feedback_id
            """),
            {"feedback_id": feedback_id},
        ).mappings().first()

        if not row:
            return None

        return normalize_feedback(dict(row))

    finally:
        db.close()


def get_all_feedback():
    """Fetch all feedback records from PostgreSQL."""
    db = SessionLocal()

    try:
        rows = db.execute(
            text("""
                SELECT
                    feedback_id,
                    transaction_id,
                    actual_outcome,
                    analyst,
                    comment,
                    created_at
                FROM fraud_feedback
                ORDER BY created_at DESC
            """)
        ).mappings().all()

        return [
            normalize_feedback(dict(row))
            for row in rows
        ]

    finally:
        db.close()


def get_feedback_by_transaction(transaction_id):
    """Fetch all feedback for a specific transaction."""
    db = SessionLocal()

    try:
        rows = db.execute(
            text("""
                SELECT
                    feedback_id,
                    transaction_id,
                    actual_outcome,
                    analyst,
                    comment,
                    created_at
                FROM fraud_feedback
                WHERE transaction_id = :transaction_id
                ORDER BY created_at DESC
            """),
            {"transaction_id": transaction_id},
        ).mappings().all()

        return [
            normalize_feedback(dict(row))
            for row in rows
        ]

    finally:
        db.close()


def normalize_feedback(record):
    if record.get("created_at"):
        record["created_at"] = (
            record["created_at"].isoformat()
        )

    return record