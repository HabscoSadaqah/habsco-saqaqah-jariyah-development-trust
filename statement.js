window.habscoStatementBooted=true;
const SUPABASE_URL="https://ythnoeyxovapydbmymdo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zuns";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
async function getStatementSession(){
  try{
    const first=await supabaseClient.auth.getSession();
    if(first?.data?.session)return first;
    if(first?.error)throw first.error;
  }catch(e){console.warn("Statement getSession:",e)}
  try{
    const refreshed=await supabaseClient.auth.refreshSession();
    if(refreshed?.data?.session)return refreshed;
  }catch(e){console.warn("Statement refreshSession:",e)}
  return {data:{session:null},error:null};
}
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
  list.querySelectorAll(".activity-view-receipt").forEach((b,i)=>b.onclick=()=>showReceipt(visible[i]));
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
function closeReceipt(){document.getElementById("statementReceipt")?.remove()}
function showReceipt(t){
  closeReceipt();
  const amount=Math.abs(Number(t.amount||0));
  const credit="credit"===String(t.direction||"").toLowerCase();
  const date=t.created_at?new Date(t.created_at).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}):"—";
  const wrap=document.createElement("div");
  wrap.id="statementReceipt";
  wrap.innerHTML='<div class="statement-receipt-backdrop"></div><section class="statement-receipt-sheet" role="dialog" aria-modal="true" aria-label="Transaction receipt"><button type="button" class="statement-receipt-close" aria-label="Close">×</button><div class="statement-receipt-head"><strong>HABSCO</strong><span>TRANSACTION RECEIPT</span></div><div class="statement-receipt-body"><div class="statement-receipt-line"><span>Date</span><b>'+escapeHtml(date)+'</b></div><div class="statement-receipt-line"><span>Reference</span><b>'+escapeHtml(t.reference||"—")+'</b></div><div class="statement-receipt-line"><span>Description</span><b>'+escapeHtml(t.description||t.type||"Transaction")+'</b></div><div class="statement-receipt-amount '+(credit?"credit":"debit")+'">'+(credit?"+":"−")+" "+money(amount)+'</div><div class="statement-receipt-status">'+escapeHtml(String(t.status||"approved").replace(/_/g," "))+'</div></div><div class="statement-receipt-actions"><button type="button" class="statement-receipt-share">Send PDF</button></div></section>';
  document.body.appendChild(wrap);
  wrap.querySelector(".statement-receipt-close").onclick=closeReceipt;
  wrap.querySelector(".statement-receipt-backdrop").onclick=closeReceipt;
  wrap.querySelector(".statement-receipt-share").onclick=()=>shareReceipt(t);
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
    let session=null;
    for(let attempt=0;attempt<3&&!session;attempt++){
      try{
        const res=await supabaseClient.auth.getSession();
        if(res?.error)throw res.error;
        session=res?.data?.session||null;
      }catch(e){console.warn("Statement session attempt",attempt+1,e)}
      if(!session&&attempt<2)await new Promise(r=>setTimeout(r,700));
    }
    if(!session?.user){
      list.innerHTML='<div class="funding-empty">Please sign in to view your transaction history.</div>';
      return;
    }

    const txRes=await supabaseClient
      .from("transactions")
      .select("reference,type,amount,direction,description,status,created_at")
      .eq("user_id",session.user.id)
      .order("created_at",{ascending:false})
      .limit(100);

    if(txRes.error){
      console.error("Statement transactions query failed:",txRes.error);
      list.innerHTML='<div class="funding-empty">Unable to load recent activity.</div>';
      return;
    }

    const rows=(txRes.data||[]).filter(x=>Number.isFinite(Number(x.amount)));

    let running=0;
    try{
      const walletRes=await supabaseClient
        .from("wallets")
        .select("balance")
        .eq("user_id",session.user.id)
        .maybeSingle();
      if(!walletRes.error)running=Number(walletRes.data?.balance||0);
    }catch(e){console.warn("Statement wallet query failed:",e)}

    allRows=rows.map(x=>{
      const amount=Math.abs(Number(x.amount||0));
      const credit="credit"===String(x.direction||"").toLowerCase();
      const after=running;
      const before=credit?after-amount:after+amount;
      running=before;
      return {...x,_before:before,_after:after};
    });

    expanded=false;
    render();
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

(function addReceiptStyle(){
  if(document.getElementById("statement-receipt-style"))return;
  const s=document.createElement("style");s.id="statement-receipt-style";s.textContent=".statement-receipt-backdrop{position:fixed;inset:0;background:rgba(20,45,34,.38);z-index:200}.statement-receipt-sheet{position:fixed;z-index:201;left:50%;top:50%;transform:translate(-50%,-50%);width:min(390px,calc(100vw - 24px));background:#fff;border:1px solid #dce9e1;border-radius:18px;padding:18px;box-shadow:0 14px 40px rgba(0,0,0,.16);color:#17221c}.statement-receipt-close{position:absolute;right:10px;top:9px;width:30px;height:30px;border:0;border-radius:50%;background:#f1f6f3;color:#52635b;font-size:20px;line-height:1}.statement-receipt-head{display:flex;flex-direction:column;gap:2px;padding-right:35px;border-bottom:1px solid #edf1ee;padding-bottom:12px}.statement-receipt-head strong{font-size:16px;color:#087443}.statement-receipt-head span{font-size:8px;letter-spacing:1px;color:#718079;font-weight:850}.statement-receipt-body{padding:12px 0}.statement-receipt-line{display:flex;justify-content:space-between;gap:12px;padding:8px 0;font-size:9px;border-bottom:1px solid #f0f3f1}.statement-receipt-line span{color:#718079}.statement-receipt-line b{text-align:right;max-width:68%;overflow-wrap:anywhere}.statement-receipt-amount{font-size:20px;font-weight:900;text-align:center;padding:15px 0 7px}.statement-receipt-status{text-align:center;font-size:8px;color:#718079;text-transform:capitalize}.statement-receipt-actions{padding-top:6px}.statement-receipt-share{width:100%;height:40px;border:0;border-radius:10px;background:#087443;color:#fff;font-size:10px;font-weight:900}.statement-receipt-amount.credit{color:#087443}.statement-receipt-amount.debit{color:#a33535}@media(max-width:600px){.statement-receipt-sheet{border-radius:16px;padding:16px}}";document.head.appendChild(s);
})();
