import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000/api";

// ─── AUTH CONTEXT ──────────────────────────────────────────────────────────
const AuthContext = createContext(null);

function useAuth() { return useContext(AuthContext); }

// ─── API LAYER ─────────────────────────────────────────────────────────────
function useApi() {
  const { token, logout } = useAuth();

  const request = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
        ...options.headers,
      },
    });
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(JSON.stringify(err));
    }
    if (res.status === 204) return null;
    return res.json();
  }, [token, logout]);

  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
    del: (path) => request(path, { method: "DELETE" }),
  };
}

// ─── HOOK: useFetch ─────────────────────────────────────────────────────────
function useFetch(path, deps = []) {
  const api = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const d = await api.get(path);
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

// ─── COLORS ────────────────────────────────────────────────────────────────
const C = {
  bg: "#0A0E1A", sidebar: "#0D1220", card: "#111827",
  border: "#1E2A40", accent: "#3B82F6", accentGlow: "#3B82F620",
  green: "#10B981", red: "#EF4444", amber: "#F59E0B", purple: "#8B5CF6",
  text: "#F1F5F9", muted: "#64748B", subtle: "#1E293B",
};

// ─── GLOBAL CSS ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;overflow:hidden}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#1E2A40;border-radius:4px}
  .layout{display:flex;height:100vh}
  .sidebar{width:220px;min-width:220px;background:${C.sidebar};border-right:1px solid ${C.border};display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}
  .logo{padding:20px 20px 16px;border-bottom:1px solid ${C.border}}
  .logo-mark{font-family:'Space Mono',monospace;font-size:13px;font-weight:700;color:${C.accent};letter-spacing:2px}
  .logo-sub{font-size:10px;color:${C.muted};margin-top:2px;letter-spacing:1px;text-transform:uppercase}
  .company-badge{margin:12px 14px;padding:8px 12px;background:${C.accentGlow};border:1px solid ${C.accent}33;border-radius:8px;display:flex;align-items:center;gap:8px;cursor:pointer}
  .company-dot{width:8px;height:8px;border-radius:50%;background:${C.green};box-shadow:0 0 6px ${C.green};flex-shrink:0}
  .company-name{font-size:11px;font-weight:600;color:${C.accent};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .nav{padding:8px 0;flex:1}
  .nav-item{display:flex;align-items:center;gap:10px;padding:8px 18px;cursor:pointer;font-size:12.5px;font-weight:500;color:${C.muted};transition:all .15s;border-left:2px solid transparent;user-select:none}
  .nav-item:hover{color:${C.text};background:${C.subtle}}
  .nav-item.active{color:${C.accent};border-left-color:${C.accent};background:${C.accentGlow}}
  .nav-icon{font-size:14px;width:16px;text-align:center;flex-shrink:0}
  .nav-chevron{margin-left:auto;font-size:9px;transition:transform .2s}
  .nav-chevron.open{transform:rotate(90deg)}
  .nav-child{display:flex;align-items:center;gap:10px;padding:6px 18px 6px 44px;cursor:pointer;font-size:11.5px;color:${C.muted};transition:all .15s;border-left:2px solid transparent}
  .nav-child::before{content:'—';font-size:9px;color:#2A3A55;margin-right:4px;flex-shrink:0}
  .nav-child:hover{color:${C.text};background:${C.subtle}}
  .nav-child.active{color:${C.accent};border-left-color:${C.accent};background:${C.accentGlow}}
  .main{flex:1;overflow-y:auto;display:flex;flex-direction:column}
  .topbar{background:${C.sidebar};border-bottom:1px solid ${C.border};padding:12px 28px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:sticky;top:0;z-index:10}
  .breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:${C.muted}}
  .breadcrumb-active{color:${C.text};font-weight:600}
  .content{padding:24px 28px;flex:1}
  .page-title{font-size:22px;font-weight:600;color:${C.text};margin-bottom:4px;letter-spacing:-0.3px}
  .page-subtitle{font-size:12px;color:${C.muted};margin-bottom:24px}
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
  .stat-card{background:${C.card};border:1px solid ${C.border};border-radius:12px;padding:18px;position:relative;overflow:hidden}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
  .stat-card.blue::before{background:linear-gradient(90deg,${C.accent},transparent)}
  .stat-card.green::before{background:linear-gradient(90deg,${C.green},transparent)}
  .stat-card.amber::before{background:linear-gradient(90deg,${C.amber},transparent)}
  .stat-card.purple::before{background:linear-gradient(90deg,${C.purple},transparent)}
  .stat-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:${C.muted};margin-bottom:10px}
  .stat-value{font-family:'Space Mono',monospace;font-size:22px;font-weight:700;color:${C.text};margin-bottom:6px}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
  .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px}
  .card{background:${C.card};border:1px solid ${C.border};border-radius:12px;overflow:hidden}
  .card-header{padding:14px 18px;border-bottom:1px solid ${C.border};display:flex;align-items:center;justify-content:space-between}
  .card-title{font-size:13px;font-weight:600;color:${C.text}}
  .card-action{font-size:11px;color:${C.accent};cursor:pointer}
  .card-body{padding:18px}
  .table-wrap{overflow-x:auto}
  table{width:100%;border-collapse:collapse;font-size:12px}
  thead th{padding:10px 14px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:${C.muted};border-bottom:1px solid ${C.border};background:${C.subtle}}
  tbody tr{border-bottom:1px solid #0F172A;transition:background .1s;cursor:pointer}
  tbody tr:hover{background:${C.subtle}}
  tbody td{padding:11px 14px;color:${C.text};font-size:12px}
  .badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:.5px}
  .badge-green{background:${C.green}22;color:${C.green}}
  .badge-blue{background:${C.accent}22;color:${C.accent}}
  .badge-amber{background:${C.amber}22;color:${C.amber}}
  .badge-red{background:${C.red}22;color:${C.red}}
  .badge-purple{background:${C.purple}22;color:${C.purple}}
  .badge-muted{background:#1E293B;color:${C.muted}}
  .amount{font-family:'Space Mono',monospace;font-size:11.5px}
  .amount-green{color:${C.green}}
  .amount-red{color:${C.red}}
  .form-grid{display:grid;gap:14px}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
  .form-group{display:flex;flex-direction:column;gap:5px}
  label{font-size:10.5px;font-weight:600;color:${C.muted};letter-spacing:.5px;text-transform:uppercase}
  input,select,textarea{background:${C.subtle};border:1px solid ${C.border};border-radius:7px;padding:8px 12px;color:${C.text};font-family:'DM Sans',sans-serif;font-size:12.5px;outline:none;transition:border .15s;width:100%}
  input:focus,select:focus,textarea:focus{border-color:${C.accent}}
  input::placeholder,textarea::placeholder{color:${C.muted}}
  select option{background:${C.card}}
  .btn{padding:7px 16px;border-radius:7px;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .15s;border:none;display:inline-flex;align-items:center;gap:6px}
  .btn-primary{background:${C.accent};color:white}
  .btn-primary:hover{background:#2563EB;transform:translateY(-1px)}
  .btn-primary:disabled{background:${C.muted};cursor:not-allowed;transform:none}
  .btn-ghost{background:${C.subtle};color:${C.muted};border:1px solid ${C.border}}
  .btn-ghost:hover{color:${C.text};border-color:#2A3A55}
  .btn-danger{background:${C.red}22;color:${C.red};border:1px solid ${C.red}44}
  .btn-danger:hover{background:${C.red}33}
  .tabs{display:flex;gap:2px;background:${C.subtle};padding:3px;border-radius:9px;margin-bottom:18px}
  .tab{padding:6px 16px;border-radius:7px;font-size:12px;font-weight:500;cursor:pointer;color:${C.muted};transition:all .15s}
  .tab.active{background:${C.card};color:${C.text};box-shadow:0 1px 3px #0006}
  .tag{display:inline-flex;padding:2px 7px;background:${C.subtle};border-radius:4px;font-family:'Space Mono',monospace;font-size:9px;color:${C.muted}}
  .divider{height:1px;background:${C.border};margin:16px 0}
  .empty-state{text-align:center;padding:40px 20px;color:${C.muted};font-size:13px}
  .avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
  .progress-bar{height:4px;background:${C.subtle};border-radius:2px;overflow:hidden;margin-top:8px}
  .progress-fill{height:100%;border-radius:2px;transition:width .3s}
  .activity-item{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid ${C.subtle}}
  .activity-item:last-child{border-bottom:none}
  .activity-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0}
  .activity-text{font-size:12px;color:${C.text};line-height:1.5}
  .activity-time{font-size:10px;color:${C.muted};margin-top:2px}
  .search-bar{display:flex;align-items:center;gap:8px;background:${C.subtle};border:1px solid ${C.border};border-radius:8px;padding:7px 12px;font-size:12px;color:${C.muted};cursor:text;max-width:260px}
  .search-bar input{background:transparent;border:none;outline:none;padding:0;font-size:12px;color:${C.text};flex:1}
  .notification-dot{width:6px;height:6px;background:${C.red};border-radius:50%;box-shadow:0 0 6px ${C.red}}
  .modal-overlay{position:fixed;inset:0;background:#00000088;z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
  .modal{background:${C.card};border:1px solid ${C.border};border-radius:14px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto}
  .modal-header{padding:18px 20px;border-bottom:1px solid ${C.border};display:flex;align-items:center;justify-content:space-between}
  .modal-body{padding:20px}
  .modal-footer{padding:14px 20px;border-top:1px solid ${C.border};display:flex;justify-content:flex-end;gap:8px}
  .toast{position:fixed;bottom:24px;right:24px;padding:12px 18px;border-radius:10px;font-size:12px;font-weight:600;z-index:200;animation:slideUp .3s ease}
  .toast-success{background:${C.green}22;border:1px solid ${C.green}44;color:${C.green}}
  .toast-error{background:${C.red}22;border:1px solid ${C.red}44;color:${C.red}}
  .loading{display:flex;align-items:center;justify-content:center;padding:40px;color:${C.muted};font-size:13px;gap:10px}
  .spinner{width:16px;height:16px;border:2px solid ${C.border};border-top-color:${C.accent};border-radius:50%;animation:spin .6s linear infinite}
  .mini-chart{display:flex;align-items:flex-end;gap:3px;height:40px}
  .bar{flex:1;border-radius:2px 2px 0 0;transition:opacity .2s;cursor:pointer}
  .bar:hover{opacity:.7}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .animate-in{animation:fadeIn .25s ease forwards}
  .login-page{display:flex;align-items:center;justify-content:center;height:100vh;background:${C.bg}}
  .login-card{background:${C.card};border:1px solid ${C.border};border-radius:16px;padding:40px;width:360px}
  .login-logo{font-family:'Space Mono',monospace;font-size:20px;font-weight:700;color:${C.accent};letter-spacing:3px;margin-bottom:8px;text-align:center}
  .login-sub{font-size:11px;color:${C.muted};text-align:center;margin-bottom:28px;letter-spacing:1px;text-transform:uppercase}
  .error-msg{background:${C.red}22;border:1px solid ${C.red}44;color:${C.red};padding:10px 14px;border-radius:8px;font-size:12px;margin-bottom:14px}
  .tree-item{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:7px;cursor:pointer;font-size:12.5px;transition:background .1s}
  .tree-item:hover{background:${C.subtle}}
  .tree-item.selected{background:${C.accentGlow};color:${C.accent}}
`;

// ─── HELPERS ────────────────────────────────────────────────────────────────
const fmtAmount = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_COLOR = {
  Pending: "amber", Approved: "blue", Confirmed: "purple", Dispatched: "blue",
  Paid: "green", Overdue: "red", Converted: "green", Received: "green",
  Partial: "amber", Draft: "muted", Sent: "blue", Cancelled: "red",
  Active: "green",
};

// ─── MICRO COMPONENTS ──────────────────────────────────────────────────────
function Spinner() { return <div className="loading"><div className="spinner" /><span>Loading…</span></div>; }

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

function Badge({ status }) {
  const color = STATUS_COLOR[status] || "muted";
  return <span className={`badge badge-${color}`}>{status}</span>;
}

function MiniBarChart({ data = [], color }) {
  const max = Math.max(...data, 1);
  return (
    <div className="mini-chart">
      {data.map((v, i) => (
        <div key={i} className="bar"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: i === data.length - 1 ? 1 : 0.4 }} />
      ))}
    </div>
  );
}

function Modal({ title, onClose, onSave, saving, children, wide }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={wide ? { maxWidth: 780 } : {}}>
        <div className="modal-header">
          <span className="card-title">{title}</span>
          <button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {onSave && (
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={onSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-bar" style={{ flex: 1, maxWidth: 280 }}>
      <span>🔍</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Search…"} />
    </div>
  );
}

function EmptyState({ icon = "◈", msg = "No records found" }) {
  return <div className="empty-state"><div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div><div>{msg}</div></div>;
}

// ─── LOGIN PAGE ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setError("Invalid credentials. Try admin / admin123"); return; }
      const { token } = await res.json();
      onLogin(token, username);
    } catch {
      setError("Cannot connect to server. Make sure the Django backend is running on http://localhost:8000");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">FINLEDGER</div>
        <div className="login-sub">Accounting Suite v2</div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-grid">
          <div className="form-group">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          </div>
          <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: C.muted, textAlign: "center" }}>
          Default: admin / admin123 · Run <code style={{ color: C.accent }}>python manage.py seed_data</code>
        </div>
      </div>
    </div>
  );
}

// ─── NAV CONFIG ─────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  {
    id: "accounts", label: "Accounts", icon: "◈", children: [
      { id: "groups", label: "Groups & Subgroups" },
      { id: "ledgers", label: "Ledgers" },
      { id: "entries", label: "Journal Entries" },
    ]
  },
  {
    id: "sales", label: "Sales", icon: "◆", children: [
      { id: "quotation", label: "Quotations" },
      { id: "proforma", label: "Proforma Invoice" },
      { id: "order", label: "Sales Orders" },
      { id: "challan", label: "Delivery Challan" },
      { id: "invoice", label: "Invoices" },
    ]
  },
  {
    id: "purchase", label: "Purchase", icon: "◇", children: [
      { id: "purchaseOrders", label: "Purchase Orders" },
      { id: "purchaseInvoices", label: "Purchase Invoice" },
      { id: "purchaseReturns", label: "Purchase Return" },
    ]
  },
  {
    id: "inventory", label: "Inventory", icon: "▣", children: [
      { id: "products", label: "Products" },
      { id: "categories", label: "Categories" },
      { id: "stock", label: "Stock Movements" },
    ]
  },
  { id: "company", label: "Company", icon: "◉" },
  { id: "reports", label: "Reports", icon: "▤" },
];

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
function Dashboard() {
  const { data, loading } = useFetch("/dashboard/overview/");
  const { data: lowStock } = useFetch("/dashboard/low-stock/");

  if (loading) return <Spinner />;

  const stats = data?.stats || {};
  const recentInvoices = data?.recent_invoices || [];
  const pipeline = data?.sales_pipeline || {};
  const ledgers = data?.top_ledgers || [];

  const sparkData = [30, 42, 35, 60, 55, 78, 90, 82, 95, 100, 88, 124];

  return (
    <div className="animate-in">
      <div className="page-title">Overview</div>
      <div className="page-subtitle">Financial summary · Live from API</div>

      <div className="stats-grid">
        {[
          { label: "Total Revenue", value: fmtAmount(stats.total_revenue), color: "blue", sparkColor: C.accent },
          { label: "Total Expenses", value: fmtAmount(stats.total_expenses), color: "amber", sparkColor: C.amber },
          { label: "Receivables", value: fmtAmount(stats.receivables), color: "purple", sparkColor: C.purple },
          { label: "Net Profit", value: fmtAmount(stats.net_profit), color: "green", sparkColor: C.green },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <MiniBarChart data={sparkData} color={s.sparkColor} />
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Invoices</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {recentInvoices.length === 0 && <tr><td colSpan={4}><EmptyState msg="No invoices yet" /></td></tr>}
                {recentInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><span className="tag">{inv.doc_number}</span></td>
                    <td>{inv["customer__name"] || inv.customer_name}</td>
                    <td><span className="amount">{fmtAmount(inv.total_amount)}</span></td>
                    <td><Badge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Account Balances</span></div>
          <div className="card-body">
            {ledgers.length === 0 && <EmptyState msg="No ledgers yet" />}
            {ledgers.map((l) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: C.text }}>{l.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{l["group__name"]}</div>
                </div>
                <span className={`amount ${l.balance_type === "Dr" ? "amount-green" : "amount-red"}`}>
                  {l.balance_type} {fmtAmount(l.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-header"><span className="card-title">Low Stock Alert</span></div>
          <div className="card-body">
            {(!lowStock || lowStock.length === 0) && <EmptyState icon="✅" msg="All stock levels OK" />}
            {(lowStock || []).map((p) => (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: C.text }}>{p.name}</span>
                  <span style={{ color: C.red, fontFamily: "Space Mono", fontSize: 11 }}>{p.stock_quantity}/{p.min_stock_level}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min((p.stock_quantity / p.min_stock_level) * 100, 100)}%`, background: C.red }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Sales Pipeline</span></div>
          <div className="card-body">
            {["Quotation", "Proforma", "Order", "Challan", "Invoice"].map((stage, i) => {
              const colors = [C.muted, C.accent, C.purple, C.amber, C.green];
              const info = pipeline[stage] || 0;
              return (
                <div key={stage} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i], flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 12, color: C.text }}>{stage}</div>
                  <div style={{ fontFamily: "Space Mono", fontSize: 11, color: colors[i] }}>{info} docs</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Quick Actions</span></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "New Invoice", icon: "◆", color: C.accent },
              { label: "New Purchase Order", icon: "◇", color: C.amber },
              { label: "Record Journal Entry", icon: "◈", color: C.purple },
              { label: "Adjust Stock", icon: "▣", color: C.green },
            ].map((a) => (
              <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: C.subtle, borderRadius: 8, cursor: "pointer", fontSize: 12, color: C.text }}
                onMouseEnter={(e) => e.currentTarget.style.background = C.accentGlow}
                onMouseLeave={(e) => e.currentTarget.style.background = C.subtle}>
                <span style={{ color: a.color }}>{a.icon}</span>{a.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GROUPS PAGE
// ═══════════════════════════════════════════════════════════════════════════
function GroupsPage() {
  const api = useApi();
  const { data, loading, reload } = useFetch("/accounts/groups/tree/");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useAppContext();

  const allGroups = data ? data.flatMap((g) => [g, ...(g.children || [])]) : [];

  const openNew = () => { setForm({ name: "", code: "", nature: "Asset", group_type: "Sub-Group", parent: "" }); setShowModal(true); setSelected(null); };
  const openEdit = (g) => { setForm({ ...g, parent: g.parent || "" }); setShowModal(true); setSelected(g.id); };

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...form, company: 1 };
      if (selected) await api.put(`/accounts/groups/${selected}/`, body);
      else await api.post("/accounts/groups/", body);
      showToast("Group saved", "success");
      setShowModal(false);
      reload();
    } catch (e) { showToast("Save failed: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this group?")) return;
    try { await api.del(`/accounts/groups/${id}/`); showToast("Deleted", "success"); reload(); }
    catch { showToast("Cannot delete — ledgers may be attached", "error"); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-title">Groups & Subgroups</div>
      <div className="page-subtitle">Chart of accounts structure</div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Account Tree</span>
            <button className="btn btn-primary" style={{ padding: "5px 12px", fontSize: 11 }} onClick={openNew}>+ Add</button>
          </div>
          <div className="card-body" style={{ padding: "10px" }}>
            {(data || []).map((g) => (
              <div key={g.id}>
                <div className={`tree-item ${selected === g.id ? "selected" : ""}`} onClick={() => openEdit(g)}>
                  <span style={{ fontSize: 12 }}>▶</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{g.name}</span>
                  <span className="tag">{g.code}</span>
                </div>
                {(g.children || []).map((c) => (
                  <div key={c.id} className={`tree-item ${selected === c.id ? "selected" : ""}`}
                    style={{ paddingLeft: 28 }} onClick={() => openEdit(c)}>
                    <span style={{ fontSize: 10, color: C.muted }}>◦</span>
                    <span style={{ flex: 1, fontSize: 12 }}>{c.name}</span>
                    <span className="tag">{c.code}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">All Groups</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Nature</th><th>Parent</th><th>Actions</th></tr></thead>
              <tbody>
                {allGroups.map((g) => (
                  <tr key={g.id}>
                    <td><span className="tag">{g.code}</span></td>
                    <td style={{ fontWeight: g.group_type === "Primary" ? 600 : 400, paddingLeft: g.level === 0 ? 14 : 28 }}>{g.name}</td>
                    <td><span className={`badge ${g.group_type === "Primary" ? "badge-blue" : "badge-muted"}`}>{g.group_type}</span></td>
                    <td><span className={`badge badge-${g.nature === "Asset" ? "blue" : g.nature === "Income" ? "green" : g.nature === "Expense" ? "red" : "amber"}`}>{g.nature}</span></td>
                    <td style={{ color: C.muted }}>{g.parent_name || "—"}</td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost" style={{ padding: "3px 10px", fontSize: 11 }} onClick={() => openEdit(g)}>Edit</button>
                      <button className="btn btn-danger" style={{ padding: "3px 10px", fontSize: 11 }} onClick={() => del(g.id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal title={selected ? "Edit Group" : "New Group"} onClose={() => setShowModal(false)} onSave={save} saving={saving}>
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group"><label>Group Name</label><input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Code</label><input value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select value={form.group_type || "Sub-Group"} onChange={(e) => setForm({ ...form, group_type: e.target.value })}>
                  <option>Primary</option><option>Sub-Group</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nature</label>
                <select value={form.nature || "Asset"} onChange={(e) => setForm({ ...form, nature: e.target.value })}>
                  <option>Asset</option><option>Liability</option><option>Income</option><option>Expense</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Parent Group (if Sub-Group)</label>
              <select value={form.parent || ""} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
                <option value="">— Primary Group —</option>
                {allGroups.filter((g) => g.group_type === "Primary").map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Description</label><textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LEDGERS PAGE
// ═══════════════════════════════════════════════════════════════════════════
function LedgersPage() {
  const api = useApi();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useAppContext();

  const nature = filter === "All" ? "" : filter;
  const { data, loading, reload } = useFetch(`/accounts/ledgers/${nature ? `?nature=${nature}` : ""}`);
  const { data: groupsData } = useFetch("/accounts/groups/");

  const ledgers = (data?.results || data || []).filter((l) =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.ledger_id.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setForm({ name: "", ledger_id: "", balance: 0, balance_type: "Dr" }); setSelected(null); setShowModal(true); };
  const openEdit = (l) => { setForm({ ...l, group: l.group }); setSelected(l.id); setShowModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...form, company: 1 };
      if (selected) await api.put(`/accounts/ledgers/${selected}/`, body);
      else await api.post("/accounts/ledgers/", body);
      showToast("Ledger saved", "success");
      setShowModal(false); reload();
    } catch (e) { showToast("Save failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-title">Ledgers</div>
      <div className="page-subtitle">Account ledger master</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {["All", "Asset", "Liability", "Income", "Expense"].map((f) => (
              <div key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</div>
            ))}
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search ledgers…" />
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Ledger</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Ledger Name</th><th>Group</th><th>Nature</th><th>Type</th><th style={{ textAlign: "right" }}>Balance</th><th>Actions</th></tr></thead>
            <tbody>
              {ledgers.length === 0 && <tr><td colSpan={7}><EmptyState /></td></tr>}
              {ledgers.map((l) => (
                <tr key={l.id}>
                  <td><span className="tag">{l.ledger_id}</span></td>
                  <td style={{ fontWeight: 500 }}>{l.name}</td>
                  <td style={{ color: C.muted }}>{l.group_name}</td>
                  <td><span className={`badge badge-${l.nature === "Asset" ? "blue" : l.nature === "Income" ? "green" : l.nature === "Expense" ? "red" : "amber"}`}>{l.nature}</span></td>
                  <td style={{ color: l.balance_type === "Dr" ? C.green : C.red, fontFamily: "Space Mono", fontSize: 11 }}>{l.balance_type}</td>
                  <td style={{ textAlign: "right" }}><span className="amount">{fmtAmount(l.balance)}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "3px 10px", fontSize: 11 }} onClick={() => openEdit(l)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={selected ? "Edit Ledger" : "New Ledger"} onClose={() => setShowModal(false)} onSave={save} saving={saving}>
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group"><label>Ledger ID</label><input value={form.ledger_id || ""} onChange={(e) => setForm({ ...form, ledger_id: e.target.value })} placeholder="e.g. L009" /></div>
              <div className="form-group"><label>Ledger Name</label><input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            </div>
            <div className="form-group">
              <label>Account Group</label>
              <select value={form.group || ""} onChange={(e) => setForm({ ...form, group: e.target.value })}>
                <option value="">Select group…</option>
                {(groupsData || []).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Opening Balance</label><input type="number" value={form.opening_balance || 0} onChange={(e) => setForm({ ...form, opening_balance: e.target.value })} /></div>
              <div className="form-group">
                <label>Balance Type</label>
                <select value={form.opening_balance_type || "Dr"} onChange={(e) => setForm({ ...form, opening_balance_type: e.target.value })}>
                  <option value="Dr">Debit (Dr)</option><option value="Cr">Credit (Cr)</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// JOURNAL ENTRIES PAGE
// ═══════════════════════════════════════════════════════════════════════════
function EntriesPage() {
  const api = useApi();
  const { data, loading, reload } = useFetch("/accounts/entries/");
  const { data: ledgersData } = useFetch("/accounts/ledgers/");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), voucher_type: "Journal", reference: "", narration: "", debit_ledger: "", credit_ledger: "", amount: "" });
  const [saving, setSaving] = useState(false);
  const { showToast } = useAppContext();

  const entries = data?.results || data || [];
  const allLedgers = ledgersData?.results || ledgersData || [];

  const submit = async () => {
    if (!form.debit_ledger || !form.credit_ledger || !form.amount) { showToast("Fill all required fields", "error"); return; }
    setSaving(true);
    try {
      const count = entries.length + 1;
      await api.post("/accounts/entries/", {
        company: 1,
        voucher_number: `JV-${String(count).padStart(3, "0")}`,
        voucher_type: form.voucher_type,
        date: form.date,
        reference: form.reference,
        narration: form.narration,
        lines: [
          { ledger: Number(form.debit_ledger), entry_type: "Dr", amount: form.amount },
          { ledger: Number(form.credit_ledger), entry_type: "Cr", amount: form.amount },
        ],
      });
      showToast("Entry posted", "success");
      setShowForm(false);
      setForm({ date: new Date().toISOString().slice(0, 10), voucher_type: "Journal", reference: "", narration: "", debit_ledger: "", credit_ledger: "", amount: "" });
      reload();
    } catch (e) { showToast("Error: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-title">Journal Entries</div>
      <div className="page-subtitle">Double-entry bookkeeping records</div>

      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span className="card-title">New Journal Entry</span>
            <button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="card-body">
            <div className="form-row-3" style={{ marginBottom: 14 }}>
              <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="form-group"><label>Reference</label><input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. INV-0041" /></div>
              <div className="form-group">
                <label>Voucher Type</label>
                <select value={form.voucher_type} onChange={(e) => setForm({ ...form, voucher_type: e.target.value })}>
                  {["Journal", "Payment", "Receipt", "Contra"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 180px", gap: 12, marginBottom: 12 }}>
              <div className="form-group">
                <label>Debit Account</label>
                <select value={form.debit_ledger} onChange={(e) => setForm({ ...form, debit_ledger: e.target.value })}>
                  <option value="">Select ledger…</option>
                  {allLedgers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Credit Account</label>
                <select value={form.credit_ledger} onChange={(e) => setForm({ ...form, credit_ledger: e.target.value })}>
                  <option value="">Select ledger…</option>
                  {allLedgers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Amount (₹)</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></div>
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Narration</label>
              <input value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} placeholder="Description of this entry…" />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? "Posting…" : "Post Entry"}</button>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Entry</button>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Voucher</th><th>Date</th><th>Debit</th><th>Credit</th><th>Narration</th><th>Ref</th><th style={{ textAlign: "right" }}>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {entries.length === 0 && <tr><td colSpan={8}><EmptyState /></td></tr>}
              {entries.map((e) => (
                <tr key={e.id}>
                  <td><span className="tag">{e.voucher_number}</span></td>
                  <td style={{ color: C.muted }}>{fmtDate(e.date)}</td>
                  <td style={{ color: C.green }}>{e.debit_ledger_name || "—"}</td>
                  <td style={{ color: C.red }}>{e.credit_ledger_name || "—"}</td>
                  <td style={{ color: C.muted, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.narration}</td>
                  <td><span className="tag">{e.reference || "—"}</span></td>
                  <td style={{ textAlign: "right" }}><span className="amount">{fmtAmount(e.entry_amount)}</span></td>
                  <td><span className={`badge ${e.is_posted ? "badge-green" : "badge-muted"}`}>{e.is_posted ? "Posted" : "Draft"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SALES DOCUMENTS PAGE
// ═══════════════════════════════════════════════════════════════════════════
function SalesPage({ docType }) {
  const api = useApi();
  const typeLabel = { quotation: "Quotation", proforma: "Proforma", order: "Order", challan: "Challan", invoice: "Invoice" };
  const label = typeLabel[docType] || docType;

  const { data, loading, reload } = useFetch(`/sales/documents/?doc_type=${label}`);
  const { data: customersData } = useFetch("/sales/customers/");
  const { showToast } = useAppContext();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), customer_name: "", status: "Draft", gst_type: "CGST+SGST" });
  const [lines, setLines] = useState([{ product_name: "", quantity: 1, unit: "pcs", rate: 0, gst_rate: 18 }]);

  const docs = (data?.results || data || []).filter((d) =>
    !search || d.doc_number.toLowerCase().includes(search.toLowerCase()) ||
    (d.customer_name || "").toLowerCase().includes(search.toLowerCase())
  );
  const customers = customersData?.results || customersData || [];

  const NEXT_STAGE = { Quotation: "Proforma", Proforma: "Order", Order: "Challan", Challan: "Invoice" };

  const handleConvert = async (id) => {
    try {
      await api.post(`/sales/documents/${id}/convert/`, {});
      showToast("Converted to next stage", "success"); reload();
    } catch { showToast("Conversion failed", "error"); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.post(`/sales/documents/${id}/change_status/`, { status: newStatus });
      showToast("Status updated", "success"); reload();
    } catch { showToast("Failed", "error"); }
  };

  const addLine = () => setLines([...lines, { product_name: "", quantity: 1, unit: "pcs", rate: 0, gst_rate: 18 }]);
  const updateLine = (i, k, v) => { const l = [...lines]; l[i] = { ...l[i], [k]: v }; setLines(l); };

  const save = async () => {
    setSaving(true);
    const count = docs.length + 1;
    const prefixMap = { quotation: "QT", proforma: "PI", order: "SO", challan: "DC", invoice: "INV" };
    const doc_number = `${prefixMap[docType]}-${Date.now().toString().slice(-6)}`;
    try {
      await api.post("/sales/documents/", {
        company: 1, doc_type: label, doc_number,
        date: form.date, status: form.status,
        customer_name: form.customer_name,
        gst_type: form.gst_type,
        lines: lines.map((l, i) => ({ ...l, line_number: i + 1 })),
      });
      showToast(`${label} created`, "success");
      setShowModal(false); reload();
    } catch (e) { showToast("Error: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  const titles = { quotation: "Quotations", proforma: "Proforma Invoice", order: "Sales Orders", challan: "Delivery Challan", invoice: "Sales Invoices" };

  return (
    <div className="animate-in">
      <div className="page-title">{titles[docType]}</div>
      <div className="page-subtitle">Manage {titles[docType]?.toLowerCase()}</div>

      {/* Pipeline indicator */}
      <div style={{ display: "flex", gap: 0, alignItems: "center", marginBottom: 20, fontSize: 11 }}>
        {["Quotation", "Proforma", "Order", "Challan", "Invoice"].map((step, si) => (
          <span key={si} style={{ display: "flex", alignItems: "center" }}>
            <span style={{ padding: "4px 10px", background: step.toLowerCase() === docType ? C.accent : C.subtle, color: step.toLowerCase() === docType ? "white" : C.muted, borderRadius: 4, fontWeight: step.toLowerCase() === docType ? 600 : 400 }}>{step}</span>
            {si < 4 && <span style={{ margin: "0 2px", color: "#2A3A55" }}>→</span>}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <SearchBar value={search} onChange={setSearch} placeholder={`Search ${titles[docType]?.toLowerCase()}…`} />
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New {label}</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Number</th><th>Customer</th><th>Date</th><th style={{ textAlign: "right" }}>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {docs.length === 0 && <tr><td colSpan={6}><EmptyState msg={`No ${titles[docType]?.toLowerCase()} yet`} /></td></tr>}
              {docs.map((d) => (
                <tr key={d.id}>
                  <td><span className="tag">{d.doc_number}</span></td>
                  <td style={{ fontWeight: 500 }}>{d.customer_display || d.customer_name}</td>
                  <td style={{ color: C.muted }}>{fmtDate(d.date)}</td>
                  <td style={{ textAlign: "right" }}><span className="amount">{fmtAmount(d.total_amount)}</span></td>
                  <td><Badge status={d.status} /></td>
                  <td style={{ display: "flex", gap: 4 }}>
                    {NEXT_STAGE[label] && d.status !== "Converted" && (
                      <button className="btn btn-ghost" style={{ padding: "3px 8px", fontSize: 10 }} onClick={() => handleConvert(d.id)}>→ {NEXT_STAGE[label]}</button>
                    )}
                    {d.status === "Pending" && (
                      <button className="btn btn-ghost" style={{ padding: "3px 8px", fontSize: 10 }} onClick={() => handleStatusChange(d.id, "Paid")}>Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={`New ${label}`} onClose={() => setShowModal(false)} onSave={save} saving={saving} wide>
          <div className="form-grid">
            <div className="form-row-3">
              <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="form-group">
                <label>Customer</label>
                <select value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })}>
                  <option value="">Select customer…</option>
                  {customers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {["Draft", "Pending", "Approved", "Confirmed", "Dispatched", "Paid"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              <table>
                <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Unit</th><th>Rate (₹)</th><th>GST %</th></tr></thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={i}>
                      <td style={{ color: C.muted }}>{i + 1}</td>
                      <td><input value={l.product_name} onChange={(e) => updateLine(i, "product_name", e.target.value)} placeholder="Product name" /></td>
                      <td><input type="number" value={l.quantity} onChange={(e) => updateLine(i, "quantity", e.target.value)} style={{ width: 70 }} /></td>
                      <td>
                        <select value={l.unit} onChange={(e) => updateLine(i, "unit", e.target.value)} style={{ width: 80 }}>
                          {["pcs", "kgs", "mtrs", "ltrs", "sets", "box"].map((u) => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td><input type="number" value={l.rate} onChange={(e) => updateLine(i, "rate", e.target.value)} /></td>
                      <td>
                        <select value={l.gst_rate} onChange={(e) => updateLine(i, "gst_rate", e.target.value)} style={{ width: 80 }}>
                          {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={addLine}>+ Add Line</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════════════════
function PurchasePage({ subPage }) {
  const api = useApi();
  const { showToast } = useAppContext();
  const [tab, setTab] = useState(subPage || "purchaseOrders");

  const { data: ordersData, loading: ordersLoading, reload: reloadOrders } = useFetch("/purchase/orders/");
  const { data: invoicesData, loading: invLoading, reload: reloadInvoices } = useFetch("/purchase/invoices/");
  const { data: returnsData, loading: retLoading, reload: reloadReturns } = useFetch("/purchase/returns/");
  const { data: vendorsData } = useFetch("/purchase/vendors/");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), vendor_name: "", status: "Draft" });
  const [lines, setLines] = useState([{ product_name: "", quantity: 1, unit: "pcs", rate: 0, gst_rate: 18 }]);

  const vendors = vendorsData?.results || vendorsData || [];
  const orders = ordersData?.results || ordersData || [];
  const invoices = invoicesData?.results || invoicesData || [];
  const returns = returnsData?.results || returnsData || [];

  const addLine = () => setLines([...lines, { product_name: "", quantity: 1, unit: "pcs", rate: 0, gst_rate: 18 }]);
  const updateLine = (i, k, v) => { const l = [...lines]; l[i] = { ...l[i], [k]: v }; setLines(l); };

  const saveOrder = async () => {
    setSaving(true);
    try {
      await api.post("/purchase/orders/", {
        company: 1, po_number: `PO-${Date.now().toString().slice(-6)}`,
        date: form.date, vendor_name: form.vendor_name, status: form.status,
        lines: lines.map((l, i) => ({ ...l, line_number: i + 1 })),
      });
      showToast("Purchase order created", "success");
      setShowModal(false); reloadOrders();
    } catch (e) { showToast("Error: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleReceive = async (id) => {
    const po = orders.find((o) => o.id === id);
    if (!po) return;
    const receipts = (po.lines || []).map((l) => ({ line_id: l.id, received_quantity: l.quantity }));
    try {
      await api.post(`/purchase/orders/${id}/receive/`, { receipts });
      showToast("Marked as received", "success"); reloadOrders();
    } catch { showToast("Failed", "error"); }
  };

  const payInvoice = async (id, amt) => {
    try { await api.post(`/purchase/invoices/${id}/pay/`, { amount: amt }); showToast("Payment recorded", "success"); reloadInvoices(); }
    catch { showToast("Failed", "error"); }
  };

  const loading = tab === "purchaseOrders" ? ordersLoading : tab === "purchaseInvoices" ? invLoading : retLoading;
  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-title">Purchase Management</div>
      <div className="page-subtitle">Manage vendors, orders, and invoices</div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {[["purchaseOrders", "Purchase Orders"], ["purchaseInvoices", "Invoices"], ["purchaseReturns", "Returns"]].map(([id, lbl]) => (
            <div key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{lbl}</div>
          ))}
        </div>
        {tab === "purchaseOrders" && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New PO</button>}
      </div>

      {tab === "purchaseOrders" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>PO Number</th><th>Vendor</th><th>Date</th><th>Items</th><th style={{ textAlign: "right" }}>Amount</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.length === 0 && <tr><td colSpan={7}><EmptyState /></td></tr>}
                {orders.map((p) => (
                  <tr key={p.id}>
                    <td><span className="tag">{p.po_number}</span></td>
                    <td style={{ fontWeight: 500 }}>{p.vendor_display || p.vendor_name}</td>
                    <td style={{ color: C.muted }}>{fmtDate(p.date)}</td>
                    <td style={{ color: C.muted }}>{p.item_count} items</td>
                    <td style={{ textAlign: "right" }}><span className="amount">{fmtAmount(p.total_amount)}</span></td>
                    <td><Badge status={p.status} /></td>
                    <td style={{ display: "flex", gap: 6 }}>
                      {p.status !== "Received" && p.status !== "Paid" && (
                        <button className="btn btn-ghost" style={{ padding: "3px 10px", fontSize: 11 }} onClick={() => handleReceive(p.id)}>Receive</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "purchaseInvoices" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Invoice No</th><th>Vendor</th><th>Date</th><th style={{ textAlign: "right" }}>Total</th><th style={{ textAlign: "right" }}>Paid</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {invoices.length === 0 && <tr><td colSpan={7}><EmptyState /></td></tr>}
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><span className="tag">{inv.invoice_number}</span></td>
                    <td>{inv.vendor_display || inv.vendor_name}</td>
                    <td style={{ color: C.muted }}>{fmtDate(inv.date)}</td>
                    <td style={{ textAlign: "right" }}><span className="amount">{fmtAmount(inv.total_amount)}</span></td>
                    <td style={{ textAlign: "right" }}><span className="amount amount-green">{fmtAmount(inv.paid_amount)}</span></td>
                    <td><Badge status={inv.status} /></td>
                    <td>
                      {inv.status !== "Paid" && (
                        <button className="btn btn-ghost" style={{ padding: "3px 10px", fontSize: 11 }}
                          onClick={() => payInvoice(inv.id, inv.balance_due)}>Pay {fmtAmount(inv.balance_due)}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "purchaseReturns" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Return No</th><th>Vendor</th><th>Date</th><th style={{ textAlign: "right" }}>Amount</th><th>Reason</th></tr></thead>
              <tbody>
                {returns.length === 0 && <tr><td colSpan={5}><EmptyState msg="No purchase returns" /></td></tr>}
                {returns.map((r) => (
                  <tr key={r.id}>
                    <td><span className="tag">{r.return_number}</span></td>
                    <td>{r.vendor_name}</td>
                    <td style={{ color: C.muted }}>{fmtDate(r.date)}</td>
                    <td style={{ textAlign: "right" }}><span className="amount">{fmtAmount(r.total_amount)}</span></td>
                    <td style={{ color: C.muted }}>{r.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal title="New Purchase Order" onClose={() => setShowModal(false)} onSave={saveOrder} saving={saving} wide>
          <div className="form-grid">
            <div className="form-row-3">
              <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="form-group">
                <label>Vendor</label>
                <select value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}>
                  <option value="">Select vendor…</option>
                  {vendors.map((v) => <option key={v.id} value={v.name}>{v.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {["Draft", "Sent", "Pending"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              <table>
                <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Unit</th><th>Rate (₹)</th><th>GST %</th></tr></thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><input value={l.product_name} onChange={(e) => updateLine(i, "product_name", e.target.value)} placeholder="Product" /></td>
                      <td><input type="number" value={l.quantity} onChange={(e) => updateLine(i, "quantity", e.target.value)} style={{ width: 70 }} /></td>
                      <td><select value={l.unit} onChange={(e) => updateLine(i, "unit", e.target.value)} style={{ width: 80 }}>{["pcs", "kgs", "mtrs", "sets"].map((u) => <option key={u}>{u}</option>)}</select></td>
                      <td><input type="number" value={l.rate} onChange={(e) => updateLine(i, "rate", e.target.value)} /></td>
                      <td><select value={l.gst_rate} onChange={(e) => updateLine(i, "gst_rate", e.target.value)} style={{ width: 80 }}>{[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}</select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={addLine}>+ Add Line</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY PAGES
// ═══════════════════════════════════════════════════════════════════════════
function ProductsPage() {
  const api = useApi();
  const { data, loading, reload } = useFetch("/inventory/products/");
  const { data: valData } = useFetch("/inventory/products/stock_valuation/");
  const { data: catData } = useFetch("/inventory/categories/");
  const { showToast } = useAppContext();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState(null);
  const [form, setForm] = useState({ sku: "", name: "", unit: "pcs", cost_price: 0, selling_price: 0, min_stock_level: 0, gst_rate: 18 });
  const [adjustForm, setAdjustForm] = useState({ movement_type: "IN", quantity: 1, date: new Date().toISOString().slice(0, 10), reference: "" });
  const [saving, setSaving] = useState(false);

  const products = (data?.results || data || []).filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );
  const categories = catData?.results || catData || [];
  const valuation = valData || {};

  const saveProduct = async () => {
    setSaving(true);
    try {
      await api.post("/inventory/products/", { ...form, company: 1 });
      showToast("Product created", "success"); setShowModal(false); reload();
    } catch (e) { showToast("Error: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const saveAdjust = async () => {
    setSaving(true);
    try {
      await api.post(`/inventory/products/${adjustModal}/adjust_stock/`, adjustForm);
      showToast("Stock adjusted", "success"); setAdjustModal(null); reload();
    } catch (e) { showToast("Error: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-title">Products</div>
      <div className="page-subtitle">Inventory catalog & stock levels</div>

      <div className="stats-grid" style={{ marginBottom: 16 }}>
        {[
          { label: "Total Products", value: valuation.total_products || 0, color: "blue" },
          { label: "Low Stock", value: valuation.low_stock_count || 0, color: "amber" },
          { label: "Stock Value", value: fmtAmount(valuation.total_stock_value || 0), color: "green" },
          { label: "Categories", value: categories.length, color: "purple" },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`} style={{ padding: 14 }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search products, SKU…" />
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Product</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Stock</th><th>Min</th><th>Unit</th><th style={{ textAlign: "right" }}>Cost</th><th style={{ textAlign: "right" }}>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {products.length === 0 && <tr><td colSpan={10}><EmptyState /></td></tr>}
              {products.map((p) => {
                const low = parseFloat(p.stock_quantity) < parseFloat(p.min_stock_level);
                return (
                  <tr key={p.id}>
                    <td><span className="tag">{p.sku}</span></td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ color: C.muted }}>{p.category_name || "—"}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontFamily: "Space Mono", fontSize: 11, color: low ? C.red : C.green }}>{p.stock_quantity}</span>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-fill" style={{ width: `${Math.min((parseFloat(p.stock_quantity) / Math.max(parseFloat(p.min_stock_level), 1)) * 100, 100)}%`, background: low ? C.red : C.green }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ color: C.muted, fontFamily: "Space Mono", fontSize: 11 }}>{p.min_stock_level}</td>
                    <td style={{ color: C.muted }}>{p.unit}</td>
                    <td style={{ textAlign: "right" }}><span className="amount">{fmtAmount(p.cost_price)}</span></td>
                    <td style={{ textAlign: "right" }}><span className="amount">{fmtAmount(p.selling_price)}</span></td>
                    <td><span className={`badge ${low ? "badge-red" : "badge-green"}`}>{low ? "Low" : "OK"}</span></td>
                    <td><button className="btn btn-ghost" style={{ padding: "3px 10px", fontSize: 11 }} onClick={() => setAdjustModal(p.id)}>Adjust</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Add Product" onClose={() => setShowModal(false)} onSave={saveProduct} saving={saving}>
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group"><label>SKU</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU-006" /></div>
              <div className="form-group"><label>Product Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  {["pcs", "kgs", "mtrs", "ltrs", "sets", "box"].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Cost Price</label><input type="number" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} /></div>
              <div className="form-group"><label>Selling Price</label><input type="number" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Min Stock Level</label><input type="number" value={form.min_stock_level} onChange={(e) => setForm({ ...form, min_stock_level: e.target.value })} /></div>
              <div className="form-group">
                <label>GST Rate</label>
                <select value={form.gst_rate} onChange={(e) => setForm({ ...form, gst_rate: e.target.value })}>
                  {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {adjustModal && (
        <Modal title="Adjust Stock" onClose={() => setAdjustModal(null)} onSave={saveAdjust} saving={saving}>
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group">
                <label>Movement Type</label>
                <select value={adjustForm.movement_type} onChange={(e) => setAdjustForm({ ...adjustForm, movement_type: e.target.value })}>
                  <option value="IN">Stock In (+)</option>
                  <option value="OUT">Stock Out (−)</option>
                  <option value="ADJUST">Set Absolute</option>
                </select>
              </div>
              <div className="form-group"><label>Quantity</label><input type="number" value={adjustForm.quantity} onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Date</label><input type="date" value={adjustForm.date} onChange={(e) => setAdjustForm({ ...adjustForm, date: e.target.value })} /></div>
              <div className="form-group"><label>Reference</label><input value={adjustForm.reference} onChange={(e) => setAdjustForm({ ...adjustForm, reference: e.target.value })} placeholder="PO-001" /></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CategoriesPage() {
  const api = useApi();
  const { data, loading, reload } = useFetch("/inventory/categories/");
  const { showToast } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const categories = data?.results || data || [];

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/inventory/categories/", { ...form, company: 1 });
      showToast("Category created", "success"); setShowModal(false); reload();
    } catch (e) { showToast("Error", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-title">Categories</div>
      <div className="page-subtitle">Product categories</div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Category</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Description</th><th>Products</th></tr></thead>
            <tbody>
              {categories.length === 0 && <tr><td colSpan={3}><EmptyState /></td></tr>}
              {categories.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ color: C.muted }}>{c.description || "—"}</td>
                  <td><span className="badge badge-muted">{c.product_count} products</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <Modal title="Add Category" onClose={() => setShowModal(false)} onSave={save} saving={saving}>
          <div className="form-grid">
            <div className="form-group"><label>Category Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StockMovementsPage() {
  const { data, loading } = useFetch("/inventory/movements/");
  const movements = data?.results || data || [];
  if (loading) return <Spinner />;
  return (
    <div className="animate-in">
      <div className="page-title">Stock Movements</div>
      <div className="page-subtitle">Full audit trail of all inventory changes</div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Balance After</th><th>Reference</th><th>Notes</th></tr></thead>
            <tbody>
              {movements.length === 0 && <tr><td colSpan={7}><EmptyState msg="No stock movements yet. Use Adjust Stock on a product." /></td></tr>}
              {movements.map((m) => (
                <tr key={m.id}>
                  <td style={{ color: C.muted }}>{fmtDate(m.date)}</td>
                  <td style={{ fontWeight: 500 }}>{m.product_name} <span style={{ color: C.muted, fontSize: 10 }}>({m.product_sku})</span></td>
                  <td><span className={`badge ${m.movement_type === "IN" || m.movement_type === "RETURN_IN" ? "badge-green" : m.movement_type === "OUT" ? "badge-red" : "badge-blue"}`}>{m.movement_type}</span></td>
                  <td style={{ fontFamily: "Space Mono", fontSize: 11, color: m.movement_type === "IN" ? C.green : C.red }}>{m.quantity}</td>
                  <td style={{ fontFamily: "Space Mono", fontSize: 11 }}>{m.balance_after}</td>
                  <td><span className="tag">{m.reference || "—"}</span></td>
                  <td style={{ color: C.muted }}>{m.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPANY PAGE
// ═══════════════════════════════════════════════════════════════════════════
function CompanyPage() {
  const api = useApi();
  const { data, loading, reload } = useFetch("/company/");
  const { showToast } = useAppContext();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const companies = data?.results || data || [];
  const company = companies[0];

  useEffect(() => { if (company) setForm(company); }, [company]);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/company/${company.id}/`, form);
      showToast("Company saved", "success"); reload();
    } catch { showToast("Save failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;
  if (!company) return <EmptyState msg="No company found. Run: python manage.py seed_data" />;

  return (
    <div className="animate-in">
      <div className="page-title">Company Settings</div>
      <div className="page-subtitle">Configure your company profile</div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Company Profile</span></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-row">
                <div className="form-group"><label>Company Name</label><input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-group"><label>Short Name</label><input value={form.short_name || ""} onChange={(e) => setForm({ ...form, short_name: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>GSTIN</label><input value={form.gstin || ""} onChange={(e) => setForm({ ...form, gstin: e.target.value })} /></div>
                <div className="form-group"><label>PAN</label><input value={form.pan || ""} onChange={(e) => setForm({ ...form, pan: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Registered Address</label><textarea rows={3} value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Phone</label><input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="form-group"><label>Email</label><input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">Financial Year</span></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group"><label>FY Start</label><input type="date" value={form.fy_start || ""} onChange={(e) => setForm({ ...form, fy_start: e.target.value })} /></div>
                <div className="form-group"><label>FY End</label><input type="date" value={form.fy_end || ""} onChange={(e) => setForm({ ...form, fy_end: e.target.value })} /></div>
              </div>
              <div className="form-row" style={{ marginTop: 14 }}>
                <div className="form-group">
                  <label>Base Currency</label>
                  <select value={form.base_currency || "INR"} onChange={(e) => setForm({ ...form, base_currency: e.target.value })}>
                    <option value="INR">INR — Indian Rupee</option><option value="USD">USD</option><option value="EUR">EUR</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>GST Scheme</label>
                  <select value={form.gst_scheme || "Regular"} onChange={(e) => setForm({ ...form, gst_scheme: e.target.value })}>
                    <option>Regular</option><option>Composition</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">All Companies</span></div>
            <div className="card-body">
              {companies.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div className="avatar" style={{ background: C.accentGlow, color: C.accent }}>{c.name[0]}</div>
                  <div style={{ flex: 1, fontSize: 12, color: C.text }}>{c.name}</div>
                  <span className="badge badge-green">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORTS PAGE
// ═══════════════════════════════════════════════════════════════════════════
function ReportsPage() {
  const api = useApi();
  const { showToast } = useAppContext();
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reports = [
    { name: "Trial Balance", desc: "All account balances", icon: "▤", color: C.accent, endpoint: "/accounts/ledgers/" },
    { name: "Stock Valuation", desc: "Inventory value by category", icon: "▣", color: C.green, endpoint: "/inventory/products/stock_valuation/" },
    { name: "Sales Pipeline", desc: "Documents per stage", icon: "◆", color: C.purple, endpoint: "/sales/documents/pipeline_summary/" },
    { name: "Low Stock Report", desc: "Items below minimum", icon: "◇", color: C.amber, endpoint: "/dashboard/low-stock/" },
    { name: "Purchase Summary", desc: "Vendor-wise orders", icon: "◉", color: C.red, endpoint: "/purchase/orders/" },
    { name: "Customer Outstanding", desc: "Unpaid invoices", icon: "◈", color: C.accent, endpoint: "/sales/documents/?status=Overdue" },
  ];

  const runReport = async (report) => {
    setActiveReport(report.name);
    setLoading(true);
    try {
      const d = await api.get(report.endpoint);
      setReportData(d);
    } catch { showToast("Report failed", "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-in">
      <div className="page-title">Reports</div>
      <div className="page-subtitle">Financial statements and analytics</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {reports.map((r) => (
          <div key={r.name} className="card" style={{ cursor: "pointer", transition: "border-color .15s", borderColor: activeReport === r.name ? r.color : C.border }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = r.color}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = activeReport === r.name ? r.color : C.border}
            onClick={() => runReport(r)}>
            <div className="card-body" style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ fontSize: 22, color: r.color, width: 36, textAlign: "center" }}>{r.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: activeReport === r.name ? r.color : C.text, marginBottom: 3 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{r.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeReport && (
        <div className="card animate-in">
          <div className="card-header">
            <span className="card-title">{activeReport}</span>
            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => { setActiveReport(null); setReportData(null); }}>✕</button>
          </div>
          <div className="card-body">
            {loading && <Spinner />}
            {!loading && reportData && (
              <pre style={{ fontSize: 11, color: C.text, overflow: "auto", maxHeight: 400, fontFamily: "Space Mono", lineHeight: 1.6 }}>
                {JSON.stringify(reportData?.results || reportData, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APP CONTEXT (Toast)
// ═══════════════════════════════════════════════════════════════════════════
const AppContext = createContext(null);
function useAppContext() { return useContext(AppContext); }

// ═══════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("fl_token") || "");
  const [username, setUsername] = useState(() => localStorage.getItem("fl_user") || "");
  const [active, setActive] = useState("dashboard");
  const [expanded, setExpanded] = useState({ accounts: true, sales: false, purchase: false, inventory: false });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  const login = (t, u) => {
    localStorage.setItem("fl_token", t);
    localStorage.setItem("fl_user", u);
    setToken(t); setUsername(u);
  };

  const logout = () => {
    localStorage.removeItem("fl_token");
    localStorage.removeItem("fl_user");
    setToken(""); setUsername("");
  };

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const getTitle = () => {
    const all = NAV.flatMap((n) => n.children ? [n, ...n.children] : [n]);
    return all.find((n) => n.id === active)?.label || "Dashboard";
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <Dashboard />;
      case "groups": return <GroupsPage />;
      case "ledgers": return <LedgersPage />;
      case "entries": return <EntriesPage />;
      case "quotation": return <SalesPage docType="quotation" />;
      case "proforma": return <SalesPage docType="proforma" />;
      case "order": return <SalesPage docType="order" />;
      case "challan": return <SalesPage docType="challan" />;
      case "invoice": return <SalesPage docType="invoice" />;
      case "purchaseOrders":
      case "purchaseInvoices":
      case "purchaseReturns": return <PurchasePage subPage={active} />;
      case "products": return <ProductsPage />;
      case "categories": return <CategoriesPage />;
      case "stock": return <StockMovementsPage />;
      case "company": return <CompanyPage />;
      case "reports": return <ReportsPage />;
      default: return <Dashboard />;
    }
  };

  if (!token) return (
    <>
      <style>{css}</style>
      <LoginPage onLogin={login} />
    </>
  );

  return (
    <AuthContext.Provider value={{ token, logout, username }}>
      <AppContext.Provider value={{ showToast }}>
        <style>{css}</style>
        <div className="layout">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="logo">
              <div className="logo-mark">FINLEDGER</div>
              <div className="logo-sub">Accounting Suite v2</div>
            </div>
            <div className="company-badge">
              <div className="company-dot" />
              <span className="company-name">ACME Industries Pvt. Ltd.</span>
            </div>
            <nav className="nav">
              {NAV.map((n) => (
                <div key={n.id}>
                  {n.children ? (
                    <>
                      <div className="nav-item" onClick={() => toggle(n.id)}>
                        <span className="nav-icon">{n.icon}</span>
                        <span>{n.label}</span>
                        <span className={`nav-chevron ${expanded[n.id] ? "open" : ""}`}>▶</span>
                      </div>
                      {expanded[n.id] && (
                        <div className="nav-children">
                          {n.children.map((c) => (
                            <div key={c.id} className={`nav-child ${active === c.id ? "active" : ""}`} onClick={() => setActive(c.id)}>
                              {c.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={`nav-item ${active === n.id ? "active" : ""}`} onClick={() => setActive(n.id)}>
                      <span className="nav-icon">{n.icon}</span>
                      <span>{n.label}</span>
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="avatar" style={{ background: C.accentGlow, color: C.accent }}>{username[0]?.toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{username}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>Administrator</div>
                </div>
                <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 10 }} onClick={logout}>Out</button>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="main">
            <div className="topbar">
              <div className="breadcrumb">
                <span>FinLedger</span><span>›</span>
                <span className="breadcrumb-active">{getTitle()}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 1, height: 20, background: C.border }} />
                <div className="avatar" style={{ background: C.accentGlow, color: C.accent, cursor: "pointer" }}>{username[0]?.toUpperCase()}</div>
              </div>
            </div>
            <div className="content">{renderPage()}</div>
          </main>
        </div>

        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AppContext.Provider>
    </AuthContext.Provider>
  );
}
