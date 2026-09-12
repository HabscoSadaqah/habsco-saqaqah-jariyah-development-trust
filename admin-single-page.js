(()=>{
  const style=document.createElement('style');
  style.textContent=`
    body{background:#f3f6f4!important;padding-bottom:24px!important}
    .wrap{padding:14px 18px 28px!important}
    .hero{display:none!important}.profile{display:none!important}.control-note{display:none!important}.top{display:none!important}
    .section-title{margin:18px 0 9px!important;font-size:15px!important;letter-spacing:.1px!important}
    #app{display:block!important}#app>.section-title:first-child{display:none!important}
    #persistentAdminNav{position:sticky!important;top:8px!important;left:auto!important;transform:none!important;width:100%!important;margin:0 0 12px!important;border-radius:12px!important}
    #persistentAdminNav .persistent-admin-nav-inner{gap:5px!important}
    #persistentAdminNav button{font-size:10px!important;padding:8px 10px!important}
    .admin-focus-only,.admin-focus-grid,.admin-focus-dashboard,.admin-focus-analytics{display:block!important}
    .admin-focus-grid{display:grid!important}#requests{display:grid!important}#requests>.panel{display:block!important}#repayments{display:block!important}#adminAnalytics{display:block!important}
    #adminAnalytics>.stats{display:none!important}
    #app>.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px!important}
    #app>.panel,#app>.grid>.panel{margin-bottom:10px!important;padding:14px!important;border-radius:13px!important}
    #app>.stats{grid-template-columns:repeat(5,minmax(0,1fr));gap:8px!important;margin-bottom:12px!important}
    #app>.stats .card{padding:12px!important;border-radius:12px!important}.stat{font-size:20px!important}
    #app .table-wrap{max-height:430px;overflow:auto}#app table{min-width:640px}
    #app h2{font-size:15px!important;margin-bottom:10px!important}#app .notice{font-size:12px!important}
    #app .form{gap:8px!important}#app .form input,#app .form select{min-height:40px!important;padding:9px!important}#app .btn{padding:9px 11px!important;font-size:11px!important}
    .footer-note{display:none!important}
    @media(max-width:850px){.wrap{padding:8px 10px 22px!important}#app>.stats{grid-template-columns:repeat(2,minmax(0,1fr))!important}#app>.grid{grid-template-columns:1fr!important}#persistentAdminNav{top:5px!important}#app .table-wrap{max-height:360px}}
  `;
  document.head.appendChild(style);

  const wireNav=()=>{
    const nav=document.getElementById('persistentAdminNav');
    if(!nav)return false;
    nav.querySelectorAll('button').forEach(btn=>{
      if(btn.dataset.singlePageWired)return;
      btn.dataset.singlePageWired='1';
      btn.addEventListener('click',e=>{
        e.preventDefault();e.stopImmediatePropagation();
        const map={'admin-dashboard':'admin-dashboard','wallet':'wallet','member-ids':'member-ids','funding-only':'requests','qard-only':'qard','repayments':'repayments','members':'members','audit':'audit','analytics':'adminAnalytics'};
        const target=document.getElementById(map[btn.dataset.target]||btn.dataset.target);
        if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
      },true);
    });
    return true;
  };
  const reveal=()=>{
    const app=document.getElementById('app');if(!app)return false;
    app.querySelectorAll('.admin-focus-only,.admin-focus-grid,.admin-focus-dashboard,.admin-focus-analytics').forEach(el=>{el.classList.add('active-focus');el.style.removeProperty('display')});
    app.querySelectorAll('.section-title').forEach(el=>el.style.removeProperty('display'));
    document.getElementById('admin-dashboard')?.classList.add('active-focus');
    return true;
  };
  const run=()=>{document.querySelector('.sidebar')?.remove();document.querySelector('.mobile-nav')?.remove();document.querySelector('.quick')?.remove();document.querySelector('.top')?.remove();wireNav();reveal()};
  let tries=0;const timer=setInterval(()=>{run();if(document.getElementById('persistentAdminNav')&&document.getElementById('app')){clearInterval(timer);observer.disconnect()}if(++tries>80)clearInterval(timer)},100);
  const observer=new MutationObserver(run);observer.observe(document.body,{childList:true,subtree:true});
})();
