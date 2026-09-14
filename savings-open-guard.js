(()=>{'use strict';
let userOpened=false;
const markUserIntent=e=>{const a=e.target?.closest?.('a[href="savings.html"],a[href*="type=savings"],#savingsBalance');if(a&&e.isTrusted)userOpened=true};
document.addEventListener('pointerdown',markUserIntent,true);
document.addEventListener('click',markUserIntent,true);
const guard=()=>{const modal=document.getElementById('hfSavingsModal');if(modal&&!userOpened){modal.remove();return}if(!modal)userOpened=false};
new MutationObserver(guard).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',guard,{once:true});else guard();
})();
