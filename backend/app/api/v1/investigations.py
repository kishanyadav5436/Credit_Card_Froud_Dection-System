from fastapi import APIRouter, HTTPException

from app.schemas.investigation import (
    InvestigationCreate,
    InvestigationDecisionRequest,
)

from app.services.transaction_service import (
    get_transaction,
)

from app.services.investigation_service import (
    create_investigation,
    get_all_investigations,
    get_investigation,
    save_investigation_decision,
)

router = APIRouter(
    prefix="/api/v1/investigations",
    tags=["Investigations"],
)


@router.post("")
def create_new_investigation(
    data: InvestigationCreate,
):

    transaction = get_transaction(
        data.transaction_id
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )

    investigation = (
        create_investigation(
            transaction
        )
    )

    return investigation


@router.get("")
def list_investigations():

    investigations = (
        get_all_investigations()
    )

    return {
        "count": len(investigations),
        "investigations": investigations,
    }


@router.get("/{investigation_id}")
def get_investigation_by_id(
    investigation_id: str,
):

    investigation = get_investigation(
        investigation_id
    )

    if investigation is None:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found",
        )

    return investigation
@router.post(
    "/{investigation_id}/decision"
)
def save_decision(
    investigation_id: str,
    data: InvestigationDecisionRequest,
):
    allowed_decisions = [
        "APPROVE",
        "BLOCK",
        "ESCALATE",
    ]

    decision = data.decision.upper()

    if decision not in allowed_decisions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Decision must be "
                "APPROVE, BLOCK, or ESCALATE"
            ),
        )

    investigation = save_investigation_decision(
        investigation_id=investigation_id,
        decision=decision,
        note=data.note,
        analyst=data.analyst,
    )

    if investigation is None:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found",
        )

    return {
        "message": "Decision saved successfully",
        "investigation_id": investigation_id,
        "decision": decision,
        "note": data.note,
        "analyst": data.analyst,
        "status": investigation["status"],
        "saved_at": investigation["decision"][
            "saved_at"
        ],
    }