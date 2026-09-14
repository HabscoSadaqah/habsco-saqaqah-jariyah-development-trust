(()=>{
'use strict';
const onMember=()=>location.pathname.split('/').pop()==='member.html';
const load=(src,mark)=>{if(!onMember()||document.querySelector(`script[data-${mark}]`))return;const s=document.createElement('script');s.src=src;s.dataset[mark]='1';s.async=false;(document.body||document.head).appendChild(s)};
const open=()=>document.getElementById('hfSecuritySheet')?.classList.add('open');
const close=()=>document.getElementById('hfSecuritySheet')?.classList.remove('open');
function ensureSecurityCenter(){
 if(!onMember())return;
 if(document.getElementById('hfSecurityCenter'))return;
 load('member-security-center.js?v=20260914-4','hfMemberSecurityCenter');
 setTimeout(ensureSecurityCenter,300);
}
function loadExtras(){
 if(!onMember())return;
 load('savings-borrowing-ui.js?v=20260912-2','hfSavingsLoan');
 load('savings-button-fix.js?v=20260913-1','hfSavingsButtonFix');
 load('pin-position-final.js?v=20260913-1','hfPinFinal');
}
function mount(){
 if(!onMember())return;
 const panel=document.getElementById('hfSecurityCenter'),wrap=document.querySelector('.wrap'),top=document.querySelector('.top');
 if(!panel||!wrap||!top){setTimeout(mount,250);return}
 if(document.getElementById('hfSecuritySheet')){loadCredentials();return}
 const style=document.createElement('style');style.textContent=`
 #hfSecurityCenter{margin:0!important;box-shadow:none!important;border:0!important;padding:0!important;background:transparent!important}
 #hfSecurityTrigger{width:40px;height:40px;margin-left:auto;margin-right:6px;border:1px solid rgba(8,116,67,.16);background:#edf7f1;color:#087443;border-radius:12px;display:grid;place-items:center;font-size:19px;cursor:pointer;position:relative}
 #hfSecurityTrigger .security-dot{position:absolute;right:6px;top:6px;width:6px;height:6px;border-radius:50%;background:#087443;box-shadow:0 0 0 2px #edf7f1}
 .hf-security-sheet{position:fixed;inset:0;z-index:500;display:none}.hf-security-sheet.open{display:block}.hf-security-backdrop{position:absolute;inset:0;background:rgba(5,25,17,.48);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}
 .hf-security-panel{position:absolute;right:18px;top:72px;width:min(440px,calc(100vw - 28px));max-height:calc(100vh - 92px);overflow:auto;background:#fff;border:1px solid #e0ebe4;border-radius:22px;padding:18px;box-shadow:0 24px 70px rgba(0,0,0,.2)}
 .hf-security-panel .hf-security-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.hf-security-panel .hf-security-head h3{margin:0;font-size:16px}.hf-security-panel .hf-security-head p{margin:3px 0 0;color:#75827b;font-size:9.5px;line-height:1.4}.hf-security-close{width:34px;height:34px;border:0;background:#f2f6f3;border-radius:50%;font-size:20px;color:#526159;cursor:pointer}
 .hf-security-panel .hf-dashboard-security>h2,.hf-security-panel .hf-dashboard-security>p{display:none}
 @media(max-width:600px){#hfSecurityTrigger{width:38px;height:38px;margin-right:4px;border-radius:11px;font-size:18px}.hf-security-panel{left:10px;right:10px;top:auto;bottom:10px;width:auto;max-height:calc(100vh - 80px);border-radius:22px;padding:16px}}
 `;document.head.appendChild(style);
 const sheet=document.createElement('div');sheet.id='hfSecuritySheet';sheet.className='hf-security-sheet';sheet.innerHTML='<div class="hf-security-backdrop"></div><section class="hf-security-panel" role="dialog" aria-modal="true" aria-labelledby="hfSecuritySheetTitle"><div class="hf-security-head"><div><h3 id="hfSecuritySheetTitle">Security Center</h3><p>Manage your PIN, password and account protection.</p></div><button class="hf-security-close" type="button" aria-label="Close security center">×</button></div></section></div>';
 document.body.appendChild(sheet);
 const panelHost=sheet.querySelector('.hf-security-panel');panelHost.appendChild(panel);
 const trigger=document.createElement('button');trigger.id='hfSecurityTrigger';trigger.type='button';trigger.setAttribute('aria-label','Open Security Center');trigger.title='Security Center';trigger.innerHTML='<span aria-hidden="true">🛡️</span><span class="security-dot"></span>';
 const logout=document.getElementById('logout');top.insertBefore(trigger,logout||null);trigger.onclick=open;sheet.querySelector('.hf-security-backdrop').onclick=close;sheet.querySelector('.hf-security-close').onclick=close;
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 const securityLink=document.querySelector('#mobileAppNav a[href="#security"]');if(securityLink){securityLink.href='#';securityLink.onclick=e=>{e.preventDefault();open()}}
 loadCredentials();
}
function loadCredentials(){
 if(!onMember()||document.querySelector('script[data-hfCredentials]'))return;
 const s=document.createElement('script');s.src='security-credentials-ui.js?v=20260914-3';s.dataset.hfCredentials='3';s.async=false;document.body.appendChild(s);
}
function boot(){ensureSecurityCenter();loadExtras();mount()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();