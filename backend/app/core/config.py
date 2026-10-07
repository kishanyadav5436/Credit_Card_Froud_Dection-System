from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "Credit Card Fraud Detection API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = (
        "postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/fraudguard"
    )

    SECRET_KEY: str = "your-super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # ── ML Hybrid Engine Weights ─────────────────────────────────────────────
    # Weights used in the hybrid final_score formula:
    #   final_score = rule_score * RULE_WEIGHT + ml_score * ML_WEIGHT
    # When the RF model is unavailable, rule_score is used directly.
    # Configurable via .env — no code change needed.
    RULE_WEIGHT: float = 0.4
    ML_WEIGHT: float = 0.6

    # ── Decision Thresholds ──────────────────────────────────────────────────
    # 0 – APPROVE_THRESHOLD        → APPROVE
    # APPROVE_THRESHOLD – BLOCK_THRESHOLD → REVIEW
    # BLOCK_THRESHOLD – 100        → BLOCK
    APPROVE_THRESHOLD: float = 30.0
    BLOCK_THRESHOLD: float = 70.0

    # ── LLM Explanation Service ──────────────────────────────────────────────
    # Set AI_API_KEY in .env to enable LLM-generated analyst explanations.
    # Supports Google Gemini (install google-generativeai) or OpenAI (install openai).
    # NEVER hardcode this value.
    AI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-flash"   # or gpt-4o-mini for OpenAI

    # ── Alert Threshold ──────────────────────────────────────────────────────
    # Transactions with risk_score >= this value will trigger an alert.
    ALERT_THRESHOLD: float = 60.0


settings = Settings()