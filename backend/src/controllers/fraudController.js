const {
  calculateFraudRisk,
} = require("../services/fraudService");

async function checkFraud(req, res) {
  try {
    const transaction = req.body;

    if (!transaction) {
      return res.status(400).json({
        message: "Transaction data is required",
      });
    }

    if (!transaction.amount) {
      return res.status(400).json({
        message: "Transaction amount is required",
      });
    }

    const result = calculateFraudRisk(transaction);

    return res.status(200).json({
      transaction_id:
        transaction.transaction_id ||
        transaction.transactionId ||
        `TXN-${Date.now()}`,

      risk_score: result.score,

      decision: result.decision,

      severity: result.severity,

      reason_codes: result.reasons.map(
        (reason) => reason.code
      ),

      reasons: result.reasons,

      probability: result.probability,

      model_version: result.modelVersion,

      latency_ms: result.latencyMs,
    });
  } catch (error) {
    console.error("Fraud check error:", error);

    return res.status(500).json({
      message: "Failed to process fraud check",
    });
  }
}

module.exports = {
  checkFraud,
};