(()=>{
'use strict';
const set=(e,p)=>{if(!e)return;for(const[k,v]of Object.entries(p))e.style.setProperty(k,v,'important')};
let installed=false,observer=null,lock=null,bodyLock=null;
function setBodyLock(active){
 const body=document.body,html=document.documentElement;
 if(active){
  if(bodyLock)return;
  const y=window.scrollY||window.pageYOffset||0;
  bodyLock={y,overflow:body.style.overflow,position:body.style.position,top:body.style.top,width:body.style.width};
  set(body,{overflow:'hidden',position:'fixed',top:(-y)+'px',width:'100%'});
  set(html,{overflow:'hidden'});
 }else if(bodyLock){
  const s=bodyLock;bodyLock=null;
  body.style.overflow=s.overflow;body.style.position=s.position;body.style.top=s.top;body.style.width=s.width;
  html.style.overflow='';
  window.scrollTo(0,s.y);
 }
}
function position(){
 const savings=document.getElementById('hfSavingsModal');
 const savingsSheet=savings?.querySelector('.hf-savings-sheet');
 const pin=[...document.querySelectorAll('.hf-pin-modal')].find(x=>x.querySelector('#hfPinInput'));
 const pinSheet=pin?.querySelector('.hf-pin-sheet');
 if(!savingsSheet||!pin||!pinSheet||!pin.isConnected){
  if(lock?.isConnected)lock.remove();
  lock=null;
  setBodyLock(false);
  return;
 }
 setBodyLock(true);
 if(pin.parentElement!==document.body)document.body.appendChild(pin);
 const r=savingsSheet.getBoundingClientRect();
 if(r.width<1||r.height<1)return;
 const cx=r.left+r.width/2,cy=r.top+r.height/2;
 const maxW=Math.max(160,r.width-24),maxH=Math.max(120,r.height-24);
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