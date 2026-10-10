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
function showUtilityRequeryStatusModal(kind,tx,data={}){
  const old=document.getElementById("utilityRequeryStatusModal");if(old)old.remove();
  const cfg={
    approved:{icon:"✓",title:"Payment Successful",tone:"#087443",soft:"#eaf8ef",message:"The provider confirmed that your utility payment was successful."},
    failed:{icon:"!",title:"Payment Failed",tone:"#a52a2a",soft:"#fff0f0",message:"The provider confirmed that this utility payment failed. A separate credit reversal has been recorded."},
    rejected:{icon:"×",title:"Payment Rejected",tone:"#a52a2a",soft:"#fff0f0",message:"The provider rejected this utility payment. A separate credit reversal has been recorded."},
    pending:{icon:"◷",title:"Payment Still Pending",tone:"#9a6700",soft:"#fff7e4",message:"The provider has not confirmed the final result yet. Your funds remain reserved; check again later."}
  };
  const c=cfg[kind]||cfg.pending;
  const modal=document.createElement("div");modal.id="utilityRequeryStatusModal";
  modal.innerHTML='<div class="urs-backdrop"></div><section class="urs-card" role="dialog" aria-modal="true"><div class="urs-icon">'+c.icon+'</div><div class="urs-kicker">HABSCO UTILITY STATUS</div><h3>'+c.title+'</h3><p>'+escapeHtml(data?.message||c.message)+'</p><div class="urs-details"><div><span>Service reference</span><strong>'+escapeHtml(tx?.reference||data?.reference||"—")+'</strong></div><div><span>Result</span><strong>'+escapeHtml(String(data?.status||kind).replace(/_/g," "))+'</strong></div>'+(data?.reversal_reference?'<div><span>Reversal reference</span><strong>'+escapeHtml(data.reversal_reference)+'</strong></div>':"")+'</div><button type="button" class="urs-close">CLOSE</button><small>www.habscosadaqah.org</small></section>';
  const style=document.createElement("style");style.textContent='#utilityRequeryStatusModal{position:fixed;inset:0;z-index:300000;background:rgba(13,30,21,.68);display:flex;align-items:center;justify-content:center;padding:14px;font-family:Inter,system-ui,Arial,sans-serif}#utilityRequeryStatusModal .urs-backdrop{position:absolute;inset:0}#utilityRequeryStatusModal .urs-card{position:relative;width:min(420px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:22px;padding:22px;text-align:center;box-shadow:0 25px 70px #0004;border:1px solid '+c.tone+'22}#utilityRequeryStatusModal .urs-icon{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;margin:0 auto 12px;background:'+c.soft+';color:'+c.tone+';font-size:38px;font-weight:950}#utilityRequeryStatusModal .urs-kicker{font-size:9px;letter-spacing:1.4px;font-weight:950;color:'+c.tone+'}#utilityRequeryStatusModal h3{font-size:22px;color:'+c.tone+';margin:7px 0}#utilityRequeryStatusModal p{font-size:12px;line-height:1.5;color:#65736b;margin:8px auto 14px}#utilityRequeryStatusModal .urs-details{border:1px solid #e2eae5;border-radius:12px;text-align:left;margin:12px 0;overflow:hidden}#utilityRequeryStatusModal .urs-details>div{padding:10px 12px;border-bottom:1px solid #edf1ee;display:flex;justify-content:space-between;gap:12px;font-size:10px}#utilityRequeryStatusModal .urs-details>div:last-child{border-bottom:0}#utilityRequeryStatusModal .urs-details span{color:#718079}#utilityRequeryStatusModal .urs-details strong{text-align:right;overflow-wrap:anywhere;color:#183b2b}#utilityRequeryStatusModal .urs-close{width:100%;min-height:44px;border:0;border-radius:11px;background:'+c.tone+';color:#fff;font-weight:900;margin-top:4px}#utilityRequeryStatusModal small{display:block;color:#829087;font-size:9px;margin-top:12px}';
  document.head.appendChild(style);document.body.appendChild(modal);
  const close=()=>{modal.remove();style.remove()};modal.querySelector(".urs-close").onclick=close;modal.querySelector(".urs-backdrop").onclick=close;
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
      showUtilityRequeryStatusModal("pending",t,data);
      await load();
    }else if(data?.status){
      const status=String(data.status).toLowerCase();
      const kind=["approved","success","successful","completed"].includes(status)?"approved":status==="rejected"||status==="declined"?"rejected":["failed","failure","cancelled","canceled"].includes(status)?"failed":"pending";
      if(button)button.textContent=String(data.status).replace(/_/g," ").replace(/\b\w/g,m=>m.toUpperCase());
      showUtilityRequeryStatusModal(kind,t,data);
      await load();
    }else{
      showUtilityRequeryStatusModal("pending",t,{message:"The provider returned no final status. No additional debit was made."});
      await load();
    }
  }catch(e){
    console.error("Utility requery failed:",e);
    showUtilityRequeryStatusModal("pending",t,{message:e?.message||"Unable to confirm the final status. Please try again later."});
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
function showReceipt(t){closeReceipt();const amount=Math.abs(Number(t.amount||0)),credit="credit"===String(t.direction||"").toLowerCase();const date=t.created_at?new Date(t.created_at).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true}):"—";const type=String(t.type||"Transaction").replace(/_/g," ");const u=utilityDetails(t);const details=u.isUtility?'<div class="statement-receipt-section"><strong>Utility details</strong><div class="statement-receipt-grid">'+[['Service',u.service.toUpperCase()],['Provider',u.provider],['Meter / Receiver',u.receiver],['Meter type',u.meterType.toUpperCase()],['Customer',u.customerName],['Customer address',u.customerAddress],['Purchase amount',u.purchaseAmount!==""?money(u.purchaseAmount):""],['Service charge',u.serviceCharge!==""?money(u.serviceCharge):""],['Utility receipt',u.receipt],['Provider reference',u.providerRef],['Units',u.units!==""?String(u.units):""]].filter(x=>x[1]).map(x=>'<div><span>'+escapeHtml(x[0])+'</span><b>'+escapeHtml(x[1])+'</b></div>').join("")+(u.token?'<div class="token-row"><span>Electricity token</span><b>'+escapeHtml(u.token)+'</b></div>':"")+'</div></div>':"";const wrap=document.createElement("div");wrap.id="statementReceipt";wrap.innerHTML='<div class="statement-receipt-backdrop"></div><section class="statement-receipt-sheet" role="dialog" aria-modal="true"><button type="button" class="statement-receipt-close" aria-label="Close">×</button><div class="statement-receipt-head"><div class="statement-receipt-brand">HABSCO</div><span>OFFICIAL TRANSACTION DOCUMENT</span><strong>'+escapeHtml(u.isUtility?"Utility Transaction Receipt":"Transaction Receipt")+'</strong></div><div class="statement-receipt-body"><div class="statement-receipt-line"><span>Date</span><b>'+escapeHtml(date)+'</b></div><div class="statement-receipt-line"><span>Reference</span><b>'+escapeHtml(t.reference||"—")+'</b></div><div class="statement-receipt-line"><span>Transaction type</span><b>'+escapeHtml(type)+'</b></div><div class="statement-receipt-line"><span>Description</span><b>'+escapeHtml(t.description||type)+'</b></div>'+details+'<div class="statement-receipt-amount '+(credit?"credit":"debit")+'">'+(credit?"+":"−")+" "+money(amount)+'</div><div class="statement-receipt-status">Status: '+escapeHtml(String(t.status||"approved").replace(/_/g," "))+'</div></div><div class="statement-receipt-actions"><button type="button" class="statement-receipt-share">EXPORT PDF</button></div></section>';document.body.appendChild(wrap);wrap.querySelector(".statement-receipt-close").onclick=closeReceipt;wrap.querySelector(".statement-receipt-backdrop").onclick=closeReceipt;wrap.querySelector(".statement-receipt-share").onclick=()=>printStatementReceipt(t)}
async function loadReceiptJsPdf(){
  if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;
  return await new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-habsco-jspdf="1"]');
    if(existing){
      existing.addEventListener("load",()=>window.jspdf?.jsPDF?resolve(window.jspdf.jsPDF):reject(new Error("PDF library failed to load")));
      existing.addEventListener("error",()=>reject(new Error("Unable to load PDF exporter. Check your internet connection and try again.")));
      if(window.jspdf?.jsPDF)resolve(window.jspdf.jsPDF);
      return;
    }
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.async=true;s.dataset.habscoJspdf="1";
    s.onload=()=>window.jspdf?.jsPDF?resolve(window.jspdf.jsPDF):reject(new Error("PDF library failed to load"));
    s.onerror=()=>reject(new Error("Unable to load PDF exporter. Check your internet connection and try again."));
    document.head.appendChild(s);
  });
}
async function printStatementReceipt(t){
  try{
    const JsPDF=await loadReceiptJsPdf();
    const u=utilityDetails(t);
    const doc=new JsPDF({unit:"mm",format:"a4"});
    const pageW=210,pageH=297,margin=16;
    let y=margin;
    const green=[8,116,67],muted=[113,128,121],ink=[23,34,28];
    const escPdf=v=>String(v??"").replace(/\\/g,"/");
    const date=t.created_at?new Date(t.created_at).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}):"—";
    const credit=String(t.direction||"").toLowerCase()==="credit";
    const amount=(credit?"+ ":"− ")+money(Math.abs(Number(t.amount||0)));
    const addText=(label,value)=>{
      if(value===undefined||value===null||String(value)==="")return;
      if(y>pageH-margin-12){doc.addPage();y=margin;}
      doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(...muted);doc.text(String(label),margin,y);
      doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(...ink);
      const lines=doc.splitTextToSize(escPdf(value),pageW-margin*2-42);
      doc.text(lines,pageW-margin,y,{align:"right",maxWidth:pageW-margin*2-42});
      y+=Math.max(6,lines.length*4)+1;
      doc.setDrawColor(237,241,238);doc.line(margin,y-2,pageW-margin,y-2);
    };
    doc.setTextColor(...green);doc.setFont("helvetica","bold");doc.setFontSize(20);doc.text("HABSCO",margin,y);
    y+=8;doc.setFontSize(13);doc.text(u.isUtility?"UTILITY TRANSACTION RECEIPT":"TRANSACTION RECEIPT",margin,y);
    y+=5;doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.setTextColor(...muted);doc.text("OFFICIAL TRANSACTION DOCUMENT",margin,y);
    y+=7;doc.setDrawColor(8,116,67);doc.line(margin,y,pageW-margin,y);y+=8;
    addText("Date",date);
    addText("Reference",t.reference||"—");
    addText("Transaction type",String(t.type||"Transaction").replace(/_/g," "));
    addText("Description",t.description||t.type||"Transaction");
    if(u.isUtility){
      y+=3;doc.setFont("helvetica","bold");doc.setFontSize(9);doc.setTextColor(...green);doc.text("UTILITY DETAILS",margin,y);y+=6;
      addText("Service",u.service.toUpperCase());
      addText("Provider",u.provider);
      addText("Meter / Receiver",u.receiver);
      addText("Meter Type",u.meterType.toUpperCase());
      addText("Customer",u.customerName);
      addText("Customer Address",u.customerAddress);
      if(u.purchaseAmount!=="")addText("Purchase Amount",money(u.purchaseAmount));
      if(u.serviceCharge!=="")addText("Service Charge",money(u.serviceCharge));
      addText("Utility Receipt",u.receipt);
      addText("Provider Reference",u.providerRef);
      if(u.units!=="")addText("Units",String(u.units));
      if(u.token){
        if(y>pageH-margin-30){doc.addPage();y=margin;}
        y+=5;doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(...green);doc.text("ELECTRICITY TOKEN",margin,y);y+=5;
        doc.setFontSize(12);const lines=doc.splitTextToSize(escPdf(u.token),pageW-margin*2);doc.text(lines,margin,y);y+=Math.max(8,lines.length*5);
      }
    }
    if(y>pageH-margin-28){doc.addPage();y=margin;}
    y+=8;doc.setFont("helvetica","bold");doc.setFontSize(18);doc.setTextColor(...(credit?green:[163,53,53]));doc.text(amount,pageW/2,y,{align:"center"});
    y+=7;doc.setFontSize(8);doc.setTextColor(...muted);doc.text("Status: "+String(t.status||"approved").replace(/_/g," "),pageW/2,y,{align:"center"});
    doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(...muted);doc.text("HABSCO • habscosadaqah.org",margin,pageH-8);
    const stamp=new Date().toISOString().replace(/[:.]/g,"-").slice(0,19);
    doc.save("HABSCO-Receipt-"+stamp+".pdf");
  }catch(e){
    console.error("Receipt PDF export failed:",e);
    alert(e?.message||"Unable to export receipt PDF.");
  }
}

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
  apply&&(apply.onclick=()=>{expanded=false;render()});more&&(more.onclick=()=>{expanded=!expanded;render()});from&&from.addEventListener("change",()=>{expanded=false;render()});to&&to.addEventListener("change",()=>{expanded=false;render()});async function loadJsPdf(){
  if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;
  return await new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-habsco-jspdf="1"]');
    if(existing){existing.addEventListener("load",()=>resolve(window.jspdf?.jsPDF));existing.addEventListener("error",reject);return;}
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.async=true;s.dataset.habscoJspdf="1";
    s.onload=()=>window.jspdf?.jsPDF?resolve(window.jspdf.jsPDF):reject(new Error("PDF library failed to load"));
    s.onerror=()=>reject(new Error("Unable to load PDF exporter. Check your internet connection and try again."));
    document.head.appendChild(s);
  });
}
async function exportStatementPdf(){
  const JsPDF=await loadJsPdf();
  const from=$("fromDate")?.value||"";
  const to=$("toDate")?.value||"";
  const rows=allRows.filter(x=>inRange(x.created_at,from,to));
  const auth=await getUserWithTimeout(supabaseClient);
  const user=auth?.data?.user;
  if(!user)throw new Error("Please sign in to export your statement.");
  const profileResult=await Promise.race([
    supabaseClient.from("profiles").select("*").eq("id",user.id).maybeSingle(),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error("Member information request timed out")),8000))
  ]);
  if(profileResult.error)throw profileResult.error;
  const p=profileResult.data||{};
  const memberName=String(p.full_name||p.name||[p.first_name,p.middle_name,p.last_name].filter(Boolean).join(" ")||user.user_metadata?.full_name||user.email||"HABSCO Member");
  const memberId=String(p.member_id||p.memberId||"—");
  const phone=String(p.phone||p.phone_number||p.mobile||user.phone||"—");
  const email=String(p.email||user.email||"—");
  const address=String(p.address||p.residential_address||"");
  let currentBalance=0;
  try{
    const w=await supabaseClient.from("wallets").select("balance").eq("user_id",user.id).maybeSingle();
    if(!w.error)currentBalance=Number(w.data?.balance||0);
  }catch(_){}
  const doc=new JsPDF({unit:"mm",format:"a4"});
  const pageW=210,pageH=297,margin=14;
  let y=margin;
  const green=[8,116,67],muted=[113,128,121],ink=[23,34,28],line=[224,234,228];
  const datePdf=v=>v?new Date(v).toLocaleString("en-NG",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}):"—";
  const shortDate=v=>v?new Date(v).toLocaleDateString("en-NG",{day:"2-digit",month:"short",year:"numeric"}):"—";
  const addHeader=()=>{
    doc.setTextColor(...green);doc.setFont("helvetica","bold");doc.setFontSize(20);doc.text("HABSCO",margin,y);
    doc.setFontSize(8);doc.setTextColor(...muted);doc.setFont("helvetica","normal");doc.text("habscosadaqah.org",pageW-margin,y,{align:"right"});
    y+=8;doc.setFont("helvetica","bold");doc.setFontSize(13);doc.setTextColor(...ink);doc.text("STATEMENT OF ACCOUNT",margin,y);
    y+=5;doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.setTextColor(...muted);
    const range=(from||to)?("Statement period: "+(shortDate(from)||"All")+" — "+(shortDate(to)||"All")):"Statement period: All transactions";
    doc.text(range,margin,y);y+=5;doc.setDrawColor(...green);doc.line(margin,y,pageW-margin,y);y+=7;
  };
  const addFooter=()=>{
    doc.setFont("helvetica","normal");doc.setFontSize(6.5);doc.setTextColor(...muted);
    doc.text("HABSCO Sadaqah Jariyah Development Trust • habscosadaqah.org",margin,pageH-7);
    doc.text("Page "+doc.getNumberOfPages(),pageW-margin,pageH-7,{align:"right"});
  };
  const ensure=(needed=12)=>{if(y+needed>pageH-margin-10){addFooter();doc.addPage();y=margin;addHeader();}};
  addHeader();
  doc.setFillColor(248,251,249);doc.setDrawColor(...line);doc.roundedRect(margin,y,pageW-margin*2,35,3,3,"FD");
  doc.setFont("helvetica","bold");doc.setFontSize(9);doc.setTextColor(...green);doc.text("MEMBER INFORMATION",margin+5,y+7);
  const info=[
    ["Member Name",memberName],["Member ID",memberId],["Phone",phone],["Email",email]
  ];
  if(address)info.push(["Address",address]);
  let iy=y+13;
  info.forEach((a,i)=>{
    const col=i%2,row=Math.floor(i/2),x=margin+5+col*86;
    doc.setFont("helvetica","normal");doc.setFontSize(6.5);doc.setTextColor(...muted);doc.text(a[0],x,iy+row*8);
    doc.setFont("helvetica","bold");doc.setFontSize(7.5);doc.setTextColor(...ink);
    doc.text(doc.splitTextToSize(String(a[1]),78),x,iy+3+row*8,{maxWidth:78});
  });
  y+=42;
  ensure(28);
  doc.setFillColor(248,251,249);doc.setDrawColor(...line);doc.roundedRect(margin,y,pageW-margin*2,22,3,3,"FD");
  doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(...muted);doc.text("OPENING BALANCE",margin+5,y+7);doc.text("CLOSING BALANCE",pageW/2+5,y+7);
  const opening=rows.length?Number(rows[rows.length-1]._before||0):currentBalance;
  const closing=rows.length?Number(rows[0]._after||0):currentBalance;
  doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(...ink);doc.text(money(opening),margin+5,y+15);doc.text(money(closing),pageW/2+5,y+15);
  y+=29;
  ensure(18);
  doc.setFont("helvetica","bold");doc.setFontSize(9);doc.setTextColor(...green);doc.text("TRANSACTION SUMMARY",margin,y);y+=5;
  let credits=0,debits=0,creditCount=0,debitCount=0;
  rows.forEach(x=>{const a=Math.abs(Number(x.amount||0));if(String(x.direction||"").toLowerCase()==="credit"){credits+=a;creditCount++;}else{debits+=a;debitCount++;}});
  doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.setTextColor(...muted);
  doc.text("Credits: "+money(credits)+" ("+creditCount+")",margin,y);
  doc.text("Debits: "+money(debits)+" ("+debitCount+")",pageW/2,y);
  y+=9;
  ensure(18);
  doc.setFillColor(8,116,67);doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");doc.setFontSize(7);
  doc.rect(margin,y,pageW-margin*2,8,"F");
  doc.text("DATE / TIME",margin+3,y+5.2);doc.text("DESCRIPTION / REFERENCE",margin+39,y+5.2);doc.text("TYPE",pageW-67,y+5.2);doc.text("AMOUNT",pageW-39,y+5.2);doc.text("BALANCE",pageW-3,y+5.2,{align:"right"});
  y+=12;
  if(!rows.length){
    doc.setTextColor(...muted);doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text("No transactions found for the selected period.",margin,y);
  }
  rows.forEach((x,i)=>{
    ensure(22);
    const credit=String(x.direction||"").toLowerCase()==="credit";
    const a=Math.abs(Number(x.amount||0));
    const um=utilityDetails(x);
    const title=um.isUtility?(um.service==="power"||um.service==="electricity"?"Electricity":um.service==="tv"?"TV Subscription":um.service?um.service.charAt(0).toUpperCase()+um.service.slice(1):"Utility"):String(x.type||"Transaction").replace(/_/g," ");
    const ref=String(x.reference||"—");
    const desc=String(x.description||"").trim();
    const detail=(desc?desc+" • ":"")+ref;
    const lines=doc.splitTextToSize(detail,78);
    const h=Math.max(12,lines.length*3.5+4);
    ensure(h+2);
    doc.setFont("helvetica","normal");doc.setFontSize(6.2);doc.setTextColor(...muted);doc.text(datePdf(x.created_at),margin+3,y);
    doc.setFont("helvetica","bold");doc.setFontSize(7);doc.setTextColor(...ink);doc.text(doc.splitTextToSize(lines,78),margin+39,y);
    doc.setFont("helvetica","normal");doc.setFontSize(6.5);doc.setTextColor(...muted);doc.text(credit?"CR":"DR",pageW-67,y);
    doc.setFont("helvetica","bold");doc.setFontSize(7);doc.setTextColor(...(credit?green:[163,53,53]));doc.text((credit?"+ ":"− ")+money(a),pageW-39,y);
    doc.setTextColor(...ink);doc.text(money(Number(x._after||0)),pageW-3,y,{align:"right"});
    y+=h;
    if(um.isUtility){
      const util=[["Provider",um.provider],["Receiver",um.receiver],["Meter",um.meterType],["Customer",um.customerName]];
      util.filter(a=>a[1]).forEach(a=>{ensure(7);doc.setFont("helvetica","normal");doc.setFontSize(5.8);doc.setTextColor(...muted);doc.text(a[0]+": "+String(a[1]),margin+39,y);y+=3;});
      if(um.token){ensure(9);doc.setFont("helvetica","bold");doc.setFontSize(5.8);doc.setTextColor(...green);doc.text("Token: "+String(um.token),margin+39,y);y+=4;}
    }
    doc.setDrawColor(...line);doc.line(margin,y,pageW-margin,y);y+=3;
  });
  ensure(18);y+=3;doc.setFont("helvetica","normal");doc.setFontSize(6.5);doc.setTextColor(...muted);
  doc.text("This statement is generated electronically for the member's records. Please retain it for your records.",margin,y);
  addFooter();
  const stamp=new Date().toISOString().slice(0,10);
  doc.save("HABSCO-Statement-"+memberId+"-"+(from||"all")+"-"+(to||"all")+".pdf");
}

