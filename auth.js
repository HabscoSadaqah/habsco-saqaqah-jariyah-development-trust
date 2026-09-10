const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
let mode='login';
const $=id=>document.getElementById(id);
const loginTab=$('loginTab'),signupTab=$('signupTab'),form=$('authForm'),submitBtn=$('submitBtn'),message=$('message'),registrationFields=$('registrationFields'),confirmField=$('confirmField');
function setMessage(text,ok=false){message.textContent=text;message.className='message show';message.style.background=ok?'#e7f6ec':'#fdecec';message.style.color=ok?'#146b31':'#9b1c1c';}
function setMode(next){mode=next;loginTab.classList.toggle('active',mode==='login');signupTab.classList.toggle('active',mode==='signup');registrationFields.classList.toggle('hidden',mode!=='signup');confirmField.classList.toggle('hidden',mode!=='signup');$('password').autocomplete=mode==='signup'?'new-password':'current-password';submitBtn.textContent=mode==='signup'?'CREATE MEMBER ACCOUNT':'LOGIN';message.className='message';}
loginTab.onclick=()=>setMode('login');signupTab.onclick=()=>setMode('signup');
async function routeAfterLogin(){
  const {data,error}=await supabaseClient.auth.getSession();
  if(error) throw error;
  if(!data.session){setMessage('Login session was not created. Please try again.');return;}
  // Do not block login on a profile lookup. A normal authenticated member can enter the member portal.
  try{
    const {data:profile,error:profileError}=await supabaseClient.from('profiles').select('role,status').eq('id',data.session.user.id).maybeSingle();
    if(!profileError && profile?.role==='admin' && profile?.status==='active'){
      window.location.replace('./admin.html');
      return;
    }
  }catch(err){console.warn('Profile lookup skipped during login:',err);}
  window.location.replace('./member.html');
}
form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(submitBtn.disabled)return;
  submitBtn.disabled=true;
  submitBtn.textContent=mode==='signup'?'CREATING ACCOUNT…':'LOGGING IN…';
  message.className='message';
  try{
    const email=$('email').value.trim().toLowerCase();
    const password=$('password').value;
    if(!email||!password)throw new Error('Please enter your email address and password.');
    if(mode==='signup'){
      const firstName=$('firstName').value.trim(),middleName=$('middleName').value.trim(),surname=$('surname').value.trim(),nationalId=$('nin').value.trim(),phone=$('phone').value.trim(),confirm=$('confirmPassword').value;
      if(!firstName||!surname||!phone)throw new Error('First name, surname and phone number are required.');
      if(!/^\d{11}$/.test(nationalId))throw new Error('Please enter a valid 11-digit NIN.');
      if(password.length<8)throw new Error('Password must be at least 8 characters.');
      if(password!==confirm)throw new Error('Passwords do not match.');
      const fullName=[firstName,middleName,surname].filter(Boolean).join(' ');
      const {data,error}=await supabaseClient.auth.signUp({email,password,options:{data:{first_name:firstName,middle_name:middleName,surname,national_id:nationalId,phone,full_name:fullName},emailRedirectTo:new URL('./member.html',window.location.href).href}});
      if(error)throw error;
      if(data?.session){setMessage('Account created. Opening your member portal…',true);setTimeout(()=>routeAfterLogin().catch(err=>setMessage(err.message||'Unable to open portal.')),150);return;}
      setMessage('Registration successful. Check your email if confirmation is required, then log in.',true);
      return;
    }
    const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
    if(error)throw error;
    if(!data?.session)throw new Error('No active session was returned. Check your email/password and try again.');
    setMessage('Login successful. Opening your dashboard…',true);
    // Give the browser a moment to paint the success message, then navigate.
    setTimeout(()=>routeAfterLogin().catch(err=>{console.error(err);setMessage(err?.message||'Unable to open your dashboard.');submitBtn.disabled=false;submitBtn.textContent='LOGIN';}),150);
  }catch(error){
    console.error('Authentication error:',error);
    setMessage(error?.message||'Authentication failed. Please try again.');
    submitBtn.disabled=false;
    submitBtn.textContent=mode==='signup'?'CREATE MEMBER ACCOUNT':'LOGIN';
  }
});
// Only redirect if a session already exists; never repeatedly run profile routing.
supabaseClient.auth.getSession().then(({data,error})=>{
  if(error){console.warn('Session check failed:',error);return;}
  if(data?.session && window.location.pathname.endsWith('/auth.html')){
    routeAfterLogin().catch(err=>console.warn('Existing-session routing failed:',err));
  }
});
