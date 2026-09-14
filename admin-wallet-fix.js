(()=>{
'use strict';
if(location.pathname.split('/').pop()!=='admin.html')return;
const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const client=window.supabase?.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(n||0));
const show=(text)=>{const el=document.getElementById('walletMsg');if(!el)return;el.textContent=text;el.classList.add('show')};
const clear=()=>{const el=document.getElementById('walletMsg');if(el){el.textContent='';el.classList.remove('show')}};
const postWalletDirect=async()=>{
 const form=document.getElementById('walletForm');
 if(!form||!client)return;
 clear();
 const userId=document.getElementById('walletUser')?.value;
 const action=document.getElementById('walletAction')?.value;
 const amount=Number(document.getElementById('walletAmount')?.value);
 const selected=document.getElementById('walletDescription')?.value;
 const custom=document.getElementById('walletCustomDescription')?.value?.trim();
 if(!userId){show('Select an active member first.');return}
 if(!Number.isFinite(amount)||amount<=0){show('Enter a valid amount greater than zero.');return}
 if(!selected){show('Select a reason / description.');return}
 const description=selected==='Other'?custom:selected;
 if(!description){show('Enter a custom description.');return}
 const type=action==='debit'?'withdrawal':selected==='Cooperative contribution'?'contribution':'funding';
 const button=form.querySelector('button[type="submit"]');
 if(button){button.disabled=true;button.textContent=action==='credit'?'CREDITING…':'DEBITING…'}
 try{
  const {data:sessionData,error:sessionError}=await client.auth.getSession();
  if(sessionError||!sessionData?.session)throw new Error('Administrator session expired. Please sign in again.');
  const rpc=action==='debit'?'admin_debit_wallet':'admin_credit_wallet';
  const {data,error}=await client.rpc(rpc,{p_user_id:userId,p_amount:amount,p_type:type,p_description:description});
  if(error)throw new Error(error.message||'Wallet operation failed.');
  const result=data||{};
  show(`${action==='debit'?'Wallet debited':'Member credited'} successfully · Reference ${result.reference||'—'} · New balance ${money(result.balance)}`);
  document.getElementById('walletAmount').value='';
  document.getElementById('walletDescription').value='';
  document.getElementById('walletCustomDescription').value='';
  document.getElementById('walletCustomDescription').classList.add('hidden');
  document.getElementById('walletCustomDescription').required=false;
  if(typeof window.loadAdminDashboard==='function')await window.loadAdminDashboard();
  else if(typeof window.load==='function')await window.load();
  else location.reload();
 }catch(error){show(error?.message||'Wallet operation failed. No wallet change was confirmed.')}finally{if(button){button.disabled=false;button.textContent='POST WALLET ENTRY'}}
};
const bind=()=>{
 if(document.documentElement.dataset.hfWalletDelegated==='4')return;
 document.documentElement.dataset.hfWalletDelegated='4';
 document.addEventListener('submit',e=>{
  const form=e.target;
  if(!form||form.id!=='walletForm')return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if(form.dataset.hfWalletProcessing==='1')return;
  form.dataset.hfWalletProcessing='1';
  Promise.resolve(postWalletDirect()).finally(()=>{form.dataset.hfWalletProcessing=''});
 },true);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
