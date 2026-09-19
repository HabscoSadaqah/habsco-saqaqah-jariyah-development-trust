// HABSCO FAST WORKER v21: lean cache; old worker/cache variants are retired on activation.
// Previous worker caches and legacy service-worker caches are retired automatically during activation.
// Keep this worker intentionally small: no polling, no repeated network loops, no heavy runtime work.
const CACHE_NAME = "habsco-static-v21";

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
  "/favicon.svg",
  "/index.html",
  "/main.js?v=7",
  "/style.css",
  "/app.css?v=home-shell-5",
  "/member.html",
  "/member.js?v=20260919-7",
  "/member-unified-balance.js?v=20260919-5",
  "/security-center-ui.js?v=20260915-2",
  "/savings-root-fix.js?v=20260915-2"
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

  // Return cached HTML immediately on repeat visits; refresh it in the background.
  if (request.destination === "document") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const update = (event.preloadResponse || fetch(request, { cache: "no-store" }))
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || update;
      })
    );
    return;
  }

  if (!STATIC_DESTINATIONS.has(request.destination)) return;

  // Cache-first: cached assets return immediately. Network runs only on a cold cache.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
