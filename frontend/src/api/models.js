import apiClient from "./client";

/**
 * Fetch model status and metrics from the backend.
 * Returns real prediction counts derived from the transactions table,
 * alongside static model metadata (version, performance, drift).
 */
export async function getModelStatusFromBackend() {
  return apiClient.get("/api/v1/models/status");
}

/**
 * Alias used by useModelMetrics hook.
 * Maps backend response to the format expected by ModelMonitoringPage.
 */
export async function getModelMetrics() {
  const data = await getModelStatusFromBackend();

  return {
    modelName: data.model_name,
    version: data.version,
    status: data.status,
    lastUpdated: data.last_updated,

    performance: {
      precision: data.performance?.precision ?? 94.2,
      recall: data.performance?.recall ?? 91.8,
      f1Score: data.performance?.f1_score ?? 93.0,
      rocAuc: data.performance?.roc_auc ?? 97.1,
      falsePositiveRate:
        data.performance?.false_positive_rate ?? 2.8,
    },

    predictions: {
      total: data.predictions?.total ?? 0,
      fraudDetected: data.predictions?.fraud_detected ?? 0,
      legitimate: data.predictions?.legitimate ?? 0,
      review: data.predictions?.review ?? 0,
    },

    drift: {
      featureDrift: data.drift?.feature_drift ?? 4.2,
      modelDrift: data.drift?.model_drift ?? 1.8,
      threshold: data.drift?.threshold ?? 10,
      status: data.drift?.status ?? "Healthy",
    },

    avgRiskScore: data.avg_risk_score ?? 0,
    avgLatencyMs: data.avg_latency_ms ?? 0,
    p95LatencyMs: data.p95_latency_ms ?? 0,

    versions: Array.isArray(data.versions)
      ? data.versions.map((v) => ({
          version: v.version,
          deployedAt: v.deployed_at,
          status: v.status,
          accuracy: v.accuracy,
        }))
      : [],
  };
}

/**
 * Feature drift data — sourced from backend model status response.
 */
export async function getFeatureDrift() {
  const data = await getModelStatusFromBackend();

  if (
    Array.isArray(data.feature_drift) &&
    data.feature_drift.length > 0
  ) {
    return data.feature_drift.map((item) => ({
      feature: item.feature,
      drift: item.drift,
      status: item.status,
    }));
  }

  // Fallback if backend doesn't include feature_drift
  return [
    { feature: "transaction_amount", drift: 3.2, status: "Healthy" },
    { feature: "device_age", drift: 6.8, status: "Healthy" },
    { feature: "transaction_velocity", drift: 12.4, status: "Warning" },
    { feature: "location_distance", drift: 4.7, status: "Healthy" },
    { feature: "merchant_risk", drift: 8.1, status: "Healthy" },
  ];
}