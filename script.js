/* =========================================================
   CINEVERSE - APPLICATION
   Premium vanilla JavaScript movie discovery experience
   ========================================================= */

import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getMovieDetails,
  getMovieVideos,
  getMovieCredits,
  getMovieGenres,
  discoverMovies,
  searchMovies,
  getImageUrl,
  getBackdropUrl,
} from "./api.js";

/* =========================================================
   01. DOM ELEMENTS
   Centralized selectors keep UI wiring easy to audit.
   ========================================================= */

const elements = {
  menuToggle: document.querySelector(".menu-toggle"),
  mobileNavigation: document.querySelector("#mobile-navigation"),
  searchPanel: document.querySelector("#search-panel"),
  searchForm: document.querySelector("#search-form"),
  headerSearchForm: document.querySelector("#header-search-form"),
  headerSearchInput: document.querySelector("#header-search-input"),
  headerSearchClose: document.querySelector(".header-search-close"),
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
  loadingState: document.querySelector("#loading-state"),
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

/* =========================================================
   02. APPLICATION STATE
   All mutable data lives here to avoid hidden global behavior.
   ========================================================= */

const WATCHLIST_STORAGE_KEY = "cineverse-watchlist";
const RECENTLY_VIEWED_STORAGE_KEY = "cineverse-recently-viewed";
const HERO_SLIDE_INTERVAL = 7000;
const SEARCH_DEBOUNCE_DELAY = 450;
const SKELETON_CARD_COUNT = 6;
const RECENTLY_VIEWED_LIMIT = 12;
const SEARCH_HISTORY_KEY = "cineverse-search-history";
const SEARCH_HISTORY_LIMIT = 12;

const state = {
  trendingMovies: [],
  popularMovies: [],
  topRatedMovies: [],
  upcomingMovies: [],
  discoverResults: [],
  searchResults: [],
  recentlyViewedMovies: [],
  heroMovies: [],
  currentHeroIndex: 0,
  selectedMovie: null,
  lastSearchQuery: "",
  searchPage: 1,
  searchTotalPages: 1,
  discoverPage: 1,
  discoverTotalPages: 1,
  searchRequestId: 0,
  discoverRequestId: 0,
  heroPaused: false,
  lastFocusedElement: null,
  pages: {
    trending: 1,
    popular: 1,
    topRated: 1,
    upcoming: 1,
  },
  headerSearchPersistent: false,
};

// runtime helpers
let heroIntervalId = null;

const sectionConfig = {
  trending: {
    stateKey: "trendingMovies",
    pageKey: "trending",
    container: elements.trendingMovies,
    loader: getTrendingMovies,
  },
  popular: {
    stateKey: "popularMovies",
    pageKey: "popular",
    container: elements.popularMovies,
    loader: getPopularMovies,
  },
  "top-rated": {
    stateKey: "topRatedMovies",
    pageKey: "topRated",
    container: elements.topRatedMovies,
    loader: getTopRatedMovies,
  },
  upcoming: {
    stateKey: "upcomingMovies",
    pageKey: "upcoming",
    container: elements.upcomingMovies,
    loader: getUpcomingMovies,
  },
};

/* =========================================================
   03. APPLICATION INITIALIZATION
   Boots the page, loads API data and renders persisted watchlist data.
   ========================================================= */

async function initializeApp() {
  setupEventListeners();
  setupMobileRailControls();
  renderWatchlist();
  renderRecentlyViewed();
  renderSearchHistory();
  renderSkeletonsForHome();

  try {
    await Promise.all([
      loadGenres(),
      loadMovieSections(),
      loadDiscoverResults(),
    ]);
    setupHeroMovies();
    hideError();
  } catch (error) {
    handleError(error);
  }
}

/* =========================================================
   04. HOME MOVIE SECTIONS
   Fetches the four portfolio-facing movie rails in parallel.
   ========================================================= */

async function loadMovieSections() {
  const [trending, popular, topRated, upcoming] = await Promise.all([
    getTrendingMovies(state.pages.trending),
    getPopularMovies(state.pages.popular),
    getTopRatedMovies(state.pages.topRated),
    getUpcomingMovies(state.pages.upcoming),
  ]);

  state.trendingMovies = normalizeMovies(trending.results);
  state.popularMovies = normalizeMovies(popular.results);
  state.topRatedMovies = normalizeMovies(topRated.results);
  state.upcomingMovies = normalizeMovies(upcoming.results);

  renderMovieGrid(state.trendingMovies, elements.trendingMovies);
  renderMovieGrid(state.popularMovies, elements.popularMovies);
  renderMovieGrid(state.topRatedMovies, elements.topRatedMovies);
  renderMovieGrid(state.upcomingMovies, elements.upcomingMovies);
}

async function loadMoreMovies(sectionKey, button) {
  const config = sectionConfig[sectionKey];

  if (!config || button.disabled) {
    return;
  }

  setButtonLoading(button, "Loading...");

  try {
    const nextPage = state.pages[config.pageKey] + 1;
    const data = await config.loader(nextPage);
    const nextMovies = normalizeMovies(data.results);

    state.pages[config.pageKey] = nextPage;
    state[config.stateKey] = mergeMovies(state[config.stateKey], nextMovies);
    renderMovieGrid(nextMovies, config.container, { append: true });
    scrollToNewCards(config.container, nextMovies.length);
  } catch (error) {
    handleError(error);
  } finally {
    resetButtonLoading(button, "Load More");
  }
}

/* =========================================================
   05. DISCOVER FILTERS
   Genre, year and sort controls demonstrate real product filtering.
   ========================================================= */

async function loadGenres() {
  const data = await getMovieGenres();
  const genres = Array.isArray(data.genres) ? data.genres : [];

  elements.genreFilter
    .querySelectorAll("option:not(:first-child)")
    .forEach((option) => option.remove());

  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre.id;
    option.textContent = genre.name;
    elements.genreFilter.append(option);
  });
}

