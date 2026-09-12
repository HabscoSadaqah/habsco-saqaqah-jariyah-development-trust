(()=>{
'use strict';
const clean=()=>{
 const hero=document.querySelector('.hero');
 if(!hero)return false;
 hero.querySelector('small')?.remove();
 hero.querySelector('#memberMeta')?.remove();
 const heading=hero.querySelector('#welcome');
 if(heading&&!heading.textContent.trim())heading.textContent='Finance Dashboard';
 hero.style.paddingBottom='20px';
 return true;
};
if(!clean()){
 const observer=new MutationObserver(()=>{if(clean())observer.disconnect()});
 observer.observe(document.documentElement,{childList:true,subtree:true});
 setTimeout(()=>observer.disconnect(),10000);
}
})();
