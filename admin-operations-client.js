(()=>{
'use strict';
const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
const supabaseAdminOps=window.supabase?.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
window.habscoAdminOperation=async function(operation,payload={}){
 if(!supabaseAdminOps)throw new Error('Finance security client is unavailable.');
 const {data:{session}}=await supabaseAdminOps.auth.getSession();
 if(!session)throw new Error('Administrator session expired. Please sign in again.');
 const {data,error}=await supabaseAdminOps.functions.invoke('admin-operations',{body:{operation,...payload}});
 if(error)throw error;
 if(data?.error)throw new Error(data.error);
 return data;
};
})();
