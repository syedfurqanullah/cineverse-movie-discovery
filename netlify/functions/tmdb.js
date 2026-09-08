// Netlify Function: tmdb
// Proxies allowed TMDB API endpoints and keeps TMDB_API_KEY on the server.

const fs = require("fs");
const path = require("path");

const TMDB_BASE = "https://api.themoviedb.org/3";

function resolveTmdbApiKey() {
  const configuredKey = process.env.TMDB_API_KEY?.trim();
  if (configuredKey) {
    return configuredKey;
  }

  try {
    const envPath = path.resolve(__dirname, "..", "..", ".env");
    const envFile = fs.readFileSync(envPath, "utf8");
    const match = envFile
      .split(/\r?\n/)
      .find((line) => line.startsWith("TMDB_API_KEY="));

    if (match) {
      const parsedKey = match.split("=").slice(1).join("=").trim();
      if (parsedKey) {
        process.env.TMDB_API_KEY = parsedKey;
        return parsedKey;
      }
    }
  } catch (error) {
    // Ignore missing .env during hosted Netlify runtime - process.env is the source of truth there.
  }

  return "";
}

exports.handler = async function (event) {
  try {
    const key = resolveTmdbApiKey();
    const placeholderValues = [
      "replace_with_your_tmdb_api_key",
      "your_tmdb_api_key_here",
      "",
    ];

    if (!key || placeholderValues.includes(key.trim())) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error:
            "TMDB_API_KEY is missing or still using the placeholder value. Add a valid key in your local .env or Netlify environment.",
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
        "Content-Type": res.headers.get("content-type") || "application/json",
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
