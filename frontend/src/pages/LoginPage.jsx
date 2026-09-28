import { useState } from "react";
import "./LoginPage.css";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { login } from "../api/auth";

function LoginPage({ adminMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectPath = location.state?.from?.pathname || (adminMode ? "/admin/overview" : "/dashboard");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.trim(), password);

      if (adminMode && String(user?.role || "").toLowerCase() !== "admin") {
        throw new Error("This account is not authorized for the admin area.");
      }

      navigate(redirectPath, { replace: true });
    } catch (error) {
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <ShieldAlert size={28} />
          </div>

          <h1>FraudGuard</h1>
          <p>{adminMode ? "Administrative access" : "Risk Intelligence Platform"}</p>
        </div>

        <div className="login-heading">
          <h2>{adminMode ? "Admin sign in" : "Welcome back"}</h2>
          <p>{adminMode ? "Authorized administrators only." : "Sign in to access the fraud monitoring system."}</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" autoComplete="email" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : adminMode ? "Admin sign in" : "Sign In"}
          </button>
        </form>

        {!adminMode && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "14px" }}>
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/register">Create account</Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default LoginPage;