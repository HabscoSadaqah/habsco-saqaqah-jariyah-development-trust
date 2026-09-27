(()=>{
  "use strict";
  const URL="https://ythnoeyxovapydbmymdo.supabase.co";
  const KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN";
  const sb=window.supabase?.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));
  const money=n=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",minimumFractionDigits:2}).format(Number(n||0));
  const msg=(id,text)=>{const e=$(id);if(e){e.textContent=text;e.classList.add("show")}};
  const clearMsg=id=>{const e=$(id);if(e){e.textContent="";e.classList.remove("show")}};

  let members=[];
  let balances={};
  let loans={};

  function memberOptions(){
    const active=members.filter(m=>String(m.status).toLowerCase()==="active");
    return '<option value="">Select member to fund / debit</option>'+active.map(m=>`<option value="${esc(m.id)}">${esc(m.full_name||"Unnamed member")} · ${esc(m.member_id||"No ID")}</option>`).join("");
  }

  function paintDropdowns(){
    const html=memberOptions();
    ["walletUser","memberIdUser"].forEach(id=>{const e=$(id);if(e){const v=e.value;e.innerHTML=html;if(v)e.value=v;}});
  }

  async function loadMembers(){
    if(!sb)return;
    const table=$("membersTable");
    try{
      const {data,error}=await sb.rpc("admin_list_members");
      if(error)throw error;
      members=(data||[]).filter(x=>x?.id).map(x=>({id:x.id,full_name:x.full_name||"Unnamed member",member_id:x.member_id||null,status:x.status||"pending",role:x.role||"member",savings_withdrawal_enabled:x.savings_withdrawal_enabled}));
      const [bRes,lRes]=await Promise.all([sb.rpc("admin_list_member_balances"),sb.from("qard_requests").select("user_id,amount,status").in("status",["approved","disbursed"])]);
      if(!bRes.error)balances=Object.fromEntries((bRes.data||[]).map(x=>[x.user_id,{wallet:Number(x.wallet_balance||0),savings:Number(x.savings_balance||0),shares:Number(x.shares_balance||0),special:Number(x.special_savings_balance||0),total:Number(x.total_balance||0)}]));
      if(!lRes.error)loans=Object.fromEntries((lRes.data||[]).map(x=>[x.user_id,Number(x.amount||0)]));
      members.forEach(m=>{const b=balances[m.id]||{};m.wallet=b.wallet||0;m.savings=b.savings||0;m.shares=b.shares||0;m.special=b.special||0;m.total=b.total||0;m.loan=loans[m.id]||0});
      window.habscoMembers=members;window.__habscoMembers=members;
      paintDropdowns();
      renderTable();
    }catch(e){
      console.error("HABSCO member loader",e);
      if(table)table.innerHTML='<tr><td colspan="12"><strong>Unable to load members.</strong><br><small>'+esc(e?.message||"Please refresh.")+'</small></td></tr>';
    }
  }

  function renderTable(){
    const table=$("membersTable");if(!table)return;
    table.innerHTML=members.length?members.map(m=>`<tr><td>${esc(m.full_name)}</td><td><strong>${esc(m.member_id||"NOT ISSUED")}</strong></td><td>${esc(m.status)}</td><td>${esc(m.role)}</td><td>${money(m.wallet)}</td><td>${money(m.savings)}</td><td>${money(m.shares)}</td><td>${money(m.special)}</td><td><strong>${money(m.total)}</strong></td><td>${money(m.loan)}</td><td><button class="member-detail-btn" type="button" data-member-detail="${esc(m.id)}">VIEW DETAILS</button></td><td><button class="member-delete-btn" type="button" data-delete-member="${esc(m.id)}">DELETE ACCOUNT</button></td></tr>`).join(""):'<tr><td colspan="12">No members found.</td></tr>';
    const c=$("membersCount");if(c)c.textContent=members.filter(m=>m.status==="active").length;
  }

  window.habscoToggleMemberDetails=function(button){
    if(!button)return;
    const id=button.dataset.memberDetail;
    const row=button.closest("tr");
    if(!id||!row)return;
    const old=row.nextElementSibling;
    if(old?.classList.contains("member-detail-row")){old.remove();button.textContent="VIEW DETAILS";button.setAttribute("aria-expanded","false");return;}
    const m=members.find(x=>x.id===id)||window.__habscoMembers?.find?.(x=>x.id===id);
    if(!m){msg("globalMsg","Member details could not be found. Refresh the Members list.");return;}
    const detail=document.createElement("tr");detail.className="member-detail-row";
    const access=m.status==="active";
    detail.innerHTML=`<td colspan="12"><div class="member-detail-grid"><div class="member-detail-item"><small>Member</small><strong>${esc(m.full_name)}</strong></div><div class="member-detail-item"><small>Member ID</small><strong>${esc(m.member_id||"NOT ISSUED")}</strong></div><div class="member-detail-item"><small>Status</small><strong>${esc(m.status)}</strong></div><div class="member-detail-item"><small>Role</small><strong>${esc(m.role)}</strong></div><div class="member-detail-item"><small>Wallet</small><strong>${money(m.wallet)}</strong></div><div class="member-detail-item"><small>Savings</small><strong>${money(m.savings)}</strong></div><div class="member-detail-item"><small>Shares</small><strong>${money(m.shares)}</strong></div><div class="member-detail-item"><small>Special Savings</small><strong>${money(m.special)}</strong></div><div class="member-detail-item"><small>Total Balance</small><strong>${money(m.total)}</strong></div><div class="member-detail-item"><small>Loan</small><strong>${money(m.loan)}</strong></div><div class="member-detail-item"><small>Registration</small><strong>${access?"ACTIVE":"PENDING"}</strong></div><div class="member-detail-item"><small>Transaction</small><strong>${access?"AVAILABLE":"RESTRICTED"}</strong></div></div></td>`;
    row.after(detail);button.textContent="HIDE DETAILS";button.setAttribute("aria-expanded","true");
  };

  async function postWallet(){
    const form=$("walletForm");if(!form||!sb)return;
    clearMsg("walletMsg");
    const user=$("walletUser")?.value,action=$("walletAction")?.value||"credit",target=$("walletTargetAccount")?.value||"wallet",amount=Number($("walletAmount")?.value),description=$("walletDescription")?.value==="Other"?$("walletCustomDescription")?.value?.trim():$("walletDescription")?.value;
    if(!user)return msg("walletMsg","Select an active member first.");
    if(!Number.isFinite(amount)||amount<=0)return msg("walletMsg","Enter a valid amount greater than zero.");
    if(!description)return msg("walletMsg","Select a reason / description.");
    const button=form.querySelector('button[type="submit"]');if(button){button.disabled=true;button.textContent=action==="credit"?"CREDITING…":"DEBITING…";}
    try{
      let result,error;
      if(action==="credit"){
        if(target==="wallet"){
          ({data:result,error}=await sb.rpc("admin_credit_wallet",{p_user_id:user,p_amount:amount,p_type:"funding",p_description:description}));
        }else{
          const date=$("walletPaymentDate")?.value||new Date().toISOString().slice(0,10);
          const bank=$("walletPaidToBank")?.value||null;
          ({data:result,error}=await sb.rpc("admin_credit_account",{p_user_id:user,p_account_type:target,p_amount:amount,p_transaction_date:date,p_paid_to_bank:bank,p_description:description}));
        }
      }else{
        if(target==="wallet"){
          ({data:result,error}=await sb.rpc("admin_debit_wallet",{p_user_id:user,p_amount:amount,p_type:"withdrawal",p_description:description}));
        }else{
          ({data:result,error}=await sb.rpc("admin_post_cooperative_account",{p_user_id:user,p_account_type:target,p_action:"debit",p_amount:amount,p_description:description}));
        }
      }
      if(error)throw new Error(error.message||"Account operation failed.");
      msg("walletMsg",`${action==="credit"?"Account credited":"Account debited"} successfully${result?.reference?" · Reference "+result.reference:""}${result?.balance!=null?" · New balance "+money(result.balance):""}`);
      if($("walletAmount"))$("walletAmount").value="";
      await loadMembers();
    }catch(e){msg("walletMsg",e?.message||"Account operation failed.");}
    finally{if(button){button.disabled=false;button.textContent="POST WALLET ENTRY";}}
  }

  function bind(){
    document.addEventListener("click",e=>{const b=e.target.closest?.(".member-detail-btn[data-member-detail]");if(b){e.preventDefault();e.stopPropagation();window.habscoToggleMemberDetails(b);}},true);
    const form=$("walletForm");if(form&&!form.dataset.habscoFixed){form.dataset.habscoFixed="1";form.addEventListener("submit",e=>{e.preventDefault();postWallet();},true);}
  }

  function start(){bind();setTimeout(loadMembers,300);setInterval(()=>{if($("walletUser")&&members.length===0)loadMembers();},4000);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();