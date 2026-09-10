const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(n||0));
const $=id=>document.getElementById(id);
function msg(id,text){$(id).textContent=text;$(id).classList.add('show');}
async function loadDashboard(){
 const {data:{session},error:sessionError}=await supabaseClient.auth.getSession();
 if(sessionError||!session){window.location.href='auth.html';return;}
 const uid=session.user.id;
 const [{data:profile},{data:wallet},{data:tx},{data:funding},{data:qard}]=await Promise.all([
  supabaseClient.from('profiles').select('full_name,member_id,status,role').eq('id',uid).single(),
  supabaseClient.from('wallets').select('balance,currency').eq('user_id',uid).single(),
  supabaseClient.from('transactions').select('reference,type,amount,direction,description,status,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(20),
  supabaseClient.from('funding_requests').select('amount,payment_reference,purpose,status,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(10),
  supabaseClient.from('qard_requests').select('amount,repayment_plan,status,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(10)
 ]);
 if(profile){$('welcome').textContent=`Assalamu alaikum, ${profile.full_name||'Member'}`;$('memberMeta').textContent=`${session.user.email} · ${profile.status==='active'?'Active member':'Account pending verification'}`;$('status').textContent=(profile.status||'pending').toUpperCase();$('statusNote').textContent=profile.role==='admin'?'Administrator account':'Member account';$('memberId').textContent=profile.member_id||'—';}
 $('balance').textContent=money(wallet?.balance||0);
 const tbody=$('transactions');
 if(!tx?.length){tbody.innerHTML='<tr><td colspan="5" class="empty">No transactions have been posted yet.</td></tr>';}else{tbody.innerHTML=tx.map(t=>{const sign=t.direction==='credit'?'+':'−';const cls=t.direction==='credit'?'credit':'debit';return `<tr><td>${new Date(t.created_at).toLocaleDateString('en-NG')}</td><td>${t.reference}</td><td>${t.description||t.type}</td><td class="${cls}">${sign} ${money(t.amount)}</td><td>${t.status}</td></tr>`}).join('');}
 const fbody=$('funding');if(fbody){fbody.innerHTML=funding?.length?funding.map(r=>`<tr><td>${new Date(r.created_at).toLocaleDateString('en-NG')}</td><td>${r.payment_reference}</td><td>${money(r.amount)}</td><td>${r.purpose}</td><td>${r.status}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">No funding requests yet.</td></tr>';}
 const qbody=$('qard');if(qbody){qbody.innerHTML=qard?.length?qard.map(r=>`<tr><td>${new Date(r.created_at).toLocaleDateString('en-NG')}</td><td>${money(r.amount)}</td><td>${r.repayment_plan}</td><td>${r.status}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">No Qard Hasan requests yet.</td></tr>';}
}
$('logout').onclick=async()=>{await supabaseClient.auth.signOut();window.location.href='auth.html';};
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{if(b.dataset.action==='fund')$('fundAmount').focus();if(b.dataset.action==='qard')$('qardAmount').focus();if(b.dataset.action==='history')loadDashboard();});
$('fundingForm').addEventListener('submit',async e=>{e.preventDefault();const {data:{session}}=await supabaseClient.auth.getSession();if(!session)return;const button=e.target.querySelector('button');button.disabled=true;const {error}=await supabaseClient.from('funding_requests').insert({user_id:session.user.id,amount:Number($('fundAmount').value),paid_date:$('fundDate').value,payment_reference:$('fundRef').value.trim(),purpose:$('fundPurpose').value,note:$('fundNote').value.trim()});if(error)msg('fundMsg',error.message);else{msg('fundMsg','Funding request submitted. It will remain pending until an authorised reviewer verifies it.');e.target.reset();}button.disabled=false;});
$('qardForm').addEventListener('submit',async e=>{e.preventDefault();const {data:{session}}=await supabaseClient.auth.getSession();if(!session)return;const button=e.target.querySelector('button');button.disabled=true;const {error}=await supabaseClient.from('qard_requests').insert({user_id:session.user.id,amount:Number($('qardAmount').value),repayment_plan:$('qardPlan').value,purpose:$('qardPurpose').value.trim()});if(error)msg('qardMsg',error.message);else{msg('qardMsg','Qard Hasan request submitted for review. Submission does not mean approval or disbursement.');e.target.reset();}button.disabled=false;});
loadDashboard();