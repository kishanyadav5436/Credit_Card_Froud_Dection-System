import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

# Genuine ULB row 541 (fraudulent)
ULB_FRAUD_ROW = [
    406.0,
    -2.3122265423263,
    1.95199201064158,
    -1.60985073229769,
    3.9979055875468,
    -0.522187864667764,
    -1.42654531920595,
    -2.53738730624579,
    1.39165724829804,
    -2.77008927719433,
    -2.77227214465915,
    3.20203320709635,
    -2.89990738849473,
    -0.595221881324605,
    -4.28925378244217,
    0.389724120274487,
    -1.14074717980657,
    -2.83005567450437,
    -0.0168224681808257,
    0.416955705037907,
    0.126910559061474,
    0.517232370861764,
    -0.0350493686052974,
    -0.465211076182388,
    0.320198198514526,
    0.0445191674731724,
    0.177839798284401,
    0.261145002567677,
    -0.143275874698919,
    0.0
]

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "fraud-detection-backend"}

def test_rule_only_scoring():
    txn_id = str(uuid.uuid4())
    req = {
        "transaction_id": txn_id,
        "customer_id": "cust1",
        "merchant_id": "merch1",
        "amount": 100.0,
        "velocity": 0,
        "isNewDevice": False,
        "locationMismatch": False
    }
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["scoring_mode"] == "rule_only"
    assert data["rule_score"] == 0
    assert data["ml_score"] is None
    assert data["risk_score"] == 0
    assert data["decision"] == "APPROVE"

def test_ml_model_loading():
    from app.services.model_service import get_model_status
    status = get_model_status()
    assert status["status"] == "Production"

def test_ml_prediction():
    from app.ml.predict import predict_fraud
    result = predict_fraud(ULB_FRAUD_ROW)
    assert "fraud_probability" in result
    assert "ml_score" in result
    assert result["model_version"] == "xgb-ulb-v1"

def test_hybrid_scoring():
    txn_id = str(uuid.uuid4())
    req = {
        "transaction_id": txn_id,
        "customer_id": "cust1",
        "merchant_id": "merch1",
        "amount": 0.0,
        "velocity": 0,
        "isNewDevice": False,
        "locationMismatch": False,
        "ulb_features": ULB_FRAUD_ROW
    }
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["scoring_mode"] == "hybrid"
    assert data["ml_score"] is not None
    assert "probability" in data
    assert data["model_version"] == "xgb-ulb-v1"
    # Final score = rule_score * 0.6 + ml_score * 0.4
    expected_score = int(min(100, max(0, data["rule_score"] * 0.6 + data["ml_score"] * 0.4)))
    assert data["risk_score"] == expected_score

def test_decision_thresholds():
    # 0-30 APPROVE, 30-70 REVIEW, 70-100 BLOCK
    from app.api.v1.fraud import _apply_decision_threshold
    assert _apply_decision_threshold(0)[0] == "APPROVE"
    assert _apply_decision_threshold(29)[0] == "APPROVE"
    assert _apply_decision_threshold(30)[0] == "REVIEW"
    assert _apply_decision_threshold(50)[0] == "REVIEW"
    assert _apply_decision_threshold(69)[0] == "REVIEW"
    assert _apply_decision_threshold(70)[0] == "BLOCK"
    assert _apply_decision_threshold(100)[0] == "BLOCK"

def test_investigation_creation_and_persistence():
    # Submit transaction that causes BLOCK
    txn_id = f"txn_block_{uuid.uuid4().hex[:8]}"
    req = {
        "transaction_id": txn_id,
        "customer_id": "cust1",
        "merchant_id": "merch1",
        "amount": 50000.0, # High amount, might trigger rule block
        "velocity": 10,
        "isNewDevice": True,
        "locationMismatch": True
    }
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "BLOCK"

    # Create investigation
    inv_req = {
        "transaction_id": txn_id,
        "alert_id": f"alert_{uuid.uuid4().hex[:8]}"
    }
    inv_response = client.post("/api/v1/investigations", json=inv_req)
    assert inv_response.status_code == 200
    inv_data = inv_response.json()
    inv_id = inv_data["investigation_id"]
    
    # Check it doesn't create duplicate
    inv_response2 = client.post("/api/v1/investigations", json=inv_req)
    assert inv_response2.status_code == 200
    assert inv_response2.json()["investigation_id"] == inv_id

    # Decision persistence
    dec_req = {
        "decision": "ESCALATE",
        "note": "Needs review by senior analyst",
        "analyst": "Test Analyst"
    }
    dec_response = client.post(f"/api/v1/investigations/{inv_id}/decision", json=dec_req)
    assert dec_response.status_code == 200
    assert dec_response.json()["decision"] == "ESCALATE"
