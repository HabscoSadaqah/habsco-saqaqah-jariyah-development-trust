(()=>{
'use strict';
const set=(el,p)=>el&&Object.entries(p).forEach(([k,v])=>el.style.setProperty(k,v,'important'));
const apply=()=>{
 const root=document.getElementById('hfPinModal');
 const sheet=root?.querySelector('.hf-pin-modal');
 if(!root||!sheet)return;
 // Security Center previously used the PIN dialog itself as .hf-pin-modal.
 // Savings Cycle uses .hf-pin-modal as the full-screen layer and .hf-pin-sheet as the actual box.
 // Convert the existing Security Center markup to that same structure at runtime.
 sheet.classList.remove('hf-pin-modal');
 sheet.classList.add('hf-pin-sheet');
 const vv=window.visualViewport;
 const keyboard=Math.max(0,window.innerHeight-(vv?.height||window.innerHeight)-(vv?.offsetTop||0));
 const setPosition=()=>{
   const offset=Math.max(0,keyboardFromViewport());
   set(root,{position:'fixed',inset:'0',width:'100vw',height:'100vh',margin:'0',padding:'0',transform:'none',zIndex:'1200',overscrollBehavior:'contain',background:'transparent',pointerEvents:'auto'});
   set(root.querySelector('.hf-pin-backdrop'),{position:'absolute',inset:'0',zIndex:'0',background:'rgba(2,18,11,.62)',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)'});
   set(sheet,{position:'absolute',left:'50%',top:'auto',bottom:`calc(50% + (${offset}px / 2))`,transform:'translateX(-50%)',width:'min(360px,calc(100vw - 32px))',maxWidth:'calc(100vw - 32px)',maxHeight:'calc(100dvh - 28px)',overflow:'auto',boxSizing:'border-box',background:'#fff',borderRadius:'20px',padding:'22px',boxShadow:'0 25px 80px rgba(0,0,0,.3)',textAlign:'center',fontFamily:'Inter,system-ui,sans-serif',zIndex:'1',opacity:'1',visibility:'visible',transition:'bottom .12s ease'});
   set(sheet.querySelector('.hf-pin-close'),{position:'absolute',right:'12px',top:'10px',border:'0',background:'#f1f5f2',borderRadius:'50%',width:'32px',height:'32px',fontSize:'20px'});
   set(sheet.querySelector('.hf-pin-icon'),{fontSize:'28px'});
   set(sheet.querySelector('h3'),{margin:'8px 0 5px',fontSize:'17px'});
   set(sheet.querySelector('.hf-pin-help'),{margin:'0 0 15px',color:'#728079',fontSize:'10px',lineHeight:'1.4'});
   sheet.querySelectorAll('label').forEach(l=>set(l,{display:'grid',gap:'5px',textAlign:'left',fontSize:'10px',fontWeight:'800'}));
   sheet.querySelectorAll('label span').forEach(s=>set(s,{fontSize:'8px',color:'#87938d',fontWeight:'500'}));
   sheet.querySelectorAll('input').forEach(i=>set(i,{width:'100%',height:'48px',border:'1px solid #dfe9e3',borderRadius:'12px',padding:'0 12px',textAlign:'center',fontSize:'18px',letterSpacing:'5px',outline:'none',boxSizing:'border-box'}));
   set(sheet.querySelector('form'),{display:'grid',gap:'9px'});
   set(sheet.querySelector('.hf-pin-strength'),{fontSize:'9px',color:'#718078',background:'#f7faf8',borderRadius:'9px',padding:'8px',textAlign:'left'});
   set(sheet.querySelector('.hf-pin-submit'),{width:'100%',border:'0',borderRadius:'11px',padding:'12px',height:'auto',background:'#087443',color:'#fff',fontWeight:'900',cursor:'pointer'});
   set(sheet.querySelector('.hf-pin-status'),{fontSize:'9px',lineHeight:'1.4',textAlign:'left'});
 };
 const keyboardFromViewport=()=>Math.max(0,window.innerHeight-(vv?.height||window.innerHeight)-(vv?.offsetTop||0));
 setPosition();
};
const run=()=>requestAnimationFrame(apply);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
window.addEventListener('resize',run,{passive:true});
window.addEventListener('orientationchange',run,{passive:true});
window.addEventListener('scroll',run,{passive:true,capture:true});
window.visualViewport?.addEventListener('resize',run,{passive:true});
window.visualViewport?.addEventListener('scroll',run,{passive:true});
})();