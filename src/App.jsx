const JSONBIN_ID = import.meta.env.VITE_JSONBIN_ID;
const JSONBIN_KEY = import.meta.env.VITE_JSONBIN_KEY;

import { useState, useEffect } from "react";
import { Routes, Route, Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import MapleLeafLoader from "./MapleLeafLoader";
import RSSDashboard from "./RSSDashboard";
import StoryPage from "./StoryPage";
import { AuthProvider, useAuth } from "./AuthContext";
import AuthModal from "./AuthModal";
import MediaKit from "./pages/MediaKit";
import VoicesPage from "./pages/VoicesPage";
import { ThePitchIndex, ThePitchPost } from "./pages/ThePitch";
import AboutPage from "./pages/AboutPage";
import SubmitPage from "./pages/SubmitPage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
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
  { id: "all",             label: "All",             color: COLORS.red },
  { id: "politics",        label: "Politics",         color: "#C8102E" },
  { id: "world",           label: "World",            color: "#1A6FC4" },
  { id: "voices",          label: "Voices",           color: "#2A9C6F" },
  { id: "street-level",    label: "Street Level",     color: "#C47A1A" },
  { id: "trump-watch",     label: "Trump Watch",      color: "#8B2FC9" },
  { id: "the-pitch",       label: "The Pitch",        color: "#1A8FA0" },
  { id: "on-the-ground",   label: "On the Ground",    color: "#7A6C2E" },
  { id: "standing-ground", label: "Standing Ground",  color: "#5A3E8A" },
];

const TICKER_ITEMS = [
  "Federal election campaign underway — HTN is watching",
  "Canada-US trade tensions escalate",
  "Independent journalists need your support",
  "HTN News Canada — Signal over noise",
  "Add HTN to your home screen for instant updates",
];


const ADMIN_PW = "maple2024";

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

const TZ_OFFSETS = {
  EDT: "-0400", EST: "-0500",
  CDT: "-0500", CST: "-0600",
  MDT: "-0600", MST: "-0700",
  PDT: "-0700", PST: "-0800",
  GMT: "+0000",  UTC: "+0000",
};

function parseDate(dateStr) {
  if (!dateStr) return null;
  const cleaned = dateStr.replace(
    /\b(EDT|EST|CDT|CST|MDT|MST|PDT|PST|GMT|UTC)\b/,
    (tz) => TZ_OFFSETS[tz] || "+0000"
  );
  const d = new Date(cleaned);
  return isNaN(d) ? null : d;
}

function timeAgo(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return "";
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}


function isYT(url) { return url && (url.includes("youtube.com") || url.includes("youtu.be")); }
function stripHtml(str) { return str ? str.replace(/<[^>]*>/g, "") : ""; }

