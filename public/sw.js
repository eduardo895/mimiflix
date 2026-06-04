const CACHE_NAME = "mimiflix-v2";
const STATIC_ASSETS = [
  "/",
  "/styles.css",
  "/app.js",
  "/manifest.json"
];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Static assets (CSS/JS/fonts): Cache First
// - API calls: Network First with cache fallback
// - Images (TMDB): Stale While Revalidate
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin except TMDB images
  if (request.method !== "GET") return;

  // API calls — Network First
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // TMDB images — Stale While Revalidate
  if (url.hostname.includes("tmdb.org") || url.hostname.includes("image.tmdb")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const fetched = fetch(request).then((res) => {
            cache.put(request, res.clone());
            return res;
          });
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Static assets — Cache First
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok && !url.pathname.startsWith("/api/")) {
        caches.open(CACHE_NAME).then((cache) => cache.put(request, res.clone()));
      }
      return res;
    }))
  );
});
