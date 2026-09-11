(()=>{
  if(document.getElementById('hfRoleFloatNav'))return;
  const path=location.pathname.split('/').pop()||'index.html';
  const isAdmin=path==='admin.html'||path==='admin-control-center.html';
  const isMember=path==='member.html';
  if(!isAdmin&&!isMember)return;
  const getClient=()=>window.supabaseClient||(typeof supabaseClient!=='undefined'?supabaseClient:null);
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const render=()=>{
    if(document.getElementById('hfRoleFloatNav'))return;
    const css=document.createElement('style');
    css.textContent='.hf-role-fab{position:fixed;right:18px;bottom:22px;z-index:10000;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 16px;border:0;border-radius:999px;background:linear-gradient(135deg,#062f20,#14834e);color:#fff;text-decoration:none;font:800 12px/1 Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;box-shadow:0 10px 28px rgba(6,47,32,.28);transition:transform .18s ease,box-shadow .18s ease}.hf-role-fab:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(6,47,32,.34)}.hf-role-fab:active{transform:scale(.97)}.hf-role-fab .ico{font-size:17px;line-height:1}.hf-role-fab .label{white-space:nowrap}@media(max-width:600px){.hf-role-fab{right:14px;bottom:76px;height:46px;padding:0 14px}.hf-role-fab .label{font-size:11px}}';
    document.head.appendChild(css);
    const a=document.createElement('a');a.id='hfRoleFloatNav';a.className='hf-role-fab';a.href=isAdmin?'member.html':'admin-control-center.html';a.setAttribute('aria-label',isAdmin?'Back to member panel':'Open admin panel');a.title=isAdmin?'Member Panel':'Admin Panel';a.innerHTML=isAdmin?'<span class="ico">←</span><span class="label">Member Panel</span>':'<span class="ico">🔑</span><span class="label">Admin Panel</span>';document.body.appendChild(a);
  };
  const add=async()=>{
    for(let attempt=0;attempt<24;attempt++){
      if(document.getElementById('hfRoleFloatNav'))return;
      const sb=getClient();
      if(sb){
        try{
          const {data:{session}}=await sb.auth.getSession();
          if(session?.user){
            if(isMember){
              const {data:profile,error}=await sb.from('profiles').select('role,status').eq('id',session.user.id).maybeSingle();
              if(!error&&profile?.role==='admin'&&profile?.status==='active'){render();return;}
              if(!error&&profile)return;
            }else{render();return;}
          }
        }catch(_){ }
      }
      await wait(250);
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add,{once:true});else add();
})();
