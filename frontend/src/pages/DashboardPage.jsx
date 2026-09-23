import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import "./DashboardPage.css";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import PageHeader from "../components/layout/PageHeader";
import StatCard from "../components/ui/StatCard";
import RiskScoreBadge from "../components/domain/RiskScoreBadge";
import SeverityTag from "../components/domain/SeverityTag";
import StatusPill from "../components/domain/StatusPill";

import { getDashboardStats } from "../api/dashboard";

/* ─── Helpers ───────────────────────────────────────────── */

function safeDecisionToStatus(decision) {
  if (!decision) return "Approved";
  if (decision === "BLOCK") return "Blocked";
  if (decision === "REVIEW") return "Review";
  return "Approved";
}

/* ─── Page ──────────────────────────────────────────────── */

function DashboardPage() {
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const transactions = stats?.transactions || {};
  const alerts = stats?.alerts || {};
  const investigations = stats?.investigations || {};
  const recentTransactions = Array.isArray(
    stats?.recent_transactions
  )
    ? stats.recent_transactions
    : [];
  const recentAlerts = Array.isArray(stats?.recent_alerts)
    ? stats.recent_alerts
    : [];

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <TopBar />

        <main className="dashboard-content">
          <PageHeader
            title="Fraud Detection Overview"
            description="Real-time monitoring of transaction risk and fraud activity."
            action={
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => refetch()}
                  title="Refresh dashboard"
                >
                  <RefreshCw size={15} />
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => navigate("/investigations")}
                >
                  View investigations
                  <ArrowRight size={17} />
                </button>
              </div>
            }
          />

          {/* STATS GRID */}

          {isLoading ? (
            <div className="loading-state">
              Loading dashboard...
            </div>
          ) : isError ? (
            <div
              style={{
                padding: "16px",
                background: "#fee2e2",
                borderRadius: "10px",
                color: "#b91c1c",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              Failed to load dashboard statistics. Make sure the backend is
              running.
            </div>
          ) : null}

          <section className="stats-grid">
            <StatCard
              title="Total Transactions"
              value={
                isLoading
                  ? "—"
                  : (transactions.total ?? 0).toLocaleString()
              }
              description="all time from database"
              trend={null}
              icon={CreditCard}
            />

            <StatCard
              title="Fraud / Blocked"
              value={
                isLoading
                  ? "—"
                  : (transactions.blocked ?? 0).toLocaleString()
              }
              description={`fraud rate: ${transactions.fraud_rate ?? 0}%`}
              trend={null}
              icon={ShieldAlert}
            />

            <StatCard
              title="Under Review"
              value={
                isLoading
                  ? "—"
                  : (transactions.review ?? 0).toLocaleString()
              }
              description="pending analyst decision"
              trend={null}
              icon={AlertTriangle}
            />

            <StatCard
              title="Active Alerts"
              value={
                isLoading
                  ? "—"
                  : (alerts.active ?? 0).toLocaleString()
              }
              description={`${alerts.total ?? 0} total alerts`}
              trend={null}
              icon={Activity}
            />
          </section>

          {/* SECONDARY STATS */}

          {!isLoading && (
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <MiniStat
                icon={CheckCircle2}
                label="Approved"
                value={(transactions.approved ?? 0).toLocaleString()}
                color="#15803d"
                bg="#f0fdf4"
              />

              <MiniStat
                icon={TrendingUp}
                label="Avg Risk Score"
                value={`${transactions.avg_risk_score ?? 0}`}
                color="#2563eb"
                bg="#eff6ff"
              />

              <MiniStat
                icon={ShieldAlert}
                label="Open Investigations"
                value={(investigations.open ?? 0).toLocaleString()}
                color="#c2410c"
                bg="#fff7ed"
              />
            </section>
          )}

          <section className="dashboard-grid">
            {/* RECENT ALERTS */}

            <div className="panel alerts-panel">
              <div className="panel-header">
                <div>
                  <h2>Recent Alerts</h2>
                  <p>Latest fraud alerts from the database</p>
                </div>

                <span className="alert-count">
                  {alerts.active ?? 0}
                </span>
              </div>

              <div className="alert-list">
                {recentAlerts.length === 0 ? (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      padding: "12px 0",
                    }}
                  >
                    No alerts yet. Run a fraud check to
                    generate alerts.
                  </p>
                ) : (
                  recentAlerts.map((alert) => (
                    <button
                      key={alert.alert_id}
                      type="button"
                      className="alert-item"
                      onClick={() =>
                        navigate(
                          `/alerts?alertId=${alert.alert_id}`
                        )
                      }
                    >
                      <SeverityTag
                        severity={alert.severity || "Low"}
                      />

                      <div className="alert-info">
                        <strong>
                          {alert.type || "Fraud Risk Detected"}
                        </strong>

                        <span>
                          {alert.transaction_id} ·{" "}
                          {alert.detected_at
                            ? new Date(
                                alert.detected_at
                              ).toLocaleString()
                            : ""}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <button
                type="button"
                className="text-button"
                onClick={() => navigate("/alerts")}
              >
                View all alerts
                <ArrowRight size={15} />
              </button>
            </div>

            {/* SUMMARY PANEL */}

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>Quick Summary</h2>
                  <p>System overview from database</p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  marginTop: "8px",
                }}
              >
                <SummaryRow
                  label="High Risk Transactions"
                  value={transactions.high_risk ?? 0}
                  badge="risk"
                />

                <SummaryRow
                  label="Total Investigations"
                  value={investigations.total ?? 0}
                />

                <SummaryRow
                  label="Total Alerts"
                  value={alerts.total ?? 0}
                />

                <SummaryRow
                  label="Fraud Rate"
                  value={`${transactions.fraud_rate ?? 0}%`}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  className="secondary-button"
                  onClick={() =>
                    navigate("/fraud-simulator")
                  }
                >
                  <CreditCard size={14} />
                  Run fraud check
                </button>

                <button
                  className="secondary-button"
                  onClick={() => navigate("/transactions")}
                >
                  All transactions
                </button>
              </div>
            </div>
          </section>

          {/* RECENT TRANSACTIONS TABLE */}

          <section className="panel transactions-panel">
            <div className="panel-header">
              <div>
                <h2>Recent Transactions</h2>
                <p>Latest transactions from the database</p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/transactions")}
              >
                View all transactions
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div
                style={{
                  padding: "32px 0",
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "13px",
                }}
              >
                No transactions yet. Use the{" "}
                <strong>Fraud Simulator</strong> to create
                test transactions.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Merchant</th>
                      <th>Amount</th>
                      <th>Risk Score</th>
                      <th>Severity</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr
                        key={
                          transaction.transaction_id ||
                          transaction.id
                        }
                        className="clickable-row"
                        onClick={() =>
                          navigate(
                            `/transactions`
                          )
                        }
                      >
                        <td>
                          <div className="transaction-id">
                            <strong>
                              {transaction.transaction_id ||
                                transaction.id}
                            </strong>

                            <span>
                              {transaction.customer_id ||
                                transaction.customerId}
                            </span>
                          </div>
                        </td>

                        <td>
                          {transaction.merchant_id ||
                            transaction.merchant}
                        </td>

                        <td>
                          <strong>
                            ₹
                            {Number(
                              transaction.amount || 0
                            ).toLocaleString("en-IN")}
                          </strong>
                        </td>

                        <td>
                          <RiskScoreBadge
                            score={
                              transaction.risk_score ??
                              transaction.riskScore ??
                              0
                            }
                          />
                        </td>

                        <td>
                          <SeverityTag
                            severity={
                              transaction.severity || "Low"
                            }
                          />
                        </td>

                        <td>
                          <StatusPill
                            status={safeDecisionToStatus(
                              transaction.decision
                            )}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

/* ─── Small components ──────────────────────────────────── */

function MiniStat({ icon: Icon, label, value, color, bg }) {
  return (
    <div
      style={{
        background: bg,
        borderRadius: "10px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          color,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Icon size={18} />
      </div>

      <div>
        <div
          style={{
            fontSize: "10px",
            color: "#6b7280",
            marginBottom: "3px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </div>

        <strong style={{ fontSize: "18px", color: "#111827" }}>
          {value}
        </strong>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <span style={{ fontSize: "12px", color: "#6b7280" }}>
        {label}
      </span>

      <strong style={{ fontSize: "13px" }}>{value}</strong>
    </div>
  );
}

export default DashboardPage;
