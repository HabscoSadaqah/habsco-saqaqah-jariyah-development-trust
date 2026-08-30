
const toggle=document.querySelector('.mobile-toggle');
const menu=document.querySelector('.menu');
if(toggle){toggle.addEventListener('click',()=>menu.classList.toggle('open'))}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
 const el=document.querySelector(a.getAttribute('href')); if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'});menu?.classList.remove('open')}
}));
document.querySelectorAll('[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{
 e.preventDefault(); alert('Thank you. Your message has been received. Please connect the form to your preferred email/Formspree/Google Forms service before going live.');
}));

const copyBtn=document.getElementById('copy-account');
if(copyBtn){
  copyBtn.addEventListener('click', async ()=>{
    const number=document.getElementById('account-number')?.textContent?.trim();
    const status=document.getElementById('copy-status');
    try{
      await navigator.clipboard.writeText(number);
      status.textContent='Account number copied.';
    }catch(e){
      status.textContent='Please copy the account number manually: '+number;
    }
    setTimeout(()=>{status.textContent=''},3000);
  });
}

document.querySelectorAll('[data-finance-tab]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-finance-tab]').forEach(item=>item.classList.remove('active'));
  document.querySelectorAll('.finance-panel').forEach(panel=>panel.classList.remove('active'));
  button.classList.add('active');
  document.getElementById(button.dataset.financeTab)?.classList.add('active');
  window.scrollTo({top:document.querySelector('.finance-shell')?.offsetTop-90||0,behavior:'smooth'});
}));
document.querySelectorAll('[data-finance-action]').forEach(button=>button.addEventListener('click',event=>{
  event.preventDefault();
  document.querySelector(`[data-finance-tab="${button.dataset.financeAction}"]`)?.click();
}));
document.querySelectorAll('[data-prototype-form]').forEach(form=>form.addEventListener('submit',event=>{
  event.preventDefault();
  const message=form.querySelector('[data-form-message]');
  if(message) message.textContent='Saved as a prototype request. Connect this form to authenticated backend services before launch.';
  form.reset();
}));
