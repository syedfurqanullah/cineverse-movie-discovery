/* =========================================================
   CINEVERSE - STORAGE
   Small, defensive LocalStorage helpers shared by app features.
   ========================================================= */

export const STORAGE_KEYS = Object.freeze({
  watchlist: "cineverse-watchlist",
  recentlyViewed: "cineverse-recently-viewed",
  searchHistory: "cineverse-search-history",
});

export function readStoredList(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        item && (typeof item.id === "number" || typeof item.id === "string"),
    );
  } catch {
    // Corrupt or unavailable storage should never stop the application boot.
    return [];
  }
}

export function writeStoredList(storageKey, value, onError) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    onError?.(error);
    console.warn("Storage write failed:", error);
  }
}

export function getSearchHistory(limit = 12) {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.searchHistory);
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed)
      ? parsed.map(String).filter(Boolean).slice(0, limit)
      : [];
  } catch {
    return [];
  }
}

export function saveSearchHistory(list, limit = 12, onError) {
  const cleaned = Array.from(
    new Set(
      (Array.isArray(list) ? list : [])
        .map((query) => String(query).trim())
        .filter(Boolean),
    ),
  ).slice(0, limit);

  try {
    localStorage.setItem(STORAGE_KEYS.searchHistory, JSON.stringify(cleaned));
  } catch (error) {
    onError?.(error);
  }
}
