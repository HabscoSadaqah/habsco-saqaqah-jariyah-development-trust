window.habscoStatementBooted=true;
const SUPABASE_URL="https://ythnoeyxovapydbmymdo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});
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
function closeReceipt(){const m=document.getElementById("statementReceipt");if(m){m.remove();document.body.classList.remove("receipt-modal-open")}}
function showReceipt(t){closeReceipt();const amount=Math.abs(Number(t.amount||0)),credit="credit"===String(t.direction||"").toLowerCase();const date=t.created_at?new Date(t.created_at).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}):"—";const type=String(t.type||"Transaction").replace(/_/g," ");const wrap=document.createElement("div");wrap.id="statementReceipt";wrap.innerHTML='<div class="statement-receipt-backdrop"></div><section class="statement-receipt-sheet" role="dialog" aria-modal="true" aria-label="Transaction receipt"><button type="button" class="statement-receipt-close" aria-label="Close">×</button><div class="statement-receipt-head"><img src="favicon.svg" alt="HABSCO" class="statement-receipt-logo"><span>OFFICIAL TRANSACTION DOCUMENT</span><strong>Transaction Receipt</strong></div><div class="statement-receipt-body"><div class="statement-receipt-line"><span>Date</span><b>'+escapeHtml(date)+'</b></div><div class="statement-receipt-line"><span>Reference</span><b>'+escapeHtml(t.reference||"—")+'</b></div><div class="statement-receipt-line"><span>Transaction type</span><b>'+escapeHtml(type)+'</b></div><div class="statement-receipt-line"><span>Full description</span><b>'+escapeHtml(t.description||type)+'</b></div><div class="statement-receipt-amount '+(credit?"credit":"debit")+'">'+(credit?"+":"−")+" "+money(amount)+'</div><div class="statement-receipt-status">'+escapeHtml(String(t.status||"approved").replace(/_/g," "))+'</div></div><div class="statement-receipt-actions"><button type="button" class="statement-receipt-share">Print / Save PDF</button></div></section>';document.body.appendChild(wrap);wrap.querySelector(".statement-receipt-close").onclick=closeReceipt;wrap.querySelector(".statement-receipt-backdrop").onclick=closeReceipt;wrap.querySelector(".statement-receipt-share").onclick=()=>printStatementReceipt(t)}
function printStatementReceipt(t){const html="<!doctype html><html><head><meta charset='utf-8'><title>HABSCO Transaction Receipt</title><style>@page{size:A4;margin:15mm}body{font-family:Arial,sans-serif;color:#17221c}.head{border-bottom:2px solid #087443;padding-bottom:12px}.title{font-size:22px;font-weight:900;color:#087443;margin-top:8px}.row{display:flex;justify-content:space-between;gap:20px;padding:12px 0;border-bottom:1px solid #e4ebe6}.amount{font-size:24px;font-weight:900;margin:22px 0}.credit{color:#087443}.debit{color:#a33535}.status{font-weight:800;text-transform:capitalize}</style></head><body><div class='head'><strong>HABSCO</strong><div class='title'>Transaction Receipt</div></div><div class='row'><span>Date</span><b>__DATE__</b></div><div class='row'><span>Reference</span><b>__REF__</b></div><div class='row'><span>Transaction type</span><b>__TYPE__</b></div><div class='row'><span>Description</span><b>__DESC__</b></div><div class='amount __CLASS__'>__AMOUNT__</div><div class='status'>__STATUS__</div></body></html>";const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));const date=t.created_at?new Date(t.created_at).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}):"—";const credit="credit"===String(t.direction||"").toLowerCase();const amount=(credit?"+ ":"− ")+money(Math.abs(Number(t.amount||0)));const out=html.replace("__DATE__",esc(date)).replace("__REF__",esc(t.reference||"—")).replace("__TYPE__",esc(String(t.type||"Transaction").replace(/_/g," "))).replace("__DESC__",esc(t.description||t.type||"Transaction")).replace("__CLASS__",credit?"credit":"debit").replace("__AMOUNT__",esc(amount)).replace("__STATUS__",esc(String(t.status||"approved").replace(/_/g," ")));const w=window.open("","_blank","noopener,noreferrer");if(!w){alert("Please allow pop-ups to print/save the PDF receipt.");return}w.document.write(out);w.document.close();setTimeout(()=>w.print(),250)}
async function getUserWithTimeout(client){
  return await Promise.race([
    client.auth.getUser(),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error("Authentication request timed out")),10000))
  ]);
}
async function load(){
  const list=$("statementRows"); if(!list)return;
  list.innerHTML='<div class="funding-empty">Loading transaction history…</div>';
  try{
    const auth=await getUserWithTimeout(supabaseClient);
    const user=auth?.data?.user;
    if(!user){list.innerHTML='<div class="funding-empty">Please sign in to view your transaction history.</div>';return;}
    const tx=await Promise.race([
      supabaseClient.from("transactions").select("reference,type,amount,direction,description,status,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(100),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error("Transaction request timed out")),12000))
    ]);
    if(tx.error)throw tx.error;
    const rows=(tx.data||[]).filter(x=>Number.isFinite(Number(x.amount)));
    let running=0;
    try{
      const wallet=await Promise.race([
        supabaseClient.from("wallets").select("balance").eq("user_id",user.id).maybeSingle(),
        new Promise((_,reject)=>setTimeout(()=>reject(new Error("Wallet request timed out")),5000))
      ]);
      if(!wallet?.error)running=Number(wallet?.data?.balance||0);
    }catch(_){}
    allRows=rows.map(x=>{const amount=Math.abs(Number(x.amount||0));const credit=String(x.direction||"").toLowerCase()==="credit";const after=running;const before=credit?after-amount:after+amount;running=before;return {...x,_before:before,_after:after}});
    expanded=false;render();
  }catch(e){
    console.error("Statement load failed:",e);
    list.innerHTML='<div class="funding-empty">Unable to load transaction history. Please refresh.</div>';
  }
}
function startStatementSync(){supabaseClient.auth.getUser().then(({data})=>{const user=data?.user;if(!user)return;if(window.habscoStatementChannel)supabaseClient.removeChannel(window.habscoStatementChannel);window.habscoStatementChannel=supabaseClient.channel("statement-sync-"+user.id).on("postgres_changes",{event:"INSERT",schema:"public",table:"transactions"},p=>{if(p.new?.user_id===user.id)load()}).on("postgres_changes",{event:"UPDATE",schema:"public",table:"transactions"},p=>{if(p.new?.user_id===user.id)load()}).on("postgres_changes",{event:"DELETE",schema:"public",table:"transactions"},p=>{if(p.old?.user_id===user.id)load()}).subscribe()}).catch(()=>{})}
function init(){
  const apply=$("apply"),more=$("loadMore"),from=$("fromDate"),to=$("toDate"),print=$("printBtn");
  apply&&(apply.onclick=()=>{expanded=false;render()});more&&(more.onclick=()=>{expanded=!expanded;render()});from&&from.addEventListener("change",()=>{expanded=false;render()});to&&to.addEventListener("change",()=>{expanded=false;render()});print&&(print.onclick=()=>window.print());
  load();startStatementSync();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
(function addReceiptStyle(){if(document.getElementById("statement-receipt-style"))return;const s=document.createElement("style");s.id="statement-receipt-style";s.textContent=".statement-receipt-backdrop{position:fixed;inset:0;background:rgba(20,45,34,.38);z-index:200}.statement-receipt-sheet{position:fixed;z-index:201;left:50%;top:50%;transform:translate(-50%,-50%);width:min(390px,calc(100vw - 24px));background:#fff;border:1px solid #dce9e1;border-radius:18px;padding:18px;box-shadow:0 14px 40px rgba(0,0,0,.16);color:#17221c}.statement-receipt-close{position:absolute;right:10px;top:9px;width:30px;height:30px;border:0;border-radius:50%;background:#f1f6f3;color:#52635b;font-size:20px;line-height:1}.statement-receipt-head{display:flex;flex-direction:column;gap:2px;padding-right:35px;border-bottom:1px solid #edf1ee;padding-bottom:12px}.statement-receipt-head strong{font-size:16px;color:#087443}.statement-receipt-head span{font-size:8px;letter-spacing:1px;color:#718079;font-weight:850}.statement-receipt-body{padding:12px 0}.statement-receipt-line{display:flex;justify-content:space-between;gap:12px;padding:8px 0;font-size:9px;border-bottom:1px solid #f0f3f1}.statement-receipt-line span{color:#718079}.statement-receipt-line b{text-align:right;max-width:68%;overflow-wrap:anywhere}.statement-receipt-amount{font-size:20px;font-weight:900;text-align:center;padding:15px 0 7px}.statement-receipt-status{text-align:center;font-size:8px;color:#718079;text-transform:capitalize}.statement-receipt-actions{padding-top:6px}.statement-receipt-share{width:100%;height:40px;border:0;border-radius:10px;background:#087443;color:#fff;font-size:10px;font-weight:900}.statement-receipt-amount.credit{color:#087443}.statement-receipt-amount.debit{color:#a33535}@media(max-width:600px){.statement-receipt-sheet{border-radius:16px;padding:16px}}";document.head.appendChild(s)})();
