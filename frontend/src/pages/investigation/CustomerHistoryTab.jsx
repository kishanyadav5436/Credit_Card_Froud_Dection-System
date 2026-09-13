import {
  User,
  CreditCard,
  ShieldAlert,
} from "lucide-react";

import RiskScoreBadge from "../../components/domain/RiskScoreBadge";
import StatusPill from "../../components/domain/StatusPill";

function CustomerHistoryTab({
  customer,
  transactions,
}) {
  return (
    <div className="investigation-tab-content">
      <div className="history-cards">
        <div className="history-card">
          <div className="history-card-icon">
            <User size={18} />
          </div>

          <span>Account age</span>
          <strong>{customer.accountAge}</strong>
        </div>

        <div className="history-card">
          <div className="history-card-icon">
            <CreditCard size={18} />
          </div>

          <span>Total transactions</span>
          <strong>{customer.totalTransactions}</strong>
        </div>

        <div className="history-card">
          <div className="history-card-icon">
            <ShieldAlert size={18} />
          </div>

          <span>Previous fraud cases</span>
          <strong>{customer.previousFraudCases}</strong>
        </div>
      </div>

      <div className="investigation-section">
        <div className="investigation-section-header">
          <div>
            <h3>Customer Profile</h3>
            <p>Historical customer information</p>
          </div>
        </div>

        <div className="profile-grid">
          <InfoItem
            label="Customer ID"
            value={customer.id}
          />

          <InfoItem
            label="Customer Name"
            value={customer.name}
          />

          <InfoItem
            label="Email"
            value={customer.email}
          />

          <InfoItem
            label="Phone"
            value={customer.phone}
          />

          <InfoItem
            label="Average transaction"
            value={`₹${(
              customer.averageTransaction ??
              customer.avgTransaction ??
              0
            ).toLocaleString("en-IN")}`}
          />
        </div>
      </div>

      <div className="investigation-section">
        <div className="investigation-section-header">
          <div>
            <h3>Transaction History</h3>
            <p>Recent customer activity</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="investigation-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Risk</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <strong>{transaction.id}</strong>
                  </td>

                  <td>{transaction.merchant}</td>

                  <td>
                    ₹
                    {transaction.amount.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td>
                    <RiskScoreBadge
                      score={transaction.risk}
                    />
                  </td>

                  <td>
                    <StatusPill
                      status={transaction.status}
                    />
                  </td>

                  <td>{transaction.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default CustomerHistoryTab;