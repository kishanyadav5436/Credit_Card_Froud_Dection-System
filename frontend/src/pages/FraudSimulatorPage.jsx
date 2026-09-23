import "./FraudSimulatorPage.css";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ShieldAlert,
  Zap,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import PageHeader from "../components/layout/PageHeader";
import RiskScoreBadge from "../components/domain/RiskScoreBadge";
import SeverityTag from "../components/domain/SeverityTag";

import { checkFraud } from "../api/fraud";

/* ─── Helpers ────────────────────────────────────────────── */

const MERCHANTS = [
  "Amazon India",
  "Flipkart",
  "Myntra",
  "Swiggy",
  "Uber",
  "Zomato",
  "Paytm",
  "PhonePe",
];

function randomId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function randomFill() {
  return {
    transaction_id: randomId("TXN"),
    customer_id: "CUS-10001",
    merchant_id:
      MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    amount: String(
      Math.floor(Math.random() * 90000) + 1000
    ),
    currency: "INR",
    velocity: String(Math.floor(Math.random() * 5)),
    isNewDevice: Math.random() > 0.55,
    locationMismatch: Math.random() > 0.65,
  };
}

/* ─── Page ───────────────────────────────────────────────── */

function FraudSimulatorPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    transaction_id: randomId("TXN"),
    customer_id: "CUS-10001",
    merchant_id: "Amazon India",
    amount: "",
    currency: "INR",
    velocity: "1",
    isNewDevice: false,
    locationMismatch: false,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRandomFill = () => {
    setForm(randomFill());
    setResult(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const amount = parseFloat(form.amount);
    if (!form.transaction_id.trim()) {
      setError("Transaction ID is required.");
      return;
    }
    if (!form.customer_id.trim()) {
      setError("Customer ID is required.");
      return;
    }
    if (!form.merchant_id.trim()) {
      setError("Merchant ID is required.");
      return;
    }
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        transaction_id: form.transaction_id.trim(),
        customer_id: form.customer_id.trim(),
        merchant_id: form.merchant_id.trim(),
        amount,
        currency: form.currency || "INR",
        velocity: parseInt(form.velocity, 10) || 0,
        isNewDevice: Boolean(form.isNewDevice),
        locationMismatch: Boolean(form.locationMismatch),
      };

      const data = await checkFraud(payload);
      setResult({ ...data, ...payload });

      // Refresh transactions and alerts so they show the new entry
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });

      // Reset transaction ID so next submission gets a fresh one
      setForm((prev) => ({
        ...prev,
        transaction_id: randomId("TXN"),
      }));
    } catch (err) {
      setError(
        err.message || "Failed to check fraud. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <TopBar />

        <main className="dashboard-content">
          <PageHeader
            title="Fraud Simulator"
            description="Submit a transaction to the fraud engine and evaluate its risk in real time."
          />

          <section className="simulator-layout">
            {/* FORM PANEL */}

            <div className="panel simulator-panel">
              <div className="section-heading">
                <div>
                  <h2>Transaction Details</h2>
                  <p>
                    Fill in transaction details or use random
                    fill to generate test data.
                  </p>
                </div>

                <div className="simulator-icon">
                  <Zap size={20} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="sim-form">
                <div className="sim-form-row">
                  <label>
                    <span>Transaction ID</span>
                    <input
                      name="transaction_id"
                      value={form.transaction_id}
                      onChange={handleChange}
                      placeholder="TXN-..."
                    />
                  </label>

                  <label>
                    <span>Customer ID</span>
                    <input
                      name="customer_id"
                      value={form.customer_id}
                      onChange={handleChange}
                      placeholder="CUS-..."
                    />
                  </label>
                </div>

                <div className="sim-form-row">
                  <label>
                    <span>Merchant ID</span>
                    <input
                      name="merchant_id"
                      value={form.merchant_id}
                      onChange={handleChange}
                      placeholder="Merchant name or ID"
                    />
                  </label>

                  <label>
                    <span>Amount (₹)</span>
                    <input
                      name="amount"
                      type="number"
                      min="1"
                      step="1"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="e.g. 50000"
                    />
                  </label>
                </div>

                <div className="sim-form-row">
                  <label>
                    <span>Currency</span>
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </label>

                  <label>
                    <span>Velocity (recent tx count)</span>
                    <input
                      name="velocity"
                      type="number"
                      min="0"
                      max="20"
                      value={form.velocity}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <div className="sim-form-checks">
                  <label className="check-label">
                    <input
                      type="checkbox"
                      name="isNewDevice"
                      checked={form.isNewDevice}
                      onChange={handleChange}
                    />
                    <span>New / unrecognised device</span>
                  </label>

                  <label className="check-label">
                    <input
                      type="checkbox"
                      name="locationMismatch"
                      checked={form.locationMismatch}
                      onChange={handleChange}
                    />
                    <span>Location mismatch detected</span>
                  </label>
                </div>

                {error && (
                  <p className="sim-error">{error}</p>
                )}

                <div className="sim-actions">
                  <button
                    type="button"
                    className="random-button"
                    onClick={handleRandomFill}
                    title="Fill with random test data"
                  >
                    <RefreshCw size={15} />
                    Random Fill
                  </button>

                  <button
                    type="submit"
                    className="simulate-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw
                          size={18}
                          className="spinning"
                        />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Run Fraud Check
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* RESULT PANEL */}

            <div className="panel simulator-result-panel">
              {!result ? (
                <div className="simulator-empty">
                  <CreditCard size={36} />

                  <h3>No result yet</h3>

                  <p>
                    Fill in the form and click{" "}
                    <strong>Run Fraud Check</strong> to
                    evaluate the transaction against the fraud
                    engine.
                  </p>
                </div>
              ) : (
                <TransactionResult result={result} />
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ─── Result display ─────────────────────────────────────── */

function TransactionResult({ result }) {
  const riskScore = result.risk_score ?? result.score ?? 0;
  const decision = result.decision || "APPROVE";
  const severity = result.severity || "Low";
  const probability = Number(result.probability || 0);
  const modelVersion = result.model_version || "fraud-engine-v1";
  const latencyMs = result.latency_ms || 0;
  const reasons = Array.isArray(result.reasons)
    ? result.reasons
    : [];

  return (
    <div className="simulator-result">
      <div className="section-heading">
        <div>
          <h2>Risk Assessment</h2>
          <p>{result.transaction_id}</p>
        </div>

        <RiskScoreBadge score={riskScore} />
      </div>

      <div className="transaction-result-grid">
        <ResultItem
          label="Customer"
          value={result.customer_id}
        />

        <ResultItem
          label="Merchant"
          value={result.merchant_id}
        />

        <ResultItem
          label="Amount"
          value={`₹${Number(result.amount || 0).toLocaleString("en-IN")}`}
        />

        <ResultItem
          label="Velocity"
          value={`${result.velocity ?? 0} transactions`}
        />

        <ResultItem
          label="New Device"
          value={result.isNewDevice ? "Yes" : "No"}
        />

        <ResultItem
          label="Location Mismatch"
          value={result.locationMismatch ? "Yes" : "No"}
        />
      </div>

      <div className="risk-decision">
        <span>Final Decision</span>

        <strong
          className={`decision-result ${decision.toLowerCase()}`}
        >
          {decision}
        </strong>
      </div>

      <div className="risk-severity">
        <span>Severity</span>

        <SeverityTag severity={severity} />
      </div>

      <div className="transaction-result-grid" style={{ marginTop: "16px" }}>
        <ResultItem
          label="Probability"
          value={`${(probability * 100).toFixed(1)}%`}
        />

        <ResultItem
          label="Model Version"
          value={modelVersion}
        />

        <ResultItem
          label="Latency"
          value={`${latencyMs} ms`}
        />
      </div>

      <div className="risk-reasons">
        <div className="drawer-section-title">
          <ShieldAlert size={16} />
          <h3>Risk Factors</h3>
        </div>

        {reasons.length === 0 ? (
          <div className="no-risk-factors">
            <CheckCircle2 size={17} />
            <span>No significant risk factors detected.</span>
          </div>
        ) : (
          <div className="simulator-reason-list">
            {reasons.map((reason) => (
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

      <div className="sim-success-note">
        <CheckCircle2 size={15} />
        <span>
          Transaction saved to database. Check the{" "}
          <strong>Transactions</strong> and{" "}
          <strong>Alerts</strong> pages for updates.
        </span>
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