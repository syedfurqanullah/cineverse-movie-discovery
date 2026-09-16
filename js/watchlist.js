/* =========================================================
   CINEVERSE - WATCHLIST DATA
   Persistence and movie normalization for saved user collections.
   Rendering remains in main.js because it needs the live DOM state.
   ========================================================= */

import { STORAGE_KEYS, readStoredList, writeStoredList } from "./storage.js";

export const WATCHLIST_STORAGE_KEY = STORAGE_KEYS.watchlist;
export const RECENTLY_VIEWED_STORAGE_KEY = STORAGE_KEYS.recentlyViewed;
export const RECENTLY_VIEWED_LIMIT = 12;

export function createStoredMovie(movie) {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    overview: movie.overview,
  };
}

export function getWatchlist() {
  return readStoredList(WATCHLIST_STORAGE_KEY);
}

export function saveWatchlist(movies, onError) {
  writeStoredList(WATCHLIST_STORAGE_KEY, movies, onError);
}

export function isMovieInWatchlist(movieId) {
  return getWatchlist().some((movie) => movie.id === movieId);
}

export function getRecentlyViewed() {
  return readStoredList(RECENTLY_VIEWED_STORAGE_KEY);
}

export function saveRecentlyViewed(movies, onError) {
  writeStoredList(RECENTLY_VIEWED_STORAGE_KEY, movies, onError);
}

export function addRecentlyViewed(movie) {
  const storedMovie = createStoredMovie(movie);
  const recentMovies = getRecentlyViewed().filter(
    (item) => item.id !== storedMovie.id,
  );

  return [storedMovie, ...recentMovies].slice(0, RECENTLY_VIEWED_LIMIT);
}
