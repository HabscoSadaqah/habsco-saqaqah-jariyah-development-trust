const HASSAN_ADMIN_URL='https://ythnoeyxovapydbmymdo.supabase.co';
const HASSAN_ADMIN_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsN';
(async()=>{
  try{
    if(!window.supabase?.createClient)return;
    const sb=window.supabase.createClient(HASSAN_ADMIN_URL,HASSAN_ADMIN_KEY);
    const {data:{session}}=await sb.auth.getSession();
    if(!session?.user)return;
    const {data:profile}=await sb.from('profiles').select('role,status').eq('id',session.user.id).maybeSingle();
    if(profile?.role!=='admin'||profile?.status!=='active')return;
    const top=document.querySelector('.top');
    if(!top||document.getElementById('memberAdminControl'))return;
    const style=document.createElement('style');
    style.textContent='#memberAdminControl{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#0b6b40,#064f2e);color:#fff;border:0;border-radius:10px;padding:9px 12px;font-weight:850;font-size:11px;text-decoration:none;box-shadow:0 5px 14px rgba(6,79,46,.18);margin-left:auto;margin-right:4px}#memberAdminControl:hover{transform:translateY(-1px)}@media(max-width:600px){#memberAdminControl{font-size:10px;padding:8px 9px}}';
    document.head.appendChild(style);
    const link=document.createElement('a');
    link.id='memberAdminControl';
    link.href='admin.html';
    link.textContent='🛡️ ADMIN CONTROL';
    link.setAttribute('aria-label','Open administrator control panel');
    top.insertBefore(link,top.querySelector('#logout'));
  }catch(error){console.warn('Admin portal link unavailable',error);}
})();
