# Functional Specification Documentation
## Project: Production-Grade Credit Card Fraud Detection System

### 1. Introduction
This Functional Specification Document outlines the internal behavior, endpoints, algorithms, and logical flows for the Production-Grade Credit Card Fraud Detection System.

### 2. System Architecture Overview
The system employs a microservices architecture communicating asynchronously via Kafka and synchronously via REST APIs.
- **Client/Transaction Layer:** Initiates transaction requests.
- **Ingestion Layer:** Validates and queues data using FastAPI and Kafka.
- **Inference Layer:** Computes real-time features using Redis and evaluates rules and ML models.
- **Data Architecture:** PostgreSQL for operational data; Redis for real-time state.
- **Dashboard Layer:** React UI for manual review.

### 3. Detailed Functional Modules

#### 3.1. API Ingestion Module
**Endpoint:** `POST /api/v1/fraud/check`
**Request Payload:**
```json
{
  "transaction_id": "uuid",
  "card_token": "uuid",
  "merchant_id": "uuid",
  "amount": 150.00,
  "currency": "USD",
  "timestamp": "2026-10-10T10:00:00Z",
  "ip_address": "192.168.1.1",
  "device_fingerprint": "abc123xyz"
}
```
**Process:**
1. Validates the JSON schema.
2. Tokenizes sensitive data (if raw card info is passed, though assumed tokenized).
3. Pushes the event to the `transactions` Kafka topic.
4. Forwards to the Inference module synchronously.

#### 3.2. Feature Engineering & State Module
**Process:**
1. Retrieve historical customer context from Redis (e.g., `avg_spend_30d`).
2. Calculate velocity metrics using a sliding window in Redis (e.g., `INCR` and `EXPIRE` for `tx_count_1m`).
3. Calculate derived features: `amount / avg_spend_30d`, geographic distance based on IP.

#### 3.3. Machine Learning Inference Module
**Process:**
1. **Rule Engine:** Evaluates hard rules. 
   - *If `tx_count_1m` > 10, RuleScore = 100.*
   - *If IP location and previous IP location indicate impossible travel, RuleScore = 100.*
2. **Supervised ML:** XGBoost model loaded from MLflow evaluates the feature vector and returns a probability (0.0 to 1.0).
3. **Unsupervised ML:** Isolation Forest returns an anomaly score for novel patterns.
4. **Aggregation:** 
   - `Final Score = (w1 * RuleScore) + (w2 * ML_Prob) + (w3 * AnomalyScore) + (w4 * VelocityRisk)`
5. **Explainability (SHAP):** Calculates top contributing features to the final score and translates them to human-readable strings (e.g., "Transaction amount is unusually high for this user").

#### 3.4. Decision Engine
**Logic:**
- **Score 0 - 30 (Approve):** Transaction is authorized.
- **Score 31 - 75 (Review):** Transaction triggers step-up authentication or is flagged for manual review by an analyst.
- **Score 76 - 100 (Block):** Transaction is declined immediately.

**Response Payload:**
```json
{
  "transaction_id": "uuid",
  "decision": "BLOCK",
  "risk_score": 88,
  "reason_codes": [
    "High velocity: 11 transactions in last 1 min",
    "Impossible travel detected"
  ]
}
```

#### 3.5. Analyst Dashboard (Frontend)
- **Alert Queue:** Real-time stream of transactions scored > 30.
- **Transaction Details:** Displays all features, SHAP reason codes, and a graph network of shared IPs/Devices.
- **Feedback Loop Action:** Analysts can click "Confirm Fraud" or "Mark as False Positive", triggering a Kafka event to update the label in PostgreSQL for future model retraining.

### 4. Error Handling and Fallbacks
- **Redis Timeout:** If the Redis feature store is unreachable, default velocity features to 0 and rely solely on the Rule Engine and static ML features.
- **ML Model Timeout:** If inference takes > 50ms, abort and use the Rule Engine score only to ensure the strict <100ms SLA is met.
