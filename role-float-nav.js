(()=>{
  const ID='hfRoleFloatNav';
  const path=location.pathname.split('/').filter(Boolean).pop()||'index.html';
  const isAdminPage=path==='admin.html'||path==='admin-control-center.html';
  const isMemberPage=path==='member.html';
  if(!isAdminPage&&!isMemberPage)return;
  const SUPABASE_URL='https://ythnoeyxovapydbmymdo.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
  const ADMIN_EMAIL='habscosadaqah@gmail.com';
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  let client=null;
  const getClient=()=>{
    if(client)return client;
    try{
      if(window.supabaseClient)client=window.supabaseClient;
      else if(window.supabase?.createClient)client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
    }catch(_){client=null}
    return client;
  };
  const remove=()=>document.getElementById(ID)?.remove();
  const render=()=>{
    if(document.getElementById(ID))return;
    const cssId='hfRoleFloatNavStyle';
    if(!document.getElementById(cssId)){
      const css=document.createElement('style');css.id=cssId;
      css.textContent='.hf-role-fab{position:fixed;right:18px;bottom:22px;z-index:2147483647;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 16px;border:0;border-radius:999px;background:linear-gradient(135deg,#062f20,#14834e);color:#fff!important;text-decoration:none!important;font:800 12px/1 Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;box-shadow:0 10px 28px rgba(6,47,32,.3);cursor:pointer}.hf-role-fab .ico{font-size:19px;line-height:1}.hf-role-fab .label{white-space:nowrap}@media(max-width:600px){.hf-role-fab{right:14px;bottom:78px;height:46px;padding:0 14px}.hf-role-fab .label{font-size:11px}}';
      document.head.appendChild(css);
    }
    const a=document.createElement('a');a.id=ID;a.className='hf-role-fab';a.href=isMemberPage?'admin-control-center.html':'member.html';a.setAttribute('aria-label',isMemberPage?'Open admin panel':'Back to member panel');a.title=isMemberPage?'Admin Panel':'Member Panel';a.innerHTML=isMemberPage?'<span class="ico">🔑</span><span class="label">Admin Panel</span>':'<span class="ico">←</span><span class="label">Member Panel</span>';document.body.appendChild(a);
  };
  const check=async()=>{
    const sb=getClient();
    if(!sb)return false;
    try{
      const {data,error}=await sb.auth.getUser();
      const user=data?.user;
      if(error||!user){if(isMemberPage)remove();return false}
      if(!isMemberPage){render();return true}
      const email=String(user.email||'').trim().toLowerCase();
      if(email===ADMIN_EMAIL){render();return true}
      const {data:profile,error:profileError}=await sb.from('profiles').select('role,status').eq('id',user.id).maybeSingle();
      if(!profileError&&profile?.role==='admin'&&profile?.status==='active'){render();return true}
      if(!profileError){remove();return true}
      const {data:isAdmin,error:adminError}=await sb.rpc('is_admin');
      if(!adminError&&isAdmin===true){render();return true}
      return false;
    }catch(_){return false}
  };
  const boot=async()=>{for(let i=0;i<120;i++){if(await check())return;await wait(250)}};
  const start=()=>{
    boot();
    const sb=getClient();
    if(sb?.auth?.onAuthStateChange)sb.auth.onAuthStateChange(()=>setTimeout(boot,100));
    window.addEventListener('pageshow',()=>setTimeout(boot,100));
    window.addEventListener('focus',()=>setTimeout(boot,100));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(boot,100)});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
