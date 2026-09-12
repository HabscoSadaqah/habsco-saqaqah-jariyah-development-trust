(()=>{
  const path=location.pathname.split('/').filter(Boolean).pop()||'index.html';
  const isCenter=path==='admin-control-center.html',isPortal=path==='admin.html';
  if(!isCenter&&!isPortal)return;

  if(isPortal){
    const clean=()=>{
      const app=document.getElementById('app'),wrap=document.querySelector('.wrap');
      if(!app||!wrap){setTimeout(clean,120);return;}
      if(document.getElementById('hfAdminDropdownShell'))return;

      /* Block the older single-page script from creating another navigation bar. */
      if(!document.getElementById('hfAdminSingleNav')){
        const guard=document.createElement('div');
        guard.id='hfAdminSingleNav';
        guard.hidden=true;
        document.body.appendChild(guard);
      }

      const style=document.createElement('style');
      style.id='hfAdminDropdownStyle';
      style.textContent=`
        body{background:#f4f7f5!important;padding-bottom:18px!important}
        .layout{display:block!important}
        .sidebar,.mobile-nav,.hero,.control-note,.quick,.top{display:none!important}
        .main{width:100%!important}
        .wrap{max-width:900px!important;margin:0 auto!important;padding:14px 14px 28px!important}
        #hfAdminDropdownHeader{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px;padding:13px 15px;background:linear-gradient(135deg,#062f20,#0b6340);color:#fff;border-radius:15px;box-shadow:0 8px 24px #083e2720}
        #hfAdminDropdownHeader .hf-title{font-weight:950;font-size:15px;letter-spacing:.2px}
        #hfAdminDropdownHeader .hf-sub{font-size:10px;opacity:.76;margin-top:3px}
        #hfAdminDropdownHeader button{border:1px solid #ffffff35;background:#ffffff14;color:#fff;border-radius:9px;padding:9px 12px;font-weight:900;cursor:pointer}
        #hfAdminDropdownShell{display:grid;gap:8px}
        #hfAdminDropdownShell details{background:#fff;border:1px solid #dfe8e2;border-radius:13px;overflow:hidden;box-shadow:0 4px 16px #12351a0a}
        #hfAdminDropdownShell summary{list-style:none;cursor:pointer;padding:14px 15px;display:flex;align-items:center;justify-content:space-between;gap:10px;font-weight:950;color:#173d2b;background:#fff}
        #hfAdminDropdownShell summary::-webkit-details-marker{display:none}
        #hfAdminDropdownShell summary:after{content:'⌄';font-size:16px;color:#126b42;transition:.15s}
        #hfAdminDropdownShell details[open] summary{background:#f2f8f4;color:#126b42}
        #hfAdminDropdownShell details[open] summary:after{transform:rotate(180deg)}
        #hfAdminDropdownShell .hf-section-body{padding:0 12px 12px}
        #hfAdminDropdownShell .profile{display:flex!important;margin:0 0 10px;padding:13px;border-radius:11px;box-shadow:none}
        #hfAdminDropdownShell .stats{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:0}
        #hfAdminDropdownShell .card{padding:11px;border-radius:10px;box-shadow:none}
        #hfAdminDropdownShell .stat{font-size:19px}
        #hfAdminDropdownShell .section-title{display:none!important}
        #hfAdminDropdownShell .panel{margin:0 0 9px;padding:13px;border-radius:11px;box-shadow:none}
        #hfAdminDropdownShell .panel:last-child{margin-bottom:0}
        #hfAdminDropdownShell .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-bottom:9px}
        #hfAdminDropdownShell .grid:last-child{margin-bottom:0}
        #hfAdminDropdownShell .table-wrap{max-height:390px;overflow:auto}
        #hfAdminDropdownShell table{min-width:640px}
        #hfAdminDropdownShell h2{font-size:15px!important;margin-top:0}
        #hfAdminDropdownShell .notice{font-size:12px}
        #hfAdminDropdownShell .form{gap:8px}
        #hfAdminDropdownShell .form input,#hfAdminDropdownShell .form select{min-height:42px}
        #hfAdminDropdownShell .footer-note{display:none!important}
        #hfAdminSingleNav{display:none!important}
        @media(max-width:700px){
          .wrap{padding:8px 9px 20px!important}
          #hfAdminDropdownHeader{border-radius:11px;padding:11px 12px}
          #hfAdminDropdownHeader .hf-title{font-size:14px}
          #hfAdminDropdownShell .stats{grid-template-columns:repeat(2,minmax(0,1fr))!important}
          #hfAdminDropdownShell .grid{grid-template-columns:1fr}
          #hfAdminDropdownShell .profile{flex-direction:column;align-items:flex-start}
          #hfAdminDropdownShell .table-wrap{max-height:330px}
        }
      `;
      document.head.appendChild(style);

      const oldTop=document.querySelector('.top');
      const logout=document.getElementById('logout');
      const header=document.createElement('header');
      header.id='hfAdminDropdownHeader';
      header.innerHTML='<div><div class="hf-title">HASSAN FINANCE · ADMIN CONTROL</div><div class="hf-sub">All administrator tools in one page</div></div>';
      if(logout)header.appendChild(logout);
      wrap.insertBefore(header,wrap.firstChild);
      if(oldTop)oldTop.remove();

      const shell=document.createElement('div');
      shell.id='hfAdminDropdownShell';

      const makeDetails=(title,open=false)=>{
        const d=document.createElement('details');
        if(open)d.open=true;
        const s=document.createElement('summary');s.textContent=title;
        const body=document.createElement('div');body.className='hf-section-body';
        d.append(s,body);shell.appendChild(d);return body;
      };

      const move=(body,node)=>{if(node)body.appendChild(node)};
      const sectionTitles=[...app.querySelectorAll(':scope > .section-title')];
      const profile=app.querySelector(':scope > .profile');
      const stats=app.querySelector(':scope > .stats');
      const overview=makeDetails('📊 Dashboard Overview',true);
      move(overview,profile);move(overview,stats);

      const groups=[
        ['🪪 Member Identity Control','Member Identity Control'],
        ['💳 Financial Controls','Financial Controls'],
        ['📥 Requests & Reviews','Requests & Reviews'],
        ['👥 Member Management','Member Management'],
        ['🛡️ Security & Oversight','Security & Oversight']
      ];

      groups.forEach(([label,title])=>{
        const heading=sectionTitles.find(x=>x.textContent.trim().toLowerCase().includes(title.toLowerCase()));
        if(!heading)return;
        const body=makeDetails(label,false);
        let n=heading.nextElementSibling;
        while(n && !n.classList.contains('section-title')){
          const next=n.nextElementSibling;
          body.appendChild(n);
          n=next;
        }
        heading.remove();
      });

      const analytics=document.getElementById('adminAnalytics');
      if(analytics){
        const body=makeDetails('📈 Analytics',false);
        body.appendChild(analytics);
      }

      const globalMsg=document.getElementById('globalMsg');
      if(globalMsg && globalMsg.parentElement===app) shell.appendChild(globalMsg);

      app.appendChild(shell);
      app.querySelectorAll(':scope > .section-title').forEach(x=>x.remove());
      app.style.display='block';
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean);else clean();
    return;
  }

  /* Keep the separate control-center page compact without adding another portal nav. */
  const style=document.createElement('style');
  style.textContent=`#hfFastAccess{display:none!important}`;
  document.head.appendChild(style);
})();