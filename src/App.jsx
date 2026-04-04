const JSONBIN_ID = import.meta.env.VITE_JSONBIN_ID;
const JSONBIN_KEY = import.meta.env.VITE_JSONBIN_KEY;

import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import MapleLeafLoader from "./MapleLeafLoader";
import RSSDashboard from "./RSSDashboard";
const COLORS = {
  red: "#C8102E",
  redDark: "#A00D24",
  charcoal: "#2D2D2D",
  navy: "#0D1117",
  navyMid: "#131920",
  navyLight: "#1A2332",
  white: "#FFFFFF",
  offWhite: "#F0EDE8",
  grey: "#8A8F98",
  greyLight: "#B8BCC4",
  border: "#1E2A3A",
};

const CATEGORIES = [
  { id: "all", label: "All Stories", short: "All" },
  { id: "canadian-politics", label: "Canadian Politics", short: "Politics", color: "#C8102E" },
  { id: "geopolitical-watch", label: "Geopolitical Watch", short: "Geopolitical", color: "#1A6FC4" },
  { id: "curated-voices", label: "Curated Voices", short: "Voices", color: "#2A9C6F" },
];

const TICKER_ITEMS = [
  "Federal election campaign underway — HTN is watching",
  "Canada-US trade tensions escalate",
  "Independent journalists need your support",
  "HTN News Canada — Signal over noise",
  "Add HTN to your home screen for instant updates",
];


const ADMIN_PW = "holdthenorth";

