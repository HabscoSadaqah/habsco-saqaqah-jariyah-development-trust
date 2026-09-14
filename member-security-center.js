(function(){
  if(!window.supabase||!location.pathname.endsWith('member.html'))return;
  const SB_URL='https://ythnoeyxovapydbmymdo.supabase.co';
  const SB_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
  const $=id=>document.getElementById(id);
  function mount(){
    if($('hfSecurityCenter'))return;
    const wrap=document.querySelector('.wrap');
    if(!wrap)return setTimeout(mount,400);
    const style=document.createElement('style');
    style.textContent=`
      #hfSecurityCenter{margin:24px 7px 16px;background:linear-gradient(145deg,#062f20,#0b5d37);color:#fff;border-radius:18px;padding:16px;box-shadow:0 10px 28px rgba(6,47,32,.15)}
      #hfSecurityCenter .hf-sc-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
      #hfSecurityCenter h2{margin:0;color:#f2d47b;font-size:17px}
      #hfSecurityCenter p{margin:4px 0 0;color:#d8ebe0;font-size:11px;line-height:1.45}
      #hfSecurityCenter .hf-sc-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
      #hfSecurityCenter button{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.09);color:#fff;border-radius:13px;padding:13px 10px;text-align:left;cursor:pointer;min-height:74px;font-weight:800}
      #hfSecurityCenter button:hover{background:rgba(255,255,255,.15)}
      #hfSecurityCenter .hf-sc-icon{font-size:22px;display:block;margin-bottom:5px}
      #hfSecurityCenter .hf-sc-title{font-size:11px;display:block}
      #hfSecurityCenter .hf-sc-sub{font-size:9px;color:#c5ddd0;font-weight:500;display:block;margin-top:2px}
      #hfSecurityNotice{display:none;margin-top:10px;background:#fff7df;color:#6b5207;border-radius:10px;padding:10px;font-size:11px;line-height:1.45}
      #hfSecurityNotice.show{display:block}
      .hf-pin-setup-modal{position:fixed;inset:0;z-index:1200;display:none}
      .hf-pin-setup-modal.open{display:block}
      .hf-pin-setup-modal .hf-pin-backdrop{position:absolute;inset:0;background:rgba(2,18,11,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
      .hf-pin-setup-sheet{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(360px,calc(100vw - 32px));max-height:calc(100dvh - 28px);overflow:auto;background:#fff;border-radius:20px;padding:22px;box-shadow:0 25px 80px rgba(0,0,0,.3);text-align:center;color:#17221c;font-family:Inter,system-ui,sans-serif;box-sizing:border-box}
      .hf-pin-setup-close{position:absolute;right:12px;top:10px;border:0;background:#f1f5f2;border-radius:50%;width:32px;height:32px;font-size:20px;color:#526159;cursor:pointer}
      .hf-pin-setup-icon{font-size:28px}.hf-pin-setup-sheet h3{margin:8px 0 5px;font-size:17px}.hf-pin-setup-help{margin:0 0 15px;color:#728079;font-size:10px;line-height:1.4}
      .hf-pin-setup-form{display:grid;gap:9px;text-align:left}.hf-pin-setup-form label{display:grid;gap:5px;font-size:10px;font-weight:800}.hf-pin-setup-form label span{font-size:8px;color:#87938d;font-weight:500}.hf-pin-setup-form input{width:100%;height:48px;border:1px solid #dfe9e3;border-radius:12px;padding:0 12px;text-align:center;font-size:18px;letter-spacing:5px;outline:none;box-sizing:border-box}.hf-pin-setup-form input:focus{border-color:#087443;box-shadow:0 0 0 3px rgba(8,116,67,.08)}
      .hf-pin-setup-status{font-size:9px;line-height:1.4;text-align:left;display:none;padding:8px;border-radius:9px}.hf-pin-setup-status.show{display:block}.hf-pin-setup-status.error{background:#fff1ef;color:#9b3026}.hf-pin-setup-status.success{background:#edf7f1;color:#0b6b45}
      .hf-pin-setup-submit{width:100%;border:0;border-radius:11px;padding:12px;height:auto;background:#087443;color:#fff;font-weight:900;cursor:pointer}.hf-pin-setup-submit:disabled{opacity:.6;cursor:wait}
      @media(max-width:600px){#hfSecurityCenter{margin:18px 7px 14px;padding:13px;border-radius:15px}#hfSecurityCenter .hf-sc-row{gap:6px}#hfSecurityCenter button{padding:10px 8px;min-height:72px;border-radius:11px}.hf-sc-icon{font-size:19px!important}.hf-sc-title{font-size:10px!important}.hf-sc-sub{font-size:8px!important}}
    `;
    document.head.appendChild(style);
    const box=document.createElement('section');
    box.id='hfSecurityCenter';
    box.innerHTML=`<div class="hf-sc-head"><div><h2>⚙️ Security Center</h2><p>Manage the PIN and password you use to protect your Habsco Finance account.</p></div><span style="font-size:10px;background:rgba(255,255,255,.12);padding:5px 8px;border-radius:99px;font-weight:800">ACCOUNT SECURITY</span></div><div class="hf-sc-row"><button type="button" id="hfScPin"><span class="hf-sc-icon">🔢</span><span class="hf-sc-title">Set / Change PIN</span><span class="hf-sc-sub">Update your 6-digit transaction PIN</span></button><button type="button" id="hfScPassword"><span class="hf-sc-icon">🔑</span><span class="hf-sc-title">Change / Forgot Password</span><span class="hf-sc-sub">Reset the password used to enter your account</span></button><button type="button" id="hfScForgotPin"><span class="hf-sc-icon">🛡️</span><span class="hf-sc-title">Forgot PIN?</span><span class="hf-sc-sub">Start the secure PIN recovery process</span></button></div><div id="hfSecurityNotice"></div>`;
    const statements=[...wrap.querySelectorAll('.section-title')].find(x=>x.querySelector('h2')?.textContent.trim()==='Statements');
    if(statements)wrap.insertBefore(box,statements);else wrap.appendChild(box);
    function openSecurity(){
      let modal=$('hfPinSetupModal');
      if(!modal){
        modal=document.createElement('div');
        modal.id='hfPinSetupModal';
        modal.className='hf-pin-setup-modal';
        modal.innerHTML='<div class="hf-pin-backdrop"></div><section class="hf-pin-setup-sheet" role="dialog" aria-modal="true" aria-labelledby="hfPinSetupTitle"><button class="hf-pin-setup-close" type="button" aria-label="Close">×</button><div class="hf-pin-setup-icon">🔐</div><h3 id="hfPinSetupTitle">Set transaction PIN</h3><p class="hf-pin-setup-help">Create your 6-digit transaction PIN. If you already have a PIN, enter it first to authorize the change.</p><form class="hf-pin-setup-form" autocomplete="off"><label>Current PIN <span>Leave blank if this is your first PIN</span><input id="hfSetupCurrentPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" type="password" autocomplete="off" placeholder="Current PIN"></label><label>New PIN <span>Choose a new 6-digit transaction PIN</span><input id="hfSetupNewPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" type="password" autocomplete="new-password" placeholder="New PIN"></label><label>Confirm new PIN <span>Enter the new PIN again</span><input id="hfSetupConfirmPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" type="password" autocomplete="new-password" placeholder="Confirm PIN"></label><div class="hf-pin-setup-status" role="status" aria-live="polite"></div><button class="hf-pin-setup-submit" type="submit">Set PIN</button></form></section></div>';
        document.body.appendChild(modal);
        const close=()=>modal.classList.remove('open');
        modal.querySelector('.hf-pin-setup-close').onclick=close;
        modal.querySelector('.hf-pin-backdrop').onclick=close;
        modal.querySelector('form').onsubmit=async e=>{
          e.preventDefault();
          const cur=$('hfSetupCurrentPin').value.trim(),next=$('hfSetupNewPin').value.trim(),confirmPin=$('hfSetupConfirmPin').value.trim(),status=modal.querySelector('.hf-pin-setup-status'),btn=modal.querySelector('.hf-pin-setup-submit');
          status.className='hf-pin-setup-status';status.textContent='';
          if(!/^\\d{6}$/.test(next)){status.textContent='New transaction PIN must be exactly 6 digits.';status.className='hf-pin-setup-status show error';return}
          if(next!==confirmPin){status.textContent='The new PINs do not match.';status.className='hf-pin-setup-status show error';return}
          if(cur&& !/^\\d{6}$/.test(cur)){status.textContent='Current PIN must be exactly 6 digits.';status.className='hf-pin-setup-status show error';return}
          btn.disabled=true;btn.textContent='Saving…';
          try{
            const sb=window.supabaseClient||window.supabase.createClient(SB_URL,SB_KEY);
            const {error}=await sb.rpc('member_set_transaction_pin',{p_current_pin:cur||null,p_new_pin:next});
            if(error)throw error;
            status.textContent='Transaction PIN updated successfully.';status.className='hf-pin-setup-status show success';
            $('hfSetupCurrentPin').value='';$('hfSetupNewPin').value='';$('hfSetupConfirmPin').value='';
            setTimeout(close,900);
          }catch(err){status.textContent=String(err?.message||'Unable to update transaction PIN. Please try again.').replace(/^.*?: /,'');status.className='hf-pin-setup-status show error'}finally{btn.disabled=false;btn.textContent='Set PIN'}
        };
        modal.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
      }
      modal.classList.add('open');
      setTimeout(()=>$('hfSetupCurrentPin')?.focus(),80);
    }
    $('hfScPin').onclick=openSecurity;
    $('hfScPassword').onclick=async()=>{
      const b=$('hfPasswordBtn');
      if(b)b.click();
      else if(typeof window.openPasswordModal==='function')window.openPasswordModal();
    };
    $('hfScForgotPin').onclick=()=>{
      const n=$('hfSecurityNotice');
      n.textContent='For your protection, a forgotten transaction PIN cannot be displayed or sent back to you. Please use Set / Change PIN to set a new PIN if one has not been set; if a PIN is already active and forgotten, contact your administrator for a secure reset.';
      n.classList.add('show');
    };
  }
  function loadSavingsLoanExperience(){
    if(document.querySelector('script[data-hf-savings-loan]'))return;
    const s=document.createElement('script');
    s.src='member-dashboard-fix.js?v=20260912-5';
    s.async=false;
    s.dataset.hfSavingsLoan='1';
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();loadSavingsLoanExperience();});
  else {mount();loadSavingsLoanExperience();}
})();
