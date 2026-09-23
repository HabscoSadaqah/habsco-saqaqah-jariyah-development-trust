window.habscoStatementBooted=true;
const SUPABASE_URL="https://ythnoeyxovapydbmymdo.supabase.co",SUPABASE_PUBLISHABLE_KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zuns",supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY),sessionPromise=window.habscoSessionPromise||(window.habscoSessionPromise=supabaseClient.auth.getSession()),$=id=>document.getElementById(id),moneyFormat=new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",minimumFractionDigits:2}),money=n=>moneyFormat.format(Number(n||0)),esc=v=>String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));let rowsAll=[],loading=!1,pageSize=5,pageIndex=0,expanded=!1;
function statusOf(t){return String(t.status||"posted").toLowerCase().replace(/[- ]/g,"_")}
function directionOf(t){const d=String(t.direction||"").toLowerCase();return d==="credit"||d==="inflow"||d==="in"?"credit":"debit"}
function signedAmount(t){const s=statusOf(t);if(["rejected","declined","failed","cancelled","canceled"].includes(s))return 0;const n=Math.abs(Number(t.amount||0));return directionOf(t)==="credit"?n:-n}
function utilityDestination(t){const m=t.metadata||{},type=String(m.service||m.utility_service||"").toLowerCase(),provider=m.provider||m.network||m.disco||m.distribution_company||"",receiver=m.receiver||m.phone||m.phone_number||m.meter_number||m.account_number||"",pkg=m.package||m.variation_code||m.code||"";if(!type&&!provider&&!receiver)return"";const label={airtime:"Airtime",data:"Mobile Data",tv:"Cable TV",education:"Education",power:"Electricity",electricity:"Electricity"}[type]||"Utility";return[label,provider,((type==="power"||type==="electricity")?"Meter ":"")+receiver,pkg].filter(Boolean).join(" · ")}
function description(t){const raw=String(t.description||"").trim();if(raw)return raw;const type=String(t.type||"Transaction").replace(/_/g," ");if(t.type==="utility"){const u=utilityDestination(t);return u?"Utility · "+u:"Utility payment"}return type}
function makePdf(t){const lines=["HABSCO AVAILABLE TO SPEND RECEIPT","Habsco Sadaqah Jariyah Development Trust","Date: "+new Date(t.created_at).toLocaleString("en-NG"),"Reference: "+(t.reference||"—"),"Description: "+description(t),"Amount: "+(signedAmount(t)>=0?"+ ":"− ")+money(Math.abs(signedAmount(t))),"Status: "+(t.status||"posted")],e=v=>String(v??"").replace(/\\/g,"\\\\").replace(/\\(/g,"\\\\(").replace(/\\)/g,"\\\\)"),o=[],s=["BT","/F1 12 Tf","50 760 Td","14 TL"];lines.forEach((x,i)=>s.push("/F1 "+(i===0?15:i===1?11:10)+" Tf","0 -"+(i===0?20:16)+" Td","("+e(x.slice(0,105))+") Tj"));s.push("ET");const body=s.join("\n").replace(/[^\x00-\x7F]/g," ");o.push("<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>","<< /Length "+body.length+" >>\nstream\n"+body+"\nendstream");let pdf="%PDF-1.4\n",off=[0];o.forEach((x,i)=>{off[i+1]=pdf.length;pdf+=(i+1)+" 0 obj\n"+x+"\nendobj\n"});const xr=pdf.length;pdf+="xref\n0 "+(o.length+1)+"\n0000000000 65535 f \n";for(let i=1;i<=o.length;i++)pdf+=String(off[i]).padStart(10,"0")+" 00000 n \n";pdf+="trailer\n<< /Size "+(o.length+1)+" /Root 1 0 R >>\nstartxref\n"+xr+"\n%%EOF";return new Blob([pdf],{type:"application/pdf"})}
async function shareReceipt(t){const blob=makePdf(t),name="Habsco-Receipt-"+String(t.reference||"transaction").replace(/[^a-z0-9_-]/gi,"-")+".pdf",file=new File([blob],name,{type:"application/pdf"});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({title:"Habsco Transaction Receipt",files:[file]});return}catch(e){if(e?.name==="AbortError")return}}const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function inRange(d,from,to){const x=new Date(d);return(!from||x>=new Date(from+"T00:00:00"))&&(!to||x<=new Date(to+"T23:59:59.999"))}
function render(){
  const from=$("fromDate").value,to=$("toDate").value;
  const rows=rowsAll.filter(t=>inRange(t.created_at,from,to)).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  const visible=expanded?rows:rows.slice(0,pageSize),body=$("statementRows"),more=$("loadMore");
  if(!rows.length){body.innerHTML='<div class="history-empty">No transactions yet.</div>';if(more)more.hidden=true;return}
  if(more){more.hidden=rows.length<=pageSize;more.textContent=expanded?"Show Recent 5":"View More";more.disabled=false}
  body.innerHTML=visible.map((t,i)=>{const s=signedAmount(t),credit=s>=0,date=new Date(t.created_at),status=String(t.status||"approved").replace(/_/g," "),rawTitle=t.type?String(t.type).replace(/_/g," "):"Transaction",title=rawTitle.charAt(0).toUpperCase()+rawTitle.slice(1);return '<article class="funding-item '+(credit?"credit":"debit")+'"><div class="activity-icon" aria-hidden="true">'+(credit?"↓":"↑")+'</div><div class="activity-main"><div class="activity-line-one"><span class="funding-title">'+esc(title)+'</span><span class="activity-date">'+esc(date.toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:!0}))+'</span></div><div class="funding-meta">'+esc(description(t)||"No description")+' · '+esc(t.reference||"—")+' · '+esc(status||"approved")+'</div><div class="activity-balance"><span>Before <strong>'+money(t.balance_before??0)+'</strong></span><span>After <strong>'+money(t.balance_after)+'</strong></span></div></div><div class="activity-side"><div class="funding-amount '+(credit?"credit":"debit")+'">'+(credit?"+":"−")+" "+money(Math.abs(s))+'</div><div class="activity-receipt-row"><button class="activity-view-receipt" type="button" data-i="'+i+'">View</button></div></div></article>'}).join("");
  body.querySelectorAll(".activity-view-receipt").forEach((b,i)=>b.onclick=()=>shareReceipt(visible[i]));
}
const withTimeout=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+" timed out")),ms))]);
async function restJson(path,token,options={}){
  const r=await fetch(SUPABASE_URL+path,{...options,headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+token,Accept:"application/json",...(options.headers||{})}});
  const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch(e){data=text}
  if(!r.ok)throw new Error((data&&data.message)||data?.error_description||("Supabase request failed ("+r.status+")"));
  return data;
}
async function getAuthSession(){const{data,error}=await sessionPromise;if(error)throw error;return data?.session||null}
async function getStatementRows(userId){
  const{data,error}=await supabaseClient.from("transactions").select("reference,type,amount,direction,description,status,created_at").eq("user_id",userId).order("created_at",{ascending:false}).limit(1000);
  if(error)throw error;
  const rows=Array.isArray(data)?data:[];
  const{data:wallet}=await supabaseClient.from("wallets").select("balance").eq("user_id",userId).maybeSingle();
  let running=Number(wallet?.balance||0);
  const valid=rows.filter(t=>Number.isFinite(Number(t.amount))&&!["pending","processing","rejected","declined","failed","cancelled","canceled"].includes(statusOf(t)));
  return valid.map(t=>{
    const amount=Math.abs(Number(t.amount||0)),credit=directionOf(t)==="credit",balance_after=running,balance_before=credit?balance_after-amount:balance_after+amount;
    running=balance_before;
    return {...t,account_type:"wallet",balance_before,balance_after};
  });
}
async function load(){
  if(loading)return;
  loading=true;
  const body=$("statementRows");
  try{
    if(body)body.innerHTML='<div class="history-empty">Loading transaction history…</div>';
    let session=null;
    for(let attempt=0;attempt<3&&!session;attempt++){
      try{session=await getAuthSession()}catch(e){if(attempt===2)throw e}
      if(!session?.user&&attempt<2)await new Promise(r=>setTimeout(r,700));
    }
    const user=session?.user;
    if(!user){location.href="auth.html";return}
    rowsAll=await getStatementRows(user.id);
    pageIndex=0;
    render();
  }catch(e){
    console.error("Statement load failed:",e);
    if(body)body.innerHTML='<div class="history-empty">Unable to load transaction history. Please refresh and try again.</div>';
  }finally{loading=false}
}
function initStatementPage(){if(window.habscoStatementInitialized)return;window.habscoStatementInitialized=true;const apply=$("apply"),more=$("loadMore"),from=$("fromDate"),to=$("toDate"),print=$("printBtn");if(apply)apply.onclick=()=>{pageIndex=0;expanded=false;render()};if(more)more.onclick=()=>{expanded=!expanded;render()};if(from)from.addEventListener("change",()=>{pageIndex=0;expanded=false;render()});if(to)to.addEventListener("change",()=>{pageIndex=0;expanded=false;render()});if(print)print.onclick=()=>window.print();load();setInterval(()=>{"visible"===document.visibilityState&&load()},6e4);document.addEventListener("visibilitychange",()=>{"visible"===document.visibilityState&&load()})}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initStatementPage,{once:true});else initStatementPage();
