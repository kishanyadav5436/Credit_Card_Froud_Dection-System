# Software Requirements Specification (SRS)
## Project: Production-Grade Credit Card Fraud Detection System

### 1. Introduction
#### 1.1 Purpose
The purpose of this document is to specify the software requirements for the Production-Grade Credit Card Fraud Detection System. It defines the functional and non-functional requirements for the platform, which is designed to detect fraudulent transactions within milliseconds using a multi-layered approach involving machine learning, rules engines, and real-time streaming data.

#### 1.2 Scope
The system will encompass:
- Real-time transaction ingestion via API Gateway and Kafka.
- Data preprocessing and feature engineering (velocity, geographic, behavioral).
- A multi-model ML pipeline with explainability (SHAP).
- Rule and decision engine for final risk scoring (0-100).
- Analyst dashboard for investigation and feedback.
- Complete MLOps lifecycle (MLflow, drift monitoring).
- Secure, PCI-compliant architecture.

#### 1.3 Definitions and Acronyms
- **XAI**: Explainable Artificial Intelligence
- **SHAP**: SHapley Additive exPlanations
- **MLOps**: Machine Learning Operations
- **API**: Application Programming Interface
- **PCI DSS**: Payment Card Industry Data Security Standard
- **TPS**: Transactions Per Second

### 2. Overall Description
#### 2.1 Product Perspective
This system acts as an intermediary risk assessment layer between payment gateways (Client devices/POS/E-commerce) and core banking authorization systems.

#### 2.2 User Characteristics
- **Data Scientists/ML Engineers:** Require access to MLOps pipelines (MLflow) to monitor data drift and model performance.
- **Fraud Analysts:** Use the React Dashboard to investigate flagged transactions, view reason codes, and provide feedback (True/False positives).
- **System Administrators:** Monitor system health via Grafana and Prometheus.

### 3. Functional Requirements
#### 3.1 Ingestion & API
- **FR1:** The system shall expose a POST API endpoint to receive transaction data.
- **FR2:** The API Gateway must authenticate incoming requests using JWT.
- **FR3:** The system must push valid incoming transactions to a Kafka stream (`transactions` topic).

#### 3.2 Real-Time Inference
- **FR4:** The system shall retrieve real-time velocity and historical features from the Redis Feature Store.
- **FR5:** The Rule Engine must evaluate deterministic rules (e.g., impossible travel, high velocity).
- **FR6:** The Machine Learning models (XGBoost/LightGBM, Isolation Forest) must calculate probability scores.
- **FR7:** A Risk Aggregator must normalize and compute a final score from 0-100.
- **FR8:** The system shall return a decision (Approve: 0-30, Review: 31-75, Block: 76-100) within 100 milliseconds.

#### 3.3 Explainability
- **FR9:** Every blocked or reviewed transaction must generate SHAP reason codes.

#### 3.4 Dashboard & Investigation
- **FR10:** The React Dashboard must allow analysts to view transaction details, risk scores, and reason codes.
- **FR11:** Analysts must be able to label transactions as fraud or non-fraud to create a feedback loop.

### 4. Non-Functional Requirements
#### 4.1 Performance & Latency
- The API must respond with a risk score and decision within <100ms for 99th percentile transactions.
- The system must handle high throughput (e.g., thousands of TPS).

#### 4.2 Security & Compliance
- **PCI DSS Compliance:** Raw PAN and CVV must never be stored. They must be tokenized at the gateway.
- Data must be encrypted at rest (AES-256) and in transit (TLS 1.3).
- Role-based access control (RBAC) must be enforced for the Analyst Dashboard.

#### 4.3 Reliability & Availability
- The system must ensure high availability using Kafka and Kubernetes (EKS).
- The transaction API must remain available even if the underlying ML models temporarily fail, falling back to a lightweight rule engine.
