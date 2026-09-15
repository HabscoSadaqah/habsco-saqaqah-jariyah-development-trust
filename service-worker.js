/* Habsco service worker: deliberately disabled. Financial/member data must never be cached client-side. */
self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      await self.clients.claim();
      await self.registration.unregister();
    } catch (_) {}
  })());
});
