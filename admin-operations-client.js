(()=>{
'use strict';
const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const supabaseAdminOps=window.supabase?.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
window.habscoAdminOperation=async function(operation,payload={}){
 if(!supabaseAdminOps)throw new Error('Finance security client is unavailable.');
 const {data:{session},error:sessionError}=await supabaseAdminOps.auth.getSession();
 if(sessionError)throw new Error('Could not read the administrator session. Please sign in again.');
 if(!session?.access_token)throw new Error('Administrator session expired. Please sign in again.');
 const {data,error}=await supabaseAdminOps.functions.invoke('admin-operations',{
  body:{operation,...payload},
  headers:{Authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_PUBLISHABLE_KEY}
 });
 if(error){
  const context=error?.context;
  let detail='';
  try{if(context instanceof Response)detail=await context.text()}catch{}
  throw new Error(detail||error.message||'Administrator operation failed.');
 }
 if(data?.error)throw new Error(data.error);
 return data;
};
const loadAdminControls=()=>{if(document.getElementById('hfAdminControlsLoader'))return;const s=document.createElement('script');s.id='hfAdminControlsLoader';s.src='admin-controls.js?v=20260914-1';s.defer=true;document.head.appendChild(s)};
const loadWalletFix=()=>{if(document.getElementById('hfAdminWalletFix'))return;const s=document.createElement('script');s.id='hfAdminWalletFix';s.src='admin-wallet-fix.js?v=20260914-3';s.defer=true;document.head.appendChild(s)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{loadAdminControls();loadWalletFix()},{once:true});else{loadAdminControls();loadWalletFix()}
})();
