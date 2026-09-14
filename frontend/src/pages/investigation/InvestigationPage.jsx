import "./InvestigationPage.css";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  ShieldAlert,
  User,
  Smartphone,
  Store,
  Activity,
  MapPin,
  BrainCircuit,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import RiskScoreBadge from "../../components/domain/RiskScoreBadge";
import SeverityTag from "../../components/domain/SeverityTag";
import StatusPill from "../../components/domain/StatusPill";

import useInvestigation from "../../hooks/useInvestigation";
import {
  saveInvestigationDecision,
  getSavedDecision,
} from "../../api/investigations";

import CustomerHistoryTab from "./CustomerHistoryTab";
import DeviceHistoryTab from "./DeviceHistoryTab";
import MerchantHistoryTab from "./MerchantHistoryTab";
import DecisionPanel from "./DecisionPanel";

function InvestigationPage() {
  const [searchParams] = useSearchParams();

  const transactionId =
    searchParams.get("transactionId") || "TXN-98421";

  const { data, isLoading, isError } =
    useInvestigation(transactionId);

  const [activeTab, setActiveTab] =
    useState("customer");

  // Analyst decision
  const [decision, setDecision] = useState(() => {
    const savedDecision =
      getSavedDecision(transactionId);

    return savedDecision?.decision || "BLOCK";
  });

  // Saving state
  const [savingDecision, setSavingDecision] =
    useState(false);

  /* ==========================================
     LOADING
  ========================================== */

  if (isLoading) {
    return (
      <div className="app-shell">
        <Sidebar />

        <div className="main-area">
          <TopBar />

          <div className="loading-state">
            Loading investigation...
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================
     ERROR
  ========================================== */

  if (isError || !data) {
    return (
      <div className="app-shell">
        <Sidebar />

        <div className="main-area">
          <TopBar />

          <main className="dashboard-content">
            <div className="empty-state">
              <ShieldAlert size={32} />

              <h3>Investigation not found</h3>

              <p>
                No investigation data was found for{" "}
                <strong>{transactionId}</strong>.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ==========================================
     DECISION HANDLER
  ========================================== */

  const handleDecision = (newDecision) => {
    setDecision(newDecision);
  };

  /* ==========================================
     SAVE DECISION
  ========================================== */

  const handleSaveDecision = async ({
    decision: selectedDecision,
    note,
  }) => {
    try {
      setSavingDecision(true);

      const savedDecision =
        await saveInvestigationDecision(
          transactionId,
          selectedDecision,
          note
        );

      setDecision(savedDecision.decision);

      console.log(
        "Investigation Decision Saved:",
        savedDecision
      );

      window.alert(
        `Decision saved successfully: ${savedDecision.decision}`
      );
    } catch (error) {
      console.error(
        "Failed to save investigation decision:",
        error
      );

      window.alert(
        "Failed to save decision. Please try again."
      );
    } finally {
      setSavingDecision(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <TopBar />

        <main className="dashboard-content investigation-page">
          {/* ==========================================
              HEADER
          ========================================== */}

          <div className="investigation-header">
            <div>
              <button
                type="button"
                className="back-button"
                onClick={() =>
                  window.history.back()
                }
              >
                <ArrowLeft size={15} />
                Back
              </button>

              <div className="investigation-title">
                <div className="investigation-title-icon">
                  <ShieldAlert size={21} />
                </div>

                <div>
                  <h1>Investigation</h1>

                  <p>
                    {data.alertId} ·{" "}
                    {data.transactionId}
                  </p>
                </div>
              </div>
            </div>

            <div className="investigation-header-actions">
              <SeverityTag
                severity={
                  data.risk.level ||
                  data.risk.severity ||
                  "Medium"
                }
              />

              <StatusPill status="Review" />
            </div>
          </div>

          {/* ==========================================
              RISK OVERVIEW
          ========================================== */}

          <section className="investigation-risk-overview">
            <div className="risk-overview-main">
              <div>
                <span>Fraud Risk Score</span>

                <strong>
                  {data.risk.score}
                  <small>/100</small>
                </strong>
              </div>

              <RiskScoreBadge
                score={data.risk.score}
              />
            </div>

            <div className="risk-overview-item">
              <span>Model Decision</span>

              <strong>
                {data.risk.decision}
              </strong>
            </div>

            <div className="risk-overview-item">
              <span>Analyst Decision</span>

              <strong>
                {decision}
              </strong>
            </div>

            <div className="risk-overview-item">
              <span>Probability</span>

              <strong>
                {(
                  data.risk.probability * 100
                ).toFixed(1)}
                %
              </strong>
            </div>

            <div className="risk-overview-item">
              <span>Model Version</span>

              <strong>
                {data.risk.modelVersion}
              </strong>
            </div>
          </section>

          {/* ==========================================
              QUICK INFORMATION
          ========================================== */}

          <section className="investigation-overview-grid">
            <OverviewCard
              icon={Activity}
              title="Transaction"
              value={`₹${data.transaction.amount.toLocaleString(
                "en-IN"
              )}`}
              subtitle={
                data.transaction.merchant
              }
            />

            <OverviewCard
              icon={User}
              title="Customer"
              value={data.customer.name}
              subtitle={data.customer.id}
            />

            <OverviewCard
              icon={Store}
              title="Merchant"
              value={data.merchant.name}
              subtitle={data.merchant.category}
            />

            <OverviewCard
              icon={MapPin}
              title="Location"
              value={data.transaction.location}
              subtitle={data.transaction.timestamp}
            />
          </section>

          {/* ==========================================
              WORKSPACE
          ========================================== */}

          <section className="investigation-workspace">
            <div className="investigation-main">

              {/* TABS */}

              <div className="investigation-tabs">
                <TabButton
                  active={
                    activeTab === "customer"
                  }
                  onClick={() =>
                    setActiveTab("customer")
                  }
                  icon={User}
                  label="Customer History"
                />

                <TabButton
                  active={
                    activeTab === "device"
                  }
                  onClick={() =>
                    setActiveTab("device")
                  }
                  icon={Smartphone}
                  label="Device History"
                />

                <TabButton
                  active={
                    activeTab === "merchant"
                  }
                  onClick={() =>
                    setActiveTab("merchant")
                  }
                  icon={Store}
                  label="Merchant History"
                />

                <TabButton
                  active={
                    activeTab === "risk"
                  }
                  onClick={() =>
                    setActiveTab("risk")
                  }
                  icon={BrainCircuit}
                  label="Risk Analysis"
                />
              </div>

              {/* TAB CONTENT */}

              <div className="investigation-tab-panel">
                {activeTab === "customer" && (
                  <CustomerHistoryTab
                    customer={data.customer}
                    transactions={
                      data.customerTransactions
                    }
                  />
                )}

                {activeTab === "device" && (
                  <DeviceHistoryTab
                    device={data.device}
                  />
                )}

                {activeTab === "merchant" && (
                  <MerchantHistoryTab
                    merchant={data.merchant}
                  />
                )}

                {activeTab === "risk" && (
                  <RiskAnalysis
                    risk={data.risk}
                    reasons={data.reasons}
                  />
                )}
              </div>
            </div>

            {/* ==========================================
                RIGHT SIDEBAR
            ========================================== */}

            <aside className="investigation-sidebar">

              <DecisionPanel
                currentDecision={decision}
                onDecision={handleDecision}
                onSave={handleSaveDecision}
                saving={savingDecision}
              />

              {/* RISK SIGNALS */}

              <div className="investigation-reasons">
                <div className="decision-panel-header">
                  <div>
                    <h3>Risk Signals</h3>

                    <p>
                      Model contributing factors
                    </p>
                  </div>
                </div>

                {data.reasons.map((reason) => (
                  <div
                    className="mini-reason"
                    key={reason.code}
                  >
                    <div>
                      <strong>
                        {reason.code}
                      </strong>

                      <span>
                        {reason.description}
                      </span>
                    </div>

                    <b
                      className={`reason-impact ${reason.impact.toLowerCase()}`}
                    >
                      {reason.impact}
                    </b>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ==========================================
   OVERVIEW CARD
========================================== */

function OverviewCard({
  icon: Icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="investigation-overview-card">
      <div className="overview-icon">
        <Icon size={17} />
      </div>

      <div>
        <span>{title}</span>

        <strong>{value}</strong>

        <small>{subtitle}</small>
      </div>
    </div>
  );
}

/* ==========================================
   TAB BUTTON
========================================== */

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}) {
  return (
    <button
      type="button"
      className={`investigation-tab ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      <Icon size={15} />

      {label}
    </button>
  );
}

/* ==========================================
   RISK ANALYSIS
========================================== */

function RiskAnalysis({
  risk,
  reasons,
}) {
  return (
    <div className="investigation-tab-content">
      <div className="risk-analysis-card">
        <div className="risk-analysis-score">
          <span>Model Risk Score</span>

          <strong>{risk.score}</strong>

          <small>out of 100</small>
        </div>

        <RiskScoreBadge
          score={risk.score}
        />
      </div>

      <div className="investigation-section">
        <div className="investigation-section-header">
          <div>
            <h3>Model Analysis</h3>

            <p>
              Signals used by the fraud detection model
            </p>
          </div>
        </div>

        <div className="risk-signal-list">
          {reasons.map((reason) => (
            <div
              className="risk-signal"
              key={reason.code}
            >
              <div>
                <strong>
                  {reason.code}
                </strong>

                <p>
                  {reason.description}
                </p>
              </div>

              <span
                className={`reason-impact ${reason.impact.toLowerCase()}`}
              >
                {reason.impact}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InvestigationPage;