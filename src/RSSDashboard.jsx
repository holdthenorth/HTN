import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0d0d0d",
  card: "#161616",
  red: "#c8102e",
  orange: "#ff6b35",
  white: "#f0f0f0",
  grey: "#888",
  border: "#2a2a2a",
  hero: "#1a0a0d",
};

const RSS2JSON = `https://api.rss2json.com/v1/api.json?api_key=${import.meta.env.VITE_RSS2JSON_API_KEY}&rss_url=`;

function getYTId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
  } catch {}
  return null;
}
const JSONBIN_ID = import.meta.env.VITE_JSONBIN_ID || "69ce762aaaba882197bac5e8";
const JSONBIN_KEY = import.meta.env.VITE_JSONBIN_KEY;

const ARTICLE_CATEGORIES = [
  { id: "politics",     label: "Politics" },
  { id: "world",        label: "World" },
  { id: "voices",       label: "Voices" },
  { id: "street-level", label: "Street Level" },
  { id: "trump-watch",  label: "Trump Watch" },
  { id: "the-pitch",    label: "The Pitch" },
  { id: "on-the-ground",   label: "On the Ground" },
  { id: "standing-ground", label: "Standing Ground" },
];

const SOURCES = [
  { id: "cbc-top",  name: "CBC Top Stories",  category: "Mainstream",  url: "https://rss.cbc.ca/lineup/topstories.xml" },
  { id: "cbc-pol",  name: "CBC Politics",     category: "Mainstream",  url: "https://rss.cbc.ca/lineup/politics.xml" },
  { id: "global",   name: "Global News",      category: "Mainstream",  url: "https://globalnews.ca/feed/" },
  { id: "observer", name: "National Observer",category: "Independent", url: "https://www.nationalobserver.com/front/rss" },
  { id: "htn-substack", name: "Hold the North",  category: "Independent", url: "https://holdthenorth.substack.com/feed" },
  { id: "angus",        name: "Charlie Angus",  category: "Independent", url: "https://charlieangus.substack.com/feed" },
  { id: "gilmore",  name: "Rachel Gilmore",   category: "Independent", url: "https://rachelgilmore.substack.com/feed" },
  { id: "wells",    name: "Paul Wells",       category: "Independent", url: "https://paulwells.substack.com/feed" },
  { id: "moscrop",  name: "David Moscrop",    category: "Independent", url: "https://davidmoscrop.substack.com/feed" },
  { id: "emmett",   name: "Emmett Macfarlane",category: "Independent", url: "https://emmettmacfarlane.substack.com/feed" },
  { id: "ling",     name: "Justin Ling",      category: "Independent", url: "https://justinling.substack.com/feed" },
  { id: "glavin",   name: "Terry Glavin",     category: "Independent", url: "https://therealstory.substack.com/feed" },
  { id: "rabble",   name: "Rabble.ca",        category: "Independent", url: "https://rabble.ca/feed" },
  { id: "amnesty",  name: "Amnesty International", category: "On the Ground", url: "https://www.amnesty.org/en/feed/" },
  { id: "hrw",      name: "Human Rights Watch",    category: "On the Ground", url: "https://www.hrw.org/rss/news" },
  { id: "ccla",     name: "Canadian Civil Liberties Association", category: "On the Ground", url: "https://ccla.org/feed/" },
];

const TZ_OFFSETS = {
  EDT: "-0400", EST: "-0500",
  CDT: "-0500", CST: "-0600",
  MDT: "-0600", MST: "-0700",
  PDT: "-0700", PST: "-0800",
  GMT: "+0000",  UTC: "+0000",
};

function parseDate(dateStr) {
  if (!dateStr) return null;
  // Replace named timezone abbreviations with correct numeric offsets before parsing
  const cleaned = dateStr.replace(
    /\b(EDT|EST|CDT|CST|MDT|MST|PDT|PST|GMT|UTC)\b/,
    (tz) => TZ_OFFSETS[tz] || "+0000"
  );
  const d = new Date(cleaned);
  if (!isNaN(d)) return d;
  return null;
}

