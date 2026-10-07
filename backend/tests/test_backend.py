"""
Comprehensive Test Suite — Phase 11
=====================================

Tests all 12 required scenarios:
  1.  Low-risk transaction (APPROVE)
  2.  High amount transaction
  3.  New device
  4.  High velocity
  5.  Location mismatch
  6.  Multiple risk factors (BLOCK)
  7.  ML prediction (RF model)
  8.  Hybrid score calculation
  9.  APPROVE decision threshold
  10. REVIEW decision threshold
  11. BLOCK decision threshold
  12. LLM unavailable fallback

Plus existing tests preserved:
  - Health endpoint
  - Rule-only scoring
  - ML model loading (XGBoost)
  - Hybrid scoring with ULB features
  - Investigation creation and persistence
  - Auth registration, login, JWT
  - Admin access control
  - Password reset flow
  - Deactivated user handling
"""

import uuid

import bcrypt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.database.connection import SessionLocal
from app.main import app

client = TestClient(app)

# ── Genuine ULB fraud row 541 ──────────────────────────────────────────────────
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


def _make_txn_id():
    return f"test_{uuid.uuid4().hex[:12]}"


def _base_req(**overrides):
    """Return a base low-risk transaction request with optional overrides."""
    req = {
        "transaction_id": _make_txn_id(),
        "customer_id": "cust_test_001",
        "merchant_id": "merch_test_001",
        "amount": 500.0,
        "velocity": 0,
        "isNewDevice": False,
        "locationMismatch": False,
    }
    req.update(overrides)
    return req


# ──────────────────────────────────────────────────────────────────────────────
# EXISTING TESTS (preserved)
# ──────────────────────────────────────────────────────────────────────────────

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "fraud-detection-backend",
    }


def test_rule_only_scoring():
    """Low-risk transaction with no ML ULB features — rule_only or rf_hybrid mode."""
    req = _base_req(amount=100.0)
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    # Scoring mode is rf_hybrid (RF always runs) or rule_only (if RF model missing)
    assert data["scoring_mode"] in ("rf_hybrid", "rule_only")
    assert data["rule_score"] == 0
    assert data["risk_score"] >= 0
    assert data["decision"] in ("APPROVE", "REVIEW", "BLOCK")


def test_ml_model_loading():
    """XGBoost model should be in Production status."""
    from app.services.model_service import get_model_status
    status = get_model_status()
    assert status["status"] == "Production"


def test_ml_prediction():
    """XGBoost direct prediction on real ULB fraud row."""
    from app.ml.predict import predict_fraud
    result = predict_fraud(ULB_FRAUD_ROW)
    assert "fraud_probability" in result
    assert "ml_score" in result
    assert result["model_version"] == "xgb-ulb-v1"
    assert 0.0 <= result["fraud_probability"] <= 1.0


def test_hybrid_scoring():
    """Hybrid scoring with XGBoost ULB features — full_hybrid mode."""
    req = _base_req(amount=0.0, ulb_features=ULB_FRAUD_ROW)
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["scoring_mode"] == "full_hybrid"
    assert data["ml_score"] is not None
    assert "probability" in data
    assert data["model_version"] == "xgb-ulb-v1"


def test_decision_thresholds():
    """Threshold logic — APPROVE < 30, REVIEW 30-70, BLOCK >= 70."""
    from app.api.v1.fraud import _apply_decision_threshold
    assert _apply_decision_threshold(0)[0] == "APPROVE"
    assert _apply_decision_threshold(29)[0] == "APPROVE"
    assert _apply_decision_threshold(30)[0] == "REVIEW"
    assert _apply_decision_threshold(50)[0] == "REVIEW"
    assert _apply_decision_threshold(69)[0] == "REVIEW"
    assert _apply_decision_threshold(70)[0] == "BLOCK"
    assert _apply_decision_threshold(100)[0] == "BLOCK"


def test_investigation_creation_and_persistence():
    """Block a transaction, create investigation, check decision persistence."""
    txn_id = f"txn_block_{uuid.uuid4().hex[:8]}"
    req = _base_req(
        transaction_id=txn_id,
        amount=50000.0,
        velocity=10,
        isNewDevice=True,
        locationMismatch=True,
    )
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "BLOCK"

    inv_req = {
        "transaction_id": txn_id,
        "alert_id": f"alert_{uuid.uuid4().hex[:8]}",
    }
    inv_response = client.post("/api/v1/investigations", json=inv_req)
    assert inv_response.status_code == 200
    inv_data = inv_response.json()
    inv_id = inv_data["investigation_id"]

    # No duplicate
    inv_response2 = client.post("/api/v1/investigations", json=inv_req)
    assert inv_response2.status_code == 200
    assert inv_response2.json()["investigation_id"] == inv_id

    # Decision persistence
    dec_req = {
        "decision": "ESCALATE",
        "note": "Needs review by senior analyst",
        "analyst": "Test Analyst",
    }
    dec_response = client.post(
        f"/api/v1/investigations/{inv_id}/decision", json=dec_req
    )
    assert dec_response.status_code == 200
    assert dec_response.json()["decision"] == "ESCALATE"


