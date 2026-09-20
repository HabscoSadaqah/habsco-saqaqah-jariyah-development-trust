(()=>{"use strict";
const q=s=>document.querySelector(s);
const status=t=>{const e=q("#status");if(e){e.textContent=t;e.className="status show err"}};
const ok=t=>{const e=q("#status");if(e){e.textContent=t;e.className="status show ok"}};
const pin=id=>q(id)?.value?.trim()||"";
const busy=(b,v)=>{if(!b)return;b.disabled=v;b.dataset.oldText=b.dataset.oldText||b.textContent;b.textContent=v?"Processing…":b.dataset.oldText};
async function call(body){if(!window.supabase||typeof supabase?.functions?.invoke!=="function")throw Error("Payment service is not ready. Refresh the page.");const {data,error}=await supabase.functions.invoke("utility-vps-proxy",{body});if(error){let detail="";try{detail=error.context?JSON.stringify(await error.context.json()):""}catch{}throw Error(detail||error.message||"Utility service request failed.")}return data||{}}
function providerFor(kind){
 const map={airtime:"[data-provider]",data:"[data-data-provider]",tv:"[data-tv-provider]",education:"[data-education-provider]"};
 const sel=map[kind];const a=sel?document.querySelector(sel+".active"):null;
 return a?.dataset?.provider||a?.dataset?.dataProvider||a?.dataset?.tvProvider||a?.dataset?.educationProvider||"";
}
async function purchase(kind){
 const p=providerFor(kind);if(!p){status("Select a provider first.");return null}
 let body={action:kind,provider:p};
 if(kind==="airtime"){body.receiver=q("#airtimePhone")?.value.trim()||"";body.amount=Number(q("#airtimeAmount")?.value);body.transaction_pin=pin("airtimePin");if(!/^\+?234\d{10}$|^0\d{10}$/.test(body.receiver))return status("Enter a valid Nigerian phone number.");if(!Number.isFinite(body.amount)||body.amount<=0)return status("Enter a valid airtime amount.")}
 if(kind==="data"){body.receiver=q("#dataPhone")?.value.trim()||"";body.code=q("#dataPackage")?.value||"";body.transaction_pin=pin("dataPin");if(!body.code)return status("Select a data package.")}
 if(kind==="tv"){body.receiver=q("#tvReceiver")?.value.trim()||"";body.package=q("#tvPackage")?.value||"";body.phone_number=q("#tvPhone")?.value.trim()||"";body.email=q("#tvEmail")?.value.trim()||"";body.transaction_pin=pin("tvPin");if(!body.package)return status("Select a TV package.")}
 if(kind==="education"){body.receiver=q("#educationReceiver")?.value.trim()||"";body.code=q("#educationPackage")?.value||"";body.phone_number=q("#educationPhone")?.value.trim()||"";body.email=q("#educationEmail")?.value.trim()||"";body.transaction_pin=pin("educationPin");if(!body.code)return status("Select an education package.")}
 if(!/^\d{6}$/.test(body.transaction_pin))return status("Enter your 6-digit transaction PIN.");
 if(!body.receiver)return status("Enter the required receiver/account number.");
 return call(body);
}
async function power(){
 const provider=q("#powerProvider")?.value||"",meter=q("#powerMeter")?.value.trim()||"",amount=Number(q("#powerAmount")?.value),phone=q("#powerPhone")?.value.trim()||"",email=q("#powerEmail")?.value.trim()||"",transaction_pin=pin("powerPin"),meter_type=q("#powerMeterType")?.value||"PREPAID";
 if(!provider||!meter)return status("Select the distribution company and enter the meter number.");
 if(!Number.isFinite(amount)||amount<=0)return status("Enter a valid electricity amount.");
 if(!/^\d{6}$/.test(transaction_pin))return status("Enter your 6-digit transaction PIN.");
 return call({action:"power",provider,receiver:meter,amount,meter_type,phone_number:phone,email,transaction_pin});
}
async function finish(btn,fn){
 busy(btn,true);
 try{const d=await fn();if(!d)return;
  if(d.pending){ok("Purchase accepted and is being processed. We will reconcile the transaction automatically.");return}
  if(d.success)ok("Purchase completed successfully.");
  else status(d.error||d.message||"Purchase failed.");
 }catch(e){status(e?.message||"Utility purchase failed.");}
 finally{busy(btn,false)}
}
function bind(){
 const defs=[["airtimePay",()=>purchase("airtime")],["dataPay",()=>purchase("data")],["tvPay",()=>purchase("tv")],["educationPay",()=>purchase("education")],["powerPay",power]];
 for(const [id,fn] of defs){const b=q("#"+id);if(!b||b.dataset.vpsBound==="1")continue;b.dataset.vpsBound="1";b.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();finish(b,fn)},true)}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();