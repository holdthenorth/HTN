const https = require("https");
const http = require("http");

const SOURCES = [
  { id: "cbc-top",      name: "CBC Top Stories",                      category: "Mainstream",    url: "https://rss.cbc.ca/lineup/topstories.xml" },
  { id: "cbc-pol",      name: "CBC Politics",                         category: "Mainstream",    url: "https://rss.cbc.ca/lineup/politics.xml" },
  { id: "global",       name: "Global News",                          category: "Mainstream",    url: "https://globalnews.ca/feed/" },
  { id: "observer",     name: "National Observer",                    category: "Independent",   url: "https://www.nationalobserver.com/front/rss" },
  { id: "htn-substack", name: "Hold the North",                       category: "Independent",   url: "https://holdthenorth.substack.com/feed" },
  { id: "angus",        name: "Charlie Angus",                        category: "Independent",   url: "https://charlieangus.substack.com/feed" },
  { id: "gilmore",      name: "Rachel Gilmore",                       category: "Independent",   url: "https://rachelgilmore.substack.com/feed" },
  { id: "wells",        name: "Paul Wells",                           category: "Independent",   url: "https://paulwells.substack.com/feed" },
  { id: "moscrop",      name: "David Moscrop",                        category: "Independent",   url: "https://davidmoscrop.substack.com/feed" },
  { id: "emmett",       name: "Emmett Macfarlane",                    category: "Independent",   url: "https://emmettmacfarlane.substack.com/feed" },
  { id: "ling",         name: "Justin Ling",                          category: "Independent",   url: "https://justinling.substack.com/feed" },
  { id: "glavin",       name: "Terry Glavin",                         category: "Independent",   url: "https://therealstory.substack.com/feed" },
  { id: "rabble",       name: "Rabble.ca",                            category: "Independent",   url: "https://rabble.ca/feed" },
  { id: "amnesty",      name: "Amnesty International",                category: "On the Ground", url: "https://www.amnesty.org/en/feed/" },
  { id: "hrw",          name: "Human Rights Watch",                   category: "On the Ground", url: "https://www.hrw.org/rss/news" },
  { id: "ccla",         name: "Canadian Civil Liberties Association", category: "On the Ground", url: "https://ccla.org/feed/" },
];

const RSS2JSON_KEY = process.env.VITE_RSS2JSON_API_KEY || "exemphyhi6xvldxk8dmrtjpdrxxfrr2o0nnoau54";
const JSONBIN_KEY = (process.env.VITE_JSONBIN_KEY || "").trim();
const RSS_CACHE_BIN_ID = (process.env.VITE_RSS_CACHE_BIN_ID || "").trim();

// Follows redirects up to 5 hops using Node built-ins (no fetch needed for Substack)
function fetchUrl(rawUrl, redirectsLeft) {
  if (redirectsLeft === undefined) redirectsLeft = 5;
  return new Promise(function (resolve, reject) {
    var parsed;
    try { parsed = new URL(rawUrl); } catch (e) { return reject(new Error("Invalid URL: " + rawUrl)); }
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
      res.on("end", function () { resolve({ statusCode: res.statusCode, body: Buffer.concat(chunks).toString("utf8") }); });
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(10000, function () { req.destroy(new Error("Timed out")); });
    req.end();
  });
}

// Parses RSS 2.0 XML with regex — sufficient for Substack's standard feed format
function parseRssItems(xml, source) {
  var items = [];
  var itemRegex = /<item>([\s\S]*?)<\/item>/g;
  var match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
    var block = match[1];
    var getTag = function (tag) {
      var m = block.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">"));
      return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() : "";
    };
    var link = getTag("link") || getTag("guid");
    var title = getTag("title");
    if (!link || !title) continue;
    var rawDesc = getTag("description");
    var description = rawDesc.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 160);
    var enclosureMatch = block.match(/<enclosure[^>]*url="([^"]*)"[^>]*>/);
    items.push({
      id: link,
      title: title,
      link: link,
      pubDate: getTag("pubDate"),
      description: description,
      image: enclosureMatch ? enclosureMatch[1] : null,
      ytId: null,
      source: source.name,
      category: source.category,
    });
  }
  return items;
}

async function fetchSourceItems(source) {
  if (source.url.includes("substack.com")) {
    var result = await fetchUrl(source.url);
    if (result.statusCode >= 200 && result.statusCode < 300) {
      return parseRssItems(result.body, source);
    }
    return [];
  }
  // rss2json for all other feeds — fetch is a Node 22 global, no import needed
  var res = await fetch(
    "https://api.rss2json.com/v1/api.json?api_key=" + RSS2JSON_KEY +
    "&rss_url=" + encodeURIComponent(source.url) + "&count=8"
  );
  var data = await res.json();
  if (!data.items) return [];
  return data.items
    .filter(function (item) { return item && (item.link || item.guid); })
    .map(function (item) {
      var link = item.link || item.guid || item.id || "";
      var rawDesc = typeof item.description === "string" ? item.description : "";
      return {
        id: link,
        title: item.title || "",
        link: link,
        pubDate: item.pubDate || "",
        description: rawDesc.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 160),
        image: (typeof item.thumbnail === "string" && item.thumbnail) || null,
        ytId: null,
        source: source.name,
        category: source.category,
      };
    });
}

exports.handler = async function (event) {
  if (!JSONBIN_KEY || !RSS_CACHE_BIN_ID) {
    console.error("[refresh-rss-cache] Missing VITE_JSONBIN_KEY or VITE_RSS_CACHE_BIN_ID env vars");
    return { statusCode: 500, body: "Missing env vars" };
  }

  var allItems = [];
  var results = await Promise.allSettled(SOURCES.map(function (source) {
    return fetchSourceItems(source).then(function (items) {
      items.forEach(function (item) { allItems.push(item); });
    });
  }));

  var failed = results.filter(function (r) { return r.status === "rejected"; }).length;
  if (failed > 0) console.warn("[refresh-rss-cache] " + failed + " sources failed");

  // Sort newest-first and deduplicate by id
  allItems.sort(function (a, b) {
    var da = a.pubDate ? new Date(a.pubDate) : null;
    var db = b.pubDate ? new Date(b.pubDate) : null;
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return db - da;
  });
  var seen = new Set();
  var deduped = allItems.filter(function (a) {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  var writeRes = await fetch("https://api.jsonbin.io/v3/b/" + RSS_CACHE_BIN_ID, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": JSONBIN_KEY,
      "X-Bin-Versioning": "false",
    },
    body: JSON.stringify({ articles: deduped, updatedAt: new Date().toISOString() }),
  });

  if (!writeRes.ok) {
    var errText = await writeRes.text();
    console.error("[refresh-rss-cache] JSONBin write failed:", writeRes.status, errText);
    return { statusCode: 502, body: "JSONBin write failed: " + writeRes.status };
  }

  console.log("[refresh-rss-cache] wrote " + deduped.length + " articles to bin " + RSS_CACHE_BIN_ID);
  return { statusCode: 200, body: "OK: " + deduped.length + " articles cached" };
};
