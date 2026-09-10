(function(){
'use strict';
if(location.pathname.split('/').pop()!=='member.html')return;
const URL='https://ythnoeyxovapydbmymdo.supabase.co';
const KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsP';
function money(n){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(n||0));}
function esc(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));}
async function run(){
 if(!window.supabase?.createClient)return;
 const sb=window.supabase.createClient(URL,KEY);
 const {data:{session}}=await sb.auth.getSession();
 if(!session)return;
 const uid=session.user.id;
 let balances=null;
 const rpc=await sb.rpc('member_dashboard_balances');
 if(!rpc.error&&rpc.data)balances=rpc.data;
 if(!balances){
  const [w,a]=await Promise.all([
   sb.from('wallets').select('balance').eq('user_id',uid).maybeSingle(),
   sb.from('member_cooperative_accounts').select('savings_balance,shares_balance,special_savings_balance').eq('user_id',uid).maybeSingle()
  ]);
  const available=Math.max(0,Number(w.data?.balance||0)),savings=Math.max(0,Number(a.data?.savings_balance||0)),shares=Math.max(0,Number(a.data?.shares_balance||0)),special=Math.max(0,Number(a.data?.special_savings_balance||0));
  balances={available,savings,shares,special_savings:special,cooperative:savings+shares+special,total:available+savings+shares+special};
 }
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=money(v);};
 set('balance',balances.available);set('cooperativeBalance',balances.cooperative);set('totalBalance',balances.total);set('savingsBalance',balances.savings);set('sharesBalance',balances.shares);set('specialSavingsBalance',balances.special_savings);
 const txr=await sb.from('transactions').select('reference,type,amount,direction,description,status,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(20);
 const tx=txr.data||[];window.__hassanLatestTx=tx;
 const list=document.getElementById('recentFundingList');
 if(list){
  list.classList.add('hassan-compact-transactions');
  list.innerHTML=tx.slice(0,8).map(t=>{const credit=t.direction==='credit',sign=credit?'+':'−',label=t.type==='funding'?'Wallet Funding':(t.description||t.type||'Transaction'),when=new Date(t.created_at).toLocaleDateString('en-NG',{day:'2-digit',month:'short'});return `<div class="hassan-tx-row"><div class="hassan-tx-main"><strong>${esc(label)}</strong><small>${esc(t.reference||'—')} · ${when} · ${esc(t.status||'')}</small></div><b class="${credit?'credit':'debit'}">${sign}${money(t.amount)}</b></div>`;}).join('')||'<div class="hassan-tx-empty">No recent transactions yet.</div>';
 }
 const table=document.getElementById('transactions');
 if(table&&tx.length){table.innerHTML=tx.map((t,i)=>{const credit=t.direction==='credit',sign=credit?'+':'−',cls=credit?'credit':'debit';return `<tr><td>${new Date(t.created_at).toLocaleDateString('en-NG')}</td><td>${esc(t.reference)}</td><td>${esc(t.description||t.type)}</td><td class="${cls}">${sign} ${money(t.amount)}</td><td>${esc(t.status)}</td><td><button class="receipt-btn" data-receipt="${i}">RECEIPT</button></td></tr>`;}).join('');}
}
function style(){if(document.getElementById('hassan-dashboard-fix-style'))return;const s=document.createElement('style');s.id='hassan-dashboard-fix-style';s.textContent=`.hassan-compact-transactions{display:flex!important;flex-direction:column!important;gap:4px!important}.hassan-tx-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:8px!important;min-height:36px!important;padding:6px 8px!important;border:1px solid rgba(6,69,32,.09)!important;border-radius:9px!important;background:rgba(255,255,255,.72)!important}.hassan-tx-main{min-width:0;overflow:hidden}.hassan-tx-main strong{display:block;font-size:10.5px!important;line-height:1.2!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hassan-tx-main small{display:block;font-size:8px!important;color:#718078!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}.hassan-tx-row>b{font-size:10.5px!important;white-space:nowrap}.hassan-tx-row>b.credit{color:#087443!important}.hassan-tx-row>b.debit{color:#a43d36!important}.hassan-tx-empty{font-size:10px!important;padding:8px!important;color:#718078!important}.funding-panel{padding:12px 14px!important}.funding-panel p{margin-bottom:7px!important;font-size:10px!important}.funding-panel h2{font-size:15px!important;margin-bottom:3px!important}`;document.head.appendChild(s);}
function start(){style();run();setInterval(run,15000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();