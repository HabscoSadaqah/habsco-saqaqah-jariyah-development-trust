(()=>{
'use strict';
const apply=()=>{
 const root=document.getElementById('hfPinModal'),sheet=root?.querySelector('.hf-pin-modal');if(!root||!sheet)return;
 const vv=window.visualViewport,keyboard=Math.max(0,window.innerHeight-(vv?.height||window.innerHeight)-(vv?.offsetTop||0)),available=Math.max(240,(vv?.height||window.innerHeight)-24),lift=Math.min(keyboard/2,Math.max(0,(available-220)/4));
 const set=(el,p)=>el&&Object.entries(p).forEach(([k,v])=>el.style.setProperty(k,v,'important'));
 set(root,{position:'fixed',inset:'0',width:'100vw',height:'100vh',margin:'0',padding:'0',transform:'none',zIndex:'2147483000',display:'block',overflow:'hidden',background:'transparent'});
 set(root.querySelector('.hf-pin-backdrop'),{position:'fixed',inset:'0',width:'100vw',height:'100vh',zIndex:'0',display:'block',background:'rgba(7,29,20,.45)',backdropFilter:'blur(5px)',WebkitBackdropFilter:'blur(5px)'});
 set(sheet,{position:'fixed',left:'50%',top:`calc(50% - ${lift}px)`,right:'auto',bottom:'auto',transform:'translate(-50%,-50%)',margin:'0',boxSizing:'border-box',width:'min(430px,calc(100vw - 28px))',maxWidth:'calc(100vw - 28px)',maxHeight:`calc(${Math.floor(available)}px - 8px)`,overflow:'auto',zIndex:'1',opacity:'1',visibility:'visible'});
};
const run=()=>requestAnimationFrame(apply);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',run,{passive:true});window.addEventListener('orientationchange',run,{passive:true});window.addEventListener('scroll',run,{passive:true,capture:true});window.visualViewport?.addEventListener('resize',run,{passive:true});window.visualViewport?.addEventListener('scroll',run,{passive:true});
})();