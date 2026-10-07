/* HABSCO Admin User Device Management */
(function(){
"use strict";
const S=()=>window.supabaseClient;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=v=>{if(!v)return"—";try{return new Date(v).toLocaleString("en-NG",{dateStyle:"medium",timeStyle:"short"})}catch(e){return String(v)}};
async function load(){
 const table=document.getElementById("memberDevicesTable"),summary=document.getElementById("deviceSecuritySummary");
 if(!table||!S())return;
 table.innerHTML='<tr><td colspan="8">Loading devices…</td></tr>';
 try{
  const d=await S().from("member_devices").select("*").order("last_seen_at",{ascending:false});
  if(d.error)throw d.error;
  const devices=d.data||[],ids=[...new Set(devices.map(x=>x.user_id).filter(Boolean))];
  let profiles=[];
  if(ids.length){const p=await S().from("profiles").select("id,full_name,member_id").in("id",ids);if(p.error)throw p.error;profiles=p.data||[]}
  const pm=new Map(profiles.map(x=>[x.id,x]));
  const q=await S().from("member_device_requests").select("*").order("requested_at",{ascending:false});
  if(q.error)throw q.error;
  const qm=new Map();(q.data||[]).forEach(x=>{if(!qm.has(x.device_id))qm.set(x.device_id,x)});
  const n=s=>devices.filter(x=>x.status===s).length;
  if(summary)summary.innerHTML=["pending","approved","blocked"].map(s=>'<div class="card" style="padding:10px"><small>'+s.toUpperCase()+'</small><div class="stat" style="font-size:20px">'+n(s)+'</div></div>').join("");
  if(!devices.length){table.innerHTML='<tr><td colspan="8">No registered member devices yet.</td></tr>';return}
  table.innerHTML=devices.map(x=>{
   const p=pm.get(x.user_id)||{},r=qm.get(x.id),label=[x.device_label,x.platform,x.browser].filter(Boolean).join(" · ")||"Unknown device",st=x.status||"pending";
   const buttons=st==="pending"?'<button class="btn" data-device-action="approve" data-device-id="'+esc(x.id)+'">APPROVE</button><button class="btn red" data-device-action="block" data-device-id="'+esc(x.id)+'">BLOCK</button>':st==="approved"?'<button class="btn red" data-device-action="block" data-device-id="'+esc(x.id)+'">REVOKE / BLOCK</button>':'<button class="btn" data-device-action="approve" data-device-id="'+esc(x.id)+'">UNBLOCK / APPROVE</button>';
   return '<tr><td>'+esc(p.full_name||"Unnamed member")+'</td><td>'+esc(p.member_id||"NOT ISSUED")+'</td><td>'+esc(label)+'</td><td>'+esc(st.toUpperCase())+'</td><td>'+fmt(x.first_seen_at)+'</td><td>'+fmt(x.last_seen_at)+'</td><td>'+esc(r?.status||"—")+'</td><td>'+buttons+'</td></tr>';
  }).join("");
 }catch(e){table.innerHTML='<tr><td colspan="8">Unable to load devices: '+esc(e.message||e)+'</td></tr>'}
}
async function action(id,a,b){
 b.disabled=true;
 try{
  const u=await S().auth.getUser(),uid=u?.data?.user?.id;if(!uid)throw Error("Administrator session not found.");
  const now=new Date().toISOString();
  const patch=a==="approve"?{status:"approved",approved_at:now,approved_by:uid,blocked_at:null,blocked_by:null}:{status:"blocked",blocked_at:now,blocked_by:uid};
  let x=await S().from("member_devices").update(patch).eq("id",id);if(x.error)throw x.error;
  x=await S().from("member_device_requests").update(a==="approve"?{status:"approved",reviewed_at:now,reviewed_by:uid}:{status:"rejected",reviewed_at:now,reviewed_by:uid}).eq("device_id",id).eq("status","pending");if(x.error)throw x.error;
  await load();
 }catch(e){alert(e.message||"Unable to update device.")}finally{b.disabled=false}
}
function init(){
 const p=document.getElementById("user-device-management");if(!p)return;
 document.getElementById("refreshDeviceManagement")?.addEventListener("click",load);
 document.getElementById("memberDevicesTable")?.addEventListener("click",e=>{const b=e.target.closest("[data-device-action]");if(!b)return;if(confirm(b.dataset.deviceAction==="approve"?"Approve this device?":"Block/revoke this device?"))action(b.dataset.deviceId,b.dataset.deviceAction,b)});
 load();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();