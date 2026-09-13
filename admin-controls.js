(()=>{
'use strict';
const FEATURES=[
 ['wallet_enabled','Wallet','Member wallet access'],
 ['savings_enabled','Savings','Cooperative savings access'],
 ['shares_enabled','Shares','Shares account access'],
 ['special_savings_enabled','Special savings','Special savings access'],
 ['payments_enabled','Payments','Airtime, data, TV and electricity'],
 ['transfers_enabled','Transfers','Member-to-member transfers'],
 ['interest_free_loan_enabled','Interest-free loan','Loan request access'],
 ['funding_requests_enabled','Funding requests','Add-money/funding submissions'],
 ['statements_enabled','Statements','Account statement access'],
 ['member_profile_enabled','Member profile','Profile access']
];
const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));
const wait=()=>{if(document.getElementById('hfAdminContent')&&document.getElementById('hfAdminNav')&&window.habscoAdminOperation)build();else setTimeout(wait,120)};
function build(){
 if(document.getElementById('hfAdminSecurityControls'))return;
 const view=document.querySelector('.hf-admin-view[data-view="security"]');
 if(!view)return setTimeout(wait,150);
 const card=document.createElement('div');card.className='hf-admin-card';card.id='hfAdminSecurityControls';
 card.innerHTML=`<div class="hf-admin-section-head"><div><strong>Member access & security controls</strong><small>Server-protected administrator controls</small></div><span class="hf-badge">SECURE GATEWAY</span></div>
 <div class="hf-admin-grid2">
  <div class="hf-admin-card" style="box-shadow:none;padding:12px;background:#f8fbf9">
   <div class="hf-admin-section-head"><strong>Member feature access</strong><span id="hfFeatureStatus" class="hf-badge">Loading…</span></div>
   <select id="hfFeatureMember" style="width:100%;padding:10px;border:1px solid #d5ded9;border-radius:10px;background:#fff;font:inherit"></select>
   <div id="hfFeatureList" class="hf-admin-switches" style="margin-top:9px"></div>
  </div>
  <div class="hf-admin-card" style="box-shadow:none;padding:12px;background:#f8fbf9">
   <div class="hf-admin-section-head"><strong>Transaction PIN reset</strong><span class="hf-badge warn">FORCES CHANGE</span></div>
   <p class="notice">Set a temporary 6-digit PIN for an active member. The member will be required to change it after signing in.</p>
   <select id="hfPinMember" style="width:100%;padding:10px;border:1px solid #d5ded9;border-radius:10px;background:#fff;font:inherit"></select>
   <input id="hfPinValue" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="Temporary 6-digit PIN" style="width:100%;margin-top:8px;padding:10px;border:1px solid #d5ded9;border-radius:10px;font:inherit">
   <button id="hfPinReset" class="btn" style="margin-top:8px;width:100%">RESET TRANSACTION PIN</button>
   <div id="hfPinMsg" class="msg" style="margin-top:8px"></div>
  </div>
 </div>
 <div class="hf-admin-grid2" style="margin-top:12px">
  <div class="hf-admin-card" style="box-shadow:none;padding:12px;background:#f8fbf9">
   <div class="hf-admin-section-head"><strong>Utility API mode</strong><span id="hfUtilityStatus" class="hf-badge">Loading…</span></div>
   <p class="notice">Controls the server-side utility provider mode. This does not expose provider credentials to members.</p>
   <select id="hfUtilityMode" style="width:100%;padding:10px;border:1px solid #d5ded9;border-radius:10px;background:#fff;font:inherit"><option value="merchant">Merchant</option><option value="super_merchant">Super merchant</option></select>
   <button id="hfUtilitySave" class="btn" style="margin-top:8px;width:100%">SAVE API MODE</button>
  </div>
  <div class="hf-admin-card" style="box-shadow:none;padding:12px;background:#f8fbf9">
   <div class="hf-admin-section-head"><strong>Finance health</strong><span id="hfStatsStatus" class="hf-badge">Loading…</span></div>
   <div class="hf-admin-grid3"><div class="hf-mini"><small>Active members</small><strong id="hfStatMembers">—</strong></div><div class="hf-mini"><small>Member wallet funds</small><strong id="hfStatWallet">—</strong></div><div class="hf-mini"><small>Pending approvals</small><strong id="hfStatPending">—</strong></div></div>
   <div class="hf-mini" style="margin-top:8px"><small>Cooperative balance</small><strong id="hfStatCoop">—</strong></div>
   <button id="hfStatsRefresh" class="btn gray" style="margin-top:8px;width:100%">REFRESH FINANCE HEALTH</button>
  </div>
 </div>`;
 view.appendChild(card);
 const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(n||0));
 let rows=[];
 async function loadFeatures(){
  const status=document.getElementById('hfFeatureStatus');if(status)status.textContent='Loading…';
  try{const r=await window.habscoAdminOperation('list_member_feature_controls');rows=r?.data||[];const active=rows.filter(x=>x.status==='active');
   const opts=['<option value="">Select active member</option>',...active.map(x=>`<option value="${esc(x.user_id)}">${esc(x.full_name||'Member')} · ${esc(x.member_id||'No ID')}</option>`)].join('');
   document.getElementById('hfFeatureMember').innerHTML=opts;document.getElementById('hfPinMember').innerHTML=opts;
   if(status)status.textContent=`${active.length} active`;
  }catch(e){if(status)status.textContent='Unavailable';}
 }
 function renderFeatureMember(){
  const id=document.getElementById('hfFeatureMember').value,box=document.getElementById('hfFeatureList');if(!id){box.innerHTML='<div class="notice">Select a member to manage feature access.</div>';return}
  const m=rows.find(x=>x.user_id===id);if(!m){box.innerHTML='';return}
  box.innerHTML=FEATURES.map(([key,label,desc])=>`<label class="hf-admin-switch-row"><div><strong>${label}</strong><small>${desc}</small></div><span class="hf-switch"><input type="checkbox" data-feature="${key}" ${m[key]?'checked':''}><i class="hf-slider"></i></span></label>`).join('');
 }
 async function setFeature(input){const member=document.getElementById('hfFeatureMember').value;if(!member)return;input.disabled=true;try{await window.habscoAdminOperation('set_member_feature_control',{p_user_id:member,p_feature:input.dataset.feature,p_enabled:input.checked});const m=rows.find(x=>x.user_id===member);if(m)m[input.dataset.feature]=input.checked;document.getElementById('hfFeatureStatus').textContent='Saved';}catch(e){input.checked=!input.checked;document.getElementById('hfFeatureStatus').textContent='Save failed';alert(e?.message||'Feature update failed.');}finally{input.disabled=false}}
 async function loadUtility(){try{const r=await window.habscoAdminOperation('get_utility_api_mode');const mode=r?.data||'merchant';document.getElementById('hfUtilityMode').value=mode;document.getElementById('hfUtilityStatus').textContent=mode==='super_merchant'?'SUPER MERCHANT':'MERCHANT';}catch(e){document.getElementById('hfUtilityStatus').textContent='Unavailable'}}
 async function saveUtility(){const btn=document.getElementById('hfUtilitySave');btn.disabled=true;try{const mode=document.getElementById('hfUtilityMode').value;const r=await window.habscoAdminOperation('set_utility_api_mode',{p_mode:mode});document.getElementById('hfUtilityStatus').textContent=mode==='super_merchant'?'SUPER MERCHANT':'MERCHANT';alert(`Utility API mode saved: ${r?.data||mode}`);}catch(e){alert(e?.message||'Unable to save utility API mode.')}finally{btn.disabled=false}}
 async function resetPin(){const member=document.getElementById('hfPinMember').value,pin=document.getElementById('hfPinValue').value.trim(),msg=document.getElementById('hfPinMsg'),btn=document.getElementById('hfPinReset');msg.classList.remove('show');if(!member){msg.textContent='Select an active member.';msg.classList.add('show');return}if(!/^\d{6}$/.test(pin)){msg.textContent='PIN must contain exactly 6 digits.';msg.classList.add('show');return}if(!confirm('Reset this member transaction PIN? The member will be required to change it.'))return;btn.disabled=true;try{await window.habscoAdminOperation('set_member_transaction_pin',{p_user_id:member,p_pin:pin});msg.textContent='PIN reset successfully. Member must change it on next use.';msg.classList.add('show');document.getElementById('hfPinValue').value='';}catch(e){msg.textContent=e?.message||'Unable to reset transaction PIN.';msg.classList.add('show');}finally{btn.disabled=false}}
 async function loadStats(){try{const r=await window.habscoAdminOperation('dashboard_finance_stats'),d=r?.data||{};document.getElementById('hfStatMembers').textContent=d.active_members??0;document.getElementById('hfStatWallet').textContent=money(d.member_wallet_funds);document.getElementById('hfStatPending').textContent=d.pending_approvals??0;document.getElementById('hfStatCoop').textContent=money(d.cooperative_balance);document.getElementById('hfStatsStatus').textContent='LIVE';}catch(e){document.getElementById('hfStatsStatus').textContent='Unavailable'}}
 document.getElementById('hfFeatureMember').addEventListener('change',renderFeatureMember);
 document.getElementById('hfFeatureList').addEventListener('change',e=>{if(e.target.matches('input[data-feature]'))setFeature(e.target)});
 document.getElementById('hfPinReset').addEventListener('click',resetPin);
 document.getElementById('hfUtilitySave').addEventListener('click',saveUtility);
 document.getElementById('hfStatsRefresh').addEventListener('click',loadStats);
 loadFeatures().then(renderFeatureMember);loadUtility();loadStats();
}
wait();
})();
