const dashboardData = {
  stats: {
    totalTransactions: 128420,
    fraudDetected: 6842,
    activeAlerts: 24,
    blockedTransactions: 3187,
    fraudRate: 5.32,
  },

  riskDistribution: [
    {
      name: "Low",
      value: 102840,
    },
    {
      name: "Medium",
      value: 18420,
    },
    {
      name: "High",
      value: 5840,
    },
    {
      name: "Critical",
      value: 1320,
    },
  ],

  recentTransactions: [
    {
      id: "TXN-98421",
      customer: "Rahul Sharma",
      merchant: "Amazon India",
      amount: 82450,
      riskScore: 97,
      status: "Blocked",
    },
    {
      id: "TXN-98420",
      customer: "Priya Singh",
      merchant: "Flipkart",
      amount: 42100,
      riskScore: 91,
      status: "Review",
    },
    {
      id: "TXN-98419",
      customer: "Amit Verma",
      merchant: "Myntra",
      amount: 18600,
      riskScore: 84,
      status: "Review",
    },
    {
      id: "TXN-98418",
      customer: "Neha Gupta",
      merchant: "Swiggy",
      amount: 12400,
      riskScore: 67,
      status: "Approved",
    },
  ],

  recentAlerts: [
    {
      id: "ALT-70021",
      type: "Multiple Card Attempts",
      severity: "Critical",
      riskScore: 98,
      status: "Active",
    },
    {
      id: "ALT-70020",
      type: "Unusual Device",
      severity: "High",
      riskScore: 91,
      status: "Active",
    },
    {
      id: "ALT-70019",
      type: "Velocity Threshold",
      severity: "High",
      riskScore: 84,
      status: "Active",
    },
  ],

  model: {
    version: "fraud-v3.2",
    status: "Healthy",
    precision: 94.2,
    recall: 91.8,
  },
};

export async function getDashboardData() {
  await new Promise((resolve) =>
    setTimeout(resolve, 300)
  );

  return dashboardData;
}