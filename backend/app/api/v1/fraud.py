import time

from fastapi import APIRouter

from app.schemas.fraud import (
    FraudCheckRequest,
    FraudCheckResponse,
)

from app.services.fraud_engine import (
    calculate_fraud_risk,
)

from app.services.transaction_service import (
    save_transaction,
)

from app.services.alert_service import (
    create_alert,
)


router = APIRouter(
    prefix="/api/v1/fraud",
    tags=["Fraud Detection"],
)


@router.post(
    "/check",
    response_model=FraudCheckResponse,
)
def check_fraud(
    transaction: FraudCheckRequest,
):

    start_time = time.perf_counter()

    transaction_data = transaction.model_dump()

    result = calculate_fraud_risk(
        transaction_data
    )

    latency_ms = int(
        (time.perf_counter() - start_time)
        * 1000
    )

    response = {
        "transaction_id": transaction.transaction_id,

        "risk_score": result["score"],

        "decision": result["decision"],

        "severity": result["severity"],

        "reason_codes": [
            reason["code"]
            for reason in result["reasons"]
        ],

        "reasons": result["reasons"],

        "probability": result["probability"],

        "model_version": result["model_version"],

        "latency_ms": latency_ms,
    }

    saved_transaction = {
    **transaction_data,
    **response,
    "reasons": result["reasons"],
}
    save_transaction(
        saved_transaction
    )

    # Create alert for high-risk transaction
    if result["score"] >= 60:

        create_alert(
            saved_transaction
        )

    return response