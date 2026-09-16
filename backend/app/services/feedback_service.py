from datetime import datetime


feedback_records = []


def save_feedback(feedback):
    record = {
        "feedback_id": (
            f"FDB-{len(feedback_records) + 10001}"
        ),
        "transaction_id": feedback["transaction_id"],
        "actual_outcome": feedback["actual_outcome"],
        "analyst": feedback.get(
            "analyst",
            "Fraud Analyst"
        ),
        "comment": feedback.get(
            "comment",
            ""
        ),
        "created_at": datetime.utcnow().isoformat(),
    }

    feedback_records.insert(
        0,
        record
    )

    return record


def get_all_feedback():
    return feedback_records


def get_feedback_by_transaction(
    transaction_id
):
    return [
        record
        for record in feedback_records
        if record["transaction_id"]
        == transaction_id
    ]