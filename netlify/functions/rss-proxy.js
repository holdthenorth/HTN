/**
 * Netlify serverless function — GET /.netlify/functions/rss-proxy?url=<encoded>
 *
 * Server-side RSS proxy. Fetches any feed URL and returns the raw XML with
 * CORS headers so the browser can read cross-origin feeds (e.g. Substack)
 * without being blocked.
 *
 * Substack blocks rss2json and returns CORS errors on direct browser fetches,
 * so all Substack feed URLs in RSSDashboard.jsx route through here instead.
 */

exports.handler = async function (event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  const feedUrl = event.queryStringParameters?.url;

  if (!feedUrl) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing url parameter" }),
    };
  }

  if (!feedUrl.startsWith("http://") && !feedUrl.startsWith("https://")) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Only http/https URLs are allowed" }),
    };
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HTN-News/1.0; +https://holdthenorth.news)",
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Feed returned ${response.status}` }),
      };
    }

    const text = await response.text();
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Upstream fetch failed", detail: err.message }),
    };
  }
};
