import {
  LayoutDashboard,
  CreditCard,
  BellRing,
  Search,
  BrainCircuit,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Transactions",
    path: "/transactions",
    icon: CreditCard,
  },
  {
    label: "Alerts",
    path: "/alerts",
    icon: BellRing,
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
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <ShieldCheck size={22} />
        </div>

        <div>
          <h2>FraudGuard</h2>
          <span>Risk Intelligence</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-title">OPERATIONS</p>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <NavLink to="/settings" className="nav-item">
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>

        <button className="logout-button">
          <LogOut size={19} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;