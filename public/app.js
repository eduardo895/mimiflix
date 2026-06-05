/* ── Intro splash ─────────────────────────────────────────── */
(function runIntro() {
  const splash = document.getElementById("introSplash");
  if (!splash) return;

  // Não repetir intro na mesma sessão
  if (sessionStorage.getItem("introPlayed")) {
    splash.classList.add("intro-hidden");
    return;
  }

  // Bloqueia scroll enquanto intro corre
  document.body.style.overflow = "hidden";

  // Após letras entrarem (~1.7s) → iniciar saída
  const EXIT_DELAY = 1800;

  setTimeout(() => {
    // Aplica classe de saída a cada letra e tagline
    const letters = splash.querySelectorAll(".intro-letter");
    const tagline = splash.querySelector(".intro-tagline");

    letters.forEach((el, i) => {
      el.style.animationDelay = `${i * 0.03}s`;
      el.style.animation = "introExit 0.5s cubic-bezier(0.4,0,1,1) forwards";
    });
    if (tagline) {
      tagline.style.animationDelay = "0s";
      tagline.style.animation = "introExit 0.45s cubic-bezier(0.4,0,1,1) forwards";
    }

    // Fade out do fundo e esconder
    splash.classList.add("intro-curtain-out");

    setTimeout(() => {
      splash.classList.add("intro-hidden");
      document.body.style.overflow = "";
      sessionStorage.setItem("introPlayed", "1");
    }, 800);
  }, EXIT_DELAY);
})();

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER_POSTER = "https://via.placeholder.com/500x750/0e0e18/555577?text=Sem+Poster";
const PLACEHOLDER_STILL = "https://via.placeholder.com/640x360/0e0e18/555577?text=Sem+Imagem";
const PLACEHOLDER_PROFILE = "https://via.placeholder.com/320x480/0e0e18/555577?text=Sem+Foto";
const VIDFAST_BASE_URL = "https://vidfast.pro";
const VIDSRC_BASE_URL = "https://vidsrc.ru";
const VIDSRCWTF_BASE_URL = "https://www.vidsrc.wtf";
const CINESRC_BASE_URL = "https://cinesrc.st";
const VIDEASY_BASE_URL = "https://player.videasy.net";
const RIVESTREAM_BASE_URL = "https://rivestream.top";
// Providers that support sandbox (blocks pop-up ads without breaking playback)
const SANDBOX_PROVIDERS = new Set(["vidsrcwtf", "rivestream", "cinesrc"]);
const PLAYER_EMBED_PROVIDERS = [
  { id: "cinesrc", label: "CineSrc" },
  { id: "vidsrcwtf", label: "VidSrc.wtf" },
  { id: "videasy", label: "Videasy" },
  { id: "rivestream", label: "Rive" },
  { id: "vidfast", label: "Vidfast" },
  { id: "vidking", label: "Vidking" },
  { id: "vidsrc", label: "Vidsrc" }
];

// ─── DOM refs ────────────────────────────────────────────────
const searchInput = document.getElementById("searchInput");
const searchSuggestions = document.getElementById("searchSuggestions");
const searchBtn = document.getElementById("searchBtn");
const searchToggleBtn = document.getElementById("searchToggleBtn");
const searchOverlay = document.getElementById("searchOverlay");
const searchCloseBtn = document.getElementById("searchCloseBtn");
const notificationsBtn = document.getElementById("notificationsBtn");
const notificationsBadge = document.getElementById("notificationsBadge");
const notificationsPanel = document.getElementById("notificationsPanel");
const reloadBtn = document.getElementById("reloadBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const languageInput = document.getElementById("languageInput");
const languageSelect = document.getElementById("languageSelect");
const heroEl = document.getElementById("hero");
const heroBackdrop = document.getElementById("heroBackdrop");
const heroTitle = document.getElementById("heroTitle");
const heroMeta = document.getElementById("heroMeta");
const heroOverview = document.getElementById("heroOverview");
const heroPlayBtn = document.getElementById("heroPlayBtn");
const heroInfoBtn = document.getElementById("heroInfoBtn");
const appContent = document.getElementById("appContent");
const loginBtn = document.getElementById("loginBtn");
const userPill = document.getElementById("userPill");
const userAvatar = document.getElementById("userAvatar");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const profileNavLink = document.getElementById("profileNavLink");
const authModal = document.getElementById("authModal");
const authCloseBtn = document.getElementById("authCloseBtn");
const authForm = document.getElementById("authForm");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authError = document.getElementById("authError");
const authSubmit = document.getElementById("authSubmit");
const detailModal = document.getElementById("detailModal");
const detailBackdrop = document.getElementById("detailBackdrop");
const detailPoster = document.getElementById("detailPoster");
const detailTitle = document.getElementById("detailTitle");
const detailMeta = document.getElementById("detailMeta");
const detailOverview = document.getElementById("detailOverview");
const detailAvailability = document.getElementById("detailAvailability");
const detailFacts = document.getElementById("detailFacts");
const detailPlayBtn = document.getElementById("detailPlayBtn");
const detailTrailerBtn = document.getElementById("detailTrailerBtn");
const detailFavBtn = document.getElementById("detailFavBtn");
const detailWatchlistBtn = document.getElementById("detailWatchlistBtn");
const detailListBtn = document.getElementById("detailListBtn");
const detailPremium = document.getElementById("detailPremium");
const detailPersonalReview = document.getElementById("detailPersonalReview");
const detailSeriesPanel = document.getElementById("detailSeriesPanel");
const detailSimilar = document.getElementById("detailSimilar");
const detailCloseBtn = document.getElementById("detailCloseBtn");
const detailCloseFooterBtn = document.getElementById("detailCloseFooterBtn");
const detailModalHomeParent = detailModal.parentElement;
const playerOverlay = document.getElementById("playerOverlay");
const playerCard = document.getElementById("playerCard");
const playerTitle = document.getElementById("playerTitle");
const playerProviderTabs = document.getElementById("playerProviderTabs");
const playerSourceBtn = document.getElementById("playerSourceBtn");
const playerSourceDropdown = document.getElementById("playerSourceDropdown");
const playerContext = document.getElementById("playerContext");
const playerProgressPanel = document.getElementById("playerProgressPanel");
const playerFrameWrap = document.getElementById("playerFrameWrap");
const playerFrame = document.getElementById("playerFrame");
const playerFullscreenBtn = document.getElementById("playerFullscreenBtn");
const playerCloseBtn = document.getElementById("playerCloseBtn");
const subtitleOverlay = document.getElementById("subtitleOverlay");
const subtitleText = document.getElementById("subtitleText");
const mobileViewportQuery = window.matchMedia("(max-width: 820px)");

// ─── State ───────────────────────────────────────────────────
let sb = null;
let currentUser = null;
let currentSessionToken = "";
let favsCache = [];
let featuredMovie = null;
let selectedMovie = null;
let catalogCache = null;
let authMode = "login";
let authReady = false;
let favoritesLoaded = false;
let favoritesLoadingPromise = null;
let watchlistCache = [];
let historyCache = [];
let continueWatchingCache = [];
let customListsCache = [];
let personalReviewsCache = [];
let playerProgressCache = [];
let followedProfilesCache = [];
let dismissedNotificationsCache = [];
let announcedNotificationsCache = [];
let badgeStats = { profileShareCount: 0, listShareCount: 0, unlockedBadgeIds: [] };
let familyProfilesCache = [];
let activeFamilyProfileId = "main";
let yearlyRankingCache = { key: "", summary: null };
let movieInsightsCache = new Map();
let moodQueueCache = { key: "", mood: "", results: [] };
let personalCalendarCache = { key: "", data: null };
let profileCollectionsCache = { key: "", sections: [] };
let profilePrefs = { displayName: "", avatarImage: "", avatarEmoji: "🎬" };
let favoriteRecommendationsCache = { key: "", results: [] };
let upcomingReleaseAlertsCache = { key: "", results: [] };
let smartCollectionsCache = { key: "", sections: [] };
let calendarCache = { key: "", sections: [] };
let realCollectionsCache = { key: "", sections: [] };
let liveSportsCache = { key: "", payload: null };
let searchSuggestionsTimer = null;
let activeSearchSuggestions = [];
let appPreferences = {
  theme: "dark",
  homeSectionOrder: [],
  hiddenHomeSections: [],
  cinemaMode: true,
  playerProvider: "videasy",
  playerQuality: "Auto",
  playerAudio: "Original",
  playerSubtitles: "PT-PT"
};
let cloudSyncTimer = null;
let cloudSyncPromise = null;
let cloudSyncQueued = false;
let notificationRefreshPromise = null;
let latestNotifications = [];
let activePlaybackSession = null;

const MAX_WATCHLIST_ITEMS = 100;
const MAX_HISTORY_ITEMS = 30;
const MAX_CONTINUE_ITEMS = 20;
const MAX_CUSTOM_LISTS = 12;
const MAX_LIST_ITEMS = 60;
const MAX_PERSONAL_REVIEWS = 80;
const MAX_PROGRESS_ITEMS = 40;
const MAX_FOLLOWED_PROFILES = 20;
const MAX_FAMILY_PROFILES = 6;
const MAX_AVATAR_FILE_SIZE = 6 * 1024 * 1024;
const NOTIFICATION_LOOKAHEAD_DAYS = 45;
const PLAYER_AUTOSAVE_INTERVAL_MS = 10000;
const STREAMING_PROVIDERS = [
  { id: "8", name: "Netflix" },
  { id: "9", name: "Prime Video" },
  { id: "337", name: "Disney+" },
  { id: "350", name: "Apple TV+" },
  { id: "1899", name: "Max" }
];
const HOME_SECTION_LIBRARY = [
  { id: "for-you", title: "Escolhidos para ti" },
  { id: "continue-watching", title: "Continuar a ver" },
  { id: "next-up", title: "Próximo a ver" },
  { id: "profile-collections", title: "Coleções do teu perfil" },
  { id: "top10-portugal", title: "Top 10 em Portugal hoje" },
  { id: "popular", title: "Em alta" },
  { id: "top-rated", title: "Mais bem classificados" },
  { id: "now-playing", title: "Nos cinemas" },
  { id: "upcoming", title: "A chegar" },
  { id: "series-popular", title: "Séries em alta" },
  { id: "series-top-rated", title: "Séries obrigatórias" },
  { id: "series-airing", title: "A dar agora" }
];
const DEFAULT_HOME_SECTION_ORDER = HOME_SECTION_LIBRARY.map((section) => section.id);
const MOOD_PRESETS = [
  { id: "leve", title: "Leve", note: "Filmes para relaxar", params: { genre: "35", ratingMin: "6.2", runtimeMax: "115", voteCountMin: "180" } },
  { id: "intenso", title: "Intenso", note: "Thrillers e tensão alta", params: { genre: "53", ratingMin: "6.4", voteCountMin: "220" } },
  { id: "romantico", title: "Romântico", note: "Bom para ver a dois", params: { genre: "10749", ratingMin: "6.0", runtimeMax: "130", voteCountMin: "150" } },
  { id: "curto", title: "Curto", note: "Para hoje à noite", params: { runtimeMax: "95", ratingMin: "6.3", voteCountMin: "180" } },
  { id: "familia", title: "Família", note: "Seguro para ver em conjunto", params: { genre: "10751", ratingMin: "6.1", voteCountMin: "120" } }
];
appPreferences = loadAppPreferences();
const DISCOVER_GENRES = [
  { id: "", name: "Todos os géneros" },
  { id: "28", name: "Ação" },
  { id: "12", name: "Aventura" },
  { id: "16", name: "Animação" },
  { id: "35", name: "Comédia" },
  { id: "80", name: "Crime" },
  { id: "18", name: "Drama" },
  { id: "10751", name: "Família" },
  { id: "14", name: "Fantasia" },
  { id: "27", name: "Terror" },
  { id: "9648", name: "Mistério" },
  { id: "878", name: "Ficção científica" },
  { id: "53", name: "Thriller" }
];
const DISCOVER_TV_GENRES = [
  { id: "", name: "Todos os géneros" },
  { id: "10759", name: "Ação e aventura" },
  { id: "16", name: "Animação" },
  { id: "35", name: "Comédia" },
  { id: "80", name: "Crime" },
  { id: "99", name: "Documentário" },
  { id: "18", name: "Drama" },
  { id: "10751", name: "Família" },
  { id: "9648", name: "Mistério" },
  { id: "10765", name: "Sci-fi e fantasia" },
  { id: "10766", name: "Soap" },
  { id: "10768", name: "Guerra e política" },
  { id: "37", name: "Western" }
];

// ─── Init Supabase ───────────────────────────────────────────
async function initSupabase() {
  const cfg = await fetchJson("/api/config");
  sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { storageKey: "mf-auth", persistSession: true, autoRefreshToken: true },
  });

  const markAuthReady = () => {
    if (authReady) return;
    authReady = true;
    handleRoute();
  };

  sb.auth.onAuthStateChange((event, session) => {
    void (async () => {
      currentUser = session?.user ?? null;
      currentSessionToken = session?.access_token || "";
      resetFavoritesState();
      loadLibraryState();

      if (currentUser) {
        try {
          await syncLibraryStateFromCloud();
        } catch (err) {
          console.warn("Cloud sync:", err);
        }
      }

      updateNavUI();

      if (currentUser) {
        try {
          await loadFavorites({ force: true });
        } catch (err) {
          console.warn("Favorites sync:", err);
        }
      }

      refreshAllFavButtons();
      refreshAllWatchlistButtons();
      if (event === "INITIAL_SESSION") {
        markAuthReady();
      }
      handleRoute();
    })();
  });

  setTimeout(markAuthReady, 1500);
}

function resetFavoritesState() {
  favsCache = [];
  favoritesLoaded = false;
  favoritesLoadingPromise = null;
}

function clearFavoritesState() {
  favsCache = [];
  favoritesLoaded = true;
  favoritesLoadingPromise = null;
}

function isPrimaryFamilyProfile() {
  return activeFamilyProfileId === "main";
}

function loadAppPreferences() {
  try {
    return sanitizeAppPreferences(JSON.parse(localStorage.getItem("mf-app-preferences") || "{}"));
  } catch {
    return sanitizeAppPreferences({});
  }
}

function saveAppPreferences() {
  localStorage.setItem("mf-app-preferences", JSON.stringify(appPreferences));
}

function applyTheme(theme) {
  const normalizedTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = normalizedTheme;
  themeToggleBtn.textContent = normalizedTheme === "light" ? "☀" : "☾";
  themeToggleBtn.title = normalizedTheme === "light" ? "Mudar para tema escuro" : "Mudar para tema claro";
  appPreferences.theme = normalizedTheme;
  saveAppPreferences();

  if (currentUser) {
    saveLibraryState();
  }
}

function getLibraryStorageKey() {
  return `mf-library:${currentUser?.id || "guest"}`;
}

function getMediaType(movie) {
  return movie?.media_type === "tv" ? "tv" : "movie";
}

function getMediaKey(movie) {
  const mediaType = getMediaType(movie);
  const numericId = Number(movie?.id);
  if (!Number.isFinite(numericId)) return "";
  return `${mediaType}:${numericId}`;
}

function getPlaybackKey(movie, options = {}) {
  const mediaKey = getMediaKey(movie);
  if (!mediaKey) return "";
  if (getMediaType(movie) !== "tv") {
    return mediaKey;
  }

  const season = Math.max(1, Number(options.season ?? movie?.selectedSeason ?? movie?.season_number ?? 1) || 1);
  const episode = Math.max(1, Number(options.episode ?? movie?.selectedEpisode ?? movie?.episode_number ?? 1) || 1);
  return `${mediaKey}:s${season}:e${episode}`;
}

function getContentLabel(movie, fallback = "conteúdo") {
  return getMediaType(movie) === "tv" ? "série" : fallback;
}

function formatEpisodeLabel(season, episode) {
  if (!Number.isFinite(Number(season)) || !Number.isFinite(Number(episode))) return "";
  return `T${String(season).padStart(2, "0")} • E${String(episode).padStart(2, "0")}`;
}

function getSeriesSeasonMeta(series, seasonNumber) {
  if (!series || getMediaType(series) !== "tv") return null;
  const targetSeason = Math.max(1, Number(seasonNumber) || 1);
  return (Array.isArray(series.seasons) ? series.seasons : [])
    .find((season) => Number(season?.season_number) === targetSeason) || null;
}

function getSeriesEpisodeMeta(series, seasonNumber, episodeNumber) {
  if (!series || getMediaType(series) !== "tv") return null;
  const targetSeason = Math.max(1, Number(seasonNumber) || 1);
  const targetEpisode = Math.max(1, Number(episodeNumber) || 1);
  return (Array.isArray(series.episodes) ? series.episodes : [])
    .find((episode) => (
      Number(episode?.season_number || targetSeason) === targetSeason
      && Number(episode?.episode_number) === targetEpisode
    )) || null;
}

function getSeriesResumeTarget(series) {
  if (!series || getMediaType(series) !== "tv") return null;
  const latestProgress = getLatestProgressForMedia(series);
  const hasProgress = Boolean(latestProgress && latestProgress.progressPercent > 0 && latestProgress.progressPercent < 95);
  const season = Math.max(
    1,
    Number((hasProgress ? latestProgress?.season : null) || series.selectedSeason || series.selected_season || 1) || 1
  );
  const episode = Math.max(
    1,
    Number((hasProgress ? latestProgress?.episode : null) || series.selectedEpisode || 1) || 1
  );

  return {
    season,
    episode,
    hasProgress,
    progressPercent: hasProgress ? latestProgress.progressPercent : 0,
    episodeMeta: getSeriesEpisodeMeta(series, season, episode)
  };
}

function getSeriesNextEpisodeTarget(series, options = {}) {
  if (!series || getMediaType(series) !== "tv") return null;

  const currentSeason = Math.max(1, Number(options.season || series.selectedSeason || series.selected_season || 1) || 1);
  const currentEpisode = Math.max(1, Number(options.episode || series.selectedEpisode || 1) || 1);
  const episodes = Array.isArray(series.episodes) ? series.episodes : [];
  const seasonMeta = getSeriesSeasonMeta(series, currentSeason);
  const nextEpisodeInLoadedSeason = episodes
    .filter((episode) => Number(episode?.season_number || currentSeason) === currentSeason && Number(episode?.episode_number) > currentEpisode)
    .sort((left, right) => Number(left.episode_number) - Number(right.episode_number))[0];

  if (nextEpisodeInLoadedSeason) {
    return {
      season: currentSeason,
      episode: Number(nextEpisodeInLoadedSeason.episode_number) || currentEpisode + 1,
      episodeMeta: nextEpisodeInLoadedSeason
    };
  }

  const episodeCount = Math.max(
    0,
    Number(seasonMeta?.episode_count) || episodes.filter((episode) => Number(episode?.season_number || currentSeason) === currentSeason).length
  );
  if (episodeCount > currentEpisode) {
    return {
      season: currentSeason,
      episode: currentEpisode + 1,
      episodeMeta: null
    };
  }

  const nextSeason = (Array.isArray(series.seasons) ? series.seasons : [])
    .filter((season) => Number(season?.season_number) > currentSeason && Number(season?.episode_count) > 0)
    .sort((left, right) => Number(left.season_number) - Number(right.season_number))[0];

  if (!nextSeason) return null;

  return {
    season: Number(nextSeason.season_number) || currentSeason + 1,
    episode: 1,
    episodeMeta: null
  };
}

function resolveLiveSportName(match, genres = {}) {
  const genreId = String(match?.genreId || match?.genre_id || match?.sportId || match?.sport_id || match?.categoryId || match?.category_id || "");
  const raw = String(match?.sport || match?.sportName || match?.genre || match?.category || genres[genreId] || "Ao vivo").trim() || "Ao vivo";
  const normalized = raw.toLowerCase();
  if (normalized === "football") return "Soccer";
  if (normalized === "mma") return "MMA (Mixed Martial Arts)";
  return raw;
}

function resolveLiveSportTitle(match) {
  const directTitle = String(match?.title || match?.name || match?.event || match?.eventName || "").trim();
  if (directTitle) return directTitle;

  const left = String(match?.homeTeam || match?.team1 || match?.participant1 || "").trim();
  const right = String(match?.awayTeam || match?.team2 || match?.participant2 || "").trim();
  if (left && right) return `${left} vs ${right}`;
  return String(match?.id || match?.slug || "Evento ao vivo");
}

function resolveLiveSportSubtitle(match) {
  return String(
    match?.league
    || match?.competition
    || match?.tournament
    || match?.categoryName
    || match?.channel
    || ""
  ).trim();
}

function resolveLiveSportStart(match) {
  return String(
    match?.startTime
    || match?.startsAt
    || match?.scheduledAt
    || match?.kickoff
    || match?.kickOff
    || match?.date
    || ""
  ).trim();
}

function isLiveSportMatchLive(match) {
  if (typeof match?.isLive === "boolean") return match.isLive;
  const status = String(match?.status || "").toLowerCase();
  return match?.live === true || ["live", "playing", "in_progress", "in"].includes(status);
}

function normalizeLiveSportStream(stream, index = 0) {
  const directUrl = String(stream?.url || "").trim();
  const embedUrl = stream?.embedUrl
    ? String(stream.embedUrl).trim()
    : (directUrl.includes("/embed/") ? directUrl : "");
  const hlsUrl = String(stream?.hlsUrl || stream?.src || stream?.playlist || (embedUrl ? "" : directUrl)).trim();
  const proxyUrl = String(stream?.proxyUrl || stream?.proxy || "").trim();
  const label = String(
    stream?.label
    || stream?.name
    || [stream?.quality, stream?.source].filter(Boolean).join(" • ")
    || `Stream ${index + 1}`
  ).trim() || `Stream ${index + 1}`;
  const isWorking = typeof stream?.isWorking === "boolean" ? stream.isWorking : Boolean(hlsUrl || proxyUrl || embedUrl);

  if (!hlsUrl && !proxyUrl && !embedUrl) return null;
  return { label, hlsUrl, proxyUrl, embedUrl, isWorking };
}

function normalizeLiveSportMatch(match, genres = {}, index = 0, options = {}) {
  const streams = (Array.isArray(match?.streams) ? match.streams : [])
    .map(normalizeLiveSportStream)
    .filter(Boolean);

  return {
    id: String(options.id || match?.id || match?.matchId || match?.slug || `live-sport-${index + 1}`),
    title: resolveLiveSportTitle(match),
    subtitle: resolveLiveSportSubtitle(match),
    sport: resolveLiveSportName(match, genres),
    isLive: isLiveSportMatchLive(match),
    startTime: resolveLiveSportStart(match),
    sourceProvider: options.sourceProvider || "VipStreamed",
    streams,
    workingStreams: streams.filter((stream) => stream.isWorking),
    raw: match
  };
}

function formatLiveSportDate(value) {
  if (!value) return "Sem hora definida";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function buildLiveSportStreamUrl(stream) {
  const proxyUrl = String(stream?.proxyUrl || "").trim();
  if (proxyUrl) return proxyUrl;
  const hlsUrl = String(stream?.hlsUrl || "").trim();
  if (!hlsUrl) return "";
  return `https://api.vipstreamed.live/api/proxy/hls?url=${encodeURIComponent(hlsUrl)}`;
}

function invalidateLiveSportsCache() {
  liveSportsCache = { key: "", payload: null };
}

async function fetchLiveSportsCatalog(filters = {}, options = {}) {
  const params = new URLSearchParams();
  if (filters.sport) params.set("sport", filters.sport);
  if (filters.live) params.set("live", "true");
  if (filters.q) params.set("q", filters.q);
  const cacheKey = params.toString();

  if (!options.force && liveSportsCache.key === cacheKey && liveSportsCache.payload) {
    return liveSportsCache.payload;
  }

  const [catalog, health, watchfooty, streamed] = await Promise.all([
    fetchJson(`/api/live-sports${cacheKey ? `?${cacheKey}` : ""}`).catch(() => ({ success: true, data: { streams: [], sports: [] } })),
    fetchJson("/api/live-sports/health").catch(() => null),
    fetchJson(`/api/live-sports/watchfooty${cacheKey ? `?${cacheKey}` : ""}`).catch(() => ({ success: true, data: { matches: [], sports: [] } })),
    fetchJson(`/api/live-sports/streamed${cacheKey ? `?${cacheKey}` : ""}`).catch(() => ({ success: true, data: { matches: [] } }))
  ]);
  const payload = { catalog, health, watchfooty, streamed };
  liveSportsCache = { key: cacheKey, payload };
  return payload;
}

function normalizeMovie(movie) {
  if (!movie || !Number.isFinite(Number(movie.id))) {
    return null;
  }

  const mediaType = getMediaType(movie);
  const normalized = {
    id: Number(movie.id),
    media_type: mediaType,
    title: String(movie.title || movie.name || "Sem titulo"),
    overview: String(movie.overview || ""),
    poster_path: movie.poster_path || null,
    backdrop_path: movie.backdrop_path || null,
    release_date: movie.release_date || movie.first_air_date || "",
    vote_average: typeof movie.vote_average === "number" ? movie.vote_average : Number(movie.vote_average) || 0,
    original_language: movie.original_language || "",
    runtime: Number.isFinite(Number(movie.runtime)) ? Number(movie.runtime) : Number(movie?.episode_run_time?.[0]) || null
  };

  if (Array.isArray(movie.genres)) {
    normalized.genres = movie.genres.map((genre) => (typeof genre === "string" ? genre : genre?.name)).filter(Boolean);
  }
  if (Array.isArray(movie.providers)) normalized.providers = movie.providers;
  if (Array.isArray(movie.cast)) normalized.cast = movie.cast;
  if (Array.isArray(movie.directors)) normalized.directors = movie.directors;
  if (movie.premium) normalized.premium = movie.premium;

  if (mediaType === "tv") {
    normalized.number_of_seasons = Number(movie.number_of_seasons) || null;
    normalized.number_of_episodes = Number(movie.number_of_episodes) || null;
    normalized.selectedSeason = Math.max(1, Number(movie.selectedSeason || movie.selected_season || movie.season_number || movie.next_episode_to_air?.season_number || 1) || 1);
    normalized.selectedEpisode = Math.max(1, Number(movie.selectedEpisode || movie.episode_number || movie.next_episode_to_air?.episode_number || 1) || 1);
    if (movie.episodes) normalized.episodes = movie.episodes;
    if (movie.seasons) normalized.seasons = movie.seasons;
    if (movie.next_episode_to_air) normalized.next_episode_to_air = movie.next_episode_to_air;
    if (movie.last_air_date) normalized.last_air_date = movie.last_air_date;
  }

  if (movie.favoritedAt) normalized.favoritedAt = String(movie.favoritedAt);
  if (movie.watchlistedAt) normalized.watchlistedAt = String(movie.watchlistedAt);

  return normalized;
}

function readLibraryState() {
  try {
    return JSON.parse(localStorage.getItem(getLibraryStorageKey()) || "{}");
  } catch {
    return {};
  }
}

function sanitizeAppPreferences(value) {
  const rawOrder = Array.isArray(value?.homeSectionOrder) ? value.homeSectionOrder : DEFAULT_HOME_SECTION_ORDER;
  const homeSectionOrder = [
    ...rawOrder.filter((id) => DEFAULT_HOME_SECTION_ORDER.includes(id)),
    ...DEFAULT_HOME_SECTION_ORDER.filter((id) => !rawOrder.includes(id))
  ];
  return {
    theme: value?.theme === "light" ? "light" : "dark",
    homeSectionOrder,
    hiddenHomeSections: sanitizeStringList(value?.hiddenHomeSections, DEFAULT_HOME_SECTION_ORDER.length)
      .filter((id) => DEFAULT_HOME_SECTION_ORDER.includes(id)),
    cinemaMode: value?.cinemaMode === false ? false : true,
    playerQuality: ["Auto", "1080p", "720p", "480p"].includes(value?.playerQuality) ? value.playerQuality : "Auto",
    playerAudio: ["Original", "PT-PT", "PT-BR", "EN"].includes(value?.playerAudio) ? value.playerAudio : "Original",
    playerSubtitles: ["Off", "PT-PT", "PT-BR", "EN"].includes(value?.playerSubtitles) ? value.playerSubtitles : "PT-PT"
  };
}

function sanitizeStoredMovies(items, limit) {
  if (!Array.isArray(items)) return [];
  const deduped = new Map();

  items.forEach((item) => {
    const movie = normalizeMovie(item);
    const mediaKey = getMediaKey(movie);
    if (movie && mediaKey) deduped.set(mediaKey, movie);
  });

  return [...deduped.values()].slice(0, limit);
}

function sanitizeStoredActivity(items, limit, timestampKey) {
  if (!Array.isArray(items)) return [];
  const deduped = new Map();

  items.forEach((item) => {
    const movie = normalizeMovie(item?.movie);
    const timestamp = String(item?.[timestampKey] || "");
    if (!movie || !timestamp) return;
    const mediaKey = getMediaKey(movie);
    if (!mediaKey) return;
    deduped.set(mediaKey, {
      movie,
      [timestampKey]: timestamp,
      positionSeconds: Math.max(0, Number(item?.positionSeconds) || 0),
      progressPercent: Math.max(0, Math.min(100, Number(item?.progressPercent) || 0))
    });
  });

  return [...deduped.values()]
    .sort((left, right) => new Date(right[timestampKey]).getTime() - new Date(left[timestampKey]).getTime())
    .slice(0, limit);
}

function sanitizeStoredReview(review, index = 0) {
  const movie = normalizeMovie(review?.movie);
  const ratingValue = Number.parseInt(String(review?.rating || ""), 10);
  const rating = Number.isFinite(ratingValue) ? Math.min(10, Math.max(1, ratingValue)) : null;
  const text = String(review?.review || "").trim().slice(0, 800);
  const updatedAt = String(review?.updatedAt || new Date(Date.now() - index * 1000).toISOString());

  if (!movie || (!rating && !text)) {
    return null;
  }

  return {
    movieId: movie.id,
    mediaKey: getMediaKey(movie),
    movie,
    rating,
    review: text,
    updatedAt
  };
}

function sanitizeStoredReviews(items, limit) {
  if (!Array.isArray(items)) return [];
  const deduped = new Map();

  items.forEach((item, index) => {
    const review = sanitizeStoredReview(item, index);
    if (review?.mediaKey) deduped.set(review.mediaKey, review);
  });

  return [...deduped.values()]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, limit);
}

function sanitizeStoredProgressEntry(entry, index = 0) {
  const movie = normalizeMovie(entry?.movie);
  const season = Math.max(1, Number(entry?.season || movie?.selectedSeason || 1) || 1);
  const episode = Math.max(1, Number(entry?.episode || movie?.selectedEpisode || 1) || 1);
  const positionSeconds = Math.max(0, Number(entry?.positionSeconds) || 0);
  const runtime = Math.max(0, Number(entry?.runtime) || 0);
  const updatedAt = String(entry?.updatedAt || new Date(Date.now() - index * 1000).toISOString());
  const lastDevice = String(entry?.lastDevice || "").trim().slice(0, 80);
  const sessionCount = Math.max(1, Number(entry?.sessionCount) || 1);

  if (!movie) return null;

  const progressPercent = runtime
    ? Math.min(100, Math.max(0, Math.round((positionSeconds / (runtime * 60)) * 100)))
    : Math.min(100, Math.max(0, Number(entry?.progressPercent) || 0));

  return {
    movieId: movie.id,
    mediaKey: getMediaKey(movie),
    playbackKey: getPlaybackKey(movie, { season, episode }),
    mediaType: getMediaType(movie),
    movie,
    positionSeconds,
    runtime,
    progressPercent,
    updatedAt,
    lastDevice,
    sessionCount,
    season,
    episode
  };
}

function sanitizeStoredProgressEntries(items, limit) {
  if (!Array.isArray(items)) return [];
  const deduped = new Map();

  items.forEach((item, index) => {
    const progress = sanitizeStoredProgressEntry(item, index);
    if (progress?.playbackKey) deduped.set(progress.playbackKey, progress);
  });

  return [...deduped.values()]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, limit);
}

function sanitizeStringList(items, limit = 200) {
  if (!Array.isArray(items)) return [];
  return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].slice(0, limit);
}

function sanitizeBadgeStats(stats) {
  const normalized = stats && typeof stats === "object" && !Array.isArray(stats) ? stats : {};
  return {
    profileShareCount: Math.max(0, Number(normalized.profileShareCount) || 0),
    listShareCount: Math.max(0, Number(normalized.listShareCount) || 0),
    unlockedBadgeIds: sanitizeStringList(normalized.unlockedBadgeIds, 80)
  };
}

function sanitizeFamilyProfile(profile, index = 0) {
  const normalized = profile && typeof profile === "object" && !Array.isArray(profile) ? profile : {};
  const name = String(
    normalized.name ||
    normalized.profilePrefs?.displayName ||
    (index === 0 ? "Principal" : `Perfil ${index + 1}`)
  ).trim().slice(0, 32);
  const id = String(normalized.id || (index === 0 ? "main" : `profile-${index + 1}`)).trim().slice(0, 80);

  return {
    id,
    name: name || "Perfil",
    favorites: sanitizeStoredMovies(normalized.favorites, MAX_WATCHLIST_ITEMS),
    watchlist: sanitizeStoredMovies(normalized.watchlist, MAX_WATCHLIST_ITEMS),
    history: sanitizeStoredActivity(normalized.history, MAX_HISTORY_ITEMS, "watchedAt"),
    continueWatching: sanitizeStoredActivity(normalized.continueWatching, MAX_CONTINUE_ITEMS, "playedAt"),
    customLists: sanitizeStoredLists(normalized.customLists),
    personalReviews: sanitizeStoredReviews(normalized.personalReviews, MAX_PERSONAL_REVIEWS),
    playerProgress: sanitizeStoredProgressEntries(normalized.playerProgress, MAX_PROGRESS_ITEMS),
    badgeStats: sanitizeBadgeStats(normalized.badgeStats),
    profilePrefs: sanitizeProfilePrefs({
      ...normalized.profilePrefs,
      displayName: normalized.profilePrefs?.displayName || name
    })
  };
}

function buildLegacyMainProfile(state) {
  return sanitizeFamilyProfile({
    id: "main",
    name: state?.profilePrefs?.displayName || getUserDisplayName(currentUser?.email || "Principal"),
    favorites: state?.favorites,
    watchlist: state?.watchlist,
    history: state?.history,
    continueWatching: state?.continueWatching,
    customLists: state?.customLists,
    personalReviews: state?.personalReviews,
    playerProgress: state?.playerProgress,
    badgeStats: state?.badgeStats,
    profilePrefs: state?.profilePrefs
  }, 0);
}

function sanitizeFamilyProfiles(items, legacyState) {
  const source = Array.isArray(items) && items.length ? items : [buildLegacyMainProfile(legacyState)];
  const deduped = new Map();

  source.forEach((item, index) => {
    const profile = sanitizeFamilyProfile(item, index);
    deduped.set(profile.id, profile);
  });

  if (!deduped.has("main")) {
    deduped.set("main", buildLegacyMainProfile(legacyState));
  }

  return [...deduped.values()].slice(0, MAX_FAMILY_PROFILES);
}

function getActiveFamilyProfile() {
  return familyProfilesCache.find((profile) => profile.id === activeFamilyProfileId) || familyProfilesCache[0] || null;
}

