'use strict';
(()=>{
const $=id=>document.getElementById(id);
const meta={
manager:{title:'MANAGER HQ',subtitle:'CENTRAL COMMAND · QUALITY GATES · OWNER DECISIONS',icon:'♛',color:'#f4c36e',mission:'Coordinates the workforce, reviews product quality and blocks unauthorized external actions.'},
research:{title:'RESEARCH',subtitle:'MARKETS · OPPORTUNITIES · BUYER SIGNALS',icon:'⚗',color:'#b8a1ff',mission:'Investigates ideas and market signals while clearly identifying what has not been verified.'},
marketing:{title:'MARKETING',subtitle:'LISTING DRAFTS · CAMPAIGN PLANS · CREATIVE',icon:'▥',color:'#f56bc4',mission:'Prepares product descriptions and campaign drafts. Does not buy ads or publish listings without approval.'},
job_hunter:{title:'CLIENT ACQUISITION',subtitle:'FREELANCE OFFERS · PROSPECTING',icon:'◎',color:'#68d8ff',mission:'Prepares service offers and client acquisition strategies without unauthorized outreach.'},
product_factory:{title:'PRODUCT FACTORY',subtitle:'JOURNALS · PRINTABLES · PRODUCTION',icon:'⚙',color:'#f6bc66',mission:'Produces and revises digital products for internal review.'},
quality_control:{title:'QUALITY CONTROL',subtitle:'INSPECTION · REWORK · READINESS',icon:'⬡',color:'#65e8b7',mission:'Checks internal drafts and identifies remaining publication readiness requirements.'},
publishing:{title:'PUBLISHING',subtitle:'RELEASE QUEUE · AUTHORIZATION GATE',icon:'▤',color:'#7eafff',mission:'Prepares files for release; external publishing stays locked until all required approvals.'}
};
const safeRun=u=>/^https:\/\/github\.com\/espinoza956ee-bot\/My-jobs-\/actions\/runs\/\d+$/.test(String(u||''))?u:null;
const validStates=new Set(['idle','working','completed','pending_review','blocked','failed']);
const cleanValue=x=>String(x??'').slice(0,360);
function message(id,content){const el=document.createElement('li');el.textContent=content;$(id).append(el)}
function empty(id,text){const el=document.createElement('li');el.className='empty';el.textContent=text;$(id).append(el)}
const params=new URLSearchParams(location.search);
let id=params.get('dept')||'manager';
if(!Object.prototype.hasOwnProperty.call(meta,id))id='manager';
const m=meta[id];document.documentElement.style.setProperty('--accent',m.color);
document.title='MINION HQ · '+m.title;
$('dept-name').textContent=m.title;$('dept-subtitle').textContent=m.subtitle;$('dept-icon').textContent=m.icon;
$('dept-mission').textContent=m.mission;$('crumb').textContent=m.title;
$('scene-title').textContent=m.title+'  /  WORKSTATIONS';$('main-monitor-label').textContent=m.title;
function showTab(tab){for(const k of ['tasks','activity','files']){const active=k===tab;$(k+'-tab').setAttribute('aria-selected',String(active));$(k+'-panel').hidden=!active}}
document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>showTab(button.dataset.tab)));
async function load(){
 try{
  const stamp=Date.now();
  const [sResponse,rResponse]=await Promise.all([
    fetch('./status.json?ts='+stamp,{cache:'no-store'}),
    fetch('./office_report.json?ts='+stamp,{cache:'no-store'})
  ]);
  if(!sResponse.ok||!rResponse.ok)throw Error('A published report is unavailable');
  const status=await sResponse.json(),report=await rResponse.json();
  if(!status||!report||typeof status.departments!=='object'||typeof report.departments!=='object')throw Error('Published data has invalid format');
  if(String(status.run_id||'')!==String(report.run_id||''))throw Error('The status and office report are from different runs');
  const details=report.departments[id]||{};
  const state=validStates.has(status.departments[id])?status.departments[id]:'idle';
  $('data-indicator').textContent='SNAPSHOT LOADED';
  $('status-badge').textContent=state.replaceAll('_',' ').toUpperCase();
  $('status-badge').dataset.state=state;
  $('status-detail').textContent=state.replaceAll('_',' ');
  $('main-monitor-status').textContent=state.replaceAll('_',' ').toUpperCase();
  $('summary').textContent=cleanValue(details.summary||'No department summary in the published report.');
  const time=status.verified_at||report.generated_at;
  const when=time&&!Number.isNaN(Date.parse(time))?new Date(time).toLocaleString():'Not provided';
  $('updated-at').textContent=when;$('run-time').textContent=when;
  $('run-id').textContent=cleanValue(status.run_id||'Not provided');
  const link=safeRun(report.run_url||status.run_url);if(link){$('run-link').href=link;$('run-link').hidden=false}
  const ts=Array.isArray(details.tasks)?details.tasks.slice(0,80):[];
  const as=Array.isArray(details.activity)?details.activity.slice(0,80):[];
  const fs=Array.isArray(details.files)?details.files.slice(0,40):[];
  $('tasks-count').textContent=ts.length;$('activity-count').textContent=as.length;$('files-count').textContent=fs.length;
  $('records-count').textContent='Latest run · '+(ts.length+as.length+fs.length)+' published entries';
  $('tasks').replaceChildren();$('activity').replaceChildren();$('files').replaceChildren();
  if(ts.length){for(const t of ts)message('tasks',cleanValue(typeof t==='string'?t:t?.title||t?.message||'Task entry'))}else empty('tasks','No assignments were published for this department.');
  if(as.length){for(const a of as)message('activity',cleanValue(typeof a==='string'?a:a?.message||'Activity entry'))}else empty('activity','No recorded activity events were published.');
  if(fs.length){for(const f of fs){const name=cleanValue(typeof f==='string'?f:f?.name||'File');const row=document.createElement('div');row.className='record-file';row.textContent=name+' — Stored in the private GitHub Actions artifact (not a public download).';$('files').append(row)}const note=document.createElement('p');note.className='micro';note.textContent='Open the source workflow above and download the ai-workforce-report artifact while available. Authentication may be required.';$('files').append(note)}else{const note=document.createElement('p');note.className='micro';note.textContent='No output files were listed in the sanitized report.';$('files').append(note)}
  $('report-caution').textContent='Information comes from the published report for this run. Department completion does not establish sales, market demand, full QC, or publication.';
  $('safety-note').textContent=report.owner_approval_backend_connected===true?'Public view only. Actions require authenticated owner approval; this page cannot authorize them.':'Publishing, advertising spend, customer outreach and external commitments remain locked. No authenticated owner approval backend is connected.';
 }catch(err){$('data-indicator').textContent='RECORDS UNAVAILABLE';$('summary').textContent='Unable to load a consistent department report. Please retry after the next GitHub publication.';$('report-caution').textContent=err.message;$('status-badge').textContent='UNKNOWN';$('status-detail').textContent='Unknown';$('main-monitor-status').textContent='NO VERIFIED REPORT';empty('tasks','No verified assignments available.');empty('activity','No verified activity available.');$('files').textContent='No verified outputs available.'}
}
load();
})();