(()=>{
'use strict';
if(location.pathname.split('/').pop()!=='member.html')return;
const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const SUPABASE_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(n||0));
async function init(){
  if(document.getElementById('hfSavingsLoanPanel'))return;
  if(!window.supabase?.createClient)return;
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const {data:{session}}=await sb.auth.getSession();
  if(!session)return;
  let savings=0;
  try{
    const {data}=await sb.rpc('member_dashboard_balances');
    savings=Number(data?.savings||0);
  }catch(_){
    try{const {data}=await sb.from('member_cooperative_accounts').select('savings_balance').eq('user_id',session.user.id).maybeSingle();savings=Number(data?.savings_balance||0)}catch(__){}
  }
  let e={eligible:false,savings_balance:savings,loan_limit:savings*2,months_completed:0,months_remaining:6,qualifying_since:null};
  try{const {data}=await sb.rpc('member_savings_loan_eligibility');if(data)e={...e,...data}}catch(_){}
  render(e);
}
function render(e){
  if(document.getElementById('hfSavingsLoanPanel'))return;
  const panel=document.createElement('section');panel.id='hfSavingsLoanPanel';panel.setAttribute('aria-label','Savings borrowing eligibility');
  const savings=Number(e.savings_balance||0), months=Math.max(0,Math.min(6,Number(e.months_completed||0))), remaining=Math.max(0,Number(e.months_remaining??(6-months))), eligible=Boolean(e.eligible), limit=Number(e.loan_limit||savings*2), progress=Math.round(months/6*100);
  const since=e.qualifying_since?new Date(e.qualifying_since):null;const sinceText=since&&!Number.isNaN(since.getTime())?since.toLocaleDateString('en-NG',{day:'2-digit',month:'short',year:'numeric'}):'Not started';
  panel.innerHTML=`<div class="sbl-head"><div><div class="sbl-eyebrow">SAVINGS → BORROWING POWER</div><h2>Build your savings history</h2><p>${eligible?'Your 6-month requirement is complete. You can now apply for an Interest-Free Loan.':'Maintain your Savings Account for 6 consecutive months without a debit to unlock borrowing.'}</p></div><span class="sbl-badge ${eligible?'ready':'locked'}">${eligible?'UNLOCKED':'LOCKED'}</span></div><div class="sbl-stats"><div><small>Current savings</small><strong>${money(savings)}</strong></div><div><small>Qualification</small><strong>${months}/6 months</strong></div><div><small>${eligible?'Available loan':'Potential loan limit'}</small><strong>${eligible?money(limit):'Up to '+money(savings*2)}</strong></div></div><div class="sbl-progress"><div><span>6-month savings requirement</span><b>${progress}%</b></div><i><em style="width:${progress}%"></em></i><small><span>Started: ${sinceText}</span><span>${eligible?'Ready to apply':'Months remaining: '+remaining}</span></small></div><div class="sbl-action">${eligible?`<a href="member-actions.html?action=request-loan">Borrow Loan · Up to ${money(limit)}</a>`:`<button type="button" disabled>🔒 Borrow Loan · Unlocks after 6 months</button>`}</div><div class="sbl-note">Loan application limit is up to 2× your current Savings balance. Any completed Savings debit resets the 6-month qualification period.</div>`;
  const grid=document.querySelector('.account-grid');if(grid?.parentNode)grid.parentNode.insertBefore(panel,grid.nextElementSibling);else document.querySelector('.wrap')?.appendChild(panel);
  const style=document.createElement('style');style.id='savings-borrowing-style';style.textContent=`#hfSavingsLoanPanel{margin:12px 0 0;background:#fff;border:1px solid #dfe9e3;border-radius:18px;padding:16px;box-shadow:0 7px 22px rgba(24,60,42,.06);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}.sbl-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.sbl-eyebrow{font-size:8px;letter-spacing:.9px;font-weight:900;color:#087443}.sbl-head h2{margin:4px 0;font-size:16px;color:#17221c}.sbl-head p{margin:0;max-width:720px;color:#728079;font-size:10px;line-height:1.45}.sbl-badge{flex:none;border-radius:999px;padding:7px 10px;font-size:7px;font-weight:900;letter-spacing:.6px}.sbl-badge.locked{background:#f0f3f1;color:#77837d}.sbl-badge.ready{background:#e8f7ee;color:#087443}.sbl-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.sbl-stats>div{background:#f7faf8;border:1px solid #e6eee9;border-radius:12px;padding:10px}.sbl-stats small{display:block;color:#7a8780;text-transform:uppercase;font-size:7px;letter-spacing:.5px;font-weight:800}.sbl-stats strong{display:block;margin-top:5px;color:#17221c;font-size:13px}.sbl-progress{margin-top:12px}.sbl-progress>div,.sbl-progress>small{display:flex;justify-content:space-between;gap:10px;color:#728079;font-size:8px}.sbl-progress b{color:#087443}.sbl-progress i{display:block;height:7px;background:#e8efeb;border-radius:99px;overflow:hidden;margin-top:6px}.sbl-progress em{display:block;height:100%;background:#087443;border-radius:99px}.sbl-progress small{margin-top:6px;font-size:7.5px}.sbl-action{margin-top:13px}.sbl-action a,.sbl-action button{display:flex;width:100%;align-items:center;justify-content:center;text-align:center;border:0;border-radius:11px;padding:11px 13px;background:#087443;color:#fff;text-decoration:none;font-size:9.5px;font-weight:900;box-sizing:border-box}.sbl-action button{background:#edf1ee;color:#87938d;cursor:not-allowed}.sbl-note{margin-top:9px;color:#8a9690;font-size:7.5px;line-height:1.4}@media(max-width:600px){#hfSavingsLoanPanel{padding:13px;border-radius:15px}.sbl-head h2{font-size:13px}.sbl-head p{font-size:8.5px}.sbl-stats{gap:6px}.sbl-stats>div{padding:8px}.sbl-stats strong{font-size:11px}.sbl-action a,.sbl-action button{font-size:8.5px;padding:10px}.sbl-note{font-size:7px}}`;
  document.head.appendChild(style);
  const loanLink=document.querySelector('.loan-card a');if(loanLink){if(eligible){loanLink.href='member-actions.html?action=request-loan';loanLink.textContent='Borrow Loan · Up to '+money(limit);loanLink.style.pointerEvents='auto';loanLink.style.opacity='1'}else{loanLink.removeAttribute('href');loanLink.textContent='🔒 Locked · Save for 6 months';loanLink.style.pointerEvents='none';loanLink.style.opacity='.58'}}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250),{once:true});else setTimeout(init,250);
})();
