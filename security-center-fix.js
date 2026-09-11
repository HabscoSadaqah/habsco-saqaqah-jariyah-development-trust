(()=>{
  const addBiometricCard=()=>{
    const panel=document.getElementById('hfSecurityCenter');
    const row=panel?.querySelector('.hf-security-row');
    if(!panel||!row||document.getElementById('hfBiometricCard'))return !!panel;
    const b=document.createElement('button');
    b.type='button';
    b.id='hfBiometricCard';
    b.innerHTML='<span class="ico">◉</span><span><span class="ttl">Face ID / Fingerprint</span><span class="sub">Enable biometric confirmation</span></span>';
    row.appendChild(b);
    const status=()=>document.getElementById('hfSecurityMsg');
    b.onclick=async()=>{
      const original=b.innerHTML;
      try{
        b.disabled=true;
        b.querySelector('.sub').textContent='Preparing biometric setup…';
        if(typeof window.hfEnrollBiometric!=='function'){
          await new Promise((resolve,reject)=>{
            const existing=document.querySelector('script[data-hf-biometric]');
            if(existing){let n=0;const t=setInterval(()=>{if(typeof window.hfEnrollBiometric==='function'){clearInterval(t);resolve()}else if(++n>30){clearInterval(t);reject(new Error('Biometric service is still loading. Please refresh and try again.'))}},100);return}
            const s=document.createElement('script');s.src='biometric-gate.js?v=20260911-2';s.async=false;s.dataset.hfBiometric='1';s.onload=()=>{let n=0;const t=setInterval(()=>{if(typeof window.hfEnrollBiometric==='function'){clearInterval(t);resolve()}else if(++n>30){clearInterval(t);reject(new Error('Biometric service did not start. Please refresh and try again.'))}},100)};s.onerror=()=>reject(new Error('Unable to load biometric security. Please refresh and try again.'));document.head.appendChild(s);
          });
        }
        await window.hfEnrollBiometric();
        b.querySelector('.ttl').textContent='Biometric Enabled';
        b.querySelector('.sub').textContent='Face ID / fingerprint is ready';
        const m=status();if(m){m.textContent='Biometric confirmation is enabled. Sensitive transactions can now request your device verification.';m.className='hf-security-msg show info'}
      }catch(err){
        b.innerHTML=original;
        const m=status();if(m){m.textContent=err?.message||'Unable to enable biometrics.';m.className='hf-security-msg show error'}
      }finally{b.disabled=false}
    };
    return true;
  };
  const start=()=>{
    const sb=window.supabaseClient;
    const card=document.getElementById('hfPinCard');
    if(!sb||!card){setTimeout(start,250);return}
    card.onclick=async()=>{
      const {data:{session}}=await sb.auth.getSession();
      if(!session){const m=document.getElementById('hfSecurityMsg');if(m){m.textContent='Your session has expired. Please sign in again.';m.className='hf-security-msg show error'}return}
      if(typeof window.pinModal==='function')window.pinModal();
      const modal=document.getElementById('hfPinModal');
      if(!modal)return;
      const {data,error}=await sb.rpc('member_pin_status');
      if(error||!data){document.getElementById('hfPinModal')?.remove();const m=document.getElementById('hfSecurityMsg');if(m){m.textContent='We could not check your PIN status. Please try again.';m.className='hf-security-msg show error'}return}
      const hasPin=!!data.has_pin;modal.dataset.hasPin=hasPin?'1':'0';
      const current=document.getElementById('hfCurrentPin');const label=current?.closest('label');if(current&&label){current.required=hasPin;label.style.display=hasPin?'grid':'none'}
      const title=document.getElementById('hfPinTitle');if(title)title.textContent=hasPin?'Change transaction PIN':'Set transaction PIN';
      if(data.must_change){const m=document.getElementById('hfSecurityMsg');if(m){m.textContent='For your security, please set a new transaction PIN before making sensitive transactions.';m.className='hf-security-msg show info'}}
    };
    addBiometricCard();
    setTimeout(addBiometricCard,150);
    setTimeout(addBiometricCard,600);
    setTimeout(addBiometricCard,1500);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();