(()=>{
  const SB_URL="https://ythnoeyxovapydbmymdo.supabase.co";
  const SB_KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN";
  const sb=window.supabase?.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const esc=v=>String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));
  const run=async()=>{
    const table=document.getElementById("membersTable"); if(!table||!sb)return;
    table.innerHTML='<tr><td colspan="12">Loading…</td></tr>';
    try{
      const {data:sessionData}=await sb.auth.getSession();
      if(!sessionData?.session) throw new Error("Session expired. Please sign in again.");
      let {data,error}=await sb.rpc("admin_list_members");
      if(error) throw error;
      const rows=(data||[]).filter(x=>x?.id);
      table.innerHTML=rows.length?rows.map(m=>`<tr><td>${esc(m.full_name||"Unnamed member")}</td><td><strong>${esc(m.member_id||"NOT ISSUED")}</strong></td><td>${esc(m.status||"pending")}</td><td>${esc(m.role||"member")}</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td><button class="member-detail-btn" type="button" data-member-detail="${esc(m.id)}" aria-expanded="false">VIEW DETAILS</button></td><td><button class="member-delete-btn" type="button" data-delete-member="${esc(m.id)}">DELETE ACCOUNT</button></td></tr>`).join(""):'<tr><td colspan="12">No members found.</td></tr>';
      const count=document.getElementById("membersCount"); if(count)count.textContent=rows.filter(x=>x.status==="active").length;
      window.habscoMembers=rows;
      document.dispatchEvent(new CustomEvent("habsco:members-loaded",{detail:rows}));
    }catch(e){
      console.error("Live members loader:",e);
      table.innerHTML=`<tr><td colspan="12"><strong>Unable to load members.</strong><br><small>${esc(e?.message||"Please refresh.")}</small></td></tr>`;
    }
  };
  window.habscoLoadMembersLive=run;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(run,250),{once:true});else setTimeout(run,250);
})();
