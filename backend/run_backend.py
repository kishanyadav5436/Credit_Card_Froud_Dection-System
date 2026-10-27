import os

# Disable SQLAlchemy C extensions (required on locked‑down Windows environments)
os.environ["SQLALCHEMY_DISABLE_CYTHON"] = "1"

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
