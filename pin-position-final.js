(()=>{
  'use strict';
  const STYLE='hf-pin-position-final-style';
  const apply=()=>{
    const modal=document.getElementById('hfSavingsModal');
    const savings=modal?.querySelector('.hf-savings-sheet');
    const pin=document.querySelector('.hf-pin-modal');
    const ps=pin?.querySelector('.hf-pin-sheet');
    if(!modal||!savings||!pin||!ps)return;
    if(pin.parentElement!==document.body)document.body.appendChild(pin);
    const r=savings.getBoundingClientRect();
    if(r.width<2||r.height<2)return;
    pin.classList.add('hf-pin-final');
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    const maxW=Math.max(180,r.width-32),maxH=Math.max(140,r.height-32);
    const w=Math.min(360,maxW),h=Math.min(560,maxH);
    const set=(el,p)=>Object.entries(p).forEach(([k,v])=>el.style.setProperty(k,v,'important'));
    set(pin,{position:'fixed',left:'0',top:'0',right:'0',bottom:'0',width:'100vw',height:'100vh',inset:'0',zIndex:'2147483000',display:'block',background:'transparent',pointerEvents:'none',margin:'0',padding:'0',overflow:'hidden',transform:'none'});
    set(pin.querySelector('.hf-pin-backdrop'),{position:'fixed',left:r.left+'px',top:r.top+'px',right:'auto',bottom:'auto',width:r.width+'px',height:r.height+'px',inset:'auto',zIndex:'0',background:'rgba(2,18,11,.48)',backdropFilter:'blur(5px)',pointerEvents:'auto',borderRadius:'22px'});
    set(ps,{position:'fixed',left:cx+'px',top:cy+'px',right:'auto',bottom:'auto',width:w+'px',height:h+'px',maxWidth:maxW+'px',maxHeight:maxH+'px',transform:'translate(-50%,-50%)',margin:'0',boxSizing:'border-box',overflow:'auto',zIndex:'1',pointerEvents:'auto',opacity:'1',visibility:'visible'});
  };
  const install=()=>{
    if(!document.getElementById(STYLE)){
      const s=document.createElement('style');s.id=STYLE;s.textContent='.hf-pin-modal.hf-pin-final{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;transform:none!important;overflow:hidden!important;z-index:2147483000!important;background:transparent!important;pointer-events:none!important}.hf-pin-modal.hf-pin-final .hf-pin-sheet{box-sizing:border-box!important}';document.head.appendChild(s);
    }
    apply();
  };
  const refresh=()=>requestAnimationFrame(apply);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',refresh,{passive:true});
  window.addEventListener('scroll',refresh,{passive:true,capture:true});
  window.visualViewport?.addEventListener('resize',refresh,{passive:true});
  window.visualViewport?.addEventListener('scroll',refresh,{passive:true});
})();
