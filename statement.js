const SUPABASE_URL="https://ythnoeyxovapydbmymdo.supabase.co",SUPABASE_PUBLISHABLE_KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN",$=id=>document.getElementById(id),moneyFormat=new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",minimumFractionDigits:2}),money=n=>moneyFormat.format(Number(n||0)),esc=v=>String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));let db=null,rowsAll=[],loading=!1,pageSize=20,pageIndex=0;
function statusOf(t){return String(t.status||"posted").toLowerCase().replace(/[- ]/g,"_")}
function directionOf(t){const d=String(t.direction||"").toLowerCase();return d==="credit"||d==="inflow"||d==="in"?"credit":"debit"}
function signedAmount(t){const s=statusOf(t);if(["rejected","declined","failed","cancelled","canceled"].includes(s))return 0;const n=Math.abs(Number(t.amount||0));return directionOf(t)==="credit"?n:-n}
function utilityDestination(t){const m=t.metadata||{},type=String(m.service||m.utility_service||"").toLowerCase(),provider=m.provider||m.network||m.disco||m.distribution_company||"",receiver=m.receiver||m.phone||m.phone_number||m.meter_number||m.account_number||"",pkg=m.package||m.variation_code||m.code||"";if(!type&&!provider&&!receiver)return"";const label={airtime:"Airtime",data:"Mobile Data",tv:"Cable TV",education:"Education",power:"Electricity",electricity:"Electricity"}[type]||"Utility";return[label,provider,((type==="power"||type==="electricity")?"Meter ":"")+receiver,pkg].filter(Boolean).join(" · ")}
function description(t){if(t.type==="utility"){const u=utilityDestination(t);return u?"Utility · "+u:(t.description||"Utility payment")}return t.description||String(t.type||"Transaction").replace(/_/g," ")}
function makePdf(t){const lines=["HABSCO AVAILABLE TO SPEND RECEIPT","Habsco Sadaqah Jariyah Development Trust","Date: "+new Date(t.created_at).toLocaleString("en-NG"),"Reference: "+(t.reference||"—"),"Description: "+description(t),"Amount: "+(signedAmount(t)>=0?"+ ":"− ")+money(Math.abs(signedAmount(t))),"Balance: "+money(t.balance_after),"Status: "+(t.status||"posted")],e=v=>String(v??"").replace(/\\/g,"\\\\").replace(/\\(/g,"\\\\(").replace(/\\)/g,"\\\\)"),o=[],s=["BT","/F1 12 Tf","50 760 Td","14 TL"];lines.forEach((x,i)=>s.push("/F1 "+(i===0?15:i===1?11:10)+" Tf","0 -"+(i===0?20:16)+" Td","("+e(x.slice(0,105))+") Tj"));s.push("ET");const body=s.join("\n").replace(/[^\x00-\x7F]/g," ");o.push("<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>","<< /Length "+body.length+" >>\nstream\n"+body+"\nendstream");let pdf="%PDF-1.4\n",off=[0];o.forEach((x,i)=>{off[i+1]=pdf.length;pdf+=(i+1)+" 0 obj\n"+x+"\nendobj\n"});const xr=pdf.length;pdf+="xref\n0 "+(o.length+1)+"\n0000000000 65535 f \n";for(let i=1;i<=o.length;i++)pdf+=String(off[i]).padStart(10,"0")+" 00000 n \n";pdf+="trailer\n<< /Size "+(o.length+1)+" /Root 1 0 R >>\nstartxref\n"+xr+"\n%%EOF";return new Blob([pdf],{type:"application/pdf"})}
async function shareReceipt(t){const blob=makePdf(t),name="Habsco-Receipt-"+String(t.reference||"transaction").replace(/[^a-z0-9_-]/gi,"-")+".pdf",file=new File([blob],name,{type:"application/pdf"});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({title:"Habsco Transaction Receipt",files:[file]});return}catch(e){if(e?.name==="AbortError")return}}const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function inRange(d,from,to){const x=new Date(d);return(!from||x>=new Date(from+"T00:00:00"))&&(!to||x<=new Date(to+"T23:59:59.999"))}
function render(){const from=$("fromDate").value,to=$("toDate").value,rows=rowsAll.filter(t=>inRange(t.created_at,from,to)).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)),start=pageIndex*pageSize,visible=rows.slice(start,start+pageSize),body=$("statementRows"),more=$("loadMore");if(!rows.length){body.innerHTML='<tr><td colspan="7" class="empty">No Available to Spend transactions yet.</td></tr>';if(more)more.hidden=true;return}if(start>=rows.length){pageIndex=Math.max(0,Math.ceil(rows.length/pageSize)-1);return render()}if(more){more.hidden=rows.length<=pageSize;more.textContent=(start+pageSize<rows.length)?"NEXT 20 →":"";more.disabled=start+pageSize>=rows.length}body.innerHTML=visible.map((t,i)=>{const s=signedAmount(t),cls=s>=0?"credit":"debit";return '<tr><td>'+new Date(t.created_at).toLocaleString("en-NG")+'</td><td>'+esc(t.reference||"—")+'</td><td>'+esc(description(t))+'</td><td class="'+cls+'">'+(s>=0?"+":"−")+" "+money(Math.abs(s))+'</td><td>'+money(t.balance_after)+'</td><td>'+esc(t.status||"posted")+'</td><td><button class="receipt-btn" type="button" data-i="'+i+'">SHARE RECEIPT</button></td></tr>'}).join("");body.querySelectorAll(".receipt-btn").forEach((b,i)=>b.onclick=()=>shareReceipt(visible[i]))}
const withTimeout=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+" timed out")),ms))]);
async function getStatementRows(userId){
  let rpc;
  try{rpc=await withTimeout(db.rpc("member_available_statement_data",{p_limit:1000}),10000,"Statement service");}catch(e){rpc={error:e}}
  if(!rpc.error){
    const list=Array.isArray(rpc.data?.transactions)?rpc.data.transactions:(Array.isArray(rpc.data)?rpc.data:[]);
    if(list.length||rpc.data?.balance!==undefined)return list;
  }
  const direct=await withTimeout(db.from("transactions").select("id,reference,type,amount,status,description,metadata,created_at,direction").eq("user_id",userId).order("created_at",{ascending:false}).limit(1000),10000,"Transaction history");
  if(direct.error)throw direct.error;
  return Array.isArray(direct.data)?direct.data:[];
}
async function ensureDb(){
  if(db)return db;
  if(window.supabase?.createClient){db=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);return db}
  for(let i=0;i<30;i++){
    await new Promise(r=>setTimeout(r,200));
    if(window.supabase?.createClient){db=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);return db}
  }
  throw new Error("Supabase library did not load");
}
async function load(){
  if(loading)return;
  loading=true;
  const body=$("statementRows");
  try{await ensureDb();
  if(body)body.innerHTML='<tr><td colspan="7" class="empty">Loading statement…</td></tr>';
    let user=null;
    const sessionResult=await withTimeout(db.auth.getSession(),8000,"Authentication");
    user=sessionResult?.data?.session?.user||null;
    if(!user){
      const userResult=await withTimeout(db.auth.getUser(),8000,"Authentication");
      if(userResult.error)throw userResult.error;
      user=userResult.data.user;
    }
    if(!user){location.href="auth.html";return}
    rowsAll=await getStatementRows(user.id);
    $("memberInfo").textContent="Your transaction history is shown here independently from the dashboard recent activity.";
    pageIndex=0;
    render();
  }catch(e){
    console.error("Statement load failed:",e);
    if(body)body.innerHTML='<tr><td colspan="7" class="empty">Unable to load transaction history. Please refresh and try again.</td></tr>';
  }finally{loading=false}
}
function initStatementPage(){const apply=$("apply"),more=$("loadMore"),from=$("fromDate"),to=$("toDate");if(apply)apply.onclick=()=>{pageIndex=0;render()};if(more)more.onclick=()=>{pageIndex++;render()};if(from)from.addEventListener("change",()=>{pageIndex=0;render()});if(to)to.addEventListener("change",()=>{pageIndex=0;render()});load();setInterval(()=>{"visible"===document.visibilityState&&load()},6e4);document.addEventListener("visibilitychange",()=>{"visible"===document.visibilityState&&load()})}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initStatementPage,{once:true});else initStatementPage();
