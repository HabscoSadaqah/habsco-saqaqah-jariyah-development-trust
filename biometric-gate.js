(function(){
  const KEY='hf_passkey_';
  const b64=b=>{let s='';new Uint8Array(b).forEach(x=>s+=String.fromCharCode(x));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
  const fromB64=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const r=atob(s);const a=new Uint8Array(r.length);for(let i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a};
  const random=n=>crypto.getRandomValues(new Uint8Array(n));
  const key=userId=>KEY+userId;
  function supported(){return !!(window.PublicKeyCredential&&navigator.credentials)}
  async function getUser(){if(!window.supabase)return null;try{const c=window.supabase.createClient('https://ythnoeyxovapydbmymdo.supabase.co','sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsP');const {data}=await c.auth.getUser();return data?.user||null}catch{return null}}
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

  document.addEventListener('submit',async e=>{
    const form=e.target;if(!form||form.id!=='actionForm'||window.__hfBioRetry)return;
    e.preventDefault();e.stopImmediatePropagation();
    try{await sensitiveGate();window.__hfBioRetry=true;form.requestSubmit()}
    catch(err){const m=document.getElementById('msg');if(m){m.textContent=err.message||'Biometric confirmation failed.';m.className='msg show';m.style.background='#fff1f1';m.style.color='#a52a2a'}}
    finally{window.__hfBioRetry=false}
  },true);

  document.addEventListener('DOMContentLoaded',()=>{
    const panel=document.getElementById('hfSecurityCenter');
    if(!panel||document.getElementById('hfBiometricCard'))return;
    const row=panel.querySelector('.hf-security-row');if(!row)return;
    const b=document.createElement('button');b.type='button';b.id='hfBiometricCard';b.innerHTML='<span class="ico">◉</span><span class="ttl">Face ID / Fingerprint</span><span class="sub">Enable biometric confirmation</span>';
    row.appendChild(b);
    b.onclick=async()=>{try{b.disabled=true;await window.hfEnrollBiometric();b.querySelector('.sub').textContent='Biometrics enabled';b.querySelector('.ttl').textContent='Biometric Enabled'}catch(err){const m=document.getElementById('hfSecurityMsg');if(m){m.textContent=err.message||'Unable to enable biometrics.';m.classList.add('show')}}finally{b.disabled=false}};
  });
})();