function buildActiveFamilyProfileSnapshot(existingProfile = {}) {
  return sanitizeFamilyProfile({
    ...existingProfile,
    id: existingProfile.id || activeFamilyProfileId || "main",
    name: profilePrefs.displayName || existingProfile.name || getUserDisplayName(currentUser?.email || "Principal"),
    favorites: favsCache,
    watchlist: watchlistCache,
    history: historyCache,
    continueWatching: continueWatchingCache,
    customLists: customListsCache,
    personalReviews: personalReviewsCache,
    playerProgress: playerProgressCache,
    badgeStats,
    profilePrefs
  });
}

function syncActiveProfileCache() {
  const currentProfiles = familyProfilesCache.length ? familyProfilesCache : [buildLegacyMainProfile({})];
  const activeId = activeFamilyProfileId || currentProfiles[0]?.id || "main";
  const existingProfile = currentProfiles.find((profile) => profile.id === activeId) || currentProfiles[0];
  const nextActiveProfile = buildActiveFamilyProfileSnapshot(existingProfile);

  familyProfilesCache = currentProfiles.map((profile) => (
    profile.id === nextActiveProfile.id ? nextActiveProfile : sanitizeFamilyProfile(profile)
  ));

  if (!familyProfilesCache.some((profile) => profile.id === nextActiveProfile.id)) {
    familyProfilesCache = [nextActiveProfile, ...familyProfilesCache].slice(0, MAX_FAMILY_PROFILES);
  }

  activeFamilyProfileId = nextActiveProfile.id;
  return nextActiveProfile;
}

function applyFamilyProfile(profile) {
  const activeProfile = sanitizeFamilyProfile(profile || buildLegacyMainProfile({}), 0);
  activeFamilyProfileId = activeProfile.id;
  favsCache = activeProfile.favorites;
  watchlistCache = activeProfile.watchlist;
  historyCache = activeProfile.history;
  continueWatchingCache = activeProfile.continueWatching;
  customListsCache = activeProfile.customLists;
  personalReviewsCache = activeProfile.personalReviews;
  playerProgressCache = activeProfile.playerProgress;
  badgeStats = activeProfile.badgeStats;
  profilePrefs = activeProfile.profilePrefs;
  favoritesLoaded = true;
  favoriteRecommendationsCache = { key: "", results: [] };
  upcomingReleaseAlertsCache = { key: "", results: [] };
  yearlyRankingCache = { key: "", summary: null };
}

function setActiveFamilyProfile(profileId, options = {}) {
  syncActiveProfileCache();
  const target = familyProfilesCache.find((profile) => profile.id === profileId);
  if (!target) return false;
  applyFamilyProfile(target);
  if (options.persist !== false) {
    saveLibraryState();
  }
  updateNavUI();
  return true;
}

function sanitizeSharedListSnapshot(list, index = 0) {
  const name = String(list?.name || `Lista ${index + 1}`).trim().slice(0, 40);
  if (!name) return null;
  return {
    id: String(list?.id || `shared-list-${index + 1}`),
    name,
    movies: sanitizeStoredMovies(list?.movies, MAX_LIST_ITEMS)
  };
}

function sanitizeSharedProfile(profile, index = 0) {
  const shareCode = String(profile?.shareCode || `friend-${index + 1}`).trim().slice(0, 160);
  const displayName = String(profile?.displayName || "Perfil partilhado").trim().slice(0, 40);
  if (!shareCode || !displayName) return null;

  return {
    shareCode,
    ownerUserId: String(profile?.ownerUserId || "").trim().slice(0, 120),
    displayName,
    avatarImage: typeof profile?.avatarImage === "string" && profile.avatarImage.startsWith("data:image/")
      ? profile.avatarImage
      : "",
    avatarText: String(profile?.avatarText || displayName.charAt(0) || "P").trim().slice(0, 2) || "P",
    exportedAt: String(profile?.exportedAt || new Date(Date.now() - index * 1000).toISOString()),
    favorites: sanitizeStoredMovies(profile?.favorites, MAX_WATCHLIST_ITEMS),
    lists: (Array.isArray(profile?.lists) ? profile.lists : [])
      .map(sanitizeSharedListSnapshot)
      .filter(Boolean)
      .slice(0, MAX_CUSTOM_LISTS),
    topReviews: sanitizeStoredReviews(profile?.topReviews, 6)
  };
}

function sanitizeFollowedProfiles(items, limit) {
  if (!Array.isArray(items)) return [];
  const deduped = new Map();

  items.forEach((item, index) => {
    const profile = sanitizeSharedProfile(item, index);
    if (profile) deduped.set(profile.shareCode, profile);
  });

  return [...deduped.values()]
    .sort((left, right) => new Date(right.exportedAt).getTime() - new Date(left.exportedAt).getTime())
    .slice(0, limit);
}

function sanitizeLibraryState(state) {
  const normalized = state && typeof state === "object" && !Array.isArray(state) ? state : {};
  const familyProfiles = sanitizeFamilyProfiles(normalized.familyProfiles, normalized);
  const resolvedActiveFamilyProfileId = familyProfiles.some((profile) => profile.id === normalized.activeFamilyProfileId)
    ? normalized.activeFamilyProfileId
    : familyProfiles[0]?.id || "main";
  const activeProfile = familyProfiles.find((profile) => profile.id === resolvedActiveFamilyProfileId) || familyProfiles[0];

  return {
    version: 3,
    updatedAt: String(normalized.updatedAt || ""),
    favorites: activeProfile.favorites,
    watchlist: activeProfile.watchlist,
    history: activeProfile.history,
    continueWatching: activeProfile.continueWatching,
    customLists: activeProfile.customLists,
    personalReviews: activeProfile.personalReviews,
    playerProgress: activeProfile.playerProgress,
    followedProfiles: sanitizeFollowedProfiles(normalized.followedProfiles, MAX_FOLLOWED_PROFILES),
    dismissedNotifications: sanitizeStringList(normalized.dismissedNotifications, 400),
    announcedNotifications: sanitizeStringList(normalized.announcedNotifications, 400),
    badgeStats: activeProfile.badgeStats,
    profilePrefs: activeProfile.profilePrefs,
    familyProfiles,
    activeFamilyProfileId: resolvedActiveFamilyProfileId,
    appPreferences: sanitizeAppPreferences(normalized.appPreferences)
  };
}

function buildLibraryStateSnapshot(overrides = {}) {
  const activeProfile = syncActiveProfileCache();
  return sanitizeLibraryState({
    version: 3,
    updatedAt: overrides.updatedAt || new Date().toISOString(),
    favorites: activeProfile.favorites,
    watchlist: activeProfile.watchlist,
    history: activeProfile.history,
    continueWatching: activeProfile.continueWatching,
    customLists: activeProfile.customLists,
    personalReviews: activeProfile.personalReviews,
    playerProgress: activeProfile.playerProgress,
    followedProfiles: followedProfilesCache,
    dismissedNotifications: dismissedNotificationsCache,
    announcedNotifications: announcedNotificationsCache,
    badgeStats: activeProfile.badgeStats,
    profilePrefs: activeProfile.profilePrefs,
    familyProfiles: familyProfilesCache,
    activeFamilyProfileId,
    appPreferences
  });
}

function persistLocalLibraryState(state) {
  localStorage.setItem(getLibraryStorageKey(), JSON.stringify(sanitizeLibraryState(state)));
}

function applyLibraryState(state) {
  const normalizedState = sanitizeLibraryState(state);
  followedProfilesCache = normalizedState.followedProfiles;
  dismissedNotificationsCache = normalizedState.dismissedNotifications;
  announcedNotificationsCache = normalizedState.announcedNotifications;
  familyProfilesCache = normalizedState.familyProfiles;
  activeFamilyProfileId = normalizedState.activeFamilyProfileId;
  applyFamilyProfile(getActiveFamilyProfile());
  appPreferences = {
    ...appPreferences,
    ...normalizedState.appPreferences
  };

  if (document.documentElement.dataset.theme !== appPreferences.theme) {
    applyTheme(appPreferences.theme);
  } else {
    saveAppPreferences();
  }

  moodQueueCache = { key: "", mood: "", results: [] };
  personalCalendarCache = { key: "", data: null };
  profileCollectionsCache = { key: "", sections: [] };
}

function mergeLibraryStates(localState, remoteState) {
  const local = sanitizeLibraryState(localState);
  const remote = sanitizeLibraryState(remoteState);
  const localUpdatedAt = new Date(local.updatedAt || 0).getTime();
  const remoteUpdatedAt = new Date(remote.updatedAt || 0).getTime();
  const preferredState = localUpdatedAt >= remoteUpdatedAt ? local : remote;
  const secondaryState = preferredState === local ? remote : local;
  const mergedFamilyProfiles = new Map();

  [...secondaryState.familyProfiles, ...preferredState.familyProfiles].forEach((profile, index) => {
    const safeProfile = sanitizeFamilyProfile(profile, index);
    const existing = mergedFamilyProfiles.get(safeProfile.id);

    if (!existing) {
      mergedFamilyProfiles.set(safeProfile.id, safeProfile);
      return;
    }

    const mergedLists = new Map();
    [...existing.customLists, ...safeProfile.customLists].forEach((list) => {
      const listEntry = mergedLists.get(list.id);
      if (listEntry) {
        listEntry.name = list.name || listEntry.name;
        listEntry.movies = sanitizeStoredMovies([...list.movies, ...listEntry.movies], MAX_LIST_ITEMS);
        return;
      }

      mergedLists.set(list.id, {
        ...list,
        movies: sanitizeStoredMovies(list.movies, MAX_LIST_ITEMS)
      });
    });

    mergedFamilyProfiles.set(safeProfile.id, sanitizeFamilyProfile({
      ...existing,
      ...safeProfile,
      favorites: sanitizeStoredMovies([...safeProfile.favorites, ...existing.favorites], MAX_WATCHLIST_ITEMS),
      watchlist: sanitizeStoredMovies([...safeProfile.watchlist, ...existing.watchlist], MAX_WATCHLIST_ITEMS),
      history: sanitizeStoredActivity([...safeProfile.history, ...existing.history], MAX_HISTORY_ITEMS, "watchedAt"),
      continueWatching: sanitizeStoredActivity([...safeProfile.continueWatching, ...existing.continueWatching], MAX_CONTINUE_ITEMS, "playedAt"),
      customLists: [...mergedLists.values()],
      personalReviews: sanitizeStoredReviews([...safeProfile.personalReviews, ...existing.personalReviews], MAX_PERSONAL_REVIEWS),
      playerProgress: sanitizeStoredProgressEntries([...safeProfile.playerProgress, ...existing.playerProgress], MAX_PROGRESS_ITEMS),
      badgeStats: {
        profileShareCount: Math.max(safeProfile.badgeStats.profileShareCount, existing.badgeStats.profileShareCount),
        listShareCount: Math.max(safeProfile.badgeStats.listShareCount, existing.badgeStats.listShareCount),
        unlockedBadgeIds: [...new Set([...safeProfile.badgeStats.unlockedBadgeIds, ...existing.badgeStats.unlockedBadgeIds])]
      },
      profilePrefs: {
        displayName: safeProfile.profilePrefs.displayName || existing.profilePrefs.displayName,
        avatarImage: safeProfile.profilePrefs.avatarImage || existing.profilePrefs.avatarImage,
        avatarEmoji: safeProfile.profilePrefs.avatarEmoji || existing.profilePrefs.avatarEmoji
      }
    }));
  });

  return sanitizeLibraryState({
    version: 3,
    updatedAt: new Date(Math.max(localUpdatedAt || 0, remoteUpdatedAt || 0, Date.now())).toISOString(),
    familyProfiles: [...mergedFamilyProfiles.values()],
    activeFamilyProfileId: preferredState.activeFamilyProfileId || secondaryState.activeFamilyProfileId || "main",
    followedProfiles: sanitizeFollowedProfiles([...preferredState.followedProfiles, ...secondaryState.followedProfiles], MAX_FOLLOWED_PROFILES),
    dismissedNotifications: sanitizeStringList([...preferredState.dismissedNotifications, ...secondaryState.dismissedNotifications], 400),
    announcedNotifications: sanitizeStringList([...preferredState.announcedNotifications, ...secondaryState.announcedNotifications], 400),
    appPreferences: preferredState.appPreferences
  });
}

function areLibraryStatesEqual(left, right) {
  return JSON.stringify(sanitizeLibraryState(left)) === JSON.stringify(sanitizeLibraryState(right));
}

function loadLibraryState() {
  applyLibraryState(readLibraryState());
}

function getAuthHeaders(headers = {}) {
  return currentSessionToken
    ? { ...headers, Authorization: `Bearer ${currentSessionToken}` }
    : headers;
}

async function syncLibraryStateFromCloud() {
  if (!currentUser || !currentSessionToken) return;

  const localState = sanitizeLibraryState(readLibraryState());
  const response = await fetchJson("/api/library-state", {
    headers: getAuthHeaders()
  });
  const remoteState = sanitizeLibraryState(response?.state || {});
  const mergedState = mergeLibraryStates(localState, remoteState);

  applyLibraryState(mergedState);
  persistLocalLibraryState(mergedState);

  if (!areLibraryStatesEqual(remoteState, mergedState)) {
    await fetchJson("/api/library-state", {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ state: mergedState })
    });
  }
}

async function syncLibraryStateToCloud() {
  if (!currentUser || !currentSessionToken) return;
  if (cloudSyncPromise) {
    cloudSyncQueued = true;
    return cloudSyncPromise;
  }

  const state = buildLibraryStateSnapshot();
  cloudSyncPromise = fetchJson("/api/library-state", {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ state })
  })
    .then((response) => {
      if (response?.state) {
        persistLocalLibraryState(response.state);
      } else {
        persistLocalLibraryState(state);
      }
    })
    .catch((error) => {
      console.warn("Cloud save:", error);
      persistLocalLibraryState(state);
    })
    .finally(() => {
      cloudSyncPromise = null;
      if (cloudSyncQueued) {
        cloudSyncQueued = false;
        void syncLibraryStateToCloud();
      }
    });

  return cloudSyncPromise;
}

function queueCloudLibrarySync() {
  if (!currentUser || !currentSessionToken) return;

  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => {
    void syncLibraryStateToCloud();
  }, 350);
}

function saveLibraryState() {
  const state = buildLibraryStateSnapshot();
  persistLocalLibraryState(state);
   moodQueueCache = { key: "", mood: "", results: [] };
   personalCalendarCache = { key: "", data: null };
   profileCollectionsCache = { key: "", sections: [] };
  queueCloudLibrarySync();
}

function upsertMovieInList(list, movie) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return list;
  const mediaKey = getMediaKey(normalized);
  return [normalized, ...list.filter((entry) => getMediaKey(entry) !== mediaKey)];
}

function upsertActivityEntry(list, movie, timestampKey) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return list;
  const timestamp = new Date().toISOString();
  const mediaKey = getMediaKey(normalized);
  return [
    { movie: normalized, [timestampKey]: timestamp },
    ...list.filter((entry) => getMediaKey(entry.movie) !== mediaKey)
  ];
}

function sanitizeStoredLists(lists) {
  if (!Array.isArray(lists)) return [];

  return lists.slice(0, MAX_CUSTOM_LISTS).map((list, index) => ({
    id: String(list?.id || `lista-${index + 1}`),
    name: String(list?.name || `Lista ${index + 1}`).trim().slice(0, 40),
    movies: sanitizeStoredMovies(list?.movies, MAX_LIST_ITEMS)
  })).filter((list) => list.name);
}

function sanitizeProfilePrefs(value) {
  const fallback = { displayName: "", avatarImage: "", avatarEmoji: "🎬" };
  if (!value || typeof value !== "object") return fallback;
  return {
    displayName: String(value.displayName || "").trim().slice(0, 40),
    avatarImage: typeof value.avatarImage === "string" && value.avatarImage.startsWith("data:image/")
      ? value.avatarImage
      : "",
    avatarEmoji: String(value.avatarEmoji || "🎬").trim().slice(0, 2) || "🎬"
  };
}

function getAvatarFallbackText(seed = "") {
  if (profilePrefs.avatarEmoji && profilePrefs.avatarEmoji !== "🎬") {
    return profilePrefs.avatarEmoji;
  }

  const normalizedSeed = String(profilePrefs.displayName || seed || "Perfil").trim();
  return normalizedSeed.charAt(0).toUpperCase() || "🎬";
}

function renderAvatarMarkup(className, { image = "", fallback = "🎬", alt = "Avatar" } = {}) {
  const hasImage = Boolean(image);
  return `
    <div class="${className}${hasImage ? " has-image" : ""}">
      ${hasImage ? `<img src="${image}" alt="${escapeHtml(alt)}">` : escapeHtml(fallback)}
    </div>
  `;
}

function setAvatarElement(element, { image = "", fallback = "🎬", alt = "Avatar" } = {}) {
  if (!element) return;

  element.classList.toggle("has-image", Boolean(image));
  if (image) {
    element.innerHTML = `<img src="${image}" alt="${escapeHtml(alt)}">`;
  } else {
    element.textContent = fallback;
  }
}

function upsertFamilyProfile(profile) {
  const safeProfile = sanitizeFamilyProfile(profile, familyProfilesCache.length);
  const existingIndex = familyProfilesCache.findIndex((entry) => entry.id === safeProfile.id);

  if (existingIndex >= 0) {
    familyProfilesCache = familyProfilesCache.map((entry, index) => (index === existingIndex ? safeProfile : entry));
  } else {
    familyProfilesCache = [safeProfile, ...familyProfilesCache].slice(0, MAX_FAMILY_PROFILES);
  }

  return safeProfile;
}

function handleFavoritesLoadSuccess(data) {
  const favorites = (data || []).map((record) => normalizeMovie(record.movie_data)).filter(Boolean);
  const mainProfile = upsertFamilyProfile({
    ...(familyProfilesCache.find((profile) => profile.id === "main") || buildLegacyMainProfile({})),
    id: "main",
    favorites
  });

  if (activeFamilyProfileId === "main") {
    applyFamilyProfile(mainProfile);
  }

  favoritesLoaded = true;
  persistLocalLibraryState(buildLibraryStateSnapshot());
  queueCloudLibrarySync();
}

function handleFavoritesLoadFailure() {
  favoritesLoaded = false;
}

function getFavoriteStoreId(movie) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return null;
  return getMediaType(normalized) === "tv" ? -normalized.id : normalized.id;
}

function getFavoriteLoadErrorMessage(error) {
  if (!error) {
    return "Nao foi possivel carregar os favoritos.";
  }

  if (error.code === "PGRST116") {
    return "A tabela de favoritos ainda nao esta disponivel no Supabase.";
  }

  return error.message || "Nao foi possivel carregar os favoritos.";
}

function createFamilyProfile(name) {
  const trimmedName = String(name || "").trim().slice(0, 32);
  if (!trimmedName || familyProfilesCache.length >= MAX_FAMILY_PROFILES) {
    return null;
  }

  const profile = upsertFamilyProfile({
    id: `profile-${Date.now()}`,
    name: trimmedName,
    profilePrefs: { displayName: trimmedName, avatarImage: "", avatarEmoji: "🎬" },
    favorites: [],
    watchlist: [],
    history: [],
    continueWatching: [],
    customLists: [],
    personalReviews: [],
    playerProgress: [],
    badgeStats: { profileShareCount: 0, listShareCount: 0, unlockedBadgeIds: [] }
  });

  setActiveFamilyProfile(profile.id, { persist: false });
  saveLibraryState();
  return profile;
}

function renameFamilyProfile(profileId, name) {
  const trimmedName = String(name || "").trim().slice(0, 32);
  if (!trimmedName) return;

  familyProfilesCache = familyProfilesCache.map((profile) => (
    profile.id === profileId
      ? sanitizeFamilyProfile({
        ...profile,
        name: trimmedName,
        profilePrefs: { ...profile.profilePrefs, displayName: trimmedName }
      })
      : profile
  ));

  if (profileId === activeFamilyProfileId) {
    applyFamilyProfile(getActiveFamilyProfile());
  }

  saveLibraryState();
}

function deleteFamilyProfile(profileId) {
  if (profileId === "main" || familyProfilesCache.length <= 1) return false;

  syncActiveProfileCache();
  familyProfilesCache = familyProfilesCache.filter((profile) => profile.id !== profileId);
  if (activeFamilyProfileId === profileId) {
    applyFamilyProfile(familyProfilesCache[0]);
  }
  saveLibraryState();
  return true;
}

function updateNavUI() {
  if (currentUser) {
    const displayName = getUserDisplayName(currentUser.email);
    setAvatarElement(userAvatar, {
      image: profilePrefs.avatarImage,
      fallback: getAvatarFallbackText(currentUser.email),
      alt: `Avatar de ${displayName}`
    });
    userEmail.textContent = displayName;
    loginBtn.classList.add("hidden");
    userPill.classList.remove("hidden");
    profileNavLink.classList.remove("hidden");
  } else {
    loginBtn.classList.remove("hidden");
    userPill.classList.add("hidden");
    profileNavLink.classList.add("hidden");
    clearFavoritesState();
  }
}

function syncViewportMode() {
  document.body.classList.toggle("mobile-ui", mobileViewportQuery.matches);
}

// ─── Auth modal ──────────────────────────────────────────────
function openAuthModal(mode = "login") {
  authMode = mode;
  authError.classList.add("hidden");
  authForm.reset();
  setAuthTab(mode);
  authModal.classList.remove("hidden");
  authModal.setAttribute("aria-hidden", "false");
  setTimeout(() => authEmail.focus(), 50);
}

function closeAuthModal() {
  authModal.classList.add("hidden");
  authModal.setAttribute("aria-hidden", "true");
}

function setAuthTab(mode) {
  authMode = mode;
  document.querySelectorAll(".auth-tab").forEach((t) =>
    t.classList.toggle("active", t.dataset.tab === mode)
  );
  authSubmit.textContent = mode === "login" ? "Entrar" : "Criar conta";
  authPassword.autocomplete = mode === "login" ? "current-password" : "new-password";
}

document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    setAuthTab(tab.dataset.tab);
    authError.classList.add("hidden");
  });
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.classList.add("hidden");
  authSubmit.disabled = true;
  authSubmit.textContent = "A processar...";

  const email = authEmail.value.trim();
  const password = authPassword.value;

  try {
    let error;
    if (authMode === "login") {
      ({ error } = await sb.auth.signInWithPassword({ email, password }));
    } else {
      ({ error } = await sb.auth.signUp({ email, password }));
    }
    if (error) throw error;
    closeAuthModal();
  } catch (err) {
    authError.textContent = translateAuthError(err.message);
    authError.classList.remove("hidden");
  } finally {
    authSubmit.disabled = false;
    authSubmit.textContent = authMode === "login" ? "Entrar" : "Criar conta";
  }
});

function translateAuthError(msg) {
  if (msg.includes("Invalid login")) return "Email ou password incorretos.";
  if (msg.includes("already registered")) return "Este email já tem conta. Faz login.";
  if (msg.includes("Password should")) return "A password deve ter pelo menos 6 caracteres.";
  if (msg.includes("valid email")) return "Introduz um email válido.";
  return msg;
}

async function handleLogout() {
  try {
    await sb.auth.signOut();
  } catch (err) {
    console.warn("Logout:", err);
  } finally {
    currentUser = null;
    currentSessionToken = "";
    clearTimeout(cloudSyncTimer);
    cloudSyncPromise = null;
    cloudSyncQueued = false;
    loadLibraryState();
    if (!getDetailRouteMatch()) closeDetails();
    closePlayer();
    closeAuthModal();
    updateNavUI();
    refreshAllFavButtons();
    refreshAllWatchlistButtons();
    if (["/favoritos", "/perfil", "/listas", "/perfis"].includes(getCurrentPath())) {
      navigateTo("/");
    } else {
      handleRoute();
    }
  }
}

loginBtn.addEventListener("click", () => openAuthModal("login"));
authCloseBtn.addEventListener("click", closeAuthModal);
authModal.addEventListener("click", (e) => { if (e.target === authModal) closeAuthModal(); });
logoutBtn.addEventListener("click", async (e) => {
  e.stopPropagation();
  await handleLogout();
});

// ─── Favorites (Supabase) ────────────────────────────────────
async function loadFavorites(options = {}) {
  const { force = false } = options;

  if (!currentUser) {
    clearFavoritesState();
    return favsCache;
  }

  if (!isPrimaryFamilyProfile()) {
    favoritesLoaded = true;
    return favsCache;
  }

  if (!sb) {
    throw new Error("A ligação aos favoritos não está disponível.");
  }

  if (favoritesLoaded && !force) {
    return favsCache;
  }

  if (!force && favoritesLoadingPromise) {
    return favoritesLoadingPromise;
  }

  favoritesLoadingPromise = (async () => {
    const { data, error } = await sb
      .from("favorites")
      .select("movie_id, movie_data")
      .eq("user_id", currentUser.id);

    if (error) {
      handleFavoritesLoadFailure();
      throw error;
    }

    handleFavoritesLoadSuccess(data);
    return favsCache;
  })();

  try {
    return await favoritesLoadingPromise;
  } finally {
    favoritesLoadingPromise = null;
  }
}

function isFavorite(movie) {
  const mediaKey = typeof movie === "object" ? getMediaKey(movie) : getMediaKey({ id: movie, media_type: selectedMovie?.id === Number(movie) ? selectedMovie?.media_type : "movie" });
  return favsCache.some((entry) => getMediaKey(entry) === mediaKey);
}

async function toggleFavorite(movie) {
  if (!currentUser) { openAuthModal("login"); return; }

  const normalizedMovie = normalizeMovie(movie);
  if (!normalizedMovie) return;
  const alreadyFav = isFavorite(normalizedMovie);
  const favoriteStoreId = getFavoriteStoreId(normalizedMovie);
  if (alreadyFav) {
    favsCache = favsCache.filter((m) => getMediaKey(m) !== getMediaKey(normalizedMovie));
    if (isPrimaryFamilyProfile() && favoriteStoreId !== null) {
      await sb.from("favorites").delete()
        .eq("user_id", currentUser.id).eq("movie_id", favoriteStoreId);
    }
  } else {
    const favoriteMovie = { ...normalizedMovie, favoritedAt: new Date().toISOString() };
    favsCache = upsertMovieInList(favsCache, favoriteMovie).slice(0, MAX_WATCHLIST_ITEMS);
    if (isPrimaryFamilyProfile() && favoriteStoreId !== null) {
      await sb.from("favorites").insert({
        user_id: currentUser.id,
        movie_id: favoriteStoreId,
        movie_data: favoriteMovie,
      });
    }
  }
  favoritesLoaded = true;

  saveLibraryState();
  updateFavUI(normalizedMovie);
  refreshBadgeExperience({ refreshRoute: true, refreshNotifications: true });
  void refreshNotifications({ force: true });
  if (getCurrentPath() === "/favoritos") viewFavoritos();
}

function updateFavUI(movie) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return;
  const fav = isFavorite(normalized);
  document.querySelectorAll(`.card-fav[data-media-key="${getMediaKey(normalized)}"]`).forEach((btn) => {
    btn.classList.toggle("is-fav", fav);
    btn.setAttribute("aria-label", fav ? "Remover dos favoritos" : "Adicionar aos favoritos");
  });
  if (selectedMovie && getMediaKey(selectedMovie) === getMediaKey(normalized)) {
    detailFavBtn.classList.toggle("is-fav", fav);
    detailFavBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Favorito`;
  }
}

function refreshAllFavButtons() {
  document.querySelectorAll(".card-fav[data-id]").forEach((btn) => {
    const id = parseInt(btn.dataset.id, 10);
    const mediaType = btn.dataset.mediaType === "tv" ? "tv" : "movie";
    const fav = isFavorite({ id, media_type: mediaType });
    btn.classList.toggle("is-fav", fav);
    btn.setAttribute("aria-label", fav ? "Remover dos favoritos" : "Adicionar aos favoritos");
  });
  if (selectedMovie) {
    const fav = isFavorite(selectedMovie);
    detailFavBtn.classList.toggle("is-fav", fav);
    detailFavBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Favorito`;
  }
}

function isInWatchlist(movie) {
  const mediaKey = typeof movie === "object" ? getMediaKey(movie) : getMediaKey({ id: movie, media_type: selectedMovie?.id === Number(movie) ? selectedMovie?.media_type : "movie" });
  return watchlistCache.some((entry) => getMediaKey(entry) === mediaKey);
}

function toggleWatchlist(movie) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return;

  if (isInWatchlist(normalized)) {
    watchlistCache = watchlistCache.filter((entry) => getMediaKey(entry) !== getMediaKey(normalized));
  } else {
    watchlistCache = upsertMovieInList(watchlistCache, { ...normalized, watchlistedAt: new Date().toISOString() }).slice(0, MAX_WATCHLIST_ITEMS);
  }

  saveLibraryState();
  updateWatchlistUI(normalized);
  refreshBadgeExperience({ refreshRoute: true, refreshNotifications: true });
  void refreshNotifications({ force: true });
  if (getCurrentPath() === "/watchlist" || getCurrentPath() === "/perfil") {
    handleRoute();
  }
}

function updateWatchlistUI(movie) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return;
  const inWatchlist = isInWatchlist(normalized);
  document.querySelectorAll(`.card-watchlist[data-media-key="${getMediaKey(normalized)}"]`).forEach((btn) => {
    btn.classList.toggle("is-active", inWatchlist);
    btn.setAttribute("aria-label", inWatchlist ? "Remover da watchlist" : "Adicionar a watchlist");
    btn.title = inWatchlist ? "Remover da watchlist" : "Adicionar a watchlist";
  });

  if (selectedMovie && getMediaKey(selectedMovie) === getMediaKey(normalized)) {
    detailWatchlistBtn.classList.toggle("is-fav", inWatchlist);
    detailWatchlistBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${inWatchlist ? '<polyline points="20 6 9 17 4 12"/>' : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}</svg> Watchlist`;
  }
}

function refreshAllWatchlistButtons() {
  document.querySelectorAll(".card-watchlist[data-id]").forEach((btn) => {
    const id = Number.parseInt(btn.dataset.id, 10);
    const mediaType = btn.dataset.mediaType === "tv" ? "tv" : "movie";
    const inWatchlist = isInWatchlist({ id, media_type: mediaType });
    btn.classList.toggle("is-active", inWatchlist);
    btn.setAttribute("aria-label", inWatchlist ? "Remover da watchlist" : "Adicionar a watchlist");
    btn.title = inWatchlist ? "Remover da watchlist" : "Adicionar a watchlist";
  });

  if (selectedMovie) {
    updateWatchlistUI(selectedMovie);
  }
}

function getPlayerProgress(movie, options = {}) {
  const playbackKey = typeof movie === "object"
    ? getPlaybackKey(movie, options)
    : getPlaybackKey({ id: movie, media_type: options.mediaType || selectedMovie?.media_type || "movie" }, options);
  if (!playbackKey) return null;
  return playerProgressCache.find((entry) => entry.playbackKey === playbackKey) || null;
}

function syncContinueWatchingFromProgress(movie, progressEntry) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return;
  const playbackKey = progressEntry?.playbackKey || getPlaybackKey(normalized, progressEntry || {});

  if (!progressEntry || progressEntry.progressPercent >= 95) {
    continueWatchingCache = continueWatchingCache.filter((entry) => getPlaybackKey(entry.movie, entry) !== playbackKey);
    return;
  }

  const continueMovie = getMediaType(normalized) === "tv"
    ? {
        ...normalized,
        selectedSeason: progressEntry.season,
        selectedEpisode: progressEntry.episode,
        social_context: formatEpisodeLabel(progressEntry.season, progressEntry.episode)
      }
    : normalized;
  continueWatchingCache = [
    {
      movie: continueMovie,
      playedAt: progressEntry.updatedAt,
      positionSeconds: progressEntry.positionSeconds,
      progressPercent: progressEntry.progressPercent,
      season: progressEntry.season,
      episode: progressEntry.episode
    },
    ...continueWatchingCache.filter((entry) => getPlaybackKey(entry.movie, entry) !== playbackKey)
  ].slice(0, MAX_CONTINUE_ITEMS);
}

function savePlaybackProgress(movie, positionSeconds, runtime, options = {}) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return null;

  const season = Math.max(1, Number(options.season || normalized.selectedSeason || 1) || 1);
  const episode = Math.max(1, Number(options.episode || normalized.selectedEpisode || 1) || 1);
  const existingProgress = getPlayerProgress(normalized, { season, episode });
  const safeRuntime = Math.max(0, Number(runtime) || Number(movie?.runtime) || 0);
  const safePositionSeconds = Math.max(0, Math.round(Number(positionSeconds) || 0));
  const progressPercent = safeRuntime
    ? Math.min(100, Math.max(0, Math.round((safePositionSeconds / (safeRuntime * 60)) * 100)))
    : Math.min(100, Math.max(0, Number(options.progressPercent) || 0));
  const updatedAt = options.updatedAt || new Date().toISOString();

  const progressEntry = {
    movieId: normalized.id,
    mediaKey: getMediaKey(normalized),
    playbackKey: getPlaybackKey(normalized, { season, episode }),
    mediaType: getMediaType(normalized),
    movie: { ...normalized, runtime: safeRuntime || normalized.runtime || null, selectedSeason: season, selectedEpisode: episode },
    positionSeconds: safePositionSeconds,
    runtime: safeRuntime,
    progressPercent,
    updatedAt,
    lastDevice: options.lastDevice || existingProgress?.lastDevice || getCurrentDeviceLabel(),
    sessionCount: Math.max(1, Number(options.sessionCount) || Number(existingProgress?.sessionCount) || 1),
    season,
    episode
  };

  playerProgressCache = sanitizeStoredProgressEntries([progressEntry, ...playerProgressCache], MAX_PROGRESS_ITEMS);
  syncContinueWatchingFromProgress(normalized, progressEntry);
  saveLibraryState();
  refreshBadgeExperience({ refreshRoute: false });
  return progressEntry;
}

function clearPlaybackProgress(movieId) {
  const numericId = Number(movieId);
  playerProgressCache = playerProgressCache.filter((entry) => entry.movieId !== numericId);
  continueWatchingCache = continueWatchingCache.filter((entry) => entry.movie.id !== numericId);
  saveLibraryState();
  refreshBadgeExperience({ refreshRoute: true });
}

function recordPlayback(movie) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return;

  historyCache = upsertActivityEntry(historyCache, normalized, "watchedAt").slice(0, MAX_HISTORY_ITEMS);
  saveLibraryState();
  refreshBadgeExperience({ refreshRoute: true, refreshNotifications: true });
}

function getContinueWatchingMovies() {
  return continueWatchingCache
    .sort((left, right) => new Date(right.playedAt).getTime() - new Date(left.playedAt).getTime())
    .map((entry) => entry.movie);
}

function buildSharePayload(options = {}) {
  const { listId } = options;
  const list = listId ? customListsCache.find((entry) => entry.id === listId) : null;
  const exportDate = new Date().toISOString();
  const codeSeed = `${currentUser?.id || "guest"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    version: 1,
    type: list ? "list" : "profile",
    shareCode: `mf-${codeSeed}`,
    ownerUserId: currentUser?.id || "",
    displayName: getUserDisplayName(currentUser?.email || "MimiFlix"),
    avatarImage: profilePrefs.avatarImage || "",
    avatarText: getAvatarFallbackText(currentUser?.email || "M"),
    exportedAt: exportDate,
    favorites: favsCache.slice(0, 18),
    lists: list
      ? [{ id: list.id, name: list.name, movies: list.movies.slice(0, MAX_LIST_ITEMS) }]
      : customListsCache.slice(0, MAX_CUSTOM_LISTS).map((entry) => ({ id: entry.id, name: entry.name, movies: entry.movies.slice(0, MAX_LIST_ITEMS) })),
    topReviews: personalReviewsCache.slice(0, 6)
  };
}

