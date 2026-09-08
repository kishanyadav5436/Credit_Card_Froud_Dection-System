import {
  Smartphone,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function DeviceHistoryTab({ device }) {
  return (
    <div className="investigation-tab-content">
      <div className="current-device-card">
        <div className="device-icon">
          <Smartphone size={24} />
        </div>

        <div className="device-main">
          <span>Current device</span>

          <h3>{device.current.device}</h3>

          <p>
            {device.current.os} ·{" "}
            {device.current.browser}
          </p>
        </div>

        <div
          className={
            device.current.trusted
              ? "device-trusted"
              : "device-untrusted"
          }
        >
          {device.current.trusted ? (
            <CheckCircle2 size={15} />
          ) : (
            <XCircle size={15} />
          )}

          {device.current.trusted
            ? "Trusted"
            : "Untrusted"}
        </div>
      </div>

      <div className="investigation-section">
        <div className="investigation-section-header">
          <div>
            <h3>Device History</h3>
            <p>
              Devices previously associated with this
              customer
            </p>
          </div>
        </div>

        <div className="device-history">
          {device.history.map((item) => (
            <div
              className="device-history-item"
              key={item.device}
            >
              <div className="device-history-icon">
                <Smartphone size={18} />
              </div>

              <div className="device-history-info">
                <strong>{item.device}</strong>

                <span>
                  {item.os} · {item.location}
                </span>

                <small>
                  Last seen: {item.lastSeen}
                </small>
              </div>

              {item.trusted ? (
                <span className="trusted-label">
                  <CheckCircle2 size={14} />
                  Trusted
                </span>
              ) : (
                <span className="untrusted-label">
                  <XCircle size={14} />
                  New
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="investigation-section">
        <div className="investigation-section-header">
          <div>
            <h3>Device Fingerprint</h3>
          </div>
        </div>

        <div className="fingerprint-box">
          {device.current.fingerprint}
        </div>
      </div>
    </div>
  );
}

export default DeviceHistoryTab;