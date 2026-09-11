const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';

const $=id=>document.getElementById(id);
let mode='login';

function setMessage(text,ok=false){
  const message=$('message');
  if(!message)return;
  message.textContent=text;
  message.className='message show';
  message.style.background=ok?'#e7f6ec':'#fdecec';
  message.style.color=ok?'#146b31':'#9b1c1c';
}

function getClient(){
  if(!window.supabase||typeof window.supabase.createClient!=='function'){
    throw new Error('The login service could not load. Please refresh the page and try again.');
  }
  return window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
}

let supabaseClient=null;
try{supabaseClient=getClient();}catch(error){console.error(error);setTimeout(()=>setMessage(error.message),0);}

const loginTab=$('loginTab');
const signupTab=$('signupTab');
const form=$('authForm');
const submitBtn=$('submitBtn');
const message=$('message');
const registrationFields=$('registrationFields');
const confirmField=$('confirmField');

function setMode(next){
  mode=next;
  loginTab.classList.toggle('active',mode==='login');
  signupTab.classList.toggle('active',mode==='signup');
  registrationFields.classList.toggle('hidden',mode!=='signup');
  confirmField.classList.toggle('hidden',mode!=='signup');
  $('password').autocomplete=mode==='signup'?'new-password':'current-password';
  submitBtn.textContent=mode==='signup'?'CREATE MEMBER ACCOUNT':'LOGIN';
  $('forgotWrap').classList.toggle('hidden',mode!=='login');
  message.className='message';
}

loginTab.addEventListener('click',()=>setMode('login'));
signupTab.addEventListener('click',()=>setMode('signup'));

function go(path){window.location.href=path;}

function loginError(error){
  const m=String(error?.message||'').toLowerCase();
  if(m.includes('invalid login credentials')||m.includes('invalid credentials'))return 'Incorrect email or password.';
  if(m.includes('email not confirmed'))return 'Please confirm your email before logging in.';
  if(m.includes('too many requests'))return 'Too many login attempts. Please wait and try again.';
  if(m.includes('network')||m.includes('fetch')||m.includes('failed to fetch'))return 'Connection problem. Check your internet connection and try again.';
  return error?.message||'Unable to log in. Please check your details and try again.';
}

$('forgotPassword').addEventListener('click',async()=>{
  const email=$('email').value.trim().toLowerCase();
  if(!email){setMessage('Enter your email address first.');$('email').focus();return;}
  const button=$('forgotPassword');
  button.disabled=true;
  button.textContent='SENDING…';
  try{
    if(!supabaseClient)throw new Error('Login service is unavailable.');
    const redirectTo=new URL('./reset-password.html',window.location.href).href;
    const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo});
    if(error)throw error;
    setMessage('If an account exists for this email, a password reset link has been sent.',true);
  }catch(error){console.error(error);setMessage('Unable to send the password reset request. Please try again.');}
  finally{button.disabled=false;button.textContent='Forgot password?';}
});

form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(mode!=='login'){return register();}
  if(submitBtn.disabled)return;
  submitBtn.disabled=true;
  submitBtn.textContent='LOGGING IN…';
  message.className='message';
  try{
    if(!supabaseClient)throw new Error('Login service is unavailable. Please refresh the page.');
    const email=$('email').value.trim().toLowerCase();
    const password=$('password').value;
    if(!email||!password)throw new Error('Please enter your email address and password.');

    const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
    if(error)throw error;
    if(!data?.session?.user)throw new Error('Login did not return a valid session. Please try again.');

    setMessage('Login successful. Opening your dashboard…',true);
    const userId=data.session.user.id;
    let destination='./member.html';

    try{
      const {data:profile,error:profileError}=await supabaseClient
        .from('profiles')
        .select('role,status')
        .eq('id',userId)
        .maybeSingle();
      if(profileError)throw profileError;
      if(profile?.role==='admin'&&profile?.status==='active')destination='./admin.html';
    }catch(profileError){
      console.warn('Profile routing check failed; using member portal.',profileError);
    }

    setTimeout(()=>go(destination),300);
  }catch(error){
    console.error('Authentication error:',error);
    setMessage(loginError(error));
    submitBtn.disabled=false;
    submitBtn.textContent='LOGIN';
  }
});

async function register(){
  if(submitBtn.disabled)return;
  submitBtn.disabled=true;
  submitBtn.textContent='CREATING ACCOUNT…';
  message.className='message';
  try{
    if(!supabaseClient)throw new Error('Registration service is unavailable. Please refresh the page.');
    const email=$('email').value.trim().toLowerCase();
    const password=$('password').value;
    const firstName=$('firstName').value.trim();
    const middleName=$('middleName').value.trim();
    const surname=$('surname').value.trim();
    const nationalId=$('nin').value.trim();
    const phone=$('phone').value.trim();
    const confirm=$('confirmPassword').value;
    if(!email||!password)throw new Error('Please enter your email address and password.');
    if(!firstName||!surname||!phone)throw new Error('First name, surname and phone number are required.');
    if(!/^\d{11}$/.test(nationalId))throw new Error('Please enter a valid 11-digit NIN.');
    if(password.length<8)throw new Error('Password must be at least 8 characters.');
    if(password!==confirm)throw new Error('Passwords do not match.');
    const fullName=[firstName,middleName,surname].filter(Boolean).join(' ');
    const {data,error}=await supabaseClient.auth.signUp({email,password,options:{data:{first_name:firstName,middle_name:middleName,surname,national_id:nationalId,phone,full_name:fullName},emailRedirectTo:new URL('./member.html',window.location.href).href}});
    if(error)throw error;
    if(data?.session){setMessage('Account created. Opening your member portal…',true);setTimeout(()=>go('./member.html'),300);return;}
    setMessage('Registration completed. Please confirm your email if required.',true);
  }catch(error){
    console.error('Registration error:',error);
    setMessage(error?.message||'Registration failed. Please try again.');
  }finally{
    submitBtn.disabled=false;
    if(mode==='signup')submitBtn.textContent='CREATE MEMBER ACCOUNT';
  }
}

// Register the real PWA service worker from the authentication page too.
if('serviceWorker' in navigator && location.protocol==='https:'){
  window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}));
}
