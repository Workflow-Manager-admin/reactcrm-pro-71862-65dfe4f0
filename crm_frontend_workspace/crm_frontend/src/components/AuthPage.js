import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin, apiSignup, getMe } from "../utils/api";
import { UserContext } from "../App";

// PUBLIC_INTERFACE
const AuthPage = ({ mode: initialMode }) => {
  const { login } = React.useContext(UserContext);
  const [mode, setMode] = useState(initialMode); // "login" or "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        // Signup: name, email, password required
        if (!form.name.trim() || !/^[^\s]{2,}/.test(form.name)) {
          setError("Name must be at least 2 characters.");
          setLoading(false);
          return;
        }
      }
      if (!/\S+@\S+\.\S+/.test(form.email)) {
        setError("Enter a valid email address.");
        setLoading(false);
        return;
      }
      if (!form.password || form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      const res =
        mode === "login"
          ? await apiLogin(form.email, form.password)
          : await apiSignup(form.name, form.email, form.password);
      if (res.status === "ok" && res.token) {
        // fetch user info
        const meRes = await getMe(res.token);
        if (meRes.status !== "ok" || !meRes.user) {
          setError("Auth succeeded but user fetch failed.");
          setLoading(false);
          return;
        }
        login(res.token, meRes.user);
        navigate("/dashboard");
      } else {
        setError(
          res.message ||
            (Array.isArray(res.errors)
              ? res.errors[0].msg
              : "Unknown error. Please try again.")
        );
      }
    } catch (e) {
      setError("Network or server error.");
    }
    setLoading(false);
  }

  function handleSwitchMode(e) {
    e.preventDefault();
    setError("");
    setMode((m) => (m === "login" ? "signup" : "login"));
  }

  return (
    <div className="crmauth-container">
      <form className="crmauth-form" onSubmit={handleSubmit} autoComplete="on">
        <h2>{mode === "login" ? "Login to CRM" : "Sign Up for CRM"}</h2>
        {error && <div className="crm-error crm-mb-1">{error}</div>}
        {mode === "signup" && (
          <div className="crm-form-group">
            <label className="crm-form-label" htmlFor="name">Name</label>
            <input
              className="crm-input"
              name="name"
              id="name"
              autoComplete="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              minLength={2}
              maxLength={48}
              disabled={loading}
            />
          </div>
        )}
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="email">Email</label>
          <input
            className="crm-input"
            name="email"
            id="email"
            autoComplete="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            maxLength={128}
            disabled={loading}
          />
        </div>
        <div className="crm-form-group">
          <label className="crm-form-label" htmlFor="password">Password</label>
          <input
            className="crm-input"
            name="password"
            id="password"
            autoComplete="current-password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            minLength={6}
            disabled={loading}
          />
        </div>
        <button className="crm-btn" style={{ width: "100%" }} type="submit" disabled={loading}>
          {loading ? (mode === "login" ? "Logging in..." : "Signing up...") : (mode === "login" ? "Login" : "Sign Up")}
        </button>
        <div className="crmauth-switch">
          {mode === "login" ? (
            <>Need an account?
              <button onClick={handleSwitchMode} type="button" tabIndex={0}>Sign Up</button>
            </>
          ) : (
            <>Already registered?
              <button onClick={handleSwitchMode} type="button" tabIndex={0}>Login</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
export default AuthPage;
