(()=>{
'use strict';
const SAV='hf:savings-modal-open',PIN='hf:transaction-pin-open';
let busy=false,timer=0;
const hasSavings=()=>!!document.getElementById('hfSavingsModal');
const hasPin=()=>!![...document.querySelectorAll('.hf-pin-modal')].find(x=>x.querySelector('#hfPinInput'));
const saved=k=>{try{return localStorage.getItem(k)==='1'||!!sessionStorage.getItem(k)}catch(_){return false}};
const pinState=()=>{try{return JSON.parse(localStorage.getItem(PIN)||sessionStorage.getItem(PIN)||'null')}catch(_){return null}};
const openSavings=()=>{
 if(hasSavings()||!saved(SAV))return false;
 const a=document.querySelector('#savingsBalance')?.closest('a')||document.querySelector('a[href*="type=savings"]');
 if(!a)return false;
 try{a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));return true}catch(_){return false}
};
const restorePin=()=>{
 if(hasPin()||!hasSavings())return false;
 const state=pinState();if(!state?.open)return false;
 const x=document.createElement('div');x.className='hf-pin-modal hf-pin-restored';
 x.innerHTML='<div class="hf-pin-backdrop"></div><section class="hf-pin-sheet" role="dialog" aria-modal="true"><button class="hf-pin-close" type="button">×</button><div class="hf-pin-icon">🔐</div><h3>Confirm with Transaction PIN</h3><p></p><input id="hfPinInput" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" type="password" placeholder="Enter 6-digit PIN" aria-label="6-digit transaction PIN"><div class="hf-pin-error"></div><button class="hf-pin-confirm" type="button">Confirm</button></section></div>';
 x.querySelector('p').textContent=state.title||'Confirm this transaction with your PIN.';
 document.body.appendChild(x);
 const close=()=>{try{localStorage.removeItem(PIN);sessionStorage.removeItem(PIN)}catch(_){}x.remove()};
 x.querySelector('.hf-pin-close').onclick=close;
 x.querySelector('.hf-pin-backdrop').onclick=e=>e.preventDefault();
 x.querySelector('.hf-pin-confirm').onclick=()=>{x.querySelector('.hf-pin-error').textContent='Please close this PIN box and start the transaction again after a browser refresh.'};
 return true;
};
const place=()=>{
 const s=document.getElementById('hfSavingsModal')?.querySelector('.hf-savings-sheet');
 const p=[...document.querySelectorAll('.hf-pin-modal')].find(x=>x.querySelector('#hfPinInput'))?.querySelector('.hf-pin-sheet');
 if(!p)return;
 if(s){const r=s.getBoundingClientRect();p.style.left=(r.left+r.width/2)+'px';p.style.top=(r.top+r.height/2)+'px'}else{p.style.left='50%';p.style.top='50%'}
 p.style.position='fixed';p.style.right='auto';p.style.bottom='auto';p.style.transform='translate(-50%,-50%)';
};
const recover=()=>{
 if(busy)return;busy=true;
 let n=0;
 const tick=()=>{openSavings();restorePin();place();if(hasSavings()&&(hasPin()||!saved(PIN))||++n>=40){busy=false;timer=0;return}timer=setTimeout(tick,25)};
 tick();
};
const orientation=()=>{recover();requestAnimationFrame(recover);setTimeout(recover,80);setTimeout(recover,200);setTimeout(recover,500);};
window.addEventListener('orientationchange',orientation,{passive:true});
window.addEventListener('resize',orientation,{passive:true});
window.visualViewport?.addEventListener('resize',orientation,{passive:true});
window.addEventListener('pageshow',recover,{passive:true});
new MutationObserver(()=>{if(saved(SAV)||saved(PIN))requestAnimationFrame(recover)}).observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',recover,{once:true});else recover();
})();