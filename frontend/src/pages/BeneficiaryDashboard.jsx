
import "./BeneficiaryDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  CreditCard,
  Users,
  Package,
  History,
  UserRound,
  LogOut,
  Menu,
  X,
  CalendarDays,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Clock,
  IndianRupee,
  CheckCircle2,
  Truck,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export default function BeneficiaryDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [distributions, setDistributions] = useState([]);
  const [loadingDistributions, setLoadingDistributions] = useState(false);
  const [distributionError, setDistributionError] = useState("");

  let storedUser = null;

  try {
    storedUser = JSON.parse(
      sessionStorage.getItem("rationflowUser") || "null"
    );
  } catch {
    storedUser = null;
  }

  const user = storedUser;
  const token = sessionStorage.getItem("rationflowToken");

  const beneficiaryName = user?.fullName || user?.name || "Beneficiary";
  const rationCardNumber = user?.rationCardNumber || "Not available";
  const firstName = beneficiaryName.trim().split(/\s+/)[0] || "Beneficiary";
  const today = new Date();

  const beneficiaryId = user?.id || user?._id;

  const navigationItems = [
    { label: "Overview", icon: Home },
    { label: "My Ration Card", icon: CreditCard },
    { label: "Family Details", icon: Users },
    { label: "Ration Distribution", icon: Package },
    { label: "Transaction History", icon: History },
    { label: "My Profile", icon: UserRound },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("rationflowToken");
    sessionStorage.removeItem("rationflowUser");
    navigate("/login", { replace: true });
  };

  // Fetch distribution records belonging to the logged-in beneficiary.
  async function fetchDistributions() {
    if (!beneficiaryId) {
      setDistributionError(
        "Your beneficiary account ID is missing. Please log out and sign in again."
      );
      setDistributions([]);
      return;
    }

    try {
      setLoadingDistributions(true);
      setDistributionError("");

      const response = await fetch(
        `${API_BASE_URL}/api/distributions/beneficiary/${encodeURIComponent(
          beneficiaryId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load your ration distribution records."
        );
      }

      // Supports either an array or the beneficiary-specific API response.
      const records = Array.isArray(data)
        ? data
        : Array.isArray(data.distributions)
        ? data.distributions
        : null;

      if (!records) {
        throw new Error("The server returned an unexpected response.");
      }

      setDistributions(
        records
          .filter((record) => record.status !== "Cancelled")
          .sort(
            (a, b) =>
              new Date(b.distributionDate || b.createdAt || 0) -
              new Date(a.distributionDate || a.createdAt || 0)
          )
      );
    } catch (error) {
      console.error("Beneficiary distribution error:", error);
      setDistributionError(
        error.message || "Unable to connect to the backend."
      );
    } finally {
      setLoadingDistributions(false);
    }
  }

  useEffect(() => {
    if (
      token &&
      user?.role === "Beneficiary" &&
      (activeTab === "Ration Distribution" ||
        activeTab === "Transaction History")
    ) {
      fetchDistributions();
    }
    // Fetch when the beneficiary opens either history page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token, beneficiaryId]);

  if (!token || user?.role !== "Beneficiary") {
    return (
      <div className="beneficiary-auth-message">
        <h2>Beneficiary login required</h2>
        <p>Please log in to access your beneficiary dashboard.</p>
        <button onClick={() => navigate("/beneficiary-login")}>
          Go to Beneficiary Login
        </button>
      </div>
    );
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date not available";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const renderOverview = () => (
    <>
      <section className="beneficiary-welcome">
        <div>
          <div className="beneficiary-eyebrow">
            <span className="beneficiary-live-dot" />
            {today
              .toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
              .toUpperCase()}
          </div>

          <h1>
            Good{" "}
            {today.getHours() < 12
              ? "morning"
              : today.getHours() < 17
              ? "afternoon"
              : "evening"}
            , {firstName} <span>✦</span>
          </h1>

          <p>
            Welcome to your RationFlow beneficiary portal. View your ration
            card, household information, and distribution history here.
          </p>
        </div>

        <div className="beneficiary-welcome-icon">
          <Package size={42} />
        </div>
      </section>

      <section className="beneficiary-summary-grid">
        <article className="beneficiary-summary-card">
          <div className="beneficiary-card-icon">
            <CreditCard size={22} />
          </div>
          <div>
            <span>Ration Card Number</span>
            <h3>{rationCardNumber}</h3>
            <small>Your registered card</small>
          </div>
        </article>

        <article className="beneficiary-summary-card">
          <div className="beneficiary-card-icon">
            <UserRound size={22} />
          </div>
          <div>
            <span>Beneficiary Name</span>
            <h3>{beneficiaryName}</h3>
            <small>Registered account holder</small>
          </div>
        </article>

        <article className="beneficiary-summary-card">
          <div className="beneficiary-card-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span>Account Type</span>
            <h3>{user?.cardType || "Ration Beneficiary"}</h3>
            <small>RationFlow portal</small>
          </div>
        </article>
      </section>

      <section className="beneficiary-content-card">
        <div className="beneficiary-section-heading">
          <div>
            <h2>Quick Access</h2>
            <p>Manage and view your ration-related information.</p>
          </div>
        </div>

        <div className="beneficiary-quick-grid">
          {[
            {
              title: "My Ration Card",
              description: "View your registered ration card details.",
              icon: CreditCard,
            },
            {
              title: "Family Details",
              description: "View your registered household information.",
              icon: Users,
            },
            {
              title: "Ration Distribution",
              description: "Check your ration distribution records.",
              icon: Package,
            },
            {
              title: "Transaction History",
              description: "Review your past ration transactions.",
              icon: History,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                className="beneficiary-quick-card"
                key={item.title}
                onClick={() => setActiveTab(item.title)}
              >
                <Icon size={25} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span>View details →</span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );

  const renderDistributionHistory = () => {
    const isDistribution = activeTab === "Ration Distribution";

    return (
      <section className="beneficiary-content-card">
        <div className="beneficiary-section-heading">
          <div>
            <h2>{activeTab}</h2>
            <p>
              {isDistribution
                ? "View the ration items issued to your household."
                : "Review your recorded ration distribution transactions."}
            </p>
          </div>

          {isDistribution ? <Package size={26} /> : <History size={26} />}
        </div>

        <div className="beneficiary-history-toolbar">
          <div>
            <strong>
              {distributions.length}{" "}
              {distributions.length === 1 ? "record" : "records"}
            </strong>
            <span> · Sorted by most recent</span>
          </div>

          <button
            type="button"
            className="beneficiary-refresh-button"
            onClick={fetchDistributions}
            disabled={loadingDistributions}
          >
            <RefreshCw
              size={16}
              className={loadingDistributions ? "beneficiary-spin" : ""}
            />
            {loadingDistributions ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {distributionError && (
          <div className="beneficiary-error-state" role="alert">
            <AlertCircle size={21} />
            <div>
              <strong>Unable to load records</strong>
              <p>{distributionError}</p>
              <button
                type="button"
                onClick={fetchDistributions}
                disabled={loadingDistributions}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loadingDistributions ? (
          <div className="beneficiary-loading-state">
            <span className="beneficiary-loading-spinner" />
            <p>Loading your records...</p>
          </div>
        ) : distributionError ? null : distributions.length === 0 ? (
          <div className="beneficiary-empty-state">
            {isDistribution ? (
              <Package size={40} />
            ) : (
              <History size={40} />
            )}
            <h3>No records available yet</h3>
            <p>
              {isDistribution
                ? "Your ration distribution records will appear here after a distribution has been recorded for your account."
                : "Your transaction history will appear here after a ration distribution has been recorded for your account."}
            </p>
          </div>
        ) : (
          <div className="beneficiary-record-list">
            {distributions.map((record) => {
              const recordDate =
                record.distributionDate || record.createdAt;

              return (
                <article
                  className="beneficiary-record-card"
                  key={record._id}
                >
                  <div className="beneficiary-record-header">
                    <div className="beneficiary-record-icon">
                      {isDistribution ? (
                        <Truck size={22} />
                      ) : (
                        <CreditCard size={22} />
                      )}
                    </div>

                    <div className="beneficiary-record-title">
                      <h3>
                        {isDistribution
                          ? "Ration Distribution"
                          : "Ration Transaction"}
                      </h3>
                      <span>
                        Reference:{" "}
                        {record._id
                          ? record._id.slice(-8).toUpperCase()
                          : "N/A"}
                      </span>
                    </div>

                    <span className="beneficiary-status-badge">
                      <CheckCircle2 size={14} />
                      {record.status || "Completed"}
                    </span>
                  </div>

                  <div className="beneficiary-record-date">
                    <Clock size={16} />
                    <span>{formatDate(recordDate)}</span>
                  </div>

                  <div className="beneficiary-record-items">
                    <h4>Items issued</h4>

                    {Array.isArray(record.items) &&
                    record.items.length > 0 ? (
                      <div className="beneficiary-items-list">
                        {record.items.map((item, index) => (
                          <div
                            className="beneficiary-item-row"
                            key={`${record._id}-${item.inventoryItem || index}`}
                          >
                            <div>
                              <strong>
                                {item.itemName || "Ration item"}
                              </strong>
                              <span>
                                {formatCurrency(item.pricePerUnit)} per{" "}
                                {item.unit || "unit"}
                              </span>
                            </div>

                            <div className="beneficiary-item-quantity">
                              <span>Quantity</span>
                              <strong>
                                {item.quantity} {item.unit || ""}
                              </strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No item details are available for this record.</p>
                    )}
                  </div>

                  <div className="beneficiary-record-footer">
                    <div>
                      <span>Distributed by</span>
                      <strong>{record.distributedBy || "System"}</strong>
                    </div>

                    <div className="beneficiary-record-total">
                      <span>
                        <IndianRupee size={14} />
                        Total amount
                      </span>
                      <strong>
                        {formatCurrency(record.totalAmount)}
                      </strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  const renderDetails = () => {
    if (activeTab === "Overview") {
      return renderOverview();
    }

    if (activeTab === "My Ration Card") {
      return (
        <section className="beneficiary-content-card">
          <div className="beneficiary-section-heading">
            <div>
              <h2>My Ration Card</h2>
              <p>Your registered ration card information.</p>
            </div>
            <CreditCard size={26} />
          </div>

          <div className="beneficiary-detail-list">
            <div>
              <span>Cardholder Name</span>
              <strong>{beneficiaryName}</strong>
            </div>
            <div>
              <span>Ration Card Number</span>
              <strong>{rationCardNumber}</strong>
            </div>
            <div>
              <span>Card Type</span>
              <strong>{user?.cardType || "Not available"}</strong>
            </div>
            <div>
              <span>Account Status</span>
              <strong>Active</strong>
            </div>
          </div>
        </section>
      );
    }

    if (activeTab === "Family Details") {
      return (
        <section className="beneficiary-content-card">
          <div className="beneficiary-section-heading">
            <div>
              <h2>Family Details</h2>
              <p>Your registered household information.</p>
            </div>
            <Users size={26} />
          </div>

          <div className="beneficiary-detail-list">
            <div>
              <span>Family Head</span>
              <strong>{beneficiaryName}</strong>
            </div>
            <div>
              <span>Number of Family Members</span>
              <strong>{user?.familyMembers ?? "Not available"}</strong>
            </div>
            <div>
              <span>Registered Address</span>
              <strong>{user?.address || "Not available"}</strong>
            </div>
          </div>
        </section>
      );
    }

    if (activeTab === "My Profile") {
      return (
        <section className="beneficiary-content-card">
          <div className="beneficiary-section-heading">
            <div>
              <h2>My Profile</h2>
              <p>Your registered beneficiary information.</p>
            </div>
            <UserRound size={26} />
          </div>

          <div className="beneficiary-detail-list">
            <div>
              <span>Full Name</span>
              <strong>{beneficiaryName}</strong>
            </div>
            <div>
              <span>Ration Card Number</span>
              <strong>{rationCardNumber}</strong>
            </div>
            <div>
              <span>Phone Number</span>
              <strong>{user?.phone || "Not available"}</strong>
            </div>
            <div>
              <span>Address</span>
              <strong>{user?.address || "Not available"}</strong>
            </div>
          </div>
        </section>
      );
    }

    if (
      activeTab === "Ration Distribution" ||
      activeTab === "Transaction History"
    ) {
      return renderDistributionHistory();
    }

    return renderOverview();
  };

  return (
    <div className="beneficiary-dashboard">
      <aside
        className={`beneficiary-sidebar ${
          menuOpen ? "beneficiary-sidebar-open" : ""
        }`}
      >
        <div className="beneficiary-brand">
          <div className="beneficiary-brand-icon">
            <Package size={24} />
          </div>

          <div>
            <strong>RationFlow</strong>
            <span>Beneficiary Portal</span>
          </div>

          <button
            type="button"
            className="beneficiary-mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="beneficiary-sidebar-label">
          BENEFICIARY MENU
        </div>

        <nav className="beneficiary-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.label;

            return (
              <button
                type="button"
                key={item.label}
                className={`beneficiary-nav-item ${
                  selected ? "beneficiary-nav-active" : ""
                }`}
                onClick={() => {
                  setActiveTab(item.label);
                  setMenuOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="beneficiary-sidebar-bottom">
          <div className="beneficiary-help-card">
            <ShieldCheck size={22} />
            <strong>Your information matters</strong>
            <p>Keep your ration card details up to date.</p>
          </div>

          <button
            type="button"
            className="beneficiary-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="beneficiary-sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="beneficiary-main">
        <header className="beneficiary-topbar">
          <div className="beneficiary-topbar-left">
            <button
              type="button"
              className="beneficiary-menu-toggle"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <div className="beneficiary-breadcrumb">
                RationFlow <span>›</span> {activeTab}
              </div>
              <h2>{activeTab}</h2>
            </div>
          </div>

          <div className="beneficiary-topbar-user">
            <div className="beneficiary-user-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{beneficiaryName}</strong>
              <span>Beneficiary</span>
            </div>

            <button
              type="button"
              className="beneficiary-topbar-logout"
              onClick={handleLogout}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="beneficiary-page-content">
          {renderDetails()}
        </div>

        <footer className="beneficiary-footer">
          <span>© {today.getFullYear()} RationFlow</span>
          <span>
            <CalendarDays size={14} />
            Beneficiary Portal
          </span>
        </footer>
      </main>
    </div>
  );
}
