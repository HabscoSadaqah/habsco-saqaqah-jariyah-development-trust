/* Habsco unified member balance — server-side source of truth. */
(function(){
  'use strict';
  if(!/\/member(?:\.html)?$/.test(location.pathname))return;
  const URL='https://ythnoeyxovapydbmymdo.supabase.co';
  const KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
  const money=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',minimumFractionDigits:2}).format(Number(n||0));
  const set=(id,v)=>{const el=document.getElementById(id);if(el){el.textContent=money(v);el.style.visibility='visible';el.style.opacity='1'}};
  async function refresh(){
    if(!window.supabase?.createClient)return;
    const client=window.supabase.createClient(URL,KEY);
    const {data:{session}}=await client.auth.getSession();
    if(!session)return;
    const {data,error}=await client.rpc('get_unified_member_balance',{p_user_id:session.user.id});
    if(error||!data)return;
    const row=Array.isArray(data)?data[0]:data;
    if(!row)return;
    const wallet=Number(row.wallet_balance||0), savings=Number(row.savings_balance||0), shares=Number(row.shares_balance||0), special=Number(row.special_savings_balance||0), total=Number(row.total_balance||0);
    if([wallet,savings,shares,special,total].some(v=>!Number.isFinite(v)||v<0))return;
    set('heroBalance',wallet);set('balance',wallet);set('availableBalance',wallet);
    set('savingsBalance',savings);set('sharesBalance',shares);set('specialSavingsBalance',special);
    set('cooperativeBalance',savings+shares+special);set('totalBalance',total);
  }
  function start(){refresh();setInterval(()=>{if(document.visibilityState==='visible')refresh()},30000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
