import os


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:YOUR_PASSWORD@localhost:5432/fraudguard",
)


def get_database_url():
    return DATABASE_URL