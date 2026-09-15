from fastapi import APIRouter, HTTPException

from app.services.transaction_service import (
    get_transaction,
    get_all_transactions,
)


router = APIRouter(
    prefix="/api/v1/transactions",
    tags=["Transactions"],
)


@router.get("")
def list_transactions():
    return {
        "count": len(get_all_transactions()),
        "transactions": get_all_transactions(),
    }


@router.get("/{transaction_id}")
def get_transaction_by_id(
    transaction_id: str,
):
    transaction = get_transaction(
        transaction_id
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )

    return transaction