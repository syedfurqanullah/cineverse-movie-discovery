/* =========================================================
   CINEVERSE - SEARCH SUPPORT
   Search-history persistence and shared input timing utilities.
   ========================================================= */

import {
  getSearchHistory as readSearchHistory,
  saveSearchHistory as writeSearchHistory,
} from "./storage.js";

export const SEARCH_HISTORY_LIMIT = 12;
export const SEARCH_DEBOUNCE_DELAY = 450;
export const SEARCH_SUGGESTION_DEBOUNCE_DELAY = 220;
export const SEARCH_SUGGESTION_MIN_LENGTH = 2;

export function getSearchHistory() {
  return readSearchHistory(SEARCH_HISTORY_LIMIT);
}

export function saveSearchHistory(list, onError) {
  writeSearchHistory(list, SEARCH_HISTORY_LIMIT, onError);
}

export function addToSearchHistory(query, onChange) {
  const normalized = query?.trim();
  if (!normalized) return;

  const nextHistory = getSearchHistory().filter((item) => item !== normalized);
  nextHistory.unshift(normalized);
  saveSearchHistory(nextHistory);
  onChange?.();
}

export function removeSearchHistoryItem(query, onChange) {
  const normalized = query?.trim();
  if (!normalized) return;

  saveSearchHistory(getSearchHistory().filter((item) => item !== normalized));
  onChange?.();
}

export function clearSearchHistory(onChange) {
  saveSearchHistory([]);
  onChange?.();
}

export function debounce(callback, delay) {
  let timeoutId;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
}
