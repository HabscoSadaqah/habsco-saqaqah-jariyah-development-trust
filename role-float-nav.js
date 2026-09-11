(()=>{
  const ID='hfRoleFloatNav';
  const path=location.pathname.split('/').pop()||'index.html';
  const isAdminPage=path==='admin.html'||path==='admin-control-center.html';
  const isMemberPage=path==='member.html';
  if(!isAdminPage&&!isMemberPage)return;
  const getClient=()=>window.supabaseClient||(typeof supabaseClient!=='undefined'?supabaseClient:null);
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const remove=()=>document.getElementById(ID)?.remove();
  const render=(admin)=>{
    if(!admin){remove();return}
    if(document.getElementById(ID))return;
    if(!document.getElementById('hfRoleFloatNavStyle')){const css=document.createElement('style');css.id='hfRoleFloatNavStyle';css.textContent='.hf-role-fab{position:fixed;right:18px;bottom:22px;z-index:2147483000;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 16px;border:0;border-radius:999px;background:linear-gradient(135deg,#062f20,#14834e);color:#fff;text-decoration:none;font:800 12px/1 Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;box-shadow:0 10px 28px rgba(6,47,32,.28);transition:transform .18s ease,box-shadow .18s ease}.hf-role-fab:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(6,47,32,.34)}.hf-role-fab:active{transform:scale(.97)}.hf-role-fab .ico{font-size:19px;line-height:1}.hf-role-fab .label{white-space:nowrap}@media(max-width:600px){.hf-role-fab{right:14px;bottom:76px;height:46px;padding:0 14px}.hf-role-fab .label{font-size:11px}}';document.head.appendChild(css)}
    const a=document.createElement('a');a.id=ID;a.className='hf-role-fab';a.href=isMemberPage?'admin-control-center.html':'member.html';a.setAttribute('aria-label',isMemberPage?'Open admin panel':'Back to member panel');a.title=isMemberPage?'Admin Panel':'Member Panel';a.innerHTML=isMemberPage?'<span class="ico">🔑</span><span class="label">Admin Panel</span>':'<span class="ico">←</span><span class="label">Member Panel</span>';document.body.appendChild(a);
  };
  const check=async()=>{const sb=getClient();if(!sb)return false;try{const {data:{session},error:sessionError}=await sb.auth.getSession();if(sessionError||!session?.user){if(isMemberPage)remove();return false}if(!isMemberPage){render(true);return true}const {data:profile,error}=await sb.from('profiles').select('role,status').eq('id',session.user.id).maybeSingle();render(!error&&profile?.role==='admin'&&profile?.status==='active');return true}catch(_){return false}};
  const boot=async()=>{for(let i=0;i<80;i++){if(await check())return;await wait(250)}};
  const start=()=>{boot();const sb=getClient();if(sb?.auth?.onAuthStateChange)sb.auth.onAuthStateChange(()=>setTimeout(check,0));window.addEventListener('pageshow',()=>setTimeout(check,0));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(check,0)})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
