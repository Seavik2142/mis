import { BellRing, Building2, Eye, EyeOff, KeyRound, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import Layout from "../components/layout/Layout";
import { changePassword } from "../services/authService";

function Settings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const passError = validatePassword(newPassword);
    if (passError) {
      setError(passError);
      return;
    }

    setIsSaving(true);

    try {
      await changePassword(oldPassword, newPassword);
      setSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (requestError: any) {
      setError(requestError.message || "Failed to update password. Please verify current password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <section className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Settings</h1>
            <p className="lede">
              Configure profile, notifications, and operational preferences for the sales workspace.
            </p>
          </div>

          <div className="actions">
            <button className="button" type="button">
              <RotateCcw aria-hidden="true" size={17} strokeWidth={2.2} />
              Reset
            </button>
            <button className="button primary" type="button">
              <Save aria-hidden="true" size={17} strokeWidth={2.2} />
              Save Changes
            </button>
          </div>
        </div>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title-row">
                <span className="panel-icon">
                  <Building2 aria-hidden="true" size={18} strokeWidth={2.2} />
                </span>
                <h2 className="panel-title">Business Profile</h2>
              </div>
              <p className="panel-subtitle">Default details used across reports and exports</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="businessName">Business name</label>
              <input id="businessName" defaultValue="Sales MIS" />
            </div>
            <div className="field">
              <label htmlFor="currency">Currency</label>
              <select id="currency" defaultValue="USD">
                <option value="USD">USD</option>
                <option value="KHR">KHR</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="timezone">Timezone</label>
              <input id="timezone" defaultValue="Asia/Phnom_Penh" />
            </div>
            <div className="field">
              <label htmlFor="reportEmail">Report email</label>
              <input id="reportEmail" defaultValue="reports@salesmis.com" />
            </div>
          </div>
        </section>

        {/* Change Password Profile Section */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title-row">
                <span className="panel-icon">
                  <KeyRound aria-hidden="true" size={18} strokeWidth={2.2} />
                </span>
                <h2 className="panel-title">Security & Password</h2>
              </div>
              <p className="panel-subtitle">Update your account login password securely</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} style={{ padding: "24px", maxWidth: "480px" }}>
            <div className="field" style={{ marginBottom: "16px" }}>
              <label htmlFor="old-password">Current Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="old-password"
                  type={showOld ? "text" : "password"}
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  style={{ width: "100%", paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
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
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="field" style={{ marginBottom: "16px" }}>
              <label htmlFor="new-password">New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  placeholder="Must be 8+ chars with letter & number"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: "100%", paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
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
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="field" style={{ marginBottom: "20px" }}>
              <label htmlFor="confirm-new-password">Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirm-new-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: "100%", paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
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
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="notice danger" style={{ margin: "0 0 16px 0", padding: "10px 14px", fontSize: "13px" }}>{error}</p>
            )}

            {success && (
              <p className="notice success" style={{ margin: "0 0 16px 0", padding: "10px 14px", fontSize: "13px" }}>{success}</p>
            )}

            <button
              className="button primary"
              type="submit"
              disabled={isSaving}
              style={{ minWidth: "150px" }}
            >
              {isSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title-row">
                <span className="panel-icon">
                  <BellRing aria-hidden="true" size={18} strokeWidth={2.2} />
                </span>
                <h2 className="panel-title">Notifications</h2>
              </div>
              <p className="panel-subtitle">Alerts for order, inventory, and report events</p>
            </div>
          </div>

          <div className="settings-list">
            <div className="settings-row">
              <div>
                <strong>Low stock alerts</strong>
                <p>Notify managers when products cross reorder level.</p>
              </div>
              <span className="toggle on" role="switch" aria-checked="true"><span /></span>
            </div>
            <div className="settings-row">
              <div>
                <strong>Daily sales digest</strong>
                <p>Send a compact sales summary after close of business.</p>
              </div>
              <span className="toggle on" role="switch" aria-checked="true"><span /></span>
            </div>
            <div className="settings-row">
              <div>
                <strong>Delayed order alerts</strong>
                <p>Flag orders that miss fulfillment targets.</p>
              </div>
              <span className="toggle" role="switch" aria-checked="false"><span /></span>
            </div>
          </div>
        </section>
      </section>
    </Layout>
  );
}

export default Settings;
