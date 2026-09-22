window.habscoStatementBooted=true;
const SUPABASE_URL="https://ythnoeyxovapydbmymdo.supabase.co",SUPABASE_PUBLISHABLE_KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN",$=id=>document.getElementById(id),moneyFormat=new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",minimumFractionDigits:2}),money=n=>moneyFormat.format(Number(n||0)),esc=v=>String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));let db=null,rowsAll=[],loading=!1,pageSize=5,pageIndex=0,expanded=!1;
function statusOf(t){return String(t.status||"posted").toLowerCase().replace(/[- ]/g,"_")}
function directionOf(t){const d=String(t.direction||"").toLowerCase();return d==="credit"||d==="inflow"||d==="in"?"credit":"debit"}
function signedAmount(t){const s=statusOf(t);if(["rejected","declined","failed","cancelled","canceled"].includes(s))return 0;const n=Math.abs(Number(t.amount||0));return directionOf(t)==="credit"?n:-n}
function utilityDestination(t){const m=t.metadata||{},type=String(m.service||m.utility_service||"").toLowerCase(),provider=m.provider||m.network||m.disco||m.distribution_company||"",receiver=m.receiver||m.phone||m.phone_number||m.meter_number||m.account_number||"",pkg=m.package||m.variation_code||m.code||"";if(!type&&!provider&&!receiver)return"";const label={airtime:"Airtime",data:"Mobile Data",tv:"Cable TV",education:"Education",power:"Electricity",electricity:"Electricity"}[type]||"Utility";return[label,provider,((type==="power"||type==="electricity")?"Meter ":"")+receiver,pkg].filter(Boolean).join(" · ")}
function description(t){const raw=String(t.description||"").trim();if(raw)return raw;const type=String(t.type||"Transaction").replace(/_/g," ");if(t.type==="utility"){const u=utilityDestination(t);return u?"Utility · "+u:"Utility payment"}return type}
function makePdf(t){const lines=["HABSCO AVAILABLE TO SPEND RECEIPT","Habsco Sadaqah Jariyah Development Trust","Date: "+new Date(t.created_at).toLocaleString("en-NG"),"Reference: "+(t.reference||"—"),"Description: "+description(t),"Amount: "+(signedAmount(t)>=0?"+ ":"− ")+money(Math.abs(signedAmount(t))),"Balance: "+money(t.balance_after),"Status: "+(t.status||"posted")],e=v=>String(v??"").replace(/\\/g,"\\\\").replace(/\\(/g,"\\\\(").replace(/\\)/g,"\\\\)"),o=[],s=["BT","/F1 12 Tf","50 760 Td","14 TL"];lines.forEach((x,i)=>s.push("/F1 "+(i===0?15:i===1?11:10)+" Tf","0 -"+(i===0?20:16)+" Td","("+e(x.slice(0,105))+") Tj"));s.push("ET");const body=s.join("\n").replace(/[^\x00-\x7F]/g," ");o.push("<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>","<< /Length "+body.length+" >>\nstream\n"+body+"\nendstream");let pdf="%PDF-1.4\n",off=[0];o.forEach((x,i)=>{off[i+1]=pdf.length;pdf+=(i+1)+" 0 obj\n"+x+"\nendobj\n"});const xr=pdf.length;pdf+="xref\n0 "+(o.length+1)+"\n0000000000 65535 f \n";for(let i=1;i<=o.length;i++)pdf+=String(off[i]).padStart(10,"0")+" 00000 n \n";pdf+="trailer\n<< /Size "+(o.length+1)+" /Root 1 0 R >>\nstartxref\n"+xr+"\n%%EOF";return new Blob([pdf],{type:"application/pdf"})}
async function shareReceipt(t){const blob=makePdf(t),name="Habsco-Receipt-"+String(t.reference||"transaction").replace(/[^a-z0-9_-]/gi,"-")+".pdf",file=new File([blob],name,{type:"application/pdf"});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({title:"Habsco Transaction Receipt",files:[file]});return}catch(e){if(e?.name==="AbortError")return}}const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function inRange(d,from,to){const x=new Date(d);return(!from||x>=new Date(from+"T00:00:00"))&&(!to||x<=new Date(to+"T23:59:59.999"))}
function render(){
  const from=$("fromDate").value,to=$("toDate").value;
  const rows=rowsAll.filter(t=>inRange(t.created_at,from,to)).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  const visible=expanded?rows:rows.slice(0,pageSize),body=$("statementRows"),more=$("loadMore");
  if(!rows.length){body.innerHTML='<div class="history-empty">No transactions yet.</div>';if(more)more.hidden=true;return}
  if(more){more.hidden=rows.length<=pageSize;more.textContent=expanded?"Show Recent 5":"View More";more.disabled=false}
  body.innerHTML=visible.map((t,i)=>{const s=signedAmount(t),credit=s>=0,date=new Date(t.created_at),status=String(t.status||"posted").replace(/_/g," ");return '<article class="history-item '+(credit?"history-credit":"history-debit")+'"><div class="history-icon">'+(credit?"↓":"↑")+'</div><div class="history-main"><div class="history-title">'+esc(description(t))+'</div><div class="history-ref">'+esc(t.reference||"—")+'</div></div><div class="history-amount">'+(credit?"+":"−")+" "+money(Math.abs(s))+'</div><div class="history-meta"><span>'+date.toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:!0})+'</span><span class="history-balance">Balance '+money(t.balance_after)+'</span></div><div class="history-meta"><span class="history-status">'+esc(status)+'</span><span>Available to Spend</span></div><div class="history-actions"><button class="history-receipt" type="button" data-i="'+i+'">Share Receipt</button></div></article>'}).join("");
  body.querySelectorAll(".history-receipt").forEach((b,i)=>b.onclick=()=>shareReceipt(visible[i]));
}
const withTimeout=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+" timed out")),ms))]);
async function restJson(path,token,options={}){
  const r=await fetch(SUPABASE_URL+path,{...options,headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+token,Accept:"application/json",...(options.headers||{})}});
  const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch(e){data=text}
  if(!r.ok)throw new Error((data&&data.message)||data?.error_description||("Supabase request failed ("+r.status+")"));
  return data;
}
async function getAuthSession(){
  await ensureDb();
  const {data,error}=await withTimeout(db.auth.getSession(),8000,"Authentication");
  if(error)throw error;
  if(data?.session)return data.session;
  const {data:userData,error:userError}=await withTimeout(db.auth.getUser(),8000,"Authentication");
  if(userError)throw userError;
  return userData?.user?{user:userData.user}:null;
}
async function getStatementRowsRest(userId,token){
  const rpc=await restJson("/rest/v1/rpc/member_available_statement_data",token,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({p_limit:1000})});
  const list=Array.isArray(rpc?.transactions)?rpc.transactions:(Array.isArray(rpc)?rpc:[]);
  if(list.length||rpc?.balance!==undefined)return list;
  const uid=encodeURIComponent(userId);
  const tx=await restJson("/rest/v1/transactions?select=id,reference,type,amount,status,description,metadata,created_at,direction&user_id=eq."+uid+"&order=created_at.desc&limit=1000",token);
  return Array.isArray(tx)?tx:[];
}
async function getStatementRows(userId){
  const session=await getAuthSession();
  if(!session?.user)throw new Error("No authenticated member session");
  const [tx,wallet]=await Promise.all([
    withTimeout(db.from("transactions").select("id,reference,type,amount,status,description,metadata,created_at,direction").eq("user_id",userId).order("created_at",{ascending:false}).limit(1000),"Transaction history"),
    withTimeout(db.from("wallets").select("balance").eq("user_id",userId).maybeSingle(),"Available balance")
  ]);
  if(tx.error)throw tx.error;
  if(wallet.error)throw wallet.error;
  const valid=(tx.data||[]).filter(t=>!["pending","processing","rejected","declined","failed","cancelled","canceled"].includes(statusOf(t)));
  let running=Number(wallet.data?.balance||0);
  return valid.map(t=>{
    const amount=Math.abs(Number(t.amount||0));
    const credit=directionOf(t)==="credit";
    const balance_after=running;
    running=credit?running-amount:running+amount;
    return {...t,account_type:"wallet",balance_after};
  });
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
  try{
    if(body)body.innerHTML='<div class="history-empty">Loading transaction history…</div>';
    const session=await getAuthSession();
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
function initStatementPage(){const apply=$("apply"),more=$("loadMore"),from=$("fromDate"),to=$("toDate"),print=$("printBtn");if(apply)apply.onclick=()=>{pageIndex=0;render()};if(more)more.onclick=()=>{expanded=!expanded;render()};if(from)from.addEventListener("change",()=>{pageIndex=0;render()});if(to)to.addEventListener("change",()=>{pageIndex=0;render()});if(print)print.onclick=()=>window.print();load();setInterval(()=>{"visible"===document.visibilityState&&load()},6e4);document.addEventListener("visibilitychange",()=>{"visible"===document.visibilityState&&load()})}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initStatementPage,{once:true});else initStatementPage();