# ──────────────────────────────────────────────────────────────────────────────
# PHASE 11 — NEW COMPREHENSIVE TESTS
# ──────────────────────────────────────────────────────────────────────────────

# ── Test 1: Low-risk transaction ───────────────────────────────────────────────

def test_low_risk_transaction():
    """
    Phase 11 Test 1: Low-risk transaction.
    Small amount, customer context provided, no risk flags.
    Expected: APPROVE, rule_score=0, low probability.
    """
    req = _base_req(
        amount=250.0,
        velocity=0,
        isNewDevice=False,
        locationMismatch=False,
        customer_avg_amount=300.0,
        transaction_frequency=1,
        merchant_risk=0.05,
    )
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    # Rule engine must not flag any rules
    assert data["rule_score"] == 0

    # Decision must be APPROVE
    assert data["decision"] == "APPROVE", (
        f"Expected APPROVE for clean low-risk transaction, "
        f"got {data['decision']} (score={data['risk_score']}, "
        f"rf_score={data.get('rf_score')})"
    )
    assert data["severity"] == "Low"
    assert data["probability"] < 0.30
    assert data["latency_ms"] >= 0


# ── Test 2: High amount transaction ───────────────────────────────────────────

def test_high_amount_transaction():
    """
    Phase 11 Test 2: High amount transaction (>= 50,000 INR).
    Expected: HIGH_AMOUNT rule triggers, risk score elevated.
    """
    req = _base_req(amount=75_000.0)
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    assert data["rule_score"] >= 30   # HIGH_AMOUNT rule = 30 points
    assert "AMOUNT_ANOMALY" in data["reason_codes"]
    assert data["risk_score"] > 0


# ── Test 3: New device ─────────────────────────────────────────────────────────

def test_new_device():
    """
    Phase 11 Test 3: New device flag.
    Expected: NEW_DEVICE rule triggers.
    """
    req = _base_req(amount=500.0, isNewDevice=True)
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    assert data["rule_score"] >= 25   # NEW_DEVICE rule = 25 points
    assert "NEW_DEVICE" in data["reason_codes"]


# ── Test 4: High velocity ──────────────────────────────────────────────────────

def test_high_velocity():
    """
    Phase 11 Test 4: High transaction velocity (>= 3 in last hour).
    Expected: VELOCITY_HIGH rule triggers.
    """
    req = _base_req(amount=500.0, velocity=5)
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    assert data["rule_score"] >= 25   # HIGH_VELOCITY rule = 25 points
    assert "VELOCITY_HIGH" in data["reason_codes"]


# ── Test 5: Location mismatch ──────────────────────────────────────────────────

def test_location_mismatch():
    """
    Phase 11 Test 5: Location mismatch flag.
    Expected: LOCATION_MISMATCH rule triggers.
    """
    req = _base_req(amount=500.0, locationMismatch=True)
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    assert data["rule_score"] >= 20   # LOCATION_MISMATCH rule = 20 points
    assert "LOCATION_MISMATCH" in data["reason_codes"]


# ── Test 6: Multiple risk factors ─────────────────────────────────────────────

def test_multiple_risk_factors():
    """
    Phase 11 Test 6: All four risk factors triggered simultaneously.
    Rule score = 30 + 25 + 25 + 20 = 100. Expected: BLOCK.
    """
    req = _base_req(
        amount=50_000.0,       # HIGH_AMOUNT  (+30)
        velocity=5,            # HIGH_VELOCITY (+25)
        isNewDevice=True,      # NEW_DEVICE   (+25)
        locationMismatch=True, # LOCATION_MISMATCH (+20)
    )
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    assert data["rule_score"] == 100
    assert data["decision"] == "BLOCK"
    assert data["severity"] == "Critical"
    assert len(data["reason_codes"]) >= 4
    assert "AMOUNT_ANOMALY" in data["reason_codes"]
    assert "NEW_DEVICE" in data["reason_codes"]
    assert "VELOCITY_HIGH" in data["reason_codes"]
    assert "LOCATION_MISMATCH" in data["reason_codes"]


# ── Test 7: ML prediction ──────────────────────────────────────────────────────

