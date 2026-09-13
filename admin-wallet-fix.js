(()=>{
'use strict';
if(location.pathname.split('/').pop()!=='admin.html')return;
const bind=()=>{
 if(document.documentElement.dataset.hfWalletDelegated==='2')return;
 document.documentElement.dataset.hfWalletDelegated='2';
 document.addEventListener('submit',e=>{
  const form=e.target;
  if(!form||form.id!=='walletForm')return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if(form.dataset.hfWalletProcessing==='1')return;
  form.dataset.hfWalletProcessing='1';
  Promise.resolve(typeof window.postWalletEntry==='function'?window.postWalletEntry():null).finally(()=>{form.dataset.hfWalletProcessing='';});
 },true);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
