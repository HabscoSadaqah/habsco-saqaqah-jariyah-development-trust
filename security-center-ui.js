(()=>{"use strict";
if(!/^(member\.html|member)$/i.test(location.pathname.split("/").pop()||""))return;
const $=id=>document.getElementById(id);
const css=document.createElement("style");
css.textContent=`
.hf-sc-backdrop{position:fixed!important;inset:0!important;background:rgba(2,18,11,.62)!important;z-index:5000!important}
.hf-sc-modal{position:fixed!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:min(360px,calc(100vw - 32px))!important;max-height:calc(100dvh - 28px)!important;overflow:auto!important;background:#fff!important;border-radius:20px!important;padding:22px!important;box-shadow:0 25px 80px rgba(0,0,0,.3)!important;z-index:5001!important;color:#17221c!important}
.hf-sc-close{position:absolute!important;right:12px!important;top:10px!important;width:32px!important;height:32px!important;border:0!important;background:#f1f5f2!important;border-radius:50%!important;font-size:20px!important;color:#516159!important}
.hf-sc-icon{width:52px;height:52px;margin:0 auto 8px;border-radius:15px;background:#edf7f1;display:grid;place-items:center;font-size:28px}
.hf-sc-kicker{text-align:center;font-size:8px;letter-spacing:1px;font-weight:900;color:#087443}
.hf-sc-modal h3{text-align:center;margin:3px 0 6px;font-size:17px;color:#173f2e}
.hf-sc-modal p{text-align:center;font-size:10px;line-height:1.45;color:#728079;margin:0 0 14px}
.hf-sc-rule{background:#f3faf6;border:1px solid #dceee4;border-radius:12px;padding:9px 10px;color:#28664d;font-size:9.5px;margin-bottom:14px}
.hf-sc-actions{display:grid;gap:8px}.hf-sc-actions button{height:44px;border-radius:10px;font-size:10px;font-weight:900;cursor:pointer}
.hf-sc-primary{border:0;background:#087443;color:#fff}.hf-sc-secondary{border:1px solid #dfe9e3;background:#fff;color:#087443}
`;
document.head.appendChild(css);
function close(){document.getElementById("hfSecurityModal")?.remove()}
function open(kind){
 close();const m=document.createElement("div");m.id="hfSecurityModal";
 const data=kind==="pin"?["🔐","Transaction PIN","Set or change your secure 6-digit transaction PIN."]:kind==="password"?["🔑","Change Password","Update your sign-in password securely."]:["🛡️","Forgot Transaction PIN","Your current PIN cannot be displayed or recovered. A forgotten PIN must be reset securely by an administrator."];
 m.innerHTML='<div class="hf-sc-backdrop"></div><section class="hf-sc-modal" role="dialog" aria-modal="true"><button class="hf-sc-close" type="button" aria-label="Close">×</button><div class="hf-sc-icon">'+data[0]+'</div><div class="hf-sc-kicker">ACCOUNT SECURITY</div><h3>'+data[1]+'</h3><p>'+data[2]+'</p><div class="hf-sc-rule">🔐&nbsp; Never share your PIN, password or verification codes.</div><div class="hf-sc-actions"><button class="hf-sc-primary" type="button">Continue</button><button class="hf-sc-secondary" type="button">Close</button></div></section></div>';
 document.body.appendChild(m);
 m.querySelector(".hf-sc-close").onclick=close;m.querySelector(".hf-sc-backdrop").onclick=close;m.querySelector(".hf-sc-secondary").onclick=close;
 m.querySelector(".hf-sc-primary").onclick=()=>{close();if(kind==="pin"&&typeof window.hfOpenPinManager==="function")window.hfOpenPinManager();else if(kind==="password"&&typeof window.hfOpenPasswordManager==="function")window.hfOpenPasswordManager();else if(kind==="forgot"&&typeof window.hfOpenForgotPinModal==="function")window.hfOpenForgotPinModal();};
}
function wire(){
 const panel=$("hfSecurityCenter");if(!panel)return false;
 if(panel.dataset.scWired==="1")return true;panel.dataset.scWired="1";
 panel.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const id=b.id;if(id==="hfPinCard"){e.preventDefault();e.stopPropagation();open("pin")}else if(id==="hfPasswordCard"){e.preventDefault();e.stopPropagation();open("password")}else if(id==="hfForgotPinCard"){e.preventDefault();e.stopPropagation();open("forgot")}},false);
 return true;
}
function boot(){if(!wire())setTimeout(boot,250)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();