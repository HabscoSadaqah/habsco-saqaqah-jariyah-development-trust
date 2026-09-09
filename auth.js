const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);

let mode='login';
const loginTab=document.getElementById('loginTab');
const signupTab=document.getElementById('signupTab');
const form=document.getElementById('authForm');
const submitBtn=document.getElementById('submitBtn');
const message=document.getElementById('message');
const nameField=document.getElementById('nameField');
const phoneField=document.getElementById('phoneField');
const confirmField=document.getElementById('confirmField');

function setMessage(text,ok=false){message.textContent=text;message.className='message show';message.style.background=ok?'#e7f6ec':'#fdecec';message.style.color=ok?'#146b31':'#9b1c1c';}
function setMode(next){mode=next;const signup=mode==='signup';loginTab.classList.toggle('active',!signup);signupTab.classList.toggle('active',signup);nameField.classList.toggle('hidden',!signup);phoneField.classList.toggle('hidden',!signup);confirmField.classList.toggle('hidden',!signup);submitBtn.textContent=signup?'CREATE MEMBER ACCOUNT':'LOGIN';document.getElementById('password').autocomplete=signup?'new-password':'current-password';message.className='message';}
loginTab.onclick=()=>setMode('login');signupTab.onclick=()=>setMode('signup');

form.addEventListener('submit',async(e)=>{e.preventDefault();message.className='message';submitBtn.disabled=true;
 try{
  const email=document.getElementById('email').value.trim();
  const password=document.getElementById('password').value;
  if(mode==='signup'){
   const fullName=document.getElementById('fullName').value.trim();
   const phone=document.getElementById('phone').value.trim();
   const confirm=document.getElementById('confirmPassword').value;
   if(!fullName){setMessage('Please enter your full name.');return;}
   if(password!==confirm){setMessage('Passwords do not match.');return;}
   const {error}=await supabaseClient.auth.signUp({email,password,options:{data:{full_name:fullName,phone},emailRedirectTo:new URL('finance.html',window.location.href).href}});
   if(error) throw error;
   setMessage('Registration successful. Check your email if confirmation is required, then return here to log in.',true);
  }else{
   const {error}=await supabaseClient.auth.signInWithPassword({email,password});
   if(error) throw error;
   window.location.href='finance.html';
  }
 }catch(error){setMessage(error.message||'Authentication failed. Please try again.');}
 finally{submitBtn.disabled=false;}
});

supabaseClient.auth.getSession().then(({data})=>{if(data.session) window.location.href='finance.html';});