async function loadDiscoverResults() {
  const requestId = (state.discoverRequestId += 1);

  state.discoverPage = 1;
  renderSkeletonGrid(elements.discoverResults, 6);
  elements.discoverStatus.textContent = "Finding movies...";
  elements.discoverLoadMore.hidden = true;

  try {
    const data = await discoverMovies({
      genreId: elements.genreFilter.value,
      sortBy: elements.sortFilter.value,
      year: elements.yearFilter.value.trim(),
      page: state.discoverPage,
    });

    if (requestId !== state.discoverRequestId) {
      return;
    }

    state.discoverResults = normalizeMovies(data.results).slice(0, 12);
    state.discoverTotalPages = Math.min(data.total_pages || 1, 500);
    renderMovieGrid(state.discoverResults, elements.discoverResults);
    elements.discoverStatus.textContent = state.discoverResults.length
      ? `${state.discoverResults.length} movies found`
      : "No movies match the selected filters.";
    elements.discoverLoadMore.hidden =
      !state.discoverResults.length ||
      state.discoverPage >= state.discoverTotalPages;

    if (!state.discoverResults.length) {
      renderInlineEmpty(
        elements.discoverResults,
        "No movies match the selected filters.",
      );
    }
  } catch (error) {
    elements.discoverStatus.textContent = "Unable to load discovery results.";
    handleError(error);
  }
}

async function loadMoreDiscoverResults() {
  if (elements.discoverLoadMore.hidden || elements.discoverLoadMore.disabled) {
    return;
  }

  setButtonLoading(elements.discoverLoadMore, "Loading...");

  try {
    const nextPage = state.discoverPage + 1;
    const data = await discoverMovies({
      genreId: elements.genreFilter.value,
      sortBy: elements.sortFilter.value,
      year: elements.yearFilter.value.trim(),
      page: nextPage,
    });
    const nextMovies = normalizeMovies(data.results).slice(0, 12);

    state.discoverPage = nextPage;
    state.discoverTotalPages = Math.min(data.total_pages || 1, 500);
    state.discoverResults = mergeMovies(state.discoverResults, nextMovies);
    renderMovieGrid(nextMovies, elements.discoverResults, { append: true });
    scrollToNewCards(elements.discoverResults, nextMovies.length);
    elements.discoverStatus.textContent = `${state.discoverResults.length} movies found`;
    elements.discoverLoadMore.hidden =
      state.discoverPage >= state.discoverTotalPages || !nextMovies.length;
  } catch (error) {
    elements.discoverStatus.textContent = "Unable to load more movies.";
    handleError(error);
  } finally {
    resetButtonLoading(elements.discoverLoadMore, "Load More Movies");
  }
}

function resetFilters() {
  elements.genreFilter.value = "";
  elements.sortFilter.value = "popularity.desc";
  elements.yearFilter.value = "";
  loadDiscoverResults();
}

/* =========================================================
   06. HERO EXPERIENCE
   Renders a cinematic featured movie area from trending content.
   ========================================================= */

function setupHeroMovies() {
  state.heroMovies = state.trendingMovies.slice(0, 5);

  if (!state.heroMovies.length) {
    return;
  }

  renderHeroSlides();
  renderHeroPagination();
}

function renderHeroMovie() {
  const movie = state.heroMovies[state.currentHeroIndex];

  if (!movie) {
    return;
  }
  // update active slide and content
  updateActiveSlide(state.currentHeroIndex);
  elements.heroTitle.textContent = movie.title || "Untitled Movie";
  elements.heroRating.textContent = `${getStarIcon()} ${formatRating(
    movie.vote_average,
  )}`;
  elements.heroYear.textContent = getReleaseYear(movie.release_date) || "N/A";
  elements.heroRuntime.textContent = "Featured";
  elements.heroOverview.textContent =
    movie.overview || "No overview is available for this movie.";

  // image errors handled per-slide via background fallback

  updateHeroPagination();
  updateHeroWatchlistButton();
}

function renderHeroSlides() {
  const container = elements.heroSlides;
  if (!container) return;

  container.innerHTML = "";

  state.heroMovies.forEach((movie, index) => {
    const slide = document.createElement("div");
    slide.className = `hero-slide ${index === state.currentHeroIndex ? "active" : ""}`;
    const url = getBackdropUrl(movie.backdrop_path);
    slide.style.backgroundImage = `url('${url}')`;
    slide.dataset.movieId = movie.id;

    // fallback if image fails to load
    const img = new Image();
    img.src = url;
    img.onerror = () => {
      slide.style.backgroundImage = `url('${createFallbackBackdrop()}')`;
    };

    container.append(slide);
  });

  // ensure content reflects current slide
  updateActiveSlide(state.currentHeroIndex);
}

function updateActiveSlide(index) {
  const slides = elements.heroSlides?.children || [];
  Array.from(slides).forEach((s, i) => {
    s.classList.toggle("active", i === index);
  });

  const movie = state.heroMovies[index];
  if (!movie) return;

  elements.heroTitle.textContent = movie.title || "Untitled Movie";
  elements.heroRating.textContent = `${getStarIcon()} ${formatRating(movie.vote_average)}`;
  elements.heroYear.textContent = getReleaseYear(movie.release_date) || "N/A";
  elements.heroOverview.textContent =
    movie.overview || "No overview is available for this movie.";
}

