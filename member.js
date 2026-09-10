const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(n||0));
const $=id=>document.getElementById(id);
async function loadDashboard(){
 const {data:{session},error}=await supabaseClient.auth.getSession();
 if(error||!session){window.location.href='auth.html';return;}
 const uid=session.user.id;
 const {data:rpc,error:rpcError}=await supabaseClient.rpc('member_dashboard_balances');
 let available,savings,shares,special;
 if(!rpcError&&rpc){
   available=Number(rpc.available||0); savings=Number(rpc.savings||0); shares=Number(rpc.shares||0); special=Number(rpc.special_savings||0);
 }else{
   const [walletRes,coopRes]=await Promise.all([
     supabaseClient.from('wallets').select('balance').eq('user_id',uid).maybeSingle(),
     supabaseClient.from('member_cooperative_accounts').select('savings_balance,shares_balance,special_savings_balance').eq('user_id',uid).maybeSingle()
   ]);
   if(walletRes.error||coopRes.error)return;
   available=Number(walletRes.data?.balance||0); savings=Number(coopRes.data?.savings_balance||0); shares=Number(coopRes.data?.shares_balance||0); special=Number(coopRes.data?.special_savings_balance||0);
 }
 if([available,savings,shares,special].some(v=>!Number.isFinite(v)))return;
 const cooperative=savings+shares+special,total=available+cooperative;
 const set=(id,v)=>{const el=$(id);if(el){el.textContent=money(v);el.style.visibility='visible';el.style.opacity='1';}};
 set('balance',available);set('cooperativeBalance',cooperative);set('totalBalance',total);set('savingsBalance',savings);set('sharesBalance',shares);set('specialSavingsBalance',special);
}
function updateDigitalClock(){const now=new Date();if($('digitalClock'))$('digitalClock').textContent=now.toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});if($('digitalDate'))$('digitalDate').textContent=now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
function addMobileAppShell(){if(document.getElementById('mobileAppNav'))return;const nav=document.createElement('nav');nav.id='mobileAppNav';nav.innerHTML='<a href="member.html" class="active">⌂<span>Home</span></a><a href="member-actions.html?action=send">💸<span>Pay</span></a><a href="statement.html">📋<span>Statements</span></a><a href="#profile">👤<span>Profile</span></a>';document.body.appendChild(nav);}
function goAction(action){window.location.href=`member-actions.html?action=${encodeURIComponent(action)}`;}
let refreshTimer;function startLiveRefresh(){clearInterval(refreshTimer);refreshTimer=setInterval(()=>{if(document.visibilityState==='visible')loadDashboard()},15000);}
if($('logout'))$('logout').onclick=async()=>{await supabaseClient.auth.signOut();window.location.href='auth.html'};
addMobileAppShell();updateDigitalClock();setInterval(updateDigitalClock,1000);loadDashboard();startLiveRefresh();