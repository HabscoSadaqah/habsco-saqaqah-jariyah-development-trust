window.habscoStatementBooted=true;
const SUPABASE_URL="https://ythnoeyxovapydbmymdo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const sessionPromise=window.habscoSessionPromise||(window.habscoSessionPromise=supabaseClient.auth.getSession());
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
  const esc=v=>String(v??"").replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  const amount=(String(t.direction||"").toLowerCase()==="credit"?"+ ":"− ")+money(Math.abs(Number(t.amount||0)));
  const cls=String(t.direction||"").toLowerCase()==="credit"?"credit":"debit";
  let html="<!doctype html><html><head><meta charset=\"utf-8\"><title>HABSCO Transaction Receipt</title><style>@page{size:A4 portrait;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#eef2ef;color:#17221c;font-family:Arial,Helvetica,sans-serif}.receipt{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:18mm 17mm 15mm;position:relative;overflow:hidden}.watermark{position:absolute;top:118mm;left:50%;width:130mm;height:auto;transform:translate(-50%,-50%) rotate(-24deg);opacity:.055;z-index:0;pointer-events:none}.head,.section,.note,.footer{position:relative;z-index:1}.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #087443;padding-bottom:9mm}.logo{width:62mm;height:auto;display:block}.head-right{text-align:right}.kicker{font-size:9pt;font-weight:700;letter-spacing:1.5px;color:#087443}.title{font-size:20pt;font-weight:800;margin-top:3mm;color:#173d2e}.meta{font-size:9pt;color:#6c7972;margin-top:2mm}.section{margin-top:10mm}.section-title{font-size:10pt;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:#087443;border-bottom:1px solid #dfe9e3;padding-bottom:3mm;margin-bottom:4mm}.details{border:1px solid #dfe9e3;border-radius:4mm;overflow:hidden}.row{display:grid;grid-template-columns:42% 58%;padding:4mm 5mm;border-bottom:1px solid #edf1ee;font-size:10.5pt}.row:last-child{border-bottom:0}.label{color:#6c7972}.value{font-weight:700;text-align:right;overflow-wrap:anywhere}.amount-box{margin-top:8mm;border:1.5px solid #087443;border-radius:4mm;padding:7mm;background:#f5faf7;display:flex;justify-content:space-between;align-items:center}.amount-label{font-size:10pt;color:#617067}.amount{font-size:19pt;font-weight:900}.amount.credit{color:#087443}.amount.debit{color:#9a2f2f}.status{display:inline-block;margin-top:7mm;padding:2.5mm 5mm;border-radius:8mm;background:#eaf6ef;color:#087443;font-size:9pt;font-weight:800;text-transform:uppercase}.note{margin-top:12mm;font-size:8.5pt;line-height:1.5;color:#718079}.footer{position:absolute;left:17mm;right:17mm;bottom:11mm;border-top:1px solid #dfe9e3;padding-top:4mm;display:flex;justify-content:space-between;font-size:7.5pt;color:#7a8780}</style></head><body><main class=\"receipt\"><img class=\"watermark\" src=\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgODAiPjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iODAiIHJ4PSIxMiIgZmlsbD0iI2ZmZmZmZiIvPjx0ZXh0IHg9IjEyOCIgeT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJJbnRlcixBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZiIgZm9udC1zaXplPSI1MCIgZm9udC13ZWlnaHQ9IjkwMCIgbGV0dGVyLXNwYWNpbmc9IjUiIGZpbGw9IiMwNjNkMjYiPkhBQlNDTzwvdGV4dD48L3N2Zz4=\" alt=\"\"><header class=\"head\"><img class=\"logo\" src=\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgODAiPjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iODAiIHJ4PSIxMiIgZmlsbD0iI2ZmZmZmZiIvPjx0ZXh0IHg9IjEyOCIgeT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJJbnRlcixBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZiIgZm9udC1zaXplPSI1MCIgZm9udC13ZWlnaHQ9IjkwMCIgbGV0dGVyLXNwYWNpbmc9IjUiIGZpbGw9IiMwNjNkMjYiPkhBQlNDTzwvdGV4dD48L3N2Zz4=\" alt=\"HABSCO\"><div class=\"head-right\"><div class=\"kicker\">OFFICIAL TRANSACTION DOCUMENT</div><div class=\"title\">Transaction Receipt</div><div class=\"meta\">HABSCO</div></div></header><section class=\"section\"><div class=\"section-title\">Transaction details</div><div class=\"details\"><div class=\"row\"><span class=\"label\">Transaction date</span><span class=\"value\">__DATE__</span></div><div class=\"row\"><span class=\"label\">Reference number</span><span class=\"value\">__REF__</span></div><div class=\"row\"><span class=\"label\">Transaction type</span><span class=\"value\">__TYPE__</span></div><div class=\"row\"><span class=\"label\">Description</span><span class=\"value\">__DESC__</span></div></div><div class=\"amount-box\"><span class=\"amount-label\">Transaction amount</span><strong class=\"amount __CLASS__\">__AMOUNT__</strong></div><div class=\"status\">__STATUS__</div></section><p class=\"note\">This is an official HABSCO transaction document generated electronically from the member transaction record. Please retain this document for your records.</p><footer class=\"footer\"><span>HABSCO</span><span>Generated __GENERATED__</span></footer></main><script>window.onload=()=>setTimeout(()=>window.print(),250);</script></body></html>";
  html=html.replace("__DATE__",esc(t.created_at?new Date(t.created_at).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}):"—")).replace("__REF__",esc(t.reference||"—")).replace("__TYPE__",esc(String(t.type||"Transaction").replace(/_/g," "))).replace("__DESC__",esc(t.description||t.type||"Transaction")).replace("__CLASS__",cls).replace("__AMOUNT__",esc(amount)).replace("__STATUS__",esc(String(t.status||"approved").replace(/_/g," "))).replace("__GENERATED__",esc(new Date().toLocaleString("en-NG")));
  return new Blob([html],{type:"text/html;charset=utf-8"});
}
function closeReceipt(){document.getElementById("statementReceipt")?.remove()}
function showReceipt(t){
  closeReceipt();
  const amount=Math.abs(Number(t.amount||0)),credit="credit"===String(t.direction||"").toLowerCase();
  const date=t.created_at?new Date(t.created_at).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}):"—";
  const type=String(t.type||"Transaction").replace(/_/g," ");
  const wrap=document.createElement("div");wrap.id="statementReceipt";
  wrap.innerHTML='<div class="statement-receipt-backdrop"></div><section class="statement-receipt-sheet" role="dialog" aria-modal="true" aria-label="Transaction receipt"><button type="button" class="statement-receipt-close" aria-label="Close">×</button><div class="statement-receipt-head"><img src="favicon.svg" alt="HABSCO" class="statement-receipt-logo"><span>OFFICIAL TRANSACTION DOCUMENT</span><strong>Transaction Receipt</strong></div><div class="statement-receipt-body"><div class="statement-receipt-line"><span>Date</span><b>'+escapeHtml(date)+'</b></div><div class="statement-receipt-line"><span>Reference</span><b>'+escapeHtml(t.reference||"—")+'</b></div><div class="statement-receipt-line"><span>Transaction type</span><b>'+escapeHtml(type)+'</b></div><div class="statement-receipt-line"><span>Full description</span><b>'+escapeHtml(t.description||type)+'</b></div><div class="statement-receipt-amount '+(credit?"credit":"debit")+'">'+(credit?"+":"−")+" "+money(amount)+'</div><div class="statement-receipt-status">'+escapeHtml(String(t.status||"approved").replace(/_/g," "))+'</div></div><div class="statement-receipt-actions"><button type="button" class="statement-receipt-share">Print / Save PDF</button></div></section>';
  document.body.appendChild(wrap);
  wrap.querySelector(".statement-receipt-close").onclick=closeReceipt;
  wrap.querySelector(".statement-receipt-backdrop").onclick=closeReceipt;
  wrap.querySelector(".statement-receipt-share").onclick=()=>printStatementReceipt(t);
}
function printStatementReceipt(t){
  const blob=makePdf(t);
  const url=URL.createObjectURL(blob);
  const w=window.open(url,"_blank","noopener,noreferrer");
  if(!w)alert("Please allow pop-ups to print/save the PDF receipt.");
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function shareReceipt(t){printStatementReceipt(t)}
async function load(){
  const list=$("statementRows");
  if(!list)return;
  list.innerHTML='<div class="funding-empty">Loading recent activity…</div>';
  try{
    const {data:{session},error:sessionError}=await supabaseClient.auth.getSession();
    if(sessionError||!session?.user){
      list.innerHTML='<div class="funding-empty">Please sign in to view your transaction history.</div>';
      return;
    }
    const user=session.user;
    const txRes=await supabaseClient.from("transactions")
      .select("reference,type,amount,direction,description,status,created_at")
      .eq("user_id",user.id).order("created_at",{ascending:false}).limit(100);
    if(txRes.error)throw txRes.error;

    const rows=(txRes.data||[]).filter(x=>Number.isFinite(Number(x.amount)));
    const walletRes=await supabaseClient.from("wallets").select("balance").eq("user_id",user.id).maybeSingle();
    let running=Number(walletRes?.data?.balance||0);
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
function startStatementSync(){
  if(!window.supabaseClient)return;
  const userPromise=supabaseClient.auth.getUser().then(({data})=>data?.user);
  userPromise.then(user=>{
    if(!user)return;
    if(window.habscoStatementChannel)supabaseClient.removeChannel(window.habscoStatementChannel);
    window.habscoStatementChannel=supabaseClient.channel("statement-sync-"+user.id)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"transactions"},p=>{
        if(p.new?.user_id===user.id)load();
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"transactions"},p=>{
        if(p.new?.user_id===user.id)load();
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"transactions"},p=>{
        if(p.old?.user_id===user.id)load();
      })
      .subscribe();
  });
}

function init(){
  const apply=$("apply"),more=$("loadMore"),from=$("fromDate"),to=$("toDate"),print=$("printBtn");
  apply&&(apply.onclick=()=>{expanded=false;render()});
  more&&(more.onclick=()=>{expanded=!expanded;render()});
  from&&from.addEventListener("change",()=>{expanded=false;render()});
  to&&to.addEventListener("change",()=>{expanded=false;render()});
  print&&(print.onclick=()=>window.print());
  load();
  startStatementSync();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();

(function addReceiptStyle(){
  if(document.getElementById("statement-receipt-style"))return;
  const s=document.createElement("style");s.id="statement-receipt-style";s.textContent=".statement-receipt-backdrop{position:fixed;inset:0;background:rgba(20,45,34,.38);z-index:200}.statement-receipt-sheet{position:fixed;z-index:201;left:50%;top:50%;transform:translate(-50%,-50%);width:min(390px,calc(100vw - 24px));background:#fff;border:1px solid #dce9e1;border-radius:18px;padding:18px;box-shadow:0 14px 40px rgba(0,0,0,.16);color:#17221c}.statement-receipt-close{position:absolute;right:10px;top:9px;width:30px;height:30px;border:0;border-radius:50%;background:#f1f6f3;color:#52635b;font-size:20px;line-height:1}.statement-receipt-head{display:flex;flex-direction:column;gap:2px;padding-right:35px;border-bottom:1px solid #edf1ee;padding-bottom:12px}.statement-receipt-head strong{font-size:16px;color:#087443}.statement-receipt-head span{font-size:8px;letter-spacing:1px;color:#718079;font-weight:850}.statement-receipt-body{padding:12px 0}.statement-receipt-line{display:flex;justify-content:space-between;gap:12px;padding:8px 0;font-size:9px;border-bottom:1px solid #f0f3f1}.statement-receipt-line span{color:#718079}.statement-receipt-line b{text-align:right;max-width:68%;overflow-wrap:anywhere}.statement-receipt-amount{font-size:20px;font-weight:900;text-align:center;padding:15px 0 7px}.statement-receipt-status{text-align:center;font-size:8px;color:#718079;text-transform:capitalize}.statement-receipt-actions{padding-top:6px}.statement-receipt-share{width:100%;height:40px;border:0;border-radius:10px;background:#087443;color:#fff;font-size:10px;font-weight:900}.statement-receipt-amount.credit{color:#087443}.statement-receipt-amount.debit{color:#a33535}@media(max-width:600px){.statement-receipt-sheet{border-radius:16px;padding:16px}}";document.head.appendChild(s);
})();
