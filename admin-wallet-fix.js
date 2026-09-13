(()=>{
'use strict';
if(location.pathname.split('/').pop()!=='admin.html')return;
const bind=()=>{
 if(document.documentElement.dataset.hfWalletDelegated==='1')return;
 document.documentElement.dataset.hfWalletDelegated='1';
 document.addEventListener('submit',e=>{
  const form=e.target;
  if(!form||form.id!=='walletForm')return;
  if(form.dataset.hfWalletDelegated==='1')return;
  form.dataset.hfWalletDelegated='1';
  e.preventDefault();
  if(typeof window.postWalletEntry==='function')window.postWalletEntry();
 },true);
};
bind();
})();
