(()=>{
  const p=new URLSearchParams(location.search), action=p.get('action')||'send';
  const labels={send:'Send Money',transfer:'Fund Transfer',fund:'Add Money',save:'Save in Cooperative',qard:'Interest-Free Loan','request-qard':'Interest-Free Loan','request-loan':'Interest-Free Loan','repay-qard':'Loan Repayment',airtime:'Airtime',data:'Mobile Data',tv:'Cable TV',electricity:'Electricity'};
  const label=labels[action]||'Transaction';
  document.addEventListener('submit',e=>{
    const form=e.target;if(!form||form.id!=='actionForm'||form.dataset.confirmed==='1')return;
    const amount=form.querySelector('#amount')?.value;
    const n=amount?Number(amount):0;
    if(amount&&!Number.isFinite(n)||amount&&n<=0){e.preventDefault();return;}
    const amountText=amount?`\nAmount: ₦${n.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'';
    const recipient=form.querySelector('#recipient')?.value?.trim();
    const account=form.querySelector('#account')?.value;
    const target=recipient?`\nMember: ${recipient}`:account?`\nAccount: ${account.replaceAll('_',' ')}`:'';
    const ok=window.confirm(`Confirm ${label}${amountText}${target}\n\nThis action will be submitted to the Habsco Cooperative server. Continue?`);
    if(!ok){e.preventDefault();e.stopImmediatePropagation();return false;}
    form.dataset.confirmed='1';
    setTimeout(()=>{form.dataset.confirmed='0'},1000);
  },true);
})();
