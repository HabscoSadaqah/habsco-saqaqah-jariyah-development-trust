(()=>{
'use strict';
const enforce=()=>{
 const content=document.getElementById('hfAdminContent');
 const analytics=content?.querySelector('.hf-admin-view[data-view="analytics"]');
 const slot=analytics?.querySelector('.hf-original-slot');
 if(!content||!analytics||!slot)return false;
 const stats=document.querySelector('#membersCount')?.closest('.stats') || document.querySelector('.stats');
 if(!stats)return false;
 // There must be exactly one KPI grid, and it must physically live in Analytics & Insights.
 if(stats.parentElement!==slot)slot.appendChild(stats);
 stats.classList.add('hf-analytics-kpis');
 stats.style.setProperty('display','grid','important');
 stats.style.setProperty('grid-template-columns','repeat(5,minmax(0,1fr))','important');
 stats.style.setProperty('gap','9px','important');
 stats.style.setProperty('margin','0 0 14px','important');
 // Remove any duplicate KPI grids from every other admin section.
 content.querySelectorAll('.stats').forEach(el=>{if(el!==stats)el.remove()});
 content.querySelectorAll('.hf-admin-view:not([data-view="analytics"]) .hf-analytics-kpis').forEach(el=>{if(el!==stats)el.remove()});
 return true;
};
const start=()=>{
 let tries=0;
 const timer=setInterval(()=>{
   const ok=enforce();
   if(ok||++tries>100)clearInterval(timer);
 },100);
 enforce();
 // Keep the placement correct if another admin script refreshes or re-renders DOM nodes.
 const content=document.getElementById('hfAdminContent');
 if(content&&!content.__hfAnalyticsObserver){
   const observer=new MutationObserver(()=>enforce());
   observer.observe(content,{childList:true,subtree:true});
   content.__hfAnalyticsObserver=observer;
 }
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
