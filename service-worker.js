const CACHE_NAME = "habsco-static-v12";

const STATIC_DESTINATIONS = new Set([
  "style",
  "script",
  "image",
  "font",
  "manifest"
]);

// Small critical shell only. Failures are ignored so one missing optional asset
// never blocks the service worker from installing.
const PRECACHE = [
  "/auth.html",
  "/home.html",
  "/style.css",
  "/auth.js?v=20260917-14",
  "/biometric-gate.js?v=20260912-13",
  "/finance-3d.css?v=11",
  "/favicon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE.map((url) => cache.add(url).catch(() => null))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.registration.navigationPreload?.enable())
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Always get fresh HTML. This prevents stale pages after deployments.
  if (request.destination === "document") {
    event.respondWith(
      (event.preloadResponse || fetch(request, { cache: "no-store" }))
        .then((response) => response)
        .catch(() => caches.match(request))
    );
    return;
  }

  if (!STATIC_DESTINATIONS.has(request.destination)) return;

  // Cache-first makes repeat visits essentially instant. A background refresh
  // keeps assets current without delaying the page.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request, { cache: "no-store" })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
