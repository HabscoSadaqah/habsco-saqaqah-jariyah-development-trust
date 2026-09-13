(()=>{
'use strict';
const css=`
/* PIN belongs to the Savings modal. Keep the PIN layer inside the same modal coordinate system. */
#hfSavingsModal .hf-savings-sheet{position:relative!important}
#hfSavingsModal .hf-pin-modal.hf-pin-final-layer{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:2147483000!important;pointer-events:none!important;background:transparent!important;box-shadow:none!important;overflow:visible!important;display:block!important}
#hfSavingsModal .hf-pin-modal.hf-pin-final-layer .hf-pin-backdrop{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:0!important;pointer-events:auto!important;background:rgba(2,18,11,.48)!important;backdrop-filter:blur(5px)!important;border-radius:22px!important}
#hfSavingsModal .hf-pin-modal.hf-pin-final-layer .hf-pin-sheet{position:absolute!important;left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important;margin:0!important;z-index:2!important;pointer-events:auto!important;width:min(300px,calc(100% - 56px))!important;max-width:calc(100% - 44px)!important;max-height:calc(100% - 56px)!important;box-sizing:border-box!important;overflow:auto!important;padding:18px!important;border-radius:18px!important;background:#fff!important;border:1px solid #dce9e2!important;box-shadow:0 20px 55px rgba(0,0,0,.28),0 5px 18px rgba(8,116,67,.12)!important;opacity:1!important;visibility:visible!important}
#hfSavingsModal .hf-pin-modal.hf-pin-final-layer .hf-pin-sheet input{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;margin-left:auto!important;margin-right:auto!important}
#hfSavingsModal .hf-pin-modal.hf-pin-final-layer .hf-pin-confirm{width:100%!important}
`;
const set=(e,p)=>{if(!e)return;for(const[k,v]of Object.entries(p))e.style.setProperty(k,v,'important')};
let listenersInstalled=false;
let resizeObserver=null;
function position(){
 const modal=document.getElementById('hfSavingsModal');
 const sheet=modal?.querySelector('.hf-savings-sheet');
 if(!modal||!sheet)return;
 const pin=document.querySelector('.hf-pin-modal');
 if(!pin||!pin.isConnected)return;
 /* Move the active PIN modal into the Savings sheet so its 50%/50% is the exact Savings center. */
 if(!sheet.contains(pin))sheet.appendChild(pin);
 const rect=sheet.getBoundingClientRect();
 if(rect.width<=0||rect.height<=0)return;
 pin.classList.add('hf-pin-final-layer');
 set(sheet,{position:'relative'});
 set(pin,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'2147483000',pointerEvents:'none',background:'transparent',boxShadow:'none',overflow:'visible',display:'block',opacity:'1',visibility:'visible'});
 const backdrop=pin.querySelector('.hf-pin-backdrop');
 set(backdrop,{position:'absolute',left:'0',top:'0',width:'100%',height:'100%',right:'auto',bottom:'auto',zIndex:'0',pointerEvents:'auto',background:'rgba(2,18,11,.48)',backdropFilter:'blur(5px)',boxShadow:'none',filter:'none',borderRadius:'22px'});
 const ps=pin.querySelector('.hf-pin-sheet');
 if(!ps)return;
 set(ps,{position:'absolute',left:'50%',top:'50%',right:'auto',bottom:'auto',transform:'translate(-50%,-50%)',margin:'0',zIndex:'2',pointerEvents:'auto',width:Math.min(300,Math.max(220,rect.width-56))+'px',maxWidth:Math.max(180,rect.width-44)+'px',maxHeight:Math.max(160,rect.height-56)+'px',boxSizing:'border-box',overflow:'auto',padding:'18px',borderRadius:'18px',background:'#fff',border:'1px solid #dce9e2',boxShadow:'0 20px 55px rgba(0,0,0,.28),0 5px 18px rgba(8,116,67,.12)',opacity:'1',visibility:'visible'});
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