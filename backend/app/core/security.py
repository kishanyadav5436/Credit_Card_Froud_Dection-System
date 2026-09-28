import re
import secrets
from datetime import datetime, timedelta
from typing import Any

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import text

from app.core.config import settings
from app.database.connection import SessionLocal, get_db

oauth2_scheme = HTTPBearer()


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def is_valid_email(email: str) -> bool:
    return bool(re.fullmatch(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email or ""))


def validate_password(password: str) -> bool:
    if not isinstance(password, str):
        return False
    password = password.strip()
    if len(password) < 8:
        return False
    if password.lower() in {"password", "password123", "admin123", "welcome123"}:
        return False
    if not any(char.isalpha() for char in password):
        return False
    if not any(char.isdigit() for char in password):
        return False
    return True


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(subject: str, role: str, email: str) -> str:
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    payload = {
        "sub": str(subject),
        "email": normalize_email(email),
        "role": str(role).lower(),
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


def safe_user_row(row: dict[str, Any] | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "email": row.get("email"),
        "role": str(row.get("role") or "user").lower(),
        "is_active": bool(row.get("is_active", True)),
        "is_verified": bool(row.get("is_verified", True)),
        "created_at": row.get("created_at").isoformat() if row.get("created_at") else None,
    }


def ensure_auth_tables() -> None:
    sql = """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_verified BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """

    db = SessionLocal()
    try:
        db.execute(text(sql))
        db.commit()
    finally:
        db.close()


def ensure_bootstrap_admin() -> None:
    import os

    admin_email = (os.getenv("ADMIN_EMAIL") or "").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD") or ""
    if not admin_email or not admin_password:
        return

    db = SessionLocal()
    try:
        existing = db.execute(
            text("SELECT id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1"),
            {"email": admin_email},
        ).scalar_one_or_none()
        if existing is not None:
            return

        db.execute(
            text(
                "INSERT INTO users (name, email, password_hash, role, is_active, is_verified) "
                "VALUES (:name, :email, :password_hash, :role, TRUE, TRUE)"
            ),
            {
                "name": "System Administrator",
                "email": admin_email,
                "password_hash": get_password_hash(admin_password),
                "role": "admin",
            },
        )
        db.commit()
    finally:
        db.close()


def get_user_by_id(db, user_id: int) -> dict[str, Any] | None:
    row = db.execute(
        text("SELECT * FROM users WHERE id = :user_id LIMIT 1"),
        {"user_id": int(user_id)},
    ).mappings().first()
    return safe_user_row(dict(row)) if row else None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db=Depends(get_db),
) -> dict[str, Any]:
    token = credentials.credentials
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    row = db.execute(
        text("SELECT * FROM users WHERE id = :user_id LIMIT 1"),
        {"user_id": int(user_id)},
    ).mappings().first()

    if row is None:
        raise HTTPException(status_code=401, detail="User not found")

    user = safe_user_row(dict(row))
    if not user or not user.get("is_active"):
        raise HTTPException(status_code=401, detail="User account is inactive")

    if payload.get("role", user["role"]) and str(payload.get("role", user["role"]).lower()) != user["role"]:
        user["role"] = str(payload.get("role", user["role"]).lower())

    return user


def require_admin(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    if str(current_user.get("role", "")).lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)
