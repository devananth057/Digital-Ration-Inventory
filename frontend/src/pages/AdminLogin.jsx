
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed.");
      }

      sessionStorage.setItem("rationflowToken", data.token);
      sessionStorage.setItem("rationflowUser", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>RationFlow</h1>
        <h2>Administrator Login</h2>
        <p>Sign in to manage the ration shop.</p>

        <label htmlFor="adminUsername">Username</label>
        <input
          id="adminUsername"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="adminPassword">Password</label>
        <input
          id="adminPassword"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login as Admin"}
        </button>

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/login")}
        >
          Back
        </button>
      </form>
    </div>
  );
}
