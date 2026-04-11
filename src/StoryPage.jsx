import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import { useAuth } from "./AuthContext";
import AuthModal from "./AuthModal";

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

function timeAgoFull(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export default function StoryPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [article, setArticle] = useState(() => {
    try {
      const c = sessionStorage.getItem("htn-curated-cache");
      if (!c) return null;
      return JSON.parse(c).find(a => a.id === decodeURIComponent(storyId)) || null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(() => !sessionStorage.getItem("htn-curated-cache"));
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("htn-curated-cache")) return;
    fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_KEY },
    })
      .then(r => r.json())
      .then(data => {
        const articles = data.record?.articles || [];
        sessionStorage.setItem("htn-curated-cache", JSON.stringify(articles));
        setArticle(articles.find(a => a.id === decodeURIComponent(storyId)) || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [storyId]);

  const articleUrl = article?.link || decodeURIComponent(storyId);

  // Update OG / Twitter meta tags when the article is available
  useEffect(() => {
    if (!article) return;

    const canonicalUrl = `https://holdthenorth.news/story/${encodeURIComponent(article.id)}`;
    const desc = stripHtml(article.description || "");

    const prev = {
      title:        document.title,
      description:  document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
      ogTitle:      document.querySelector('meta[property="og:title"]')?.getAttribute("content") || "",
      ogDesc:       document.querySelector('meta[property="og:description"]')?.getAttribute("content") || "",
      ogImage:      document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "",
      ogUrl:        document.querySelector('meta[property="og:url"]')?.getAttribute("content") || "",
      twTitle:      document.querySelector('meta[name="twitter:title"]')?.getAttribute("content") || "",
      twDesc:       document.querySelector('meta[name="twitter:description"]')?.getAttribute("content") || "",
      twImage:      document.querySelector('meta[name="twitter:image"]')?.getAttribute("content") || "",
      twCard:       document.querySelector('meta[name="twitter:card"]')?.getAttribute("content") || "",
    };

    const set = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };

    document.title = `${article.title} — Hold the North`;
    set('meta[name="description"]',          "content", desc);
    set('meta[property="og:title"]',         "content", article.title);
    set('meta[property="og:description"]',   "content", desc);
    set('meta[property="og:url"]',           "content", canonicalUrl);
    set('meta[name="twitter:title"]',        "content", article.title);
    set('meta[name="twitter:description"]',  "content", desc);
    set('meta[name="twitter:card"]',         "content", "summary_large_image");
    if (article.image) {
      set('meta[property="og:image"]',       "content", article.image);
      set('meta[name="twitter:image"]',      "content", article.image);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", canonicalUrl);

    return () => {
      document.title = prev.title;
      set('meta[name="description"]',          "content", prev.description);
      set('meta[property="og:title"]',         "content", prev.ogTitle);
      set('meta[property="og:description"]',   "content", prev.ogDesc);
      set('meta[property="og:image"]',         "content", prev.ogImage);
      set('meta[property="og:url"]',           "content", prev.ogUrl);
      set('meta[name="twitter:title"]',        "content", prev.twTitle);
      set('meta[name="twitter:description"]',  "content", prev.twDesc);
      set('meta[name="twitter:image"]',        "content", prev.twImage);
      set('meta[name="twitter:card"]',         "content", prev.twCard);
      if (canonical) canonical.setAttribute("href", "https://holdthenorth.news/");
    };
  }, [article]);

  useEffect(() => {
    if (!articleUrl) return;
    setCommentsLoading(true);
    supabase
      .from("Comments")
      .select("id, content, created_at, user_id, profiles(username)")
      .eq("article_url", articleUrl)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setComments(data);
        setCommentsLoading(false);
      });
  }, [articleUrl]);

  async function submitComment() {
    if (!commentText.trim()) return;
    setCommentError("");
    setSubmitting(true);
    const content = commentText.trim();
    const { error } = await supabase
      .from("Comments")
      .insert({ user_id: user.id, article_url: articleUrl, content });
    setSubmitting(false);
    if (error) {
      console.error("Comment insert error:", error);
      setCommentError(`Failed to post comment: ${error.message}`);
      return;
    }
    setComments(prev => [{
      id: `optimistic-${Date.now()}`,
      content,
      created_at: new Date().toISOString(),
      user_id: user.id,
      profiles: { username: profile?.username || user.email.split("@")[0] },
    }, ...prev]);
    setCommentText("");
  }

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
            {/* YOUTUBE PLAYER or IMAGE */}
            {article.ytId ? (
              <div style={{ marginBottom: "2rem", borderRadius: "4px", overflow: "hidden", position: "relative", paddingTop: "56.25%" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${article.ytId}`}
                  title={article.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                />
              </div>
            ) : article.image ? (
              <div style={{ marginBottom: "2rem", borderRadius: "4px", overflow: "hidden" }}>
                <img src={article.image} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", maxHeight: "480px", objectFit: "cover", display: "block" }} />
              </div>
            ) : null}

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

            {/* WATCH / READ LINK */}
            <div style={{ marginBottom: "3rem" }}>
              {article.ytId ? (
                <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.grey, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = COLORS.white}
                  onMouseLeave={e => e.currentTarget.style.color = COLORS.grey}>
                  ↗ Watch on YouTube
                </a>
              ) : (
                <a href={article.link} target="_blank" rel="noopener noreferrer" className="read-orig">
                  Read Original Article →
                </a>
              )}
            </div>

            {/* SHARE */}
            {(() => {
              const su = window.location.href;
              const t  = encodeURIComponent(article.title);
              const u  = encodeURIComponent(su);
              const btns = [
                { label: "Bluesky",  color: "#0085ff", href: `https://bsky.app/intent/compose?text=${encodeURIComponent(article.title + " " + su)}`,  icon: <svg width="14" height="13" viewBox="0 0 360 320" fill="currentColor"><path d="M180 141.964C163.68 112.519 126.639 51.985 89.882 32.116 68.232 20.247 39.327 16.427 21.517 34.483 2.644 53.617 5.496 82.438 18.447 100.58c8.89 12.37 23.49 18.927 38.14 21.085-15.247 2.607-33.665 11.497-39.673 50.504-8.008 51.51 43.396 65.798 78.34 46.394C135.04 199.33 163.054 167.99 180 141.964z"/><path d="M180 141.964C196.32 112.519 233.361 51.985 270.118 32.116c21.65-11.869 50.555-15.689 68.365 2.367 18.873 19.134 16.021 47.955 3.07 66.097-8.89 12.37-23.49 18.927-38.14 21.085 15.247 2.607 33.665 11.497 39.673 50.504 8.008 51.51-43.396 65.798-78.34 46.394C224.96 199.33 196.946 167.99 180 141.964z"/></svg> },
                { label: "Facebook", color: "#1877f2", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,                                       icon: <svg width="11" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                { label: "X",        color: "#e8e8e8", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,                                     icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
              ];
              return (
                <div style={{ marginBottom: "2.5rem" }}>
                  <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.6rem", letterSpacing: "0.2em", color: COLORS.grey, textTransform: "uppercase", marginBottom: "0.65rem" }}>Share this story</p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {btns.map(({ label, color, href, icon }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.42rem 0.85rem", color: "#6A7A8A", border: "1px solid #1E2A3A", borderRadius: "3px", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", transition: "color 0.18s, border-color 0.18s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.borderColor = color; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#6A7A8A"; e.currentTarget.style.borderColor = "#1E2A3A"; }}
                      >{icon}{label}</a>
                    ))}
                  </div>
                </div>
              );
            })()}

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
                Discussion {!commentsLoading && comments.length > 0 && <span style={{ color: COLORS.red }}>({comments.length})</span>}
                <span style={{ flex: 1, height: 1, background: COLORS.border, display: "inline-block" }} />
              </p>

              {/* COMPOSE */}
              {user ? (
                <div style={{ marginBottom: "2rem" }}>
                  <textarea
                    className="comment-input"
                    placeholder="Share your thoughts…"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment(); }}
                  />
                  {commentError && (
                    <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.68rem", color: COLORS.red, letterSpacing: "0.06em", marginTop: "0.4rem" }}>{commentError}</p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
                    <button className="comment-submit" onClick={submitComment} disabled={submitting || !commentText.trim()} style={{ opacity: submitting || !commentText.trim() ? 0.5 : 1, cursor: submitting || !commentText.trim() ? "not-allowed" : "pointer" }}>
                      {submitting ? "Posting…" : "Post Comment"}
                    </button>
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.62rem", color: COLORS.grey, letterSpacing: "0.06em" }}>⌘↵ to submit</span>
                  </div>
                </div>
              ) : (
                <div style={{ background: COLORS.navyLight, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${COLORS.border}`, padding: "1rem 1.2rem", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "0.88rem", color: COLORS.grey, margin: 0 }}>Sign in to join the discussion.</p>
                  <button onClick={() => setShowAuthModal(true)} style={{ background: COLORS.red, border: "none", color: COLORS.white, padding: "0.5rem 1.1rem", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
                    Sign In
                  </button>
                </div>
              )}

              {/* COMMENTS LIST */}
              {commentsLoading ? (
                <div style={{ color: COLORS.grey, fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.75rem", letterSpacing: "0.08em", padding: "1rem 0" }}>Loading comments…</div>
              ) : comments.length === 0 ? (
                <div style={{ color: COLORS.grey, fontFamily: "'Source Serif 4',serif", fontSize: "0.88rem", fontStyle: "italic", padding: "1rem 0" }}>No comments yet. Be the first.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {comments.map((c, i) => (
                    <div key={c.id} style={{ padding: "1.1rem 0", borderTop: `1px solid ${COLORS.border}`, ...(i === comments.length - 1 ? { borderBottom: `1px solid ${COLORS.border}` } : {}) }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.55rem" }}>
                        <span style={{ width: 26, height: 26, borderRadius: "50%", background: COLORS.red, display: "inline-flex", alignItems: "center", justifyContent: "center", color: COLORS.white, fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                          {(c.profiles?.username || "?")?.[0]?.toUpperCase()}
                        </span>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.06em", color: COLORS.greyLight }}>
                          {c.profiles?.username || "Anonymous"}
                        </span>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.65rem", color: COLORS.grey, letterSpacing: "0.04em" }}>
                          {timeAgoFull(c.created_at)}
                        </span>
                      </div>
                      <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "0.92rem", color: COLORS.offWhite, lineHeight: 1.65, margin: 0, paddingLeft: "2rem" }}>
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

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
