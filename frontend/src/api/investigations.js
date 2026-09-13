const investigations = {
  "TXN-98421": {
    transactionId: "TXN-98421",
    alertId: "ALT-70021",

    customer: {
      id: "CUS-48291",
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "+91 XXXXX XXXXX",
      accountAge: "4 years",
      averageTransaction: 8500,
      totalTransactions: 428,
      previousFraudCases: 0,
    },

    transaction: {
      amount: 82450,
      merchant: "Amazon India",
      category: "Electronics",
      location: "Mumbai, Maharashtra",
      timestamp: "2026-09-07 19:31:42",
      paymentMethod: "Credit Card",
    },

    risk: {
      score: 97,
      level: "Critical",
      decision: "BLOCK",
      modelVersion: "fraud-v3.2",
      probability: 0.97,
    },

    device: {
      current: {
        device: "iPhone 15 Pro",
        os: "iOS 18",
        browser: "Safari",
        fingerprint: "DEV-8A91F2",
        firstSeen: "2026-09-07",
        trusted: false,
      },

      history: [
        {
          device: "iPhone 14",
          os: "iOS 18",
          location: "Mumbai",
          lastSeen: "2026-08-31",
          trusted: true,
        },
        {
          device: "MacBook Pro",
          os: "macOS",
          location: "Mumbai",
          lastSeen: "2026-08-28",
          trusted: true,
        },
        {
          device: "iPhone 15 Pro",
          os: "iOS 18",
          location: "Delhi",
          lastSeen: "Never",
          trusted: false,
        },
      ],
    },

    merchant: {
      name: "Amazon India",
      id: "MER-AMZ-102",
      category: "Electronics",
      riskScore: 42,
      totalTransactions: 128420,
      fraudRate: "0.82%",
    },

    customerTransactions: [
      {
        id: "TXN-98421",
        amount: 82450,
        merchant: "Amazon India",
        status: "Blocked",
        risk: 97,
        time: "19:31",
      },
      {
        id: "TXN-98112",
        amount: 4200,
        merchant: "Swiggy",
        status: "Approved",
        risk: 12,
        time: "18:04",
      },
      {
        id: "TXN-97882",
        amount: 6800,
        merchant: "Amazon India",
        status: "Approved",
        risk: 19,
        time: "Yesterday",
      },
      {
        id: "TXN-97122",
        amount: 3900,
        merchant: "Uber",
        status: "Approved",
        risk: 8,
        time: "2 days ago",
      },
    ],

    reasons: [
      {
        code: "AMOUNT_ANOMALY",
        impact: "High",
        description:
          "Transaction amount is 9.7x higher than customer average.",
      },
      {
        code: "NEW_DEVICE",
        impact: "High",
        description:
          "Transaction originated from an untrusted device.",
      },
      {
        code: "LOCATION_MISMATCH",
        impact: "Medium",
        description:
          "Current location differs from the customer's recent activity.",
      },
      {
        code: "VELOCITY_HIGH",
        impact: "Medium",
        description:
          "Multiple transaction attempts detected within a short period.",
      },
    ],
  },
};

export async function getInvestigation(transactionId) {
  await new Promise((resolve) =>
    setTimeout(resolve, 300)
  );

  const simulatedTransactions = JSON.parse(
    localStorage.getItem(
      "fraudguard-transactions"
    ) || "[]"
  );

  const simulatedTransaction =
    simulatedTransactions.find(
      (transaction) =>
        transaction.id === transactionId
    );

  if (simulatedTransaction) {
    return createInvestigationFromTransaction(
      simulatedTransaction
    );
  }

  // Keep your existing mock investigation logic below.
}
export async function saveInvestigationDecision(
  transactionId,
  decision,
  note
) {
  await new Promise((resolve) =>
    setTimeout(resolve, 700)
  );

  const savedDecision = {
    transactionId,
    decision,
    note,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    `investigation-decision-${transactionId}`,
    JSON.stringify(savedDecision)
  );

  return savedDecision;
}

export function getSavedDecision(transactionId) {
  const saved = localStorage.getItem(
    `investigation-decision-${transactionId}`
  );

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error(
      "Failed to read saved investigation decision:",
      error
    );

    return null;
  }
}
export function createInvestigationFromTransaction(
  transaction
) {
  return {
    alertId: null,

    customer: {
      name: transaction.customerName,
      id: "CUS-SIMULATED",
      accountAge: "N/A",
      avgTransaction: transaction.amount,
      totalTransactions: 1,
      previousFraudCases: 0,
    },

    transaction: {
      id: transaction.id,
      amount: transaction.amount,
      merchant: transaction.merchant,
      category: "Simulated",
      location: "Unknown",
      timestamp: transaction.timestamp,
      paymentMethod: "Credit Card",
    },

    risk: {
      score: transaction.riskScore,
      severity: transaction.risk,
      decision: transaction.decision,
      model: "fraud-engine-v1",
      probability: transaction.riskScore / 100,
    },

    device: {
      current: {
        name: transaction.isNewDevice
          ? "New Device"
          : "Known Device",
        os: "Unknown",
        browser: "Unknown",
        fingerprint: "SIMULATED",
        firstSeen: transaction.timestamp,
        trusted: !transaction.isNewDevice,
      },
      history: [],
    },

    merchant: {
      name: transaction.merchant,
      id: "MER-SIMULATED",
      category: "Simulated",
      riskScore: 0,
      totalTransactions: 0,
      fraudRate: 0,
    },

    customerTransactions: [],

    reasons: transaction.reasons.map(
      (reason) => ({
        code: reason.code,
        severity:
          reason.score >= 25
            ? "High"
            : "Medium",
        description: reason.label,
      })
    ),
  };
}