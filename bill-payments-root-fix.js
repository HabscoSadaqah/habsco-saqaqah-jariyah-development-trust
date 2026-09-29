(()=>{"use strict";
const q=s=>document.querySelector(s);
const status=t=>{const e=q("#status");if(e){e.textContent=t;e.className="status show err";}};
const ok=t=>{const e=q("#status");if(e){e.textContent=t;e.className="status show ok";}};
const pin=id=>q(id)?.value?.trim()||"";
const busy=(b,v)=>{if(!b)return;b.disabled=v;b.dataset.oldText=b.dataset.oldText||b.textContent;b.textContent=v?"Processing…":b.dataset.oldText};
function money(n){return "₦"+Number(n||0).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2})}
function amountFor(kind){
 if(kind==="airtime")return Number(q("#airtimeAmount")?.value||0);
 if(kind==="power")return Number(q("#powerAmount")?.value||0);
 const id=kind==="data"?"#dataPackage":kind==="tv"?"#tvPackage":"#educationPackage";
 const s=q(id)?.selectedOptions?.[0]?.textContent||"";
 const m=s.match(/₦\s*([\d,]+(?:\.\d+)?)/);
 return m?Number(m[1].replace(/,/g,"")):0;
}
function ensureNotice(){
 if(q("#serviceChargeNotice"))return q("#serviceChargeNotice");
 const s=document.createElement("style");
 s.textContent="#serviceChargeNotice{position:fixed;inset:0;background:rgba(6,59,41,.34);display:none;align-items:center;justify-content:center;padding:18px;z-index:99999;backdrop-filter:blur(3px)}#serviceChargeNotice.show{display:flex}#serviceChargeNotice .sc-card{width:min(390px,100%);background:#fff;border:1px solid #dfe9e3;border-radius:18px;padding:20px;box-shadow:0 20px 55px rgba(0,0,0,.18)}#serviceChargeNotice h3{margin:0 0 8px;color:#063b29;font-size:17px}#serviceChargeNotice p{margin:0;color:#56635c;font-size:12px;line-height:1.55}.sc-total{margin:14px 0;padding:12px;border-radius:12px;background:#edf8f2;color:#063b29;font-size:12px;line-height:1.7}.sc-total strong{font-size:14px}.sc-actions{display:flex;gap:8px;margin-top:14px}.sc-actions button{flex:1;height:44px;border-radius:10px;font-weight:900;border:1px solid #dfe9e3;background:#fff;color:#56635c}.sc-actions .sc-confirm{background:#087443;border-color:#087443;color:#fff}";
 document.head.appendChild(s);
 const w=document.createElement("div");w.id="serviceChargeNotice";w.innerHTML='<div class="sc-card" role="dialog" aria-modal="true" aria-labelledby="scTitle"><h3 id="scTitle">Service charge notice</h3><p>A <strong>10% service charge</strong> will be deducted from your wallet for this utility purchase.</p><div class="sc-total"><div>Purchase amount: <strong id="scPurchase">₦0.00</strong></div><div>Service charge (10%): <strong id="scFee">₦0.00</strong></div><div>Total deduction: <strong id="scTotal">₦0.00</strong></div></div><div class="sc-actions"><button type="button" id="scCancel">Cancel</button><button type="button" class="sc-confirm" id="scConfirm">Confirm & Continue</button></div></div>';
 document.body.appendChild(w);
 w.addEventListener("click",e=>{if(e.target===w)w.classList.remove("show")});
 q("#scCancel").onclick=()=>w.classList.remove("show");
 return w;
}
function confirmCharge(kind){
 const purchase=amountFor(kind);
 if(!Number.isFinite(purchase)||purchase<=0){status("Enter/select a valid purchase amount.");return Promise.resolve(false)}
 const fee=Math.round(purchase*0.10*100)/100,total=Math.round((purchase+fee)*100)/100,w=ensureNotice();
 q("#scPurchase").textContent=money(purchase);q("#scFee").textContent=money(fee);q("#scTotal").textContent=money(total);
 w.classList.add("show");
 return new Promise(resolve=>{const btn=q("#scConfirm");const done=v=>{w.classList.remove("show");btn.onclick=null;resolve(v)};btn.onclick=()=>done(true);q("#scCancel").onclick=()=>done(false)});
}
async function call(body,functionName="utility-vps-proxy-v2"){if(!window.supabase||typeof supabase?.functions?.invoke!=="function")throw Error("Payment service is not ready. Refresh the page.");const {data,error}=await supabase.functions.invoke(functionName,{body});if(error){let detail="";try{detail=error.context?JSON.stringify(await error.context.json()):""}catch{}throw Error(detail||error.message||"Utility service request failed.")}return data||{}}
function providerFor(kind){const map={airtime:"[data-provider]",data:"[data-data-provider]",tv:"[data-tv-provider]",education:"[data-education-provider]"};const sel=map[kind];const a=sel?document.querySelector(sel+".active"):null;return a?.dataset?.provider||a?.dataset?.dataProvider||a?.dataset?.tvProvider||a?.dataset?.educationProvider||""}
async function purchase(kind){
 const p=providerFor(kind);if(!p){status("Select a provider first.");return null}
 let body={action:kind,provider:p};
 if(kind==="airtime"){body.receiver=q("#airtimePhone")?.value.trim()||"";body.amount=Number(q("#airtimeAmount")?.value);body.transaction_pin=pin("airtimePin");if(!/^\+?234\d{10}$|^0\d{10}$/.test(body.receiver))return status("Enter a valid Nigerian phone number.");if(!Number.isFinite(body.amount)||body.amount<=0)return status("Enter a valid airtime amount.")}
 if(kind==="data"){body.receiver=q("#dataPhone")?.value.trim()||"";body.code=q("#dataPackage")?.value||"";body.transaction_pin=pin("dataPin");if(!body.code)return status("Select a data package.")}
 if(kind==="tv"){body.receiver=q("#tvReceiver")?.value.trim()||"";body.package=q("#tvPackage")?.value||"";body.phone_number=q("#tvPhone")?.value.trim()||"";body.email=q("#tvEmail")?.value.trim()||"";body.transaction_pin=pin("tvPin");if(!body.package)return status("Select a TV package.")}
 if(kind==="education"){body.receiver=q("#educationReceiver")?.value.trim()||"";body.code=q("#educationPackage")?.value||"";body.phone_number=q("#educationPhone")?.value.trim()||"";body.email=q("#educationEmail")?.value.trim()||"";body.transaction_pin=pin("educationPin");if(!body.code)return status("Select an education package.")}
 if(!/^\d{6}$/.test(body.transaction_pin))return status("Enter your 6-digit transaction PIN.");
 if(!body.receiver)return status("Enter the required receiver/account number.");
 return call(body,"utility-vps-proxy-v2");
}
async function power(){
 const provider=q("#powerProvider")?.value||"",meter=q("#powerMeter")?.value.trim()||"",amount=Number(q("#powerAmount")?.value),phone=q("#powerPhone")?.value.trim()||"",email=q("#powerEmail")?.value.trim()||"",transaction_pin=pin("powerPin"),meter_type=q("#powerMeterType")?.value||"PREPAID";
 if(!provider||!meter)return status("Select the distribution company and enter the meter number.");
 if(!Number.isFinite(amount)||amount<=0)return status("Enter a valid electricity amount.");
 if(!/^\d{6}$/.test(transaction_pin))return status("Enter your 6-digit transaction PIN.");
 return call({action:"power",provider,receiver:meter,amount,meter_type,phone_number:phone,email,transaction_pin});
}
async function finish(btn,fn,kind){
 busy(btn,true);
 try{const confirmed=await confirmCharge(kind);if(!confirmed)return;const d=await fn();if(!d)return;if(d.pending){ok("Purchase accepted and is being processed. We will reconcile the transaction automatically.");return}if(d.success)ok("Purchase completed successfully.");else status(d.error||d.message||"Purchase failed.");}
 catch(e){status(e?.message||"Utility purchase failed.");}
 finally{busy(btn,false)}
}
function bind(){
 const defs=[["airtimePay","airtime",()=>purchase("airtime")],["dataPay","data",()=>purchase("data")],["tvPay","tv",()=>purchase("tv")],["educationPay","education",()=>purchase("education")],["powerPay","power",power]];
 for(const [id,kind,fn] of defs){const b=q("#"+id);if(!b||b.dataset.vpsBound==="1")continue;b.dataset.vpsBound="1";b.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();finish(b,fn,kind)},true)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();