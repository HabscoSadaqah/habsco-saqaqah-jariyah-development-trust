(()=>{
'use strict';
const css=`
.hf-pin-modal.hf-pin-final-layer{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:2147483000!important;pointer-events:none!important;background:transparent!important;overflow:hidden!important}
.hf-pin-modal.hf-pin-final-layer .hf-pin-backdrop{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:0!important;pointer-events:auto!important;background:rgba(2,18,11,.48)!important;backdrop-filter:blur(5px)!important;border-radius:0!important}
.hf-pin-modal.hf-pin-final-layer .hf-pin-sheet{position:fixed!important;z-index:2!important;left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important;margin:0!important;box-sizing:border-box!important;overflow:auto!important;background:#fff!important;border:1px solid #dce9e2!important}
.hf-pin-modal.hf-pin-final-layer .hf-pin-sheet input{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;margin-left:auto!important;margin-right:auto!important}
.hf-pin-modal.hf-pin-final-layer .hf-pin-confirm{width:100%!important}
`;
const set=(e,p)=>{if(!e)return;for(const[k,v]of Object.entries(p))e.style.setProperty(k,v,'important')};
let listenersInstalled=false;
function position(){
 const pin=document.querySelector('.hf-pin-modal');
 const ps=pin?.querySelector('.hf-pin-sheet');
 if(!pin||!ps||!pin.isConnected)return;
 pin.classList.add('hf-pin-final-layer');
 set(pin,{position:'fixed',left:'0',top:'0',right:'0',bottom:'0',width:'100vw',height:'100vh',zIndex:'2147483000',pointerEvents:'none',background:'transparent',display:'block',opacity:'1',visibility:'visible',overflow:'hidden'});
 set(pin.querySelector('.hf-pin-backdrop'),{position:'fixed',left:'0',top:'0',right:'0',bottom:'0',width:'100vw',height:'100vh',zIndex:'0',pointerEvents:'auto',background:'rgba(2,18,11,.48)',backdropFilter:'blur(5px)',borderRadius:'0'});
 const vw=Math.max(320,window.visualViewport?.width||window.innerWidth||320);
 const vh=Math.max(320,window.visualViewport?.height||window.innerHeight||320);
 const margin=20;
 const w=Math.min(360,vw-margin*2);
 const h=Math.min(Math.max(220,vh-margin*2),560);
 set(ps,{position:'fixed',left:'50%',top:'50%',right:'auto',bottom:'auto',transform:'translate(-50%,-50%)',width:w+'px',maxWidth:(vw-margin*2)+'px',height:h+'px',maxHeight:(vh-margin*2)+'px',boxSizing:'border-box',overflow:'auto',margin:'0',padding:'16px',borderRadius:'18px',background:'#fff',border:'1px solid #dce9e2',boxShadow:'0 20px 55px rgba(0,0,0,.28),0 5px 18px rgba(8,116,67,.12)',zIndex:'2',pointerEvents:'auto',opacity:'1',visibility:'visible'});
}
function run(){
 const pin=document.querySelector('.hf-pin-modal');
 if(!pin||!pin.isConnected)return;
 position();
 if(!listenersInstalled){
  listenersInstalled=true;
  const refresh=()=>requestAnimationFrame(position);
  window.addEventListener('resize',refresh,{passive:true});
  window.addEventListener('orientationchange',refresh,{passive:true});
  window.visualViewport?.addEventListener('resize',refresh,{passive:true});
  window.visualViewport?.addEventListener('scroll',refresh,{passive:true});
 }
}
function install(){let s=document.getElementById('hf-pin-board-fix-style');if(!s){s=document.createElement('style');s.id='hf-pin-board-fix-style';document.head.appendChild(s)}s.textContent=css;run()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body,{childList:true,subtree:true});
})();