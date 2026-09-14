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
  if(window.supabase?.createClient){
    window.__hfSecuritySupabase=window.__hfSecuritySupabase||window.supabase.createClient(SB_URL,SB_KEY);
    return window.__hfSecuritySupabase;
  }
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
 .hf-security-pin-modal{position:fixed;inset:0;z-index:99999;overscroll-behavior:contain;display:none}.hf-security-pin-modal.open{display:block}
 .hf-security-pin-backdrop{position:absolute;inset:0;background:rgba(2,18,11,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
 .hf-security-pin-sheet{position:absolute;left:50%;top:auto;bottom:calc(50% + (var(--hf-keyboard-offset,0px)/2));transform:translateX(-50%);width:min(360px,calc(100vw - 32px));max-height:calc(100dvh - 28px);overflow:auto;background:#fff;border-radius:20px;padding:22px;box-shadow:0 25px 80px rgba(0,0,0,.3);text-align:center;color:#17221c;font-family:Inter,system-ui,sans-serif;box-sizing:border-box;transition:bottom .12s ease}
 .hf-security-pin-close{position:absolute;right:12px;top:10px;border:0;background:#f1f5f2;color:#526159;border-radius:50%;width:32px;height:32px;font-size:20px;cursor:pointer}.hf-security-pin-icon{font-size:28px}.hf-security-pin-sheet h3{margin:8px 0 5px;font-size:17px}.hf-security-pin-help{margin:0 0 15px;color:#728079;font-size:10px;line-height:1.4}
 .hf-security-pin-form{display:grid;gap:9px;text-align:left}.hf-security-pin-form label{display:grid;gap:5px;font-size:10px;font-weight:800}.hf-security-pin-form label span{font-size:8px;color:#87938d;font-weight:500}.hf-security-pin-form input{width:100%;height:48px;border:1px solid #dfe9e3;border-radius:12px;padding:0 12px;text-align:center;font-size:18px;letter-spacing:5px;outline:none;box-sizing:border-box}.hf-security-pin-form input:focus{border-color:#087443;box-shadow:0 0 0 3px rgba(8,116,67,.08)}
 .hf-security-pin-status{font-size:9px;line-height:1.4;text-align:left;display:none;padding:8px;border-radius:9px}.hf-security-pin-status.show{display:block}.hf-security-pin-status.error{background:#fff1ef;color:#9b3026}.hf-security-pin-status.success{background:#edf7f1;color:#0b6b45}
 .hf-security-pin-submit{width:100%;border:0;border-radius:11px;padding:12px;background:#087443;color:#fff;font-weight:900;cursor:pointer}.hf-security-pin-submit:disabled{opacity:.6;cursor:wait}
 @media(max-width:600px){#hfSecurityCenter{margin:18px 7px 14px;padding:13px;border-radius:15px}#hfSecurityCenter .hf-sc-row{gap:6px}#hfSecurityCenter button{padding:10px 8px;min-height:72px;border-radius:11px}.hf-sc-icon{font-size:19px}.hf-sc-title{font-size:10px}.hf-sc-sub{font-size:8px}}
 `;document.head.appendChild(s);
}
function pinModal(){
 let modal=$('hfSecurityPinModal');
 if(!modal){
  modal=document.createElement('div');modal.id='hfSecurityPinModal';modal.className='hf-security-pin-modal';
  modal.innerHTML='<div class="hf-security-pin-backdrop"></div><section class="hf-security-pin-sheet" role="dialog" aria-modal="true" aria-labelledby="hfSecurityPinTitle"><button class="hf-security-pin-close" type="button" aria-label="Close">×</button><div class="hf-security-pin-icon">🔐</div><h3 id="hfSecurityPinTitle">Confirm with Transaction PIN</h3><p class="hf-security-pin-help">Set or change the 6-digit transaction PIN used to authorize financial actions.</p><form class="hf-security-pin-form" autocomplete="off"><label>Current PIN <span>Leave blank only if you have never set a PIN</span><input id="hfSecurityCurrentPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" type="password" autocomplete="off" placeholder="Current PIN"></label><label>New PIN <span>Choose a new 6-digit PIN</span><input id="hfSecurityNewPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" type="password" autocomplete="new-password" placeholder="New PIN"></label><label>Confirm new PIN <span>Enter the new PIN again</span><input id="hfSecurityConfirmPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" type="password" autocomplete="new-password" placeholder="Confirm PIN"></label><div class="hf-security-pin-status" role="status" aria-live="polite"></div><button class="hf-security-pin-submit" type="submit">Confirm</button></form></section></div>';
  document.body.appendChild(modal);
  const close=()=>{modal.classList.remove('open');document.body.style.overflow='';};
  modal.querySelector('.hf-security-pin-close').onclick=close;modal.querySelector('.hf-security-pin-backdrop').onclick=close;
  ['hfSecurityCurrentPin','hfSecurityNewPin','hfSecurityConfirmPin'].forEach(id=>$(id)?.addEventListener('input',e=>{e.target.value=digits(e.target.value)}));
  modal.querySelector('form').onsubmit=async e=>{
   e.preventDefault();
   const cur=digits($('hfSecurityCurrentPin').value),next=digits($('hfSecurityNewPin').value),again=digits($('hfSecurityConfirmPin').value),status=modal.querySelector('.hf-security-pin-status'),btn=modal.querySelector('.hf-security-pin-submit');
   status.className='hf-security-pin-status';status.textContent='';
   if(!/^\d{6}$/.test(next)){status.textContent='New transaction PIN must be exactly 6 digits.';status.className='hf-security-pin-status show error';return}
   if(next!==again){status.textContent='The new PINs do not match.';status.className='hf-security-pin-status show error';return}
   if(cur&&!/^\d{6}$/.test(cur)){status.textContent='Current PIN must be exactly 6 digits.';status.className='hf-security-pin-status show error';return}
   btn.disabled=true;btn.textContent='Saving…';
   try{const {error}=await client().rpc('member_set_transaction_pin',{p_current_pin:cur||null,p_new_pin:next});if(error)throw error;status.textContent='Transaction PIN updated successfully.';status.className='hf-security-pin-status show success';$('hfSecurityCurrentPin').value='';$('hfSecurityNewPin').value='';$('hfSecurityConfirmPin').value='';setTimeout(close,900)}
   catch(err){status.textContent=err?.message||'Unable to update transaction PIN. Please try again.';status.className='hf-security-pin-status show error'}
   finally{btn.disabled=false;btn.textContent='Confirm'}
  };
  modal.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 }
 modal.classList.add('open');document.body.style.overflow='hidden';
 setTimeout(()=>{$('hfSecurityCurrentPin')?.focus()},60);
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
 const pin=$('hfScPin');if(pin&&!pin.dataset.hfBound){pin.dataset.hfBound='1';pin.addEventListener('click',pinModal,{capture:true});}
 const pw=$('hfScPassword');if(pw&&!pw.dataset.hfBound){pw.dataset.hfBound='1';pw.addEventListener('click',()=>{const b=$('hfPasswordBtn');if(b)b.click();else if(typeof window.openPasswordModal==='function')window.openPasswordModal()});}
 const forgot=$('hfScForgotPin');if(forgot&&!forgot.dataset.hfBound){forgot.dataset.hfBound='1';forgot.addEventListener('click',()=>{const n=$('hfSecurityNotice');n.textContent='A forgotten transaction PIN cannot be displayed. If you still know the current PIN, use Set / Change PIN. If you have forgotten it, contact an administrator for a secure reset.';n.classList.add('show')});}
}
function boot(){mount();setInterval(bind,800);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();