/* HABSCO brand governance — one public wordmark, three service pillars. */
(function(){
  'use strict';
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const financePages=new Set(['finance.html','auth.html','member.html','member-actions.html','savings.html','statement.html','admin.html','admin-control-center.html','admin-member.html','admin-notifications.html','change-password.html']);
  const businessPages=new Set(['utility.html','utilities.html','utility-bills.html']);
  const charityPages=new Set(['index.html','about.html','impact.html','programs.html','contact.html','donate.html']);
  const pillar=financePages.has(path)?'Finance':businessPages.has(path)?'Business':'Charity';
  const brand={name:'HABSCO',tagline:'Business · Finance · Charity',pillar,legal:financePages.has(path)?'Habsco Free Interest Multipurposes Cooperative Society':businessPages.has(path)?'Habsco Universal Enterprises':'Habsco Sadaqah Jariyah Development Trust'};
  function setMeta(name,content){let el=document.querySelector('meta[name="'+name+'"]');if(!el){el=document.createElement('meta');el.name=name;document.head.appendChild(el)}el.content=content}
  function cleanLegacyFinanceBranding(){
    if(!financePages.has(path))return;
    const replaceNodeText=(root)=>{const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let n;while((n=walker.nextNode()))nodes.push(n);nodes.forEach(node=>{const value=node.nodeValue;if(!value)return;const next=value.replace(/HASSAN FINANCE/g,'HABSCO').replace(/Hassan Finance/g,'HABSCO');if(next!==value)node.nodeValue=next})};
    replaceNodeText(document.body);
    if(/Hassan Finance/i.test(document.title))document.title=document.title.replace(/Hassan Finance/gi,'HABSCO');
  }
  function setFooter(){
    let footer=document.querySelector('footer');
    if(!footer){footer=document.createElement('footer');document.body.appendChild(footer)}
    footer.querySelector('.copyright')?.remove();
    let fb=footer.querySelector('.footer-brand');
    if(!fb){fb=document.createElement('div');fb.className='footer-brand';footer.insertBefore(fb,footer.firstChild)}
    fb.innerHTML='';
    const year=document.createElement('div');year.className='habsco-footer-year';year.textContent='© '+new Date().getFullYear();fb.appendChild(year);
    const h=document.createElement('div');h.className='habsco-footer-wordmark';h.textContent=brand.name;fb.appendChild(h);
    const p=document.createElement('div');p.className='habsco-footer-tagline';p.innerHTML='<span>Business</span><span>Finance</span><span>Charity</span>';fb.appendChild(p);
    const rights=document.createElement('div');rights.className='habsco-footer-rights';rights.textContent='All Rights Reserved.';fb.appendChild(rights);
    const styleId='habsco-universal-footer-style';
    if(!document.getElementById(styleId)){
      const style=document.createElement('style');style.id=styleId;style.textContent=`footer .footer-brand{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;width:100%;gap:0;padding:18px 12px 12px;box-sizing:border-box}footer .footer-brand .habsco-footer-year{font-size:11px;line-height:1.2;font-weight:700;letter-spacing:.08em;color:#52645b;margin-bottom:7px}footer .footer-brand .habsco-footer-wordmark{font-size:27px;line-height:1;font-weight:950;letter-spacing:.18em;color:#063d26;text-transform:uppercase}footer .footer-brand .habsco-footer-tagline{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:min(300px,100%);margin-top:9px;font-size:9px;line-height:1.2;font-weight:800;letter-spacing:.04em;color:#087443;text-transform:uppercase}footer .footer-brand .habsco-footer-tagline span{display:flex;align-items:center;justify-content:center;min-width:0;white-space:nowrap}footer .footer-brand .habsco-footer-tagline span+span{border-left:1px solid rgba(8,116,67,.28)}footer .footer-brand .habsco-footer-rights{font-size:10px;line-height:1.2;font-weight:600;color:#68776f;margin-top:10px}@media(max-width:600px){footer .footer-brand{padding-top:14px}footer .footer-brand .habsco-footer-wordmark{font-size:22px;letter-spacing:.15em}footer .footer-brand .habsco-footer-tagline{width:min(270px,100%);font-size:8px;letter-spacing:.02em}footer .footer-brand .habsco-footer-year,footer .footer-brand .habsco-footer-rights{font-size:9px}}`;document.head.appendChild(style);
    }
  }
  function loadMemberEcosystemUI(){if(path!=='member.html'&&path!=='member')return;if(!document.querySelector('script[data-habsco-ecosystem-ui]')){const s=document.createElement('script');s.src='/habsco-ecosystem-ui.js?v=20260913-2';s.dataset.habscoEcosystemUi='1';document.head.appendChild(s)}if(!document.querySelector('script[data-habsco-unified-balance]')){const s=document.createElement('script');s.src='/member-unified-balance.js?v=20260913-1';s.dataset.habscoUnifiedBalance='1';document.head.appendChild(s)}}
  function init(){document.documentElement.dataset.habscoBrand='habsco';document.documentElement.dataset.habscoPillar=brand.pillar.toLowerCase();setMeta('author',brand.legal);cleanLegacyFinanceBranding();setFooter();loadMemberEcosystemUI();if(path==='finance.html'){document.title='Finance | HABSCO';document.querySelectorAll('.finance-mini-badge').forEach(el=>el.innerHTML='<i></i> HABSCO FINANCE');const tagline=document.querySelector('.finance-hero-tagline');if(tagline)tagline.textContent='Savings, shares, interest-free loans and financial services.'}if(path==='statement.html'){document.title='HABSCO | Account Statement';const b=document.querySelector('.brand');if(b)b.textContent='HABSCO';const print=document.createElement('div');print.className='print-issuer';print.textContent=brand.legal;document.querySelector('.wrap')?.appendChild(print);const st=document.createElement('style');st.textContent='.print-issuer{display:none}@media print{.print-issuer{display:block;margin-top:12px;font-size:9px;font-weight:800;color:#555}}';document.head.appendChild(st)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
