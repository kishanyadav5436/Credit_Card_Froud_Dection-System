from fastapi import APIRouter, HTTPException

from app.services.alert_service import (
    get_all_alerts,
    get_alert,
)


router = APIRouter(
    prefix="/api/v1/fraud",
    tags=["Fraud Alerts"],
)


@router.get("/alerts")
def list_alerts():

    alerts = get_all_alerts()

    return {
        "count": len(alerts),
        "alerts": alerts,
    }


@router.get("/alerts/{alert_id}")
def get_alert_by_id(alert_id: str):

    alert = get_alert(alert_id)

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    return alert