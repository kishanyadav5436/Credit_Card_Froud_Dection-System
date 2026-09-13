const RULES = {
  HIGH_AMOUNT: 30,
  NEW_DEVICE: 25,
  HIGH_VELOCITY: 25,
  LOCATION_MISMATCH: 20,
};

function calculateFraudRisk(transaction) {
  const startTime = Date.now();

  let score = 0;
  const reasons = [];

  // High transaction amount
  if (Number(transaction.amount) >= 50000) {
    score += RULES.HIGH_AMOUNT;

    reasons.push({
      code: "AMOUNT_ANOMALY",
      label: "Unusually high transaction amount",
      score: RULES.HIGH_AMOUNT,
    });
  }

  // New device
  if (transaction.isNewDevice === true) {
    score += RULES.NEW_DEVICE;

    reasons.push({
      code: "NEW_DEVICE",
      label: "Transaction from a new device",
      score: RULES.NEW_DEVICE,
    });
  }

  // High transaction velocity
  if (Number(transaction.velocity) >= 3) {
    score += RULES.HIGH_VELOCITY;

    reasons.push({
      code: "VELOCITY_HIGH",
      label: "Multiple transactions in a short period",
      score: RULES.HIGH_VELOCITY,
    });
  }

  // Location mismatch
  if (transaction.locationMismatch === true) {
    score += RULES.LOCATION_MISMATCH;

    reasons.push({
      code: "LOCATION_MISMATCH",
      label: "Transaction location differs from normal activity",
      score: RULES.LOCATION_MISMATCH,
    });
  }

  score = Math.min(score, 100);

  let decision = "APPROVE";
  let severity = "Low";

  if (score >= 80) {
    decision = "BLOCK";
    severity = "Critical";
  } else if (score >= 30) {
    decision = "REVIEW";
    severity = "Medium";
  }

  const latencyMs = Date.now() - startTime;

  return {
    score,
    decision,
    severity,
    probability: score / 100,
    reasons,
    modelVersion: "fraud-engine-v1",
    latencyMs,
  };
}

module.exports = {
  calculateFraudRisk,
};