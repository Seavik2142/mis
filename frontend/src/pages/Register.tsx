import {
  CircleDollarSign,
  Eye,
  EyeOff,
  UserPlus,
  ShoppingCart,
  UsersRound
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { getDashboardSummary } from "../services/analyticsService";
import type { DashboardSummary } from "../types";
import BrandLogo from "../components/common/BrandLogo";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

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
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Secure Password strength validator
  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Za-z]/.test(pass)) {
      return "Password must contain at least one letter.";
    }
    if (!/[0-9]/.test(pass)) {
      return "Password must contain at least one number.";
    }
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 1. Password Match check
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 2. Password Strength validation
    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser(email, password, fullName);
      setSuccess("Account created successfully! Redirecting to login page...");
      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (requestError: any) {
      setError(requestError.message || "Registration failed. Please try again.");
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
                <p className="brand-title">MIS Of Me</p>
              </div>
            </div>

            <h1>Join a calmer sales operations workspace.</h1>
            <p>
              Register your account to manage catalog inventory, record customer metrics, and handle operations securely.
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

        <form onSubmit={handleRegister} className="login-form">
          <div>
            <p className="eyebrow">Get started</p>
            <h2>Create account</h2>
            <p>Fill out the credentials to register.</p>
          </div>

          <div className="field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Must be 8+ chars with letter & number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert" style={{ color: "var(--red)" }}>{error}</p>
          )}

          {success && (
            <p className="form-success" role="status" style={{ color: "var(--green)", fontSize: "14px", fontWeight: "600", margin: "4px 0" }}>{success}</p>
          )}

          <button
            className="button primary"
            type="submit"
            disabled={isSubmitting}
          >
            <UserPlus aria-hidden="true" size={17} strokeWidth={2.2} />
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>

          <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--muted)", textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
