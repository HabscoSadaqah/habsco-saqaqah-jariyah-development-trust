(()=>{
'use strict';
const css=`
.hf-pin-modal{position:fixed!important;inset:0!important;z-index:100001!important;pointer-events:auto!important;backdrop-filter:none!important}
.hf-pin-backdrop{position:fixed!important;inset:0!important;background:rgba(4,25,16,.12)!important;backdrop-filter:none!important}
.hf-pin-sheet{position:fixed!important;left:50%!important;right:auto!important;top:50%!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:240px!important;max-width:calc(100vw - 32px)!important;min-width:0!important;max-height:calc(100dvh - 32px)!important;box-sizing:border-box!important;overflow:hidden!important;padding:14px!important;border-radius:14px!important;background:#fff!important}
.hf-pin-sheet input,.hf-pin-confirm{display:block!important;width:150px!important;max-width:100%!important;box-sizing:border-box!important;margin-left:auto!important;margin-right:auto!important}
@media(max-width:600px){.hf-pin-sheet{width:240px!important;max-width:calc(100vw - 32px)!important;padding:13px!important}.hf-pin-sheet input,.hf-pin-confirm{width:145px!important;max-width:100%!important}}
`;
const install=()=>{if(document.getElementById('hf-pin-board-fix-style'))return;const s=document.createElement('style');s.id='hf-pin-board-fix-style';s.textContent=css;document.head.appendChild(s)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
