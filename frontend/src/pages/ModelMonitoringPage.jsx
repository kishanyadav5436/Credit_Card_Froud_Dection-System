import "./ModelMonitoringPage.css";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Database,
  TrendingUp,
} from "lucide-react";

import useModelMetrics from "../hooks/useModelMetrics";
import useFeatureDrift from "../hooks/useFeatureDrift";

import ModelPerformanceChart from "../components/charts/ModelPerformanceChart";
import FeatureDriftChart from "../components/charts/FeatureDriftChart";

function ModelMonitoringPage() {
  const {
    data: metrics,
    isLoading: metricsLoading,
    isError: metricsError,
  } = useModelMetrics();

  const {
    data: featureDrift,
    isLoading: driftLoading,
    isError: driftError,
  } = useFeatureDrift();

  if (metricsLoading || driftLoading) {
    return (
      <main className="page-content">
        <div className="loading-state">
          <Activity size={22} />
          <span>Loading model monitoring...</span>
        </div>
      </main>
    );
  }

  if (metricsError || driftError || !metrics || !featureDrift) {
    return (
      <main className="page-content">
        <div className="error-state">
          <AlertTriangle size={22} />
          <div>
            <h2>Unable to load model monitoring</h2>
            <p>Please try again.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title-row">
            <BrainCircuit size={24} />
            <h1>Model Monitoring</h1>
          </div>

          <p>
            Monitor fraud detection model performance, predictions,
            and data drift.
          </p>
        </div>

        <div className="model-status">
          <CheckCircle2 size={17} />
          <span>{metrics.status}</span>
        </div>
      </div>

      {/* Model Information */}
      <section className="model-info-card">
        <div>
          <span>Model</span>
          <strong>{metrics.modelName}</strong>
        </div>

        <div>
          <span>Version</span>
          <strong>{metrics.version}</strong>
        </div>

        <div>
          <span>Last Updated</span>
          <strong>{metrics.lastUpdated}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{metrics.status}</strong>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="metrics-grid">
        <MetricCard
          title="Precision"
          value={`${metrics.performance.precision}%`}
          icon={<TrendingUp size={19} />}
        />

        <MetricCard
          title="Recall"
          value={`${metrics.performance.recall}%`}
          icon={<Activity size={19} />}
        />

        <MetricCard
          title="F1 Score"
          value={`${metrics.performance.f1Score}%`}
          icon={<BrainCircuit size={19} />}
        />

        <MetricCard
          title="ROC-AUC"
          value={`${metrics.performance.rocAuc}%`}
          icon={<TrendingUp size={19} />}
        />

        <MetricCard
          title="False Positive Rate"
          value={`${metrics.performance.falsePositiveRate}%`}
          icon={<AlertTriangle size={19} />}
        />
      </section>

      {/* Charts */}
      <section className="model-monitoring-charts">
        <ModelPerformanceChart
          performance={metrics.performance}
        />

        <FeatureDriftChart data={featureDrift} />
      </section>

      {/* Prediction Overview */}
      <section className="model-section">
        <div className="section-heading">
          <div>
            <h2>Prediction Overview</h2>
            <p>Current model prediction distribution</p>
          </div>
        </div>

        <div className="prediction-grid">
          <PredictionCard
            title="Total Predictions"
            value={metrics.predictions.total}
            icon={<Database size={20} />}
          />

          <PredictionCard
            title="Fraud Detected"
            value={metrics.predictions.fraudDetected}
            icon={<AlertTriangle size={20} />}
          />

          <PredictionCard
            title="Legitimate"
            value={metrics.predictions.legitimate}
            icon={<CheckCircle2 size={20} />}
          />
        </div>
      </section>

      {/* Model Drift */}
      <section className="model-section">
        <div className="section-heading">
          <div>
            <h2>Model Drift</h2>
            <p>Current drift status against configured threshold</p>
          </div>
        </div>

        <div className="drift-overview">
          <DriftItem
            label="Feature Drift"
            value={metrics.drift.featureDrift}
          />

          <DriftItem
            label="Model Drift"
            value={metrics.drift.modelDrift}
          />

          <DriftItem
            label="Threshold"
            value={metrics.drift.threshold}
          />

          <div className="drift-status">
            <span>Status</span>
            <strong>{metrics.drift.status}</strong>
          </div>
        </div>
      </section>

      {/* Feature Drift Table */}
      <section className="model-section">
        <div className="section-heading">
          <div>
            <h2>Feature Drift</h2>
            <p>Feature-level distribution changes</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Drift</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {featureDrift.map((item) => (
                <tr key={item.feature}>
                  <td>{item.feature}</td>
                  <td>{item.drift}%</td>
                  <td>
                    <span
                      className={
                        item.status === "Warning"
                          ? "status-pill warning"
                          : "status-pill success"
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Model Versions */}
      <section className="model-section">
        <div className="section-heading">
          <div>
            <h2>Model Versions</h2>
            <p>Deployment history of fraud detection models</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Deployed At</th>
                <th>Accuracy</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {metrics.versions.map((model) => (
                <tr key={model.version}>
                  <td>
                    <strong>{model.version}</strong>
                  </td>
                  <td>{model.deployedAt}</td>
                  <td>{model.accuracy}%</td>
                  <td>
                    <span
                      className={
                        model.status === "Production"
                          ? "status-pill success"
                          : "status-pill"
                      }
                    >
                      {model.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-card-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function PredictionCard({ title, value, icon }) {
  return (
    <div className="prediction-card">
      <div className="prediction-card-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value.toLocaleString()}</strong>
      </div>
    </div>
  );
}

function DriftItem({ label, value }) {
  return (
    <div className="drift-item">
      <span>{label}</span>
      <strong>{value}%</strong>
    </div>
  );
}

export default ModelMonitoringPage;