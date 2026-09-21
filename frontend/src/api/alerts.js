import apiClient from "./client";

// Get alerts from FastAPI → Supabase
export async function getAlerts() {
  const response = await apiClient.get(
    "/api/v1/fraud/alerts"
  );

  const alerts = response.alerts || [];

  return alerts.map((alert) => ({
    id: alert.alert_id,
    type: alert.type,
    severity: alert.severity,
    status: alert.status,
    riskScore: alert.risk_score,

    transactionId: alert.transaction_id,
    customerId: alert.customer_id,
    customerName: alert.customer_id,

    trigger: alert.trigger,
    detectedAt: alert.detected_at,
    merchant: alert.merchant_id,

    reasons: Array.isArray(alert.reason_codes)
      ? alert.reason_codes
      : [],
  }));
}
// Get one alert from FastAPI
export async function getAlertById(id) {
  const alert = await apiClient.get(
    `/api/v1/fraud/alerts/${id}`
  );

  if (!alert) return null;

  return {
    id: alert.alert_id,
    type: alert.type,
    severity: alert.severity,
    status: alert.status,
    riskScore: alert.risk_score,

    transactionId: alert.transaction_id,
    customerId: alert.customer_id,
    customerName: alert.customer_id,

    trigger: alert.trigger,

    detectedAt: alert.detected_at,

    merchant: alert.merchant_id,

    reasons: Array.isArray(alert.reason_codes)
      ? alert.reason_codes
      : [],
  };
}

// Keep this for later real-time implementation
export function subscribeToAlerts(callback) {
  const interval = setInterval(async () => {
    try {
      const alerts = await getAlerts();

      if (alerts.length > 0) {
        callback(alerts[0]);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  }, 10000);

  return () => clearInterval(interval);
}

// Keep local simulated alert support
export function createAlertFromTransaction(transaction) {
  const alert = {
    id: `ALT-${Date.now()}`,
    type: "Fraud Risk Detected",
    severity: transaction.severity,
    status: "Active",
    riskScore: transaction.score,
    transactionId: transaction.id,
    customerName: transaction.customerName,
    customerId: "CUS-SIMULATED",
    merchant: transaction.merchant,
    trigger: `Fraud engine detected a ${transaction.severity.toLowerCase()} risk transaction.`,
    reasons: transaction.reasons.map(
      (reason) => reason.code
    ),
    detectedAt: new Date().toLocaleString(),
  };

  const existingAlerts = JSON.parse(
    localStorage.getItem("fraudguard-alerts") || "[]"
  );

  localStorage.setItem(
    "fraudguard-alerts",
    JSON.stringify([
      alert,
      ...existingAlerts,
    ])
  );

  window.dispatchEvent(
    new CustomEvent("fraudguard-alert-created", {
      detail: alert,
    })
  );

  return alert;
}

// Local storage fallback
export function getStoredAlerts() {
  return JSON.parse(
    localStorage.getItem("fraudguard-alerts") || "[]"
  );
}