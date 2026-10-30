
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export default function EmployeeLogin() {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


async function handleSubmit(event) {
  event.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/employee-login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employeeId.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Login failed (${response.status}).`);
    }

    if (!data.token || !data.user) {
      throw new Error("Login response is missing the token or user details.");
    }

    sessionStorage.setItem("rationflowToken", data.token);
    sessionStorage.setItem("rationflowUser", JSON.stringify(data.user));

    navigate("/", { replace: true });
  } catch (err) {
    setError(err.message || "Unable to connect to the server.");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Shop Employee Login</h1>
        <p>Sign in using your employee ID and registered mobile number.</p>

        <label htmlFor="employeeId">Employee ID</label>
        <input
          id="employeeId"
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
          placeholder="EMP001"
          required
          autoComplete="username"
        />

        <label htmlFor="employeePhone">Registered Mobile Number</label>
        <input
          id="employeePhone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]{10}"
          maxLength={10}
          value={phoneNumber}
          onChange={(event) =>
            setPhoneNumber(event.target.value.replace(/\D/g, ""))
          }
          placeholder="Enter 10-digit mobile number"
          required
          autoComplete="tel"
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
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