function renderHeroPagination() {
  elements.heroPagination.innerHTML = "";

  state.heroMovies.forEach((movie, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === state.currentHeroIndex ? "active" : "";
    button.setAttribute("aria-label", `Show ${movie.title || "movie"}`);
    button.addEventListener("click", () => {
      state.currentHeroIndex = index;
      renderHeroMovie();
    });

    elements.heroPagination.append(button);
  });
}

function updateHeroPagination() {
  elements.heroPagination
    .querySelectorAll("button")
    .forEach((button, index) => {
      button.classList.toggle("active", index === state.currentHeroIndex);
    });
}

function startHeroSlider() {
  state.heroPaused = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  elements.heroPause.setAttribute("aria-pressed", String(state.heroPaused));

  // pause on hover/focus for better UX
  const heroContainer = document.querySelector(".hero-container");
  if (heroContainer) {
    heroContainer.addEventListener(
      "mouseenter",
      () => (state.heroPaused = true),
    );
    heroContainer.addEventListener(
      "mouseleave",
      () => (state.heroPaused = false),
    );
    heroContainer.addEventListener("focusin", () => (state.heroPaused = true));
    heroContainer.addEventListener(
      "focusout",
      () => (state.heroPaused = false),
    );
  }

  // touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  if (heroContainer) {
    heroContainer.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    });

    heroContainer.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;

      if (Math.abs(diff) > 40) {
        moveHeroSlide(diff < 0 ? 1 : -1);
      }
    });
  }

  if (heroIntervalId) clearInterval(heroIntervalId);
  heroIntervalId = setInterval(() => {
    if (!state.heroMovies.length || document.hidden || state.heroPaused) {
      return;
    }

    state.currentHeroIndex =
      (state.currentHeroIndex + 1) % state.heroMovies.length;
    renderHeroMovie();
  }, HERO_SLIDE_INTERVAL);
}

function stopHeroSlider() {
  if (heroIntervalId) {
    clearInterval(heroIntervalId);
    heroIntervalId = null;
  }
}

function moveHeroSlide(direction) {
  if (!state.heroMovies.length) {
    return;
  }

  state.currentHeroIndex =
    (state.currentHeroIndex + direction + state.heroMovies.length) %
    state.heroMovies.length;
  renderHeroMovie();
}

function toggleHeroPause() {
  state.heroPaused = !state.heroPaused;
  elements.heroPause.setAttribute("aria-pressed", String(state.heroPaused));
  elements.heroPause.setAttribute(
    "aria-label",
    state.heroPaused
      ? "Resume featured movie slider"
      : "Pause featured movie slider",
  );
  elements.heroPause.innerHTML = state.heroPaused
    ? "&#9654;"
    : "&#10074;&#10074;";
}

function handleHeroImageError() {
  // removed legacy handler — fallbacks are handled per-slide
}

/* =========================================================
   07. MOVIE CARD RENDERING
   Creates accessible, keyboard-friendly cards for every section.
   ========================================================= */

function renderMovieGrid(movies, container, options = {}) {
  if (!container) {
    return;
  }

  if (!options.append) {
    container.innerHTML = "";
  }

  if (!movies.length) {
    return;
  }

  const fragment = document.createDocumentFragment();

  movies.forEach((movie) => {
    fragment.append(createMovieCard(movie, options));
  });

  container.append(fragment);
}

function createMovieCard(movie, options = {}) {
  const article = document.createElement("article");
  const isSaved = isMovieInWatchlist(movie.id);

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
    openMovieDetails(movie.id);
  });

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = `movie-card-button movie-card-save${
    isSaved ? " is-saved" : ""
  }`;
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

    if (options.watchlist || isMovieInWatchlist(movie.id)) {
      removeMovieFromWatchlist(movie.id);
      return;
    }

    addMovieToWatchlist(movie);
  });

  actions.append(detailsButton, saveButton);
  body.append(title, year, actions);
  article.append(poster, body);

  article.addEventListener("click", () => openMovieDetails(movie.id));
  article.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMovieDetails(movie.id);
    }
  });

  return article;
}

/* =========================================================
   08. MOVIE DETAILS MODAL
   Combines details, credits and videos for a richer portfolio feature.
   ========================================================= */

async function openMovieDetails(movieId) {
  state.lastFocusedElement = document.activeElement;
  renderModalLoading();
  elements.movieModal.showModal();

  // setup focus trap for modal
  setupModalFocusTrap();

  try {
    const [movie, videos, credits] = await Promise.all([
      getMovieDetails(movieId),
      getMovieVideos(movieId),
      getMovieCredits(movieId),
    ]);

    state.selectedMovie = movie;
    addMovieToRecentlyViewed(movie);
    renderMovieDetails(movie, videos, credits);
  } catch (error) {
    elements.modalMovieTitle.textContent = "Unable to load details";
    elements.modalMovieOverview.textContent =
      "Please close this window and try again.";
    handleError(error);
  }
}

function renderModalLoading() {
  elements.modalMovieTitle.textContent = "Loading...";
  elements.modalMovieOverview.textContent = "Fetching movie details.";
  elements.modalMovieGenres.innerHTML = "";
  elements.modalCastList.innerHTML = "";
}

