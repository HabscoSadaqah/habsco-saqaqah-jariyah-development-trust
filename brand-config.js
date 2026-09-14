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
    const replaceNodeText=(root)=>{
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      const nodes=[];let n;while((n=walker.nextNode()))nodes.push(n);
      nodes.forEach(node=>{const value=node.nodeValue;if(!value)return;const next=value.replace(/HASSAN FINANCE/g,'HABSCO').replace(/Hassan Finance/g,'HABSCO');if(next!==value)node.nodeValue=next});
    };
    replaceNodeText(document.body);
    const title=document.title;
    if(/Hassan Finance/i.test(title))document.title=title.replace(/Hassan Finance/gi,'HABSCO');
  }
  function setFooter(){
    let footer=document.querySelector('footer');
    if(!footer){footer=document.createElement('footer');document.body.appendChild(footer)}
    let copy=footer.querySelector('.copyright');
    if(!copy){copy=document.createElement('div');copy.className='copyright';footer.appendChild(copy)}
    copy.textContent='© '+new Date().getFullYear()+' HABSCO. All Rights Reserved.';
    let fb=footer.querySelector('.footer-brand');
    if(!fb){
      fb=document.createElement('div');
      fb.className='footer-brand';
      footer.insertBefore(fb,footer.firstChild);
    }
    let h=fb.querySelector('.habsco-footer-wordmark');
    if(!h){h=document.createElement('div');h.className='habsco-footer-wordmark';fb.appendChild(h)}
    h.textContent=brand.name;
    let p=fb.querySelector('.habsco-footer-tagline');
    if(!p){p=document.createElement('div');p.className='habsco-footer-tagline';fb.appendChild(p)}
    p.textContent=brand.tagline;
    const styleId='habsco-universal-footer-style';
    if(!document.getElementById(styleId)){
      const style=document.createElement('style');style.id=styleId;style.textContent='.footer-brand .habsco-footer-wordmark{font-size:20px;line-height:1;font-weight:950;letter-spacing:.16em;color:#063d26;text-transform:uppercase}.footer-brand .habsco-footer-tagline{margin-top:7px;font-size:10px;line-height:1.2;font-weight:800;letter-spacing:.08em;color:#087443;text-transform:uppercase}@media(max-width:600px){.footer-brand .habsco-footer-wordmark{font-size:17px;letter-spacing:.13em}.footer-brand .habsco-footer-tagline{font-size:9px}}';document.head.appendChild(style);
    }
  }
  function loadMemberEcosystemUI(){
    if(path!=='member.html'&&path!=='member')return;
    if(!document.querySelector('script[data-habsco-ecosystem-ui]')){const s=document.createElement('script');s.src='/habsco-ecosystem-ui.js?v=20260913-2';s.dataset.habscoEcosystemUi='1';document.head.appendChild(s)}
    if(!document.querySelector('script[data-habsco-unified-balance]')){const s=document.createElement('script');s.src='/member-unified-balance.js?v=20260913-1';s.dataset.habscoUnifiedBalance='1';document.head.appendChild(s)}
  }
  function init(){
    document.documentElement.dataset.habscoBrand='habsco';
    document.documentElement.dataset.habscoPillar=brand.pillar.toLowerCase();
    setMeta('author',brand.legal);
    cleanLegacyFinanceBranding();
    setFooter();
    loadMemberEcosystemUI();
    if(path==='finance.html'){
      document.title='Finance | HABSCO';
      document.querySelectorAll('.finance-mini-badge').forEach(el=>el.innerHTML='<i></i> HABSCO FINANCE');
      const tagline=document.querySelector('.finance-hero-tagline');if(tagline)tagline.textContent='Savings, shares, interest-free loans and financial services.';
    }
    if(path==='statement.html'){
      document.title='HABSCO | Account Statement';
      const b=document.querySelector('.brand');if(b)b.textContent='HABSCO';
      const print=document.createElement('div');print.className='print-issuer';print.textContent=brand.legal;document.querySelector('.wrap')?.appendChild(print);
      const st=document.createElement('style');st.textContent='.print-issuer{display:none}@media print{.print-issuer{display:block;margin-top:12px;font-size:9px;font-weight:800;color:#555}}';document.head.appendChild(st);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
