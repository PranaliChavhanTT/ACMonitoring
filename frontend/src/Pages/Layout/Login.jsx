
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  UserCog,
} from "lucide-react";

import { useAuth } from "./AuthContext";
import { ROLES, ROLE_LABELS, ROLE_DASHBOARD } from "./MenuConfig";

import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: ROLES.ORG_SUPER_ADMIN,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(ROLE_DASHBOARD[user.role] || "/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.role) return setError("Please select a role.");
    if (!form.email.trim()) return setError("Please enter your email.");
    if (!form.password) return setError("Please enter your password.");

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.detail ||
          data.non_field_errors?.[0] ||
          Object.values(data).flat()[0] ||
          "Login failed.";
        throw new Error(msg);
      }

      // Store token
      localStorage.setItem("token", data.token);

      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        scopeId: data.user.scope_id,
        scopeName: data.user.scope_name,
        loginAt: new Date().toISOString(),
      });

      const redirectTo =
        data.redirect ||
        location.state?.from?.pathname ||
        ROLE_DASHBOARD[data.user.role] ||
        "/";

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <main className="login-form-wrap">
          <header className="login-head">
            <h2>Sign in</h2>
            <p>Select your role and continue to your dashboard</p>
          </header>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ROLE */}
            <div className="field">
              <label htmlFor="role">Login as</label>
              <div className="input-wrap">
                <UserCog size={17} className="input-icon" />
                <select id="role" value={form.role} onChange={update("role")}>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Email / User ID</label>
              <div className="input-wrap">
                <Mail size={17} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={update("email")}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <Lock size={17} className="input-icon" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update("password")}
                />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}