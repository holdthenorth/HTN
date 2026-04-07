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
  .ab-back{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:${C.grey};text-decoration:none;display:inline-flex;align-items:center;gap:0.4rem;transition:color 0.2s}
  .ab-back:hover{color:${C.offWhite}}
  .ab-body p{font-family:'Source Serif 4',serif;font-size:1.05rem;color:${C.greyLight};line-height:1.85;margin-bottom:1.4rem}
  .ab-body p:last-child{margin-bottom:0}
  .ab-body strong{color:${C.white};font-weight:600}
  .ab-body a{color:${C.red};text-decoration:underline;text-underline-offset:3px}
  .ab-body a:hover{color:#e04060}
  .ab-divider{border:none;border-top:1px solid ${C.border};margin:2.5rem 0}
  .ab-label{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.62rem;letter-spacing:0.22em;text-transform:uppercase;color:${C.red};margin-bottom:0.6rem}
  .ab-h2{font-family:'Playfair Display',serif;font-weight:700;font-size:1.5rem;color:${C.white};margin-bottom:1rem;line-height:1.25}
  .ab-principle{background:${C.navyLight};border:1px solid ${C.border};border-left:3px solid ${C.red};padding:1.2rem 1.4rem;margin-bottom:0.9rem}
  .ab-principle-title{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;color:${C.white};margin-bottom:0.4rem}
  .ab-principle-body{font-family:'Source Serif 4',serif;font-size:0.9rem;color:${C.grey};line-height:1.65}
`;

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.offWhite, fontFamily: "Georgia, serif" }}>
      <style>{CSS}</style>

      {/* Top bar */}
      <div style={{ background: C.navyMid, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0.75rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" className="ab-back">← holdthenorth.news</Link>
          <img src="/htncrop.png" alt="HTN" style={{ height: 30 }} />
        </div>
      </div>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 1.2rem 5rem" }}>

        {/* Hero */}
        <div className="ab-label">About HTN</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(2rem,5vw,3rem)", color: C.white, lineHeight: 1.1, marginBottom: "1rem" }}>
          Signal Over Noise.
        </h1>
        <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1.1rem", color: C.grey, lineHeight: 1.75, maxWidth: 620, marginBottom: "2.5rem" }}>
          Hold the North is an independent Canadian news platform built on one conviction: Canadians deserve journalism that holds power to account — without corporate interference, without partisan drift.
        </p>

        <hr className="ab-divider" />

        {/* Mission */}
        <div className="ab-body" style={{ maxWidth: 680 }}>
          <p>
            We launched HTN because the Canadian media landscape has too often defaulted to reaction over investigation, access journalism over accountability, and algorithm-friendly takes over substantive coverage.
          </p>
          <p>
            <strong>HTN is different.</strong> We curate and commission coverage that goes deep — politics, civil liberties, on-the-ground reporting, and the voices that don't get platform time anywhere else.
          </p>
          <p>
            We are editorially independent. We have no parent company. We take no advertising from government or corporate sources that create conflicts with our coverage. Our independence is our product.
          </p>
        </div>

        <hr className="ab-divider" />

        {/* Editorial principles */}
        <div className="ab-label" style={{ marginBottom: "0.6rem" }}>Editorial Principles</div>
        <h2 className="ab-h2">How We Work</h2>

        <div className="ab-principle">
          <div className="ab-principle-title">Independence First</div>
          <div className="ab-principle-body">We accept no government grants, no corporate advertising, and no institutional funding that creates editorial obligations. Our coverage is guided by public interest alone.</div>
        </div>
        <div className="ab-principle">
          <div className="ab-principle-title">Accuracy Over Speed</div>
          <div className="ab-principle-body">We do not publish to win the news cycle. We publish when we're confident. Corrections are issued prominently and without hedging.</div>
        </div>
        <div className="ab-principle">
          <div className="ab-principle-title">Source Transparency</div>
          <div className="ab-principle-body">When we rely on anonymous sources, we say so and explain why. We tell readers what we know, what we don't know, and where our information comes from.</div>
        </div>
        <div className="ab-principle">
          <div className="ab-principle-title">Platform for Independent Voices</div>
          <div className="ab-principle-body">Through our Voices and The Pitch sections, we give space to Canadian journalists, analysts, and community members doing serious work — not just those with institutional backing.</div>
        </div>

        <hr className="ab-divider" />

        {/* Contact */}
        <div className="ab-label">Get in Touch</div>
        <h2 className="ab-h2">Contact HTN</h2>
        <div className="ab-body" style={{ maxWidth: 680 }}>
          <p>
            For editorial inquiries, tip submissions, partnership requests, or press contact, visit our <Link to="/submit">Submit Your Work</Link> page or reach us at <a href="mailto:editor@holdthenorth.news">editor@holdthenorth.news</a>.
          </p>
          <p>
            For advertising and sponsorship, see our <Link to="/media-kit">Media Kit</Link>.
          </p>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: "3rem", paddingTop: "1.5rem" }}>
          <Link to="/" className="ab-back">← Back to News</Link>
        </div>

      </main>
    </div>
  );
}
