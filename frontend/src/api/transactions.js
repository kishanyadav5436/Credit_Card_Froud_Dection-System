const transactions = [
  {
    id: "TXN-98421",
    customerId: "CUS-48291",
    customerName: "Rahul Sharma",

    merchant: "Amazon India",
    merchantId: "MER-AMZ-102",
    category: "Electronics",

    amount: 82450,
    currency: "INR",

    riskScore: 97,
    severity: "Critical",

    status: "Blocked",
    decision: "BLOCK",

    date: "2026-09-06",
    timestamp: "2026-09-06 17:42:18",

    modelVersion: "fraud-v3.2",
    modelProbability: 0.97,

    device: {
      type: "Mobile",
      name: "iPhone 15 Pro",
      os: "iOS 18",
      browser: "Safari",
      fingerprint: "DEV-8A91F2",
    },

    location: {
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      ip: "103.21.45.18",
      latitude: 19.076,
      longitude: 72.8777,
    },

    reasons: [
      {
        code: "AMOUNT_ANOMALY",
        description: "Transaction amount is significantly higher than customer average.",
        impact: "High",
      },
      {
        code: "NEW_DEVICE",
        description: "Transaction originated from a previously unseen device.",
        impact: "High",
      },
      {
        code: "VELOCITY_HIGH",
        description: "Multiple transactions detected within a short time period.",
        impact: "Medium",
      },
      {
        code: "LOCATION_MISMATCH",
        description: "Transaction location differs significantly from recent activity.",
        impact: "Medium",
      },
    ],
  },

  {
    id: "TXN-98420",
    customerId: "CUS-19382",
    customerName: "Amit Verma",

    merchant: "Flipkart",
    merchantId: "MER-FLK-231",
    category: "Shopping",

    amount: 41280,
    currency: "INR",

    riskScore: 91,
    severity: "High",

    status: "Review",
    decision: "REVIEW",

    date: "2026-09-06",
    timestamp: "2026-09-06 17:38:04",

    modelVersion: "fraud-v3.2",
    modelProbability: 0.91,

    device: {
      type: "Desktop",
      name: "Windows Desktop",
      os: "Windows 11",
      browser: "Chrome",
      fingerprint: "DEV-719C21",
    },

    location: {
      city: "Delhi",
      state: "Delhi",
      country: "India",
      ip: "117.98.21.45",
      latitude: 28.6139,
      longitude: 77.209,
    },

    reasons: [
      {
        code: "NEW_DEVICE",
        description: "New device detected for this customer.",
        impact: "High",
      },
      {
        code: "SPENDING_PATTERN",
        description: "Spending pattern differs from historical behavior.",
        impact: "Medium",
      },
      {
        code: "VELOCITY_HIGH",
        description: "Several transactions occurred within a short interval.",
        impact: "Medium",
      },
    ],
  },

  {
    id: "TXN-98419",
    customerId: "CUS-82931",
    customerName: "Neha Singh",

    merchant: "Myntra",
    merchantId: "MER-MYN-553",
    category: "Fashion",

    amount: 18750,
    currency: "INR",

    riskScore: 78,
    severity: "High",

    status: "Review",
    decision: "REVIEW",

    date: "2026-09-06",
    timestamp: "2026-09-06 17:31:45",

    modelVersion: "fraud-v3.2",
    modelProbability: 0.78,

    device: {
      type: "Mobile",
      name: "Android Device",
      os: "Android 15",
      browser: "Chrome Mobile",
      fingerprint: "DEV-441AC2",
    },

    location: {
      city: "Lucknow",
      state: "Uttar Pradesh",
      country: "India",
      ip: "49.36.72.91",
      latitude: 26.8467,
      longitude: 80.9462,
    },

    reasons: [
      {
        code: "VELOCITY_HIGH",
        description: "Transaction frequency is above the customer's normal range.",
        impact: "High",
      },
      {
        code: "MERCHANT_RISK",
        description: "Merchant risk score is elevated.",
        impact: "Medium",
      },
    ],
  },

  {
    id: "TXN-98418",
    customerId: "CUS-29183",
    customerName: "Vikas Gupta",

    merchant: "Uber",
    merchantId: "MER-UBR-901",
    category: "Transport",

    amount: 4820,
    currency: "INR",

    riskScore: 34,
    severity: "Medium",

    status: "Approved",
    decision: "ALLOW",

    date: "2026-09-06",
    timestamp: "2026-09-06 17:24:12",

    modelVersion: "fraud-v3.2",
    modelProbability: 0.34,

    device: {
      type: "Mobile",
      name: "iPhone 14",
      os: "iOS 18",
      browser: "Safari",
      fingerprint: "DEV-913AF2",
    },

    location: {
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      ip: "122.164.21.87",
      latitude: 12.9716,
      longitude: 77.5946,
    },

    reasons: [
      {
        code: "LOCATION_ANOMALY",
        description: "Location is slightly different from recent transactions.",
        impact: "Low",
      },
    ],
  },

  {
    id: "TXN-98417",
    customerId: "CUS-73912",
    customerName: "Priya Mehta",

    merchant: "Apple Store",
    merchantId: "MER-APL-782",
    category: "Electronics",

    amount: 125000,
    currency: "INR",

    riskScore: 99,
    severity: "Critical",

    status: "Blocked",
    decision: "BLOCK",

    date: "2026-09-06",
    timestamp: "2026-09-06 17:18:36",

    modelVersion: "fraud-v3.2",
    modelProbability: 0.99,

    device: {
      type: "Unknown",
      name: "Unknown Device",
      os: "Unknown",
      browser: "Unknown",
      fingerprint: "UNKNOWN",
    },

    location: {
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      ip: "45.118.32.11",
      latitude: 17.385,
      longitude: 78.4867,
    },

    reasons: [
      {
        code: "AMOUNT_ANOMALY",
        description: "Extremely high transaction amount.",
        impact: "High",
      },
      {
        code: "UNKNOWN_DEVICE",
        description: "Device could not be identified.",
        impact: "High",
      },
      {
        code: "IMPOSSIBLE_TRAVEL",
        description: "Customer activity suggests impossible travel between locations.",
        impact: "Critical",
      },
      {
        code: "MERCHANT_RISK",
        description: "Merchant has elevated fraud risk.",
        impact: "Medium",
      },
    ],
  },
];

