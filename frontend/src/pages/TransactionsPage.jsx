

import "./TransactionsPage.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  Eye,
  X,
  CalendarDays,
  ChevronDown,
  ShieldAlert,
  Smartphone,
  MapPin,
  Store,
  BrainCircuit,
  User,
  CreditCard,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import PageHeader from "../components/layout/PageHeader";

import RiskScoreBadge from "../components/domain/RiskScoreBadge";
import SeverityTag from "../components/domain/SeverityTag";
import StatusPill from "../components/domain/StatusPill";

import Drawer from "../components/ui/Drawer";
import useTransactions from "../hooks/useTransactions";

function TransactionsPage() {
  const navigate = useNavigate();
  const { data: transactions = [], isLoading } = useTransactions();

  const [search, setSearch] = useState("");

  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [dateFilter, setDateFilter] = useState("All");

  const [amountFilter, setAmountFilter] = useState("All");

  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      /* SEARCH */

      const searchText = search.toLowerCase();

      const matchesSearch =
        transaction.id.toLowerCase().includes(searchText) ||
        transaction.customerId.toLowerCase().includes(searchText) ||
        transaction.customerName.toLowerCase().includes(searchText) ||
        transaction.merchant.toLowerCase().includes(searchText);

      /* RISK */

      let matchesRisk = true;

      if (riskFilter === "Critical") {
        matchesRisk = transaction.riskScore >= 90;
      }

      if (riskFilter === "High") {
        matchesRisk =
          transaction.riskScore >= 60 &&
          transaction.riskScore < 90;
      }

      if (riskFilter === "Medium") {
        matchesRisk =
          transaction.riskScore >= 30 &&
          transaction.riskScore < 60;
      }

      if (riskFilter === "Low") {
        matchesRisk = transaction.riskScore < 30;
      }

      /* STATUS */

      const matchesStatus =
        statusFilter === "All" ||
        transaction.status === statusFilter;

      /* DATE */

      let matchesDate = true;

      if (dateFilter === "Today") {
        matchesDate = transaction.date === "2026-09-06";
      }

      /* AMOUNT */

      let matchesAmount = true;

      if (amountFilter === "Under ₹5K") {
        matchesAmount = transaction.amount < 5000;
      }

      if (amountFilter === "₹5K - ₹25K") {
        matchesAmount =
          transaction.amount >= 5000 &&
          transaction.amount <= 25000;
      }

      if (amountFilter === "₹25K - ₹1L") {
        matchesAmount =
          transaction.amount > 25000 &&
          transaction.amount <= 100000;
      }

      if (amountFilter === "Above ₹1L") {
        matchesAmount = transaction.amount > 100000;
      }

      return (
        matchesSearch &&
        matchesRisk &&
        matchesStatus &&
        matchesDate &&
        matchesAmount
      );
    });
  }, [
    transactions,
    search,
    riskFilter,
    statusFilter,
    dateFilter,
    amountFilter,
  ]);

  const clearFilters = () => {
    setSearch("");
    setRiskFilter("All");
    setStatusFilter("All");
    setDateFilter("All");
    setAmountFilter("All");
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <TopBar />

        <main className="dashboard-content">
          <PageHeader
            title="Transactions"
            description="Monitor, filter and investigate card transactions."
          />

          {/* SUMMARY */}

          <div className="transaction-summary">
            <div>
              <strong>{transactions.length}</strong>
              <span>Total transactions</span>
            </div>

            <div>
              <strong>
                {
                  transactions.filter(
                    (t) => t.riskScore >= 80
                  ).length
                }
              </strong>
              <span>High risk</span>
            </div>

            <div>
              <strong>
                {
                  transactions.filter(
                    (t) => t.status === "Blocked"
                  ).length
                }
              </strong>
              <span>Blocked</span>
            </div>

            <div>
              <strong>
                {
                  transactions.filter(
                    (t) => t.status === "Review"
                  ).length
                }
              </strong>
              <span>Under review</span>
            </div>
          </div>

          {/* TABLE PANEL */}

          <section className="panel">
            {/* FILTER BAR */}

            <div className="filters-header">
              <div className="search-box">
                <Search size={17} />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search transaction, customer or merchant..."
                />

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="clear-search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="filters">
                <button
                  className={`filter-toggle ${
                    showFilters ? "active" : ""
                  }`}
                  onClick={() =>
                    setShowFilters((value) => !value)
                  }
                >
                  <SlidersHorizontal size={15} />
                  Filters
                </button>

                <button
                  className="refresh-button"
                  onClick={clearFilters}
                  title="Reset filters"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            {/* ADVANCED FILTERS */}

            {showFilters && (
              <div className="advanced-filters">
                <FilterSelect
                  icon={CalendarDays}
                  label="Date"
                  value={dateFilter}
                  onChange={setDateFilter}
                  options={[
                    "All",
                    "Today",
                  ]}
                />

                <FilterSelect
                  icon={ShieldAlert}
                  label="Risk"
                  value={riskFilter}
                  onChange={setRiskFilter}
                  options={[
                    "All",
                    "Critical",
                    "High",
                    "Medium",
                    "Low",
                  ]}
                />

                <FilterSelect
                  icon={CreditCard}
                  label="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    "All",
                    "Approved",
                    "Review",
                    "Blocked",
                  ]}
                />

                <FilterSelect
                  icon={CreditCard}
                  label="Amount"
                  value={amountFilter}
                  onChange={setAmountFilter}
                  options={[
                    "All",
                    "Under ₹5K",
                    "₹5K - ₹25K",
                    "₹25K - ₹1L",
                    "Above ₹1L",
                  ]}
                />

                <button
                  className="clear-filter-button"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="transaction-result-count">
              Showing{" "}
              <strong>{filteredTransactions.length}</strong>{" "}
              of {transactions.length} transactions
            </div>

            {/* TABLE */}

            {isLoading ? (
              <div className="loading-state">
                Loading transactions...
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="table-wrapper">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Merchant</th>
                      <th>Amount</th>
                      <th>Risk</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map(
                      (transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <div className="transaction-id">
                              <strong>
                                {transaction.id}
                              </strong>

                              <span>
                                {transaction.customerName}
                                {" · "}
                                {transaction.customerId}
                              </span>
                            </div>
                          </td>

                          <td>
                            <strong>
                              {transaction.merchant}
                            </strong>

                            <span className="table-subtext">
                              {transaction.category}
                            </span>
                          </td>

                          <td>
                            <strong>
                              ₹
                              {transaction.amount.toLocaleString(
                                "en-IN"
                              )}
                            </strong>
                          </td>

                          <td>
                            <RiskScoreBadge
                              score={transaction.riskScore}
                            />
                          </td>

                          <td>
                            <SeverityTag
                              severity={
                                transaction.severity
                              }
                            />
                          </td>

                          <td>
                            <StatusPill
                              status={transaction.status}
                            />
                          </td>

                          <td>
                            <span className="table-time">
                              {transaction.timestamp}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="view-button"
                              onClick={() =>
                                navigate(
                                  `/investigations/detail?transactionId=${encodeURIComponent(
                                    transaction.id
                                  )}`
                                )
                              }
                              aria-label={`View investigation for ${transaction.id}`}
                              title="View investigation"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <Search size={30} />

                <h3>No transactions found</h3>

                <p>
                  Try changing your search or filters.
                </p>

                <button
                  className="clear-filter-button"
                  onClick={clearFilters}
                >
                  Reset filters
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* TRANSACTION DRAWER */}

      <Drawer
        open={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
        title={selectedTransaction?.id || "Transaction"}
      >
        {selectedTransaction && (
          <TransactionDetails
            transaction={selectedTransaction}
          />
        )}
      </Drawer>
    </div>
  );
}

/* ==========================================
   FILTER SELECT
========================================== */

function FilterSelect({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div className="advanced-filter">
      <div className="advanced-filter-label">
        <Icon size={14} />
        {label}
      </div>

      <div className="advanced-filter-select">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown size={14} />
      </div>
    </div>
  );
}

/* ==========================================
   TRANSACTION DETAILS
========================================== */

function TransactionDetails({ transaction }) {
  const device = transaction.device || {};
  const location = transaction.location || {};

  return (
    <div className="transaction-details">
      {/* RISK */}

      <div className="drawer-risk-card">
        <div>
          <span>Fraud Risk Score</span>

          <strong>
            {transaction.riskScore}
            <small>/100</small>
          </strong>
        </div>

        <RiskScoreBadge
          score={transaction.riskScore}
        />
      </div>

      {/* MODEL DECISION */}

      <div className="drawer-section">
        <SectionTitle
          icon={BrainCircuit}
          title="Model Decision"
        />

        <div className="decision-card">
          <div>
            <span>Decision</span>

            <strong
              className={`decision-${transaction.decision.toLowerCase()}`}
            >
              {transaction.decision}
            </strong>
          </div>

          <div>
            <span>Probability</span>

            <strong>
              {(
                transaction.modelProbability * 100
              ).toFixed(1)}
              %
            </strong>
          </div>

          <div>
            <span>Model Version</span>

            <strong>
              {transaction.modelVersion}
            </strong>
          </div>
        </div>
      </div>

      {/* TRANSACTION */}

      <div className="drawer-section">
        <SectionTitle
          icon={CreditCard}
          title="Transaction Information"
        />

        <DetailRows
          rows={[
            ["Transaction ID", transaction.id],
            ["Customer", transaction.customerName],
            ["Customer ID", transaction.customerId],
            [
              "Amount",
              `₹${transaction.amount.toLocaleString(
                "en-IN"
              )}`,
            ],
            ["Currency", transaction.currency],
            ["Category", transaction.category],
            ["Date", transaction.timestamp],
          ]}
        />
      </div>

      {/* MERCHANT */}

      <div className="drawer-section">
        <SectionTitle
          icon={Store}
          title="Merchant Information"
        />

        <DetailRows
          rows={[
            ["Merchant", transaction.merchant],
            ["Merchant ID", transaction.merchantId],
            ["Category", transaction.category],
          ]}
        />
      </div>

      {/* REASON CODES */}

      <div className="drawer-section">
        <SectionTitle
          icon={ShieldAlert}
          title="Reason Codes"
        />

        <div className="reason-code-list">
          {transaction.reasons.map((reason) => (
            <div
              className="reason-code"
              key={reason.code}
            >
              <div className="reason-code-header">
                <strong>{reason.code}</strong>

                <span
                  className={`reason-impact ${reason.impact.toLowerCase()}`}
                >
                  {reason.impact}
                </span>
              </div>

              <p>{reason.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DEVICE */}

      <div className="drawer-section">
        <SectionTitle
          icon={Smartphone}
          title="Device Information"
        />

        <DetailRows
          rows={[
            ["Type", device.type || "Unknown"],
            ["Device", device.name || "Unknown"],
            ["Operating System", device.os || "Unknown"],
            ["Browser", device.browser || "Unknown"],
            [
              "Fingerprint",
              device.fingerprint || "Unknown",
            ],
          ]}
        />
      </div>

      {/* LOCATION */}

      <div className="drawer-section">
        <SectionTitle
          icon={MapPin}
          title="Location"
        />

        <DetailRows
          rows={[
            [
              "Location",
              `${location.city || "Unknown"}, ${location.state || "Unknown"}`,
            ],
            ["Country", location.country || "Unknown"],
            ["IP Address", location.ip || "Unknown"],
            [
              "Coordinates",
              `${location.latitude || "Unknown"}, ${location.longitude || "Unknown"}`,
            ],
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
            {transaction.customerName.charAt(0)}
          </div>

          <div>
            <strong>
              {transaction.customerName}
            </strong>

            <span>
              {transaction.customerId}
            </span>
          </div>
        </div>
      </div>

      <button className="investigate-button">
        Open Investigation
      </button>
    </div>
  );
}

/* ==========================================
   SECTION TITLE
========================================== */

function SectionTitle({ icon: Icon, title }) {
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
        <div className="detail-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export default TransactionsPage;