import { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../api/auth";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoading(true);
      const response = await forgotPassword(email.trim());
      setMessage(response.message || "If the account exists, a password reset link has been sent.");
    } catch (err) {
      setError(err.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>FraudGuard</h1>
          <p>Reset your password</p>
        </div>

        {error && <div className="login-error">{error}</div>}
        {message && <div className="login-success" style={{ color: "#166534" }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p style={{ marginTop: "16px", textAlign: "center" }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
