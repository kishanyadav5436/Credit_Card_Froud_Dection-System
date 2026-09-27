# End-to-End Integration Test Summary

**Run date:** 2026-09-27  
**System:** Credit Card Fraud Detection System

## Overall Result

The backend, React/Vite frontend, PostgreSQL connection, rule-only transaction flow, alert flow, investigation decisions, and model monitoring were exercised successfully. Hybrid scoring with a genuine canonical ULB feature vector was not tested because no verifiable ULB data row was available in the workspace. No model artifacts were changed and no training was performed.

## Flow Results

| Flow | Result | Notes |
|---|---|---|
| Start FastAPI backend | PASS | Served locally on port 8000. |
| Start React/Vite frontend | PASS | Served locally on port 5173. Use the `localhost` origin to match backend CORS configuration. |
| Verify PostgreSQL | PASS | Configured database connected and `SELECT 1` returned successfully. |
| Open Dashboard | PASS | Dashboard statistics loaded from the database. |
| Open Transactions | PASS | Transaction list loaded and showed newly submitted transactions. |
| Open Fraud Simulator | PASS | Existing application fields submitted successfully. |
| Submit normal transaction | PASS | Rule-only request returned risk score 0 and APPROVE. |
| Verify transaction persistence | PASS | New transaction rows were confirmed by direct PostgreSQL queries. |
| Trigger a high-risk alert | PASS | High-risk transaction returned score 100/BLOCK and produced an active database alert. |
| Open Alerts and related transaction | PASS | Alert and related transaction appeared in the UI; transaction detail API returned the saved record. |
| Create/open investigation | PASS WITH LIMITATION | Investigation was created through the API and opened in the UI. The alert drawer's Start Investigation action navigates but did not create a missing investigation. |
| Test APPROVE, BLOCK, ESCALATE | PASS | Each decision request returned HTTP 200. |
| Verify decision after refresh | PASS | The final ESCALATE decision, analyst note, and status persisted in PostgreSQL and appeared after page reload. |
| Open Model Monitoring | PASS | Model status and metrics loaded without browser runtime errors. |
| Verify real XGBoost metrics | PASS | API values matched `backend/app/ml/metrics.json`; loaded model was `xgb-ulb-v1` with 30 features. |
| Submit genuine canonical ULB vector | NOT RUN | No verifiable ULB source row was found. No synthetic V1-V28 values were generated. |
| Verify hybrid result/formula/clamp | NOT RUN END TO END | The code uses configured weights 0.6/0.4 and clamps to 0-100, but runtime behavior requires a genuine vector and was not asserted in this run. |
| Verify decision thresholds | PASS | Checked 0 and 29 as APPROVE, 30 and 69 as REVIEW, and 70 and 100 as BLOCK. |
| Frontend production build | PASS WITH WARNING | Build completed; Vite warned the minified JavaScript chunk exceeds 500 kB. |
| Backend imports/compilation | PASS | Application/model imports succeeded and `compileall` passed. |
| Backend automated tests | NOT AVAILABLE | No backend tests were found; pytest is not installed and unittest discovery ran zero tests. |

## Verified Scoring Results

### Rule-Only Normal Transaction

- `scoring_mode`: `rule_only`
- `rule_score`: 0
- `ml_score`: null
- Final risk score: 0
- Decision: APPROVE
- Model version: `fraud-engine-v1`
- PostgreSQL persistence: confirmed

### Rule-Only Alert Transaction

- `scoring_mode`: `rule_only`
- `rule_score`: 100
- `ml_score`: null
- Final risk score: 100
- Decision: BLOCK
- Reasons: `AMOUNT_ANOMALY`, `NEW_DEVICE`, `VELOCITY_HIGH`, `LOCATION_MISMATCH`
- Model version: `fraud-engine-v1`
- PostgreSQL transaction and active alert: confirmed

### Model Monitoring

The XGBoost model loaded successfully and the metrics endpoint reported Production status for `xgb-ulb-v1`:

| Metric | Value |
|---|---:|
| Precision | 91.57% |
| Recall | 80.00% |
| F1 | 85.39% |
| ROC-AUC | 97.68% |
| PR-AUC | 82.03% |

The monitoring UI showed these API-backed values. The UI also reports that feature drift has no live data pipeline.

## APIs Exercised

- `GET /api/health`
- `GET /api/v1/dashboard/stats`
- `POST /api/v1/fraud/check`
- `GET /api/v1/transactions`
- `GET /api/v1/transactions/{transaction_id}`
- `GET /api/v1/fraud/alerts`
- `POST /api/v1/investigations`
- `GET /api/v1/investigations`
- `GET /api/v1/investigations/{investigation_id}`
- `POST /api/v1/investigations/{investigation_id}/decision`
- `GET /api/v1/models/status`

## Browser, Logs, and Code Changes

The initial browser session used `127.0.0.1:5173`, which did not match the backend's allowed `localhost:5173` CORS origin. That produced initial preflight errors. Using `http://localhost:5173` resolved the mismatch; later tested pages had no console or page errors. Backend logs recorded successful responses for the exercised APIs and no application traceback.

The integration run exposed a frontend investigation display issue: the original transaction risk decision took precedence over a saved analyst decision. The investigation API mapper and detail overview were updated to prefer the persisted analyst decision, with the risk decision as the fallback. The final saved ESCALATE decision was confirmed in the UI after reload. The frontend build and lint passed after these changes.

## Remaining Issues and Readiness

- Hybrid scoring still needs a runtime test using a verified canonical ULB vector, in the exact order `Time, V1...V28, Amount`.
- The alert's Start Investigation action does not create an investigation when none exists; the investigation in this run was created separately through the API.
- There is no backend automated test suite in the repository, and pytest is unavailable in the backend environment.
- Production build output has a JavaScript chunk-size warning.
- CORS origins must match the actual frontend host in each deployment environment.
- Feature drift is static/no-live-pipeline data, as indicated by Model Monitoring.

**Production readiness:** Not yet established. The tested rule-only, persistence, alert, investigation-decision, and monitoring paths worked locally, but hybrid inference with genuine ULB data and a repeatable automated backend test suite remain unverified.