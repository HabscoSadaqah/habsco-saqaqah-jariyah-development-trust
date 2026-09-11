(function(){
'use strict';
if(location.pathname.split('/').pop()!=='member.html')return;
const URL='https://ythnoeyxovapydbmymdo.supabase.co';
const KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
function money(n){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(n||0));}
async function run(){
 if(!window.supabase?.createClient)return;
 const sb=window.supabase.createClient(URL,KEY);
 const {data:{session}}=await sb.auth.getSession();
 if(!session)return;
 const uid=session.user.id;
 let available=null,savings=null,shares=null,special=null;
 const {data:rpc,error:rpcError}=await sb.rpc('member_dashboard_balances');
 if(!rpcError&&rpc){
   available=Number(rpc.available||0); savings=Number(rpc.savings||0); shares=Number(rpc.shares||0); special=Number(rpc.special_savings||0);
 }else{
   const [w,a]=await Promise.all([
     sb.from('wallets').select('balance').eq('user_id',uid).maybeSingle(),
     sb.from('member_cooperative_accounts').select('savings_balance,shares_balance,special_savings_balance').eq('user_id',uid).maybeSingle()
   ]);
   if(w.error||a.error)return;
   available=Number(w.data?.balance||0); savings=Number(a.data?.savings_balance||0); shares=Number(a.data?.shares_balance||0); special=Number(a.data?.special_savings_balance||0);
 }
 if([available,savings,shares,special].some(v=>v===null||!Number.isFinite(v)))return;
 const cooperative=savings+shares+special,total=available+cooperative;
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=money(v);};
 set('balance',available);set('cooperativeBalance',cooperative);set('totalBalance',total);
 set('savingsBalance',savings);set('sharesBalance',shares);set('specialSavingsBalance',special);
}
function style(){if(document.getElementById('hassan-dashboard-fix-style'))return;const s=document.createElement('style');s.id='hassan-dashboard-fix-style';s.textContent=`.balance-card .amount{display:block!important;visibility:visible!important;opacity:1!important}.card-row .balance-card{visibility:visible!important;opacity:1!important}`;document.head.appendChild(s);}
function loadSecurityCenter(){
 if(document.getElementById('hfSecurityCenter'))return;
 const s=document.createElement('script');
 s.src='member-security-center.js?v=20260911-1';
 s.async=false;
 document.head.appendChild(s);
}
function start(){style();run();loadSecurityCenter();setInterval(run,15000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();