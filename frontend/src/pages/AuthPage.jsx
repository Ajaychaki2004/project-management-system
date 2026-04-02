import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { callApi } from "../lib/api";
import { setToken } from "../lib/session";
import { useToast } from "../components/ToastProvider";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const onAuthSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        await callApi("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify(authForm),
        });
        showToast("Signup successful. Please login.", "success");
        setMode("login");
      } else {
        const data = await callApi("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(authForm),
        });
        setToken(data.token);
        showToast("Login successful.", "success");
        navigate("/products", { replace: true });
      }
      setAuthForm({ email: "", password: "" });
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell auth-shell">
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      <section className="panel auth-page-panel">
        <h1>Product Control Center</h1>
        <p>Secure login to manage your products with role-isolated access.</p>

        <div className="auth-switch">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
            type="button"
          >
            Signup
          </button>
        </div>

        <form onSubmit={onAuthSubmit} className="stack-form">
          <label>
            Email
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
