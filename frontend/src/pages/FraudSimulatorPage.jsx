import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  ShieldAlert,
  Zap,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import PageHeader from "../components/layout/PageHeader";

import RiskScoreBadge from "../components/domain/RiskScoreBadge";
import SeverityTag from "../components/domain/SeverityTag";

import { simulateTransaction } from "../api/transactionSimulator";

function FraudSimulatorPage() {
  const [transaction, setTransaction] = useState(null);

  const handleSimulate = () => {
    const result = simulateTransaction();
    setTransaction(result);
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <TopBar />

        <main className="dashboard-content">
          <PageHeader
            title="Fraud Simulator"
            description="Simulate card transactions and evaluate fraud risk."
          />

          <section className="simulator-layout">
            {/* SIMULATOR */}

            <div className="panel simulator-panel">
              <div className="section-heading">
                <div>
                  <h2>Transaction Simulator</h2>
                  <p>
                    Generate a transaction and run it
                    through the fraud risk engine.
                  </p>
                </div>

                <div className="simulator-icon">
                  <Zap size={20} />
                </div>
              </div>

              <div className="simulator-info">
                <div className="simulator-info-item">
                  <span>Amount</span>
                  <strong>Random</strong>
                </div>

                <div className="simulator-info-item">
                  <span>Customer</span>
                  <strong>Random</strong>
                </div>

                <div className="simulator-info-item">
                  <span>Merchant</span>
                  <strong>Random</strong>
                </div>

                <div className="simulator-info-item">
                  <span>Risk Factors</span>
                  <strong>4 Rules</strong>
                </div>
              </div>

              <button
                type="button"
                className="simulate-button"
                onClick={handleSimulate}
              >
                <Zap size={18} />
                Simulate Transaction
              </button>
            </div>

            {/* RESULT */}

            <div className="panel simulator-result-panel">
              {!transaction ? (
                <div className="simulator-empty">
                  <CreditCard size={36} />

                  <h3>No transaction simulated</h3>

                  <p>
                    Click the button to generate a
                    transaction and calculate its risk.
                  </p>
                </div>
              ) : (
                <TransactionResult
                  transaction={transaction}
                />
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function TransactionResult({ transaction }) {
  return (
    <div className="simulator-result">
      <div className="section-heading">
        <div>
          <h2>Risk Assessment</h2>
          <p>{transaction.id}</p>
        </div>

        <RiskScoreBadge score={transaction.score} />
      </div>

      <div className="transaction-result-grid">
        <ResultItem
          label="Customer"
          value={transaction.customerName}
        />

        <ResultItem
          label="Merchant"
          value={transaction.merchant}
        />

        <ResultItem
          label="Amount"
          value={`₹${transaction.amount.toLocaleString(
            "en-IN"
          )}`}
        />

        <ResultItem
          label="Velocity"
          value={`${transaction.velocity} transactions`}
        />

        <ResultItem
          label="New Device"
          value={
            transaction.isNewDevice
              ? "Yes"
              : "No"
          }
        />

        <ResultItem
          label="Location Mismatch"
          value={
            transaction.locationMismatch
              ? "Yes"
              : "No"
          }
        />
      </div>

      <div className="risk-decision">
        <span>Final Decision</span>

        <strong
          className={`decision-result ${transaction.decision.toLowerCase()}`}
        >
          {transaction.decision}
        </strong>
      </div>

      <div className="risk-severity">
        <span>Severity</span>

        <SeverityTag
          severity={transaction.severity}
        />
      </div>

      <div className="risk-reasons">
        <div className="drawer-section-title">
          <ShieldAlert size={16} />
          <h3>Risk Factors</h3>
        </div>

        {transaction.reasons.length === 0 ? (
          <div className="no-risk-factors">
            <CheckCircle2 size={17} />
            <span>No significant risk factors detected.</span>
          </div>
        ) : (
          <div className="simulator-reason-list">
            {transaction.reasons.map((reason) => (
              <div
                className="simulator-reason"
                key={reason.code}
              >
                <AlertTriangle size={17} />

                <div>
                  <strong>{reason.code}</strong>
                  <span>{reason.label}</span>
                </div>

                <b>+{reason.score}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultItem({ label, value }) {
  return (
    <div className="result-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default FraudSimulatorPage;