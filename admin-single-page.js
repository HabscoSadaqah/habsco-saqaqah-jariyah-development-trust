(()=>{
  if(location.pathname.split('/').pop()!=='admin.html')return;

  const removeLegacyNav=()=>{
    ['persistentAdminNav','hfAdminSingleNav','hfFastAccess','hfAdminDropdownShell','hfAdminDropdownHeader'].forEach(id=>document.getElementById(id)?.remove());
    document.querySelectorAll('.sidebar,.mobile-nav,.quick,.top').forEach(el=>el.remove());
    document.querySelectorAll('.admin-focus-only,.admin-focus-hidden,.admin-focus-grid,.admin-focus-dashboard,.admin-focus-analytics').forEach(el=>{
      el.classList.remove('admin-focus-only','admin-focus-hidden','admin-focus-grid','admin-focus-dashboard','admin-focus-analytics','active-focus');
      el.style.removeProperty('display');
    });
  };

  const build=()=>{
    const app=document.getElementById('app'),wrap=document.querySelector('.wrap');
    if(!app||!wrap){setTimeout(build,150);return;}
    if(document.getElementById('hfAdminAccordion'))return;

    removeLegacyNav();

    const style=document.createElement('style');
    style.id='hfAdminAccordionStyle';
    style.textContent=`
      body{background:#f4f7f5!important;padding-bottom:18px!important;overflow-x:hidden!important}
      .layout{display:block!important}.main{width:100%!important}.wrap{max-width:920px!important;margin:auto!important;padding:12px 12px 28px!important}
      #hfAdminAccordionHeader{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 14px;margin-bottom:10px;border-radius:14px;background:linear-gradient(135deg,#062f20,#0b6340);color:#fff;box-shadow:0 8px 22px #083e2720}
      #hfAdminAccordionHeader strong{font-size:14px}#hfAdminAccordionHeader small{display:block;margin-top:2px;font-size:9px;opacity:.75}
      #hfAdminAccordionHeader button{border:1px solid #ffffff35;background:#ffffff14;color:#fff;border-radius:9px;padding:8px 11px;font-weight:900}
      #hfAdminAccordion{display:grid;gap:7px}
      #hfAdminAccordion details{background:#fff;border:1px solid #dfe8e2;border-radius:12px;overflow:hidden;box-shadow:0 3px 12px #12351a09}
      #hfAdminAccordion summary{list-style:none;cursor:pointer;padding:13px 14px;font-size:13px;font-weight:950;color:#173d2b;display:flex;justify-content:space-between;align-items:center}
      #hfAdminAccordion summary::-webkit-details-marker{display:none}#hfAdminAccordion summary:after{content:'＋';color:#126b42;font-size:17px}
      #hfAdminAccordion details[open] summary{background:#f1f8f4;color:#126b42}#hfAdminAccordion details[open] summary:after{content:'−'}
      #hfAdminAccordion .body{padding:9px 10px 10px}#hfAdminAccordion .section-title{display:none!important}
      #hfAdminAccordion .profile{display:flex!important;margin:0 0 8px;padding:11px;border-radius:10px;box-shadow:none}
      #hfAdminAccordion .stats{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:0}
      #hfAdminAccordion .card{padding:10px;border-radius:9px;box-shadow:none}#hfAdminAccordion .stat{font-size:18px}
      #hfAdminAccordion .panel{margin:0 0 8px;padding:11px;border-radius:10px;box-shadow:none}
      #hfAdminAccordion .panel:last-child{margin-bottom:0}#hfAdminAccordion .grid{display:grid!important;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 8px}
      #hfAdminAccordion .grid>*{display:block!important;min-width:0}#hfAdminAccordion h2{font-size:14px!important}#hfAdminAccordion .notice{font-size:12px}
      #hfAdminAccordion .table-wrap{max-height:360px;overflow:auto}#hfAdminAccordion table{min-width:640px}.hero,.control-note,.footer-note{display:none!important}
      @media(max-width:700px){.wrap{padding:7px 8px 18px!important}#hfAdminAccordionHeader{border-radius:10px;padding:11px 12px}#hfAdminAccordionHeader strong{font-size:13px}#hfAdminAccordion .stats{grid-template-columns:1fr 1fr!important}#hfAdminAccordion .grid{grid-template-columns:1fr!important}#hfAdminAccordion .profile{flex-direction:column;align-items:flex-start}#hfAdminAccordion .table-wrap{max-height:300px}}
    `;
    document.head.appendChild(style);

    const header=document.createElement('header');
    header.id='hfAdminAccordionHeader';
    header.innerHTML='<div><strong>HASSAN FINANCE · ADMIN CONTROL</strong><small>All administrator functions · Select a section below</small></div>';
    const logout=document.getElementById('logout');
    if(logout){logout.style.display='';header.appendChild(logout)}
    wrap.insertBefore(header,wrap.firstChild);

    const shell=document.createElement('div');shell.id='hfAdminAccordion';
    const add=(title,open=false)=>{const d=document.createElement('details');d.open=open;const s=document.createElement('summary');s.textContent=title;const b=document.createElement('div');b.className='body';d.append(s,b);shell.appendChild(d);return b;};
    const move=(b,n)=>{if(n)b.appendChild(n);};

    const overview=add('📊 Dashboard Overview',true);
    move(overview,app.querySelector(':scope > .profile'));
    move(overview,app.querySelector(':scope > .stats'));

    const labelFor=t=>{
      const x=t.toLowerCase();
      if(x.includes('member identity'))return '🪪 Member Identity Control';
      if(x.includes('financial'))return '💳 Financial Controls';
      if(x.includes('requests'))return '📥 Requests & Reviews';
      if(x.includes('member management'))return '👥 Member Management';
      if(x.includes('security')||x.includes('audit'))return '🛡️ Security & Oversight';
      if(x.includes('analytics'))return '📈 Analytics';
      return '⚙️ '+t.replace(/[📊🪪💳📥👥🛡️📈]/g,'').trim();
    };

    const analytics=document.getElementById('adminAnalytics');
    const children=[...app.children].filter(n=>
      n!==shell &&
      n!==analytics &&
      n!==document.getElementById('globalMsg') &&
      !n.classList.contains('profile') &&
      !n.classList.contains('stats')
    );

    let currentBody=null;const orphan=[];
    children.forEach(node=>{
      if(node.classList?.contains('section-title')){
        currentBody=add(labelFor(node.textContent.trim()),false);
        node.remove();
      }else if(currentBody){
        currentBody.appendChild(node);
      }else orphan.push(node);
    });

    if(orphan.length){const b=add('⚙️ Other Admin Controls',false);orphan.forEach(n=>b.appendChild(n));}

    if(analytics){const b=add('📈 Analytics',false);b.appendChild(analytics);}

    const global=document.getElementById('globalMsg');
    if(global)overview.insertBefore(global,overview.firstChild);

    app.appendChild(shell);app.style.display='block';removeLegacyNav();
  };

  const start=()=>build();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,350));
  else setTimeout(start,350);
})();