/*
  Modal focus management: trap focus while modal is open and restore on close.
  Also stop the hero autoplay while modal is visible to avoid motion conflicts.
*/
let _modalKeydownHandler = null;
let _modalPreviouslyFocused = null;

function setupModalFocusTrap() {
  const modal = elements.movieModal;
  if (!modal) return;

  stopHeroSlider();

  _modalPreviouslyFocused = document.activeElement;

  const focusable = modal.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  _modalKeydownHandler = (e) => {
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    if (e.key === "Escape") {
      closeMovieModal();
    }
  };

  document.addEventListener("keydown", _modalKeydownHandler);
  // focus first element for keyboard users
  (first || modal).focus();
}

function teardownModalFocusTrap() {
  if (_modalKeydownHandler) {
    document.removeEventListener("keydown", _modalKeydownHandler);
    _modalKeydownHandler = null;
  }

  // restore focus to previously focused element
  _modalPreviouslyFocused?.focus?.();
  _modalPreviouslyFocused = null;

  // resume hero autoplay
  startHeroSlider();
}

function renderMovieDetails(movie, videos, credits) {
  const trailer = findTrailer(videos.results);
  const director = findDirector(credits.crew);
  const cast = Array.isArray(credits.cast) ? credits.cast.slice(0, 8) : [];

  // responsive poster
  const modalSmall = getImageUrl(movie.poster_path, "w342");
  const modalLarge = getImageUrl(movie.poster_path, "w500");
  elements.modalMoviePoster.src = modalSmall;
  elements.modalMoviePoster.srcset = `${modalSmall} 342w, ${modalLarge} 500w`;
  elements.modalMoviePoster.sizes = `(max-width: 600px) 140px, (max-width: 900px) 220px, 320px`;
  elements.modalMoviePoster.alt = `${movie.title || "Movie"} poster`;
  elements.modalMovieStatus.textContent = movie.status || "Movie";
  elements.modalMovieTitle.textContent = movie.title || "Untitled Movie";
  elements.modalMovieRating.textContent = `${getStarIcon()} ${formatRating(
    movie.vote_average,
  )}`;
  elements.modalMovieYear.textContent =
    getReleaseYear(movie.release_date) || "N/A";
  elements.modalMovieRuntime.textContent = movie.runtime
    ? `${movie.runtime} min`
    : "N/A";
  elements.modalMovieTagline.textContent = movie.tagline || "";
  elements.modalMovieTagline.hidden = !movie.tagline;
  elements.modalMovieOverview.textContent =
    movie.overview || "No overview is available.";
  elements.modalReleaseDate.textContent = formatDate(movie.release_date);
  elements.modalLanguage.textContent = movie.original_language
    ? movie.original_language.toUpperCase()
    : "N/A";
  elements.modalPopularity.textContent = formatNumber(movie.popularity);
  elements.modalDirector.textContent = director || "N/A";
  elements.modalStudio.textContent = getStudioName(movie.production_companies);
  // External TMDB link removed to keep details focused in-app
  const trailerSection = document.getElementById("modal-trailer-section");

  if (trailer && trailer.key) {
    trailerSection.hidden = false;
    elements.modalTrailerLink.href = `https://www.youtube.com/watch?v=${trailer.key}`;
    elements.modalTrailerLink.textContent = "Official Trailer";
    elements.modalTrailerLink.hidden = false;
  } else {
    trailerSection.hidden = true;
    elements.modalTrailerLink.hidden = true;
  }

  renderGenres(movie.genres);
  renderCast(cast);
  updateModalWatchlistButton();
}

function renderGenres(genres = []) {
  elements.modalMovieGenres.innerHTML = "";

  genres.forEach((genre) => {
    const span = document.createElement("span");
    span.className = "movie-genre";
    span.textContent = genre.name;
    elements.modalMovieGenres.append(span);
  });
}

function renderCast(cast = []) {
  elements.modalCastList.innerHTML = "";

  if (!cast.length) {
    renderInlineEmpty(elements.modalCastList, "Cast details are unavailable.");
    return;
  }

  cast.forEach((person) => {
    const item = document.createElement("article");
    item.className = "cast-card";

    const image = document.createElement("img");
    image.loading = "lazy";
    image.decoding = "async";
    const small = getImageUrl(person.profile_path, "w92");
    const large = getImageUrl(person.profile_path, "w185");
    image.src = small;
    image.srcset = `${small} 92w, ${large} 185w`;
    image.sizes = `64px`;
    image.alt = person.name ? `${person.name} profile` : "Cast profile";

    const name = document.createElement("strong");
    name.textContent = person.name || "Unknown";

    const character = document.createElement("span");
    character.textContent = person.character || "Cast";

    item.append(image, name, character);
    elements.modalCastList.append(item);
  });
}

function closeMovieModal() {
  if (elements.movieModal.open) {
    elements.movieModal.close();
  }

  const trailerSection = document.getElementById("modal-trailer-section");
  trailerSection.hidden = true;
  // ensure trailer section hidden; embedded frames are not used

  state.selectedMovie = null;
  // teardown focus trap and resume hero autoplay
  teardownModalFocusTrap();
}

/* =========================================================
   09. SEARCH
   Debounced search avoids unnecessary API calls while typing.
   ========================================================= */

async function handleSearch(event) {
  event?.preventDefault();

  const query = elements.searchInput.value.trim();

  if (!query) {
    clearSearch();
    return;
  }

  await performSearch(query);
}

