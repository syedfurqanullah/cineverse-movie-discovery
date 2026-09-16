/* =========================================================
   CINEVERSE - UI HELPERS
   Shared DOM references and pure display/data-formatting helpers.
   ========================================================= */

import { getImageUrl } from "./api.js";

const uiActions = {
  openMovieDetails: () => {},
  addMovieToWatchlist: () => {},
  removeMovieFromWatchlist: () => {},
  isMovieInWatchlist: () => false,
};

// Callbacks keep DOM rendering independent from application state and storage.
export function configureUI(actions = {}) {
  Object.assign(uiActions, actions);
}

export const elements = {
  menuToggle: document.querySelector(".menu-toggle"),
  mobileNavigation: document.querySelector("#mobile-navigation"),
  searchPanel: document.querySelector("#search-panel"),
  searchForm: document.querySelector("#search-form"),
  headerSearchForm: document.querySelector("#header-search-form"),
  headerSearchInput: document.querySelector("#header-search-input"),
  headerSearchHistory: document.querySelector("#header-search-history"),
  searchInput: document.querySelector("#movie-search"),
  genreFilter: document.querySelector("#genre-filter"),
  sortFilter: document.querySelector("#sort-filter"),
  yearFilter: document.querySelector("#year-filter"),
  resetFilters: document.querySelector("#reset-filters"),
  discoverResults: document.querySelector("#discover-results"),
  discoverStatus: document.querySelector("#discover-status"),
  discoverLoadMore: document.querySelector("#discover-load-more"),
  heroSlides: document.querySelector("#hero-slides"),
  heroTitle: document.querySelector("#hero-title"),
  heroRating: document.querySelector("#hero-rating"),
  heroYear: document.querySelector("#hero-year"),
  heroRuntime: document.querySelector("#hero-runtime"),
  heroOverview: document.querySelector("#hero-overview"),
  heroPagination: document.querySelector("#hero-pagination"),
  heroDetailsButton: document.querySelector("#hero-details-button"),
  heroWatchlistButton: document.querySelector("#hero-watchlist-button"),
  heroPrevious: document.querySelector("#hero-previous"),
  heroPause: document.querySelector("#hero-pause"),
  heroNext: document.querySelector("#hero-next"),
  trendingMovies: document.querySelector("#trending-movies"),
  popularMovies: document.querySelector("#popular-movies"),
  topRatedMovies: document.querySelector("#top-rated-movies"),
  upcomingMovies: document.querySelector("#upcoming-movies"),
  searchResultsSection: document.querySelector("#search-results-section"),
  searchResultsTitle: document.querySelector("#search-results-title"),
  searchResults: document.querySelector("#search-results"),
  searchStatus: document.querySelector("#search-status"),
  searchLoadMore: document.querySelector("#search-load-more"),
  clearSearch: document.querySelector("#clear-search"),
  watchlistMovies: document.querySelector("#watchlist-movies"),
  watchlistCount: document.querySelector("#watchlist-count"),
  clearWatchlist: document.querySelector("#clear-watchlist"),
  recentlyViewedMovies: document.querySelector("#recently-viewed-movies"),
  recentlyViewedCount: document.querySelector("#recently-viewed-count"),
  clearRecentlyViewed: document.querySelector("#clear-recently-viewed"),
  emptyState: document.querySelector("#empty-state"),
  errorState: document.querySelector("#error-state"),
  errorMessage: document.querySelector("#error-message"),
  retryButton: document.querySelector("#retry-button"),
  movieModal: document.querySelector("#movie-modal"),
  modalClose: document.querySelector("#modal-close"),
  modalMoviePoster: document.querySelector("#modal-movie-poster"),
  modalMovieStatus: document.querySelector("#modal-movie-status"),
  modalMovieTitle: document.querySelector("#modal-movie-title"),
  modalMovieRating: document.querySelector("#modal-movie-rating"),
  modalMovieYear: document.querySelector("#modal-movie-year"),
  modalMovieRuntime: document.querySelector("#modal-movie-runtime"),
  modalMovieGenres: document.querySelector("#modal-movie-genres"),
  modalMovieTagline: document.querySelector("#modal-movie-tagline"),
  modalMovieOverview: document.querySelector("#modal-movie-overview"),
  modalReleaseDate: document.querySelector("#modal-release-date"),
  modalLanguage: document.querySelector("#modal-language"),
  modalPopularity: document.querySelector("#modal-popularity"),
  modalDirector: document.querySelector("#modal-director"),
  modalStudio: document.querySelector("#modal-studio"),
  modalWatchlistButton: document.querySelector("#modal-watchlist-button"),
  modalTrailerLink: document.querySelector("#modal-trailer-link"),
  searchHistory: document.querySelector("#search-history"),
  modalCastList: document.querySelector("#modal-cast-list"),
  toastRegion: document.querySelector("#toast-region"),
  loadMoreButtons: document.querySelectorAll("[data-section]"),
  navLinks: document.querySelectorAll(".nav-link, .mobile-nav-link"),
  bottomNavLinks: document.querySelectorAll(".bottom-nav-link"),
};

export function normalizeMovies(movies = []) {
  return movies.filter((movie) => movie && movie.id && movie.title);
}

