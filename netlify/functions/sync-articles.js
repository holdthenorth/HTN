/**
 * Netlify serverless function — POST /api/sync-articles
 *
 * Proxies write requests to JSONBin server-side so the master key is
 * never exposed in the browser bundle and the free-plan PUT restriction
 * (which blocks browser-origin requests) is bypassed.
 *
 * Expected request body: { articles: [...], voices: [...], pitchPosts: [...] }
 */

exports.handler = async (event) => {
  // Read env vars inside the handler so they are always fresh.
  // .trim() prevents issues with accidental trailing whitespace/newlines from Netlify UI paste.
  const JSONBIN_ID  = (process.env.VITE_JSONBIN_ID  || "69ce762aaaba882197bac5e8").trim();
  const JSONBIN_KEY = (process.env.VITE_JSONBIN_KEY || "").trim();

  // Allow CORS pre-flight from any origin (e.g. local dev)
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
    // Surface JSONBin's error body so it's visible in function logs and caller.
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
