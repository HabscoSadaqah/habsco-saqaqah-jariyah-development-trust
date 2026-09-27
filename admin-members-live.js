(()=>{
  const SB_URL="https://ythnoeyxovapydbmymdo.supabase.co";
  const SB_KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN";
  const sb=window.supabase?.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const esc=v=>String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const getTable=()=>document.getElementById("membersTable")||document.querySelector("#members tbody");
  const draw=rows=>{
    const table=getTable(); if(!table)return;
    table.innerHTML=rows.length?rows.map(m=>`<tr><td>${esc(m.full_name||"Unnamed member")}</td><td><strong>${esc(m.member_id||"NOT ISSUED")}</strong></td><td>${esc(m.status||"pending")}</td><td>${esc(m.role||"member")}</td><td>${money(m.wallet)}</td><td>${money(m.savings)}</td><td>${money(m.shares)}</td><td>${money(m.special)}</td><td><strong>${money(m.total)}</strong></td><td>${money(m.loan)}</td><td><button class="member-detail-btn" type="button" data-member-detail="${esc(m.id)}" aria-expanded="false" onclick="window.habscoToggleMemberDetails(this);event.stopPropagation()">VIEW DETAILS</button></td><td><button class="member-delete-btn" type="button" data-delete-member="${esc(m.id)}">DELETE ACCOUNT</button></td></tr>`).join(""):'<tr><td colspan="12">No members found.</td></tr>';
    const count=document.getElementById("membersCount");if(count)count.textContent=rows.filter(x=>x.status==="active").length;
    window.habscoMembers=rows;window.__habscoMembers=rows;
    document.dispatchEvent(new CustomEvent("habsco:members-loaded",{detail:rows}));
  };
  const money=n=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",minimumFractionDigits:2}).format(Number(n||0));
  const run=async()=>{
    const table=getTable();if(!table||!sb)return false;
    let lastError=null;
    for(let attempt=1;attempt<=6;attempt++){
      try{
        const {data:sessionData,error:sessionError}=await sb.auth.getSession();
        if(sessionError)throw sessionError;
        if(!sessionData?.session){lastError=new Error("Administrator session is not ready.");await sleep(500);continue;}
        let data,error;
        ({data,error}=await sb.rpc("admin_list_members"));
        if(error){
          const fallback=await sb.from("profiles").select("id,full_name,member_id,status,role,savings_withdrawal_enabled,created_at").or("role.eq.member,member_id.not.is.null").order("created_at",{ascending:false});
          data=fallback.data;error=fallback.error;
        }
        if(error)throw error;
        const rows=(data||[]).filter(x=>x?.id);
        const [balRes,loanRes]=await Promise.all([sb.rpc("admin_list_member_balances"),sb.from("qard_requests").select("user_id,amount,status").in("status",["approved","disbursed"]) ]);
        const balances=Object.fromEntries((balRes.data||[]).map(x=>[x.user_id,{wallet:Number(x.wallet_balance||0),savings:Number(x.savings_balance||0),shares:Number(x.shares_balance||0),special:Number(x.special_savings_balance||0),total:Number(x.total_balance||0)}]));
        const loans=Object.fromEntries((loanRes.data||[]).map(x=>[x.user_id,Number(x.amount||0)]));
        rows.forEach(m=>{const b=balances[m.id]||{wallet:0,savings:0,shares:0,special:0,total:0};m.wallet=b.wallet;m.savings=b.savings;m.shares=b.shares;m.special=b.special;m.total=b.total;m.loan=loans[m.id]||0});

    const activeMembers=rows.filter(x=>String(x.status||"").toLowerCase()==="active");
    const optionHtml='<option value="">Select member</option>'+activeMembers.map(m=>'<option value="'+esc(m.id)+'">'+esc(m.full_name||"Unnamed member")+' · '+esc(m.member_id||"No ID")+'</option>').join("");
    ["walletUser","memberIdUser"].forEach(id=>{
      const select=document.getElementById(id);
      if(select){
        const current=select.value;
        select.innerHTML=optionHtml;
        if(current && activeMembers.some(m=>m.id===current))select.value=current;
      }
    });
        draw(rows);return true;
      }catch(e){lastError=e;await sleep(400+attempt*250);}
    }
    console.error("Live members loader:",lastError);
    table.innerHTML=`<tr><td colspan="12"><strong>Unable to load members.</strong><br><small>${esc(lastError?.message||"Please refresh.")}</small></td></tr>`;
    return false;
  };
  window.habscoLoadMembersLive=run;
  const bindViewDetails=()=>{if(document.body.dataset.habscoViewDetailsBound==="1")return;document.body.dataset.habscoViewDetailsBound="1";document.addEventListener("click",e=>{const button=e.target.closest?.(".member-detail-btn[data-member-detail]");if(!button)return;e.preventDefault();e.stopPropagation();if(typeof window.habscoToggleMemberDetails==="function")window.habscoToggleMemberDetails(button)},true)};
  bindViewDetails();
  const start=()=>{bindViewDetails();setTimeout(run,900);setInterval(()=>{const t=getTable();if(t&&(t.textContent.includes("Loading")||t.textContent.includes("Unable to load")))run()},2500)};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
