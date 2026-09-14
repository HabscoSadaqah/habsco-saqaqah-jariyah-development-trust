(()=>{
'use strict';
const findStats=()=>document.querySelector('#membersCount')?.closest('.stats')||document.querySelector('.stats');
const installCss=()=>{
 let s=document.getElementById('hfAnalyticsPlacementCss');
 if(!s){s=document.createElement('style');s.id='hfAnalyticsPlacementCss';document.head.appendChild(s)}
 s.textContent=`
 #hfAdminContent .hf-admin-view:not([data-view="analytics"]) .stats{display:none!important}
 #hfAdminContent .hf-admin-view[data-view="analytics"] .stats{display:grid!important}
 #hfAdminContent .hf-admin-view[data-view="analytics"] .hf-original-slot>.stats{display:grid!important}
 #hfAdminContent>.stats{display:none!important}
 #adminAnalytics{display:none!important}
 `;
};
const makeFallback=()=>{
 const app=document.getElementById('app');
 if(!app||document.getElementById('hfStandaloneAnalytics'))return;
 const stats=findStats();
 if(!stats)return;
 const bar=document.createElement('div');bar.id='hfStandaloneAnalyticsBar';bar.style.cssText='display:flex;gap:8px;margin:0 0 14px;';
 const button=document.createElement('button');button.type='button';button.textContent='📈 Analytics & Insights';button.style.cssText='border:0;border-radius:11px;background:#087443;color:#fff;padding:11px 15px;font-weight:900;cursor:pointer;';
 const section=document.createElement('section');section.id='hfStandaloneAnalytics';section.style.cssText='display:none;background:#fff;border:1px solid #e0e8e3;border-radius:18px;padding:15px;margin-bottom:14px;';
 const title=document.createElement('div');title.innerHTML='<strong style="font-size:14px;color:#18382a">Analytics & Insights</strong><div style="font-size:9px;color:#718078;margin-top:3px">Live member and cooperative financial insights</div>';
 section.appendChild(title);section.appendChild(stats);app.insertBefore(bar,app.firstElementChild);app.insertBefore(section,bar.nextSibling);button.onclick=()=>{stats.style.setProperty('display','grid','important');section.style.display='block';document.querySelectorAll('#app>.stats').forEach(x=>x!==stats&&x.style.setProperty('display','none','important'));window.scrollTo({top:0,behavior:'smooth'});};bar.appendChild(button);
};
const enforce=()=>{
 installCss();
 document.getElementById('adminAnalytics')?.remove();
 const content=document.getElementById('hfAdminContent');
 const analytics=content?.querySelector('.hf-admin-view[data-view="analytics"]');
 const slot=analytics?.querySelector('.hf-original-slot');
 const stats=findStats();
 if(content&&analytics&&slot&&stats){
   if(stats.parentElement!==slot)slot.appendChild(stats);
   stats.classList.add('hf-analytics-kpis');
   stats.style.setProperty('display','grid','important');
   stats.style.setProperty('grid-template-columns','repeat(5,minmax(0,1fr))','important');
   stats.style.setProperty('gap','9px','important');
   stats.style.setProperty('margin','0 0 14px','important');
   content.querySelectorAll('.stats').forEach(el=>{if(el!==stats)el.style.setProperty('display','none','important')});
   return true;
 }
 makeFallback();
 return !!document.getElementById('hfStandaloneAnalytics');
};
const start=()=>{
 let tries=0;
 const timer=setInterval(()=>{if(enforce()||++tries>200)clearInterval(timer)},100);
 enforce();
 const observer=new MutationObserver(()=>enforce());
 observer.observe(document.body,{childList:true,subtree:true});
 setTimeout(()=>observer.disconnect(),30000);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();