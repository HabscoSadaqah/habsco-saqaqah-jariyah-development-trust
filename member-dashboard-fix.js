(function(){
'use strict';
if(location.pathname.split('/').pop()!=='member.html')return;
function clean(){
  const hide=['.hero p','.balance-card .helper','.app-card span','.loan-card p','.footer-note','.hf-admin-panel p','.hf-admin-note','.hf-savings-note','.hf-savings-eyebrow','.hf-savings-head p','.hf-savings-months','#hfAdminDashboard'];
  if(!document.getElementById('habsco-member-cleanup-style')){
    const s=document.createElement('style');s.id='habsco-member-cleanup-style';
    s.textContent=hide.join(',')+'{display:none!important}.section-title{margin-top:18px!important;margin-bottom:8px!important}.app-card{min-height:92px!important}.loan-card{padding:14px!important}';
    document.head.appendChild(s);
  }
  document.querySelectorAll('.footer-note,#hfAdminDashboard').forEach(e=>e.remove());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
new MutationObserver(clean).observe(document.documentElement,{childList:true,subtree:true});
})();
