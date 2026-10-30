
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Admin",
      description: "Manage the ration shop and system.",
      path: "/admin-login",
    },
    {
      title: "Beneficiary",
      description: "View your ration card and distribution details.",
      path: "/beneficiary-login",
    },
    {
      title: "Shop Employee",
      description: "Access shop operations and inventory.",
      path: "/employee-login",
    },
  ];

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>RationFlow</h1>
        <p>Digital Ration Shop Management System</p>

        <h2>Select your account</h2>

        {roles.map((role) => (
          <button
            key={role.title}
            className="login-role-button"
            onClick={() => navigate(role.path)}
          >
            <strong>{role.title}</strong>
            <span>{role.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
