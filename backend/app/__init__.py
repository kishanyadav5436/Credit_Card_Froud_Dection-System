import os
# Disable SQLAlchemy compiled extensions on restricted Windows environments
os.environ.setdefault("SQLALCHEMY_DISABLE_CYTHON", "1")
