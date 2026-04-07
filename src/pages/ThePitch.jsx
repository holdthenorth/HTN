import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const JSONBIN_ID = import.meta.env.VITE_JSONBIN_ID;
const JSONBIN_KEY = import.meta.env.VITE_JSONBIN_KEY;

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

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,400&family=Barlow+Condensed:wght@400;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  .tp-back{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:${C.grey};text-decoration:none;display:inline-flex;align-items:center;gap:0.4rem;transition:color 0.2s}
  .tp-back:hover{color:${C.offWhite}}
  .tp-card{background:${C.navyLight};border:1px solid ${C.border};border-radius:6px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;transition:border-color 0.2s,transform 0.2s}
  .tp-card:hover{border-color:rgba(200,16,46,0.45);transform:translateY(-2px)}
  .tp-card:hover .tp-card-title{color:${C.white}}
  .tp-card-title{font-family:'Playfair Display',serif;font-weight:700;font-size:1.05rem;color:${C.offWhite};line-height:1.3;transition:color 0.2s}
  .tp-body p{font-family:'Source Serif 4',serif;font-size:1.05rem;color:${C.greyLight};line-height:1.85;margin-bottom:1.4rem}
  .tp-body p:last-child{margin-bottom:0}
  .tp-body strong{color:${C.white};font-weight:600}
  .tp-body em{font-style:italic}
  .tp-body a{color:${C.red};text-decoration:underline;text-underline-offset:3px}
  .tp-body a:hover{color:#e04060}
`;

/* Minimal markdown renderer: **bold**, *italic*, [text](url), blank-line = new paragraph */
function renderBody(text) {
  if (!text) return null;
  return text.split(/\n\n+/).map((para, i) => {
    const html = para
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, "<br />");
    return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

function usePitchPosts() {
  const [posts, setPosts] = useState(() => {
    try { const c = sessionStorage.getItem("htn-pitch-cache"); return c ? JSON.parse(c) : null; } catch { return null; }
  });
  const [loading, setLoading] = useState(posts === null);

  useEffect(() => {
    if (posts !== null) return;
    fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_KEY },
    })
      .then(r => r.json())
      .then(data => {
        const p = data.record?.pitchPosts || [];
        sessionStorage.setItem("htn-pitch-cache", JSON.stringify(p));
        setPosts(p);
        setLoading(false);
      })
      .catch(() => { setPosts([]); setLoading(false); });
  }, []);

  return { posts: posts || [], loading };
}

/* ── INDEX PAGE ── */
export function ThePitchIndex() {
  const { posts, loading } = usePitchPosts();

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.offWhite, fontFamily: "Georgia, serif" }}>
      <style>{STYLES}</style>

      <div style={{ background: C.navyMid, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0.75rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" className="tp-back">← holdthenorth.news</Link>
          <img src="/htncrop.png" alt="HTN" style={{ height: 30 }} />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.2rem 1.5rem" }}>
        <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.25em", color: C.red, textTransform: "uppercase", marginBottom: "0.6rem" }}>HTN Original</p>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(2rem,5vw,3rem)", color: C.white, lineHeight: 1.1, marginBottom: "0.75rem" }}>The Pitch</h1>
        <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1rem", color: C.grey, lineHeight: 1.7, maxWidth: 560 }}>
          Original commentary, analysis, and long-form writing from the HTN editorial team.
        </p>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem 1.2rem 5rem" }}>
        {loading ? (
          <div style={{ padding: "5rem", textAlign: "center", color: C.grey, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>Loading…</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: "5rem", textAlign: "center", color: C.grey, fontFamily: "'Source Serif 4',serif", fontSize: "1rem", fontStyle: "italic" }}>No posts yet — check back soon.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {posts.map(post => (
              <Link key={post.id} to={`/the-pitch/${post.slug}`} className="tp-card">
                {post.photo && (
                  <img src={post.photo} alt="" onError={e => e.target.style.display = "none"}
                    style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                )}
                <div style={{ padding: "1.1rem", display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ background: C.red, color: C.white, fontSize: "0.58rem", padding: "0.15rem 0.45rem", borderRadius: "3px", letterSpacing: "0.12em", fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif" }}>THE PITCH</span>
                    {post.publishedAt && (
                      <span style={{ color: C.grey, fontSize: "0.68rem", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.05em" }}>
                        {new Date(post.publishedAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </div>
                  <div className="tp-card-title">{post.title}</div>
                  {post.byline && (
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.7rem", letterSpacing: "0.08em", color: C.grey }}>{post.byline}</div>
                  )}
                  {post.body && (
                    <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "0.84rem", color: C.grey, lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {post.body.replace(/\*\*?|__?|\[([^\]]+)\]\([^)]+\)/g, "$1")}
                    </p>
                  )}
                  <div style={{ marginTop: "auto", paddingTop: "0.5rem", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.12em", color: C.red }}>
                    Read More →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── SINGLE POST PAGE ── */
export function ThePitchPost() {
  const { slug } = useParams();
  const { posts, loading } = usePitchPosts();
  const post = posts.find(p => p.slug === slug);

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.offWhite, fontFamily: "Georgia, serif" }}>
      <style>{STYLES}</style>

      <div style={{ background: C.navyMid, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0.75rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/the-pitch" className="tp-back">← The Pitch</Link>
          <img src="/htncrop.png" alt="HTN" style={{ height: 30, cursor: "pointer" }} onClick={() => window.location.href = "/"} />
        </div>
      </div>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.2rem 5rem" }}>
        {loading ? (
          <div style={{ padding: "5rem", textAlign: "center", color: C.grey, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>Loading…</div>
        ) : !post ? (
          <div style={{ padding: "5rem", textAlign: "center" }}>
            <p style={{ color: C.grey, fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "1.2rem", marginBottom: "1.5rem" }}>Post not found.</p>
            <Link to="/the-pitch" className="tp-back">← Back to The Pitch</Link>
          </div>
        ) : (
          <>
            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
              <span style={{ background: C.red, color: C.white, fontSize: "0.6rem", padding: "0.2rem 0.55rem", borderRadius: "3px", letterSpacing: "0.14em", fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif" }}>THE PITCH</span>
              {post.publishedAt && (
                <span style={{ color: C.grey, fontSize: "0.72rem", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.06em" }}>
                  {new Date(post.publishedAt).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: C.white, lineHeight: 1.15, marginBottom: "1rem" }}>
              {post.title}
            </h1>

            {/* Byline */}
            {post.byline && (
              <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 600, fontSize: "0.82rem", letterSpacing: "0.1em", color: C.grey, marginBottom: "1.75rem", textTransform: "uppercase" }}>
                {post.byline}
              </p>
            )}

            {/* Hero photo */}
            {post.photo && (
              <img src={post.photo} alt="" onError={e => e.target.style.display = "none"}
                style={{ width: "100%", maxHeight: 460, objectFit: "cover", display: "block", borderRadius: "4px", marginBottom: "2rem" }} />
            )}

            <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: "2rem" }} />

            {/* Body */}
            <div className="tp-body">{renderBody(post.body)}</div>

            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: "3rem", paddingTop: "1.5rem" }}>
              <Link to="/the-pitch" className="tp-back">← Back to The Pitch</Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
