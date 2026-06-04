const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const zlib = require("zlib");
const { URL } = require("url");

const env = loadEnvFile(path.join(__dirname, ".env"));
const PORT = Number(process.env.PORT || env.PORT || 3002);
const TMDB_API_KEY = env.TMDB_API_KEY || process.env.TMDB_API_KEY;
const DEFAULT_LANGUAGE = env.TMDB_LANGUAGE || process.env.TMDB_LANGUAGE || "pt-PT";
const SUPABASE_URL = env.SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const OPENSUBTITLES_API_KEY = env.OPENSUBTITLES_API_KEY || process.env.OPENSUBTITLES_API_KEY || "";
const OPENSUBTITLES_USERNAME = env.OPENSUBTITLES_USERNAME || process.env.OPENSUBTITLES_USERNAME || "";
const OPENSUBTITLES_PASSWORD = env.OPENSUBTITLES_PASSWORD || process.env.OPENSUBTITLES_PASSWORD || "";
const OPENSUBTITLES_USER_AGENT = "MimiFlix v1.0";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const OPENSUBTITLES_BASE = "https://api.opensubtitles.com/api/v1";
const VIPSTREAMED_API_BASE = env.VIPSTREAMED_API_BASE_URL || process.env.VIPSTREAMED_API_BASE_URL || "https://api.vipstreamed.live/api";
const WATCHFOOTY_API_BASE = env.WATCHFOOTY_API_BASE_URL || process.env.WATCHFOOTY_API_BASE_URL || "https://api.watchfooty.st/api/v1";
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const LIBRARY_STATE_DIR = path.join(DATA_DIR, "library-state");
const SUBTITLES_CACHE_DIR = path.join(DATA_DIR, "subtitles");
const LOCAL_SUBTITLES_DIR = path.join(__dirname, "srt");
const LIBRARY_STATE_TABLE = "library_states";
const TMDB_DISCOVER_PAGE_SIZE = 20;
const APP_DISCOVER_PAGE_SIZE = 40;
const WATCHFOOTY_SPORTS = [
  { slug: "football", label: "Soccer", aliases: ["football", "soccer"] },
  { slug: "basketball", label: "Basketball", aliases: ["basketball"] },
  { slug: "tennis", label: "Tennis", aliases: ["tennis"] },
  { slug: "golf", label: "Golf", aliases: ["golf"] },
  { slug: "baseball", label: "Baseball", aliases: ["baseball"] },
  { slug: "hockey", label: "Hockey", aliases: ["hockey", "ice hockey"] },
  { slug: "rugby", label: "Rugby", aliases: ["rugby"] },
  { slug: "motorsport", label: "Motorsport", aliases: ["motorsport", "motor racing", "f1"] },
  { slug: "cricket", label: "Cricket", aliases: ["cricket"] },
  { slug: "boxing", label: "Boxing", aliases: ["boxing"] },
  { slug: "mma", label: "MMA (Mixed Martial Arts)", aliases: ["mma", "mixed martial arts", "ufc"] }
];

const CATALOG_SECTIONS = [
  { id: "popular", title: "Em alta", endpoint: "/movie/popular", mediaType: "movie" },
  { id: "top-rated", title: "Mais bem classificados", endpoint: "/movie/top_rated", mediaType: "movie" },
  { id: "now-playing", title: "Nos cinemas", endpoint: "/movie/now_playing", mediaType: "movie" },
  { id: "upcoming", title: "A chegar", endpoint: "/movie/upcoming", mediaType: "movie" },
  { id: "series-popular", title: "Séries em alta", endpoint: "/tv/popular", mediaType: "tv" },
  { id: "series-top-rated", title: "Séries obrigatórias", endpoint: "/tv/top_rated", mediaType: "tv" },
  { id: "series-airing", title: "A dar agora", endpoint: "/tv/airing_today", mediaType: "tv" },
  { id: "action", title: "Ação", endpoint: "/discover/movie", mediaType: "movie", params: { with_genres: "28", sort_by: "popularity.desc" } },
  { id: "comedy", title: "Comédia", endpoint: "/discover/movie", mediaType: "movie", params: { with_genres: "35", sort_by: "popularity.desc" } },
  { id: "horror", title: "Terror", endpoint: "/discover/movie", mediaType: "movie", params: { with_genres: "27", sort_by: "popularity.desc" } },
  { id: "scifi", title: "Ficção Científica", endpoint: "/discover/movie", mediaType: "movie", params: { with_genres: "878", sort_by: "popularity.desc" } }
];
const SMART_COLLECTIONS = [
  {
    id: "sci-fi-90s",
    title: "Melhores sci-fi dos anos 90",
    endpoint: "/discover/movie",
    params: {
      with_genres: "878",
      "primary_release_date.gte": "1990-01-01",
      "primary_release_date.lte": "1999-12-31",
      sort_by: "vote_average.desc",
      "vote_count.gte": "350"
    }
  },
  {
    id: "short-tonight",
    title: "Filmes curtos para hoje",
    endpoint: "/discover/movie",
    params: {
      "with_runtime.lte": "100",
      sort_by: "popularity.desc",
      "vote_count.gte": "250"
    }
  },
  {
    id: "thrillers-pt",
    title: "Thrillers em português",
    endpoint: "/discover/movie",
    params: {
      with_genres: "53",
      with_original_language: "pt",
      sort_by: "popularity.desc",
      "vote_count.gte": "40"
    }
  },
  {
    id: "feel-good-sunday",
    title: "Domingo descontraído",
    endpoint: "/discover/movie",
    params: {
      with_genres: "35,10751",
      sort_by: "popularity.desc",
      "vote_count.gte": "180"
    }
  },
  {
    id: "modern-masterpieces",
    title: "Clássicos modernos",
    endpoint: "/discover/movie",
    params: {
      "primary_release_date.gte": "2010-01-01",
      sort_by: "vote_average.desc",
      "vote_count.gte": "900"
    }
  },
  {
    id: "heist-night",
    title: "Golpes e assaltos de alto nível",
    endpoint: "/discover/movie",
    params: {
      with_genres: "80,53",
      sort_by: "popularity.desc",
      "vote_count.gte": "250"
    }
  },
  {
    id: "animated-gems",
    title: "Animação para ver em maratona",
    endpoint: "/discover/movie",
    params: {
      with_genres: "16,12,10751",
      sort_by: "vote_average.desc",
      "vote_count.gte": "220"
    }
  },
  {
    id: "mystery-sci-fi",
    title: "Mistério e sci-fi que puxam pela cabeça",
    endpoint: "/discover/movie",
    params: {
      with_genres: "878,9648",
      sort_by: "vote_average.desc",
      "vote_count.gte": "260"
    }
  },
  {
    id: "prestige-drama-2000s",
    title: "Dramas de prestígio dos anos 2000",
    endpoint: "/discover/movie",
    params: {
      with_genres: "18",
      "primary_release_date.gte": "2000-01-01",
      "primary_release_date.lte": "2009-12-31",
      sort_by: "vote_average.desc",
      "vote_count.gte": "300"
    }
  }
];
const PROFILE_COLLECTION_BLUEPRINTS = [
  { id: "profile-match", title: "Mais a tua cara" },
  { id: "profile-short", title: "Boa escolha para hoje" },
  { id: "profile-premium", title: "Qualidade garantida" }
];
const PORTUGAL_TOP_TEN_SECTION = {
  id: "top10-portugal",
  title: "Top 10 em Portugal hoje",
  endpoint: "/discover/movie",
  params: {
    region: "PT",
    watch_region: "PT",
    sort_by: "popularity.desc",
    "vote_count.gte": "120"
  }
};
const REAL_COLLECTIONS = [
  { id: "mcu", title: "Marvel Cinematic Universe", type: "collection", collectionId: 86311, description: "Saga cronológica do MCU." },
  { id: "harry-potter", title: "Harry Potter", type: "collection", collectionId: 1241, description: "A jornada completa de Hogwarts." },
  { id: "lord-of-the-rings", title: "O Senhor dos Anéis", type: "collection", collectionId: 119, description: "A trilogia épica da Terra-média em ordem." },
  { id: "star-wars", title: "Star Wars", type: "collection", collectionId: 10, description: "Saga principal em ordem de estreia para maratona galáctica." },
  { id: "indiana-jones", title: "Indiana Jones", type: "collection", collectionId: 84, description: "A aventura clássica de Indy numa fila limpa." },
  { id: "mission-impossible", title: "Missão: Impossível", type: "collection", collectionId: 87359, description: "Operações consecutivas para uma maratona de ação." },
  { id: "back-to-the-future", title: "Regresso ao Futuro", type: "collection", collectionId: 264, description: "Trilogia perfeita para ver de uma vez." },
  { id: "james-bond", title: "James Bond", type: "collection", collectionId: 645, description: "Missões icónicas do 007 reunidas numa coleção viva." },
  { id: "matrix", title: "Matrix", type: "collection", collectionId: 2344, description: "Sci-fi filosófico para rever em sequência." },
  { id: "nolan", title: "Christopher Nolan", type: "discover", params: { with_crew: "525", sort_by: "primary_release_date.asc", "vote_count.gte": "80" }, description: "Filmografia essencial de Nolan por ordem." },
  { id: "pixar", title: "Pixar Animation", type: "discover", params: { with_companies: "3", with_genres: "16", sort_by: "primary_release_date.asc", "vote_count.gte": "60" }, description: "Longas da Pixar por ordem de estreia." },
  { id: "fast-furious", title: "Velocidade Furiosa", type: "collection", collectionId: 9485, description: "A saga completa de corridas e família em ordem." },
  { id: "john-wick", title: "John Wick", type: "collection", collectionId: 404609, description: "A trilogia do assassino mais letal de sempre." },
  { id: "jurassic-park", title: "Jurassic Park", type: "collection", collectionId: 328, description: "Dinossauros e caos, desde o parque original ao mundo jurássico." },
  { id: "pirates-caribbean", title: "Piratas das Caraíbas", type: "collection", collectionId: 295, description: "As aventuras de Jack Sparrow nos mares do Caribe." },
  { id: "toy-story", title: "Toy Story", type: "collection", collectionId: 10194, description: "A saga completa de Woody, Buzz e amigos." },
  { id: "shrek", title: "Shrek", type: "collection", collectionId: 2150, description: "O ogre verde e os seus amigos em ordem." },
  { id: "how-train-dragon", title: "Como Treinar o Teu Dragão", type: "collection", collectionId: 89137, description: "Soluço e Banguela numa trilogia épica." },
  { id: "hunger-games", title: "Jogos da Fome", type: "collection", collectionId: 131635, description: "A saga completa de Katniss Everdeen." },
  { id: "alien", title: "Alien", type: "collection", collectionId: 8091, description: "O universo Alien desde o original até Prometheus." },
  { id: "terminator", title: "Exterminador Implacável", type: "collection", collectionId: 528, description: "A saga do T-800 desde os anos 80." },
  { id: "rocky", title: "Rocky & Creed", type: "collection", collectionId: 1575, description: "A jornada de Rocky Balboa e Apollo Creed." },
  { id: "kung-fu-panda", title: "Kung Fu Panda", type: "collection", collectionId: 77816, description: "Po e os Cinco Furiosos em ordem." },
  { id: "avatar", title: "Avatar", type: "collection", collectionId: 87096, description: "O universo de Pandora em ordem." },
  { id: "hobbit", title: "O Hobbit", type: "collection", collectionId: 121938, description: "A trilogia de Bilbo Baggins antes do Senhor dos Anéis." },
  { id: "x-men", title: "X-Men", type: "collection", collectionId: 748, description: "A saga completa dos mutantes da Marvel." },
  { id: "spider-man-homecoming", title: "Spider-Man (MCU)", type: "collection", collectionId: 531241, description: "A trilogia do Homem-Aranha no MCU." },
  { id: "dark-knight", title: "A Trilogia Dark Knight", type: "collection", collectionId: 263, description: "A visão de Nolan sobre Batman em três filmes icónicos." },
  { id: "planet-apes", title: "Planeta dos Macacos", type: "collection", collectionId: 173710, description: "A nova trilogia do Planeta dos Macacos." }
];
const COLLECTION_ORDER_LABELS = {
  86311: {
    "Homem de Ferro": "Fase 1",
    "O Incrível Hulk": "Fase 1",
    "Homem de Ferro 2": "Fase 1",
    "Thor": "Fase 1",
    "Capitão América: O Primeiro Vingador": "Fase 1",
    "Os Vingadores": "Fase 1",
    "Guardiões da Galáxia": "Fase 2",
    "Vingadores: Era de Ultron": "Fase 2",
    "Capitão América: Guerra Civil": "Fase 3",
    "Vingadores: Guerra do Infinito": "Fase 3",
    "Vingadores: Endgame": "Saga do Infinito",
    "Deadpool & Wolverine": "Saga do Multiverso"
  },
  1241: {
    "Harry Potter e a Pedra Filosofal": "Ano 1",
    "Harry Potter e a Câmara dos Segredos": "Ano 2",
    "Harry Potter e o Prisioneiro de Azkaban": "Ano 3",
    "Harry Potter e o Cálice de Fogo": "Ano 4",
    "Harry Potter e a Ordem da Fénix": "Ano 5",
    "Harry Potter e o Príncipe Misterioso": "Ano 6",
    "Harry Potter e os Talismãs da Morte: Parte 1": "Final",
    "Harry Potter e os Talismãs da Morte: Parte 2": "Final"
  }
};
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const variables = {};

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    variables[key] = value;
  });

  return variables;
}

