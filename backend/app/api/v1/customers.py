from fastapi import APIRouter

from app.services.customer_service import (
    get_customer_risk,
)


router = APIRouter(
    prefix="/api/v1/customers",
    tags=["Customers"],
)


@router.get("/{customer_id}/risk")
def customer_risk(customer_id: str):

    return get_customer_risk(
        customer_id
    )