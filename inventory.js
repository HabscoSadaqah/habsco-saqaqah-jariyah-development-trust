(()=>{"use strict";
const $=id=>document.getElementById(id),money=n=>"₦"+Number(n||0).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2});
const showFatal=msg=>{const m=$("modal"),w=$("walletBalance");if(w)w.textContent="Unable to connect";if(m){m.classList.add("show");m.setAttribute("aria-hidden","false")}console.error("Wallet Board:",msg);};
if(!window.supabase||typeof window.supabase.createClient!=="function"){showFatal("Supabase client library did not load.");return;}
const URL="https://ythnoeyxovapydbmymdo.supabase.co",KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN",db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

let items=[],rotation=0,drag=null,currentUserId="",isAdmin=false,accessExpiresAt=null,selectedPlan="monthly",editingItemId=null,rotationEnabled=true;
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const transferState={mode:"internal"};const CASH_DENOMS=[10,20,50,100,200,500,1000,2000,5000,10000,20000];
function setTransferStatus(msg,ok=false){const e=$("transferStatus");if(e){e.textContent=msg||"";e.className="transferStatus "+(msg?(ok?"ok":"err"):"")}}
function fillTransferItems(){const s=$("transferSource"),d=$("transferDestination");if(!s||!d)return;const opts=items.map(x=>'<option value="'+x.id+'">'+esc(x.name)+" · "+money(x.amount)+"</option>").join("");d.innerHTML='<option value="">Select destination…</option>'+opts+'<option value="__third_party__">3rd party</option><option value="__third_party_utility__">3rd-party utility → CASH</option>';s.innerHTML=opts;const preferred=items.find(x=>!x.is_system_cash);s.value=(preferred||items[0])?.id||"";toggleThirdPartyFields()}
function denominationTotal(id){return [...document.querySelectorAll("#"+id+" .denom-row")].reduce((n,row)=>{const cb=row.querySelector("input[type=checkbox]"),q=row.querySelector("input[type=number]");return n+(cb?.checked?Number(row.dataset.value||0)*Math.max(0,Number(q?.value||0)):0)},0)}
function denominationData(id){return [...document.querySelectorAll("#"+id+" .denom-row")].filter(row=>row.querySelector("input[type=checkbox]")?.checked).map(row=>({denomination:Number(row.dataset.value||0),quantity:Math.max(0,Number(row.querySelector("input[type=number]")?.value||0))}).filter(x=>x.quantity>0))}
function renderDenominations(id){const box=$(id);if(!box)return;box.innerHTML=CASH_DENOMS.map(v=>'<label class="denom-row" data-value="'+v+'"><input type="checkbox"><span>'+money(v)+'</span><input type="number" min="1" step="1" value="1"></label>').join("");box.querySelectorAll("input").forEach(el=>el.addEventListener("input",recalc))}
function recalc(){const destination=$("transferDestination")?.value||"",isThirdParty=destination==="__third_party__"||destination==="__third_party_utility__",utility=destination==="__third_party_utility__",paid=utility?denominationTotal("paidDenoms"):0,change=utility?denominationTotal("changeDenoms"):0,accountAmount=utility?Math.max(0,paid-change):Math.max(0,Number($("transferAmount")?.value||0));if(utility&&$("transferAmount"))$("transferAmount").value=accountAmount?accountAmount.toFixed(2):"";const a=accountAmount,feeEl=isThirdParty?$("thirdPartyServiceFee"):$("serviceFee"),providerEl=isThirdParty?$("thirdPartyProviderFee"):null,discountEl=isThirdParty?$("thirdPartyProviderDiscount"):null,f=Math.max(0,Number(feeEl?.value||0)),providerFee=Math.max(0,Number(providerEl?.value||0)),discountPct=Math.max(0,Number(discountEl?.value||0)),providerDiscount=a*discountPct/100,total=a+f,margin=f-providerFee+providerDiscount;if($("paidTotal"))$("paidTotal").textContent=money(paid);if($("changeTotal"))$("changeTotal").textContent=money(change);if($("accountAmount"))$("accountAmount").textContent=money(accountAmount);if($("feeAmount"))$("feeAmount").textContent=money(a);if($("providerFeeValue"))$("providerFeeValue").textContent=money(providerFee);if($("providerDiscountValue"))$("providerDiscountValue").textContent=money(providerDiscount);if($("feeValue"))$("feeValue").textContent=money(f);if($("totalDebit"))$("totalDebit").textContent=money(total);if($("netServiceMargin"))$("netServiceMargin").textContent=money(margin)}
async function submitTransfer(e){e.preventDefault();const source=$("transferSource").value,dest=$("transferDestination").value,amount=Number($("transferAmount").value),isThirdParty=dest==="__third_party__"||dest==="__third_party_utility__",isUtility=dest==="__third_party_utility__",fee=Math.max(0,Number((isThirdParty?$("thirdPartyServiceFee"):$("serviceFee"))?.value||0)),providerFee=Math.max(0,Number((isThirdParty?$("thirdPartyProviderFee"):null)?.value||0)),discountPct=Math.max(0,Number((isThirdParty?$("thirdPartyProviderDiscount"):null)?.value||0)),providerDiscount=amount*discountPct/100,provider=$("thirdPartyItemName")?.value.trim()||"",accountNumber=$("thirdPartyAccountNumber")?.value.trim()||"",accountName=$("thirdPartyAccountName")?.value.trim()||"";if(isUtility&&(paidTotal<=0||accountAmount<=0))return setTransferStatus("Select the denominations paid and the denominations given as change. Account Amount must be greater than zero.");if(!source||!dest||(isThirdParty&&!provider)||(isThirdParty&&!accountNumber)||(isThirdParty&&!accountName)||(!isThirdParty&&dest===source)||!Number.isFinite(amount)||amount<=0||!Number.isFinite(fee)||!Number.isFinite(providerFee))return setTransferStatus(isThirdParty?"Complete the 3rd-party details and enter valid amount, provider fee and service charge.":"Choose different wallet items and enter valid amount and service fee.");if(!confirm((isThirdParty?"Record 3rd-party transfer to "+provider+" / "+accountNumber+"? ":"Transfer ")+"Amount "+money(amount)+" · Service Charge "+money(fee)+" · Total Debit "+money(amount+fee)+" · Net Service Margin "+money(fee-providerFee+providerDiscount)+"?"))return;const btn=$("transferSubmit");btn.disabled=true;btn.textContent="PROCESSING…";try{const{data,error}=await db.rpc("wallet_board_internal_transfer",{p_source_item_id:source,p_destination_item_id:isThirdParty?null:dest,p_amount:accountAmount,p_service_fee:fee,p_transfer_type:isUtility?"third_party_utility":(isThirdParty?"third_party":"internal"),p_provider_name:isThirdParty?provider:null,p_account_number:isThirdParty?accountNumber:null,p_account_name:isThirdParty?accountName:null,p_provider_fee:isThirdParty?providerFee:0,p_provider_discount:isThirdParty?providerDiscount:0});if(error)throw error;setTransferStatus((isUtility?"3rd-party utility transfer recorded":(isThirdParty?"3rd-party transfer recorded":"Transfer successful"))+" · "+data.reference,true);await loadItems();await loadHistory();$("transferAmount").value="";$("serviceFee").value="0";document.querySelectorAll("#paidDenoms input,#changeDenoms input").forEach(el=>{if(el.type==="checkbox")el.checked=false;else el.value="1"});if($("thirdPartyServiceFee"))$("thirdPartyServiceFee").value="0";if($("thirdPartyProviderFee"))$("thirdPartyProviderFee").value="0";if($("thirdPartyProviderDiscount"))$("thirdPartyProviderDiscount").value="0";if($("thirdPartyItemName"))$("thirdPartyItemName").value="";if($("thirdPartyAccountNumber"))$("thirdPartyAccountNumber").value="";if($("thirdPartyAccountName"))$("thirdPartyAccountName").value="";$("transferDestination").value="";toggleThirdPartyFields();recalc()}catch(err){setTransferStatus(err.message||"Transfer failed")}finally{btn.disabled=false;btn.textContent="TRANSFER"}}
function toggleThirdPartyFields(){const destination=$("transferDestination")?.value||"",third=destination==="__third_party__"||destination==="__third_party_utility__",utility=destination==="__third_party_utility__",box=$("thirdPartyFields");if(box)box.classList.toggle("hidden",!third);const title=$("thirdPartyTitle");if(title)title.textContent=utility?"3rd-party utility details":"3rd-party transfer details";const fee=$("serviceFee"),thirdFee=$("thirdPartyServiceFee"),providerFee=$("thirdPartyProviderFee"),providerDiscount=$("thirdPartyProviderDiscount");if(fee)fee.closest("label").style.display=third?"none":"";if(thirdFee)thirdFee.closest("label").style.display=third?"":"none";if(providerFee)providerFee.closest("label").style.display=third?"":"none";if(providerDiscount)providerDiscount.closest("label").style.display=utility?"":"none";const cashBox=$("cashDenominationBox");if(cashBox)cashBox.classList.toggle("hidden",!utility);if($("totalDebitLabel"))$("totalDebitLabel").textContent=utility?"Total Debit → CASH":"Total Debit";if($("transferStatus")&&!third&&$("transferStatus").textContent.includes("3rd-party"))setTransferStatus("")}
function initTransfer(){renderDenominations("paidDenoms");renderDenominations("changeDenoms");fillTransferItems();$("transferDestination")?.addEventListener("change",()=>{toggleThirdPartyFields();recalc()});$("transferAmount")?.addEventListener("input",recalc);$("serviceFee")?.addEventListener("input",recalc);$("thirdPartyServiceFee")?.addEventListener("input",recalc);$("thirdPartyProviderFee")?.addEventListener("input",recalc);$("thirdPartyProviderDiscount")?.addEventListener("input",recalc);$("transferForm")&&($("transferForm").onsubmit=submitTransfer);recalc()}
function iconFor(name){const n=String(name||"").trim();return n.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()||"◉"}
async function sessionAndRole(){const{data:{session},error}=await db.auth.getSession();if(error||!session){location.href="auth.html";throw Error("Session expired.")}currentUserId=session.user.id;const{data:p,error:e}=await db.from("profiles").select("role,status").eq("id",currentUserId).maybeSingle();if(e)throw e;if(!p||p.status!=="active")throw Error("Active member access required.");isAdmin=p.role==="admin";return session}
function setLocked(locked){document.body.classList.toggle("stock-locked",locked);document.body.classList.toggle("access-ready",!locked);document.body.classList.toggle("access-checking",locked);const board=$("board"),transfer=$("transferCard"),hint=document.querySelector(".hint");if(board)board.style.display=locked?"none":"";if(transfer)transfer.style.display=locked?"none":"";if(hint)hint.style.display=locked?"none":"";const add=$("addBtn");if(add){add.textContent=locked?"🔐 Unlock Add Stock":"＋ Add Stock";add.style.display="inline-flex"}if($("accessStatus"))$("accessStatus").style.display=locked?"none":"flex";const cancel=$("cancelBtn");if(cancel)cancel.style.display=locked&&!isAdmin?"none":"inline-flex"}
function selectPlan(plan){selectedPlan=plan;document.querySelectorAll(".plan").forEach(x=>x.classList.toggle("selected",x.dataset.plan===plan));const p=plan==="monthly"?"₦1,000":"₦10,000";$("payAmount")&&($("payAmount").textContent=p);$("pinWrap")&&($("pinWrap").style.display="block");$("accessContinueBtn")&&($("accessContinueBtn").textContent="PAY "+p)}
async function loadWalletBalance(){
  const el=$("walletBalance");
  if(!el)return;
  el.textContent="Checking…";
  if(!currentUserId){el.textContent="Unable to identify account";return;}
  try{
    const result=await Promise.race([
      db.rpc("member_dashboard_balances"),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error("Wallet balance request timed out.")),5000))
    ]);
    if(result.error)throw result.error;
    const balance=Number(result.data?.available||0);
    el.textContent=Number.isFinite(balance)?money(balance):"₦0.00";
  }catch(e){console.error("Wallet balance:",e);el.textContent="Unable to load";}
}
function startItemEdit(id){
  const x=items.find(i=>i.id===id);if(!x)return;
  editingItemId=x.id;
  $("standaloneItemName").value=x.name||"";
  $("standaloneItemAmount").value=Number(x.amount||0).toFixed(2);
  $("standaloneItemPin").value="";
  $("standaloneItemSubmit").textContent="SAVE CHANGES";
  $("standaloneItemCancelEdit").classList.remove("hidden");
  $("standalonePinCaption").textContent="Enter your 6-digit Transaction PIN to authorize this change.";
  $("standaloneItemError").textContent="";
  setTimeout(()=>$("standaloneItemName")?.focus(),50);
}
function cancelItemEdit(){
  editingItemId=null;
  $("standaloneItemName").value="";$("standaloneItemAmount").value="";$("standaloneItemPin").value="";
  $("standaloneItemSubmit").textContent="ADD ITEM";$("standaloneItemCancelEdit").classList.add("hidden");
  $("standalonePinCaption").textContent="Enter your 6-digit Transaction PIN to authorize this item.";
  $("standaloneItemError").textContent="";
}
function closeModal(){const m=$("modal");if(!m)return;m.classList.remove("show");m.setAttribute("aria-hidden","true");document.body.classList.remove("access-checking");showSorryAndReturnToDashboard();}
function showSorryAndReturnToDashboard(){
  const m=$("flashModal");if(!m){location.href="member.html";return;}
  const icon=$("flashIcon"),t=$("flashTitle"),p=$("flashText"),b=$("flashButton");
  m.classList.add("sorry");
  if(icon)icon.innerHTML='<span class="cry-face" aria-hidden="true">😢</span>';
  if(t)t.textContent="Sorry!";
  if(p)p.textContent="You can return to the main dashboard and come back anytime when you are ready to unlock Add Stock access.";
  if(b){b.textContent="MAIN DASHBOARD";b.onclick=()=>{location.href="member.html"};}
  m.classList.add("show");m.setAttribute("aria-hidden","false");
  setTimeout(()=>{if(m.classList.contains("show"))location.href="member.html"},1600);
}
function bindAccessPlanControls(){
  document.querySelectorAll(".plan[data-plan]").forEach(card=>{
    card.addEventListener("click",()=>selectPlan(card.dataset.plan));
    card.addEventListener("keydown",e=>{
      if(e.key==="Enter"||e.key===" "){e.preventDefault();selectPlan(card.dataset.plan)}
    });
    card.setAttribute("role","button");
    card.setAttribute("tabindex","0");
  });
}
function openAccessModal(){
  const m=$("modal");
  if(!m)return;
  m.dataset.mode="purchase";
  $("modalTitle").textContent="Unlock Add Stock";
  $("modalDescription").textContent="Choose your access period and unlock the Wallet Board immediately after secure payment.";
  $("planArea").style.display="block";
  $("paymentArea").style.display="block";
  $("itemFields").style.setProperty("display","none","important");
  $("adminPinWrap").style.display="none";
  $("accessContinueBtn").textContent="PAY ₦1,000";
  const cancel=$("cancelBtn");
  if(cancel)cancel.style.display="inline-flex";
  m.classList.add("show");
  m.setAttribute("aria-hidden","false");
  $("transactionPin").value="";
  $("pinError").textContent="";
  selectPlan(selectedPlan||"monthly");
  loadWalletBalance();
  setTimeout(()=>$("transactionPin")?.focus(),120);
}
function openAddModal(){if(!isAdmin&&(!accessExpiresAt||document.body.classList.contains("access-checking")||document.body.classList.contains("stock-locked"))){closeAddItemModal();openAccessModal();return}const accessModal=$("modal");if(accessModal?.classList.contains("show")){accessModal.classList.remove("show");accessModal.setAttribute("aria-hidden","true")}const m=$("addItemModal");if(!m)return;cancelItemEdit();renderStandaloneExistingItems();m.classList.add("show");m.setAttribute("aria-hidden","false");setTimeout(()=>$("standaloneItemName")?.focus(),80)}
function closeAddItemModal(){const m=$("addItemModal");if(m){m.classList.remove("show");m.setAttribute("aria-hidden","true")}cancelItemEdit()}
async function purchaseAccess(){const pin=$("transactionPin").value.trim();if(!/^[0-9]{6}$/.test(pin)){ $("pinError").textContent="Enter your 6-digit transaction PIN.";return }const amount=selectedPlan==="monthly"?1000:10000;const{data:balData,error:balError}=await db.rpc("member_dashboard_balances");if(balError){$("pinError").textContent=balError.message||"Unable to verify wallet balance.";return}const walletBalance=Number(balData?.available||0);if(walletBalance<amount){$("pinError").textContent="Insufficient wallet balance for this plan.";return}if(!confirm("Confirm payment of "+money(amount)+" for "+(selectedPlan==="monthly"?"Monthly":"Yearly")+" Add Stock access?"))return;const btn=$("accessContinueBtn");btn.disabled=true;btn.textContent="PROCESSING…";$("pinError").textContent="";try{const{data,error}=await db.rpc("member_purchase_add_stock_access",{p_plan:selectedPlan,p_transaction_pin:pin});if(error)throw error;accessExpiresAt=data.expires_at;setLocked(false);updateCountdown();closeModal();await loadItems();showWelcomeFlash("Congratulations!","Welcome to Add Stock access. Your payment was successful and your Wallet Board is now unlocked.","OPEN WALLET BOARD")}catch(e){$("pinError").textContent=e.message||"Payment failed."}finally{btn.disabled=false;btn.textContent="PAY "+money(amount)}}
function calendarParts(from,to){let y=to.getUTCFullYear()-from.getUTCFullYear(),m=to.getUTCMonth()-from.getUTCMonth(),d=to.getUTCDate()-from.getUTCDate();if(d<0){m--;const prev=new Date(Date.UTC(to.getUTCFullYear(),to.getUTCMonth(),0));d+=prev.getUTCDate()}if(m<0){y--;m+=12}return{y,m,d}}
function updateCountdown(){const el=$("accessCountdown");if(!el||!accessExpiresAt)return;const target=new Date(accessExpiresAt),now=new Date(),ms=Math.max(0,target-now);if(ms<=0){accessExpiresAt=null;el.innerHTML="<b>Access expired</b><span>Please choose a new plan to continue.</span>";setLocked(true);openAccessModal();return}const p=calendarParts(now,target),days=Math.floor(ms/86400000),mins=Math.floor(ms/60000),secs=Math.floor(ms/1000);el.innerHTML="<div class='count-main'>"+p.y+" year"+(p.y===1?"":"s")+" · "+p.m+" month"+(p.m===1?"":"s")+" · "+p.d+" day"+(p.d===1?"":"s")+"</div><div class='count-sub'>"+mins.toLocaleString()+" minutes · "+secs.toLocaleString()+" seconds remaining</div><small>Expires "+target.toLocaleString("en-NG")+"</small>"} 
async function loadAccess(){if(isAdmin){setLocked(false);return}const{data,error}=await db.rpc("member_add_stock_access_status");if(error)throw error;accessExpiresAt=data?.active?data.expires_at:null;if(accessExpiresAt){setLocked(false);updateCountdown();if(window.__accessTimer)clearInterval(window.__accessTimer);window.__accessTimer=setInterval(updateCountdown,1000)}else{setLocked(true);openAccessModal()}}
async function loadItems(){
  if(isAdmin){
    const{data,error}=await db.from("inventory_visual_items").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
    if(error){
      console.error("Wallet Board admin items query failed:",error);
      const fallback=await db.rpc("member_inventory_visual_items");
      if(fallback.error)throw new Error("Unable to load Wallet Board items: "+(error.message||fallback.error.message||"database request failed"));
      items=fallback.data||[];
    }else items=data||[];
  }else{
    const{data,error}=await db.rpc("member_inventory_visual_items");
    if(error)throw new Error("Unable to load Wallet Board items: "+(error.message||"database request failed"));
    items=data||[];
  }
  render();
}
async function load(){
  try{await sessionAndRole()}catch(e){throw new Error("Account check failed: "+(e?.message||"Unable to verify your account."))}
  try{await loadAccess()}catch(e){throw new Error("Add Stock access check failed: "+(e?.message||"Unable to check Add Stock access."))}
  try{await loadItems()}catch(e){throw new Error(e?.message||"Unable to load Wallet Board items.")}
}
function positions(){const n=items.length;if(!n)return[];const rx=Math.min(370,Math.max(170,window.innerWidth*.34)),ry=Math.min(255,Math.max(175,window.innerWidth*.23));return items.map((x,i)=>{const a=i/n*Math.PI*2+rotation-Math.PI/2;return{x:rx*Math.cos(a),y:ry*Math.sin(a),z:Math.sin(a)}})}
function showWelcomeFlash(title,text,buttonText="OPEN WALLET BOARD"){const m=$("flashModal");if(!m)return;const icon=$("flashIcon"),t=$("flashTitle"),p=$("flashText"),b=$("flashButton");m.classList.remove("sorry");m.classList.add("welcome");if(icon)icon.innerHTML='<span class="laugh-face" aria-hidden="true">😂</span>';if(t)t.textContent=title||"Congratulations!";if(p)p.textContent=text||"";if(b){b.textContent=buttonText;b.onclick=()=>{m.classList.remove("show");m.setAttribute("aria-hidden","true");location.hash="wallet-board"}}m.classList.add("show");m.setAttribute("aria-hidden","false")}
function showFlash(type,title,text,buttonText="CONTINUE"){const m=$("flashModal");if(!m)return;const icon=$("flashIcon"),t=$("flashTitle"),p=$("flashText"),b=$("flashButton");if(icon)icon.textContent=type==="success"?"✓":"!";if(t)t.textContent=title||"";if(p)p.textContent=text||"";if(b){b.textContent=buttonText||"CONTINUE";b.onclick=()=>{m.classList.remove("show");m.setAttribute("aria-hidden","true")}}m.classList.add("show");m.setAttribute("aria-hidden","false")}
function renderStandaloneExistingItems(){const e=$("standaloneExistingItems");if(!e)return;if(!items.length){e.innerHTML='<div class="history-empty">No wallet items yet.</div>';return}e.innerHTML=items.map(x=>'<button type="button" class="list-row" data-edit-item="'+esc(x.id)+'"><span><b>'+esc(x.name)+'</b><br><small>'+money(x.amount)+'</small></span><span>EDIT</span></button>').join("");e.querySelectorAll("[data-edit-item]").forEach(b=>b.addEventListener("click",()=>startItemEdit(b.dataset.editItem)))}
function renderList(){renderStandaloneExistingItems()}
function Renderlist(){renderStandaloneExistingItems()}
function editItem(x){startItemEdit(x.id)}
async function saveStandaloneItem(){const name=$("standaloneItemName")?.value.trim()||"",amount=Number($("standaloneItemAmount")?.value),pin=$("standaloneItemPin")?.value.trim()||"";const err=$("standaloneItemError");if(err)err.textContent="";if(!name||!Number.isFinite(amount)||amount<0){if(err)err.textContent="Enter a valid item name and amount.";return}if(!/^\d{6}$/.test(pin)){if(err)err.textContent="Enter your 6-digit Transaction PIN.";return}const btn=$("standaloneItemSubmit");if(btn){btn.disabled=true;btn.textContent=editingItemId?"SAVING…":"ADDING…"}try{const rpc=editingItemId?"inventory_update_item_self_service":"inventory_add_item_self_service";const args=editingItemId?{p_item_id:editingItemId,p_name:name,p_amount:amount,p_transaction_pin:pin}:{p_name:name,p_amount:amount,p_transaction_pin:pin};const{data,error}=await db.rpc(rpc,args);if(error)throw error;await loadItems();cancelItemEdit();closeAddItemModal();showFlash("success",editingItemId?"Item updated":"Item added",editingItemId?"Wallet item updated successfully.":"Wallet item added successfully.","OPEN WALLET BOARD")}catch(e){if(err)err.textContent=e?.message||"Unable to save wallet item."}finally{if(btn){btn.disabled=false;btn.textContent=editingItemId?"SAVE CHANGES":"ADD ITEM"}}}
function applyWheelMode(){const board=$("board"),toggle=$("wheelToggle");if(!board)return;rotationEnabled=toggle?!!toggle.checked:rotationEnabled;board.classList.toggle("wheel-static",!rotationEnabled);board.style.touchAction=rotationEnabled?"none":"pan-y";if(!rotationEnabled)drag=null}
function initWheelControls(){const toggle=$("wheelToggle");if(toggle){toggle.checked=true;toggle.addEventListener("change",applyWheelMode)}const board=$("board");if(!board)return;board.addEventListener("pointerdown",e=>{if(!rotationEnabled)return;if(e.button!==0&&e.pointerType==="mouse")return;drag={x:e.clientX,y:e.clientY,rotation};try{board.setPointerCapture(e.pointerId)}catch{}});board.addEventListener("pointermove",e=>{if(!rotationEnabled||!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;rotation=drag.rotation+(dx+dy)*0.006;render();});const end=e=>{if(!drag)return;drag=null;try{board.releasePointerCapture(e.pointerId)}catch{}};board.addEventListener("pointerup",end);board.addEventListener("pointercancel",end);applyWheelMode()}
function render(){const ring=$("ring");if(!ring)return;ring.innerHTML="";$("empty").style.display=items.length?"none":"grid";const total=items.reduce((a,x)=>a+Number(x.amount||0),0);$("totalAmount").textContent=money(total);$("itemCount").textContent=items.length+" item"+(items.length===1?"":"s");positions().forEach((p,i)=>{const x=items[i],node=document.createElement("div");node.className="node";node.style.transform="translate("+p.x+"px,"+p.y+"px) scale("+(0.88+p.z*.08)+")";node.style.zIndex=String(20+Math.round((p.z+1)*10));node.innerHTML='<div class="ico">'+iconFor(x.name)+'</div><b title="'+esc(x.name)+'">'+esc(x.name)+'</b><small>'+money(x.amount)+'</small>';if(isAdmin)node.onclick=()=>editItem(x);ring.appendChild(node)});renderList();fillTransferItems()}
function historyDateInLagos(value){try{const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Lagos",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(value));const get=k=>parts.find(p=>p.type===k)?.value||"";return get("year")+"-"+get("month")+"-"+get("day")}catch{return new Date(value).toISOString().slice(0,10)}}
function canDeleteHistoryToday(value){return historyDateInLagos(value)===historyDateInLagos(new Date())}
async function deleteHistoryActivity(id){if(!id)return;if(!confirm("Delete this Wallet Board activity? Only today’s activity can be deleted. The related wallet balances will be reversed."))return;const btn=document.querySelector('[data-delete-history="'+id+'"]');if(btn){btn.disabled=true;btn.textContent="DELETING…"}try{const{error}=await db.rpc("admin_delete_wallet_board_transfer",{p_transfer_id:id});if(error)throw error;await loadItems();await loadHistory()}catch(e){if(btn){btn.disabled=false;btn.textContent="DELETE"}alert(e?.message||"Unable to delete this activity.")}}
async function loadHistory(){
  const body=$("historyBody");
  if(!body)return;
    body.innerHTML='<tr><td colspan="12" class="history-empty">Loading history…</td></tr>';
  try{
    const result=await Promise.race([
      db.rpc("member_wallet_board_transfer_history"),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error("History request timed out.")),7000))
    ]);
    const{data,error}=result;if(error)throw error;
    const rows=data||[];
    if($("historyCount"))$("historyCount").textContent=rows.length.toLocaleString("en-NG");
    const margin=rows.reduce((n,x)=>n+Number(x.net_service_margin||0),0);
    if($("historyProfit"))$("historyProfit").textContent=money(margin);
    if(!rows.length){body.innerHTML='<tr><td colspan="11" class="history-empty">No Wallet Board transfer activity yet.</td></tr>';return}
    body.innerHTML=rows.map(x=>{
      const m=Number(x.net_service_margin||0),isCapitalIncrement=String(x.reference||"").startsWith("WCI-"),canDelete=isAdmin&&!isCapitalIncrement&&canDeleteHistoryToday(x.created_at);
      const action=canDelete
        ? '<button type="button" class="history-delete-btn" data-delete-history="'+esc(x.id)+'">DELETE</button>'
        : (isCapitalIncrement ? '<span title="Working Capital Increment is a permanent capital entry">CAPITAL</span>' : '<span title="Locked after the day ends">LOCKED</span>');
      const activity=isCapitalIncrement?"Working Capital Increament":(String(x.reference||"").startsWith("WCI-")?"Working Capital Increament":"Wallet Board Transfer"); return '<tr><td>'+new Date(x.created_at).toLocaleString("en-NG")+'</td><td><b>'+activity+'</b></td><td>'+esc(x.source_name||"—")+'</td><td>'+esc(x.destination_name||"—")+'</td><td>'+money(x.amount)+'</td><td>'+money(x.provider_fee)+'</td><td>'+money(x.service_fee)+'</td><td>'+money(x.total_debit)+'</td><td class="'+(m>=0?"history-profit":"history-loss")+'">'+(m>=0?"+":"")+money(m)+'</td><td>'+esc(x.status||"—")+'</td><td>'+esc(x.reference||"—")+'</td><td>'+action+'</td></tr>';
    }).join("");
    body.querySelectorAll("[data-delete-history]").forEach(btn=>btn.addEventListener("click",()=>deleteHistoryActivity(btn.dataset.deleteHistory)));
  }catch(e){console.error("Wallet Board history:",e);body.innerHTML='<tr><td colspan="11" class="history-empty">Unable to load history.</td></tr>'}
}
bindAccessPlanControls();
initTransfer();
initWheelControls();
$("historyRefresh")?.addEventListener("click",loadHistory);
$("renewBtn")?.addEventListener("click",openAccessModal);
$("addBtn")?.addEventListener("click",openAddModal);
$("cancelBtn")?.addEventListener("click",closeModal);
$("accessContinueBtn")?.addEventListener("click",purchaseAccess);
$("closeModal")?.addEventListener("click",closeModal);
$("standaloneItemClose")?.addEventListener("click",closeAddItemModal);
$("standaloneItemCancelEdit")?.addEventListener("click",cancelItemEdit);
$("addItemStandaloneForm")?.addEventListener("submit",e=>{e.preventDefault();saveStandaloneItem()});
load().then(loadHistory).catch(e=>{
  console.error("Wallet Board startup:",e);
  const el=$("walletBalance");
  if(el)el.textContent="Unable to load";
  const body=$("historyBody");
  if(body)body.innerHTML='<tr><td colspan="11" class="history-empty">Unable to load Wallet Board.</td></tr>';
  const message=e?.message||"Unable to load Wallet Board.";
  console.error("Wallet Board startup failure:",message,e);
  alert(message);
});
})();