function ensureApiKey(res) {
  if (TMDB_API_KEY) {
    return true;
  }

  sendJson(res, 500, { error: "Define TMDB_API_KEY no ficheiro .env." });
  return false;
}



function parsePositiveInteger(value, fallback = 1) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}



async function fetchVipStreamedApi(endpoint, { method = "GET", query = {} } = {}) {
  const url = new URL(endpoint, VIPSTREAMED_API_BASE);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return requestJson(url, {
    method,
    headers: {
      Accept: "application/json",
      "User-Agent": "MimiFlix/1.0"
    }
  });
}

async function fetchWatchFootyApi(endpoint, { method = "GET", query = {} } = {}) {
  const url = new URL(endpoint, WATCHFOOTY_API_BASE);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return requestJson(url, {
    method,
    headers: {
      Accept: "application/json",
      "User-Agent": "MimiFlix/1.0"
    }
  });
}

function normalizeSportToken(value) {
  return String(value || "").trim().toLowerCase();
}

function getWatchFootySportSlugs(filterSport) {
  const token = normalizeSportToken(filterSport);
  if (!token) return WATCHFOOTY_SPORTS.map((sport) => sport.slug);
  return WATCHFOOTY_SPORTS
    .filter((sport) => [sport.slug, normalizeSportToken(sport.label), ...(sport.aliases || []).map(normalizeSportToken)].includes(token))
    .map((sport) => sport.slug);
}

function isWatchFootyMatchLive(match) {
  const status = normalizeSportToken(match?.status);
  return ["in", "live", "playing", "in_progress"].includes(status);
}

function matchesWatchFootyQuery(match, query) {
  const token = normalizeSportToken(query);
  if (!token) return true;
  const haystack = [
    match?.title,
    match?.league,
    match?.sport,
    match?.teams?.home?.name,
    match?.teams?.away?.name
  ].map((value) => String(value || "").toLowerCase()).join(" ");
  return haystack.includes(token);
}

function getLanguage(queryLanguage) {
  return queryLanguage || DEFAULT_LANGUAGE;
}

function getWatchRegion(language) {
  return String(language || DEFAULT_LANGUAGE).toLowerCase().startsWith("pt") ? "PT" : "US";
}

function buildTmdbUrl(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("include_adult", "false");

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

async function fetchTmdb(endpoint, params = {}) {
  const url = buildTmdbUrl(endpoint, params);

  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let body = "";

      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });

      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`TMDB respondeu com erro ${response.statusCode}.`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error("Resposta invalida do TMDB."));
        }
      });
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
}

function detectMediaType(movie) {
  if (movie?.media_type === "tv" || movie?.first_air_date || Array.isArray(movie?.episode_run_time)) {
    return "tv";
  }
  return "movie";
}

function formatMovie(movie) {
  const mediaType = detectMediaType(movie);
  const runtime = mediaType === "tv"
    ? Number(movie?.episode_run_time?.[0]) || Number(movie?.runtime) || null
    : Number(movie?.runtime) || null;

  return {
    id: movie.id,
    media_type: mediaType,
    title: movie.title || movie.name,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date || movie.first_air_date,
    vote_average: movie.vote_average,
    original_language: movie.original_language,
    runtime,
    genres: Array.isArray(movie.genres) ? movie.genres.map((genre) => genre.name) : [],
    number_of_seasons: Number(movie?.number_of_seasons) || null,
    number_of_episodes: Number(movie?.number_of_episodes) || null,
    status: movie?.status || "",
    last_air_date: movie?.last_air_date || "",
    next_episode_to_air: movie?.next_episode_to_air
      ? {
          season_number: Number(movie.next_episode_to_air.season_number) || 0,
          episode_number: Number(movie.next_episode_to_air.episode_number) || 0,
          name: movie.next_episode_to_air.name || ""
        }
      : null
  };
}

function formatPerson(person) {
  return {
    id: person.id,
    name: person.name,
    profile_path: person.profile_path,
    known_for_department: person.known_for_department || "",
    biography: person.biography || "",
    birthday: person.birthday || "",
    place_of_birth: person.place_of_birth || ""
  };
}

function uniqueMovies(movies) {
  return [...new Map(
    (Array.isArray(movies) ? movies : [])
      .filter((movie) => movie?.id)
      .map((movie) => [movie.id, movie])
  ).values()];
}

function sortMoviesByReleaseDate(movies, direction = "asc") {
  return [...movies].sort((left, right) => {
    const leftDate = new Date(left?.release_date || "9999-12-31").getTime();
    const rightDate = new Date(right?.release_date || "9999-12-31").getTime();
    return direction === "desc" ? rightDate - leftDate : leftDate - rightDate;
  });
}

function formatCastMembers(credits, limit = 10) {
  return (credits?.cast || [])
    .filter((person) => person?.id && person?.name)
    .slice(0, limit)
    .map((person) => ({
      id: person.id,
      name: person.name,
      character: person.character || "",
      profile_path: person.profile_path || null
    }));
}

function formatDirectorMembers(credits, limit = 4) {
  return (credits?.crew || [])
    .filter((person) => person?.job === "Director" && person?.id && person?.name)
    .slice(0, limit)
    .map((person) => ({
      id: person.id,
      name: person.name,
      job: person.job,
      profile_path: person.profile_path || null
    }));
}

async function fetchPortugalTopTenSection(language) {
  const today = new Date().toISOString().slice(0, 10);
  const response = await fetchTmdb(PORTUGAL_TOP_TEN_SECTION.endpoint, {
    language,
    page: "1",
    ...PORTUGAL_TOP_TEN_SECTION.params,
    "primary_release_date.lte": today
  });

  return {
    id: PORTUGAL_TOP_TEN_SECTION.id,
    title: PORTUGAL_TOP_TEN_SECTION.title,
    display: "ranking",
    movies: (response.results || [])
      .filter((movie) => movie.poster_path || movie.backdrop_path)
      .slice(0, 10)
      .map((movie, index) => ({
        ...formatMovie(movie),
        rank: index + 1,
        social_context: `#${index + 1} em Portugal`
      }))
  };
}

async function fetchRealCollectionMovies(collection, language) {
  if (collection.type === "collection") {
    const payload = await fetchTmdb(`/collection/${collection.collectionId}`, { language });
    return sortMoviesByReleaseDate(
      (payload.parts || []).filter((movie) => movie.poster_path || movie.backdrop_path)
    );
  }

  const responses = await Promise.all([
    fetchTmdb("/discover/movie", { language, page: "1", ...collection.params }),
    fetchTmdb("/discover/movie", { language, page: "2", ...collection.params }).catch(() => ({ results: [] }))
  ]);
  return sortMoviesByReleaseDate(
    uniqueMovies(responses.flatMap((response) => response.results || []))
      .filter((movie) => movie.poster_path || movie.backdrop_path)
  );
}

