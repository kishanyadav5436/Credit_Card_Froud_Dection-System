import { Bell, Search, UserCircle } from "lucide-react";

function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search transactions, alerts, customers..."
        />

        <span className="search-shortcut">⌘ K</span>
      </div>

      <div className="topbar-actions">
        <button className="icon-button notification-button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile">
          <UserCircle size={34} />

          <div>
            <strong>Fraud Analyst</strong>
            <span>Risk Operations</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;