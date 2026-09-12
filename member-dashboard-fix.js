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
  if(!rpcError&&rpc){available=Number(rpc.available||0);savings=Number(rpc.savings||0);shares=Number(rpc.shares||0);special=Number(rpc.special_savings||0);}
  else{
    const [w,a]=await Promise.all([sb.from('wallets').select('balance').eq('user_id',uid).maybeSingle(),sb.from('member_cooperative_accounts').select('savings_balance,shares_balance,special_savings_balance').eq('user_id',uid).maybeSingle()]);
    if(w.error||a.error)return;
    available=Number(w.data?.balance||0);savings=Number(a.data?.savings_balance||0);shares=Number(a.data?.shares_balance||0);special=Number(a.data?.special_savings_balance||0);
  }
  if([available,savings,shares,special].some(v=>v===null||!Number.isFinite(v)))return;
  const cooperative=savings+shares+special,total=available+cooperative;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=money(v);};
  set('balance',available);set('heroBalance',available);set('availableBalance',available);set('cooperativeBalance',cooperative);set('totalBalance',total);set('savingsBalance',savings);set('sharesBalance',shares);set('specialSavingsBalance',special);
  const {data:eligibility,error:eligibilityError}=await sb.rpc('member_savings_loan_eligibility');
  if(!eligibilityError&&eligibility)renderSavingsEligibility(eligibility,savings);
}
function renderSavingsEligibility(e,fallbackSavings){
  let panel=document.getElementById('hfSavingsLoanPanel');
  if(!panel){
    panel=document.createElement('section');
    panel.id='hfSavingsLoanPanel';
    panel.setAttribute('aria-label','Savings loan eligibility');
    const accountGrid=document.querySelector('.account-grid');
    if(accountGrid?.parentNode)accountGrid.parentNode.insertBefore(panel,accountGrid.nextElementSibling);
    else return;
  }
  const savings=Number(e.savings_balance??fallbackSavings??0);
  const months=Math.max(0,Math.min(6,Number(e.months_completed||0)));
  const remaining=Math.max(0,Number(e.months_remaining||0));
  const eligible=Boolean(e.eligible);
  const limit=Number(e.loan_limit||0);
  const since=e.qualifying_since?new Date(e.qualifying_since):null;
  const sinceText=since&&!Number.isNaN(since.getTime())?since.toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}):'Not started';
  const progress=Math.round((months/6)*100);
  panel.innerHTML=`<div class="hf-savings-head"><div><div class="hf-savings-eyebrow">SAVINGS → BORROWING POWER</div><h3>Build your savings history</h3><p>${eligible?'Your 6-month requirement is complete. Your Borrow Loan option is now available.':'Maintain your Savings Account for 6 consecutive months without a debit to unlock borrowing.'}</p></div><div class="hf-savings-badge ${eligible?'ready':'locked'}">${eligible?'UNLOCKED':'LOCKED'}</div></div><div class="hf-savings-stats"><div><span>Current savings</span><strong>${money(savings)}</strong></div><div><span>Qualification</span><strong>${months}/6 months</strong></div><div><span>${eligible?'Available loan':'Potential loan limit'}</span><strong>${eligible?money(limit):'Up to '+money(savings*2)}</strong></div></div><div class="hf-savings-progress"><div class="hf-savings-progress-top"><span>${eligible?'Loan eligibility unlocked':'6-month savings requirement'}</span><b>${progress}%</b></div><div class="hf-savings-track"><i style="width:${progress}%"></i></div><div class="hf-savings-months"><span>Started: ${sinceText}</span><span>${eligible?'Ready to apply':'Months remaining: '+remaining}</span></div></div><div class="hf-savings-action">${eligible?`<a class="hf-borrow-btn" href="member-actions.html?action=request-loan">Borrow Loan · Up to ${money(limit)}</a>`:`<button class="hf-borrow-btn locked" type="button" disabled>🔒 Borrow Loan · Unlocks after 6 months</button>`}</div><div class="hf-savings-note">Loan application limit is up to 2× your current Savings balance. Any completed Savings debit resets the 6-month qualification period.</div>`;
}
function removeBottomNav(){document.querySelectorAll('#mobileAppNav,nav#mobileAppNav').forEach(el=>el.remove());}
function style(){
  if(document.getElementById('hassan-dashboard-fix-style'))return;
  const s=document.createElement('style');s.id='hassan-dashboard-fix-style';s.textContent=`#mobileAppNav,nav#mobileAppNav{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;max-height:0!important;overflow:hidden!important;pointer-events:none!important}.footer-note{display:none!important}.wrap{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}.app-card{display:grid!important;grid-template-rows:auto auto 1fr auto;align-content:start;gap:0;min-width:0;overflow:hidden}.app-icon{width:38px!important;height:38px!important;min-width:38px!important;min-height:38px!important;flex:0 0 38px!important;margin:0 0 10px!important;display:grid!important;place-items:center!important;border-radius:12px!important;line-height:1!important;font-size:0!important}.app-card strong{display:block;font-size:11px!important;line-height:1.25!important;font-weight:800!important;letter-spacing:-.1px!important;overflow-wrap:anywhere}.app-card span{display:block;margin-top:4px!important;line-height:1.35!important;font-size:10px!important}.account-card .amount,.balance-card .amount,.funding-amount,#balance,#cooperativeBalance,#totalBalance,#savingsBalance,#sharesBalance,#specialSavingsBalance{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}.account-card,.balance-card{min-width:0}.account-card .amount,.balance-card .amount{white-space:nowrap}button,.btn,a.app-card{font-family:inherit}.hf-savings-loan{background:#fff;border:1px solid #dfe9e3;border-radius:18px;padding:16px;margin-top:10px;box-shadow:0 7px 22px rgba(24,60,42,.05)}.hf-savings-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.hf-savings-eyebrow{font-size:8px;letter-spacing:.8px;font-weight:900;color:#087443}.hf-savings-head h3{margin:4px 0 4px;font-size:15px;color:#17221c}.hf-savings-head p{margin:0;color:#728079;font-size:9.5px;line-height:1.45;max-width:680px}.hf-savings-badge{flex:0 0 auto;border-radius:999px;padding:7px 9px;font-size:7.5px;font-weight:900;letter-spacing:.6px}.hf-savings-badge.locked{background:#f2f5f3;color:#75827b}.hf-savings-badge.ready{background:#e8f7ee;color:#087443}.hf-savings-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.hf-savings-stats>div{background:#f7faf8;border:1px solid #e6eee9;border-radius:12px;padding:10px}.hf-savings-stats span{display:block;font-size:7.5px;text-transform:uppercase;letter-spacing:.5px;color:#7a8780;font-weight:800}.hf-savings-stats strong{display:block;margin-top:5px;font-size:13px;color:#17221c}.hf-savings-progress{margin-top:12px}.hf-savings-progress-top,.hf-savings-months{display:flex;justify-content:space-between;gap:10px;font-size:8px;color:#728079}.hf-savings-progress-top b{color:#087443}.hf-savings-track{height:7px;background:#e8efeb;border-radius:999px;overflow:hidden;margin-top:6px}.hf-savings-track i{display:block;height:100%;background:linear-gradient(90deg,#087443,#0a8a52);border-radius:999px}.hf-savings-months{margin-top:6px;font-size:7.5px}.hf-savings-action{margin-top:13px}.hf-borrow-btn{display:flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;border:0;border-radius:11px;background:#087443;color:#fff;padding:11px 13px;font-size:9.5px;font-weight:900;cursor:pointer}.hf-borrow-btn.locked{background:#edf1ee;color:#87938d;cursor:not-allowed}.hf-savings-note{margin-top:9px;color:#8a9690;font-size:7.5px;line-height:1.4}@media(max-width:600px){.app-card{padding:12px!important}.app-icon{width:36px!important;height:36px!important;min-width:36px!important;min-height:36px!important;flex-basis:36px!important}.app-card strong{font-size:10.5px!important}.app-card span{font-size:9.5px!important}.account-card .amount,.balance-card .amount{font-size:18px!important}.hf-savings-loan{padding:13px;border-radius:15px}.hf-savings-head{gap:8px}.hf-savings-head h3{font-size:13px}.hf-savings-head p{font-size:8.5px}.hf-savings-stats{gap:6px}.hf-savings-stats>div{padding:8px}.hf-savings-stats strong{font-size:11px}.hf-savings-action{margin-top:11px}.hf-borrow-btn{font-size:8.5px;padding:10px}.hf-savings-note{font-size:7px}}`;
  document.head.appendChild(s);
  document.querySelectorAll('.footer-note').forEach(el=>el.remove());
}
function removeBottomNav(){document.querySelectorAll('#mobileAppNav,nav#mobileAppNav').forEach(el=>el.remove());}
function loadSecurityCenter(){if(document.getElementById('hfSecurityCenter'))return;const s=document.createElement('script');s.src='member-security-center.js?v=20260912-4';s.async=false;document.head.appendChild(s);}
function start(){style();removeBottomNav();new MutationObserver(removeBottomNav).observe(document.documentElement,{childList:true,subtree:true});run();loadSecurityCenter();setInterval(run,15000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();