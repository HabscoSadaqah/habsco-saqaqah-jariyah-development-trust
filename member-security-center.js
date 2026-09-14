(function(){
'use strict';
if(!location.pathname.endsWith('member.html'))return;
const SB_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const SB_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const $=id=>document.getElementById(id);
const digits=v=>String(v||'').replace(/\D/g,'').slice(0,6);
function client(){
 if(window.supabaseClient?.rpc)return window.supabaseClient;
 if(window.sb?.rpc)return window.sb;
 if(window.supabase?.createClient){window.__hfSecuritySupabase=window.__hfSecuritySupabase||window.supabase.createClient(SB_URL,SB_KEY);return window.__hfSecuritySupabase}
 throw new Error('Secure connection is not ready. Please reload the page and try again.');
}
function addStyles(){
 if(document.getElementById('hf-security-pin-style'))return;
 const s=document.createElement('style');s.id='hf-security-pin-style';
 s.textContent=`
 #hfSecurityCenter{margin:24px 7px 16px;background:linear-gradient(145deg,#062f20,#0b5d37);color:#fff;border-radius:18px;padding:16px;box-shadow:0 10px 28px rgba(6,47,32,.15)}
 #hfSecurityCenter .hf-sc-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
 #hfSecurityCenter h2{margin:0;color:#f2d47b;font-size:17px}#hfSecurityCenter p{margin:4px 0 0;color:#d8ebe0;font-size:11px;line-height:1.45}
 #hfSecurityCenter .hf-sc-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
 #hfSecurityCenter button{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.09);color:#fff;border-radius:13px;padding:13px 10px;text-align:left;cursor:pointer;min-height:74px;font-weight:800}
 #hfSecurityCenter button:hover{background:rgba(255,255,255,.15)}.hf-sc-icon{font-size:22px;display:block;margin-bottom:5px}.hf-sc-title{font-size:11px;display:block}.hf-sc-sub{font-size:9px;color:#c5ddd0;font-weight:500;display:block;margin-top:2px}
 #hfSecurityNotice{display:none;margin-top:10px;background:#fff7df;color:#6b5207;border-radius:10px;padding:10px;font-size:11px;line-height:1.45}#hfSecurityNotice.show{display:block}
 /* Security PIN is deliberately isolated from the Savings PIN helpers so it can never sit in another stacking context. */
 #hfSecurityPinModal{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;z-index:2147483647!important;display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;isolation:isolate!important;overscroll-behavior:contain!important}
 #hfSecurityPinModal.open{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
 #hfSecurityPinModal .hf-pin-backdrop{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;background:rgba(2,18,11,.62)!important;backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important;z-index:1!important}
 #hfSecurityPinModal .hf-pin-sheet{position:absolute!important;left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:min(360px,calc(100vw - 32px))!important;max-height:calc(100dvh - 28px)!important;overflow:auto!important;background:#fff!important;border-radius:20px!important;padding:22px!important;box-shadow:0 25px 80px rgba(0,0,0,.3)!important;text-align:center!important;color:#17221c!important;font-family:Inter,system-ui,sans-serif!important;box-sizing:border-box!important;z-index:2!important}
 #hfSecurityPinModal .hf-pin-close{position:absolute!important;right:12px!important;top:10px!important;border:0!important;background:#f1f5f2!important;color:#526159!important;border-radius:50%!important;width:32px!important;height:32px!important;font-size:20px!important;cursor:pointer!important}
 #hfSecurityPinModal .hf-pin-icon{font-size:28px!important}.hf-pin-sheet h3{margin:8px 0 5px;font-size:17px}.hf-pin-help{margin:0 0 15px;color:#728079;font-size:10px;line-height:1.4}
 #hfSecurityPinModal .hf-pin-form{display:grid;gap:9px;text-align:left}.hf-pin-form label{display:grid;gap:5px;font-size:10px;font-weight:800}.hf-pin-form label span{font-size:8px;color:#87938d;font-weight:500}.hf-pin-form input{width:100%;height:48px;border:1px solid #dfe9e3;border-radius:12px;padding:0 12px;text-align:center;font-size:18px;letter-spacing:5px;outline:none;box-sizing:border-box}.hf-pin-form input:focus{border-color:#087443;box-shadow:0 0 0 3px rgba(8,116,67,.08)}
 .hf-pin-error{min-height:14px;font-size:9px;line-height:1.4;color:#9b3026;text-align:left}.hf-pin-error.success{background:#edf7f1;color:#0b6b45;padding:8px;border-radius:9px}.hf-pin-confirm{width:100%;border:0;border-radius:11px;padding:12px;background:#087443;color:#fff;font-weight:900;cursor:pointer}.hf-pin-confirm:disabled{opacity:.6;cursor:wait}
 @media(max-width:600px){#hfSecurityCenter{margin:18px 7px 14px;padding:13px;border-radius:15px}#hfSecurityCenter .hf-sc-row{gap:6px}#hfSecurityCenter button{padding:10px 8px;min-height:72px;border-radius:11px}.hf-sc-icon{font-size:19px}.hf-sc-title{font-size:10px}.hf-sc-sub{font-size:8px}#hfSecurityPinModal .hf-pin-sheet{width:min(360px,calc(100vw - 24px))!important;padding:18px!important}}
 `;document.head.appendChild(s);
}
function pinModal(){
 let modal=$('hfSecurityPinModal');
 if(!modal){
  modal=document.createElement('div');modal.id='hfSecurityPinModal';modal.className='hf-security-pin-modal';
  modal.innerHTML='<div class="hf-pin-backdrop"></div><section class="hf-pin-sheet" role="dialog" aria-modal="true" aria-labelledby="hfSecurityPinTitle"><button class="hf-pin-close" type="button" aria-label="Close">×</button><div class="hf-pin-icon">🔐</div><h3 id="hfSecurityPinTitle">Set transaction PIN</h3><p class="hf-pin-help">Set your 6-digit transaction PIN. This PIN protects transfers and cooperative money movements.</p><form class="hf-pin-form" autocomplete="off"><label>Current PIN <span>Leave blank only if you have never set a PIN</span><input id="hfSecurityCurrentPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" type="password" autocomplete="off" placeholder="Current PIN"></label><label>New PIN <span>Choose a new 6-digit PIN</span><input id="hfSecurityNewPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" type="password" autocomplete="new-password" placeholder="New PIN"></label><label>Confirm new PIN <span>Enter the new PIN again</span><input id="hfSecurityConfirmPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" type="password" autocomplete="new-password" placeholder="Confirm PIN"></label><div class="hf-pin-error" role="status" aria-live="polite"></div><button class="hf-pin-confirm" type="submit">Confirm</button></form></section></div>';
  document.documentElement.appendChild(modal);
  const close=()=>{modal.classList.remove('open');document.body.style.overflow='';document.documentElement.style.overflow='';};
  modal.querySelector('.hf-pin-close').onclick=close;modal.querySelector('.hf-pin-backdrop').onclick=close;
  ['hfSecurityCurrentPin','hfSecurityNewPin','hfSecurityConfirmPin'].forEach(id=>$(id)?.addEventListener('input',e=>{e.target.value=digits(e.target.value)}));
  modal.querySelector('form').onsubmit=async e=>{
   e.preventDefault();
   const cur=digits($('hfSecurityCurrentPin').value),next=digits($('hfSecurityNewPin').value),again=digits($('hfSecurityConfirmPin').value),status=modal.querySelector('.hf-pin-error'),btn=modal.querySelector('.hf-pin-confirm');
   status.className='hf-pin-error';status.textContent='';
   if(!/^\d{6}$/.test(next)){status.textContent='New transaction PIN must be exactly 6 digits.';return}
   if(next!==again){status.textContent='The new PINs do not match.';return}
   if(cur&&!/^\d{6}$/.test(cur)){status.textContent='Current PIN must be exactly 6 digits.';return}
   btn.disabled=true;btn.textContent='Saving…';
   try{const {error}=await client().rpc('member_set_transaction_pin',{p_current_pin:cur||null,p_new_pin:next});if(error)throw error;status.textContent='Transaction PIN updated successfully.';status.className='hf-pin-error success';$('hfSecurityCurrentPin').value='';$('hfSecurityNewPin').value='';$('hfSecurityConfirmPin').value='';setTimeout(close,900)}catch(err){status.textContent=err?.message||'Unable to update transaction PIN. Please try again.'}finally{btn.disabled=false;btn.textContent='Confirm'}
  };
 }
 document.documentElement.appendChild(modal);
 modal.classList.add('open');
 document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';
 setTimeout(()=>modal.querySelector('#hfSecurityCurrentPin')?.focus(),60);
}
function mount(){
 addStyles();
 if($('hfSecurityCenter')){bind();return}
 const wrap=document.querySelector('.wrap');if(!wrap)return setTimeout(mount,300);
 const box=document.createElement('section');box.id='hfSecurityCenter';
 box.innerHTML='<div class="hf-sc-head"><div><h2>⚙️ Security Center</h2><p>Manage the PIN and password you use to protect your Habsco Finance account.</p></div><span style="font-size:10px;background:rgba(255,255,255,.12);padding:5px 8px;border-radius:99px;font-weight:800">ACCOUNT SECURITY</span></div><div class="hf-sc-row"><button type="button" id="hfScPin"><span class="hf-sc-icon">🔢</span><span class="hf-sc-title">Set / Change PIN</span><span class="hf-sc-sub">Update your 6-digit transaction PIN</span></button><button type="button" id="hfScPassword"><span class="hf-sc-icon">🔑</span><span class="hf-sc-title">Change / Forgot Password</span><span class="hf-sc-sub">Reset the password used to enter your account</span></button><button type="button" id="hfScForgotPin"><span class="hf-sc-icon">🛡️</span><span class="hf-sc-title">Forgot PIN?</span><span class="hf-sc-sub">Start the secure PIN recovery process</span></button></div><div id="hfSecurityNotice"></div>';
 const statements=[...wrap.querySelectorAll('.section-title')].find(x=>x.querySelector('h2')?.textContent.trim()==='Statements');if(statements)wrap.insertBefore(box,statements);else wrap.appendChild(box);bind();
}
function bind(){
 const pin=$('hfScPin');if(pin&&!pin.dataset.hfBound){pin.dataset.hfBound='1';pin.onclick=pinModal;}
 const pw=$('hfScPassword');if(pw&&!pw.dataset.hfBound){pw.dataset.hfBound='1';pw.onclick=()=>{const b=$('hfPasswordBtn');if(b)b.click();else if(typeof window.openPasswordModal==='function')window.openPasswordModal()};}
 const forgot=$('hfScForgotPin');if(forgot&&!forgot.dataset.hfBound){forgot.dataset.hfBound='1';forgot.onclick=()=>{const n=$('hfSecurityNotice');n.textContent='A forgotten transaction PIN cannot be displayed. If you still know the current PIN, use Set / Change PIN. If you have forgotten it, contact an administrator for a secure reset.';n.classList.add('show')}}
}
function boot(){mount();setInterval(bind,800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();