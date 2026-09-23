import { useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import useInvestigation from "../../hooks/useInvestigation";
import { saveInvestigationDecision } from "../../api/investigations";
import CustomerHistoryTab from "./CustomerHistoryTab";
import DeviceHistoryTab from "./DeviceHistoryTab";
import MerchantHistoryTab from "./MerchantHistoryTab";
import DecisionPanel from "./DecisionPanel";
import "./InvestigationPage.css";

function InvestigationDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const [activeTab, setActiveTab] = useState("customer");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const { data: investigation, isLoading, isError, error } =
    useInvestigation(transactionId);

  const handleSave = async ({ decision, note }) => {
    if (!investigation?.investigationId) return;

    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");
      await saveInvestigationDecision(
        investigation.investigationId,
        decision,
        note
      );
      setSaveSuccess(`Decision "${decision}" saved successfully.`);
      // Refresh both the detail view and the list page
      queryClient.invalidateQueries({
        queryKey: ["investigation", transactionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["investigations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });
    } catch (saveFailure) {
      setSaveError(saveFailure.message || "Unable to save the decision.");
    } finally {
      setSaving(false);
    }
  };

  if (!transactionId) {
    return <NavigateBack onBack={() => navigate("/investigations")} />;
  }

  if (isLoading) {
    return <PageState message="Loading investigation..." />;
  }

  if (isError || !investigation) {
    return (
      <PageState
        message={error?.message || "Investigation not found."}
        onBack={() => navigate("/investigations")}
      />
    );
  }

  const customerTransactions = investigation.customerTransactions.map(
    (item) => ({
      id: item.id || item.transaction_id || "Unknown",
      merchant: item.merchant || "Unknown",
      amount: Number(item.amount || 0),
      risk: Number(item.risk || item.risk_score || 0),
      status: item.status || "Completed",
      time: item.timestamp || item.time || "Unknown",
    })
  );

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopBar />
        <main className="dashboard-content investigation-page">
          <div className="investigation-header">
            <div>
              <button
                type="button"
                className="back-button"
                onClick={() => navigate("/investigations")}
              >
                <ArrowLeft size={15} />
                Back to investigations
              </button>
              <div className="investigation-title">
                <div className="investigation-title-icon">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h1>{investigation.investigationId}</h1>
                  <p>Transaction {investigation.transactionId}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="investigation-overview-grid">
            <Overview label="Risk score" value={`${investigation.risk.score}/100`} />
            <Overview label="Severity" value={investigation.risk.severity} />
            <Overview label="Decision" value={investigation.risk.decision} />
            <Overview label="Status" value={investigation.status} />
          </div>

          <div className="investigation-workspace">
            <section className="investigation-main">
              <div className="investigation-tabs">
                <TabButton active={activeTab === "customer"} onClick={() => setActiveTab("customer")}>Customer</TabButton>
                <TabButton active={activeTab === "device"} onClick={() => setActiveTab("device")}>Device</TabButton>
                <TabButton active={activeTab === "merchant"} onClick={() => setActiveTab("merchant")}>Merchant</TabButton>
              </div>
              {activeTab === "customer" && (
                <CustomerHistoryTab
                  customer={investigation.customer}
                  transactions={customerTransactions}
                />
              )}
              {activeTab === "device" && <DeviceHistoryTab device={investigation.device} />}
              {activeTab === "merchant" && <MerchantHistoryTab merchant={investigation.merchant} />}
            </section>

            <aside className="investigation-sidebar">
              <DecisionPanel
                currentDecision={investigation.decision?.decision || investigation.risk.decision}
                onSave={handleSave}
                saving={saving}
              />
              {saveSuccess && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    color: "#166534",
                    fontSize: "12px",
                    marginTop: "10px",
                  }}
                >
                  <CheckCircle2 size={15} />
                  {saveSuccess}
                </div>
              )}
              {saveError && (
                <p className="error-message">{saveError}</p>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function Overview({ label, value }) {
  return (
    <div className="investigation-overview-card">
      <div>
        <span>{label}</span>
        <strong>{value || "Unknown"}</strong>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={active ? "investigation-tab active" : "investigation-tab"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PageState({ message, onBack }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopBar />
        <main className="dashboard-content empty-state">
          <ShieldAlert size={32} />
          <h3>{message}</h3>
          {onBack && (
            <button type="button" className="back-button" onClick={onBack}>
              <ArrowLeft size={15} />
              Back to investigations
            </button>
          )}
        </main>
      </div>
    </div>
  );
}

function NavigateBack({ onBack }) {
  return <PageState message="Select an investigation to view its details." onBack={onBack} />;
}

export default InvestigationDetailPage;
