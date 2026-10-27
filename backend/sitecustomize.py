import os
# Force SQLAlchemy to use pure‑Python implementation on Windows where DLL loading is blocked
os.environ.setdefault("SQLALCHEMY_DISABLE_CYTHON", "1")
