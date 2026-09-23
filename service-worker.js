// HABSCO FAST WORKER v28: member/admin documents are always network-fresh.
const CACHE_NAME = "habsco-static-v29";

const STATIC_DESTINATIONS = new Set(["style","script","image","font","manifest"]);

const PRECACHE = [
  "/auth.html","/home.html","/style.css","/auth.js?v=20260917-14",
  "/biometric-gate.js?v=20260912-13","/favicon.svg","/index.html",
  "/main.js?v=7","/app.css?v=home-shell-5","/member.html",
  "/member.js?v=20260919-10","/member-unified-balance.js?v=20260919-5",
  "/security-center-ui.js?v=20260915-2"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>Promise.allSettled(PRECACHE.map(url=>cache.add(url).catch(()=>null)))).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.registration.navigationPreload?.enable()).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  // Admin pages must never be served from an old CacheStorage entry.
  if(url.pathname==="/admin"||url.pathname==="/admin.html"){
    event.respondWith(fetch(new Request(request,{cache:"no-store"})));
    return;
  }

  if(request.destination==="document"){
    if(url.pathname==="/statement.html"||url.pathname==="/statement"){
      event.respondWith(fetch(new Request(request,{cache:"no-store"})));
      return;
    }
    event.respondWith(
      caches.match(request).then(cached=>{
        const update=(event.preloadResponse||fetch(request,{cache:"no-store"})).then(response=>{
          if(response?.ok)caches.open(CACHE_NAME).then(cache=>cache.put(request,response.clone()));
          return response;
        }).catch(()=>cached);
        return cached||update;
      })
    );
    return;
  }

  if(!STATIC_DESTINATIONS.has(request.destination))return;
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    if(response.ok)caches.open(CACHE_NAME).then(cache=>cache.put(request,response.clone()));
    return response;
  })));
});
