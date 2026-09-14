(()=>{
'use strict';
const installCss=()=>{
 if(document.getElementById('hfAnalyticsPlacementCss'))return;
 const s=document.createElement('style');
 s.id='hfAnalyticsPlacementCss';
 s.textContent=`
#hfAdminContent .hf-admin-view:not([data-view="analytics"]) .stats{display:none!important}
#hfAdminContent .hf-admin-view[data-view="analytics"] .stats{display:grid!important}
#hfAdminContent .hf-admin-view[data-view="analytics"] .hf-original-slot>.stats{display:grid!important}
`;
 document.head.appendChild(s);
};
const enforce=()=>{
 installCss();
 const content=document.getElementById('hfAdminContent');
 const analytics=content?.querySelector('.hf-admin-view[data-view="analytics"]');
 const slot=analytics?.querySelector('.hf-original-slot');
 if(!content||!analytics||!slot)return false;
 // The legacy analytics block from admin.js is a different KPI set. Remove it completely.
 document.getElementById('adminAnalytics')?.remove();
 const stats=document.querySelector('#membersCount')?.closest('.stats') || document.querySelector('.stats');
 if(!stats)return false;
 // Physically move the real five live admin KPIs into Analytics & Insights.
 if(stats.parentElement!==slot)slot.appendChild(stats);
 stats.classList.add('hf-analytics-kpis');
 stats.style.setProperty('display','grid','important');
 stats.style.setProperty('grid-template-columns','repeat(5,minmax(0,1fr))','important');
 stats.style.setProperty('gap','9px','important');
 stats.style.setProperty('margin','0 0 14px','important');
 // Hide/remove every other stats grid inside the admin shell.
 content.querySelectorAll('.stats').forEach(el=>{if(el!==stats)el.style.setProperty('display','none','important')});
 content.querySelectorAll('.hf-admin-view:not([data-view="analytics"]) .hf-analytics-kpis').forEach(el=>{if(el!==stats)el.remove()});
 return true;
};
const start=()=>{
 let tries=0;
 const timer=setInterval(()=>{if(enforce()||++tries>150)clearInterval(timer)},100);
 enforce();
 const observerTarget=()=>document.getElementById('hfAdminContent');
 const attach=()=>{
   const content=observerTarget();
   if(!content||content.__hfAnalyticsObserver)return;
   const observer=new MutationObserver(()=>enforce());
   observer.observe(content,{childList:true,subtree:true});
   content.__hfAnalyticsObserver=observer;
 };
 attach();
 setTimeout(attach,500);
 setTimeout(attach,1500);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