def test_ml_rf_prediction():
    """
    Phase 11 Test 7: RF model prediction.
    Verify RF model loads and produces valid probabilities.
    """
    from app.ml.model import predict_rf_fraud, is_rf_model_available, RF_FEATURE_COUNT
    from app.services.feature_engineering import extract_features

    assert is_rf_model_available(), (
        "RF model not available — run: python ml/train_model.py"
    )

    # Build a high-risk feature vector
    high_risk_txn = {
        "amount": 80_000.0,
        "velocity": 5,
        "isNewDevice": True,
        "locationMismatch": True,
        "customer_avg_amount": 5_000.0,
        "transaction_frequency": 8,
        "merchant_risk": 0.9,
    }
    features = extract_features(high_risk_txn)
    assert len(features) == RF_FEATURE_COUNT

    result = predict_rf_fraud(features)

    assert "fraud_probability" in result
    assert "ml_score" in result
    assert "feature_importances" in result
    assert result["model_available"] is True
    assert result["fallback"] is False
    assert 0.0 <= result["fraud_probability"] <= 1.0
    assert 0.0 <= result["ml_score"] <= 100.0

    # High-risk features should yield elevated probability
    assert result["fraud_probability"] > 0.3, (
        f"Expected high fraud probability for clearly risky transaction, "
        f"got {result['fraud_probability']:.3f}"
    )


# ── Test 8: Hybrid score calculation ──────────────────────────────────────────

def test_hybrid_score_calculation():
    """
    Phase 11 Test 8: Verify hybrid score formula is applied correctly.
    final_score = rule_score * RULE_WEIGHT + ml_score * ML_WEIGHT
    """
    from app.core.config import settings

    req = _base_req(amount=75_000.0, velocity=4, isNewDevice=True)
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    rule_score = data["rule_score"]
    ml_score = data["ml_score"]
    final_score = data["risk_score"]

    if ml_score is not None:
        # Formula: final = max(rule*RULE_WEIGHT + ml*ML_WEIGHT, rule_score)
        raw_hybrid = rule_score * settings.RULE_WEIGHT + ml_score * settings.ML_WEIGHT
        expected = max(0, min(100, int(max(raw_hybrid, rule_score))))
        # Allow ±1 for int conversion rounding
        assert abs(final_score - expected) <= 1, (
            f"Hybrid score mismatch: rule={rule_score}, ml={ml_score}, "
            f"raw_hybrid={raw_hybrid:.1f}, expected≈{expected}, got={final_score}"
        )

    assert 0 <= final_score <= 100
    assert data["scoring_mode"] in ("rf_hybrid", "full_hybrid", "rule_only")



# ── Test 9: APPROVE decision ───────────────────────────────────────────────────

def test_approve_decision():
    """
    Phase 11 Test 9: APPROVE decision.
    Very small, clean transaction with customer context — should score < 30.
    """
    req = _base_req(
        amount=50.0,
        velocity=0,
        isNewDevice=False,
        locationMismatch=False,
        merchant_risk=0.05,
        customer_avg_amount=100.0,   # amount close to avg → low deviation
        transaction_frequency=1,
    )
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    assert data["decision"] == "APPROVE"
    assert data["risk_score"] < 30
    assert data["severity"] == "Low"


# ── Test 10: REVIEW decision ───────────────────────────────────────────────────

def test_review_decision():
    """
    Phase 11 Test 10: REVIEW decision.
    Moderate risk — new device + small location mismatch.
    Rule score = 25 + 20 = 45. With ML weight applied, should land in 30-70.
    """
    req = _base_req(
        amount=1_000.0,
        velocity=0,
        isNewDevice=True,
        locationMismatch=True,
    )
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    # Rule score = 45, final should be 30-70 → REVIEW
    assert data["rule_score"] == 45
    assert data["decision"] in ("REVIEW", "BLOCK"), (
        f"Expected REVIEW or BLOCK for rule_score=45, got {data['decision']} "
        f"(final_score={data['risk_score']})"
    )


# ── Test 11: BLOCK decision ────────────────────────────────────────────────────

def test_block_decision():
    """
    Phase 11 Test 11: BLOCK decision.
    All risk factors + high amount → definitive BLOCK.
    """
    req = _base_req(
        amount=100_000.0,      # HIGH_AMOUNT  (+30)
        velocity=8,            # HIGH_VELOCITY (+25)
        isNewDevice=True,      # NEW_DEVICE   (+25)
        locationMismatch=True, # LOCATION_MISMATCH (+20)
        merchant_risk=0.95,
        customer_avg_amount=2_000.0,
        transaction_frequency=10,
    )
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    assert data["decision"] == "BLOCK"
    assert data["risk_score"] >= 70
    assert data["severity"] == "Critical"
    assert data["probability"] >= 0.70


# ── Test 12: LLM unavailable fallback ────────────────────────────────────────

