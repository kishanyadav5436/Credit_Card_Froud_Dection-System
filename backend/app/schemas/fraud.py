from pydantic import BaseModel
from typing import Optional


class FraudCheckRequest(BaseModel):
    transaction_id: str
    customer_id: str
    merchant_id: str

    amount: float

    currency: Optional[str] = "INR"

    velocity: Optional[int] = 0

    isNewDevice: Optional[bool] = False

    locationMismatch: Optional[bool] = False


class FraudReason(BaseModel):
    code: str
    label: str
    score: int


class FraudCheckResponse(BaseModel):
    transaction_id: str

    risk_score: int

    decision: str

    severity: str

    reason_codes: list[str]

    reasons: list[FraudReason]

    probability: float

    model_version: str

    latency_ms: int