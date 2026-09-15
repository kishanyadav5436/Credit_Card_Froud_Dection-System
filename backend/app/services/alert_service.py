from datetime import datetime


alerts = []


def create_alert(transaction):
    alert = {
        "alert_id": f"ALT-{len(alerts) + 70001}",

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

        "reason_codes": transaction["reason_codes"],

        "detected_at": datetime.utcnow().isoformat(),
    }

    alerts.insert(0, alert)

    return alert


def get_all_alerts():
    return alerts


def get_alert(alert_id):
    for alert in alerts:
        if alert["alert_id"] == alert_id:
            return alert

    return None