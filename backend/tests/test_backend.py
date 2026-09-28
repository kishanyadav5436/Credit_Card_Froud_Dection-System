import uuid

import bcrypt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.database.connection import SessionLocal
from app.main import app

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


def test_auth_registration_success_and_duplicate_email():
    email = f"auth_user_{uuid.uuid4().hex[:8]}@example.com"
    payload = {"name": "Auth User", "email": email, "password": "StrongPass123!"}

    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["email"] == email.lower()
    assert "password_hash" not in body

    dup_response = client.post("/api/v1/auth/register", json=payload)
    assert dup_response.status_code == 400


def test_auth_login_and_jwt_me():
    email = f"auth_login_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Login User",
        "email": email,
        "password": "StrongPass123!",
    })

    response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "StrongPass123!",
    })
    assert response.status_code == 200, response.text
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    token = body["access_token"]

    me_response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == email.lower()


def test_user_cannot_access_admin_api_and_admin_can():
    email = f"auth_user_admin_{uuid.uuid4().hex[:8]}@example.com"
    reg = client.post("/api/v1/auth/register", json={
        "name": "Regular User",
        "email": email,
        "password": "StrongPass123!",
    })
    user_token = reg.json()["token_type"] if False else None
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "StrongPass123!"})
    token = login.json()["access_token"]

    blocked = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert blocked.status_code == 403

    with SessionLocal() as db:
        db.execute(
            text("INSERT INTO users (name, email, password_hash, role, is_active, is_verified) VALUES (:name, :email, :password_hash, :role, TRUE, TRUE) ON CONFLICT (email) DO UPDATE SET role = :role"),
            {
                "name": "Seed Admin",
                "email": "admin_seed@example.com",
                "password_hash": bcrypt.hashpw(b"StrongPass123!", bcrypt.gensalt()).decode("utf-8"),
                "role": "admin",
            },
        )
        db.commit()

    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin_seed@example.com",
        "password": "StrongPass123!",
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]

    allowed = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert allowed.status_code == 200


def test_forgot_password_reset_password_and_invalid_token():
    email = f"reset_user_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Reset User",
        "email": email,
        "password": "StrongPass123!",
    })

    forgot = client.post("/api/v1/auth/forgot-password", json={"email": email})
    assert forgot.status_code == 200
    assert "If the account exists" in forgot.json()["message"]

    with SessionLocal() as db:
        token_row = db.execute(
            text("SELECT token FROM password_reset_tokens WHERE user_id = (SELECT id FROM users WHERE email = :email) ORDER BY created_at DESC LIMIT 1"),
            {"email": email},
        ).scalar_one_or_none()
        assert token_row is not None
        token = token_row

    bad_reset = client.post("/api/v1/auth/reset-password", json={
        "token": "bad-token",
        "new_password": "NewStrongPass456!",
    })
    assert bad_reset.status_code == 400

    success = client.post("/api/v1/auth/reset-password", json={
        "token": token,
        "new_password": "NewStrongPass456!",
    })
    assert success.status_code == 200, success.text

    login_after_reset = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "NewStrongPass456!",
    })
    assert login_after_reset.status_code == 200


def test_deactivated_user_cannot_authenticate_and_invalid_password_rejected():
    email = f"deact_user_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Deactivated User",
        "email": email,
        "password": "StrongPass123!",
    })

    with SessionLocal() as db:
        db.execute(text("UPDATE users SET is_active = FALSE WHERE email = :email"), {"email": email})
        db.commit()

    invalid = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "WrongPass123!",
    })
    assert invalid.status_code == 401

    blocked = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "StrongPass123!",
    })
    assert blocked.status_code == 401
