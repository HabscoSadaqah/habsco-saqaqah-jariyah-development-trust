(()=>{
'use strict';

const polish=()=>{
 const modal=document.getElementById('hfSavingsModal');
 if(!modal)return;

 const sheet=modal.querySelector('.hf-savings-sheet');
 if(!sheet)return;

 if(!sheet.dataset.dashboardPolished){
  sheet.dataset.dashboardPolished='1';

  const close=sheet.querySelector('.hf-savings-close');
  if(close){
   close.innerHTML='✕';
   close.setAttribute('aria-label','Close Savings');
   close.title='Close';
  }

  const eyebrow=sheet.querySelector('.hf-savings-eyebrow');
  const title=sheet.querySelector('#hfSavingsTitle');
  const intro=sheet.querySelector('.hf-savings-intro');

  if(eyebrow)eyebrow.textContent='HABSCO FINANCE';
  if(title)title.textContent='Savings & Loan';
  if(intro)intro.textContent='Your savings dashboard';

  const balance=sheet.querySelector('.hf-savings-balance');
  const grid=sheet.querySelector('.hf-savings-grid');

  if(balance&&!sheet.querySelector('.hf-finance-focus-label')){
   balance.insertAdjacentHTML(
    'afterend',
    '<div class="hf-finance-focus-label">ACCOUNT OVERVIEW</div>'
   );
  }

  if(grid)grid.classList.add('hf-finance-snapshot');

  const progress=sheet.querySelector('.hf-savings-progress');

  if(progress&&!progress.querySelector('.hf-finance-section-title')){
   progress.insertAdjacentHTML(
    'afterbegin',
    '<div class="hf-finance-section-title"><strong>Qualification Progress</strong><span>6-month target</span></div>'
   );
  }

  const counter=sheet.querySelector('.hf-savings-counter');
  if(counter)counter.classList.add('hf-finance-secondary');

  const rules=sheet.querySelector('.hf-savings-rules');

  if(rules){
   rules.innerHTML=
   '<div class="hf-rules-head"><strong>Savings Rules</strong><button type="button" class="hf-rules-toggle" aria-expanded="false">Show</button></div>'+
   '<div class="hf-rules-body is-collapsed">'+
   '<p>• Fixed amount and frequency apply to each payment.</p>'+
   '<p>• Full withdrawal resets the six-month qualification period.</p>'+
   '<p>• Loan eligibility follows the qualification rules.</p>'+
   '</div>';
  }

  const actions=sheet.querySelector('.hf-savings-actions');

  if(actions){
   actions.classList.add('hf-finance-actions');

   actions.querySelectorAll('a,button').forEach(el=>{
    if(/statement/i.test(el.textContent)){
     el.textContent='View Statement';
    }
   });
  }

  const toggle=sheet.querySelector('.hf-rules-toggle');
  const body=sheet.querySelector('.hf-rules-body');

  if(toggle&&body){
   toggle.onclick=()=>{
    const collapsed=body.classList.toggle('is-collapsed');
    toggle.textContent=collapsed?'Show':'Hide';
    toggle.setAttribute('aria-expanded',String(!collapsed));
   };
  }
 }

 /* Keep the PIN window as a small child window inside Savings & Loan. */
 const pinModals=sheet.querySelectorAll('.hf-pin-modal');

 pinModals.forEach(pinModal=>{
  if(pinModal.parentElement!==sheet){
   sheet.appendChild(pinModal);
  }

  pinModal.style.setProperty('position','absolute','important');
  pinModal.style.setProperty('inset','0','important');
  pinModal.style.setProperty('width','100%','important');
  pinModal.style.setProperty('height','100%','important');
  pinModal.style.setProperty('display','flex','important');
  pinModal.style.setProperty('align-items','center','important');
  pinModal.style.setProperty('justify-content','center','important');
  pinModal.style.setProperty('transform','none','important');
  pinModal.style.setProperty('margin','0','important');
  pinModal.style.setProperty('padding','12px','important');
  pinModal.style.setProperty('box-sizing','border-box','important');
  pinModal.style.setProperty('z-index','20','important');
  pinModal.style.setProperty('pointer-events','none','important');
  pinModal.style.setProperty('background','transparent','important');
  pinModal.style.setProperty('backdrop-filter','none','important');

  const pinBackdrop=pinModal.querySelector('.hf-pin-backdrop');

  if(pinBackdrop){
   pinBackdrop.style.setProperty('position','absolute','important');
   pinBackdrop.style.setProperty('inset','0','important');
   pinBackdrop.style.setProperty('width','100%','important');
   pinBackdrop.style.setProperty('height','100%','important');
   pinBackdrop.style.setProperty('background','transparent','important');
   pinBackdrop.style.setProperty('backdrop-filter','none','important');
   pinBackdrop.style.setProperty('pointer-events','none','important');
  }

  const pinSheet=pinModal.querySelector('.hf-pin-sheet');

  if(pinSheet){
   pinSheet.style.setProperty('position','relative','important');
   pinSheet.style.setProperty('left','auto','important');
   pinSheet.style.setProperty('top','auto','important');
   pinSheet.style.setProperty('right','auto','important');
   pinSheet.style.setProperty('bottom','auto','important');
   pinSheet.style.setProperty('transform','none','important');
   pinSheet.style.setProperty('margin','0','important');
   pinSheet.style.setProperty('width','220px','important');
   pinSheet.style.setProperty('max-width','calc(100% - 28px)','important');
   pinSheet.style.setProperty('max-height','calc(100% - 28px)','important');
   pinSheet.style.setProperty('box-sizing','border-box','important');
   pinSheet.style.setProperty('overflow','hidden','important');
   pinSheet.style.setProperty('z-index','21','important');
   pinSheet.style.setProperty('pointer-events','auto','important');
   pinSheet.style.setProperty('background','#fff','important');
   pinSheet.style.setProperty('border','1px solid #dce9e2','important');
   pinSheet.style.setProperty('border-radius','14px','important');
   pinSheet.style.setProperty('padding','13px','important');
   pinSheet.style.setProperty('box-shadow','0 14px 35px rgba(0,0,0,.18),0 4px 12px rgba(8,116,67,.08)','important');
  }
 });

 const styleId='hf-savings-dashboard-style';

 if(!document.getElementById(styleId)){
  const style=document.createElement('style');
  style.id=styleId;

  style.textContent=`

html.hf-savings-locked,
body.hf-savings-locked{
 overflow:hidden!important;
 overscroll-behavior:none!important;
 touch-action:none!important
}

#hfSavingsModal{
 position:fixed!important;
 inset:0!important;
 width:100vw!important;
 height:100dvh!important;
 overflow:hidden!important;
 overscroll-behavior:none!important;
 touch-action:none!important;
 z-index:99999!important
}

#hfSavingsModal .hf-savings-backdrop{
 position:fixed!important;
 inset:0!important;
 width:100vw!important;
 height:100dvh!important;
 background:rgba(4,25,16,.48)!important;
 backdrop-filter:blur(6px);
 touch-action:none!important
}

#hfSavingsModal .hf-savings-sheet{
 position:absolute!important;
 left:50%!important;
 top:50%!important;
 right:auto!important;
 bottom:auto!important;
 width:min(680px,calc(100vw - 32px))!important;
 height:min(680px,calc(100dvh - 28px))!important;
 max-width:680px!important;
 max-height:680px!important;
 overflow:hidden!important;
 box-sizing:border-box!important;
 transform:translate(-50%,-50%)!important;
 padding:18px!important;
 background:linear-gradient(145deg,#fff 0%,#fbfdfc 65%,#f2f8f4 100%)!important;
 border:1px solid rgba(255,255,255,.96)!important;
 border-radius:22px!important;
 box-shadow:0 24px 70px rgba(1,39,24,.22),0 5px 18px rgba(1,39,24,.07),inset 0 1px 0 #fff!important;
 display:flex!important;
 flex-direction:column!important;
 gap:0!important;
 isolation:isolate!important
}

#hfSavingsModal .hf-savings-sheet:before{
 content:'';
 position:absolute;
 inset:0;
 border-radius:22px;
 pointer-events:none;
 background:linear-gradient(125deg,rgba(255,255,255,.72),transparent 35%,rgba(8,116,67,.025));
 z-index:0
}

#hfSavingsModal .hf-savings-sheet>*{
 position:relative;
 z-index:1;
 flex-shrink:0
}

.hf-savings-close{
 z-index:5!important;
 display:flex!important;
 align-items:center!important;
 justify-content:center!important;
 width:34px!important;
 height:34px!important;
 right:11px!important;
 top:11px!important;
 background:rgba(255,255,255,.94)!important;
 color:#315746!important;
 border:1px solid #e1ebe5!important;
 border-radius:10px!important;
 font-size:13px!important;
 font-weight:900!important;
 box-shadow:0 3px 9px rgba(0,0,0,.06)!important;
 cursor:pointer
}

.hf-savings-close:hover{
 background:#087443!important;
 color:#fff!important
}

.hf-savings-eyebrow{
 color:#087443!important;
 letter-spacing:1.15px!important;
 font-size:8px!important;
 font-weight:900!important
}

.hf-savings-sheet h2{
 font-size:20px!important;
 line-height:1.1!important;
 margin:3px 45px 2px 0!important;
 color:#17221c!important
}

.hf-savings-intro{
 font-size:8px!important;
 line-height:1.3!important;
 margin:0!important;
 color:#78857e!important
}

.hf-savings-balance{
 margin-top:9px!important;
 padding:13px 15px!important;
 border-radius:15px!important;
 box-shadow:0 7px 18px rgba(8,116,67,.10)!important
}

.hf-savings-balance span{
 font-size:7px!important;
 letter-spacing:.8px!important
}

.hf-savings-balance strong{
 font-size:23px!important;
 margin-top:3px!important;
 line-height:1.1!important
}

.hf-finance-focus-label{
 margin:6px 0 3px!important;
 font-size:6px!important;
 letter-spacing:1.1px!important;
 font-weight:900!important;
 color:#8b9891!important
}

.hf-savings-grid.hf-finance-snapshot{
 margin-top:0!important;
 grid-template-columns:1fr 1fr!important;
 gap:7px!important
}

.hf-savings-grid.hf-finance-snapshot>div{
 padding:8px 10px!important;
 background:linear-gradient(145deg,#fbfdfc,#f5faf7)!important;
 border:1px solid #e5eee8!important;
 box-shadow:0 2px 8px rgba(12,57,39,.035)!important;
 border-radius:11px!important
}

.hf-savings-grid.hf-finance-snapshot small{
 font-size:6.5px!important
}

.hf-savings-grid.hf-finance-snapshot b{
 font-size:11px!important;
 margin-top:3px!important
}

.hf-savings-grid.hf-finance-snapshot>div:first-child{
 border-left:2px solid #087443!important
}

.hf-savings-grid.hf-finance-snapshot>div:last-child{
 border-left:2px solid #c7a15b!important
}

.hf-finance-section-title{
 display:flex!important;
 justify-content:space-between!important;
 align-items:center!important;
 margin:7px 0 3px!important;
 color:#24322b!important;
 font-size:8px!important
}

.hf-finance-section-title span{
 font-size:6px!important;
 color:#9aa59f!important;
 font-weight:700!important
}

.hf-savings-progress{
 margin-top:0!important
}

.hf-savings-progress>div{
 font-size:7px!important
}

.hf-savings-progress>small{
 font-size:6.5px!important;
 margin-top:4px!important
}

.hf-savings-progress i{
 height:6px!important;
 margin-top:4px!important
}

.hf-savings-counter{
 margin-top:6px!important;
 padding:7px 9px!important;
 border-radius:10px!important
}

.hf-savings-counter>div:first-child{
 font-size:7px!important
}

.hf-savings-counter strong{
 font-size:8px!important
}

.hf-savings-counter small{
 font-size:6px!important;
 margin-top:3px!important
}

.counter-track{
 height:4px!important;
 margin-top:4px!important
}

.hf-savings-plan{
 margin-top:7px!important;
 padding:9px!important;
 border-radius:11px!important
}

.hf-savings-plan strong{
 font-size:8px!important;
 margin-bottom:5px!important
}

.hf-savings-plan label{
 font-size:6.5px!important;
 margin-top:4px!important
}

.hf-savings-plan select{
 margin-top:3px!important;
 padding:6px 8px!important;
 border-radius:8px!important;
 font-size:8px!important;
 height:30px!important
}

.hf-savings-plan .plan-fixed,
.hf-savings-plan .plan-note{
 font-size:6.5px!important;
 margin-top:4px!important;
 display:block
}

.hf-finance-actions{
 display:grid!important;
 grid-template-columns:repeat(2,minmax(0,1fr))!important;
 gap:6px!important;
 margin-top:7px!important
}

.hf-finance-actions a,
.hf-finance-actions button{
 min-height:34px!important;
 height:34px!important;
 padding:5px 7px!important;
 border-radius:9px!important;
 font-size:7px!important;
 line-height:1.1!important
}

.hf-savings-rules{
 margin-top:6px!important;
 padding-top:5px!important;
 border-top:1px solid #edf1ee!important
}

.hf-rules-head{
 display:flex!important;
 align-items:center!important;
 justify-content:space-between!important
}

.hf-rules-head strong{
 font-size:7px!important;
 color:#34443b!important
}

.hf-rules-toggle{
 border:0!important;
 background:#f2f7f4!important;
 color:#087443!important;
 border-radius:7px!important;
 padding:3px 6px!important;
 font-size:6px!important;
 font-weight:900!important;
 cursor:pointer
}

.hf-rules-body p{
 margin:3px 0 0!important;
 font-size:6.5px!important;
 color:#75827b!important
}

.hf-rules-body.is-collapsed{
 display:none!important
}

/* PIN WINDOW — centered child of Savings & Loan */
#hfSavingsModal .hf-savings-sheet .hf-pin-modal{
 position:absolute!important;
 inset:0!important;
 width:100%!important;
 height:100%!important;
 display:flex!important;
 align-items:center!important;
 justify-content:center!important;
 margin:0!important;
 padding:12px!important;
 box-sizing:border-box!important;
 transform:none!important;
 left:auto!important;
 top:auto!important;
 right:auto!important;
 bottom:auto!important;
 z-index:20!important;
 overflow:hidden!important;
 background:transparent!important;
 backdrop-filter:none!important;
 -webkit-backdrop-filter:none!important;
 pointer-events:none!important
}

#hfSavingsModal .hf-savings-sheet .hf-pin-backdrop{
 position:absolute!important;
 inset:0!important;
 width:100%!important;
 height:100%!important;
 background:transparent!important;
 backdrop-filter:none!important;
 -webkit-backdrop-filter:none!important;
 pointer-events:none!important
}

#hfSavingsModal .hf-savings-sheet .hf-pin-sheet{
 position:relative!important;
 inset:auto!important;
 left:auto!important;
 top:auto!important;
 right:auto!important;
 bottom:auto!important;
 transform:none!important;
 margin:0!important;
 width:220px!important;
 max-width:calc(100% - 28px)!important;
 max-height:calc(100% - 28px)!important;
 box-sizing:border-box!important;
 overflow:hidden!important;
 z-index:21!important;
 pointer-events:auto!important;
 background:#fff!important;
 border:1px solid #dce9e2!important;
 border-radius:14px!important;
 padding:13px!important;
 box-shadow:0 14px 35px rgba(0,0,0,.18),0 4px 12px rgba(8,116,67,.08)!important;
 text-align:center!important;
 font-family:Inter,system-ui,sans-serif!important;
 color:#17221c!important
}

.hf-pin-close{
 position:absolute!important;
 right:7px!important;
 top:7px!important;
 width:25px!important;
 height:25px!important;
 border:1px solid #e0e9e4!important;
 background:#f3f7f5!important;
 color:#456155!important;
 border-radius:7px!important;
 font-size:16px!important;
 line-height:1!important;
 padding:0!important;
 cursor:pointer
}

.hf-pin-icon{
 font-size:18px!important;
 line-height:1!important;
 margin:0 0 4px!important
}

.hf-pin-sheet h3{
 margin:0 24px 4px!important;
 font-size:12px!important;
 line-height:1.2!important
}

.hf-pin-sheet p{
 margin:0 5px 7px!important;
 color:#728079!important;
 font-size:7px!important;
 line-height:1.3!important
}

.hf-pin-sheet input{
 display:block!important;
 width:min(140px,100%)!important;
 max-width:100%!important;
 margin:0 auto!important;
 box-sizing:border-box!important;
 text-align:center!important;
 letter-spacing:5px!important;
 font-size:17px!important;
 font-weight:900!important;
 padding:7px!important;
 border:1px solid #d9e4dd!important;
 border-radius:8px!important;
 outline:none!important
}

.hf-pin-error{
 min-height:11px!important;
 color:#b42c24!important;
 font-size:6.5px!important;
 margin:3px 0!important
}

.hf-pin-confirm{
 display:block!important;
 width:min(140px,100%)!important;
 max-width:100%!important;
 margin:0 auto!important;
 border:0!important;
 border-radius:8px!important;
 background:#087443!important;
 color:#fff!important;
 padding:8px!important;
 font-weight:900!important;
 font-size:8px!important;
 cursor:pointer!important
}

@media(min-width:900px){
 #hfSavingsModal .hf-savings-sheet{
  width:min(720px,calc(100vw - 64px))!important;
  height:min(700px,calc(100dvh - 40px))!important;
  max-width:720px!important;
  max-height:700px!important;
  padding:22px!important
 }

 .hf-savings-balance{
  padding:16px 18px!important
 }

 .hf-savings-balance strong{
  font-size:26px!important
 }

 .hf-finance-actions a,
 .hf-finance-actions button{
  height:38px!important;
  min-height:38px!important;
  font-size:8px!important
 }
}

@media(max-width:600px){
 #hfSavingsModal .hf-savings-sheet{
  width:calc(100vw - 24px)!important;
  height:min(610px,calc(100dvh - 20px))!important;
  max-width:430px!important;
  max-height:calc(100dvh - 20px)!important;
  padding:11px!important;
  border-radius:16px!important
 }

 .hf-savings-close{
  width:31px!important;
  height:31px!important;
  right:8px!important;
  top:8px!important
 }

 .hf-savings-sheet h2{
  font-size:17px!important
 }

 .hf-savings-balance{
  padding:10px 12px!important;
  margin-top:7px!important
 }

 .hf-savings-balance strong{
  font-size:20px!important
 }

 .hf-savings-grid.hf-finance-snapshot{
  gap:5px!important
 }

 .hf-savings-grid.hf-finance-snapshot>div{
  padding:7px 8px!important
 }

 .hf-savings-plan select{
  height:28px!important
 }

 .hf-finance-actions{
  gap:5px!important
 }

 .hf-finance-actions a,
 .hf-finance-actions button{
  height:32px!important;
  min-height:32px!important;
  font-size:6.8px!important
 }

 .hf-savings-rules{
  margin-top:4px!important
 }

 .hf-pin-sheet{
  width:210px!important;
  max-width:calc(100% - 24px)!important;
  padding:11px!important
 }
}

@media(max-height:650px){
 #hfSavingsModal .hf-savings-sheet{
  height:calc(100dvh - 12px)!important;
  max-height:calc(100dvh - 12px)!important;
  padding:9px!important
 }

 .hf-savings-balance{
  margin-top:5px!important;
  padding:8px 10px!important
 }

 .hf-savings-balance strong{
  font-size:18px!important
 }

 .hf-savings-counter{
  margin-top:4px!important
 }

 .hf-savings-plan{
  margin-top:5px!important
 }

 .hf-finance-actions{
  margin-top:5px!important
 }

 .hf-savings-rules{
  display:none!important
 }
}

`;

  document.head.appendChild(style);
 }

 document.documentElement.classList.add('hf-savings-locked');
 document.body.classList.add('hf-savings-locked');

 if(!modal.dataset.scrollGuard){
  modal.dataset.scrollGuard='1';

  const stop=e=>{
   if(!e.target.closest('.hf-savings-sheet')){
    e.preventDefault();
    e.stopPropagation();
   }
  };

  modal.addEventListener('touchmove',stop,{passive:false});
  modal.addEventListener('wheel',stop,{passive:false});
 }
};

const start=()=>{
 if(window.__hfSavingsDashboardObserver)return;

 window.__hfSavingsDashboardObserver=
 new MutationObserver(()=>{
  const modal=document.getElementById('hfSavingsModal');

  if(modal){
   polish();
  }else{
   document.documentElement.classList.remove('hf-savings-locked');
   document.body.classList.remove('hf-savings-locked');
  }
 });

 window.__hfSavingsDashboardObserver.observe(
  document.body,
  {childList:true,subtree:true}
 );

 if(document.getElementById('hfSavingsModal'))polish();
};

if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',start,{once:true});
}else{
 start();
}

})();
