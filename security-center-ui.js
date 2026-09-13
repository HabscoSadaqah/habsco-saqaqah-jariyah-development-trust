(()=>{
  const open=()=>document.getElementById('hfSecuritySheet')?.classList.add('open');
  const close=()=>document.getElementById('hfSecuritySheet')?.classList.remove('open');
  function loadSavingsLoanExperience(){
    if(location.pathname.split('/').pop()!=='member.html')return;
    if(document.querySelector('script[data-hf-savings-loan]'))return;
    const s=document.createElement('script');
    s.src='savings-borrowing-ui.js?v=20260912-2';
    s.dataset.hfSavingsLoan='1';
    s.onload=()=>{};
    (document.body||document.head).appendChild(s);
  }
  loadSavingsLoanExperience();
  function mount(){
    const panel=document.getElementById('hfSecurityCenter');
    const wrap=document.querySelector('.wrap');
    const top=document.querySelector('.top');
    if(!panel||!wrap||!top){return;}
    if(document.getElementById('hfSecurityTrigger')){return}
    const style=document.createElement('style');
    style.textContent=`#hfSecurityCenter{margin:0!important;box-shadow:none!important;border:0!important;padding:0!important;background:transparent!important}#hfSecurityTrigger{width:40px;height:40px;margin-left:auto;margin-right:6px;border:1px solid rgba(8,116,67,.16);background:#edf7f1;color:#087443;border-radius:12px;display:grid;place-items:center;font-size:19px;cursor:pointer;transition:.18s;position:relative}#hfSecurityTrigger:hover{transform:translateY(-1px);box-shadow:0 7px 18px rgba(24,60,42,.1)}#hfSecurityTrigger:active{transform:scale(.96)}#hfSecurityTrigger .security-dot{position:absolute;right:6px;top:6px;width:6px;height:6px;border-radius:50%;background:#087443;box-shadow:0 0 0 2px #edf7f1}.hf-security-sheet{position:fixed;inset:0;z-index:500;display:none}.hf-security-sheet.open{display:block}.hf-security-backdrop{position:absolute;inset:0;background:rgba(5,25,17,.48);backdrop-filter:blur(5px)}.hf-security-panel{position:absolute;right:18px;top:72px;width:min(440px,calc(100vw - 28px));max-height:calc(100vh - 92px);overflow:auto;background:#fff;border:1px solid #e0ebe4;border-radius:22px;padding:18px;box-shadow:0 24px 70px rgba(0,0,0,.2);animation:hfSecIn .18s ease}.hf-security-panel .hf-security-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.hf-security-panel .hf-security-head h3{margin:0;font-size:16px}.hf-security-panel .hf-security-head p{margin:3px 0 0;color:#75827b;font-size:9.5px;line-height:1.4}.hf-security-close{width:34px;height:34px;border:0;background:#f2f6f3;border-radius:50%;font-size:20px;color:#526159;cursor:pointer}.hf-security-panel .hf-dashboard-security>h2,.hf-security-panel .hf-dashboard-security>p{display:none}.hf-security-panel .hf-security-row{margin-top:0}.hf-security-panel .hf-security-row button{background:#f7faf8}.hf-security-panel .hf-security-msg{margin-top:10px}@keyframes hfSecIn{from{opacity:0;transform:translateY(-7px) scale(.985)}to{opacity:1;transform:none}}@media(max-width:600px){#hfSecurityTrigger{width:38px;height:38px;margin-right:4px;border-radius:11px;font-size:18px}.hf-security-panel{left:10px;right:10px;top:auto;bottom:10px;width:auto;max-height:calc(100vh - 80px);border-radius:22px;padding:16px;animation:hfSecUp .2s ease}.hf-security-panel .hf-security-row{grid-template-columns:1fr}.hf-security-panel .hf-security-row button{min-height:64px}@keyframes hfSecUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}}`;
    document.head.appendChild(style);
    const sheet=document.createElement('div');sheet.id='hfSecuritySheet';sheet.className='hf-security-sheet';sheet.innerHTML='<div class="hf-security-backdrop"></div><section class="hf-security-panel" role="dialog" aria-modal="true" aria-labelledby="hfSecuritySheetTitle"><div class="hf-security-head"><div><h3 id="hfSecuritySheetTitle">Security Center</h3><p>Manage your PIN, password and account protection.</p></div><button class="hf-security-close" type="button" aria-label="Close security center">×</button></div></section>';
    document.body.appendChild(sheet);
    const panelHost=sheet.querySelector('.hf-security-panel');
    panelHost.appendChild(panel);
    const trigger=document.createElement('button');trigger.id='hfSecurityTrigger';trigger.type='button';trigger.setAttribute('aria-label','Open Security Center');trigger.title='Security Center';trigger.innerHTML='<span aria-hidden="true">🛡️</span><span class="security-dot"></span>';
    const logout=document.getElementById('logout');
    top.insertBefore(trigger,logout||null);
    trigger.onclick=open;
    sheet.querySelector('.hf-security-backdrop').onclick=close;
    sheet.querySelector('.hf-security-close').onclick=close;
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    const securityLink=document.querySelector('#mobileAppNav a[href="#security"]');
    if(securityLink){securityLink.href='#';securityLink.onclick=e=>{e.preventDefault();open()}}
    const s=document.createElement('script');s.src='security-credentials-ui.js?v=20260911-2';s.dataset.hfCredentials='2';document.body.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

/* Savings PIN modal containment fix: keep the PIN prompt inside the Savings sheet. */
(()=>{
  'use strict';
  const PIN_STYLE_ID='hf-savings-pin-containment-fix';
  const css=`
    #hfSavingsModal .hf-savings-sheet{position:relative!important}
    #hfSavingsModal .hf-pin-modal{
      position:absolute!important;inset:0!important;width:100%!important;height:100%!important;
      z-index:9999!important;display:block!important;padding:0!important;margin:0!important;
      background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;filter:none!important;
      pointer-events:none!important;overflow:hidden!important;
    }
    #hfSavingsModal .hf-pin-modal .hf-pin-backdrop{
      position:absolute!important;inset:0!important;width:100%!important;height:100%!important;
      background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;filter:none!important;
      pointer-events:none!important;
    }
    #hfSavingsModal .hf-pin-modal .hf-pin-sheet{
      position:absolute!important;left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;
      transform:translate(-50%,-50%)!important;width:min(280px,calc(100% - 32px))!important;
      max-width:calc(100% - 32px)!important;max-height:calc(100% - 32px)!important;
      box-sizing:border-box!important;overflow:auto!important;margin:0!important;padding:16px!important;
      border-radius:16px!important;background:#fff!important;border:1px solid #dce9e2!important;
      box-shadow:0 14px 36px rgba(0,0,0,.18),0 4px 14px rgba(8,116,67,.08)!important;
      z-index:10000!important;pointer-events:auto!important;opacity:1!important;visibility:visible!important;
    }
    #hfSavingsModal .hf-pin-modal .hf-pin-sheet input{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important}
    #hfSavingsModal .hf-pin-modal .hf-pin-sheet .hf-pin-confirm{width:100%!important}
    @media(max-width:520px){
      #hfSavingsModal .hf-pin-modal .hf-pin-sheet{width:250px!important;max-width:calc(100% - 28px)!important;padding:15px!important;border-radius:15px!important}
    }
  `;
  const apply=()=>{
    const modal=document.getElementById('hfSavingsModal');
    if(!modal)return;
    const savings=modal.querySelector('.hf-savings-sheet');
    const pin=document.querySelector('.hf-pin-modal');
    if(!savings||!pin)return;
    if(pin.parentElement!==savings)savings.appendChild(pin);
    savings.style.setProperty('position','relative','important');
    const backdrop=pin.querySelector('.hf-pin-backdrop');
    const ps=pin.querySelector('.hf-pin-sheet');
    const important=(el,props)=>{if(!el)return;Object.entries(props).forEach(([k,v])=>el.style.setProperty(k,v,'important'))};
    important(pin,{position:'absolute',inset:'0',width:'100%',height:'100%',background:'transparent',boxShadow:'none',backdropFilter:'none',filter:'none',pointerEvents:'none',overflow:'hidden',zIndex:'9999',display:'block'});
    important(backdrop,{position:'absolute',inset:'0',width:'100%',height:'100%',background:'transparent',boxShadow:'none',backdropFilter:'none',filter:'none',pointerEvents:'none'});
    important(ps,{position:'absolute',left:'50%',top:'50%',right:'auto',bottom:'auto',transform:'translate(-50%,-50%)',margin:'0',width:'280px',maxWidth:'calc(100% - 32px)',maxHeight:'calc(100% - 32px)',boxSizing:'border-box',overflow:'auto',background:'#fff',border:'1px solid #dce9e2',borderRadius:'16px',boxShadow:'0 14px 36px rgba(0,0,0,.18),0 4px 14px rgba(8,116,67,.08)',pointerEvents:'auto',zIndex:'10000',opacity:'1',visibility:'visible'});
    requestAnimationFrame(()=>{const input=pin.querySelector('#hfPinInput');if(input)input.scrollIntoView({block:'center',inline:'nearest'})});
  };
  const install=()=>{
    if(!document.getElementById(PIN_STYLE_ID)){
      const s=document.createElement('style');s.id=PIN_STYLE_ID;s.textContent=css;document.head.appendChild(s);
    }
    apply();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true});
})();