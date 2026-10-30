
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export default function BeneficiaryLogin() {
  const navigate = useNavigate();

  const [rationCardNumber, setRationCardNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/beneficiary-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rationCardNumber: rationCardNumber.trim(),
            phone: phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      sessionStorage.setItem("rationflowToken", data.token);
      sessionStorage.setItem(
        "rationflowUser",
        JSON.stringify(data.user)
      );

      navigate("/beneficiary-dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Beneficiary Login</h1>
        <p>Sign in using your ration card details.</p>

        <label htmlFor="rationCardNumber">
          Ration Card Number
        </label>

        <input
          id="rationCardNumber"
          type="text"
          value={rationCardNumber}
          onChange={(event) =>
            setRationCardNumber(event.target.value)
          }
          placeholder="Enter ration card number"
          autoComplete="username"
          required
        />

        <label htmlFor="beneficiaryPhone">Phone Number</label>

        <input
          id="beneficiaryPhone"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Enter registered phone number"
          autoComplete="tel"
          maxLength={10}
          pattern="[0-9]{10}"
          title="Enter a valid 10-digit phone number"
          required
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
