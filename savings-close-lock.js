(()=>{'use strict';
const lock=()=>{const modal=document.getElementById('hfSavingsModal');if(!modal||modal.dataset.closeLocked==='1')return;const backdrop=modal.querySelector('.hf-savings-backdrop');const close=modal.querySelector('.hf-savings-close');if(!backdrop||!close)return;modal.dataset.closeLocked='1';
 const block=e=>{e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();};
 ['click','mousedown','mouseup','pointerdown','pointerup','touchstart','touchend'].forEach(type=>backdrop.addEventListener(type,block,true));
 // Prevent any document-level Escape handler from closing this modal.
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('hfSavingsModal')===modal)block(e)},true);
};
new MutationObserver(lock).observe(document.documentElement,{childList:true,subtree:true});lock();
})();
