import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { resetPassword } from "../api/auth";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset token is missing or invalid.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword(token, newPassword);
      setMessage(response.message || "Password reset successful.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>FraudGuard</h1>
          <p>Set a new password</p>
        </div>

        {error && <div className="login-error">{error}</div>}
        {message && <div className="login-success" style={{ color: "#166534" }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p style={{ marginTop: "16px", textAlign: "center" }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </main>
  );
}

export default ResetPasswordPage;
