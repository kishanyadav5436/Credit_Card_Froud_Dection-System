import "./AlertsPage.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  ShieldAlert,
  Clock3,
  User,
  CreditCard,
  ArrowRight,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import PageHeader from "../components/layout/PageHeader";

import SeverityTag from "../components/domain/SeverityTag";
import RiskScoreBadge from "../components/domain/RiskScoreBadge";
import AlertTypeBadge from "../components/domain/AlertTypeBadge";

import Drawer from "../components/ui/Drawer";

import useAlerts from "../hooks/useAlerts";
import useAlertStream from "../hooks/useAlertStream";

function AlertsPage() {
  const {
    data: alerts = [],
    isLoading,
    isError,
  } = useAlerts();

  const {
    alerts: realtimeAlerts = [],
    connected,
  } = useAlertStream();

  const [activeTab, setActiveTab] = useState("Active");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const navigate = useNavigate();

  const allAlerts = useMemo(() => {
    return [...realtimeAlerts, ...alerts];
  }, [realtimeAlerts, alerts]);

  const filteredAlerts = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return allAlerts.filter((alert) => {
      const alertId = alert.id || "";
      const alertType = alert.type || alert.title || "";
      const transactionId = alert.transactionId || "";
      const customerName =
        alert.customerName || alert.customer || "";
      const merchant = alert.merchant || "";

      const matchesSearch =
        alertId.toLowerCase().includes(searchValue) ||
        alertType.toLowerCase().includes(searchValue) ||
        transactionId.toLowerCase().includes(searchValue) ||
        customerName.toLowerCase().includes(searchValue) ||
        merchant.toLowerCase().includes(searchValue);

      const matchesTab =
        activeTab === "All" ||
        alert.status === activeTab;

      const matchesSeverity =
        severity === "All" ||
        alert.severity === severity;

      return (
        matchesSearch &&
        matchesTab &&
        matchesSeverity
      );
    });
  }, [
    allAlerts,
    activeTab,
    search,
    severity,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSeverity("All");
    setActiveTab("Active");
  };

  const activeCount = allAlerts.filter(
    (alert) => alert.status === "Active"
  ).length;

  const criticalCount = allAlerts.filter(
    (alert) => alert.severity === "Critical"
  ).length;

  const resolvedCount = allAlerts.filter(
    (alert) => alert.status === "Resolved"
  ).length;

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <TopBar />

        <main className="dashboard-content">
          <PageHeader
            title="Fraud Alerts"
            description="Review suspicious activity requiring analyst attention."
          />

          {/* LIVE STREAM STATUS */}

          <div className="alert-stream-status">
            <span
              className={
                connected
                  ? "stream-dot connected"
                  : "stream-dot"
              }
            />

            <span>
              {connected
                ? "Live monitoring"
                : "Connecting..."}
            </span>
          </div>

          {/* SUMMARY */}

          <div className="alert-summary">
            <SummaryCard
              icon={BellRing}
              value={activeCount}
              label="Active alerts"
            />

            <SummaryCard
              icon={AlertTriangle}
              value={criticalCount}
              label="Critical alerts"
            />

            <SummaryCard
              icon={Clock3}
              value={filteredAlerts.length}
              label="Currently displayed"
            />

            <SummaryCard
              icon={CheckCircle2}
              value={resolvedCount}
              label="Resolved"
            />
          </div>

          {/* MAIN PANEL */}

          <section className="panel">
            <div className="alerts-toolbar">
              <div className="alert-tabs">
                {["Active", "Resolved", "All"].map(
                  (tab) => (
                    <button
                      type="button"
                      key={tab}
                      className={
                        activeTab === tab
                          ? "alert-tab active"
                          : "alert-tab"
                      }
                      onClick={() =>
                        setActiveTab(tab)
                      }
                    >
                      {tab}

                      {tab === "Active" && (
                        <span>{activeCount}</span>
                      )}
                    </button>
                  )
                )}
              </div>

              <div className="alert-actions">
                <div className="search-box">
                  <Search size={16} />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search alerts..."
                    aria-label="Search alerts"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  className="filter-select"
                  value={severity}
                  onChange={(event) =>
                    setSeverity(event.target.value)
                  }
                  aria-label="Filter by severity"
                >
                  <option value="All">
                    All Severity
                  </option>
                  <option value="Critical">
                    Critical
                  </option>
                  <option value="High">High</option>
                  <option value="Medium">
                    Medium
                  </option>
                  <option value="Low">Low</option>
                </select>

                <button
                  type="button"
                  className="refresh-button"
                  onClick={clearFilters}
                  title="Reset filters"
                  aria-label="Reset filters"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            <div className="alert-result-count">
              Showing{" "}
              <strong>{filteredAlerts.length}</strong>{" "}
              alerts
            </div>

            {/* TABLE */}

            {isLoading ? (
              <div className="loading-state">
                Loading alerts...
              </div>
            ) : isError ? (
              <div className="empty-state">
                <AlertTriangle size={30} />

                <h3>Unable to load alerts</h3>

                <p>
                  Please try again later.
                </p>
              </div>
            ) : filteredAlerts.length > 0 ? (
              <div className="table-wrapper">
                <table className="alerts-table">
                  <thead>
                    <tr>
                      <th>Alert</th>
                      <th>Severity</th>
                      <th>Risk</th>
                      <th>Transaction</th>
                      <th>Customer</th>
                      <th>Detected</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAlerts.map((alert) => {
                      const customerName =
                        alert.customerName ||
                        alert.customer ||
                        "Unknown Customer";

                      const alertType =
                        alert.type ||
                        alert.title ||
                        "Fraud Alert";

                      return (
                        <tr key={alert.id}>
                          <td>
                            <div>
                              <AlertTypeBadge
                                type={alertType}
                              />

                              <span className="alert-id">
                                {alert.id}
                              </span>
                            </div>
                          </td>

                          <td>
                            <SeverityTag
                              severity={alert.severity}
                            />
                          </td>

                          <td>
                            <RiskScoreBadge
                              score={alert.riskScore}
                            />
                          </td>

                          <td>
                            <strong>
                              {alert.transactionId}
                            </strong>
                          </td>

                          <td>
                            <div className="alert-customer">
                              <strong>
                                {customerName}
                              </strong>

                              <span>
                                {alert.customerId ||
                                  "—"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="table-time">
                              {alert.detectedAt ||
                                alert.createdAt ||
                                "Just now"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`alert-status ${(
                                alert.status || ""
                              ).toLowerCase()}`}
                            >
                              <span />
                              {alert.status}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="view-button"
                              onClick={() =>
                                setSelectedAlert(alert)
                              }
                              aria-label={`View ${alert.id}`}
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <BellRing size={30} />

                <h3>No alerts found</h3>

                <p>
                  Try changing your search or filters.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ALERT DRAWER */}

      <Drawer
        open={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert?.id || "Alert"}
      >
        {selectedAlert && (
          <AlertDetails
            alert={selectedAlert}
            navigate={navigate}
          />
        )}
      </Drawer>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="alert-summary-card">
      <div className="alert-summary-icon">
        <Icon size={19} />
      </div>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function AlertDetails({ alert, navigate }) {
  const alertType =
    alert.type || alert.title || "Fraud Alert";

  const customerName =
    alert.customerName ||
    alert.customer ||
    "Unknown Customer";

  const handleInvestigation = () => {
    navigate(
      `/investigations?transactionId=${encodeURIComponent(
        alert.transactionId
      )}&alertId=${encodeURIComponent(alert.id)}`
    );
  };

  return (
    <div className="alert-details">
      <div className="alert-detail-header">
        <AlertTypeBadge type={alertType} />

        <SeverityTag severity={alert.severity} />

        <div className="alert-detail-risk">
          <span>Risk Score</span>

          <RiskScoreBadge
            score={alert.riskScore}
          />
        </div>
      </div>

      <div className="drawer-section">
        <SectionTitle
          icon={BellRing}
          title="Alert Information"
        />

        <DetailRows
          rows={[
            ["Alert ID", alert.id],
            ["Alert Type", alertType],
            ["Severity", alert.severity],
            ["Status", alert.status],
            [
              "Detected",
              alert.detectedAt ||
                alert.createdAt ||
                "Just now",
            ],
          ]}
        />
      </div>

      <div className="drawer-section">
        <SectionTitle
          icon={ShieldAlert}
          title="Trigger"
        />

        <div className="trigger-box">
          {alert.trigger ||
            "Suspicious activity detected."}
        </div>
      </div>

      <div className="drawer-section">
        <SectionTitle
          icon={CreditCard}
          title="Related Transaction"
        />

        <DetailRows
          rows={[
            [
              "Transaction ID",
              alert.transactionId || "—",
            ],
            ["Merchant", alert.merchant || "—"],
          ]}
        />
      </div>

      <div className="drawer-section">
        <SectionTitle
          icon={User}
          title="Customer"
        />

        <div className="customer-card">
          <div className="customer-avatar">
            {customerName.charAt(0)}
          </div>

          <div>
            <strong>{customerName}</strong>

            <span>
              {alert.customerId || "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="drawer-section">
        <SectionTitle
          icon={AlertTriangle}
          title="Reason Codes"
        />

        <div className="alert-reason-list">
          {(alert.reasons || []).map(
            (reason, index) => (
              <div
                className="alert-reason"
                key={`${reason}-${index}`}
              >
                <span>{index + 1}</span>
                <p>{reason}</p>
              </div>
            )
          )}
        </div>
      </div>

      <button
        type="button"
        className="investigate-button"
        onClick={handleInvestigation}
      >
        Start Investigation
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}) {
  return (
    <div className="drawer-section-title">
      <Icon size={15} />
      <h3>{title}</h3>
    </div>
  );
}

function DetailRows({ rows }) {
  return (
    <div className="detail-rows">
      {rows.map(([label, value]) => (
        <div
          className="detail-row"
          key={label}
        >
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export default AlertsPage;