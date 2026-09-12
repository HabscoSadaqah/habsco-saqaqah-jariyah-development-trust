(()=>{
'use strict';
const apply=()=>{
 const eyebrow=document.querySelector('#hfSavingsModal .hf-savings-eyebrow');
 if(eyebrow && eyebrow.textContent!=='HABSCO FINANCE') eyebrow.textContent='HABSCO FINANCE';
};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true}); else apply();
})();
