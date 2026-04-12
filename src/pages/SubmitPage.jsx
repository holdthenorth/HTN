import { useState } from "react";
import { Link } from "react-router-dom";

const C = {
  navy:      "#0D1117",
  navyMid:   "#131920",
  navyLight: "#1A2332",
  red:       "#C8102E",
  white:     "#FFFFFF",
  offWhite:  "#F0EDE8",
  grey:      "#8A8F98",
  greyLight: "#B8BCC4",
  border:    "#1E2A3A",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,400&family=Barlow+Condensed:wght@400;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  .sb-back{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:${C.grey};text-decoration:none;display:inline-flex;align-items:center;gap:0.4rem;transition:color 0.2s}
  .sb-back:hover{color:${C.offWhite}}
  .sb-label{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.62rem;letter-spacing:0.22em;text-transform:uppercase;color:${C.red};margin-bottom:0.6rem}
  .sb-fi{width:100%;background:${C.navyLight};border:1px solid ${C.border};color:${C.offWhite};padding:0.65rem 0.85rem;font-family:'Source Serif 4',serif;font-size:0.95rem;outline:none;transition:border-color 0.2s;resize:vertical}
  .sb-fi:focus{border-color:rgba(200,16,46,0.6)}
  .sb-fi::placeholder{color:${C.grey}}
  .sb-fl{font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:${C.grey};display:block;margin-bottom:0.35rem}
  .sb-btn{background:${C.red};border:none;color:#fff;padding:0.7rem 2rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.78rem;letter-spacing:0.16em;text-transform:uppercase;cursor:pointer;transition:background 0.2s}
  .sb-btn:hover{background:#A00D24}
  .sb-btn:disabled{background:#5A1020;cursor:default;opacity:0.6}
  .sb-option{background:${C.navyLight};border:1px solid ${C.border};padding:1.2rem 1.4rem;margin-bottom:0.9rem;display:flex;align-items:flex-start;gap:1rem}
  .sb-option-icon{font-size:1.4rem;flex-shrink:0;margin-top:0.1rem}
  .sb-option-title{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;color:${C.white};margin-bottom:0.3rem}
  .sb-option-desc{font-family:'Source Serif 4',serif;font-size:0.88rem;color:${C.grey};line-height:1.6}
  .sb-divider{border:none;border-top:1px solid ${C.border};margin:2.5rem 0}
  .sb-success{background:#0D2B1A;border:1px solid #1A5C3A;border-left:3px solid #2A9C6F;padding:1.2rem 1.4rem;font-family:'Source Serif 4',serif;font-size:0.95rem;color:#7ACCA0;line-height:1.6}
`;

export default function SubmitPage() {
  const [form, setForm] = useState({ name: "", email: "", type: "tip", subject: "", message: "", url: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("https://formspree.io/f/editor@holdthenorth.news", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    form.name,
          email:   form.email,
          type:    form.type,
          subject: form.subject || "",
          url:     form.url || "",
          message: form.message,
        }),
      });
      setSending(false);
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again or email us directly at editor@holdthenorth.news");
      }
    } catch {
      setSending(false);
      setError("Could not send your message. Please email us directly at editor@holdthenorth.news");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.offWhite, fontFamily: "Georgia, serif" }}>
      <style>{CSS}</style>

      {/* Top bar */}
      <div style={{ background: C.navyMid, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0.75rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" className="sb-back">← holdthenorth.news</Link>
          <img src="/htncrop.png" alt="HTN" style={{ height: 30 }} />
        </div>
      </div>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 1.2rem 5rem" }}>

        {/* Hero */}
        <div className="sb-label">Submit to HTN</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(2rem,5vw,3rem)", color: C.white, lineHeight: 1.1, marginBottom: "1rem" }}>
          Share What You Know.
        </h1>
        <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1.05rem", color: C.grey, lineHeight: 1.75, maxWidth: 600, marginBottom: "2.5rem" }}>
          HTN relies on readers, journalists, and community members who see things the mainstream press misses. If you have a story tip, a piece of writing, or information we should know — we want to hear from you.
        </p>

        {/* Submission types */}
        <div className="sb-option">
          <div className="sb-option-icon">📰</div>
          <div>
            <div className="sb-option-title">News Tips</div>
            <div className="sb-option-desc">A story you think HTN should cover. Include what you know, who's involved, and any documentation if you have it. Your identity is protected.</div>
          </div>
        </div>
        <div className="sb-option">
          <div className="sb-option-icon">✍️</div>
          <div>
            <div className="sb-option-title">Opinion & Analysis</div>
            <div className="sb-option-desc">Original commentary or long-form analysis for The Pitch. We're looking for depth, specificity, and a point of view backed by evidence.</div>
          </div>
        </div>
        <div className="sb-option">
          <div className="sb-option-icon">🎙</div>
          <div>
            <div className="sb-option-title">Independent Journalists & Voices</div>
            <div className="sb-option-desc">If you're an independent journalist or creator doing original Canadian coverage, apply for a listing in our Voices directory with your RSS feed or portfolio link.</div>
          </div>
        </div>

        <hr className="sb-divider" />

        {/* Form */}
        {submitted ? (
          <div className="sb-success">
            Your submission has been received. We read every message and will follow up at the email you provided. You can also reach us directly at <strong>editor@holdthenorth.news</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ maxWidth: 620 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label className="sb-fl">Your Name *</label>
                <input className="sb-fi" name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" required />
              </div>
              <div>
                <label className="sb-fl">Email Address *</label>
                <input className="sb-fi" type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" required />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label className="sb-fl">Submission Type</label>
              <select className="sb-fi" name="type" value={form.type} onChange={handleChange} style={{ cursor: "pointer" }}>
                <option value="tip">News Tip</option>
                <option value="opinion">Opinion / The Pitch</option>
                <option value="voice">Voices Directory — Independent Journalist</option>
                <option value="correction">Correction or Clarification</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label className="sb-fl">Subject / Headline</label>
              <input className="sb-fi" name="subject" value={form.subject} onChange={handleChange} placeholder="Brief description of your submission" />
            </div>

            {(form.type === "tip" || form.type === "voice" || form.type === "opinion") && (
              <div style={{ marginBottom: "1rem" }}>
                <label className="sb-fl">Relevant URL (optional)</label>
                <input className="sb-fi" name="url" value={form.url} onChange={handleChange} placeholder="https://... (article, document, RSS feed, portfolio)" />
              </div>
            )}

            <div style={{ marginBottom: "1.4rem" }}>
              <label className="sb-fl">Your Message *</label>
              <textarea className="sb-fi" name="message" value={form.message} onChange={handleChange} rows={7}
                placeholder={form.type === "tip"
                  ? "Tell us what you know. Who, what, when, where — and what documents or sources can support this?"
                  : form.type === "opinion"
                  ? "Outline your argument or share a draft. What's your central claim and why does it matter now?"
                  : "Tell us about yourself and your work."
                }
                required
              />
            </div>

            {error && (
              <div style={{ marginBottom: "1rem", background: "#2B0D0D", border: "1px solid #5C1A1A", borderLeft: `3px solid ${C.red}`, padding: "0.9rem 1.1rem", fontFamily: "'Source Serif 4',serif", fontSize: "0.9rem", color: "#E07070", lineHeight: 1.6 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", flexWrap: "wrap" }}>
              <button className="sb-btn" type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send Submission →"}
              </button>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.68rem", letterSpacing: "0.08em", color: C.grey }}>
                Or email us directly: <a href="mailto:editor@holdthenorth.news" style={{ color: C.red }}>editor@holdthenorth.news</a>
              </span>
            </div>
          </form>
        )}

        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: "3rem", paddingTop: "1.5rem" }}>
          <Link to="/" className="sb-back">← Back to News</Link>
        </div>

      </main>
    </div>
  );
}