export function mergeMovies(currentMovies, nextMovies) {
  const existingIds = new Set(currentMovies.map((movie) => movie.id));
  return [
    ...currentMovies,
    ...nextMovies.filter((movie) => !existingIds.has(movie.id)),
  ];
}

export function formatRating(rating) {
  return typeof rating === "number" && !Number.isNaN(rating)
    ? rating.toFixed(1)
    : "0.0";
}

export function getReleaseYear(date) {
  return date ? date.split("-")[0] : "";
}

export function formatDate(date) {
  if (!date) return "N/A";
  const formattedDate = new Date(date);
  if (Number.isNaN(formattedDate.getTime())) return "N/A";

  return formattedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatNumber(number) {
  return typeof number === "number" && !Number.isNaN(number)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
        number,
      )
    : "N/A";
}

export function findTrailer(videos = []) {
  return videos.find(
    (video) =>
      video.site === "YouTube" &&
      (video.type === "Trailer" || video.type === "Teaser"),
  );
}

export function findDirector(crew = []) {
  return crew.find((person) => person.job === "Director")?.name || "";
}

export function getStudioName(companies = []) {
  return companies[0]?.name || "N/A";
}

export function getStarIcon() {
  return "★";
}

export function createFallbackPoster(title = "Movie") {
  return `https://placehold.co/500x750/10131c/f5f5f7?text=${encodeURIComponent(title)}`;
}

export function createFallbackBackdrop() {
  return "https://placehold.co/1280x720/10131c/f5f5f7?text=CineVerse";
}

export function renderInlineEmpty(container, message) {
  if (!container) return;
  container.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "inline-empty";
  empty.textContent = message;
  container.append(empty);
}

export function renderSkeletonGrid(container, count = 6) {
  if (!container) return;
  container.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const skeleton = document.createElement("article");
    skeleton.className = "movie-card skeleton-card";
    skeleton.setAttribute("aria-hidden", "true");
    skeleton.innerHTML = `
      <div class="skeleton-poster"></div>
      <div class="skeleton-body"><span></span><span></span></div>
    `;
    container.append(skeleton);
  }
}

export function renderMovieGrid(movies, container, options = {}) {
  if (!container) return;
  if (!options.append) container.innerHTML = "";
  if (!movies.length) return;

  const fragment = document.createDocumentFragment();
  movies.forEach((movie) => fragment.append(createMovieCard(movie, options)));
  container.append(fragment);
}

function createMovieCard(movie, options = {}) {
  const isSaved = uiActions.isMovieInWatchlist(movie.id);
  const article = document.createElement("article");
  article.className = "movie-card";
  article.dataset.movieId = movie.id;
  article.tabIndex = 0;
  article.role = "button";
  article.setAttribute("aria-label", `View details for ${movie.title}`);

  const poster = document.createElement("div");
  poster.className = "movie-card-poster";
  const image = document.createElement("img");
  image.loading = "lazy";
  image.decoding = "async";
  image.src = getImageUrl(movie.poster_path, "w342");
  image.srcset = `${getImageUrl(movie.poster_path, "w185")} 185w, ${getImageUrl(
    movie.poster_path,
    "w342",
  )} 342w, ${getImageUrl(movie.poster_path, "w500")} 500w`;
  image.sizes = "(max-width: 600px) 32vw, (max-width: 900px) 18vw, 185px";
  image.alt = `${movie.title || "Movie"} poster`;
  image.addEventListener("error", () => {
    image.src = createFallbackPoster(movie.title);
    image.srcset = "";
  });

  const rating = document.createElement("span");
  rating.className = "movie-card-rating";
  rating.textContent = `${getStarIcon()} ${formatRating(movie.vote_average)}`;
  const quickAction = document.createElement("span");
  quickAction.className = "movie-card-overlay";
  quickAction.textContent = "View Details";
  poster.append(image, rating, quickAction);

  const body = document.createElement("div");
  body.className = "movie-card-body";
  const title = document.createElement("h3");
  title.className = "movie-card-title";
  title.textContent = movie.title || "Untitled Movie";
  const year = document.createElement("p");
  year.className = "movie-card-year";
  year.textContent =
    getReleaseYear(movie.release_date) || "Release date unavailable";

  const actions = document.createElement("div");
  actions.className = "movie-card-actions";
  const detailsButton = document.createElement("button");
  detailsButton.type = "button";
  detailsButton.className = "movie-card-button";
  detailsButton.textContent = "Details";
  detailsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    uiActions.openMovieDetails(movie.id);
  });

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = `movie-card-button movie-card-save${isSaved ? " is-saved" : ""}`;
  saveButton.textContent = options.watchlist
    ? "Remove"
    : isSaved
      ? "Saved"
      : "Save";
  saveButton.setAttribute(
    "aria-label",
    options.watchlist || isSaved
      ? `Remove ${movie.title} from watchlist`
      : `Save ${movie.title} to watchlist`,
  );
  saveButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (options.watchlist || uiActions.isMovieInWatchlist(movie.id)) {
      uiActions.removeMovieFromWatchlist(movie.id);
    } else {
      uiActions.addMovieToWatchlist(movie);
    }
  });

  actions.append(detailsButton, saveButton);
  body.append(title, year, actions);
  article.append(poster, body);
  article.addEventListener("click", () => uiActions.openMovieDetails(movie.id));
  article.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      uiActions.openMovieDetails(movie.id);
    }
  });
  return article;
}
