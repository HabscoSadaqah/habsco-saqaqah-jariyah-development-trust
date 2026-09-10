(function(){
  const SB_URL='https://ythnoeyxovapydbmymdo.supabase.co';
  const SB_KEY='sb_publishable_nfSR2tMCFuHCpkOjjNIakw_P85zunsK';
  function mount(){
    if(document.getElementById('utilityApiControl')||!window.supabase)return;
    const app=document.getElementById('app'); if(!app||app.classList.contains('hidden'))return setTimeout(mount,500);
    const box=document.createElement('section'); box.id='utilityApiControl'; box.className='panel';
    box.innerHTML='<h2>🔌 Accelerate Utility API</h2><p class="notice">Choose which documented Accelerate API family Hassan Finance uses for Airtime, Data, TV and Power. The setting is global and can only be changed by an active administrator.</p><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><strong id="utilityApiModeLabel">Loading API mode…</strong><button id="utilityMerchant" class="btn gray" type="button">MERCHANT API</button><button id="utilitySuper" class="btn" type="button">SUPER MERCHANT API</button></div><div id="utilityApiMsg" class="msg" style="margin-top:12px"></div>';
    const anchor=document.getElementById('wallet'); if(anchor)anchor.parentNode.insertBefore(box,anchor); else app.insertBefore(box,app.firstElementChild);
    const sb=window.supabase.createClient(SB_URL,SB_KEY); const label=document.getElementById('utilityApiModeLabel'); const msg=document.getElementById('utilityApiMsg');
    function paint(mode){const superOn=mode==='super_merchant';label.textContent='ACTIVE: '+(superOn?'SUPER MERCHANT API':'MERCHANT API');document.getElementById('utilitySuper').className='btn '+(superOn?'':'gray');document.getElementById('utilityMerchant').className='btn '+(superOn?'gray':'');}
    async function load(){const r=await sb.rpc('admin_get_utility_api_mode');if(r.error){msg.textContent=r.error.message;msg.classList.add('show');return}paint(r.data)}
    async function setMode(mode){if(!confirm('Switch Hassan Finance utility processing to '+(mode==='super_merchant'?'SUPER MERCHANT API':'MERCHANT API')+'?'))return;const r=await sb.rpc('admin_set_utility_api_mode',{p_mode:mode});if(r.error){msg.textContent=r.error.message;msg.classList.add('show');return}msg.textContent='API mode switched successfully. New utility purchases will use '+(mode==='super_merchant'?'Super Merchant':'Merchant')+' endpoints.';msg.classList.add('show');paint(r.data)}
    document.getElementById('utilityMerchant').onclick=()=>setMode('merchant');document.getElementById('utilitySuper').onclick=()=>setMode('super_merchant');load();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
