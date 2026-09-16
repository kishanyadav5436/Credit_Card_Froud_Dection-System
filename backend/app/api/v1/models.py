from fastapi import APIRouter

from app.services.model_service import (
    get_model_status,
)


router = APIRouter(
    prefix="/api/v1/models",
    tags=["Model Monitoring"],
)


@router.get("/status")
def model_status():

    return get_model_status()