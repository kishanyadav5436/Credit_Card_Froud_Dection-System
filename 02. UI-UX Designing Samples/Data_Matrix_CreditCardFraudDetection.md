# Data Matrix: Credit Card Fraud Detection System

| Data Entity | Attribute | Data Type | Description | Source | Sensitivity/Security |
|---|---|---|---|---|---|
| **Customer** | id | UUID | Unique identifier for the customer | Internal | Low |
| **Customer** | email | String | Customer email address | User Input | PII (Encrypted) |
| **Customer** | phone | String | Customer phone number | User Input | PII (Encrypted) |
| **Customer** | created_at | Timestamp | Account creation time | System | Low |
| **Card** | token_id | UUID | Tokenized representation of the card | Payment Gateway | High (Tokenized) |
| **Card** | customer_id | UUID | Foreign key referencing Customer | System | Low |
| **Card** | bin | String | Bank Identification Number (first 6-8 digits) | Payment Gateway | Medium |
| **Card** | last4 | String | Last 4 digits of the card | Payment Gateway | Medium |
| **Transaction** | id | UUID | Unique identifier for the transaction | System | Low |
| **Transaction** | card_token | UUID | Foreign key referencing Card token | System | Low |
| **Transaction** | merchant_id | UUID | Foreign key referencing Merchant | Payment Gateway | Low |
| **Transaction** | amount | Decimal | Transaction value | Payment Gateway | Medium |
| **Transaction** | currency | String | ISO 4217 Currency code | Payment Gateway | Low |
| **Transaction** | time | Timestamp | Exact time of transaction | Payment Gateway | Low |
| **Transaction** | status | String | Current status (e.g., Pending, Approved, Declined) | System | Low |
| **Transaction** | ip_address | String | IP Address of the user initiating transaction | Client Device | Medium |
| **Transaction** | device_id | String | Fingerprint of the client device | Client Device | Medium |
| **Fraud Alert** | id | UUID | Unique identifier for the alert | System | Low |
| **Fraud Alert** | transaction_id | UUID | Foreign key referencing Transaction | System | Low |
| **Fraud Alert** | risk_score | Integer | Calculated risk score (0-100) | ML Engine | Medium |
| **Fraud Alert** | reason_codes | JSON/String | SHAP explanation codes | ML Engine | Medium |
| **Fraud Alert** | status | String | Resolution status (Open, False Positive, True Positive) | Analyst Dashboard | Medium |

### Computed Features (Redis Feature Store)
| Feature Name | Data Type | Description | Window |
|---|---|---|---|
| `tx_count_1m` | Integer | Number of transactions in the last 1 minute | 1 Minute |
| `tx_count_1h` | Integer | Number of transactions in the last 1 hour | 1 Hour |
| `tx_count_24h` | Integer | Number of transactions in the last 24 hours | 24 Hours |
| `amount_sum_24h` | Decimal | Total amount spent in the last 24 hours | 24 Hours |
| `avg_spend_30d` | Decimal | Average transaction amount over the last 30 days | 30 Days |
| `dist_last_tx` | Decimal | Geographic distance from the last transaction location | - |
| `is_new_device` | Boolean | True if the device_id has never been seen for this user | - |
