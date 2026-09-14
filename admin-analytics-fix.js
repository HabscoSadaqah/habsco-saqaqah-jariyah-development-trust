(()=>{
'use strict';
const run=()=>{
 const content=document.getElementById('hfAdminContent');
 const analytics=content?.querySelector('.hf-admin-view[data-view="analytics"]');
 if(!content||!analytics)return false;
 const slot=analytics.querySelector('.hf-original-slot');
 if(!slot)return false;
 const stats=document.querySelector('.stats');
 if(!stats)return false;
 // Force the five KPI cards to live only inside Analytics & Insights.
 if(stats.parentElement!==slot)slot.appendChild(stats);
 stats.classList.add('hf-analytics-kpis');
 stats.style.setProperty('display','grid','important');
 // Never allow a duplicate/original KPI grid elsewhere in the admin shell.
 content.querySelectorAll('.stats').forEach(el=>{if(el!==stats)el.remove()});
 return true;
};
const start=()=>{
 if(run())return;
 let tries=0;
 const timer=setInterval(()=>{if(run()||++tries>60)clearInterval(timer)},100);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
