(()=>{"use strict";
const URL="https://ythnoeyxovapydbmymdo.supabase.co",KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN",db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id),money=n=>"₦"+Number(n||0).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2});
let items=[],rotation=0,drag=null,currentUserId="",isAdmin=false,accessExpiresAt=null,selectedPlan="monthly";
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const transferState={mode:"internal"};
function setTransferStatus(msg,ok=false){const e=$("transferStatus");if(e){e.textContent=msg||"";e.className="transferStatus "+(msg?(ok?"ok":"err"):"")}}
function fillTransferItems(){const s=$("transferSource"),d=$("transferDestination");if(!s||!d)return;const opts=items.map(x=>'<option value="'+x.id+'">'+esc(x.name)+" · "+money(x.amount)+"</option>").join("");s.innerHTML=opts;d.innerHTML='<option value="">Select destination…</option>'+opts;s.value=items[0]?.id||""}
function recalc(){const a=Math.max(0,Number($("transferAmount")?.value||0)),f=Math.max(0,Number($("serviceFee")?.value||0));if($("feeAmount"))$("feeAmount").textContent=money(a);if($("feeValue"))$("feeValue").textContent=money(f);if($("totalDebit"))$("totalDebit").textContent=money(a+f)}
async function submitTransfer(e){e.preventDefault();const source=$("transferSource").value,dest=$("transferDestination").value,amount=Number($("transferAmount").value),fee=Math.max(0,Number($("serviceFee").value||0));if(!source||!dest||dest===source||!Number.isFinite(amount)||amount<=0||!Number.isFinite(fee))return setTransferStatus("Choose different wallet items and enter valid amount and service fee.");if(!confirm("Transfer "+money(amount)+" and charge service fee "+money(fee)+"? Total debit: "+money(amount+fee)))return;const btn=$("transferSubmit");btn.disabled=true;btn.textContent="PROCESSING…";try{const{data,error}=await db.rpc("wallet_board_internal_transfer",{p_source_item_id:source,p_destination_item_id:dest,p_amount:amount,p_service_fee:fee});if(error)throw error;setTransferStatus("Transfer successful · "+data.reference,true);await loadItems();$("transferAmount").value="";$("serviceFee").value="0";recalc()}catch(err){setTransferStatus(err.message||"Transfer failed")}finally{btn.disabled=false;btn.textContent="TRANSFER"}}
function initTransfer(){fillTransferItems();$("transferAmount")?.addEventListener("input",recalc);$("serviceFee")?.addEventListener("input",recalc);$("transferForm")&&($("transferForm").onsubmit=submitTransfer);recalc()}
function iconFor(name){const n=String(name||"").trim();return n.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()||"◉"}
async function sessionAndRole(){const{data:{session},error}=await db.auth.getSession();if(error||!session){location.href="auth.html";throw Error("Session expired.")}currentUserId=session.user.id;const{data:p,error:e}=await db.from("profiles").select("role,status").eq("id",currentUserId).maybeSingle();if(e)throw e;if(!p||p.status!=="active")throw Error("Active member access required.");isAdmin=p.role==="admin";return session}
function setLocked(locked){document.body.classList.toggle("stock-locked",locked);document.body.classList.toggle("access-ready",!locked);document.body.classList.toggle("access-checking",locked);const board=$("board"),transfer=$("transferCard"),hint=document.querySelector(".hint");if(board)board.style.display=locked?"none":"";if(transfer)transfer.style.display=locked||!isAdmin?"none":"";if(hint)hint.style.display=locked?"none":"";const add=$("addBtn");if(add){add.textContent=locked?"🔐 Unlock Add Stock":"＋ Add Stock";add.style.display="inline-flex"}if($("accessStatus"))$("accessStatus").style.display=locked?"none":"flex";const cancel=$("cancelBtn");if(cancel)cancel.style.display=locked&&!isAdmin?"none":"inline-flex"}
function selectPlan(plan){selectedPlan=plan;document.querySelectorAll(".plan").forEach(x=>x.classList.toggle("selected",x.dataset.plan===plan));const p=plan==="monthly"?"₦1,000":"₦10,000";$("payAmount")&&($("payAmount").textContent=p);$("pinWrap")&&($("pinWrap").style.display="block");$("accessContinueBtn")&&($("accessContinueBtn").textContent="PAY "+p)}
async function loadWalletBalance(){if(!$("walletBalance"))return;const{data,error}=await db.from("wallets").select("balance").eq("user_id",currentUserId).maybeSingle();if(error){$("walletBalance").textContent="Unable to load";return}$("walletBalance").textContent=money(data?.balance||0)}
function openAccessModal(){const m=$("modal");if(!m)return;m.dataset.mode="purchase";$("modalTitle").textContent="Choose Add Stock access";$("modalDescription").textContent="Select a plan, pay securely from your HABSCO wallet, and get immediate access.";$("planArea").style.display="block";$("paymentArea").style.display="block";$("itemFields").style.display="none";$("adminPinWrap").style.display="none";$("accessContinueBtn").textContent="PAY ₦1,000";const cancel=$("cancelBtn");if(cancel)cancel.style.display="inline-flex";m.classList.add("show");m.setAttribute("aria-hidden","false");$("transactionPin").value="";$("pinError").textContent="";selectPlan(selectedPlan||"monthly");loadWalletBalance();setTimeout(()=>$("transactionPin")?.focus(),80)}
function showFlash(kind,title,text,buttonText="CONTINUE",after=null){const f=$("flashModal");if(!f)return;f.className="flash show "+(kind||"");$("flashIcon").textContent=kind==="sorry"?"↩":"✓";$("flashTitle").textContent=title;$("flashText").textContent=text;$("flashButton").textContent=buttonText;f.setAttribute("aria-hidden","false");f.__after=after||null}function hideFlash(){const f=$("flashModal");if(!f)return;f.classList.remove("show");f.setAttribute("aria-hidden","true");const cb=f.__after;f.__after=null;if(cb)cb()}function closeModal(){const m=$("modal");if(!m)return;if(!isAdmin&&!accessExpiresAt){m.classList.remove("show");m.setAttribute("aria-hidden","true");showFlash("sorry","Sorry to see you go","No problem. Add Stock access is optional. You can return whenever you are ready.","BACK TO DASHBOARD",()=>{location.href="member.html"});return}m.classList.remove("show");m.setAttribute("aria-hidden","true");$("transactionPin").value="";$("pinError").textContent=""}
function openAddModal(){const m=$("modal"),fields=$("itemFields");if(!m||!fields)return;m.classList.add("show");m.setAttribute("aria-hidden","false");m.dataset.mode="add";$("modalTitle").textContent="Add wallet item";$("modalDescription").textContent="Add your wallet item yourself. Enter the item name, latest amount and your transaction PIN."; $("planArea").style.display="none";$("paymentArea").style.display="none";fields.classList.remove("hidden");fields.classList.add("item-form-visible");fields.style.setProperty("display","grid","important");$("adminPinWrap").style.display="block";$("adminPin").required=true;$("adminPinLabel").textContent="Transaction PIN";$("adminPin").placeholder="6-digit transaction PIN";$("itemName").required=true;$("itemAmount").required=true;$("accessContinueBtn").textContent="ADD ITEM";$("itemName").value="";$("itemAmount").value="";$("adminPin").value="";if($("itemError"))$("itemError").textContent="";setTimeout(()=>$("itemName")?.focus(),60)}
async function purchaseAccess(){const pin=$("transactionPin").value.trim();if(!/^[0-9]{6}$/.test(pin)){ $("pinError").textContent="Enter your 6-digit transaction PIN.";return }const amount=selectedPlan==="monthly"?1000:10000;const{data:bal}=await db.from("wallets").select("balance").eq("user_id",currentUserId).maybeSingle();if(Number(bal?.balance||0)<amount){$("pinError").textContent="Insufficient wallet balance for this plan.";return}if(!confirm("Confirm payment of "+money(amount)+" for "+(selectedPlan==="monthly"?"Monthly":"Yearly")+" Add Stock access?"))return;const btn=$("accessContinueBtn");btn.disabled=true;btn.textContent="PROCESSING…";$("pinError").textContent="";try{const{data,error}=await db.rpc("member_purchase_add_stock_access",{p_plan:selectedPlan,p_transaction_pin:pin});if(error)throw error;accessExpiresAt=data.expires_at;setLocked(false);updateCountdown();closeModal();await loadItems();showFlash("success","Congratulations!","Your Add Stock access is now active. You can start using the protected Wallet Board immediately.","OPEN WALLET BOARD")}catch(e){$("pinError").textContent=e.message||"Payment failed."}finally{btn.disabled=false;btn.textContent="PAY "+money(amount)}}
function calendarParts(from,to){let y=to.getUTCFullYear()-from.getUTCFullYear(),m=to.getUTCMonth()-from.getUTCMonth(),d=to.getUTCDate()-from.getUTCDate();if(d<0){m--;const prev=new Date(Date.UTC(to.getUTCFullYear(),to.getUTCMonth(),0));d+=prev.getUTCDate()}if(m<0){y--;m+=12}return{y,m,d}}
function updateCountdown(){const el=$("accessCountdown");if(!el||!accessExpiresAt)return;const target=new Date(accessExpiresAt),now=new Date(),ms=Math.max(0,target-now);if(ms<=0){accessExpiresAt=null;el.innerHTML="<b>Access expired</b><span>Please choose a new plan to continue.</span>";setLocked(true);openAccessModal();return}const p=calendarParts(now,target),days=Math.floor(ms/86400000),mins=Math.floor(ms/60000),secs=Math.floor(ms/1000);el.innerHTML="<div class='count-main'>"+p.y+" year"+(p.y===1?"":"s")+" · "+p.m+" month"+(p.m===1?"":"s")+" · "+p.d+" day"+(p.d===1?"":"s")+"</div><div class='count-sub'>"+mins.toLocaleString()+" minutes · "+secs.toLocaleString()+" seconds remaining</div><small>Expires "+target.toLocaleString("en-NG")+"</small>"} 
async function loadAccess(){if(isAdmin){setLocked(false);return}const{data,error}=await db.rpc("member_add_stock_access_status");if(error)throw error;accessExpiresAt=data?.active?data.expires_at:null;if(accessExpiresAt){setLocked(false);updateCountdown();if(window.__accessTimer)clearInterval(window.__accessTimer);window.__accessTimer=setInterval(updateCountdown,1000)}else{setLocked(true);openAccessModal()}}
async function loadItems(){if(isAdmin){const{data,error}=await db.from("inventory_visual_items").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});if(error)throw error;items=data||[]}else{const{data,error}=await db.rpc("member_inventory_visual_items");if(error)throw error;items=data||[]}render()}
async function load(){await sessionAndRole();await loadAccess();await loadItems()}
function positions(){const n=items.length;if(!n)return[];const rx=Math.min(370,Math.max(170,window.innerWidth*.34)),ry=Math.min(255,Math.max(175,window.innerWidth*.23));return items.map((x,i)=>{const a=i/n*Math.PI*2+rotation-Math.PI/2;return{x:rx*Math.cos(a),y:ry*Math.sin(a),z:Math.sin(a)}})}
function render(){const ring=$("ring");if(!ring)return;ring.innerHTML="";$("empty").style.display=items.length?"none":"grid";const total=items.reduce((a,x)=>a+Number(x.amount||0),0);$("totalAmount").textContent=money(total);$("itemCount").textContent=items.length+" item"+(items.length===1?"":"s");positions().forEach((p,i)=>{const x=items[i],node=document.createElement("div");node.className="node";node.style.transform="translate("+p.x+"px,"+p.y+"px) scale("+(0.88+p.z*.08)+")";node.style.zIndex=String(20+Math.round((p.z+1)*10));node.innerHTML='<div class="ico">'+iconFor(x.name)+'</div><b title="'+esc(x.name)+'">'+esc(x.name)+'</b><small>'+money(x.amount)+'</small>';if(isAdmin)node.onclick=()=>editItem(x);ring.appendChild(node)});renderList();fillTransferItems()}
function renderList(){const e=$("existing");if(!e)return;e.innerHTML=items.map(x=>'<div class="list-row"><div><b>'+esc(x.name)+'</b><br><span>'+money(x.amount)+'</span></div>'+(isAdmin?'<button class="danger" data-id="'+x.id+'">Delete</button>':"")+'</div>').join("");e.querySelectorAll("[data-id]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this item?"))return;const{error}=await db.from("inventory_visual_items").delete().eq("id",b.dataset.id);if(error)return alert(error.message);items=items.filter(x=>x.id!==b.dataset.id);render()})}
async function editItem(x){const amount=prompt("Latest amount for "+x.name,Number(x.amount||0));if(amount===null)return;const n=Number(amount);if(!Number.isFinite(n)||n<0)return alert("Enter a valid amount.");const{data,error}=await db.from("inventory_visual_items").update({amount:n,updated_at:new Date().toISOString()}).eq("id",x.id).select().single();if(error)return alert(error.message);Object.assign(x,data);render()}
$("addBtn").addEventListener("click",e=>{e.preventDefault();if(isAdmin||accessExpiresAt){openAddModal()}else{openAccessModal()}});
$("renewBtn")?.addEventListener("click",openAccessModal);
$("cancelBtn").addEventListener("click",closeModal);$("flashButton").addEventListener("click",()=>{const f=$("flashModal");const cb=f?.__after;if(f?.classList.contains("sorry")){hideFlash();return}hideFlash()});$("flashModal").addEventListener("click",e=>{if(e.target===$("flashModal"))hideFlash()});
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal()});
$("planArea").addEventListener("click",e=>{const p=e.target.closest(".plan");if(p)selectPlan(p.dataset.plan)});
async function submitAddItem(){
  const name=$("itemName").value.trim();
  const amount=Number($("itemAmount").value);
  const pin=$("adminPin").value.trim();
  const errorBox=$("itemError");
  if(errorBox)errorBox.textContent="";
  if(!name||!Number.isFinite(amount)||amount<0){
    if(errorBox)errorBox.textContent="Enter a valid item name and amount.";
    return;
  }
  if(!/^\\d{6}$/.test(pin)){
    if(errorBox)errorBox.textContent="Enter your 6-digit transaction PIN.";
    return;
  }
  const btn=$("accessContinueBtn");
  btn.disabled=true;
  btn.textContent="ADDING…";
  try{
    const {data,error}=await db.rpc("inventory_add_item_self_service",{
      p_name:name,
      p_amount:amount,
      p_transaction_pin:pin
    });
    if(error)throw error;
    if(data)items.push(data);
    closeModal();
    render();
  }catch(err){
    if(errorBox)errorBox.textContent=err.message||"Unable to add item.";
  }finally{
    btn.disabled=false;
    btn.textContent="ADD ITEM";
    $("adminPin").value="";
  }
}
$("itemForm").addEventListener("submit",async e=>{e.preventDefault();if($("modal").dataset.mode!=="add")return purchaseAccess();await submitAddItem()});
$("accessContinueBtn").addEventListener("click",async()=>{if($("modal").dataset.mode==="add")return submitAddItem();return purchaseAccess()});
$("board").addEventListener("pointerdown",e=>{if(e.target.closest(".node")||e.target.closest("button"))return;drag={x:e.clientX,y:e.clientY,r:rotation};$("board").setPointerCapture(e.pointerId)});
$("board").addEventListener("pointermove",e=>{if(!drag)return;rotation=drag.r+((e.clientX-drag.x)+(e.clientY-drag.y)*.35)/160;render()});
$("board").addEventListener("pointerup",e=>{drag=null;try{$("board").releasePointerCapture(e.pointerId)}catch{}});
$("board").addEventListener("pointercancel",()=>drag=null);
$("transferCard")?.addEventListener("pointerdown",e=>e.stopPropagation());
initTransfer();load().catch(e=>{console.error(e);alert(e.message||"Unable to load Wallet Board.")});
})();