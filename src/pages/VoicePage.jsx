import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { slugifyName } from "./VoicesPage";

const JSONBIN_ID = import.meta.env.VITE_JSONBIN_ID || "69ce762aaaba882197bac5e8";
const JSONBIN_KEY = import.meta.env.VITE_JSONBIN_KEY;
const RSS2JSON = `https://api.rss2json.com/v1/api.json?api_key=${import.meta.env.VITE_RSS2JSON_API_KEY || "exemphyhi6xvldxk8dmrtjpdrxxfrr2o0nnoau54"}&rss_url=`;

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
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,400&family=Barlow+Condensed:wght@400;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  .vp-back{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:${C.grey};text-decoration:none;display:inline-flex;align-items:center;gap:0.4rem;transition:color 0.2s}
  .vp-back:hover{color:${C.offWhite}}
  .vp-article{display:block;padding:0.9rem 0;border-bottom:1px solid ${C.border};text-decoration:none;transition:opacity 0.15s}
  .vp-article:last-child{border-bottom:none}
  .vp-article:hover .vp-atitle{color:${C.white}}
  .vp-atitle{font-family:'Playfair Display',serif;font-weight:700;font-size:1rem;color:${C.offWhite};line-height:1.3;margin-bottom:0.3rem;transition:color 0.2s}
  .vp-adesc{font-family:'Source Serif 4',serif;font-size:0.84rem;color:${C.grey};line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .vp-ameta{font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;letter-spacing:0.07em;color:${C.grey};margin-bottom:0.25rem}
`;

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

export default function VoicePage() {
  const { slug } = useParams();

  const [voices, setVoices] = useState(() => {
    try { const v = sessionStorage.getItem("htn-voices-cache"); return v ? JSON.parse(v) : []; } catch { return []; }
  });
  const [voicesLoading, setVoicesLoading] = useState(!sessionStorage.getItem("htn-voices-cache"));
  const [articles, setArticles] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState(null);

  const voice = voices.find(v => slugifyName(v.name) === slug);

  // Load voices from JSONBin if not cached
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
        setVoicesLoading(false);
      })
      .catch(() => setVoicesLoading(false));
  }, []);

  // SEO meta tags
  useEffect(() => {
    if (!voice) return;
    const prevTitle = document.title;
    const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    const setMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute("content", val); };

    document.title = `${voice.name} — Voices — Hold the North`;
    const desc = voice.metaDescription || voice.bio?.slice(0, 160) || `${voice.name} featured on Hold the North — independent Canadian journalism.`;
    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', `${voice.name} — Hold the North`);
    setMeta('meta[property="og:description"]', desc);

    if (voice.keywords) {
      let kw = document.querySelector('meta[name="keywords"]');
      if (!kw) { kw = document.createElement("meta"); kw.setAttribute("name", "keywords"); document.head.appendChild(kw); }
      kw.setAttribute("content", voice.keywords);
    }

    return () => {
      document.title = prevTitle;
      setMeta('meta[name="description"]', prevDesc);
    };
  }, [voice]);

  // Load feed articles for this voice
  useEffect(() => {
    if (!voice?.feedUrl) return;
    setFeedLoading(true);
    setFeedError(null);

    async function load() {
      try {
        let items = [];
        if (voice.feedUrl.includes("substack.com")) {
          const res = await fetch(`/.netlify/functions/rss-proxy?url=${encodeURIComponent(voice.feedUrl)}`);
          if (!res.ok) throw new Error(`proxy ${res.status}`);
          const xml = await res.text();
          const doc = new DOMParser().parseFromString(xml, "text/xml");
          if (doc.querySelector("parsererror")) throw new Error("XML parse error");
          const getText = (el, tag) => el.getElementsByTagName(tag)[0]?.textContent?.trim() || "";
          items = Array.from(doc.getElementsByTagName("item")).slice(0, 12).map(item => {
            const link = getText(item, "link") || getText(item, "guid");
            const rawDesc = getText(item, "description");
            const enclosure = item.getElementsByTagName("enclosure")[0];
            return {
              title: getText(item, "title"),
              link,
              pubDate: getText(item, "pubDate"),
              description: rawDesc.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 200),
              image: enclosure?.getAttribute("url") || null,
            };
          }).filter(a => a.title && a.link);
        } else {
          const res = await fetch(`${RSS2JSON}${encodeURIComponent(voice.feedUrl)}&count=12`);
          const data = await res.json();
          if (!data.items) throw new Error("No items");
          items = data.items.map(item => ({
            title: item.title || "",
            link: item.link || item.guid || "",
            pubDate: item.pubDate || "",
            description: (typeof item.description === "string" ? item.description : "")
              .replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 200),
            image: typeof item.thumbnail === "string" ? item.thumbnail : null,
          })).filter(a => a.title && a.link);
        }
        setArticles(items);
      } catch (err) {
        setFeedError("Could not load articles from this feed.");
      } finally {
        setFeedLoading(false);
      }
    }

    load();
  }, [voice?.feedUrl]);

  if (voicesLoading) {
    return (
      <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{STYLES}</style>
        <p style={{ color: C.grey, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.1em" }}>Loading…</p>
      </div>
    );
  }

  if (!voice) {
    return (
      <div style={{ minHeight: "100vh", background: C.navy, color: C.offWhite, fontFamily: "Georgia, serif" }}>
        <style>{STYLES}</style>
        <div style={{ background: C.navyMid, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "0.75rem 1.2rem" }}>
            <Link to="/voices" className="vp-back">← Voices</Link>
          </div>
        </div>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "5rem 1.2rem", textAlign: "center" }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "1.2rem", color: C.grey, marginBottom: "1.5rem" }}>Voice not found.</p>
          <Link to="/voices" className="vp-back">← Back to Voices</Link>
        </div>
      </div>
    );
  }

  const bioDisplay = voice.bio
    ? voice.bio.replace(new RegExp(`^${voice.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s,.:—\\-–]*`, 'i'), '').trim()
    : "";

  return (
    <div style={{ minHeight: "100vh", background: C.navy, color: C.offWhite, fontFamily: "Georgia, serif" }}>
      <style>{STYLES}</style>

      {/* Nav bar */}
      <div style={{ background: C.navyMid, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0.75rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/voices" className="vp-back">← Voices</Link>
          <img src="/htncrop.png" alt="HTN" style={{ height: 30, cursor: "pointer" }} onClick={() => window.location.href = "/"} />
        </div>
      </div>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.2rem 5rem" }}>

        {/* Profile header */}
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap" }}>
          {voice.photo ? (
            <img src={voice.photo} alt={voice.photoAlt || voice.name}
              onError={e => { e.target.style.display = "none"; }}
              style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `3px solid ${C.border}` }} />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: C.navyLight, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.grey, fontSize: "2.5rem", border: `3px solid ${C.border}` }}>👤</div>
          )}
          <div style={{ flex: 1, minWidth: 240 }}>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.25em", color: C.red, textTransform: "uppercase", marginBottom: "0.4rem" }}>Featured Voice</p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: C.white, lineHeight: 1.1, marginBottom: "0.8rem" }}>{voice.name}</h1>
            {bioDisplay && (
              <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1rem", color: C.greyLight, lineHeight: 1.7 }}>{bioDisplay}</p>
            )}
          </div>
        </div>

        {/* Why HTN features them */}
        {voice.whyHTN && (
          <div style={{ borderLeft: `3px solid rgba(200,16,46,0.5)`, paddingLeft: "1.1rem", marginBottom: "2.5rem" }}>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.2em", color: C.red, textTransform: "uppercase", marginBottom: "0.4rem" }}>Why HTN features them</p>
            <p style={{ fontFamily: "'Source Serif 4',serif", fontStyle: "italic", fontSize: "0.95rem", color: C.grey, lineHeight: 1.7, margin: 0 }}>{voice.whyHTN}</p>
          </div>
        )}

        <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: "2rem" }} />

        {/* Articles feed */}
        <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.22em", color: C.grey, textTransform: "uppercase", marginBottom: "1.25rem" }}>
          Latest from {voice.name}
        </p>

        {feedLoading && (
          <p style={{ color: C.grey, fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em" }}>Loading articles…</p>
        )}
        {feedError && (
          <p style={{ color: C.grey, fontFamily: "'Source Serif 4',serif", fontSize: "0.88rem", fontStyle: "italic" }}>{feedError}</p>
        )}
        {!feedLoading && !feedError && articles.length === 0 && (
          <p style={{ color: C.grey, fontFamily: "'Source Serif 4',serif", fontSize: "0.88rem", fontStyle: "italic" }}>No articles found.</p>
        )}
        {!feedLoading && articles.map((a, i) => (
          <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" className="vp-article">
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              {a.image && (
                <img src={a.image} alt="" onError={e => { e.target.style.display = "none"; }}
                  style={{ width: 72, height: 52, objectFit: "cover", borderRadius: "3px", flexShrink: 0, marginTop: "0.15rem" }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="vp-ameta">{timeAgo(a.pubDate)}</div>
                <div className="vp-atitle">{a.title}</div>
                {a.description && <div className="vp-adesc">{a.description}</div>}
              </div>
            </div>
          </a>
        ))}

        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: "3rem", paddingTop: "1.5rem" }}>
          <Link to="/voices" className="vp-back">← Back to Voices</Link>
        </div>
      </main>
    </div>
  );
}
