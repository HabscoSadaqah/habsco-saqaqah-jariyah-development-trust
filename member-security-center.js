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
      @media(max-width:600px){#hfSecurityCenter{margin:18px 7px 14px;padding:13px;border-radius:15px}#hfSecurityCenter .hf-sc-row{gap:6px}#hfSecurityCenter button{padding:10px 8px;min-height:72px;border-radius:11px}.hf-sc-icon{font-size:19px!important}.hf-sc-title{font-size:10px!important}.hf-sc-sub{font-size:8px!important}}
    `;
    document.head.appendChild(style);
    const box=document.createElement('section');
    box.id='hfSecurityCenter';
    box.innerHTML=`<div class="hf-sc-head"><div><h2>⚙️ Security Center</h2><p>Manage the PIN and password you use to protect your Hassan Finance account.</p></div><span style="font-size:10px;background:rgba(255,255,255,.12);padding:5px 8px;border-radius:99px;font-weight:800">ACCOUNT SECURITY</span></div><div class="hf-sc-row"><button type="button" id="hfScPin"><span class="hf-sc-icon">🔢</span><span class="hf-sc-title">Set / Change PIN</span><span class="hf-sc-sub">Update your 6-digit transaction PIN</span></button><button type="button" id="hfScPassword"><span class="hf-sc-icon">🔑</span><span class="hf-sc-title">Change / Forgot Password</span><span class="hf-sc-sub">Reset the password used to enter your account</span></button><button type="button" id="hfScForgotPin"><span class="hf-sc-icon">🛡️</span><span class="hf-sc-title">Forgot PIN?</span><span class="hf-sc-sub">Start the secure PIN recovery process</span></button></div><div id="hfSecurityNotice"></div></section>`;
    const statements=[...wrap.querySelectorAll('.section-title')].find(x=>x.querySelector('h2')?.textContent.trim()==='Statements');
    if(statements)wrap.insertBefore(box,statements);else wrap.appendChild(box);
    function openSecurity(){
      const panel=$('hfMemberSecurity');
      if(panel){panel.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>{const input=$('hfNewPin');if(input)input.focus();},450);}
      else alert('Security Center is loading. Please wait a moment and try again.');
    }
    $('hfScPin').onclick=openSecurity;
    $('hfScPassword').onclick=async()=>{
      const panel=$('hfMemberSecurity');
      if(panel)panel.scrollIntoView({behavior:'smooth',block:'center'});
      const b=$('hfPasswordBtn');
      if(b)setTimeout(()=>b.click(),450);
    };
    $('hfScForgotPin').onclick=()=>{
      const n=$('hfSecurityNotice');
      n.textContent='For your protection, a forgotten transaction PIN cannot be displayed or sent back to you. Please use Security Center to set a new PIN if your current PIN is not set; if a PIN is already set and you have forgotten it, contact your Hassan Finance administrator for a secure PIN reset.';
      n.classList.add('show');
      const panel=$('hfMemberSecurity');
      if(panel)panel.scrollIntoView({behavior:'smooth',block:'center'});
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
