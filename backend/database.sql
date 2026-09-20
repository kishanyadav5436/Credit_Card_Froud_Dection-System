CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150),
    email VARCHAR(255),
    account_age_days INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    customer_id VARCHAR(100) NOT NULL,
    merchant_id VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    velocity INTEGER DEFAULT 0,
    is_new_device BOOLEAN DEFAULT FALSE,
    location_mismatch BOOLEAN DEFAULT FALSE,
    risk_score INTEGER DEFAULT 0,
    decision VARCHAR(20),
    severity VARCHAR(20),
    probability NUMERIC(5, 4),
    reason_codes JSONB DEFAULT '[]',
    reasons JSONB DEFAULT '[]',
    model_version VARCHAR(100),
    latency_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(100),
    severity VARCHAR(20),
    status VARCHAR(30) DEFAULT 'Active',
    risk_score INTEGER,
    transaction_id VARCHAR(100),
    customer_id VARCHAR(100),
    merchant_id VARCHAR(100),
    amount NUMERIC(15, 2),
    trigger TEXT,
    reason_codes JSONB DEFAULT '[]',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investigations (
    id SERIAL PRIMARY KEY,
    investigation_id VARCHAR(100) UNIQUE NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    alert_id VARCHAR(100),
    status VARCHAR(30) DEFAULT 'Open',
    decision VARCHAR(20),
    analyst VARCHAR(150),
    analyst_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fraud_feedback (
    id SERIAL PRIMARY KEY,
    feedback_id VARCHAR(100) UNIQUE NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    actual_outcome VARCHAR(30),
    analyst VARCHAR(150),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_customer
ON transactions(customer_id);

CREATE INDEX IF NOT EXISTS idx_transactions_risk
ON transactions(risk_score);

CREATE INDEX IF NOT EXISTS idx_transactions_created
ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_alerts_status
ON alerts(status);

CREATE INDEX IF NOT EXISTS idx_alerts_severity
ON alerts(severity);

CREATE INDEX IF NOT EXISTS idx_investigations_status
ON investigations(status);

CREATE INDEX IF NOT EXISTS idx_feedback_transaction
ON fraud_feedback(transaction_id);