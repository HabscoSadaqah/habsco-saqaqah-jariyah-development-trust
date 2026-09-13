/* Habsco unified ecosystem UI — presentation layer only; financial ledgers remain entity-specific. */
(function(){
  'use strict';
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(path!=='member.html'&&path!=='member')return;
  function money(v){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(v||0))}
  function add(){
    const wrap=document.querySelector('.wrap');
    if(!wrap||document.getElementById('habscoUnifiedEntities'))return;
    const section=document.createElement('section');
    section.id='habscoUnifiedEntities';
    section.innerHTML='<div class="hue-head"><div><div class="hue-eyebrow">HABSCO ECOSYSTEM</div><h2>Unified financial view</h2><p>One member view across Business, Finance and Charity, while each entity keeps its own ledger and purpose.</p></div></div><div class="hue-grid"><article><span>BUSINESS</span><strong>Habsco Universal Enterprises</strong><small>Buying, selling, utilities &amp; commercial services</small><b id="hueBusiness">Managed separately</b></article><article><span>FINANCE</span><strong>Habsco Free Interest Multipurposes Cooperative Society</strong><small>Savings, shares, interest-free loans &amp; cooperative services</small><b id="hueFinance">See cooperative balances above</b></article><article><span>CHARITY</span><strong>Habsco Sadaqah Jariyah Development Trust</strong><small>Donations, Waqf &amp; continuous community development</small><b id="hueCharity">Managed separately</b></article></div><div class="hue-note">Your <strong>Unified Wallet Balance</strong> is your available spendable wallet balance. <strong>Total Habsco Balance</strong> includes that wallet plus your cooperative savings, shares and special savings.</div>';
    const style=document.createElement('style');
    style.textContent='#habscoUnifiedEntities{margin:22px 0 8px;padding:18px;border:1px solid #dfe9e3;border-radius:18px;background:#fff;box-shadow:0 7px 22px rgba(24,60,42,.05)}#habscoUnifiedEntities .hue-eyebrow{font-size:8px;font-weight:900;letter-spacing:1.4px;color:#087443}#habscoUnifiedEntities h2{margin:4px 0 5px;font-size:17px}#habscoUnifiedEntities p{margin:0;color:#718079;font-size:9.5px;line-height:1.45;max-width:760px}.hue-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.hue-grid article{padding:12px;border:1px solid #e2ebe6;border-radius:13px;background:#f9fbfa}.hue-grid span{display:block;font-size:7px;font-weight:900;letter-spacing:.8px;color:#087443}.hue-grid strong{display:block;margin-top:5px;font-size:10px;line-height:1.3}.hue-grid small{display:block;margin-top:4px;color:#7a8881;font-size:8px;line-height:1.35}.hue-grid b{display:block;margin-top:8px;font-size:8px;color:#53635b}.hue-note{margin-top:11px;padding:10px;border-radius:10px;background:#edf7f1;color:#587067;font-size:8.5px;line-height:1.45}.hue-note strong{color:#064f2e}@media(max-width:700px){.hue-grid{grid-template-columns:1fr}.hue-grid article{padding:11px}}';
    document.head.appendChild(style);
    const admin=document.getElementById('hfAdminDashboard');
    if(admin)wrap.insertBefore(section,admin);else wrap.appendChild(section);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
