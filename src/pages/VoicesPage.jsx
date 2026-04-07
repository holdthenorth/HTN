import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const JSONBIN_ID = import.meta.env.VITE_JSONBIN_ID;
const JSONBIN_KEY = import.meta.env.VITE_JSONBIN_KEY;
const RSS2JSON = `https://api.rss2json.com/v1/api.json?api_key=${import.meta.env.VITE_RSS2JSON_API_KEY}&rss_url=`;

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

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.replace(/\b(EDT|EST|CDT|CST|MDT|MST|PDT|PST)\b/, m =>
    ({ EDT:"-0400",EST:"-0500",CDT:"-0500",CST:"-0600",MDT:"-0600",MST:"-0700",PDT:"-0700",PST:"-0800" }[m])));
  if (isNaN(d)) return "";
  const diff = Math.floor((Date.now() - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export default function VoicesPage() {
  const [voices, setVoices] = useState(() => {
    try { const v = sessionStorage.getItem("htn-voices-cache"); return v ? JSON.parse(v) : []; } catch { return []; }
  });
  const [loading, setLoading] = useState(!sessionStorage.getItem("htn-voices-cache"));
  const [expanded, setExpanded] = useState(null);
  const [feedData, setFeedData] = useState({});

  useEffect(() => {
    if (sessionStorage.getItem("htn-voices-cache")) return;
    fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_KEY },
    })
      .then(r => r.json())
      .then(data => {
        const v = data.record?.voices || [];
        sessionStorage.setItem("htn-voices-cache", JSON.stringify(v));
        setVoices(v);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleExpand(voice) {
    if (expanded === voice.id) { setExpanded(null); return; }
    setExpanded(voice.id);
    if (feedData[voice.id]) return;
    setFeedData(prev => ({ ...prev, [voice.id]: { loading: true, articles: [], error: null } }));
    try {
      const res = await fetch(`${RSS2JSON}${encodeURIComponent(voice.feedUrl)}&count=10`);
      const data = await res.json();
      if (!data.items) throw new Error("No items");
      const articles = data.items.map(item => ({
        title: item.title || "",
        link: item.link || item.guid || "",
        pubDate: item.pubDate || "",
        description: (typeof item.description === "string" ? item.description : "")
          .replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 140),
        image: typeof item.thumbnail === "string" ? item.thumbnail : null,
      }));
      setFeedData(prev => ({ ...prev, [voice.id]: { loading: false, articles, error: null } }));
    } catch {
      setFeedData(prev => ({ ...prev, [voice.id]: { loading: false, articles: [], error: "Could not load feed." } }));
    }
  }

  const expandedVoice = voices.find(v => v.id === expanded);
  const expandedFeed = expanded ? feedData[expanded] : null;

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.offWhite, fontFamily: "Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,400&family=Barlow+Condensed:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .vp-back{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:${C.grey};text-decoration:none;display:inline-flex;align-items:center;gap:0.4rem;transition:color 0.2s}
        .vp-back:hover{color:${C.offWhite}}
        .vp-card{background:${C.navyLight};border:1px solid ${C.border};border-radius:6px;overflow:hidden;display:flex;flex-direction:column;transition:border-color 0.2s}
        .vp-card:hover{border-color:rgba(200,16,46,0.4)}
        .vp-toggle{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:${C.red};background:none;border:none;cursor:pointer;padding:0;text-align:left;margin-top:0.75rem;display:inline-flex;align-items:center;gap:0.3rem}
        .vp-article{display:block;padding:0.85rem 0;border-bottom:1px solid ${C.border};text-decoration:none;transition:background 0.15s}
        .vp-article:last-child{border-bottom:none}
        .vp-article:hover .vp-atitle{color:${C.white}}
        .vp-atitle{font-family:'Playfair Display',serif;font-weight:700;font-size:0.95rem;color:${C.offWhite};line-height:1.3;margin-bottom:0.3rem;transition:color 0.2s}
        .vp-adesc{font-family:'Source Serif 4',serif;font-size:0.82rem;color:${C.grey};line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .vp-ameta{font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;letter-spacing:0.07em;color:${C.grey};margin-bottom:0.25rem}
      `}</style>

      {/* Back bar */}
      <div style={{ background: C.navyMid, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0.75rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" className="vp-back">← holdthenorth.news</Link>
          <img src="/htncrop.png" alt="HTN" style={{ height: 30 }} />
        </div>
      </div>

      {/* Page header */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.2rem 1.5rem" }}>
        <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.25em", color: C.red, textTransform: "uppercase", marginBottom: "0.6rem" }}>Featured Voices</p>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(2rem,5vw,3rem)", color: C.white, lineHeight: 1.1, marginBottom: "0.75rem" }}>Voices</h1>
        <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1rem", color: C.grey, lineHeight: 1.7, maxWidth: 560 }}>
          Independent Canadian journalists and creators featured by HTN — the writers, reporters, and thinkers doing the work that matters.
        </p>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem 1.2rem 5rem" }}>
        {loading ? (
          <div style={{ padding: "5rem", textAlign: "center", color: C.grey, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>Loading…</div>
        ) : voices.length === 0 ? (
          <div style={{ padding: "5rem", textAlign: "center", color: C.grey, fontFamily: "'Source Serif 4',serif", fontSize: "1rem", fontStyle: "italic" }}>Voices coming soon.</div>
        ) : (
          <>
            {/* Voice grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
              {voices.map(voice => (
                <div key={voice.id} className="vp-card">
                  <div style={{ padding: "1.25rem" }}>
                    {/* Photo + name row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.9rem" }}>
                      {voice.photo ? (
                        <img src={voice.photo} alt={voice.name} onError={e => { e.target.style.display = "none"; }}
                          style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${C.border}` }} />
                      ) : (
                        <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.navyMid, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.grey, fontSize: "1.4rem", border: `2px solid ${C.border}` }}>👤</div>
                      )}
                      <div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.05rem", color: C.white, lineHeight: 1.2 }}>{voice.name}</div>
                      </div>
                    </div>

                    {/* Bio */}
                    {voice.bio && (
                      <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "0.88rem", color: C.greyLight, lineHeight: 1.65, marginBottom: "0.8rem" }}>{voice.bio}</p>
                    )}

                    {/* Why HTN note */}
                    {voice.whyHTN && (
                      <div style={{ borderLeft: `3px solid rgba(200,16,46,0.5)`, paddingLeft: "0.75rem", marginBottom: "0.5rem" }}>
                        <p style={{ fontFamily: "'Source Serif 4',serif", fontStyle: "italic", fontSize: "0.82rem", color: C.grey, lineHeight: 1.6, margin: 0 }}>{voice.whyHTN}</p>
                      </div>
                    )}

                    <button className="vp-toggle" onClick={() => handleExpand(voice)}>
                      {expanded === voice.id ? "Hide posts ↑" : "View latest posts →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Expanded articles panel — full width below grid */}
            {expandedVoice && (
              <div style={{ background: C.navyLight, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.red}`, borderRadius: "6px", padding: "1.5rem 1.75rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  {expandedVoice.photo && (
                    <img src={expandedVoice.photo} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                  )}
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", color: C.white, textTransform: "uppercase" }}>
                    Latest from {expandedVoice.name}
                  </span>
                  <button onClick={() => setExpanded(null)}
                    style={{ marginLeft: "auto", background: "transparent", border: `1px solid ${C.border}`, color: C.grey, padding: "0.2rem 0.6rem", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.7rem", letterSpacing: "0.06em", borderRadius: "3px" }}>
                    ✕ CLOSE
                  </button>
                </div>

                {expandedFeed?.loading && (
                  <div style={{ color: C.grey, fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em" }}>Loading posts…</div>
                )}
                {expandedFeed?.error && (
                  <div style={{ color: C.grey, fontFamily: "'Source Serif 4',serif", fontSize: "0.88rem", fontStyle: "italic" }}>{expandedFeed.error}</div>
                )}
                {expandedFeed && !expandedFeed.loading && !expandedFeed.error && expandedFeed.articles.length === 0 && (
                  <div style={{ color: C.grey, fontFamily: "'Source Serif 4',serif", fontSize: "0.88rem", fontStyle: "italic" }}>No posts found.</div>
                )}
                {expandedFeed && !expandedFeed.loading && expandedFeed.articles.map((a, i) => (
                  <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" className="vp-article">
                    <div className="vp-ameta">{timeAgo(a.pubDate)}</div>
                    <div className="vp-atitle">{a.title}</div>
                    {a.description && <div className="vp-adesc">{a.description}</div>}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
