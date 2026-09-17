RULES = {
    "HIGH_AMOUNT": 30,
    "NEW_DEVICE": 25,
    "HIGH_VELOCITY": 25,
    "LOCATION_MISMATCH": 20,
}


def calculate_fraud_risk(transaction):
    score = 0
    reasons = []

    amount = transaction.get("amount", 0)

    if amount >= 50000:
        score += RULES["HIGH_AMOUNT"]

        reasons.append({
            "code": "AMOUNT_ANOMALY",
            "label": "Unusually high transaction amount",
            "score": RULES["HIGH_AMOUNT"],
        })

    if transaction.get("isNewDevice", False):
        score += RULES["NEW_DEVICE"]

        reasons.append({
            "code": "NEW_DEVICE",
            "label": "Transaction from a new device",
            "score": RULES["NEW_DEVICE"],
        })

    if transaction.get("velocity", 0) >= 3:
        score += RULES["HIGH_VELOCITY"]

        reasons.append({
            "code": "VELOCITY_HIGH",
            "label": "Multiple transactions in a short period",
            "score": RULES["HIGH_VELOCITY"],
        })

    if transaction.get("locationMismatch", False):
        score += RULES["LOCATION_MISMATCH"]

        reasons.append({
            "code": "LOCATION_MISMATCH",
            "label": "Transaction location differs from normal activity",
            "score": RULES["LOCATION_MISMATCH"],
        })

    score = min(score, 100)

    if score >= 80:
        decision = "BLOCK"
        severity = "Critical"

    elif score >= 30:
        decision = "REVIEW"
        severity = "Medium"

    else:
        decision = "APPROVE"
        severity = "Low"

    return {
        "score": score,
        "decision": decision,
        "severity": severity,
        "probability": score / 100,
        "reasons": reasons,
        "model_version": "fraud-engine-v1",
    }