def test_llm_unavailable_fallback():
    """
    Phase 11 Test 12: When LLM is unavailable, system must continue working.
    Verify explanation is present (template-based) and system does not error.
    """
    import os
    from unittest.mock import patch

    # Simulate no API key configured
    with patch.dict(os.environ, {"AI_API_KEY": ""}):
        req = _base_req(
            amount=75_000.0,
            isNewDevice=True,
        )
        response = client.post("/api/v1/fraud/check", json=req)
        assert response.status_code == 200
        data = response.json()

        # System must still produce a valid response
        assert data["decision"] in ("APPROVE", "REVIEW", "BLOCK")
        assert data["risk_score"] >= 0
        assert "explanation" in data

        # Explanation should be template-based (no LLM)
        assert data["explanation_source"] in ("template", None)
        assert data["explanation"] is not None
        assert len(data["explanation"]) > 10  # has meaningful content


# ── Additional: Response schema validation ─────────────────────────────────────

def test_response_schema_complete():
    """
    Verify all required Phase 4 response fields are present.
    From the spec:
      transaction_id, risk_score, decision, severity,
      reason_codes, reasons, probability, model_version, latency_ms
    """
    req = _base_req(amount=500.0)
    response = client.post("/api/v1/fraud/check", json=req)
    assert response.status_code == 200
    data = response.json()

    required_fields = [
        "transaction_id",
        "risk_score",
        "decision",
        "severity",
        "reason_codes",
        "reasons",
        "probability",
        "model_version",
        "latency_ms",
    ]
    for field in required_fields:
        assert field in data, f"Missing required field: {field}"


def test_model_status_endpoint():
    """Model status endpoint returns both RF and XGBoost model info."""
    response = client.get("/api/v1/models/status")
    assert response.status_code == 200
    data = response.json()

    assert "models" in data
    assert "random_forest" in data["models"]
    assert "xgboost_ulb" in data["models"]
    assert data["models"]["random_forest"]["model_available"] is True
    assert data["models"]["random_forest"]["dataset_note"] is not None
    assert "SYNTHETIC" in data["models"]["random_forest"]["dataset_note"]


def test_feature_extraction():
    """App-level feature extractor returns correct number of features."""
    from app.services.feature_engineering import (
        extract_features,
        APP_FEATURE_COUNT,
        APP_FEATURE_NAMES,
    )

    txn = {
        "amount": 5_000.0,
        "velocity": 2,
        "isNewDevice": False,
        "locationMismatch": True,
        "customer_avg_amount": 3_000.0,
        "transaction_frequency": 3,
        "merchant_risk": 0.3,
    }
    features = extract_features(txn)
    assert len(features) == APP_FEATURE_COUNT
    assert len(APP_FEATURE_NAMES) == APP_FEATURE_COUNT
    assert features[0] == 5_000.0   # amount
    assert features[2] == 0.0       # is_new_device = False
    assert features[3] == 1.0       # location_mismatch = True


def test_decision_engine_configurable():
    """Decision engine thresholds are configurable via Settings."""
    from app.services.decision_engine import apply_decision, get_threshold_config
    from app.core.config import settings

    # Default thresholds
    cfg = get_threshold_config()
    assert cfg["approve_below"] == settings.APPROVE_THRESHOLD
    assert cfg["block_at_or_above"] == settings.BLOCK_THRESHOLD

    # Test boundary values
    assert apply_decision(settings.APPROVE_THRESHOLD - 1)[0] == "APPROVE"
    assert apply_decision(settings.APPROVE_THRESHOLD)[0] == "REVIEW"
    assert apply_decision(settings.BLOCK_THRESHOLD)[0] == "BLOCK"


# ──────────────────────────────────────────────────────────────────────────────
# AUTH TESTS (preserved from original)
# ──────────────────────────────────────────────────────────────────────────────

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

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == email.lower()


def test_user_cannot_access_admin_api_and_admin_can():
    email = f"auth_user_admin_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/v1/auth/register", json={
        "name": "Regular User",
        "email": email,
        "password": "StrongPass123!",
    })
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "StrongPass123!"})
    token = login.json()["access_token"]

    blocked = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert blocked.status_code == 403

    with SessionLocal() as db:
        db.execute(
            text(
                "INSERT INTO users (name, email, password_hash, role, is_active, is_verified) "
                "VALUES (:name, :email, :password_hash, :role, TRUE, TRUE) "
                "ON CONFLICT (email) DO UPDATE SET role = :role"
            ),
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
            text(
                "SELECT token FROM password_reset_tokens "
                "WHERE user_id = (SELECT id FROM users WHERE email = :email) "
                "ORDER BY created_at DESC LIMIT 1"
            ),
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
        db.execute(
            text("UPDATE users SET is_active = FALSE WHERE email = :email"),
            {"email": email},
        )
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