async function performSearch(query) {
  const requestId = (state.searchRequestId += 1);

  state.searchPage = 1;
  state.lastSearchQuery = query;
  renderSkeletonGrid(elements.searchResults, 6);
  elements.searchResultsSection.hidden = false;
  elements.searchStatus.textContent = `Searching for "${query}"...`;
  elements.searchLoadMore.hidden = true;
  hideEmptyState();

  try {
    const data = await searchMovies(query, state.searchPage);

    if (requestId !== state.searchRequestId) {
      return;
    }

    state.searchResults = normalizeMovies(data.results);
    state.searchTotalPages = Math.min(data.total_pages || 1, 500);
    elements.searchResultsTitle.textContent = `Results for "${query}"`;
    elements.searchStatus.textContent = state.searchResults.length
      ? `${state.searchResults.length} movies found`
      : "No movies found. Try a different title.";
    renderMovieGrid(state.searchResults, elements.searchResults);
    elements.searchLoadMore.hidden =
      !state.searchResults.length || state.searchPage >= state.searchTotalPages;

    if (!state.searchResults.length) {
      showEmptyState();
    }

    // Persist this query to local history
    addToSearchHistory(query);

    elements.searchResultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    elements.searchStatus.textContent = "Search is temporarily unavailable.";
    handleError(error);
  }
}

async function loadMoreSearchResults() {
  if (
    !state.lastSearchQuery ||
    elements.searchLoadMore.hidden ||
    elements.searchLoadMore.disabled
  ) {
    return;
  }

  setButtonLoading(elements.searchLoadMore, "Loading...");

  try {
    const nextPage = state.searchPage + 1;
    const data = await searchMovies(state.lastSearchQuery, nextPage);
    const nextMovies = normalizeMovies(data.results);

    state.searchPage = nextPage;
    state.searchTotalPages = Math.min(data.total_pages || 1, 500);
    state.searchResults = mergeMovies(state.searchResults, nextMovies);
    renderMovieGrid(nextMovies, elements.searchResults, { append: true });
    scrollToNewCards(elements.searchResults, nextMovies.length);
    elements.searchStatus.textContent = `${state.searchResults.length} movies found`;
    elements.searchLoadMore.hidden =
      state.searchPage >= state.searchTotalPages || !nextMovies.length;
  } catch (error) {
    elements.searchStatus.textContent = "Unable to load more search results.";
    handleError(error);
  } finally {
    resetButtonLoading(elements.searchLoadMore, "Load More Results");
  }
}

function clearSearch() {
  state.searchRequestId += 1;
  state.searchResults = [];
  state.lastSearchQuery = "";
  state.searchPage = 1;
  state.searchTotalPages = 1;
  elements.searchInput.value = "";
  elements.searchResults.innerHTML = "";
  elements.searchStatus.textContent = "";
  elements.searchLoadMore.hidden = true;
  elements.searchResultsSection.hidden = true;
  hideEmptyState();
}

/* =========================================================
   10. WATCHLIST
   Uses localStorage so saved movies persist between visits.
   ========================================================= */

function addMovieToWatchlist(movie) {
  const watchlist = getWatchlist();

  if (watchlist.some((item) => item.id === movie.id)) {
    updateWatchlistButtons();
    return;
  }

  watchlist.unshift(createStoredMovie(movie));
  saveWatchlist(watchlist);
  renderWatchlist();
  updateWatchlistButtons();
  showToast(`${movie.title || "Movie"} added to watchlist.`);
}

function removeMovieFromWatchlist(movieId) {
  const removedMovie = getWatchlist().find((movie) => movie.id === movieId);
  const watchlist = getWatchlist().filter((movie) => movie.id !== movieId);
  saveWatchlist(watchlist);
  renderWatchlist();
  updateWatchlistButtons();

  if (removedMovie) {
    showToast(`${removedMovie.title || "Movie"} removed from watchlist.`);
  }
}

function clearWatchlist() {
  saveWatchlist([]);
  renderWatchlist();
  updateWatchlistButtons();
  showToast("Watchlist cleared.");
}

function toggleMovieInWatchlist(movie) {
  if (isMovieInWatchlist(movie.id)) {
    removeMovieFromWatchlist(movie.id);
    return;
  }

  addMovieToWatchlist(movie);
}

function renderWatchlist() {
  const watchlist = getWatchlist();

  elements.watchlistCount.textContent = String(watchlist.length);
  elements.clearWatchlist.disabled = watchlist.length === 0;
  elements.watchlistMovies.innerHTML = "";

  if (!watchlist.length) {
    renderInlineEmpty(
      elements.watchlistMovies,
      "Your saved movies will appear here.",
    );
    return;
  }

  renderMovieGrid(watchlist, elements.watchlistMovies, { watchlist: true });
}

function getWatchlist() {
  return readStoredList(WATCHLIST_STORAGE_KEY);
}

function saveWatchlist(watchlist) {
  writeStoredList(WATCHLIST_STORAGE_KEY, watchlist);
}

function isMovieInWatchlist(movieId) {
  return getWatchlist().some((movie) => movie.id === movieId);
}

function addMovieToRecentlyViewed(movie) {
  const storedMovie = createStoredMovie(movie);
  const recentMovies = getRecentlyViewed().filter(
    (item) => item.id !== storedMovie.id,
  );
  const nextMovies = [storedMovie, ...recentMovies].slice(
    0,
    RECENTLY_VIEWED_LIMIT,
  );

  saveRecentlyViewed(nextMovies);
  renderRecentlyViewed();
}

function clearRecentlyViewed() {
  saveRecentlyViewed([]);
  renderRecentlyViewed();
  showToast("Recently viewed cleared.");
}

