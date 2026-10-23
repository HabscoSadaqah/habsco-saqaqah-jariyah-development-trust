(()=>{'use strict';
const $=id=>document.getElementById(id);
const table=$('recordsTable'), body=$('tableBody'), head=$('tableHead'), scroller=document.querySelector('.table-scroll');
if(!table||!body||!head)return;
let zoom=100,freeze=false,undoStack=[],redoStack=[],lastSnapshot='',selected=null;
const cellList=()=>Array.from(body.querySelectorAll('input.cell,textarea.cell'));
const getCell=(r,c)=>cellList().find(x=>+x.closest('tr').rowIndex===r+1 && +x.closest('td').cellIndex===c+1);
function snap(){return cellList().map(x=>({row:x.dataset.row,col:x.dataset.col,value:x.value}));}
function snapshotKey(s){return JSON.stringify(s);}
function recordUndo(){const s=snap(),k=snapshotKey(s);if(k!==lastSnapshot){undoStack.push(s);if(undoStack.length>80)undoStack.shift();redoStack=[];lastSnapshot=k;}}
function dispatchEdit(el,value){el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
function restore(s){if(!s)return;for(const item of s){const el=body.querySelector('[data-row="'+CSS.escape(item.row)+'"][data-col="'+CSS.escape(item.col)+'"]');if(el)dispatchEdit(el,item.value)}lastSnapshot=snapshotKey(s);}
function focusCell(el){if(!el)return;selected=el;el.focus();if(el.select)el.select();const ri=Array.from(body.querySelectorAll('tr')).indexOf(el.closest('tr'));const ci=Array.from(el.closest('tr').querySelectorAll('td')).indexOf(el.closest('td'));$('cellReference').value=String.fromCharCode(65+Math.max(0,ci-1))+(Math.max(0,ri)+1);$('formulaValue').value=el.value;$('formulaValue').dataset.row=el.dataset.row;$('formulaValue').dataset.col=el.dataset.col;}
body.addEventListener('focusin',e=>{if(e.target.matches('.cell')){selected=e.target;lastSnapshot=snapshotKey(snap())}});
body.addEventListener('pointerdown',e=>{if(e.target.matches('.cell'))selected=e.target});
body.addEventListener('change',e=>{if(e.target.matches('.cell'))recordUndo()});
body.addEventListener('keydown',e=>{
 const el=e.target;if(!el.matches('.cell'))return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();return}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='c'){const value=el.value;navigator.clipboard?.writeText(value).catch(()=>{});return}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='v'){return}
 let r=Array.from(body.querySelectorAll('tr')).indexOf(el.closest('tr')),c=Array.from(el.closest('tr').querySelectorAll('td')).indexOf(el.closest('td')),nr=r,nc=c;
 if(e.key==='ArrowDown'){nr++;}else if(e.key==='ArrowUp'){nr--;}else if(e.key==='ArrowRight'&&el.selectionStart===el.value.length){nc++;}else if(e.key==='ArrowLeft'&&el.selectionStart===0){nc--;}else if(e.key==='Enter'){nr+=e.shiftKey?-1:1;}else if(e.key==='Tab'){nc+=e.shiftKey?-1:1;}else return;
 e.preventDefault();const rows=Array.from(body.querySelectorAll('tr'));nr=Math.max(0,Math.min(rows.length-1,nr));const cells=rows[nr]?.querySelectorAll('.cell');if(cells?.length)focusCell(cells[Math.max(0,Math.min(cells.length-1,nc-1))]);
});
async function copyRange(){if(!selected)return;try{await navigator.clipboard.writeText(selected.value)}catch{prompt('Copy this cell:',selected.value)}}
async function pasteRange(){if(!selected)return;let text='';try{text=await navigator.clipboard.readText()}catch{text=prompt('Paste tab-separated cells:','')||''}if(!text)return;recordUndo();const startR=Array.from(body.querySelectorAll('tr')).indexOf(selected.closest('tr')),startC=Array.from(selected.closest('tr').querySelectorAll('td')).indexOf(selected.closest('td'));const lines=text.replace(/\r/g,'').split('\n').filter((x,i,a)=>x!==''||i<a.length-1);for(let y=0;y<lines.length;y++){const vals=lines[y].split('\t');for(let x=0;x<vals.length;x++){const tr=body.querySelectorAll('tr')[startR+y],el=tr?.querySelectorAll('.cell')[startC-1+x];if(el)dispatchEdit(el,vals[x])}}}
function undo(){if(!undoStack.length)return;const now=snap();redoStack.push(now);restore(undoStack.pop())}
function redo(){if(!redoStack.length)return;const now=snap();undoStack.push(now);restore(redoStack.pop())}
$('excelUndo')?.addEventListener('click',undo);$('excelRedo')?.addEventListener('click',redo);
$('excelFind')?.addEventListener('click',()=>{const term=prompt('Find text in this worksheet:');if(term===null||term==='')return;const all=cellList();const found=all.find(el=>el.value.toLowerCase().includes(term.toLowerCase()));if(!found){alert('No matching cell found.');return}focusCell(found);found.scrollIntoView({block:'center',inline:'center',behavior:'smooth'});if(confirm('Found "'+found.value+'". Replace this match?')){const replacement=prompt('Replace with:',found.value);if(replacement!==null){recordUndo();dispatchEdit(found,replacement)}}});
$('excelSort')?.addEventListener('click',()=>{const el=selected||cellList()[0];if(!el){alert('Add some rows first.');return}const c=Array.from(el.closest('tr').querySelectorAll('td')).indexOf(el.closest('td'));const trs=Array.from(body.querySelectorAll('tr'));if(trs.length<2)return;const first=trs[0].querySelectorAll('.cell')[c-1];if(!first)return;const col=first.dataset.col;const rows=trs.map(tr=>({tr,value:tr.querySelector('[data-col="'+CSS.escape(col)+'"]')?.value||''}));rows.sort((a,b)=>a.value.localeCompare(b.value,undefined,{numeric:true,sensitivity:'base'}));rows.forEach(x=>body.appendChild(x.tr));body.querySelectorAll('tr').forEach((tr,i)=>{const n=tr.querySelector('td');if(n)n.textContent=i+1});alert('Rows sorted by the selected column. Click Save changes to commit any edits; sorting changes the visible order only in this browser session.')});
$('excelFreeze')?.addEventListener('click',()=>{freeze=!freeze;const th=head.querySelectorAll('th');th.forEach(x=>{x.style.position=freeze?'sticky':'';x.style.top=freeze?'0':'';x.style.zIndex=freeze?'4':''});$('excelFreeze').textContent=freeze?'Unfreeze headings':'Freeze headings'});
function applyZoom(){table.style.zoom=String(zoom/100);$('excelZoomLabel').textContent=zoom+'%'}
$('excelZoomIn')?.addEventListener('click',()=>{zoom=Math.min(160,zoom+10);applyZoom()});$('excelZoomOut')?.addEventListener('click',()=>{zoom=Math.max(60,zoom-10);applyZoom()});
$('excelFullscreen')?.addEventListener('click',async()=>{const panel=table.closest('.panel');try{if(!document.fullscreenElement)await panel.requestFullscreen();else await document.exitFullscreen()}catch{alert('Full screen is not supported in this browser.')}});
$('excelPrint')?.addEventListener('click',()=>window.print());
$('formulaValue')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const el=body.querySelector('[data-row="'+CSS.escape(e.target.dataset.row||'')+'"][data-col="'+CSS.escape(e.target.dataset.col||'')+'"]');if(el){recordUndo();dispatchEdit(el,e.target.value);el.focus()}}});
table.addEventListener('copy',e=>{if(!selected)return;e.preventDefault();e.clipboardData.setData('text/plain',selected.value)});
table.addEventListener('paste',e=>{if(!selected)return;e.preventDefault();const text=e.clipboardData.getData('text/plain');if(!text)return;recordUndo();const startR=Array.from(body.querySelectorAll('tr')).indexOf(selected.closest('tr')),startC=Array.from(selected.closest('tr').querySelectorAll('td')).indexOf(selected.closest('td'));text.replace(/\r/g,'').split('\n').forEach((line,y)=>line.split('\t').forEach((v,x)=>{const el=body.querySelectorAll('tr')[startR+y]?.querySelectorAll('.cell')[startC-1+x];if(el)dispatchEdit(el,v)}))});
const style=document.createElement('style');style.textContent='@media print{.top,.toolbar,.excel-appbar,.mobile-note,.footer,.habsco-standard-footer,.row-actions,.th-actions{display:none!important}.wrap{max-width:none!important;margin:0!important;padding:0!important}.panel{border:0!important;box-shadow:none!important}.table-scroll{overflow:visible!important}table{min-width:0!important;width:100%!important}.cell{border:0!important;color:#000!important}}.cell:focus{outline:2px solid #217346!important;outline-offset:-2px}';document.head.appendChild(style);
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'&&document.activeElement?.matches('.cell')){e.preventDefault();$('excelFind')?.click()}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();$('saveNow')?.click()}});
document.addEventListener('click',e=>{const b=e.target.closest('.excel-tabs button');if(!b)return;document.querySelectorAll('.excel-tabs button').forEach(x=>x.classList.toggle('active',x===b));const tab=b.textContent.trim();if(tab==='Insert')$('addColumn')?.click();else if(tab==='Data')$('excelSort')?.focus();else if(tab==='View')$('excelZoomIn')?.focus();else if(tab==='Review')$('excelFind')?.focus();else if(tab==='Page Layout')$('excelPrint')?.focus()});
document.addEventListener('keydown',e=>{if(e.target.matches('.cell')&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='c'){e.preventDefault();copyRange()}if(e.target.matches('.cell')&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='v'){e.preventDefault();pasteRange()}});
})();
