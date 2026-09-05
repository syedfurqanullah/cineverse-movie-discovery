/* =========================================================
   CINEVERSE - API SERVICE
   TMDB API communication using the browser Fetch API
   ========================================================= */

/* =========================================================
   01. API CONFIGURATION
   Keep the key restricted from the TMDB dashboard for deployed demos.
   ========================================================= */

const API_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
const API_KEY = "";

// Prefer runtime-provided key. Fallback to environment in local dev (not recommended).
const REQUEST_TIMEOUT = 10000;

// NOTE: The app requires a runtime-provided TMDB API key. Provide it before loading `script.js`.
// Set `window.__CINEVERSE_API_KEY__ = 'your_key'` or `localStorage.setItem('CINEVERSE_API_KEY', 'your_key')`.
// No hard-coded fallback key is used for production safety.

// Simple in-memory cache with TTL and size limit to avoid unbounded growth
const responseCache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const CACHE_MAX_ENTRIES = 300;

/* =========================================================
   02. FETCH REQUEST HELPER
   Adds shared query params, timeout handling and in-memory caching.
   ========================================================= */

async function request(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  // read API key at request-time so runtime injection works
  const key = API_KEY

  if (!key) {
    throw new Error(
      "Missing TMDB API key. Set window.__CINEVERSE_API_KEY__ or localStorage.CINEVERSE_API_KEY before loading the app.",
    );
  }

  const searchParams = new URLSearchParams({
    api_key: key,
    language: "en-US",
    ...params,
  });

  url.search = searchParams.toString();
  const cacheKey = url.toString();

  // Check cache and TTL
  if (responseCache.has(cacheKey)) {
    const entry = responseCache.get(cacheKey);
    const age = Date.now() - entry.ts;

    if (entry.promise) {
      return entry.promise;
    }

    if (entry.data && age < CACHE_TTL) {
      return entry.data;
    }

    // stale entry
    responseCache.delete(cacheKey);
  }

  // Evict if too many entries
  if (responseCache.size >= CACHE_MAX_ENTRIES) {
    // remove oldest entry
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  // Helper to perform fetch with limited retries for transient errors (e.g., 429)
  const fetchWithRetries = async (attempts = 3, backoff = 350) => {
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.status === 429 && attempts > 0) {
        // rate limited — wait and retry
        await new Promise((r) => setTimeout(r, backoff));
        return fetchWithRetries(attempts - 1, backoff * 2);
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const msg = `API request failed with status ${res.status} ${text}`;
        const error = new Error(msg);
        error.status = res.status;
        throw error;
      }

      const data = await res.json();
      return data;
    } catch (err) {
      // rethrow for outer logic
      throw err;
    }
  };

  const fetchPromise = fetchWithRetries()
    .then((data) => {
      responseCache.set(cacheKey, { data, ts: Date.now() });
      return data;
    })
    .catch((error) => {
      responseCache.delete(cacheKey);
      throw error;
    });

  // store pending promise
  responseCache.set(cacheKey, { promise: fetchPromise, ts: Date.now() });

  return fetchPromise;
}

/* =========================================================
   03. HOME MOVIE SECTIONS
   ========================================================= */

export async function getTrendingMovies(page = 1) {
  return request("/trending/movie/week", {
    page: String(page),
  });
}

export async function getPopularMovies(page = 1) {
  return request("/movie/popular", {
    page: String(page),
  });
}

export async function getTopRatedMovies(page = 1) {
  return request("/movie/top_rated", {
    page: String(page),
  });
}

export async function getUpcomingMovies(page = 1) {
  return request("/movie/upcoming", {
    page: String(page),
  });
}

/* =========================================================
   04. DISCOVERY AND SEARCH
   ========================================================= */

export async function getMovieGenres() {
  return request("/genre/movie/list");
}

export async function discoverMovies(params = {}) {
  return request("/discover/movie", {
    sort_by: params.sortBy || "popularity.desc",
    page: String(params.page || 1),
    include_adult: "false",
    include_video: "false",
    "vote_count.gte": "80",
    ...(params.genreId ? { with_genres: params.genreId } : {}),
    ...(params.year ? { primary_release_year: params.year } : {}),
  });
}

export async function searchMovies(query, page = 1) {
  return request("/search/movie", {
    query: query.trim(),
    page: String(page),
    include_adult: "false",
  });
}

/* =========================================================
   05. MOVIE DETAILS
   ========================================================= */

export async function getMovieDetails(movieId) {
  return request(`/movie/${movieId}`);
}

export async function getMovieVideos(movieId) {
  return request(`/movie/${movieId}/videos`);
}

export async function getMovieCredits(movieId) {
  return request(`/movie/${movieId}/credits`);
}

/* =========================================================
   06. IMAGE HELPERS
   ========================================================= */

export function getImageUrl(path, size = "w500") {
  if (!path) {
    return "https://placehold.co/500x750/10131c/f5f5f7?text=CineVerse";
  }

  return `${IMAGE_BASE_URL}${size}${path}`;
}

export function getBackdropUrl(path) {
  if (!path) {
    return "https://placehold.co/1280x720/10131c/f5f5f7?text=CineVerse";
  }

  return `${IMAGE_BASE_URL}w1280${path}`;
}
