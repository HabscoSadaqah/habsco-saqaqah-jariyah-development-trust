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
    footer.setAttribute('aria-label','HABSCO footer');
    footer.querySelector('.copyright')?.remove();
    let fb=footer.querySelector('.footer-brand');
    if(!fb){fb=document.createElement('div');fb.className='footer-brand';footer.insertBefore(fb,footer.firstChild)}
    fb.innerHTML='';
    const rights=document.createElement('div');rights.className='habsco-footer-rights';
    const copy=document.createElement('span');copy.textContent='© '+new Date().getFullYear()+' HABSCO';rights.appendChild(copy);
    const reserved=document.createElement('span');reserved.textContent='All Rights Reserved';rights.appendChild(reserved);
    fb.appendChild(rights);
    const styleId='habsco-universal-footer-style';
    if(!document.getElementById(styleId)){
      const style=document.createElement('style');style.id=styleId;style.textContent=`footer{display:block!important;visibility:visible!important;opacity:1!important;background:#fff!important;color:#063d26!important;box-shadow:none!important;border:0!important;border-top:1px solid #7a857f!important}footer .footer-brand{display:flex;flex-direction:column;align-items:center;text-align:center;width:100%;max-width:1180px;margin:0 auto;padding:11px 12px 10px;box-sizing:border-box;gap:0;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}footer .footer-brand .habsco-footer-rights{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;justify-content:center;gap:5px;width:max-content;max-width:100%;white-space:nowrap;font-size:7px;line-height:1.15;color:#7a857f;margin:0;font-weight:500;letter-spacing:.018em}footer .footer-brand .habsco-footer-rights span{display:inline-block;white-space:nowrap}footer .footer-brand .habsco-footer-rights span+span{color:#7a857f}@media(max-width:600px){footer .footer-brand{width:100%;margin-top:0;padding:9px 8px 8px}footer .footer-brand .habsco-footer-rights{font-size:6.3px;gap:4px}}@media(max-width:360px){footer .footer-brand .habsco-footer-rights{font-size:5.9px;gap:3px}}`;document.head.appendChild(style);
    }
  }
  function loadMemberEcosystemUI(){if(path!=='member.html'&&path!=='member')return;if(!document.querySelector('script[data-habsco-ecosystem-ui]')){const s=document.createElement('script');s.src='/habsco-ecosystem-ui.js?v=20260913-2';s.dataset.habscoEcosystemUi='1';document.head.appendChild(s)}if(!document.querySelector('script[data-habsco-unified-balance]')){const s=document.createElement('script');s.src='/member-unified-balance.js?v=20260913-1';s.dataset.habscoUnifiedBalance='1';document.head.appendChild(s)}}
  function init(){document.documentElement.dataset.habscoBrand='habsco';document.documentElement.dataset.habscoPillar=brand.pillar.toLowerCase();setMeta('author',brand.legal);cleanLegacyFinanceBranding();setFooter();loadMemberEcosystemUI();if(path==='finance.html'){document.title='Finance | HABSCO';document.querySelectorAll('.finance-mini-badge').forEach(el=>el.innerHTML='<i></i> HABSCO FINANCE');const tagline=document.querySelector('.finance-hero-tagline');if(tagline)tagline.textContent='Savings, shares, interest-free loans and financial services.'}if(path==='statement.html'){document.title='HABSCO | Account Statement';const b=document.querySelector('.brand');if(b)b.textContent='HABSCO';const print=document.createElement('div');print.className='print-issuer';print.textContent=brand.legal;document.querySelector('.wrap')?.appendChild(print);const st=document.createElement('style');st.textContent='.print-issuer{display:none}@media print{.print-issuer{display:block;margin-top:12px;font-size:9px;font-weight:800;color:#555}}';document.head.appendChild(st)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
