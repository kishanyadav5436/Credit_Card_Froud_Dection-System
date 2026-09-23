from fastapi import APIRouter

from app.services.dashboard_service import (
    get_dashboard_stats,
)


router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def dashboard_stats():
    """
    Return real-time dashboard statistics from the database:
    - transaction counts (total, blocked, review, approved)
    - alert counts (total, active)
    - investigation counts (total, open)
    - fraud rate
    - recent transactions and alerts
    """
    return get_dashboard_stats()
