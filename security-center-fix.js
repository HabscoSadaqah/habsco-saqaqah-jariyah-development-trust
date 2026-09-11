(()=>{
  const getClient=()=>window.supabaseClient||(typeof supabaseClient!=='undefined'?supabaseClient:null);
  const loadBiometric=()=>new Promise((resolve,reject)=>{
    if(typeof window.hfOpenBiometricControls==='function')return resolve();
    const existing=document.querySelector('script[data-hf-biometric]');
    if(existing){
      let tries=0;
      const timer=setInterval(()=>{
        if(typeof window.hfOpenBiometricControls==='function'){clearInterval(timer);resolve()}
        else if(++tries>=50){clearInterval(timer);reject(new Error('Biometric security could not be loaded. Please refresh and try again.'))}
      },100);
      return;
    }
    const s=document.createElement('script');
    s.src='biometric-gate.js?v=20260911-9';
    s.async=false;
    s.dataset.hfBiometric='1';
    s.onload=()=>{
      if(typeof window.hfOpenBiometricControls==='function')resolve();
      else reject(new Error('Biometric security could not be initialized. Please refresh and try again.'));
    };
    s.onerror=()=>reject(new Error('Unable to load biometric security. Please refresh and try again.'));
    document.head.appendChild(s);
  });
  const addBiometricCard=()=>{
    const panel=document.getElementById('hfSecurityCenter');
    const row=panel?.querySelector('.hf-security-row');
    if(!panel||!row)return false;
    if(document.getElementById('hfBiometricCard'))return true;
    const b=document.createElement('button');
    b.type='button';
    b.id='hfBiometricCard';
    b.innerHTML='<span class="ico">◉</span><span><span class="ttl">Biometric Security</span><span class="sub">Face ID / fingerprint settings</span></span>';
    row.appendChild(b);
    b.onclick=async()=>{
      const sub=b.querySelector('.sub');
      const msg=document.getElementById('hfSecurityMsg');
      try{
        b.disabled=true;
        if(sub)sub.textContent='Opening controls…';
        const sb=getClient();
        if(!sb)throw new Error('Security service is still loading. Please refresh and try again.');
        const {data,error}=await sb.auth.getSession();
        if(error||!data?.session?.user)throw new Error('Please log in first.');
        await loadBiometric();
        await window.hfOpenBiometricControls();
        if(sub)sub.textContent='Face ID / fingerprint settings';
      }catch(err){
        if(sub)sub.textContent='Face ID / fingerprint settings';
        if(msg){msg.textContent=err?.message||'Unable to open biometric controls.';msg.className='hf-security-msg show error'}
      }finally{b.disabled=false}
    };
    return true;
  };
  const addAdminPortal=async()=>{
    const sb=getClient();
    if(!sb)return false;
    try{
      const {data:{session}}=await sb.auth.getSession();
      if(!session?.user)return false;
      const {data:profile}=await sb.from('profiles').select('role,status').eq('id',session.user.id).maybeSingle();
      if(profile?.role!=='admin'||profile?.status!=='active')return false;
      if(document.getElementById('hfAdminPortalCard'))return true;
      const wrap=document.querySelector('.wrap');
      if(!wrap)return false;
      const card=document.createElement('section');
      card.id='hfAdminPortalCard';
      card.style.cssText='margin:18px 8px 14px;background:linear-gradient(135deg,#062f20,#0b6340);color:#fff;border-radius:18px;padding:16px;box-shadow:0 8px 24px rgba(6,47,32,.16);display:flex;align-items:center;justify-content:space-between;gap:14px';
      card.innerHTML='<div><div style="font-size:10px;font-weight:900;letter-spacing:.7px;opacity:.75">ADMIN ACCESS</div><div style="font-size:17px;font-weight:950;margin-top:4px">Admin Control Center</div><div style="font-size:10.5px;opacity:.82;margin-top:4px;line-height:1.4">Manage members, wallets, requests, financing and audit controls.</div></div><a href="admin.html" style="flex:0 0 auto;text-decoration:none;background:#fff;color:#083e27;border-radius:11px;padding:10px 13px;font-size:11px;font-weight:950;white-space:nowrap">OPEN ADMIN</a>';
      const first=wrap.firstElementChild;
      if(first)wrap.insertBefore(card,first);else wrap.appendChild(card);
      return true;
    }catch(_){return false}
  };
  const start=()=>{
    const sb=getClient();
    const panel=document.getElementById('hfSecurityCenter');
    if(!sb||!panel){setTimeout(start,250);return}
    addBiometricCard();
    addAdminPortal();
    setTimeout(addBiometricCard,300);
    setTimeout(addBiometricCard,1000);
    setTimeout(addAdminPortal,500);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();