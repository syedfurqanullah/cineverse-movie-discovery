// Netlify Function: tmdb
// Proxies allowed TMDB API endpoints and keeps TMDB_API_KEY on the server.

const TMDB_BASE = "https://api.themoviedb.org/3";

exports.handler = async function (event) {
  try {
    const key = process.env.TMDB_API_KEY;

    if (!key) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "TMDB_API_KEY is not configured on the server.",
        }),
      };
    }

    const qs = event.queryStringParameters || {};
    const endpoint = qs.endpoint;

    if (!endpoint || typeof endpoint !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing or invalid 'endpoint' parameter.",
        }),
      };
    }

    // Basic validation: only allow trusted TMDB path roots and prevent traversal.
    if (
      !endpoint.startsWith("/") ||
      endpoint.startsWith("//") ||
      endpoint.includes("..") ||
      endpoint.includes("://") ||
      endpoint.includes("\\")
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid endpoint.",
        }),
      };
    }

    const allowedRoot =
      /^\/(trending|movie|search|genre|discover|tv|person|configuration|collection|company)(\/.*)?$/;

    if (!allowedRoot.test(endpoint)) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "Endpoint not allowed.",
        }),
      };
    }

    // Build TMDB request URL and include only allowed query params.
    const allowedParams = new Set([
      "language",
      "page",
      "query",
      "include_adult",
      "include_video",
      "sort_by",
      "with_genres",
      "primary_release_year",
      "vote_count.gte",
    ]);

    const url = new URL(`${TMDB_BASE}${endpoint}`);

    const search = new URLSearchParams();

    // API key stays on the server.
    search.set("api_key", key);

    for (const [k, v] of Object.entries(qs)) {
      if (k === "endpoint") continue;

      if (allowedParams.has(k) && v != null) {
        search.set(k, v);
      }
    }

    url.search = search.toString();

    const res = await fetch(url.toString(), {
      method: "GET",
    });

    const body = await res.text();

    return {
      statusCode: res.status,
      headers: {
        "Content-Type":
          res.headers.get("content-type") || "application/json",
      },
      body,
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: err.message,
      }),
    };
  }
};