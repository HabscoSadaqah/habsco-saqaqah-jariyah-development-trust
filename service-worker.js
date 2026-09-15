/* Habsco privacy-first network policy: never cache application data. */
const CLEANUP=`<script>(function(){try{for(const s of [localStorage,sessionStorage]){for(let i=s.length-1;i>=0;i--){const k=s.key(i)||'';if(!/^sb-[a-z0-9]+-auth-token$/.test(k)&&!/^supabase\./i.test(k))s.removeItem(k)}}if('caches'in window)caches.keys().then(a=>a.forEach(k=>caches.delete(k)));}catch(e){}})();<\/script>`;

self.addEventListener('install',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)));await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)));await self.clients.claim()})()));

self.addEventListener('fetch',event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const response=await fetch(event.request,{cache:"no-store",credentials:"same-origin"});
    const headers=new Headers(response.headers);
    headers.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0, private");
    headers.set("Pragma","no-cache");
    headers.set("Expires","0");
    const type=headers.get("content-type")||"";
    if(type.includes("text/html")){
      const text=await response.text();
      const body=text.includes("</body>")?text.replace("</body>",CLEANUP+"</body>"):text+CLEANUP;
      return new Response(body,{status:response.status,statusText:response.statusText,headers});
    }
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  })());
});
