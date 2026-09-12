(()=>{
  const path=location.pathname.split('/').filter(Boolean).pop()||'index.html';
  const isCenter=path==='admin-control-center.html';
  const isPortal=path==='admin.html';
  if(!isCenter&&!isPortal)return;
  if(document.getElementById('hfFastAccess'))return;
  const style=document.createElement('style');
  style.id='hfFastAccessStyle';
  style.textContent=`
    #hfFastAccess{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:6px;padding:7px;background:rgba(6,47,32,.96);border:1px solid rgba(255,255,255,.12);border-radius:18px;box-shadow:0 14px 38px rgba(0,0,0,.22);backdrop-filter:blur(14px);max-width:calc(100vw - 24px)}
    #hfFastAccess a{display:flex;align-items:center;justify-content:center;gap:6px;min-width:72px;height:38px;padding:0 10px;border-radius:12px;color:#eaf8f0;text-decoration:none;font:800 10px/1 Inter,system-ui,sans-serif;white-space:nowrap}
    #hfFastAccess a:hover,#hfFastAccess a.active{background:#14834e;color:#fff}
    #hfFastAccess .ico{font-size:15px}
    @media(max-width:600px){#hfFastAccess{bottom:9px;gap:3px;padding:5px;border-radius:15px;width:calc(100vw - 14px);justify-content:space-between}#hfFastAccess a{min-width:0;flex:1;height:42px;padding:0 5px;font-size:8px;flex-direction:column;gap:3px;border-radius:10px}#hfFastAccess .ico{font-size:16px}}
  `;
  document.head.appendChild(style);
  const nav=document.createElement('nav');nav.id='hfFastAccess';nav.setAttribute('aria-label','Fast admin access');
  const items=isCenter?[
    ['#dashboard','🏠','Home'],['#membersView','👥','Members'],['#wallet','💳','Wallet'],['#funding','📥','Funding'],['#financing','🤝','Loans'],['#security','🛡️','Security']
  ]:[
    ['#admin-dashboard','🏠','Dashboard'],['#wallet','💳','Wallet'],['#requests','📥','Requests'],['#members','👥','Members'],['#audit','🛡️','Audit'],['member.html','👤','My Account']
  ];
  items.forEach(([href,ico,label])=>{const a=document.createElement('a');a.href=href;a.innerHTML=`<span class="ico">${ico}</span><span>${label}</span>`;if(href.startsWith('#'))a.addEventListener('click',()=>setTimeout(()=>setActive(href),80));nav.appendChild(a)});
  document.body.appendChild(nav);
  function setActive(hash){nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===hash))}
  setActive(location.hash||'#'+(isCenter?'dashboard':'admin-dashboard'));
  window.addEventListener('hashchange',()=>setActive(location.hash));
})();