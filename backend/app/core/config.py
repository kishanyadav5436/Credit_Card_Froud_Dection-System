from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "Credit Card Fraud Detection API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = (
        "postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/fraudguard"
    )

    SECRET_KEY: str = "your-super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    RESET_TOKEN_EXPIRE_MINUTES: int = 30
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # ── ML Hybrid Engine Weights ─────────────────────────────────────────────
    # Rule engine weight in the hybrid final_score formula.
    # When only rule scoring is available (no ML features), rule score is used
    # directly.  When both are available:
    #   final_score = rule_score * RULE_WEIGHT + ml_score * ML_WEIGHT
    RULE_WEIGHT: float = 0.6
    ML_WEIGHT: float = 0.4


settings = Settings()