"""
Database Connection & Session Management
=========================================

Handles database engine initialization with pure-python pg8000 driver for PostgreSQL
(avoiding C-DLL locking issues with psycopg2 on Windows) and graceful fallback.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL

# Standardize PostgreSQL URL to use pg8000 pure python driver
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)
elif db_url.startswith("postgresql+psycopg2://"):
    db_url = db_url.replace("postgresql+psycopg2://", "postgresql+pg8000://", 1)

try:
    if db_url.startswith("sqlite"):
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        # Using timeout so connections fail fast if network unreachable
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            connect_args={"timeout": 10},
        )
except Exception as e:
    logger.warning(f"Engine initialization failed: {e}. Falling back to SQLite.")
    sqlite_url = "sqlite:///./fraudguard.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()