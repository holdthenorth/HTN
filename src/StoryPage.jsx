import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const JSONBIN_ID = import.meta.env.VITE_JSONBIN_ID;
const JSONBIN_KEY = import.meta.env.VITE_JSONBIN_KEY;

const COLORS = {
  red: "#C8102E",
  navy: "#0D1117",
  navyMid: "#131920",
  navyLight: "#1A2332",
  white: "#FFFFFF",
  offWhite: "#F0EDE8",
  grey: "#8A8F98",
  greyLight: "#B8BCC4",
  border: "#1E2A3A",
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function stripHtml(str) {
  return str ? str.replace(/<[^>]*>/g, "") : "";
}

export default function StoryPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_KEY },
    })
      .then(r => r.json())
      .then(data => {
        const articles = data.record?.articles || [];
        const found = articles.find(a => a.id === decodeURIComponent(storyId));
        setArticle(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [storyId]);

  const isYT = url => url && (url.includes("youtube.com") || url.includes("youtu.be"));

  return (
    <div style={{ minHeight: "100vh", background: COLORS.navy, color: COLORS.offWhite, fontFamily: "Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,400&family=Barlow+Condensed:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .back-btn{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:#8A8F98;background:none;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:0.4rem;padding:0;transition:color 0.2s}
        .back-btn:hover{color:#F0EDE8}
        .read-orig{display:inline-flex;align-items:center;gap:0.5rem;background:#C8102E;color:#fff;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.78rem;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;padding:0.75rem 1.6rem;transition:background 0.2s}
        .read-orig:hover{background:#A00D24}
        .comment-input{width:100%;background:#131920;border:1px solid #1E2A3A;color:#F0EDE8;padding:0.75rem 1rem;font-family:'Source Serif 4',Georgia,serif;font-size:0.92rem;outline:none;resize:vertical;min-height:90px;transition:border-color 0.2s}
        .comment-input:focus{border-color:rgba(200,16,46,0.5)}
        .comment-submit{background:#C8102E;border:none;color:#fff;padding:0.6rem 1.4rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.75rem;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;transition:background 0.2s;margin-top:0.5rem}
        .comment-submit:hover{background:#A00D24}
      `}</style>

      {/* HEADER BAR */}
      <div style={{ background: COLORS.navyMid, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0.75rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button className="back-btn" onClick={() => navigate("/")}>← Back to HTN</button>
          <img src="/htncrop.png" alt="HTN News Canada" style={{ height: "32px", cursor: "pointer" }} onClick={() => navigate("/")} />
        </div>
      </div>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.2rem 5rem" }}>
        {loading ? (
          <div style={{ padding: "5rem", textAlign: "center", color: COLORS.grey, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>Loading…</div>
        ) : !article ? (
          <div style={{ padding: "5rem", textAlign: "center" }}>
            <p style={{ color: COLORS.grey, fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "1.2rem", marginBottom: "1.5rem" }}>Story not found.</p>
            <button className="back-btn" onClick={() => navigate("/")}>← Back to HTN</button>
          </div>
        ) : (
          <>
            {/* IMAGE */}
            {article.image && (
              <div style={{ marginBottom: "2rem", borderRadius: "4px", overflow: "hidden" }}>
                <img src={article.image} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", maxHeight: "480px", objectFit: "cover", display: "block" }} />
              </div>
            )}

            {/* SOURCE + META */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
              <span style={{ background: COLORS.red, color: COLORS.white, fontSize: "0.65rem", padding: "0.2rem 0.6rem", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: "uppercase" }}>{article.source}</span>
              {isYT(article.link) && <span style={{ background: "#FF000018", color: "#FF5555", fontSize: "0.65rem", padding: "0.2rem 0.6rem", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}>▶ VIDEO</span>}
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.72rem", color: COLORS.grey, letterSpacing: "0.06em" }}>{timeAgo(article.pubDate)}</span>
            </div>

            {/* HEADLINE */}
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(1.7rem, 4vw, 2.6rem)", color: COLORS.white, lineHeight: 1.15, marginBottom: "1.5rem" }}>{article.title}</h1>

            {/* EXCERPT */}
            {article.description && (
              <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1.05rem", color: COLORS.greyLight, lineHeight: 1.75, marginBottom: "2rem", borderLeft: `3px solid ${COLORS.border}`, paddingLeft: "1.1rem" }}>
                {stripHtml(article.description)}
              </p>
            )}

            {/* READ ORIGINAL */}
            <div style={{ marginBottom: "3rem" }}>
              <a href={article.link} target="_blank" rel="noopener noreferrer" className="read-orig">
                {isYT(article.link) ? "▶ Watch on YouTube" : "Read Original Article"} →
              </a>
            </div>

            {/* DIVIDER */}
            <div style={{ borderTop: `1px solid ${COLORS.border}`, marginBottom: "2.5rem" }} />

            {/* CURATOR NOTE */}
            {article.curatorNote && (
              <div style={{ background: COLORS.navyLight, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${COLORS.red}`, padding: "1.4rem 1.6rem", marginBottom: "3rem" }}>
                <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.2em", color: COLORS.red, textTransform: "uppercase", marginBottom: "0.6rem" }}>HTN Curator's Note</p>
                <p style={{ fontFamily: "'Source Serif 4',serif", fontStyle: "italic", fontSize: "0.95rem", color: COLORS.grey, lineHeight: 1.7 }}>
                  {article.curatorNote}
                </p>
              </div>
            )}

            {/* COMMENT SECTION */}
            <div>
              <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.22em", color: COLORS.grey, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
                Discussion
                <span style={{ flex: 1, height: 1, background: COLORS.border, display: "inline-block" }} />
              </p>

              <div style={{ marginBottom: "1.5rem" }}>
                <textarea className="comment-input" placeholder="Share your thoughts…" disabled />
                <div>
                  <button className="comment-submit" disabled>Post Comment</button>
                </div>
              </div>

              <div style={{ background: COLORS.navyLight, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "2.5rem", textAlign: "center" }}>
                <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em", color: COLORS.grey, textTransform: "uppercase" }}>Comments coming soon</p>
                <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "0.88rem", color: "#3A4A5A", marginTop: "0.5rem" }}>Community discussion will be available in an upcoming update.</p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${COLORS.border}`, background: COLORS.navyMid }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.8rem" }}>
          <img src="/htncrop.png" alt="HTN News Canada" style={{ height: "30px", cursor: "pointer" }} onClick={() => navigate("/")} />
          <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: "#3A4A5A", textTransform: "uppercase" }}>Independent · Curated · Canadian · © 2025</span>
        </div>
      </footer>
    </div>
  );
}
