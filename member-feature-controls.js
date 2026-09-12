(()=>{
const URL='https://ythnoeyxovapydbmymdo.supabase.co';
const KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const FEATURES={wallet_enabled:['heroBalance','totalBalance'],savings_enabled:['savingsBalance'],shares_enabled:['sharesBalance'],special_savings_enabled:['specialSavingsBalance'],payments_enabled:['payments'],transfers_enabled:['transfers'],interest_free_loan_enabled:['loan'],funding_requests_enabled:['funding'],statements_enabled:['statements'],member_profile_enabled:[]};
const q=(s)=>document.querySelector(s);
function hideFeature(key){
 const ids=FEATURES[key]||[];
 ids.forEach(id=>{const el=document.getElementById(id);if(el)el.closest('.app-card,.balance-card,.loan-card,.section-title')?.remove();});
 if(key==='payments_enabled')document.querySelectorAll('.service-grid').forEach(el=>el.remove());
 if(key==='transfers_enabled')document.querySelectorAll('.money-grid').forEach(el=>el.remove());
 if(key==='interest_free_loan_enabled'){document.querySelectorAll('.loan-card').forEach(el=>el.remove());const h=[...document.querySelectorAll('.section-title h2')].find(x=>x.textContent.trim()==='Interest-Free Loan');h?.closest('.section-title')?.remove();}
 if(key==='funding_requests_enabled'){document.querySelectorAll('a[href*="action=fund"]').forEach(el=>el.remove());}
 if(key==='statements_enabled'){document.querySelectorAll('a[href="statement.html"],a[href^="statement.html?"]').forEach(el=>el.remove());}
}
async function run(){
 if(!window.supabase?.createClient)return setTimeout(run,300);
 const client=window.supabase.createClient(URL,KEY);
 const {data:{session}}=await client.auth.getSession();
 if(!session)return;
 const {data,error}=await client.rpc('member_get_feature_controls');
 if(error||!data)return;
 const row=Array.isArray(data)?data[0]:data;
 if(!row)return;
 Object.keys(FEATURES).forEach(k=>{if(row[k]===false)hideFeature(k);});
 document.documentElement.dataset.memberFeaturesLoaded='true';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
