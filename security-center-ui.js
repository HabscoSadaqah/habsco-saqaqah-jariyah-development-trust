(()=>{"use strict";
const isMember=/^(member\\.html|member)$/i.test(location.pathname.split("/").pop()||"");
if(!isMember)return;
const $=id=>document.getElementById(id);
function style(){
 if($("[data-hf-security-modal-fix]"))return;
 const s=document.createElement("style");s.dataset.hfSecurityModalFix="1";
 s.textContent=`
.hf-security-modal-backdrop{position:fixed!important;inset:0!important;background:rgba(2,18,11,.62)!important;z-index:5000!important}
.hf-security-modal{position:fixed!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:min(360px,calc(100vw - 32px))!important;max-height:calc(100dvh - 28px)!important;overflow:auto!important;background:#fff!important;border-radius:20px!important;padding:22px!important;box-shadow:0 25px 80px rgba(0,0,0,.3)!important;z-index:5001!important;color:#17221c!important}
.hf-security-modal-close{position:absolute!important;right:12px!important;top:10px!important;width:32px!important;height:32px!important;border:0!important;background:#f1f5f2!important;border-radius:50%!important;font-size:20px!important;color:#516159!important;cursor:pointer!important}
.hf-security-modal-icon{width:52px;height:52px;margin:0 auto 8px;border-radius:15px;background:#edf7f1;display:grid;place-items:center;font-size:28px}
.hf-security-modal-kicker{text-align:center;font-size:8px;letter-spacing:1px;font-weight:900;color:#087443}
.hf-security-modal h3{text-align:center;margin:3px 0 6px;font-size:17px;color:#173f2e}
.hf-security-modal p{font-size:10px;line-height:1.45;color:#728079;text-align:center;margin:0 0 14px}
.hf-security-modal .rule{display:flex;gap:8px;align-items:center;background:#f3faf6;border:1px solid #dceee4;border-radius:12px;padding:9px 10px;color:#28664d;font-size:9.5px;margin-bottom:14px}
.hf-security-modal form{display:grid;gap:10px}
.hf-security-modal label{display:grid;gap:5px;font-size:10px;font-weight:800;color:#26372f}
.hf-security-modal input{width:100%;height:46px;border:1px solid #dfe9e3;border-radius:11px;padding:0 12px;outline:0;box-sizing:border-box;background:#fff}
.hf-security-modal input:focus{border-color:#087443;box-shadow:0 0 0 3px rgba(8,116,67,.08)}
.hf-security-modal .input-wrap{position:relative}.hf-security-modal .input-wrap input{padding-right:55px}
.hf-security-modal .show-btn{position:absolute;right:6px;top:6px;height:34px;border:1px solid #dfe9e3;background:#f8fbf9;border-radius:8px;color:#35634f;font-size:8px;font-weight:700}
.hf-security-modal .primary{width:100%;height:46px;border:0;border-radius:10px;background:#087443;color:#fff;font-size:10px;font-weight:900;cursor:pointer}
.hf-security-modal .secondary{width:100%;height:44px;border:1px solid #dfe9e3;border-radius:10px;background:#fff;color:#087443;font-size:9.5px;font-weight:900}
.hf-security-modal .status{display:none;font-size:9.5px;padding:9px;border-radius:9px}.hf-security-modal .status.show{display:block}.hf-security-modal .status.error{background:#fff1ef;color:#9b3026}.hf-security-modal .status.success{background:#edf7f1;color:#0b6b45}
@media(max-width:650px){.hf-security-modal{width:min(330px,88vw);padding:20px}}
`;document.head.appendChild(s)}
function closeModal(){const m=$("hfSecurityModal");if(m)m.remove()}
function openModal(kind){
 closeModal();style();
 const m=document.createElement("div");m.id="hfSecurityModal";
 if(kind==="forgot"){
  m.innerHTML='<div class="hf-security-modal-backdrop"></div><section class="hf-security-modal" role="dialog" aria-modal="true"><button class="hf-security-modal-close" type="button">×</button><div class="hf-security-modal-icon">🛡️</div><div class="hf-security-modal-kicker">ACCOUNT SECURITY</div><h3>Forgot Transaction PIN</h3><p>Your current PIN cannot be displayed or recovered. A forgotten PIN must be reset securely by an administrator.</p><div class="rule"><span>🔐</span><span><strong>Security notice</strong><br>Never share your PIN, password or verification codes.</span></div><button class="secondary" type="button" data-close>Close</button></section></div>';
 }else if(kind==="pin"){
  m.innerHTML='<div class="hf-security-modal-backdrop"></div><section class="hf-security-modal" role="dialog" aria-modal="true"><button class="hf-security-modal-close" type="button">×</button><div class="hf-security-modal-icon">🔐</div><div class="hf-security-modal-kicker">ACCOUNT SECURITY</div><h3 id="hfSecTitle">Transaction PIN</h3><p>Set a secure 6-digit transaction PIN for transfers, payments and other sensitive actions.</p><div class="rule">🔐&nbsp; Never share your PIN with anyone.</div><form id="hfSecPinForm"><label id="hfSecCurrentWrap">Current PIN<div class="input-wrap"><input id="hfSecCurrent" type="password" inputmode="numeric" maxlength="6"><button class="show-btn" type="button" data-target="hfSecCurrent">Show</button></div></label><label>New PIN<div class="input-wrap"><input id="hfSecNew" type="password" inputmode="numeric" maxlength="6" required><button class="show-btn" type="button" data-target="hfSecNew">Show</button></div></label><label>Confirm new PIN<div class="input-wrap"><input id="hfSecConfirm" type="password" inputmode="numeric" maxlength="6" required><button class="show-btn" type="button" data-target="hfSecConfirm">Show</button></div></label><div id="hfSecPinStatus" class="status"></div><button class="primary" type="submit">SAVE PIN</button></form></section></div>';
 }else{
  m.innerHTML='<div class="hf-security-modal-backdrop"></div><section class="hf-security-modal" role="dialog" aria-modal="true"><button class="hf-security-modal-close" type="button">×</button><div class="hf-security-modal-icon">🔑</div><div class="hf-security-modal-kicker">ACCOUNT SECURITY</div><h3>Change Password</h3><p>Update your sign-in password securely with your current password and a new password.</p><div class="rule">🔐&nbsp; Use a strong password and never share it.</div><form id="hfSecPasswordForm"><label>Current password<div class="input-wrap"><input id="hfSecOld" type="password" required><button class="show-btn" type="button" data-target="hfSecOld">Show</button></div></label><label>New password<div class="input-wrap"><input id="hfSecNewPass" type="password" minlength="8" required><button class="show-btn" type="button" data-target="hfSecNewPass">Show</button></div></label><label>Confirm new password<div class="input-wrap"><input id="hfSecConfirmPass" type="password" minlength="8" required><button class="show-btn" type="button" data-target="hfSecConfirmPass">Show</button></div></label><div id="hfSecPasswordStatus" class="status"></div><button class="primary" type="submit">CHANGE PASSWORD</button></form></section></div>';
 }
 document.body.appendChild(m);
 const close=()=>m.remove();m.querySelector(".hf-security-modal-close").onclick=close;m.querySelector(".hf-security-modal-backdrop").onclick=close;m.querySelector("[data-close]")?.addEventListener("click",close);
 m.querySelectorAll(".show-btn").forEach(b=>b.onclick=()=>{const i=$(b.dataset.target),show=i.type==="password";i.type=show?"text":"password";b.textContent=show?"Hide":"Show"});
 if(kind==="pin")setupPin(m); if(kind==="password")setupPassword(m);
}
async function setupPin(m){
 const sb=window.supabaseClient;if(!sb)return;
 const {data,error}=await sb.rpc("member_pin_status");if(error||!data){closeModal();return}
 const has=!!data.has_pin,cur=$("hfSecCurrent"),title=$("hfSecTitle");$("hfSecCurrentWrap").style.display=has?"grid":"none";cur.required=has;title.textContent=has?"Change transaction PIN":"Set transaction PIN";$("hfSecNew").focus();
 $("hfSecPinForm").onsubmit=async e=>{e.preventDefault();const n=$("hfSecNew").value.replace(/\\D/g,""),c=$("hfSecConfirm").value.replace(/\\D/g,""),old=cur.value.replace(/\\D/g,""),st=$("hfSecPinStatus"),btn=m.querySelector(".primary");st.className="status";if(n.length!==6){st.textContent="New PIN must be exactly 6 digits.";st.classList.add("show","error");return}if(n!==c){st.textContent="The new PINs do not match.";st.classList.add("show","error");return}btn.disabled=true;btn.textContent="SAVING…";try{const {error:x}=await sb.rpc("member_set_transaction_pin",{p_current_pin:old,p_new_pin:n});if(x)throw x;st.textContent="PIN updated successfully.";st.classList.add("show","success");setTimeout(closeModal,900)}catch(x){st.textContent=x?.message||"Unable to update PIN.";st.classList.add("show","error")}finally{btn.disabled=false;btn.textContent="SAVE PIN"}};
}
async function setupPassword(m){
 const sb=window.supabaseClient;if(!sb)return;const {data:{user}}=await sb.auth.getUser();if(!user)return;
 $("hfSecPasswordForm").onsubmit=async e=>{e.preventDefault();const old=$("hfSecOld").value,n=$("hfSecNewPass").value,c=$("hfSecConfirmPass").value,st=$("hfSecPasswordStatus"),btn=m.querySelector(".primary");st.className="status";if(n.length<8){st.textContent="New password must be at least 8 characters.";st.classList.add("show","error");return}if(n!==c){st.textContent="New passwords do not match.";st.classList.add("show","error");return}btn.disabled=true;btn.textContent="VERIFYING…";try{const {error:v}=await sb.auth.signInWithPassword({email:user.email,password:old});if(v)throw new Error("Current password is incorrect.");const {error:u}=await sb.auth.updateUser({password:n});if(u)throw u;st.textContent="Password changed successfully.";st.classList.add("show","success");setTimeout(closeModal,900)}catch(x){st.textContent=x?.message||"Unable to change password.";st.classList.add("show","error")}finally{btn.disabled=false;btn.textContent="CHANGE PASSWORD"}};
 $("hfSecOld").focus();
}
function wire(){
 const panel=$("hfSecurityCenter");if(!panel)return false;
 style();
 panel.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const id=b.id;e.preventDefault();e.stopImmediatePropagation();if(id==="hfPinCard")openModal("pin");else if(id==="hfPasswordCard")openModal("password");else if(id==="hfForgotPinCard")openModal("forgot")},true);
 return true;
}
function boot(){if(wire())return;setTimeout(boot,100)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();