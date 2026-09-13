(()=>{
'use strict';
const set=(e,p)=>{if(!e)return;for(const[k,v]of Object.entries(p))e.style.setProperty(k,v,'important')};
const SAVINGS_STATE='hf:savings-modal-open';
let installed=false,observer=null,lock=null,pageLock=null,restored=false;
function isReload(){try{return performance.getEntriesByType('navigation')?.[0]?.type==='reload'}catch(_){return false}}
function rememberSavings(){try{sessionStorage.setItem(SAVINGS_STATE,'1')}catch(_){}
}
function forgetSavings(){try{sessionStorage.removeItem(SAVINGS_STATE)}catch(_){}
}
function shouldRestoreSavings(){if(restored||!isReload())return false;try{return sessionStorage.getItem(SAVINGS_STATE)==='1'}catch(_){return false}}
function restoreSavings(){
 if(!shouldRestoreSavings())return;
 const open=()=>{if(document.getElementById('hfSavingsModal')){restored=true;return true}const a=document.querySelector('#savingsBalance')?.closest('a')||document.querySelector('a[href*="type=savings"]');if(!a)return false;restored=true;a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));return true};
 if(open())return;
 let tries=0;const timer=setInterval(()=>{if(open()||++tries>80)clearInterval(timer)},100);
}
function lockPage(){
 if(pageLock)return;
 const b=document.body,d=document.documentElement;
 pageLock={bodyOverflow:b.style.overflow,bodyPosition:b.style.position,bodyWidth:b.style.width,bodyTop:b.style.top,htmlOverflow:d.style.overflow,scrollY:window.scrollY};
 set(d,{overflow:'hidden'});
 set(b,{overflow:'hidden',position:'fixed',width:'100%',top:-pageLock.scrollY+'px'});
}
function unlockPage(){
 if(!pageLock)return;
 const p=pageLock;pageLock=null;
 const b=document.body,d=document.documentElement;
 b.style.removeProperty('overflow');b.style.removeProperty('position');b.style.removeProperty('width');b.style.removeProperty('top');
 d.style.removeProperty('overflow');
 if(p.bodyOverflow)b.style.overflow=p.bodyOverflow;
 if(p.bodyPosition)b.style.position=p.bodyPosition;
 if(p.bodyWidth)b.style.width=p.bodyWidth;
 if(p.bodyTop)b.style.top=p.bodyTop;
 if(p.htmlOverflow)d.style.overflow=p.htmlOverflow;
 window.scrollTo(0,p.scrollY);
}
function compactSavings(){
 if(document.getElementById('hf-savings-compact-style'))return;
 const st=document.createElement('style');st.id='hf-savings-compact-style';
 st.textContent=`
.hf-savings-sheet{box-sizing:border-box}
@media(max-width:520px){
 .hf-savings-sheet{padding:12px!important;max-height:calc(100dvh - 10px)!important;overflow:hidden!important}
 .hf-savings-sheet h2{margin:3px 38px 2px!important;font-size:18px!important}
 .hf-savings-intro{margin:0 0 8px!important;font-size:8.5px!important}
 .hf-savings-balance{padding:10px!important;border-radius:13px!important}
 .hf-savings-balance span{font-size:8px!important}.hf-savings-balance strong{font-size:21px!important;margin-top:2px!important}
 .hf-savings-grid{gap:5px!important;margin:6px 0!important}.hf-savings-grid>div{padding:8px!important;border-radius:10px!important}
 .hf-savings-grid small{font-size:7px!important}.hf-savings-grid b{margin-top:2px!important;font-size:10px!important}
 .hf-savings-progress{padding:8px!important;border-radius:10px!important}.hf-savings-progress>div{font-size:8px!important}
 .hf-savings-progress i{height:5px!important;margin:5px 0!important}.hf-savings-progress small{font-size:7px!important}
 .hf-savings-plan{margin-top:6px!important;padding:8px!important;border-radius:10px!important}.hf-savings-plan>strong{font-size:9px!important;margin-bottom:5px!important}
 .hf-savings-plan label{font-size:7px!important;margin-top:4px!important}.hf-savings-plan select{margin-top:2px!important;padding:6px!important;font-size:9px!important;border-radius:7px!important}
 .plan-btn{margin-top:6px!important;padding:8px!important;font-size:8px!important}.plan-note,.plan-fixed{font-size:7px!important;margin-top:4px!important}
 .hf-savings-actions{grid-template-columns:1fr 1fr!important;gap:5px!important;margin-top:6px!important}
 .plan-btn,.hf-savings-actions button,.hf-savings-actions a{padding:8px!important;font-size:8px!important;border-radius:8px!important}
 .hf-savings-rules{margin-top:6px!important;padding:7px!important;border-radius:9px!important}.hf-savings-rules strong{font-size:8px!important}
 .hf-savings-rules p{margin:2px 0!important;font-size:7px!important;line-height:1.2!important}
}
@media(max-width:520px) and (max-height:620px){
 .hf-savings-sheet{padding:9px!important}.hf-savings-intro{display:none!important}.hf-savings-balance{padding:8px!important}
 .hf-savings-balance strong{font-size:19px!important}.hf-savings-grid>div{padding:6px!important}.hf-savings-progress{padding:6px!important}
 .hf-savings-plan{padding:6px!important}.hf-savings-actions{gap:4px!important;margin-top:4px!important}.hf-savings-rules{padding:5px!important;margin-top:4px!important}
 .hf-savings-rules p{font-size:6.5px!important}
}`;
 document.head.appendChild(st);
}
function position(){
 compactSavings();
 const savings=document.getElementById('hfSavingsModal');
 const savingsSheet=savings?.querySelector('.hf-savings-sheet');
 const pin=[...document.querySelectorAll('.hf-pin-modal')].find(x=>x.querySelector('#hfPinInput'));
 const pinSheet=pin?.querySelector('.hf-pin-sheet');
 if(!savingsSheet){
  if(lock?.isConnected)lock.remove();lock=null;unlockPage();return;
 }
 rememberSavings();
 lockPage();
 if(!pin||!pinSheet||!pin.isConnected){
  if(lock?.isConnected)lock.remove();lock=null;return;
 }
 if(pin.parentElement!==document.body)document.body.appendChild(pin);
 const r=savingsSheet.getBoundingClientRect();if(r.width<1||r.height<1)return;
 const cx=r.left+r.width/2,cy=r.top+r.height/2,maxW=Math.max(160,r.width-24),maxH=Math.max(120,r.height-24);
 set(pin,{position:'fixed',left:'0',top:'0',right:'0',bottom:'0',width:'100vw',height:'100vh',transform:'none',zIndex:'2147483000',pointerEvents:'none',background:'transparent'});
 const oldBackdrop=pin.querySelector('.hf-pin-backdrop');
 if(oldBackdrop)set(oldBackdrop,{display:'none',pointerEvents:'none',background:'transparent',backdropFilter:'none',WebkitBackdropFilter:'none'});
 if(!lock||!lock.isConnected||lock.parentElement!==savingsSheet){
  lock=savingsSheet.querySelector('.hf-savings-pin-lock');
  if(!lock){lock=document.createElement('div');lock.className='hf-savings-pin-lock';savingsSheet.appendChild(lock)}
 }
 set(savingsSheet,{position:'relative'});
 set(lock,{position:'absolute',left:'0',top:'0',right:'0',bottom:'0',width:'100%',height:'100%',zIndex:'2147483000',pointerEvents:'auto',background:'rgba(0,0,0,.34)',backdropFilter:'blur(3px)',WebkitBackdropFilter:'blur(3px)',borderRadius:getComputedStyle(savingsSheet).borderRadius});
 set(pinSheet,{position:'fixed',left:cx+'px',top:cy+'px',right:'auto',bottom:'auto',transform:'translate(-50%,-50%)',maxWidth:maxW+'px',maxHeight:maxH+'px',zIndex:'2147483647',pointerEvents:'auto'});
}
function run(){
 compactSavings();position();restoreSavings();
 if(observer)observer.disconnect();
 const sheet=document.querySelector('#hfSavingsModal .hf-savings-sheet');
 if(sheet&&window.ResizeObserver){observer=new ResizeObserver(()=>requestAnimationFrame(position));observer.observe(sheet)}
 if(!installed){
  installed=true;
  const refresh=()=>requestAnimationFrame(position);
  window.addEventListener('resize',refresh,{passive:true});
  window.addEventListener('scroll',refresh,{passive:true,capture:true});
  window.visualViewport?.addEventListener('resize',refresh,{passive:true});
  window.visualViewport?.addEventListener('scroll',refresh,{passive:true});
  document.addEventListener('click',e=>{if(e.target.closest?.('.hf-savings-close'))forgetSavings()},{capture:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body,{childList:true,subtree:true});
})();