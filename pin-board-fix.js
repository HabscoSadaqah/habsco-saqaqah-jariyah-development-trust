(()=>{
'use strict';
const css=`
/* Final Savings PIN layer: lock only the Savings modal and center the PIN card inside it. */
.hf-pin-modal.hf-pin-final-layer{
  position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;
  z-index:2147483000!important;pointer-events:none!important;background:transparent!important;
  box-shadow:none!important;backdrop-filter:none!important;filter:none!important;overflow:hidden!important;
}
.hf-pin-modal.hf-pin-final-layer .hf-pin-backdrop{
  position:fixed!important;z-index:0!important;pointer-events:auto!important;
  background:rgba(2,18,11,.48)!important;backdrop-filter:blur(5px)!important;
  box-shadow:none!important;filter:none!important;border-radius:22px!important;
}
.hf-pin-modal.hf-pin-final-layer .hf-pin-sheet{
  position:fixed!important;z-index:2!important;pointer-events:auto!important;
  left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;
  transform:translate(-50%,-50%)!important;margin:0!important;
  width:min(300px,calc(100vw - 56px))!important;
  max-width:calc(100vw - 56px)!important;
  max-height:calc(100vh - 56px)!important;box-sizing:border-box!important;
  overflow:auto!important;padding:18px!important;border-radius:18px!important;
  background:#fff!important;border:1px solid #dce9e2!important;
  box-shadow:0 20px 55px rgba(0,0,0,.28),0 5px 18px rgba(8,116,67,.12)!important;
  opacity:1!important;visibility:visible!important;
}
.hf-pin-modal.hf-pin-final-layer .hf-pin-sheet input{
  display:block!important;width:100%!important;max-width:100%!important;
  box-sizing:border-box!important;margin-left:auto!important;margin-right:auto!important;
}
.hf-pin-modal.hf-pin-final-layer .hf-pin-confirm{width:100%!important}
@media(max-width:520px){
 .hf-pin-modal.hf-pin-final-layer .hf-pin-sheet{
   width:260px!important;max-width:calc(100vw - 44px)!important;
   max-height:calc(100vh - 44px)!important;padding:16px!important;border-radius:17px!important;
 }
}
`;
const set=(e,p)=>{if(!e)return;for(const [k,v] of Object.entries(p))e.style.setProperty(k,v,'important')};
let active=null;
let listenersInstalled=false;
function position(){
 const modal=document.getElementById('hfSavingsModal');
 const sheet=modal?.querySelector('.hf-savings-sheet');
 const pin=active||document.querySelector('.hf-pin-modal');
 if(!modal||!sheet||!pin)return;
 const rect=sheet.getBoundingClientRect();
 if(rect.width<=0||rect.height<=0)return;
 pin.classList.add('hf-pin-final-layer');
 set(pin,{position:'fixed',inset:'0',width:'100vw',height:'100vh',zIndex:'2147483000',pointerEvents:'none',background:'transparent',boxShadow:'none',backdropFilter:'none',filter:'none',overflow:'hidden',display:'block',opacity:'1',visibility:'visible'});
 const backdrop=pin.querySelector('.hf-pin-backdrop');
 set(backdrop,{
   position:'fixed',left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',
   right:'auto',bottom:'auto',zIndex:'0',pointerEvents:'auto',background:'rgba(2,18,11,.48)',
   backdropFilter:'blur(5px)',boxShadow:'none',filter:'none',borderRadius:'22px'
 });
 const ps=pin.querySelector('.hf-pin-sheet');
 const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
 const w=Math.min(300,Math.max(220,rect.width-56));
 const h=Math.max(160,rect.height-56);
 set(ps,{
   position:'fixed',left:cx+'px',top:cy+'px',right:'auto',bottom:'auto',transform:'translate(-50%,-50%)',
   width:w+'px',maxWidth:(rect.width-44)+'px',maxHeight:h+'px',boxSizing:'border-box',overflow:'auto',
   margin:'0',padding:'18px',borderRadius:'18px',background:'#fff',border:'1px solid #dce9e2',
   boxShadow:'0 20px 55px rgba(0,0,0,.28),0 5px 18px rgba(8,116,67,.12)',
   zIndex:'2',pointerEvents:'auto',opacity:'1',visibility:'visible'
 });
}
function run(){
 const modal=document.getElementById('hfSavingsModal');
 if(!modal)return;
 const sheet=modal.querySelector('.hf-savings-sheet');
 const pin=document.querySelector('.hf-pin-modal');
 if(!sheet||!pin)return;
 active=pin;
 position();
 if(!listenersInstalled){
   listenersInstalled=true;
   window.addEventListener('resize',()=>requestAnimationFrame(position),{passive:true});
   window.addEventListener('scroll',()=>requestAnimationFrame(position),{passive:true,capture:true});
   window.visualViewport?.addEventListener('resize',()=>requestAnimationFrame(position),{passive:true});
   window.visualViewport?.addEventListener('scroll',()=>requestAnimationFrame(position),{passive:true});
 }
}
function install(){
 let s=document.getElementById('hf-pin-board-fix-style');
 if(!s){s=document.createElement('style');s.id='hf-pin-board-fix-style';document.head.appendChild(s)}
 s.textContent=css;run();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body,{childList:true,subtree:true});
})();