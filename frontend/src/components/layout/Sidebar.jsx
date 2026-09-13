import {
  BrainCircuit,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldAlert,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

import { logout } from "../../api/auth";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
  label: "Fraud Simulator",
  path: "/fraud-simulator",
  icon: Zap,
},
  {
    label: "Transactions",
    path: "/transactions",
    icon: CreditCard,
  },
  {
    label: "Alerts",
    path: "/alerts",
    icon: ShieldAlert,
  },
  {
    label: "Investigations",
    path: "/investigations",
    icon: Search,
  },
  {
    label: "Model Monitoring",
    path: "/model-monitoring",
    icon: BrainCircuit,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <ShieldAlert size={21} />
        </div>

        <div>
          <strong>FraudGuard</strong>
          <span>Risk Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-title">
          Monitoring
        </span>

        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">KK</div>

          <div>
            <strong>Kishan Kumar</strong>
            <span>Fraud Analyst</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;