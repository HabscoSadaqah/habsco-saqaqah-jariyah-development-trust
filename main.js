
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