function renderRecentlyViewed() {
  const recentMovies = getRecentlyViewed();

  state.recentlyViewedMovies = recentMovies;
  elements.recentlyViewedCount.textContent = String(recentMovies.length);
  elements.clearRecentlyViewed.disabled = recentMovies.length === 0;
  elements.recentlyViewedMovies.innerHTML = "";

  if (!recentMovies.length) {
    renderInlineEmpty(
      elements.recentlyViewedMovies,
      "Movies you open will appear here.",
    );
    return;
  }

  renderMovieGrid(recentMovies, elements.recentlyViewedMovies);
}

function getRecentlyViewed() {
  return readStoredList(RECENTLY_VIEWED_STORAGE_KEY);
}

function saveRecentlyViewed(movies) {
  writeStoredList(RECENTLY_VIEWED_STORAGE_KEY, movies);
}

function readStoredList(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) : [];
    // basic validation: ensure array of objects with id
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item && (typeof item.id === "number" || typeof item.id === "string"),
    );
  } catch {
    return [];
  }
}

function writeStoredList(storageKey, value) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    // alert user that storage failed (e.g., quota exceeded)
    showToast("Unable to save data locally. Your browser storage may be full.");
    console.warn("Storage write failed:", error);
  }
}

/* =========================================================
   SEARCH HISTORY
   Persist recent search queries in localStorage and render clickable history
   ========================================================= */

function getSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(list) {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
}

function addToSearchHistory(query) {
  if (!query) return;
  const normalized = query.trim();
  const list = getSearchHistory().filter((q) => q !== normalized);
  list.unshift(normalized);
  saveSearchHistory(list.slice(0, SEARCH_HISTORY_LIMIT));
  renderSearchHistory();
}

function clearSearchHistory() {
  saveSearchHistory([]);
  renderSearchHistory();
}

function renderSearchHistory() {
  const container = elements.searchHistory;
  if (!container) return;

  const items = getSearchHistory();
  container.innerHTML = "";

  if (!items.length) {
    const hint = document.createElement("div");
    hint.className = "search-history-hint";
    hint.textContent = "Recent searches will appear here.";
    container.append(hint);
    return;
  }

  const list = document.createElement("div");
  list.className = "search-history-list";

  items.forEach((q) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-history-item";
    btn.textContent = q;
    btn.addEventListener("click", () => {
      elements.searchInput.value = q;
      performSearch(q);
    });
    list.append(btn);
  });

  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "search-history-clear";
  clear.textContent = "Clear history";
  clear.addEventListener("click", clearSearchHistory);

  container.append(list, clear);
}

function createStoredMovie(movie) {
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

function updateWatchlistButtons() {
  updateHeroWatchlistButton();
  updateModalWatchlistButton();
  refreshRenderedCards();
}

function updateHeroWatchlistButton() {
  const movie = state.heroMovies[state.currentHeroIndex];
  const saved = movie && isMovieInWatchlist(movie.id);
  elements.heroWatchlistButton.textContent = saved
    ? "Remove from Watchlist"
    : "Add to Watchlist";
  elements.heroWatchlistButton.setAttribute(
    "aria-pressed",
    String(Boolean(saved)),
  );
}

function updateModalWatchlistButton() {
  if (!state.selectedMovie) {
    return;
  }

  const saved = isMovieInWatchlist(state.selectedMovie.id);
  elements.modalWatchlistButton.textContent = saved
    ? "Remove from Watchlist"
    : "Add to Watchlist";
  elements.modalWatchlistButton.setAttribute("aria-pressed", String(saved));
}

function refreshRenderedCards() {
  const sections = [
    [state.discoverResults, elements.discoverResults],
    [state.trendingMovies, elements.trendingMovies],
    [state.popularMovies, elements.popularMovies],
    [state.topRatedMovies, elements.topRatedMovies],
    [state.upcomingMovies, elements.upcomingMovies],
    [state.searchResults, elements.searchResults],
    [state.recentlyViewedMovies, elements.recentlyViewedMovies],
  ];

  sections.forEach(([movies, container]) => {
    if (movies.length && container.children.length) {
      renderMovieGrid(movies, container);
    }
  });
}

/* =========================================================
   11. NAVIGATION AND PANELS
   Handles mobile menu, search panel and active nav states.
   ========================================================= */

function toggleMobileNavigation() {
  const isOpen = elements.menuToggle.getAttribute("aria-expanded") === "true";
  const nextState = !isOpen;

  elements.menuToggle.setAttribute("aria-expanded", String(nextState));
  elements.menuToggle.classList.toggle("is-open", nextState);
  elements.mobileNavigation.classList.toggle("is-open", nextState);
  elements.mobileNavigation.style.display = nextState ? "block" : "none";
}

function closeMobileNavigation() {
  elements.menuToggle.setAttribute("aria-expanded", "false");
  elements.menuToggle.classList.remove("is-open");
  elements.mobileNavigation.classList.remove("is-open");
  elements.mobileNavigation.style.display = "none";
}

function toggleSearchPanel(forceOpen = false) {
  const shouldOpen = forceOpen || elements.searchPanel.hidden;
  elements.searchPanel.hidden = !shouldOpen;
  if (elements.searchToggle) {
    elements.searchToggle.setAttribute("aria-expanded", String(shouldOpen));
    elements.searchToggle.classList.toggle("is-active", shouldOpen);
  }

  if (shouldOpen) {
    elements.searchInput.focus();
  }
}

function setupActiveNavigation() {
  const sectionIds = [
    "home",
    "movies",
    "trending",
    "top-rated",
    "upcoming",
    "watchlist",
  ];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        setActiveNav(visible.target.id);
      }
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: [0.1, 0.35, 0.6],
    },
  );

  sections.forEach((section) => observer.observe(section));
}