function encodeSharePayload(payload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function decodeSharePayload(value) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(String(value || "").trim()))));
  } catch {
    return null;
  }
}

async function copyTextToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const input = document.createElement("textarea");
  input.value = value;
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
  return true;
}

async function shareProfileSnapshot(options = {}) {
  const payload = buildSharePayload(options);
  await copyTextToClipboard(encodeSharePayload(payload));
  badgeStats = sanitizeBadgeStats({
    ...badgeStats,
    profileShareCount: badgeStats.profileShareCount + (options.listId ? 0 : 1),
    listShareCount: badgeStats.listShareCount + (options.listId ? 1 : 0)
  });
  saveLibraryState();
  refreshBadgeExperience({ refreshRoute: true, refreshNotifications: true });
}

async function syncMutualFriendship(profile) {
  if (!currentUser || !currentSessionToken || !profile?.ownerUserId || profile.ownerUserId === currentUser.id) {
    return;
  }

  await fetchJson("/api/friends/connect", {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      targetUserId: profile.ownerUserId,
      profile: buildSharePayload(),
      friendProfile: profile
    })
  });
}

async function importFollowedProfile(shareCode) {
  const payload = decodeSharePayload(shareCode);

  if (!payload || !payload.displayName) {
    throw new Error("O código de partilha nao e valido.");
  }

  const profile = sanitizeSharedProfile(payload);
  if (!profile) {
    throw new Error("Nao foi possivel importar este perfil.");
  }

  followedProfilesCache = sanitizeFollowedProfiles([profile, ...followedProfilesCache], MAX_FOLLOWED_PROFILES);
  saveLibraryState();
  await syncMutualFriendship(profile).catch((error) => {
    console.warn("Mutual friend sync:", error);
  });
  refreshBadgeExperience({ refreshRoute: true, refreshNotifications: true });
  void refreshNotifications({ force: true });
  return profile;
}

function removeFollowedProfile(shareCode) {
  followedProfilesCache = followedProfilesCache.filter((entry) => entry.shareCode !== shareCode);
  saveLibraryState();
  void refreshNotifications({ force: true });
}

function buildSocialRecommendations() {
  const ownFavoriteIds = new Set(favsCache.map((movie) => movie.id));
  const candidates = new Map();

  followedProfilesCache.forEach((profile) => {
    profile.favorites.forEach((movie) => {
      if (ownFavoriteIds.has(movie.id)) return;
      const existing = candidates.get(movie.id) || { movie, score: 0, supporters: [] };
      existing.movie = movie;
      existing.score += (movie.vote_average || 0) + 6;
      existing.supporters.push(profile.displayName);
      candidates.set(movie.id, existing);
    });
  });

  return [...candidates.values()]
    .sort((left, right) => right.score - left.score)
    .slice(0, 12)
    .map((entry) => ({
      ...entry.movie,
      social_context: `Gostado por ${entry.supporters.slice(0, 2).join(", ")}${entry.supporters.length > 2 ? " e mais" : ""}`
    }));
}

function createCustomList(name) {
  const trimmedName = String(name || "").trim().slice(0, 40);
  if (!trimmedName || customListsCache.length >= MAX_CUSTOM_LISTS) {
    return null;
  }

  const list = {
    id: `list-${Date.now()}`,
    name: trimmedName,
    movies: []
  };
  customListsCache = [list, ...customListsCache];
  saveLibraryState();
  refreshBadgeExperience({ refreshRoute: true, refreshNotifications: true });
  return list;
}

function addMovieToCustomList(listId, movie) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return;

  customListsCache = customListsCache.map((list) => {
    if (list.id !== listId) return list;
    return {
      ...list,
      movies: upsertMovieInList(list.movies, normalized).slice(0, MAX_LIST_ITEMS)
    };
  });
  saveLibraryState();
}

function removeMovieFromCustomList(listId, movieId) {
  customListsCache = customListsCache.map((list) => {
    if (list.id !== listId) return list;
    return {
      ...list,
      movies: list.movies.filter((movie) => movie.id !== movieId)
    };
  });
  saveLibraryState();
}

function renameCustomList(listId, name) {
  const trimmedName = String(name || "").trim().slice(0, 40);
  if (!trimmedName) return;

  customListsCache = customListsCache.map((list) => (
    list.id === listId ? { ...list, name: trimmedName } : list
  ));
  saveLibraryState();
}

function deleteCustomList(listId) {
  customListsCache = customListsCache.filter((list) => list.id !== listId);
  saveLibraryState();
}

function showListPickerForMovie(movie) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return;

  const currentLists = customListsCache.map((list, index) => `${index + 1}. ${list.name}`).join("\n");
  const selection = window.prompt(
    currentLists
      ? `Escolhe o numero da lista ou escreve um nome novo:\n${currentLists}`
      : `Escreve o nome da nova lista para guardar ${getContentLabel(normalized, "este título")}:`
  );

  if (!selection) return;

  const pickedIndex = Number.parseInt(selection, 10);
  let targetList = null;

  if (Number.isFinite(pickedIndex) && customListsCache[pickedIndex - 1]) {
    targetList = customListsCache[pickedIndex - 1];
  } else {
    targetList = createCustomList(selection);
  }

  if (!targetList) return;
  addMovieToCustomList(targetList.id, normalized);
}

function saveProfilePrefs(displayName, avatarImage) {
  profilePrefs = sanitizeProfilePrefs({ ...profilePrefs, displayName, avatarImage });
  saveLibraryState();
  updateNavUI();
}

function getPersonalReview(movie) {
  const mediaKey = typeof movie === "object" ? getMediaKey(movie) : getMediaKey({ id: movie, media_type: selectedMovie?.media_type || "movie" });
  return personalReviewsCache.find((entry) => entry.mediaKey === mediaKey) || null;
}

function savePersonalReview(movie, ratingValue, reviewText) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return;

  const rating = Number.isFinite(Number(ratingValue))
    ? Math.min(10, Math.max(1, Number.parseInt(ratingValue, 10)))
    : null;
  const review = String(reviewText || "").trim().slice(0, 800);

  if (!rating && !review) {
    removePersonalReview(normalized);
    return;
  }

  personalReviewsCache = sanitizeStoredReviews([
    {
      movieId: normalized.id,
      mediaKey: getMediaKey(normalized),
      movie: normalized,
      rating,
      review,
      updatedAt: new Date().toISOString()
    },
    ...personalReviewsCache
  ], MAX_PERSONAL_REVIEWS);
  saveLibraryState();
  refreshBadgeExperience({ refreshRoute: true, refreshNotifications: true });
}

function removePersonalReview(movieId) {
  const mediaKey = typeof movieId === "object" ? getMediaKey(movieId) : getMediaKey({ id: movieId, media_type: selectedMovie?.media_type || "movie" });
  personalReviewsCache = personalReviewsCache.filter((entry) => entry.mediaKey !== mediaKey);
  saveLibraryState();
  refreshBadgeExperience({ refreshRoute: true, refreshNotifications: true });
}

function getReviewStorageLabel() {
  return currentUser ? "Sincronizado com a tua conta" : "Guardado neste dispositivo";
}

function renderDetailReviewEditor(movie) {
  if (!detailPersonalReview || !movie) return;

  const review = getPersonalReview(movie);
  const status = review
    ? `Atualizado ${formatShortDateTime(review.updatedAt)}.`
    : `${getReviewStorageLabel()}.`;

  detailPersonalReview.innerHTML = `
    <div class="detail-review-card">
      <div class="detail-review-head">
        <div>
          <h3 class="detail-review-title">A tua review</h3>
          <p class="detail-review-subtitle">Diz o que achaste e guarda uma nota pessoal para voltares mais tarde.</p>
        </div>
        <span class="profile-panel-tag">${escapeHtml(getReviewStorageLabel())}</span>
      </div>
      <div class="detail-review-grid">
        <label class="filter-field">
          <span>Nota pessoal</span>
          <select id="detailReviewRating">
            <option value="">Sem nota</option>
            ${Array.from({ length: 10 }, (_, index) => {
              const value = String(index + 1);
              return `<option value="${value}"${review?.rating === index + 1 ? " selected" : ""}>${value}/10</option>`;
            }).join("")}
          </select>
        </label>
        <label class="filter-field detail-review-field detail-review-field--full">
          <span>Comentário</span>
          <textarea id="detailReviewText" rows="4" maxlength="800" placeholder="Escreve uma mini review, uma frase sobre o ritmo, atores, final...">${escapeHtml(review?.review || "")}</textarea>
        </label>
      </div>
      <div class="detail-review-actions">
        <button id="detailSaveReviewBtn" class="accent-btn" type="button">Guardar review</button>
        <button id="detailDeleteReviewBtn" class="secondary-btn" type="button"${review ? "" : " disabled"}>Remover</button>
      </div>
      <p id="detailReviewStatus" class="detail-review-status">${escapeHtml(status)}</p>
    </div>
  `;

  const ratingSelect = detailPersonalReview.querySelector("#detailReviewRating");
  const reviewTextarea = detailPersonalReview.querySelector("#detailReviewText");
  const saveButton = detailPersonalReview.querySelector("#detailSaveReviewBtn");
  const deleteButton = detailPersonalReview.querySelector("#detailDeleteReviewBtn");
  saveButton?.addEventListener("click", () => {
    savePersonalReview(movie, ratingSelect?.value, reviewTextarea?.value);
    renderDetailReviewEditor(movie);
    if (getCurrentPath() === "/perfil") {
      handleRoute();
    }
  });

  deleteButton?.addEventListener("click", () => {
    removePersonalReview(movie);
    renderDetailReviewEditor(movie);
    if (getCurrentPath() === "/perfil") {
      handleRoute();
    }
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Nao foi possivel ler a imagem selecionada."));
    };
    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem selecionada."));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Nao foi possivel preparar a imagem selecionada."));
    image.src = src;
  });
}

async function buildProfileAvatarDataUrl(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Seleciona uma imagem valida para o avatar.");
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    throw new Error("A imagem e demasiado grande. Usa um ficheiro ate 6 MB.");
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImageElement(source);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Nao foi possivel processar a imagem selecionada.");
  }

  const size = 192;
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.max(size / sourceWidth, size / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const offsetX = (size - drawWidth) / 2;
  const offsetY = (size - drawHeight) / 2;

  canvas.width = size;
  canvas.height = size;
  context.clearRect(0, 0, size, size);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  return canvas.toDataURL("image/jpeg", 0.86);
}

async function fetchMovieInsights(movieIds) {
  const ids = [...new Set((Array.isArray(movieIds) ? movieIds : []).map((value) => Number(value)).filter((value) => Number.isFinite(value)))];
  if (!ids.length) return [];

  const cachedResults = ids
    .map((id) => movieInsightsCache.get(id))
    .filter(Boolean);
  const missingIds = ids.filter((id) => !movieInsightsCache.has(id));

  if (missingIds.length) {
    const language = encodeURIComponent(getLanguage());
    const data = await fetchJson(`/api/movies/insights?language=${language}&movie_ids=${missingIds.join(",")}`);
    (data.results || []).forEach((movie) => {
      movieInsightsCache.set(movie.id, movie);
    });
  }

  return ids
    .map((id) => movieInsightsCache.get(id))
    .filter(Boolean);
}

function getTimestampYear(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear();
}

function getMonthLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-PT", { month: "long" });
}

function formatMinutesAsHours(minutes) {
  const safeMinutes = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  if (!hours) return `${remainingMinutes} min`;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
}

async function buildYearlyRankingSummary(year = new Date().getFullYear()) {
  const cacheKey = `${activeFamilyProfileId}:${year}:${historyCache.length}:${personalReviewsCache.length}:${playerProgressCache.length}:${favsCache.length}`;
  if (yearlyRankingCache.key === cacheKey && yearlyRankingCache.summary) {
    return yearlyRankingCache.summary;
  }

  const yearlyHistory = historyCache.filter((entry) => getTimestampYear(entry.watchedAt) === year);
  const yearlyReviews = personalReviewsCache.filter((entry) => getTimestampYear(entry.updatedAt) === year);
  const yearlyProgress = playerProgressCache.filter((entry) => getTimestampYear(entry.updatedAt) === year);
  const movieStats = new Map();
  const activityMonths = new Map();

  yearlyHistory.forEach((entry) => {
    const existing = movieStats.get(entry.movie.id) || { movie: entry.movie, score: 0, history: 0, review: null, progress: null };
    existing.movie = normalizeMovie(entry.movie) || existing.movie;
    existing.history += 1;
    existing.score += 7;
    movieStats.set(entry.movie.id, existing);
    activityMonths.set(getMonthLabel(entry.watchedAt), (activityMonths.get(getMonthLabel(entry.watchedAt)) || 0) + 1);
  });

  yearlyReviews.forEach((entry) => {
    const existing = movieStats.get(entry.movieId) || { movie: entry.movie, score: 0, history: 0, review: null, progress: null };
    existing.movie = normalizeMovie(entry.movie) || existing.movie;
    existing.review = entry;
    existing.score += 6 + (entry.rating || 0) / 2;
    movieStats.set(entry.movieId, existing);
    activityMonths.set(getMonthLabel(entry.updatedAt), (activityMonths.get(getMonthLabel(entry.updatedAt)) || 0) + 1);
  });

  yearlyProgress.forEach((entry) => {
    const existing = movieStats.get(entry.movieId) || { movie: entry.movie, score: 0, history: 0, review: null, progress: null };
    existing.movie = normalizeMovie(entry.movie) || existing.movie;
    existing.progress = entry;
    existing.score += Math.max(2, (entry.progressPercent || 0) / 14);
    movieStats.set(entry.movieId, existing);
    activityMonths.set(getMonthLabel(entry.updatedAt), (activityMonths.get(getMonthLabel(entry.updatedAt)) || 0) + 1);
  });

  const movieIds = [...movieStats.keys()];
  if (!movieIds.length) {
    yearlyRankingCache = { key: cacheKey, summary: null };
    return null;
  }

  const insights = await fetchMovieInsights(movieIds).catch(() => []);
  const insightsById = new Map(insights.map((movie) => [movie.id, movie]));
  const favoriteIds = new Set(favsCache.map((movie) => movie.id));
  const genreScores = new Map();
  const actorScores = new Map();
  let estimatedMinutesWatched = 0;

  const rankedMovies = [...movieStats.values()].map((entry) => {
    const insight = insightsById.get(entry.movie.id) || {};
    const mergedMovie = {
      ...entry.movie,
      ...insight,
      genres: insight.genres || entry.movie.genres || []
    };
    const runtime = Number(insight.runtime || entry.progress?.runtime || entry.movie.runtime || 0) || 0;
    const estimatedMinutes = entry.progress
      ? Math.max(Math.round((entry.progress.positionSeconds || 0) / 60), Math.round(runtime * ((entry.progress.progressPercent || 0) / 100)))
      : entry.history
        ? Math.round(runtime * 0.78)
        : 0;

    estimatedMinutesWatched += estimatedMinutes;

    (mergedMovie.genres || []).slice(0, 4).forEach((genre) => {
      genreScores.set(genre, (genreScores.get(genre) || 0) + entry.score);
    });

    (insight.cast || []).slice(0, 5).forEach((actor, index) => {
      actorScores.set(actor, (actorScores.get(actor) || 0) + Math.max(1, entry.score - index));
    });

    return {
      ...mergedMovie,
      yearlyScore: entry.score + (favoriteIds.has(entry.movie.id) ? 2 : 0),
      yearlyHistoryHits: entry.history,
      yearlyReview: entry.review,
      estimatedMinutes
    };
  }).sort((left, right) => right.yearlyScore - left.yearlyScore);

  const mostActiveMonth = [...activityMonths.entries()].sort((left, right) => right[1] - left[1])[0] || null;
  const summary = {
    year,
    movieCount: rankedMovies.length,
    reviewCount: yearlyReviews.length,
    estimatedMinutesWatched,
    topMovies: rankedMovies.slice(0, 10),
    topGenres: [...genreScores.entries()].sort((left, right) => right[1] - left[1]).slice(0, 5).map(([name, score]) => ({ name, score })),
    topActors: [...actorScores.entries()].sort((left, right) => right[1] - left[1]).slice(0, 6).map(([name, score]) => ({ name, score })),
    mostActiveMonth
  };

  yearlyRankingCache = {
    key: cacheKey,
    summary
  };

  return summary;
}


function getCurrentDeviceLabel() {
  const platform = String(navigator.platform || "dispositivo").replace(/_/g, " ").trim();
  const browser = navigator.userAgent.includes("Firefox")
    ? "Firefox"
    : navigator.userAgent.includes("Edg")
      ? "Edge"
      : navigator.userAgent.includes("Chrome")
        ? "Chrome"
        : "Browser";
  return `${platform} · ${browser}`.slice(0, 80);
}

async function fetchDiscoverMovies(extraParams = {}) {
  const params = new URLSearchParams({ language: getLanguage(), voteCountMin: "80" });
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const response = await fetchJson(`/api/discover?${params.toString()}`);
  return response.results || [];
}

async function ensureMoodQueue(moodId) {
  const preset = MOOD_PRESETS.find((entry) => entry.id === moodId) || MOOD_PRESETS[0];
  const favoriteIds = favsCache.slice(0, 4).map((movie) => movie.id).join(",");
  const cacheKey = `${activeFamilyProfileId}:${getLanguage()}:${preset.id}:${favoriteIds}`;
  if (moodQueueCache.key === cacheKey) {
    return moodQueueCache.results;
  }

  const results = await fetchDiscoverMovies({ ...preset.params, favoriteIds }).catch(() => []);
  moodQueueCache = { key: cacheKey, mood: preset.id, results };
  return results;
}

async function ensureProfileCollectionsData() {
  const profileIds = [...new Set([
    ...favsCache.slice(0, 5).map((movie) => movie.id),
    ...historyCache.slice(0, 5).map((entry) => entry.movie.id)
  ])];
  const cacheKey = `${activeFamilyProfileId}:${getLanguage()}:${profileIds.join(",")}`;
  if (profileCollectionsCache.key === cacheKey && profileCollectionsCache.sections.length) {
    return profileCollectionsCache.sections;
  }
  if (!profileIds.length) {
    profileCollectionsCache = { key: cacheKey, sections: [] };
    return [];
  }

  const data = await fetchJson(`/api/collections/profile?language=${encodeURIComponent(getLanguage())}&movie_ids=${profileIds.join(",")}`).catch(() => ({ sections: [] }));
  profileCollectionsCache = {
    key: cacheKey,
    sections: data.sections || []
  };
  return profileCollectionsCache.sections;
}

function buildPersonalListReminders() {
  return customListsCache
    .filter((list) => list.movies.length > 0 && list.movies.length < 4)
    .slice(0, 3)
    .map((list) => ({
      id: `list-reminder:${list.id}`,
      title: `${list.name} ainda está curta`,
      body: `Só tem ${list.movies.length} filme${list.movies.length === 1 ? "" : "s"}. Podes completar esta lista esta semana.`
    }));
}

async function ensurePersonalCalendarData() {
  const movieIds = [...new Set([
    ...watchlistCache.slice(0, 6).map((movie) => movie.id),
    ...favsCache.slice(0, 5).map((movie) => movie.id),
    ...historyCache.slice(0, 4).map((entry) => entry.movie.id)
  ])];
  const cacheKey = `${activeFamilyProfileId}:${getLanguage()}:${movieIds.join(",")}:${customListsCache.length}`;
  if (personalCalendarCache.key === cacheKey && personalCalendarCache.data) {
    return personalCalendarCache.data;
  }

  const remote = movieIds.length
    ? await fetchJson(`/api/calendar/personal?language=${encodeURIComponent(getLanguage())}&movie_ids=${movieIds.join(",")}`).catch(() => ({ sections: [] }))
    : { sections: [] };
  const data = {
    sections: [
      ...(remote.sections || []),
      {
        id: "list-reminders",
        title: "Lembretes das tuas listas",
        reminders: buildPersonalListReminders()
      }
    ]
  };
  personalCalendarCache = { key: cacheKey, data };
  return data;
}

function buildNextUpQueue() {
  const startedIds = new Set([
    ...historyCache.map((entry) => entry.movie.id),
    ...playerProgressCache.map((entry) => entry.movieId)
  ]);
  const recentGenres = historyCache
    .slice(0, 5)
    .flatMap((entry) => Array.isArray(entry.movie.genres) ? entry.movie.genres : [])
    .filter(Boolean);
  const genreScore = new Map();
  recentGenres.forEach((genre) => genreScore.set(genre, (genreScore.get(genre) || 0) + 1));

  return [...watchlistCache]
    .filter((movie) => !startedIds.has(movie.id))
    .map((movie) => ({
      movie,
      score: (Array.isArray(movie.genres) ? movie.genres.reduce((sum, genre) => sum + (genreScore.get(genre) || 0), 0) : 0) + (movie.vote_average || 0)
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 12)
    .map((entry) => ({
      ...entry.movie,
      social_context: "Próximo a ver"
    }));
}

function getVisibleHomeSectionOrder() {
  const hidden = new Set(appPreferences.hiddenHomeSections || []);
  return (appPreferences.homeSectionOrder || DEFAULT_HOME_SECTION_ORDER).filter((id) => !hidden.has(id));
}

function isMovieMarkedAsWatched(movieId) {
  const media = typeof movieId === "object" ? movieId : { id: movieId, media_type: "movie" };
  const mediaKey = getMediaKey(media);
  const progress = getLatestProgressForMedia(media);
  return historyCache.some((entry) => getMediaKey(entry.movie) === mediaKey) || (progress?.progressPercent || 0) >= 85;
}

function getMovieCollectionStatusLabel(movie) {
  const progress = getLatestProgressForMedia(movie);
  if (isMovieMarkedAsWatched(movie)) return "Visto";
  if ((progress?.progressPercent || 0) > 0) return `${progress.progressPercent}% visto`;
  if (isInWatchlist(movie)) return "Na watchlist";
  if (isFavorite(movie)) return "Favorito";
  return "";
}

function decorateRealCollectionSections(sections) {
  return (sections || []).map((section) => {
    const watchedCount = (section.movies || []).filter((movie) => isMovieMarkedAsWatched(movie.id)).length;
    const total = Math.max(1, section.movies?.length || 0);
    return {
      ...section,
      subtitle: `${watchedCount}/${total} vistos • ${Math.round((watchedCount / total) * 100)}% de progresso`,
      context: section.context || "",
      stats: [...(Array.isArray(section.stats) ? section.stats : []), { label: "Vistos", value: `${watchedCount}/${total}` }],
      movies: (section.movies || []).map((movie) => {
        const status = getMovieCollectionStatusLabel(movie);
        return {
          ...movie,
          social_context: [movie.social_context, status].filter(Boolean).join(" • ")
        };
      })
    };
  });
}

const BADGE_DEFINITIONS = [
  {
    id: "first-favorite",
    icon: "❤",
    title: "Primeiro favorito",
    description: "Marca o teu primeiro filme como favorito.",
    target: 1,
    metric: "favorites"
  },
  {
    id: "collector-10",
    icon: "★",
    title: "Colecionador",
    description: "Guarda 10 filmes nos favoritos.",
    target: 10,
    metric: "favorites"
  },
  {
    id: "watchlist-5",
    icon: "⏳",
    title: "Fila pronta",
    description: "Adiciona 5 filmes à tua watchlist.",
    target: 5,
    metric: "watchlist"
  },
  {
    id: "critic-3",
    icon: "✍",
    title: "Crítico da casa",
    description: "Guarda 3 reviews pessoais.",
    target: 3,
    metric: "reviews"
  },
  {
    id: "marathon-5",
    icon: "▶",
    title: "Maratona iniciada",
    description: "Inicia 5 filmes no player.",
    target: 5,
    metric: "history"
  },
  {
    id: "progress-3",
    icon: "↺",
    title: "Volto já",
    description: "Guarda progresso em 3 filmes.",
    target: 3,
    metric: "progress"
  },
  {
    id: "list-maker",
    icon: "☰",
    title: "Curador",
    description: "Cria a tua primeira lista personalizada.",
    target: 1,
    metric: "lists"
  },
  {
    id: "list-share",
    icon: "⤴",
    title: "Lista em circulação",
    description: "Partilha a tua primeira lista personalizada.",
    target: 1,
    metric: "listShares"
  },
  {
    id: "social-circle",
    icon: "☺",
    title: "Círculo aberto",
    description: "Adiciona o teu primeiro amigo.",
    target: 1,
    metric: "friends"
  },
  {
    id: "polyglot",
    icon: "🌍",
    title: "Gosto sem fronteiras",
    description: "Guarda favoritos em 3 idiomas originais.",
    target: 3,
    metric: "languages"
  }
];

function buildBadgeMetrics() {
  const favoriteLanguages = new Set(
    favsCache
      .map((movie) => String(movie.original_language || "").toUpperCase())
      .filter(Boolean)
  );

  return {
    favorites: favsCache.length,
    watchlist: watchlistCache.length,
    reviews: personalReviewsCache.length,
    history: historyCache.length,
    progress: playerProgressCache.length,
    lists: customListsCache.length,
    listShares: badgeStats.listShareCount,
    friends: followedProfilesCache.length,
    languages: favoriteLanguages.size
  };
}

function getBadgeProgress() {
  const metrics = buildBadgeMetrics();
  const unlockedIds = new Set(badgeStats.unlockedBadgeIds);
  const newlyUnlockedIds = [];
  const badges = BADGE_DEFINITIONS.map((definition) => {
    const current = Math.max(0, Number(metrics[definition.metric]) || 0);
    const reachedTarget = current >= definition.target;
    const earned = unlockedIds.has(definition.id) || reachedTarget;
    if (reachedTarget && !unlockedIds.has(definition.id)) {
      newlyUnlockedIds.push(definition.id);
      unlockedIds.add(definition.id);
    }

    return {
      ...definition,
      current,
      earned,
      progressValue: Math.min(current, definition.target),
      progressPercent: current ? Math.max(6, Math.round((Math.min(current, definition.target) / definition.target) * 100)) : 0,
      remaining: Math.max(0, definition.target - current)
    };
  });

  return {
    badges,
    newlyUnlockedIds,
    earnedCount: badges.filter((badge) => badge.earned).length,
    nextBadge: badges.find((badge) => !badge.earned) || null
  };
}

function syncBadgeUnlocks() {
  const summary = getBadgeProgress();
  if (!summary.newlyUnlockedIds.length) {
    return summary;
  }

  badgeStats = sanitizeBadgeStats({
    ...badgeStats,
    unlockedBadgeIds: [...badgeStats.unlockedBadgeIds, ...summary.newlyUnlockedIds]
  });
  saveLibraryState();

  return getBadgeProgress();
}

function refreshBadgeExperience(options = {}) {
  const summary = syncBadgeUnlocks();
  if (options.refreshRoute && getCurrentPath() === "/perfil") {
    handleRoute();
  }
  if (options.refreshNotifications || summary.newlyUnlockedIds.length) {
    void refreshNotifications({ force: true });
  }
  return summary;
}

async function fetchFavoriteRecommendations() {
  const favoriteIds = favsCache.slice(0, 5).map((movie) => movie.id).sort((left, right) => left - right);
  const cacheKey = `${getLanguage()}::${favoriteIds.join(",")}`;
  if (!favoriteIds.length) return [];
  if (favoriteRecommendationsCache.key === cacheKey) {
    return favoriteRecommendationsCache.results;
  }

  const lang = encodeURIComponent(getLanguage());
  const data = await fetchJson(`/api/recommendations/favorites?language=${lang}&movie_ids=${favoriteIds.join(",")}`);
  favoriteRecommendationsCache = {
    key: cacheKey,
    results: data.results || []
  };
  return favoriteRecommendationsCache.results;
}

async function ensureCalendarData() {
  const cacheKey = getLanguage();
  if (calendarCache.key === cacheKey && calendarCache.sections.length) {
    return calendarCache.sections;
  }

  const data = await fetchJson(`/api/calendar/upcoming?language=${encodeURIComponent(getLanguage())}`);
  calendarCache = {
    key: cacheKey,
    sections: data.sections || []
  };
  return calendarCache.sections;
}

async function ensureSmartCollections() {
  const cacheKey = getLanguage();
  if (smartCollectionsCache.key === cacheKey && smartCollectionsCache.sections.length) {
    return smartCollectionsCache.sections;
  }

  const data = await fetchJson(`/api/collections?language=${encodeURIComponent(getLanguage())}`);
  smartCollectionsCache = {
    key: cacheKey,
    sections: data.sections || []
  };
  return smartCollectionsCache.sections;
}

async function ensureRealCollections() {
  const cacheKey = getLanguage();
  if (realCollectionsCache.key === cacheKey && realCollectionsCache.sections.length) {
    return realCollectionsCache.sections;
  }

  const data = await fetchJson(`/api/collections/real?language=${encodeURIComponent(getLanguage())}`);
  realCollectionsCache = {
    key: cacheKey,
    sections: data.sections || []
  };
  return realCollectionsCache.sections;
}

async function fetchFavoriteUpcomingAlerts() {
  const favoriteIds = favsCache.slice(0, 5).map((movie) => movie.id).sort((left, right) => left - right);
  const cacheKey = `${getLanguage()}::${favoriteIds.join(",")}`;
  if (!favoriteIds.length) return [];
  if (upcomingReleaseAlertsCache.key === cacheKey) {
    return upcomingReleaseAlertsCache.results;
  }

  const data = await fetchJson(`/api/recommendations/favorites/upcoming?language=${encodeURIComponent(getLanguage())}&movie_ids=${favoriteIds.join(",")}`);
  upcomingReleaseAlertsCache = {
    key: cacheKey,
    results: data.results || []
  };
  return upcomingReleaseAlertsCache.results;
}

function buildNotificationId(prefix, movieId) {
  return `${prefix}:${movieId}`;
}

function dismissNotification(notificationId) {
  dismissedNotificationsCache = sanitizeStringList([notificationId, ...dismissedNotificationsCache], 400);
  saveLibraryState();
  updateNotificationsUI();
}

function requestBrowserNotifications() {
  if (!("Notification" in window)) {
    return Promise.reject(new Error("Este browser nao suporta notificações."));
  }
  return Notification.requestPermission();
}

function sendBrowserNotifications(notifications) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const newIds = [];
  notifications.forEach((notification) => {
    if (dismissedNotificationsCache.includes(notification.id) || announcedNotificationsCache.includes(notification.id)) {
      return;
    }
    new Notification(notification.title, { body: notification.body });
    newIds.push(notification.id);
  });

  if (newIds.length) {
    announcedNotificationsCache = sanitizeStringList([...announcedNotificationsCache, ...newIds], 400);
    saveLibraryState();
  }
}

function formatDaysUntil(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Em breve";
  const diffDays = Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  return `Em ${diffDays} dias`;
}

function buildReleaseNotifications(calendarSections, upcomingFavoriteMovies) {
  const notifications = [];
  const upcomingMovies = calendarSections.flatMap((section) => section.movies || []);
  const watchlistIds = new Set(watchlistCache.map((movie) => movie.id));

  upcomingMovies.forEach((movie) => {
    if (!watchlistIds.has(movie.id)) return;
    notifications.push({
      id: buildNotificationId("watchlist-release", movie.id),
      type: "watchlist",
      title: `${movie.title} está a chegar`,
      body: `${formatDaysUntil(movie.release_date)} — está na tua watchlist.`,
      movie
    });
  });

  upcomingFavoriteMovies.slice(0, 6).forEach((movie) => {
    notifications.push({
      id: buildNotificationId("favorite-release", movie.id),
      type: "favorite-release",
      title: `Novo lançamento para o teu gosto: ${movie.title}`,
      body: `${formatDaysUntil(movie.release_date)} — parece encaixar nos teus favoritos.`,
      movie
    });
  });

  followedProfilesCache.slice(0, 4).forEach((profile) => {
    if (!profile.lists.length) return;
    notifications.push({
      id: buildNotificationId("friend-share", profile.shareCode),
      type: "friend-share",
      title: `${profile.displayName} tem listas para explorar`,
      body: `Abre Amigos para veres os favoritos e listas partilhadas.`,
      profile
    });
  });

  return notifications
    .filter((notification, index, list) => list.findIndex((entry) => entry.id === notification.id) === index)
    .sort((left, right) => {
      const leftDate = new Date(left.movie?.release_date || left.profile?.exportedAt || 0).getTime();
      const rightDate = new Date(right.movie?.release_date || right.profile?.exportedAt || 0).getTime();
      return rightDate - leftDate;
    });
}

function buildBadgeNotifications(badges) {
  return badges
    .filter((badge) => badge.earned)
    .map((badge) => ({
      id: `badge-unlocked:${badge.id}`,
      type: "badge",
      title: `Conquista desbloqueada: ${badge.title}`,
      body: badge.description,
      badge
    }));
}

async function refreshNotifications(options = {}) {
  if (notificationRefreshPromise && !options.force) {
    return notificationRefreshPromise;
  }

  notificationRefreshPromise = (async () => {
    try {
      const [calendarSections, favoriteUpcoming] = await Promise.all([
        ensureCalendarData().catch(() => []),
        favsCache.length ? fetchFavoriteUpcomingAlerts().catch(() => []) : Promise.resolve([])
      ]);
      const badgeSummary = syncBadgeUnlocks();
      latestNotifications = [
        ...buildBadgeNotifications(badgeSummary.badges),
        ...buildReleaseNotifications(calendarSections, favoriteUpcoming)
      ];
      updateNotificationsUI();
      sendBrowserNotifications(latestNotifications);
      return latestNotifications;
    } finally {
      notificationRefreshPromise = null;
    }
  })();

  return notificationRefreshPromise;
}

function renderNotificationsPanel() {
  if (!notificationsPanel) return;

  const visibleNotifications = latestNotifications.filter((entry) => !dismissedNotificationsCache.includes(entry.id));
  const canRequestBrowser = "Notification" in window && Notification.permission !== "granted";

  notificationsPanel.innerHTML = `
    <div class="notifications-panel-head">
      <div>
        <h3>Notificações</h3>
        <p>${visibleNotifications.length ? `${visibleNotifications.length} alerta${visibleNotifications.length === 1 ? "" : "s"} por ver` : "Tudo em dia"}</p>
      </div>
      ${canRequestBrowser ? '<button id="enableNotificationsBtn" class="secondary-btn" type="button">Ativar browser</button>' : ""}
    </div>
    <div class="notifications-list">
      ${visibleNotifications.length ? visibleNotifications.map((notification) => `
        <article class="notification-item">
          <div class="notification-copy">
            <strong>${escapeHtml(notification.title)}</strong>
            <p>${escapeHtml(notification.body)}</p>
          </div>
          <div class="notification-actions">
            ${notification.badge ? '<button class="secondary-btn" type="button" data-open-notification-badges="1">Ver</button>' : notification.movie ? `<button class="secondary-btn" type="button" data-open-notification-movie="${notification.movie.id}">Abrir</button>` : notification.profile ? `<button class="secondary-btn" type="button" data-open-notification-profile="${escapeHtml(notification.profile.shareCode)}">Ver</button>` : ""}
            <button class="secondary-btn" type="button" data-dismiss-notification="${notification.id}">Dispensar</button>
          </div>
        </article>
      `).join("") : '<div class="empty-state notifications-empty">Ainda sem alertas novos.</div>'}
    </div>
  `;

  notificationsPanel.querySelector("#enableNotificationsBtn")?.addEventListener("click", async () => {
    try {
      await requestBrowserNotifications();
      updateNotificationsUI();
      sendBrowserNotifications(latestNotifications);
    } catch {}
  });

  notificationsPanel.querySelectorAll("[data-open-notification-movie]").forEach((button) => {
    button.addEventListener("click", () => {
      const movieId = button.dataset.openNotificationMovie;
      if (movieId) {
        notificationsPanel.classList.add("hidden");
        openDetails(movieId);
      }
    });
  });

  notificationsPanel.querySelectorAll("[data-open-notification-profile]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateTo("/perfil");
      notificationsPanel.classList.add("hidden");
    });
  });

  notificationsPanel.querySelectorAll("[data-open-notification-badges]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateTo("/perfil");
      notificationsPanel.classList.add("hidden");
    });
  });

  notificationsPanel.querySelectorAll("[data-dismiss-notification]").forEach((button) => {
    button.addEventListener("click", () => dismissNotification(button.dataset.dismissNotification));
  });
}

