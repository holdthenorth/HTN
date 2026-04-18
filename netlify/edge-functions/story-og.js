/**
 * Netlify Edge Function — /story/:id OG tag injector
 *
 * Intercepts requests to story pages, fetches the article from JSONBin,
 * and injects per-article Open Graph + Twitter Card meta tags into the HTML
 * before it reaches the browser (or crawler). Runs on Deno.
 *
 * Environment variables required (set in Netlify dashboard):
 *   VITE_JSONBIN_ID  — JSONBin bin ID
 *   VITE_JSONBIN_KEY — JSONBin master key
 */

const SITE_URL       = "https://holdthenorth.news";
const FALLBACK_IMAGE = `${SITE_URL}/htnleafgooglenews.png`;
const JSONBIN_TIMEOUT_MS = 4000;

// ---------------------------------------------------------------------------
// Helpers (must match logic in App.jsx / StoryPage.jsx)
// ---------------------------------------------------------------------------

/** Decode URL-safe base64 storyId back to the original source URL. */
function decodeStorySlug(slug) {
  if (!slug) return "";
  try {
    const b64    = slug.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
    const decoded = atob(padded);
    // If it was percent-encoded before base64 (non-Latin1 fallback), decode again
    return decoded.startsWith("http") ? decoded : decodeURIComponent(decoded);
  } catch {
    try { return decodeURIComponent(slug); } catch { return ""; }
  }
}

/** Find an article in the list by matching the decoded source URL. */
function findArticle(articles, sourceUrl) {
  if (!sourceUrl || !articles?.length) return null;
  const norm   = u => (u || "").replace(/\/$/, "").toLowerCase();
  const target = norm(sourceUrl);
  return articles.find(a => norm(a.id) === target || norm(a.link) === target) || null;
}

/** Strip HTML tags and collapse whitespace. */
function stripHtml(str) {
  return (str || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Escape a value for safe use inside an HTML attribute. */
function esc(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Ensure an image URL is absolute and uses https://.
 * Protocol-relative URLs (//cdn.example.com/...) and relative paths
 * are not accepted by Bluesky / X card validators.
 */
function absoluteImage(url) {
  if (!url || typeof url !== "string") return FALLBACK_IMAGE;
  if (url.startsWith("https://")) return url;
  if (url.startsWith("http://"))  return url.replace("http://", "https://");
  if (url.startsWith("//"))       return `https:${url}`;
  return FALLBACK_IMAGE; // relative or data URLs — use site fallback
}

// ---------------------------------------------------------------------------
// Edge function handler
// ---------------------------------------------------------------------------

export default async function handler(request, context) {
  const url     = new URL(request.url);
  const parts   = url.pathname.split("/").filter(Boolean); // ["story", "<id>"]
  const storyId = parts[1];

  if (!storyId) return context.next();

  // Decode the URL-safe base64 slug to the original source URL
  const sourceUrl = decodeStorySlug(storyId);
  if (!sourceUrl || !sourceUrl.startsWith("http")) return context.next();

  // Read env vars (available in Netlify edge functions via Deno.env)
  const JSONBIN_ID  = Deno.env.get("VITE_JSONBIN_ID") || "69ce762aaaba882197bac5e8";
  const JSONBIN_KEY = Deno.env.get("VITE_JSONBIN_KEY");
  if (!JSONBIN_KEY) return context.next();

  // Fetch article list from JSONBin with a hard timeout
  let article = null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), JSONBIN_TIMEOUT_MS);
    const res = await fetch(
      `https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`,
      { headers: { "X-Master-Key": JSONBIN_KEY }, signal: controller.signal }
    );
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      article = findArticle(data.record?.articles || [], sourceUrl);
    }
  } catch {
    // JSONBin unreachable or timed out — serve the plain SPA page
    return context.next();
  }

  // No matching article — serve the normal SPA page
  if (!article) return context.next();

  // Fetch the SPA index.html (what Netlify would normally serve for this route)
  const spaResponse = await context.next();
  let html = await spaResponse.text();

  // Build per-article values
  const canonicalUrl = `${SITE_URL}/story/${storyId}`;
  const title        = article.title || "Hold the North";
  const desc         = stripHtml(article.description || "").slice(0, 300);
  const image        = absoluteImage(
    article.image || article.thumbnail || article.urlToImage || article.imageUrl
  ); // guaranteed https:// absolute URL

  // Replace <title>
  html = html.replace(
    /(<title>)[^<]*(<\/title>)/,
    `$1${esc(title)} — Hold the North$2`
  );

  // Replace canonical link href
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${esc(canonicalUrl)}$2`
  );

  // Remove ALL existing og: and twitter: meta tags — then reinject a clean set.
  // This is more reliable than per-tag regex replacement: no risk of attribute-order
  // mismatches, leftover stale values, or og:image:width / og:image:height confusion.
  html = html.replace(/<meta\s+property="og:[^>]*>/g, "");
  html = html.replace(/<meta\s+name="twitter:[^>]*>/g, "");

  const ogBlock = [
    `<meta property="og:type"        content="article">`,
    `<meta property="og:site_name"   content="Hold the North">`,
    `<meta property="og:locale"      content="en_CA">`,
    `<meta property="og:title"       content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:image"       content="${esc(image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:url"         content="${esc(canonicalUrl)}">`,
    `<meta name="twitter:card"        content="summary_large_image">`,
    `<meta name="twitter:site"        content="@holdthenorth">`,
    `<meta name="twitter:title"       content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image"       content="${esc(image)}">`,
  ].join("\n    ");

  html = html.replace("</head>", `    ${ogBlock}\n  </head>`);

  // Pass through original status + headers, update content-type
  const headers = new Headers(spaResponse.headers);
  headers.set("content-type", "text/html; charset=utf-8");

  return new Response(html, {
    status: spaResponse.status,
    headers,
  });
}

/** Declare which paths this edge function handles. */
export const config = { path: "/story/*" };
