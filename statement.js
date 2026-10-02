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
async function requeryUtility(t,button){
  if(!t?.reference||String(t.type||"").toLowerCase()!=="utility")return;
  if(button?.disabled)return;
  const original=button?.textContent||"Requery";
  if(button){button.disabled=true;button.textContent="Requerying…";button.classList.add("is-loading")}
  try{
    const {data,error}=await supabaseClient.functions.invoke("utility-vps-proxy-v2",{body:{action:"requery",transaction_reference:String(t.reference)}});
    if(error)throw error;
    if(data?.error)throw new Error(typeof data.error==="string"?data.error:(data.error.message||"Unable to requery transaction."));
    if(data?.pending){
      if(button)button.textContent="Still Pending";
      alert("This utility transaction is still pending with the provider. Please try Requery again later.");
    }else if(data?.status){
      if(button)button.textContent=String(data.status).replace(/_/g," ").replace(/\b\w/g,m=>m.toUpperCase());
      await load();
    }else{
      await load();
    }
  }catch(e){
    console.error("Utility requery failed:",e);
    alert(e?.message||"Unable to requery this utility transaction. Please try again.");
  }finally{
    if(button&&!button.isConnected===false){button.disabled=false;if(button.textContent==="Requerying…")button.textContent=original;button.classList.remove("is-loading")}
  }
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
    const um=utilityDetails(x);
    const pending=String(x.status||"").toLowerCase()==="pending";
    const token=um.isUtility&&um.token?um.token:"";
    const ref=String(x.reference||"—");
    const date=x.created_at?new Date(x.created_at).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}):"—";
    const before=Number(x._before||0),after=Number(x._after||0);
    const requery=um.isUtility&&pending?'<button type="button" class="activity-requery" data-ref="'+escapeHtml(ref)+'">Requery</button>':"";
    const view='<button type="button" class="activity-view-receipt" data-i="'+visible.indexOf(x)+'">View</button>';
    return '<div class="funding-item'+(um.isUtility?" utility-history-item":"")+'"><div class="activity-icon" aria-hidden="true">'+(credit?"↓":"↑")+'</div><div class="activity-main"><div class="activity-line-one"><span class="funding-title">'+escapeHtml(um.isUtility?(um.service==="power"||um.service==="electricity"?"Electricity":um.service==="tv"?"TV Subscription":um.service?um.service.charAt(0).toUpperCase()+um.service.slice(1):"Utility"):title.charAt(0).toUpperCase()+title.slice(1))+'</span><span class="activity-date">'+escapeHtml(date)+'</span></div><div class="funding-meta">'+escapeHtml(desc||"No description")+" · "+escapeHtml(ref)+" · "+escapeHtml(status)+'</div>'+(um.isUtility?'<div class="utility-history-meta"><span>Provider: <strong>'+escapeHtml(um.provider||"—")+'</strong></span><span>Receiver: <strong>'+escapeHtml(um.receiver||"—")+'</strong></span></div>':"")+(token?'<div class="utility-token">Token: <strong>'+escapeHtml(token)+'</strong></div>':(um.isUtility&&String(um.service||"")==="power"&&pending?'<div class="utility-token utility-token-pending">Token: <strong>Pending — requery to update</strong></div>':""))+'<div class="activity-balance"><span>Wallet Balance Before <strong>'+money(before)+'</strong></span><span>Wallet Balance After <strong>'+money(after)+'</strong></span></div></div><div class="activity-side"><div class="funding-amount '+(credit?"credit":"debit")+'">'+(credit?"+":"−")+" "+money(amount)+'</div><div class="activity-receipt-row">'+requery+view+'</div></div></div>';
  }).join("");
  list.onclick=(event)=>{
    const viewButton=event.target.closest(".activity-view-receipt");
    if(viewButton){
      event.preventDefault();
      event.stopPropagation();
      const index=Number(viewButton.dataset.i);
      if(Number.isInteger(index)&&visible[index]) showReceipt(visible[index]);
      return;
    }
    const requeryButton=event.target.closest(".activity-requery");
    if(requeryButton){
      event.preventDefault();
      event.stopPropagation();
      const row=visible.find(x=>String(x.reference||"")===String(requeryButton.dataset.ref||""));
      if(row)requeryUtility(row,requeryButton);
    }
  };
}
function utilityDetails(t){const m=t?.metadata&&typeof t.metadata==="object"?t.metadata:{};const pr=m.provider_response?.vend?.data||{};const ti=pr.token_info||{};const ci=pr.customer_info||{};const mi=pr.meter_info||{};const token=String(m.token||ti.token||m.provider_history?.vend?.token||"").trim();const receipt=String(m.util_receipt||ti.util_receipt||"").trim();const providerRef=String(m.provider_reference||pr.payment_reference||"").trim();return{isUtility:String(t?.type||"")==="utility",service:String(m.service||m.action||"").toLowerCase(),provider:String(m.provider||pr.provider||"").trim(),receiver:String(m.receiver||mi.receiver||"").trim(),meterType:String(m.meter_type||mi.meter_type||"").trim(),customerName:String(m.customer_name||ci.customer_name||"").trim(),customerAddress:String(m.customer_address||ci.customer_address||"").trim(),purchaseAmount:m.purchase_amount??pr.amount??"",serviceCharge:m.service_charge??m.service_fee_collected??"",token,receipt,providerRef,units:ti.units??""}}
function closeReceipt(){const m=document.getElementById("statementReceipt");if(m){m.remove();document.body.classList.remove("receipt-modal-open")}}
function showReceipt(t){closeReceipt();const amount=Math.abs(Number(t.amount||0)),credit="credit"===String(t.direction||"").toLowerCase();const date=t.created_at?new Date(t.created_at).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}):"—";const type=String(t.type||"Transaction").replace(/_/g," ");const u=utilityDetails(t);const details=u.isUtility?'<div class="statement-receipt-section"><strong>Utility details</strong><div class="statement-receipt-grid">'+[['Service',u.service.toUpperCase()],['Provider',u.provider],['Meter / Receiver',u.receiver],['Meter type',u.meterType.toUpperCase()],['Customer',u.customerName],['Customer address',u.customerAddress],['Purchase amount',u.purchaseAmount!==""?money(u.purchaseAmount):""],['Service charge',u.serviceCharge!==""?money(u.serviceCharge):""],['Utility receipt',u.receipt],['Provider reference',u.providerRef],['Units',u.units!==""?String(u.units):""]].filter(x=>x[1]).map(x=>'<div><span>'+escapeHtml(x[0])+'</span><b>'+escapeHtml(x[1])+'</b></div>').join("")+(u.token?'<div class="token-row"><span>Electricity token</span><b>'+escapeHtml(u.token)+'</b></div>':"")+'</div></div>':"";const wrap=document.createElement("div");wrap.id="statementReceipt";wrap.innerHTML='<div class="statement-receipt-backdrop"></div><section class="statement-receipt-sheet" role="dialog" aria-modal="true"><button type="button" class="statement-receipt-close" aria-label="Close">×</button><div class="statement-receipt-head"><div class="statement-receipt-brand">HABSCO</div><span>OFFICIAL TRANSACTION DOCUMENT</span><strong>'+escapeHtml(u.isUtility?"Utility Transaction Receipt":"Transaction Receipt")+'</strong></div><div class="statement-receipt-body"><div class="statement-receipt-line"><span>Date</span><b>'+escapeHtml(date)+'</b></div><div class="statement-receipt-line"><span>Reference</span><b>'+escapeHtml(t.reference||"—")+'</b></div><div class="statement-receipt-line"><span>Transaction type</span><b>'+escapeHtml(type)+'</b></div><div class="statement-receipt-line"><span>Description</span><b>'+escapeHtml(t.description||type)+'</b></div>'+details+'<div class="statement-receipt-amount '+(credit?"credit":"debit")+'">'+(credit?"+":"−")+" "+money(amount)+'</div><div class="statement-receipt-status">Status: '+escapeHtml(String(t.status||"approved").replace(/_/g," "))+'</div></div><div class="statement-receipt-actions"><button type="button" class="statement-receipt-share">Print / Save A4 PDF</button></div></section>';document.body.appendChild(wrap);wrap.querySelector(".statement-receipt-close").onclick=closeReceipt;wrap.querySelector(".statement-receipt-backdrop").onclick=closeReceipt;wrap.querySelector(".statement-receipt-share").onclick=()=>printStatementReceipt(t)}
function printStatementReceipt(t){const u=utilityDetails(t);const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));const date=t.created_at?new Date(t.created_at).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}):"—";const credit="credit"===String(t.direction||"").toLowerCase();const amount=(credit?"+ ":"− ")+money(Math.abs(Number(t.amount||0)));const rows=u.isUtility?[["Service",u.service.toUpperCase()],["Provider",u.provider],["Meter / Receiver",u.receiver],["Meter Type",u.meterType.toUpperCase()],["Customer",u.customerName],["Customer Address",u.customerAddress],["Purchase Amount",u.purchaseAmount!==""?money(u.purchaseAmount):""],["Service Charge",u.serviceCharge!==""?money(u.serviceCharge):""],["Utility Receipt",u.receipt],["Provider Reference",u.providerRef],["Units",u.units!==""?String(u.units):""]].filter(x=>x[1]).map(x=>"<div class='row'><span>"+esc(x[0])+"</span><b>"+esc(x[1])+"</b></div>").join("")+(u.token?"<div class='token'>Electricity Token<br><strong>"+esc(u.token)+"</strong></div>":""):"";const html="<!doctype html><html><head><meta charset='utf-8'><title>HABSCO Transaction Receipt</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#17221c;font-size:12px}.head{border-bottom:2px solid #087443;padding-bottom:12px}.title{font-size:22px;font-weight:900;color:#087443;margin-top:8px}.sub{font-size:10px;color:#718079;margin-top:3px}.row{display:flex;justify-content:space-between;gap:20px;padding:10px 0;border-bottom:1px solid #e4ebe6}.section{margin-top:16px;border:1px solid #dce7e1;border-radius:8px;padding:10px}.section h3{margin:0 0 8px;color:#087443;font-size:12px}.amount{font-size:24px;font-weight:900;margin:22px 0}.credit{color:#087443}.debit{color:#a33535}.status{font-weight:800;text-transform:capitalize;margin-top:8px}.token{font-size:18px;font-weight:900;letter-spacing:1px;background:#edf7f1;padding:12px;border-radius:7px;margin-top:8px;word-break:break-all;color:#087443}.foot{margin-top:18px;font-size:8px;color:#718079}</style></head><body><div class='head'><strong>HABSCO</strong><div class='title'>"+(u.isUtility?"Utility Transaction Receipt":"Transaction Receipt")+"</div><div class='sub'>STATEMENT OF ACCOUNT • OFFICIAL TRANSACTION DOCUMENT</div></div><div class='row'><span>Date</span><b>"+esc(date)+"</b></div><div class='row'><span>Reference</span><b>"+esc(t.reference||"—")+"</b></div><div class='row'><span>Transaction type</span><b>"+esc(String(t.type||"Transaction").replace(/_/g," "))+"</b></div><div class='row'><span>Description</span><b>"+esc(t.description||t.type||"Transaction")+"</b></div>"+(u.isUtility?"<div class='section'><h3>Utility Details</h3>"+rows+"</div>":"")+"<div class='amount "+(credit?"credit":"debit")+"'>"+esc(amount)+"</div><div class='status'>Status: "+esc(String(t.status||"approved").replace(/_/g," "))+"</div><div class='foot'>HABSCO • Generated from Statement of Account</div></body></html>";const w=window.open("","_blank","noopener,noreferrer");if(!w){alert("Please allow pop-ups to print/save the PDF receipt.");return}w.document.write(html);w.document.close();setTimeout(()=>w.print(),250)}
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
      supabaseClient.from("transactions").select("reference,type,amount,direction,description,status,metadata,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(1000),
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
  apply&&(apply.onclick=()=>{expanded=false;render()});more&&(more.onclick=()=>{expanded=!expanded;render()});from&&from.addEventListener("change",()=>{expanded=false;render()});to&&to.addEventListener("change",()=>{expanded=false;render()});print&&(print.onclick=()=>{
  expanded=true;
  render();
  const old=document.getElementById("statementPrintProgress");
  if(old)old.remove();
  const overlay=document.createElement("div");
  overlay.id="statementPrintProgress";
  overlay.innerHTML='<div class="statement-print-progress-card"><div class="statement-print-progress-icon">🖨️</div><strong>Preparing Statement</strong><span>Your statement is ready for Print or Save as PDF.</span><button type="button" id="statementPrintNow">PRINT / SAVE PDF</button><button type="button" id="statementPrintCancel">CANCEL</button></div>';
  document.body.appendChild(overlay);
  const cleanup=()=>{overlay.remove();expanded=false;render()};
  overlay.querySelector("#statementPrintCancel").onclick=cleanup;
  overlay.querySelector("#statementPrintNow").onclick=()=>{
    overlay.remove();
    setTimeout(()=>{window.print();setTimeout(()=>{expanded=false;render()},400)},80);
  };
});
  load();startStatementSync();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
(function addReceiptStyle(){if(document.getElementById("statement-receipt-style"))return;const s=document.createElement("style");s.id="statement-receipt-style";s.textContent=".statement-print-progress-card{width:min(340px,calc(100vw - 32px));background:#fff;border:1px solid #dce9e1;border-radius:18px;padding:22px;text-align:center;box-shadow:0 18px 55px rgba(0,0,0,.18);display:flex;flex-direction:column;gap:8px}.statement-print-progress-icon{font-size:34px}.statement-print-progress-card strong{font-size:15px;color:#087443}.statement-print-progress-card span{font-size:9px;color:#718079;line-height:1.5}.statement-print-progress-card button{width:100%;height:40px;border:0;border-radius:10px;font-size:9px;font-weight:900;cursor:pointer}.statement-print-progress-card button:first-of-type{background:#087443;color:#fff}.statement-print-progress-card button:last-of-type{background:#eef3ef;color:#34443c}#statementPrintProgress{position:fixed;inset:0;background:rgba(3,35,22,.48);z-index:300000;display:flex;align-items:center;justify-content:center;padding:16px}.statement-print-progress-card{utility-token{margin-top:3px;font-size:7px;color:#087443;overflow-wrap:anywhere}.utility-token strong{font-weight:900;letter-spacing:.5px}.statement-receipt-section{margin-top:10px;padding:10px;border:1px solid #dce9e1;border-radius:10px;background:#f8fbf9}.statement-receipt-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px}.statement-receipt-grid>div{display:flex;flex-direction:column;gap:2px;font-size:8px}.statement-receipt-grid span{color:#718079}.statement-receipt-grid b{font-weight:850;overflow-wrap:anywhere}.statement-receipt-grid .token-row{grid-column:1/-1;padding:8px;border-radius:7px;background:#edf7f1}.statement-receipt-grid .token-row b{font-size:13px;letter-spacing:1px;color:#087443}..statement-receipt-backdrop{position:fixed;inset:0;background:rgba(20,45,34,.38);z-index:200}.statement-receipt-sheet{position:fixed;z-index:201;left:50%;top:50%;transform:translate(-50%,-50%);width:min(390px,calc(100vw - 24px));background:#fff;border:1px solid #dce9e1;border-radius:18px;padding:18px;box-shadow:0 14px 40px rgba(0,0,0,.16);color:#17221c}.statement-receipt-close{position:absolute;right:10px;top:9px;width:30px;height:30px;border:0;border-radius:50%;background:#f1f6f3;color:#52635b;font-size:20px;line-height:1}.statement-receipt-head{display:flex;flex-direction:column;gap:2px;padding-right:35px;border-bottom:1px solid #edf1ee;padding-bottom:12px}.statement-receipt-head strong{font-size:16px;color:#087443}.statement-receipt-head span{font-size:8px;letter-spacing:1px;color:#718079;font-weight:850}.statement-receipt-body{padding:12px 0}.statement-receipt-line{display:flex;justify-content:space-between;gap:12px;padding:8px 0;font-size:9px;border-bottom:1px solid #f0f3f1}.statement-receipt-line span{color:#718079}.statement-receipt-line b{text-align:right;max-width:68%;overflow-wrap:anywhere}.statement-receipt-amount{font-size:20px;font-weight:900;text-align:center;padding:15px 0 7px}.statement-receipt-status{text-align:center;font-size:8px;color:#718079;text-transform:capitalize}.statement-receipt-actions{padding-top:6px}.statement-receipt-share{width:100%;height:40px;border:0;border-radius:10px;background:#087443;color:#fff;font-size:10px;font-weight:900}.statement-receipt-amount.credit{color:#087443}.statement-receipt-amount.debit{color:#a33535}.activity-requery{border:1px solid #087443;background:#fff;color:#087443;border-radius:8px;padding:5px 9px;font-size:8px;font-weight:900;cursor:pointer}.activity-requery:disabled{opacity:.65;cursor:wait}.activity-requery.is-loading{min-width:58px}.utility-history-item .utility-history-meta{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:3px;font-size:7px;color:#718079}.utility-history-item .utility-history-meta strong{color:#17221c}.utility-token-pending{color:#a56b00}.activity-receipt-row{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}@media(max-width:600px){.statement-receipt-sheet{border-radius:16px;padding:16px}}";document.head.appendChild(s)})();
