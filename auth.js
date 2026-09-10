const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
let mode='login';
const $=id=>document.getElementById(id);
const loginTab=$('loginTab'),signupTab=$('signupTab'),form=$('authForm'),submitBtn=$('submitBtn'),message=$('message'),registrationFields=$('registrationFields'),confirmField=$('confirmField');
function setMessage(text,ok=false){message.textContent=text;message.className='message show';message.style.background=ok?'#e7f6ec':'#fdecec';message.style.color=ok?'#146b31':'#9b1c1c';}
function setMode(next){mode=next;loginTab.classList.toggle('active',mode==='login');signupTab.classList.toggle('active',mode==='signup');registrationFields.classList.toggle('hidden',mode!=='signup');confirmField.classList.toggle('hidden',mode!=='signup');$('password').autocomplete=mode==='signup'?'new-password':'current-password';submitBtn.textContent=mode==='signup'?'CREATE MEMBER ACCOUNT':'LOGIN';$('forgotWrap').classList.toggle('hidden',mode!=='login');message.className='message';}
loginTab.onclick=()=>setMode('login');signupTab.onclick=()=>setMode('signup');
function go(path){window.location.href=path;}
function withTimeout(promise,ms,label){return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label)),ms))]);}

$('forgotPassword').onclick=async()=>{
  if(mode!=='login')return;
  const email=$('email').value.trim().toLowerCase();
  if(!email){setMessage('Enter your email address first, then tap Forgot password.');$('email').focus();return;}
  const button=$('forgotPassword');button.disabled=true;button.textContent='SENDING…';
  try{const redirectTo=new URL('./reset-password.html',window.location.href).href;const {error}=await withTimeout(supabaseClient.auth.resetPasswordForEmail(email,{redirectTo}),12000,'Password reset request timed out. Please try again.');if(error)throw error;setMessage('If an account exists for this email, a password reset link has been sent. Check your inbox.',true);}catch(error){console.error('Password reset error:',error);setMessage(error?.message||'Unable to send the password reset email. Please try again.');}finally{button.disabled=false;button.textContent='Forgot password?';}
};

form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(submitBtn.disabled)return;
  submitBtn.disabled=true;submitBtn.textContent=mode==='signup'?'CREATING ACCOUNT…':'LOGGING IN…';message.className='message';
  try{
    const email=$('email').value.trim().toLowerCase();const password=$('password').value;
    if(!email||!password)throw new Error('Please enter your email address and password.');
    if(mode==='signup'){
      const firstName=$('firstName').value.trim(),middleName=$('middleName').value.trim(),surname=$('surname').value.trim(),nationalId=$('nin').value.trim(),phone=$('phone').value.trim(),confirm=$('confirmPassword').value;
      if(!firstName||!surname||!phone)throw new Error('First name, surname and phone number are required.');
      if(!/^\d{11}$/.test(nationalId))throw new Error('Please enter a valid 11-digit NIN.');
      if(password.length<8)throw new Error('Password must be at least 8 characters.');
      if(password!==confirm)throw new Error('Passwords do not match.');
      const fullName=[firstName,middleName,surname].filter(Boolean).join(' ');
      const {data,error}=await withTimeout(supabaseClient.auth.signUp({email,password,options:{data:{first_name:firstName,middle_name:middleName,surname,national_id:nationalId,phone,full_name:fullName},emailRedirectTo:new URL('./member.html',window.location.href).href}}),12000,'Registration request timed out. Please try again.');
      if(error)throw error;
      if(data?.session){setMessage('Account created. Opening your member portal…',true);setTimeout(()=>go('./member.html'),150);return;}
      setMessage('Registration completed. If email confirmation is enabled in Supabase, you must confirm the email before first login.',true);submitBtn.disabled=false;submitBtn.textContent='CREATE MEMBER ACCOUNT';return;
    }
    const result=await withTimeout(supabaseClient.auth.signInWithPassword({email,password}),12000,'Login request timed out. Check your internet connection and try again.');
    const {data,error}=result;
    if(error)throw error;
    if(!data?.session)throw new Error('Login succeeded but no session was returned. Please try again.');
    setMessage('Login successful. Opening your dashboard…',true);
    let destination='./member.html';
    try{
      const profileResult=await withTimeout(supabaseClient.from('profiles').select('role,status').eq('id',data.session.user.id).maybeSingle(),2000,'profile check timeout');
      if(!profileResult.error&&profileResult.data?.role==='admin'&&profileResult.data?.status==='active')destination='./admin.html';
    }catch(err){console.warn('Admin check skipped:',err);}
    setTimeout(()=>go(destination),100);
  }catch(error){
    console.error('Authentication error:',error);setMessage(error?.message||'Authentication failed. Please try again.');submitBtn.disabled=false;submitBtn.textContent=mode==='signup'?'CREATE MEMBER ACCOUNT':'LOGIN';
  }
});
