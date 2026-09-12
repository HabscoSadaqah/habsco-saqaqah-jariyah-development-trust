(()=>{
  const path=location.pathname.split('/').filter(Boolean).pop()||'index.html';
  const isCenter=path==='admin-control-center.html';
  const isPortal=path==='admin.html';
  if(!isCenter&&!isPortal)return;
  if(document.getElementById('hfFastAccess'))return;

  const style=document.createElement('style');
  style.id='hfFastAccessStyle';
  style.textContent=`
    #hfFastAccess{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:5px;padding:7px;background:rgba(6,47,32,.97);border:1px solid rgba(255,255,255,.14);border-radius:17px;box-shadow:0 14px 38px rgba(0,0,0,.22);backdrop-filter:blur(14px);max-width:calc(100vw - 20px)}
    #hfFastAccess a{display:flex;align-items:center;justify-content:center;gap:6px;min-width:70px;height:38px;padding:0 10px;border-radius:11px;color:#eaf8f0;text-decoration:none;font:800 10px/1 Inter,system-ui,sans-serif;white-space:nowrap;cursor:pointer}
    #hfFastAccess a:hover,#hfFastAccess a.active{background:#14834e;color:#fff}
    #hfFastAccess .ico{font-size:15px}
    @media(max-width:600px){#hfFastAccess{bottom:7px;gap:3px;padding:5px;border-radius:15px;width:calc(100vw - 12px);justify-content:space-between}#hfFastAccess a{min-width:0;flex:1;height:42px;padding:0 4px;font-size:8px;flex-direction:column;gap:3px;border-radius:10px}#hfFastAccess .ico{font-size:16px}}
  `;
  document.head.appendChild(style);

  const nav=document.createElement('nav');
  nav.id='hfFastAccess';
  nav.setAttribute('aria-label','Fast admin access');
  const items=isCenter?[
    ['#dashboard','🏠','Home'],['#membersView','👥','Members'],['#wallet','💳','Wallet'],['#funding','📥','Funding'],['#financing','🤝','Loans'],['#security','🛡️','Security']
  ]:[
    ['#admin-dashboard','🏠','Dashboard'],['#wallet','💳','Wallet'],['#requests','📥','Requests'],['#members','👥','Members'],['#audit','🛡️','Audit'],['member.html','👤','My Account']
  ];

  items.forEach(([href,ico,label])=>{
    const a=document.createElement('a');
    a.href=href;
    a.innerHTML=`<span class="ico">${ico}</span><span>${label}</span>`;
    nav.appendChild(a);
  });
  document.body.appendChild(nav);

  function setActive(hash){
    nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===hash));
  }

  function go(hash){
    const id=hash.replace(/^#/,'');
    if(!id)return;
    if(isCenter && typeof window.show==='function' && ['dashboard','membersView','wallet','funding','financing','reconcile','security','reports','system'].includes(id)){
      window.show(id);
      history.replaceState(null,'',`#${id}`);
      setActive(`#${id}`);
      window.scrollTo({top:0,behavior:'smooth'});
      return;
    }
    if(isPortal && typeof window.__adminFocus==='function'){
      window.__adminFocus(id);
      setActive(hash);
      return;
    }
    const target=document.getElementById(id);
    if(target){
      target.scrollIntoView({behavior:'smooth',block:'start'});
      history.replaceState(null,'',hash);
      setActive(hash);
    }
  }

  nav.addEventListener('click',e=>{
    const a=e.target.closest('a');
    if(!a)return;
    const href=a.getAttribute('href')||'';
    if(href.startsWith('#')){e.preventDefault();go(href);}
  });

  // Make every existing admin action/link responsive and route through the
  // correct controller instead of relying on fragile inline navigation.
  document.addEventListener('click',e=>{
    const link=e.target.closest('[data-link]');
    if(link){
      const href=link.getAttribute('data-link');
      if(href){e.preventDefault();location.href=href;}
      return;
    }
    const goButton=e.target.closest('[data-go]');
    if(goButton && isCenter){
      const id=goButton.getAttribute('data-go');
      if(id){e.preventDefault();go(id);}
    }
    const viewButton=e.target.closest('[data-view]');
    if(viewButton && isCenter){
      const id=viewButton.getAttribute('data-view');
      if(id){e.preventDefault();go(id);}
    }
  },true);

  setActive(location.hash||'#'+(isCenter?'dashboard':'admin-dashboard'));
  window.addEventListener('hashchange',()=>{
    const hash=location.hash;
    if(hash)setActive(hash);
  });
})();