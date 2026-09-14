(()=>{
'use strict';
const apply=()=>{
 const root=document.getElementById('hfPinModal'),sheet=root?.querySelector('.hf-pin-modal');if(!root||!sheet)return;
 const vv=window.visualViewport,keyboard=Math.max(0,window.innerHeight-(vv?.height||window.innerHeight)-(vv?.offsetTop||0)),available=Math.max(240,(vv?.height||window.innerHeight)-28),lift=Math.min(keyboard/2,Math.max(0,(available-220)/4));
 const set=(el,p)=>el&&Object.entries(p).forEach(([k,v])=>el.style.setProperty(k,v,'important'));
 set(root,{position:'fixed',inset:'0',width:'100vw',height:'100vh',margin:'0',padding:'0',transform:'none',zIndex:'2147483000',display:'block',overflow:'hidden',background:'transparent'});
 set(root.querySelector('.hf-pin-backdrop'),{position:'fixed',inset:'0',width:'100vw',height:'100vh',zIndex:'0',display:'block',background:'rgba(2,18,11,.62)',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)'});
 set(sheet,{position:'fixed',left:'50%',top:`calc(50% - ${lift}px)`,right:'auto',bottom:'auto',transform:'translate(-50%,-50%)',margin:'0',boxSizing:'border-box',width:'min(360px,calc(100vw - 32px))',maxWidth:'calc(100vw - 32px)',maxHeight:`calc(${Math.floor(available)}px - 8px)`,overflow:'auto',zIndex:'1',opacity:'1',visibility:'visible',background:'#fff',borderRadius:'20px',padding:'22px',boxShadow:'0 25px 80px rgba(0,0,0,.30)',textAlign:'center'});
 set(sheet.querySelector('.hf-pin-close'),{position:'absolute',right:'12px',top:'10px',width:'32px',height:'32px',border:'0',background:'#f1f5f2',borderRadius:'50%',fontSize:'20px',cursor:'pointer'});
 set(sheet.querySelector('.hf-pin-icon'),{fontSize:'28px'});
 set(sheet.querySelector('h3'),{margin:'8px 0 5px',fontSize:'17px'});
 set(sheet.querySelector('.hf-pin-help'),{margin:'0 0 15px',color:'#728079',fontSize:'10px',lineHeight:'1.4'});
 set(sheet.querySelector('form'),{display:'grid',gap:'9px'});
 sheet.querySelectorAll('label').forEach(label=>set(label,{display:'grid',gap:'5px',textAlign:'left',fontSize:'10px',fontWeight:'800'}));
 sheet.querySelectorAll('label span').forEach(span=>set(span,{fontSize:'8px',color:'#87938d',fontWeight:'500'}));
 sheet.querySelectorAll('input').forEach(input=>set(input,{width:'100%',height:'48px',border:'1px solid #dfe9e3',borderRadius:'12px',padding:'0 12px',textAlign:'center',fontSize:'18px',letterSpacing:'5px',outline:'none',boxSizing:'border-box'}));
 set(sheet.querySelector('.hf-pin-strength'),{fontSize:'9px',color:'#718078',background:'#f7faf8',borderRadius:'9px',padding:'8px',textAlign:'left'});
 set(sheet.querySelector('.hf-pin-submit'),{width:'100%',border:'0',borderRadius:'11px',padding:'12px',height:'auto',background:'#087443',color:'#fff',fontWeight:'900',cursor:'pointer'});
 set(sheet.querySelector('.hf-pin-status'),{fontSize:'9px',lineHeight:'1.4',textAlign:'left'});
};
const run=()=>requestAnimationFrame(apply);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',run,{passive:true});window.addEventListener('orientationchange',run,{passive:true});window.addEventListener('scroll',run,{passive:true,capture:true});window.visualViewport?.addEventListener('resize',run,{passive:true});window.visualViewport?.addEventListener('scroll',run,{passive:true});
})();