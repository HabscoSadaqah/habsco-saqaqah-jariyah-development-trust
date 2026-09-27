(()=>{
  const SB_URL="https://ythnoeyxovapydbmymdo.supabase.co";
  const SB_KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN";
  const sb=window.supabase?.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const esc=v=>String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const getTable=()=>document.getElementById("membersTable")||document.querySelector("#members tbody");
  const run=async()=>{
    const table=getTable();
    if(!table||!sb)return false;
    table.innerHTML='<tr><td colspan="12">Loading…</td></tr>';
    let lastError=null;
    for(let attempt=1;attempt<=8;attempt++){
      try{
        const {data:sessionData,error:sessionError}=await sb.auth.getSession();
        if(sessionError)throw sessionError;
        if(!sessionData?.session){lastError=new Error("Administrator session is not ready.");await sleep(500);continue;}
        const {data,error}=await sb.rpc("admin_list_members");
        if(error)throw error;
        const rows=(data||[]).filter(x=>x?.id);
        table.innerHTML=rows.length?rows.map(m=>`<tr><td>${esc(m.full_name||"Unnamed member")}</td><td><strong>${esc(m.member_id||"NOT ISSUED")}</strong></td><td>${esc(m.status||"pending")}</td><td>${esc(m.role||"member")}</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td><button class="member-detail-btn" type="button" data-member-detail="${esc(m.id)}" aria-expanded="false">VIEW DETAILS</button></td><td><button class="member-delete-btn" type="button" data-delete-member="${esc(m.id)}">DELETE ACCOUNT</button></td></tr>`).join(""):'<tr><td colspan="12">No members found.</td></tr>';
        const count=document.getElementById("membersCount");if(count)count.textContent=rows.filter(x=>x.status==="active").length;
        window.habscoMembers=rows;
        window.__habscoMembers=rows;
        document.dispatchEvent(new CustomEvent("habsco:members-loaded",{detail:rows}));
        return true;
      }catch(e){lastError=e;await sleep(500+attempt*250);}
    }
    console.error("Live members loader:",lastError);
    table.innerHTML=`<tr><td colspan="12"><strong>Unable to load members.</strong><br><small>${esc(lastError?.message||"Please refresh.")}</small></td></tr>`;
    return false;
  };
  window.habscoLoadMembersLive=run;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(run,700),{once:true});else setTimeout(run,700);
})();
