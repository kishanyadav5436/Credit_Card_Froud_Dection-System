import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

import {
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

import {
  getInvestigationsFromBackend,
} from "../../api/investigations";

function InvestigationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("transactionId");

  const {
    data: investigations = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["investigations"],
    queryFn: getInvestigationsFromBackend,
  });

  useEffect(() => {
    if (transactionId) {
      navigate(
        `/investigations/detail?transactionId=${encodeURIComponent(transactionId)}`,
        { replace: true }
      );
    }
  }, [navigate, transactionId]);

  const openInvestigation = (
    transactionId
  ) => {
    navigate(
      `/investigations/detail?transactionId=${encodeURIComponent(
        transactionId
      )}`
    );
  };

  if (isLoading) {
    return (
      <div className="app-shell">
        <Sidebar />

        <div className="main-area">
          <TopBar />

          <div className="loading-state">
            Loading investigations...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="app-shell">
        <Sidebar />

        <div className="main-area">
          <TopBar />

          <main className="dashboard-content">
            <div className="empty-state">
              <ShieldAlert size={32} />

              <h3>
                Failed to load investigations
              </h3>

              <p>
                {error?.message ||
                  "Unable to fetch investigations."}
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

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <h1>Investigations</h1>

              <p>
                Review and manage fraud
                investigations.
              </p>
            </div>

            <div>
              <strong>
                {investigations.length}
              </strong>{" "}
              investigation
              {investigations.length !== 1
                ? "s"
                : ""}
            </div>
          </div>

          {investigations.length === 0 ? (
            <div className="empty-state">
              <ShieldAlert size={32} />

              <h3>
                No investigations found
              </h3>

              <p>
                There are currently no
                investigations in the system.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {investigations.map(
                (investigation) => (
                  <InvestigationCard
                    key={
                      investigation.investigationId
                    }
                    investigation={
                      investigation
                    }
                    onOpen={
                      openInvestigation
                    }
                  />
                )
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

function InvestigationCard({
  investigation,
  onOpen,
}) {
  const riskScore =
    investigation.risk?.score || 0;

  const severity =
    investigation.risk?.severity ||
    investigation.risk?.level ||
    "Low";

  const decision =
    investigation.risk?.decision ||
    "N/A";

  const status =
    investigation.status || "Open";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "20px",
        alignItems: "center",
      }}
    >
      <div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <ShieldAlert size={20} />

          <strong>
            {investigation.investigationId}
          </strong>

          <span>
            {status}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          <Info
            label="Transaction"
            value={
              investigation.transactionId
            }
          />

          <Info
            label="Risk Score"
            value={`${riskScore}/100`}
          />

          <Info
            label="Severity"
            value={severity}
          />

          <Info
            label="Decision"
            value={decision}
          />
        </div>

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            gap: "24px",
          }}
        >
          <Info
            label="Customer"
            value={
              investigation.customer?.id ||
              "Unknown"
            }
          />

          <Info
            label="Merchant"
            value={
              investigation.merchant?.name ||
              "Unknown"
            }
          />

          <Info
            label="Amount"
            value={`₹${Number(
              investigation.transaction
                ?.amount || 0
            ).toLocaleString("en-IN")}`}
          />
        </div>

      </div>

      <button
        type="button"
        onClick={() =>
          onOpen(
            investigation.transactionId
          )
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        View

        <ArrowRight size={16} />
      </button>

    </div>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <strong>
        {value}
      </strong>
    </div>
  );
}

export default InvestigationsPage;