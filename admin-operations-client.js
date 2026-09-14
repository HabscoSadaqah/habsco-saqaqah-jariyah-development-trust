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
 const endpoint=`${SUPABASE_URL}/functions/v1/admin-operations`;
 let response;
 try{
  response=await fetch(endpoint,{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({operation,...payload})});
 }catch(e){
  throw new Error(`Administrator security service could not be reached: ${e?.message||'network error'}`);
 }
 let body=null;
 try{body=await response.json()}catch{}
 if(!response.ok){
  const serverMessage=body?.error||body?.message;
  throw new Error(serverMessage||`Administrator security service returned HTTP ${response.status}.`);
 }
 if(body?.error)throw new Error(body.error);
 return body;
};
const loadAdminControls=()=>{if(document.getElementById('hfAdminControlsLoader'))return;const s=document.createElement('script');s.id='hfAdminControlsLoader';s.src='admin-controls.js?v=20260914-2';s.defer=true;document.head.appendChild(s)};
const loadWalletFix=()=>{if(document.getElementById('hfAdminWalletFix'))return;const s=document.createElement('script');s.id='hfAdminWalletFix';s.src='admin-wallet-fix.js?v=20260914-5';s.defer=true;document.head.appendChild(s)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{loadAdminControls();loadWalletFix()},{once:true});else{loadAdminControls();loadWalletFix()}
})();
