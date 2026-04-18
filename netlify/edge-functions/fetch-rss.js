/**
 * Netlify Edge Function — /fetch-rss?url=<encoded-feed-url>
 *
 * Server-side RSS proxy. Fetches the requested feed URL and returns the
 * raw response body with CORS headers so the browser can read cross-origin
 * feeds (e.g. Substack) without hitting CORS restrictions.
 *
 * Runs on Deno at the CDN edge — no cold-start penalty.
 */

export default async function handler(request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const { searchParams } = new URL(request.url);
  const feedUrl = searchParams.get("url");

  if (!feedUrl) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let url;
  try {
    url = new URL(feedUrl);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid url parameter" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Only proxy http/https URLs
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return new Response(JSON.stringify({ error: "Only http/https URLs are allowed" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const upstream = await fetch(feedUrl, {
      headers: { "User-Agent": "HTN-News/1.0 (RSS reader)" },
    });

    const body = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "application/xml";

    return new Response(body, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": contentType },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Upstream fetch failed", detail: err.message }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

export const config = { path: "/fetch-rss" };
