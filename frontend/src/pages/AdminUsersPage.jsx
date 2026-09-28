import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import apiClient from "../api/client";
import PageHeader from "../components/layout/PageHeader";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import "./AdminUsersPage.css";

const roles = ["user", "analyst", "readonly", "admin"];

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    apiClient.get("/api/v1/admin/users")
      .then((response) => {
        if (active) setUsers(response.users || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load users.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshIndex]);

  const updateRole = async (user, role) => {
    setSavingId(user.id);
    setError("");
    try {
      await apiClient.patch(`/api/v1/admin/users/${user.id}`, { role });
      setRefreshIndex((index) => index + 1);
    } catch (requestError) {
      setError(requestError.message || "Unable to update the user role.");
    } finally {
      setSavingId(null);
    }
  };

  const updateStatus = async (user) => {
    setSavingId(user.id);
    setError("");
    try {
      await apiClient.patch(`/api/v1/admin/users/${user.id}/status`, {
        is_active: !user.is_active,
      });
      setRefreshIndex((index) => index + 1);
    } catch (requestError) {
      setError(requestError.message || "Unable to update account status.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopBar />
        <main className="dashboard-content">
          <PageHeader
            title="User management"
            description="Review accounts and manage roles and access status."
          />

          <section className="admin-users-panel" aria-label="User accounts">
            <div className="admin-users-toolbar">
              <span>{users.length} accounts</span>
              <button
                className="admin-users-refresh"
                type="button"
                onClick={() => setRefreshIndex((index) => index + 1)}
                disabled={loading}
                aria-label="Refresh users"
                title="Refresh users"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {error && <p className="admin-users-error" role="alert">{error}</p>}
            {loading ? (
              <p className="admin-users-state">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="admin-users-state">No user accounts found.</p>
            ) : (
              <div className="admin-users-table-wrap">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name || "-"}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            aria-label={`Role for ${user.email}`}
                            value={user.role}
                            onChange={(event) => updateRole(user, event.target.value)}
                            disabled={savingId === user.id}
                          >
                            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                          </select>
                        </td>
                        <td>
                          <span className={`admin-users-status ${user.is_active ? "is-active" : "is-inactive"}`}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</td>
                        <td>
                          <button
                            className="admin-users-action"
                            type="button"
                            onClick={() => updateStatus(user)}
                            disabled={savingId === user.id}
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminUsersPage;
