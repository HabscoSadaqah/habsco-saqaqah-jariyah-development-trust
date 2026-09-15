/* Habsco: privacy-first network policy. No application data is cached client-side. */
const VERSION="habsco-no-store-v1";
const isAppPage=()=>true;

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.map(k=>caches.delete(k)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request,{cache:"no-store",credentials:"same-origin"});
      const headers=new Headers(response.headers);
      headers.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0, private");
      headers.set("Pragma","no-cache");
      headers.set("Expires","0");
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
    }catch(error){
      throw error;
    }
  })());
});
