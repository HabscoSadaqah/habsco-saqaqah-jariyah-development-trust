(()=>{
'use strict';
const KEY='hf:transaction-pin-open';
let restoring=false;
const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(_){return null}};
const write=v=>{try{sessionStorage.setItem(KEY,JSON.stringify(v))}catch(_){} };
const clear=()=>{try{sessionStorage.removeItem(KEY)}catch(_){} };
const isReload=()=>{try{return performance.getEntriesByType('navigation')?.[0]?.type==='reload'}catch(_){return false}};
function findPin(){return [...document.querySelectorAll('.hf-pin-modal')].find(x=>x.querySelector('#hfPinInput'))||null}
function capture(){
 const pin=findPin();
 if(!pin||pin.classList.contains('hf-pin-restored'))return;
 const p=pin.querySelector('p')?.textContent||'Confirm this transaction with your PIN.';
 write({open:true,title:p});
 const close=pin.querySelector('.hf-pin-close');
 if(close&&!close.dataset.hfRefreshBound){close.dataset.hfRefreshBound='1';close.addEventListener('click',clear,{capture:true})}
}
function restore(){
 if(!isReload()||restoring||findPin())return;
 const state=read();
 if(!state?.open)return;
 if(!document.getElementById('hfSavingsModal'))return false;
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
 const reposition=()=>{const s=x.querySelector('.hf-pin-sheet');if(!s)return;s.style.left='50%';s.style.top='50%';s.style.bottom='auto';s.style.transform='translate(-50%,-50%)'};
 window.addEventListener('resize',reposition,{passive:true});
 window.visualViewport?.addEventListener('resize',reposition,{passive:true});
 x._hfCleanup=()=>{window.removeEventListener('resize',reposition);window.visualViewport?.removeEventListener('resize',reposition)};
 x.querySelector('.hf-pin-close').addEventListener('click',()=>x._hfCleanup?.(),{once:true});
 reposition();
 setTimeout(()=>x.querySelector('#hfPinInput')?.focus(),100);
 restoring=false;
 return true;
}
function run(){
 capture();
 restore();
}
if(!document.getElementById('hf-pin-refresh-style')){
 const st=document.createElement('style');st.id='hf-pin-refresh-style';st.textContent='.hf-pin-restored{position:fixed!important;inset:0!important;z-index:2147483647!important;display:block!important}.hf-pin-restored .hf-pin-backdrop{display:none!important;pointer-events:none!important;background:transparent!important}.hf-pin-restored .hf-pin-sheet{position:fixed!important;left:50%!important;top:50%!important;bottom:auto!important;transform:translate(-50%,-50%)!important;z-index:2147483647!important;pointer-events:auto!important;max-width:calc(100vw - 32px)!important;max-height:calc(100dvh - 28px)!important}';document.head.appendChild(st)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let tries=0;
const retry=setInterval(()=>{run();if(findPin()||!read()?.open||++tries>120)clearInterval(retry)},100);
new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body,{childList:true,subtree:true});
window.addEventListener('resize',()=>requestAnimationFrame(run),{passive:true});
window.visualViewport?.addEventListener('resize',()=>requestAnimationFrame(run),{passive:true});
})();