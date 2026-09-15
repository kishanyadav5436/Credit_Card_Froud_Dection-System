from pydantic import BaseModel
from typing import Optional


class TransactionResponse(BaseModel):
    transaction_id: str
    customer_id: str
    merchant_id: str
    amount: float
    currency: str

    velocity: int
    isNewDevice: bool
    locationMismatch: bool

    risk_score: int
    decision: str
    severity: str

    reason_codes: list[str]

    probability: float
    model_version: str

    latency_ms: Optional[int] = 0
    created_at: Optional[str] = None