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
 if(!rpcError&&rpc){available=Number(rpc.available||0);savings=Number(rpc.savings||0);shares=Number(rpc.shares||0);special=Number(rpc.special_savings||0);}else{const [w,a]=await Promise.all([sb.from('wallets').select('balance').eq('user_id',uid).maybeSingle(),sb.from('member_cooperative_accounts').select('savings_balance,shares_balance,special_savings_balance').eq('user_id',uid).maybeSingle()]);if(w.error||a.error)return;available=Number(w.data?.balance||0);savings=Number(a.data?.savings_balance||0);shares=Number(a.data?.shares_balance||0);special=Number(a.data?.special_savings_balance||0);}
 if([available,savings,shares,special].some(v=>v===null||!Number.isFinite(v)))return;
 const cooperative=savings+shares+special,total=available+cooperative;const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=money(v);};set('balance',available);set('cooperativeBalance',cooperative);set('totalBalance',total);set('savingsBalance',savings);set('sharesBalance',shares);set('specialSavingsBalance',special);
}
function style(){if(document.getElementById('hassan-dashboard-fix-style'))return;const s=document.createElement('style');s.id='hassan-dashboard-fix-style';s.textContent=`.balance-card .amount{display:block!important;visibility:visible!important;opacity:1!important}.card-row .balance-card{visibility:visible!important;opacity:1!important}@media(max-width:600px){.funding-panel{margin:2px 7px 14px!important;padding:9px 10px!important;border-radius:12px!important}.funding-panel h2{font-size:13px!important;margin:0 0 2px!important}.funding-panel p{font-size:8.5px!important;margin:0 0 6px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.funding-list{gap:3px!important;max-height:210px!important;overflow-y:auto!important}.funding-item{grid-template-columns:minmax(0,1fr) auto!important;gap:5px!important;padding:6px 7px!important;border-radius:8px!important;min-height:34px!important}.funding-title{font-size:9.5px!important;line-height:1.1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.funding-meta{font-size:6.8px!important;line-height:1.1!important;margin-top:1px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.funding-amount{font-size:9.5px!important;line-height:1!important;white-space:nowrap!important}.funding-empty{font-size:8px!important;padding:3px 0!important}}@media(max-width:380px){.funding-panel{padding:8px!important}.funding-item{padding:5px 6px!important}.funding-title{font-size:9px!important}.funding-meta{font-size:6.5px!important}.funding-amount{font-size:9px!important}}`;document.head.appendChild(s);}
function loadSecurityCenter(){if(document.getElementById('hfSecurityCenter'))return;const s=document.createElement('script');s.src='member-security-center.js?v=20260912-4';s.async=false;document.head.appendChild(s);}
function start(){style();run();loadSecurityCenter();setInterval(run,15000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();