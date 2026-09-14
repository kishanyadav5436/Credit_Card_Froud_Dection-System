backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── fraud.py
│   │       ├── transactions.py
│   │       ├── alerts.py
│   │       ├── investigations.py
│   │       ├── customers.py
│   │       └── models.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   │
│   ├── models/
│   │   ├── transaction.py
│   │   ├── alert.py
│   │   └── investigation.py
│   │
│   ├── schemas/
│   │   ├── fraud.py
│   │   └── transaction.py
│   │
│   ├── services/
│   │   ├── fraud_engine.py
│   │   ├── feature_engineering.py
│   │   └── decision_engine.py
│   │
│   ├── ml/
│   │   ├── model.py
│   │   ├── anomaly.py
│   │   └── explainability.py
│   │
│   └── database/
│       ├── connection.py
│       └── base.py
│
├── requirements.txt
└── .env