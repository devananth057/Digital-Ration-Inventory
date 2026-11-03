import { useMemo, useState, useEffect } from "react";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import BeneficiaryLogin from "./pages/BeneficiaryLogin";
import EmployeeLogin from "./pages/EmployeeLogin";
import BeneficiaryDashboard from "./pages/BeneficiaryDashboard";
import {
  NavLink,
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";

import {
  LayoutDashboard, UsersRound, CreditCard, Boxes, ShoppingBasket, ReceiptText,
  ChartNoAxesCombined, UserCog, Bell, Settings, Search, ChevronDown, Menu,
  X, Wheat, ArrowUpRight, ArrowDownRight, AlertTriangle, Plus, Download,
  MoreHorizontal, CalendarDays, CheckCircle2, Clock3, PackageCheck, ShieldCheck,
  LogOut, ChevronRight, Filter, CircleHelp,RefreshCw,SlidersHorizontal,Save
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar
} from "recharts";
import { beneficiaries, inventory, transactions } from "./data/mockData";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const navGroups = [
  { label: "OVERVIEW", items: [{ label: "Dashboard", path: "/", icon: LayoutDashboard }] },
  { label: "OPERATIONS", items: [
    { label: "Beneficiaries", path: "/beneficiaries", icon: UsersRound },
    { label: "Ration cards", path: "/ration-cards", icon: CreditCard },
    { label: "Inventory", path: "/inventory", icon: Boxes },
    { label: "Distribution", path: "/distribution", icon: ShoppingBasket },
    { label: "Transactions", path: "/transactions", icon: ReceiptText }
  ]},
  { label: "MANAGEMENT", items: [
    { label: "Reports", path: "/reports", icon: ChartNoAxesCombined },
    { label: "Employees", path: "/employees", icon: UserCog },
    { label: "Notifications", path: "/notifications", icon: Bell }
  ]}
];

const chartData = [
  { day: "23 Oct", distributions: 92 }, { day: "24 Oct", distributions: 118 },
  { day: "25 Oct", distributions: 104 }, { day: "26 Oct", distributions: 146 },
  { day: "27 Oct", distributions: 132 }, { day: "28 Oct", distributions: 169 },
  { day: "29 Oct", distributions: 154 }
];
const itemData = [
  { name: "Rice", issued: 420 }, { name: "Sugar", issued: 210 },
  { name: "Wheat", issued: 180 }, { name: "Kerosene", issued: 95 }
];
const KG_PER_FAMILY_MEMBER = 3;
function Sidebar({ mobileOpen, closeMobile, lowStockCount = 0 }) {
  let user = null;

  try {
    user = JSON.parse(
      sessionStorage.getItem("rationflowUser") || "null"
    );
  } catch {
    user = null;
  }

  const isAdmin = user?.role === "Admin";
// Employees cannot see Inventory, Employee Management, or Settings.
const visibleNavGroups = navGroups
  .map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (
        !isAdmin &&
        ["/inventory", "/employees", "/settings"].includes(item.path)
      ) {
        return false;
      }

      return true;
    }),
  }))
  .filter((group) => group.items.length > 0);

  return (
    <>
      {mobileOpen && (
        <button
          className="mobile-scrim"
          onClick={closeMobile}
          aria-label="Close navigation"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Wheat size={23} />
          </div>

          <div>
            <div className="brand-name">
              Ration<span>Flow</span>
            </div>
            <div className="brand-subtitle">SHOP MANAGEMENT</div>
          </div>

          <button
            className="icon-button mobile-close"
            onClick={closeMobile}
          >
            <X size={18} />
          </button>
        </div>

        <div className="shop-switcher">
          <div className="shop-avatar">RS</div>

          <div className="shop-info">
            <strong>Coimbatore Shop</strong>
            <span>Shop ID · TN-CBE-042</span>
          </div>

          <ChevronDown size={16} className="muted" />
        </div>

        <nav className="nav-list">
          {visibleNavGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-heading">{group.label}</div>

              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <item.icon size={18} strokeWidth={1.9} />

                  <span>{item.label}</span>

                  {item.label === "Notifications" &&
                    lowStockCount > 0 && (
                      <span className="nav-count">
                        {lowStockCount}
                      </span>
                    )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={18} />
            </div>

            <div>
              <strong>Need help?</strong>
              <span>Visit help centre</span>
            </div>

            <ChevronRight size={16} />
          </div>

          {isAdmin && (
            <NavLink
              to="/settings"
              className="nav-item settings-link"
              onClick={closeMobile}
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          )}

          <div className="sidebar-footer">
            <span className="online-dot" />
            All systems operational
            <span className="version">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenu }) {
  const location = useLocation();

  const current = navGroups
    .flatMap(g => g.items)
    .find(i => i.path === location.pathname);

  const title = current?.label || "Dashboard";

  // Get the logged-in user's details
  let user = null;

  try {
    user = JSON.parse(
      sessionStorage.getItem("rationflowUser") || "null"
    );
  } catch {
    user = null;
  }

  const displayName =
    user?.fullName ||
    user?.name ||
    (user?.role === "Admin" ? "Devananth P K" : user?.employeeId) ||
    "User";

  const displayRole =
    user?.role === "Admin"
      ? "Administrator"
      : user?.role || "User";

  const avatarText = displayName
    .split(" ")
    .filter(Boolean)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    sessionStorage.removeItem("rationflowToken");
    sessionStorage.removeItem("rationflowUser");
    window.location.href = "/login";
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-button menu-toggle"
          onClick={onMenu}
        >
          <Menu size={21} />
        </button>

        <div>
          <div className="breadcrumb">
            Workspace <ChevronRight size={13} /> <span>{title}</span>
          </div>
          <div className="topbar-title">{title}</div>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="date-chip">
          <CalendarDays size={15} />
          <span>29 October 2026</span>
        </div>

        <button
          className="icon-button notification-button"
          aria-label="Notifications"
          title="View Notifications"
          onClick={() => {
            window.location.href = "/notifications";
          }}
        >
          <Bell size={19} />
          <i />
        </button>

        <div className="topbar-divider" />

        <button className="profile-button" type="button">
          <div className="profile-avatar">
            {avatarText || "U"}
          </div>

          <div className="profile-text">
            <strong>{displayName}</strong>
            <span>{displayRole}</span>
          </div>

          <ChevronDown size={15} />
        </button>

        <button
          onClick={handleLogout}
          className="logout-button"
          title="Logout"
        >
          Logout
        </button>
      </div>
    </header>
  );
}


function StatCard({ title, value, change, trend, note, icon: Icon, tone }) {
  return <div className="stat-card">
    <div className="stat-top"><span>{title}</span><div className={`stat-icon ${tone}`}><Icon size={19} /></div></div>
    <div className="stat-value">{value}</div>
    <div className="stat-bottom"><span className={`trend ${trend === "down" ? "trend-down" : ""}`}>{trend === "down" ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}{change}</span><span className="stat-note">{note}</span></div>
  </div>;
}

function StatusBadge({ children }) {
  const value = String(children).toLowerCase();
  return <span className={`status-badge ${value.includes("inactive") ? "status-inactive" : value.includes("low") ? "status-low" : "status-success"}`}><i />{children}</span>;
}


function Dashboard() {
  const [period, setPeriod] = useState("Last 7 days");
  const [dashboardBeneficiaries, setDashboardBeneficiaries] = useState([]);
  const [dashboardInventory, setDashboardInventory] = useState([]);
  const [dashboardTransactions, setDashboardTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = `${API_BASE_URL}/api`;

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [beneficiariesRes, inventoryRes, distributionsRes] =
          await Promise.all([
            fetch(`${API}/beneficiaries`),
            fetch(`${API}/inventory`),
            fetch(`${API}/distributions`),
          ]);

        if (
          !beneficiariesRes.ok ||
          !inventoryRes.ok ||
          !distributionsRes.ok
        ) {
          throw new Error("Unable to load dashboard data from the backend.");
        }

        const [beneficiariesData, inventoryData, distributionsData] =
          await Promise.all([
            beneficiariesRes.json(),
            inventoryRes.json(),
            distributionsRes.json(),
          ]);

        setDashboardBeneficiaries(
          Array.isArray(beneficiariesData) ? beneficiariesData : []
        );
        setDashboardInventory(
          Array.isArray(inventoryData) ? inventoryData : []
        );
        setDashboardTransactions(
          Array.isArray(distributionsData) ? distributionsData : []
        );
      } catch (err) {
        setError(err.message || "Unable to connect to the backend.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const activeBeneficiaries = dashboardBeneficiaries.filter(
    (b) => b.status === "Active"
  ).length;

  const today = new Date();
  const isToday = (dateValue) => {
    const date = new Date(dateValue);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const completedTransactions = dashboardTransactions.filter(
    (t) => t.status === "Completed"
  );

  const distributionsToday = completedTransactions.filter((t) =>
    isToday(t.distributionDate)
  ).length;

  const lowStock = dashboardInventory.filter(
    (item) => Number(item.quantity) <= Number(item.lowStockThreshold ?? 10)
  );

  const totalStockValue = dashboardInventory.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.pricePerUnit || 0),
    0
  );

  const stockAvailability = dashboardInventory.length
    ? Math.round(
        (dashboardInventory.filter(
          (item) =>
            Number(item.quantity) >
            Number(item.lowStockThreshold ?? 10)
        ).length /
          dashboardInventory.length) *
          100
      )
    : 0;

  const totalDistributionValue = completedTransactions.reduce(
    (sum, t) => sum + Number(t.totalAmount || 0),
    0
  );

  const chartDays = Array.from({ length: period === "Last 30 days" ? 30 : 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (period === "Last 30 days" ? 29 : 6) + i);
    return date;
  });

  const liveChartData = chartDays.map((date) => {
    const dayTransactions = completedTransactions.filter((t) => {
      const d = new Date(t.distributionDate);

      return (
        !Number.isNaN(d.getTime()) &&
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

    return {
      day: period === "Last 30 days"
        ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : date.toLocaleDateString("en-IN", { weekday: "short" }),
      distributions: dayTransactions.length,
    };
  });

  const recentTransactions = [...dashboardTransactions]
    .sort(
      (a, b) =>
        new Date(b.distributionDate).getTime() -
        new Date(a.distributionDate).getTime()
    )
    .slice(0, 4)
    .map((t) => ({
      id: t._id,
      person: t.beneficiary?.fullName || "Unknown beneficiary",
      card: t.beneficiary?.rationCardNumber || "N/A",
      items: Array.isArray(t.items)
        ? t.items
            .map((item) => `${item.itemName} (${item.quantity} ${item.unit})`)
            .join(", ")
        : "No items",
      date: t.distributionDate
        ? new Date(t.distributionDate).toLocaleString("en-IN")
        : "N/A",
      status: t.status || "Completed",
    }));

  return (
    <div className="page-content">
      <div className="welcome-row">
      
<div>
  <div className="eyebrow">
    <span className="live-dot" />
    {today.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).toUpperCase()}
  </div>

  <h1>
    Good{" "}
    {today.getHours() < 12
      ? "morning"
      : today.getHours() < 17
      ? "afternoon"
      : "evening"}
    ,{" "}
    {(() => {
      try {
        const user = JSON.parse(
          sessionStorage.getItem("rationflowUser") || "null"
        );

        const name =
          user?.fullName ||
          user?.name ||
          (user?.role === "Admin" ? "Devananth P K" : "User");

        return name.split(" ")[0];
      } catch {
        return "User";
      }
    })()}
    {" "}
    <span className="wave">✦</span>
  </h1>

  <p>Here's what's happening at your ration shop today.</p>
</div>


        <button
          className="primary-button"
          onClick={() => (window.location.href = "/distribution")}
        >
          <Plus size={17} /> New distribution
        </button>
      </div>

      {error && (
        <div className="inline-message">
          {error} Check that your backend and MongoDB are running.
        </div>
      )}

      {loading && (
        <div className="inline-message">Loading live dashboard data...</div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Total beneficiaries"
          value={dashboardBeneficiaries.length.toLocaleString("en-IN")}
          change={`${activeBeneficiaries} active`}
          note="registered beneficiaries"
          icon={UsersRound}
          tone="blue"
        />

        <StatCard
          title="Distributions today"
          value={distributionsToday.toLocaleString("en-IN")}
          change={`${completedTransactions.length} completed`}
          note="all-time completed"
          icon={ShoppingBasket}
          tone="green"
        />

        <StatCard
          title="Stock availability"
          value={`${stockAvailability}%`}
          change={`${dashboardInventory.length} products`}
          note={`₹${totalStockValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })} stock value`}
          icon={Boxes}
          tone="violet"
        />

        <StatCard
          title="Pending alerts"
          value={String(lowStock.length).padStart(2, "0")}
          change={lowStock.length ? "Needs attention" : "All stock healthy"}
          trend="down"
          note="low-stock products"
          icon={AlertTriangle}
          tone="amber"
        />
      </div>

      <div className="main-grid">
        <section className="panel distribution-panel">
          <div className="panel-header">
            <div>
              <h2>Distribution overview</h2>
              <p>Completed ration distribution activity</p>
            </div>

            <select
              className="select-control"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>

          <div className="chart-legend">
            <span>
              <i className="legend-dot blue-dot" /> Distributions
            </span>
            <span className="chart-total">
              {liveChartData.reduce((sum, d) => sum + d.distributions, 0)}
              <small> total in selected period</small>
            </span>
          </div>

          <div className="area-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={liveChartData}
                margin={{ top: 10, right: 5, left: -22, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="distFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5578f5" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#5578f5" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf0f6" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#929bb0", fontSize: 11 }}
                  dy={10}
                  interval={period === "Last 30 days" ? 4 : 0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#929bb0", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #edf0f6",
                    borderRadius: 12,
                    boxShadow: "0 8px 24px #1b2b4a12",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="distributions"
                  stroke="#5578f5"
                  strokeWidth={2.5}
                  fill="url(#distFill)"
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-foot">
            <span>
              <span className="tiny-dot" /> Daily completed distributions
            </span>
            <span className="foot-highlight">
              <CheckCircle2 size={14} /> Live database data
            </span>
          </div>
        </section>

        <section className="panel stock-panel">
          <div className="panel-header">
            <div>
              <h2>Stock overview</h2>
              <p>Current inventory levels</p>
            </div>
            <button
              className="text-button"
              onClick={() => (window.location.href = "/inventory")}
            >
              View inventory <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="stock-list">
            {dashboardInventory.map((item) => {
              const quantity = Number(item.quantity || 0);
              const minimum = Number(item.lowStockThreshold ?? 10);
              const pct =
                quantity + minimum > 0
                  ? Math.min(
                      100,
                      Math.round((quantity / (minimum * 4 || 1)) * 100)
                    )
                  : 0;
              const low = quantity <= minimum;

              return (
                <div className="stock-item" key={item._id}>
                  <div className="stock-item-top">
                    <div className="product-icon">
                      <Wheat size={17} />
                    </div>
                    <div className="product-info">
                      <strong>{item.itemName}</strong>
                      <span>{item.category}</span>
                    </div>
                    <div className="stock-quantity">
                      <strong>{quantity.toLocaleString("en-IN")}</strong>
                      <span>{item.unit}</span>
                    </div>
                  </div>

                  <div className="stock-progress">
                    <div className={`progress-track ${low ? "progress-low" : ""}`}>
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <span className={low ? "low-label" : "healthy-label"}>
                      {low ? "Low stock" : "In stock"}
                    </span>
                  </div>
                </div>
              );
            })}

            {!loading && dashboardInventory.length === 0 && (
              <p className="inline-message">No inventory records found.</p>
            )}
          </div>

          <div className="stock-footer">
            <span>
              <span className="tiny-dot green" />{" "}
              {dashboardInventory
                .reduce((sum, item) => sum + Number(item.quantity || 0), 0)
                .toLocaleString("en-IN")}{" "}
              total units
            </span>
            <span className="muted">
              {dashboardInventory.length} products
            </span>
          </div>
        </section>
      </div>

      <div className="bottom-grid">
        <section className="panel transactions-panel">
          <div className="panel-header">
            <div>
              <h2>Recent distributions</h2>
              <p>Latest transactions recorded in the system</p>
            </div>
            <button
              className="text-button"
              onClick={() => (window.location.href = "/transactions")}
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>TRANSACTION</th>
                  <th>BENEFICIARY</th>
                  <th>ITEMS ISSUED</th>
                  <th>DATE &amp; TIME</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="transaction-id">{t.id}</span>
                    </td>
                    <td>
                      <div className="table-person">
                        <div className="mini-avatar">
                          {t.person
                            .split(" ")
                            .map((s) => s[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <strong>{t.person}</strong>
                          <span>{t.card}</span>
                        </div>
                      </div>
                    </td>
                    <td>{t.items}</td>
                    <td className="date-cell">{t.date}</td>
                    <td>
                      <StatusBadge>{t.status}</StatusBadge>
                    </td>
                    <td>
                      <button className="icon-button row-more" aria-label="More actions">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "25px" }}>
                      No distributions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel alerts-panel">
          <div className="panel-header">
            <div>
              <h2>Attention needed</h2>
              <p>Items that may need your action</p>
            </div>
            <span className="alert-count">{lowStock.length}</span>
          </div>

          <div className="alert-list">
            {lowStock.map((item) => (
              <div className="alert-item" key={item._id}>
                <div className="alert-symbol alert-red">
                  <AlertTriangle size={17} />
                </div>
                <div className="alert-copy">
                  <strong>Low stock: {item.itemName}</strong>
                  <span>
                    {item.quantity} {item.unit} remaining · Minimum{" "}
                    {item.lowStockThreshold ?? 10} {item.unit}
                  </span>
                  <small>Inventory alert</small>
                </div>
                <ChevronRight size={17} className="muted" />
              </div>
            ))}

            {!loading && lowStock.length === 0 && (
              <div className="alert-item">
                <div className="alert-symbol alert-blue">
                  <CheckCircle2 size={17} />
                </div>
                <div className="alert-copy">
                  <strong>No low-stock alerts</strong>
                  <span>All products are above their stock thresholds.</span>
                </div>
              </div>
            )}
          </div>

          <button
            className="outline-button alert-action"
            onClick={() => (window.location.href = "/inventory")}
          >
            View inventory alerts <ChevronRight size={15} />
          </button>
        </section>
      </div>

      <div className="demo-note">
        <ShieldCheck size={16} />
        <span>
          <strong>Live database:</strong> Dashboard metrics, inventory levels,
          distribution history, and low-stock alerts use records from your
          backend.
        </span>
      </div>
    </div>
  );
}

function PageHeader({ title, description, action, onAction }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{action && <button className="primary-button" onClick={onAction}><Plus size={17}/>{action}</button>}</div>;
}

function Beneficiaries() {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    card: "",
    category: "PHH",
    mobile: "",
    address: "",
    familyMembers: "1",
  });

  // Fetch beneficiaries from the Express backend.
  async function fetchBeneficiaries() {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/beneficiaries`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load beneficiaries.");
      }

      // Convert MongoDB fields into the fields used by the existing UI.
      const mappedData = data.map((b) => ({
        id: b._id,
        name: b.fullName,
        card: b.rationCardNumber,
        category: b.cardType,
        mobile: b.phone,
        address: b.address,
        familyMembers: b.familyMembers,
        status: b.status,
      }));

      setList(mappedData);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the backend. Check whether the server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  // Filter the actual database records.
  const filtered = useMemo(
    () =>
      list.filter((b) =>
        `${b.name} ${b.card} ${b.mobile}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [list, query]
  );

  // Register a beneficiary in MongoDB.
  async function addBeneficiary(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/beneficiaries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: form.name.trim(),
            rationCardNumber: form.card.trim(),
            phone: form.mobile.trim(),
            address: form.address.trim(),
            familyMembers: Number(form.familyMembers),
            cardType: form.category,
            status: "Active",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to register beneficiary."
        );
      }

      setSuccess("Beneficiary registered successfully!");

      setForm({
        name: "",
        card: "",
        category: "PHH",
        mobile: "",
        address: "",
        familyMembers: "1",
      });

      setShowForm(false);

      // Refresh the table using records returned by the backend.
      await fetchBeneficiaries();
    } catch (err) {
      setError(
        err.message ||
          "Unable to register beneficiary. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const activeCount = list.filter(
    (b) => b.status === "Active"
  ).length;

  const inactiveCount = list.length - activeCount;

  return (
    <div className="page-content">
      <PageHeader
        title="Beneficiaries"
        description="Register and manage ration card beneficiaries."
        action={showForm ? "Close form" : "Add beneficiary"}
        onAction={() => {
          setShowForm(!showForm);
          setError("");
          setSuccess("");
        }}
      />

      <div className="stats-grid compact-stats">
        <StatCard
          title="Total beneficiaries"
          value={String(list.length)}
          change="Database"
          note="registered records"
          icon={UsersRound}
          tone="blue"
        />

        <StatCard
          title="Active records"
          value={String(activeCount)}
          change="Eligible"
          note="active beneficiaries"
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          title="Inactive records"
          value={String(inactiveCount)}
          change="Inactive"
          note="not currently active"
          icon={UserCog}
          tone="amber"
        />
      </div>

      {error && (
        <div className="inline-message" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" role="status">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {showForm && (
        <form
          className="panel inline-form"
          onSubmit={addBeneficiary}
        >
          <h2>Register beneficiary</h2>

          <div className="form-grid">
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </label>

            <label>
              Ration card number
              <input
                required
                value={form.card}
                onChange={(e) =>
                  setForm({ ...form, card: e.target.value })
                }
                placeholder="e.g. TN-42-008156"
              />
            </label>

            <label>
              Mobile number
              <input
                required
                type="tel"
                pattern="[0-9]{10}"
                title="Enter a 10-digit mobile number"
                value={form.mobile}
                onChange={(e) =>
                  setForm({ ...form, mobile: e.target.value })
                }
                placeholder="10-digit mobile number"
              />
            </label>

            <label>
              Card category
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option value="PHH">PHH</option>
                <option value="AAY">AAY</option>
                <option value="NPHH">NPHH</option>
              </select>
            </label>

            <label>
              Family members
              <input
                required
                type="number"
                min="1"
                value={form.familyMembers}
                onChange={(e) =>
                  setForm({
                    ...form,
                    familyMembers: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Address
              <input
                required
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                placeholder="Enter residential address"
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="outline-button"
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save beneficiary"}
            </button>
          </div>
        </form>
      )}

      <section className="panel data-panel">
        <div className="data-toolbar">
          <div>
            <h2>
              All beneficiaries{" "}
              <span className="count-pill">{filtered.length}</span>
            </h2>
            <p>Search and review registered beneficiaries</p>
          </div>

          <div className="toolbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                placeholder="Search name, card or mobile..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <button
              className="outline-button"
              type="button"
              onClick={fetchBeneficiaries}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>BENEFICIARY</th>
                <th>RATION CARD NO.</th>
                <th>CATEGORY</th>
                <th>MOBILE</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading beneficiaries...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    No beneficiaries found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className="table-person">
                        <div className="mini-avatar">
                          {b.name
                            .split(" ")
                            .map((s) => s[0])
                            .join("")}
                        </div>

                        <div>
                          <strong>{b.name}</strong>
                          <span>{b.familyMembers} family member(s)</span>
                        </div>
                      </div>
                    </td>

                    <td className="transaction-id">{b.card}</td>

                    <td>
                      <span
                        className={`category-badge ${
                          b.category === "AAY"
                            ? "category-aay"
                            : ""
                        }`}
                      >
                        {b.category}
                      </span>
                    </td>

                    <td>{b.mobile}</td>

                    <td>
                      <StatusBadge>{b.status}</StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing <strong>{filtered.length}</strong> of{" "}
            <strong>{list.length}</strong> database records
          </span>
        </div>
      </section>

      <div className="demo-note">
        <ShieldCheck size={16} />
        <span>
          <strong>Live database:</strong> Beneficiary records are
          retrieved from MongoDB through the Express backend.
        </span>
      </div>
    </div>
  );
}

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    category: "Grains",
    quantity: "",
    unit: "kg",
    pricePerUnit: "",
    minimum: "10",
  };

  const [form, setForm] = useState(emptyForm);

  const API = `${API_BASE_URL}/api/inventory`;

  async function fetchInventory() {
    try {
      setError("");

      const response = await fetch(API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load inventory.");
      }

      setItems(
        data.map((item) => ({
          id: item._id,
          name: item.itemName,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          pricePerUnit: item.pricePerUnit,
          minimum: item.lowStockThreshold ?? 10,
        }))
      );
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        `${item.name} ${item.category}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [items, query]
  );

  const lowStockCount = items.filter(
    (item) => item.quantity <= item.minimum
  ).length;

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      pricePerUnit: String(item.pricePerUnit),
      minimum: String(item.minimum),
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function saveItem(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        itemName: form.name.trim(),
        category: form.category.trim(),
        quantity: Number(form.quantity),
        unit: form.unit,
        pricePerUnit: Number(form.pricePerUnit),
        lowStockThreshold: Number(form.minimum),
      };

      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save inventory item.");
      }

      setSuccess(
        editingId
          ? "Inventory item updated successfully."
          : "Inventory item added successfully."
      );

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await fetchInventory();
    } catch (err) {
      setError(err.message || "Unable to save inventory item.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id, name) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete item.");
      }

      setSuccess("Inventory item deleted successfully.");
      await fetchInventory();
    } catch (err) {
      setError(err.message || "Unable to delete inventory item.");
    }
  }

  return (
    <div className="page-content">
      <PageHeader
        title="Inventory"
        description="Monitor stock levels and manage ration items."
        action={showForm ? "Close form" : "Add item"}
        onAction={() => {
          if (showForm) {
            setShowForm(false);
            setEditingId(null);
          } else {
            openAddForm();
          }
        }}
      />

      {error && (
        <div className="inline-message" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" role="status">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <div className="stats-grid compact-stats">
        <StatCard
          title="Products tracked"
          value={String(items.length).padStart(2, "0")}
          change="Database"
          note="inventory items"
          icon={Boxes}
          tone="blue"
        />

        <StatCard
          title="Healthy stock"
          value={String(items.length - lowStockCount).padStart(2, "0")}
          change="In range"
          note="above minimum level"
          icon={PackageCheck}
          tone="green"
        />

        <StatCard
          title="Low stock items"
          value={String(lowStockCount).padStart(2, "0")}
          change="Action needed"
          note="replenishment alerts"
          icon={AlertTriangle}
          tone="amber"
        />
      </div>

      {showForm && (
        <form className="panel inline-form" onSubmit={saveItem}>
          <h2>{editingId ? "Update inventory item" : "Add inventory item"}</h2>

          <div className="form-grid">
            <label>
              Product name
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="e.g. Toor dal"
              />
            </label>

            <label>
              Category
              <input
                required
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                placeholder="e.g. Grains"
              />
            </label>

            <label>
              Available quantity
              <input
                required
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
                placeholder="Quantity"
              />
            </label>

            <label>
              Unit
              <select
                value={form.unit}
                onChange={(e) =>
                  setForm({ ...form, unit: e.target.value })
                }
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="litre">Litres</option>
                <option value="packet">Packets</option>
                <option value="piece">Pieces</option>
              </select>
            </label>

            <label>
              Price per unit (₹)
              <input
                required
                type="number"
                min="0"
                step="any"
                value={form.pricePerUnit}
                onChange={(e) =>
                  setForm({ ...form, pricePerUnit: e.target.value })
                }
                placeholder="Price"
              />
            </label>

            <label>
              Minimum stock threshold
              <input
                required
                type="number"
                min="0"
                step="any"
                value={form.minimum}
                onChange={(e) =>
                  setForm({ ...form, minimum: e.target.value })
                }
                placeholder="Alert threshold"
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="outline-button"
              disabled={saving}
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update item"
                : "Save item"}
            </button>
          </div>
        </form>
      )}

      <section className="panel data-panel">
        <div className="data-toolbar">
          <div>
            <h2>
              Stock levels{" "}
              <span className="count-pill">{filteredItems.length}</span>
            </h2>
            <p>Current availability and replenishment thresholds</p>
          </div>

          <div className="toolbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="outline-button"
              onClick={fetchInventory}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>AVAILABLE STOCK</th>
                <th>MINIMUM LEVEL</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading inventory...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6">No inventory items found.</td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const low = item.quantity <= item.minimum;

                  const percentage =
                    item.minimum > 0
                      ? Math.min(
                          100,
                          (item.quantity / (item.minimum * 4)) * 100
                        )
                      : item.quantity > 0
                      ? 100
                      : 0;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="product-cell">
                          <div className="product-icon">
                            <Wheat size={17} />
                          </div>
                          <strong>{item.name}</strong>
                        </div>
                      </td>

                      <td>{item.category}</td>

                      <td>
                        <strong>
                          {item.quantity.toLocaleString()} {item.unit}
                        </strong>

                        <div className="mini-progress">
                          <span
                            className={low ? "mini-progress-low" : ""}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>

                      <td>
                        {item.minimum} {item.unit}
                      </td>

                      <td>
                        <StatusBadge>
                          {low ? "Low stock" : "In stock"}
                        </StatusBadge>
                      </td>

                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="outline-button"
                            onClick={() => openEditForm(item)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="outline-button"
                            onClick={() => deleteItem(item.id, item.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing <strong>{filteredItems.length}</strong> of{" "}
            <strong>{items.length}</strong> database records
          </span>

          <span>Stock levels update after each refresh.</span>
        </div>
      </section>

      <div className="demo-note">
        <ShieldCheck size={16} />
        <span>
          <strong>Live database:</strong> Inventory is loaded from MongoDB.
          Changes are sent to the Express backend.
        </span>
      </div>
    </div>
  );
}

function DistributionPage() {
  const [card, setCard] = useState("");
  const [found, setFound] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [distribution, setDistribution] = useState(null);
  const [distributedBy, setDistributedBy] = useState("Devananth P K");

const BENEFICIARY_API = `${API_BASE_URL}/api/beneficiaries`;
const INVENTORY_API = `${API_BASE_URL}/api/inventory`;
const DISTRIBUTION_API = `${API_BASE_URL}/api/distributions`;

  async function loadInventory() {
    const response = await fetch(INVENTORY_API);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load inventory.");
    }

    setItems(
      data.map((item) => ({
        id: item._id,
        name: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
      }))
    );
  }

  useEffect(() => {
    loadInventory().catch((err) => setError(err.message));
  }, []);

  async function searchBeneficiary(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");
    setFound(null);
    setSelectedItems([]);
    setDistribution(null);

    try {
      const response = await fetch(BENEFICIARY_API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load beneficiaries.");
      }

      const beneficiary = data.find(
        (b) =>
          b.rationCardNumber.toLowerCase() ===
          card.trim().toLowerCase()
      );

      if (!beneficiary) {
        setError("No beneficiary found with that ration card number.");
        return;
      }

      setFound({
        id: beneficiary._id,
        name: beneficiary.fullName,
        card: beneficiary.rationCardNumber,
        category: beneficiary.cardType,
        status: beneficiary.status,
        phone: beneficiary.phone,
        address: beneficiary.address,
        familyMembers: beneficiary.familyMembers,
      });
    } catch (err) {
      setError(err.message || "Unable to search for the beneficiary.");
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(item) {
  setSelectedItems((current) => {
    const exists = current.some(
      (selected) => selected.id === item.id
    );

    if (exists) {
      return current.filter(
        (selected) => selected.id !== item.id
      );
    }

    const quantity =
      Number(found?.familyMembers) * KG_PER_FAMILY_MEMBER;

    if (!found || quantity <= 0) {
      setError("Invalid beneficiary family size.");
      return current;
    }

    if (quantity > Number(item.quantity)) {
      setError(
        `Insufficient stock for ${item.name}. Required: ${quantity} kg; available: ${item.quantity} ${item.unit}.`
      );
      return current;
    }

    setError("");

    return [
      ...current,
      {
        id: item.id,
        name: item.name,
        quantity,
        unit: item.unit,
        pricePerUnit: Number(item.pricePerUnit),
      },
    ];
  });
}





  const totalAmount = selectedItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0) * item.pricePerUnit,
    0
  );

  async function submitDistribution(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setDistribution(null);

    if (!found || found.status !== "Active") {
      setError("Only active beneficiaries can receive a distribution.");
      return;
    }

    if (selectedItems.length === 0) {
      setError("Select at least one ration item.");
      return;
    }

    for (const selected of selectedItems) {
      const inventoryItem = items.find(
        (item) => item.id === selected.id
      );

      if (
        !inventoryItem ||
        Number(selected.quantity) <= 0 ||
        Number(selected.quantity) > inventoryItem.quantity
      ) {
        setError(
          `Enter a valid quantity for ${selected.name}. Available stock may have changed.`
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch(DISTRIBUTION_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          beneficiaryId: found.id,
          distributedBy: distributedBy.trim() || "System",
          items: selectedItems.map((item) => ({
            inventoryItem: item.id,
            quantity: Number(item.quantity),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Distribution could not be completed."
        );
      }

      setDistribution(data.distribution);
      setSuccess(data.message || "Ration distributed successfully.");
      setSelectedItems([]);

      // Reload actual stock after the backend deducts distributed quantities.
      await loadInventory();
    } catch (err) {
      setError(
        err.message ||
          "Unable to complete distribution. Please check the backend."
      );

      // Reload stock in case another operation changed it.
      loadInventory().catch(() => {});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-content">
      <PageHeader
        title="Ration distribution"
        description="Verify eligibility and record a beneficiary's ration."
      />

      <div className="workflow-banner">
        <div className="workflow-icon">
          <ShoppingBasket size={22} />
        </div>
        <div>
          <strong>Distribution workflow</strong>
          <p>
            Search card → Verify eligibility → Select items → Complete distribution
          </p>
        </div>
        <span className="workflow-step">LIVE DATABASE</span>
      </div>

      {error && (
        <div className="inline-message" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" role="status">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <section className="panel distribution-search">
        <div className="section-number">
          01 <span>BENEFICIARY VERIFICATION</span>
        </div>

        <h2>Find a beneficiary</h2>
        <p>
          Enter the registered ration card number to retrieve beneficiary
          details from MongoDB.
        </p>

        <form className="card-search-form" onSubmit={searchBeneficiary}>
          <div className="large-search">
            <CreditCard size={19} />
            <input
              required
              value={card}
              onChange={(e) => setCard(e.target.value)}
              placeholder="Enter ration card number"
            />
          </div>

          <button className="primary-button" disabled={loading}>
            <Search size={17} />
            {loading ? "Searching..." : "Search card"}
          </button>
        </form>

        {found && (
          <div className="beneficiary-result">
            <div className="result-avatar">
              {found.name
                .split(" ")
                .map((word) => word[0])
                .join("")}
            </div>

            <div className="result-details">
              <strong>{found.name}</strong>
              <span>
                {found.card} · {found.category} category
              </span>
              <span>Mobile: {found.phone}</span>
              <span>Family members: {found.familyMembers}</span>
              <StatusBadge>{found.status}</StatusBadge>
            </div>

            <div className="eligibility-result">
              <span>ELIGIBILITY STATUS</span>
              <strong
                className={
                  found.status === "Active" ? "eligible" : "not-eligible"
                }
              >
                {found.status === "Active" ? "Eligible" : "Not eligible"}
              </strong>
            </div>
          </div>
        )}
      </section>

      {found && found.status === "Active" && (
        <form onSubmit={submitDistribution}>
          <section className="panel distribution-inventory" style={{ marginTop: 20 }}>
            <div className="section-number">
                02<span>SELECT RATION ITEMS</span>
            </div>

            <div className="data-toolbar">
              <div>
                <h2>Available inventory</h2>
                <p>Select the items and quantities to distribute.</p>
              </div>

              <button
                type="button"
                className="outline-button"
                onClick={() =>
                  loadInventory().catch((err) => setError(err.message))
                }
              >
                Refresh stock
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>SELECT</th>
                    <th>ITEM</th>
                    <th>AVAILABLE STOCK</th>
                    <th>PRICE PER UNIT</th>
                    <th>DISTRIBUTION QUANTITY</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const selected = selectedItems.find(
                      (entry) => entry.id === item.id
                    );

                    return (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={Boolean(selected)}
                            onChange={() => toggleItem(item)}
                            aria-label={`Select ${item.name}`}
                            disabled={item.quantity <= 0}
                          />
                        </td>

                        <td>
                          <div className="product-cell">
                            <div className="product-icon">
                              <Wheat size={17} />
                            </div>
                            <strong>{item.name}</strong>
                          </div>
                        </td>

                        <td>
                          {item.quantity} {item.unit}
                        </td>

                        <td>₹{item.pricePerUnit.toFixed(2)}</td>

                        <td>
                          {selected ? (
                            <input
                              type="number"
                              min="0.001"
                              step="any"
                              max={item.quantity}
                              required
                              value={selected.quantity}
                              onChange={(e) =>
                                changeQuantity(item.id, e.target.value)
                              }
                              style={{ width: 110 }}
                              aria-label={`Quantity of ${item.name}`}
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        No inventory items found. Add items in the Inventory page.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel inline-form" style={{ marginTop: 20 }}>
            <div className="section-number">
              03 <span>CONFIRM DISTRIBUTION</span>
            </div>

            <h2>Distribution summary</h2>

            <div className="form-grid">
              <label>
                Distributed by
                <input
                  required
                  value={distributedBy}
                  onChange={(e) => setDistributedBy(e.target.value)}
                  placeholder="Employee name"
                />
              </label>

              <label>
                Total amount
                <input
                  readOnly
                  value={`₹${totalAmount.toFixed(2)}`}
                />
              </label>
            </div>

            <div className="form-actions">
              <span>
                Selected items: <strong>{selectedItems.length}</strong>
              </span>

              <button
                type="submit"
                className="primary-button"
                disabled={submitting || selectedItems.length === 0}
              >
                <CheckCircle2 size={16} />
                {submitting ? "Processing..." : "Complete distribution"}
              </button>
            </div>
          </section>
        </form>
      )}

      {found && found.status !== "Active" && (
        <div className="inline-message">
          This beneficiary is inactive and cannot receive a distribution.
        </div>
      )}

      {distribution && (
        <section className="panel inline-form" style={{ marginTop: 20 }}>
          <h2>
            <CheckCircle2
              size={20}
              style={{ verticalAlign: "middle", marginRight: 8 }}
            />
            Distribution completed successfully
          </h2>

          <p>
            <strong>Transaction ID:</strong> {distribution._id}
          </p>

          <p>
            <strong>Beneficiary:</strong> {found?.name}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(distribution.distributionDate).toLocaleString()}
          </p>

          <p>
            <strong>Total amount:</strong> ₹
            {Number(distribution.totalAmount).toFixed(2)}
          </p>

          <p>
            <strong>Status:</strong> {distribution.status}
          </p>

          <h3>Items distributed</h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>QUANTITY</th>
                  <th>PRICE PER UNIT</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>

              <tbody>
                {distribution.items.map((item) => (
                  <tr key={item._id || item.inventoryItem}>
                    <td>{item.itemName}</td>
                    <td>
                      {item.quantity} {item.unit}
                    </td>
                    <td>₹{Number(item.pricePerUnit).toFixed(2)}</td>
                    <td>
                      ₹
                      {(
                        Number(item.quantity) * Number(item.pricePerUnit)
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="panel distribution-guidance" style={{ marginTop: 20 }}>
        <h2>Before you distribute</h2>

        <div className="guidance-grid">
          <div>
            <CheckCircle2 size={18} />
            <strong>Verify identity</strong>
            <span>Match the ration card to the beneficiary record.</span>
          </div>

          <div>
            <ShieldCheck size={18} />
            <strong>Check eligibility</strong>
            <span>Only active beneficiaries can receive a distribution.</span>
          </div>

          <div>
            <Boxes size={18} />
            <strong>Confirm stock</strong>
            <span>The backend checks available stock before deducting quantities.</span>
          </div>
        </div>
      </section>

      <div className="demo-note">
        <ShieldCheck size={16} />
        <span>
          <strong>Live database:</strong> Distribution records and stock
          deductions are processed by the backend. Confirm the official
          entitlement rules before using this workflow operationally.
        </span>
      </div>
    </div>
  );
}

function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [transactionsList, setTransactionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = `${API_BASE_URL}/api/distributions`;

function downloadTransactionHistory() {
  if (transactionsList.length === 0) {
    alert("No transaction history available to download.");
    return;
  }

  const headers = [
    "Transaction ID",
    "Beneficiary Name",
    "Ration Card Number",
    "Items Issued",
    "Date & Time",
    "Total Amount (INR)",
    "Status",
  ];

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const rows = transactionsList.map((t) => [
    t.id,
    t.person,
    t.card,
    t.items,
    t.date,
    Number(t.totalAmount || 0).toFixed(2),
    t.status,
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `RationFlow_Transaction_History_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}


  async function fetchTransactions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load transactions.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the server.");
      }

      const formattedTransactions = data.map((t) => ({
        id: t._id,
        person: t.beneficiary?.fullName || "Unknown beneficiary",
        card: t.beneficiary?.rationCardNumber || "N/A",
        items: Array.isArray(t.items)
          ? t.items
              .map((item) => `${item.itemName} (${item.quantity} ${item.unit})`)
              .join(", ")
          : "No items",
        date: t.distributionDate
          ? new Date(t.distributionDate).toLocaleString("en-IN")
          : "N/A",
        status: t.status || "Completed",
        totalAmount: t.totalAmount ?? 0,
      }));

      setTransactionsList(formattedTransactions);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the backend. Check whether the server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactionsList.filter((t) =>
    `${t.id} ${t.person} ${t.card} ${t.items}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="page-content">
      <PageHeader
        title="Transactions"
        description="Review completed ration distributions and transaction records."
      />

      <section className="panel data-panel">
        <div className="data-toolbar">
          <div>
            <h2>
              Distribution history{" "}
              <span className="count-pill">{filtered.length}</span>
            </h2>
            <p>Recent activity across this ration shop</p>
          </div>

          <div className="toolbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transaction or beneficiary..."
              />
            </div>

            <button
              className="outline-button"
              onClick={fetchTransactions}
              disabled={loading}
            >
              <CalendarDays size={15} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="inline-message">
            {error}
            <button
              className="outline-button"
              onClick={fetchTransactions}
              style={{ marginLeft: "12px" }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>
            Loading transactions...
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>TRANSACTION ID</th>
                    <th>BENEFICIARY</th>
                    <th>ITEMS ISSUED</th>
                    <th>DATE &amp; TIME</th>
                    <th>TOTAL AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id}>
                      <td className="transaction-id">
                        {t.id}
                      </td>

                      <td>
                        <div className="table-person">
                          <div className="mini-avatar">
                            {t.person
                              .split(" ")
                              .map((s) => s[0])
                              .join("")
                              .slice(0, 2)}
                          </div>

                          <div>
                            <strong>{t.person}</strong>
                            <span>{t.card}</span>
                          </div>
                        </div>
                      </td>

                      <td>{t.items}</td>

                      <td className="date-cell">
                        {t.date}
                      </td>

                      <td>
                        ₹{Number(t.totalAmount).toFixed(2)}
                      </td>

                      <td>
                        <StatusBadge>{t.status}</StatusBadge>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && !error && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "30px" }}>
                        {query
                          ? "No transactions match your search."
                          : "No transactions found. Complete a distribution to see it here."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Showing <strong>{filtered.length}</strong> transactions
              </span>

              <button
  type="button"
  className="transaction-download-btn"
  onClick={downloadTransactionHistory}
  title="Download transaction history as CSV"
>
  <Download size={16} />
  Download History
</button>
            </div>
          </>
        )}
      </section>

      <div className="demo-note">
        <ShieldCheck size={16} />
        <span>
          <strong>Live database:</strong> Transaction history is loaded from
          your backend and reflects saved distribution records.
        </span>
      </div>
    </div>
  );
}


function ReportsPage() {
  const [distributions, setDistributions] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = `${API_BASE_URL}/api`;

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        setError("");

        const [distributionRes, inventoryRes] = await Promise.all([
          fetch(`${API}/distributions`),
          fetch(`${API}/inventory`),
        ]);

        if (!distributionRes.ok || !inventoryRes.ok) {
          throw new Error("Failed to load report data from the server.");
        }

        const [distributionData, inventoryData] = await Promise.all([
          distributionRes.json(),
          inventoryRes.json(),
        ]);

        setDistributions(
          Array.isArray(distributionData) ? distributionData : []
        );
        setInventoryItems(
          Array.isArray(inventoryData) ? inventoryData : []
        );
      } catch (err) {
        setError(err.message || "Unable to connect to the backend.");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const completedDistributions = distributions.filter(
    (d) => d.status === "Completed"
  );

  const now = new Date();

  const isThisMonth = (dateValue) => {
    const date = new Date(dateValue);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  };

  const monthlyDistributions = completedDistributions.filter((d) =>
    isThisMonth(d.distributionDate)
  );

  const monthlyTotalAmount = monthlyDistributions.reduce(
    (sum, d) => sum + Number(d.totalAmount || 0),
    0
  );

  const monthlyItems = monthlyDistributions.reduce(
    (sum, d) =>
      sum +
      (Array.isArray(d.items)
        ? d.items.reduce(
            (itemSum, item) => itemSum + Number(item.quantity || 0),
            0
          )
        : 0),
    0
  );

  const uniqueBeneficiaries = new Set(
    monthlyDistributions
      .map((d) => d.beneficiary?._id || d.beneficiary)
      .filter(Boolean)
      .map(String)
  ).size;

  const itemTotals = {};

  monthlyDistributions.forEach((distribution) => {
    if (Array.isArray(distribution.items)) {
      distribution.items.forEach((item) => {
        const name = item.itemName || "Unknown item";

        if (!itemTotals[name]) {
          itemTotals[name] = {
            name,
            issued: 0,
            unit: item.unit || "",
          };
        }

        itemTotals[name].issued += Number(item.quantity || 0);
      });
    }
  });

  const reportChartData = Object.values(itemTotals);

  const totalInventoryValue = inventoryItems.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) * Number(item.pricePerUnit || 0),
    0
  );

  const exportReport = () => {
    const rows = [
      ["Transaction ID", "Beneficiary", "Date", "Items", "Total Amount", "Status"],
      ...completedDistributions.map((d) => [
        d._id,
        d.beneficiary?.fullName || "Unknown beneficiary",
        d.distributionDate
          ? new Date(d.distributionDate).toLocaleString("en-IN")
          : "",
        Array.isArray(d.items)
          ? d.items
              .map((item) => `${item.itemName}: ${item.quantity} ${item.unit}`)
              .join("; ")
          : "",
        Number(d.totalAmount || 0).toFixed(2),
        d.status,
      ]),
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = rows.map((row) => row.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "rationflow-distribution-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-content">
      <PageHeader
        title="Reports & analytics"
        description="Review distribution patterns and inventory movement."
        action="Export report"
        onAction={exportReport}
      />

      {error && <div className="inline-message">{error}</div>}

      {loading && (
        <div className="inline-message">Loading report data...</div>
      )}

      <div className="stats-grid compact-stats">
        <StatCard
          title="Distributions this month"
          value={monthlyDistributions.length.toLocaleString("en-IN")}
          change="Live data"
          note="completed this month"
          icon={ShoppingBasket}
          tone="blue"
        />

        <StatCard
          title="Items distributed"
          value={monthlyItems.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}
          change="Live data"
          note="sum of item quantities"
          icon={Wheat}
          tone="green"
        />

        <StatCard
          title="Beneficiaries served"
          value={uniqueBeneficiaries.toLocaleString("en-IN")}
          change="Live data"
          note="unique beneficiaries this month"
          icon={UsersRound}
          tone="violet"
        />
      </div>

      <div className="stats-grid compact-stats">
        <StatCard
          title="Distribution value this month"
          value={`₹${monthlyTotalAmount.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}`}
          change="Completed records"
          note="total recorded value"
          icon={Boxes}
          tone="blue"
        />

        <StatCard
          title="Current inventory value"
          value={`₹${totalInventoryValue.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}`}
          change={`${inventoryItems.length} products`}
          note="current quantity × unit price"
          icon={Wheat}
          tone="green"
        />
      </div>

      <section className="panel report-panel">
        <div className="panel-header">
          <div>
            <h2>Items distributed</h2>
            <p>Recorded quantities issued during the current month</p>
          </div>

          <span className="count-pill">
            {now.toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="bar-chart">
          {reportChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="#edf0f6" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#929bb0", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#929bb0", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} ${props.payload.unit}`,
                    "Quantity issued",
                  ]}
                />
                <Bar
                  dataKey="issued"
                  fill="#5578f5"
                  radius={[6, 6, 0, 0]}
                  barSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#929bb0",
              }}
            >
              {loading
                ? "Loading chart..."
                : "No completed distributions recorded this month."}
            </div>
          )}
        </div>
      </section>

      <div className="demo-note">
        <ShieldCheck size={16} />
        <span>
          <strong>Live database:</strong> Reports use completed distribution
          records and current inventory data from your backend. Item quantities
          are summed as recorded; different units are not converted.
        </span>
      </div>
    </div>
  );
}

function SimplePage({ title, description, icon: Icon, details }) {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const isNotificationsPage = title.toLowerCase() === "notifications";

  async function fetchNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/inventory`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load inventory notifications."
        );
      }

      setInventoryItems(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isNotificationsPage) return;

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [isNotificationsPage]);

  const lowStockItems = inventoryItems.filter(
    (item) =>
      Number(item.quantity) <= Number(item.lowStockThreshold ?? 10)
  );

  if (!isNotificationsPage) {
    return (
      <div className="page-content">
        <PageHeader title={title} description={description} />

        <section className="panel placeholder-panel">
          <div className="placeholder-icon">
            <Icon size={25} />
          </div>

          <h2>{title} workspace</h2>
          <p>{details}</p>

          <span className="coming-soon">UI MODULE PLANNED</span>
        </section>

        <div className="demo-note">
          <ShieldCheck size={16} />
          <span>
            <strong>Frontend phase:</strong> This page is a planned module.
            It will be completed before backend integration.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <PageHeader
        title="Notifications"
        description="Monitor inventory alerts and identify products that need replenishment."
      />

      <section className="panel data-panel">
        <div className="data-toolbar">
          <div>
            <h2>
              Inventory alerts{" "}
              <span className="count-pill">{lowStockItems.length}</span>
            </h2>
            <p>Products at or below their minimum stock threshold</p>
          </div>

          <button
            className="outline-button"
            onClick={fetchNotifications}
            disabled={loading}
          >
            <Icon size={16} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="inline-message">
            {error}
            <button
              className="outline-button"
              onClick={fetchNotifications}
              style={{ marginLeft: 12 }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            Loading inventory alerts...
          </div>
        ) : (
          <div className="alert-list" style={{ padding: 20 }}>
            {lowStockItems.map((item) => (
              <div className="alert-item" key={item._id}>
                <div className="alert-symbol alert-red">
                  <AlertTriangle size={18} />
                </div>

                <div className="alert-copy">
                  <strong>Low stock: {item.itemName}</strong>

                  <span>
                    {item.quantity} {item.unit} remaining · Minimum{" "}
                    {item.lowStockThreshold ?? 10} {item.unit}
                  </span>

                  <small>Inventory alert · Live database</small>
                </div>

                <span className="low-label">Needs attention</span>
              </div>
            ))}

            {lowStockItems.length === 0 && !error && (
              <div
                style={{
                  padding: "35px 15px",
                  textAlign: "center",
                }}
              >
                <div className="placeholder-icon" style={{ margin: "0 auto 15px" }}>
                  <ShieldCheck size={25} />
                </div>

                <h2>No low-stock alerts</h2>

                <p style={{ color: "#929bb0" }}>
                  All inventory products are currently above their minimum
                  stock thresholds.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="table-footer">
          <span>
            Last updated:{" "}
            <strong>
              {lastUpdated ? lastUpdated.toLocaleTimeString("en-IN") : "—"}
            </strong>
          </span>

          <span>{inventoryItems.length} inventory products checked</span>
        </div>
      </section>

      <div className="demo-note">
        <ShieldCheck size={16} />
        <span>
          <strong>Live database:</strong> Inventory alerts are calculated from
          your MongoDB inventory records. This page refreshes automatically
          every 30 seconds while open.
        </span>
      </div>
    </div>
  );
}

function RationCardsPage() {
  const [cards, setCards] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchCards() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
  `${API_BASE_URL}/api/beneficiaries`
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load ration cards.");
      }

      setCards(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCards();
  }, []);

  const filteredCards = cards.filter((card) => {
    const searchMatch = [
      card.rationCardNumber,
      card.fullName,
      card.phone,
      card.address,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());

    const categoryMatch =
      category === "All" || card.cardType === category;

    return searchMatch && categoryMatch;
  });

  const activeCount = cards.filter(
    (card) => card.status === "Active"
  ).length;

  const inactiveCount = cards.length - activeCount;

  return (
    <div className="page-content">
      <PageHeader
        title="Ration cards"
        description="Manage card categories, status, and beneficiary links."
      />

      <div className="stats-grid compact-stats">
        <StatCard
          title="Total ration cards"
          value={cards.length.toLocaleString("en-IN")}
          change="Live data"
          note="registered beneficiaries"
          icon={CreditCard}
          tone="blue"
        />

        <StatCard
          title="Active cards"
          value={activeCount.toLocaleString("en-IN")}
          change="Live data"
          note="currently active"
          icon={UsersRound}
          tone="green"
        />

        <StatCard
          title="Inactive cards"
          value={inactiveCount.toLocaleString("en-IN")}
          change="Live data"
          note="not currently active"
          icon={AlertTriangle}
          tone="amber"
        />
      </div>

      <section className="panel data-panel">
        <div className="data-toolbar">
          <div>
            <h2>
              Registered ration cards{" "}
              <span className="count-pill">
                {filteredCards.length}
              </span>
            </h2>
            <p>Card information retrieved from registered beneficiaries</p>
          </div>

          <div className="toolbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search card or beneficiary..."
              />
            </div>

            <select
              className="select-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All categories</option>
              <option value="PHH">PHH</option>
              <option value="AAY">AAY</option>
              <option value="NPHH">NPHH</option>
            </select>

            <button
              className="outline-button"
              onClick={fetchCards}
              disabled={loading}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="inline-message">
            {error}
            <button
              className="outline-button"
              onClick={fetchCards}
              style={{ marginLeft: 12 }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 30, textAlign: "center" }}>
            Loading ration cards...
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>RATION CARD NUMBER</th>
                  <th>BENEFICIARY</th>
                  <th>CARD CATEGORY</th>
                  <th>FAMILY MEMBERS</th>
                  <th>PHONE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredCards.map((card) => (
                  <tr key={card._id}>
                    <td className="transaction-id">
                      {card.rationCardNumber}
                    </td>

                    <td>
                      <div className="table-person">
                        <div className="mini-avatar">
                          {card.fullName
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <div>
                          <strong>{card.fullName}</strong>
                          <span>{card.address}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="count-pill">
                        {card.cardType}
                      </span>
                    </td>

                    <td>{card.familyMembers}</td>

                    <td>{card.phone}</td>

                    <td>
                      <StatusBadge>
                        {card.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}

                {filteredCards.length === 0 && !error && (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        padding: 30,
                        textAlign: "center",
                      }}
                    >
                      {query || category !== "All"
                        ? "No ration cards match your filters."
                        : "No ration cards registered yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer">
          <span>
            Showing <strong>{filteredCards.length}</strong> ration cards
          </span>

          <span>Data synchronized with beneficiaries</span>
        </div>
      </section>

      <div className="demo-note">
        <ShieldCheck size={16} />
        <span>
          <strong>Live database:</strong> Ration card information is retrieved
          from MongoDB through the Beneficiaries API. Add or edit beneficiary
          records in the Beneficiaries section to update their card information.
        </span>
      </div>
    </div>
  );
}


function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    employeeId: '',
    fullName: '',
    phone: '',
    email: '',
    role: 'Staff'
  };

  const [form, setForm] = useState(emptyForm);

  // Fetch employees from MongoDB through the backend
  async function loadEmployees() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/api/employees`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load employees'
        );
      }

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || 'Could not connect to the backend'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  // Search employees
  const filteredEmployees = employees.filter((employee) =>
    [
      employee.employeeId,
      employee.fullName,
      employee.phone,
      employee.email,
      employee.role,
      employee.status
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Employee statistics
  const activeCount = employees.filter(
    (employee) => employee.status === 'Active'
  ).length;

  const inactiveCount = employees.filter(
    (employee) => employee.status === 'Inactive'
  ).length;

  // Open the Add Employee form
  function openAddForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError('');
    setShowForm(true);
  }

  // Open the Edit Employee form
  function openEditForm(employee) {
    setEditingId(employee._id);

    setForm({
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      phone: employee.phone,
      email: employee.email || '',
      role: employee.role
    });

    setError('');
    setShowForm(true);
  }

  // Add or update an employee
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError('');

      const url = editingId
        ? `${API_BASE_URL}/api/employees/${editingId}`
        : `${API_BASE_URL}/api/employees`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to save employee'
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      await loadEmployees();
    } catch (err) {
      setError(
        err.message || 'Could not save employee'
      );
    }
  }

  // Activate or deactivate an employee
  async function toggleStatus(employee) {
    const newStatus =
      employee.status === 'Active'
        ? 'Inactive'
        : 'Active';

    const action =
      newStatus === 'Inactive'
        ? 'deactivate'
        : 'activate';

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${employee.fullName}?`
      )
    ) {
      return;
    }

    try {
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/api/employees/${employee._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update employee status'
        );
      }

      await loadEmployees();
    } catch (err) {
      setError(
        err.message || 'Could not update employee status'
      );
    }
  }

  return (
    <div className="employees-page">

      {/* Page heading */}
      <div className="employees-header">
        <div>
          <h1>Employees</h1>
          <p>
            Manage ration shop staff and their roles.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="employees-primary-btn"
        >
          + Add Employee
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="employees-error">
          {error}
        </div>
      )}

      {/* Employee statistics */}
      <div className="employees-stats">

        <div className="employees-stat-card">
          <p className="employees-stat-label">
            Total Employees
          </p>

          <p className="employees-stat-value">
            {employees.length}
          </p>
        </div>

        <div className="employees-stat-card">
          <p className="employees-stat-label">
            Active Employees
          </p>

          <p className="employees-stat-value active">
            {activeCount}
          </p>
        </div>

        <div className="employees-stat-card">
          <p className="employees-stat-label">
            Inactive Employees
          </p>

          <p className="employees-stat-value inactive">
            {inactiveCount}
          </p>
        </div>

      </div>

      {/* Add/Edit Employee form */}
      {showForm && (
        <div className="employees-panel">

          <div className="employees-panel-header">
            <h2>
              {editingId
                ? 'Edit Employee'
                : 'Add New Employee'}
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="employees-form"
          >

            <label>
              Employee ID *
              <input
                type="text"
                required
                maxLength={40}
                value={form.employeeId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    employeeId: event.target.value
                  })
                }
                placeholder="EMP001"
              />
            </label>

            <label>
              Full Name *
              <input
                type="text"
                required
                maxLength={100}
                value={form.fullName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    fullName: event.target.value
                  })
                }
                placeholder="Enter employee name"
              />
            </label>

            <label>
              Phone Number *
              <input
                type="tel"
                required
                maxLength={20}
                value={form.phone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    phone: event.target.value
                  })
                }
                placeholder="Enter phone number"
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                maxLength={254}
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email: event.target.value
                  })
                }
                placeholder="employee@example.com"
              />
            </label>

            <label>
              Employee Role *
              <select
                required
                value={form.role}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role: event.target.value
                  })
                }
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
            </label>

            <div className="employees-form-actions">

              <button
                type="submit"
                className="employees-primary-btn"
              >
                {editingId
                  ? 'Save Changes'
                  : 'Add Employee'}
              </button>

              <button
                type="button"
                className="employees-secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  setError('');
                }}
              >
                Cancel
              </button>

            </div>
          </form>
        </div>
      )}

      {/* Employee directory */}
      <div className="employees-panel">

        <div className="employees-panel-header">
          <h2>Employee Directory</h2>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search employees..."
            className="employees-search"
          />
        </div>

        {loading ? (
          <div className="employees-empty">
            Loading employees...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="employees-empty">
            <strong>
              {search
                ? 'No matching employees found'
                : 'No employees registered yet'}
            </strong>

            <span>
              {search
                ? 'Try a different search term.'
                : 'Click Add Employee to register your first employee.'}
            </span>
          </div>
        ) : (
          <div className="employees-table-wrapper">

            <table className="employees-table">

              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id}>

                    <td>
                      <div className="employees-name">
                        {employee.fullName}
                      </div>

                      <div className="employees-muted">
                        {employee.employeeId}
                      </div>
                    </td>

                    <td>
                      <div>{employee.phone}</div>

                      <div className="employees-muted">
                        {employee.email || 'No email provided'}
                      </div>
                    </td>

                    <td>
                      <span className="employees-badge employees-role">
                        {employee.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`employees-badge ${
                          employee.status === 'Active'
                            ? 'employees-status-active'
                            : 'employees-status-inactive'
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="employees-action-btn"
                        onClick={() =>
                          openEditForm(employee)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className={`employees-action-btn ${
                          employee.status === 'Active'
                            ? 'deactivate'
                            : 'activate'
                        }`}
                        onClick={() =>
                          toggleStatus(employee)
                        }
                      >
                        {employee.status === 'Active'
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPage() {
  const API_URL = `${API_BASE_URL}/api/settings`;

  const defaultSettings = {
    shopName: 'Coimbatore Shop',
    shopId: 'TN-CBE-042',
    address: '',
    phone: '',
    adminName: 'Devananth P K',
    adminEmail: '',
    currency: 'INR',
    dateFormat: 'DD MMMM YYYY',
    lowStockNotifications: true,
    distributionNotifications: true,
    emailNotifications: false
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');

  // Load settings from MongoDB
  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load settings.'
          );
        }

        if (!cancelled) {
          setSettings({
            ...defaultSettings,
            ...data
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              'Unable to connect to the settings server.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update form fields
  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }));

    setSavedMessage('');
    setError('');
  }

  // Save settings to MongoDB
  async function handleSave(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setSavedMessage('');
      setError('');

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to save settings.'
        );
      }

      setSettings((previous) => ({
        ...previous,
        ...data.settings
      }));

      setSavedMessage(
        data.message || 'Settings saved successfully.'
      );
    } catch (err) {
      setError(
        err.message || 'Unable to save settings to MongoDB.'
      );
    } finally {
      setSaving(false);
    }
  }

  // Reset settings through the backend
  async function handleReset() {
    const confirmed = window.confirm(
      'Are you sure you want to reset all settings to their default values?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setResetting(true);
      setSavedMessage('');
      setError('');

      const response = await fetch(`${API_URL}/reset`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to reset settings.'
        );
      }

      setSettings({
        ...defaultSettings,
        ...data.settings
      });

      setSavedMessage(
        data.message || 'Settings restored to defaults.'
      );
    } catch (err) {
      setError(
        err.message || 'Unable to reset settings.'
      );
    } finally {
      setResetting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-card">
          <h2>Loading Settings...</h2>
          <p>Retrieving your saved settings from the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">

      {/* Page heading */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your shop profile, administrator details,
            and application preferences.
          </p>
        </div>

        <div className="settings-header-icon">
          <Settings size={24} />
        </div>
      </div>

      {/* Success message */}
      {savedMessage && (
        <div className="settings-success" role="status">
          <span>✓</span>
          {savedMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="settings-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>

        {/* Shop Profile */}
        <section className="settings-card">

          <div className="settings-card-heading">
            <div className="settings-icon blue">
              <Settings size={20} />
            </div>

            <div>
              <h2>Shop Profile</h2>
              <p>
                Basic information about your ration shop.
              </p>
            </div>
          </div>

          <div className="settings-grid">

            <label className="settings-field">
              <span>Shop Name *</span>

              <input
                name="shopName"
                value={settings.shopName}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Enter shop name"
              />
            </label>

            <label className="settings-field">
              <span>Shop ID</span>

              <input
                name="shopId"
                value={settings.shopId}
                readOnly
                title="Shop ID is read-only"
              />

              <small>
                The shop ID cannot be changed here.
              </small>
            </label>

            <label className="settings-field settings-full-width">
              <span>Shop Address</span>

              <textarea
                name="address"
                value={settings.address}
                onChange={handleChange}
                maxLength={300}
                rows={3}
                placeholder="Enter the shop address"
              />
            </label>

            <label className="settings-field">
              <span>Shop Contact Number</span>

              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                maxLength={20}
                placeholder="Enter contact number"
              />
            </label>

          </div>
        </section>

        {/* Administrator Profile */}
        <section className="settings-card">

          <div className="settings-card-heading">
            <div className="settings-icon purple">
              <UserCog size={20} />
            </div>

            <div>
              <h2>Administrator Profile</h2>
              <p>
                Administrator contact information.
              </p>
            </div>
          </div>

          <div className="settings-grid">

            <label className="settings-field">
              <span>Administrator Name *</span>

              <input
                name="adminName"
                value={settings.adminName}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </label>

            <label className="settings-field">
              <span>Administrator Email</span>

              <input
                type="email"
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleChange}
                maxLength={254}
                placeholder="Enter email address"
              />
            </label>

            <div className="settings-field">
              <span>Account Role</span>

              <div className="settings-readonly-value">
                <span className="settings-role-badge">
                  Administrator
                </span>
              </div>

              <small>
                Display label only; it does not enforce permissions.
              </small>
            </div>

          </div>
        </section>

        {/* Application Preferences */}
        <section className="settings-card">

          <div className="settings-card-heading">
            <div className="settings-icon green">
              <SlidersHorizontal size={20} />
            </div>

            <div>
              <h2>Application Preferences</h2>
              <p>
                Choose your preferred currency and date format.
              </p>
            </div>
          </div>

          <div className="settings-grid">

            <label className="settings-field">
              <span>Currency</span>

              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
              >
                <option value="INR">
                  Indian Rupee (₹ INR)
                </option>

                <option value="USD">
                  US Dollar ($ USD)
                </option>

                <option value="EUR">
                  Euro (€ EUR)
                </option>
              </select>
            </label>

            <label className="settings-field">
              <span>Date Format</span>

              <select
                name="dateFormat"
                value={settings.dateFormat}
                onChange={handleChange}
              >
                <option value="DD MMMM YYYY">
                  29 October 2026
                </option>

                <option value="DD/MM/YYYY">
                  29/10/2026
                </option>

                <option value="YYYY-MM-DD">
                  2026-10-29
                </option>
              </select>
            </label>

          </div>

          <div className="settings-note">
            Preferences are stored in MongoDB. Applying currency
            and date formatting across other pages requires
            additional integration.
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="settings-card">

          <div className="settings-card-heading">
            <div className="settings-icon orange">
              <Bell size={20} />
            </div>

            <div>
              <h2>Notification Preferences</h2>
              <p>
                Choose which notification preferences to store.
              </p>
            </div>
          </div>

          <div className="settings-options">

            <label className="settings-option">
              <div>
                <strong>Low-stock notifications</strong>
                <p>
                  Preference for alerts when inventory reaches
                  its configured threshold.
                </p>
              </div>

              <input
                type="checkbox"
                name="lowStockNotifications"
                checked={settings.lowStockNotifications}
                onChange={handleChange}
              />
            </label>

            <label className="settings-option">
              <div>
                <strong>Distribution notifications</strong>
                <p>
                  Preference for notifications about distribution
                  activity.
                </p>
              </div>

              <input
                type="checkbox"
                name="distributionNotifications"
                checked={settings.distributionNotifications}
                onChange={handleChange}
              />
            </label>

            <label className="settings-option">
              <div>
                <strong>Email notifications</strong>
                <p>
                  Email delivery requires a separate email service.
                </p>
              </div>

              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
            </label>

          </div>
        </section>

        {/* Actions */}
        <div className="settings-actions">

          <button
            type="button"
            className="settings-reset-btn"
            onClick={handleReset}
            disabled={saving || resetting}
          >
            {resetting ? 'Resetting...' : 'Reset to Defaults'}
          </button>

          <button
            type="submit"
            className="settings-save-btn"
            disabled={saving || resetting}
          >
            <Save size={17} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

        </div>

      </form>

      {/* Storage information */}
      <div className="settings-footer-note">
        <ShieldCheck size={17} />
        Settings are retrieved from and saved to MongoDB.
      </div>

    </div>
  );
}


function AdminRouteGuard({ children }) {
  const token = sessionStorage.getItem("rationflowToken");

  let user = null;

  try {
    user = JSON.parse(
      sessionStorage.getItem("rationflowUser") || "null"
    );
  } catch {
    user = null;
  }

  const allowedRoles = ["Admin", "Manager", "Staff"];

  if (!token || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}




function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    async function fetchLowStockCount() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/inventory`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch inventory");
        }

        const data = await response.json();

        const inventoryItems = Array.isArray(data) ? data : [];

        const lowStockItems = inventoryItems.filter(
          (item) =>
            Number(item.quantity) <=
            Number(item.lowStockThreshold ?? 10)
        );

        setLowStockCount(lowStockItems.length);
      } catch (error) {
        console.error("Failed to update notification count:", error);
      }
    }

    fetchLowStockCount();

    const interval = setInterval(fetchLowStockCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
  <Routes>
    {/* Login selection page */}
    <Route path="/login" element={<Login />} />

    {/* Beneficiary login */}
    <Route
      path="/beneficiary-login"
      element={<BeneficiaryLogin />}
    />
    <Route
  path="/beneficiary-dashboard"
  element={<BeneficiaryDashboard />}
/>

    {/* Employee login */}
    <Route
      path="/employee-login"
      element={<EmployeeLogin />}
    />

    {/* Admin login - implementation comes next */}
    {/* Admin login */}
<Route
  path="/admin-login"
  element={<AdminLogin />}
/>
    {/* Existing Admin dashboard */}
    <Route
      path="/*"
      element={
        <AdminRouteGuard>
        <div className="app-shell">
        
          <Sidebar
            mobileOpen={mobileOpen}
            closeMobile={() => setMobileOpen(false)}
            lowStockCount={lowStockCount}
          />

          <div className="app-main">
            <Topbar onMenu={() => setMobileOpen(true)} />

            <main>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/beneficiaries" element={<Beneficiaries />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/distribution" element={<DistributionPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/ration-cards" element={<RationCardsPage />} />
                <Route path="/employees" element={<Employees />} />
                

                <Route
                  path="/notifications"
                  element={
                    <SimplePage
                      title="Notifications"
                      description="Review low-stock alerts and operational reminders."
                      icon={Bell}
                      details="Monitor minimum-stock alerts and reminders generated from verified application data."
                    />
                  }
                />

                <Route path="/settings" element={<SettingsPage />} />

                <Route
                  path="*"
                  element={
                    <SimplePage
                      title="Page not found"
                      description="The requested page does not exist."
                      icon={CircleHelp}
                      details="Use the sidebar to navigate to an available page."
                    />
                  }
                />
              </Routes>
            </main>

            <footer className="app-footer">
              <span>
                © 2026 RationFlow · Digital Ration Shop Management
              </span>
              <span>
                <span className="online-dot" /> Secure workspace
                <span className="footer-separator">·</span> Built for Team 23
              </span>
            </footer>
          </div>
        </div>
        </AdminRouteGuard>
      }
    />
  </Routes>
);
}

export default App;