function setActiveNav(sectionId) {
  [...elements.navLinks, ...elements.bottomNavLinks].forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === `#${sectionId}`);
  });
}

/* =========================================================
   12. LOADING, EMPTY AND ERROR STATES
   Skeletons keep the page feeling stable while data loads.
   ========================================================= */

function renderSkeletonsForHome() {
  [
    elements.discoverResults,
    elements.trendingMovies,
    elements.popularMovies,
    elements.topRatedMovies,
    elements.upcomingMovies,
  ].forEach((container) => renderSkeletonGrid(container, SKELETON_CARD_COUNT));
}

function renderSkeletonGrid(container, count = SKELETON_CARD_COUNT) {
  if (!container) {
    return;
  }

  container.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const skeleton = document.createElement("article");
    skeleton.className = "movie-card skeleton-card";
    skeleton.setAttribute("aria-hidden", "true");
    skeleton.innerHTML = `
      <div class="skeleton-poster"></div>
      <div class="skeleton-body">
        <span></span>
        <span></span>
      </div>
    `;
    container.append(skeleton);
  }
}

function renderInlineEmpty(container, message) {
  container.innerHTML = "";

  const empty = document.createElement("div");
  empty.className = "inline-empty";
  empty.textContent = message;
  container.append(empty);
}

function showEmptyState() {
  elements.emptyState.hidden = false;
}

function hideEmptyState() {
  elements.emptyState.hidden = true;
}

function hideError() {
  elements.errorState.hidden = true;
}

function handleError(error) {
  console.error("CineVerse Error:", error);

  elements.errorMessage.textContent =
    error.name === "AbortError"
      ? "The request took too long. Please try again."
      : "Unable to load movie data. Please check your connection and try again.";
  elements.errorState.hidden = false;
}

async function retryApplication() {
  hideError();
  renderSkeletonsForHome();

  try {
    await Promise.all([
      loadGenres(),
      loadMovieSections(),
      loadDiscoverResults(),
    ]);
    setupHeroMovies();
  } catch (error) {
    handleError(error);
  }
}

function setButtonLoading(button, label) {
  button.disabled = true;
  button.dataset.originalText = button.textContent;
  button.textContent = label;
}

function resetButtonLoading(button, fallbackLabel) {
  button.disabled = false;
  button.textContent = button.dataset.originalText || fallbackLabel;
}

function scrollToNewCards(container, addedCount) {
  if (!container || !addedCount || !isHorizontalRail(container)) {
    return;
  }

  const firstNewCardIndex = Math.max(container.children.length - addedCount, 0);
  const firstNewCard = container.children[firstNewCardIndex];

  firstNewCard?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "start",
  });
}

function isHorizontalRail(container) {
  return window.getComputedStyle(container).display === "flex";
}

function setupMobileRailControls() {
  const rails = [
    elements.discoverResults,
    elements.trendingMovies,
    elements.popularMovies,
    elements.topRatedMovies,
    elements.upcomingMovies,
    elements.searchResults,
    elements.watchlistMovies,
    elements.recentlyViewedMovies,
  ];

  rails.forEach((container) => {
    const section = container?.closest("section");
    const header = section?.querySelector(".section-header, .tools-header");

    if (!container || !header || header.querySelector(".rail-controls")) {
      return;
    }

    const controls = document.createElement("div");
    controls.className = "rail-controls";
    controls.setAttribute("aria-label", "Movie rail controls");

    const previousButton = createRailButton("left", "Scroll movies left");
    const nextButton = createRailButton("right", "Scroll movies right");

    previousButton.addEventListener("click", () =>
      scrollMovieRail(container, -1),
    );
    nextButton.addEventListener("click", () => scrollMovieRail(container, 1));

    controls.append(previousButton, nextButton);
    header.append(controls);
  });
}

function createRailButton(direction, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `rail-button ${direction === "left" ? "rail-left" : "rail-right"}`;
  button.setAttribute("aria-label", label);
  // Visual arrow handled in CSS via pseudo-elements; keep button text empty for accessibility
  button.textContent = "";

  return button;
}

function scrollMovieRail(container, direction) {
  if (!container) {
    return;
  }

  container.scrollBy({
    left: direction * container.clientWidth * 0.85,
    behavior: "smooth",
  });
}

