(()=>{"use strict";
function openPanel(type,btn){
  const panel=document.getElementById("hfSecurity"+String(type||"").charAt(0).toUpperCase()+String(type||"").slice(1)+"Drop");
  document.querySelectorAll(".hf-security-drop-panel").forEach(p=>{p.hidden=true;p.style.display="none";});
  document.querySelectorAll("[data-security-drop]").forEach(b=>{b.classList.remove("open");b.setAttribute("aria-expanded","false");});
  if(panel){
    panel.hidden=false;
    panel.style.display="block";
    if(btn){btn.classList.add("open");btn.setAttribute("aria-expanded","true");}
  }
}
function bindButtons(root){
  (root||document).querySelectorAll("[data-security-drop]").forEach(btn=>{
    if(btn.dataset.securityBound==="1")return;
    btn.dataset.securityBound="1";
    btn.setAttribute("aria-expanded","false");
    btn.addEventListener("click",function(e){
      e.preventDefault();e.stopPropagation();
      const type=this.getAttribute("data-security-drop");
      const panel=document.getElementById("hfSecurity"+type.charAt(0).toUpperCase()+type.slice(1)+"Drop");
      const isOpen=panel && panel.hidden===false;
      if(isOpen){
        panel.hidden=true;panel.style.display="none";
        this.classList.remove("open");this.setAttribute("aria-expanded","false");
      }else openPanel(type,this);
    },false);
    btn.addEventListener("touchend",function(e){
      e.preventDefault();
      this.click();
    },{passive:false});
  });
  (root||document).querySelectorAll(".hf-security-drop-panel").forEach(p=>{
    if(p.dataset.securityPanelBound==="1")return;
    p.dataset.securityPanelBound="1";
    if(!p.hidden)p.hidden=true;
    p.style.display="none";
  });
}
function bindSecurityActions(){
  document.addEventListener("click",async e=>{
    const pin=e.target.closest("[data-security-action='pin']");
    if(pin){
      e.preventDefault();e.stopPropagation();
      const target=document.getElementById("hfSecurityPinDrop");
      window.hfSecurityDropdownTarget=target||null;
      if(typeof window.hfOpenPinManager==="function"){await window.hfOpenPinManager();}
      else if(typeof window.openPinManager==="function"){await window.openPinManager();}
      return;
    }
    const signout=e.target.closest("[data-security-action='signout']");
    if(signout){
      e.preventDefault();e.stopPropagation();
      if(typeof window.habscoHardLogout==="function"){await window.habscoHardLogout();}
      else if(window.supabaseClient){await window.supabaseClient.auth.signOut({scope:"local"});location.href="./auth.html?logged_out=1";}
    }
  },true);
}
function bindForms(){
  document.addEventListener("submit",async e=>{
    const form=e.target;
    if(form.id!=="hfInlinePasswordForm" && form.id!=="hfInlineForgotPinForm")return;
    e.preventDefault();e.stopPropagation();
    const f=new FormData(form),msg=form.id==="hfInlinePasswordForm"?document.getElementById("hfPasswordMsg"):document.getElementById("hfForgotPinMsg"),b=form.querySelector("button[type=submit]");
    try{
      if(form.id==="hfInlinePasswordForm"){
        const n=String(f.get("new_password")||""),c=String(f.get("confirm_password")||"");
        if(n.length<8){msg.textContent="Password must be at least 8 characters.";return}
        if(n!==c){msg.textContent="Passwords do not match.";return}
        b.disabled=true;b.textContent="Changing…";
        const sb=window.supabaseClient;if(!sb)throw new Error("Security service unavailable.");
        const r=await sb.auth.updateUser({password:n});if(r.error)throw r.error;
        msg.textContent="Password changed successfully.";form.reset();
      }else{
        const pw=String(f.get("account_password")||""),n=String(f.get("new_pin")||""),c=String(f.get("confirm_pin")||"");
        if(!/^\d{6}$/.test(n)){msg.textContent="PIN must be exactly 6 digits.";return}
        if(n!==c){msg.textContent="PINs do not match.";return}
        if(!pw){msg.textContent="Enter your current sign-in password.";return}
        b.disabled=true;b.textContent="Resetting…";
        const sb=window.supabaseClient;if(!sb)throw new Error("Security service unavailable.");
        const r=await sb.rpc("member_reset_transaction_pin",{p_password:pw,p_new_pin:n});if(r.error)throw r.error;
        msg.textContent="PIN reset successfully.";form.reset();
      }
    }catch(err){msg.textContent=err?.message||"Unable to complete this request."}
    finally{b.disabled=false;b.textContent=form.id==="hfInlinePasswordForm"?"Change password":"Reset PIN"}
  },true);
}
function bind(){
  bindButtons(document);
  if(!window.__habscoSecurityFormsBound){window.__habscoSecurityFormsBound=true;bindForms();}
  if(!window.__habscoSecurityActionsBound){window.__habscoSecurityActionsBound=true;bindSecurityActions();}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
new MutationObserver(()=>bindButtons(document)).observe(document.documentElement,{childList:true,subtree:true});
})();