export async function getTransactions() {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return transactions;
}

export async function getTransactionById(id) {
  await new Promise((resolve) => setTimeout(resolve, 250));

  return transactions.find((transaction) => transaction.id === id);
}
export function saveSimulatedTransaction(transaction) {
  const existingTransactions = JSON.parse(
    localStorage.getItem("fraudguard-transactions") || "[]"
  );

  const savedTransaction = {
    id: transaction.id,
    customerName: transaction.customerName,
    merchant: transaction.merchant,
    amount: transaction.amount,
    riskScore: transaction.score,
    risk: transaction.severity,
    status:
      transaction.decision === "BLOCK"
        ? "Blocked"
        : transaction.decision === "REVIEW"
        ? "Review"
        : "Approved",
    decision: transaction.decision,
    model: "fraud-engine-v1",
    timestamp: transaction.timestamp,
    reasons: transaction.reasons.map(
      (reason) => reason.code
    ),
  };

  localStorage.setItem(
    "fraudguard-transactions",
    JSON.stringify([
      savedTransaction,
      ...existingTransactions,
    ])
  );

  window.dispatchEvent(
    new CustomEvent("fraudguard-transaction-created", {
      detail: savedTransaction,
    })
  );

  return savedTransaction;
}

export function getStoredTransactions() {
  return JSON.parse(
    localStorage.getItem("fraudguard-transactions") || "[]"
  );
}
export function getStoredTransactionById(id) {
  const transactions = getStoredTransactions();

  return transactions.find(
    (transaction) => transaction.id === id
  ) || null;
}
import apiClient from "./client";

export async function getTransactionFromBackend(
  transactionId
) {
  return apiClient.get(
    `/api/v1/transactions/${transactionId}`
  );
}