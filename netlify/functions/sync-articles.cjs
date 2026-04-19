/**
 * Netlify serverless function — POST /api/sync-articles
 *
 * Proxies write requests to JSONBin server-side so the master key is
 * never exposed in the browser bundle and the free-plan PUT restriction
 * (which blocks browser-origin requests) is bypassed.
 *
 * Expected request body: { articles: [...], voices: [...], pitchPosts: [...] }
 *
 * One-time cleanup: on every write the function reads the current JSONBin
 * state server-side, strips articles older than 10 days from both the
 * existing bin and the incoming payload, merges them (deduped), then writes
 * the result. This purges any stale articles that pre-date the client-side
 * filter and ensures the bin never grows unbounded.
 */

const CUTOFF_MS = 10 * 24 * 60 * 60 * 1000; // 10 days in ms

function isRecent(article) {
  if (!article.pubDate) return true; // no date — keep
  const d = new Date(article.pubDate);
  return isNaN(d.getTime()) || d.getTime() >= Date.now() - CUTOFF_MS;
}

exports.handler = async (event) => {
  // Read env vars inside the handler so they are always fresh.
  // .trim() prevents issues with accidental trailing whitespace/newlines from Netlify UI paste.
  const JSONBIN_ID  = (process.env.VITE_JSONBIN_ID  || "69ce762aaaba882197bac5e8").trim();
  const JSONBIN_KEY = (process.env.VITE_JSONBIN_KEY || "").trim();

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  if (!JSONBIN_KEY || JSONBIN_KEY === "undefined") {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "VITE_JSONBIN_KEY env var not set on Netlify" }),
    };
  }

  console.log(`[sync-articles] key length=${JSONBIN_KEY.length} bin=${JSONBIN_ID}`);

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // ── Server-side cleanup ──────────────────────────────────────────────────
  // Read the current bin, filter out old articles, merge with the incoming
  // payload (also filtered), dedup by id/link. This purges stale articles
  // that accumulated before the 10-day filter was introduced.
  let existingArticles = [];
  try {
    const readRes = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_KEY },
    });
    if (readRes.ok) {
      const data = await readRes.json();
      existingArticles = (data.record?.articles || []).filter(isRecent);
      console.log(`[sync-articles] existing after filter: ${existingArticles.length}`);
    }
  } catch (e) {
    // Read failed — proceed with incoming payload only, do not abort the write.
    console.warn("[sync-articles] could not read current bin for cleanup:", e.message);
  }

  // Filter incoming articles then merge with existing, incoming takes priority
  // (it carries up-to-date curatorNote / category fields).
  const incomingArticles = (payload.articles || []).filter(isRecent);
  const seenKeys = new Set();
  const merged = [];
  for (const a of [...incomingArticles, ...existingArticles]) {
    const key = a.id || a.link;
    if (key && seenKeys.has(key)) continue;
    if (key) seenKeys.add(key);
    merged.push(a);
  }

  console.log(`[sync-articles] incoming=${incomingArticles.length} existing=${existingArticles.length} merged=${merged.length}`);
  payload.articles = merged;

  // ─────────────────────────────────────────────────────────────────────────

  const bodyStr = JSON.stringify(payload);
  console.log(`[sync-articles] payload bytes=${bodyStr.length}`);

  const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": JSONBIN_KEY,
      "X-Bin-Versioning": "false",
    },
    body: bodyStr,
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(`[sync-articles] JSONBin PUT ${res.status}:`, text);
    return {
      statusCode: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: `JSONBin returned ${res.status}`, detail: text }),
    };
  }

  return {
    statusCode: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: text,
  };
};