// Encode a source URL into a URL-safe base64 slug for use in /story/ paths.
// Reversible — StoryPage decodes it back to the original URL for lookup.
function storySlug(url) {
  if (!url || typeof url !== "string") return "";
  try {
    return btoa(url).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } catch {
    // btoa fails on non-Latin1 chars; percent-encode first then base64
    return btoa(encodeURIComponent(url)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
}

export default function HTNNews({ showLoader, onLoaderComplete }) {
  const { user, profile, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [items, setItems] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", category: "politics", url: "", date: "", source: "", note: "", imageUrl: "", featured: false });
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("cat") || "all";
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [pwaVisible, setPwaVisible] = useState(false);
  const [iosVisible, setIosVisible] = useState(false);
  const [toast, setToast] = useState("");
  const [tickerPos, setTickerPos] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();

  // Keep canonical tag and page meta in sync with the current URL/category
  useEffect(() => {
    const base = "https://holdthenorth.news";
    const search = location.search;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", `${base}${location.pathname}${search}`);

    // Per-category title + description so Google indexes each URL as a distinct page
    const CATEGORY_META = {
      all:              { title: "Hold the North — Independent Canadian News",                       desc: "Canada's independent news platform. Curated coverage on politics, civil liberties, housing, trade, and the stories that matter to everyday Canadians." },
      politics:         { title: "Politics — Hold the North",                                        desc: "Canadian political coverage curated by HTN. Federal elections, Parliament, party leaders, and the policy decisions shaping Canada." },
      world:            { title: "World — Hold the North",                                           desc: "International news that affects Canada. Global affairs, trade relations, and world events covered by Canada's independent news platform." },
      voices:           { title: "Voices — Hold the North",                                          desc: "Independent Canadian journalists and writers curated by HTN. Perspectives beyond the mainstream press." },
      "trump-watch":    { title: "Trump Watch — Hold the North",                                     desc: "Tracking US policy and political developments that directly affect Canada. HTN's ongoing coverage of cross-border tensions." },
      "the-pitch":      { title: "The Pitch — Hold the North",                                       desc: "Original commentary and long-form analysis from the HTN editorial team on the issues defining Canada right now." },
      "street-level":   { title: "Street Level — Hold the North",                                    desc: "Ground-level Canadian stories — housing, cost of living, community, and the issues affecting Canadians' daily lives." },
      "on-the-ground":  { title: "On the Ground — Hold the North",                                   desc: "Civil liberties, human rights, and grassroots Canadian coverage from Amnesty International, Human Rights Watch, and the CCLA." },
      "standing-ground":{ title: "Standing Ground — Hold the North",                                 desc: "HTN's coverage of Canadian sovereignty, Indigenous rights, and the fight to stand firm on Canadian values and institutions." },
    };

    if (location.pathname === "/") {
      const meta = CATEGORY_META[activeCategory] || CATEGORY_META.all;
      document.title = meta.title;
      const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
      setMeta('meta[name="description"]',    "content", meta.desc);
      setMeta('meta[property="og:title"]',   "content", meta.title);
      setMeta('meta[property="og:description"]', "content", meta.desc);
      setMeta('meta[name="twitter:title"]',  "content", meta.title);
      setMeta('meta[name="twitter:description"]', "content", meta.desc);
      if (canonical) setMeta('meta[property="og:url"]', "content", `${base}${location.pathname}${search}`);
    }
  }, [location, activeCategory]);
  const [curated, setCurated] = useState(() => {
    try { const c = sessionStorage.getItem("htn-curated-cache"); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  const [feedLoading, setFeedLoading] = useState(() => !sessionStorage.getItem("htn-curated-cache"));

  useEffect(() => {
    const hasArticles = sessionStorage.getItem("htn-curated-cache");
    const hasVoices = sessionStorage.getItem("htn-voices-cache");
    const hasPitch = sessionStorage.getItem("htn-pitch-cache");
    if (hasArticles && hasVoices && hasPitch) return;
    fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_KEY }
    })
    .then(r => r.json())
    .then(data => {
      const articles = data.record?.articles || [];
      const voices = data.record?.voices || [];
      const pitchPosts = data.record?.pitchPosts || [];
      sessionStorage.setItem("htn-curated-cache", JSON.stringify(articles));
      sessionStorage.setItem("htn-voices-cache", JSON.stringify(voices));
      sessionStorage.setItem("htn-pitch-cache", JSON.stringify(pitchPosts));
      setCurated(articles);
      setFeedLoading(false);
    })
    .catch(() => { setCurated([]); setFeedLoading(false); });
  }, []);

  useEffect(() => { loadItems(); setTimeout(() => setLoaded(true), 80); }, []);
  useEffect(() => { const t = setInterval(() => setTickerPos(p => (p + 1) % TICKER_ITEMS.length), 4000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const handler = e => { e.preventDefault(); setPwaPrompt(e); setPwaVisible(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = window.navigator.standalone === true;
    if (!isIos || isInStandaloneMode) return;
    const dismissed = localStorage.getItem("htn-ios-prompt-dismissed");
    if (dismissed) {
      const daysSince = (Date.now() - Number(dismissed)) / 86400000;
      if (daysSince < 3) return;
    }
    setIosVisible(true);
  }, []);

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
      {showLoader && <MapleLeafLoader onComplete={onLoaderComplete} />}
      <div style={{ minHeight: "100vh", background: COLORS.navy, color: COLORS.offWhite, fontFamily: "Georgia, serif", overflowX: "hidden" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,400&family=Barlow+Condensed:wght@400;600;700&display=swap');
          *{box-sizing:border-box;margin:0;padding:0}
          @keyframes htnFade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          @keyframes tickFade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
          @keyframes pwaSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
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
          @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
          .skel{background:linear-gradient(90deg,#1A2332 25%,#222d3d 50%,#1A2332 75%);background-size:1200px 100%;animation:shimmer 1.5s ease-in-out infinite}
          .htn-footer-grid{display:grid;grid-template-columns:1fr 2fr 1fr;gap:3rem;align-items:start}
          @media(max-width:768px){
            .htn-footer-grid{grid-template-columns:1fr;gap:2rem}
            .htn-nav-links{display:none!important}
            .htn-curator-chip{display:none!important}
          }
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
            <div className="htn-curator-chip" style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              {adminMode ? (
                <>
                  <button className="chip" style={{ color: COLORS.red, borderColor: "rgba(200,16,46,0.4)" }} onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: "", category: "canadian-politics", url: "", date: "", source: "", note: "", imageUrl: "", featured: false }); }}>+ Add</button>
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
              <Link to="/" style={{ textDecoration: "none" }}>
                <img src="/htncrop.png" alt="HTN News Canada" style={{ height: "58px" }} />
              </Link>
              <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div className="htn-nav-links" style={{ display: "flex", gap: "1.6rem", alignItems: "center" }}>
                  {[{ to: "/", label: "News", end: true }, { to: "/about", label: "About" }, { to: "/submit", label: "Submit Your Work" }, { to: "/voices", label: "Voices" }, { to: "/the-pitch", label: "The Pitch" }, { to: "/media-kit", label: "Press" }].map(({ to, label, end }) => (
                    <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-btn${isActive ? " active" : ""}`} style={{ textDecoration: "none" }}>{label}</NavLink>
                  ))}
                </div>

                {user ? (
                  <div style={{ position: "relative", zIndex: 101 }}>
                    <button
                      onClick={() => setShowUserMenu(v => !v)}
                      style={{ display: "flex", alignItems: "center", gap: "0.45rem", background: "none", border: `1px solid ${COLORS.border}`, padding: "0.35rem 0.7rem", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", color: COLORS.greyLight, transition: "all 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.grey}
                      onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
                    >
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS.red, display: "inline-flex", alignItems: "center", justifyContent: "center", color: COLORS.white, fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                        {(profile?.username || user.email)?.[0]?.toUpperCase() || "?"}
                      </span>
                      {profile?.username || user.email.split("@")[0]}
                    </button>
                    {showUserMenu && (
                      <div style={{ position: "absolute", right: 0, top: "calc(100% + 0.4rem)", background: COLORS.navyLight, border: `1px solid ${COLORS.border}`, minWidth: 140, zIndex: 100 }}>
                        <button
                          onClick={() => { signOut(); setShowUserMenu(false); }}
                          style={{ display: "block", width: "100%", background: "none", border: "none", borderBottom: `1px solid ${COLORS.border}`, color: COLORS.grey, padding: "0.65rem 1rem", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", textAlign: "left", transition: "color 0.2s" }}
                          onMouseEnter={e => e.target.style.color = COLORS.offWhite}
                          onMouseLeave={e => e.target.style.color = COLORS.grey}
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="nav-btn"
                    onClick={() => setShowAuthModal(true)}
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    Sign In
                  </button>
                )}
              </nav>
            </div>
            {location.pathname === "/" && (
              <div className={loaded ? "s2" : ""} style={{ marginTop: "0.9rem", display: "flex", gap: "0.3rem", flexWrap: "wrap", alignItems: "center" }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`cat-pill ${activeCategory === c.id ? "active" : ""}`}
                    onClick={() => c.id === "all" ? setSearchParams({}) : setSearchParams({ cat: c.id })}
                    style={{ borderColor: activeCategory === c.id ? c.color : undefined, background: activeCategory === c.id ? c.color : undefined }}>
                    {c.label}
                  </button>
                ))}
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
          {location.pathname === "/" && (() => {
            const seen = new Set();
            const deduped = curated.filter(a => {
              const key = a.link || a.url || a.id;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            const visibleArticles = activeCategory === "all" ? deduped : deduped.filter(a => a.category === activeCategory);
            const catColor = CATEGORIES.find(c => c.id === activeCategory)?.color || COLORS.red;
            if (feedLoading) return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card" style={{ borderRadius: "6px", overflow: "hidden" }}>
                    <div className="skel" style={{ height: 200 }} />
                    <div style={{ padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                        <div className="skel" style={{ height: 14, width: "35%", borderRadius: 3 }} />
                        <div className="skel" style={{ height: 14, width: "20%", borderRadius: 3 }} />
                      </div>
                      <div className="skel" style={{ height: 18, width: "90%", borderRadius: 3 }} />
                      <div className="skel" style={{ height: 18, width: "70%", borderRadius: 3 }} />
                      <div className="skel" style={{ height: 13, width: "95%", borderRadius: 3, marginTop: "0.2rem" }} />
                      <div className="skel" style={{ height: 13, width: "80%", borderRadius: 3 }} />
                      <div className="skel" style={{ height: 13, width: "55%", borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            );
            return visibleArticles.length === 0 ? (
              <div style={{ padding: "5rem", textAlign: "center", color: COLORS.grey, fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1rem", letterSpacing: "0.08em" }}>
                {curated.length === 0 ? "No stories yet — check back soon." : "No stories in this category yet."}
              </div>
            ) : (
              <div className={loaded ? "s2" : ""} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                {visibleArticles.map(article => (
                  <Link key={article.id} to={`/story/${storySlug(article.id)}`} style={{ textDecoration: "none" }}>
                    <div className="card" style={{ borderRadius: "6px", overflow: "hidden", height: "100%", borderTopColor: catColor }}>
                      {article.image && <img src={article.image} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />}
                      <div style={{ padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.45rem", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                          <span style={{ background: COLORS.red, color: COLORS.white, fontSize: "0.62rem", padding: "0.18rem 0.5rem", borderRadius: "3px", letterSpacing: "0.08em", whiteSpace: "nowrap", fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif" }}>{article.source}</span>
                          <span style={{ color: COLORS.grey, fontSize: "0.72rem", whiteSpace: "nowrap", fontFamily: "'Barlow Condensed',sans-serif" }}>{timeAgo(article.pubDate)}</span>
                        </div>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1rem", color: COLORS.white, lineHeight: 1.3, margin: 0 }}>{article.title}</p>
                        {article.description && <p style={{ color: COLORS.grey, fontSize: "0.82rem", margin: 0, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "'Source Serif 4',serif" }}>{stripHtml(article.description)}</p>}
                        <div style={{ marginTop: "auto", paddingTop: "0.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                          <span className="read-link">{isYT(article.link) ? "▶ Watch Now" : "Read More"} →</span>
                          {/* Share buttons — stopPropagation prevents the parent <Link> from navigating */}
                          <div style={{ display: "flex", gap: "0.3rem" }} onClick={e => e.stopPropagation()}>
                            {(() => {
                              const su  = `${window.location.origin}/story/${storySlug(article.id)}`;
                              const esu = encodeURIComponent(su);
                              const t   = encodeURIComponent(article.title);
                              const u   = encodeURIComponent(article.link || su);
                              return [
                                { label: "Bluesky",  color: "#0085ff", href: `https://bsky.app/intent/compose?text=${encodeURIComponent(article.title + " " + (article.link || su))}`,                   icon: <svg width="11" height="10" viewBox="0 0 360 320" fill="currentColor"><path d="M180 141.964C163.68 112.519 126.639 51.985 89.882 32.116 68.232 20.247 39.327 16.427 21.517 34.483 2.644 53.617 5.496 82.438 18.447 100.58c8.89 12.37 23.49 18.927 38.14 21.085-15.247 2.607-33.665 11.497-39.673 50.504-8.008 51.51 43.396 65.798 78.34 46.394C135.04 199.33 163.054 167.99 180 141.964z"/><path d="M180 141.964C196.32 112.519 233.361 51.985 270.118 32.116c21.65-11.869 50.555-15.689 68.365 2.367 18.873 19.134 16.021 47.955 3.07 66.097-8.89 12.37-23.49 18.927-38.14 21.085 15.247 2.607 33.665 11.497 39.673 50.504 8.008 51.51-43.396 65.798-78.34 46.394C224.96 199.33 196.946 167.99 180 141.964z"/></svg> },
                                { label: "Facebook", color: "#1877f2", href: `https://www.facebook.com/sharer/sharer.php?u=${esu}`,                                                    icon: <svg width="9"  height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                                { label: "X",        color: "#e8e8e8", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,                                                   icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                              ].map(({ label, color, href, icon }) => (
                                <button key={label}
                                  onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(href, "_blank", "noopener,noreferrer"); }}
                                  title={`Share on ${label}`}
                                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, color: "#3A4A5A", border: "1px solid #1E2A3A", borderRadius: "3px", transition: "color 0.18s, border-color 0.18s", background: "none", cursor: "pointer", padding: 0 }}
                                  onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.borderColor = color; }}
                                  onMouseLeave={e => { e.currentTarget.style.color = "#3A4A5A"; e.currentTarget.style.borderColor = "#1E2A3A"; }}
                                >{icon}</button>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            );
          })()}

        </main>

        {/* FOOTER */}
        <footer style={{ background: "#080d12", borderTop: `3px solid ${COLORS.red}`, fontFamily: "'Barlow Condensed',sans-serif" }}>

          {/* MAIN FOOTER BODY */}
          <div className="htn-footer-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.2rem 2.5rem" }}>

            {/* LEFT — Logo + tagline */}
            <div>
              <img src="/htncrop.png" alt="HTN News Canada" style={{ height: "44px", display: "block", marginBottom: "1rem" }} />
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.08em", color: COLORS.grey, lineHeight: 1.65, maxWidth: 220, margin: "0 0 1.2rem" }}>
                Canada's independent editorial news platform. Signal over noise. Built for Canadians who demand more than headlines.
              </p>
              <a href="https://holdthenorth.news" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.red, textDecoration: "none" }}>holdthenorth.news</a>
            </div>

            {/* MIDDLE — Nav columns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div>
                <div style={{ fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.grey, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: `1px solid ${COLORS.border}` }}>Navigate</div>
                <nav style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  {[
                    { label: "News", to: "/" },
                    { label: "About HTN", to: "/about" },
                    { label: "Submit Your Work", to: "/submit" },
                  ].map(({ label, to }) => (
                    <Link key={label} to={to} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em", color: "#6A7A8A", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = COLORS.offWhite}
                      onMouseLeave={e => e.target.style.color = "#6A7A8A"}>
                      {label}
                    </Link>
                  ))}
                  <Link to="/voices" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em", color: "#6A7A8A", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = COLORS.offWhite}
                    onMouseLeave={e => e.target.style.color = "#6A7A8A"}>
                    Voices
                  </Link>
                  <Link to="/the-pitch" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em", color: "#6A7A8A", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = COLORS.offWhite}
                    onMouseLeave={e => e.target.style.color = "#6A7A8A"}>
                    The Pitch
                  </Link>
                  <Link to="/media-kit" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em", color: "#6A7A8A", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = COLORS.offWhite}
                    onMouseLeave={e => e.target.style.color = "#6A7A8A"}>
                    Press &amp; Media Kit
                  </Link>
                </nav>
              </div>
              <div>
                <div style={{ fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.grey, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: `1px solid ${COLORS.border}` }}>Legal</div>
                <nav style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  {[
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Use", href: "/terms" },
                  ].map(({ label, href }) => (
                    <Link key={label} to={href} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em", color: "#6A7A8A", textDecoration: "none" }}
                      onMouseEnter={e => e.target.style.color = COLORS.offWhite}
                      onMouseLeave={e => e.target.style.color = "#6A7A8A"}>
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* RIGHT — Social */}
            <div>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.grey, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: `1px solid ${COLORS.border}` }}>Follow HTN</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {/* Bluesky */}
                <a href="https://bsky.app/profile/holdthenorth.news" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none", color: "#6A7A8A", transition: "color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = COLORS.offWhite; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#6A7A8A"; }}>
                  {/* Bluesky butterfly icon */}
                  <svg width="16" height="16" viewBox="0 0 360 320" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M180 141.964C163.68 112.519 126.639 51.985 89.882 32.116 68.232 20.247 39.327 16.427 21.517 34.483 2.644 53.617 5.496 82.438 18.447 100.58c8.89 12.37 23.49 18.927 38.14 21.085-15.247 2.607-33.665 11.497-39.673 50.504-8.008 51.51 43.396 65.798 78.34 46.394C135.04 199.33 163.054 167.99 180 141.964z"/>
                    <path d="M180 141.964C196.32 112.519 233.361 51.985 270.118 32.116c21.65-11.869 50.555-15.689 68.365 2.367 18.873 19.134 16.021 47.955 3.07 66.097-8.89 12.37-23.49 18.927-38.14 21.085 15.247 2.607 33.665 11.497 39.673 50.504 8.008 51.51-43.396 65.798-78.34 46.394C224.96 199.33 196.946 167.99 180 141.964z"/>
                  </svg>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em", fontWeight: 700 }}>Bluesky</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.65rem", letterSpacing: "0.06em", opacity: 0.6 }}>@holdthenorth.news</div>
                  </div>
                </a>

                {/* Substack */}
                <a href="https://holdthenorth.substack.com" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none", color: "#6A7A8A", transition: "color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = COLORS.offWhite; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#6A7A8A"; }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                  </svg>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em", fontWeight: 700 }}>Substack</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.65rem", letterSpacing: "0.06em", opacity: 0.6 }}>holdthenorth.substack.com</div>
                  </div>
                </a>

                {/* TikTok — coming soon */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", color: "#3A4A5A", cursor: "default" }}>
                  <svg width="14" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/>
                  </svg>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.78rem", letterSpacing: "0.08em", fontWeight: 700 }}>TikTok</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.65rem", letterSpacing: "0.06em", fontStyle: "italic" }}>@holdthenorth — coming soon</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div style={{ borderTop: `1px solid ${COLORS.border}`, background: "#050a0e" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0.9rem 1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.6rem", letterSpacing: "0.18em", color: "#2E3E4E", textTransform: "uppercase" }}>
                Independent · Curated · Canadian
              </span>
              <span style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "#2E3E4E" }}>
                © 2026 Hold the North · holdthenorth.news
              </span>
            </div>
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

        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        {showUserMenu && <div onClick={() => setShowUserMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
        {toast && <div className="toast">{toast}</div>}
      </div>

      {pwaVisible && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
          background: "#131920", borderTop: `2px solid ${COLORS.red}`,
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.85rem 1.2rem",
          animation: "pwaSlideUp 0.35s ease forwards",
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          <img src="/htnleafgooglenews.png" alt="HTN" style={{ height: 28, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: "0.95rem", letterSpacing: "0.03em", color: COLORS.offWhite }}>
            Install the HTN app for faster access
          </span>
          <button
            onClick={async () => {
              if (!pwaPrompt) return;
              await pwaPrompt.prompt();
              setPwaVisible(false);
              setPwaPrompt(null);
            }}
            style={{
              background: COLORS.red, color: "#fff", border: "none",
              borderRadius: "3px", padding: "0.4rem 1rem",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            Install
          </button>
          <button
            onClick={() => setPwaVisible(false)}
            aria-label="Dismiss"
            style={{
              background: "none", border: "none", color: COLORS.grey,
              cursor: "pointer", padding: "0.2rem 0.3rem", fontSize: "1.1rem",
              lineHeight: 1, flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {iosVisible && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
          background: "#131920", borderTop: `2px solid ${COLORS.red}`,
          padding: "0.9rem 1.2rem 1.2rem",
          animation: "pwaSlideUp 0.35s ease forwards",
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <img src="/htnleafgooglenews.png" alt="HTN" style={{ height: 28, flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.95rem", letterSpacing: "0.03em", color: COLORS.offWhite, lineHeight: 1.4 }}>
                Install the HTN app — tap the share icon{" "}
                <span style={{ display: "inline-block", fontSize: "1rem" }}>⬆</span>
                {" "}then <strong style={{ color: COLORS.offWhite }}>Add to Home Screen</strong>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.setItem("htn-ios-prompt-dismissed", String(Date.now()));
                setIosVisible(false);
              }}
              aria-label="Dismiss"
              style={{
                background: "none", border: "none", color: COLORS.grey,
                cursor: "pointer", padding: "0.2rem 0.3rem", fontSize: "1.1rem",
                lineHeight: 1, flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
          {/* Arrow pointing down toward the Safari share button */}
          <div style={{
            display: "flex", justifyContent: "center", marginTop: "0.55rem",
            fontSize: "1.3rem", color: COLORS.red, lineHeight: 1,
          }}>
            ▼
          </div>
        </div>
      )}
    </>
  );
}

export function App() {
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [showLoader, setShowLoader] = useState(true);

  return (
    <AuthProvider>
    <Routes>
      <Route path="/" element={<HTNNews showLoader={showLoader} onLoaderComplete={() => setShowLoader(false)} />} />
      <Route path="/story/:storyId" element={<StoryPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/submit" element={<SubmitPage />} />
      <Route path="/voices" element={<VoicesPage />} />
      <Route path="/the-pitch" element={<ThePitchIndex />} />
      <Route path="/the-pitch/:slug" element={<ThePitchPost />} />
      <Route path="/media-kit" element={<MediaKit />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
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
    </AuthProvider>
  );
}
