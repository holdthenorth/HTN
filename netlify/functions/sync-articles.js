/**
 * Netlify serverless function — POST /api/sync-articles
 *
 * Proxies write requests to JSONBin server-side so the master key is
 * never exposed in the browser bundle and the free-plan PUT restriction
 * (which blocks browser-origin requests) is bypassed.
 *
 * Expected request body: { articles: [...], voices: [...], pitchPosts: [...] }
 */

const JSONBIN_ID  = process.env.VITE_JSONBIN_ID  || "69ce762aaaba882197bac5e8";
const JSONBIN_KEY = process.env.VITE_JSONBIN_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!JSONBIN_KEY) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "VITE_JSONBIN_KEY env var not set" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": JSONBIN_KEY,
      "X-Bin-Versioning": "false",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  return {
    statusCode: res.status,
    headers: { "Content-Type": "application/json" },
    body: text,
  };
};
