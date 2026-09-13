(()=>{
'use strict';
const css=`
#hfSavingsModal .hf-pin-modal{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;z-index:99999!important;pointer-events:none!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;filter:none!important;overflow:visible!important}
#hfSavingsModal .hf-pin-backdrop{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;filter:none!important;pointer-events:none!important}
#hfSavingsModal .hf-pin-sheet{position:absolute!important;left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:220px!important;max-width:calc(100% - 24px)!important;max-height:calc(100% - 24px)!important;box-sizing:border-box!important;overflow:auto!important;padding:13px!important;border-radius:14px!important;background:#fff!important;border:1px solid #dce9e2!important;box-shadow:0 12px 28px rgba(0,0,0,.16),0 3px 10px rgba(8,116,67,.07)!important;z-index:100000!important;pointer-events:auto!important;opacity:1!important;visibility:visible!important}
#hfSavingsModal .hf-pin-sheet input{display:block!important;width:145px!important;max-width:100%!important;margin-left:auto!important;margin-right:auto!important;box-sizing:border-box!important}
@media(max-width:480px){#hfSavingsModal .hf-pin-sheet{width:210px!important;max-width:calc(100vw - 64px)!important}}
`;
const set=(e,p)=>{if(!e)return;for(const [k,v] of Object.entries(p))e.style.setProperty(k,v,'important')};
const run=()=>{
 const modal=document.getElementById('hfSavingsModal');
 if(!modal)return;
 const sheet=modal.querySelector('.hf-savings-sheet');
 if(!sheet)return;
 const pin=document.querySelector('body>.hf-pin-modal')||document.querySelector('.hf-pin-modal');
 if(!pin)return;
 if(pin.parentElement!==sheet)sheet.appendChild(pin);
 sheet.style.setProperty('position','relative','important');
 sheet.style.setProperty('overflow','visible','important');
 sheet.style.setProperty('z-index','2','important');
 set(pin,{position:'absolute',inset:'0',width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',padding:'10px',boxSizing:'border-box',zIndex:'99999',pointerEvents:'none',background:'transparent',boxShadow:'none',backdropFilter:'none',filter:'none',overflow:'visible',opacity:'1',visibility:'visible'});
 const backdrop=pin.querySelector('.hf-pin-backdrop');
 set(backdrop,{position:'absolute',inset:'0',width:'100%',height:'100%',background:'transparent',boxShadow:'none',backdropFilter:'none',filter:'none',pointerEvents:'none'});
 const ps=pin.querySelector('.hf-pin-sheet');
 set(ps,{position:'absolute',left:'50%',top:'50%',right:'auto',bottom:'auto',transform:'translate(-50%,-50%)',width:'220px',maxWidth:'calc(100% - 24px)',maxHeight:'calc(100% - 24px)',boxSizing:'border-box',overflow:'auto',padding:'13px',borderRadius:'14px',background:'#fff',border:'1px solid #dce9e2',boxShadow:'0 12px 28px rgba(0,0,0,.16),0 3px 10px rgba(8,116,67,.07)',zIndex:'100000',pointerEvents:'auto',opacity:'1',visibility:'visible',margin:'0'});
 if(ps)ps.classList.add('hf-pin-sheet');
};
const install=()=>{let s=document.getElementById('hf-pin-board-fix-style');if(!s){s=document.createElement('style');s.id='hf-pin-board-fix-style';document.head.appendChild(s)}s.textContent=css;run()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
new MutationObserver(()=>{requestAnimationFrame(run)}).observe(document.body,{childList:true,subtree:true});
})();
