from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

ULB_FRAUD_ROW = [
    406.0, -2.3122265423263, 1.95199201064158, -1.60985073229769, 3.9979055875468,
    -0.522187864667764, -1.42654531920595, -2.53738730624579, 1.39165724829804,
    -2.77008927719433, -2.77227214465915, 3.20203320709635, -2.89990738849473,
    -0.595221881324605, -4.28925378244217, 0.389724120274487, -1.14074717980657,
    -2.83005567450437, -0.0168224681808257, 0.416955705037907, 0.126910559061474,
    0.517232370861764, -0.0350493686052974, -0.465211076182388, 0.320198198514526,
    0.0445191674731724, 0.177839798284401, 0.261145002567677, -0.143275874698919, 0.0
]

req = {
    "transaction_id": "hybrid_test_1",
    "customer_id": "cust1",
    "merchant_id": "merch1",
    "amount": 0.0,
    "velocity": 0,
    "isNewDevice": False,
    "locationMismatch": False,
    "ulb_features": ULB_FRAUD_ROW
}
response = client.post("/api/v1/fraud/check", json=req)
data = response.json()
print("Actual fraud probability:", data["probability"])
print("Actual ML score:", data["ml_score"])
print("Actual rule score:", data["rule_score"])
print("Actual final hybrid score:", data["risk_score"])
print("Final decision:", data["decision"])
