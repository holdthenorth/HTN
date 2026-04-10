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
  .lp-back{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:${C.grey};text-decoration:none;display:inline-flex;align-items:center;gap:0.4rem;transition:color 0.2s}
  .lp-back:hover{color:${C.offWhite}}
  .lp-section{margin-bottom:2.2rem}
  .lp-section-label{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.65rem;letter-spacing:0.22em;text-transform:uppercase;color:${C.red};margin-bottom:0.55rem}
  .lp-section-body{font-family:'Source Serif 4',serif;font-size:1rem;color:${C.greyLight};line-height:1.8}
  .lp-section-body a{color:${C.red};text-decoration:underline;text-underline-offset:3px}
  .lp-section-body a:hover{color:#e04060}
  .lp-divider{border:none;border-top:1px solid ${C.border};margin:0 0 2.2rem}
`;

const SECTIONS = [
  {
    label: "Who We Are",
    body: "Hold the North (holdthenorth.news) is an independent Canadian news curation and commentary platform operated under an Ontario Master Business Licence.",
  },
  {
    label: "What We Collect",
    body: "Submission form data (name, email, message) when you contact us. Basic analytics data (page views, general location). No account registration, no cookies beyond essential site function.",
  },
  {
    label: "How We Use It",
    body: "Submission data is used solely to respond to your inquiry. We do not sell, share, or monetize your personal information. Analytics data is used to improve the site and understand our audience.",
  },
  {
    label: "Your Rights Under PIPEDA",
    body: <>You have the right to access, correct, or request deletion of any personal information you've submitted to HTN. Contact us at <a href="mailto:hello@holdthenorth.news">hello@holdthenorth.news</a>.</>,
  },
  {
    label: "Third Party Services",
    body: "HTN uses RSS feeds from third party news sources. We are not responsible for the privacy practices of linked sites.",
  },
  {
    label: "Contact",
    body: <><a href="mailto:hello@holdthenorth.news">hello@holdthenorth.news</a></>,
  },
];

export default function Privacy() {
  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.offWhite, fontFamily: "Georgia, serif" }}>
      <style>{CSS}</style>

      <div style={{ background: C.navyMid, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0.75rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" className="lp-back">← holdthenorth.news</Link>
          <img src="/htncrop.png" alt="HTN" style={{ height: 30 }} />
        </div>
      </div>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.2rem 5rem" }}>

        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.25em", color: C.red, textTransform: "uppercase", marginBottom: "0.6rem" }}>
          Legal
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: C.white, lineHeight: 1.15, marginBottom: "0.6rem" }}>
          Privacy Policy
        </h1>
        <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.75rem", letterSpacing: "0.08em", color: C.grey, marginBottom: "2.5rem" }}>
          Effective Date: April 10, 2026
        </p>

        <hr className="lp-divider" />

        {SECTIONS.map(({ label, body }) => (
          <div key={label} className="lp-section">
            <div className="lp-section-label">{label}</div>
            <div className="lp-section-body">{body}</div>
          </div>
        ))}

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "1.5rem", marginTop: "1rem" }}>
          <Link to="/" className="lp-back">← Back to News</Link>
        </div>

      </main>
    </div>
  );
}
