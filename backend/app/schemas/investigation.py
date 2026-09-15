from pydantic import BaseModel
from typing import Optional, Any


class InvestigationCreate(BaseModel):
    transaction_id: str


class InvestigationResponse(BaseModel):
    investigation_id: str
    status: str

    alert_id: Optional[str] = None

    transaction: dict[str, Any]
    customer: dict[str, Any]
    device: dict[str, Any]
    merchant: dict[str, Any]
    risk: dict[str, Any]

    reasons: list[dict[str, Any]]

    customer_transactions: list[
        dict[str, Any]
    ]
class InvestigationDecisionRequest(BaseModel):
    decision: str
    note: str = ""
    analyst: str = "Fraud Analyst"