import { useState } from "react";
import { useAuth } from "./AuthContext";

const COLORS = {
  red: "#C8102E",
  redDark: "#A00D24",
  navy: "#0D1117",
  navyMid: "#131920",
  navyLight: "#1A2332",
  white: "#FFFFFF",
  offWhite: "#F0EDE8",
  grey: "#8A8F98",
  greyLight: "#B8BCC4",
  border: "#1E2A3A",
};

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (tab === "signin") {
        await signIn(email, password);
        onClose();
      } else {
        if (!username.trim()) { setError("Username is required."); setBusy(false); return; }
        const data = await signUp(email, password, username.trim());
        // If email confirmation is required, user won't be in session yet
        if (!data.session) {
          setInfo("Check your email to confirm your account, then sign in.");
          setTab("signin");
        } else {
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: COLORS.navyLight, border: `1px solid ${COLORS.border}`, borderTop: `3px solid ${COLORS.red}`, padding: "2rem 1.8rem", width: "100%", maxWidth: 360, fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", marginBottom: "1.6rem", borderBottom: `1px solid ${COLORS.border}` }}>
          {[["signin", "Sign In"], ["signup", "Create Account"]].map(([id, label]) => (
            <button key={id} onClick={() => { setTab(id); setError(""); setInfo(""); }}
              style={{ flex: 1, background: "none", border: "none", borderBottom: `2px solid ${tab === id ? COLORS.red : "transparent"}`, color: tab === id ? COLORS.white : COLORS.grey, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", padding: "0 0 0.75rem", cursor: "pointer", transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          {tab === "signup" && (
            <div>
              <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.grey, marginBottom: "0.35rem" }}>Username</label>
              <input
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder="holdthenorth"
                autoComplete="username"
                style={{ width: "100%", background: COLORS.navyMid, border: `1px solid ${COLORS.border}`, color: COLORS.offWhite, padding: "0.6rem 0.75rem", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "rgba(200,16,46,0.6)"}
                onBlur={e => e.target.style.borderColor = COLORS.border}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.grey, marginBottom: "0.35rem" }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              style={{ width: "100%", background: COLORS.navyMid, border: `1px solid ${COLORS.border}`, color: COLORS.offWhite, padding: "0.6rem 0.75rem", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "rgba(200,16,46,0.6)"}
              onBlur={e => e.target.style.borderColor = COLORS.border}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.grey, marginBottom: "0.35rem" }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={tab === "signup" ? "Min 6 characters" : "••••••••"}
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
              required
              style={{ width: "100%", background: COLORS.navyMid, border: `1px solid ${COLORS.border}`, color: COLORS.offWhite, padding: "0.6rem 0.75rem", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "rgba(200,16,46,0.6)"}
              onBlur={e => e.target.style.borderColor = COLORS.border}
            />
          </div>

          {error && (
            <p style={{ color: COLORS.red, fontSize: "0.72rem", letterSpacing: "0.06em", margin: 0 }}>{error}</p>
          )}
          {info && (
            <p style={{ color: "#4caf50", fontSize: "0.72rem", letterSpacing: "0.06em", margin: 0 }}>{info}</p>
          )}

          <div style={{ display: "flex", gap: "0.7rem", marginTop: "0.3rem" }}>
            <button type="submit" disabled={busy}
              style={{ flex: 1, background: COLORS.red, border: "none", color: COLORS.white, padding: "0.7rem 1rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1, transition: "background 0.2s" }}
              onMouseEnter={e => { if (!busy) e.target.style.background = COLORS.redDark; }}
              onMouseLeave={e => e.target.style.background = busy ? COLORS.red : COLORS.red}
            >
              {busy ? "…" : tab === "signin" ? "Sign In" : "Create Account"}
            </button>
            <button type="button" onClick={onClose}
              style={{ background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.grey, padding: "0.7rem 1rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor = COLORS.grey; e.target.style.color = COLORS.offWhite; }}
              onMouseLeave={e => { e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.grey; }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
