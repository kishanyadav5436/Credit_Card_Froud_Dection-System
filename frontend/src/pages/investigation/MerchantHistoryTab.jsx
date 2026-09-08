import {
  Store,
  Activity,
  ShieldCheck,
} from "lucide-react";

function MerchantHistoryTab({ merchant }) {
  return (
    <div className="investigation-tab-content">
      <div className="merchant-profile">
        <div className="merchant-icon">
          <Store size={25} />
        </div>

        <div>
          <span>Merchant</span>
          <h2>{merchant.name}</h2>
          <p>{merchant.id}</p>
        </div>
      </div>

      <div className="history-cards">
        <div className="history-card">
          <div className="history-card-icon">
            <ShieldCheck size={18} />
          </div>

          <span>Merchant risk</span>
          <strong>{merchant.riskScore}/100</strong>
        </div>

        <div className="history-card">
          <div className="history-card-icon">
            <Activity size={18} />
          </div>

          <span>Total transactions</span>
          <strong>
            {merchant.totalTransactions.toLocaleString()}
          </strong>
        </div>

        <div className="history-card">
          <div className="history-card-icon">
            <ShieldCheck size={18} />
          </div>

          <span>Fraud rate</span>
          <strong>{merchant.fraudRate}</strong>
        </div>
      </div>

      <div className="investigation-section">
        <div className="investigation-section-header">
          <div>
            <h3>Merchant Information</h3>
          </div>
        </div>

        <div className="profile-grid">
          <InfoItem
            label="Merchant ID"
            value={merchant.id}
          />

          <InfoItem
            label="Merchant"
            value={merchant.name}
          />

          <InfoItem
            label="Category"
            value={merchant.category}
          />

          <InfoItem
            label="Risk score"
            value={`${merchant.riskScore}/100`}
          />

          <InfoItem
            label="Fraud rate"
            value={merchant.fraudRate}
          />
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

export default MerchantHistoryTab;