function formatCurrencyValue(value) {
  const amount = Number(value) || 0;
  if (!amount) return "—";
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

function formatDateValue(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function getComposerNames(credits) {
  return [...new Set(
    (credits?.crew || [])
      .filter((person) => ["Original Music Composer", "Composer", "Music"].includes(person?.job))
      .map((person) => person?.name)
      .filter(Boolean)
  )];
}

function buildMoviePremiumSections(movie, credits, releaseDates, collectionPayload) {
  const releaseEntries = (releaseDates?.results || [])
    .flatMap((entry) => (entry.release_dates || []).map((release) => ({
      iso: entry.iso_3166_1,
      certification: release.certification || "",
      note: release.note || ""
    })))
    .filter((entry) => entry.certification || entry.note);
  const composers = getComposerNames(credits);
  const productionCountries = Array.isArray(movie.production_countries)
    ? movie.production_countries.map((country) => country.name).filter(Boolean)
    : [];
  const companies = Array.isArray(movie.production_companies)
    ? movie.production_companies.map((company) => company.name).filter(Boolean)
    : [];
  const collectionMovies = collectionPayload?.parts
    ? sortMoviesByReleaseDate(collectionPayload.parts.filter((entry) => entry?.id))
    : [];
  const collectionIndex = collectionMovies.findIndex((entry) => entry.id === movie.id);
  const orderLabel = collectionPayload?.id
    ? COLLECTION_ORDER_LABELS[collectionPayload.id]?.[movie.title] || ""
    : "";

  return {
    premium: {
      tagline: movie.tagline || "",
      trivia: [
        movie.runtime ? `Tem ${movie.runtime} minutos, ideal para uma sessão ${movie.runtime >= 150 ? "épica" : movie.runtime <= 100 ? "mais compacta" : "de duração clássica"}.` : "",
        productionCountries.length ? `Produzido entre ${productionCountries.join(", ")}.` : "",
        companies.length ? `Estúdio(s): ${companies.slice(0, 3).join(", ")}.` : "",
        movie.budget ? `Orçamento estimado em ${formatCurrencyValue(movie.budget)}.` : "",
        movie.revenue ? `Receita global aproximada de ${formatCurrencyValue(movie.revenue)}.` : ""
      ].filter(Boolean).slice(0, 4),
      quotes: [
        movie.tagline ? `“${movie.tagline}”` : "",
        movie.title && movie.release_date ? `${movie.title} chegou aos cinemas em ${String(movie.release_date).slice(0, 4)}.` : "",
        releaseEntries[0]?.certification ? `Classificação destacada: ${releaseEntries[0].certification} (${releaseEntries[0].iso}).` : ""
      ].filter(Boolean).slice(0, 3),
      soundtrack: {
        composers,
        note: composers.length
          ? `Banda sonora assinada por ${composers.slice(0, 2).join(", ")}${composers.length > 2 ? " e outros." : "."}`
          : "Sem compositor destacado nos créditos recebidos."
      },
      historicalContext: [
        movie.release_date ? `Estreou em ${formatDateValue(movie.release_date)}.` : "",
        movie.original_language ? `Idioma original: ${String(movie.original_language).toUpperCase()}.` : "",
        releaseEntries[0]?.note ? `Nota de lançamento: ${releaseEntries[0].note}.` : ""
      ].filter(Boolean),
      saga: collectionPayload ? {
        id: collectionPayload.id,
        name: collectionPayload.name,
        totalMovies: collectionMovies.length,
        orderIndex: collectionIndex >= 0 ? collectionIndex + 1 : null,
        orderLabel,
        order: collectionMovies.slice(0, 12).map((entry, index) => ({
          ...formatMovie(entry),
          chronological_index: index + 1,
          social_context: [COLLECTION_ORDER_LABELS[collectionPayload.id]?.[entry.title], `Ordem ${index + 1}`].filter(Boolean).join(" • ")
        }))
      } : null
    }
  };
}

function pickWatchProviders(payload, region) {
  const regionData = payload?.results?.[region] || payload?.results?.US || payload?.results?.PT || null;
  if (!regionData) return [];

  return [...new Map(
    [...(regionData.flatrate || []), ...(regionData.buy || []), ...(regionData.rent || [])]
      .filter((provider) => provider?.provider_name)
      .map((provider) => [provider.provider_id || provider.provider_name, {
        id: provider.provider_id,
        name: provider.provider_name
      }])
  ).values()].slice(0, 8);
}

function getMovieYear(movie) {
  const year = Number.parseInt(String(movie?.release_date || "").slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

function getMovieGenreIds(movie) {
  if (Array.isArray(movie?.genre_ids)) {
    return movie.genre_ids.filter((genreId) => Number.isFinite(Number(genreId))).map(Number);
  }

  if (Array.isArray(movie?.genres)) {
    return movie.genres
      .map((genre) => (typeof genre === "object" ? genre.id : genre))
      .filter((genreId) => Number.isFinite(Number(genreId)))
      .map(Number);
  }

  return [];
}

function getKeywordIds(keywordPayload) {
  if (!Array.isArray(keywordPayload?.keywords)) {
    return [];
  }

  return keywordPayload.keywords
    .map((keyword) => keyword?.id)
    .filter((keywordId) => Number.isFinite(Number(keywordId)))
    .map(Number)
    .slice(0, 3);
}

function buildRecommendationDiscoverParams(movie, keywordPayload, language) {
  const params = {
    language,
    page: "1",
    sort_by: "popularity.desc",
    "vote_count.gte": "80"
  };
  const genreIds = getMovieGenreIds(movie);
  const keywordIds = getKeywordIds(keywordPayload);
  const releaseYear = getMovieYear(movie);

  if (genreIds.length) {
    params.with_genres = genreIds.slice(0, 3).join(",");
  }

  if (keywordIds.length) {
    params.with_keywords = keywordIds.join("|");
  }

  if (movie?.original_language) {
    params.with_original_language = movie.original_language;
  }

  if (releaseYear) {
    params["primary_release_date.gte"] = `${Math.max(1950, releaseYear - 8)}-01-01`;
    params["primary_release_date.lte"] = `${releaseYear + 8}-12-31`;
  }

  return params;
}

function buildFavoriteUpcomingDiscoverParams(movie, keywordPayload, language) {
  const params = buildRecommendationDiscoverParams(movie, keywordPayload, language);
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 120);
  params.sort_by = "popularity.desc";
  params["primary_release_date.gte"] = today.toISOString().slice(0, 10);
  params["primary_release_date.lte"] = maxDate.toISOString().slice(0, 10);
  delete params.page;
  return params;
}

function getUpcomingTimeWindows() {
  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);
  const in90Days = new Date(now);
  in90Days.setDate(in90Days.getDate() + 90);

  return {
    now: now.toISOString().slice(0, 10),
    in7Days: in7Days.toISOString().slice(0, 10),
    in30Days: in30Days.toISOString().slice(0, 10),
    in90Days: in90Days.toISOString().slice(0, 10)
  };
}

function scoreRelatedMovie(movie, referenceMovie, sources) {
  let score = 0;
  const referenceGenreIds = getMovieGenreIds(referenceMovie);
  const candidateGenreIds = getMovieGenreIds(movie);
  const matchingGenres = candidateGenreIds.filter((genreId) => referenceGenreIds.includes(genreId)).length;
  const referenceYear = getMovieYear(referenceMovie);
  const candidateYear = getMovieYear(movie);

  if (sources.has("recommendations")) score += 45;
  if (sources.has("similar")) score += 30;
  if (sources.has("discover")) score += 20;

  score += matchingGenres * 14;
  if (referenceGenreIds.length && candidateGenreIds.length && matchingGenres === 0) {
    score -= 18;
  }

  if (referenceMovie?.original_language && movie?.original_language === referenceMovie.original_language) {
    score += 10;
  }

  if (referenceYear && candidateYear) {
    score += Math.max(0, 10 - Math.abs(candidateYear - referenceYear));
  }

  if (typeof movie.vote_average === "number") {
    score += Math.min(movie.vote_average, 8);
  }

  if (typeof movie.popularity === "number") {
    score += Math.min(movie.popularity / 40, 6);
  }

  return score;
}

function rankRelatedMovies(referenceMovie, groupedSources) {
  const candidates = new Map();

  groupedSources.forEach(({ source, movies }) => {
    (movies || []).forEach((movie) => {
      if (!movie || movie.id === referenceMovie.id || (!movie.poster_path && !movie.backdrop_path)) {
        return;
      }

      const existing = candidates.get(movie.id);
      if (existing) {
        existing.sources.add(source);
        return;
      }

      candidates.set(movie.id, {
        movie,
        sources: new Set([source])
      });
    });
  });

  return [...candidates.values()]
    .map((entry) => ({
      movie: entry.movie,
      score: scoreRelatedMovie(entry.movie, referenceMovie, entry.sources)
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 12)
    .map((entry) => formatMovie(entry.movie));
}

function pickQueryValue(searchParams, ...keys) {
  for (const key of keys) {
    const value = String(searchParams.get(key) || "").trim();
    if (value) return value;
  }

  return "";
}

function buildDiscoverParams(requestUrl) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  const mediaType = requestUrl.searchParams.get("mediaType") === "tv" ? "tv" : "movie";
  const yearField = mediaType === "tv" ? "first_air_date" : "primary_release_date";
  const yearSingleField = mediaType === "tv" ? "first_air_date_year" : "primary_release_year";
  const params = {
    language,
    page: String(requestUrl.searchParams.get("page") || "1"),
    sort_by: pickQueryValue(requestUrl.searchParams, "sort_by", "sortBy") || "popularity.desc",
    include_adult: "false",
    watch_region: getWatchRegion(language)
  };

  const mappings = [
    [["genre", "with_genres", "genres"], "with_genres"],
    [["year", "primary_release_year"], yearSingleField],
    [["yearMin", "release_date_gte"], `${yearField}.gte`],
    [["yearMax", "release_date_lte"], `${yearField}.lte`],
    [["ratingMin", "vote_average_gte"], "vote_average.gte"],
    [["ratingMax", "vote_average_lte"], "vote_average.lte"],
    [["runtimeMin", "with_runtime_gte"], "with_runtime.gte"],
    [["runtimeMax", "with_runtime_lte"], "with_runtime.lte"],
    [["originalLanguage", "languageOriginal", "with_original_language"], "with_original_language"],
    [["voteCountMin", "vote_count_gte"], "vote_count.gte"]
  ];

  mappings.forEach(([keys, targetKey]) => {
    const value = pickQueryValue(requestUrl.searchParams, ...keys);
    if (value) {
      params[targetKey] = value;
    }
  });

  const provider = pickQueryValue(requestUrl.searchParams, "provider", "with_watch_providers", "providerId");
  if (provider) {
    params.with_watch_providers = provider;
  }

  return params;
}

function scoreFavoriteRecommendation(movie, statsByMovieId, favoriteLanguage) {
  const stats = statsByMovieId.get(movie.id) || { score: 0, hits: 0, sourceCount: 0 };
  let score = stats.score + stats.hits * 12 + stats.sourceCount * 10;

  if (favoriteLanguage && movie.original_language === favoriteLanguage) {
    score += 8;
  }

  if (typeof movie.vote_average === "number") {
    score += Math.min(movie.vote_average, 8);
  }

  if (typeof movie.popularity === "number") {
    score += Math.min(movie.popularity / 50, 5);
  }

  return score;
}

async function handleDiscoverMovies(requestUrl, res) {
  if (!ensureApiKey(res)) return;

  try {
    const mediaType = requestUrl.searchParams.get("mediaType") === "tv" ? "tv" : "movie";
    const discoverEndpoint = mediaType === "tv" ? "/discover/tv" : "/discover/movie";
    const requestedPage = Math.max(1, Number.parseInt(String(requestUrl.searchParams.get("page") || "1"), 10) || 1);
    const tmdbPagesPerAppPage = Math.max(1, Math.ceil(APP_DISCOVER_PAGE_SIZE / TMDB_DISCOVER_PAGE_SIZE));
    const firstTmdbPage = ((requestedPage - 1) * tmdbPagesPerAppPage) + 1;
    const baseParams = buildDiscoverParams(requestUrl);
    const pageResponses = await Promise.all(
      Array.from({ length: tmdbPagesPerAppPage }, (_, index) => {
        const tmdbPage = firstTmdbPage + index;
        return fetchTmdb(discoverEndpoint, {
          ...baseParams,
          page: String(tmdbPage)
        });
      })
    );
    const primaryResponse = pageResponses[0] || { page: 1, total_pages: 1, total_results: 0, results: [] };
    const totalAppPages = Math.max(1, Math.ceil((Number(primaryResponse.total_results) || 0) / APP_DISCOVER_PAGE_SIZE));
    const combinedResults = [...new Map(
      pageResponses
        .flatMap((response) => response.results || [])
        .filter((movie) => movie.poster_path || movie.backdrop_path)
        .map((movie) => [movie.id, movie])
    ).values()].slice(0, APP_DISCOVER_PAGE_SIZE);

    sendJson(res, 200, {
      page: Math.min(requestedPage, totalAppPages),
      total_pages: totalAppPages,
      total_results: Number(primaryResponse.total_results) || 0,
      results: combinedResults.map(formatMovie)
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleFavoriteRecommendations(requestUrl, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  if (!ensureApiKey(res)) return;

  const favoriteIds = String(requestUrl.searchParams.get("movie_ids") || "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value))
    .slice(0, 5);

  if (!favoriteIds.length) {
    sendJson(res, 200, { results: [] });
    return;
  }

  try {
    const favoriteMovies = await Promise.all(
      favoriteIds.map((movieId) => fetchTmdb(`/movie/${movieId}`, { language }))
    );

    const statsByMovieId = new Map();

    await Promise.all(
      favoriteMovies.map(async (movie) => {
        const [recommendationsData, similarData] = await Promise.all([
          fetchTmdb(`/movie/${movie.id}/recommendations`, { language, page: "1" }),
          fetchTmdb(`/movie/${movie.id}/similar`, { language, page: "1" })
        ]);

        [
          { source: "recommendations", weight: 35, items: recommendationsData.results || [] },
          { source: "similar", weight: 22, items: similarData.results || [] }
        ].forEach(({ source, weight, items }) => {
          items.forEach((candidate, index) => {
            if (!candidate || favoriteIds.includes(candidate.id)) {
              return;
            }

            const existing = statsByMovieId.get(candidate.id) || {
              movie: candidate,
              score: 0,
              hits: 0,
              sourceCount: 0,
              sources: new Set()
            };

            existing.movie = candidate;
            existing.score += Math.max(weight - index, 8);
            existing.hits += 1;
            if (!existing.sources.has(`${movie.id}:${source}`)) {
              existing.sources.add(`${movie.id}:${source}`);
              existing.sourceCount += 1;
            }
            statsByMovieId.set(candidate.id, existing);
          });
        });
      })
    );

    const dominantLanguage =
      favoriteMovies
        .map((movie) => movie.original_language)
        .filter(Boolean)
        .sort((left, right, arr) =>
          arr.filter((value) => value === right).length - arr.filter((value) => value === left).length
        )[0] || "";

    const results = [...statsByMovieId.values()]
      .filter((entry) => entry.movie.poster_path || entry.movie.backdrop_path)
      .map((entry) => ({
        movie: entry.movie,
        score: scoreFavoriteRecommendation(entry.movie, statsByMovieId, dominantLanguage)
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 12)
      .map((entry) => formatMovie(entry.movie));

    sendJson(res, 200, { results });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleFavoriteReleaseAlerts(requestUrl, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  if (!ensureApiKey(res)) return;

  const favoriteIds = String(requestUrl.searchParams.get("movie_ids") || "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value))
    .slice(0, 5);

  if (!favoriteIds.length) {
    sendJson(res, 200, { results: [] });
    return;
  }

  try {
    const favoriteMovies = await Promise.all(
      favoriteIds.map((movieId) => fetchTmdb(`/movie/${movieId}`, { language }))
    );

    const statsByMovieId = new Map();

    await Promise.all(
      favoriteMovies.map(async (movie) => {
        const keywordData = await fetchTmdb(`/movie/${movie.id}/keywords`);
        const discoverData = await fetchTmdb("/discover/movie", buildFavoriteUpcomingDiscoverParams(movie, keywordData, language));

        (discoverData.results || []).forEach((candidate, index) => {
          if (!candidate || favoriteIds.includes(candidate.id) || (!candidate.poster_path && !candidate.backdrop_path)) {
            return;
          }

          const existing = statsByMovieId.get(candidate.id) || {
            movie: candidate,
            score: 0,
            hits: 0
          };

          existing.movie = candidate;
          existing.score += Math.max(34 - index, 8) + scoreRelatedMovie(candidate, movie, new Set(["discover"]));
          existing.hits += 1;
          statsByMovieId.set(candidate.id, existing);
        });
      })
    );

    const results = [...statsByMovieId.values()]
      .sort((left, right) => (right.score + right.hits * 10) - (left.score + left.hits * 10))
      .slice(0, 10)
      .map((entry) => formatMovie(entry.movie));

    sendJson(res, 200, { results });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleCalendarUpcoming(requestUrl, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  if (!ensureApiKey(res)) return;

  const windows = getUpcomingTimeWindows();

  try {
    const [pageOne, pageTwo] = await Promise.all([
      fetchTmdb("/movie/upcoming", { language, page: "1" }),
      fetchTmdb("/movie/upcoming", { language, page: "2" })
    ]);

    const movies = [...(pageOne.results || []), ...(pageTwo.results || [])]
      .filter((movie) => (movie.poster_path || movie.backdrop_path) && movie.release_date)
      .sort((left, right) => new Date(left.release_date).getTime() - new Date(right.release_date).getTime());

    const sections = [
      {
        id: "this-week",
        title: "Estreias da semana",
        movies: movies.filter((movie) => movie.release_date >= windows.now && movie.release_date <= windows.in7Days).slice(0, 12)
      },
      {
        id: "this-month",
        title: "Ainda este mês",
        movies: movies.filter((movie) => movie.release_date > windows.in7Days && movie.release_date <= windows.in30Days).slice(0, 12)
      },
      {
        id: "next-wave",
        title: "A caminho",
        movies: movies.filter((movie) => movie.release_date > windows.in30Days && movie.release_date <= windows.in90Days).slice(0, 12)
      }
    ].map((section) => ({
      ...section,
      movies: section.movies.map(formatMovie)
    }));

    sendJson(res, 200, { sections });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleSmartCollections(requestUrl, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  if (!ensureApiKey(res)) return;

  try {
    const responses = await Promise.all(
      SMART_COLLECTIONS.map((collection) => fetchTmdb(collection.endpoint, { language, page: "1", ...collection.params }))
    );

    const sections = SMART_COLLECTIONS.map((collection, index) => ({
      id: collection.id,
      title: collection.title,
      movies: (responses[index].results || [])
        .filter((movie) => movie.poster_path || movie.backdrop_path)
        .map(formatMovie)
        .slice(0, 12)
    }));

    sendJson(res, 200, { sections });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleRealCollections(requestUrl, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  if (!ensureApiKey(res)) return;

  try {
    async function fetchOneCollection(collection) {
      const movies = await fetchRealCollectionMovies(collection, language);
      const totalMovies = movies.length;
      const collectionId = collection.collectionId || 0;
      return {
        id: collection.id,
        title: collection.title,
        description: collection.description,
        display: "timeline",
        context: collection.type === "collection"
          ? "Inclui saga principal, ordem recomendada e sensação de progresso cinematográfico."
          : "Seleção curada em ordem para acompanhar autor ou estúdio como uma coleção viva.",
        stats: [
          { label: "Filmes", value: String(totalMovies) },
          { label: "Modo", value: collection.type === "collection" ? "Saga" : "Curadoria" }
        ],
        movies: movies.slice(0, 18).map((movie, index) => ({
          ...formatMovie(movie),
          chronological_index: index + 1,
          social_context: [COLLECTION_ORDER_LABELS[collectionId]?.[movie.title], `Ordem ${index + 1}`].filter(Boolean).join(" • ") || `Ordem ${index + 1}`
        }))
      };
    }

    // Process in batches of 5 to avoid TMDB rate limits
    const BATCH_SIZE = 5;
    const sections = [];
    for (let i = 0; i < REAL_COLLECTIONS.length; i += BATCH_SIZE) {
      const batch = REAL_COLLECTIONS.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map((collection) => fetchOneCollection(collection).catch(() => null)));
      sections.push(...results.filter(Boolean));
    }

    sendJson(res, 200, { sections });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handlePersonalCalendar(requestUrl, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  const movieIds = String(requestUrl.searchParams.get("movie_ids") || "")
    .split(",")
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value))
    .slice(0, 8);
  if (!ensureApiKey(res)) return;

  if (!movieIds.length) {
    sendJson(res, 200, { sections: [] });
    return;
  }

  try {
    const details = await Promise.all(movieIds.map((movieId) => fetchTmdb(`/movie/${movieId}`, { language })));
    const upcomingWatchlist = details
      .filter((movie) => movie.release_date && new Date(movie.release_date).getTime() >= Date.now())
      .sort((left, right) => new Date(left.release_date).getTime() - new Date(right.release_date).getTime())
      .slice(0, 5)
      .map((movie) => ({
        id: `watch:${movie.id}`,
        title: `${movie.title} está a chegar`,
        body: `Estreia a ${movie.release_date}. Continua na tua watchlist para não perderes o lançamento.`
      }));

    const actorCredits = await Promise.all(
      movieIds.slice(0, 4).map((movieId) => fetchTmdb(`/movie/${movieId}/credits`, { language }).catch(() => ({ cast: [] })))
    );
    const favoriteActorIds = [...new Map(
      actorCredits
        .flatMap((credits) => (credits.cast || []).slice(0, 4))
        .filter((person) => person?.id && person?.name)
        .map((person) => [person.id, person])
    ).values()].slice(0, 3);
    const actorAlerts = [];

    for (const actor of favoriteActorIds) {
      const credits = await fetchTmdb(`/person/${actor.id}/movie_credits`, { language }).catch(() => ({ cast: [] }));
      const nextMovie = (credits.cast || [])
        .filter((movie) => movie.release_date && new Date(movie.release_date).getTime() >= Date.now())
        .sort((left, right) => new Date(left.release_date).getTime() - new Date(right.release_date).getTime())[0];
      if (nextMovie) {
        actorAlerts.push({
          id: `actor:${actor.id}`,
          title: `${actor.name} tem novidade a caminho`,
          body: `${nextMovie.title} estreia a ${nextMovie.release_date}.`
        });
      }
    }

    sendJson(res, 200, {
      sections: [
        { id: "watchlist-alerts", title: "Da tua watchlist", reminders: upcomingWatchlist },
        { id: "actor-alerts", title: "Atores que tens seguido", reminders: actorAlerts }
      ]
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleProfileCollections(requestUrl, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  const movieIds = String(requestUrl.searchParams.get("movie_ids") || "")
    .split(",")
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value))
    .slice(0, 10);
  if (!ensureApiKey(res)) return;

  if (!movieIds.length) {
    sendJson(res, 200, { sections: [] });
    return;
  }

  try {
    const movies = await Promise.all(movieIds.map((movieId) => fetchTmdb(`/movie/${movieId}`, { language })));
    const genreCounts = new Map();
    const languageCounts = new Map();
    const runtimes = [];

    movies.forEach((movie) => {
      getMovieGenreIds(movie).forEach((genreId) => genreCounts.set(genreId, (genreCounts.get(genreId) || 0) + 1));
      if (movie.original_language) languageCounts.set(movie.original_language, (languageCounts.get(movie.original_language) || 0) + 1);
      if (movie.runtime) runtimes.push(Number(movie.runtime));
    });

    const topGenre = [...genreCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || 18;
    const secondaryGenre = [...genreCounts.entries()].sort((left, right) => right[1] - left[1])[1]?.[0] || topGenre;
    const topLanguage = [...languageCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || "";
    const avgRuntime = runtimes.length ? Math.round(runtimes.reduce((sum, value) => sum + value, 0) / runtimes.length) : 110;

    const queries = [
      { ...PROFILE_COLLECTION_BLUEPRINTS[0], params: { language, with_genres: `${topGenre},${secondaryGenre}`, with_original_language: topLanguage, sort_by: "popularity.desc", "vote_count.gte": "120" } },
      { ...PROFILE_COLLECTION_BLUEPRINTS[1], params: { language, with_genres: String(topGenre), "with_runtime.lte": String(Math.max(90, avgRuntime)), sort_by: "popularity.desc", "vote_count.gte": "120" } },
      { ...PROFILE_COLLECTION_BLUEPRINTS[2], params: { language, with_genres: String(topGenre), sort_by: "vote_average.desc", "vote_count.gte": "800" } }
    ];

    const responses = await Promise.all(queries.map((entry) => fetchTmdb("/discover/movie", entry.params)));
    sendJson(res, 200, {
      sections: queries.map((entry, index) => ({
        id: entry.id,
        title: entry.title,
        movies: (responses[index].results || [])
          .filter((movie) => !movieIds.includes(movie.id) && (movie.poster_path || movie.backdrop_path))
          .map(formatMovie)
          .slice(0, 12)
      }))
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handlePersonDetails(requestUrl, personId, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  const favoriteIds = String(requestUrl.searchParams.get("favorite_ids") || "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value))
    .slice(0, 8);
  if (!ensureApiKey(res)) return;

  try {
    const [person, credits, favoriteMovies] = await Promise.all([
      fetchTmdb(`/person/${personId}`, { language }),
      fetchTmdb(`/person/${personId}/movie_credits`, { language }),
      favoriteIds.length
        ? Promise.all(favoriteIds.map((movieId) => fetchTmdb(`/movie/${movieId}`, { language }).catch(() => null)))
        : Promise.resolve([])
    ]);

    const combinedCredits = uniqueMovies([...(credits.cast || []), ...(credits.crew || [])])
      .filter((movie) => movie.poster_path || movie.backdrop_path);
    const now = Date.now();
    const relatedFavoriteIds = new Set(combinedCredits.map((movie) => movie.id));
    const directorialCount = (credits.crew || []).filter((entry) => entry?.job === "Director").length;

    sendJson(res, 200, {
      person: formatPerson(person),
      stats: {
        actingCredits: (credits.cast || []).length,
        directingCredits: directorialCount,
        totalMovies: combinedCredits.length
      },
      relatedFavorites: favoriteMovies
        .filter(Boolean)
        .filter((movie) => relatedFavoriteIds.has(movie.id))
        .map(formatMovie)
        .slice(0, 8),
      upcoming: sortMoviesByReleaseDate(
        combinedCredits.filter((movie) => movie.release_date && new Date(movie.release_date).getTime() >= now)
      ).map(formatMovie).slice(0, 8),
      filmography: combinedCredits
        .sort((left, right) => (right.popularity || 0) - (left.popularity || 0))
        .map(formatMovie)
        .slice(0, 18)
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

function pickFeaturedMovie(sections) {
  const list = pickFeaturedMovies(sections, 1);
  return list.length ? list[0] : null;
}

function pickFeaturedMovies(sections, count = 5) {
  const seen = new Set();
  const pool = [];
  const heroSectionIds = new Set(["popular", "now-playing", "series-popular", "series-airing"]);
  const heroSections = sections.filter((s) => heroSectionIds.has(s.id));
  const sourceSections = heroSections.length ? heroSections : sections.slice(0, 2);
  // Only allow these languages in the hero
  // Only allow English and Portuguese in the hero
  const allowedLanguages = new Set(["en", "pt"]);

  for (const section of sourceSections) {
    for (const movie of section.movies) {
      if (!movie.backdrop_path) continue;
      if (seen.has(movie.id)) continue;
      if (typeof movie.vote_average === "number" && movie.vote_average < 5.5) continue;
      if (typeof movie.vote_count === "number" && movie.vote_count < 300) continue;
      const lang = String(movie.original_language || "").toLowerCase();
      if (!allowedLanguages.has(lang)) continue;
      seen.add(movie.id);
      pool.push(movie);
    }
  }
  pool.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const top = pool.slice(0, Math.min(count * 3, pool.length));
  for (let i = top.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [top[i], top[j]] = [top[j], top[i]];
  }
  return top.slice(0, count);
}

function ensureDirectory(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

function getRequestModule(targetUrl) {
  const protocol = (typeof targetUrl === "string" ? new URL(targetUrl) : targetUrl).protocol;
  return protocol === "http:" ? http : https;
}

function downloadBuffer(url) {
  const mod = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    mod.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(downloadBuffer(new URL(res.headers.location)));
        return;
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

const OSUB_LANG_MAP = {
  "PT-PT": "pt-PT", "PT-BR": "pt-BR",
  "EN": "en", "ES": "es", "FR": "fr", "DE": "de"
};

function getSubtitleCachePath(tmdbId, type, lang, season, episode) {
  const safeLang = String(lang).replace(/[^a-zA-Z0-9-]/g, "");
  const key = type === "tv"
    ? `tv-${tmdbId}-s${season}e${episode}-${safeLang}.srt`
    : `movie-${tmdbId}-${safeLang}.srt`;
  return path.join(SUBTITLES_CACHE_DIR, key);
}

function normalizeSubtitleLookupValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getReleaseYear(value) {
  const match = String(value || "").match(/\b(\d{4})\b/);
  return match ? match[1] : "";
}

function buildSortedSearchParams(entries) {
  const params = new URLSearchParams();
  Object.entries(entries || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value).toLowerCase());
  });
  params.sort();
  return params;
}

function getOpenSubtitlesHeaders(token) {
  return {
    "Accept": "*/*",
    "Api-Key": OPENSUBTITLES_API_KEY,
    "Content-Type": "application/json",
    "User-Agent": OPENSUBTITLES_USER_AGENT,
    "X-User-Agent": OPENSUBTITLES_USER_AGENT,
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
}

function scoreLocalSubtitleLanguageMatch(words, lang) {
  const normalizedLang = String(lang || "").toUpperCase();
  const englishTags = ["en", "eng", "english", "ingles"];
  const portugueseTags = ["pt", "por", "portuguese", "portugues", "ptpt", "ptbr", "brazil", "brasil"];
  const hasEnglishTag = englishTags.some((tag) => words.has(tag));
  const hasPortugueseTag = portugueseTags.some((tag) => words.has(tag));

  if (normalizedLang === "EN") {
    if (hasEnglishTag) return 20;
    if (hasPortugueseTag) return -25;
    return 0;
  }
  if (normalizedLang === "PT-PT" || normalizedLang === "PT-BR") {
    if (hasPortugueseTag) return 20;
    if (hasEnglishTag) return -25;
    return 0;
  }
  return 0;
}

function findLocalSubtitleFile({ title, year, lang, type, season, episode }) {
  if (!title || !fs.existsSync(LOCAL_SUBTITLES_DIR) || !fs.statSync(LOCAL_SUBTITLES_DIR).isDirectory()) return null;
  const normalizedTitle = normalizeSubtitleLookupValue(title);
  if (!normalizedTitle) return null;

  const seasonEpisodeTokens = type === "tv"
    ? [
        `s${String(Number(season) || 0).padStart(2, "0")}e${String(Number(episode) || 0).padStart(2, "0")}`,
        `${String(Number(season) || 0).padStart(2, "0")}x${String(Number(episode) || 0).padStart(2, "0")}`
      ]
    : [];

  const candidates = fs.readdirSync(LOCAL_SUBTITLES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.srt$/i.test(entry.name))
    .map((entry) => {
      const baseName = entry.name.replace(/\.srt$/i, "");
      const normalizedName = normalizeSubtitleLookupValue(baseName);
      if (!normalizedName.includes(normalizedTitle)) return null;

      const words = new Set(normalizedName.split(/\s+/).filter(Boolean));
      let score = 100;

      if (year && normalizedName.includes(year)) score += 25;
      else if (year) score -= 10;

      score += scoreLocalSubtitleLanguageMatch(words, lang);

      if (seasonEpisodeTokens.length) {
        if (seasonEpisodeTokens.some((token) => normalizedName.includes(token))) score += 40;
        else if (/s\d{2}e\d{2}|\d{2}x\d{2}/.test(normalizedName)) score -= 20;
      }

      return { filePath: path.join(LOCAL_SUBTITLES_DIR, entry.name), score, fileName: entry.name };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || left.fileName.length - right.fileName.length);

  return candidates[0] || null;
}

function getRemoteErrorMessage(payload, rawBody, statusCode, url, contentType) {
  const firstError = payload?.errors?.[0];
  if (typeof firstError === "string" && firstError.trim()) return firstError.trim();
  if (firstError && typeof firstError === "object") {
    const detailedMessage = firstError.detail || firstError.message || firstError.title;
    if (typeof detailedMessage === "string" && detailedMessage.trim()) return detailedMessage.trim();
  }
  const message =
    payload?.msg ||
    payload?.message ||
    payload?.error_description ||
    payload?.error;
  if (typeof message === "string" && message.trim()) return message.trim();
  const isHtml = typeof contentType === "string" && contentType.includes("text/html");
  const isOpenSubtitlesDownload = url?.hostname === "api.opensubtitles.com" && url?.pathname === "/api/v1/download";
  if (statusCode === 503 && isHtml && isOpenSubtitlesDownload) {
    return "OpenSubtitles devolveu 503 no download da legenda. O servico pode estar temporariamente indisponivel ou o limite diario da conta pode ter sido atingido.";
  }
  if (rawBody) return rawBody.slice(0, 400);
  return `Pedido remoto falhou com erro ${statusCode}.`;
}

let _osubToken = null;
let _osubTokenExpiry = 0;

async function getOsubToken() {
  if (_osubToken && Date.now() < _osubTokenExpiry) return _osubToken;
  if (!OPENSUBTITLES_USERNAME || !OPENSUBTITLES_PASSWORD) return null;
  const bodyStr = JSON.stringify({ username: OPENSUBTITLES_USERNAME, password: OPENSUBTITLES_PASSWORD });
  const data = await requestJson(new URL(`${OPENSUBTITLES_BASE}/login`), {
    method: "POST",
    headers: {
      ...getOpenSubtitlesHeaders(),
      "Content-Length": String(Buffer.byteLength(bodyStr))
    },
    body: bodyStr
  });
  if (data?.token) {
    _osubToken = data.token;
    _osubTokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
    console.log(`[subtitles] login ok, limite diário de downloads: ${data.user?.allowed_downloads}`);
  }
  return _osubToken;
}

async function fetchFromOpenSubtitles(tmdbId, type, lang, season, episode) {
  const osLang = OSUB_LANG_MAP[lang.toUpperCase()] || "en";
  const osType = type === "tv" ? "episode" : "movie";
  const token = await getOsubToken();
  const baseHeaders = getOpenSubtitlesHeaders(token);
  const searchParams = buildSortedSearchParams({ languages: osLang, tmdb_id: tmdbId, type: osType });
  if (osType === "episode") {
    searchParams.set("season_number", season);
    searchParams.set("episode_number", episode);
    searchParams.sort();
  }
  console.log(`[subtitles] search tmdb=${tmdbId} type=${osType} lang=${osLang} auth=${!!token}`);
  const searchData = await requestJson(new URL(`${OPENSUBTITLES_BASE}/subtitles?${searchParams}`), { headers: baseHeaders });
  const fileId = searchData?.data?.[0]?.attributes?.files?.[0]?.file_id;
  console.log(`[subtitles] found ${searchData?.data?.length || 0} results, fileId=${fileId}`);
  if (!fileId) return null;
  let dlData;
  try {
    const bodyStr = JSON.stringify({ file_id: fileId, sub_format: "srt" });
    dlData = await requestJson(new URL(`${OPENSUBTITLES_BASE}/download`), {
      method: "POST",
      headers: { ...baseHeaders, "Content-Length": String(Buffer.byteLength(bodyStr)) },
      body: bodyStr
    });
  } catch (error) {
    if (error?.statusCode !== 503) throw error;
    console.warn(`[subtitles] download 503 with sub_format=srt, retrying without sub_format`);
    const fallbackBodyStr = JSON.stringify({ file_id: fileId });
    dlData = await requestJson(new URL(`${OPENSUBTITLES_BASE}/download`), {
      method: "POST",
      headers: { ...baseHeaders, "Content-Length": String(Buffer.byteLength(fallbackBodyStr)) },
      body: fallbackBodyStr
    });
  }
  console.log(`[subtitles] download link=${dlData?.link ? "ok" : "missing"} remaining=${dlData?.remaining}`);
  if (!dlData?.link) return null;
  const buffer = await downloadBuffer(new URL(dlData.link));
  return buffer.toString("utf8");
}

async function handleSubtitleSearch(requestUrl, res) {
  const tmdbId = requestUrl.searchParams.get("tmdb_id");
  const type = requestUrl.searchParams.get("type") || "movie";
  const lang = (requestUrl.searchParams.get("lang") || "EN").toUpperCase();
  const season = requestUrl.searchParams.get("season") || "1";
  const episode = requestUrl.searchParams.get("episode") || "1";
  const title = requestUrl.searchParams.get("title") || "";
  const year = requestUrl.searchParams.get("year") || getReleaseYear(requestUrl.searchParams.get("release_date"));
  if (!tmdbId) { sendJson(res, 400, { error: "tmdb_id obrigatório." }); return; }

  const cachePath = getSubtitleCachePath(tmdbId, type, lang, season, episode);
  if (fs.existsSync(cachePath)) {
    console.log(`[subtitles] serving from cache: ${path.basename(cachePath)}`);
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(fs.readFileSync(cachePath, "utf8"));
    return;
  }

  const localSubtitle = findLocalSubtitleFile({ title, year, lang, type, season, episode });
  if (localSubtitle) {
    const srt = fs.readFileSync(localSubtitle.filePath, "utf8");
    if (!fs.existsSync(SUBTITLES_CACHE_DIR)) fs.mkdirSync(SUBTITLES_CACHE_DIR, { recursive: true });
    fs.writeFileSync(cachePath, srt, "utf8");
    console.log(`[subtitles] serving local file: ${localSubtitle.fileName}`);
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(srt);
    return;
  }

  if (!OPENSUBTITLES_API_KEY) {
    sendJson(res, 503, { error: "OPENSUBTITLES_API_KEY não configurada no .env." });
    return;
  }
  try {
    const srt = await fetchFromOpenSubtitles(tmdbId, type, lang, season, episode);
    if (!srt) { sendJson(res, 404, { error: "Legenda não encontrada." }); return; }
    if (!fs.existsSync(SUBTITLES_CACHE_DIR)) fs.mkdirSync(SUBTITLES_CACHE_DIR, { recursive: true });
    fs.writeFileSync(cachePath, srt, "utf8");
    console.log(`[subtitles] cached: ${path.basename(cachePath)}`);
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(srt);
  } catch (err) {
    console.error(`[subtitles] error:`, {
      message: err.message,
      statusCode: err.statusCode,
      url: err.url,
      contentType: err.contentType,
      retryAfter: err.retryAfter,
      responseBody: err.responseBody
    });
    sendJson(res, 500, { error: err.message });
  }
}

function requestJson(targetUrl, options = {}) {
  const url = typeof targetUrl === "string" ? new URL(targetUrl) : targetUrl;
  const requestModule = getRequestModule(url);
  const redirectCount = Number(options.redirectCount) || 0;

  return new Promise((resolve, reject) => {
    const request = requestModule.request(url, {
      method: options.method || "GET",
      headers: options.headers || {}
    }, (response) => {
      let body = "";

      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });

      response.on("end", () => {
        const rawBody = body.trim();
        let payload = null;

        if (rawBody) {
          try {
            payload = JSON.parse(rawBody);
          } catch {
            payload = null;
          }
        }

        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          if (redirectCount >= 5) {
            reject(new Error("Pedido remoto excedeu o limite de redirects."));
            return;
          }
          resolve(requestJson(new URL(response.headers.location, url), { ...options, redirectCount: redirectCount + 1 }));
          return;
        }

        if (response.statusCode < 200 || response.statusCode >= 300) {
          const contentType = response.headers["content-type"] || "";
          const message = getRemoteErrorMessage(payload, rawBody, response.statusCode, url, contentType);
          const error = new Error(message);
          error.statusCode = response.statusCode;
          error.url = url.toString();
          error.contentType = contentType;
          error.retryAfter = response.headers["retry-after"] || "";
          error.responseBody = rawBody.slice(0, 800);
          reject(error);
          return;
        }

        resolve(payload);
      });
    });

    request.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      request.write(options.body);
    }

    request.end();
  });
}

function requestHeadStatus(targetUrl, options = {}) {
  const url = typeof targetUrl === "string" ? new URL(targetUrl) : targetUrl;
  const requestModule = getRequestModule(url);
  const redirectCount = Number(options.redirectCount) || 0;

  return new Promise((resolve, reject) => {
    const request = requestModule.request(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "MimiFlix/1.0",
        ...(options.headers || {})
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        if (redirectCount >= 5) {
          reject(new Error("Pedido remoto excedeu o limite de redirects."));
          return;
        }
        resolve(requestHeadStatus(new URL(response.headers.location, url), {
          ...options,
          redirectCount: redirectCount + 1
        }));
        return;
      }

      resolve({
        statusCode: response.statusCode || 0,
        headers: response.headers,
        url: url.toString()
      });
    });

    request.on("error", reject);
    request.end();
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1_500_000) {
        reject(new Error("O pedido excede o tamanho permitido."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("O corpo do pedido nao contem JSON valido."));
      }
    });

    req.on("error", reject);
  });
}

function getBearerToken(req) {
  const authHeader = String(req.headers.authorization || "");
  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.slice("Bearer ".length).trim();
}

async function verifySupabaseUser(req, res) {
  const accessToken = getBearerToken(req);

  if (!accessToken) {
    sendJson(res, 401, { error: "Sessao invalida. Inicia sessao novamente." });
    return null;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    sendJson(res, 503, { error: "A sincronizacao nao esta configurada neste servidor." });
    return null;
  }

  try {
    return await requestJson(new URL("/auth/v1/user", SUPABASE_URL), {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`
      }
    });
  } catch (error) {
    sendJson(res, 401, { error: error.message || "Nao foi possivel validar a tua sessao." });
    return null;
  }
}

function isSupabaseLibraryConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function buildSupabaseRestUrl(tableName, queryParams = {}) {
  const url = new URL(`/rest/v1/${tableName}`, SUPABASE_URL);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

async function requestSupabaseTable(tableName, options = {}) {
  if (!isSupabaseLibraryConfigured()) {
    throw new Error("A sincronizacao persistente nao esta configurada neste servidor.");
  }

  return requestJson(buildSupabaseRestUrl(tableName, options.query), {
    method: options.method || "GET",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
}

function getLibraryStateFilePath(userId) {
  ensureDirectory(LIBRARY_STATE_DIR);
  const safeUserId = String(userId || "anonymous").replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(LIBRARY_STATE_DIR, `${safeUserId}.json`);
}

function readStoredLibraryState(userId) {
  const filePath = getLibraryStateFilePath(userId);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function writeStoredLibraryState(userId, state) {
  const filePath = getLibraryStateFilePath(userId);
  const tempPath = `${filePath}.tmp`;
  const body = JSON.stringify(state, null, 2);

  fs.writeFileSync(tempPath, body, "utf8");
  fs.renameSync(tempPath, filePath);
}

async function readSupabaseLibraryState(userId) {
  const rows = await requestSupabaseTable(LIBRARY_STATE_TABLE, {
    query: {
      select: "user_id,state,updated_at",
      user_id: `eq.${userId}`,
      limit: "1"
    }
  });

  if (!Array.isArray(rows) || !rows[0] || typeof rows[0].state !== "object" || Array.isArray(rows[0].state)) {
    return null;
  }

  return rows[0].state;
}

async function writeSupabaseLibraryState(userId, state) {
  const rows = await requestSupabaseTable(LIBRARY_STATE_TABLE, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: [{
      user_id: userId,
      state,
      updated_at: new Date().toISOString()
    }]
  });

  if (!Array.isArray(rows) || !rows[0] || typeof rows[0].state !== "object" || Array.isArray(rows[0].state)) {
    throw new Error("Nao foi possivel guardar o estado sincronizado.");
  }

  return rows[0].state;
}

async function readLibraryState(userId) {
  if (!isSupabaseLibraryConfigured()) {
    return readStoredLibraryState(userId);
  }

  const remoteState = await readSupabaseLibraryState(userId);
  if (remoteState) {
    return remoteState;
  }

  const legacyState = readStoredLibraryState(userId);
  if (legacyState) {
    return await writeSupabaseLibraryState(userId, {
      ...legacyState,
      migratedFromLocalFile: true,
      syncedAt: new Date().toISOString()
    });
  }

  return null;
}

async function writeLibraryState(userId, state) {
  if (!isSupabaseLibraryConfigured()) {
    writeStoredLibraryState(userId, state);
    return state;
  }

  return writeSupabaseLibraryState(userId, state);
}

function sanitizeFriendProfileSnapshot(profile) {
  const shareCode = String(profile?.shareCode || "").trim().slice(0, 160);
  const displayName = String(profile?.displayName || "").trim().slice(0, 40);
  if (!shareCode || !displayName) {
    return null;
  }

  return {
    shareCode,
    ownerUserId: String(profile?.ownerUserId || "").trim().slice(0, 120),
    displayName,
    avatarImage: typeof profile?.avatarImage === "string" && profile.avatarImage.startsWith("data:image/")
      ? profile.avatarImage
      : "",
    avatarText: String(profile?.avatarText || displayName.charAt(0) || "P").trim().slice(0, 2) || "P",
    exportedAt: String(profile?.exportedAt || new Date().toISOString()),
    favorites: Array.isArray(profile?.favorites) ? profile.favorites.slice(0, 18) : [],
    lists: Array.isArray(profile?.lists) ? profile.lists.slice(0, 12) : [],
    topReviews: Array.isArray(profile?.topReviews) ? profile.topReviews.slice(0, 6) : []
  };
}

function upsertFollowedProfile(state, profile) {
  const safeProfile = sanitizeFriendProfileSnapshot(profile);
  if (!safeProfile) {
    return state && typeof state === "object" ? state : {};
  }

  const currentState = state && typeof state === "object" && !Array.isArray(state) ? state : {};
  const followedProfiles = Array.isArray(currentState.followedProfiles) ? currentState.followedProfiles : [];
  const deduped = [
    safeProfile,
    ...followedProfiles.filter((entry) => {
      if (!entry || typeof entry !== "object") return false;
      if (safeProfile.ownerUserId && entry.ownerUserId === safeProfile.ownerUserId) return false;
      return entry.shareCode !== safeProfile.shareCode;
    })
  ].slice(0, 24);

  return {
    ...currentState,
    followedProfiles: deduped,
    updatedAt: new Date().toISOString(),
    syncedAt: new Date().toISOString()
  };
}

async function handleLibraryState(req, res) {
  const user = await verifySupabaseUser(req, res);
  if (!user?.id) return;

  if (req.method === "GET") {
    try {
      sendJson(res, 200, { state: await readLibraryState(user.id) });
      return;
    } catch (error) {
      sendJson(res, 503, { error: error.message || "Nao foi possivel ler o estado sincronizado." });
      return;
    }
  }

  if (req.method !== "PUT") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  try {
    const payload = await readJsonBody(req);

    if (!payload?.state || typeof payload.state !== "object" || Array.isArray(payload.state)) {
      sendJson(res, 400, { error: "Estado de biblioteca invalido." });
      return;
    }

    const stateToStore = {
      ...payload.state,
      syncedAt: new Date().toISOString()
    };

    const storedState = await writeLibraryState(user.id, stateToStore);
    sendJson(res, 200, { state: storedState });
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message || "Nao foi possivel guardar o estado sincronizado." });
  }
}

async function handleFriendConnect(req, res) {
  const user = await verifySupabaseUser(req, res);
  if (!user?.id) return;

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const targetUserId = String(payload?.targetUserId || "").trim().slice(0, 120);
    const currentProfile = sanitizeFriendProfileSnapshot({
      ...payload?.profile,
      ownerUserId: user.id
    });
    const targetProfile = sanitizeFriendProfileSnapshot(payload?.friendProfile);

    if (!targetUserId || targetUserId === user.id) {
      sendJson(res, 400, { error: "Utilizador de destino invalido." });
      return;
    }

    if (!currentProfile || !targetProfile) {
      sendJson(res, 400, { error: "Perfis de amizade invalidos." });
      return;
    }

    const [currentState, targetState] = await Promise.all([
      readLibraryState(user.id),
      readLibraryState(targetUserId)
    ]);
    await Promise.all([
      writeLibraryState(user.id, upsertFollowedProfile(currentState, targetProfile)),
      writeLibraryState(targetUserId, upsertFollowedProfile(targetState, currentProfile))
    ]);
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message || "Nao foi possivel ligar a amizade." });
  }
}

async function handleHomepage(requestUrl, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));

  if (!ensureApiKey(res)) {
    return;
  }

  try {
    const [topTenSection, ...responses] = await Promise.all([
      fetchPortugalTopTenSection(language),
      CATALOG_SECTIONS.map((section) =>
        fetchTmdb(section.endpoint, {
          language,
          page: "1",
          ...section.params
        })
      )
    ].flat());

    const sections = [
      topTenSection,
      ...CATALOG_SECTIONS.map((section, index) => ({
      id: section.id,
      title: section.title,
      movies: (responses[index].results || [])
        .filter((movie) => movie.poster_path || movie.backdrop_path)
        .map(formatMovie)
      }))
    ];

    sendJson(res, 200, {
      featured: pickFeaturedMovie(sections),
      featuredList: pickFeaturedMovies(sections, 5),
      sections
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleSearch(requestUrl, res) {
  const query = String(requestUrl.searchParams.get("q") || "").trim();
  const language = getLanguage(requestUrl.searchParams.get("language"));

  if (!ensureApiKey(res)) {
    return;
  }

  if (!query) {
    sendJson(res, 200, { results: [] });
    return;
  }

  try {
    const data = await fetchTmdb("/search/multi", {
      language,
      page: "1",
      query
    });

    sendJson(res, 200, {
      results: (data.results || [])
        .filter((movie) => ["movie", "tv"].includes(detectMediaType(movie)) && (movie.poster_path || movie.backdrop_path))
        .map(formatMovie)
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleMediaStatus(requestUrl, res) {
  if (requestUrl.searchParams.get("url") === null) {
    sendJson(res, 400, { error: "url obrigatorio." });
    return;
  }

  const target = String(requestUrl.searchParams.get("url") || "").trim();
  let parsedUrl;

  try {
    parsedUrl = new URL(target);
  } catch {
    sendJson(res, 400, { error: "url invalido." });
    return;
  }

  if (!/^https?:$/i.test(parsedUrl.protocol)) {
    sendJson(res, 400, { error: "url invalido." });
    return;
  }

  try {
    const result = await requestHeadStatus(parsedUrl);
    sendJson(res, 200, {
      ok: result.statusCode >= 200 && result.statusCode < 300,
      status: result.statusCode,
      url: result.url
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleLiveSportsHealth(res) {
  try {
    const payload = await fetchVipStreamedApi("/health");
    sendJson(res, 200, payload || { status: "unknown" });
  } catch (error) {
    sendJson(res, error.statusCode || 502, { error: error.message || "Nao foi possivel carregar o estado do servidor de desporto." });
  }
}

// ─── Streamed.pk ──────────────────────────────────────────────
const STREAMED_PK_BASE = "https://streamed.pk";

async function fetchStreamedPk(path) {
  const url = `${STREAMED_PK_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MimiFlix/1.0)",
      "Accept": "application/json",
      "Referer": "https://streamed.pk/"
    },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) throw Object.assign(new Error(`Streamed.pk ${res.status}`), { statusCode: res.status });
  return res.json();
}

async function handleStreamedPkMatches(requestUrl, res) {
  const sport = requestUrl.searchParams.get("sport") || "";
  const liveOnly = requestUrl.searchParams.get("live") === "true";

  try {
    // Fetch live matches + popular matches in parallel
    const [liveMatches, popularMatches] = await Promise.all([
      fetchStreamedPk("/api/matches/live").catch(() => []),
      fetchStreamedPk("/api/matches/popular").catch(() => [])
    ]);

    let allMatches = [...liveMatches];
    // Add popular matches not already in live list
    const liveIds = new Set(allMatches.map(m => m.id));
    for (const m of popularMatches) {
      if (!liveIds.has(m.id)) allMatches.push(m);
    }

    // Filter by sport if requested
    if (sport) {
      const sportLower = sport.toLowerCase();
      allMatches = allMatches.filter(m =>
        String(m.category || "").toLowerCase().includes(sportLower) ||
        String(m.title || "").toLowerCase().includes(sportLower)
      );
    }

    // Filter live only
    if (liveOnly) {
      const liveSet = new Set(liveMatches.map(m => m.id));
      allMatches = allMatches.filter(m => liveSet.has(m.id));
    }

    sendJson(res, 200, { success: true, data: { matches: allMatches, total: allMatches.length } });
  } catch (error) {
    sendJson(res, 200, { success: true, data: { matches: [], total: 0 } });
  }
}

async function handleStreamedPkStream(requestUrl, res) {
  const source = requestUrl.searchParams.get("source") || "";
  const id = requestUrl.searchParams.get("id") || "";

  if (!source || !id) {
    sendJson(res, 400, { error: "source e id são obrigatórios" });
    return;
  }

  try {
    const streams = await fetchStreamedPk(`/api/stream/${encodeURIComponent(source)}/${encodeURIComponent(id)}`);
    sendJson(res, 200, { success: true, data: Array.isArray(streams) ? streams : [] });
  } catch (error) {
    sendJson(res, 200, { success: true, data: [] });
  }
}

async function handleSitemap(res) {
  const BASE = "https://mimiflix.org";
  const lang = "pt-PT";
  const today = new Date().toISOString().split("T")[0];

  try {
    // Fetch popular movies and series for the sitemap
    const [movies, series] = await Promise.all([
      fetchTmdb(`/movie/popular?language=${lang}&page=1`).catch(() => ({ results: [] })),
      fetchTmdb(`/tv/popular?language=${lang}&page=1`).catch(() => ({ results: [] }))
    ]);

    const movieUrls = (movies.results || []).slice(0, 20).map((m) => `
  <url>
    <loc>${BASE}/#/detalhe/movie/${m.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("");

    const seriesUrls = (series.results || []).slice(0, 20).map((s) => `
  <url>
    <loc>${BASE}/#/detalhe/tv/${s.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("");

    const staticUrls = ["/", "/dmca.html", "/privacy.html"].map((p) => `
  <url>
    <loc>${BASE}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${p === "/" ? "1.0" : "0.3"}</priority>
  </url>`).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${movieUrls}
${seriesUrls}
</urlset>`;

    res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
    res.end(xml);
  } catch (err) {
    res.writeHead(500);
    res.end("Erro ao gerar sitemap");
  }
}

async function handleLiveSports(requestUrl, res) {
  const query = {
    sport: requestUrl.searchParams.get("sport") || "",
    live: requestUrl.searchParams.get("live") || "",
    q: requestUrl.searchParams.get("q") || ""
  };

  try {
    const payload = await fetchVipStreamedApi("/streams", { query });
    sendJson(res, 200, payload || { success: true, data: { streams: [], sports: [] } });
  } catch {
    sendJson(res, 200, { success: true, data: { streams: [], sports: [] } });
  }
}

async function handleLiveSportsRefresh(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo nao permitido." });
    return;
  }

  try {
    const payload = await fetchVipStreamedApi("/streams/refresh", { method: "POST" });
    sendJson(res, 200, payload || { success: true });
  } catch (error) {
    sendJson(res, error.statusCode || 502, { error: error.message || "Nao foi possivel refrescar os streams de desporto." });
  }
}

async function handleWatchFootySports(requestUrl, res) {
  const sport = requestUrl.searchParams.get("sport") || "";
  const liveOnly = String(requestUrl.searchParams.get("live") || "").toLowerCase() === "true";
  const query = requestUrl.searchParams.get("q") || "";
  const sportSlugs = getWatchFootySportSlugs(sport);

  if (sport && !sportSlugs.length) {
    sendJson(res, 200, {
      success: true,
      data: {
        matches: [],
        totalMatches: 0,
        totalStreams: 0,
        sports: WATCHFOOTY_SPORTS
      }
    });
    return;
  }

  try {
    const responses = await Promise.all(
      sportSlugs.map((slug) => fetchWatchFootyApi(`/matches/${slug}`).catch(() => []))
    );

    const matches = responses
      .flatMap((payload) => Array.isArray(payload) ? payload : [])
      .filter((match) => match && typeof match === "object")
      .filter((match) => Array.isArray(match.streams) && match.streams.length)
      .filter((match) => !liveOnly || isWatchFootyMatchLive(match))
      .filter((match) => matchesWatchFootyQuery(match, query));

    sendJson(res, 200, {
      success: true,
      data: {
        matches,
        totalMatches: matches.length,
        totalStreams: matches.reduce((sum, match) => sum + (Array.isArray(match.streams) ? match.streams.length : 0), 0),
        sports: WATCHFOOTY_SPORTS
      }
    });
  } catch (error) {
    sendJson(res, error.statusCode || 502, { error: error.message || "Nao foi possivel carregar os eventos do WatchFooty." });
  }
}

async function handleMovieDetails(requestUrl, movieId, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  const watchRegion = getWatchRegion(language);
  if (!ensureApiKey(res)) return;
  try {
    const [movie, providersPayload, credits, releaseDates] = await Promise.all([
      fetchTmdb(`/movie/${movieId}`, { language }),
      fetchTmdb(`/movie/${movieId}/watch/providers`).catch(() => ({ results: {} })),
      fetchTmdb(`/movie/${movieId}/credits`, { language }).catch(() => ({ cast: [], crew: [] })),
      fetchTmdb(`/movie/${movieId}/release_dates`).catch(() => ({ results: [] }))
    ]);
    const collectionPayload = movie.belongs_to_collection?.id
      ? await fetchTmdb(`/collection/${movie.belongs_to_collection.id}`, { language }).catch(() => null)
      : null;
    const premiumPayload = buildMoviePremiumSections(movie, credits, releaseDates, collectionPayload);
    sendJson(res, 200, {
      ...formatMovie(movie),
      genres: Array.isArray(movie.genres) ? movie.genres.map((g) => g.name) : [],
      providers: pickWatchProviders(providersPayload, watchRegion),
      cast: formatCastMembers(credits),
      directors: formatDirectorMembers(credits),
      premium: premiumPayload.premium
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleSimilarMovies(requestUrl, movieId, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  if (!ensureApiKey(res)) return;
  try {
    const [movie, recommendationsData, similarData, keywordData] = await Promise.all([
      fetchTmdb(`/movie/${movieId}`, { language }),
      fetchTmdb(`/movie/${movieId}/recommendations`, { language, page: "1" }),
      fetchTmdb(`/movie/${movieId}/similar`, { language, page: "1" }),
      fetchTmdb(`/movie/${movieId}/keywords`)
    ]);
    const discoverData = await fetchTmdb("/discover/movie", buildRecommendationDiscoverParams(movie, keywordData, language));

    sendJson(res, 200, {
      results: rankRelatedMovies(movie, [
        { source: "recommendations", movies: recommendationsData.results },
        { source: "similar", movies: similarData.results },
        { source: "discover", movies: discoverData.results }
      ])
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleMovieTrailer(requestUrl, movieId, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  if (!ensureApiKey(res)) return;
  try {
    let data = await fetchTmdb(`/movie/${movieId}/videos`, { language });
    let trailers = (data.results || []).filter((v) => v.site === "YouTube" && v.type === "Trailer");
    if (!trailers.length) {
      data = await fetchTmdb(`/movie/${movieId}/videos`, { language: "en-US" });
      trailers = (data.results || []).filter((v) => v.site === "YouTube" && v.type === "Trailer");
    }
    sendJson(res, 200, { key: trailers[0]?.key || null });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleTvDetails(requestUrl, tvId, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  const watchRegion = getWatchRegion(language);
  if (!ensureApiKey(res)) return;

  try {
    const series = await fetchTmdb(`/tv/${tvId}`, { language });
    const seasons = (series.seasons || [])
      .filter((season) => Number(season?.season_number) >= 0)
      .map((season) => ({
        id: season.id,
        season_number: Number(season.season_number) || 0,
        name: season.name || `Temporada ${season.season_number}`,
        air_date: season.air_date || "",
        episode_count: Number(season.episode_count) || 0,
        poster_path: season.poster_path || null
      }));

    const preferredSeasonNumber = Math.max(
      0,
      Number.parseInt(
        String(
          requestUrl.searchParams.get("season")
          || seasons.find((season) => season.season_number > 0)?.season_number
          || seasons[0]?.season_number
          || 1
        ),
        10
      ) || 1
    );

    const [providersPayload, credits, selectedSeason] = await Promise.all([
      fetchTmdb(`/tv/${tvId}/watch/providers`).catch(() => ({ results: {} })),
      fetchTmdb(`/tv/${tvId}/credits`, { language }).catch(() => ({ cast: [], crew: [] })),
      fetchTmdb(`/tv/${tvId}/season/${preferredSeasonNumber}`, { language }).catch(() => ({ episodes: [] }))
    ]);

    sendJson(res, 200, {
      ...formatMovie(series),
      genres: Array.isArray(series.genres) ? series.genres.map((genre) => genre.name) : [],
      providers: pickWatchProviders(providersPayload, watchRegion),
      cast: formatCastMembers(credits),
      directors: (series.created_by || []).length
        ? (series.created_by || []).map((person) => ({
            id: person.id,
            name: person.name,
            job: "Criador",
            profile_path: person.profile_path || null
          }))
        : formatDirectorMembers(credits),
      seasons,
      selected_season: preferredSeasonNumber,
      episodes: (selectedSeason.episodes || []).map((episode) => ({
        id: episode.id,
        episode_number: Number(episode.episode_number) || 0,
        season_number: Number(episode.season_number) || preferredSeasonNumber,
        name: episode.name || `Episódio ${episode.episode_number}`,
        air_date: episode.air_date || "",
        runtime: Number(episode.runtime) || Number(series.episode_run_time?.[0]) || null,
        overview: episode.overview || "",
        still_path: episode.still_path || null
      }))
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleSimilarTv(requestUrl, tvId, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  if (!ensureApiKey(res)) return;

  try {
    const [recommendationsData, similarData] = await Promise.all([
      fetchTmdb(`/tv/${tvId}/recommendations`, { language, page: "1" }),
      fetchTmdb(`/tv/${tvId}/similar`, { language, page: "1" })
    ]);

    sendJson(res, 200, {
      results: uniqueMovies([
        ...(recommendationsData.results || []),
        ...(similarData.results || [])
      ])
        .filter((entry) => entry.poster_path || entry.backdrop_path)
        .slice(0, 16)
        .map(formatMovie)
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleTvTrailer(requestUrl, tvId, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  if (!ensureApiKey(res)) return;
  try {
    let data = await fetchTmdb(`/tv/${tvId}/videos`, { language });
    let trailers = (data.results || []).filter((video) => video.site === "YouTube" && video.type === "Trailer");
    if (!trailers.length) {
      data = await fetchTmdb(`/tv/${tvId}/videos`, { language: "en-US" });
      trailers = (data.results || []).filter((video) => video.site === "YouTube" && video.type === "Trailer");
    }
    sendJson(res, 200, { key: trailers[0]?.key || null });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

async function handleMovieInsights(requestUrl, res) {
  const language = getLanguage(requestUrl.searchParams.get("language"));
  if (!ensureApiKey(res)) return;

  const movieIds = String(requestUrl.searchParams.get("movie_ids") || "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value))
    .slice(0, 24);

  if (!movieIds.length) {
    sendJson(res, 200, { results: [] });
    return;
  }

  try {
    const results = await Promise.all(
      movieIds.map(async (movieId) => {
        const [movie, credits, videos] = await Promise.all([
          fetchTmdb(`/movie/${movieId}`, { language }),
          fetchTmdb(`/movie/${movieId}/credits`, { language }),
          fetchTmdb(`/movie/${movieId}/videos`, { language }).catch(() => ({ results: [] }))
        ]);

        let trailerKey = (videos.results || []).find((video) => video.site === "YouTube" && video.type === "Trailer")?.key || null;
        if (!trailerKey) {
          const fallbackVideos = await fetchTmdb(`/movie/${movieId}/videos`, { language: "en-US" }).catch(() => ({ results: [] }));
          trailerKey = (fallbackVideos.results || []).find((video) => video.site === "YouTube" && video.type === "Trailer")?.key || null;
        }

        return {
          ...formatMovie(movie),
          genres: Array.isArray(movie.genres) ? movie.genres.map((genre) => genre.name).filter(Boolean) : [],
          runtime: Number(movie.runtime) || null,
          cast: Array.isArray(credits.cast) ? credits.cast.slice(0, 6).map((person) => person?.name).filter(Boolean) : [],
          trailerKey
        };
      })
    );

    sendJson(res, 200, { results });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}



function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Length": Buffer.byteLength(body),
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(body);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendNotFound(res);
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Content-Length": data.length
    });
    res.end(data);
  });
}

function sendNotFound(res) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
}

function serveStaticFile(requestUrl, res) {
  const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const normalizedPath = path.normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[\\\/])+/, "");
  const filePath = path.join(PUBLIC_DIR, normalizedPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendNotFound(res);
    return;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    sendFile(res, path.join(PUBLIC_DIR, "index.html"));
    return;
  }

  sendFile(res, filePath);
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/sitemap.xml") {
    await handleSitemap(res);
    return;
  }

  if (requestUrl.pathname === "/api/config") {
    sendJson(res, 200, { supabaseUrl: SUPABASE_URL, supabaseAnonKey: SUPABASE_ANON_KEY });
    return;
  }

  if (requestUrl.pathname === "/api/library-state") {
    await handleLibraryState(req, res);
    return;
  }

  if (requestUrl.pathname === "/api/friends/connect") {
    await handleFriendConnect(req, res);
    return;
  }

  if (requestUrl.pathname === "/api/homepage") {
    await handleHomepage(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/search") {
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Metodo nao permitido." });
      return;
    }
    await handleSearch(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/media/status") {
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Metodo nao permitido." });
      return;
    }
    await handleMediaStatus(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/discover") {
    await handleDiscoverMovies(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/calendar/upcoming") {
    await handleCalendarUpcoming(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/calendar/personal") {
    await handlePersonalCalendar(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/movies/insights") {
    await handleMovieInsights(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/live-sports/health") {
    await handleLiveSportsHealth(res);
    return;
  }

  if (requestUrl.pathname === "/api/live-sports/refresh") {
    await handleLiveSportsRefresh(req, res);
    return;
  }

  if (requestUrl.pathname === "/api/live-sports") {
    await handleLiveSports(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/live-sports/watchfooty") {
    await handleWatchFootySports(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/live-sports/streamed") {
    await handleStreamedPkMatches(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/live-sports/streamed/stream") {
    await handleStreamedPkStream(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/collections") {
    await handleSmartCollections(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/collections/real") {
    await handleRealCollections(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/collections/profile") {
    await handleProfileCollections(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/recommendations/favorites") {
    await handleFavoriteRecommendations(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/recommendations/favorites/upcoming") {
    await handleFavoriteReleaseAlerts(requestUrl, res);
    return;
  }

  const movieMatch = requestUrl.pathname.match(/^\/api\/movie\/(\d+)(\/similar|\/trailer)?$/);
  if (movieMatch) {
    const [, movieId, sub] = movieMatch;
    if (sub === "/similar") await handleSimilarMovies(requestUrl, movieId, res);
    else if (sub === "/trailer") await handleMovieTrailer(requestUrl, movieId, res);
    else await handleMovieDetails(requestUrl, movieId, res);
    return;
  }

  const tvMatch = requestUrl.pathname.match(/^\/api\/tv\/(\d+)(\/similar|\/trailer)?$/);
  if (tvMatch) {
    const [, tvId, sub] = tvMatch;
    if (sub === "/similar") await handleSimilarTv(requestUrl, tvId, res);
    else if (sub === "/trailer") await handleTvTrailer(requestUrl, tvId, res);
    else await handleTvDetails(requestUrl, tvId, res);
    return;
  }

  const personMatch = requestUrl.pathname.match(/^\/api\/person\/(\d+)$/);
  if (personMatch) {
    await handlePersonDetails(requestUrl, personMatch[1], res);
    return;
  }

  if (requestUrl.pathname === "/api/subtitles") {
    await handleSubtitleSearch(requestUrl, res);
    return;
  }

  serveStaticFile(requestUrl, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`MimiFlix em http://localhost:${PORT}`);
});
