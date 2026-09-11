// Habsco Sadaqah Jariyah Development Trust — universal bottom shortcut navigation
(() => {
  if (document.querySelector('.app-bottom-nav')) return;
  const path = location.pathname.split('/').pop() || 'index.html';
  const page = path.replace('.html','') || 'index';
  const items = [
    ['index.html','⌂','Home','index'],
    ['impact.html','◈','Impact','impact'],
    ['finance.html','₦','Finance','finance'],
    ['about.html','●','About','about'],
    ['contact.html','♡','Donate','contact']
  ];
  const nav = document.createElement('nav');
  nav.className = 'app-bottom-nav';
  nav.setAttribute('aria-label','Quick navigation');
  nav.innerHTML = items.map(([href,icon,label,key]) =>
    `<a href="${href}" class="${page===key?'active':''}"><span>${icon}</span><small>${label}</small></a>`
  ).join('');
  const style = document.createElement('style');
  style.textContent = `
    .app-bottom-nav{position:fixed;z-index:9999;left:50%;bottom:14px;transform:translateX(-50%);width:min(680px,calc(100% - 28px));display:grid;grid-template-columns:repeat(5,1fr);gap:5px;padding:8px;background:rgba(255,255,255,.96);border:1px solid rgba(8,116,67,.14);border-radius:22px;box-shadow:0 14px 40px rgba(5,55,29,.20);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
    .app-bottom-nav a{min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:8px 5px;border-radius:15px;color:#587064;text-decoration:none;font-weight:800;transition:.18s ease;-webkit-tap-highlight-color:transparent}
    .app-bottom-nav a span{font-size:19px;line-height:1}.app-bottom-nav a small{font-size:10px;line-height:1.1}.app-bottom-nav a.active{background:#087443;color:#fff;box-shadow:0 5px 14px rgba(8,116,67,.22)}
    .app-bottom-nav a:active{transform:scale(.95)}
    body{padding-bottom:92px!important}
    @media(max-width:600px){.app-bottom-nav{left:0;bottom:0;transform:none;width:100%;border-radius:18px 18px 0 0;padding:7px max(7px,env(safe-area-inset-left)) calc(7px + env(safe-area-inset-bottom)) max(7px,env(safe-area-inset-right));gap:2px}.app-bottom-nav a{padding:7px 3px;border-radius:12px}.app-bottom-nav a span{font-size:17px}.app-bottom-nav a small{font-size:9px}body{padding-bottom:88px!important}}
  `;
  document.head.appendChild(style);
  document.body.appendChild(nav);
})();
