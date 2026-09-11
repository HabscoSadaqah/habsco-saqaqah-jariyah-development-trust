(function(){
  const KEY='hf_passkey_';
  const b64=b=>{let s='';new Uint8Array(b).forEach(x=>s+=String.fromCharCode(x));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
  const fromB64=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const r=atob(s);const a=new Uint8Array(r.length);for(let i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a};
  const random=n=>crypto.getRandomValues(new Uint8Array(n));
  const key=userId=>KEY+userId;
  function supported(){return !!(window.PublicKeyCredential&&navigator.credentials)}
  function client(){return window.supabase?.createClient('https://ythnoeyxovapydbmymdo.supabase.co','sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN')}
  async function getUser(){try{const c=client();if(!c)return null;const {data}=await c.auth.getUser();return data?.user||null}catch{return null}}
  async function enroll(user){
    if(!supported())throw new Error('Biometric authentication is not supported on this device or browser.');
    const cred=await navigator.credentials.create({publicKey:{challenge:random(32),rp:{name:'Hassan Finance',id:location.hostname},user:{id:new TextEncoder().encode(user.id),name:user.email||user.id,displayName:user.user_metadata?.full_name||user.email||'Hassan Finance Member'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{residentKey:'preferred',userVerification:'required'},timeout:60000,attestation:'none'}});
    if(!cred)throw new Error('Biometric setup was cancelled.');
    localStorage.setItem(key(user.id),b64(cred.rawId));return true;
  }
  async function verify(user){
    if(!supported())throw new Error('Biometric authentication is not supported on this device or browser.');
    const id=localStorage.getItem(key(user.id));if(!id)return false;
    const cred=await navigator.credentials.get({publicKey:{challenge:random(32),allowCredentials:[{type:'public-key',id:fromB64(id)}],userVerification:'required'},mediation:'optional'});
    if(!cred)throw new Error('Biometric verification was cancelled.');return true;
  }
  async function sensitiveGate(){const u=await getUser();if(!u)throw new Error('Your session has expired. Please log in again.');if(!localStorage.getItem(key(u.id)))throw new Error('Biometric confirmation is not enabled. Enable Face ID / fingerprint from your member dashboard first.');return verify(u)}
  window.hfBiometric={supported,enroll,verify,has:async()=>{const u=await getUser();return !!u&&!!localStorage.getItem(key(u.id))},sensitiveGate};
  window.hfEnrollBiometric=async()=>{const u=await getUser();if(!u)throw new Error('Please log in first.');return enroll(u)};

  // Password login remains the primary Supabase authentication. Existing enrolled devices must pass biometrics; new devices are prompted to enroll after password verification.
  document.addEventListener('submit',async e=>{
    const form=e.target;if(!form||form.id!=='authForm'||window.__hfLoginRetry)return;
    const registration=document.getElementById('registrationFields');if(registration&&!registration.classList.contains('hidden'))return;
    e.preventDefault();e.stopImmediatePropagation();
    const button=document.getElementById('submitBtn'),message=document.getElementById('message');
    try{
      const email=document.getElementById('email').value.trim().toLowerCase(),password=document.getElementById('password').value;if(!email||!password)throw new Error('Please enter your email address and password.');
      const c=client();if(!c)throw new Error('Login service is unavailable.');if(button){button.disabled=true;button.textContent='LOGGING IN…'}
      const {data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;if(!data?.session?.user)throw new Error('Login did not return a valid session.');
      const user=data.session.user;
      if(localStorage.getItem(key(user.id))){if(button)button.textContent='VERIFYING BIOMETRIC…';await verify(user)}
      else if(supported()){
        if(button)button.textContent='SETTING UP BIOMETRIC…';
        try{await enroll(user)}catch(enrollError){console.warn('Biometric enrollment skipped:',enrollError)}
      }
      if(message){message.textContent=localStorage.getItem(key(user.id))?'Biometric login successful. Opening your member portal…':'Login successful. Opening your member portal…';message.className='message show';message.style.background='#e7f6ec';message.style.color='#146b31'}
      window.__hfLoginRetry=true;setTimeout(()=>{location.href='./member.html'},250);
    }catch(err){try{const c=client();if(c)await c.auth.signOut()}catch{}if(message){message.textContent=err.message||'Biometric login failed.';message.className='message show';message.style.background='#fdecec';message.style.color='#9b1c1c'}if(button){button.disabled=false;button.textContent='LOGIN'}}
  },true);

  document.addEventListener('submit',async e=>{
    const form=e.target;if(!form||form.id!=='actionForm'||window.__hfBioRetry)return;
    e.preventDefault();e.stopImmediatePropagation();
    try{await sensitiveGate();window.__hfBioRetry=true;form.requestSubmit()}
    catch(err){const m=document.getElementById('msg');if(m){m.textContent=err.message||'Biometric confirmation failed.';m.className='msg show';m.style.background='#fff1f1';m.style.color='#a52a2a'}}
    finally{window.__hfBioRetry=false}
  },true);

  document.addEventListener('DOMContentLoaded',()=>{
    const panel=document.getElementById('hfSecurityCenter');if(!panel||document.getElementById('hfBiometricCard'))return;const row=panel.querySelector('.hf-security-row');if(!row)return;
    const b=document.createElement('button');b.type='button';b.id='hfBiometricCard';b.innerHTML='<span class="ico">◉</span><span class="ttl">Face ID / Fingerprint</span><span class="sub">Enable biometric confirmation</span>';row.appendChild(b);
    b.onclick=async()=>{try{b.disabled=true;await window.hfEnrollBiometric();b.querySelector('.sub').textContent='Biometrics enabled';b.querySelector('.ttl').textContent='Biometric Enabled'}catch(err){const m=document.getElementById('hfSecurityMsg');if(m){m.textContent=err.message||'Unable to enable biometrics.';m.classList.add('show')}}finally{b.disabled=false}};
  });
})();
