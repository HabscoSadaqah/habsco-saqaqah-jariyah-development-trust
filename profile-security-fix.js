(()=>{"use strict";
const U="https://ythnoeyxovapydbmymdo.supabase.co",K="sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN";
function client(){if(window.supabaseClient?.auth)return window.supabaseClient;if(window.supabase?.createClient){window.supabaseClient=window.supabase.createClient(U,K);return window.supabaseClient}return null}
function panel(type){return document.getElementById("hfSecurity"+String(type||"").charAt(0).toUpperCase()+String(type||"").slice(1)+"Drop")}
function closeAll(){document.querySelectorAll(".hf-security-drop-panel").forEach(p=>{p.hidden=true;p.style.display="none"});document.querySelectorAll("[data-security-drop]").forEach(b=>{b.classList.remove("open");b.setAttribute("aria-expanded","false")})}
function open(type,btn){closeAll();const p=panel(type);if(p){p.hidden=false;p.style.display="block"}if(btn){btn.classList.add("open");btn.setAttribute("aria-expanded","true")}}
document.addEventListener("click",async e=>{
 const btn=e.target.closest?.("[data-security-drop]");
 if(btn){e.preventDefault();e.stopPropagation();const type=btn.getAttribute("data-security-drop"),p=panel(type);if(p?.hidden===false)closeAll();else open(type,btn);return}
 const action=e.target.closest?.("[data-security-action]");
 if(action){e.preventDefault();e.stopPropagation();const kind=action.getAttribute("data-security-action");
  if(kind==="signout"){try{if(typeof window.habscoHardLogout==="function")await window.habscoHardLogout();else{const sb=client();await sb?.auth.signOut({scope:"local"});location.replace("./auth.html?logged_out=1")}}catch(err){alert(err?.message||"Unable to sign out.")}}
  if(kind==="pin"){const t=panel("pin");if(t)t.querySelector("[data-pin-inline-form]")?.scrollIntoView({block:"nearest"});if(typeof window.hfOpenPinManager==="function")try{await window.hfOpenPinManager()}catch(_){}}
 }
},true);
document.addEventListener("submit",async e=>{
 const form=e.target;if(!form||!["hfInlinePasswordForm","hfInlineForgotPinForm","hfInlinePinForm"].includes(form.id))return;
 e.preventDefault();e.stopPropagation();const f=new FormData(form),msg=form.querySelector(".hf-security-form-msg"),b=form.querySelector("button[type=submit]");if(msg)msg.textContent="";
 try{const sb=client();if(!sb)throw new Error("Security service unavailable.");
  if(form.id==="hfInlinePasswordForm"){const n=String(f.get("new_password")||""),c=String(f.get("confirm_password")||"");if(n.length<8)throw new Error("Password must be at least 8 characters.");if(n!==c)throw new Error("Passwords do not match.");b.disabled=true;b.textContent="Changing…";const r=await sb.auth.updateUser({password:n});if(r.error)throw r.error;if(msg)msg.textContent="Password changed successfully.";form.reset()}
  else if(form.id==="hfInlineForgotPinForm"){const pw=String(f.get("account_password")||""),n=String(f.get("new_pin")||""),c=String(f.get("confirm_pin")||"");if(!pw)throw new Error("Enter your current sign-in password.");if(!/^\d{6}$/.test(n))throw new Error("PIN must be exactly 6 digits.");if(n!==c)throw new Error("PINs do not match.");b.disabled=true;b.textContent="Resetting…";const r=await sb.rpc("member_reset_transaction_pin",{p_password:pw,p_new_pin:n});if(r.error)throw r.error;if(msg)msg.textContent="PIN reset successfully.";form.reset()}
  else{const cur=String(f.get("current_pin")||""),n=String(f.get("new_pin")||""),c=String(f.get("confirm_pin")||"");if(!/^\d{6}$/.test(n))throw new Error("PIN must be exactly 6 digits.");if(n!==c)throw new Error("PINs do not match.");b.disabled=true;b.textContent="Saving…";const r=await sb.rpc("member_set_transaction_pin",{p_current_pin:cur||null,p_new_pin:n});if(r.error)throw r.error;if(msg)msg.textContent="Transaction PIN saved successfully.";form.reset()}
 }catch(err){if(msg)msg.textContent=err?.message||"Unable to complete this request."}finally{if(b){b.disabled=false;b.textContent=form.id==="hfInlinePasswordForm"?"Change password":form.id==="hfInlineForgotPinForm"?"Reset PIN":"Save PIN"}}
},true);
function init(){document.querySelectorAll("[data-security-drop]").forEach(b=>{b.setAttribute("aria-expanded","false")});document.querySelectorAll(".hf-security-drop-panel").forEach(p=>{p.hidden=true;p.style.display="none"})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();