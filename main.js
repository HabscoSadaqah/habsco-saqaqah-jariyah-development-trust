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

  const isHome = page === 'index';

  // The app-style header and floating navigation belong to the homepage only.
  // All other pages are explicitly cleared of the old logo header and bottom nav.
  if (!isHome) {
    const clearOtherPageShell = () => {
      document.body?.classList.remove('public-app');
      document.querySelectorAll('header.logo-only-header, .app-bottom-nav').forEach(el => el.remove());
    };
    clearOtherPageShell();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clearOtherPageShell, {once:true});
    window.addEventListener('load', clearOtherPageShell, {once:true});
  }

  // Load the public app layer only on the homepage so other pages keep their own layout.
  if (isHome && !document.querySelector('link[data-app-css]')) {
    const css=document.createElement('link'); css.rel='stylesheet'; css.href='app.css?v=home-shell-5'; css.dataset.appCss='true'; document.head.appendChild(css);
  }

  const applyHomeShell=()=>{
    if(!isHome || !document.body) return;
    document.body.classList.add('public-app');

    // Hard-remove every legacy homepage header/menu element and keep only the logo.
    document.querySelectorAll('.topbar, header nav, header .menu, header .mobile-toggle, .site-nav, .top-nav, .main-nav, .navbar, .nav-links').forEach(el=>el.remove());
    const header=document.querySelector('header');
    if(header){
      let logo=header.querySelector('.public-logo img') || header.querySelector('.brand img') || header.querySelector('img[alt*="Habsco"]');
      if(logo){
        const src=logo.getAttribute('src');
        const alt='Habsco Sadaqah Jariyah Development Trust';
        header.innerHTML='';
        header.className='logo-only-header';
        const logoLink=document.createElement('a');
        logoLink.className='public-logo';
        logoLink.href='index.html';
        logoLink.setAttribute('aria-label','Habsco Sadaqah Jariyah Development Trust — Home');
        const image=document.createElement('img');
        image.src=src || 'logo.svg'; image.alt=alt; image.loading='eager';
        logoLink.appendChild(image); header.appendChild(logoLink);
      } else {
        header.remove();
      }
    }

    // Create exactly one floating homepage navigation bar.
    let nav=document.querySelector('.app-bottom-nav');
    if(!nav){
      nav=document.createElement('nav');
      nav.className='app-bottom-nav';
      nav.setAttribute('aria-label','Homepage navigation');
      nav.innerHTML=[
        ['index.html','⌂','Home','index'],
        ['impact.html','◈','Impact','impact'],
        ['finance.html','₦','Finance','finance'],
        ['contact.html','●','Contact','contact'],
        ['contact.html#donate','♡','Donate','donate']
      ].map(([href,icon,label,key])=>`<a href="${href}" class="${page===key?'active ':''}${key==='donate'?'donate-tab':''}"><span aria-hidden="true">${icon}</span><small>${label}</small></a>`).join('');
      document.body.appendChild(nav);
    }
  };

  if(isHome){
    applyHomeShell();
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyHomeShell,{once:true});
    window.addEventListener('load',applyHomeShell,{once:true});
    setTimeout(applyHomeShell,80);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=document.querySelector(a.getAttribute('href'));if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'});}}));
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
