'use strict';
// Public read-only dashboard. Never put GitHub tokens, private data, or approval credentials here.
const departments=[['product_factory','📚','PRODUCT FACTORY','#32a7e8'],['manager','👑','MANAGER','#2de0bd'],['job_hunter','🔎','CLIENT ACQUISITION','#b779f7'],['research','🧪','RESEARCH','#f5c75a'],['quality_control','🛡️','QUALITY CONTROL','#46e49c'],['marketing','📣','MARKETING','#f369c0'],['publishing','🚀','PUBLISHING','#40b5f3']];
const allowed=new Set(['idle','working','completed','failed','blocked','pending_review']);
const descriptions={idle:'No activity is recorded in the latest published snapshot.',working:'Work was in progress when the latest snapshot was recorded.',completed:'The latest snapshot recorded completion; this does not imply a sale or publication.',failed:'A failure was reported. Inspect the linked GitHub run.',blocked:'Work was blocked or no usable status was published.',pending_review:'Review is pending; no external action has been authorized.'};
const officeInfo={manager:{summary:'Supervises internal reviews and product decisions.',facts:['3 products passed internal QC','Internal review was automated','Publishing still needs your approval']},research:{summary:'Rotates through AI-income ideas each scheduled run.',facts:['4 ideas scanned in the shared October 19 report','External research requests returned HTTP errors','Market demand and customers remain unverified']},product_factory:{summary:'Produces printable and digital products.',facts:['Daily Reflection Journal — QC passed on attempt 2','Construction Daily Log — QC passed on attempt 1','Equipment Inspection Log — QC passed on attempt 1']},quality_control:{summary:'Checks drafts and requests revisions.',facts:['3 of 3 product drafts passed internal QC','Sampled visual QC is not a full-page audit','KDP compliance has not been verified']},marketing:{summary:'Prepares listings and promotion drafts.',facts:['Marketing drafts were prepared','No advertising spend was authorized','No verified sales']},publishing:{summary:'Holds finished products for owner authorization.',facts:['Three drafts await owner publishing decisions','Publishing is not automated','Approval backend is not connected']},job_hunter:{summary:'Develops freelance service offers and customer opportunities.',facts:['Service offers were prepared','0 verified clients','No external client commitments were authorized']}};
const el=id=>document.getElementById(id);let selected='manager',last=null,report=null;
function textNode(tag,value,cls){const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=value;return e}
function addLink(parent,label,url){if(!/^https:\/\/github\.com\/espinoza956ee-bot\/My-jobs-\/actions\/runs\/\d+$/.test(url))return;const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.className='runlink';a.textContent=label;parent.append(a)}
function section(parent,title,items){parent.append(textNode('h4',title));const ul=document.createElement('ul');for(const item of items){ul.append(textNode('li',String(item)))}parent.append(ul)}
function detailView(data){const states=data.departments||{},state=allowed.has(states[selected])?states[selected]:'blocked';const chosen=departments.find(d=>d[0]===selected);const d=el('detail');d.replaceChildren();d.append(textNode('strong',chosen[1]+' '+chosen[2]),textNode('p',state.replaceAll('_',' '),'state'),textNode('p',descriptions[state]));const info=officeInfo[selected];d.append(textNode('p',info.summary));
const more=(report&&report.departments&&report.departments[selected])||null;if(more){if(more.summary)d.append(textNode('p',String(more.summary)));if(Array.isArray(more.tasks))section(d,'Assignments',more.tasks.map(x=>typeof x==='string'?x:(x.title||'Task')));if(Array.isArray(more.activity))section(d,'Activity',more.activity.map(x=>typeof x==='string'?x:(x.message||'Activity')));if(Array.isArray(more.files)){
  d.append(textNode('h4','Files'));
  const ul=document.createElement('ul');
  for(const file of more.files){
    const name=typeof file==='string'?file:String(file.name||'File');
    const li=document.createElement('li');
    li.append(textNode('span',name+' — '));
    const url=String((report&&report.run_url)||data.run_url||'');
    addLink(li,'Open AI Workforce run → Artifacts ↗',url);
    ul.append(li);
  }
  d.append(ul);
  d.append(textNode('p','These files belong to the AI Workforce run, NOT the Publish MINION HQ public status workflow. Open the AI Workforce run above, scroll to Artifacts, then download ai-workforce-report. GitHub sign-in may be required. Artifacts expire after 7 days.','muted small'));
}}else{section(d,'Recorded work',info.facts);d.append(textNode('p','Historical report summary; live department-level reporting is not connected yet.','muted small'))}
addLink(d,'Inspect latest GitHub run ↗',String(data.run_url||''));if(selected==='product_factory'||selected==='publishing'){d.append(textNode('p','PDF downloads are stored in AI Workforce run artifacts, not in the Publish Status workflow.','muted small'))}}
function renderPixelMap(data){for(const room of document.querySelectorAll('.pixelroom')){const id=[...room.classList].find(x=>['command','factory','qc','research','marketing','publishing'].includes(x));const dept={command:'manager',factory:'product_factory',qc:'quality_control',research:'research',marketing:'marketing',publishing:'publishing'}[id];const state=allowed.has(data.departments?.[dept])?data.departments[dept]:'blocked';room.dataset.state=state;const label=room.querySelector('small');if(label)label.textContent=state.toUpperCase().replaceAll('_',' ');room.setAttribute('role','button');room.tabIndex=0;room.setAttribute('aria-label',dept+' '+state);room.onclick=()=>{selected=dept;render(last);el('detail').scrollIntoView({behavior:'smooth',block:'nearest'})};room.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();room.click()}}}}
window.selectStationDepartment=id=>{selected=id;if(last){render(last);document.getElementById('detail').scrollIntoView({behavior:'smooth',block:'nearest'})}};
function render(data){last=data;if(window.updateStationStates)window.updateStationStates(data.departments||{});renderPixelMap(data);const states=data.departments||{};el('rooms').replaceChildren();for(const [id,emoji,name,color] of departments){const state=allowed.has(states[id])?states[id]:'blocked';const btn=document.createElement('button');btn.type='button';btn.className='room'+(selected===id?' selected':'');btn.style.setProperty('--accent',color);btn.dataset.state=state;btn.setAttribute('aria-label',name+', '+state.replaceAll('_',' '));btn.innerHTML='<div class="roomtitle"></div><div class="roomstate"></div><div class="scene"><div class="screen"></div><div class="desk"></div><div class="worker" aria-hidden="true">🤖</div></div>';btn.querySelector('.roomtitle').textContent=emoji+' '+name;btn.querySelector('.roomstate').textContent=state.replaceAll('_',' ');btn.addEventListener('click',()=>{selected=id;render(last)});el('rooms').append(btn)}el('active').textContent=Object.values(states).filter(s=>s==='working').length;el('review').textContent=Object.values(states).filter(s=>s==='pending_review').length;el('done').textContent=Object.values(states).filter(s=>s==='completed').length;detailView(data);el('updated').textContent=data.verified_at&&!isNaN(Date.parse(data.verified_at))?new Date(data.verified_at).toLocaleString():'Unknown';el('runid').textContent=String(data.run_id||'Not provided');el('source').textContent=String(data.source||'Public snapshot');el('note').textContent=String(data.note||'Latest published snapshot only.');const link=el('runlink'),url=String(data.run_url||'');if(/^https:\/\/github\.com\/espinoza956ee-bot\/My-jobs-\/actions\/runs\/\d+$/.test(url)){link.href=url;link.hidden=false}else{link.hidden=true;link.removeAttribute('href')}}
async function load(){el('connection').textContent='UPDATING';try{const response=await fetch('./status.json?ts='+Date.now(),{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();if(!data||typeof data.departments!=='object'||data.departments===null)throw Error('Invalid snapshot');try{const extra=await fetch('./office_report.json?ts='+Date.now(),{cache:'no-store'});report=extra.ok?await extra.json():null}catch(_){report=null}render(data);renderProductLibrary();el('connection').textContent='SNAPSHOT LOADED';el('connection').style.borderColor='#4bbf9a'}catch(err){el('connection').textContent='DATA UNAVAILABLE';el('connection').style.borderColor='#dd7b7b';if(!last){render({departments:{},note:'No published status.json found. The dashboard does not invent worker activity.'});el('note').textContent='Unable to load status.json: '+err.message}}}
el('refresh').addEventListener('click',load);load();setInterval(load,60000);

/* Private local PDF viewer: file bytes never leave this browser. */
const libraryProducts=[
  {id:'daily_reflection',name:'Daily Reflection Journal',icon:'📖',hint:'daily_reflection_journal'},
  {id:'construction_daily_log',name:'Construction Daily Log',icon:'🏗️',hint:'construction_daily_log'},
  {id:'equipment_inspection',name:'Equipment Inspection Log',icon:'🛡️',hint:'equipment_inspection'}
];
let privatePdfUrl=null;
function closePrivatePdf(){
  const frame=el('pdf-frame');if(frame)frame.removeAttribute('src');
  const a=el('open-pdf');if(a)a.removeAttribute('href');
  if(privatePdfUrl){URL.revokeObjectURL(privatePdfUrl);privatePdfUrl=null}
  el('pdf-viewer').hidden=true;
}
function openPrivatePdf(file,product){
  if(!file)return;
  if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){alert('Choose a PDF file extracted from the AI Workforce artifact.');return}
  if(file.size>60*1024*1024){alert('This PDF is too large for the mobile preview (60 MB limit).');return}
  closePrivatePdf();
  privatePdfUrl=URL.createObjectURL(file);
  el('pdf-title').textContent=product.name+' — '+file.name;
  el('open-pdf').href=privatePdfUrl;
  el('pdf-frame').src=privatePdfUrl+'#toolbar=1&navpanes=0';
  el('pdf-viewer').hidden=false;
  el('pdf-viewer').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderProductLibrary(){
  const host=el('product-cards');if(!host)return;
  host.replaceChildren();
  const fileRecords=(report&&report.departments&&report.departments.product_factory&&report.departments.product_factory.files)||[];
  for(const product of libraryProducts){
    const card=document.createElement('article');card.className='product-card';
    card.append(textNode('strong',product.icon+' '+product.name));
    const fileRecord=fileRecords.find(x=>typeof x==='object'&&String(x.name||'').includes(product.hint));
    card.append(textNode('p',fileRecord?String(fileRecord.name):'PDF not listed in latest report','muted small'));
    card.append(textNode('p','Private draft · Owner review required','small'));
    const label=document.createElement('label');label.className='file-select';label.textContent='Select PDF to view';
    const input=document.createElement('input');input.type='file';input.accept='.pdf,application/pdf';
    input.setAttribute('aria-label','Select local PDF for '+product.name);
    input.addEventListener('change',()=>{const f=input.files&&input.files[0];if(f)openPrivatePdf(f,product);input.value=''});
    label.append(input);card.append(label);
    host.append(card);
  }
  const link=el('library-run');
  const run=String((report&&report.run_url)||(last&&last.run_url)||'');
  if(/^https:\/\/github\.com\/espinoza956ee-bot\/My-jobs-\/actions\/runs\/\d+$/.test(run))link.href=run;
}
el('close-pdf').addEventListener('click',closePrivatePdf);
