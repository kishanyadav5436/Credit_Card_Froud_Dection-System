investigations = []


def create_investigation(transaction):
    investigation = {
        "investigation_id": (
            f"INV-{len(investigations) + 10001}"
        ),

        "status": "Open",

        "alert_id": transaction.get(
            "alert_id"
        ),

        "transaction": {
            "id": transaction["transaction_id"],
            "amount": transaction["amount"],
            "merchant": transaction["merchant_id"],
            "category": "Unknown",
            "location": "Unknown",
            "timestamp": transaction.get(
                "timestamp"
            ),
            "payment_method": "Credit Card",
        },

        "customer": {
            "id": transaction["customer_id"],
            "name": transaction.get(
                "customer_name",
                "Unknown Customer"
            ),
            "account_age": "Unknown",
            "avg_transaction": 0,
            "total_transactions": 0,
            "previous_fraud_cases": 0,
        },

        "device": {
            "current": {
                "name": (
                    "New Device"
                    if transaction.get(
                        "isNewDevice"
                    )
                    else "Known Device"
                ),
                "os": "Unknown",
                "browser": "Unknown",
                "fingerprint": "Unknown",
                "trusted": not transaction.get(
                    "isNewDevice",
                    False
                ),
            },
            "history": [],
        },

        "merchant": {
            "id": transaction["merchant_id"],
            "name": transaction["merchant_id"],
            "category": "Unknown",
            "risk_score": 0,
            "total_transactions": 0,
            "fraud_rate": 0,
        },

        "risk": {
            "score": transaction["risk_score"],
            "severity": transaction["severity"],
            "decision": transaction["decision"],
            "model": transaction[
                "model_version"
            ],
            "probability": transaction[
                "probability"
            ],
        },

        "reasons": transaction.get(
            "reasons",
            []
        ),

        "customer_transactions": [],
    }

    investigations.insert(
        0,
        investigation
    )

    return investigation


def get_all_investigations():
    return investigations


def get_investigation(investigation_id):
    for investigation in investigations:
        if (
            investigation[
                "investigation_id"
            ]
            == investigation_id
        ):
            return investigation

    return None

from datetime import datetime


def save_investigation_decision(
    investigation_id,
    decision,
    note,
    analyst="Fraud Analyst",
):
    investigation = get_investigation(
        investigation_id
    )

    if investigation is None:
        return None

    saved_decision = {
        "decision": decision,
        "note": note,
        "analyst": analyst,
        "saved_at": datetime.utcnow().isoformat(),
    }

    investigation["decision"] = saved_decision

    investigation["status"] = (
        "Resolved"
        if decision in ["APPROVE", "BLOCK"]
        else "Escalated"
    )

    return investigation