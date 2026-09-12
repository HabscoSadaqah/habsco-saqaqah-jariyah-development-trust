(()=>{
'use strict';
const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(n||0));
let tries=0;
async function run(){
 try{
  if(!window.supabase?.createClient){if(tries++<40)return setTimeout(run,500);return;}
  const sb=window.supabase.createClient(SUPABASE_URL,KEY);
  const {data:sessionData}=await sb.auth.getSession();
  if(!sessionData?.session){if(tries++<40)return setTimeout(run,500);return;}
  const {data,error}=await sb.rpc('admin_dashboard_finance_stats');
  if(error||!data){if(tries++<40)return setTimeout(run,750);console.error('Admin finance stats error',error);return;}
  const stats=document.querySelector('#app > .stats');
  if(!stats){if(tries++<40)return setTimeout(run,500);return;}
  stats.innerHTML=`<div class="card"><small>ACTIVE MEMBERS</small><div class="stat">${Number(data.active_members||0)}</div></div><div class="card"><small>MEMBER WALLET FUNDS</small><div class="stat">${money(data.member_wallet_funds)}</div></div><div class="card"><small>COOPERATIVE BALANCE</small><div class="stat">${money(data.cooperative_balance)}</div></div><div class="card"><small>PENDING APPROVALS</small><div class="stat">${Number(data.pending_approvals||0)}</div></div>`;
 }catch(e){if(tries++<40)return setTimeout(run,750);console.error('Admin stats failure',e);}
}
run();
setTimeout(run,2500);
setTimeout(run,5000);
})();
