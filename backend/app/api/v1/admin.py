from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from app.core.security import get_current_user, require_admin
from app.database.connection import get_db

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


def _sanitize_user(row: dict) -> dict:
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "email": row.get("email"),
        "role": str(row.get("role") or "user").lower(),
        "is_active": bool(row.get("is_active", True)),
        "is_verified": bool(row.get("is_verified", True)),
        "created_at": row.get("created_at").isoformat() if row.get("created_at") else None,
    }


@router.get("/users")
def list_users(db=Depends(get_db), current_user: dict = Depends(require_admin)):
    rows = db.execute(
        text("SELECT * FROM users ORDER BY created_at DESC")
    ).mappings().all()
    return {
        "count": len(rows),
        "users": [_sanitize_user(dict(row)) for row in rows],
    }


@router.get("/users/{user_id}")
def get_user(user_id: int, db=Depends(get_db), current_user: dict = Depends(require_admin)):
    row = db.execute(
        text("SELECT * FROM users WHERE id = :user_id LIMIT 1"),
        {"user_id": user_id},
    ).mappings().first()
    if row is None:
        raise HTTPException(status_code=404, detail="User not found")
    return _sanitize_user(dict(row))


@router.patch("/users/{user_id}")
def update_user(user_id: int, payload: dict, db=Depends(get_db), current_user: dict = Depends(require_admin)):
    target = db.execute(
        text("SELECT * FROM users WHERE id = :user_id LIMIT 1"),
        {"user_id": user_id},
    ).mappings().first()
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")

    if user_id == current_user["id"]:
        new_role = str((payload.get("role") or target["role"] or "user")).lower()
        if new_role != "admin":
            raise HTTPException(status_code=400, detail="Administrators cannot remove their own admin access.")

    name = payload.get("name", target["name"])
    role = str((payload.get("role") or target["role"] or "user")).lower()
    allowed_roles = {"user", "analyst", "admin", "readonly"}
    if role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Unsupported role")

    db.execute(
        text(
            "UPDATE users SET name = :name, role = :role, updated_at = CURRENT_TIMESTAMP WHERE id = :user_id"
        ),
        {"name": name, "role": role, "user_id": user_id},
    )
    db.commit()
    return {"message": "User updated successfully."}


@router.patch("/users/{user_id}/status")
def update_user_status(user_id: int, payload: dict, db=Depends(get_db), current_user: dict = Depends(require_admin)):
    target = db.execute(
        text("SELECT * FROM users WHERE id = :user_id LIMIT 1"),
        {"user_id": user_id},
    ).mappings().first()
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")

    new_active = bool(payload.get("is_active", target["is_active"]))
    if not new_active and user_id == current_user["id"]:
        active_admins = db.execute(
            text("SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = TRUE")
        ).scalar_one()
        if active_admins <= 1:
            raise HTTPException(status_code=400, detail="At least one active admin must remain.")

    db.execute(
        text("UPDATE users SET is_active = :is_active, updated_at = CURRENT_TIMESTAMP WHERE id = :user_id"),
        {"is_active": new_active, "user_id": user_id},
    )
    db.commit()
    return {"message": "User status updated successfully."}
