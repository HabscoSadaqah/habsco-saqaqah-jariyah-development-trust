(()=>{
'use strict';
const polish=()=>{
 const modal=document.getElementById('hfSavingsModal');
 if(!modal||modal.dataset.financeFocus==='1')return;
 const sheet=modal.querySelector('.hf-savings-sheet');
 if(!sheet)return;
 modal.dataset.financeFocus='1';
 const eyebrow=sheet.querySelector('.hf-savings-eyebrow');
 const title=sheet.querySelector('#hfSavingsTitle');
 const intro=sheet.querySelector('.hf-savings-intro');
 if(eyebrow)eyebrow.textContent='HASSAN FINANCE · FINANCIAL POSITION';
 if(title)title.textContent='Savings & Loan';
 if(intro)intro.textContent='Build your savings balance, track your qualification and unlock your interest-free loan limit.';
 const balance=sheet.querySelector('.hf-savings-balance');
 const grid=sheet.querySelector('.hf-savings-grid');
 if(balance)balance.insertAdjacentHTML('afterend','<div class="hf-finance-focus-label">FINANCE OVERVIEW</div>');
 if(grid)grid.classList.add('hf-finance-snapshot');
 const plan=sheet.querySelector('.hf-savings-plan');
 if(plan){
  const strong=plan.querySelector('strong');
  if(strong)strong.textContent=strong.textContent.includes('Your')?'Savings Plan':'Set Your Savings Plan';
 }
 const progress=sheet.querySelector('.hf-savings-progress');
 if(progress)progress.insertAdjacentHTML('afterbegin','<div class="hf-finance-section-title"><strong>Qualification Progress</strong><span>6-month target</span></div>');
 const counter=sheet.querySelector('.hf-savings-counter');
 if(counter)counter.classList.add('hf-finance-secondary');
 const rules=sheet.querySelector('.hf-savings-rules');
 if(rules)rules.remove();
 const actions=sheet.querySelector('.hf-savings-actions');
 if(actions){
  actions.classList.add('hf-finance-actions');
  const links=actions.querySelectorAll('a,button');
  links.forEach(el=>{if(/statement/i.test(el.textContent))el.textContent='View Savings Statement';});
 }
 const styleId='hf-savings-finance-focus-style';
 if(!document.getElementById(styleId)){
  const style=document.createElement('style');style.id=styleId;style.textContent=`
  .hf-savings-sheet{background:linear-gradient(180deg,#ffffff 0%,#fbfdfc 100%);border-color:#d9e6df;box-shadow:0 30px 90px rgba(1,39,24,.28)}
  .hf-savings-eyebrow{color:#087443!important;letter-spacing:1.4px!important}
  .hf-savings-intro{max-width:430px}
  .hf-finance-focus-label{margin:13px 0 7px;font-size:7px;letter-spacing:1.1px;font-weight:900;color:#7b8982}
  .hf-savings-grid.hf-finance-snapshot{margin-top:0;grid-template-columns:1fr 1fr}
  .hf-savings-grid.hf-finance-snapshot>div{background:#f7faf8;border-color:#dfe9e3;padding:12px}
  .hf-savings-grid.hf-finance-snapshot>div:first-child{border-left:3px solid #087443}
  .hf-savings-grid.hf-finance-snapshot>div:last-child{border-left:3px solid #c59a4b}
  .hf-finance-section-title{display:flex!important;justify-content:space-between!important;align-items:center;margin:14px 0 7px;color:#17221c!important;font-size:10px!important}
  .hf-finance-section-title strong{font-size:10px;color:#17221c}.hf-finance-section-title span{font-size:7px;color:#849189;font-weight:700}
  .hf-savings-progress{margin-top:0}
  .hf-savings-plan{background:#f7faf8;border-color:#dce8e1}
  .hf-savings-plan strong{font-size:10.5px}
  .hf-finance-secondary{background:#fffaf0;border-color:#eadfc9}
  .hf-finance-actions{grid-template-columns:1fr 1fr!important}
  .hf-finance-actions a.primary{box-shadow:0 8px 18px rgba(8,116,67,.18)}
  @media(max-width:600px){.hf-finance-actions{grid-template-columns:1fr!important}.hf-savings-sheet{max-height:calc(100vh - 62px);padding:16px}.hf-savings-balance{margin-top:12px}}
  `;document.head.appendChild(style);
 }
};
const watch=()=>{if(document.getElementById('hfSavingsModal'))polish();};
new MutationObserver(watch).observe(document.body,{childList:true});
setTimeout(watch,600);setTimeout(watch,1500);
})();