exports.handler = async function(event) {
  const url = event.queryStringParameters?.url;
  if (!url) {
    return { statusCode: 400, body: "Missing url parameter" };
  }
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "HTN-News/1.0" }
    });
    const text = await response.text();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml",
        "Access-Control-Allow-Origin": "*",
      },
      body: text,
    };
  } catch (err) {
    return { statusCode: 500, body: "Fetch failed: " + err.message };
  }
};