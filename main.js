// Habsco Sadaqah Jariyah Development Trust — public web-app shell + SEO
(() => {
  const path = location.pathname.split('/').pop() || 'index.html';
  const page = path.replace('.html', '') || 'index';
  const seo = {
    index: ['Habsco Sadaqah Jariyah Development Trust | Charity & Community Projects in Nigeria','Sustainable charity in Nigeria through education, clean water, community empowerment and lasting Sadaqah Jariyah projects.'],
    about: ['About Habsco Sadaqah Jariyah Development Trust | Our Mission','Learn about Habsco Sadaqah Jariyah Development Trust, our mission, values and commitment to sustainable charity and community development in Nigeria.'],
    programs: ['Impact | Habsco Sadaqah Jariyah Development Trust','Explore the community impact of Habsco Sadaqah Jariyah Development Trust through sustainable charity and development projects in Nigeria.'],
    finance: ['Habsco Free-Interest Cooperative | Habsco Sadaqah Jariyah','Learn about the Habsco Free-Interest Multipurpose Cooperative Society, member services and Qard Hasan interest-free assistance.'],
    impact: ['Our Impact | Habsco Sadaqah Jariyah Development Trust','See the community impact of Habsco Sadaqah Jariyah Development Trust through sustainable charity and development projects in Nigeria.'],
    contact: ['Donate & Contact Habsco Sadaqah Jariyah Development Trust','Contact Habsco Sadaqah Jariyah Development Trust for donations, volunteering, partnerships and community project enquiries in Nigeria.']
  };
  const data = seo[page];
  if (data) {
    document.title = data[0];
    const setMeta=(name,content)=>{let el=document.querySelector(`meta[name="${name}"]`);if(!el){el=document.createElement('meta');el.name=name;document.head.appendChild(el)}el.content=content};
    setMeta('description',data[1]); setMeta('robots','index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:large');
    let canonical=document.querySelector('link[rel="canonical"]'); if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)} canonical.href='https://habscosadaqah.org/'+(page==='index'?'':page+'.html');
    const setOG=(prop,content)=>{let el=document.querySelector(`meta[property="${prop}"]`);if(!el){el=document.createElement('meta');el.setAttribute('property',prop);document.head.appendChild(el)}el.content=content};
    setOG('og:type','website'); setOG('og:url',canonical.href); setOG('og:title',data[0]); setOG('og:description',data[1]); setOG('og:site_name','Habsco Sadaqah Jariyah Development Trust');
  }
  if (!document.querySelector('link[data-app-css]')) {
    const css=document.createElement('link'); css.rel='stylesheet'; css.href='app.css'; css.dataset.appCss='true'; document.head.appendChild(css);
  }

  const publicPages=['index.html','about.html','programs.html','impact.html','finance.html','contact.html'];
  const isPublic=publicPages.includes(path);
  const applyPublicShell=()=>{
    if(!publicPages.includes(path)) return;
    document.body.classList.add('public-app');

    // Remove every old public top navigation element. Keep only the organisation logo.
    document.querySelectorAll('.topbar, body > .topbar, header nav, header .menu, header .mobile-toggle, .site-nav, .top-nav, .main-nav, .navbar, .nav-links').forEach(el=>el.remove());
    const header=document.querySelector('header');
    if(header){
      let brand=header.querySelector('.brand');
      if(!brand){
        const img=header.querySelector('img[alt*="Habsco"]');
        if(img){brand=img.closest('a')||img;}
      }
      const logo=brand?.cloneNode(true);
      if(logo?.querySelector) logo.querySelector('.brand-name')?.remove();
      header.innerHTML='';
      if(logo) header.appendChild(logo);
      header.classList.add('logo-only-header');
    }

    let nav=document.querySelector('.app-bottom-nav');
    if(!nav){
      nav=document.createElement('nav');
      nav.className='app-bottom-nav';
      nav.setAttribute('aria-label','Public navigation');
      nav.innerHTML=[
        ['index.html','⌂','Home','index'],
        ['impact.html','◈','Impact','impact'],
        ['finance.html','₦','Finance','finance'],
        ['contact.html','●','Contact','contact'],
        ['contact.html','♡','Donate','contact']
      ].map(([href,icon,label,key],i)=>`<a href="${href}" class="${page===key?'active':''}${i===4?' donate-tab':''}"><span>${icon}</span><small>${label}</small></a>`).join('');
      document.body.appendChild(nav);
    }
  };

  // Run immediately and once after the page has fully parsed so page-specific styles/scripts
  // cannot bring the old public header/menu back.
  if(isPublic){
    applyPublicShell();
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyPublicShell,{once:true});
    window.addEventListener('load',applyPublicShell,{once:true});
    setTimeout(applyPublicShell,50);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=document.querySelector(a.getAttribute('href'));if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'});}}));
  document.querySelectorAll('.menu a[href]').forEach(a=>{const clean=(a.getAttribute('href')||'').split('#')[0];if(clean&&clean===path)a.classList.add('active');});
  const footerStyle=document.createElement('style');
  footerStyle.textContent=`
    footer .footer-brand,.programs-page footer .footer-brand,.programs-page footer .footer>div:first-child,footer .footer>div:first-child:has(>img){display:none!important}
    footer .footer{grid-template-columns:repeat(3,minmax(0,1fr))!important}.programs-page footer .footer{grid-template-columns:repeat(3,minmax(0,1fr))!important}
    @media(max-width:720px){footer .footer,.programs-page footer .footer{grid-template-columns:1fr 1fr!important}}
    @media(max-width:430px){footer .footer,.programs-page footer .footer{grid-template-columns:1fr!important}}
    .hero .actions a[href="auth.html"],.hero .actions .btn.primary[href="auth.html"]{position:relative;z-index:2;border:1px solid rgba(244,201,79,.9)!important;box-shadow:0 0 0 0 rgba(244,201,79,.72),0 8px 26px rgba(0,0,0,.16);animation:portalPulse 1.8s infinite,portalFloat 2.8s ease-in-out infinite;will-change:transform,box-shadow}
    .hero .actions a[href="auth.html"]:hover,.hero .actions .btn.primary[href="auth.html"]:hover{box-shadow:0 0 0 8px rgba(244,201,79,.14),0 12px 34px rgba(244,201,79,.28)!important}
    @keyframes portalPulse{0%,100%{box-shadow:0 0 0 0 rgba(244,201,79,.72),0 8px 26px rgba(0,0,0,.16)}50%{box-shadow:0 0 0 12px rgba(244,201,79,0),0 10px 30px rgba(244,201,79,.18)}}
    @keyframes portalFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    .public-app header.logo-only-header{min-height:128px!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:16px 20px!important;background:rgba(255,255,255,.98)!important;border-bottom:1px solid #e2ebe4!important;box-shadow:0 8px 28px rgba(10,50,25,.10)!important;position:sticky!important;top:0!important;z-index:1100!important}
    .public-app header.logo-only-header .brand,.public-app header.logo-only-header>a{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;margin:0!important;text-decoration:none!important}
    .public-app header.logo-only-header img{display:block!important;width:clamp(170px,30vw,280px)!important;height:auto!important;max-height:108px!important;object-fit:contain!important;filter:drop-shadow(0 5px 10px rgba(10,50,25,.14))!important}
    .public-app .app-bottom-nav{position:fixed!important;left:50%!important;bottom:calc(16px + env(safe-area-inset-bottom))!important;transform:translateX(-50%)!important;width:min(820px,calc(100vw - 40px))!important;min-height:72px!important;padding:8px!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:6px!important;align-items:stretch!important;background:rgba(255,255,255,.96)!important;border:1px solid rgba(13,91,43,.14)!important;border-radius:24px!important;box-shadow:0 16px 42px rgba(8,50,26,.20),0 4px 14px rgba(8,50,26,.10)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;z-index:2000!important}
    .public-app .app-bottom-nav a{min-width:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;padding:8px 5px!important;border-radius:17px!important;color:#164d2b!important;text-decoration:none!important;font-weight:700!important;transition:transform .18s ease,background .18s ease,color .18s ease!important}
    .public-app .app-bottom-nav a span{font-size:22px!important;line-height:1!important;font-weight:800!important}
    .public-app .app-bottom-nav a small{font-size:11px!important;line-height:1.1!important;white-space:nowrap!important}
    .public-app .app-bottom-nav a:hover{transform:translateY(-2px)!important;background:#eef7f0!important}
    .public-app .app-bottom-nav a.active{background:#0d5b2b!important;color:#fff!important;box-shadow:0 7px 18px rgba(13,91,43,.24)!important}
    .public-app .app-bottom-nav a.donate-tab{background:#f4c94f!important;color:#173d26!important}
    .public-app .app-bottom-nav a.donate-tab.active{background:#dcae24!important;color:#173d26!important}
    .public-app{padding-bottom:116px!important}
    @media(max-width:720px){.public-app header.logo-only-header{min-height:98px!important;padding:10px 16px!important}.public-app header.logo-only-header img{width:clamp(145px,50vw,205px)!important;max-height:76px!important}.public-app .app-bottom-nav{width:calc(100vw - 16px)!important;bottom:calc(6px + env(safe-area-inset-bottom))!important;min-height:66px!important;padding:6px!important;border-radius:20px!important;gap:3px!important}.public-app .app-bottom-nav a{padding:6px 3px!important;border-radius:14px!important}.public-app .app-bottom-nav a span{font-size:20px!important}.public-app .app-bottom-nav a small{font-size:10px!important}.public-app{padding-bottom:92px!important}}
    @media(min-width:1400px){.public-app header.logo-only-header{min-height:154px!important}.public-app header.logo-only-header img{width:300px!important;max-height:120px!important}.public-app .app-bottom-nav{min-height:78px!important}}
  `;
  document.head.appendChild(footerStyle);
  const cleanProgramFooter=()=>{if(!document.querySelector('.programs-page'))return;document.querySelectorAll('footer .footer > div').forEach(section=>{const heading=section.querySelector('h4');if(heading&&/comprehensive\s+program/i.test(heading.textContent||''))section.remove()});const seen=new Set();document.querySelectorAll('footer a[href]').forEach(link=>{const href=(link.getAttribute('href')||'').split('#')[0];if(!href||!(/program/i.test(link.textContent||'')||/program/i.test(href)))return;const key=href.toLowerCase();if(seen.has(key))link.remove();else seen.add(key)})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanProgramFooter);else cleanProgramFooter();
  if(!document.querySelector('link[rel="manifest"]')){const manifest=document.createElement('link');manifest.rel='manifest';manifest.href='manifest.json';document.head.appendChild(manifest)}
  if('serviceWorker'in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}));
  document.querySelectorAll('[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();alert('Thank you. Your message has been received. Please connect the form to your preferred email/Formspree/Google Forms service before going live.')}));
  const copyBtn=document.getElementById('copy-account');if(copyBtn)copyBtn.addEventListener('click',async()=>{const number=document.getElementById('account-number')?.textContent?.trim();const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText(number);if(status)status.textContent='Account number copied.'}catch(e){if(status)status.textContent='Please copy the account number manually: '+number}setTimeout(()=>{if(status)status.textContent=''},3000)});
  document.querySelectorAll('[data-finance-tab]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-finance-tab]').forEach(item=>item.classList.remove('active'));document.querySelectorAll('.finance-panel').forEach(panel=>panel.classList.remove('active'));button.classList.add('active');document.getElementById(button.dataset.financeTab)?.classList.add('active');window.scrollTo({top:document.querySelector('.finance-shell')?.offsetTop-90||0,behavior:'smooth'})}));
  document.querySelectorAll('[data-finance-action]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();const action=button.dataset.financeAction;if(action==='dashboard'){window.location.href='auth.html';return}if(action==='admin'){window.location.href='admin.html';return}document.querySelector(`[data-finance-tab="${action}"]`)?.click()}));
  document.querySelectorAll('[data-prototype-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const message=form.querySelector('[data-form-message]');if(message)message.textContent='This public prototype form is not active. Use the authenticated member dashboard for real requests.';form.reset()}));
})();