function updateNotificationsUI() {
  if (!notificationsBtn || !notificationsBadge) return;

  const unreadCount = latestNotifications.filter((entry) => !dismissedNotificationsCache.includes(entry.id)).length;
  notificationsBadge.textContent = String(unreadCount);
  notificationsBadge.classList.toggle("hidden", unreadCount === 0);
  renderNotificationsPanel();
}

function hideSearchSuggestions() {
  searchSuggestions.classList.add("hidden");
  searchSuggestions.innerHTML = "";
  activeSearchSuggestions = [];
}

function renderSearchSuggestions(results) {
  activeSearchSuggestions = results.slice(0, 6);
  if (!activeSearchSuggestions.length) {
    hideSearchSuggestions();
    return;
  }

  searchSuggestions.innerHTML = activeSearchSuggestions.map((movie) => `
    <button class="search-suggestion-item" type="button" data-id="${movie.id}" data-media-type="${getMediaType(movie)}">
      <img src="${movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : PLACEHOLDER_POSTER}" alt="${escapeHtml(movie.title)}">
      <span>
        <strong>${escapeHtml(movie.title)}</strong>
        <small>${escapeHtml([getMediaType(movie) === "tv" ? "Série" : "Filme", movie.release_date ? movie.release_date.slice(0, 4) : "Sem data"].join(" • "))}</small>
      </span>
    </button>
  `).join("");
  searchSuggestions.classList.remove("hidden");

  searchSuggestions.querySelectorAll(".search-suggestion-item").forEach((button) => {
    button.addEventListener("click", () => {
      const movieId = Number.parseInt(button.dataset.id, 10);
      const mediaType = button.dataset.mediaType === "tv" ? "tv" : "movie";
      hideSearchSuggestions();
      if (Number.isFinite(movieId)) openDetails({ id: movieId, media_type: mediaType });
    });
  });
}

async function updateSearchSuggestions() {
  const query = searchInput.value.trim();
  if (query.length < 2) {
    hideSearchSuggestions();
    return;
  }

  try {
    const lang = encodeURIComponent(getLanguage());
    const data = await fetchJson(`/api/search?q=${encodeURIComponent(query)}&language=${lang}`);
    renderSearchSuggestions(data.results || []);
  } catch {
    hideSearchSuggestions();
  }
}

// ─── Language ────────────────────────────────────────────────
const savedLang = localStorage.getItem("tmdb_language") || "pt-PT";
languageInput.value = savedLang;
syncSelectToInput(savedLang);

function syncSelectToInput(lang) {
  const opt = languageSelect.querySelector(`option[value="${lang}"]`);
  languageSelect.value = opt ? lang : "";
}

function getLanguage() {
  return languageInput.value.trim() || "pt-PT";
}

// ─── Router ──────────────────────────────────────────────────
const ROUTES = {
  "/": viewHome,
  "/filmes": viewFilmes,
  "/series": viewSeries,
  "/desporto": viewDesporto,
  "/mood": viewMood,
  "/favoritos": viewFavoritos,
  "/watchlist": viewWatchlist,
  "/historico": viewHistorico,
  "/listas": viewListas,
  "/estreias": viewEstreias,
  "/colecoes": viewColecoes,
  "/inicio-editor": viewHomeEditor,
  "/perfil": viewPerfil,
  "/genero": viewGenero,
  "/resumo-anual": viewResumoAnual,
  "/perfis": viewPerfis,
  "/pesquisa": viewPesquisa,
};

function navigateTo(path) { location.hash = "#" + path; }

function getCurrentPath() {
  const h = location.hash;
  if (!h || h === "#" || h === "#/") return "/";
  return h.slice(1).split("?")[0];
}

function getCurrentQuery() {
  const h = location.hash || "";
  const queryIndex = h.indexOf("?");
  return new URLSearchParams(queryIndex >= 0 ? h.slice(queryIndex + 1) : "");
}

function getDetailRouteMatch(path = getCurrentPath()) {
  const match = path.match(/^\/(filme|serie)\/(\d+)$/);
  if (!match) return null;
  return {
    mediaType: match[1] === "serie" ? "tv" : "movie",
    id: Number(match[2]) || 0
  };
}

function buildDetailPath(mediaRef) {
  const media = normalizeMovie(typeof mediaRef === "object" ? mediaRef : { id: mediaRef, media_type: "movie" });
  if (!media?.id) return "/";
  const mediaType = getMediaType(media);
  const basePath = mediaType === "tv" ? `/serie/${media.id}` : `/filme/${media.id}`;

  if (mediaType !== "tv") return basePath;

  const latestProgress = getLatestProgressForMedia(media);
  const season = Math.max(1, Number(media.selectedSeason || media.selected_season || latestProgress?.season || 1) || 1);
  const episode = Math.max(1, Number(media.selectedEpisode || latestProgress?.episode || 1) || 1);
  const params = new URLSearchParams({
    season: String(season),
    episode: String(episode)
  });
  return `${basePath}?${params.toString()}`;
}

function detachDetailRouteShell() {
  detailModal.classList.add("hidden");
  detailModal.classList.remove("detail-route-shell");
  detailModal.setAttribute("aria-hidden", "true");
  detailCloseBtn.textContent = "×";
  detailCloseFooterBtn.textContent = "Fechar";
  if (detailModal.parentElement !== detailModalHomeParent) {
    detailModalHomeParent.appendChild(detailModal);
  }
}

function handleRoute() {
  const path = getCurrentPath();
  const detailMatch = getDetailRouteMatch(path);
  const isHome = path === "/";
  const activeRoute = detailMatch ? (detailMatch.mediaType === "tv" ? "/series" : "/filmes") : path;
  heroEl.classList.toggle("hidden", !isHome);
  appContent.classList.toggle("content--flat", !isHome);
  appContent.classList.remove("page-enter");
  void appContent.offsetWidth;
  appContent.classList.add("page-enter");
  showPlatformHubs(isHome);
  const navMoreWrap = document.querySelector(".nav-more-wrap");
  const navMoreBtn = document.querySelector(".nav-more-btn");
  if (navMoreBtn && navMoreWrap) {
    if (!navMoreBtn._hasListener) {
      navMoreBtn._hasListener = true;
      navMoreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navMoreWrap.classList.toggle("is-open");
        navMoreBtn.setAttribute("aria-expanded", navMoreWrap.classList.contains("is-open"));
      });
      document.addEventListener("click", () => navMoreWrap.classList.remove("is-open"));
      navMoreWrap.querySelector(".nav-more-dropdown")?.addEventListener("click", () => navMoreWrap.classList.remove("is-open"));
    }
  }
  document.querySelectorAll(".nav-link[data-route]").forEach((l) =>
    l.classList.toggle("active", l.dataset.route === activeRoute)
  );
  document.querySelectorAll(".mobile-bottom-link[data-route]").forEach((l) =>
    l.classList.toggle("active", l.dataset.route === activeRoute)
  );
  document.querySelectorAll(".nav-more-item[data-route]").forEach((l) =>
    l.classList.toggle("nav-more-item--active", l.dataset.route === activeRoute)
  );
  notificationsPanel?.classList.add("hidden");
  notificationsPanel?.setAttribute("aria-hidden", "true");
  searchOverlay?.classList.add("hidden");
  searchOverlay?.setAttribute("aria-hidden", "true");
  if (detailMatch) {
    viewDetailPage(detailMatch, getCurrentQuery());
    void refreshNotifications();
    return;
  }
  detachDetailRouteShell();
  const personMatch = path.match(/^\/pessoa\/(\d+)$/);
  const generoMatch = path.match(/^\/genero\/(\d+)(?:\/(\w+))?$/);
  if (personMatch) {
    viewPessoa(personMatch[1]);
  } else if (generoMatch) {
    viewGenero(generoMatch[1], generoMatch[2] || "movie");
  } else {
    (ROUTES[path] || viewHome)();
  }
  void refreshNotifications();
}

// ─── Catalog cache ───────────────────────────────────────────
async function ensureCatalog() {
  if (catalogCache) return catalogCache;
  const lang = encodeURIComponent(getLanguage());
  catalogCache = await fetchJson(`/api/homepage?language=${lang}`);
  if (catalogCache.featured) { featuredMovie = catalogCache.featured; renderHero(featuredMovie); }
  if (catalogCache.featuredList?.length) { startHeroRotation(catalogCache.featuredList); }
  return catalogCache;
}

// ─── Views ───────────────────────────────────────────────────
async function viewHome() {
  appContent.innerHTML = renderSpinner();
  try {
    const data = await ensureCatalog();
    appContent.innerHTML = "";
    const continueWatchingMovies = getContinueWatchingMovies();
    const nextUpMovies = buildNextUpQueue();
    const personalizedCollections = await ensureProfileCollectionsData().catch(() => []);
    const catalogSections = new Map(data.sections.map((section) => [section.id, section]));
    const visibleSections = getVisibleHomeSectionOrder();
    const dynamicSections = new Map();
    if (continueWatchingMovies.length) {
      dynamicSections.set("continue-watching", {
        id: "continue-watching",
        title: "Continuar a ver",
        movies: continueWatchingMovies
      });
    }
    {
      const recommendedForYou = favsCache.length
        ? await fetchFavoriteRecommendations().catch(() => [])
        : [];
      if (recommendedForYou.length) {
        dynamicSections.set("for-you", {
          id: "for-you",
          title: "Escolhidos para ti",
          movies: recommendedForYou
        });
      } else {
        const editorialPicks = [
          ...(catalogSections.get("top-rated")?.movies || []),
          ...(catalogSections.get("popular")?.movies || [])
        ].slice(0, 12);
        if (editorialPicks.length) {
          dynamicSections.set("for-you", {
            id: "for-you",
            title: "Destaques MimiFlix",
            subtitle: "Uma seleção editorial para entrares logo no catálogo sem passos extra.",
            movies: editorialPicks
          });
        }
      }
    }
    if (nextUpMovies.length) {
      dynamicSections.set("next-up", {
        id: "next-up",
        title: "Próximo a ver",
        movies: nextUpMovies
      });
    }
    if (personalizedCollections.length) {
      dynamicSections.set("profile-collections", {
        id: "profile-collections",
        title: personalizedCollections[0].title || "Coleções do teu perfil",
        movies: personalizedCollections[0].movies || []
      });
    }
    const sectionsToRender = visibleSections
      .map((id) => dynamicSections.get(id) || catalogSections.get(id))
      .filter((section) => section?.movies?.length);
    renderCatalogRows(sectionsToRender, appContent);
  } catch (err) { appContent.innerHTML = errorState(err.message); }
}

async function viewFilmes() {
  appContent.innerHTML = renderSpinner();
  try {
    appContent.innerHTML = "";
    appContent.appendChild(pageHeader("Filmes"));
    const filtersWrap = document.createElement("section");
    filtersWrap.className = "filters-panel";
    filtersWrap.innerHTML = `
      <div class="filters-grid">
        <label class="filter-field"><span>Género</span><select id="filterGenre">${DISCOVER_GENRES.map((genre) => `<option value="${genre.id}">${escapeHtml(genre.name)}</option>`).join("")}</select></label>
        <label class="filter-field"><span>Ano mínimo</span><input id="filterYearMin" type="number" min="1950" max="2035" placeholder="2000"></label>
        <label class="filter-field"><span>Ano máximo</span><input id="filterYearMax" type="number" min="1950" max="2035" placeholder="2026"></label>
        <label class="filter-field"><span>Nota mínima</span><input id="filterRatingMin" type="number" min="0" max="10" step="0.1" placeholder="6.5"></label>
        <label class="filter-field"><span>Idioma</span><select id="filterOriginalLanguage"><option value="">Todos</option><option value="en">EN</option><option value="pt">PT</option><option value="es">ES</option><option value="fr">FR</option><option value="ja">JA</option><option value="ko">KO</option></select></label>
        <label class="filter-field"><span>Duração máxima</span><select id="filterRuntimeMax"><option value="">Qualquer</option><option value="95">Até 95 min</option><option value="120">Até 120 min</option><option value="150">Até 150 min</option><option value="200">Até 200 min</option></select></label>
        <label class="filter-field"><span>Plataforma</span><select id="filterProvider"><option value="">Todas</option>${STREAMING_PROVIDERS.map((provider) => `<option value="${provider.id}">${escapeHtml(provider.name)}</option>`).join("")}</select></label>
      </div>
      <div class="filters-actions">
        <button class="secondary-btn" type="button" id="openMoodPicker">Mood picker</button>
        <button class="secondary-btn" type="button" id="clearFilmFilters">Limpar</button>
      </div>
    `;
    appContent.appendChild(filtersWrap);

    const resultsEl = document.createElement("div");
    appContent.appendChild(resultsEl);
    const paginationState = {
      page: 1,
      totalPages: 1,
      totalResults: 0
    };

    function getFilmFilterValues() {
      return {
        genre: filtersWrap.querySelector("#filterGenre").value,
        yearMin: filtersWrap.querySelector("#filterYearMin").value,
        yearMax: filtersWrap.querySelector("#filterYearMax").value,
        ratingMin: filtersWrap.querySelector("#filterRatingMin").value,
        originalLanguage: filtersWrap.querySelector("#filterOriginalLanguage").value,
        runtimeMax: filtersWrap.querySelector("#filterRuntimeMax").value,
        provider: filtersWrap.querySelector("#filterProvider").value
      };
    }

    function buildFilmDiscoverParams(page = 1) {
      const filters = getFilmFilterValues();
      const params = new URLSearchParams({
        language: getLanguage(),
        voteCountMin: "80",
        page: String(page)
      });

      if (filters.genre) params.set("genre", filters.genre);
      if (filters.yearMin) params.set("yearMin", `${filters.yearMin}-01-01`);
      if (filters.yearMax) params.set("yearMax", `${filters.yearMax}-12-31`);
      if (filters.ratingMin) params.set("ratingMin", filters.ratingMin);
      if (filters.originalLanguage) params.set("originalLanguage", filters.originalLanguage);
      if (filters.runtimeMax) params.set("runtimeMax", filters.runtimeMax);
      if (filters.provider) params.set("provider", filters.provider);

      return params;
    }

    function renderFilmsPagination() {
      if (paginationState.totalPages <= 1) return "";

      return `
        <div class="films-pagination">
          <button class="secondary-btn" type="button" data-films-page="prev" ${paginationState.page <= 1 ? "disabled" : ""}>Anterior</button>
          <div class="films-pagination-status">Página ${paginationState.page} de ${paginationState.totalPages}</div>
          <button class="secondary-btn" type="button" data-films-page="next" ${paginationState.page >= paginationState.totalPages ? "disabled" : ""}>Seguinte</button>
        </div>
      `;
    }

    async function renderFilteredMovies(page = 1) {
      if (page === 1) resultsEl.innerHTML = renderSpinner();

      try {
        const response = await fetchJson(`/api/discover?${buildFilmDiscoverParams(page).toString()}`);
        paginationState.page = Math.max(1, Number(response.page) || page);
        paginationState.totalPages = Math.max(1, Number(response.total_pages) || 1);
        paginationState.totalResults = Math.max(0, Number(response.total_results) || 0);

        if (page === 1) resultsEl.innerHTML = "";
        if (!response.results?.length && page === 1) {
          resultsEl.innerHTML = `<div class="empty-state">Nenhum filme encontrado com estes filtros.</div>`;
          return;
        }

        if (page === 1) {
          resultsEl.innerHTML = "";
          const summary = document.createElement("div");
          summary.className = "films-results-head";
          summary.innerHTML = `<div class="films-results-count">${paginationState.totalResults.toLocaleString("pt-PT")} resultados</div>`;
          resultsEl.appendChild(summary);
          const grid = document.createElement("div");
          grid.className = "genre-grid catalog-section";
          grid.id = "filmsGrid";
          resultsEl.appendChild(grid);
        }
        const grid = document.getElementById("filmsGrid") || resultsEl.querySelector(".genre-grid");
        renderMovieCards(grid, response.results);
        initSectionAnimations();

        // Infinite scroll sentinel
        const oldSentinel = resultsEl.querySelector(".infinite-sentinel");
        if (oldSentinel) oldSentinel.remove();
        if (paginationState.page < paginationState.totalPages) {
          const sentinel = document.createElement("div");
          sentinel.className = "infinite-sentinel";
          sentinel.innerHTML = `<div class="infinite-loading"><span class="infinite-spinner"></span></div>`;
          resultsEl.appendChild(sentinel);
          const obs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              obs.disconnect();
              renderFilteredMovies(paginationState.page + 1);
            }
          }, { rootMargin: "200px" });
          obs.observe(sentinel);
        }
      } catch (err) {
        resultsEl.innerHTML = errorState(err.message);
      }
    }

    filtersWrap.querySelectorAll("select, input").forEach((field) => {
      field.addEventListener("input", () => renderFilteredMovies(1));
      field.addEventListener("change", () => renderFilteredMovies(1));
    });

    filtersWrap.querySelector("#clearFilmFilters").addEventListener("click", () => {
      filtersWrap.querySelectorAll("select").forEach((field) => { field.value = ""; });
      filtersWrap.querySelector("#filterGenre").value = "";
      filtersWrap.querySelectorAll('input[type="number"]').forEach((field) => { field.value = ""; });
      renderFilteredMovies(1);
    });
    filtersWrap.querySelector("#openMoodPicker").addEventListener("click", () => navigateTo("/mood"));

    await renderFilteredMovies(1);
  } catch (err) { appContent.innerHTML = errorState(err.message); }
}

async function viewSeries() {
  appContent.innerHTML = renderSpinner();
  try {
    appContent.innerHTML = "";
    appContent.appendChild(pageHeader("Séries"));
    const filtersWrap = document.createElement("section");
    filtersWrap.className = "filters-panel";
    filtersWrap.innerHTML = `
      <div class="filters-grid">
        <label class="filter-field"><span>Género</span><select id="filterSeriesGenre">${DISCOVER_TV_GENRES.map((genre) => `<option value="${genre.id}">${escapeHtml(genre.name)}</option>`).join("")}</select></label>
        <label class="filter-field"><span>Ano mínimo</span><input id="filterSeriesYearMin" type="number" min="1950" max="2035" placeholder="2010"></label>
        <label class="filter-field"><span>Ano máximo</span><input id="filterSeriesYearMax" type="number" min="1950" max="2035" placeholder="2026"></label>
        <label class="filter-field"><span>Nota mínima</span><input id="filterSeriesRatingMin" type="number" min="0" max="10" step="0.1" placeholder="7.0"></label>
        <label class="filter-field"><span>Idioma</span><select id="filterSeriesLanguage"><option value="">Todos</option><option value="en">EN</option><option value="pt">PT</option><option value="es">ES</option><option value="fr">FR</option><option value="ja">JA</option><option value="ko">KO</option></select></label>
        <label class="filter-field"><span>Estado</span><select id="filterSeriesSort"><option value="popularity.desc">Mais populares</option><option value="vote_average.desc">Melhor classificadas</option><option value="first_air_date.desc">Mais recentes</option></select></label>
        <label class="filter-field"><span>Plataforma</span><select id="filterSeriesProvider"><option value="">Todas</option>${STREAMING_PROVIDERS.map((provider) => `<option value="${provider.id}">${escapeHtml(provider.name)}</option>`).join("")}</select></label>
      </div>
      <div class="filters-actions">
        <button class="secondary-btn" type="button" id="clearSeriesFilters">Limpar</button>
      </div>
    `;
    appContent.appendChild(filtersWrap);

    const resultsEl = document.createElement("div");
    appContent.appendChild(resultsEl);
    const paginationState = { page: 1, totalPages: 1, totalResults: 0 };

    function buildSeriesDiscoverParams(page = 1) {
      const params = new URLSearchParams({
        language: getLanguage(),
        mediaType: "tv",
        voteCountMin: "60",
        page: String(page),
        sort_by: filtersWrap.querySelector("#filterSeriesSort").value
      });

      const genre = filtersWrap.querySelector("#filterSeriesGenre").value;
      const yearMin = filtersWrap.querySelector("#filterSeriesYearMin").value;
      const yearMax = filtersWrap.querySelector("#filterSeriesYearMax").value;
      const ratingMin = filtersWrap.querySelector("#filterSeriesRatingMin").value;
      const originalLanguage = filtersWrap.querySelector("#filterSeriesLanguage").value;
      const provider = filtersWrap.querySelector("#filterSeriesProvider").value;

      if (genre) params.set("genre", genre);
      if (yearMin) params.set("yearMin", `${yearMin}-01-01`);
      if (yearMax) params.set("yearMax", `${yearMax}-12-31`);
      if (ratingMin) params.set("ratingMin", ratingMin);
      if (originalLanguage) params.set("originalLanguage", originalLanguage);
      if (provider) params.set("provider", provider);

      return params;
    }

    function renderSeriesPagination() {
      if (paginationState.totalPages <= 1) return "";

      return `
        <div class="films-pagination">
          <button class="secondary-btn" type="button" data-series-page="prev" ${paginationState.page <= 1 ? "disabled" : ""}>Anterior</button>
          <div class="films-pagination-status">Página ${paginationState.page} de ${paginationState.totalPages}</div>
          <button class="secondary-btn" type="button" data-series-page="next" ${paginationState.page >= paginationState.totalPages ? "disabled" : ""}>Seguinte</button>
        </div>
      `;
    }

    async function renderFilteredSeries(page = 1) {
      if (page === 1) resultsEl.innerHTML = renderSpinner();

      try {
        const response = await fetchJson(`/api/discover?${buildSeriesDiscoverParams(page).toString()}`);
        paginationState.page = Math.max(1, Number(response.page) || page);
        paginationState.totalPages = Math.max(1, Number(response.total_pages) || 1);
        paginationState.totalResults = Math.max(0, Number(response.total_results) || 0);

        if (page === 1) resultsEl.innerHTML = "";
        if (!response.results?.length) {
          resultsEl.innerHTML = `<div class="empty-state">Nenhuma série encontrada com estes filtros.</div>`;
          return;
        }

        if (page === 1) {
          resultsEl.innerHTML = "";
          const summary = document.createElement("div");
          summary.className = "films-results-head";
          summary.innerHTML = `<div class="films-results-count">${paginationState.totalResults.toLocaleString("pt-PT")} resultados</div>`;
          resultsEl.appendChild(summary);
          const grid = document.createElement("div");
          grid.className = "genre-grid catalog-section";
          grid.id = "seriesGrid";
          resultsEl.appendChild(grid);
        }
        const grid = document.getElementById("seriesGrid") || resultsEl.querySelector(".genre-grid");
        renderMovieCards(grid, response.results);
        initSectionAnimations();

        // Infinite scroll sentinel
        const oldSentinel = resultsEl.querySelector(".infinite-sentinel");
        if (oldSentinel) oldSentinel.remove();
        if (paginationState.page < paginationState.totalPages) {
          const sentinel = document.createElement("div");
          sentinel.className = "infinite-sentinel";
          sentinel.innerHTML = `<div class="infinite-loading"><span class="infinite-spinner"></span></div>`;
          resultsEl.appendChild(sentinel);
          const obs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              obs.disconnect();
              renderFilteredSeries(paginationState.page + 1);
            }
          }, { rootMargin: "200px" });
          obs.observe(sentinel);
        }
      } catch (err) {
        resultsEl.innerHTML = errorState(err.message);
      }
    }

    filtersWrap.querySelectorAll("select, input").forEach((field) => {
      field.addEventListener("input", () => renderFilteredSeries(1));
      field.addEventListener("change", () => renderFilteredSeries(1));
    });

    filtersWrap.querySelector("#clearSeriesFilters").addEventListener("click", () => {
      filtersWrap.querySelectorAll("select").forEach((field) => { field.value = ""; });
      filtersWrap.querySelector("#filterSeriesSort").value = "popularity.desc";
      filtersWrap.querySelectorAll('input[type="number"]').forEach((field) => { field.value = ""; });
      renderFilteredSeries(1);
    });

    await renderFilteredSeries(1);
  } catch (err) { appContent.innerHTML = errorState(err.message); }
}

async function viewDesporto() {
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Desporto ao vivo"));

  const controls = document.createElement("section");
  controls.className = "filters-panel live-sports-controls";
  controls.innerHTML = `
    <div class="live-sports-controls-head">
      <div class="live-sports-copy">
        <span class="eyebrow">MimiFlix Live</span>
        <h2 class="profile-panel-title">Streams e embeds em direto</h2>
        <p class="detail-review-subtitle">Integração com SportsBite / VipStreamed e WatchFooty para encontrar eventos ao vivo e abrir streams HLS ou embeds sem sair da app.</p>
      </div>
      <div class="live-sports-toolbar">
        <div class="live-sports-toolbar-copy">
          <span class="chip chip-accent">HLS + embed</span>
          <span class="chip">SportsBite / VipStreamed</span>
          <span class="chip">WatchFooty</span>
        </div>
        <button class="secondary-btn" type="button" id="refreshSportsBtn">Atualizar fontes</button>
      </div>
    </div>
    <div class="filters-grid live-sports-filters">
      <label class="filter-field">
        <span>Desporto</span>
        <select id="sportsFilterSelect">
          <option value="">Todos</option>
        </select>
      </label>
      <label class="filter-field">
        <span>Pesquisar</span>
        <input id="sportsFilterQuery" type="text" placeholder="Arsenal, UFC, F1...">
      </label>
      <label class="filter-field filter-field--toggle">
        <span>Só em direto</span>
        <span class="live-toggle">
          <input id="sportsFilterLive" type="checkbox" checked>
        </span>
      </label>
    </div>
  `;
  appContent.appendChild(controls);

  const summary = document.createElement("div");
  summary.className = "profile-stats-grid live-sports-summary";
  appContent.appendChild(summary);

  const results = document.createElement("div");
  results.className = "live-sports-results";
  appContent.appendChild(results);

  const state = { sport: "", q: "", live: true };

  const applySportOptions = (genres = {}, watchFootySports = []) => {
    const select = controls.querySelector("#sportsFilterSelect");
    const currentValue = select.value || state.sport;
    const labels = [
      ...Object.values(genres || {}),
      ...(Array.isArray(watchFootySports) ? watchFootySports.map((sport) => sport.label || sport.name).filter(Boolean) : [])
    ];
    const options = [...new Set(labels)]
      .sort((left, right) => left.localeCompare(right, "pt"))
      .map((label) => `<option value="${escapeHtml(label)}">${escapeHtml(label)}</option>`)
      .join("");
    select.innerHTML = `<option value="">Todos</option>${options}`;
    select.value = currentValue;
  };

  const renderSummary = (catalog, health, watchfooty, matches) => {
    const data = catalog?.data || {};
    const watchfootyData = watchfooty?.data || {};
    const scraper = health?.scraper || {};
    const liveCount = matches.filter((match) => match.isLive).length;
    const cards = [
      {
        label: "Eventos",
        value: String(matches.length || data.totalMatches || watchfootyData.totalMatches || scraper.totalMatches || 0),
        note: matches.length ? "Eventos carregados nesta vista" : "Sem eventos no refresh atual"
      },
      {
        label: "Ao vivo agora",
        value: String(liveCount),
        note: liveCount ? "Eventos com badge LIVE e pelo menos uma fonte pronta" : "Nenhum evento marcado como LIVE neste momento"
      },
      {
        label: "Fontes prontas",
        value: String(matches.reduce((sum, match) => sum + match.workingStreams.length, 0)),
        note: "Total de streams HLS e embeds prontos a abrir"
      },
      {
        label: "Última atualização",
        value: data.scrapedAt ? formatShortDateTime(data.scrapedAt) : "Sem dados",
        note: data.nextRefreshAt ? `Próximo refresh ${formatShortDateTime(data.nextRefreshAt)}` : "Sem próxima atualização"
      },
      {
        label: "Cobertura",
        value: `${matches.filter((match) => match.sourceProvider === "VipStreamed").length} + ${matches.filter((match) => match.sourceProvider === "WatchFooty").length}`,
        note: "VipStreamed + WatchFooty"
      }
    ];

    summary.innerHTML = cards.map((card) => `
      <article class="profile-stat-card">
        <span class="profile-stat-label">${escapeHtml(card.label)}</span>
        <strong class="profile-stat-value">${escapeHtml(card.value)}</strong>
        <p class="profile-stat-note">${escapeHtml(card.note)}</p>
      </article>
    `).join("");
  };

  const renderMatches = (catalog, matches) => {
    const data = catalog?.data || {};
    if (!matches.length) {
      const nextRefresh = data.nextRefreshAt ? formatShortDateTime(data.nextRefreshAt) : "breve";
      results.innerHTML = `
        <div class="empty-state">
          Ainda não há streams disponíveis para estes filtros. O scraper volta a tentar ${escapeHtml(nextRefresh)}.
        </div>
      `;
      return;
    }

    results.innerHTML = `
      <div class="live-sports-grid">
        ${matches.map((match) => {
          const visibleStreams = match.workingStreams.slice(0, 3);
          const extraStreams = Math.max(0, match.workingStreams.length - visibleStreams.length);
          return `
          <article class="live-match-card${match.isLive ? " is-live" : ""}">
            <div class="live-match-head">
              <div class="live-match-meta">
                <span class="chip">${escapeHtml(match.sport)}</span>
                ${match.isLive ? '<span class="chip chip-accent">LIVE</span>' : '<span class="chip">Agendado</span>'}
                ${match.subtitle ? `<span class="chip">${escapeHtml(match.subtitle)}</span>` : ""}
              </div>
              <div class="live-match-count">
                <strong>${match.workingStreams.length}/${match.streams.length}</strong>
                <span>fontes prontas</span>
              </div>
            </div>
            <div class="live-match-body">
              <h3 class="live-match-title">${escapeHtml(match.title)}</h3>
              <p class="live-match-time">${escapeHtml(formatLiveSportDate(match.startTime))}</p>
              <div class="live-match-details">
                <div class="live-match-detail">
                  <span>Origem</span>
                  <strong>${escapeHtml(match.sourceProvider)}</strong>
                </div>
                <div class="live-match-detail">
                  <span>Estado das fontes</span>
                  <strong>${match.workingStreams.length} prontas / ${match.streams.length} listadas</strong>
                </div>
              </div>
            </div>
            <div class="live-match-actions">
              ${visibleStreams.length
                ? visibleStreams.map((stream, index) => `
                    <button
                      class="accent-btn"
                      type="button"
                      data-live-match-id="${escapeHtml(match.id)}"
                      data-live-stream-index="${index}"
                    >▶ ${escapeHtml(stream.label)}</button>
                  `).join("")
                : '<button class="secondary-btn" type="button" disabled>Sem stream funcional</button>'}
              ${extraStreams ? `<span class="live-match-more">+${extraStreams} fontes extra</span>` : ""}
            </div>
          </article>
        `;
        }).join("")}
      </div>
    `;

    results.querySelectorAll("[data-live-match-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const match = matches.find((entry) => entry.id === button.dataset.liveMatchId);
        if (!match) return;

        // Streamed.pk: fetch streams on demand
        if (match.sourceProvider === "Streamed" && match.sources?.length) {
          button.disabled = true;
          const origText = button.querySelector(".live-match-play-label")?.textContent;
          if (button.querySelector(".live-match-play-label")) {
            button.querySelector(".live-match-play-label").textContent = "A carregar...";
          }
          try {
            const source = match.sources[0];
            const resp = await fetchJson(
              `/api/live-sports/streamed/stream?source=${encodeURIComponent(source.source)}&id=${encodeURIComponent(source.id)}`
            );
            const streamData = Array.isArray(resp?.data) ? resp.data : [];
            if (!streamData.length) throw new Error("Sem streams disponíveis");

            // Use first available stream
            const s = streamData[0];
            const embedUrl = s.embedUrl || s.url || "";
            const hlsUrl = s.hls || s.hlsUrl || s.m3u8 || "";
            const streamObj = {
              label: s.language || s.label || `Stream ${s.streamNo || 1}`,
              embedUrl,
              hlsUrl,
              isWorking: true
            };
            openLiveSportStream(match, streamObj);
          } catch {
            alert("Não foi possível carregar o stream. Tenta novamente.");
          } finally {
            button.disabled = false;
            if (button.querySelector(".live-match-play-label") && origText) {
              button.querySelector(".live-match-play-label").textContent = origText;
            }
          }
          return;
        }

        const stream = match?.workingStreams[Number(button.dataset.liveStreamIndex) || 0];
        if (match && stream) {
          openLiveSportStream(match, stream);
        }
      });
    });
  };

  const renderSports = async (options = {}) => {
    results.innerHTML = renderSpinner();
    try {
      const { catalog, health, watchfooty, streamed } = await fetchLiveSportsCatalog(state, { force: options.force });
      const data = catalog?.data || {};
      applySportOptions(data.genres || {}, watchfooty?.data?.sports || []);
      const vipMatches = (Array.isArray(data.matches) ? data.matches : [])
        .map((match, index) => normalizeLiveSportMatch(match, data.genres || {}, index, {
          id: `vipstreamed:${match?.id || match?.slug || index + 1}`,
          sourceProvider: "VipStreamed"
        }))
        .filter((match) => match.title);
      const watchFootyMatches = (Array.isArray(watchfooty?.data?.matches) ? watchfooty.data.matches : [])
        .map((match, index) => normalizeLiveSportMatch(match, {}, index, {
          id: `watchfooty:${match?.matchId || index + 1}`,
          sourceProvider: "WatchFooty"
        }))
        .filter((match) => match.title);

      // Streamed.pk matches — streams are fetched on demand when clicked
      const streamedMatches = (Array.isArray(streamed?.data?.matches) ? streamed.data.matches : [])
        .map((match, index) => {
          const isLive = Array.isArray(streamed?.data?.liveIds)
            ? streamed.data.liveIds.includes(match.id)
            : true; // assume live if from /api/matches/live
          return {
            id: `streamed:${match.id || index}`,
            title: match.title || `Evento ${index + 1}`,
            subtitle: match.teams?.home?.name && match.teams?.away?.name
              ? `${match.teams.home.name} vs ${match.teams.away.name}`
              : "",
            sport: match.category || "Desporto",
            isLive,
            startTime: match.date ? new Date(match.date).toISOString() : null,
            sourceProvider: "Streamed",
            poster: match.poster ? `https://streamed.pk${match.poster}` : null,
            teams: match.teams || null,
            sources: match.sources || [],  // [{source, id}] — fetched on click
            streams: [],
            workingStreams: [{ label: "Streamed", embedUrl: "__streamed_lazy__", isWorking: true }],
            raw: match
          };
        })
        .filter((match) => match.title && match.sources.length > 0);

      const matches = [...vipMatches, ...watchFootyMatches, ...streamedMatches]
        .sort((left, right) => {
          const leftTime = new Date(left.startTime || 0).getTime();
          const rightTime = new Date(right.startTime || 0).getTime();
          return right.isLive - left.isLive || leftTime - rightTime;
        })
        .filter((match) => match.title);
      renderSummary(catalog, health, watchfooty, matches);
      renderMatches(catalog, matches);
    } catch (error) {
      summary.innerHTML = "";
      results.innerHTML = errorState(error.message);
    }
  };

  controls.querySelector("#sportsFilterSelect").addEventListener("change", (event) => {
    state.sport = event.target.value;
    renderSports({ force: true });
  });
  controls.querySelector("#sportsFilterQuery").addEventListener("input", (event) => {
    state.q = event.target.value.trim();
    renderSports({ force: true });
  });
  controls.querySelector("#sportsFilterLive").addEventListener("change", (event) => {
    state.live = event.target.checked;
    renderSports({ force: true });
  });
  controls.querySelector("#refreshSportsBtn").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = "A atualizar...";
    try {
      await fetchJson("/api/live-sports/refresh", { method: "POST" }).catch(() => null);
      invalidateLiveSportsCache();
      await renderSports({ force: true });
    } catch (error) {
      results.innerHTML = errorState(error.message);
    } finally {
      button.disabled = false;
      button.textContent = "Atualizar fontes";
    }
  });

  await renderSports({ force: true });
}

