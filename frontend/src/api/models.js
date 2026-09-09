const modelMetrics = {
  modelName: "Fraud Detection Model",
  version: "fraud-v3.2",
  status: "Production",
  lastUpdated: "2026-09-07 18:30:00",

  performance: {
    precision: 94.2,
    recall: 91.8,
    f1Score: 93.0,
    rocAuc: 97.1,
    falsePositiveRate: 2.8,
  },

  predictions: {
    total: 128420,
    fraudDetected: 6842,
    legitimate: 121578,
  },

  drift: {
    featureDrift: 4.2,
    modelDrift: 1.8,
    threshold: 10,
    status: "Healthy",
  },

  versions: [
    {
      version: "fraud-v3.2",
      deployedAt: "2026-08-21",
      status: "Production",
      accuracy: 96.4,
    },
    {
      version: "fraud-v3.1",
      deployedAt: "2026-06-12",
      status: "Previous",
      accuracy: 95.8,
    },
    {
      version: "fraud-v3.0",
      deployedAt: "2026-03-18",
      status: "Previous",
      accuracy: 94.9,
    },
  ],
};

const featureDrift = [
  {
    feature: "transaction_amount",
    drift: 3.2,
    status: "Healthy",
  },
  {
    feature: "device_age",
    drift: 6.8,
    status: "Healthy",
  },
  {
    feature: "transaction_velocity",
    drift: 12.4,
    status: "Warning",
  },
  {
    feature: "location_distance",
    drift: 4.7,
    status: "Healthy",
  },
  {
    feature: "merchant_risk",
    drift: 8.1,
    status: "Healthy",
  },
];

export async function getModelMetrics() {
  await new Promise((resolve) =>
    setTimeout(resolve, 300)
  );

  return modelMetrics;
}

export async function getFeatureDrift() {
  await new Promise((resolve) =>
    setTimeout(resolve, 300)
  );

  return featureDrift;
}