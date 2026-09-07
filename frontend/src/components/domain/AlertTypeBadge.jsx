import {
  ShieldAlert,
  Smartphone,
  Activity,
  MapPin,
  Navigation,
  Store,
} from "lucide-react";

const icons = {
  "Multiple Card Attempts": ShieldAlert,
  "Unusual Device": Smartphone,
  "Velocity Threshold": Activity,
  "Location Anomaly": MapPin,
  "Impossible Travel": Navigation,
  "Merchant Risk": Store,
};

function AlertTypeBadge({ type }) {
  const Icon = icons[type] || ShieldAlert;

  return (
    <div className="alert-type">
      <div className="alert-type-icon">
        <Icon size={15} />
      </div>

      <span>{type}</span>
    </div>
  );
}

export default AlertTypeBadge;