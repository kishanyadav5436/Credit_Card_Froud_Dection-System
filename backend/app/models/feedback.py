class FeedbackModel:

    table_name = "fraud_feedback"

    fields = {
        "feedback_id": "VARCHAR(100)",
        "transaction_id": "VARCHAR(100)",
        "actual_outcome": "VARCHAR(30)",
        "analyst": "VARCHAR(150)",
        "comment": "TEXT",
        "created_at": "TIMESTAMP",
    }