print&&(print.onclick=async()=>{
  expanded=true;render();
  const old=document.getElementById("statementPrintProgress");if(old)old.remove();
  const overlay=document.createElement("div");overlay.id="statementPrintProgress";
  overlay.innerHTML='<div class="statement-print-progress-card"><div class="statement-print-progress-icon">📄</div><strong>Exporting Statement</strong><span>Your statement PDF will download directly to your device.</span><button type="button" id="statementPrintNow">EXPORT PDF</button><button type="button" id="statementPrintCancel">CANCEL</button></div>';
  document.body.appendChild(overlay);
  const cleanup=()=>{overlay.remove();expanded=false;render()};
  overlay.querySelector("#statementPrintCancel").onclick=cleanup;
  overlay.querySelector("#statementPrintNow").onclick=async()=>{
    const btn=overlay.querySelector("#statementPrintNow");btn.disabled=true;btn.textContent="EXPORTING…";
    try{await exportStatementPdf();cleanup();}
    catch(e){console.error("PDF export failed:",e);btn.disabled=false;btn.textContent="EXPORT PDF";alert(e?.message||"Unable to export PDF.");}
  };
});
  load();startStatementSync();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
(function addReceiptStyle(){if(document.getElementById("statement-receipt-style"))return;const s=document.createElement("style");s.id="statement-receipt-style";s.textContent=".statement-print-progress-card{width:min(340px,calc(100vw - 32px));background:#fff;border:1px solid #dce9e1;border-radius:18px;padding:22px;text-align:center;box-shadow:0 18px 55px rgba(0,0,0,.18);display:flex;flex-direction:column;gap:8px}.statement-print-progress-icon{font-size:34px}.statement-print-progress-card strong{font-size:15px;color:#087443}.statement-print-progress-card span{font-size:9px;color:#718079;line-height:1.5}.statement-print-progress-card button{width:100%;height:40px;border:0;border-radius:10px;font-size:9px;font-weight:900;cursor:pointer}.statement-print-progress-card button:first-of-type{background:#087443;color:#fff}.statement-print-progress-card button:last-of-type{background:#eef3ef;color:#34443c}#statementPrintProgress{position:fixed;inset:0;background:rgba(3,35,22,.48);z-index:300000;display:flex;align-items:center;justify-content:center;padding:16px}.utility-token{margin-top:3px;font-size:6.5px;line-height:1.25;color:#087443;max-width:100%;overflow-wrap:anywhere;word-break:break-word}.utility-token strong{font-weight:900;letter-spacing:.25px;font-size:7px}.statement-receipt-section{margin-top:10px;padding:10px;border:1px solid #dce9e1;border-radius:10px;background:#f8fbf9}.statement-receipt-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px}.statement-receipt-grid>div{display:flex;flex-direction:column;gap:2px;font-size:8px}.statement-receipt-grid span{color:#718079}.statement-receipt-grid b{font-weight:850;overflow-wrap:anywhere}.statement-receipt-grid .token-row{grid-column:1/-1;padding:8px;border-radius:7px;background:#edf7f1}.statement-receipt-grid .token-row b{font-size:13px;letter-spacing:1px;color:#087443}.statement-receipt-backdrop{position:fixed;inset:0;background:rgba(20,45,34,.52);z-index:200}.statement-receipt-sheet{position:fixed;z-index:201;left:50%;top:50%;transform:translate(-50%,-50%);width:min(794px,calc(100vw - 20px));height:min(1123px,calc(100vh - 20px));max-height:calc(100vh - 20px);box-sizing:border-box;overflow:auto;background:#fff;border:1px solid #dce9e1;border-radius:4px;padding:34px 38px;box-shadow:0 20px 70px rgba(0,0,0,.24);color:#17221c}.statement-receipt-close{position:absolute;right:10px;top:9px;width:30px;height:30px;border:0;border-radius:50%;background:#f1f6f3;color:#52635b;font-size:20px;line-height:1}.statement-receipt-head{display:flex;flex-direction:column;gap:2px;padding-right:35px;border-bottom:1px solid #edf1ee;padding-bottom:12px}.statement-receipt-head strong{font-size:20px;color:#087443}.statement-receipt-head span{font-size:8px;letter-spacing:1px;color:#718079;font-weight:850}.statement-receipt-body{padding:18px 0}.statement-receipt-line{display:flex;justify-content:space-between;gap:12px;padding:8px 0;font-size:9px;border-bottom:1px solid #f0f3f1}.statement-receipt-line span{color:#718079}.statement-receipt-line b{text-align:right;max-width:68%;overflow-wrap:anywhere}.statement-receipt-amount{font-size:20px;font-weight:900;text-align:center;padding:15px 0 7px}.statement-receipt-status{text-align:center;font-size:8px;color:#718079;text-transform:capitalize}.statement-receipt-actions{padding-top:12px;position:sticky;bottom:0;background:#fff}.statement-receipt-share{width:100%;height:44px;border:0;border-radius:10px;background:#087443;color:#fff;font-size:10px;font-weight:900}.statement-receipt-amount.credit{color:#087443}.statement-receipt-amount.debit{color:#a33535}.activity-requery{border:1px solid #087443;background:#fff;color:#087443;border-radius:8px;padding:5px 9px;font-size:8px;font-weight:900;cursor:pointer}.activity-requery:disabled{opacity:.65;cursor:wait}.activity-requery.is-loading{min-width:58px}.utility-history-item .utility-history-meta{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2px 8px;margin-top:2px;font-size:9px;line-height:1.2;color:#718079;min-width:0}.utility-history-item .utility-history-meta>span{min-width:0;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.utility-history-item .utility-history-meta strong{font-size:9px;line-height:1.2;color:#718079;font-weight:600;overflow-wrap:anywhere}.utility-token-pending{color:#a56b00}.activity-receipt-row{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}@media(max-width:600px){.statement-receipt-sheet{width:calc(100vw - 14px);height:calc(100vh - 14px);padding:22px 18px;border-radius:10px}.statement-receipt-head strong{font-size:17px}.statement-receipt-grid{grid-template-columns:1fr}.statement-receipt-grid .token-row{grid-column:auto}.statement-receipt-grid .token-row b{font-size:11px}.statement-receipt-line{align-items:flex-start}.statement-receipt-line b{max-width:62%;font-size:8px}.utility-history-item .utility-history-meta{font-size:7.5px;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2px 6px}.utility-history-item .utility-history-meta strong{font-size:7.5px;font-weight:600;color:#718079}.utility-token{font-size:6px;line-height:1.2}.utility-token strong{font-size:6.5px;letter-spacing:.1px;display:block;max-width:100%;overflow-wrap:anywhere;word-break:break-word}}";document.head.appendChild(s)})();
