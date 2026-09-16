class InvestigationModel:

    table_name = "investigations"

    fields = {
        "investigation_id": "VARCHAR(100)",
        "transaction_id": "VARCHAR(100)",
        "alert_id": "VARCHAR(100)",
        "status": "VARCHAR(30)",
        "decision": "VARCHAR(20)",
        "analyst": "VARCHAR(150)",
        "analyst_note": "TEXT",
        "created_at": "TIMESTAMP",
        "updated_at": "TIMESTAMP",
    }