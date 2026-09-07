import { useMemo, useState } from "react";
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

function AlertsPage() {
  const { data: alerts = [], isLoading } = useAlerts();

  const [activeTab, setActiveTab] = useState("Active");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        alert.id.toLowerCase().includes(searchValue) ||
        alert.type.toLowerCase().includes(searchValue) ||
        alert.transactionId
          .toLowerCase()
          .includes(searchValue) ||
        alert.customerName
          .toLowerCase()
          .includes(searchValue) ||
        alert.merchant.toLowerCase().includes(searchValue);

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
  }, [alerts, activeTab, search, severity]);

  const clearFilters = () => {
    setSearch("");
    setSeverity("All");
    setActiveTab("Active");
  };

  const activeCount = alerts.filter(
    (alert) => alert.status === "Active"
  ).length;

  const criticalCount = alerts.filter(
    (alert) => alert.severity === "Critical"
  ).length;

  const resolvedCount = alerts.filter(
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
            {/* TABS */}

            <div className="alerts-toolbar">
              <div className="alert-tabs">
                {["Active", "Resolved", "All"].map(
                  (tab) => (
                    <button
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
                  />

                  {search && (
                    <button
                      onClick={() => setSearch("")}
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
                >
                  <option value="All">
                    All Severity
                  </option>
                  <option value="Critical">
                    Critical
                  </option>
                  <option value="High">
                    High
                  </option>
                  <option value="Medium">
                    Medium
                  </option>
                  <option value="Low">
                    Low
                  </option>
                </select>

                <button
                  className="refresh-button"
                  onClick={clearFilters}
                  title="Reset filters"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            <div className="alert-result-count">
              Showing{" "}
              <strong>
                {filteredAlerts.length}
              </strong>{" "}
              alerts
            </div>

            {/* TABLE */}

            {isLoading ? (
              <div className="loading-state">
                Loading alerts...
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
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          <div>
                            <AlertTypeBadge
                              type={alert.type}
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
                              {alert.customerName}
                            </strong>

                            <span>
                              {alert.customerId}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="table-time">
                            {alert.detectedAt}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`alert-status ${alert.status.toLowerCase()}`}
                          >
                            <span></span>
                            {alert.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="view-button"
                            onClick={() =>
                              setSelectedAlert(alert)
                            }
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
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
          <AlertDetails alert={selectedAlert} />
        )}
      </Drawer>
    </div>
  );
}

/* ==========================================
   SUMMARY CARD
========================================== */

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

/* ==========================================
   ALERT DETAILS
========================================== */

function AlertDetails({ alert }) {
  return (
    <div className="alert-details">
      {/* HEADER */}

      <div className="alert-detail-header">
        <AlertTypeBadge type={alert.type} />

        <SeverityTag severity={alert.severity} />

        <div className="alert-detail-risk">
          <span>Risk Score</span>

          <RiskScoreBadge
            score={alert.riskScore}
          />
        </div>
      </div>

      {/* INFORMATION */}

      <div className="drawer-section">
        <SectionTitle
          icon={BellRing}
          title="Alert Information"
        />

        <DetailRows
          rows={[
            ["Alert ID", alert.id],
            ["Alert Type", alert.type],
            ["Severity", alert.severity],
            ["Status", alert.status],
            ["Detected", alert.detectedAt],
          ]}
        />
      </div>

      {/* TRIGGER */}

      <div className="drawer-section">
        <SectionTitle
          icon={ShieldAlert}
          title="Trigger"
        />

        <div className="trigger-box">
          {alert.trigger}
        </div>
      </div>

      {/* TRANSACTION */}

      <div className="drawer-section">
        <SectionTitle
          icon={CreditCard}
          title="Related Transaction"
        />

        <DetailRows
          rows={[
            [
              "Transaction ID",
              alert.transactionId,
            ],
            ["Merchant", alert.merchant],
          ]}
        />
      </div>

      {/* CUSTOMER */}

      <div className="drawer-section">
        <SectionTitle
          icon={User}
          title="Customer"
        />

        <div className="customer-card">
          <div className="customer-avatar">
            {alert.customerName.charAt(0)}
          </div>

          <div>
            <strong>{alert.customerName}</strong>

            <span>{alert.customerId}</span>
          </div>
        </div>
      </div>

      {/* REASONS */}

      <div className="drawer-section">
        <SectionTitle
          icon={AlertTriangle}
          title="Reason Codes"
        />

        <div className="alert-reason-list">
          {alert.reasons.map((reason, index) => (
            <div
              className="alert-reason"
              key={reason}
            >
              <span>{index + 1}</span>
              <p>{reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ACTION */}

      <button className="investigate-button">
        Start Investigation
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

/* ==========================================
   SECTION TITLE
========================================== */

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

/* ==========================================
   DETAIL ROWS
========================================== */

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