(()=>{
'use strict';
const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(n||0));
async function run(){
 if(!window.supabase?.createClient)return setTimeout(run,400);
 const sb=window.supabase.createClient(SUPABASE_URL,KEY);
 const [p,w,f,q,r,c]=await Promise.all([
  sb.from('profiles').select('id,status,role'),
  sb.from('wallets').select('user_id,balance'),
  sb.from('funding_requests').select('id').eq('status','pending'),
  sb.from('qard_requests').select('id').eq('status','pending'),
  sb.from('qard_repayment_requests').select('id').eq('status','pending'),
  sb.from('cooperative_wallets').select('balance,currency')
 ]);
 const active=(p.data||[]).filter(x=>x.status==='active');
 const activeIds=new Set(active.map(x=>x.id));
 const walletFunds=(w.data||[]).filter(x=>activeIds.has(x.user_id)).reduce((s,x)=>s+Number(x.balance||0),0);
 const coop=(c.data||[]).reduce((s,x)=>s+Number(x.balance||0),0);
 const pending=(f.data||[]).length+(q.data||[]).length+(r.data||[]).length;
 const app=document.getElementById('app');
 if(!app)return;
 const stats=app.querySelector(':scope > .stats');
 if(!stats)return;
 stats.innerHTML=`<div class="card"><small>ACTIVE MEMBERS</small><div class="stat">${active.length}</div></div><div class="card"><small>MEMBER WALLET FUNDS</small><div class="stat">${money(walletFunds)}</div></div><div class="card"><small>COOPERATIVE BALANCE</small><div class="stat">${money(coop)}</div></div><div class="card"><small>PENDING APPROVALS</small><div class="stat">${pending}</div></div>`;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,250),{once:true});else setTimeout(run,250);
})();
