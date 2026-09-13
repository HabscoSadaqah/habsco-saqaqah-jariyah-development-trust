(()=>{
'use strict';
const css=`
.hf-pin-modal{position:absolute!important;inset:0!important;z-index:20!important;pointer-events:auto!important;background:transparent!important;backdrop-filter:none!important}
.hf-pin-backdrop{position:absolute!important;inset:0!important;background:transparent!important;backdrop-filter:none!important;pointer-events:none!important}
.hf-pin-sheet{position:absolute!important;left:50%!important;right:auto!important;top:50%!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:220px!important;max-width:calc(100% - 24px)!important;min-width:0!important;max-height:calc(100% - 24px)!important;box-sizing:border-box!important;overflow:hidden!important;padding:12px!important;border-radius:12px!important;background:#fff!important;border:1px solid #dce9e2!important;box-shadow:0 12px 32px rgba(0,0,0,.18)!important}
.hf-pin-sheet input,.hf-pin-confirm{display:block!important;width:145px!important;max-width:100%!important;box-sizing:border-box!important;margin-left:auto!important;margin-right:auto!important}
`;
const fit=()=>{
 const pin=document.querySelector('.hf-pin-modal');
 const parent=document.querySelector('#hfSavingsModal .hf-savings-sheet');
 if(pin&&parent&&pin.parentElement!==parent){parent.appendChild(pin);}
 if(pin&&parent){parent.style.position='relative';pin.style.position='absolute';}
};
const install=()=>{if(!document.getElementById('hf-pin-board-fix-style')){const s=document.createElement('style');s.id='hf-pin-board-fix-style';s.textContent=css;document.head.appendChild(s);}fit();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