async function viewMood() {
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Mood picker"));

  const shell = document.createElement("section");
  shell.className = "filters-panel";
  shell.innerHTML = `
    <div class="profile-panel-head">
      <div>
        <h2 class="profile-panel-title">O que te apetece ver?</h2>
        <p class="detail-review-subtitle">Escolhe o mood e a app monta uma fila instantânea.</p>
      </div>
      <button class="secondary-btn" type="button" data-mood-random>Surpreende-me</button>
    </div>
    <div class="mood-grid">
      ${MOOD_PRESETS.map((preset) => `
        <button class="mood-card" type="button" data-mood-id="${preset.id}">
          <strong>${escapeHtml(preset.title)}</strong>
          <span>${escapeHtml(preset.note)}</span>
        </button>
      `).join("")}
    </div>
    <div id="moodResults"></div>
  `;
  appContent.appendChild(shell);

  const resultsEl = shell.querySelector("#moodResults");
  async function renderMoodResults(moodId) {
    resultsEl.innerHTML = renderSpinner();
    const movies = await ensureMoodQueue(moodId).catch(() => []);
    resultsEl.innerHTML = "";
    if (!movies.length) {
      resultsEl.innerHTML = errorState("Nao foi possivel montar uma fila para esse mood.");
      return;
    }
    renderCatalogRows([{
      id: `mood-${moodId}`,
      title: `Mood: ${(MOOD_PRESETS.find((entry) => entry.id === moodId) || MOOD_PRESETS[0]).title}`,
      movies
    }], resultsEl);
  }

  shell.querySelectorAll("[data-mood-id]").forEach((button) => {
    button.addEventListener("click", () => {
      shell.querySelectorAll("[data-mood-id]").forEach((entry) => entry.classList.remove("is-active"));
      button.classList.add("is-active");
      void renderMoodResults(button.dataset.moodId);
    });
  });
  shell.querySelector("[data-mood-random]")?.addEventListener("click", () => {
    const preset = MOOD_PRESETS[Math.floor(Math.random() * MOOD_PRESETS.length)];
    shell.querySelector(`[data-mood-id="${preset.id}"]`)?.click();
  });
  shell.querySelector("[data-mood-id]")?.click();
}

async function viewFavoritos() {
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Favoritos"));

  if (!authReady) {
    appContent.innerHTML += renderSpinner();
    return;
  }

  if (!currentUser) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
  <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  <p>Faz login para veres os teus favoritos.</p>
  <button class="accent-btn" style="margin-top:20px" onclick="openAuthModal('login')">Entrar</button>
`;
    appContent.appendChild(empty);
    return;
  }

  if (!favoritesLoaded) {
    appContent.innerHTML += renderSpinner();
    try {
      await withTimeout(loadFavorites(), 8000, "Os favoritos demoraram demasiado tempo a carregar.");
      appContent.innerHTML = "";
      appContent.appendChild(pageHeader("Favoritos"));
    } catch (err) {
      appContent.innerHTML = "";
      appContent.appendChild(pageHeader("Favoritos"));
      appContent.innerHTML += errorState(getFavoriteLoadErrorMessage(err));
      return;
    }
  }

  if (!favsCache.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
  <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  <p>Ainda não tens filmes favoritos.<br>Explora o catálogo e marca os que gostas.</p>
`;
    appContent.appendChild(empty);
    return;
  }

  // Stats bar
  const statsBar = document.createElement("div");
  statsBar.className = "library-stats-bar";
  const avgRating = favsCache.filter(m => m.vote_average > 0).reduce((sum, m) => sum + m.vote_average, 0) / (favsCache.filter(m => m.vote_average > 0).length || 1);
  statsBar.innerHTML = `
    <div class="library-stat"><span class="library-stat-value">${favsCache.length}</span><span class="library-stat-label">Filmes</span></div>
    <div class="library-stat"><span class="library-stat-value">${avgRating.toFixed(1)}</span><span class="library-stat-label">Nota média</span></div>
    <div class="library-stat"><span class="library-stat-value">${[...new Set(favsCache.flatMap(m => m.genres || []))].length}</span><span class="library-stat-label">Géneros</span></div>
  `;
  appContent.appendChild(statsBar);

  const grid = document.createElement("div");
  grid.className = "genre-grid";
  appContent.appendChild(grid);
  renderMovieCards(grid, favsCache);
}

async function viewWatchlist() {
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Watchlist"));

  if (!watchlistCache.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
  <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M9 10l2 2 4-4"/></svg>
  <p>A tua watchlist está vazia.<br>Adiciona filmes que queres ver mais tarde.</p>
`;
    appContent.appendChild(empty);
    return;
  }

  const statsBar = document.createElement("div");
  statsBar.className = "library-stats-bar";
  statsBar.innerHTML = `<div class="library-stat"><span class="library-stat-value">${watchlistCache.length}</span><span class="library-stat-label">Para ver</span></div>`;
  appContent.appendChild(statsBar);

  const grid = document.createElement("div");
  grid.className = "genre-grid";
  appContent.appendChild(grid);
  renderMovieCards(grid, watchlistCache);
}

async function viewHistorico() {
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Timeline pessoal"));

  const abandonedEntries = playerProgressCache.filter((entry) => {
    const ageInDays = (Date.now() - new Date(entry.updatedAt).getTime()) / 86400000;
    return entry.progressPercent >= 10 && entry.progressPercent < 85 && ageInDays >= 7;
  });
  const statsGrid = document.createElement("section");
  statsGrid.className = "profile-stats-grid";
  [
    { label: "Vistos", value: String(historyCache.length), note: "Sessões iniciadas no player" },
    { label: "Favoritos", value: String(favsCache.length), note: "Filmes guardados como favoritos" },
    { label: "Reviews", value: String(personalReviewsCache.length), note: "Notas e comentários pessoais" },
    { label: "Largados", value: String(abandonedEntries.length), note: "Títulos deixados a meio" }
  ].forEach((stat) => {
    const card = document.createElement("article");
    card.className = "profile-stat-card";
    card.innerHTML = `
      <span class="profile-stat-label">${escapeHtml(stat.label)}</span>
      <strong class="profile-stat-value">${escapeHtml(stat.value)}</strong>
      <p class="profile-stat-note">${escapeHtml(stat.note)}</p>
    `;
    statsGrid.appendChild(card);
  });
  appContent.appendChild(statsGrid);

  const events = [
    ...historyCache.map((entry) => ({
      id: `watched-${entry.movie.id}`,
      type: "Visto",
      timestamp: entry.watchedAt,
      movie: entry.movie,
      summary: "Entrou no teu histórico pessoal.",
      chips: [entry.movie.release_date ? entry.movie.release_date.slice(0, 4) : "", typeof entry.movie.vote_average === "number" && entry.movie.vote_average > 0 ? `★ ${entry.movie.vote_average.toFixed(1)}` : ""].filter(Boolean)
    })),
    ...personalReviewsCache.map((entry) => ({
      id: `review-${entry.movieId}`,
      type: "Review",
      timestamp: entry.updatedAt,
      movie: entry.movie,
      summary: entry.review || "Guardaste uma opinião pessoal neste filme.",
      chips: [entry.rating ? `${entry.rating}/10` : "Review"]
    })),
    ...favsCache
      .filter((movie) => movie.favoritedAt)
      .map((movie) => ({
        id: `favorite-${movie.id}`,
        type: "Favorito",
        timestamp: movie.favoritedAt,
        movie,
        summary: "Passou a fazer parte da tua seleção premium.",
        chips: ["Favorito"]
      })),
    ...abandonedEntries.map((entry) => ({
      id: `abandoned-${entry.movieId}`,
      type: "Largado",
      timestamp: entry.updatedAt,
      movie: entry.movie,
      summary: `Ficou parado nos ${entry.progressPercent}% e pode merecer uma nova tentativa.`,
      chips: [`${entry.progressPercent}% visto`, entry.lastDevice || ""].filter(Boolean)
    }))
  ].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());

  if (!events.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
  <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  <p>O teu histórico está vazio.<br>Começa a ver filmes para registar a tua atividade.</p>
`;
    appContent.appendChild(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "history-list";

  events.forEach((entry) => {
    const movie = entry.movie;
    const item = document.createElement("article");
    item.className = "history-item";
    item.innerHTML = `
      <img class="history-poster" src="${movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : PLACEHOLDER_POSTER}" alt="${escapeHtml(movie.title)}">
      <div class="history-copy">
        <div class="history-copy-top">
          <div>
            <h2 class="history-title">${escapeHtml(movie.title)}</h2>
            <p class="history-meta">${escapeHtml(entry.type)} • ${escapeHtml(formatShortDateTime(entry.timestamp))}</p>
          </div>
          <div class="history-badges">
            ${(entry.chips || []).map((chip, index) => `<span class="chip${index === 0 ? " chip-accent" : ""}">${escapeHtml(chip)}</span>`).join("")}
          </div>
        </div>
        <p class="history-overview">${escapeHtml(entry.summary || movie.overview || "Sem sinopse disponível.")}</p>
        <div class="history-actions">
          <button class="accent-btn" type="button" data-action="watch">${entry.type === "Largado" ? "Retomar" : getMediaType(movie) === "tv" ? "Ver episódio" : "Ver filme"}</button>
          <button class="secondary-btn" type="button" data-action="details">Detalhes</button>
          <button class="secondary-btn" type="button" data-action="favorite">${isFavorite(movie) ? "Remover favorito" : "Favoritar"}</button>
        </div>
      </div>
    `;

    item.querySelector('[data-action="watch"]').addEventListener("click", () => openPlayer(movie));
    item.querySelector('[data-action="details"]').addEventListener("click", () => openDetails(movie));
    item.querySelector('[data-action="favorite"]').addEventListener("click", async (event) => {
      await toggleFavorite(movie);
      event.currentTarget.textContent = isFavorite(movie) ? "Remover favorito" : "Favoritar";
    });

    list.appendChild(item);
  });

  appContent.appendChild(list);
}

async function viewListas() {
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Listas personalizadas"));

  const shell = document.createElement("div");
  shell.className = "lists-shell";
  shell.innerHTML = `
    <section class="lists-create-card">
      <h2 class="lists-title">Criar nova lista</h2>
      <div class="lists-create-row">
        <input id="newListName" class="lists-input" type="text" maxlength="40" placeholder="Ex.: Filmes de domingo">
        <button id="createListBtn" class="accent-btn" type="button">Criar lista</button>
      </div>
    </section>
    <section id="listsContainer" class="lists-grid"></section>
  `;
  appContent.appendChild(shell);

  const listsContainer = shell.querySelector("#listsContainer");

  function renderLists() {
    listsContainer.innerHTML = "";
    if (!customListsCache.length) {
      listsContainer.innerHTML = `<div class="empty-state">Ainda não tens listas personalizadas. Cria uma acima e depois usa o botão Lista nos detalhes de um filme.</div>`;
      return;
    }

    customListsCache.forEach((list) => {
      const card = document.createElement("article");
      card.className = "list-card";
      card.innerHTML = `
        <div class="list-card-head">
          <div>
            <h3 class="list-card-title">${escapeHtml(list.name)}</h3>
            <p class="list-card-meta">${list.movies.length} filme${list.movies.length === 1 ? "" : "s"}</p>
          </div>
          <div class="list-card-actions">
            <button class="secondary-btn" type="button" data-action="share">Partilhar</button>
            <button class="secondary-btn" type="button" data-action="rename">Renomear</button>
            <button class="secondary-btn" type="button" data-action="delete">Apagar</button>
          </div>
        </div>
        <div class="list-card-body"></div>
      `;

      const body = card.querySelector(".list-card-body");
      if (!list.movies.length) {
        body.innerHTML = `<div class="empty-state">Esta lista ainda não tem filmes.</div>`;
      } else {
        const grid = document.createElement("div");
        grid.className = "genre-grid";
        body.appendChild(grid);
        renderMovieCards(grid, list.movies);
      }

      card.querySelector('[data-action="rename"]').addEventListener("click", () => {
        const name = window.prompt("Novo nome da lista:", list.name);
        if (name) {
          renameCustomList(list.id, name);
          renderLists();
        }
      });
      card.querySelector('[data-action="share"]').addEventListener("click", async () => {
        try {
          await shareProfileSnapshot({ listId: list.id });
          const status = document.createElement("div");
          status.className = "empty-state";
          status.textContent = "Código da lista copiado. Partilha-o na página Amigos.";
          card.prepend(status);
          setTimeout(() => status.remove(), 2400);
        } catch {
          window.alert("Nao foi possivel copiar a lista para partilha.");
        }
      });
      card.querySelector('[data-action="delete"]').addEventListener("click", () => {
        if (window.confirm(`Apagar a lista "${list.name}"?`)) {
          deleteCustomList(list.id);
          renderLists();
        }
      });
      listsContainer.appendChild(card);
    });
  }

  shell.querySelector("#createListBtn").addEventListener("click", () => {
    const input = shell.querySelector("#newListName");
    const list = createCustomList(input.value);
    if (list) {
      input.value = "";
      renderLists();
    }
  });

  renderLists();
}

async function viewEstreias() {
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Estreias e calendário"));

  const [sections, personalCalendar] = await Promise.all([
    ensureCalendarData().catch(() => []),
    ensurePersonalCalendarData().catch(() => ({ sections: [] }))
  ]);
  if (!sections.length) {
    appContent.innerHTML += errorState("Nao foi possivel carregar o calendário de estreias.");
    return;
  }

  (personalCalendar.sections || []).forEach((section) => {
    const wrapper = document.createElement("section");
    wrapper.className = "profile-panel";
    wrapper.innerHTML = `
      <div class="profile-panel-head">
        <h2 class="profile-panel-title">${escapeHtml(section.title)}</h2>
        <span class="profile-panel-tag">Personalizado para o perfil ativo</span>
      </div>
      <div class="reminder-grid"></div>
    `;
    const grid = wrapper.querySelector(".reminder-grid");
    const reminders = section.reminders || [];
    if (!reminders.length) {
      grid.innerHTML = `<div class="empty-state">Ainda sem alertas personalizados.</div>`;
    } else {
      grid.innerHTML = reminders.map((reminder) => `
        <article class="reminder-card">
          <strong>${escapeHtml(reminder.title)}</strong>
          <p>${escapeHtml(reminder.body)}</p>
        </article>
      `).join("");
    }
    appContent.appendChild(wrapper);
  });

  sections.forEach((section) => {
    const wrapper = document.createElement("section");
    wrapper.className = "profile-panel";
    wrapper.innerHTML = `
      <div class="profile-panel-head">
        <h2 class="profile-panel-title">${escapeHtml(section.title)}</h2>
        <span class="profile-panel-tag">Próximas datas confirmadas</span>
      </div>
      <div class="genre-grid"></div>
    `;
    const grid = wrapper.querySelector(".genre-grid");
    if (section.movies.length) {
      renderMovieCards(grid, section.movies);
    } else {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Ainda sem lançamentos nesta janela.</div>`;
    }
    appContent.appendChild(wrapper);
  });
}

let _colecoesRenderVersion = 0;

async function viewColecoes() {
  const myVersion = ++_colecoesRenderVersion;
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Coleções cinematográficas"));

  const realSections = await ensureRealCollections().catch(() => []);
  if (myVersion !== _colecoesRenderVersion) return;

  if (!realSections.length) {
    appContent.innerHTML += errorState("Nao foi possivel carregar as coleções.");
    return;
  }

  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Coleções cinematográficas"));
  const decoratedRealSections = decorateRealCollectionSections(realSections);
  if (decoratedRealSections.length) {
    // Collection hub — visual overview grid
    const hubSection = document.createElement("section");
    hubSection.className = "collection-hub";
    hubSection.innerHTML = decoratedRealSections.map((section) => {
      const firstMovie = section.movies?.[0];
      const poster = firstMovie?.poster_path ? `https://image.tmdb.org/t/p/w342${firstMovie.poster_path}` : "";
      const backdrop = firstMovie?.backdrop_path ? `https://image.tmdb.org/t/p/w780${firstMovie.backdrop_path}` : poster;
      const total = section.movies?.length || 0;
      const watched = (section.movies || []).filter((m) => isMovieMarkedAsWatched(m.id)).length;
      const pct = total ? Math.round((watched / total) * 100) : 0;
      return `
        <div class="collection-hub-card" data-collection-id="${escapeHtml(section.id)}">
          <div class="collection-hub-bg" style="background-image:url('${backdrop}')"></div>
          <div class="collection-hub-overlay"></div>
          <div class="collection-hub-body">
            <h3 class="collection-hub-title">${escapeHtml(section.title)}</h3>
            <div class="collection-hub-meta">${total} filmes</div>
            <div class="collection-hub-progress">
              <div class="collection-hub-bar"><div class="collection-hub-fill" style="width:${pct}%"></div></div>
              <span class="collection-hub-pct">${pct}%</span>
            </div>
          </div>
        </div>
      `;
    }).join("");
    appContent.appendChild(hubSection);

    // Click on hub card scrolls to the corresponding row
    hubSection.querySelectorAll(".collection-hub-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.collectionId;
        const target = appContent.querySelector(`[data-section-id="${id}"]`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // Rows
    renderCatalogRows(decoratedRealSections, appContent);
  }
}

async function viewPessoa(personId) {
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Pessoa"));
  appContent.innerHTML += renderSpinner();

  try {
    const favoriteIds = favsCache.slice(0, 8).map((movie) => movie.id).join(",");
    const query = new URLSearchParams({ language: getLanguage() });
    if (favoriteIds) query.set("favorite_ids", favoriteIds);
    const data = await fetchJson(`/api/person/${personId}?${query.toString()}`);
    const stats = data.stats || {};
    const shell = document.createElement("div");
    shell.className = "profile-shell person-page-shell";
    shell.innerHTML = `
      <section class="profile-hero-card person-hero-card">
        <div class="profile-copy">
          <span class="eyebrow">${escapeHtml(data.person?.known_for_department || "Cinema")}</span>
          <h2 class="profile-name">${escapeHtml(data.person?.name || "Pessoa")}</h2>
          <p class="profile-email">${escapeHtml(data.person?.place_of_birth || "Página de ator / realizador")}</p>
          <div class="profile-meta-line">
            ${stats.totalMovies ? `<span class="chip">${stats.totalMovies} filmes relacionados</span>` : ""}
            ${stats.actingCredits ? `<span class="chip">Ator: ${stats.actingCredits}</span>` : ""}
            ${stats.directingCredits ? `<span class="chip">Realizador: ${stats.directingCredits}</span>` : ""}
          </div>
          <p class="profile-spotlight-overview">${escapeHtml((data.person?.biography || "Ainda sem biografia disponível nesta língua.").slice(0, 420))}</p>
        </div>
      </section>
    `;

    appContent.innerHTML = "";
    appContent.appendChild(pageHeader(data.person?.name || "Pessoa"));
    appContent.appendChild(shell);

    if (data.relatedFavorites?.length) {
      renderCatalogRows([{ id: "person-related-favorites", title: "Relacionados com os teus favoritos", subtitle: "Ligação direta aos teus gostos guardados.", movies: data.relatedFavorites }], appContent);
    }
    if (data.upcoming?.length) {
      const upcomingWrap = document.createElement("section");
      upcomingWrap.className = "profile-panel";
      upcomingWrap.innerHTML = `<div class="profile-panel-head"><h3 class="profile-panel-title">Próximas estreias</h3><span class="profile-panel-tag">O que vem aí</span></div><div class="genre-grid"></div>`;
      renderMovieCards(upcomingWrap.querySelector(".genre-grid"), data.upcoming);
      appContent.appendChild(upcomingWrap);
    }
    if (data.filmography?.length) {
      renderCatalogRows([{ id: "person-filmography", title: "Filmografia para descobrir", subtitle: "Os títulos mais relevantes desta pessoa.", movies: data.filmography }], appContent);
    }
  } catch (err) {
    appContent.innerHTML = "";
    appContent.appendChild(pageHeader("Pessoa"));
    appContent.innerHTML += errorState(err.message);
  }
}

// ─── Genre Page ──────────────────────────────────────────────
async function viewGenero(genreId, mediaType = "movie") {
  const isTV = mediaType === "tv";
  const genreList = isTV ? DISCOVER_TV_GENRES : DISCOVER_GENRES;
  const genre = genreList.find((g) => String(g.id) === String(genreId));
  const genreName = genre?.name || "Género";

  appContent.innerHTML = "";

  // Banner
  const banner = document.createElement("div");
  banner.className = "genre-banner";
  banner.innerHTML = `
    <div class="genre-banner-inner">
      <div class="genre-banner-type">
        <button class="genre-type-btn${!isTV ? " is-active" : ""}" data-type="movie">Filmes</button>
        <button class="genre-type-btn${isTV ? " is-active" : ""}" data-type="tv">Séries</button>
      </div>
      <h1 class="genre-banner-title">${escapeHtml(genreName)}</h1>
      <div class="genre-banner-pills">
        ${genreList.filter(g => g.id).map(g => `
          <a class="genre-pill${String(g.id) === String(genreId) ? " is-active" : ""}"
             href="#/genero/${g.id}/${mediaType}">${escapeHtml(g.name)}</a>
        `).join("")}
      </div>
    </div>
  `;
  appContent.appendChild(banner);

  // Sort controls
  const controls = document.createElement("div");
  controls.className = "genre-controls";
  controls.innerHTML = `
    <div class="genre-controls-inner">
      <select id="genreSort" class="filter-select">
        <option value="popularity.desc">Mais populares</option>
        <option value="vote_average.desc">Melhor avaliados</option>
        <option value="primary_release_date.desc">Mais recentes</option>
        <option value="revenue.desc">Mais vistos</option>
      </select>
      <select id="genreYear" class="filter-select">
        <option value="">Todos os anos</option>
        ${Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(y => `<option value="${y}">${y}</option>`).join("")}
      </select>
    </div>
  `;
  appContent.appendChild(controls);

  const resultsEl = document.createElement("div");
  resultsEl.className = "genre-page-results";
  appContent.appendChild(resultsEl);

  let currentPage = 1;
  let totalPages = 1;

  async function loadGenreMovies(page = 1) {
    if (page === 1) resultsEl.innerHTML = renderSpinner();
    try {
      const sort = document.getElementById("genreSort")?.value || "popularity.desc";
      const year = document.getElementById("genreYear")?.value || "";
      const lang = encodeURIComponent(getLanguage());
      const params = new URLSearchParams({
        language: getLanguage(),
        with_genres: genreId,
        sort_by: sort,
        page: String(page),
        "vote_count.gte": "50"
      });
      if (year) params.set(isTV ? "first_air_date_year" : "primary_release_year", year);
      const endpoint = isTV ? "tv" : "movie";
      const data = await fetchJson(`/api/discover?${params.toString()}&media_type=${endpoint}`);

      currentPage = Number(data.page) || page;
      totalPages = Number(data.total_pages) || 1;

      if (page === 1) {
        resultsEl.innerHTML = "";
        const grid = document.createElement("div");
        grid.className = "genre-grid catalog-section";
        grid.id = "genreGrid";
        resultsEl.appendChild(grid);
      }
      const grid = document.getElementById("genreGrid") || resultsEl.querySelector(".genre-grid");
      renderMovieCards(grid, data.results || []);
      initSectionAnimations();

      // Infinite scroll
      resultsEl.querySelector(".infinite-sentinel")?.remove();
      if (currentPage < totalPages) {
        const sentinel = document.createElement("div");
        sentinel.className = "infinite-sentinel";
        sentinel.innerHTML = `<div class="infinite-loading"><span class="infinite-spinner"></span></div>`;
        resultsEl.appendChild(sentinel);
        const obs = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) { obs.disconnect(); loadGenreMovies(currentPage + 1); }
        }, { rootMargin: "200px" });
        obs.observe(sentinel);
      }
    } catch (err) {
      if (page === 1) resultsEl.innerHTML = errorState(err.message);
    }
  }

  // Type toggle
  banner.querySelectorAll(".genre-type-btn").forEach(btn => {
    btn.addEventListener("click", () => navigateTo(`/genero/${genreId}/${btn.dataset.type}`));
  });

  // Sort/year change
  controls.querySelectorAll("select").forEach(sel => {
    sel.addEventListener("change", () => loadGenreMovies(1));
  });

  // Fetch backdrop for banner from first popular movie
  fetchJson(`/api/discover?with_genres=${genreId}&sort_by=popularity.desc&page=1&language=${encodeURIComponent(getLanguage())}&vote_count.gte=200`)
    .then(data => {
      const movie = data.results?.find(m => m.backdrop_path);
      if (movie) {
        banner.style.backgroundImage = `url("${IMAGE_BASE_URL}${movie.backdrop_path}")`;
        banner.classList.add("has-backdrop");
      }
    }).catch(() => {});

  await loadGenreMovies(1);
}

async function viewHomeEditor() {
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Editor de homepage"));

  const shell = document.createElement("section");
  shell.className = "filters-panel";
  const order = [...(appPreferences.homeSectionOrder || DEFAULT_HOME_SECTION_ORDER)];

  function renderEditor() {
    shell.innerHTML = `
      <div class="profile-panel-head">
        <div>
          <h2 class="profile-panel-title">Escolhe a ordem do início</h2>
          <p class="detail-review-subtitle">Esconde secções, sobe as mais importantes e guarda a tua homepage.</p>
        </div>
        <label class="chip home-editor-toggle"><input id="cinemaModeToggle" type="checkbox" ${appPreferences.cinemaMode ? "checked" : ""}> Modo cinema</label>
      </div>
      <div class="home-editor-list">
        ${order.map((id, index) => {
          const section = HOME_SECTION_LIBRARY.find((entry) => entry.id === id);
          const hidden = (appPreferences.hiddenHomeSections || []).includes(id);
          return `
            <div class="home-editor-item">
              <div>
                <strong>${escapeHtml(section?.title || id)}</strong>
                <p>${hidden ? "Escondida" : "Visível"} na homepage.</p>
              </div>
              <div class="detail-review-actions">
                <button class="secondary-btn" type="button" data-move-up="${id}" ${index === 0 ? "disabled" : ""}>Subir</button>
                <button class="secondary-btn" type="button" data-move-down="${id}" ${index === order.length - 1 ? "disabled" : ""}>Descer</button>
                <button class="secondary-btn" type="button" data-toggle-visibility="${id}">${hidden ? "Mostrar" : "Esconder"}</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="filters-actions">
        <button class="secondary-btn" type="button" data-home-reset>Repor</button>
        <button class="accent-btn" type="button" data-home-save>Guardar homepage</button>
      </div>
    `;

    shell.querySelectorAll("[data-move-up]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = order.indexOf(button.dataset.moveUp);
        if (index > 0) [order[index - 1], order[index]] = [order[index], order[index - 1]];
        renderEditor();
      });
    });
    shell.querySelectorAll("[data-move-down]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = order.indexOf(button.dataset.moveDown);
        if (index >= 0 && index < order.length - 1) [order[index + 1], order[index]] = [order[index], order[index + 1]];
        renderEditor();
      });
    });
    shell.querySelectorAll("[data-toggle-visibility]").forEach((button) => {
      button.addEventListener("click", () => {
        const hidden = new Set(appPreferences.hiddenHomeSections || []);
        if (hidden.has(button.dataset.toggleVisibility)) hidden.delete(button.dataset.toggleVisibility);
        else hidden.add(button.dataset.toggleVisibility);
        appPreferences.hiddenHomeSections = [...hidden];
        renderEditor();
      });
    });
    shell.querySelector("[data-home-reset]")?.addEventListener("click", () => {
      appPreferences.homeSectionOrder = [...DEFAULT_HOME_SECTION_ORDER];
      appPreferences.hiddenHomeSections = [];
      order.splice(0, order.length, ...DEFAULT_HOME_SECTION_ORDER);
      renderEditor();
    });
    shell.querySelector("[data-home-save]")?.addEventListener("click", () => {
      appPreferences.homeSectionOrder = [...order];
      appPreferences.cinemaMode = shell.querySelector("#cinemaModeToggle")?.checked !== false;
      saveAppPreferences();
      saveLibraryState();
      navigateTo("/");
    });
  }

  renderEditor();
  appContent.appendChild(shell);
}

let _perfilRenderVersion = 0;

async function viewPerfil() {
  const myVersion = ++_perfilRenderVersion;
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Perfil"));

  if (!authReady) {
    appContent.innerHTML += renderSpinner();
    return;
  }

  if (!currentUser) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <div class="empty-icon">👤</div>
      <p>Entra na tua conta para veres o teu perfil e atividade.</p>
      <button class="accent-btn" style="margin-top:20px" onclick="openAuthModal('login')">Entrar</button>
    `;
    appContent.appendChild(empty);
    return;
  }

  if (!favoritesLoaded) {
    appContent.innerHTML += renderSpinner();
    try {
      await withTimeout(loadFavorites(), 8000, "Os dados do perfil demoraram demasiado tempo a carregar.");
      appContent.innerHTML = "";
      appContent.appendChild(pageHeader("Perfil"));
    } catch (err) {
      appContent.innerHTML = "";
      appContent.appendChild(pageHeader("Perfil"));
      appContent.innerHTML += errorState(getFavoriteLoadErrorMessage(err));
      return;
    }
  }

  // Guard: if a newer render started while we were loading, abort
  if (myVersion !== _perfilRenderVersion) return;
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader("Perfil"));

  const profile = buildProfileSummary();
  const recommendedForYou = favsCache.length ? await fetchFavoriteRecommendations().catch(() => []) : [];
  if (myVersion !== _perfilRenderVersion) return;
  const shell = document.createElement("div");
  shell.className = "profile-shell";
  shell.innerHTML = `
    <section class="profile-hero-card">
      <div class="profile-hero-main">
        ${renderAvatarMarkup("profile-avatar-xl", {
          image: profile.avatarImage,
          fallback: profile.initial,
          alt: `Avatar de ${profile.name}`
        })}
        <div class="profile-copy">
          <span class="eyebrow">A tua conta</span>
          <h2 class="profile-name">${escapeHtml(profile.name)}</h2>
          <p class="profile-email">${escapeHtml(profile.email)}</p>
          <div class="profile-meta-line">
            <span class="chip">Membro desde ${escapeHtml(profile.memberSince)}</span>
            <span class="chip">${escapeHtml(profile.language)}</span>
          </div>
        </div>
      </div>
      <div class="profile-stats-strip">
        ${profile.stats.map((stat) => `
          <div class="profile-stat-item">
            <span class="profile-stat-item-value">${escapeHtml(stat.value)}</span>
            <span class="profile-stat-item-label">${escapeHtml(stat.label)}</span>
          </div>
        `).join("")}
      </div>
      <div class="profile-actions">
        <button class="secondary-btn" type="button" data-profile-action="favoritos">Favoritos</button>
        <button class="secondary-btn" type="button" data-profile-action="watchlist">Watchlist</button>
        <button class="secondary-btn" type="button" data-profile-action="historico">Histórico</button>
        <button class="secondary-btn" type="button" data-profile-action="resumo">Resumo anual</button>
        <button class="secondary-btn" type="button" data-profile-action="perfis">Perfis</button>
        <button class="accent-btn" type="button" data-profile-action="logout">Sair</button>
      </div>
    </section>
    <section class="profile-panels">
      <article class="profile-panel">
        <div class="profile-panel-head">
          <h3 class="profile-panel-title">Destaque pessoal</h3>
          <span class="profile-panel-tag">Baseado nos teus favoritos</span>
        </div>
        ${renderProfileSpotlight(profile.spotlight)}
      </article>
      <article class="profile-panel">
        <div class="profile-panel-head">
          <h3 class="profile-panel-title">As tuas reviews</h3>
          <span class="profile-panel-tag">${escapeHtml(getReviewStorageLabel())}</span>
        </div>
        ${renderProfileReviews(profile.reviews)}
      </article>
      <article class="profile-panel">
        <div class="profile-panel-head">
          <h3 class="profile-panel-title">Editar perfil</h3>
          <span class="profile-panel-tag">${currentUser ? "Sincronizado com a tua conta" : "Guardado neste dispositivo"}</span>
        </div>
        <div class="profile-edit-grid">
          <label class="filter-field"><span>Nome visível</span><input id="profileDisplayName" type="text" maxlength="40" value="${escapeHtml(profilePrefs.displayName)}" placeholder="Como queres aparecer"></label>
        </div>
        <div class="profile-avatar-editor">
          ${renderAvatarMarkup("profile-avatar-upload-preview", {
            image: profile.avatarImage,
            fallback: profile.initial,
            alt: `Avatar de ${profile.name}`
          })}
          <div class="profile-avatar-upload-copy">
            <input id="profileAvatarFile" class="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
            <p class="profile-avatar-upload-note">Carrega uma foto para o teu avatar. A imagem é otimizada e fica ${currentUser ? "sincronizada com a tua conta" : "guardada apenas neste dispositivo"}.</p>
            <div class="profile-actions">
              <label class="secondary-btn profile-upload-btn" for="profileAvatarFile">Escolher foto</label>
              <button class="secondary-btn" type="button" id="removeProfileAvatarBtn">Remover foto</button>
            </div>
            <p id="profileAvatarStatus" class="profile-avatar-status">${profile.avatarImage ? "Foto atual carregada." : "Sem foto carregada. Vais usar o avatar automático."}</p>
          </div>
        </div>
        <div class="profile-actions"><button class="accent-btn" type="button" id="saveProfilePrefsBtn">Guardar</button></div>
      </article>
    </section>
    ${recommendedForYou.length ? `<section class="profile-panel"><div class="profile-panel-head"><h3 class="profile-panel-title">Recomendado para ti</h3><span class="profile-panel-tag">Com base nos teus favoritos</span></div><div class="detail-similar-grid profile-recommendations-grid"></div></section>` : ""}
  `;

  shell.querySelectorAll("[data-profile-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.profileAction;
      if (action === "favoritos") navigateTo("/favoritos");
      else if (action === "watchlist") navigateTo("/watchlist");
      else if (action === "historico") navigateTo("/historico");
      else if (action === "resumo") navigateTo("/resumo-anual");
      else if (action === "perfis") navigateTo("/perfis");
      else if (action === "logout") await handleLogout();
    });
  });

  const spotlightBtn = shell.querySelector("[data-open-favorite-id]");
  if (spotlightBtn) {
    spotlightBtn.addEventListener("click", () => openDetails(spotlightBtn.dataset.openFavoriteId));
  }

  shell.querySelectorAll("[data-open-review-id]").forEach((button) => {
    button.addEventListener("click", () => openDetails(button.dataset.openReviewId));
  });

  const saveProfilePrefsBtn = shell.querySelector("#saveProfilePrefsBtn");
  const profileDisplayNameInput = shell.querySelector("#profileDisplayName");
  const profileAvatarPreview = shell.querySelector(".profile-avatar-upload-preview");
  const profileAvatarFileInput = shell.querySelector("#profileAvatarFile");
  const removeProfileAvatarBtn = shell.querySelector("#removeProfileAvatarBtn");
  const profileAvatarStatus = shell.querySelector("#profileAvatarStatus");
  let draftAvatarImage = profilePrefs.avatarImage || "";
  let avatarProcessing = false;

  const syncAvatarDraftUi = (message) => {
    setAvatarElement(profileAvatarPreview, {
      image: draftAvatarImage,
      fallback: profile.initial,
      alt: `Avatar de ${profile.name}`
    });
    if (profileAvatarStatus && typeof message === "string") {
      profileAvatarStatus.textContent = message;
    }
    if (removeProfileAvatarBtn) {
      removeProfileAvatarBtn.disabled = !draftAvatarImage;
    }
  };

  syncAvatarDraftUi(profile.avatarImage ? "Foto atual carregada." : "Sem foto carregada. Vais usar o avatar automático.");

  if (profileAvatarFileInput) {
    profileAvatarFileInput.addEventListener("change", async () => {
      const file = profileAvatarFileInput.files?.[0];
      if (!file) return;
      avatarProcessing = true;
      if (saveProfilePrefsBtn) saveProfilePrefsBtn.disabled = true;
      syncAvatarDraftUi("A preparar a nova foto...");
      try {
        draftAvatarImage = await buildProfileAvatarDataUrl(file);
        syncAvatarDraftUi("Nova foto pronta. Guarda o perfil para aplicar.");
      } catch (err) {
        syncAvatarDraftUi(err?.message || "Não foi possível atualizar a foto.");
      } finally {
        avatarProcessing = false;
        if (saveProfilePrefsBtn) saveProfilePrefsBtn.disabled = false;
        profileAvatarFileInput.value = "";
      }
    });
  }

  if (removeProfileAvatarBtn) {
    removeProfileAvatarBtn.addEventListener("click", () => {
      if (!draftAvatarImage) { syncAvatarDraftUi("Já estás a usar o avatar automático."); return; }
      draftAvatarImage = "";
      syncAvatarDraftUi("Foto removida. Guarda o perfil para aplicar.");
    });
  }

  if (saveProfilePrefsBtn) {
    saveProfilePrefsBtn.addEventListener("click", () => {
      if (avatarProcessing) return;
      saveProfilePrefs(profileDisplayNameInput.value, draftAvatarImage);
      handleRoute();
    });
  }

  const recommendationsGrid = shell.querySelector(".profile-recommendations-grid");
  if (recommendationsGrid) {
    renderMovieCards(recommendationsGrid, recommendedForYou);
  }

  appContent.appendChild(shell);
}

