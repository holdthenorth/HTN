const https = require("https");
const http = require("http");
const { URL } = require("url");

function fetchUrl(rawUrl, redirectsLeft) {
  if (redirectsLeft === undefined) redirectsLeft = 5;
  return new Promise(function (resolve, reject) {
    var parsed;
    try { parsed = new URL(rawUrl); } catch (e) { return reject(new Error("Invalid URL")); }

    var mod = parsed.protocol === "https:" ? https : http;
    var options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HTN-News/1.0; +https://holdthenorth.news)",
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    };

    var req = mod.request(options, function (res) {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && redirectsLeft > 0) {
        res.resume();
        return resolve(fetchUrl(res.headers.location, redirectsLeft - 1));
      }
      var chunks = [];
      res.on("data", function (chunk) { chunks.push(chunk); });
      res.on("end", function () {
        resolve({ statusCode: res.statusCode, body: Buffer.concat(chunks).toString("utf8") });
      });
      res.on("error", reject);
    });

    req.on("error", reject);
    req.setTimeout(8000, function () { req.destroy(new Error("Request timed out")); });
    req.end();
  });
}

exports.handler = async function (event) {
  var cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  var feedUrl = (event.queryStringParameters || {}).url;

  if (!feedUrl) {
    return {
      statusCode: 400,
      headers: Object.assign({}, cors, { "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "Missing url parameter" }),
    };
  }

  if (!feedUrl.startsWith("http://") && !feedUrl.startsWith("https://")) {
    return {
      statusCode: 400,
      headers: Object.assign({}, cors, { "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "Only http/https URLs are allowed" }),
    };
  }

  try {
    var result = await fetchUrl(feedUrl);
    if (result.statusCode < 200 || result.statusCode >= 300) {
      return {
        statusCode: result.statusCode,
        headers: Object.assign({}, cors, { "Content-Type": "application/json" }),
        body: JSON.stringify({ error: "Feed returned " + result.statusCode }),
      };
    }
    return {
      statusCode: 200,
      headers: Object.assign({}, cors, {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
      }),
      body: result.body,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: Object.assign({}, cors, { "Content-Type": "application/json" }),
      body: JSON.stringify({ error: "Fetch failed", detail: err.message }),
    };
  }
};
