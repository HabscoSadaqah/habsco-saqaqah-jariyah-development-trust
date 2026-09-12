(()=>{
'use strict';
const polish=()=>{
 const modal=document.getElementById('hfSavingsModal');
 if(!modal||modal.dataset.financeFocus==='1')return;
 const sheet=modal.querySelector('.hf-savings-sheet');
 if(!sheet)return;
 modal.dataset.financeFocus='1';
 const close=sheet.querySelector('.hf-savings-close');
 if(close){close.innerHTML='✕';close.setAttribute('aria-label','Close Savings');close.title='Close';}
 const eyebrow=sheet.querySelector('.hf-savings-eyebrow'),title=sheet.querySelector('#hfSavingsTitle'),intro=sheet.querySelector('.hf-savings-intro');
 if(eyebrow)eyebrow.textContent='HASSAN FINANCE · FINANCIAL POSITION';
 if(title)title.textContent='Savings & Loan';
 if(intro)intro.textContent='Build your savings balance, track your qualification and unlock your interest-free loan limit.';
 const balance=sheet.querySelector('.hf-savings-balance'),grid=sheet.querySelector('.hf-savings-grid');
 if(balance)balance.insertAdjacentHTML('afterend','<div class="hf-finance-focus-label">FINANCE OVERVIEW</div>');
 if(grid)grid.classList.add('hf-finance-snapshot');
 const plan=sheet.querySelector('.hf-savings-plan');
 if(plan){const strong=plan.querySelector('strong');if(strong)strong.textContent=strong.textContent.includes('Your')?'Savings Plan':'Set Your Savings Plan';}
 const progress=sheet.querySelector('.hf-savings-progress');
 if(progress)progress.insertAdjacentHTML('afterbegin','<div class="hf-finance-section-title"><strong>Qualification Progress</strong><span>6-month target</span></div>');
 const counter=sheet.querySelector('.hf-savings-counter');if(counter)counter.classList.add('hf-finance-secondary');
 const rules=sheet.querySelector('.hf-savings-rules');
 if(rules){rules.innerHTML='<div class="hf-rules-head"><strong>📋 Savings Rules</strong><button type="button" class="hf-rules-toggle" aria-expanded="true">Hide</button></div><div class="hf-rules-body"><p>• Every payment uses your selected fixed amount.</p><p>• Your chosen frequency controls when the next payment is allowed.</p><p>• A completed Savings withdrawal resets your six-month qualification period.</p><p>• Full withdrawal moves your Savings balance to Available to Spend and clears the plan.</p><p>• Interest-Free Loan eligibility is based on the qualification rules shown above.</p></div>';}
 const actions=sheet.querySelector('.hf-savings-actions');
 if(actions){actions.classList.add('hf-finance-actions');actions.querySelectorAll('a,button').forEach(el=>{if(/statement/i.test(el.textContent))el.textContent='View Savings Statement';});}
 const styleId='hf-savings-finance-focus-style';
 if(!document.getElementById(styleId)){const style=document.createElement('style');style.id=styleId;style.textContent=`
 .hf-savings-sheet{background:linear-gradient(180deg,#fff 0%,#fbfdfc 100%);border-color:#d9e6df;box-shadow:0 30px 90px rgba(1,39,24,.28);padding-top:22px}
 .hf-savings-close{z-index:5!important;display:flex!important;align-items:center;justify-content:center;width:40px!important;height:40px!important;right:12px!important;top:12px!important;background:#edf3ef!important;color:#174b35!important;font-size:17px!important;font-weight:900!important;box-shadow:0 3px 12px rgba(0,0,0,.08);cursor:pointer}
 .hf-savings-close:hover{background:#087443!important;color:#fff!important}.hf-savings-close:focus-visible{outline:3px solid rgba(8,116,67,.28);outline-offset:2px}
 .hf-savings-eyebrow{color:#087443!important;letter-spacing:1.4px!important}.hf-savings-intro{max-width:430px}
 .hf-finance-focus-label{margin:13px 0 7px;font-size:7px;letter-spacing:1.1px;font-weight:900;color:#7b8982}
 .hf-savings-grid.hf-finance-snapshot{margin-top:0;grid-template-columns:1fr 1fr}.hf-savings-grid.hf-finance-snapshot>div{background:#f7faf8;border-color:#dfe9e3;padding:12px}.hf-savings-grid.hf-finance-snapshot>div:first-child{border-left:3px solid #087443}.hf-savings-grid.hf-finance-snapshot>div:last-child{border-left:3px solid #c59a4b}
 .hf-finance-section-title{display:flex!important;justify-content:space-between!important;align-items:center;margin:14px 0 7px;color:#17221c!important;font-size:10px!important}.hf-finance-section-title strong{font-size:10px;color:#17221c}.hf-finance-section-title span{font-size:7px;color:#849189;font-weight:700}.hf-savings-progress{margin-top:0}.hf-savings-plan{background:#f7faf8;border-color:#dce8e1}.hf-savings-plan strong{font-size:10.5px}.hf-finance-secondary{background:#fffaf0;border-color:#eadfc9}
 .hf-rules-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.hf-rules-head strong{font-size:10px!important;color:#17221c}.hf-rules-toggle{border:1px solid #dce5df;background:#fff;color:#087443;border-radius:8px;padding:5px 9px;font-size:7px;font-weight:900;cursor:pointer}.hf-rules-body p{margin:6px 0 0!important}.hf-rules-body.is-collapsed{display:none}
 .hf-finance-actions{grid-template-columns:1fr 1fr!important}.hf-finance-actions a.primary{box-shadow:0 8px 18px rgba(8,116,67,.18)}
 @media(max-width:600px){.hf-savings-sheet{max-height:calc(100vh - 54px);padding:16px;padding-top:20px}.hf-finance-actions{grid-template-columns:1fr!important}.hf-savings-close{width:42px!important;height:42px!important;right:10px!important;top:10px!important}.hf-savings-balance{margin-top:12px}}
 `;document.head.appendChild(style);}
 const toggle=sheet.querySelector('.hf-rules-toggle'),body=sheet.querySelector('.hf-rules-body');
 if(toggle&&body){toggle.onclick=()=>{const collapsed=body.classList.toggle('is-collapsed');toggle.textContent=collapsed?'Show':'Hide';toggle.setAttribute('aria-expanded',String(!collapsed));};}
};
const watch=()=>{if(document.getElementById('hfSavingsModal'))polish();};
new MutationObserver(watch).observe(document.body,{childList:true});setTimeout(watch,600);setTimeout(watch,1500);
})();