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
  const start=()=>{
    const sb=getClient();
    const panel=document.getElementById('hfSecurityCenter');
    if(!sb||!panel){setTimeout(start,250);return}
    addBiometricCard();
    setTimeout(addBiometricCard,300);
    setTimeout(addBiometricCard,1000);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();