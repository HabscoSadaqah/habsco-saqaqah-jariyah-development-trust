(()=>{
  const ID='hfRoleFloatNav';
  const ADMIN_SECTION_ID='hfEmbeddedAdminDashboard';
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
  const removeEmbeddedAdmin=()=>document.getElementById(ADMIN_SECTION_ID)?.remove();
  const renderEmbeddedAdmin=()=>{
    if(!isMemberPage||document.getElementById(ADMIN_SECTION_ID))return;
    const wrap=document.querySelector('.wrap');
    if(!wrap)return;
    const section=document.createElement('section');
    section.id=ADMIN_SECTION_ID;
    section.innerHTML=`<style>
      #${ADMIN_SECTION_ID}{margin-top:30px;padding-top:6px;border-top:1px solid #dfe9e3}
      #${ADMIN_SECTION_ID} .hf-admin-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:18px 0 10px}
      #${ADMIN_SECTION_ID} .hf-admin-heading h2{margin:0;color:#064f2e;font-size:16px;font-weight:900}
      #${ADMIN_SECTION_ID} .hf-admin-heading span{font-size:9px;color:#728079;font-weight:700}
      #${ADMIN_SECTION_ID} .hf-admin-frame{width:100%;min-height:720px;height:720px;border:1px solid #dfe9e3;border-radius:18px;background:#f4f7f5;display:block;box-shadow:0 8px 24px rgba(24,60,42,.07)}
      #${ADMIN_SECTION_ID} .hf-admin-open{display:inline-flex;align-items:center;justify-content:center;margin-top:9px;padding:9px 12px;border-radius:10px;background:#064f2e;color:#fff;text-decoration:none;font-size:9px;font-weight:850}
      @media(max-width:600px){#${ADMIN_SECTION_ID}{margin-top:22px}#${ADMIN_SECTION_ID} .hf-admin-heading{align-items:flex-start;flex-direction:column;gap:4px}#${ADMIN_SECTION_ID} .hf-admin-frame{min-height:760px;height:760px;border-radius:14px}}
    </style>
    <div class="hf-admin-heading"><h2>🛡️ Admin Dashboard</h2><span>Administrator controls appear below your member dashboard</span></div>
    <iframe class="hf-admin-frame" src="admin-control-center.html?embedded=1" title="Hassan Finance Admin Dashboard"></iframe>
    <a class="hf-admin-open" href="admin-control-center.html">Open Full Admin Control Center →</a>`;
    wrap.appendChild(section);
    const frame=section.querySelector('.hf-admin-frame');
    const resize=()=>{
      try{
        const doc=frame.contentDocument;
        const h=Math.max(720,doc.documentElement.scrollHeight,doc.body?.scrollHeight||0);
        frame.style.height=Math.min(h,12000)+'px';
      }catch(_){/* cross-origin fallback keeps the safe minimum height */}
    };
    frame.addEventListener('load',()=>{resize();setTimeout(resize,400);setTimeout(resize,1200)});
    window.addEventListener('resize',resize);
  };
  const render=()=>{
    if(isMemberPage){
      renderEmbeddedAdmin();
      remove();
      return;
    }
    if(document.getElementById(ID))return;
    const cssId='hfRoleFloatNavStyle';
    if(!document.getElementById(cssId)){
      const css=document.createElement('style');css.id=cssId;
      css.textContent='.hf-role-fab{position:fixed;right:18px;bottom:22px;z-index:2147483647;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 16px;border:0;border-radius:999px;background:linear-gradient(135deg,#062f20,#14834e);color:#fff!important;text-decoration:none!important;font:800 12px/1 Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;box-shadow:0 10px 28px rgba(6,47,32,.3);cursor:pointer}.hf-role-fab .ico{font-size:19px;line-height:1}.hf-role-fab .label{white-space:nowrap}@media(max-width:600px){.hf-role-fab{right:14px;bottom:78px;height:46px;padding:0 14px}.hf-role-fab .label{font-size:11px}}';
      document.head.appendChild(css);
    }
    const a=document.createElement('a');a.id=ID;a.className='hf-role-fab';a.href='member.html';a.setAttribute('aria-label','Back to member panel');a.title='Member Panel';a.innerHTML='<span class="ico">←</span><span class="label">Member Panel</span>';document.body.appendChild(a);
  };
  const check=async()=>{
    const sb=getClient();
    if(!sb)return false;
    try{
      const {data:{user},error}=await sb.auth.getUser();
      if(error||!user){if(isMemberPage){removeEmbeddedAdmin();remove()}return false}
      if(!isMemberPage){render();return true}
      const email=String(user.email||'').trim().toLowerCase();
      if(email===ADMIN_EMAIL){render();return true}
      const {data:profile,error:profileError}=await sb.from('profiles').select('role,status').eq('id',user.id).maybeSingle();
      if(!profileError&&profile?.role==='admin'&&profile?.status==='active'){render();return true}
      if(!profileError){removeEmbeddedAdmin();remove();return true}
      const {data:isAdmin,error:adminError}=await sb.rpc('is_admin');
      if(!adminError&&isAdmin===true){render();return true}
      removeEmbeddedAdmin();remove();
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
