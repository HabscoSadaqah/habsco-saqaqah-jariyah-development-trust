(()=>{'use strict';
  if(!/\/member(?:\.html)?$/.test((location.pathname||'').toLowerCase())&&!location.pathname.endsWith('/dashboard'))return;
  let ready=false,loading=null;
  const selector='a[href*="type=savings"],a[href="savings.html"],#savingsBalance';
  function load(){
    if(ready)return Promise.resolve();
    if(loading)return loading;
    loading=new Promise((resolve,reject)=>{
      if(document.querySelector('script[data-hf-savings-loan]')){ready=true;resolve();return}
      const s=document.createElement('script');
      s.src='savings-borrowing-ui.js?v=20260914-1';
      s.dataset.hfSavingsLoan='1';
      s.async=false;
      s.onload=()=>{ready=true;resolve()};
      s.onerror=reject;
      (document.body||document.head).appendChild(s);
    });
    return loading;
  }
  // Savings must never open during login/dashboard initialization.
  // Load the Savings UI only after a real member click.
  document.addEventListener('click',async e=>{
    if(!e.isTrusted)return;
    const target=e.target?.closest?.(selector);
    if(!target)return;
    if(ready)return;
    e.preventDefault();
    e.stopPropagation();
    try{
      await load();
      target.click();
    }catch(_){
      target.href='savings.html';
      location.href='savings.html';
    }
  },true);
})();