async function viewResumoAnual() {
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader(`Resumo ${new Date().getFullYear()}`));
  appContent.innerHTML += renderSpinner();

  const summary = await buildYearlyRankingSummary().catch(() => null);
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader(`Resumo ${new Date().getFullYear()}`));

  if (!summary) {
    appContent.innerHTML += `
      <div class="empty-state">
        Ainda não tens atividade suficiente este ano neste perfil para gerar o teu ranking pessoal.
      </div>
    `;
    return;
  }

  const shell = document.createElement("div");
  shell.className = "profile-shell";
  shell.innerHTML = `
    <section class="profile-hero-card badge-hero-card">
      <div class="profile-copy">
        <span class="eyebrow">O teu ano no MimiFlix</span>
        <h2 class="profile-name">${escapeHtml(getUserDisplayName(currentUser?.email || "Perfil"))}</h2>
        <p class="profile-email">Resumo com base na atividade do perfil ${escapeHtml(profilePrefs.displayName || "ativo")} em ${summary.year}.</p>
        <div class="profile-meta-line">
          <span class="chip">${summary.movieCount} filmes no teu top</span>
          <span class="chip">${formatMinutesAsHours(summary.estimatedMinutesWatched)} vistos</span>
          ${summary.mostActiveMonth ? `<span class="chip">Mês forte: ${escapeHtml(summary.mostActiveMonth[0])}</span>` : ""}
        </div>
      </div>
      <div class="profile-summary-list">
        <div class="profile-summary-item"><span class="profile-summary-bullet"></span><p>${summary.topGenres[0] ? `O teu género dominante foi ${summary.topGenres[0].name}.` : "Ainda sem género dominante."}</p></div>
        <div class="profile-summary-item"><span class="profile-summary-bullet"></span><p>${summary.topActors[0] ? `O ator mais repetido foi ${summary.topActors[0].name}.` : "Ainda sem ator repetido suficiente."}</p></div>
        <div class="profile-summary-item"><span class="profile-summary-bullet"></span><p>${summary.reviewCount ? `Escreveste ${summary.reviewCount} review${summary.reviewCount === 1 ? "" : "s"} este ano.` : "Ainda sem reviews neste ano."}</p></div>
      </div>
    </section>
    <section class="profile-stats-grid">
      <article class="profile-stat-card">
        <span class="profile-stat-label">Tempo visto</span>
        <strong class="profile-stat-value">${formatMinutesAsHours(summary.estimatedMinutesWatched)}</strong>
        <p class="profile-stat-note">Estimativa com base no histórico e progresso guardado.</p>
      </article>
      <article class="profile-stat-card">
        <span class="profile-stat-label">Géneros fortes</span>
        <strong class="profile-stat-value">${summary.topGenres[0]?.name || "—"}</strong>
        <p class="profile-stat-note">${summary.topGenres.length ? summary.topGenres.slice(0, 3).map((genre) => genre.name).join(", ") : "Sem dados suficientes."}</p>
      </article>
      <article class="profile-stat-card">
        <span class="profile-stat-label">Ator mais repetido</span>
        <strong class="profile-stat-value">${summary.topActors[0]?.name || "—"}</strong>
        <p class="profile-stat-note">${summary.topActors[0] ? `Apareceu em ${Math.round(summary.topActors[0].score)} pontos do teu ano.` : "Sem recorrência suficiente."}</p>
      </article>
    </section>
    <section class="profile-panels">
      <article class="profile-panel">
        <div class="profile-panel-head">
          <h3 class="profile-panel-title">Top géneros</h3>
          <span class="profile-panel-tag">Baseado na tua atividade</span>
        </div>
        <div class="profile-meta-line">
          ${summary.topGenres.map((genre) => `<span class="chip">${escapeHtml(genre.name)}</span>`).join("")}
        </div>
      </article>
      <article class="profile-panel">
        <div class="profile-panel-head">
          <h3 class="profile-panel-title">Atores mais repetidos</h3>
          <span class="profile-panel-tag">Os rostos do teu ano</span>
        </div>
        <div class="profile-review-list">
          ${summary.topActors.length ? summary.topActors.map((actor, index) => `
            <article class="profile-review-card">
              <div class="profile-review-head">
                <strong>${index + 1}. ${escapeHtml(actor.name)}</strong>
                <span class="chip">${Math.round(actor.score)} pts</span>
              </div>
            </article>
          `).join("") : '<div class="empty-state profile-empty-state">Sem atores suficientes para ranking.</div>'}
        </div>
      </article>
    </section>
    <section class="profile-panel">
      <div class="profile-panel-head">
        <h3 class="profile-panel-title">Top filmes do ano</h3>
        <span class="profile-panel-tag">O teu ranking pessoal</span>
      </div>
      <div class="detail-similar-grid yearly-top-movies"></div>
    </section>
  `;

  appContent.appendChild(shell);
  renderMovieCards(shell.querySelector(".yearly-top-movies"), summary.topMovies.slice(0, 10));
}

async function viewPerfis() {
  appContent.innerHTML = "";
  if (!currentUser) {
    appContent.innerHTML += `
      <div class="empty-state">
        Entra na tua conta para criares perfis familiares com favoritos, histórico e recomendações separados.
      </div>
    `;
    return;
  }

  syncActiveProfileCache();
  const shell = document.createElement("div");
  shell.className = "profile-picker-shell";
  shell.innerHTML = `
    <div class="profile-picker-inner">
      <header class="profile-picker-header">
        <h1 class="profile-picker-title">Quem vai ver?</h1>
        <p class="profile-picker-subtitle">Escolhe um perfil para entrar ou gere os perfis da conta.</p>
      </header>
      <section id="familyProfilesGrid" class="profile-picker-grid"></section>
      <div class="profile-picker-footer">
        <button id="toggleManageProfilesBtn" class="profile-picker-manage-btn" type="button">Gerir perfis</button>
      </div>
      <section id="manageProfilesPanel" class="profile-picker-manage-panel hidden">
        <div class="profile-picker-manage-create">
          <input id="newFamilyProfileName" class="lists-input" type="text" maxlength="32" placeholder="Novo perfil">
          <button id="createFamilyProfileBtn" class="accent-btn" type="button">Criar perfil</button>
        </div>
        <p class="profile-picker-manage-note">Cada perfil tem favoritos, watchlist, histórico, reviews e progresso próprios.</p>
      </section>
    </div>
  `;

  let manageMode = false;

  function renderProfiles() {
    const grid = shell.querySelector("#familyProfilesGrid");
    const toggleManageProfilesBtn = shell.querySelector("#toggleManageProfilesBtn");
    const manageProfilesPanel = shell.querySelector("#manageProfilesPanel");
    toggleManageProfilesBtn.textContent = manageMode ? "Concluir gestão" : "Gerir perfis";
    manageProfilesPanel.classList.toggle("hidden", !manageMode);

    grid.innerHTML = familyProfilesCache.map((profile) => {
      const isActive = profile.id === activeFamilyProfileId;
      const avatarFallback = getAvatarFallbackText(profile.profilePrefs.displayName || profile.name);
      return `
        <article class="profile-picker-card ${isActive ? "is-active" : ""} ${manageMode ? "is-managing" : ""}" data-family-card="${profile.id}">
          <button class="profile-picker-select" type="button" data-family-switch="${profile.id}">
            ${renderAvatarMarkup("profile-picker-avatar", {
              image: profile.profilePrefs.avatarImage,
              fallback: avatarFallback,
              alt: `Avatar de ${profile.name}`
            })}
            <span class="profile-picker-name">${escapeHtml(profile.name)}</span>
            ${isActive ? '<span class="profile-picker-active-badge">Ativo</span>' : ""}
          </button>
          <div class="profile-picker-tools ${manageMode ? "" : "hidden"}">
            <button class="secondary-btn" type="button" data-family-rename="${profile.id}">Renomear</button>
            ${profile.id === "main" ? "" : `<button class="secondary-btn" type="button" data-family-delete="${profile.id}">Remover</button>`}
          </div>
        </article>
      `;
    }).join("");

    grid.querySelectorAll("[data-family-switch]").forEach((button) => {
      button.addEventListener("click", () => {
        if (manageMode) return;
        if (setActiveFamilyProfile(button.dataset.familySwitch)) {
          navigateTo("/");
        }
      });
    });

    grid.querySelectorAll("[data-family-rename]").forEach((button) => {
      button.addEventListener("click", () => {
        const profile = familyProfilesCache.find((entry) => entry.id === button.dataset.familyRename);
        const nextName = window.prompt("Novo nome do perfil:", profile?.name || "");
        if (nextName) {
          renameFamilyProfile(button.dataset.familyRename, nextName);
          renderProfiles();
        }
      });
    });

    grid.querySelectorAll("[data-family-delete]").forEach((button) => {
      button.addEventListener("click", () => {
        deleteFamilyProfile(button.dataset.familyDelete);
        renderProfiles();
      });
    });

    if (manageMode && familyProfilesCache.length < MAX_FAMILY_PROFILES) {
      const addCard = document.createElement("article");
      addCard.className = "profile-picker-card is-add";
      addCard.innerHTML = `
        <button class="profile-picker-select" type="button" data-family-create="1">
          <span class="profile-picker-add-icon">+</span>
          <span class="profile-picker-name">Adicionar perfil</span>
        </button>
      `;
      addCard.querySelector("[data-family-create]")?.addEventListener("click", () => {
        shell.querySelector("#newFamilyProfileName")?.focus();
      });
      grid.appendChild(addCard);
    }
  }

  shell.querySelector("#createFamilyProfileBtn").addEventListener("click", () => {
    const input = shell.querySelector("#newFamilyProfileName");
    const profile = createFamilyProfile(input.value);
    if (profile) {
      input.value = "";
      renderProfiles();
      handleRoute();
    }
  });

  shell.querySelector("#toggleManageProfilesBtn").addEventListener("click", () => {
    manageMode = !manageMode;
    renderProfiles();
  });

  appContent.appendChild(shell);
  renderProfiles();
}

async function viewPesquisa() {
  const query = sessionStorage.getItem("mf_search_query") || "";
  appContent.innerHTML = "";
  appContent.appendChild(pageHeader(query ? `Resultados para "${query}"` : "Pesquisa"));

  if (!query) {
    appContent.innerHTML += `<div class="empty-state">Escreve algo na barra de pesquisa e prime Enter.</div>`;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "genre-grid";
  grid.innerHTML = renderSpinner();
  appContent.appendChild(grid);

  try {
    const lang = encodeURIComponent(getLanguage());
    const data = await fetchJson(`/api/search?q=${encodeURIComponent(query)}&language=${lang}`);
    grid.innerHTML = "";
    if (!data.results.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Nenhum resultado para "${escapeHtml(query)}".</div>`;
      return;
    }
    renderMovieCards(grid, data.results);
  } catch (err) { grid.innerHTML = errorState(err.message); }
}

// ─── Hero ─────────────────────────────────────────────────────
const heroBackdropNext = document.getElementById("heroBackdropNext");
let heroTransitionTimer = null;

function renderHero(movie, animate = false) {
  const bgUrl = movie.backdrop_path
    ? `url("${IMAGE_BASE_URL}${movie.backdrop_path}")`
    : "linear-gradient(180deg, #111118, #06060a)";

  if (animate && heroBackdropNext) {
    // Crossfade: load new image on next layer, fade it in, then swap
    heroBackdropNext.style.backgroundImage = bgUrl;
    heroBackdropNext.classList.add("is-fading-in");

    if (heroTransitionTimer) clearTimeout(heroTransitionTimer);
    heroTransitionTimer = setTimeout(() => {
      heroBackdrop.style.backgroundImage = bgUrl;
      heroBackdropNext.classList.remove("is-fading-in");
      heroBackdropNext.style.backgroundImage = "";
    }, 950);
  } else {
    heroBackdrop.style.backgroundImage = bgUrl;
  }

  // Fade out content, update, fade in
  const heroContent = document.querySelector(".hero-content");
  if (heroContent && animate) heroContent.classList.add("is-refreshing");

  heroTitle.textContent = movie.title;
  heroOverview.textContent = movie.overview || "Sem sinopse disponível.";
  heroMeta.innerHTML = buildMetaHtml(movie);

  // Genre tags
  const heroGenres = document.getElementById("heroGenres");
  if (heroGenres && Array.isArray(movie.genres) && movie.genres.length) {
    heroGenres.innerHTML = movie.genres.slice(0, 4)
      .map((g) => {
        const allGenres = [...DISCOVER_GENRES, ...DISCOVER_TV_GENRES];
        const found = allGenres.find(dg => dg.name.toLowerCase() === g.toLowerCase());
        const mediaT = getMediaType(movie) === "tv" ? "tv" : "movie";
        return found
          ? `<a class="hero-genre-tag" href="#/genero/${found.id}/${mediaT}">${escapeHtml(g)}</a>`
          : `<span class="hero-genre-tag">${escapeHtml(g)}</span>`;
      })
      .join("");
    heroGenres.classList.remove("hidden");
  } else if (heroGenres) {
    heroGenres.innerHTML = "";
  }

  // Poster thumbnail
  const heroPoster = document.getElementById("heroPoster");
  if (heroPoster) {
    heroPoster.src = movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : "";
    heroPoster.alt = movie.title || "";
  }

  // Play button label
  const isTV = getMediaType(movie) === "tv";
  const playBtn = document.getElementById("heroPlayBtn");
  if (playBtn) {
    playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>${isTV ? "Ver episódio" : "Ver agora"}`;
  }

  if (heroContent && animate) {
    requestAnimationFrame(() => heroContent.classList.remove("is-refreshing"));
  }
}


// ─── Hero Rotation ────────────────────────────────────────────
let heroRotationInterval = null;
let heroRotationIndex = 0;
let heroRotationList = [];

function startHeroRotation(movies) {
  if (!movies?.length) return;
  stopHeroRotation();
  heroRotationList = movies;
  heroRotationIndex = 0;

  // Update dots count
  const dotsContainer = document.querySelector(".hero-dots");
  if (dotsContainer) {
    dotsContainer.innerHTML = movies.map((_, i) =>
      `<button class="hero-dot${i === 0 ? " is-active" : ""}" type="button" data-hero-index="${i}"></button>`
    ).join("");
    dotsContainer.querySelectorAll("[data-hero-index]").forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        goToHeroSlide(Number(dot.dataset.heroIndex));
        resetHeroRotationTimer();
      });
    });
  }

  heroRotationInterval = setInterval(() => {
    heroRotationIndex = (heroRotationIndex + 1) % heroRotationList.length;
    goToHeroSlide(heroRotationIndex);
  }, 6000);
}

function stopHeroRotation() {
  if (heroRotationInterval) { clearInterval(heroRotationInterval); heroRotationInterval = null; }
}

function resetHeroRotationTimer() {
  stopHeroRotation();
  heroRotationInterval = setInterval(() => {
    heroRotationIndex = (heroRotationIndex + 1) % heroRotationList.length;
    goToHeroSlide(heroRotationIndex);
  }, 6000);
}

function goToHeroSlide(index) {
  if (!heroRotationList.length) return;
  heroRotationIndex = index;
  const movie = heroRotationList[index];
  featuredMovie = movie;
  renderHero(movie, true);
  // Update active dot
  document.querySelectorAll(".hero-dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === index);
  });
}

// Platform hubs visibility
function showPlatformHubs(show) {
  const el = document.getElementById("platformHubs");
  if (el) el.classList.toggle("hidden", !show);
}

// ─── Catalog rows ─────────────────────────────────────────────
function renderCatalogRows(sections, container) {
  sections.forEach((section) => {
    if (!section.movies?.length) return;
    const wrapper = document.createElement("section");
    wrapper.className = "row-section catalog-section";
    wrapper.dataset.sectionId = section.id;
    wrapper.innerHTML = `
      <div class="row-header">
        <div>
          <h2 class="row-title">${escapeHtml(section.title)}</h2>
          ${section.subtitle || section.description ? `<p class="row-subtitle">${escapeHtml(section.subtitle || section.description)}</p>` : ""}
          ${section.context ? `<p class="row-subtitle">${escapeHtml(section.context)}</p>` : ""}
          ${Array.isArray(section.stats) && section.stats.length ? `<div class="history-badges">${section.stats.map((item) => `<span class="chip">${escapeHtml(`${item.label}: ${item.value}`)}</span>`).join("")}</div>` : ""}
        </div>
        <div class="row-scroll-btns">
          <button class="scroll-btn" data-dir="-1" aria-label="Anterior">&#8249;</button>
          <button class="scroll-btn" data-dir="1" aria-label="Próximo">&#8250;</button>
        </div>
      </div>
      <div class="row-grid"></div>
    `;
    const grid = wrapper.querySelector(".row-grid");
    wrapper.querySelectorAll(".scroll-btn").forEach((btn) =>
      btn.addEventListener("click", () => grid.scrollBy({ left: parseInt(btn.dataset.dir) * 380, behavior: "smooth" }))
    );
    container.appendChild(wrapper);
    renderMovieCards(grid, section.movies, { showRanking: section.display === "ranking" });
  });
  initSectionAnimations();
}

