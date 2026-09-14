(()=>{
'use strict';
const getClient=()=>window.supabaseClient||(typeof supabaseClient!=='undefined'?supabaseClient:null);
const loadBiometric=()=>new Promise((resolve,reject)=>{
  if(typeof window.hfOpenBiometricControls==='function')return resolve();
  const existing=document.querySelector('script[data-hf-biometric]');
  if(existing){let tries=0;const timer=setInterval(()=>{if(typeof window.hfOpenBiometricControls==='function'){clearInterval(timer);resolve()}else if(++tries>=50){clearInterval(timer);reject(new Error('Biometric security could not be loaded. Please refresh and try again.'))}},100);return}
  const s=document.createElement('script');s.src='biometric-gate.js?v=20260911-9';s.async=false;s.dataset.hfBiometric='1';s.onload=()=>{if(typeof window.hfOpenBiometricControls==='function')resolve();else reject(new Error('Biometric security could not be initialized. Please refresh and try again.'))};s.onerror=()=>reject(new Error('Unable to load biometric security. Please refresh and try again.'));document.head.appendChild(s)
});
const addBiometricCard=()=>{const panel=document.getElementById('hfSecurityCenter'),row=panel?.querySelector('.hf-security-row');if(!panel||!row)return false;if(document.getElementById('hfBiometricCard'))return true;const b=document.createElement('button');b.type='button';b.id='hfBiometricCard';b.innerHTML='<span class="ico">◉</span><span><span class="ttl">Biometric Security</span><span class="sub">Face ID / fingerprint settings</span></span>';row.appendChild(b);b.onclick=async()=>{const sub=b.querySelector('.sub'),msg=document.getElementById('hfSecurityMsg');try{b.disabled=true;if(sub)sub.textContent='Opening controls…';const sb=getClient();if(!sb)throw new Error('Security service is still loading. Please refresh and try again.');const {data,error}=await sb.auth.getSession();if(error||!data?.session?.user)throw new Error('Please log in first.');await loadBiometric();await window.hfOpenBiometricControls();if(sub)sub.textContent='Face ID / fingerprint settings'}catch(err){if(sub)sub.textContent='Face ID / fingerprint settings';if(msg){msg.textContent=err?.message||'Unable to open biometric controls.';msg.className='hf-security-msg show error'}}finally{b.disabled=false}};return true};
const fixPinButton=()=>{
  const old=document.getElementById('hfPinCard');
  if(!old||old.dataset.hfPinRebound==='1')return false;
  const fresh=old.cloneNode(true);
  fresh.id='hfPinCard';
  fresh.dataset.hfPinRebound='1';
  old.replaceWith(fresh);
  fresh.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    try{
      if(typeof window.openPinManager==='function')window.openPinManager();
      else if(typeof openPinManager==='function')openPinManager();
    }catch(_){
      const msg=document.getElementById('hfSecurityMsg');
      if(msg){msg.textContent='Unable to open the PIN dialog. Please refresh the page and try again.';msg.className='hf-security-msg show error'}
    }
  },false);
  return true;
};
const removeLegacyCooperativeNotice=()=>{
  if(!location.pathname.toLowerCase().endsWith('/member.html')&&!location.pathname.toLowerCase().endsWith('member.html'))return;
  const target='Your balances and transactions are securely managed through Habsco Cooperative.';
  const clean=()=>{const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];let n;while(n=walker.nextNode())nodes.push(n);nodes.forEach(node=>{if(node.nodeValue?.trim()===target){const parent=node.parentElement;if(parent&&parent.textContent.trim()===target)parent.remove();else node.remove()}})};
  clean();const observer=new MutationObserver(clean);observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),10000);
};
const moveCharityBelowMoveMoney=()=>{
  if(!location.pathname.toLowerCase().endsWith('/member.html')&&!location.pathname.toLowerCase().endsWith('member.html'))return;
  const titles=[...document.querySelectorAll('.section-title')];const charityTitle=titles.find(el=>el.querySelector('h2')?.textContent.trim().toLowerCase()==='charity');const moveTitle=titles.find(el=>el.querySelector('h2')?.textContent.trim().toLowerCase()==='move money');if(!charityTitle||!moveTitle)return false;const charityGrid=charityTitle.nextElementSibling;const moveGrid=moveTitle.nextElementSibling;if(!charityGrid?.classList.contains('charity-grid')||!moveGrid?.classList.contains('money-grid'))return false;moveTitle.parentElement.insertAdjacentElement('afterend',moveGrid);moveGrid.insertAdjacentElement('afterend',charityTitle);charityTitle.insertAdjacentElement('afterend',charityGrid);return true;
};
const loadRoleFloatNav=()=>{if(document.getElementById('hfRoleFloatNav')||document.querySelector('script[data-hf-role-nav]'))return;const s=document.createElement('script');s.src='role-float-nav.js?v=20260911-1';s.async=false;s.dataset.hfRoleNav='1';document.head.appendChild(s)};
const loadSavingsPinFix=()=>{if(document.querySelector('script[data-hf-savings-pin-fix]'))return;const s=document.createElement('script');s.src='pin-board-fix.js?v=20260913-9';s.async=false;s.dataset.hfSavingsPinFix='1';document.head.appendChild(s)};
const loadPinRefreshFix=()=>{if(document.querySelector('script[data-hf-pin-refresh-fix]'))return;const s=document.createElement('script');s.src='pin-refresh-fix.js?v=20260913-4';s.async=false;s.dataset.hfPinRefreshFix='1';document.head.appendChild(s)};
const loadOrientationFix=()=>{if(document.querySelector('script[data-hf-orientation-modal-fix]'))return;const s=document.createElement('script');s.src='orientation-modal-fix.js?v=20260913-1';s.async=false;s.dataset.hfOrientationFix='1';document.head.appendChild(s)};
const loadPinMobileStyle=()=>{if(document.querySelector('script[data-hf-pin-mobile-style]'))return;const s=document.createElement('script');s.src='pin-mobile-style.js?v=20260913-1';s.async=false;s.dataset.hfPinMobileStyle='1';document.head.appendChild(s)};
const loadSecurityPinCenterFix=()=>{if(document.querySelector('script[data-hf-security-pin-center-fix]'))return;const s=document.createElement('script');s.src='security-pin-modal-fix.js?v=20260914-2';s.async=false;s.dataset.hfSecurityPinCenterFix='1';document.head.appendChild(s)};
const applyMemberBranding=()=>{if(!location.pathname.toLowerCase().endsWith('/member.html')&&!location.pathname.toLowerCase().endsWith('member.html'))return;document.title='Habsco Finance | Member Dashboard';const brand=document.querySelector('.top .brand');if(brand)brand.textContent='HABSCO FINANCE';const heroLabel=document.querySelector('.hero small');if(heroLabel)heroLabel.remove();const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];let n;while(n=walker.nextNode())nodes.push(n);nodes.forEach(node=>{if(node.nodeValue&&/Hassan Finance/i.test(node.nodeValue))node.nodeValue=node.nodeValue.replace(/Hassan Finance/gi,'Habsco Finance')})};
loadSavingsPinFix();loadPinRefreshFix();loadOrientationFix();loadPinMobileStyle();loadSecurityPinCenterFix();loadRoleFloatNav();
const start=()=>{const sb=getClient(),panel=document.getElementById('hfSecurityCenter');if(!sb||!panel){setTimeout(start,250);return}removeLegacyCooperativeNotice();applyMemberBranding();moveCharityBelowMoveMoney();addBiometricCard();fixPinButton();setTimeout(addBiometricCard,300);setTimeout(addBiometricCard,1000);setTimeout(fixPinButton,300);setTimeout(fixPinButton,1000)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
