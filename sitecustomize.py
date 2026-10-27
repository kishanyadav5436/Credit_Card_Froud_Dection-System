import os
# Ensure SQLAlchemy uses pure‑Python implementation on locked‑down Windows
os.environ.setdefault("SQLALCHEMY_DISABLE_CYTHON", "1")
