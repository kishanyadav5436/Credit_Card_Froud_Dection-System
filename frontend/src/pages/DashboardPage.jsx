import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  ShieldAlert,
} from "lucide-react";
import "./DashboardPage.css";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import PageHeader from "../components/layout/PageHeader";
import StatCard from "../components/ui/StatCard";
import RiskScoreBadge from "../components/domain/RiskScoreBadge";
import SeverityTag from "../components/domain/SeverityTag";
import StatusPill from "../components/domain/StatusPill";

const transactions = [
  {
    id: "TXN-98421",
    customer: "CUS-48291",
    merchant: "Amazon India",
    amount: "₹82,450",
    risk: 97,
    severity: "Critical",
    status: "Blocked",
  },
  {
    id: "TXN-98420",
    customer: "CUS-19382",
    merchant: "Flipkart",
    amount: "₹41,280",
    risk: 91,
    severity: "High",
    status: "Review",
  },
  {
    id: "TXN-98419",
    customer: "CUS-82931",
    merchant: "Myntra",
    amount: "₹18,750",
    risk: 78,
    severity: "High",
    status: "Review",
  },
  {
    id: "TXN-98418",
    customer: "CUS-29183",
    merchant: "Uber",
    amount: "₹4,820",
    risk: 34,
    severity: "Medium",
    status: "Approved",
  },
];

const alerts = [
  {
    id: "ALT-70021",
    severity: "Critical",
    title: "Multiple card attempts",
    detail: "3 transactions · 2 min ago",
  },
  {
    id: "ALT-70020",
    severity: "High",
    title: "Unusual device detected",
    detail: "TXN-98420 · 5 min ago",
  },
  {
    id: "ALT-70019",
    severity: "High",
    title: "Velocity threshold exceeded",
    detail: "TXN-98417 · 8 min ago",
  },
  {
    id: "ALT-70018",
    severity: "Medium",
    title: "Location anomaly",
    detail: "TXN-98411 · 12 min ago",
  },
];

function DashboardPage() {
  const navigate = useNavigate();

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
              <button
                type="button"
                className="primary-button"
                onClick={() => navigate("/investigations")}
              >
                View investigations
                <ArrowRight size={17} />
              </button>
            }
          />

          <section className="stats-grid">
            <StatCard
              title="Total Transactions"
              value="24,821"
              description="vs. previous 24 hours"
              trend={12.4}
              icon={CreditCard}
            />

            <StatCard
              title="Fraud Detected"
              value="428"
              description="suspicious transactions"
              trend={8.2}
              icon={ShieldAlert}
            />

            <StatCard
              title="Fraud Rate"
              value="1.72%"
              description="vs. previous period"
              trend={-3.1}
              icon={Activity}
            />

            <StatCard
              title="High Risk"
              value="126"
              description="transactions requiring review"
              trend={5.7}
              icon={AlertTriangle}
            />
          </section>

          <section className="dashboard-grid">
            <div className="panel risk-panel">
              <div className="panel-header">
                <div>
                  <h2>Risk Activity</h2>
                  <p>Transaction risk over the last 24 hours</p>
                </div>

                <select className="period-select" defaultValue="Last 24 hours">
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>

              <div className="risk-chart">
                <div className="chart-y-axis">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>

                <div className="chart-area">
                  <div className="chart-grid-line" />
                  <div className="chart-grid-line" />
                  <div className="chart-grid-line" />
                  <div className="chart-grid-line" />

                  <svg
                    className="risk-line"
                    viewBox="0 0 700 220"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points="0,175 55,160 110,168 165,125 220,140 275,95 330,115 385,72 440,92 495,48 550,65 605,35 660,58 700,25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />

                    <polyline
                      points="0,205 55,200 110,203 165,185 220,192 275,175 330,180 385,160 440,172 495,150 550,158 605,138 660,150 700,130"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      opacity="0.35"
                    />
                  </svg>

                  <div className="chart-x-axis">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>Now</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel alerts-panel">
              <div className="panel-header">
                <div>
                  <h2>Active Alerts</h2>
                  <p>Requires analyst attention</p>
                </div>

                <span className="alert-count">18</span>
              </div>

              <div className="alert-list">
                {alerts.map((alert) => (
                  <button
                    key={alert.id}
                    type="button"
                    className="alert-item"
                    onClick={() =>
                      navigate(`/alerts?alertId=${alert.id}`)
                    }
                  >
                    <SeverityTag severity={alert.severity} />

                    <div className="alert-info">
                      <strong>{alert.title}</strong>
                      <span>{alert.detail}</span>
                    </div>
                  </button>
                ))}
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
          </section>

          <section className="panel transactions-panel">
            <div className="panel-header">
              <div>
                <h2>High-Risk Transactions</h2>
                <p>Latest transactions flagged by the fraud model</p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/transactions")}
              >
                View all transactions
              </button>
            </div>

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
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="clickable-row"
                      onClick={() =>
                        navigate(
                          `/investigations?transactionId=${transaction.id}`
                        )
                      }
                    >
                      <td>
                        <div className="transaction-id">
                          <strong>{transaction.id}</strong>
                          <span>{transaction.customer}</span>
                        </div>
                      </td>

                      <td>{transaction.merchant}</td>

                      <td>
                        <strong>{transaction.amount}</strong>
                      </td>

                      <td>
                        <RiskScoreBadge score={transaction.risk} />
                      </td>

                      <td>
                        <SeverityTag severity={transaction.severity} />
                      </td>

                      <td>
                        <StatusPill status={transaction.status} />
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

export default DashboardPage;
