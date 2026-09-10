// Habsco Sadaqah Jariyah Development Trust — public web-app shell
(() => {
  const path = location.pathname.split('/').pop() || 'index.html';
  const page = path.replace('.html', '') || 'index';
  if (!document.querySelector('link[data-app-css]')) {
    const css=document.createElement('link'); css.rel='stylesheet'; css.href='app.css'; css.dataset.appCss='true'; document.head.appendChild(css);
  }
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.menu');
  if (toggle && menu) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => { const open=menu.classList.toggle('open'); toggle.setAttribute('aria-expanded',String(open)); });
  }
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=document.querySelector(a.getAttribute('href'));if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'});menu?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}}));
  document.querySelectorAll('.menu a[href]').forEach(a=>{const clean=(a.getAttribute('href')||'').split('#')[0];if(clean&&clean===path)a.classList.add('active');});
  if(!['auth.html','admin.html','member.html'].includes(path)){
    const nav=document.createElement('nav');nav.className='app-bottom-nav';nav.setAttribute('aria-label','Quick navigation');
    const items=[['index.html','⌂','Home','index'],['programs.html','◈','Programs','programs'],['finance.html','₦','Finance','finance'],['impact.html','✓','Impact','impact'],['contact.html','♡','Donate','contact']];
    nav.innerHTML=items.map(([href,icon,label,key])=>`<a href="${href}" class="${page===key?'active':''}"><span>${icon}</span><small>${label}</small></a>`).join('');
    document.body.appendChild(nav);document.body.classList.add('public-app');
  }
  if(!document.querySelector('link[rel="manifest"]')){const manifest=document.createElement('link');manifest.rel='manifest';manifest.href='manifest.json';document.head.appendChild(manifest);}
  if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
  document.querySelectorAll('[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();alert('Thank you. Your message has been received. Please connect the form to your preferred email/Formspree/Google Forms service before going live.')}));
  const copyBtn=document.getElementById('copy-account');if(copyBtn)copyBtn.addEventListener('click',async()=>{const number=document.getElementById('account-number')?.textContent?.trim();const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText(number);if(status)status.textContent='Account number copied.'}catch(e){if(status)status.textContent='Please copy the account number manually: '+number}setTimeout(()=>{if(status)status.textContent=''},3000)});
  document.querySelectorAll('[data-finance-tab]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-finance-tab]').forEach(item=>item.classList.remove('active'));document.querySelectorAll('.finance-panel').forEach(panel=>panel.classList.remove('active'));button.classList.add('active');document.getElementById(button.dataset.financeTab)?.classList.add('active');window.scrollTo({top:document.querySelector('.finance-shell')?.offsetTop-90||0,behavior:'smooth'})}));
  document.querySelectorAll('[data-finance-action]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();const action=button.dataset.financeAction;if(action==='dashboard'){window.location.href='auth.html';return}if(action==='admin'){window.location.href='admin.html';return}document.querySelector(`[data-finance-tab="${action}"]`)?.click()}));
  document.querySelectorAll('[data-prototype-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const message=form.querySelector('[data-form-message]');if(message)message.textContent='This public prototype form is not active. Use the authenticated member dashboard for real requests.';form.reset()}));
})();
