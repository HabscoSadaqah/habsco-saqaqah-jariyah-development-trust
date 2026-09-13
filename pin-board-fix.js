(()=>{
'use strict';
const css=`
.hf-pin-modal.hf-pin-final-layer{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:2147483000!important;pointer-events:none!important;background:transparent!important;overflow:hidden!important;display:block!important}
.hf-pin-modal.hf-pin-final-layer .hf-pin-backdrop{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:0!important;pointer-events:auto!important;background:rgba(2,18,11,.48)!important;backdrop-filter:blur(5px)!important;border-radius:inherit!important}
.hf-pin-modal.hf-pin-final-layer .hf-pin-sheet{position:absolute!important;z-index:2!important;left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important;margin:0!important;box-sizing:border-box!important;overflow:auto!important;background:#fff!important;border:1px solid #dce9e2!important}
.hf-pin-modal.hf-pin-final-layer .hf-pin-sheet input{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;margin-left:auto!important;margin-right:auto!important}
.hf-pin-modal.hf-pin-final-layer .hf-pin-confirm{width:100%!important}
`;
const set=(e,p)=>{if(!e)return;for(const[k,v]of Object.entries(p))e.style.setProperty(k,v,'important')};
let listenersInstalled=false,resizeObserver=null;
function position(){
 const modal=document.getElementById('hfSavingsModal');
 const sheet=modal?.querySelector('.hf-savings-sheet');
 const pin=document.querySelector('.hf-pin-modal');
 if(!modal||!sheet||!pin||!pin.isConnected)return;
 if(!sheet.contains(pin))sheet.appendChild(pin);
 const ps=pin.querySelector('.hf-pin-sheet');
 if(!ps)return;
 const rect=sheet.getBoundingClientRect();
 if(rect.width<1||rect.height<1)return;
 const gap=16;
 const maxW=Math.max(180,rect.width-gap*2);
 const maxH=Math.max(140,rect.height-gap*2);
 const w=Math.min(300,maxW);
 const h=Math.min(maxH,Math.max(140,Math.round(rect.height*0.72)));
 pin.classList.add('hf-pin-final-layer');
 set(sheet,{position:'relative'});
 set(pin,{position:'absolute',left:'0',top:'0',right:'0',bottom:'0',width:'100%',height:'100%',zIndex:'2147483000',pointerEvents:'none',background:'transparent',display:'block',opacity:'1',visibility:'visible',overflow:'hidden',margin:'0'});
 set(pin.querySelector('.hf-pin-backdrop'),{position:'absolute',left:'0',top:'0',right:'0',bottom:'0',width:'100%',height:'100%',zIndex:'0',pointerEvents:'auto',background:'rgba(2,18,11,.48)',backdropFilter:'blur(5px)',borderRadius:'inherit'});
 set(ps,{position:'absolute',left:'50%',top:'50%',right:'auto',bottom:'auto',transform:'translate(-50%,-50%)',width:w+'px',maxWidth:maxW+'px',height:h+'px',maxHeight:maxH+'px',boxSizing:'border-box',overflow:'auto',margin:'0',padding:'16px',borderRadius:'18px',background:'#fff',border:'1px solid #dce9e2',boxShadow:'0 20px 55px rgba(0,0,0,.28),0 5px 18px rgba(8,116,67,.12)',zIndex:'2',pointerEvents:'auto',opacity:'1',visibility:'visible'});
}
function run(){
 const modal=document.getElementById('hfSavingsModal');
 const sheet=modal?.querySelector('.hf-savings-sheet');
 const pin=document.querySelector('.hf-pin-modal');
 if(!sheet||!pin||!pin.isConnected)return;
 position();
 if(resizeObserver)resizeObserver.disconnect();
 if(window.ResizeObserver){resizeObserver=new ResizeObserver(()=>requestAnimationFrame(position));resizeObserver.observe(sheet)}
 if(!listenersInstalled){
  listenersInstalled=true;
  const refresh=()=>requestAnimationFrame(position);
  window.addEventListener('resize',refresh,{passive:true});
  window.addEventListener('scroll',refresh,{passive:true,capture:true});
  window.visualViewport?.addEventListener('resize',refresh,{passive:true});
  window.visualViewport?.addEventListener('scroll',refresh,{passive:true});
 }
}
function install(){let s=document.getElementById('hf-pin-board-fix-style');if(!s){s=document.createElement('style');s.id='hf-pin-board-fix-style';document.head.appendChild(s)}s.textContent=css;run()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body,{childList:true,subtree:true});
})();