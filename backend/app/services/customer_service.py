from app.services.transaction_service import (
    get_all_transactions,
)


def get_customer_risk(customer_id):
    transactions = [
        transaction
        for transaction in get_all_transactions()
        if transaction.get("customer_id")
        == customer_id
    ]

    if not transactions:
        return {
            "customer_id": customer_id,
            "risk_score": 0,
            "risk_level": "Unknown",
            "total_transactions": 0,
            "fraud_transactions": 0,
            "blocked_transactions": 0,
            "review_transactions": 0,
            "approved_transactions": 0,
        }

    total = len(transactions)

    fraud_transactions = [
        transaction
        for transaction in transactions
        if transaction.get("risk_score", 0) >= 60
    ]

    blocked_transactions = [
        transaction
        for transaction in transactions
        if transaction.get("decision")
        == "BLOCK"
    ]

    review_transactions = [
        transaction
        for transaction in transactions
        if transaction.get("decision")
        == "REVIEW"
    ]

    approved_transactions = [
        transaction
        for transaction in transactions
        if transaction.get("decision")
        == "APPROVE"
    ]

    average_risk = sum(
        transaction.get("risk_score", 0)
        for transaction in transactions
    ) / total

    if average_risk >= 80:
        risk_level = "Critical"
    elif average_risk >= 30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "customer_id": customer_id,
        "risk_score": round(average_risk, 2),
        "risk_level": risk_level,
        "total_transactions": total,
        "fraud_transactions": len(
            fraud_transactions
        ),
        "blocked_transactions": len(
            blocked_transactions
        ),
        "review_transactions": len(
            review_transactions
        ),
        "approved_transactions": len(
            approved_transactions
        ),
    }