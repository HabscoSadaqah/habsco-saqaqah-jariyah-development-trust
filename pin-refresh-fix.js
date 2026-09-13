(()=>{
'use strict';
const KEY='hf:transaction-pin-open';
let restoring=false;
const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(_){return null}};
const write=v=>{try{sessionStorage.setItem(KEY,JSON.stringify(v))}catch(_){} };
const clear=()=>{try{sessionStorage.removeItem(KEY)}catch(_){} };
function capture(){
 const pin=[...document.querySelectorAll('.hf-pin-modal')].find(x=>x.querySelector('#hfPinInput'));
 if(!pin)return;
 const p=pin.querySelector('p')?.textContent||'Confirm this transaction with your PIN.';
 write({open:true,title:p});
 pin.querySelector('.hf-pin-close')?.addEventListener('click',clear,{capture:true,once:true});
}
function restore(){
 if(restoring||!performance.getEntriesByType('navigation')?.[0]||performance.getEntriesByType('navigation')[0].type!=='reload')return;
 const state=read();
 if(!state?.open)return;
 const savings=document.getElementById('hfSavingsModal');
 if(!savings)return;
 if(document.querySelector('.hf-pin-modal')?.querySelector('#hfPinInput'))return;
 restoring=true;
 const x=document.createElement('div');
 x.className='hf-pin-modal hf-pin-restored';
 x.innerHTML='<div class="hf-pin-backdrop"></div><section class="hf-pin-sheet" role="dialog" aria-modal="true"><button class="hf-pin-close" type="button">×</button><div class="hf-pin-icon">🔐</div><h3>Confirm with Transaction PIN</h3><p></p><input id="hfPinInput" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" type="password" placeholder="Enter 6-digit PIN" aria-label="6-digit transaction PIN"><div class="hf-pin-error"></div><button class="hf-pin-confirm" type="button">Confirm</button></section></div>';
 x.querySelector('p').textContent=state.title||'Confirm this transaction with your PIN.';
 document.body.appendChild(x);
 const close=()=>{clear();x.remove()};
 x.querySelector('.hf-pin-close').onclick=close;
 x.querySelector('.hf-pin-backdrop').onclick=e=>e.preventDefault();
 x.querySelector('.hf-pin-confirm').onclick=()=>{x.querySelector('.hf-pin-error').textContent='Please restart the transaction after refreshing to continue securely.'};
 setTimeout(()=>x.querySelector('#hfPinInput')?.focus(),100);
}
function run(){
 capture();
 restore();
}
if(!document.getElementById('hf-pin-refresh-style')){
 const st=document.createElement('style');st.id='hf-pin-refresh-style';st.textContent='.hf-pin-restored{position:fixed!important;inset:0!important;z-index:2147483647!important}.hf-pin-restored .hf-pin-backdrop{display:none!important;pointer-events:none!important;background:transparent!important}.hf-pin-restored .hf-pin-sheet{z-index:2147483647!important;pointer-events:auto!important}';document.head.appendChild(st)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body,{childList:true,subtree:true});
})();