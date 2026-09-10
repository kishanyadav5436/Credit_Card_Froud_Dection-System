import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Database,
  TrendingUp,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";


import ModelPerformanceChart from "../components/charts/ModelPerformanceChart";
import FeatureDriftChart from "../components/charts/FeatureDriftChart";

import useModelMetrics from "../hooks/useModelMetrics";
import useFeatureDrift from "../hooks/useFeatureDrift";

function ModelMonitoring() {
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
      <div className="app-shell">
        <Sidebar />

        <div className="main-area">
          <TopBar />

          <div className="loading-state">
            Loading model monitoring...
          </div>
        </div>
      </div>
    );
  }

  if (
    metricsError ||
    driftError ||
    !metrics ||
    !featureDrift
  ) {
    return (
      <div className="app-shell">
        <Sidebar />

        <div className="main-area">
          <TopBar />

          <main className="dashboard-content">
            <div className="empty-state">
              <AlertTriangle size={32} />

              <h3>
                Model monitoring unavailable
              </h3>

              <p>
                Unable to load model monitoring data.
                Please try again.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <TopBar />

        <main className="dashboard-content">

          {/* PAGE HEADER */}

          <div className="page-header">
            <div>
              <h1>Model Monitoring</h1>

              <p>
                Monitor fraud model performance,
                drift, and health.
              </p>
            </div>
          </div>

          {/* MODEL HEADER */}

          <section className="model-monitor-header">
            <div className="model-monitor-title">
              <div className="model-monitor-icon">
                <BrainCircuit size={22} />
              </div>

              <div>
                <h2>{metrics.modelName}</h2>

                <p>
                  Version {metrics.version}
                </p>
              </div>
            </div>

            <div className="model-status">
              <CheckCircle2 size={16} />

              {metrics.status}
            </div>
          </section>

          {/* MODEL PERFORMANCE */}

          <section className="monitor-section">
            <div className="section-heading">
              <div>
                <h2>Model Performance</h2>

                <p>
                  Current production model metrics
                </p>
              </div>
            </div>

            <div className="metric-grid">
              <MetricCard
                icon={TrendingUp}
                label="Precision"
                value={`${metrics.performance.precision}%`}
              />

              <MetricCard
                icon={Activity}
                label="Recall"
                value={`${metrics.performance.recall}%`}
              />

              <MetricCard
                icon={BrainCircuit}
                label="F1 Score"
                value={`${metrics.performance.f1Score}%`}
              />

              <MetricCard
                icon={TrendingUp}
                label="ROC-AUC"
                value={`${metrics.performance.rocAuc}%`}
              />

              <MetricCard
                icon={AlertTriangle}
                label="False Positive Rate"
                value={`${metrics.performance.falsePositiveRate}%`}
              />
            </div>
          </section>

          {/* CHARTS */}

          <section className="monitor-section">
            <div className="model-charts-grid">

              <ModelPerformanceChart
                performance={metrics.performance}
              />

              <FeatureDriftChart
                data={featureDrift}
              />

            </div>
          </section>

          {/* PREDICTION OVERVIEW */}

          <section className="monitor-section">
            <div className="section-heading">
              <div>
                <h2>Prediction Overview</h2>

                <p>
                  Recent model prediction activity
                </p>
              </div>
            </div>

            <div className="prediction-grid">
              <PredictionCard
                icon={Database}
                label="Total Transactions"
                value={metrics.predictions.total}
              />

              <PredictionCard
                icon={AlertTriangle}
                label="Fraud Detected"
                value={metrics.predictions.fraudDetected}
              />

              <PredictionCard
                icon={CheckCircle2}
                label="Legitimate"
                value={metrics.predictions.legitimate}
              />
            </div>
          </section>

          {/* MODEL DRIFT */}

          <section className="monitor-section">
            <div className="section-heading">
              <div>
                <h2>Model Drift</h2>

                <p>
                  Monitor changes affecting model
                  reliability.
                </p>
              </div>

              <div className="drift-status">
                <CheckCircle2 size={15} />

                {metrics.drift.status}
              </div>
            </div>

            <div className="drift-overview">

              <div className="drift-card">
                <span>Feature Drift</span>

                <strong>
                  {metrics.drift.featureDrift}%
                </strong>

                <small>
                  Threshold:{" "}
                  {metrics.drift.threshold}%
                </small>
              </div>

              <div className="drift-card">
                <span>Model Drift</span>

                <strong>
                  {metrics.drift.modelDrift}%
                </strong>

                <small>
                  Threshold:{" "}
                  {metrics.drift.threshold}%
                </small>
              </div>

            </div>
          </section>

          {/* FEATURE DRIFT TABLE */}

          <section className="monitor-section">
            <div className="section-heading">
              <div>
                <h2>Feature Drift</h2>

                <p>
                  Feature-level distribution changes.
                </p>
              </div>
            </div>

            <div className="monitor-table-wrapper">
              <table className="monitor-table">
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

                      <td>
                        <strong>
                          {item.feature}
                        </strong>
                      </td>

                      <td>
                        {item.drift}%
                      </td>

                      <td>
                        <span
                          className={
                            item.status === "Warning"
                              ? "monitor-warning"
                              : "monitor-healthy"
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

          {/* MODEL VERSIONS */}

          <section className="monitor-section">
            <div className="section-heading">
              <div>
                <h2>Model Versions</h2>

                <p>
                  Deployment history of fraud models.
                </p>
              </div>
            </div>

            <div className="monitor-table-wrapper">
              <table className="monitor-table">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Deployed</th>
                    <th>Accuracy</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {metrics.versions.map((model) => (
                    <tr key={model.version}>

                      <td>
                        <strong>
                          {model.version}
                        </strong>
                      </td>

                      <td>
                        {model.deployedAt}
                      </td>

                      <td>
                        {model.accuracy}%
                      </td>

                      <td>
                        <span
                          className={
                            model.status ===
                            "Production"
                              ? "monitor-healthy"
                              : "monitor-neutral"
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
      </div>
    </div>
  );
}

/* ==========================================
   METRIC CARD
========================================== */

function MetricCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="monitor-metric-card">

      <div className="monitor-card-icon">
        <Icon size={18} />
      </div>

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}

/* ==========================================
   PREDICTION CARD
========================================== */

function PredictionCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="prediction-card">

      <div className="prediction-icon">
        <Icon size={18} />
      </div>

      <div>
        <span>{label}</span>

        <strong>
          {Number(value).toLocaleString("en-IN")}
        </strong>
      </div>

    </div>
  );
}

export default ModelMonitoring;