function timeAgo(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return "";
  const diff = (Date.now() - d.getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

const PASSWORD = "holdthenorth2026";

export default function RSSDashboard() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("htn-authed") === "1");
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(() => {
    try { return JSON.parse(localStorage.getItem("htn-featured") || "[]"); } catch { return []; }
  });
  const [heroId, setHeroId] = useState(() => localStorage.getItem("htn-hero") || null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceCategory, setNewSourceCategory] = useState("Custom");

  function detectCategory(url) {
    return url.includes("youtube.com") ? "YouTube" : "Custom";
  }
  const [customSources, setCustomSources] = useState(() => {
    try { return JSON.parse(localStorage.getItem("htn-custom-sources") || "[]"); } catch { return []; }
  });
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "ok" | "error"
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("htn-notes") || "{}"); } catch { return {}; }
  });
  const [noteModal, setNoteModal] = useState(null);
  const [activeTab, setActiveTab] = useState("articles");
  const [voices, setVoices] = useState([]);
  const [voiceForm, setVoiceForm] = useState(null); // null = hidden
  const [voiceFormMode, setVoiceFormMode] = useState("add");
  const EMPTY_VOICE = { id: "", name: "", photo: "", bio: "", whyHTN: "", feedUrl: "" };

  const [pitchPosts, setPitchPosts] = useState([]);
  const [pitchForm, setPitchForm] = useState(null); // null = hidden
  const [pitchFormMode, setPitchFormMode] = useState("add");
  const EMPTY_PITCH = { id: "", title: "", byline: "", body: "", photo: "" };

  const allSources = [...SOURCES, ...customSources];

  useEffect(() => {
    if (!authed) return;
    fetchAll();
    // Load voices + pitch posts from JSONBin
    fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_KEY },
    })
      .then(r => r.json())
      .then(data => {
        setVoices(data.record?.voices || []);
        setPitchPosts(data.record?.pitchPosts || []);
      })
      .catch(() => {});
  }, [authed]);

  async function fetchAll() {
    setLoading(true);
    const results = [];
    await Promise.all(allSources.map(async (source) => {
      try {
        const sourceYtId = getYTId(source.url);
        if (sourceYtId) {
          // Single YouTube video URL — fetch via oEmbed (no API key needed)
          const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(source.url)}&format=json`);
          if (!res.ok) return;
          const data = await res.json();
          results.push({
            id: source.url,
            title: data.title || source.name,
            link: source.url,
            pubDate: "",
            description: data.author_name ? `YouTube · ${data.author_name}` : "YouTube",
            image: data.thumbnail_url || `https://img.youtube.com/vi/${sourceYtId}/hqdefault.jpg`,
            ytId: sourceYtId,
            source: source.name,
            category: source.category,
          });
          return;
        }
        const res = await fetch(`${RSS2JSON}${encodeURIComponent(source.url)}&count=8`);
        const data = await res.json();
        if (!data.items) return;
        data.items.forEach(item => {
          if (!item) return;
          const link = item.link || item.guid || item.id || "";
          const ytId = getYTId(link);
          const image = (typeof item.thumbnail === "string" && item.thumbnail) || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);
          const rawDesc = typeof item.description === "string" ? item.description : "";
          const description = rawDesc.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 160) || "";
          results.push({
            id: link || `${source.id}-${Date.now()}-${Math.random()}`,
            title: item.title || "",
            link,
            pubDate: item.pubDate || "",
            description,
            image,
            ytId: ytId || null,
            source: source.name,
            category: source.category,
          });
        });
      } catch {}
    }));
    results.sort((a, b) => {
      const da = parseDate(a.pubDate);
      const db = parseDate(b.pubDate);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db - da;
    });
    // Deduplicate by article ID (which is the link URL) — same story can appear in multiple feeds
    const seen = new Set();
    const deduped = results.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
    setArticles(deduped);
    setLoading(false);
    autoSyncNewArticles(deduped);
  }

  function removeFeatured(id) {
    setFeatured(prev => {
      const updated = prev.filter(x => x !== id);
      localStorage.setItem("htn-featured", JSON.stringify(updated));
      return updated;
    });
    setNotes(prev => {
      const updated = { ...prev };
      delete updated[id];
      localStorage.setItem("htn-notes", JSON.stringify(updated));
      return updated;
    });
  }

  function confirmFeature(article, note, category) {
    setFeatured(prev => {
      // Guard against double-featuring the same article
      if (prev.includes(article.id)) return prev;
      const updated = [...prev, article.id];
      localStorage.setItem("htn-featured", JSON.stringify(updated));
      return updated;
    });
    setNotes(prev => {
      const updated = { ...prev, [article.id]: { note, category } };
      localStorage.setItem("htn-notes", JSON.stringify(updated));
      return updated;
    });
    setNoteModal(null);
  }

  function toggleHero(id) {
    const newHero = heroId === id ? null : id;
    setHeroId(newHero);
    if (newHero) localStorage.setItem("htn-hero", newHero);
    else localStorage.removeItem("htn-hero");
  }

  async function putToJsonBin(articles, voicesList, posts) {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_KEY,
        "X-Bin-Versioning": "false",
      },
      body: JSON.stringify({ articles, voices: voicesList, pitchPosts: posts }),
    });
    if (!res.ok) throw new Error();
  }

  function normCatId(cat) {
    if (!cat) return "";
    return ARTICLE_CATEGORIES.find(c => c.id === cat || c.label === cat)?.id || cat;
  }

  async function autoSyncNewArticles(freshArticles) {
    if (!freshArticles.length) return;
    try {
      // Inline fetch so we can check res.ok before touching anything.
      // The previous version used fetchCurrentBin() which didn't check res.ok —
      // a 429/401 made data.record undefined, existing fell to [], and ALL fresh
      // articles became toAdd, overwriting the curated list.
      const readRes = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
        headers: { "X-Master-Key": JSONBIN_KEY },
      });
      if (!readRes.ok) return; // rate-limit or auth error — abort, never write

      const data = await readRes.json();
      const existing = data.record?.articles || [];

      // Second guard: if the bin returned 0 articles something is wrong.
      // Writing 100+ raw RSS articles into an apparently-empty bin would
      // silently wipe whatever was there.
      if (existing.length === 0) return;

      const existingKeys = new Set();
      existing.forEach(a => {
        if (a.id)   existingKeys.add(a.id);
        if (a.link) existingKeys.add(a.link);
      });

      const toAdd = freshArticles
        .filter(a => !existingKeys.has(a.id) && !existingKeys.has(a.link))
        .map(a => ({
          ...a,
          curatorNote: "",
          category: normCatId(a.category) || a.category || "",
        }));

      if (toAdd.length === 0) return; // nothing new — no write needed

      // Curated articles stay first; new ones are appended at the end.
      const merged = [...existing, ...toAdd];

      // Re-use the voices/pitchPosts from the same read response so there is
      // no second fetch and no race condition with the component-state load.
      const writeRes = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_KEY,
          "X-Bin-Versioning": "false",
        },
        body: JSON.stringify({
          articles: merged,
          voices: data.record?.voices || [],
          pitchPosts: data.record?.pitchPosts || [],
        }),
      });
      if (!writeRes.ok) throw new Error(`PUT ${writeRes.status}`);
      console.log(`[HTN sync] +${toAdd.length} new articles appended (total: ${merged.length})`);
    } catch (err) {
      console.warn("[HTN sync] skipped:", err.message);
    }
  }

  async function saveFeatured() {
    const heroArticle = heroId ? articles.find(a => a.id === heroId) : null;
    const featuredArticles = articles.filter(a => featured.includes(a.id) && a.id !== heroId);
    const ordered = [...(heroArticle ? [heroArticle] : []), ...featuredArticles]
      .map(a => ({ ...a, curatorNote: notes[a.id]?.note || "", category: normCatId(notes[a.id]?.category || a.category) || "" }));
    if (ordered.length === 0) return;
    setSaveStatus("saving");
    try {
      await putToJsonBin(ordered, voices, pitchPosts);
      setSaveStatus("ok");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 4000);
    }
  }

  async function fetchCurrentBin() {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_KEY },
    });
    const data = await res.json();
    return data.record || {};
  }

  async function saveVoices(updatedVoices) {
    setSaveStatus("saving");
    try {
      const current = await fetchCurrentBin();
      await putToJsonBin(current.articles || [], updatedVoices, current.pitchPosts || []);
      setSaveStatus("ok");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 4000);
    }
  }

  async function savePitchPosts(updatedPosts) {
    setSaveStatus("saving");
    try {
      const current = await fetchCurrentBin();
      await putToJsonBin(current.articles || [], current.voices || [], updatedPosts);
      setSaveStatus("ok");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 4000);
    }
  }

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function addOrUpdatePitch() {
    if (!pitchForm.title.trim() || !pitchForm.body.trim()) return;
    let updated;
    if (pitchFormMode === "add") {
      const slug = slugify(pitchForm.title);
      const newPost = { ...pitchForm, id: `pitch-${Date.now()}`, slug, publishedAt: new Date().toISOString() };
      updated = [newPost, ...pitchPosts];
    } else {
      updated = pitchPosts.map(p => p.id === pitchForm.id ? { ...pitchForm, slug: pitchForm.slug || slugify(pitchForm.title) } : p);
    }
    setPitchPosts(updated);
    setPitchForm(null);
    savePitchPosts(updated);
  }

  function deletePitch(id) {
    const updated = pitchPosts.filter(p => p.id !== id);
    setPitchPosts(updated);
    savePitchPosts(updated);
  }

  function addOrUpdateVoice() {
    if (!voiceForm.name.trim() || !voiceForm.feedUrl.trim()) return;
    let updated;
    if (voiceFormMode === "add") {
      updated = [...voices, { ...voiceForm, id: `voice-${Date.now()}` }];
    } else {
      updated = voices.map(v => v.id === voiceForm.id ? { ...voiceForm } : v);
    }
    setVoices(updated);
    setVoiceForm(null);
    saveVoices(updated);
  }

  function deleteVoice(id) {
    const updated = voices.filter(v => v.id !== id);
    setVoices(updated);
    saveVoices(updated);
  }

  function addSource() {
    if (!newSourceUrl.trim() || !newSourceName.trim()) return;
    const url = newSourceUrl.trim();
    const newSource = { id: `custom-${Date.now()}`, name: newSourceName.trim(), category: newSourceCategory, url };
    const updated = [...customSources, newSource];
    setCustomSources(updated);
    localStorage.setItem("htn-custom-sources", JSON.stringify(updated));
    setNewSourceUrl("");
    setNewSourceName("");
    setNewSourceCategory("Custom");
  }

  function deleteSource(id) {
    const updated = customSources.filter(s => s.id !== id);
    setCustomSources(updated);
    localStorage.setItem("htn-custom-sources", JSON.stringify(updated));
  }

  if (!authed) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif" }}>
        <div style={{ color: COLORS.red, fontSize: "2rem", letterSpacing: "0.15em", fontWeight: 800, marginBottom: "0.25rem" }}>HTN COMMAND</div>
        <div style={{ color: COLORS.grey, fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "2rem" }}>EDITORIAL DASHBOARD</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input type="password" value={pwInput}
            onChange={e => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={e => { if (e.key === "Enter") { if (pwInput === PASSWORD) { sessionStorage.setItem("htn-authed", "1"); setAuthed(true); } else setPwError(true); } }}
            placeholder="Password"
            style={{ background: COLORS.card, border: `1px solid ${pwError ? COLORS.red : COLORS.border}`, borderRadius: "4px", color: COLORS.white, padding: "0.5rem 1rem", fontSize: "0.9rem", fontFamily: "'Barlow Condensed', sans-serif" }}
          />
          <button onClick={() => { if (pwInput === PASSWORD) { sessionStorage.setItem("htn-authed", "1"); setAuthed(true); } else setPwError(true); }}
            style={{ background: COLORS.red, color: COLORS.white, border: "none", borderRadius: "4px", padding: "0.5rem 1.2rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.08em" }}>
            ENTER
          </button>
        </div>
        {pwError && <div style={{ color: COLORS.red, fontSize: "0.75rem", marginTop: "0.5rem" }}>Incorrect password</div>}
      </div>
    );
  }

  const categories = ["All", "Mainstream", "Independent", "YouTube", "Custom"];
  const filtered = articles.filter(a => {
    const matchCat = activeFilter === "All" || a.category === activeFilter;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.source.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const heroArticle = heroId ? articles.find(a => a.id === heroId) : null;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.white, fontFamily: "'Barlow Condensed', sans-serif", padding: "1rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: "1rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", letterSpacing: "0.1em", color: COLORS.red, lineHeight: 1 }}>HTN COMMAND</h1>
          <p style={{ margin: "0.2rem 0 0", color: COLORS.grey, fontSize: "0.7rem", letterSpacing: "0.1em" }}>EDITORIAL DASHBOARD · {articles.length} STORIES LOADED</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {saveStatus === "ok" && <span style={{ color: "#4caf50", fontSize: "0.75rem", letterSpacing: "0.08em" }}>✓ PUSHED TO SITE</span>}
          {saveStatus === "error" && <span style={{ color: COLORS.orange, fontSize: "0.75rem", letterSpacing: "0.08em" }}>✕ SAVE FAILED</span>}
          <button onClick={saveFeatured} disabled={saveStatus === "saving" || (featured.length === 0 && !heroId)} style={{ background: "#1a4a1a", color: "#4caf50", border: "1px solid #4caf50", borderRadius: "4px", padding: "0.5rem 1.2rem", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em", opacity: (saveStatus === "saving" || (featured.length === 0 && !heroId)) ? 0.5 : 1 }}>
            {saveStatus === "saving" ? "⟳ PUSHING..." : "↑ PUSH TO SITE"}
          </button>
          <button onClick={fetchAll} disabled={loading} style={{ background: COLORS.red, color: COLORS.white, border: "none", borderRadius: "4px", padding: "0.5rem 1.2rem", fontSize: "0.85rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.08em", opacity: loading ? 0.7 : 1 }}>
            {loading ? "⟳ LOADING..." : "↻ REFRESH"}
          </button>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: `1px solid ${COLORS.border}` }}>
        {[["articles", "📰 ARTICLES FEED"], ["voices", "🎙 VOICES"], ["pitch", "✍ THE PITCH"]].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? COLORS.red : "transparent", color: activeTab === tab ? COLORS.white : COLORS.grey, border: "none", borderBottom: activeTab === tab ? `2px solid ${COLORS.red}` : "2px solid transparent", padding: "0.5rem 1.2rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "-1px" }}>
            {label}
          </button>
        ))}
      </div>

      {/* VOICES TAB */}
      {activeTab === "voices" && (
        <div>
          {/* Voices header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.18em", color: COLORS.grey, textTransform: "uppercase" }}>
              {voices.length} {voices.length === 1 ? "voice" : "voices"} configured
            </span>
            <button onClick={() => { setVoiceFormMode("add"); setVoiceForm({ ...EMPTY_VOICE }); }}
              style={{ background: COLORS.card, color: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "0.35rem 1rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", letterSpacing: "0.06em" }}>
              + ADD VOICE
            </button>
          </div>

          {/* Add / Edit Form */}
          {voiceForm && (
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderTop: `3px solid ${COLORS.red}`, borderRadius: "6px", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ color: COLORS.red, fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1rem" }}>
                {voiceFormMode === "add" ? "Add New Voice" : "Edit Voice"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                {[["name", "Display Name", "text", "e.g. Paul Wells"], ["photo", "Photo URL", "text", "https://..."], ["feedUrl", "RSS Feed URL", "text", "https://paulwells.substack.com/feed"]].map(([field, label, type, ph]) => (
                  <div key={field} style={{ gridColumn: field === "feedUrl" ? "1 / -1" : undefined }}>
                    <div style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.grey, textTransform: "uppercase", marginBottom: "0.3rem" }}>{label}</div>
                    <input type={type} value={voiceForm[field]} placeholder={ph}
                      onChange={e => setVoiceForm({ ...voiceForm, [field]: e.target.value })}
                      style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "4px", color: COLORS.white, padding: "0.45rem 0.75rem", fontSize: "0.85rem", fontFamily: "'Barlow Condensed', sans-serif", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              {[["bio", "Short Bio", "Brief background on this voice…"], ["whyHTN", "Why HTN Features Them", "Editorial note — why this person belongs on HTN…"]].map(([field, label, ph]) => (
                <div key={field} style={{ marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.grey, textTransform: "uppercase", marginBottom: "0.3rem" }}>{label}</div>
                  <textarea value={voiceForm[field]} placeholder={ph} rows={3}
                    onChange={e => setVoiceForm({ ...voiceForm, [field]: e.target.value })}
                    style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "4px", color: COLORS.white, padding: "0.45rem 0.75rem", fontSize: "0.85rem", fontFamily: "'Barlow Condensed', sans-serif", resize: "vertical", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button onClick={() => setVoiceForm(null)} style={{ background: "transparent", color: COLORS.grey, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "0.45rem 1rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", letterSpacing: "0.06em" }}>CANCEL</button>
                <button onClick={addOrUpdateVoice} disabled={!voiceForm.name.trim() || !voiceForm.feedUrl.trim()}
                  style={{ background: COLORS.red, color: COLORS.white, border: "none", borderRadius: "4px", padding: "0.45rem 1.2rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", opacity: !voiceForm.name.trim() || !voiceForm.feedUrl.trim() ? 0.5 : 1 }}>
                  {saveStatus === "saving" ? "⟳ SAVING..." : voiceFormMode === "add" ? "✓ SAVE VOICE" : "✓ UPDATE VOICE"}
                </button>
              </div>
            </div>
          )}

          {/* Voices List */}
          {voices.length === 0 ? (
            <div style={{ color: COLORS.grey, textAlign: "center", padding: "4rem", fontSize: "0.9rem" }}>No voices added yet. Click + ADD VOICE to get started.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {voices.map(v => (
                <div key={v.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1rem", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
                  {v.photo ? (
                    <img src={v.photo} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.card, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.grey, fontSize: "1.1rem" }}>👤</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: COLORS.white, fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.15rem" }}>{v.name}</div>
                    <div style={{ color: COLORS.grey, fontSize: "0.65rem", letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.feedUrl}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                    <button onClick={() => { setVoiceFormMode("edit"); setVoiceForm({ ...v }); }}
                      style={{ background: "transparent", color: COLORS.grey, border: `1px solid ${COLORS.border}`, borderRadius: "3px", padding: "0.25rem 0.65rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", letterSpacing: "0.05em" }}>✎ EDIT</button>
                    <button onClick={() => deleteVoice(v.id)}
                      style={{ background: "transparent", color: COLORS.grey, border: `1px solid ${COLORS.border}`, borderRadius: "3px", padding: "0.25rem 0.65rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", letterSpacing: "0.05em" }}>✕ REMOVE</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PITCH TAB */}
      {activeTab === "pitch" && (
        <div>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.18em", color: COLORS.grey, textTransform: "uppercase" }}>
              {pitchPosts.length} {pitchPosts.length === 1 ? "post" : "posts"} published
            </span>
            <button onClick={() => { setPitchFormMode("add"); setPitchForm({ ...EMPTY_PITCH }); }}
              style={{ background: COLORS.card, color: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "0.35rem 1rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", letterSpacing: "0.06em" }}>
              + NEW POST
            </button>
          </div>

          {/* Add / Edit Form */}
          {pitchForm && (
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderTop: `3px solid ${COLORS.red}`, borderRadius: "6px", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ color: COLORS.red, fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
                {pitchFormMode === "add" ? "New Post" : "Edit Post"}
              </div>

              {[["title", "Headline", "text", "Story headline…"], ["byline", "Byline", "text", "By Jane Smith"], ["photo", "Photo URL (optional)", "text", "https://…"]].map(([field, label, type, ph]) => (
                <div key={field} style={{ marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.grey, textTransform: "uppercase", marginBottom: "0.3rem" }}>{label}</div>
                  <input type={type} value={pitchForm[field]} placeholder={ph}
                    onChange={e => setPitchForm({ ...pitchForm, [field]: e.target.value })}
                    style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "4px", color: COLORS.white, padding: "0.45rem 0.75rem", fontSize: "0.88rem", fontFamily: "'Barlow Condensed', sans-serif", boxSizing: "border-box" }} />
                </div>
              ))}

              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.grey, textTransform: "uppercase", marginBottom: "0.3rem" }}>Body</div>
                <textarea value={pitchForm.body} placeholder="Write your post here…" rows={12}
                  onChange={e => setPitchForm({ ...pitchForm, body: e.target.value })}
                  style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "4px", color: COLORS.white, padding: "0.6rem 0.75rem", fontSize: "0.9rem", fontFamily: "Georgia, serif", lineHeight: 1.7, resize: "vertical", boxSizing: "border-box" }} />
                <div style={{ fontSize: "0.6rem", color: COLORS.grey, marginTop: "0.3rem", letterSpacing: "0.06em" }}>
                  Separate paragraphs with a blank line. Basic markdown: **bold**, *italic*, [text](url)
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button onClick={() => setPitchForm(null)}
                  style={{ background: "transparent", color: COLORS.grey, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "0.45rem 1rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", letterSpacing: "0.06em" }}>
                  CANCEL
                </button>
                <button onClick={addOrUpdatePitch}
                  disabled={!pitchForm.title.trim() || !pitchForm.body.trim()}
                  style={{ background: COLORS.red, color: COLORS.white, border: "none", borderRadius: "4px", padding: "0.45rem 1.2rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", opacity: !pitchForm.title.trim() || !pitchForm.body.trim() ? 0.5 : 1 }}>
                  {saveStatus === "saving" ? "⟳ SAVING…" : pitchFormMode === "add" ? "✓ PUBLISH POST" : "✓ SAVE CHANGES"}
                </button>
              </div>
            </div>
          )}

          {/* Posts list */}
          {pitchPosts.length === 0 ? (
            <div style={{ color: COLORS.grey, textAlign: "center", padding: "4rem", fontSize: "0.9rem" }}>No posts yet. Click + NEW POST to write your first.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {pitchPosts.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
                  {p.photo && <img src={p.photo} alt="" onError={e => e.target.style.display = "none"} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "4px", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: COLORS.white, fontSize: "0.92rem", fontWeight: 700, marginBottom: "0.15rem", fontFamily: "Georgia, serif" }}>{p.title}</div>
                    <div style={{ color: COLORS.grey, fontSize: "0.65rem", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>
                      {p.byline && <span>{p.byline} · </span>}
                      {p.publishedAt && <span>{new Date(p.publishedAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</span>}
                    </div>
                    <div style={{ color: COLORS.grey, fontSize: "0.75rem", letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      /the-pitch/{p.slug}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                    <button onClick={() => { setPitchFormMode("edit"); setPitchForm({ ...p }); }}
                      style={{ background: "transparent", color: COLORS.grey, border: `1px solid ${COLORS.border}`, borderRadius: "3px", padding: "0.25rem 0.65rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", letterSpacing: "0.05em" }}>✎ EDIT</button>
                    <button onClick={() => deletePitch(p.id)}
                      style={{ background: "transparent", color: COLORS.grey, border: `1px solid ${COLORS.border}`, borderRadius: "3px", padding: "0.25rem 0.65rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", letterSpacing: "0.05em" }}>✕ DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "articles" && heroArticle && (
        <div style={{ background: COLORS.hero, border: `2px solid ${COLORS.orange}`, borderRadius: "8px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
          {heroArticle.image && <img src={heroArticle.image} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: "200px", height: "130px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ background: COLORS.orange, color: COLORS.white, fontSize: "0.65rem", padding: "0.2rem 0.6rem", borderRadius: "3px", letterSpacing: "0.1em", fontWeight: 700 }}>📌 HERO STORY</span>
              <span style={{ background: "#2a2a2a", color: COLORS.white, fontSize: "0.65rem", padding: "0.2rem 0.5rem", borderRadius: "3px" }}>{heroArticle.source}</span>
              <span style={{ color: COLORS.grey, fontSize: "0.75rem" }}>{timeAgo(heroArticle.pubDate)}</span>
            </div>
            <a href={heroArticle.link} target="_blank" rel="noreferrer" style={{ color: COLORS.white, textDecoration: "none", fontSize: "1.35rem", fontWeight: 700, lineHeight: 1.25, display: "block", marginBottom: "0.5rem" }}>{heroArticle.title}</a>
            <p style={{ color: COLORS.grey, fontSize: "0.85rem", margin: "0 0 0.75rem", lineHeight: 1.5 }}>{heroArticle.description}</p>
            <button onClick={() => toggleHero(heroArticle.id)} style={{ background: "transparent", color: COLORS.grey, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "0.3rem 0.75rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.75rem", letterSpacing: "0.05em" }}>✕ CLEAR HERO</button>
          </div>
        </div>
      )}

      {activeTab === "articles" && (featured.length > 0 || heroId) && (
        <div style={{ background: "#1a1a1a", border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "0.5rem 1rem", marginBottom: "1rem", fontSize: "0.8rem", color: COLORS.grey, letterSpacing: "0.05em", display: "flex", gap: "1.5rem" }}>
          {featured.length > 0 && <span>★ <span style={{ color: COLORS.white }}>{featured.length}</span> featured for HTN</span>}
          {heroId && !heroArticle && <span style={{ color: COLORS.orange }}>📌 Hero story set (scroll to find it)</span>}
          {heroId && heroArticle && <span>📌 Hero: <span style={{ color: COLORS.orange }}>{heroArticle.source}</span></span>}
        </div>
      )}

      {activeTab === "articles" && <>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem", alignItems: "center" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveFilter(cat)} style={{ background: activeFilter === cat ? COLORS.red : "transparent", color: activeFilter === cat ? COLORS.white : COLORS.grey, border: `1px solid ${activeFilter === cat ? COLORS.red : COLORS.border}`, borderRadius: "4px", padding: "0.3rem 0.8rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", letterSpacing: "0.06em" }}>
            {cat.toUpperCase()}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stories…"
          style={{ marginLeft: "auto", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "4px", color: COLORS.white, padding: "0.3rem 0.8rem", fontSize: "0.85rem", fontFamily: "'Barlow Condensed', sans-serif", minWidth: "180px" }} />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <input value={newSourceName} onChange={e => setNewSourceName(e.target.value)} placeholder="Source name"
          style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "4px", color: COLORS.white, padding: "0.3rem 0.8rem", fontSize: "0.85rem", fontFamily: "'Barlow Condensed', sans-serif", width: "160px" }} />
        <input value={newSourceUrl}
          onChange={e => { setNewSourceUrl(e.target.value); setNewSourceCategory(detectCategory(e.target.value)); }}
          onKeyDown={e => e.key === "Enter" && addSource()} placeholder="RSS feed URL"
          style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "4px", color: COLORS.white, padding: "0.3rem 0.8rem", fontSize: "0.85rem", fontFamily: "'Barlow Condensed', sans-serif", flex: 1, minWidth: "200px" }} />
        <select value={newSourceCategory} onChange={e => setNewSourceCategory(e.target.value)}
          style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "4px", color: COLORS.white, padding: "0.3rem 0.6rem", fontSize: "0.85rem", fontFamily: "'Barlow Condensed', sans-serif" }}>
          <option value="Mainstream">Mainstream</option>
          <option value="Independent">Independent</option>
          <option value="YouTube">YouTube</option>
          <option value="Custom">Custom</option>
        </select>
        <button onClick={addSource} style={{ background: COLORS.card, color: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "0.3rem 1rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", letterSpacing: "0.05em" }}>+ ADD SOURCE</button>
      </div>

      {allSources.length > 0 && (
        <div style={{ marginBottom: "1.5rem", border: `1px solid ${COLORS.border}`, borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ background: "#1a1a1a", padding: "0.4rem 0.8rem", fontSize: "0.65rem", letterSpacing: "0.12em", color: COLORS.grey, textTransform: "uppercase" }}>
            Sources ({allSources.length})
          </div>
          {allSources.map(s => {
            const isCustom = customSources.some(c => c.id === s.id);
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.8rem", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
                <span style={{ background: COLORS.card, color: COLORS.grey, fontSize: "0.6rem", padding: "0.1rem 0.4rem", borderRadius: "3px", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{getYTId(s.url) ? "▶ VIDEO" : s.category.toUpperCase()}</span>
                <span style={{ color: COLORS.white, fontSize: "0.8rem", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                <span style={{ color: "#3a3a3a", fontSize: "0.72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "240px", display: "none" }}>{s.url}</span>
                {isCustom ? (
                  <button onClick={() => deleteSource(s.id)} style={{ background: "transparent", color: COLORS.grey, border: `1px solid ${COLORS.border}`, borderRadius: "3px", padding: "0.2rem 0.5rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", letterSpacing: "0.05em", flexShrink: 0 }}>✕ REMOVE</button>
                ) : (
                  <span style={{ color: "#2a2a2a", fontSize: "0.65rem", letterSpacing: "0.08em", flexShrink: 0 }}>BUILT-IN</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* image placeholder */}
              <div style={{ width: "100%", height: "160px", background: COLORS.border, animation: "htn-skel 1.5s ease-in-out infinite", backgroundSize: "600px 100%", backgroundImage: `linear-gradient(90deg,${COLORS.border} 25%,#333 50%,${COLORS.border} 75%)` }} />
              <div style={{ padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {/* source + date row */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                  <div style={{ height: 14, width: "32%", borderRadius: 3, background: COLORS.border, animation: "htn-skel 1.5s ease-in-out infinite", backgroundSize: "600px 100%", backgroundImage: `linear-gradient(90deg,${COLORS.border} 25%,#333 50%,${COLORS.border} 75%)` }} />
                  <div style={{ height: 14, width: "18%", borderRadius: 3, background: COLORS.border, animation: "htn-skel 1.5s ease-in-out infinite", backgroundSize: "600px 100%", backgroundImage: `linear-gradient(90deg,${COLORS.border} 25%,#333 50%,${COLORS.border} 75%)` }} />
                </div>
                {/* title lines */}
                <div style={{ height: 16, width: "92%", borderRadius: 3, background: COLORS.border, animation: "htn-skel 1.5s ease-in-out infinite", backgroundSize: "600px 100%", backgroundImage: `linear-gradient(90deg,${COLORS.border} 25%,#333 50%,${COLORS.border} 75%)` }} />
                <div style={{ height: 16, width: "68%", borderRadius: 3, background: COLORS.border, animation: "htn-skel 1.5s ease-in-out infinite", backgroundSize: "600px 100%", backgroundImage: `linear-gradient(90deg,${COLORS.border} 25%,#333 50%,${COLORS.border} 75%)` }} />
                {/* description lines */}
                <div style={{ height: 12, width: "96%", borderRadius: 3, background: COLORS.border, animation: "htn-skel 1.5s ease-in-out infinite", backgroundSize: "600px 100%", backgroundImage: `linear-gradient(90deg,${COLORS.border} 25%,#333 50%,${COLORS.border} 75%)` }} />
                <div style={{ height: 12, width: "80%", borderRadius: 3, background: COLORS.border, animation: "htn-skel 1.5s ease-in-out infinite", backgroundSize: "600px 100%", backgroundImage: `linear-gradient(90deg,${COLORS.border} 25%,#333 50%,${COLORS.border} 75%)` }} />
                {/* button row */}
                <div style={{ marginTop: "0.4rem", height: 30, width: "100%", borderRadius: 4, background: COLORS.border, animation: "htn-skel 1.5s ease-in-out infinite", backgroundSize: "600px 100%", backgroundImage: `linear-gradient(90deg,${COLORS.border} 25%,#333 50%,${COLORS.border} 75%)` }} />
              </div>
            </div>
          ))}
          <style>{`@keyframes htn-skel{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ color: COLORS.grey, textAlign: "center", padding: "4rem", fontSize: "1rem" }}>No stories match your filter.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {filtered.map(article => {
            const isFeatured = featured.includes(article.id);
            const isHero = heroId === article.id;
            return (
              <div key={article.id} style={{ background: COLORS.card, border: `1px solid ${isHero ? COLORS.orange : isFeatured ? COLORS.red : COLORS.border}`, borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {article.image && <img src={article.image} alt="" onError={e => { e.target.style.display = "none"; }} style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }} />}
                <div style={{ padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.45rem", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <span style={{ background: isHero ? COLORS.orange : COLORS.red, color: COLORS.white, fontSize: "0.62rem", padding: "0.18rem 0.5rem", borderRadius: "3px", letterSpacing: "0.08em", whiteSpace: "nowrap", fontWeight: 700 }}>{isHero ? "📌 HERO" : article.source}</span>
                    <span style={{ color: COLORS.grey, fontSize: "0.72rem", whiteSpace: "nowrap" }}>{timeAgo(article.pubDate)}</span>
                  </div>
                  <a href={article.link} target="_blank" rel="noreferrer" style={{ color: COLORS.white, textDecoration: "none", fontSize: "0.97rem", fontWeight: 600, lineHeight: 1.3 }}>{article.title}</a>
                  {article.description && <p style={{ color: COLORS.grey, fontSize: "0.78rem", margin: 0, lineHeight: 1.5 }}>{article.description}</p>}
                  <div style={{ marginTop: "auto", paddingTop: "0.5rem", display: "flex", gap: "0.4rem" }}>
                    <button onClick={() => isFeatured ? removeFeatured(article.id) : setNoteModal({ article, note: notes[article.id]?.note || "", category: notes[article.id]?.category || "politics" })} style={{ flex: 1, background: isFeatured ? COLORS.red : "transparent", color: isFeatured ? COLORS.white : COLORS.grey, border: `1px solid ${isFeatured ? COLORS.red : COLORS.border}`, padding: "0.4rem", borderRadius: "4px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.78rem", letterSpacing: "0.05em" }}>
                      {isFeatured ? "★ FEATURED" : "☆ FEATURE THIS"}
                    </button>
                    <button onClick={() => toggleHero(article.id)} title={isHero ? "Remove as hero story" : "Set as hero story"} style={{ background: isHero ? COLORS.orange : "transparent", color: isHero ? COLORS.white : COLORS.grey, border: `1px solid ${isHero ? COLORS.orange : COLORS.border}`, padding: "0.4rem 0.65rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>📌</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CURATOR NOTE MODAL */}
      {noteModal && (
        <div onClick={() => setNoteModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderTop: `3px solid ${COLORS.red}`, borderRadius: "6px", padding: "1.5rem", width: "100%", maxWidth: "520px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ color: COLORS.red, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Curator Note</div>
              <div style={{ color: COLORS.white, fontSize: "0.92rem", fontWeight: 600, lineHeight: 1.3, marginBottom: "0.2rem" }}>{noteModal.article.title}</div>
              <div style={{ color: COLORS.grey, fontSize: "0.72rem" }}>{noteModal.article.source}</div>
            </div>
            <div>
              <div style={{ color: COLORS.grey, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.35rem", fontFamily: "'Barlow Condensed', sans-serif" }}>Category</div>
              <select
                value={noteModal.category}
                onChange={e => setNoteModal({ ...noteModal, category: e.target.value })}
                style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "4px", color: COLORS.white, padding: "0.5rem 0.75rem", fontSize: "0.85rem", fontFamily: "'Barlow Condensed', sans-serif", width: "100%", outline: "none" }}
              >
                {ARTICLE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <textarea
              autoFocus
              value={noteModal.note}
              onChange={e => setNoteModal({ ...noteModal, note: e.target.value })}
              placeholder="Why does this story matter? Add context for HTN readers…"
              style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "4px", color: COLORS.white, padding: "0.75rem", fontSize: "0.88rem", fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1.55, resize: "vertical", minHeight: "120px", outline: "none" }}
            />
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button onClick={() => setNoteModal(null)} style={{ background: "transparent", color: COLORS.grey, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "0.45rem 1rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", letterSpacing: "0.06em" }}>
                CANCEL
              </button>
              <button onClick={() => confirmFeature(noteModal.article, noteModal.note, noteModal.category)} style={{ background: COLORS.red, color: COLORS.white, border: "none", borderRadius: "4px", padding: "0.45rem 1.2rem", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em" }}>
                ★ FEATURE THIS STORY
              </button>
            </div>
          </div>
        </div>
      )}
      </>}

    </div>
  );
}
