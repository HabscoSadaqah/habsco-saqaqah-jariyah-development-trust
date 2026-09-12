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
 if(progress){
  progress.insertAdjacentHTML('afterbegin','<div class="hf-finance-section-title"><strong>Qualification Progress</strong><span>6-month target</span></div>');
  const first=progress.querySelector(':scope > div:not(.hf-finance-section-title) span');
  const goalText=progress.querySelector(':scope > small span:first-child')?.textContent||'';
  const m=(first?.textContent||'').match(/(\d+)\s+(?:day|days|week|weeks|month|months)/i);
  const g=goalText.match(/(\d+)/);
  const saved=Math.max(0,Number(m?.[1]||0)),goal=Math.max(1,Number(g?.[1]||6));
  const track=progress.querySelector('i');
  if(track){
   track.classList.add('hf-cycle-track');
   const marks=Math.min(goal,26);
   const frag=document.createDocumentFragment();
   for(let i=1;i<=marks;i++){const mark=document.createElement('span');mark.className='hf-cycle-mark'+(i<=saved?' is-paid':'');mark.style.left=((i/goal)*100)+'%';mark.title=i<=saved?`Paid cycle ${i}`:`Cycle ${i}`;frag.appendChild(mark);}
   track.appendChild(frag);
   track.setAttribute('aria-label',`${saved} of ${goal} paid cycles completed`);
  }
 }
 const counter=sheet.querySelector('.hf-savings-counter');if(counter)counter.classList.add('hf-finance-secondary');
 const rules=sheet.querySelector('.hf-savings-rules');
 if(rules){rules.innerHTML='<div class="hf-rules-head"><strong>📋 Savings Rules</strong><button type="button" class="hf-rules-toggle" aria-expanded="true">Hide</button></div><div class="hf-rules-body"><p>• Every payment uses your selected fixed amount.</p><p>• Your chosen frequency controls when the next payment is allowed.</p><p>• A completed Savings withdrawal resets your six-month qualification period.</p><p>• Full withdrawal moves your Savings balance to Available to Spend and clears the plan.</p><p>• Interest-Free Loan eligibility is based on the qualification rules shown above.</p></div>';}
 const actions=sheet.querySelector('.hf-savings-actions');
 if(actions){actions.classList.add('hf-finance-actions');actions.querySelectorAll('a,button').forEach(el=>{if(/statement/i.test(el.textContent))el.textContent='View Savings Statement';});}
 const styleId='hf-savings-finance-focus-style';
 if(!document.getElementById(styleId)){const style=document.createElement('style');style.id=styleId;style.textContent=`
 .hf-savings-sheet{background:linear-gradient(145deg,#ffffff 0%,#f8fcfa 58%,#edf5f0 100%);border:1px solid rgba(255,255,255,.95);box-shadow:0 34px 90px rgba(1,39,24,.34),0 8px 24px rgba(1,39,24,.12),inset 0 1px 0 #fff;transform:translate(-50%,-50%) perspective(1100px) rotateX(.35deg);}
 .hf-savings-sheet:before{content:'';position:absolute;inset:0;border-radius:22px;pointer-events:none;background:linear-gradient(120deg,rgba(255,255,255,.65),transparent 28%,transparent 72%,rgba(8,116,67,.035));}
 .hf-savings-close{z-index:5!important;display:flex!important;align-items:center;justify-content:center;width:42px!important;height:42px!important;right:12px!important;top:12px!important;background:linear-gradient(145deg,#ffffff,#e7efea)!important;color:#174b35!important;font-size:17px!important;font-weight:900!important;box-shadow:0 5px 14px rgba(0,0,0,.12),inset 0 1px 0 #fff;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
 .hf-savings-close:hover{background:#087443!important;color:#fff!important;transform:translateY(-1px) scale(1.03);box-shadow:0 8px 18px rgba(8,116,67,.25)}.hf-savings-close:active{transform:scale(.95)}.hf-savings-close:focus-visible{outline:3px solid rgba(8,116,67,.28);outline-offset:2px}
 .hf-savings-eyebrow{color:#087443!important;letter-spacing:1.4px!important}.hf-savings-intro{max-width:430px}
 .hf-finance-focus-label{margin:13px 0 7px;font-size:7px;letter-spacing:1.1px;font-weight:900;color:#7b8982}
 .hf-savings-grid.hf-finance-snapshot{margin-top:0;grid-template-columns:1fr 1fr}.hf-savings-grid.hf-finance-snapshot>div{background:linear-gradient(145deg,#fbfdfc,#f1f7f3);border-color:#dfe9e3;padding:12px;box-shadow:inset 0 1px 0 #fff,0 4px 12px rgba(12,57,39,.05)}.hf-savings-grid.hf-finance-snapshot>div:first-child{border-left:3px solid #087443}.hf-savings-grid.hf-finance-snapshot>div:last-child{border-left:3px solid #c59a4b}
 .hf-finance-section-title{display:flex!important;justify-content:space-between!important;align-items:center;margin:14px 0 7px;color:#17221c!important;font-size:10px!important}.hf-finance-section-title strong{font-size:10px;color:#17221c}.hf-finance-section-title span{font-size:7px;color:#849189;font-weight:700}.hf-savings-progress{margin-top:0}.hf-savings-plan{background:linear-gradient(145deg,#f9fcfa,#eef5f1);border-color:#dce8e1;box-shadow:inset 0 1px 0 #fff,0 6px 16px rgba(12,57,39,.045)}.hf-savings-plan strong{font-size:10.5px}.hf-finance-secondary{background:#fffaf0;border-color:#eadfc9}
 .hf-savings-progress i.hf-cycle-track{position:relative;box-shadow:inset 0 2px 4px rgba(1,39,24,.10),0 1px 0 #fff}.hf-savings-progress i.hf-cycle-track em{position:relative;z-index:1;box-shadow:0 1px 5px rgba(8,116,67,.34)}.hf-cycle-mark{position:absolute;z-index:2;top:50%;width:5px;height:5px;border-radius:50%;transform:translate(-50%,-50%);background:#cbd7d0;border:1px solid rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.16);pointer-events:auto}.hf-cycle-mark.is-paid{background:#fff;box-shadow:0 0 0 2px rgba(8,116,67,.22),0 1px 5px rgba(0,0,0,.18)}
 .hf-rules-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.hf-rules-head strong{font-size:10px!important;color:#17221c}.hf-rules-toggle{border:1px solid #dce5df;background:#fff;color:#087443;border-radius:8px;padding:5px 9px;font-size:7px;font-weight:900;cursor:pointer;box-shadow:0 2px 7px rgba(0,0,0,.05)}.hf-rules-body p{margin:6px 0 0!important}.hf-rules-body.is-collapsed{display:none}
 .hf-finance-actions{grid-template-columns:1fr 1fr!important}.hf-finance-actions a.primary,.hf-finance-actions button.primary{box-shadow:0 8px 18px rgba(8,116,67,.18)}
 @media(max-width:600px){.hf-savings-sheet{max-height:calc(100vh - 54px);padding:16px;padding-top:20px;border-radius:20px;transform:translate(-50%,-50%)}.hf-finance-actions{grid-template-columns:1fr!important}.hf-savings-close{width:44px!important;height:44px!important;right:9px!important;top:9px!important}.hf-savings-balance{margin-top:12px}}
 `;document.head.appendChild(style);}
 const toggle=sheet.querySelector('.hf-rules-toggle'),body=sheet.querySelector('.hf-rules-body');
 if(toggle&&body){toggle.onclick=()=>{const collapsed=body.classList.toggle('is-collapsed');toggle.textContent=collapsed?'Show':'Hide';toggle.setAttribute('aria-expanded',String(!collapsed));};}
};
const watch=()=>{if(document.getElementById('hfSavingsModal'))polish();};
new MutationObserver(watch).observe(document.body,{childList:true});setTimeout(watch,600);setTimeout(watch,1500);
})();