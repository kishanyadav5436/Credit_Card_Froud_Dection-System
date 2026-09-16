from fastapi import APIRouter, HTTPException

from app.schemas.feedback import (
    FraudFeedbackRequest,
)

from app.services.transaction_service import (
    get_transaction,
)

from app.services.feedback_service import (
    save_feedback,
    get_all_feedback,
    get_feedback_by_transaction,
)


router = APIRouter(
    prefix="/api/v1/fraud",
    tags=["Fraud Feedback"],
)


@router.post("/feedback")
def submit_feedback(
    data: FraudFeedbackRequest,
):

    transaction = get_transaction(
        data.transaction_id
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )

    allowed_outcomes = [
        "FRAUD",
        "LEGITIMATE",
        "UNKNOWN",
    ]

    outcome = data.actual_outcome.upper()

    if outcome not in allowed_outcomes:
        raise HTTPException(
            status_code=400,
            detail=(
                "actual_outcome must be "
                "FRAUD, LEGITIMATE, or UNKNOWN"
            ),
        )

    feedback = save_feedback({
        "transaction_id":
            data.transaction_id,

        "actual_outcome":
            outcome,

        "analyst":
            data.analyst,

        "comment":
            data.comment,
    })

    return {
        "message": "Feedback saved successfully",
        "feedback": feedback,
    }


@router.get("/feedback")
def list_feedback():

    feedback = get_all_feedback()

    return {
        "count": len(feedback),
        "feedback": feedback,
    }


@router.get(
    "/feedback/{transaction_id}"
)
def transaction_feedback(
    transaction_id: str,
):

    return {
        "transaction_id": transaction_id,
        "feedback": get_feedback_by_transaction(
            transaction_id
        ),
    }