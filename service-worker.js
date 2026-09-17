const CACHE_NAME = "habsco-static-v2";
const STATIC_DESTINATIONS = new Set(["style", "script", "image", "font", "manifest"]);

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.registration.navigationPreload?.enable())
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML must always see the latest deployment. Use navigation preload when available
  // and fall back to the network; only use the cached document when offline.
  if (request.destination === "document") {
    event.respondWith(
      (event.preloadResponse || fetch(request, { cache: "no-store" }))
        .then((response) => response)
        .catch(() => caches.match(request))
    );
    return;
  }

  if (!STATIC_DESTINATIONS.has(request.destination)) return;

  // Versioned/static assets are safe to cache. Serve the cached copy immediately and
  // refresh it in the background so repeat visits stay fast without going stale forever.
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
