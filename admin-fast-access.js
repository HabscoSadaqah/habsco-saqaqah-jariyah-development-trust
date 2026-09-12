(()=>{
  const path=location.pathname.split('/').filter(Boolean).pop()||'index.html';
  const isCenter=path==='admin-control-center.html',isPortal=path==='admin.html';
  if(!isCenter&&!isPortal)return;
  if(document.getElementById('hfFastAccess')||document.getElementById('hfAdminSingleNav'))return;

  if(isPortal){
    const clean=()=>{
      if(document.getElementById('hfAdminSingleNav'))return;
      const app=document.getElementById('app'),wrap=document.querySelector('.wrap');
      if(!app||!wrap)return;
      const style=document.createElement('style');style.id='hfAdminSingleStyle';style.textContent=`
        body{background:#f4f7f5!important;padding-bottom:20px!important}.sidebar,.mobile-nav,.top,.hero,.profile,.control-note,.quick{display:none!important}.wrap{padding:12px 18px 26px!important}#app{display:block!important}#hfAdminSingleNav{position:sticky;top:7px;z-index:1000;background:#083e27;border-radius:13px;padding:7px;margin:0 0 14px;box-shadow:0 8px 24px #0002}#hfAdminSingleNavInner{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none}#hfAdminSingleNavInner::-webkit-scrollbar{display:none}#hfAdminSingleNav button{border:1px solid #2a9b69;background:#126b42;color:#fff;border-radius:9px;padding:9px 11px;font:800 10px Inter,system-ui,sans-serif;white-space:nowrap;cursor:pointer}#hfAdminSingleNav button.active{background:#14834e}#app>.stats{grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin-bottom:14px}#app>.stats .card{padding:12px;border-radius:12px}#app>.stats .stat{font-size:20px}#app>.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}#app>.panel,#app>.grid>.panel{margin-bottom:12px;padding:14px;border-radius:13px}#app h2{font-size:15px!important}#app .notice{font-size:12px}#app .table-wrap{max-height:430px;overflow:auto}#app table{min-width:640px}.footer-note{display:none!important}@media(max-width:850px){.wrap{padding:8px 10px 22px!important}#app>.stats{grid-template-columns:repeat(2,minmax(0,1fr))!important}#app>.grid{grid-template-columns:1fr!important}#app .table-wrap{max-height:360px}}`;
      document.head.appendChild(style);
      const nav=document.createElement('nav');nav.id='hfAdminSingleNav';nav.innerHTML='<div id="hfAdminSingleNavInner"></div>';const inner=nav.firstElementChild;
      [['admin-dashboard','⌂ Dashboard'],['wallet','₦ Wallet'],['member-ids','ID Member IDs'],['funding-only','↓ Funding'],['qard-only','↗ Loans'],['repayments','↩ Repayments'],['members','● Members'],['audit','✓ Audit'],['analytics','▦ Analytics']].forEach(([key,label])=>{const b=document.createElement('button');b.type='button';b.dataset.key=key;b.textContent=label;inner.appendChild(b)});wrap.insertBefore(nav,wrap.firstChild);
      const setDisplay=(el,v)=>{if(el)el.style.display=v};
      const focus=key=>{
        app.querySelectorAll(':scope > .section-title').forEach(x=>setDisplay(x,key==='admin-dashboard'?'':'none'));
        app.querySelectorAll(':scope > .stats').forEach(x=>setDisplay(x,key==='admin-dashboard'?'grid':'none'));
        app.querySelectorAll(':scope > .panel,:scope > .grid').forEach(x=>setDisplay(x,key==='admin-dashboard'?'block':'none'));
        if(key==='funding-only'){const g=document.getElementById('requests');setDisplay(g,'grid');if(g){setDisplay(g.children[0],'block');setDisplay(g.children[1],'none')}}
        else if(key==='qard-only'){const g=document.getElementById('requests');setDisplay(g,'grid');if(g){setDisplay(g.children[0],'none');setDisplay(g.children[1],'block')}setDisplay(document.getElementById('approvedQardTable')?.closest('.panel'),'block')}
        else if(key==='analytics')setDisplay(document.getElementById('adminAnalytics'),'block');
        else if(key!=='admin-dashboard')setDisplay(document.getElementById(key),'block');
        inner.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.key===key));history.replaceState(null,'',`#${key}`);window.scrollTo(0,0);
      };
      inner.addEventListener('click',e=>{const b=e.target.closest('button');if(b)focus(b.dataset.key)});window.__adminFocus=focus;focus(location.hash?location.hash.slice(1):'admin-dashboard');
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean);else clean();
    return;
  }

  const style=document.createElement('style');style.textContent=`#hfFastAccess{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9999;display:flex;gap:5px;padding:7px;background:rgba(6,47,32,.97);border-radius:17px;box-shadow:0 14px 38px rgba(0,0,0,.22);max-width:calc(100vw - 20px)}#hfFastAccess a{display:flex;align-items:center;justify-content:center;gap:6px;min-width:70px;height:38px;padding:0 10px;border-radius:11px;color:#eaf8f0;text-decoration:none;font:800 10px/1 Inter,system-ui,sans-serif;white-space:nowrap}#hfFastAccess a:hover,#hfFastAccess a.active{background:#14834e;color:#fff}@media(max-width:600px){#hfFastAccess{bottom:7px;width:calc(100vw - 12px);justify-content:space-between}#hfFastAccess a{min-width:0;flex:1;height:42px;padding:0 4px;font-size:8px;flex-direction:column}}`;document.head.appendChild(style);
  const nav=document.createElement('nav');nav.id='hfFastAccess';nav.innerHTML=(isCenter?[['#dashboard','🏠','Home'],['#membersView','👥','Members'],['#wallet','💳','Wallet'],['#funding','📥','Funding'],['#financing','🤝','Loans'],['#security','🛡️','Security']]:[['member.html','👤','My Account']]).map(x=>`<a href="${x[0]}">${x[1]} ${x[2]}</a>`).join('');document.body.appendChild(nav);
})();