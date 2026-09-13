/* Habsco brand governance — single source of truth for page-level identity. */
(function(){
  'use strict';
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const financePages=new Set(['finance.html','auth.html','member.html','member-actions.html','savings.html','statement.html','admin.html','admin-control-center.html','admin-member.html','admin-notifications.html','change-password.html']);
  const businessPages=new Set(['utility.html','utilities.html','utility-bills.html']);
  const charityPages=new Set(['index.html','about.html','impact.html','programs.html','contact.html','donate.html']);
  const brand=financePages.has(path)?{legal:'Habsco Free Interest Multipurposes Cooperative Society',service:'Habsco Finance',descriptor:'Savings, cooperative finance and interest-free financial services',type:'finance'}:businessPages.has(path)?{legal:'Habsco Universal Enterprises',service:'Habsco Universal Enterprises',descriptor:'Business, commercial and utility services',type:'business'}:{legal:'Habsco Sadaqah Jariyah Development Trust',service:'Habsco Sadaqah Jariyah Development Trust',descriptor:'Continuous charity, Waqf and community development',type:'charity'};
  function setMeta(name,content){let el=document.querySelector('meta[name="'+name+'"]');if(!el){el=document.createElement('meta');el.name=name;document.head.appendChild(el)}el.content=content}
  function setFooter(){
    let footer=document.querySelector('footer');
    if(!footer){footer=document.createElement('footer');document.body.appendChild(footer)}
    let copy=footer.querySelector('.copyright');
    if(!copy){copy=document.createElement('div');copy.className='copyright';footer.appendChild(copy)}
    copy.textContent='© '+new Date().getFullYear()+' '+brand.legal+'. All Rights Reserved.';
    const fb=footer.querySelector('.footer-brand');
    if(fb&&brand.type==='finance'){
      const img=fb.querySelector('img');if(img)img.alt=brand.service;
      const h=fb.querySelector('h3');if(h)h.textContent=brand.legal;
      const p=fb.querySelector('p');if(p)p.textContent=brand.service+' is the digital finance platform of '+brand.legal+'.';
    }
    if(fb&&brand.type==='business'){
      const img=fb.querySelector('img');if(img)img.alt=brand.legal;
      const h=fb.querySelector('h3');if(h)h.textContent=brand.legal;
      const p=fb.querySelector('p');if(p)p.textContent='Business, commercial and utility services by '+brand.legal+'.';
    }
  }
  function addGovernanceBadge(){
    if(path!=='index.html')return;
    const main=document.querySelector('main');
    if(main&&!document.getElementById('habsco-ecosystem')){
      const sec=document.createElement('section');sec.id='habsco-ecosystem';sec.className='habsco-ecosystem';
      sec.innerHTML='<div class="habsco-ecosystem-inner"><div class="eyebrow">THE HABSCO ECOSYSTEM</div><h2>One Habsco ecosystem. Clear financial and community purposes.</h2><p class="ecosystem-intro">Habsco organisations manage resources in different ways, with each entity responsible for a clearly defined purpose. The website is led by Habsco Sadaqah Jariyah Development Trust, while finance, business and utility services are presented under their responsible entities.</p><div class="ecosystem-grid"><article><strong>Habsco Universal Enterprises</strong><span>Business, commercial &amp; utility services</span></article><article><strong>Habsco Free Interest Multipurposes Cooperative Society</strong><span>Savings, cooperative finance &amp; interest-free financing through Habsco Finance</span></article><article><strong>Habsco Sadaqah Jariyah Development Trust</strong><span>Charity, Waqf &amp; continuous community development — the organisation behind this website and domain</span></article></div></div>';
      const footer=document.querySelector('footer');
      document.body.insertBefore(sec,footer||null);
      const style=document.createElement('style');style.textContent='#habsco-ecosystem{padding:56px 20px;background:linear-gradient(180deg,#f6fbf8,#fff)}.habsco-ecosystem-inner{max-width:1180px;margin:auto}.habsco-ecosystem .eyebrow{font-size:11px;font-weight:900;letter-spacing:1.5px;color:#087443}.habsco-ecosystem h2{margin:8px 0 10px;font-size:clamp(24px,4vw,38px);line-height:1.08}.ecosystem-intro{max-width:820px;color:#64736b;line-height:1.6}.ecosystem-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:24px}.ecosystem-grid article{padding:22px;border:1px solid #dfeae4;border-radius:18px;background:#fff;box-shadow:0 8px 25px rgba(6,61,38,.06)}.ecosystem-grid strong{display:block;color:#063d26;font-size:15px;line-height:1.35}.ecosystem-grid span{display:block;margin-top:8px;color:#718079;font-size:12px;line-height:1.5}@media(max-width:800px){.ecosystem-grid{grid-template-columns:1fr}}';document.head.appendChild(style);
    }
  }
  function init(){
    document.documentElement.dataset.habscoBrand=brand.type;
    setMeta('author',brand.legal);
    setFooter();
    addGovernanceBadge();
    if(path==='finance.html'){
      document.title='Habsco Finance | Habsco Free Interest Multipurposes Cooperative Society';
      document.querySelectorAll('.finance-mini-badge').forEach(el=>el.innerHTML='<i></i> HABSCO FINANCE');
      const tagline=document.querySelector('.finance-hero-tagline');if(tagline)tagline.textContent='A modern member experience for savings, cooperative finance and interest-free financial services.';
      document.querySelectorAll('a[href="auth.html"]').forEach(a=>{if(a.textContent.toLowerCase().includes('utility'))a.href='utility.html'});
    }
    if(path==='statement.html'){
      document.title='Habsco Finance | Account Statement';
      const b=document.querySelector('.brand');if(b)b.textContent='HABSCO FINANCE';
      const print=document.createElement('div');print.className='print-issuer';print.textContent=brand.legal+' · '+brand.service;document.querySelector('.wrap')?.appendChild(print);
      const st=document.createElement('style');st.textContent='.print-issuer{display:none}@media print{.print-issuer{display:block;margin-top:12px;font-size:9px;font-weight:800;color:#555}}';document.head.appendChild(st);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
