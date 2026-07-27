// Suprepa service worker.
//
// Bump CACHE_VERSION on every deploy that changes index.html, app.js, or any cached
// static asset — this is a plain string key, there's no content hashing/build step here,
// so without bumping it, returning visitors could keep an old cached app.js indefinitely.
const CACHE_VERSION = "suprepa-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json",
  "/images/logo-96.png",
  "/images/logo-180.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Exam/correction/exams-list data: network-first, so a connected student always sees
  // the latest corrections, but a previously-opened exam still opens with no connection —
  // this is the actual offline value (review what you've already seen), not a promise of
  // browsing the whole site offline.
  if (url.pathname.startsWith("/api/")){
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(DATA_CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // App shell and static assets: cache-first, fall back to network, and refresh the
  // cache in the background so the next load picks up a new deploy.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200){
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
