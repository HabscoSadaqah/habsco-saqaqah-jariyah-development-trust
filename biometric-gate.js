(function(){
  const KEY='hf_passkey_';
  const b64=b=>{let s='';new Uint8Array(b).forEach(x=>s+=String.fromCharCode(x));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
  const fromB64=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const r=atob(s),a=new Uint8Array(r.length);for(let i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a};
  const key=userId=>KEY+userId;
  function supported(){return !!(window.PublicKeyCredential&&navigator.credentials)}
  function client(){return window.supabase?.createClient('https://ythnoeyxovapydbmymdo.supabase.co','sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN')}
  async function getUser(){try{const c=client();if(!c)return null;const {data}=await c.auth.getUser();return data?.user||null}catch{return null}}
  async function invoke(action,body={}){const c=client();if(!c)throw new Error('Login service is unavailable.');const {data,error}=await c.functions.invoke('verify-biometric',{body:{action,...body}});if(error)throw new Error(error.message||'Biometric security service is unavailable.');if(data?.error)throw new Error(data.error);return data}
  function registrationResponse(cred){return {id:cred.id,rawId:b64(cred.rawId),response:{clientDataJSON:b64(cred.response.clientDataJSON),attestationObject:b64(cred.response.attestationObject)},type:cred.type,clientExtensionResults:cred.getClientExtensionResults?cred.getClientExtensionResults():{}}}
  function authenticationResponse(cred){return {id:cred.id,rawId:b64(cred.rawId),response:{clientDataJSON:b64(cred.response.clientDataJSON),authenticatorData:b64(cred.response.authenticatorData),signature:b64(cred.response.signature),userHandle:cred.response.userHandle?b64(cred.response.userHandle):null},type:cred.type,clientExtensionResults:cred.getClientExtensionResults?cred.getClientExtensionResults():{}}}
  function registrationOptions(o){const x={...o,challenge:fromB64(o.challenge),user:{...o.user,id:fromB64(o.user.id)}};if(o.excludeCredentials)x.excludeCredentials=o.excludeCredentials.map(c=>({...c,id:fromB64(c.id)}));return x}
  function authenticationOptions(o){return {...o,challenge:fromB64(o.challenge),allowCredentials:(o.allowCredentials||[]).map(c=>({...c,id:fromB64(c.id)}))}}
  function pageAction(){const a=new URLSearchParams(location.search).get('action')||'send';if(a==='send')return'member_transfer';if(a==='save')return'member_contribute_to_account';if(['airtime','data','tv','electricity'].includes(a))return'member_start_utility_transaction';return null}
  async function enroll(user){
    if(!supported())throw new Error('Biometric authentication is not supported on this device or browser.');
    const options=await invoke('registration-options');const cred=await navigator.credentials.create({publicKey:registrationOptions(options)});if(!cred)throw new Error('Biometric setup was cancelled.');
    const result=await invoke('registration-verify',{response:registrationResponse(cred)});if(!result?.verified)throw new Error('The server could not verify this biometric credential.');localStorage.setItem(key(user.id),'server-verified');return true;
  }
  async function verify(user,purpose='authentication',sensitiveAction=null){
    if(!supported())throw new Error('Biometric authentication is not supported on this device or browser.');
    const options=await invoke('authentication-options',{purpose});const cred=await navigator.credentials.get({publicKey:authenticationOptions(options),mediation:'optional'});if(!cred)throw new Error('Biometric verification was cancelled.');
    const result=await invoke('authentication-verify',{purpose,sensitive_action:sensitiveAction||undefined,response:authenticationResponse(cred)});if(!result?.verified)throw new Error('Biometric verification failed.');localStorage.setItem(key(user.id),'server-verified');return result.authorization_token||true;
  }
  async function hasCredential(user){if(!user||!supported())return false;try{await invoke('authentication-options',{purpose:'authentication'});return true}catch{return false}}
  async function sensitiveGate(action=pageAction()){
    const u=await getUser();if(!u)throw new Error('Your session has expired. Please log in again.');if(!action)throw new Error('Biometric confirmation is not required for this action.');
    if(!await hasCredential(u))throw new Error('Biometric confirmation is not enabled. Enable Face ID / fingerprint from your member dashboard first.');
    const token=await verify(u,'sensitive',action);if(typeof token!=='string')throw new Error('Server did not issue a biometric authorization.');window.__hfBioAuthorizationToken=token;return token;
  }
  window.hfBiometric={supported,enroll,verify,has:async()=>hasCredential(await getUser()),sensitiveGate};
  window.hfEnrollBiometric=async()=>{const u=await getUser();if(!u)throw new Error('Please log in first.');return enroll(u)};
  document.addEventListener('submit',async e=>{
    const form=e.target;if(!form||form.id!=='authForm'||window.__hfLoginRetry)return;
    const registration=document.getElementById('registrationFields');if(registration&&!registration.classList.contains('hidden'))return;e.preventDefault();e.stopImmediatePropagation();
    const button=document.getElementById('submitBtn'),message=document.getElementById('message');try{
      const email=document.getElementById('email').value.trim().toLowerCase(),password=document.getElementById('password').value;if(!email||!password)throw new Error('Please enter your email address and password.');
      const c=client();if(!c)throw new Error('Login service is unavailable.');if(button){button.disabled=true;button.textContent='LOGGING IN…'}
      const {data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;if(!data?.session?.user)throw new Error('Login did not return a valid session.');const user=data.session.user;
      if(await hasCredential(user)){if(button)button.textContent='VERIFYING BIOMETRIC…';await verify(user,'authentication')}else if(supported()){if(button)button.textContent='SETTING UP BIOMETRIC…';try{await enroll(user)}catch(enrollError){console.warn('Biometric enrollment skipped:',enrollError)}}
      if(message){message.textContent='Login successful. Opening your member portal…';message.className='message show';message.style.background='#e7f6ec';message.style.color='#146b31'}window.__hfLoginRetry=true;setTimeout(()=>{location.href='./member.html'},250);
    }catch(err){try{const c=client();if(c)await c.auth.signOut()}catch{}if(message){message.textContent=err.message||'Biometric login failed.';message.className='message show';message.style.background='#fdecec';message.style.color='#9b1c1c'}if(button){button.disabled=false;button.textContent='LOGIN'}}
  },true);
  document.addEventListener('submit',async e=>{
    const form=e.target;if(!form||form.id!=='actionForm'||window.__hfBioRetry)return;const action=pageAction();if(!action)return;
    e.preventDefault();e.stopImmediatePropagation();try{await sensitiveGate(action);window.__hfBioRetry=true;form.requestSubmit()}catch(err){const m=document.getElementById('msg');if(m){m.textContent=err.message||'Biometric confirmation failed.';m.className='msg show';m.style.background='#fff1f1';m.style.color='#a52a2a'}}finally{window.__hfBioRetry=false}
  },true);
  document.addEventListener('DOMContentLoaded',()=>{const panel=document.getElementById('hfSecurityCenter');if(!panel||document.getElementById('hfBiometricCard'))return;const row=panel.querySelector('.hf-security-row');if(!row)return;const b=document.createElement('button');b.type='button';b.id='hfBiometricCard';b.innerHTML='<span class="ico">◉</span><span class="ttl">Face ID / Fingerprint</span><span class="sub">Enable biometric confirmation</span>';row.appendChild(b);b.onclick=async()=>{try{b.disabled=true;await window.hfEnrollBiometric();b.querySelector('.sub').textContent='Biometrics enabled';b.querySelector('.ttl').textContent='Biometric Enabled'}catch(err){const m=document.getElementById('hfSecurityMsg');if(m){m.textContent=err.message||'Unable to enable biometrics.';m.classList.add('show')}}finally{b.disabled=false}}});
})();
