(()=>{"use strict";
const URL="https://ythnoeyxovapydbmymdo.supabase.co",KEY="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN";
const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
async function init(){
 const sel=$("item"); if(!sel)return;
 const {data:{user}}=await db.auth.getUser(); if(!user){location.href="auth.html";return}
 const {data:isAdmin}=await db.rpc("pos_is_admin"); if(!isAdmin)return;
 const r=await db.from("inventory_items").select("id,name,sku,item_type,selling_price,cost_price,stock,unit").eq("active",true).eq("archived",false).order("name");
 if(r.error||!r.data?.length)return;
 const group=document.createElement("optgroup");group.label="Inventory Products";
 r.data.filter(x=>x.item_type==="product").forEach(x=>{const o=document.createElement("option");o.value="inv:"+x.id;o.textContent=x.name+" · "+Number(x.stock||0)+" "+(x.unit||"piece");o.dataset.sell=x.selling_price;o.dataset.cost=x.cost_price;o.dataset.stock=x.stock;group.appendChild(o)});
 if(group.children.length)sel.appendChild(group);
 sel.addEventListener("change",()=>{const o=sel.selectedOptions[0];if(o?.value?.startsWith("inv:")){$("sell").value=o.dataset.sell||0;$("cost").value=o.dataset.cost||0;$("sell").dispatchEvent(new Event("input"));$("cost").dispatchEvent(new Event("input"))}});
 $("saleForm")?.addEventListener("submit",async e=>{
  const value=sel.value||"";if(!value.startsWith("inv:"))return;
  e.preventDefault();e.stopImmediatePropagation();
  const qty=+$("qty").value,sell=+$("sell").value,cost=+$("cost").value,fee=+$("fee").value||0,expense=+$("expense").value||0;
  const opt=sel.selectedOptions[0],available=+opt.dataset.stock||0;
  if(qty<=0)return alert("Enter a valid quantity.");if(qty>available)return alert("Insufficient stock. Available: "+available);
  const customerSel=$("customer"),existing=(window.__habscoPosCustomers||[]).find(x=>x.id===customerSel?.value);
  let c=existing,title=$("saleCustomerTitle")?.value.trim()||null,name=$("saleCustomerName")?.value.trim()||null,phone=$("saleCustomerPhone")?.value.trim()||null;
  if(!c&&(name||phone)){
   if(!name||!phone)return alert("Enter customer name and phone number, or select an existing customer.");
   const old=(window.__habscoPosCustomers||[]).find(x=>x.phone.replace(/\D/g,"")===phone.replace(/\D/g,""));
   if(old){c=old;title=title||old.title;name=old.name;phone=old.phone}
   else{const cr=await db.from("pos_customers").insert({title,name,phone,address:null,created_by:user.id}).select("*").single();if(cr.error)return alert(cr.error.message);c=cr.data}
  }
  if(c){title=title||c.title||null;name=name||c.name;phone=phone||c.phone}
  const rr=await db.rpc("pos_record_sale",{p_payload:{item_id:value.slice(4),item:opt.textContent.split(" · ")[0],qty,sell,cost_unit:cost,customer_id:c?.id||null,customer_title:title,customer_name:name||null,customer_phone:phone||null,customer_address:c?.address||null,bank:$("bank").value||null,method:$("method").value,medium:$("medium").value||null,fee,expense,when_at:new Date($("when").value).toISOString()}});
  if(rr.error)return alert(rr.error.message);
  alert("Sale saved. Receipt: "+(rr.data?.receipt_no||"issued"));location.reload();
 },true);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();