function showToast(message) {
  if (!elements.toastRegion) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  elements.toastRegion.append(toast);

  window.setTimeout(() => {
    toast.classList.add("is-hiding");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 2600);
}

/* =========================================================
   13. DATA UTILITIES
   Small formatting helpers keep render functions readable.
   ========================================================= */

function normalizeMovies(movies = []) {
  return movies.filter((movie) => movie && movie.id && movie.title);
}

function mergeMovies(currentMovies, nextMovies) {
  const existingIds = new Set(currentMovies.map((movie) => movie.id));
  const uniqueMovies = nextMovies.filter((movie) => !existingIds.has(movie.id));
  return [...currentMovies, ...uniqueMovies];
}

function findTrailer(videos = []) {
  return videos.find(
    (video) =>
      video.site === "YouTube" &&
      (video.type === "Trailer" || video.type === "Teaser"),
  );
}

function findDirector(crew = []) {
  return crew.find((person) => person.job === "Director")?.name || "";
}

function getStudioName(companies = []) {
  return companies[0]?.name || "N/A";
}

function formatRating(rating) {
  if (typeof rating !== "number" || Number.isNaN(rating)) {
    return "0.0";
  }

  return rating.toFixed(1);
}

function getReleaseYear(date) {
  return date ? date.split("-")[0] : "";
}

function formatDate(date) {
  if (!date) {
    return "N/A";
  }

  const formattedDate = new Date(date);

  if (Number.isNaN(formattedDate.getTime())) {
    return "N/A";
  }

  return formattedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatNumber(number) {
  if (typeof number !== "number" || Number.isNaN(number)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(number);
}

function createFallbackPoster(title = "Movie") {
  return `https://placehold.co/500x750/10131c/f5f5f7?text=${encodeURIComponent(
    title,
  )}`;
}

function createFallbackBackdrop() {
  return "https://placehold.co/1280x720/10131c/f5f5f7?text=CineVerse";
}

function getStarIcon() {
  return "\u2605";
}

function debounce(callback, delay) {
  let timeoutId;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
}

/* =========================================================
   14. EVENT LISTENERS
   One setup point makes all interactive behavior easy to trace.
   ========================================================= */

function setupEventListeners() {
  const debouncedSearch = debounce(() => {
    const query = elements.searchInput.value.trim();

    if (query.length >= 2) {
      performSearch(query);
    }
  }, SEARCH_DEBOUNCE_DELAY);

  const debouncedDiscover = debounce(loadDiscoverResults, 350);

  elements.menuToggle.addEventListener("click", toggleMobileNavigation);
  elements.headerSearchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = elements.headerSearchInput.value.trim();
    if (q) {
      elements.searchInput.value = q;
      performSearch(q);
    }
  });
  elements.searchForm.addEventListener("submit", handleSearch);
  elements.searchInput.addEventListener("input", debouncedSearch);
  elements.genreFilter.addEventListener("change", loadDiscoverResults);
  elements.sortFilter.addEventListener("change", loadDiscoverResults);
  elements.yearFilter.addEventListener("input", debouncedDiscover);
  elements.resetFilters.addEventListener("click", resetFilters);
  elements.discoverLoadMore.addEventListener("click", loadMoreDiscoverResults);
  elements.clearSearch.addEventListener("click", () => {
    clearSearch();
    elements.searchInput.focus();
  });
  elements.searchLoadMore.addEventListener("click", loadMoreSearchResults);
  elements.retryButton.addEventListener("click", retryApplication);
  elements.clearWatchlist.addEventListener("click", clearWatchlist);
  elements.clearRecentlyViewed.addEventListener("click", clearRecentlyViewed);
  elements.modalClose.addEventListener("click", closeMovieModal);
  elements.modalWatchlistButton.addEventListener("click", () => {
    if (state.selectedMovie) {
      toggleMovieInWatchlist(state.selectedMovie);
    }
  });
  elements.heroDetailsButton.addEventListener("click", () => {
    const movie = state.heroMovies[state.currentHeroIndex];

    if (movie) {
      openMovieDetails(movie.id);
    }
  });
  elements.heroPrevious.addEventListener("click", () => moveHeroSlide(-1));
  elements.heroPause.addEventListener("click", toggleHeroPause);
  elements.heroNext.addEventListener("click", () => moveHeroSlide(1));
  elements.heroWatchlistButton.addEventListener("click", () => {
    const movie = state.heroMovies[state.currentHeroIndex];

    if (movie) {
      toggleMovieInWatchlist(movie);
    }
  });

  elements.loadMoreButtons.forEach((button) => {
    button.addEventListener("click", () => {
      loadMoreMovies(button.dataset.section, button);
    });
  });

  elements.mobileNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNavigation);
  });

  elements.bottomNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (link.hasAttribute("data-open-search")) {
        toggleSearchPanel(true);
      }
    });
  });

  document.querySelectorAll('a[href="#search-panel"]').forEach((link) => {
    link.addEventListener("click", () => toggleSearchPanel(true));
  });

  // header search is always visible now; no outside-click closing needed

  elements.movieModal.addEventListener("click", (event) => {
    if (event.target === elements.movieModal) {
      closeMovieModal();
    }
  });

  // Sync localStorage changes across tabs/windows
  window.addEventListener("storage", (e) => {
    if (!e.key) return;

    if (e.key === WATCHLIST_STORAGE_KEY) {
      renderWatchlist();
      updateWatchlistButtons();
    }

    if (e.key === RECENTLY_VIEWED_STORAGE_KEY) {
      renderRecentlyViewed();
    }

    if (e.key === SEARCH_HISTORY_KEY) {
      renderSearchHistory();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (elements.mobileNavigation.style.display === "block") {
        closeMobileNavigation();
        return;
      }

      if (elements.headerSearchForm && !elements.headerSearchForm.hidden) {
        toggleHeaderSearch(false);
        state.headerSearchPersistent = false;
        return;
      }
    }
  });

  setupActiveNavigation();
}

function toggleHeaderSearch(force) {
  const form = elements.headerSearchForm;
  if (!form) return;
  // Header search is always visible in this design. Ensure it's shown.
  form.hidden = false;
  if (typeof force === "boolean") {
    state.headerSearchPersistent = !!force;
  }
  elements.headerSearchInput?.focus();
}

/* =========================================================
   15. START APPLICATION
   ========================================================= */

initializeApp();
startHeroSlider();
