const RULES = {
  HIGH_AMOUNT: 30,
  NEW_DEVICE: 25,
  HIGH_VELOCITY: 25,
  LOCATION_MISMATCH: 20,
};

export function calculateRisk(transaction) {
  let score = 0;
  const reasons = [];

  if (transaction.amount >= 50000) {
    score += RULES.HIGH_AMOUNT;
    reasons.push({
      code: "AMOUNT_ANOMALY",
      label: "Unusually high transaction amount",
      score: RULES.HIGH_AMOUNT,
    });
  }

  if (transaction.isNewDevice) {
    score += RULES.NEW_DEVICE;
    reasons.push({
      code: "NEW_DEVICE",
      label: "Transaction from a new device",
      score: RULES.NEW_DEVICE,
    });
  }

  if (transaction.velocity >= 3) {
    score += RULES.HIGH_VELOCITY;
    reasons.push({
      code: "VELOCITY_HIGH",
      label: "Multiple transactions in a short period",
      score: RULES.HIGH_VELOCITY,
    });
  }

  if (transaction.locationMismatch) {
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
  } else if (score >= 60) {
    decision = "REVIEW";
    severity = "High";
  } else if (score >= 30) {
    decision = "REVIEW";
    severity = "Medium";
  }

  return {
    score,
    decision,
    severity,
    reasons,
    probability: score / 100,
  };
}