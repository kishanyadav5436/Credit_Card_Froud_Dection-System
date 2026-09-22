import apiClient from "./client";

export async function getInvestigation(
  transactionId
) {
  if (!transactionId) {
    return null;
  }

  const investigations =
    await getInvestigationsFromBackend();

  const investigation =
    investigations.find(
      (item) =>
        item.transactionId === transactionId
    );

  return investigation || null;
}

export async function getInvestigationsFromBackend() {
  const response = await apiClient.get(
    "/api/v1/investigations"
  );

  const investigations =
    Array.isArray(response.investigations)
      ? response.investigations
      : [];

  return investigations.map(
    normalizeInvestigation
  );
}

export async function createInvestigation(
  data
) {
  const response = await apiClient.post(
    "/api/v1/investigations",
    data
  );

  return normalizeInvestigation(
    response
  );
}

export async function saveInvestigationDecision(
  investigationId,
  decision,
  note
) {
  if (!investigationId) {
    throw new Error(
      "Investigation ID is required"
    );
  }

  const response = await apiClient.post(
    `/api/v1/investigations/${investigationId}/decision`,
    {
      decision,
      note: note || "",
      analyst: "Analyst",
    }
  );

  return response;
}

function normalizeInvestigation(
  investigation
) {
  const transaction =
    investigation.transaction || {};

  const customer =
    investigation.customer || {};

  const device =
    investigation.device || {};

  const merchant =
    investigation.merchant || {};

  const risk =
    investigation.risk || {};

  return {
    id:
      investigation.investigation_id,

    investigationId:
      investigation.investigation_id,

    transactionId:
      transaction.id ||
      investigation.transaction_id,

    alertId:
      investigation.alert_id || null,

    status:
      investigation.status || "Open",

    decision:
      risk.decision ||
      investigation.decision ||
      null,

    analyst:
      investigation.analyst || null,

    analystNote:
      investigation.analyst_note || "",

    createdAt:
      investigation.created_at || null,

    updatedAt:
      investigation.updated_at || null,

    customer: {
      id:
        customer.id || null,

      name:
        customer.name ||
        "Unknown Customer",

      email:
        customer.email || null,

      phone:
        customer.phone || null,

      accountAge:
        customer.account_age ||
        "Unknown",

      averageTransaction:
        Number(
          customer.avg_transaction || 0
        ),

      totalTransactions:
        Number(
          customer.total_transactions || 0
        ),

      previousFraudCases:
        Number(
          customer.previous_fraud_cases || 0
        ),
    },

    transaction: {
      id:
        transaction.id || null,

      amount:
        Number(
          transaction.amount || 0
        ),

      merchant:
        transaction.merchant ||
        "Unknown",

      category:
        transaction.category ||
        "Unknown",

      location:
        transaction.location ||
        "Unknown",

      timestamp:
        transaction.timestamp || "",

      paymentMethod:
        transaction.payment_method ||
        "Credit Card",
    },

    risk: {
      score:
        Number(risk.score || 0),

      level:
        risk.severity || "Low",

      severity:
        risk.severity || "Low",

      decision:
        risk.decision || "APPROVE",

      modelVersion:
        risk.model ||
        "fraud-engine-v1",

      probability:
        Number(
          risk.probability || 0
        ),
    },

    device: {
      current:
        device.current || {},

      history:
        Array.isArray(device.history)
          ? device.history
          : [],
    },

    merchant: {
      id:
        merchant.id || null,

      name:
        merchant.name || "Unknown",

      category:
        merchant.category || "Unknown",

      riskScore:
        Number(
          merchant.risk_score || 0
        ),

      totalTransactions:
        Number(
          merchant.total_transactions || 0
        ),

      fraudRate:
        merchant.fraud_rate || "0",
    },

    customerTransactions:
      Array.isArray(
        investigation.customer_transactions
      )
        ? investigation.customer_transactions
        : [],

    reasons:
      Array.isArray(
        investigation.reasons
      )
        ? investigation.reasons.map(
            (reason) => ({
              code: reason.code,

              impact:
                reason.impact ||
                (reason.score >= 25
                  ? "High"
                  : "Medium"),

              description:
                reason.label ||
                reason.description ||
                reason.code,

              score:
                reason.score || 0,
            })
          )
        : [],
  };
}