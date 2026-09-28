from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text

from app.core.config import settings
from app.core.email_service import EmailService
from app.core.security import (
    create_access_token,
    generate_reset_token,
    get_current_user,
    get_password_hash,
    normalize_email,
    safe_user_row,
    validate_password,
    verify_password,
    is_valid_email,
)
from app.database.connection import get_db
from app.schemas.auth import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserLoginRequest,
    UserRegisterRequest,
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


def _serialize_user(row: dict | None):
    return safe_user_row(row)


@router.post("/register", status_code=201)
def register_user(payload: UserRegisterRequest, db=Depends(get_db)):
    email = normalize_email(payload.email)
    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Valid email is required")

    if not validate_password(payload.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters and include letters and numbers.",
        )

    existing = db.execute(
        text("SELECT id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1"),
        {"email": email},
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(payload.password)
    result = db.execute(
        text(
            "INSERT INTO users (name, email, password_hash, role, is_active, is_verified) "
            "VALUES (:name, :email, :password_hash, :role, TRUE, TRUE) RETURNING id, name, email, role, is_active, created_at"
        ),
        {
            "name": payload.name.strip(),
            "email": email,
            "password_hash": hashed_password,
            "role": "user",
        },
    ).mappings().first()
    db.commit()

    user = dict(result)
    user["role"] = str(user.get("role") or "user").lower()
    if user.get("created_at") and hasattr(user["created_at"], "isoformat"):
        user["created_at"] = user["created_at"].isoformat()
    user.pop("password_hash", None)
    return user


@router.post("/login")
def login(payload: UserLoginRequest, db=Depends(get_db)):
    email = normalize_email(payload.email)
    user_row = db.execute(
        text("SELECT * FROM users WHERE LOWER(email)=LOWER(:email) LIMIT 1"),
        {"email": email},
    ).mappings().first()

    if user_row is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = dict(user_row)
    if not bool(user.get("is_active", False)):
        raise HTTPException(status_code=401, detail="User account is inactive")

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(user["id"], user["role"], user["email"])
    db.execute(
        text("UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = :user_id"),
        {"user_id": user["id"]},
    )
    db.commit()

    safe_user = _serialize_user(user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": safe_user,
    }


@router.get("/me")
def read_current_user(user: dict = Depends(get_current_user)):
    return user


@router.post("/logout")
def logout():
    return {
        "message": "Logout successful. Remove the access token from the client and rely on short-lived JWT expiry for stateless logout.",
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db=Depends(get_db)):
    email = normalize_email(payload.email)
    if email:
        user_row = db.execute(
            text("SELECT id, email FROM users WHERE LOWER(email)=LOWER(:email) LIMIT 1"),
            {"email": email},
        ).mappings().first()
        if user_row is not None:
            token = generate_reset_token()
            expires_at = datetime.utcnow() + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)
            db.execute(
                text(
                    "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)"
                ),
                {
                    "user_id": user_row["id"],
                    "token": token,
                    "expires_at": expires_at,
                },
            )
            db.commit()
            reset_url = f"http://localhost:5173/reset-password?token={token}"
            EmailService.send_password_reset_email(email, reset_url)

    return {"message": "If the account exists, a password reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db=Depends(get_db)):
    if not validate_password(payload.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters and include letters and numbers.",
        )

    token_row = db.execute(
        text(
            "SELECT * FROM password_reset_tokens WHERE token = :token LIMIT 1"
        ),
        {"token": payload.token},
    ).mappings().first()

    if token_row is None:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    expires_at = token_row["expires_at"]
    if expires_at is None or datetime.utcnow() > expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired")

    if token_row.get("used_at") is not None:
        raise HTTPException(status_code=400, detail="Reset token has already been used")

    user_row = db.execute(
        text("SELECT * FROM users WHERE id = :user_id LIMIT 1"),
        {"user_id": token_row["user_id"]},
    ).mappings().first()
    if user_row is None:
        raise HTTPException(status_code=400, detail="User not found")

    new_hash = get_password_hash(payload.new_password)
    db.execute(
        text("UPDATE users SET password_hash = :password_hash, updated_at = CURRENT_TIMESTAMP WHERE id = :user_id"),
        {"password_hash": new_hash, "user_id": token_row["user_id"]},
    )
    db.execute(
        text("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = :token_id"),
        {"token_id": token_row["id"]},
    )
    db.commit()

    return {"message": "Password reset successful."}