// Animate catalog sections when they scroll into view
function initSectionAnimations() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      // Stamp --card-index on each card for stagger
      entry.target.querySelectorAll('.movie-card').forEach((card, i) => {
        card.style.setProperty('--card-index', i);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.catalog-section:not(.is-visible)').forEach((sec) => observer.observe(sec));
}


// ─── Movie cards ──────────────────────────────────────────────
function renderMovieCards(container, movies, options = {}) {
  movies.forEach((movie, i) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.style.animationDelay = `${i * 0.04}s`;

    const poster = movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : PLACEHOLDER_POSTER;
    const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
    const rating = typeof movie.vote_average === "number" && movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null;
    const fav = isFavorite(movie);
    const inWatchlist = isInWatchlist(movie);
    const genreLabel = Array.isArray(movie.genres) && movie.genres.length ? escapeHtml(movie.genres[0]) : "";
    const mediaTypeLabel = getMediaType(movie) === "tv" ? "Série" : "Filme";

    // Check watch progress for this movie
    const progressEntry = continueWatchingCache.find((e) => e.movie?.id === movie.id);
    const progressPct = progressEntry?.progressPercent || 0;

    // New episode badge for TV series in watchlist
    const isTV = getMediaType(movie) === "tv";
    const inWL = isInWatchlist(movie);
    const hasNewEpisode = isTV && inWL && (() => {
      if (!progressEntry) return false;
      const lastSeason = Number(progressEntry.season || 0);
      const lastEp = Number(progressEntry.episode || 0);
      const totalSeasons = Number(movie.number_of_seasons || 0);
      const totalEps = Number(movie.number_of_episodes || 0);
      // Has more content than what was last watched
      if (totalSeasons > lastSeason) return true;
      if (totalSeasons === lastSeason && totalEps > lastEp) return true;
      return false;
    })();

    card.innerHTML = `
      <div class="card-poster-wrap">
        <img src="${poster}" alt="${escapeHtml(movie.title)}" loading="lazy">
        ${options.showRanking && movie.rank ? `<div class="card-rank-badge">#${movie.rank}</div>` : ""}
        ${!options.showRanking && movie.chronological_index ? `<div class="card-rank-badge card-rank-badge--timeline">${movie.chronological_index}</div>` : ""}
        ${progressPct > 2 && progressPct < 95 ? `<div class="card-progress-bar"><div class="card-progress-fill" style="width:${progressPct}%"></div></div>` : ""}
        ${hasNewEpisode ? `<div class="card-new-episode-badge">Novo ep.</div>` : ""}
        <div class="card-quick-actions">
          <button class="card-fav${fav ? " is-fav" : ""}" data-id="${movie.id}" data-media-type="${getMediaType(movie)}" data-media-key="${getMediaKey(movie)}" type="button"
            aria-label="${fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/></svg>
          </button>
          <button class="card-watchlist${inWatchlist ? " is-active" : ""}" data-id="${movie.id}" data-media-type="${getMediaType(movie)}" data-media-key="${getMediaKey(movie)}" type="button"
            aria-label="${inWatchlist ? "Remover da watchlist" : "Adicionar a watchlist"}" title="${inWatchlist ? "Remover da watchlist" : "Adicionar a watchlist"}">
            <svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>
          </button>
        </div>
        <div class="card-play">
          <div class="play-circle">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      <div class="movie-card-info">
        <div class="movie-card-title">${escapeHtml(movie.title)}</div>
        <div class="movie-card-rating-row">
          ${rating ? `<span class="star-icon">★</span><span class="movie-card-rating-num">${rating}</span><span>•</span>` : ""}
          ${genreLabel ? `<span>${genreLabel}</span><span>•</span>` : ""}
          <span>${mediaTypeLabel}</span>
          ${year ? `<span>•</span><span>${year}</span>` : ""}
        </div>
      </div>
    `;

    card.querySelector(".card-fav").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(movie);
    });
    card.querySelector(".card-watchlist").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWatchlist(movie);
    });
    card.addEventListener("click", () => openDetails(movie));
    container.appendChild(card);
  });
}

function buildPeopleButtons(people, emptyLabel) {
  if (!people?.length) {
    return `<div class="detail-availability-empty">${escapeHtml(emptyLabel)}</div>`;
  }

  return `<div class="detail-availability-list">${people.map((person) => `
    <button class="people-chip" type="button" data-open-person-id="${person.id}">
      <img
        class="people-chip-image"
        src="${person.profile_path ? `${POSTER_BASE_URL}${person.profile_path}` : PLACEHOLDER_PROFILE}"
        alt="${escapeHtml(person.name)}"
        loading="lazy"
      >
      <span class="people-chip-copy">
        <strong>${escapeHtml(person.name)}</strong>
        ${person.character ? `<small>${escapeHtml(person.character)}</small>` : ""}
        ${person.job ? `<small>${escapeHtml(person.job)}</small>` : ""}
      </span>
    </button>
  `).join("")}</div>`;
}

function formatDetailDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function buildDetailSideCard(title, body, options = {}) {
  return `
    <section class="detail-side-card${options.accent ? " detail-side-card--accent" : ""}">
      <div class="detail-side-card-head">
        <h3 class="detail-side-card-title">${escapeHtml(title)}</h3>
        ${options.badge ? `<span class="chip">${escapeHtml(options.badge)}</span>` : ""}
      </div>
      <div class="detail-side-card-body">${body}</div>
    </section>
  `;
}

function renderDetailFactsPanel(movie) {
  if (!detailFacts) return;
  const isTv = getMediaType(movie) === "tv";
  const latestProgress = getLatestProgressForMedia(movie);
  const factItems = [
    { label: "Formato", value: isTv ? "Série" : "Filme" },
    { label: isTv ? "Temporadas" : "Duração", value: isTv ? (movie.number_of_seasons || "—") : (movie.runtime ? formatMinutesAsHours(movie.runtime) : "—") },
    { label: isTv ? "Episódios" : "Lançamento", value: isTv ? (movie.number_of_episodes || "—") : formatDetailDate(movie.release_date) },
    { label: isTv ? "Estado" : "Idioma", value: isTv ? (movie.status || "—") : (movie.original_language ? String(movie.original_language).toUpperCase() : "—") }
  ];

  if (isTv && movie.next_episode_to_air) {
    factItems.push({
      label: "Próximo episódio",
      value: `${formatEpisodeLabel(movie.next_episode_to_air.season_number, movie.next_episode_to_air.episode_number) || "Anunciado"}`
    });
  } else if (!isTv) {
    factItems.push({
      label: "Pontuação",
      value: typeof movie.vote_average === "number" && movie.vote_average > 0 ? `${movie.vote_average.toFixed(1)}/10` : "—"
    });
  }

  detailFacts.innerHTML = `
    <section class="detail-facts-card">
      <div class="detail-side-card-head">
        <h3 class="detail-side-card-title">Resumo rápido</h3>
        ${latestProgress ? `<span class="chip chip-accent">${latestProgress.progressPercent}% visto</span>` : ""}
      </div>
      <div class="detail-facts-grid">
        ${factItems.map((item) => `
          <article class="detail-fact-item">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(String(item.value || "—"))}</strong>
          </article>
        `).join("")}
      </div>
      ${latestProgress ? `
        <div class="detail-progress-inline">
          <div class="player-progress-bar"><span style="width:${latestProgress.progressPercent}%"></span></div>
          <div class="player-progress-meta">
            <span>${formatProgressTime(latestProgress.positionSeconds)}</span>
            <span>${latestProgress.runtime ? formatMinutesAsHours(latestProgress.runtime) : "Sem duração"}</span>
          </div>
        </div>
      ` : ""}
    </section>
  `;
}

function renderDetailAvailabilityPanel(movie, isTv) {
  if (!detailAvailability) return;
  detailAvailability.innerHTML = [
    buildDetailSideCard(
      isTv ? "Criação" : "Realização",
      buildPeopleButtons(movie.directors, isTv ? "Criação não identificada." : "Realização não identificada.")
    ),
    buildDetailSideCard(
      "Elenco",
      buildPeopleButtons(movie.cast, "Elenco indisponível no momento."),
      { badge: Array.isArray(movie.cast) && movie.cast.length ? `${movie.cast.length} nomes` : "" }
    )
  ].join("");

  detailAvailability.querySelectorAll("[data-open-person-id]").forEach((button) => {
    button.addEventListener("click", () => {
      setTimeout(() => navigateTo(`/pessoa/${button.dataset.openPersonId}`), 0);
    });
  });
}

// ─── Detail modal ─────────────────────────────────────────────
function getLatestProgressForMedia(movie) {
  const mediaKey = getMediaKey(movie);
  return playerProgressCache
    .filter((entry) => entry.mediaKey === mediaKey)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())[0] || null;
}

function renderSeriesPanel(series) {
  if (!detailSeriesPanel) return;
  if (getMediaType(series) !== "tv") {
    detailSeriesPanel.innerHTML = "";
    detailSeriesPanel.classList.add("hidden");
    return;
  }

  const selectedSeason = Math.max(1, Number(series.selectedSeason || series.selected_season || 1) || 1);
  const selectedEpisode = Math.max(1, Number(series.selectedEpisode || 1) || 1);
  const seasons = Array.isArray(series.seasons) ? series.seasons.filter((season) => Number(season.season_number) > 0 || season.name) : [];
  const episodes = Array.isArray(series.episodes) ? series.episodes : [];
  const selectedEpisodeMeta = getSeriesEpisodeMeta(series, selectedSeason, selectedEpisode);
  const resumeTarget = getSeriesResumeTarget(series);
  const nextTarget = getSeriesNextEpisodeTarget(series, resumeTarget || { season: selectedSeason, episode: selectedEpisode });
  const showResumeButton = Boolean(
    resumeTarget && (resumeTarget.hasProgress || resumeTarget.season !== selectedSeason || resumeTarget.episode !== selectedEpisode)
  );

  detailSeriesPanel.classList.remove("hidden");

  const epProgress = (ep) => {
    const key = `${series.id}-s${selectedSeason}e${ep.episode_number}`;
    const stored = JSON.parse(localStorage.getItem("mf_progress") || "{}");
    return stored[key] ? Math.round((stored[key].pos / stored[key].dur) * 100) : 0;
  };

  detailSeriesPanel.innerHTML = `
    <section class="ep-strip-section">
      <div class="ep-strip-header">
        <div class="ep-strip-season-wrap">
          <button class="ep-season-btn" id="detailSeasonBtn" type="button">
            <span id="detailSeasonLabel">${escapeHtml(seasons.find(s => s.season_number === selectedSeason)?.name || `Temporada ${selectedSeason}`)}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <select id="detailSeasonSelect" class="ep-season-select-hidden" aria-label="Escolher temporada">
            ${seasons.map((s) => `<option value="${s.season_number}"${s.season_number === selectedSeason ? " selected" : ""}>${escapeHtml(s.name || `Temporada ${s.season_number}`)}</option>`).join("")}
          </select>
        </div>
        <div class="ep-strip-actions">
          <button class="ep-action-play" type="button" data-series-action="watch-selected">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Ver ${escapeHtml(formatEpisodeLabel(selectedSeason, selectedEpisode) || "episódio")}
          </button>
          ${showResumeButton ? `<button class="ep-action-ghost" type="button" data-series-action="resume">${resumeTarget.hasProgress ? `Retomar ${escapeHtml(formatEpisodeLabel(resumeTarget.season, resumeTarget.episode))}` : `Ir para ${escapeHtml(formatEpisodeLabel(resumeTarget.season, resumeTarget.episode))}`}</button>` : ""}
          ${nextTarget ? `<button class="ep-action-ghost" type="button" data-series-action="next">Seguinte: ${escapeHtml(formatEpisodeLabel(nextTarget.season, nextTarget.episode))}</button>` : ""}
        </div>
      </div>

      <div class="ep-strip-outer">
        <button class="ep-strip-nav ep-strip-nav--prev" type="button" aria-label="Anterior">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="ep-strip-track">
          ${episodes.length ? episodes.map((episode) => {
            const prog = epProgress(episode);
            const isActive = episode.episode_number === selectedEpisode;
            const label = `S${selectedSeason}-E${episode.episode_number}`;
            return `
              <button class="ep-card${isActive ? " ep-card--active" : ""}" type="button" data-detail-episode="${episode.episode_number}">
                <div class="ep-card-thumb">
                  <img src="${episode.still_path ? `${POSTER_BASE_URL}${episode.still_path}` : PLACEHOLDER_STILL}" alt="${escapeHtml(episode.name || label)}" loading="lazy">
                  <div class="ep-card-overlay">
                    ${isActive ? `<div class="ep-card-play-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>` : ""}
                  </div>
                  ${prog > 0 ? `<div class="ep-card-progress"><div class="ep-card-progress-bar" style="width:${prog}%"></div></div>` : ""}
                  <span class="ep-card-code">${label}</span>
                </div>
                <div class="ep-card-info">
                  <span class="ep-card-title">${escapeHtml(episode.name || `Episódio ${episode.episode_number}`)}</span>
                  ${episode.runtime ? `<span class="ep-card-runtime">${episode.runtime} min</span>` : ""}
                </div>
              </button>
            `;
          }).join("") : '<div class="detail-availability-empty">Sem episódios disponíveis para esta temporada.</div>'}
        </div>
        <button class="ep-strip-nav ep-strip-nav--next" type="button" aria-label="Próximo">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </section>
  `;

  const openSeriesTarget = (target) => {
    if (!target) return;
    openPlayer({
      ...series,
      selectedSeason: target.season,
      selectedEpisode: target.episode,
      media_type: "tv"
    });
  };

  detailSeriesPanel.querySelector('[data-series-action="watch-selected"]')?.addEventListener("click", () => {
    openSeriesTarget({ season: selectedSeason, episode: selectedEpisode });
  });
  detailSeriesPanel.querySelector('[data-series-action="resume"]')?.addEventListener("click", () => {
    openSeriesTarget(resumeTarget);
  });
  detailSeriesPanel.querySelector('[data-series-action="next"]')?.addEventListener("click", () => {
    openSeriesTarget(nextTarget);
  });

  // Season selector — click btn opens the hidden native select
  const seasonBtn = detailSeriesPanel.querySelector("#detailSeasonBtn");
  const seasonSelect = detailSeriesPanel.querySelector("#detailSeasonSelect");
  seasonBtn?.addEventListener("click", () => seasonSelect?.click());
  seasonSelect?.addEventListener("change", (event) => {
    const nextSeason = Number(event.target.value) || 1;
    openDetails({ ...series, selectedSeason: nextSeason, selectedEpisode: 1, media_type: "tv" });
  });

  // Episode cards
  detailSeriesPanel.querySelectorAll("[data-detail-episode]").forEach((button) => {
    button.addEventListener("click", () => {
      const ep = Number(button.dataset.detailEpisode) || 1;
      detailSeriesPanel.querySelectorAll(".ep-card").forEach((b) => b.classList.remove("ep-card--active"));
      button.classList.add("ep-card--active");
      openPlayer({ ...series, selectedSeason, selectedEpisode: ep, media_type: "tv" });
    });
  });

  // Strip scroll nav arrows
  const track = detailSeriesPanel.querySelector(".ep-strip-track");
  detailSeriesPanel.querySelector(".ep-strip-nav--prev")?.addEventListener("click", () => {
    track?.scrollBy({ left: -320, behavior: "smooth" });
  });
  detailSeriesPanel.querySelector(".ep-strip-nav--next")?.addEventListener("click", () => {
    track?.scrollBy({ left: 320, behavior: "smooth" });
  });

  // Scroll active card into view
  setTimeout(() => {
    const activeCard = detailSeriesPanel.querySelector(".ep-card--active");
    activeCard?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, 80);
}

async function openDetails(mediaRef) {
  const targetPath = buildDetailPath(mediaRef);
  // Yield to browser immediately so the click response is instant (fixes INP)
  setTimeout(() => {
    if (`#${targetPath}` === location.hash) {
      const match = getDetailRouteMatch(targetPath.split("?")[0]);
      if (match) {
        viewDetailPage(match, new URLSearchParams(targetPath.split("?")[1] || ""));
      }
      return;
    }
    navigateTo(targetPath);
  }, 0);
}

async function renderDetailContent(mediaRef) {
  const initialMedia = normalizeMovie(typeof mediaRef === "object" ? mediaRef : { id: mediaRef, media_type: "movie" });
  const isTv = getMediaType(initialMedia) === "tv";
  const latestProgress = isTv ? getLatestProgressForMedia(initialMedia) : null;
  const selectedSeason = isTv ? Math.max(1, Number(initialMedia?.selectedSeason || latestProgress?.season || 1) || 1) : null;
  const selectedEpisode = isTv ? Math.max(1, Number(initialMedia?.selectedEpisode || latestProgress?.episode || 1) || 1) : null;
  const detailEndpoint = isTv ? "tv" : "movie";

  detailModal.classList.remove("hidden");
  detailModal.setAttribute("aria-hidden", "false");
  detailModal.querySelector(".modal-card").scrollTop = 0;
  detailTitle.textContent = "";
  detailOverview.textContent = "";
  detailMeta.innerHTML = "";
  const _dmh = document.getElementById("detailMobileHeader");
  if (_dmh) _dmh.innerHTML = "";
  if (detailFacts) detailFacts.innerHTML = "";
  if (detailAvailability) detailAvailability.innerHTML = "";
  if (detailSeriesPanel) {
    detailSeriesPanel.innerHTML = "";
    detailSeriesPanel.classList.add("hidden");
  }
  detailPoster.src = "";
  detailTrailerBtn.classList.add("hidden");
  detailTrailerBtn.dataset.key = "";
  detailFavBtn.classList.remove("is-fav");
  detailFavBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Favorito`;
  detailWatchlistBtn.classList.remove("is-fav");
  detailWatchlistBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Watchlist`;
  detailPlayBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> ${isTv ? "Ver episódio" : "Ver filme"}`;
  if (detailPremium) detailPremium.innerHTML = "";
  detailPersonalReview.innerHTML = "";
  detailSimilar.innerHTML = renderSpinner();

  try {
    const lang = encodeURIComponent(getLanguage());
    const detailUrl = isTv
      ? `/api/tv/${initialMedia.id}?language=${lang}&season=${selectedSeason}`
      : `/api/movie/${initialMedia.id}?language=${lang}`;
    const movie = await fetchJson(detailUrl);
    selectedMovie = normalizeMovie({
      ...movie,
      selectedSeason: selectedSeason || movie.selected_season || 1,
      selectedEpisode: selectedEpisode || movie.episodes?.[0]?.episode_number || 1
    });

    detailTitle.textContent = selectedMovie.title;
    detailOverview.textContent = selectedMovie.overview || "Sem sinopse disponível.";
    detailMeta.innerHTML = buildMetaHtml(selectedMovie, true);

    // SEO: update page title and meta description dynamically
    document.title = `${selectedMovie.title} — MimiFlix`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", selectedMovie.overview || `Ver ${selectedMovie.title} online grátis no MimiFlix.`);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `${selectedMovie.title} — MimiFlix`);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", selectedMovie.overview || `Ver ${selectedMovie.title} online grátis no MimiFlix.`);
    if (selectedMovie.backdrop_path) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute("content", `${IMAGE_BASE_URL}${selectedMovie.backdrop_path}`);
    }

    // JSON-LD Structured Data for Google
    const existingLd = document.getElementById("ld-json");
    if (existingLd) existingLd.remove();
    const ldScript = document.createElement("script");
    ldScript.id = "ld-json";
    ldScript.type = "application/ld+json";
    const isTvLd = getMediaType(selectedMovie) === "tv";
    ldScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": isTvLd ? "TVSeries" : "Movie",
      "name": selectedMovie.title,
      "description": selectedMovie.overview || "",
      "datePublished": selectedMovie.release_date || "",
      "image": selectedMovie.poster_path ? `${POSTER_BASE_URL}${selectedMovie.poster_path}` : "",
      "aggregateRating": selectedMovie.vote_average > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": selectedMovie.vote_average.toFixed(1),
        "ratingCount": selectedMovie.vote_count || 0,
        "bestRating": "10",
        "worstRating": "1"
      } : undefined,
      "genre": Array.isArray(selectedMovie.genres) ? selectedMovie.genres : [],
      "url": `https://mimiflix.org/#/detalhe/${isTvLd ? "tv" : "movie"}/${selectedMovie.id}`
    });
    document.head.appendChild(ldScript);

    renderDetailFactsPanel(selectedMovie);
    renderDetailAvailabilityPanel(selectedMovie, isTv);

    // Mobile header: title, meta, genres, storyline
    const detailMobileHeader = document.getElementById("detailMobileHeader");
    if (detailMobileHeader && document.body.classList.contains("mobile-ui")) {
      const genres = Array.isArray(selectedMovie.genres) ? selectedMovie.genres : [];
      const _mMediaT = (selectedMovie.media_type === "tv" || selectedMovie.first_air_date) ? "tv" : "movie";
      const _mGenreList = _mMediaT === "tv" ? DISCOVER_TV_GENRES : DISCOVER_GENRES;
      const genreHtml = genres.slice(0, 3).map(g => {
        const found = _mGenreList.find(x => x.name.toLowerCase() === String(g).toLowerCase());
        return found
          ? `<a class="detail-mobile-genre genre-tag" href="#/genero/${found.id}/${_mMediaT}">${escapeHtml(g)}</a>`
          : `<span class="detail-mobile-genre">${escapeHtml(g)}</span>`;
      }).join("");
      const runtime = selectedMovie.runtime
        ? `${Math.floor(selectedMovie.runtime / 60)}h ${selectedMovie.runtime % 60}min`
        : "";
      const rating = typeof selectedMovie.vote_average === "number" && selectedMovie.vote_average > 0
        ? `<span class="dm-star">★</span> ${selectedMovie.vote_average.toFixed(1)}`
        : "";
      const voteCount = selectedMovie.vote_count > 0
        ? `(${(selectedMovie.vote_count / 1000).toFixed(selectedMovie.vote_count >= 1000000 ? 1 : 0)}${selectedMovie.vote_count >= 1000000 ? "M" : "K"} reviews)`
        : "";
      const metaParts = [runtime, rating, voteCount].filter(Boolean);
      const overview = selectedMovie.overview || "Sem sinopse disponível.";
      detailMobileHeader.innerHTML = `
        <h2 class="detail-mobile-title">${escapeHtml(selectedMovie.title)}</h2>
        ${metaParts.length ? `<div class="detail-mobile-meta">${metaParts.join(" &nbsp;·&nbsp; ")}</div>` : ""}
        ${genreHtml ? `<div class="detail-mobile-genres">${genreHtml}</div>` : ""}
        <div class="detail-mobile-storyline">
          <h3>Story line</h3>
          <p>${escapeHtml(overview)}</p>
        </div>
      `;
      // Update mobile bookmark button state
      const mobileBookmarkBtn = document.getElementById("detailMobileBookmarkBtn");
      if (mobileBookmarkBtn) {
        const inWL = isInWatchlist(selectedMovie);
        mobileBookmarkBtn.classList.toggle("is-saved", inWL);
      }
    }
    detailPoster.src = selectedMovie.poster_path ? `${POSTER_BASE_URL}${selectedMovie.poster_path}` : PLACEHOLDER_POSTER;
    detailPoster.alt = selectedMovie.title;
    detailBackdrop.style.backgroundImage = selectedMovie.backdrop_path
      ? `url("${IMAGE_BASE_URL}${selectedMovie.backdrop_path}")`
      : "linear-gradient(180deg, #1a1a28, #0a0a12)";

    const fav = isFavorite(selectedMovie);
    detailFavBtn.classList.toggle("is-fav", fav);
    detailFavBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Favorito`;
    const inWatchlist = isInWatchlist(selectedMovie);
    detailWatchlistBtn.classList.toggle("is-fav", inWatchlist);
    detailWatchlistBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${inWatchlist ? '<polyline points="20 6 9 17 4 12"/>' : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}</svg> Watchlist`;

    if (isTv) {
      renderSeriesPanel(selectedMovie);
    } else if (detailPremium) {
      const premium = selectedMovie.premium || {};
      detailPremium.innerHTML = `
        <div class="detail-premium-grid">
          ${premium.saga ? `
            <section class="detail-premium-card detail-premium-card--wide">
              <div class="profile-panel-head">
                <div>
                  <h3 class="detail-premium-title">Saga / ordem ideal</h3>
                  <p class="detail-review-subtitle">${escapeHtml(premium.saga.name)} • ${escapeHtml(premium.saga.orderIndex ? `Filme ${premium.saga.orderIndex} de ${premium.saga.totalMovies}` : `${premium.saga.totalMovies} filmes`)}${premium.saga.orderLabel ? ` • ${escapeHtml(premium.saga.orderLabel)}` : ""}</p>
                </div>
                <span class="profile-panel-tag">Premium</span>
              </div>
              <div class="detail-premium-saga">${premium.saga.order.map((entry) => `
                <button class="detail-saga-chip${entry.id === selectedMovie.id ? " is-active" : ""}" type="button" data-open-saga-id="${entry.id}">
                  <img
                    class="detail-saga-chip-image"
                    src="${entry.poster_path ? `${POSTER_BASE_URL}${entry.poster_path}` : PLACEHOLDER_POSTER}"
                    alt="${escapeHtml(entry.title)}"
                    loading="lazy"
                  >
                  <span>${escapeHtml(entry.social_context || `Ordem ${entry.chronological_index}`)}</span>
                  <strong>${escapeHtml(entry.title)}</strong>
                </button>
              `).join("")}</div>
            </section>
          ` : ""}
        </div>
      `;
      detailPremium.querySelectorAll("[data-open-saga-id]").forEach((button) => {
        button.addEventListener("click", () => openDetails(Number(button.dataset.openSagaId)));
      });
    }

    renderDetailReviewEditor(selectedMovie);

    const [trailerRes, similarRes] = await Promise.allSettled([
      fetchJson(`/api/${detailEndpoint}/${initialMedia.id}/trailer?language=${lang}`),
      fetchJson(`/api/${detailEndpoint}/${initialMedia.id}/similar?language=${lang}`),
    ]);

    if (trailerRes.status === "fulfilled" && trailerRes.value.key) {
      detailTrailerBtn.dataset.key = trailerRes.value.key;
      detailTrailerBtn.classList.remove("hidden");
    }

    detailSimilar.innerHTML = "";
    if (similarRes.status === "fulfilled" && similarRes.value.results?.length) {
      const wrap = document.createElement("div");
      wrap.className = "detail-similar-inner";
      wrap.innerHTML = `<h3 class="detail-similar-title">Mais como este</h3><div class="detail-similar-grid"></div>`;
      renderMovieCards(wrap.querySelector(".detail-similar-grid"), similarRes.value.results);
      detailSimilar.appendChild(wrap);
    }
  } catch {
    detailSimilar.innerHTML = "";
  }
}

async function viewDetailPage(detailMatch, query = new URLSearchParams()) {
  const selectedSeason = detailMatch.mediaType === "tv"
    ? Math.max(1, Number(query.get("season") || 1) || 1)
    : null;
  const selectedEpisode = detailMatch.mediaType === "tv"
    ? Math.max(1, Number(query.get("episode") || 1) || 1)
    : null;

  appContent.innerHTML = '<section class="detail-route-page"></section>';
  const host = appContent.querySelector(".detail-route-page");
  detailModal.classList.remove("hidden");
  detailModal.classList.add("detail-route-shell");
  detailModal.setAttribute("aria-hidden", "false");
  detailCloseBtn.textContent = "←";
  detailCloseFooterBtn.textContent = "Voltar";
  host.appendChild(detailModal);
  await renderDetailContent({
    id: detailMatch.id,
    media_type: detailMatch.mediaType,
    selectedSeason,
    selectedEpisode
  });
  window.scrollTo({ top: 0, behavior: "auto" });
}

function closeDetails() {
  if (getDetailRouteMatch()) {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo("/");
    }
    return;
  }
  detailModal.classList.add("hidden");
  detailModal.setAttribute("aria-hidden", "true");
  document.title = "MimiFlix — Filmes e Séries Online Grátis";
  const _ld = document.getElementById("ld-json");
  if (_ld) _ld.remove();
  if (detailFacts) detailFacts.innerHTML = "";
  if (detailPremium) detailPremium.innerHTML = "";
  if (detailSeriesPanel) {
    detailSeriesPanel.innerHTML = "";
    detailSeriesPanel.classList.add("hidden");
  }
  detailPersonalReview.innerHTML = "";
  selectedMovie = null;
}

// ─── Player ───────────────────────────────────────────────────
function formatProgressTime(totalSeconds) {
  const safe = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function stopActivePlaybackTracking() {
  if (activePlaybackSession?.intervalId) {
    clearInterval(activePlaybackSession.intervalId);
  }
  activePlaybackSession = null;
}

function persistActivePlaybackProgress(options = {}) {
  if (!activePlaybackSession?.movie) return null;

  const elapsed = Math.max(0, Math.floor((Date.now() - activePlaybackSession.startedAt) / 1000));
  const positionSeconds = activePlaybackSession.basePositionSeconds + elapsed;
  const entry = savePlaybackProgress(activePlaybackSession.movie, positionSeconds, activePlaybackSession.runtime, {
    sessionCount: activePlaybackSession.sessionCount,
    lastDevice: activePlaybackSession.lastDevice,
    progressPercent: options.progressPercent,
    season: activePlaybackSession.season,
    episode: activePlaybackSession.episode
  });

  activePlaybackSession.basePositionSeconds = positionSeconds;
  activePlaybackSession.startedAt = Date.now();
  return entry;
}

function applyPlayerCinemaMode(enabled) {
  document.body.classList.toggle("cinema-mode", Boolean(enabled));
}

function handlePlayerShortcuts(event) {
  if (playerOverlay.classList.contains("hidden")) return;
  if (event.key === "Escape") {
    closePlayer();
  } else if (event.key.toLowerCase() === "c") {
    appPreferences.cinemaMode = !appPreferences.cinemaMode;
    applyPlayerCinemaMode(appPreferences.cinemaMode);
    saveAppPreferences();
    saveLibraryState();
  } else if (activePlaybackSession?.movie && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    const delta = event.key === "ArrowLeft" ? -30 : 30;
    const currentProgress = getPlayerProgress(activePlaybackSession.movie, activePlaybackSession);
    const nextPosition = Math.max(0, (currentProgress?.positionSeconds || activePlaybackSession.basePositionSeconds || 0) + delta);
    activePlaybackSession.basePositionSeconds = nextPosition;
    activePlaybackSession.startedAt = Date.now();
    savePlaybackProgress(activePlaybackSession.movie, nextPosition, activePlaybackSession.runtime, {
      sessionCount: activePlaybackSession.sessionCount,
      lastDevice: activePlaybackSession.lastDevice,
      season: activePlaybackSession.season,
      episode: activePlaybackSession.episode
    });
  }
}

function renderPlayerProgressPanel(movie = activePlaybackSession?.movie, options = {}) {
  if (!playerProgressPanel) return;
  playerProgressPanel.classList.add("hidden");
  playerProgressPanel.innerHTML = "";
  return;
  const progress = movie ? getPlayerProgress(movie, activePlaybackSession || movie) : null;
  playerProgressPanel.classList.remove("hidden");
  playerProgressPanel.innerHTML = `
    <div class="player-progress-card">
      <div class="profile-panel-head">
        <div>
          <h3 class="profile-panel-title">Sessão de reprodução</h3>
          <p class="detail-review-subtitle">${options.trailer ? "Controlos visuais para uma sensação de produto completo." : "Preferências visuais do player e retoma rápida."}</p>
        </div>
        ${progress ? `<span class="chip chip-accent">${progress.progressPercent}% visto</span>` : `<span class="chip">${options.trailer ? "Trailer" : "Nova sessão"}</span>`}
      </div>
      ${movie && getMediaType(movie) === "tv" ? `<div class="history-badges"><span class="chip">${escapeHtml(formatEpisodeLabel((activePlaybackSession || movie).season || movie.selectedSeason || 1, (activePlaybackSession || movie).episode || movie.selectedEpisode || 1))}</span></div>` : ""}
      ${progress ? `
        <div class="player-progress-meter">
          <div class="player-progress-bar"><span style="width:${progress.progressPercent}%"></span></div>
          <div class="player-progress-meta">
            <span>${formatProgressTime(progress.positionSeconds)}</span>
            <span>${progress.runtime ? formatMinutesAsHours(progress.runtime) : "Sem duração"}</span>
          </div>
        </div>
      ` : ""}
      <div class="player-settings-grid">
        <label class="filter-field">
          <span>Qualidade</span>
          <select data-player-setting="playerQuality">
            ${["Auto", "1080p", "720p", "480p"].map((value) => `<option value="${value}"${appPreferences.playerQuality === value ? " selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
        <label class="filter-field">
          <span>Áudio</span>
          <select data-player-setting="playerAudio">
            ${["Original", "PT-PT", "PT-BR", "EN"].map((value) => `<option value="${value}"${appPreferences.playerAudio === value ? " selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
        <label class="filter-field">
          <span>Legendas</span>
          <select data-player-setting="playerSubtitles">
            ${["Off", "PT-PT", "PT-BR", "EN"].map((value) => `<option value="${value}"${appPreferences.playerSubtitles === value ? " selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
      </div>
    </div>
  `;
  playerProgressPanel.querySelectorAll("[data-player-setting]").forEach((select) => {
    select.addEventListener("change", () => {
      appPreferences[select.dataset.playerSetting] = select.value;
      saveAppPreferences();
      saveLibraryState();
      if (select.dataset.playerSetting === "playerSubtitles" && activePlaybackSession?.movie) {
        subtitleStartMs = Date.now();
        subtitleStartOffset = ((Date.now() - (activePlaybackSession.startedAt || Date.now())) / 1000) + (activePlaybackSession.basePositionSeconds || 0);
        loadSubtitlesForPlayer(activePlaybackSession.movie, select.value);
      }
    });
  });
}

// ─── Subtitles ───────────────────────────────────────────────
let subtitleCues = [];
let subtitleStartMs = 0;
let subtitleStartOffset = 0;
let subtitleIntervalId = null;
let subtitlePauseStart = 0; // >0 when paused because the document is hidden


function parseSrtTime(t) {
  const m = t.match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (!m) return 0;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
}

function parseSrt(text) {
  return text.trim().replace(/\r\n/g, "\n").split(/\n{2,}/).map((block) => {
    const lines = block.trim().split("\n");
    const ti = lines.findIndex((l) => l.includes("-->"));
    if (ti === -1) return null;
    const parts = lines[ti].split("-->");
    const start = parseSrtTime(parts[0].trim());
    const end = parseSrtTime(parts[1].trim());
    const body = lines.slice(ti + 1).join("\n").replace(/<[^>]+>/g, "").trim();
    return body ? { start, end, text: body } : null;
  }).filter(Boolean);
}

function onSubtitleVisibilityChange() {
  if (!subtitleCues.length) return;
  if (document.hidden) {
    if (subtitlePauseStart === 0) {
      subtitlePauseStart = Date.now();
    }
    return;
  }
  if (subtitlePauseStart > 0) {
    subtitleStartMs += Date.now() - subtitlePauseStart;
    subtitlePauseStart = 0;
  }
}

function pauseSubtitles() {
  if (subtitleCues.length && subtitlePauseStart === 0) {
    subtitlePauseStart = Date.now();
  }
}

function resumeSubtitles() {
  if (subtitlePauseStart > 0) {
    subtitleStartMs += Date.now() - subtitlePauseStart;
    subtitlePauseStart = 0;
  }
}

function syncSubtitlePlaybackState(data = {}) {
  const stateTokens = [data.state, data.status, data.event, data.action]
    .map((value) => String(value || "").toLowerCase())
    .filter(Boolean);
  const exactEvent = String(data.event || "").toLowerCase();
  const isPaused =
    data.paused === true ||
    data.playing === false ||
    ["pause", "paused", "ended", "stopped", "stop"].includes(exactEvent) ||
    stateTokens.some((value) => ["pause", "paused", "stopped", "stop", "ended"].includes(value));
  const isPlaying =
    data.paused === false ||
    data.playing === true ||
    exactEvent === "play" ||
    stateTokens.some((value) => ["play", "playing", "resumed", "resume"].includes(value));

  if (isPaused) pauseSubtitles();
  else if (isPlaying) resumeSubtitles();
}

function updatePlayerFullscreenButton() {
  const isFullscreen = document.fullscreenElement === playerFrameWrap;
  if (playerFrameWrap) playerFrameWrap.classList.toggle("is-player-fullscreen", isFullscreen);
  if (playerFullscreenBtn) {
    playerFullscreenBtn.textContent = isFullscreen ? "🡼 Sair do fullscreen" : "⛶ Fullscreen";
  }
}

async function togglePlayerFullscreen() {
  if (!playerFrameWrap) return;
  if (document.fullscreenElement === playerFrameWrap) {
    await document.exitFullscreen();
    return;
  }
  await playerFrameWrap.requestFullscreen();
}

function stopSubtitles() {
  if (subtitleIntervalId) { clearInterval(subtitleIntervalId); subtitleIntervalId = null; }
  subtitleCues = [];
  subtitlePauseStart = 0;
  document.removeEventListener("visibilitychange", onSubtitleVisibilityChange);
  window.removeEventListener("beforeunload", pauseSubtitles);
  window.removeEventListener("pageshow", resumeSubtitles);
  if (subtitleOverlay) subtitleOverlay.classList.add("hidden");
  if (subtitleText) subtitleText.textContent = "";
}

function tickSubtitles() {
  if (!subtitleCues.length || !subtitleText || subtitlePauseStart > 0) return;
  const elapsed = (Date.now() - subtitleStartMs) / 1000 + subtitleStartOffset;
  const cue = subtitleCues.find((c) => elapsed >= c.start && elapsed < c.end);
  subtitleText.innerHTML = cue ? cue.text.replace(/\n/g, "<br>") : "";
}

async function loadSubtitlesForPlayer(movie, lang) {
  stopSubtitles();
  if (!lang || lang === "Off") return;
  const isTv = getMediaType(movie) === "tv";
  const params = new URLSearchParams({ tmdb_id: movie.id, type: isTv ? "tv" : "movie", lang });
  if (movie.title) params.set("title", movie.title);
  if (movie.release_date) params.set("year", movie.release_date.slice(0, 4));
  if (isTv && movie.selectedSeason) params.set("season", movie.selectedSeason);
  if (isTv && movie.selectedEpisode) params.set("episode", movie.selectedEpisode);
  if (subtitleText) subtitleText.textContent = "A carregar legendas...";
  if (subtitleOverlay) subtitleOverlay.classList.remove("hidden");
  try {
    const res = await fetch(`/api/subtitles?${params}`);
    if (subtitleText) subtitleText.textContent = "";
    if (!res.ok) {
      if (subtitleOverlay) subtitleOverlay.classList.add("hidden");
      return;
    }
    const srt = await res.text();
    subtitleCues = parseSrt(srt);
    if (subtitleCues.length) {
      tickSubtitles();
      subtitleIntervalId = setInterval(tickSubtitles, 250);
      document.addEventListener("visibilitychange", onSubtitleVisibilityChange);
      window.addEventListener("beforeunload", pauseSubtitles);
      window.addEventListener("pageshow", resumeSubtitles);
    } else {
      if (subtitleOverlay) subtitleOverlay.classList.add("hidden");
    }
  } catch {
    subtitleCues = [];
    if (subtitleText) subtitleText.textContent = "";
    if (subtitleOverlay) subtitleOverlay.classList.add("hidden");
  }
}

function getCurrentPlayerProvider() {
  const preferred = String(appPreferences.playerProvider || "videasy").toLowerCase();
  return PLAYER_EMBED_PROVIDERS.some((provider) => provider.id === preferred) ? preferred : "videasy";
}

// Apply/remove sandbox on the player iframe depending on provider.
// sandbox blocks allow-popups → kills pop-up ads without breaking playback.
function setPlayerSandbox(provider) {
  if (!playerFrame) return;
  if (SANDBOX_PROVIDERS.has(String(provider).toLowerCase())) {
    playerFrame.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-presentation allow-forms allow-pointer-lock allow-orientation-lock"
    );
  } else {
    playerFrame.removeAttribute("sandbox");
  }
}

function buildPlayerEmbedUrl(movie, options = {}) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return "";
  const provider = String(options.provider || getCurrentPlayerProvider()).toLowerCase();
  const isTv = getMediaType(normalized) === "tv";
  const season = Math.max(1, Number(options.season || normalized.selectedSeason || 1) || 1);
  const episode = Math.max(1, Number(options.episode || normalized.selectedEpisode || 1) || 1);

  if (provider === "cinesrc") {
    return isTv
      ? `${CINESRC_BASE_URL}/embed/tv/${normalized.id}?s=${season}&e=${episode}&color=%23e01621&autoskip=true&autonext=true`
      : `${CINESRC_BASE_URL}/embed/movie/${normalized.id}?color=%23e01621`;
  }

  if (provider === "vidsrcwtf") {
    return isTv
      ? `${VIDSRCWTF_BASE_URL}/2/tv/${normalized.id}/${season}/${episode}`
      : `${VIDSRCWTF_BASE_URL}/2/movie/${normalized.id}`;
  }

  if (provider === "vidsrc") {
    return isTv
      ? `${VIDSRC_BASE_URL}/tv/${normalized.id}/${season}/${episode}`
      : `${VIDSRC_BASE_URL}/movie/${normalized.id}`;
  }

  if (provider === "vidking") {
    return isTv
      ? `https://www.vidking.net/embed/tv/${normalized.id}/${season}/${episode}`
      : `https://www.vidking.net/embed/movie/${normalized.id}`;
  }

  if (provider === "videasy") {
    return isTv
      ? `${VIDEASY_BASE_URL}/tv/${normalized.id}/${season}/${episode}`
      : `${VIDEASY_BASE_URL}/movie/${normalized.id}`;
  }

  if (provider === "rivestream") {
    const url = new URL(`${RIVESTREAM_BASE_URL}/embed`);
    url.searchParams.set("type", isTv ? "tv" : "movie");
    url.searchParams.set("id", String(normalized.id));
    if (isTv) {
      url.searchParams.set("season", String(season));
      url.searchParams.set("episode", String(episode));
    }
    return url.toString();
  }

  return isTv
    ? `${VIDFAST_BASE_URL}/tv/${normalized.id}/${season}/${episode}`
    : `${VIDFAST_BASE_URL}/movie/${normalized.id}`;
}


function renderPlayerProviderTabs(movie) {
  if (!playerSourceDropdown) return;
  if (!movie) {
    if (playerSourceBtn) playerSourceBtn.style.display = "none";
    playerSourceDropdown.classList.add("hidden");
    playerSourceDropdown.innerHTML = "";
    if (playerProviderTabs) { playerProviderTabs.classList.add("hidden"); playerProviderTabs.innerHTML = ""; }
    return;
  }

  if (playerSourceBtn) playerSourceBtn.style.display = "";
  const activeProvider = String(activePlaybackSession?.provider || getCurrentPlayerProvider()).toLowerCase();
  playerSourceDropdown.innerHTML = PLAYER_EMBED_PROVIDERS.map((provider) => `
    <button
      class="player-provider-tab${provider.id === activeProvider ? " is-active" : ""}"
      type="button"
      data-player-provider="${provider.id}"
    >${escapeHtml(provider.label)}</button>
  `).join("");

  playerSourceDropdown.querySelectorAll("[data-player-provider]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextProvider = String(button.dataset.playerProvider || "").toLowerCase();
      playerSourceDropdown.classList.add("hidden");
      if (!activePlaybackSession?.movie || !nextProvider || nextProvider === activePlaybackSession.provider) return;
      appPreferences.playerProvider = nextProvider;
      saveAppPreferences();
      activePlaybackSession.provider = nextProvider;
      setPlayerSandbox(nextProvider);
      playerFrame.src = buildPlayerEmbedUrl(activePlaybackSession.movie, {
        provider: nextProvider,
        season: activePlaybackSession.season,
        episode: activePlaybackSession.episode,
        progressSeconds: activePlaybackSession.basePositionSeconds
      });
      playerFrameWrap?.classList.remove("is-loaded");
      if (playerFrame.src) playerFrame.onload = () => playerFrameWrap?.classList.add("is-loaded");
      renderPlayerProviderTabs(activePlaybackSession.movie);
      renderPlayerContext(activePlaybackSession.movie);
    });
  });

  if (!playerSourceBtn._hasListener) {
    playerSourceBtn._hasListener = true;
    playerSourceBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      playerSourceDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", () => playerSourceDropdown.classList.add("hidden"));
  }
}

function renderPlayerContext(movie) {
  if (!playerContext) return;
  if (!movie) {
    playerContext.classList.add("hidden");
    playerContext.innerHTML = "";
    return;
  }

  const normalized = normalizeMovie(movie);
  if (!normalized) {
    playerContext.classList.add("hidden");
    playerContext.innerHTML = "";
    return;
  }

  const provider = PLAYER_EMBED_PROVIDERS.find((entry) => entry.id === (activePlaybackSession?.provider || getCurrentPlayerProvider()));
  const chips = [];
  const year = String(normalized.release_date || normalized.first_air_date || "").slice(0, 4);
  const runtime = Number(activePlaybackSession?.runtime || normalized.runtime || 0);
  const score = typeof normalized.vote_average === "number" && normalized.vote_average > 0
    ? normalized.vote_average.toFixed(1)
    : "";

  if (provider?.label) chips.push(provider.label);
  chips.push(getMediaType(normalized) === "tv" ? "Série" : "Filme");
  if (year) chips.push(year);
  if (runtime) chips.push(formatMinutesAsHours(runtime));
  if (score) chips.push(`★ ${score}`);
  if (getMediaType(normalized) === "tv") {
    chips.push(formatEpisodeLabel(activePlaybackSession?.season || normalized.selectedSeason || 1, activePlaybackSession?.episode || normalized.selectedEpisode || 1));
  }
  const overview = String(normalized.overview || "").trim();
  const backdrop = normalized.backdrop_path ? `${IMAGE_BASE_URL}${normalized.backdrop_path}` : "";
  const poster = normalized.poster_path ? `${POSTER_BASE_URL}${normalized.poster_path}` : PLACEHOLDER_POSTER;
  const progress = getPlayerProgress(normalized, activePlaybackSession || normalized);
  const nextEpisodeTarget = getMediaType(normalized) === "tv"
    ? getSeriesNextEpisodeTarget(normalized, {
        season: activePlaybackSession?.season || normalized.selectedSeason || 1,
        episode: activePlaybackSession?.episode || normalized.selectedEpisode || 1
      })
    : null;

  playerContext.classList.remove("hidden");
  playerContext.innerHTML = `
    <!-- Backdrop + poster -->
    <div class="player-ctx-poster-wrap">
      ${backdrop ? `<div class="player-ctx-backdrop" style="background-image:url('${backdrop}')"></div>` : `<div class="player-ctx-backdrop" style="background:#111118"></div>`}
      <img class="player-ctx-poster" src="${poster}" alt="${escapeHtml(normalized.title)}">
    </div>

    <!-- Info body -->
    <div class="player-ctx-body">
      <div class="player-ctx-title">${escapeHtml(normalized.title)}</div>

      <div class="player-ctx-meta">
        ${chips.map((chip, i) => `<span class="chip${i === 0 ? " chip-accent" : ""}" style="font-size:0.72rem;padding:3px 10px">${escapeHtml(chip)}</span>`).join("")}
      </div>

      ${overview ? `<p class="player-ctx-overview">${escapeHtml(overview)}</p>` : ""}

      <div class="player-ctx-divider"></div>

      <div class="player-ctx-stat">
        <span class="player-ctx-stat-label">Fonte</span>
        <span class="player-ctx-stat-value">${escapeHtml(provider?.label || "Embed")}</span>
      </div>

      <div class="player-ctx-stat">
        <span class="player-ctx-stat-label">Retoma em</span>
        <span class="player-ctx-stat-value">${progress?.positionSeconds ? formatProgressTime(progress.positionSeconds) : "Do início"}</span>
      </div>

      ${progress?.progressPercent ? `
        <div class="player-ctx-stat">
          <span class="player-ctx-stat-label">Progresso</span>
          <span class="player-ctx-stat-value">${progress.progressPercent}% visto</span>
        </div>
      ` : ""}

      ${nextEpisodeTarget ? `
        <div class="player-ctx-divider"></div>
        <div class="player-ctx-stat">
          <span class="player-ctx-stat-label">Próximo episódio</span>
          <span class="player-ctx-stat-value">${escapeHtml(formatEpisodeLabel(nextEpisodeTarget.season, nextEpisodeTarget.episode))}</span>
        </div>
        <button class="player-ctx-next-btn" type="button" data-player-series-action="next">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          Avançar episódio
        </button>
      ` : ""}
    </div>
  `;

  playerContext.querySelector('[data-player-series-action="next"]')?.addEventListener("click", () => {
    if (!nextEpisodeTarget) return;
    openPlayer({
      ...normalized,
      selectedSeason: nextEpisodeTarget.season,
      selectedEpisode: nextEpisodeTarget.episode,
      media_type: "tv"
    });
  });
}

// ── Popup monetization ───────────────────────────────────────
// Replace with your ad network popup URL when ready
const POPUP_AD_URL = ""; // e.g. "https://popads.net/show/xxxxx"
// Only fire popup on non-sandbox providers
function maybeFirePopupAd(provider) {
  if (!POPUP_AD_URL) return;
  if (SANDBOX_PROVIDERS.has(provider)) return;
  try {
    window.open(POPUP_AD_URL, "_blank", "noopener");
  } catch {}
}

function openPlayer(movie) {
  const normalized = normalizeMovie(movie);
  if (!normalized) return;
  const isTv = getMediaType(normalized) === "tv";
  const latestProgress = getLatestProgressForMedia(normalized);
  const season = isTv ? Math.max(1, Number(normalized.selectedSeason || latestProgress?.season || 1) || 1) : null;
  const episode = isTv ? Math.max(1, Number(normalized.selectedEpisode || latestProgress?.episode || 1) || 1) : null;
  const provider = getCurrentPlayerProvider();
  maybeFirePopupAd(provider);
  recordPlayback({ ...normalized, selectedSeason: season, selectedEpisode: episode, social_context: isTv ? formatEpisodeLabel(season, episode) : normalized.social_context });
  stopActivePlaybackTracking();
  const existingProgress = getPlayerProgress(normalized, { season, episode });
  activePlaybackSession = {
    movieId: normalized.id,
    movie: { ...normalized, selectedSeason: season, selectedEpisode: episode },
    runtime: Number(normalized.runtime) || Number(existingProgress?.runtime) || 0,
    basePositionSeconds: existingProgress?.positionSeconds || 0,
    sessionCount: (existingProgress?.sessionCount || 0) + 1,
    lastDevice: getCurrentDeviceLabel(),
    startedAt: Date.now(),
    intervalId: null,
    lastSyncedAt: 0,
    lastSyncedPositionSeconds: existingProgress?.positionSeconds || 0,
    lastSyncedProgressPercent: existingProgress?.progressPercent || 0,
    provider,
    season,
    episode
  };
  playerTitle.textContent = isTv ? `${normalized.title} — ${formatEpisodeLabel(season, episode)}` : normalized.title;
  renderPlayerProviderTabs(activePlaybackSession.movie);
  renderPlayerContext(activePlaybackSession.movie);
  setPlayerSandbox(provider);
  playerFrame.src = buildPlayerEmbedUrl(activePlaybackSession.movie, {
    provider,
    season,
    episode,
    progressSeconds: existingProgress?.positionSeconds || 0
  });
  playerFrameWrap?.classList.remove("is-loaded");
  if (playerFrame.src) playerFrame.onload = () => playerFrameWrap?.classList.add("is-loaded");
  renderPlayerProgressPanel(activePlaybackSession.movie);
  activePlaybackSession.intervalId = setInterval(() => {
    if (!activePlaybackSession || activePlaybackSession.movieId !== normalized.id) return;
    persistActivePlaybackProgress();
  }, PLAYER_AUTOSAVE_INTERVAL_MS);
  applyPlayerCinemaMode(appPreferences.cinemaMode);
  document.documentElement.classList.add("player-open");
  document.body.classList.add("player-open");
  playerOverlay.classList.remove("hidden");
  playerOverlay.setAttribute("aria-hidden", "false");
  document.addEventListener("keydown", handlePlayerShortcuts);
  stopSubtitles();
  if (getCurrentPath() === "/" || getCurrentPath() === "/historico" || getCurrentPath() === "/perfil") {
    handleRoute();
  }
}

function openTrailer(key, title) {
  stopActivePlaybackTracking();
  renderPlayerProgressPanel(null, { trailer: true });
  renderPlayerProviderTabs(null);
  renderPlayerContext(null);
  playerTitle.textContent = `${title} — Trailer`;
  setPlayerSandbox("youtube");
  playerFrame.src = `https://www.youtube.com/embed/${key}?autoplay=1`;
  playerFrameWrap?.classList.remove("is-loaded");
  if (playerFrame.src) playerFrame.onload = () => playerFrameWrap?.classList.add("is-loaded");
  applyPlayerCinemaMode(appPreferences.cinemaMode);
  document.documentElement.classList.add("player-open");
  document.body.classList.add("player-open");
  playerOverlay.classList.remove("hidden");
  playerOverlay.setAttribute("aria-hidden", "false");
  document.addEventListener("keydown", handlePlayerShortcuts);
}

function openLiveSportStream(match, stream) {
  const embedUrl = String(stream?.embedUrl || "").trim();
  const streamUrl = embedUrl || buildLiveSportStreamUrl(stream);
  if (!streamUrl) return;
  const usesEmbed = Boolean(embedUrl);

  stopActivePlaybackTracking();
  stopSubtitles();
  renderPlayerProgressPanel(null, { trailer: true });
  renderPlayerProviderTabs(null);
  playerTitle.textContent = `${match.title} — ${stream.label}`;
  playerContext.classList.remove("hidden");
  playerContext.innerHTML = `
    <div class="player-context-card">
      <div class="player-context-inner player-context-inner--sports">
        <div class="player-context-copy">
          <div class="player-context-topline">Desporto ao vivo</div>
          <div class="player-context-meta">
            <span class="chip chip-accent">${escapeHtml(match.sport)}</span>
            ${match.isLive ? '<span class="chip chip-accent">LIVE</span>' : ""}
            <span class="chip">${escapeHtml(stream.label)}</span>
            <span class="chip">${escapeHtml(match.sourceProvider || "Live")}</span>
            ${match.subtitle ? `<span class="chip">${escapeHtml(match.subtitle)}</span>` : ""}
          </div>
          <p class="player-context-overview">${escapeHtml(`${usesEmbed ? "Embed remoto aberto diretamente no iframe da app." : "Transmissão HLS integrada via proxy para evitar bloqueios de CORS no browser."} ${match.startTime ? `Evento ${formatLiveSportDate(match.startTime)}.` : ""}`)}</p>
        </div>
      </div>
    </div>
  `;
  setPlayerSandbox("live");
  playerFrame.src = usesEmbed
    ? streamUrl
    : `live-player.html?src=${encodeURIComponent(streamUrl)}&title=${encodeURIComponent(match.title)}`;
  playerFrameWrap?.classList.remove("is-loaded");
  if (playerFrame.src) playerFrame.onload = () => playerFrameWrap?.classList.add("is-loaded");
  applyPlayerCinemaMode(appPreferences.cinemaMode);
  document.documentElement.classList.add("player-open");
  document.body.classList.add("player-open");
  playerOverlay.classList.remove("hidden");
  playerOverlay.setAttribute("aria-hidden", "false");
  document.addEventListener("keydown", handlePlayerShortcuts);
}

function closePlayer() {
  if (playerOverlay.classList.contains("hidden")) return;
  if (activePlaybackSession?.movie) {
    persistActivePlaybackProgress();
  }
  if (document.fullscreenElement === playerFrameWrap || document.fullscreenElement === playerCard) {
    document.exitFullscreen().catch(() => {});
  }
  stopActivePlaybackTracking();
  stopSubtitles();
  playerOverlay.classList.add("hidden");
  playerOverlay.setAttribute("aria-hidden", "true");
  if (playerProgressPanel) {
    playerProgressPanel.classList.add("hidden");
    playerProgressPanel.innerHTML = "";
  }
  renderPlayerProviderTabs(null);
  renderPlayerContext(null);
  setPlayerSandbox("none");
  playerFrame.src = "";
  if (playerFrameWrap) {
    playerFrameWrap.classList.remove("is-player-fullscreen");
    playerFrameWrap.classList.remove("is-loaded");
  }
  document.removeEventListener("keydown", handlePlayerShortcuts);
  applyPlayerCinemaMode(false);
  document.documentElement.classList.remove("player-open");
  document.body.classList.remove("player-open");
}

function handlePlayerMessage(event) {
  if (!activePlaybackSession?.movie) return;

  let payload = event.data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return;
    }
  }

  if (!payload || typeof payload !== "object") return;

  let data = null;
  let mediaType = getMediaType(activePlaybackSession.movie);
  let mediaId = Number(activePlaybackSession.movie.id);
  let progressPercent = null;
  let currentTime = null;
  let durationSeconds = null;

  // CineSrc events
  if (payload.type === "cinesrc:timeupdate") {
    currentTime = Number(payload.currentTime);
    durationSeconds = Number(payload.duration);
    if (durationSeconds > 0) progressPercent = (currentTime / durationSeconds) * 100;
    data = { id: activePlaybackSession.movie?.id };
    mediaType = getMediaType(activePlaybackSession.movie);
    mediaId = Number(activePlaybackSession.movie?.id);
  } else if (payload.type === "cinesrc:nextepisode") {
    // Auto-next episode: update session to the new episode
    if (activePlaybackSession && payload.season != null && payload.episode != null) {
      activePlaybackSession.season = Number(payload.season);
      activePlaybackSession.episode = Number(payload.episode);
      if (activePlaybackSession.movie) {
        activePlaybackSession.movie.selectedSeason = activePlaybackSession.season;
        activePlaybackSession.movie.selectedEpisode = activePlaybackSession.episode;
      }
      renderPlayerProviderTabs(activePlaybackSession.movie);
    }
    return;
  } else if (payload.type === "PLAYER_EVENT" && payload.data) {
    data = payload.data;
    mediaType = data.mediaType === "tv" ? "tv" : "movie";
    mediaId = Number(data.id);
    progressPercent = Number(data.progress);
    currentTime = Number(data.currentTime);
    durationSeconds = Number(data.duration);
    syncSubtitlePlaybackState(data);
  } else if (payload.type === "MEDIA_DATA" && payload.data) {
    data = payload.data;
    mediaType = data.type === "tv" ? "tv" : "movie";
    mediaId = Number(data.id);
    const progress = data.progress || {};
    progressPercent = Number(progress.percent ?? progress.progress ?? progress.watchedPercent);
    currentTime = Number(progress.currentTime ?? progress.current ?? progress.position ?? progress.watched);
    durationSeconds = Number(progress.duration ?? progress.totalDuration ?? progress.length);
  } else {
    return;
  }

  if (mediaType !== getMediaType(activePlaybackSession.movie) || mediaId !== Number(activePlaybackSession.movie.id)) {
    return;
  }

  if (mediaType === "tv") {
    const previousSeason = activePlaybackSession.season;
    const previousEpisode = activePlaybackSession.episode;
    activePlaybackSession.season = Math.max(1, Number(data.season || activePlaybackSession.season || 1) || 1);
    activePlaybackSession.episode = Math.max(1, Number(data.episode || activePlaybackSession.episode || 1) || 1);
    activePlaybackSession.movie.selectedSeason = activePlaybackSession.season;
    activePlaybackSession.movie.selectedEpisode = activePlaybackSession.episode;
    playerTitle.textContent = `${activePlaybackSession.movie.title} — ${formatEpisodeLabel(activePlaybackSession.season, activePlaybackSession.episode)}`;
    if (previousSeason !== activePlaybackSession.season || previousEpisode !== activePlaybackSession.episode) {
      renderPlayerContext(activePlaybackSession.movie);
    }
  }

  if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
    activePlaybackSession.runtime = Math.max(1, Math.round(durationSeconds / 60));
  }
  if (Number.isFinite(currentTime) && currentTime >= 0) {
    activePlaybackSession.basePositionSeconds = Math.max(0, Math.round(currentTime));
    activePlaybackSession.startedAt = Date.now();
  }

  const now = Date.now();
  const safeProgressPercent = Number.isFinite(progressPercent) ? progressPercent : (activePlaybackSession.lastSyncedProgressPercent || 0);
  const positionDelta = Math.abs((activePlaybackSession.basePositionSeconds || 0) - (activePlaybackSession.lastSyncedPositionSeconds || 0));
  const progressDelta = Math.abs(safeProgressPercent - (activePlaybackSession.lastSyncedProgressPercent || 0));
  const shouldPersist =
    !activePlaybackSession.lastSyncedAt
    || (now - activePlaybackSession.lastSyncedAt) >= 5000
    || positionDelta >= 10
    || progressDelta >= 5;

  if (!shouldPersist) {
    return;
  }

  savePlaybackProgress(activePlaybackSession.movie, activePlaybackSession.basePositionSeconds, activePlaybackSession.runtime, {
    sessionCount: activePlaybackSession.sessionCount,
    lastDevice: activePlaybackSession.lastDevice,
    progressPercent: safeProgressPercent,
    season: activePlaybackSession.season,
    episode: activePlaybackSession.episode
  });
  activePlaybackSession.lastSyncedAt = now;
  activePlaybackSession.lastSyncedPositionSeconds = activePlaybackSession.basePositionSeconds || 0;
  activePlaybackSession.lastSyncedProgressPercent = safeProgressPercent;
  renderPlayerProgressPanel(activePlaybackSession.movie);
}

