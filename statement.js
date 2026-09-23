window.habscoStatementBooted=true;
const SUPABASE_URL="https://ythnoeyxovapydbmymdo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zuns";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const sessionPromise=window.habscoSessionPromise||(window.habscoSessionPromise=supabaseClient.auth.getSession());
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",minimumFractionDigits:2}).format(Number(n||0));
const escapeHtml=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));

let allRows=[],expanded=false;
function inRange(date,from,to){
  const d=new Date(date);
  return (!from||d>=new Date(from+"T00:00:00"))&&(!to||d<=new Date(to+"T23:59:59.999"));
}
function render(){
  const list=$("statementRows"),more=$("loadMore");
  if(!list)return;
  const from=$("fromDate")?.value||"",to=$("toDate")?.value||"";
  const rows=allRows.filter(x=>inRange(x.created_at,from,to));
  const visible=expanded?rows:rows.slice(0,5);
  if(!visible.length){
    list.innerHTML='<div class="funding-empty">No transactions yet.</div>';
    if(more)more.hidden=true;
    return;
  }
  if(more){more.hidden=rows.length<=5;more.textContent=expanded?"Show Recent 5":"View More";}
  list.innerHTML=visible.map(x=>{
    const amount=Math.abs(Number(x.amount||0));
    const credit="credit"===String(x.direction||"").toLowerCase();
    const status=String(x.status||"approved").replace(/_/g," ");
    const title=x.type?String(x.type).replace(/_/g," "):"Transaction";
    const desc=String(x.description||"").trim();
    const ref=String(x.reference||"—");
    const date=x.created_at?new Date(x.created_at).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}):"—";
    const before=Number(x._before||0),after=Number(x._after||0);
    return '<div class="funding-item"><div class="activity-icon" aria-hidden="true">'+(credit?"↓":"↑")+'</div><div class="activity-main"><div class="activity-line-one"><span class="funding-title">'+escapeHtml(title.charAt(0).toUpperCase()+title.slice(1))+'</span><span class="activity-date">'+escapeHtml(date)+'</span></div><div class="funding-meta">'+escapeHtml(desc||"No description")+" · "+escapeHtml(ref)+" · "+escapeHtml(status)+'</div><div class="activity-balance"><span>Before <strong>'+money(before)+'</strong></span><span>After <strong>'+money(after)+'</strong></span></div></div><div class="activity-side"><div class="funding-amount '+(credit?"credit":"debit")+'">'+(credit?"+":"−")+" "+money(amount)+'</div><div class="activity-receipt-row"><button type="button" class="activity-view-receipt" data-i="'+visible.indexOf(x)+'">View</button></div></div></div>';
  }).join("");
  list.querySelectorAll(".activity-view-receipt").forEach((b,i)=>b.onclick=()=>shareReceipt(visible[i]));
}
function makePdf(t){
  const lines=["HABSCO TRANSACTION RECEIPT","Habsco Sadaqah Jariyah Development Trust","Date: "+new Date(t.created_at).toLocaleString("en-NG"),"Reference: "+(t.reference||"—"),"Description: "+String(t.description||t.type||"Transaction"),"Amount: "+(String(t.direction||"").toLowerCase()==="credit"?"+ ":"− ")+money(Math.abs(Number(t.amount||0))),"Status: "+(t.status||"approved")];
  const safe=v=>String(v).replace(/[^\x20-\x7E]/g,"?").replace(/[()\\]/g,"\\$&");
  let stream="BT /F1 12 Tf 50 760 Td 14 TL ";
  lines.forEach((line,i)=>{stream+="/F1 "+(i===0?15:i===1?11:10)+" Tf 0 -"+(i===0?20:16)+" Td ("+safe(line.slice(0,105))+") Tj "});
  stream+="ET";
  const objs=["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>","<< /Length "+stream.length+" >>\nstream\n"+stream+"\nendstream"];
  let pdf="%PDF-1.4\n",off=[0];objs.forEach((o,i)=>{off[i+1]=pdf.length;pdf+=(i+1)+" 0 obj\n"+o+"\nendobj\n"});const x=pdf.length;pdf+="xref\n0 6\n0000000000 65535 f \n";for(let i=1;i<6;i++)pdf+=String(off[i]).padStart(10,"0")+" 00000 n \n";pdf+="trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"+x+"\n%%EOF";return new Blob([pdf],{type:"application/pdf"});
}
async function shareReceipt(t){
  const blob=makePdf(t),name="Habsco-Receipt-"+String(t.reference||"transaction").replace(/[^a-z0-9_-]/gi,"-")+".pdf",file=new File([blob],name,{type:"application/pdf"});
  if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:"Habsco Transaction Receipt",files:[file]});return}catch(e){if(e?.name==="AbortError")return}}
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function load(){
  const list=$("statementRows");
  if(!list)return;
  list.innerHTML='<div class="funding-empty">Loading recent activity…</div>';
  try{
    const {data:{session},error}=await sessionPromise;
    if(error)throw error;
    if(!session?.user){list.innerHTML='<div class="funding-empty">Please sign in to view your transaction history.</div>';return;}
    const [txRes,walletRes]=await Promise.all([
      supabaseClient.from("transactions").select("reference,type,amount,direction,description,status,created_at").eq("user_id",session.user.id).order("created_at",{ascending:false}).limit(100),
      supabaseClient.from("wallets").select("balance").eq("user_id",session.user.id).maybeSingle()
    ]);
    if(txRes.error||walletRes.error)throw txRes.error||walletRes.error;
    const rows=(txRes.data||[]).filter(x=>Number.isFinite(Number(x.amount)));
    let running=Number(walletRes.data?.balance||0);
    allRows=rows.map(x=>{
      const amount=Math.abs(Number(x.amount||0)),credit="credit"===String(x.direction||"").toLowerCase(),after=running,before=credit?after-amount:after+amount;
      running=before;
      return {...x,_before:before,_after:after};
    });
    expanded=false;render();
  }catch(e){
    console.error("Statement load failed:",e);
    list.innerHTML='<div class="funding-empty">Unable to load recent activity.</div>';
  }
}
function init(){
  const apply=$("apply"),more=$("loadMore"),from=$("fromDate"),to=$("toDate"),print=$("printBtn");
  apply&&(apply.onclick=()=>{expanded=false;render()});
  more&&(more.onclick=()=>{expanded=!expanded;render()});
  from&&from.addEventListener("change",()=>{expanded=false;render()});
  to&&to.addEventListener("change",()=>{expanded=false;render()});
  print&&(print.onclick=()=>window.print());
  load();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
