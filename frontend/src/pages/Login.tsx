import {
  CircleDollarSign,
  LogIn,
  ShoppingCart,
  UsersRound
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginUser } from "../services/authService";
import { getDashboardSummary } from "../services/analyticsService";
import type { DashboardSummary } from "../types";
import BrandLogo from "../components/common/BrandLogo";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const businessName = localStorage.getItem("setting_business_name") || "MIS Of Me";

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const stats = await getDashboardSummary();
        if (isMounted) {
          setSummary(stats);
        }
      } catch (e) {
        console.error("Failed to load public dashboard stats:", e);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const authData = await loginUser(email, password);
      login(authData);
      navigate("/dashboard");
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-aside">
          <div>
            <div className="brand">
              <span className="brand-mark">
                <BrandLogo />
              </span>
              <div>
                <p className="brand-title">{businessName}</p>
              </div>
            </div>

            <h1>Run sales operations from a calmer dashboard.</h1>
            <p>
              Sign in to review revenue, track orders, monitor inventory, and keep customers moving.
            </p>
          </div>

          <div className="mini-grid">
            <div className="mini-metric">
              <CircleDollarSign aria-hidden="true" size={18} strokeWidth={2.2} />
              <strong>{summary ? money.format(summary.revenue) : "$0"}</strong>
              <span>Revenue</span>
            </div>
            <div className="mini-metric">
              <ShoppingCart aria-hidden="true" size={18} strokeWidth={2.2} />
              <strong>{summary ? summary.orders : 0}</strong>
              <span>Orders</span>
            </div>
            <div className="mini-metric">
              <UsersRound aria-hidden="true" size={18} strokeWidth={2.2} />
              <strong>{summary ? summary.customers : 0}</strong>
              <span>Customers</span>
            </div>
          </div>
        </section>

        <form onSubmit={handleLogin} className="login-form">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>Log in</h2>
            <p>Sign in with your {businessName} account.</p>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@salesmis.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="form-error" role="alert">{error}</p>
          )}

          <button
            className="button primary"
            type="submit"
            disabled={isSubmitting}
          >
            <LogIn aria-hidden="true" size={17} strokeWidth={2.2} />
            {isSubmitting ? "Signing in..." : "Log in"}
          </button>

          <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--muted)", textAlign: "center" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
