from pydantic import BaseModel


class FraudFeedbackRequest(BaseModel):
    transaction_id: str
    actual_outcome: str
    analyst: str = "Fraud Analyst"
    comment: str = ""