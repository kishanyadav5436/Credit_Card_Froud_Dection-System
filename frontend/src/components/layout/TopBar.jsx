import { Bell, Search, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TopBar() {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search transactions, alerts, customers..."
          aria-label="Search"
        />

        <span className="search-shortcut">⌘ K</span>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="icon-button"
          onClick={() => navigate("/alerts")}
          aria-label="View alerts"
          title="View alerts"
        >
          <Bell size={21} />
          <span className="notification-dot" />
        </button>

        <button
          type="button"
          className="user-profile"
          onClick={() => console.log("Profile clicked")}
          aria-label="User profile"
        >
          <UserCircle size={38} />

          <div>
            <strong>Fraud Analyst</strong>
            <span>Risk Operations</span>
          </div>
        </button>
      </div>
    </header>
  );
}

export default TopBar;
