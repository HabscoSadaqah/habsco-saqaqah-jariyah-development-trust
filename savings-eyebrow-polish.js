(()=>{
'use strict';
const apply=()=>{
 const eyebrow=document.querySelector('#hfSavingsModal .hf-savings-eyebrow');
 if(eyebrow) eyebrow.textContent='HABSCO FINANCE';
};
new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
apply();
setTimeout(apply,300);
setTimeout(apply,1000);
})();