function HTNLogo({ height = 52 }) {
  const scale = height / 80;
  return (
    <svg height={height} viewBox="0 0 380 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform={`translate(2, 2) scale(${72/80})`}>
        <ellipse cx="38" cy="73" rx="3.5" ry="5" fill="#C8102E"/>
        <ellipse cx="38" cy="62" rx="9" ry="6" fill="#C8102E"/>
        <ellipse cx="22" cy="58" rx="7" ry="5" fill="#C8102E" transform="rotate(40 22 58)"/>
        <ellipse cx="54" cy="58" rx="7" ry="5" fill="#C8102E" transform="rotate(-40 54 58)"/>
        <ellipse cx="12" cy="44" rx="8" ry="5.5" fill="#C8102E" transform="rotate(60 12 44)"/>
        <ellipse cx="64" cy="44" rx="8" ry="5.5" fill="#C8102E" transform="rotate(-60 64 44)"/>
        <ellipse cx="18" cy="28" rx="9" ry="5.5" fill="#C8102E" transform="rotate(35 18 28)"/>
        <ellipse cx="58" cy="28" rx="9" ry="5.5" fill="#C8102E" transform="rotate(-35 58 28)"/>
        <ellipse cx="28" cy="16" rx="8" ry="5" fill="#C8102E" transform="rotate(15 28 16)"/>
        <ellipse cx="48" cy="16" rx="8" ry="5" fill="#C8102E" transform="rotate(-15 48 16)"/>
        <ellipse cx="38" cy="10" rx="6" ry="12" fill="#C8102E"/>
        <rect x="34" y="10" width="8" height="55" fill="#C8102E"/>
        <line x1="5" y1="52" x2="71" y2="52" stroke="#0D1117" strokeWidth="1.8"/>
        <line x1="8" y1="38" x2="68" y2="38" stroke="#0D1117" strokeWidth="1.8"/>
        <line x1="14" y1="24" x2="62" y2="24" stroke="#0D1117" strokeWidth="1.8"/>
        <line x1="38" y1="5" x2="38" y2="68" stroke="#0D1117" strokeWidth="1.8"/>
        <line x1="38" y1="38" x2="8" y2="55" stroke="#0D1117" strokeWidth="1.4"/>
        <line x1="38" y1="24" x2="12" y2="42" stroke="#0D1117" strokeWidth="1.4"/>
        <line x1="38" y1="14" x2="20" y2="28" stroke="#0D1117" strokeWidth="1.4"/>
        <line x1="38" y1="38" x2="68" y2="55" stroke="#0D1117" strokeWidth="1.4"/>
        <line x1="38" y1="24" x2="64" y2="42" stroke="#0D1117" strokeWidth="1.4"/>
        <line x1="38" y1="14" x2="56" y2="28" stroke="#0D1117" strokeWidth="1.4"/>
      </g>
      <rect x="84" y="6" width="50" height="50" rx="8" fill="#3D3D3D"/>
      <text x="109" y="42" textAnchor="middle" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="30" fill="white" letterSpacing="-1">H</text>
      <rect x="138" y="6" width="50" height="50" rx="8" fill="#3D3D3D"/>
      <text x="163" y="42" textAnchor="middle" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="30" fill="white" letterSpacing="-1">T</text>
      <rect x="192" y="6" width="50" height="50" rx="8" fill="#3D3D3D"/>
      <text x="217" y="42" textAnchor="middle" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="30" fill="white" letterSpacing="-1">N</text>
      <text x="248" y="42" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="400" fontSize="28" fill="#3D3D3D">News</text>
      <text x="171" y="70" textAnchor="middle" fontFamily="'Arial', sans-serif" fontWeight="600" fontSize="14" fill="#3D3D3D" letterSpacing="7">CANADA</text>
    </svg>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}


function isYT(url) { return url && (url.includes("youtube.com") || url.includes("youtu.be")); }
function stripHtml(str) { return str ? str.replace(/<[^>]*>/g, "") : ""; }

export default function HTNNews() {
  const [items, setItems] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", category: "canadian-politics", url: "", date: "", source: "", note: "", imageUrl: "", featured: false });
  const [toast, setToast] = useState("");
  const [showLoader, setShowLoader] = useState(true);
  const [tickerPos, setTickerPos] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [activePage, setActivePage] = useState("news");
  const [curated, setCurated] = useState([]);

  useEffect(() => {
    fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_KEY }
    })
    .then(r => r.json())
    .then(data => setCurated(data.record?.articles || []))
    .catch(() => setCurated([]));
  }, []);

  useEffect(() => { loadItems(); setTimeout(() => setLoaded(true), 80); }, []);
  useEffect(() => { const t = setInterval(() => setTickerPos(p => (p + 1) % TICKER_ITEMS.length), 4000); return () => clearInterval(t); }, []);

  async function loadItems() {
    try {
      const r = await window.storage.get("htn-v4-items", true);
      setItems(r ? JSON.parse(r.value) : []);
    } catch { setItems([]); }
  }

  async function persist(updated) {
    setItems(updated);
    try { await window.storage.set("htn-v4-items", JSON.stringify(updated), true); } catch {}
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function handleLogin() {
    if (pwInput === ADMIN_PW) { setAdminMode(true); setShowLogin(false); setPwInput(""); setPwError(false); }
    else setPwError(true);
  }

  function resetForm() {
    setForm({ title: "", category: "canadian-politics", url: "", date: "", source: "", note: "", imageUrl: "", featured: false });
    setEditId(null); setShowForm(false);
  }

  async function handleSave() {
    if (!form.title || !form.url || !form.date) { showToast("Title, URL and date required."); return; }
    const updated = editId
      ? items.map(i => i.id === editId ? { ...form, id: editId } : i)
      : [{ ...form, id: `htn-${Date.now()}` }, ...items];
    await persist(updated);
    resetForm();
    showToast(editId ? "Story updated." : "Story published.");
  }

  return (
    <>
      {showLoader && <MapleLeafLoader onComplete={() => setShowLoader(false)} />}
      <div style={{ minHeight: "100vh", background: COLORS.navy, color: COLORS.offWhite, fontFamily: "Georgia, serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,400&family=Barlow+Condensed:wght@400;600;700&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes htnFade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          @keyframes tickFade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          .htn-fade{animation:htnFade 0.65s ease forwards}
          .s1{opacity:0;animation:htnFade 0.6s ease 0.1s forwards}
          .s2{opacity:0;animation:htnFade 0.6s ease 0.2s forwards}
          .s3{opacity:0;animation:htnFade 0.6s ease 0.32s forwards}
          .tick{animation:tickFade 0.4s ease}
          .live-dot{width:7px;height:7px;border-radius:50%;background:#C8102E;display:inline-block;margin-right:0.3rem;animation:pulse 1.5s ease-in-out infinite}
          .nav-btn{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:0.78rem;letter-spacing:0.12em;text-transform:uppercase;color:#B8BCC4;cursor:pointer;padding:0.5rem 0;border:none;border-bottom:2px solid transparent;background:none;transition:all 0.2s}
          .nav-btn:hover{color:#fff}
          .nav-btn.active{color:#fff;border-bottom-color:#C8102E}
          .cat-pill{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:0.7rem;letter-spacing:0.14em;text-transform:uppercase;padding:0.4rem 0.9rem;border:1px solid #1E2A3A;background:transparent;color:#8A8F98;cursor:pointer;transition:all 0.2s}
          .cat-pill:hover{border-color:#C8102E;color:#F0EDE8}
          .cat-pill.active{background:#C8102E;border-color:#C8102E;color:#fff}
          .card{background:#1A2332;border:1px solid #1E2A3A;transition:all 0.22s ease;display:flex;flex-direction:column}
          .card:hover{border-color:rgba(200,16,46,0.35);transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.45)}
          .story-title{font-family:'Playfair Display',Georgia,serif;font-weight:700;line-height:1.25;color:#F0EDE8;transition:color 0.2s}
          .card:hover .story-title{color:#fff}
          .cat-tag{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;padding:0.18rem 0.45rem;display:inline-block}
          .meta{font-family:'Barlow Condensed',sans-serif;font-size:0.7rem;letter-spacing:0.07em;color:#8A8F98}
          .read-link{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:0.7rem;letter-spacing:0.14em;text-transform:uppercase;color:#C8102E;text-decoration:none;display:inline-flex;align-items:center;gap:0.3rem;transition:gap 0.2s}
          .read-link:hover{gap:0.55rem}
          .note-text{font-family:'Source Serif 4',Georgia,serif;font-style:italic;font-size:0.88rem;color:#8A8F98;line-height:1.55;border-left:2px solid rgba(200,16,46,0.5);padding-left:0.75rem}
          .fi{width:100%;background:#131920;border:1px solid #1E2A3A;color:#F0EDE8;padding:0.6rem 0.75rem;font-family:'Source Serif 4',Georgia,serif;font-size:0.92rem;outline:none;transition:border-color 0.2s}
          .fi:focus{border-color:rgba(200,16,46,0.6)}
          .fi option{background:#131920}
          .fl{font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:#8A8F98;display:block;margin-bottom:0.35rem}
          .btn-r{background:#C8102E;border:none;color:#fff;padding:0.65rem 1.6rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.78rem;letter-spacing:0.16em;text-transform:uppercase;cursor:pointer;transition:background 0.2s}
          .btn-r:hover{background:#A00D24}
          .btn-g{background:transparent;border:1px solid #1E2A3A;color:#8A8F98;padding:0.65rem 1.1rem;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.2s}
          .btn-g:hover{border-color:#8A8F98;color:#F0EDE8}
          .chip{font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;padding:0.2rem 0.5rem;background:transparent;border:1px solid #1E2A3A;color:#8A8F98;cursor:pointer;transition:all 0.2s}
          .chip:hover{border-color:rgba(200,16,46,0.5);color:#C8102E}
          .chip.del:hover{border-color:#C94444;color:#C94444}
          .sec-label{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.68rem;letter-spacing:0.22em;text-transform:uppercase;color:#8A8F98;display:flex;align-items:center;gap:0.6rem}
          .sec-label::after{content:'';flex:1;height:1px;background:#1E2A3A}
          .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(4px)}
          .toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#2D2D2D;color:#F0EDE8;padding:0.65rem 1.4rem;font-family:'Barlow Condensed',sans-serif;font-size:0.78rem;letter-spacing:0.1em;z-index:300;border-left:3px solid #C8102E;box-shadow:0 4px 20px rgba(0,0,0,0.5);animation:htnFade 0.3s ease;white-space:nowrap}
          .news-row{display:flex;gap:1rem;padding:1rem 0;border-bottom:1px solid #1E2A3A;text-decoration:none;transition:background 0.2s}
          .news-row:hover{background:#1A2332}
          .news-row:last-child{border-bottom:none}
        `}</style>

        {/* TICKER */}
        <div style={{ background: COLORS.charcoal, borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0.42rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flex: 1, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <span className="live-dot" />
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.2em", color: COLORS.red, textTransform: "uppercase" }}>Live</span>
              </div>
              <span key={tickerPos} className="tick" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.7rem", letterSpacing: "0.05em", color: COLORS.greyLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {TICKER_ITEMS[tickerPos]}
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              {adminMode ? (
                <>
                  <button className="chip" style={{ color: COLORS.red, borderColor: "rgba(200,16,46,0.4)" }} onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: "", category: "canadian-politics", url: "", date: "", source: "", note: "", imageUrl: "", featured: false }); setActivePage("news"); }}>+ Add</button>
                  <button className="chip del" onClick={() => { setAdminMode(false); resetForm(); }}>Exit</button>
                </>
              ) : (
                <button className="chip" onClick={() => setShowLogin(true)}>◎ Curator</button>
              )}
            </div>
          </div>
        </div>

        {/* MASTHEAD */}
        <header style={{ background: COLORS.navy, borderBottom: `3px solid ${COLORS.red}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem 1.2rem" }}>
            <div className={loaded ? "s1" : ""} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ cursor: "pointer" }} onClick={() => setActivePage("news")}>
                <img src="/htncrop.png" alt="HTN News Canada" style={{ height: "58px" }} />
              </div>
              <nav style={{ display: "flex", gap: "1.6rem", alignItems: "center" }}>
                {[{ id: "news", label: "News" }, { id: "about", label: "About" }, { id: "submit", label: "Submit Your Work" }].map(p => (
                  <button key={p.id} className={`nav-btn ${activePage === p.id ? "active" : ""}`} onClick={() => setActivePage(p.id)}>{p.label}</button>
                ))}
              </nav>
            </div>
            {activePage === "news" && (
              <div className={loaded ? "s2" : ""} style={{ marginTop: "0.9rem", display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.68rem", color: COLORS.grey }}>{curated.length} {curated.length === 1 ? "story" : "stories"}</span>
              </div>
            )}
          </div>
        </header>

        {/* MAIN */}
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "1.8rem 1.2rem 4rem" }}>

          {/* FORM */}
          {adminMode && showForm && (
            <div className="htn-fade" style={{ background: COLORS.navyLight, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${COLORS.red}`, padding: "1.6rem", marginBottom: "1.8rem" }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.2em", color: COLORS.red, textTransform: "uppercase", marginBottom: "1.2rem" }}>{editId ? "✎ Edit Story" : "+ Publish Story"}</div>
              <div style={{ marginBottom: "0.9rem" }}><label className="fl">Headline</label><input className="fi" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Story headline..." /></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0.8rem", marginBottom: "0.9rem" }}>
                <div><label className="fl">Category</label><select className="fi" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
                <div><label className="fl">Date</label><input className="fi" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                <div><label className="fl">Source</label><input className="fi" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="CBC, YouTube..." /></div>
              </div>
              <div style={{ marginBottom: "0.9rem" }}><label className="fl">URL</label><input className="fi" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
              <div style={{ marginBottom: "0.9rem" }}><label className="fl">Image URL (optional)</label><input className="fi" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://... (thumbnail or hero image)" /></div>
              <div style={{ marginBottom: "1rem" }}><label className="fl">Curator Note (optional)</label><textarea className="fi" style={{ resize: "vertical", minHeight: 80 }} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Why this story matters..." /></div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.2rem" }}>
                <input type="checkbox" id="feat" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} style={{ accentColor: COLORS.red }} />
                <label htmlFor="feat" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.7rem", letterSpacing: "0.08em", color: COLORS.grey, cursor: "pointer" }}>Feature this story</label>
              </div>
              <div style={{ display: "flex", gap: "0.7rem" }}>
                <button className="btn-r" onClick={handleSave}>{editId ? "Update" : "Publish"}</button>
                <button className="btn-g" onClick={resetForm}>Cancel</button>
              </div>
            </div>
          )}

          {/* NEWS PAGE */}
          {activePage === "news" && (
            <>
              {curated.length === 0 ? (
                <div style={{ padding: "5rem", textAlign: "center", color: COLORS.grey, fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1rem", letterSpacing: "0.08em" }}>No stories yet — check back soon.</div>
              ) : (
                <div className={loaded ? "s2" : ""} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                  {curated.map(article => (
                    <div key={article.id} className="card" style={{ borderRadius: "6px", overflow: "hidden" }}>
                      {article.image && <img src={article.image} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />}
                      <div style={{ padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.45rem", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                          <span style={{ background: COLORS.red, color: COLORS.white, fontSize: "0.62rem", padding: "0.18rem 0.5rem", borderRadius: "3px", letterSpacing: "0.08em", whiteSpace: "nowrap", fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif" }}>{article.source}</span>
                          <span style={{ color: COLORS.grey, fontSize: "0.72rem", whiteSpace: "nowrap", fontFamily: "'Barlow Condensed',sans-serif" }}>{timeAgo(article.pubDate)}</span>
                        </div>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1rem", color: COLORS.white, lineHeight: 1.3, margin: 0 }}>{article.title}</p>
                        {article.description && <p style={{ color: COLORS.grey, fontSize: "0.82rem", margin: 0, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Source Serif 4',serif" }}>{stripHtml(article.description)}</p>}
                        <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                          <a href={article.link} target="_blank" rel="noopener noreferrer" className="read-link">{isYT(article.link) ? "▶ Watch Now" : "Read More"} →</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ABOUT */}
          {activePage === "about" && (
            <div className="htn-fade" style={{ maxWidth: 700 }}>
              <div style={{ borderTop: `3px solid ${COLORS.red}`, paddingTop: "1.8rem", marginBottom: "1.8rem" }}>
                <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.25em", color: COLORS.red, textTransform: "uppercase", marginBottom: "0.7rem" }}>Standing Ground</p>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(2rem,5vw,3rem)", color: COLORS.white, lineHeight: 1.1, marginBottom: "1.3rem" }}>Hold The North</h1>
                <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1.1rem", color: COLORS.greyLight, lineHeight: 1.78, marginBottom: "1.1rem" }}>HTN News Canada is an independent media curation platform built on one principle: <em>signal over noise.</em> We surface the stories, voices, and analysis that mainstream Canadian media either misses or buries.</p>
                <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1rem", color: COLORS.grey, lineHeight: 1.75, marginBottom: "1.1rem" }}>We believe Canada deserves independent journalism — journalists, podcasters, and Substackers who aren't beholden to corporate interests or government press releases. HTN exists to amplify those voices.</p>
                <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1rem", color: COLORS.grey, lineHeight: 1.75 }}>A firm, grounded Canadian perspective on sovereignty and curated journalism. Defending democracy and accountability through clear reporting.</p>
              </div>
              <div style={{ background: COLORS.navyLight, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${COLORS.red}`, padding: "1.4rem" }}>
                <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.2em", color: COLORS.red, textTransform: "uppercase", marginBottom: "0.5rem" }}>Support Independent Journalism</p>
                <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "0.93rem", color: COLORS.grey, lineHeight: 1.65 }}>HTN memberships directly support the independent journalists and creators featured on this platform. No ads. No corporate funding. Just Canadians supporting Canadians.</p>
              </div>
            </div>
          )}

          {/* SUBMIT */}
          {activePage === "submit" && (
            <div className="htn-fade" style={{ maxWidth: 660 }}>
              <div style={{ borderTop: `3px solid ${COLORS.red}`, paddingTop: "1.8rem", marginBottom: "1.8rem" }}>
                <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.25em", color: COLORS.red, textTransform: "uppercase", marginBottom: "0.7rem" }}>For Creators & Journalists</p>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "clamp(1.7rem,4vw,2.5rem)", color: COLORS.white, lineHeight: 1.15, marginBottom: "1rem" }}>Submit Your Work to HTN</h1>
                <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1rem", color: COLORS.greyLight, lineHeight: 1.75, marginBottom: "1.8rem" }}>Are you an independent Canadian journalist, YouTuber, or Substack writer? We'd love to feature your work. HTN amplifies independent voices doing the real work.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", marginBottom: "1.4rem" }}>
                <div><label className="fl">Your Name / Publication</label><input className="fi" placeholder="e.g. The Maple / Jane Smith" /></div>
                <div><label className="fl">Website, YouTube or Substack URL</label><input className="fi" placeholder="https://..." /></div>
                <div><label className="fl">What You Cover</label><input className="fi" placeholder="e.g. Canadian politics, accountability journalism..." /></div>
                <div><label className="fl">Why HTN Should Feature You</label><textarea className="fi" style={{ resize: "vertical", minHeight: 90 }} placeholder="Tell us about your work and why it matters to Canadians..." /></div>
              </div>
              <button className="btn-r" onClick={() => showToast("Thanks! We'll review your submission.")}>Submit for Review →</button>
              <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "0.83rem", color: COLORS.grey, marginTop: "1rem", fontStyle: "italic" }}>All submissions are reviewed by the HTN curation team. We aim to respond within 5–7 business days.</p>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${COLORS.border}`, background: COLORS.navyMid }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.8rem" }}>
            <img src="/htncrop.png" alt="HTN News Canada" style={{ height: "36px" }} />
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: "#3A4A5A", textTransform: "uppercase" }}>Independent · Curated · Canadian · © 2025</span>
          </div>
        </footer>

        {/* LOGIN */}
        {showLogin && (
          <div className="overlay" onClick={() => setShowLogin(false)}>
            <div style={{ background: COLORS.navyLight, border: `1px solid ${COLORS.border}`, borderTop: `3px solid ${COLORS.red}`, padding: "2.2rem 1.8rem", maxWidth: 340, width: "90%" }} onClick={e => e.stopPropagation()}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.25rem", color: COLORS.white, marginBottom: "0.35rem" }}>Curator Access</p>
              <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "0.86rem", color: COLORS.grey, marginBottom: "1.3rem" }}>Enter your password to manage content.</p>
              <input className="fi" type="password" placeholder="Password" value={pwInput} onChange={e => { setPwInput(e.target.value); setPwError(false); }} onKeyDown={e => e.key === "Enter" && handleLogin()} autoFocus style={{ marginBottom: "0.5rem", textAlign: "center" }} />
              {pwError && <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.68rem", color: COLORS.red, letterSpacing: "0.1em", marginBottom: "0.7rem" }}>Incorrect password.</p>}
              <div style={{ display: "flex", gap: "0.7rem", marginTop: "1rem" }}>
                <button className="btn-r" onClick={handleLogin} style={{ flex: 1 }}>Enter</button>
                <button className="btn-g" onClick={() => { setShowLogin(false); setPwInput(""); setPwError(false); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

export function App() {
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPw, setAdminPw] = useState("");

  return (
    <Routes>
      <Route path="/" element={<HTNNews />} />
      <Route path="/htn-command" element={
        adminAuth ? <RSSDashboard /> : (
          <div style={{ background: "#0D1117", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#161B22", padding: "2rem", borderRadius: "8px", border: "1px solid #21262D", minWidth: "300px" }}>
              <h2 style={{ color: "#C8102E", fontFamily: "'Barlow Condensed'", marginTop: 0 }}>HTN COMMAND</h2>
              <input type="password" placeholder="Access code" value={adminPw}
                onChange={e => setAdminPw(e.target.value)}
                onKeyDown={e => e.key === "Enter" && adminPw === "holdthenorth2026" && setAdminAuth(true)}
                style={{ width: "100%", padding: "0.6rem", background: "#0D1117", border: "1px solid #21262D", color: "white", borderRadius: "4px", marginBottom: "1rem", boxSizing: "border-box" }} />
              <button onClick={() => adminPw === "holdthenorth2026" && setAdminAuth(true)}
                style={{ width: "100%", background: "#C8102E", color: "white", border: "none", padding: "0.6rem", borderRadius: "4px", cursor: "pointer", fontFamily: "'Barlow Condensed'", letterSpacing: "0.1em" }}>
                ENTER
              </button>
            </div>
          </div>
        )
      } />
    </Routes>
  );
}
