(()=>{
'use strict';
const set=(e,p)=>{if(!e)return;for(const[k,v]of Object.entries(p))e.style.setProperty(k,v,'important')};
let installed=false,observer=null;
function position(){
 const savings=document.getElementById('hfSavingsModal');
 const savingsSheet=savings?.querySelector('.hf-savings-sheet');
 const pin=[...document.querySelectorAll('.hf-pin-modal')].find(x=>x.querySelector('#hfPinInput'));
 const pinSheet=pin?.querySelector('.hf-pin-sheet');
 if(!savingsSheet||!pin||!pinSheet||!pin.isConnected)return;
 if(pin.parentElement!==document.body)document.body.appendChild(pin);
 const r=savingsSheet.getBoundingClientRect();
 if(r.width<1||r.height<1)return;
 const cx=r.left+r.width/2,cy=r.top+r.height/2;
 const maxW=Math.max(160,r.width-24),maxH=Math.max(120,r.height-24);
 set(savingsSheet,{position:'relative'});
 let veil=savingsSheet.querySelector('.hf-pin-lock-veil');
 if(!veil){
  veil=document.createElement('div');
  veil.className='hf-pin-lock-veil';
  savingsSheet.appendChild(veil);
 }
 set(veil,{position:'absolute',left:'0',top:'0',right:'0',bottom:'0',width:'100%',height:'100%',zIndex:'2147482999',pointerEvents:'auto',borderRadius:'inherit',background:'rgba(2,18,11,.42)',backdropFilter:'blur(2px)',WebkitBackdropFilter:'blur(2px)'});
 const oldBackdrop=pin.querySelector('.hf-pin-backdrop');
 if(oldBackdrop)set(oldBackdrop,{position:'fixed',left:'0',top:'0',right:'0',bottom:'0',width:'100vw',height:'100vh',inset:'0',zIndex:'0',pointerEvents:'none',background:'transparent',backdropFilter:'none',WebkitBackdropFilter:'none'});
 set(pin,{position:'fixed',left:'0',top:'0',right:'0',bottom:'0',width:'100vw',height:'100vh',transform:'none',zIndex:'2147483000',pointerEvents:'none',background:'transparent'});
 set(pinSheet,{position:'fixed',left:cx+'px',top:cy+'px',right:'auto',bottom:'auto',transform:'translate(-50%,-50%)',maxWidth:maxW+'px',maxHeight:maxH+'px',zIndex:'2147483001',pointerEvents:'auto'});
}
function run(){
 position();
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
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body,{childList:true,subtree:true});
})();