// ─── Helpers ─────────────────────────────────────────────────
async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro ao carregar dados.");
  return data;
}

function withTimeout(promise, ms, message) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

function buildProfileSummary() {
  const email = currentUser?.email || "Conta MimiFlix";
  const name = getUserDisplayName(email);
  const badgeSummary = syncBadgeUnlocks();
  const ratedFavorites = favsCache.filter((movie) => typeof movie.vote_average === "number" && movie.vote_average > 0);
  const ratedReviews = personalReviewsCache.filter((entry) => typeof entry.rating === "number" && entry.rating > 0);
  const averageRating = ratedFavorites.length
    ? (ratedFavorites.reduce((sum, movie) => sum + movie.vote_average, 0) / ratedFavorites.length).toFixed(1)
    : "—";
  const averagePersonalRating = ratedReviews.length
    ? (ratedReviews.reduce((sum, entry) => sum + entry.rating, 0) / ratedReviews.length).toFixed(1)
    : "—";
  const languages = [...new Set(favsCache.map((movie) => String(movie.original_language || "").toUpperCase()).filter(Boolean))];
  const years = favsCache
    .map((movie) => Number.parseInt(String(movie.release_date || "").slice(0, 4), 10))
    .filter((year) => Number.isFinite(year));
  const spotlight = [...favsCache].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))[0] || null;

  return {
    initial: getAvatarFallbackText(email),
    avatarImage: profilePrefs.avatarImage || "",
    name,
    email,
    memberSince: formatDate(currentUser?.created_at),
    language: getLanguage().toUpperCase(),
    spotlight,
    stats: [
      {
        label: "Favoritos",
        value: String(favsCache.length),
        note: favsCache.length ? "Filmes guardados na tua lista" : "Ainda sem titulos guardados"
      },
      {
        label: "Watchlist",
        value: String(watchlistCache.length),
        note: watchlistCache.length ? "Titulos guardados para ver depois" : "Ainda sem filmes para ver depois"
      },
      {
        label: "Historico",
        value: String(historyCache.length),
        note: historyCache.length ? "Filmes iniciados no player" : "Ainda sem sessoes de visualizacao"
      },
      {
        label: "Continuar",
        value: String(continueWatchingCache.length),
        note: continueWatchingCache.length ? "Retomas rapidas disponiveis" : "Nada pendente para retomar"
      },
      {
        label: "Nota media",
        value: averageRating === "—" ? averageRating : `${averageRating} / 10`,
        note: ratedFavorites.length ? "Qualidade media dos teus favoritos" : "Guarda filmes para gerar media"
      },
      {
        label: "Reviews",
        value: String(personalReviewsCache.length),
        note: personalReviewsCache.length ? "Notas pessoais e comentarios guardados" : "Ainda sem reviews pessoais"
      },
      {
        label: "Tua nota",
        value: averagePersonalRating === "—" ? averagePersonalRating : `${averagePersonalRating} / 10`,
        note: ratedReviews.length ? "Media das tuas notas pessoais" : "Dá notas para criar a tua media"
      },
      {
        label: "Retomas",
        value: String(playerProgressCache.length),
        note: playerProgressCache.length ? "Posições guardadas no player" : "Ainda sem progresso guardado"
      },
      {
        label: "Periodo",
        value: years.length ? `${Math.min(...years)} - ${Math.max(...years)}` : "—",
        note: years.length ? "Amplitude temporal da tua colecao" : "Sem datas suficientes"
      }
    ],
    highlights: buildProfileHighlights({ favorites: favsCache, languages, spotlight, averageRating, years, reviews: personalReviewsCache, averagePersonalRating }),
    reviews: personalReviewsCache.slice(0, 4),
    badges: badgeSummary.badges,
    badgeSummary
  };
}

function buildProfileHighlights({ favorites, languages, spotlight, averageRating, years, reviews, averagePersonalRating }) {
  const highlights = [];

  if (!favorites.length) {
    highlights.push("Ainda nao tens favoritos guardados, por isso este perfil vai ganhar vida assim que começares a marcar filmes.");
  } else {
    highlights.push(`Ja tens ${favorites.length} filme${favorites.length === 1 ? "" : "s"} favorito${favorites.length === 1 ? "" : "s"} guardado${favorites.length === 1 ? "" : "s"}.`);
  }

  if (spotlight) {
    highlights.push(`O teu destaque atual e "${spotlight.title}", o favorito com melhor classificacao na tua lista.`);
  }

  if (languages.length) {
    highlights.push(`A tua lista passa por ${languages.length} idioma${languages.length === 1 ? "" : "s"} original${languages.length === 1 ? "" : "ais"}, o que mostra algum ecletismo.`);
  }

  if (averageRating !== "—") {
    highlights.push(`A nota media dos teus favoritos esta nos ${averageRating}/10, por isso a tua watchlist esta exigente.`);
  }

  if (reviews.length) {
    highlights.push(`Ja escreveste ${reviews.length} review${reviews.length === 1 ? "" : "s"} pessoal${reviews.length === 1 ? "" : "s"} e a tua nota media anda pelos ${averagePersonalRating}/10.`);
  }

  if (playerProgressCache.length) {
    highlights.push(`Tens ${playerProgressCache.length} filme${playerProgressCache.length === 1 ? "" : "s"} com progresso real guardado para retoma rápida.`);
  }

  if (followedProfilesCache.length) {
    highlights.push(`Já segues ${followedProfilesCache.length} perfil${followedProfilesCache.length === 1 ? "" : "s"} para descobrir favoritos e listas partilhadas.`);
  }

  if (years.length) {
    highlights.push(`Tens filmes espalhados entre ${Math.min(...years)} e ${Math.max(...years)}.`);
  }

  return highlights.slice(0, 4);
}

function renderBadgeOverview(summary, options = {}) {
  const badges = (summary?.badges || []).slice(0, options.limit || 4);
  const nextBadge = summary?.nextBadge || null;

  return `
    <div class="badge-overview">
      <div class="badge-overview-copy">
        <strong>${summary?.earnedCount || 0} de ${BADGE_DEFINITIONS.length} desbloqueadas</strong>
        <p>${nextBadge ? `A próxima é "${escapeHtml(nextBadge.title)}" (${Math.min(nextBadge.current, nextBadge.target)}/${nextBadge.target}).` : "Já desbloqueaste todas as conquistas atuais."}</p>
      </div>
      <div class="badge-mini-grid">
        ${badges.map((badge) => `
          <article class="badge-mini-card ${badge.earned ? "is-earned" : ""}">
            <span class="badge-mini-icon" aria-hidden="true">${badge.icon}</span>
            <div>
              <strong>${escapeHtml(badge.title)}</strong>
              <small>${badge.earned ? "Desbloqueada" : `${Math.min(badge.current, badge.target)}/${badge.target}`}</small>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

function renderBadgeCards(badges) {
  return `
    <div class="badge-grid">
      ${badges.map((badge) => `
        <article class="badge-card ${badge.earned ? "is-earned" : ""}">
          <div class="badge-card-head">
            <div class="badge-icon" aria-hidden="true">${badge.icon}</div>
            <div>
              <h3 class="badge-title">${escapeHtml(badge.title)}</h3>
              <p class="badge-copy">${escapeHtml(badge.description)}</p>
            </div>
          </div>
          <div class="badge-meta">
            <span class="chip ${badge.earned ? "chip-accent" : ""}">${badge.earned ? "Desbloqueada" : "Em progresso"}</span>
            <span class="badge-progress-copy">${badge.earned ? "Objetivo concluído" : `${Math.min(badge.current, badge.target)}/${badge.target}`}</span>
          </div>
          <div class="badge-progress-track" aria-hidden="true">
            <span class="badge-progress-fill" style="width:${badge.progressPercent}%"></span>
          </div>
          <p class="badge-footnote">${badge.earned ? "Conquista guardada na tua conta." : badge.remaining === 1 ? "Falta só mais 1 passo." : `Faltam ${badge.remaining} passos.`}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderProfileSpotlight(movie) {
  if (!movie) {
    return `
      <div class="empty-state profile-empty-state">
        Marca alguns filmes como favoritos para desbloquear o teu destaque pessoal.
      </div>
    `;
  }

  const poster = movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : PLACEHOLDER_POSTER;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";

  return `
    <div class="profile-spotlight">
      <img class="profile-spotlight-poster" src="${poster}" alt="${escapeHtml(movie.title)}">
      <div class="profile-spotlight-copy">
        <h4 class="profile-spotlight-title">${escapeHtml(movie.title)}</h4>
        <div class="hero-meta">
          <span class="chip">${escapeHtml(year)}</span>
          ${typeof movie.vote_average === "number" && movie.vote_average > 0 ? `<span class="chip chip-accent">&#9733; ${movie.vote_average.toFixed(1)}</span>` : ""}
          ${movie.original_language ? `<span class="chip">${escapeHtml(String(movie.original_language).toUpperCase())}</span>` : ""}
        </div>
        <p class="profile-spotlight-overview">${escapeHtml(movie.overview || "Sem sinopse disponivel.")}</p>
        <div class="profile-actions">
          <button class="accent-btn" type="button" data-open-favorite-id="${movie.id}">Ver detalhes</button>
          <button class="secondary-btn" type="button" data-profile-action="favoritos">Abrir lista</button>
        </div>
      </div>
    </div>
  `;
}

function renderProfileReviews(reviews) {
  if (!reviews.length) {
    return `
      <div class="empty-state profile-empty-state">
        Abre um filme e guarda a tua primeira review para começares a construir o teu gosto pessoal.
      </div>
    `;
  }

  return `
    <div class="profile-review-list">
      ${reviews.map((entry) => `
        <article class="profile-review-card">
          <div class="profile-review-head">
            <div>
              <h4 class="profile-review-title">${escapeHtml(entry.movie.title)}</h4>
              <p class="profile-review-meta">${escapeHtml(formatShortDateTime(entry.updatedAt))}</p>
            </div>
            ${entry.rating ? `<span class="chip chip-accent">${entry.rating}/10</span>` : ""}
          </div>
          ${entry.review ? `<p class="profile-review-copy">${escapeHtml(entry.review)}</p>` : `<p class="profile-review-copy is-muted">Guardaste apenas uma nota sem comentario.</p>`}
          <div class="profile-actions">
            <button class="secondary-btn" type="button" data-open-review-id="${entry.movieId}">Abrir filme</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function getUserDisplayName(email) {
  if (profilePrefs.displayName) {
    return profilePrefs.displayName;
  }
  const localPart = String(email || "perfil").split("@")[0].replace(/[._-]+/g, " ").trim();
  return localPart
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Perfil";
}

function formatDate(value) {
  if (!value) return "agora";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "agora";
  return new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(date);
}

function formatShortDateTime(value) {
  if (!value) return "Agora mesmo";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Agora mesmo";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function formatWatchTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Visto recentemente";

  return `Visto ${new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)}`;
}

function buildMetaHtml(movie, includeGenres = false) {
  const chips = [];
  const dot = '<span class="chip chip-dot">•</span>';

  // IMDb rating badge
  if (typeof movie.vote_average === "number" && movie.vote_average > 0)
    chips.push(`<span class="chip chip-imdb">IMDb ${movie.vote_average.toFixed(1)}</span>`);

  if (chips.length) chips.push(dot);

  // Seasons or movie
  if (getMediaType(movie) === "tv") {
    if (movie.number_of_seasons)
      chips.push(`<span class="chip">${movie.number_of_seasons} Temporada${movie.number_of_seasons === 1 ? "" : "s"}</span>`);
    else
      chips.push('<span class="chip">Série</span>');
    chips.push(dot);
  }

  // Year
  if (movie.release_date) {
    chips.push(`<span class="chip">${escapeHtml(movie.release_date.slice(0, 4))}</span>`);
    chips.push(dot);
  }

  // Language
  if (movie.original_language)
    chips.push(`<span class="chip">${escapeHtml(String(movie.original_language).toUpperCase())}</span>`);

  // Genres (detail view)
  if (includeGenres && Array.isArray(movie.genres)) {
    const _mediaT = (movie.media_type === "tv" || movie.first_air_date) ? "tv" : "movie";
    const _genreList = _mediaT === "tv" ? DISCOVER_TV_GENRES : DISCOVER_GENRES;
    movie.genres.slice(0, 3).forEach((g) => {
      const found = _genreList.find(x => x.name.toLowerCase() === String(g).toLowerCase());
      chips.push(found
        ? `<a class="chip genre-tag" href="#/genero/${found.id}/${_mediaT}">${escapeHtml(g)}</a>`
        : `<span class="chip">${escapeHtml(g)}</span>`);
    });
  }

  // Remove trailing dot
  if (chips.length && chips[chips.length - 1].includes("chip-dot")) chips.pop();

  return chips.join("");
}

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function pageHeader(title) {
  const el = document.createElement("div");
  el.className = "page-header";
  el.innerHTML = `<h1 class="page-title">${escapeHtml(title)}</h1>`;
  return el;
}

function renderSpinner() {
  const cards = Array.from({length: 6}, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-poster"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-meta"></div>
    </div>
  `).join("");
  return `
    <div class="skeleton-section">
      <div class="skeleton skeleton-section-title"></div>
      <div class="skeleton-row">${cards}</div>
    </div>
    <div class="skeleton-section">
      <div class="skeleton skeleton-section-title"></div>
      <div class="skeleton-row">${cards}</div>
    </div>
  `;
}
function errorState(msg) { return `<div class="empty-state">Erro: ${escapeHtml(msg)}</div>`; }

// ─── Event listeners ─────────────────────────────────────────
function runSearch() {
  const q = searchInput.value.trim();
  if (!q) return;
  hideSearchSuggestions();
  sessionStorage.setItem("mf_search_query", q);
  navigateTo("/pesquisa");
}

searchBtn?.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(); });
function openSearchOverlay() {
  searchOverlay?.classList.remove("hidden");
  searchOverlay?.setAttribute("aria-hidden", "false");
  document.getElementById("searchInput")?.focus();
}

searchToggleBtn?.addEventListener("click", openSearchOverlay);

// Mobile bottom nav search tab — open overlay instead of navigating
document.querySelector('.mobile-bottom-link[data-route="/pesquisa"]')?.addEventListener("click", (e) => {
  e.preventDefault();
  setTimeout(() => openSearchOverlay(), 0);
});
searchCloseBtn?.addEventListener("click", () => {
  searchOverlay?.classList.add("hidden");
  searchOverlay?.setAttribute("aria-hidden", "true");
});
notificationsBtn?.addEventListener("click", async (event) => {
  event.stopPropagation();
  await refreshNotifications({ force: true });
  const shouldOpen = notificationsPanel.classList.contains("hidden");
  notificationsPanel.classList.toggle("hidden", !shouldOpen);
  notificationsPanel.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
});
reloadBtn?.addEventListener("click", () => {
  localStorage.setItem("tmdb_language", getLanguage());
  catalogCache = null;
  calendarCache = { key: "", sections: [] };
  smartCollectionsCache = { key: "", sections: [] };
  invalidateLiveSportsCache();
  favoriteRecommendationsCache = { key: "", results: [] };
  upcomingReleaseAlertsCache = { key: "", results: [] };
  handleRoute();
});

heroPlayBtn.addEventListener("click", () => { if (featuredMovie) openPlayer(featuredMovie); });
heroInfoBtn.addEventListener("click", () => { if (featuredMovie) openDetails(featuredMovie); });

// Hero swipe (mobile)
const heroSection = document.getElementById("hero");
if (heroSection) {
  let _swipeStartX = 0;
  heroSection.addEventListener("touchstart", (e) => { _swipeStartX = e.touches[0].clientX; }, { passive: true });
  heroSection.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - _swipeStartX;
    if (Math.abs(dx) < 40) return;
    if (!heroRotationList.length) return;
    if (dx < 0) {
      const next = (heroRotationIndex + 1) % heroRotationList.length;
      goToHeroSlide(next); resetHeroRotationTimer();
    } else {
      const prev = (heroRotationIndex - 1 + heroRotationList.length) % heroRotationList.length;
      goToHeroSlide(prev); resetHeroRotationTimer();
    }
  }, { passive: true });
}

// Mobile: tap anywhere on hero card to play
if (heroSection) {
  heroSection.addEventListener("click", (e) => {
    if (!document.body.classList.contains("mobile-ui")) return;
    if (e.target.closest(".hero-dots")) return;
    if (featuredMovie) openPlayer(featuredMovie);
  });
}

// Mobile detail: sticky Watch Now button
const detailMobileWatchBtn = document.getElementById("detailMobileWatchBtn");
if (detailMobileWatchBtn) {
  detailMobileWatchBtn.addEventListener("click", () => { if (selectedMovie) openPlayer(selectedMovie); });
}

// Mobile detail: bookmark button (top-right)
const detailMobileBookmarkBtn = document.getElementById("detailMobileBookmarkBtn");
if (detailMobileBookmarkBtn) {
  detailMobileBookmarkBtn.addEventListener("click", () => {
    if (!selectedMovie) return;
    toggleWatchlist(selectedMovie);
    const inWL = isInWatchlist(selectedMovie);
    detailMobileBookmarkBtn.classList.toggle("is-saved", inWL);
    // Sync the hidden desktop button state too
    detailWatchlistBtn.classList.toggle("is-fav", inWL);
    detailWatchlistBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${inWL ? '<polyline points="20 6 9 17 4 12"/>' : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}</svg> Watchlist`;
  });
}


// Hub logo items — click searches by studio
document.querySelectorAll(".hub-item[data-hub]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const hub = btn.dataset.hub;
    const queries = { netflix: "Netflix", disney: "Disney", marvel: "Marvel", hbo: "HBO", prime: "Prime Video", apple: "Apple TV", pixar: "Pixar", starwars: "Star Wars", natgeo: "National Geographic" };
    const q = queries[hub];
    if (q) {
      const inp = document.getElementById("searchInput");
      if (inp) inp.value = q;
      sessionStorage.setItem("mf_search_query", q);
      navigateTo("/pesquisa");
    }
  });
});
detailPlayBtn.addEventListener("click", () => { if (selectedMovie) openPlayer(selectedMovie); });
detailTrailerBtn.addEventListener("click", () => {
  const key = detailTrailerBtn.dataset.key;
  if (key && selectedMovie) openTrailer(key, selectedMovie.title);
});
detailFavBtn.addEventListener("click", () => { if (selectedMovie) toggleFavorite(selectedMovie); });
detailWatchlistBtn.addEventListener("click", () => { if (selectedMovie) toggleWatchlist(selectedMovie); });
detailListBtn.addEventListener("click", () => { if (selectedMovie) showListPickerForMovie(selectedMovie); });
detailCloseBtn.addEventListener("click", closeDetails);
detailCloseFooterBtn.addEventListener("click", closeDetails);
playerFullscreenBtn?.addEventListener("click", () => { togglePlayerFullscreen().catch(() => {}); });
playerCloseBtn.addEventListener("click", closePlayer);
detailModal.addEventListener("click", (e) => {
  if (e.target === detailModal && !detailModal.classList.contains("detail-route-shell")) closeDetails();
});
playerOverlay.addEventListener("click", (e) => { if (e.target === playerOverlay) closePlayer(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDetails(); closePlayer(); closeAuthModal(); } });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && activePlaybackSession?.movie) {
    persistActivePlaybackProgress();
  }
});
window.addEventListener("pagehide", () => {
  if (activePlaybackSession?.movie) {
    persistActivePlaybackProgress();
  }
});
searchInput.addEventListener("input", () => {
  clearTimeout(searchSuggestionsTimer);
  searchSuggestionsTimer = setTimeout(updateSearchSuggestions, 220);
});
searchInput.addEventListener("focus", () => { if (searchInput.value.trim().length >= 2) updateSearchSuggestions(); });
searchInput.addEventListener("blur", () => { setTimeout(hideSearchSuggestions, 180); });
themeToggleBtn.addEventListener("click", () => applyTheme(appPreferences.theme === "light" ? "dark" : "light"));
languageSelect.addEventListener("change", () => {
  languageInput.value = languageSelect.value;
  localStorage.setItem("tmdb_language", getLanguage());
  catalogCache = null;
  calendarCache = { key: "", sections: [] };
  smartCollectionsCache = { key: "", sections: [] };
  invalidateLiveSportsCache();
  favoriteRecommendationsCache = { key: "", results: [] };
  upcomingReleaseAlertsCache = { key: "", results: [] };
  handleRoute();
});
document.addEventListener("click", (event) => {
  if (notificationsPanel && notificationsBtn && !notificationsPanel.classList.contains("hidden")) {
    const target = event.target;
    if (target !== notificationsBtn && !notificationsBtn.contains(target) && !notificationsPanel.contains(target)) {
      notificationsPanel.classList.add("hidden");
      notificationsPanel.setAttribute("aria-hidden", "true");
    }
  }
});

// ─── PWA Service Worker ───────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// ─── Init ─────────────────────────────────────────────────────
window.addEventListener("message", handlePlayerMessage);
window.addEventListener("hashchange", handleRoute);

// ─── Lenis Smooth Scroll ──────────────────────────────────────
let lenis = null;

function initLenis() {
  if (typeof Lenis === "undefined") return;
  // Skip on mobile/touch — native momentum scroll is already smooth
  if (window.matchMedia("(pointer: coarse)").matches) return;

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    orientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// Pause Lenis when a modal is open so the modal can scroll normally
function lenisStop() { lenis?.stop(); }
function lenisStart() { lenis?.start(); }

// Observe modal open/close to pause/resume.
// detail-route-shell is a full page (not a blocking overlay) — don't pause for it.
const _modalObserver = new MutationObserver(() => {
  const anyOpen = !!document.querySelector(".modal:not(.hidden):not(.detail-route-shell)");
  if (anyOpen) lenisStop(); else lenisStart();
});
_modalObserver.observe(document.body, { subtree: true, childList: false, attributes: true, attributeFilter: ["class"] });

initLenis();
if (typeof mobileViewportQuery.addEventListener === "function") {
  mobileViewportQuery.addEventListener("change", syncViewportMode);
} else if (typeof mobileViewportQuery.addListener === "function") {
  mobileViewportQuery.addListener(syncViewportMode);
}
loadLibraryState();
syncViewportMode();
applyTheme(appPreferences.theme);

(async () => {
  handleRoute();
  try {
    await initSupabase();
  } catch (err) {
    console.warn("Auth init:", err);
  } finally {
    handleRoute();
  }
})();
