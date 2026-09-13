const alerts = [
  {
    id: "ALT-70021",
    type: "Multiple Card Attempts",
    severity: "Critical",
    status: "Active",
    riskScore: 98,

    transactionId: "TXN-98421",
    customerId: "CUS-48291",
    customerName: "Rahul Sharma",

    trigger: "3 transactions attempted within 2 minutes",

    detectedAt: "2026-09-07 19:31:42",

    merchant: "Amazon India",

    reasons: [
      "Multiple payment attempts",
      "Unusual transaction velocity",
      "High transaction amount",
      "New device detected",
    ],
  },

  {
    id: "ALT-70020",
    type: "Unusual Device",
    severity: "High",
    status: "Active",
    riskScore: 91,

    transactionId: "TXN-98420",
    customerId: "CUS-19382",
    customerName: "Amit Verma",

    trigger: "Transaction originated from a new device",

    detectedAt: "2026-09-07 19:27:18",

    merchant: "Flipkart",

    reasons: [
      "New device fingerprint",
      "Device not seen in previous transactions",
      "Unusual spending pattern",
    ],
  },

  {
    id: "ALT-70019",
    type: "Velocity Threshold",
    severity: "High",
    status: "Active",
    riskScore: 84,

    transactionId: "TXN-98419",
    customerId: "CUS-82931",
    customerName: "Neha Singh",

    trigger: "Transaction frequency exceeded configured threshold",

    detectedAt: "2026-09-07 19:21:03",

    merchant: "Myntra",

    reasons: [
      "High transaction frequency",
      "Multiple transactions within short interval",
    ],
  },

  {
    id: "ALT-70018",
    type: "Location Anomaly",
    severity: "Medium",
    status: "Active",
    riskScore: 67,

    transactionId: "TXN-98418",
    customerId: "CUS-29183",
    customerName: "Vikas Gupta",

    trigger: "Transaction location differs from recent activity",

    detectedAt: "2026-09-07 19:15:29",

    merchant: "Uber",

    reasons: [
      "Location mismatch",
      "Unusual geographic pattern",
    ],
  },

  {
    id: "ALT-70017",
    type: "Impossible Travel",
    severity: "Critical",
    status: "Resolved",
    riskScore: 96,

    transactionId: "TXN-98417",
    customerId: "CUS-73912",
    customerName: "Priya Mehta",

    trigger: "Customer activity detected from geographically impossible locations",

    detectedAt: "2026-09-07 18:52:11",

    merchant: "Apple Store",

    reasons: [
      "Impossible travel detected",
      "Unknown device",
      "High-value transaction",
      "Merchant risk elevated",
    ],
  },

  {
    id: "ALT-70016",
    type: "Merchant Risk",
    severity: "Medium",
    status: "Resolved",
    riskScore: 59,

    transactionId: "TXN-98416",
    customerId: "CUS-18291",
    customerName: "Arjun Singh",

    trigger: "Merchant fraud risk exceeded configured threshold",

    detectedAt: "2026-09-07 18:41:55",

    merchant: "Online Marketplace",

    reasons: [
      "Elevated merchant risk",
      "Recent merchant fraud activity",
    ],
  },
];

export async function getAlerts() {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return alerts;
}

export async function getAlertById(id) {
  await new Promise((resolve) => setTimeout(resolve, 250));

  return alerts.find((alert) => alert.id === id);
}
export function subscribeToAlerts(callback) {
  const interval = setInterval(() => {
    const newAlert = {
      id: `ALT-${Date.now()}`,
      title: "Real-Time Fraud Alert",
      severity: "Critical",
      status: "Active",
      riskScore: Math.floor(Math.random() * 10) + 90,
      transactionId: "TXN-98421",
      customer: "Rahul Sharma",
      trigger: "Suspicious transaction detected",
      merchant: "Amazon India",
      reasons: [
        "VELOCITY_HIGH",
        "AMOUNT_ANOMALY",
      ],
      createdAt: new Date().toISOString(),
    };

    callback(newAlert);
  }, 15000);

  return () => clearInterval(interval);
}
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

export function getStoredAlerts() {
  return JSON.parse(
    localStorage.getItem("fraudguard-alerts") || "[]"
  );
}