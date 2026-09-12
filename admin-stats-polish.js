(()=>{
'use strict';
const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(n||0));
async function run(){
 if(!window.supabase?.createClient)return setTimeout(run,400);
 const sb=window.supabase.createClient(SUPABASE_URL,KEY);
 const {data,error}=await sb.rpc('admin_dashboard_finance_stats');
 if(error||!data){console.error('Admin finance stats error',error);return;}
 const app=document.getElementById('app');
 if(!app)return;
 const stats=app.querySelector(':scope > .stats');
 if(!stats)return;
 stats.innerHTML=`<div class="card"><small>ACTIVE MEMBERS</small><div class="stat">${Number(data.active_members||0)}</div></div><div class="card"><small>MEMBER WALLET FUNDS</small><div class="stat">${money(data.member_wallet_funds)}</div></div><div class="card"><small>COOPERATIVE BALANCE</small><div class="stat">${money(data.cooperative_balance)}</div></div><div class="card"><small>PENDING APPROVALS</small><div class="stat">${Number(data.pending_approvals||0)}</div></div>`;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,250),{once:true});else setTimeout(run,250);
})();
