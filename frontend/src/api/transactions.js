import apiClient from "./client";

// Get transactions from FastAPI → Supabase
export async function getTransactions() {
  const response = await apiClient.get(
    "/api/v1/transactions"
  );

  console.log("TRANSACTIONS API RESPONSE:", response);

  const transactions = response.transactions || [];

  console.log("TRANSACTIONS FROM API:", transactions);

  return transactions.map((transaction) => ({
    id: transaction.transaction_id,
    customerId: transaction.customer_id,
    customerName: transaction.customer_id,

    merchant: transaction.merchant_id,
    merchantId: transaction.merchant_id,

    amount: Number(transaction.amount),
    currency: transaction.currency,

    riskScore: transaction.risk_score,
    severity: transaction.severity,

    status:
      transaction.decision === "BLOCK"
        ? "Blocked"
        : transaction.decision === "REVIEW"
        ? "Review"
        : "Approved",

    decision: transaction.decision,

    date: transaction.created_at
      ? transaction.created_at.split("T")[0]
      : "",

    timestamp: transaction.created_at || "",

    modelVersion: transaction.model_version,
    modelProbability: Number(transaction.probability || 0),

    reasons: Array.isArray(transaction.reasons)
      ? transaction.reasons
      : Array.isArray(transaction.reason_codes)
      ? transaction.reason_codes.map((code) => ({
          code,
          description: code,
          impact: "Unknown",
        }))
      : [],
  }));
}

// Get one transaction from FastAPI
export async function getTransactionById(id) {
  const transaction = await apiClient.get(
    `/api/v1/transactions/${id}`
  );

  if (!transaction) return null;

  return {
    id: transaction.transaction_id,
    customerId: transaction.customer_id,
    customerName: transaction.customer_id,

    merchant: transaction.merchant_id,
    merchantId: transaction.merchant_id,

    amount: Number(transaction.amount),
    currency: transaction.currency,

    riskScore: transaction.risk_score,
    severity: transaction.severity,

    status:
      transaction.decision === "BLOCK"
        ? "Blocked"
        : transaction.decision === "REVIEW"
        ? "Review"
        : "Approved",

    decision: transaction.decision,

    date: transaction.created_at
      ? transaction.created_at.split("T")[0]
      : "",

    timestamp: transaction.created_at || "",

    modelVersion: transaction.model_version,
    modelProbability: Number(transaction.probability || 0),

    reasons: Array.isArray(transaction.reasons)
      ? transaction.reasons
      : Array.isArray(transaction.reason_codes)
      ? transaction.reason_codes.map((code) => ({
          code,
          description: code,
          impact: "Unknown",
        }))
      : [],
  };
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

// Local storage support for Fraud Simulator
export function getStoredTransactions() {
  return JSON.parse(
    localStorage.getItem("fraudguard-transactions") || "[]"
  );
}

export function getStoredTransactionById(id) {
  const transactions = getStoredTransactions();

  return (
    transactions.find(
      (transaction) => transaction.id === id
    ) || null
  );
}

// Direct backend transaction lookup
export async function getTransactionFromBackend(
  transactionId
) {
  return apiClient.get(
    `/api/v1/transactions/${transactionId}`
  );
}