/* Registry Pro clean source module. Edit this file directly; no runtime patch loader. */

/* ===== Source: fixes.js ===== */
/* Registry Pro v1.15 — navigation, role, draft visibility and circle-rate completeness fixes */
(function(){
'use strict';
const EDIT_KEY='registryProCircleEditsV115';
const CUSTOM_KEY='registryProCircleCustomV115';
const MODE_KEY='registryProWorkModeV115';

function readJSON(k,fallback){try{const v=JSON.parse(localStorage.getItem(k));return v??fallback;}catch(_){return fallback;}}
function writeJSON(k,v){localStorage.setItem(k,JSON.stringify(v));}
function safe(v){try{return esc(String(v??''));}catch(_){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}}
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g,' ').trim();}
function numberOrNull(v){if(v===null||v===undefined||v==='')return null;const n=Number(String(v).replace(/,/g,''));return Number.isFinite(n)?n:null;}

// ---------- Circle-rate data: add verified missing municipal/major-road rows and saved user edits ----------
function installAdditionalRows(){
  const add=Array.isArray(window.V115_ADDITIONAL_RATE_ROWS)?window.V115_ADDITIONAL_RATE_ROWS:[];
  add.forEach(r=>{if(!CIRCLE_RATE_DATA.some(x=>x.id===r.id))CIRCLE_RATE_DATA.push({...r});});
  const custom=readJSON(CUSTOM_KEY,[]);custom.forEach(r=>{if(r&&r.id&&!CIRCLE_RATE_DATA.some(x=>x.id===r.id))CIRCLE_RATE_DATA.push({...r,custom:true});});
  const edits=readJSON(EDIT_KEY,{});CIRCLE_RATE_DATA.forEach(r=>{if(edits[r.id])Object.assign(r,edits[r.id],{edited:true});});
}
installAdditionalRows();

function rateRows(ctx=currentJurisdiction()){
  return CIRCLE_RATE_DATA.filter(r=>v114CircleRowInTehsil(r,ctx)).sort((a,b)=>Number(a.page)-Number(b.page)||Number(a.row||0)-Number(b.row||0)||String(a.name).localeCompare(String(b.name),'hi'));
}
function sourcePageRange(ctx=currentJurisdiction()){
  if(ctx.state==='Uttarakhand'&&ctx.district==='Haridwar'&&ctx.tehsil==='Roorkee')return [2,45];
  if(ctx.state==='Uttarakhand'&&ctx.district==='Haridwar'&&ctx.tehsil==='Bhagwanpur')return [46,57];
  return null;
}
window.v115OpenSourcePage=function(page){
  const p=Math.max(1,Number(page)||1);
  if(typeof window.openOfficialCircleSourcePage==='function')window.openOfficialCircleSourcePage(p);
};

window.v115RenderRateManagerRows=function(){
  const host=document.getElementById('v115RateTableBody');if(!host)return;
  const q=norm(document.getElementById('v115RateSearch')?.value||'');
  let rows=rateRows();
  if(q)rows=rows.filter(r=>norm(`${r.name} ${r.alias||''} ${r.section||''} ${r.route||''} ${r.group||''} ${r.page}`).includes(q));
  const count=document.getElementById('v115RateVisibleCount');if(count)count.textContent=`${rows.length} rows`;
  host.innerHTML=rows.map(r=>`<tr>
    <td>${safe(r.page)}</td><td>${safe(r.group||'-')}</td>
    <td><b>${safe(r.name)}</b><small>${safe(r.route||r.section||'')}</small></td>
    <td>${r.agri==null?'—':safe(r.agri)}</td><td>${r.nonAgri==null?'—':safe(r.nonAgri)}</td>
    <td>${r.multi==null?'—':safe(r.multi)}</td><td>${r.shop==null?'—':safe(r.shop)}</td>
    <td><button class="btn outline compact" onclick="v115EditRateRow('${safe(r.id)}')">Edit</button></td>
  </tr>`).join('')||'<tr><td colspan="8" class="v115-empty">No matching indexed row. Neeche full official PDF page index se page open karke Add Row kar sakte hain.</td></tr>';
};

window.v115EditRateRow=function(id){
  const r=CIRCLE_RATE_DATA.find(x=>x.id===id);if(!r)return;
  const name=prompt('Location / Village / Road name',r.name);if(name===null)return;
  const page=prompt('Official PDF page',r.page);if(page===null)return;
  const group=prompt('Category / Group',r.group||'');if(group===null)return;
  const agri=prompt('Agriculture rate (blank = N/A)',r.agri??'');if(agri===null)return;
  const non=prompt('Non-Agriculture rate ₹/m² (blank = N/A)',r.nonAgri??'');if(non===null)return;
  const multi=prompt('Multi-storey residential rate ₹/m² (blank = N/A)',r.multi??'');if(multi===null)return;
  const shop=prompt('Shop/Commercial rate ₹/m² (blank = N/A)',r.shop??'');if(shop===null)return;
  const section=prompt('Section / Note',r.section||'');if(section===null)return;
  const patch={name:name.trim()||r.name,page:Number(page)||r.page,group:group.trim(),agri:numberOrNull(agri),nonAgri:numberOrNull(non),multi:numberOrNull(multi),shop:numberOrNull(shop),section:section.trim()};
  Object.assign(r,patch,{edited:true});const edits=readJSON(EDIT_KEY,{});edits[id]=patch;writeJSON(EDIT_KEY,edits);v115RenderRateManagerRows();
  try{toast('Circle-rate row saved locally');}catch(_){}
};

window.v115AddRateRow=function(){
  const ctx=currentJurisdiction(),range=sourcePageRange(ctx);if(!range){toast('Is tehsil ki official PDF abhi pending hai');return;}
  const name=prompt('Village / Location / Road name');if(!name?.trim())return;
  const pageRaw=prompt(`Official PDF page (${range[0]}–${range[1]})`,String(range[0]));if(pageRaw===null)return;
  const page=Number(pageRaw);if(!Number.isFinite(page)||page<range[0]||page>range[1]){toast(`Page ${range[0]}–${range[1]} ke beech hona chahiye`);return;}
  const group=prompt('Category / Group','')??'';
  const agri=numberOrNull(prompt('Agriculture rate (blank = N/A)',''));
  const nonAgri=numberOrNull(prompt('Non-Agriculture rate ₹/m² (blank = N/A)',''));
  const multi=numberOrNull(prompt('Multi-storey residential rate ₹/m² (blank = N/A)',''));
  const shop=numberOrNull(prompt('Shop/Commercial rate ₹/m² (blank = N/A)',''));
  const section=prompt('Section / Note',`${ctx.tehsil} - Manual verified row`)??'';
  const id='USR'+Date.now();const row={id,page,group,name:name.trim(),alias:'',agri,nonAgri,multi,shop,otherCommercial:null,nonCommercial1:14000,nonCommercial2:12000,row:999,section,custom:true};
  CIRCLE_RATE_DATA.push(row);const custom=readJSON(CUSTOM_KEY,[]);custom.push(row);writeJSON(CUSTOM_KEY,custom);v115RenderRateManagerRows();toast('New circle-rate row added locally');
};

window.v115ResetRateEdits=function(){
  if(!confirm('Local circle-rate edits/custom rows reset karne hain? Official bundled data rahega.'))return;
  localStorage.removeItem(EDIT_KEY);localStorage.removeItem(CUSTOM_KEY);location.reload();
};

window.v115RenderPageIndex=function(){
  const host=document.getElementById('v115PageIndex');if(!host)return;
  const ctx=currentJurisdiction(),range=sourcePageRange(ctx);if(!range){host.innerHTML='';return;}
  const q=norm(document.getElementById('v115PageSearch')?.value||'');
  const pages=[];for(let p=range[0];p<=range[1];p++){
    const text=String(window.V115_PAGE_INDEX?.[p]||'');
    if(!q||norm(text).includes(q))pages.push(p);
  }
  host.innerHTML=pages.map(p=>`<button type="button" onclick="v115OpenSourcePage(${p})"><b>Page ${p}</b><span>Open official PDF page</span></button>`).join('')||'<div class="v115-empty">No page-text match. Spelling badal kar search karein ya page number open karein.</div>';
};

openCircleRateManager=function(){
  const c=currentJurisdiction(),cfg=jurisdictionConfig(c),range=sourcePageRange(c);
  if(!cfg||cfg.pdfPending||!range){openSimpleManagement('Circle Rate Lists',`<div class="v114-rate-manager"><h3>${safe(c.state)} → ${safe(c.district)} → ${safe(c.tehsil)}</h3><div class="v114-pending-box">Official Circle Rate PDF/Data <b>Pending</b></div><p class="hint">Is tehsil ki official PDF milte hi yahin attach/index ki jayegi.</p></div>`);return;}
  const rows=rateRows(c);
  openSimpleManagement('Circle Rate Lists',`<div class="v115-rate-manager">
    <div class="v115-rate-head"><div><h3>${safe(c.state)} → ${safe(c.district)} → ${safe(c.tehsil)}</h3><p>Official source pages <b>${range[0]}–${range[1]}</b> • Structured searchable rows <b>${rows.length}</b></p></div><button class="btn primary" onclick="v114OpenRatePdf()">Open Complete ${safe(c.tehsil)} PDF</button></div>
    <div class="v115-notice">Draft search ab 30-row limit se restricted nahi hai. Is tehsil ke <b>saare structured rows</b> dikhte hain. Pages ${range[0]}–${range[1]} ka full official page index neeche available hai. Missing/changed row ko <b>Add Row / Edit</b> se locally correct kar sakte hain.</div>
    <div class="v115-rate-tools"><input id="v115RateSearch" placeholder="Village / location / page search..." oninput="v115RenderRateManagerRows()"><span id="v115RateVisibleCount">${rows.length} rows</span><button class="btn primary compact" onclick="v115AddRateRow()">+ Add Row</button><button class="btn outline compact" onclick="v115ResetRateEdits()">Reset Local Edits</button></div>
    <div class="v115-rate-table-wrap"><table class="v115-rate-table"><thead><tr><th>Page</th><th>Group</th><th>Location</th><th>Agri</th><th>Non-Agri</th><th>Multi</th><th>Shop</th><th>Edit</th></tr></thead><tbody id="v115RateTableBody"></tbody></table></div>
    <div class="v115-page-section"><h4>Full Official PDF Page Index — ${range[0]} to ${range[1]}</h4><div class="v115-rate-tools"><input id="v115PageSearch" placeholder="Official page text / village / road search..." oninput="v115RenderPageIndex()"></div><div id="v115PageIndex" class="v115-page-index"></div></div>
  </div>`);
  setTimeout(()=>{v115RenderRateManagerRows();v115RenderPageIndex();},0);
};

// Draft location suggestions: remove old 18/24/30 row truncation and keep tehsil separation.
filterCircleLocations=function(){
  const input=document.getElementById('villageSearch'),box=document.getElementById('villageSuggestions');if(!input||!box)return;
  const c=currentJurisdiction(),cfg=jurisdictionConfig(c);if(!cfg||cfg.pdfPending){box.innerHTML=`<div class="location-empty"><b>${safe(c.tehsil)}</b> ki official circle-rate PDF abhi add nahi hui.</div>`;box.classList.add('show');return;}
  const q=circleNorm(input.value),qRoman=String(input.value||'').toLowerCase().replace(/[^a-z0-9]/g,''),qSkeleton=latinSkeleton(input.value);
  let rows=rateRows(c).filter(e=>{const hay=circleSearchText(e);return !q||hay.includes(q)||(qRoman&&hay.includes(qRoman))||(qSkeleton&&hay.includes(qSkeleton));});
  const k=defaultRateKey();
  let html=rows.map(e=>`<button type="button" class="location-option" onclick="selectCircleLocation('${safe(e.id)}')"><span><strong>${safe(e.name)}</strong><small>${safe(e.route||e.section)} • PDF page ${safe(e.page)} • row ${safe(e.row||'-')} • श्रेणी ${safe(e.group||'-')}</small></span><span class="rate-chip">${formatRateValue(k,e[k])}</span></button>`).join('');
  if(!rows.length){
    const qq=norm(input.value);const range=sourcePageRange(c);const hits=[];
    if(qq&&range){for(let p=range[0];p<=range[1];p++){if(norm(window.V115_PAGE_INDEX?.[p]||'').includes(qq))hits.push(p);}}
    html=hits.length?`<div class="location-empty">Structured rate row nahi mila, lekin official PDF me match mila:</div>${hits.slice(0,20).map(p=>`<button type="button" class="location-option v115-page-hit" onclick="v115OpenSourcePage(${p})"><span><strong>Official PDF Page ${p}</strong><small>Page open karke rate verify karein; zarurat par Circle Rate manager me Add Row karein.</small></span><span class="rate-chip">View PDF</span></button>`).join('')}`:`<div class="location-empty">${safe(c.tehsil)} list me match nahi mila. Circle Rate manager me full pages ${safe(range?.[0]||'-')}–${safe(range?.[1]||'-')} open/search karein.</div>`;
  }
  box.innerHTML=html;box.classList.add('show');
};

// ---------- Exactly two work modes on Dashboard ----------
function combinedAllowed(){return v114RoleAllowed('Advocate')||v114RoleAllowed('Staff');}
function normalizeSession(){
  const s=v14SessionData();if(s.role==='Staff'){v14Session={...s,role:'Advocate',workMode:'AdvocateStaff'};v14WriteJSON('registryProSession',v14Session);writeJSON(MODE_KEY,'AdvocateStaff');}
  else if(!readJSON(MODE_KEY,null))writeJSON(MODE_KEY,s.role==='Typist'?'Typist':'AdvocateStaff');
}
normalizeSession();

window.v115SelectWorkMode=function(mode){
  const old=v14SessionData(),u=v114CurrentUser();
  if(mode==='Typist'){
    if(!v114RoleAllowed('Typist')){toast('Typist permission Admin se assign honi chahiye');v115SyncRoleUI();return;}
    v14Session={...old,role:'Typist',workMode:'Typist',name:u?.name||old.name||'User',mobile:u?.mobile||old.mobile||'',allowedRoles:u?.roles||old.allowedRoles};
    if(!v14Session.advocateName)v14Session.advocateName=getAdvocates()[0]?.name||v14Session.name;
    writeJSON(MODE_KEY,'Typist');
  }else{
    if(!combinedAllowed()){toast('Advocate / Staff permission Admin se assign honi chahiye');v115SyncRoleUI();return;}
    v14Session={...old,role:'Advocate',workMode:'AdvocateStaff',name:u?.name||old.name||'User',mobile:u?.mobile||old.mobile||'',allowedRoles:u?.roles||old.allowedRoles};
    v14Session.advocateName=v14Session.name;
    writeJSON(MODE_KEY,'AdvocateStaff');
  }
  v14WriteJSON('registryProSession',v14Session);refreshDashboard();v115SyncRoleUI();toast(`Work mode: ${mode==='Typist'?'Typist':'Advocate / Staff'}`);
};
window.v114SelectRole=function(role){v115SelectWorkMode(role==='Typist'?'Typist':'AdvocateStaff');};

window.v115SyncRoleUI=function(){
  const s=v14SessionData(),u=v114CurrentUser(),mode=s.role==='Typist'?'Typist':'AdvocateStaff';
  const sel=document.getElementById('v115RoleSelect');if(sel){sel.value=mode;sel.querySelector('option[value="Typist"]').disabled=!v114RoleAllowed('Typist');sel.querySelector('option[value="AdvocateStaff"]').disabled=!combinedAllowed();}
  const note=document.getElementById('v114RolePermissionNote');if(note)note.textContent=mode==='Typist'?'Typist mode • drafts across advocates':'Advocate / Staff mode';
  let advSel=document.getElementById('v114WorkingAdvocate'),host=document.querySelector('.v114-role-switch');
  if(host&&!advSel){advSel=document.createElement('select');advSel.id='v114WorkingAdvocate';advSel.className='v114-working-advocate';advSel.onchange=()=>v114SetWorkingAdvocate(advSel.value);host.appendChild(advSel);}
  if(advSel){const advs=getAdvocates();advSel.innerHTML=advs.map(a=>`<option value="${safe(a.name)}">For Advocate: ${safe(a.name)}</option>`).join('')||'<option value="">Add Advocate first</option>';if(s.advocateName&&advs.some(a=>a.name===s.advocateName))advSel.value=s.advocateName;advSel.hidden=mode!=='Typist';}
  const label=mode==='Typist'?'Typist':'Advocate / Staff';const prof=document.querySelector('#dashboardView .v18-profile small');if(prof)prof.textContent=label;const g=document.getElementById('v18Greeting');if(g)g.textContent=`${v18Greeting()}, ${s.name||'User'} — ${label}`;
};
window.v114SyncRoleButtons=window.v115SyncRoleUI;

// Typist can work across advocates; legacy local drafts without role metadata must not disappear.
v14DraftVisible=function(d){
  const s=v14SessionData();if(s.role==='Admin')return true;if(s.role==='Typist')return true;
  const owner=String(d.ownerAdvocate||d.advocate?.name||d.advocateName||'').trim().toLowerCase();
  if(!owner)return true;const me=String(s.name||'').trim().toLowerCase(),adv=String(s.advocateName||'').trim().toLowerCase();return owner===me||owner===adv;
};

// ---------- One Back button, always top-left inside draft workspace ----------
window.v115DraftBack=function(){
  const type=document.getElementById('draftTypeScreen'),steps=document.getElementById('draftStepsScreen');
  if(steps?.classList.contains('active')){if(Number(currentDraftStep||1)>1)goDraftStep(Number(currentDraftStep)-1);else{steps.classList.remove('active');type?.classList.add('active');window.scrollTo(0,0);}return;}
  showDashboard();
};
window.v114DraftBackTop=window.v115DraftBack;
window.v114InstallDraftBack=function(){
  const main=document.querySelector('#registryView .draft-workspace');if(main){let b=document.getElementById('v114DraftBack');if(!b){b=document.createElement('button');b.id='v114DraftBack';b.type='button';b.innerHTML='← Back';}b.className='v114-draft-back v115-draft-back';b.onclick=v115DraftBack;if(main.firstElementChild!==b)main.insertBefore(b,main.firstChild);}
  const card=document.querySelector('#saveSuccessModal .save-success-card');if(card){let b=document.getElementById('v114FinalBack');if(!b){b=document.createElement('button');b.id='v114FinalBack';b.type='button';b.innerHTML='← Back';card.insertBefore(b,card.firstChild);}b.className='v114-final-back';b.onclick=closeSaveSuccessModal;}
};

const originalRefresh=refreshDashboard;
refreshDashboard=function(){const out=originalRefresh.apply(this,arguments);setTimeout(()=>{v115SyncRoleUI();v114InstallDraftBack();},0);return out;};

// Page title/version + initialization.
document.addEventListener('DOMContentLoaded',()=>{
  normalizeSession();v114InstallDraftBack();v115SyncRoleUI();
  // If an old cached build left bottom draft navigation visible, remove it from keyboard/tab flow too.
  document.querySelectorAll('#registryView .wizard-footer > button.btn.outline:first-child,#registryView #draftTypeScreen .draft-actions > button.btn.outline:first-child').forEach(b=>{b.hidden=true;b.tabIndex=-1;});
});
})();

/* ===== Source: fixes.js ===== */
/* Registry Pro v1.16 — full Roorkee indexing, manual rate fallback, searchable advocate workspace, unified draft search, fixed navigation */
(function(){
'use strict';
const V116_VERSION='v1.16';
const V116_MANUAL_RATE_KEY='registryProManualRateV116';
let v116CircleSource='official';
let v116SearchState={advocate:'',docType:'all',criterion:'appNo',q:'',from:'',to:''};

function h(v){try{return esc(String(v??''));}catch(_){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}}
function low(v){return String(v||'').trim().toLowerCase();}
function nrm(v){return low(v).normalize('NFKC').replace(/[^a-z0-9\u0900-\u097f]+/g,' ').trim();}
function currentCtx(){
  const st=document.getElementById('dashState'),di=document.getElementById('dashDistrict'),te=document.getElementById('dashTehsil');
  if(st&&di&&te&&st.value&&di.value&&te.value)return {state:st.value,district:di.value,tehsil:te.value};
  return currentJurisdiction();
}
function rangeFor(c=currentCtx()){
  if(c.state==='Uttarakhand'&&c.district==='Haridwar'&&c.tehsil==='Roorkee')return [2,45];
  if(c.state==='Uttarakhand'&&c.district==='Haridwar'&&c.tehsil==='Bhagwanpur')return [46,57];
  return null;
}
function cfgFor(c=currentCtx()){return jurisdictionConfig(c);}

// ---------- 1) Complete Roorkee source rows 2–27 + page index ----------
(function installRoorkeeRows(){
  const add=Array.isArray(window.V116_ROORKEE_RATE_ROWS)?window.V116_ROORKEE_RATE_ROWS:[];
  for(const r of add){if(!CIRCLE_RATE_DATA.some(x=>x.id===r.id))CIRCLE_RATE_DATA.push({...r});}
  // v1.15 applies saved edits before this v1.16 file is loaded. Re-apply them now so
  // rows newly bundled in v1.16 (including Roorkee pages 2–27 and 39–45) stay editable
  // and their local edits survive a reload.
  try{
    const edits=JSON.parse(localStorage.getItem('registryProCircleEditsV115')||'{}')||{};
    for(const r of CIRCLE_RATE_DATA){if(r?.id&&edits[r.id])Object.assign(r,edits[r.id],{edited:true});}
  }catch(_){ }
  window.V115_PAGE_INDEX=window.V115_PAGE_INDEX||{};
  for(const r of CIRCLE_RATE_DATA){
    const p=Number(r.page||0);if(p<2||p>57)continue;
    const text=[r.group,r.name,r.alias,r.searchText,r.route,r.section].filter(Boolean).join(' ');
    window.V115_PAGE_INDEX[p]=`${window.V115_PAGE_INDEX[p]||''} ${text}`.trim();
  }
})();

// Any locality/mohalla inside a multi-name official row is searchable.
circleSearchText=function(e){
  const raw=[e.name,e.alias,e.searchText,e.route,e.section,e.group,`page ${e.page}`].filter(Boolean).join(' ');
  let roman='';try{roman=hindiRomanRough(raw);}catch(_){}
  let skeleton='';try{skeleton=latinSkeleton(`${e.alias||''} ${roman}`);}catch(_){}
  return `${circleNorm(raw)} ${roman} ${skeleton}`.toLowerCase();
};

// Page range is authoritative. Page 36 remains Roorkee even if text mentions Pargana Bhagwanpur.
v114CircleRowInTehsil=function(row,ctx=currentCtx()){
  if(typeof ctx==='string')ctx={...currentCtx(),tehsil:ctx};
  if(ctx.state!=='Uttarakhand'||ctx.district!=='Haridwar')return false;
  const p=Number(row?.page||0);
  if(ctx.tehsil==='Roorkee')return p>=2&&p<=45;
  if(ctx.tehsil==='Bhagwanpur')return p>=46&&p<=57;
  return false;
};
v14CircleRowInTehsil=function(row,tehsil=currentCtx().tehsil){return v114CircleRowInTehsil(row,{...currentCtx(),tehsil});};

function rowsFor(c=currentCtx()){
  return CIRCLE_RATE_DATA.filter(r=>v114CircleRowInTehsil(r,c)).sort((a,b)=>Number(a.page)-Number(b.page)||Number(a.row||0)-Number(b.row||0)||String(a.name||'').localeCompare(String(b.name||''),'hi'));
}

// ---------- 2) Tehsil context always drives every circle-rate label/button/search ----------
v114SyncCircleContext=function(){
  const c=currentCtx(),cfg=cfgFor(c),range=rangeFor(c),lab=document.getElementById('dashCircleRateLabel');
  if(lab)lab.textContent=range?`${range[0]}–${range[1]}`:(cfg&&!cfg.pdfPending?(cfg.ratePages||'Official PDF'):'PDF Pending');
  const b=document.getElementById('v114DraftOpenFullRate');
  if(b){b.textContent=range?`Open Complete ${c.tehsil} Circle Rate PDF (${range[0]}–${range[1]})`:`${c.tehsil} Circle Rate PDF Pending`;b.disabled=!cfg||!!cfg.pdfPending;}
  const ctxRate=document.getElementById('draftCtxRate');if(ctxRate)ctxRate.textContent=range?`Mapped (${range[0]}–${range[1]})`:'PDF Pending';
};

const v116JurBase=window.v18DashboardJurisdictionChanged;
window.v18DashboardJurisdictionChanged=function(which){
  if(typeof v116JurBase==='function')v116JurBase(which);
  setTimeout(()=>{
    const c=currentCtx();v14WriteJSON('registryProJurisdiction',c);
    selectedCircleLocation=null;selectedCircleRateKey=null;v116CircleSource='official';
    const vs=document.getElementById('villageSearch'),v=document.getElementById('village'),rid=document.getElementById('selectedCircleRowId'),ref=document.getElementById('rateRef');
    if(vs)vs.value='';if(v)v.value='';if(rid)rid.value='';if(ref)ref.value='';
    populateCircleRateOptions(null);v114SyncCircleContext();try{updateDraftJurisdictionContext();}catch(_){}
    try{refreshDashboard();}catch(_){}
  },0);
};

// ---------- 3) Village search: full rows, multi-name aliases, and manual entry ----------
window.v116UseManualLocation=function(text){
  const value=String(text??document.getElementById('villageSearch')?.value??'').trim();if(!value){toast('Village / Mohalla ka naam type karein');return;}
  selectedCircleLocation=null;selectedCircleRateKey=null;v116CircleSource='manual-location';
  const inp=document.getElementById('villageSearch'),hidden=document.getElementById('village'),rid=document.getElementById('selectedCircleRowId'),box=document.getElementById('villageSuggestions'),meta=document.getElementById('selectedLocationMeta'),ref=document.getElementById('rateRef');
  if(inp)inp.value=value;if(hidden)hidden.value=value;if(rid)rid.value='';if(box)box.classList.remove('show');
  populateCircleRateOptions(null);
  if(meta){meta.className='selected-location-meta ready v116-manual';meta.innerHTML=`✓ Manual location: <strong>${h(value)}</strong> • Circle Rate bhi PDF se select ya manually fill kar sakte hain.`;}
  if(ref)ref.value='Manual Location — official PDF row not selected';
  v116ShowManualRate(true);try{syncDraftPreview();}catch(_){}
};

filterCircleLocations=function(){
  const input=document.getElementById('villageSearch'),box=document.getElementById('villageSuggestions');if(!input||!box)return;
  const c=currentCtx(),cfg=cfgFor(c),range=rangeFor(c),typed=String(input.value||'').trim();
  if(!cfg||cfg.pdfPending){box.innerHTML=`<div class="location-empty"><b>${h(c.tehsil)}</b> ki official PDF abhi pending hai.</div>${typed?`<button type="button" class="location-option v116-manual-option" onclick='v116UseManualLocation(${JSON.stringify(typed)})'><span><strong>✎ Use manually: ${h(typed)}</strong><small>Village manually save hoga</small></span><span class="rate-chip">Manual</span></button>`:''}`;box.classList.add('show');return;}
  const q=circleNorm(typed),qRoman=low(typed).replace(/[^a-z0-9]/g,''),qSkeleton=latinSkeleton(typed);
  let rows=rowsFor(c).filter(e=>{const hay=circleSearchText(e);return !q||hay.includes(q)||(qRoman&&hay.includes(qRoman))||(qSkeleton&&hay.includes(qSkeleton));});
  const k=defaultRateKey();
  let html=rows.map(e=>`<button type="button" class="location-option" onclick="selectCircleLocation('${h(e.id)}')"><span><strong>${h(e.name)}</strong><small>${h(e.section||'')} • Official PDF page ${h(e.page)} • row ${h(e.row||'-')} • श्रेणी ${h(e.group||'-')}</small></span><span class="rate-chip">${formatRateValue(k,e[k])}</span></button>`).join('');
  if(!rows.length&&typed&&range){
    const hits=[];for(let p=range[0];p<=range[1];p++){if(nrm(window.V115_PAGE_INDEX?.[p]||'').includes(nrm(typed)))hits.push(p);}
    if(hits.length)html+=`<div class="location-empty">Official page text me match mila:</div>${hits.slice(0,20).map(p=>`<button type="button" class="location-option v115-page-hit" onclick="v115OpenSourcePage(${p})"><span><strong>Official PDF Page ${p}</strong><small>Page verify karein; rate manually bhi fill kar sakte hain.</small></span><span class="rate-chip">View PDF</span></button>`).join('')}`;
  }
  if(typed)html+=`<button type="button" class="location-option v116-manual-option" onclick='v116UseManualLocation(${JSON.stringify(typed)})'><span><strong>✎ Use manually: ${h(typed)}</strong><small>List me na mile to ye naam manually save karein</small></span><span class="rate-chip">Manual</span></button>`;
  if(!html)html=`<div class="location-empty">${h(c.tehsil)} ki list me naam type karke search karein.</div>`;
  box.innerHTML=html;box.classList.add('show');
};

const v116SelectCircleBase=selectCircleLocation;
selectCircleLocation=function(id){
  const row=CIRCLE_RATE_DATA.find(x=>x.id===id);if(row&&!v114CircleRowInTehsil(row,currentCtx())){toast('Ye row selected tehsil ki official list me nahi hai');return;}
  v116CircleSource='official';v116SelectCircleBase(id);v116ShowManualRate(false);
  const ref=document.getElementById('rateRef');if(row&&ref&&ref.value)ref.value=ref.value.replace('ROORKEE_BHAGWANPUR PDF',`${currentCtx().tehsil} Official PDF`);
};

// Open correct split PDF while preserving ORIGINAL source-page references in UI.
openCircleRatePdf=function(){
  const c=currentCtx(),cfg=cfgFor(c);if(!cfg||cfg.pdfPending||!cfg.ratePdf){toast(`${c.tehsil} Circle Rate PDF pending`);return;}
  const row=CIRCLE_RATE_DATA.find(x=>x.id===val('selectedCircleRowId'));const src=Number(row?.page||cfg.sourcePageStart||1),split=Math.max(1,src-Number(cfg.sourcePageStart||1)+1);
  window.open(`${cfg.ratePdf}#page=${split}`,'_blank');
};
v114OpenRatePdf=function(){const c=currentCtx(),cfg=cfgFor(c);if(!cfg||cfg.pdfPending||!cfg.ratePdf){toast(`${c.tehsil} Circle Rate PDF pending`);return;}window.open(`${cfg.ratePdf}#page=1`,'_blank');};

// ---------- 4) Manual Circle Rate input / override ----------
function v116ManualRateHtml(){return `<div id="v116ManualRateBox" class="v116-manual-rate" hidden><div class="v116-manual-grid"><label>Rate Type<select id="v116ManualRateKey"><option value="nonAgri">अकृषि भूमि / Residential Plot (₹/m²)</option><option value="agri">कृषि भूमि (₹ लाख/हेक्टेयर)</option><option value="multi">बहुमंजिला आवासीय (₹/m²)</option><option value="shop">दुकान / रेस्टोरेंट / कार्यालय (₹/m²)</option><option value="otherCommercial">अन्य वाणिज्यिक (₹/m²)</option><option value="nonCommercial1">गैर वाणिज्यिक प्रथम (₹/m²)</option><option value="nonCommercial2">गैर वाणिज्यिक द्वितीय (₹/m²)</option></select></label><label>Manual Rate<input id="v116ManualRateValue" type="number" min="0" step="0.01" placeholder="Rate fill karein"></label><button type="button" class="btn primary compact" onclick="v116ApplyManualRate()">Use Manual Rate</button></div><small>Manual rate par PDF Page/Row/Column reference create nahi hoga. Source “Manual Entry” save hoga.</small></div>`;}
function v116InstallManualControls(){
  const search=document.querySelector('.location-search-wrap');if(search&&!document.getElementById('v116ManualVillageBtn')){const b=document.createElement('button');b.id='v116ManualVillageBtn';b.type='button';b.className='v116-inline-manual';b.textContent='+ Enter Village / Mohalla Manually';b.onclick=()=>v116UseManualLocation();search.insertAdjacentElement('afterend',b);}
  const picker=document.getElementById('circleRatePicker');if(picker&&!document.getElementById('v116ManualRateToggle')){const b=document.createElement('button');b.id='v116ManualRateToggle';b.type='button';b.className='v116-inline-manual';b.textContent='+ Enter Circle Rate Manually';b.onclick=()=>v116ShowManualRate();picker.parentElement?.insertBefore(b,picker.nextSibling);b.insertAdjacentHTML('afterend',v116ManualRateHtml());}
}
window.v116ShowManualRate=function(force){const box=document.getElementById('v116ManualRateBox');if(!box)return;box.hidden=force===true?false:force===false?true:!box.hidden;if(!box.hidden)document.getElementById('v116ManualRateValue')?.focus();};
window.v116ApplyManualRate=function(){
  const key=document.getElementById('v116ManualRateKey')?.value||'nonAgri',num=Number(document.getElementById('v116ManualRateValue')?.value||0);if(!(num>0)){toast('Valid manual rate fill karein');return;}
  selectedCircleRateKey=key;v116CircleSource='manual-rate';
  const c=landRateConfig(key),sel=document.getElementById('circleRateSelect');if(sel){sel.innerHTML=`<option value="${num}" data-rate-key="${h(key)}" data-column="">Manual — ${h(c.type)}</option>`;sel.value=String(num);sel.disabled=false;}
  const picker=document.getElementById('circleRatePicker');if(picker){picker.disabled=false;picker.classList.add('selected','v116-manual-selected');const main=picker.querySelector('.picker-main');if(main)main.innerHTML=`Manual — ${h(c.type)} <small>${formatRateValue(key,num)} • Manual Entry</small>`;}
  const ref=document.getElementById('rateRef');if(ref)ref.value=`Manual Entry • ${c.type} • ${formatRateValue(key,num)} • No PDF reference`;
  const meta=document.getElementById('selectedLocationMeta');if(meta)meta.innerHTML=`✓ Manual Circle Rate: <strong>${formatRateValue(key,num)}</strong> • Source: Manual Entry`;
  applyCircleRateOption();v116ShowManualRate(false);toast('Manual circle rate applied');
};

const v116DraftDataBase=draftData;
draftData=function(){const d=v116DraftDataBase();d.circleRateSource=v116CircleSource.startsWith('manual')?'Manual Entry':'Official PDF';d.manualCircleRate=d.circleRateSource==='Manual Entry';return d;};
const v116LoadDraftBase=v14LoadDraftFields;
v14LoadDraftFields=function(d){v116LoadDraftBase(d);if(d?.circleRateSource==='Manual Entry'||d?.manualCircleRate){v116CircleSource='manual-rate';const box=document.getElementById('v116ManualRateBox'),key=d.circleRateKey||'nonAgri',value=Number(d.circleRate||0);if(box){document.getElementById('v116ManualRateKey').value=key;document.getElementById('v116ManualRateValue').value=value||'';}if(value>0)v116ApplyManualRate();if(d.village&&!d.circleRateRowId){const vs=document.getElementById('villageSearch'),v=document.getElementById('village');if(vs)vs.value=d.village;if(v)v.value=d.village;selectedCircleLocation=null;}}};

// ---------- 5) Searchable Advocate selector + document-type workspace ----------
function advocateNames(){
  const map=new Map();for(const a of (getAdvocates?.()||[])){const name=String(a?.name||'').trim();if(!name)continue;const key=name.toLowerCase();if(!map.has(key))map.set(key,name);}return [...map.values()].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'}));
}
function v116AdvocatePanelHtml(){return `<div id="v116AdvocatePanel" class="v116-adv-panel"><label>For Advocate — Search<input id="v116AdvocateSearch" autocomplete="off" placeholder="Advocate name type karein..." onfocus="v116FilterAdvocates()" oninput="v116FilterAdvocates()"></label><div id="v116AdvocateSuggestions" class="v116-adv-suggest"></div><div id="v116AdvDocRow" class="v116-adv-docrow" hidden><select id="v116AdvDocType"><option value="checking">Checking Copy</option><option value="final">Final Draft</option><option value="receipt">Receipt</option><option value="affidavit">Affidavit</option></select><button type="button" class="btn primary compact" onclick="v116OpenAdvocateSearch()">Search</button></div></div>`;}
function v116InstallAdvocateSearch(){
  const s=v14SessionData(),host=document.querySelector('.v114-role-switch');if(!host)return;
  const old=document.getElementById('v114WorkingAdvocate');if(old)old.hidden=true;
  let panel=document.getElementById('v116AdvocatePanel');if(!panel){host.insertAdjacentHTML('beforeend',v116AdvocatePanelHtml());panel=document.getElementById('v116AdvocatePanel');}
  panel.hidden=s.role!=='Typist';if(panel.hidden)return;
  const inp=document.getElementById('v116AdvocateSearch');if(inp&&document.activeElement!==inp)inp.value=s.advocateName||'';
  const row=document.getElementById('v116AdvDocRow');if(row)row.hidden=!String(s.advocateName||'').trim();
}
window.v116FilterAdvocates=function(){
  const inp=document.getElementById('v116AdvocateSearch'),box=document.getElementById('v116AdvocateSuggestions');if(!inp||!box)return;const q=low(inp.value);
  const all=advocateNames(),hits=all.filter(x=>!q||low(x).includes(q));box.innerHTML=hits.slice(0,80).map(x=>`<button type="button" onclick='v116SelectAdvocate(${JSON.stringify(x)})'>${h(x)}</button>`).join('')||'<small>No advocate match</small>';box.classList.add('show');
};
window.v116SelectAdvocate=function(name){
  const exact=advocateNames().find(x=>low(x)===low(name))||name;v114SetWorkingAdvocate(exact);const inp=document.getElementById('v116AdvocateSearch');if(inp)inp.value=exact;document.getElementById('v116AdvocateSuggestions')?.classList.remove('show');const row=document.getElementById('v116AdvDocRow');if(row)row.hidden=false;toast(`Advocate selected: ${exact}`);
};
window.v116OpenAdvocateSearch=function(){const advocate=document.getElementById('v116AdvocateSearch')?.value.trim()||v14SessionData().advocateName||'',docType=document.getElementById('v116AdvDocType')?.value||'checking';if(!advocate){toast('Advocate select karein');return;}v116OpenRecordSearch({advocate,docType});};

const v116RoleSyncBase=window.v115SyncRoleUI;
window.v115SyncRoleUI=function(){if(typeof v116RoleSyncBase==='function')v116RoleSyncBase();setTimeout(v116InstallAdvocateSearch,0);};
window.v114SyncRoleButtons=window.v115SyncRoleUI;

// ---------- 6) One search formula for left Search Draft + Advocate Checking/Final/Receipt/Affidavit ----------
function docLabel(t){return ({all:'All Drafts',checking:'Checking Copy',final:'Final Draft',receipt:'Receipt',affidavit:'Affidavit'})[t]||t;}
function draftAdv(d){return String(d.ownerAdvocate||d.advocate?.name||d.advocateName||'').trim();}
function khasraText(d){try{return v19KhasraText(d);}catch(_){return String(d.khasraNo||(d.agri?.gataRows||[]).map(x=>x.gata).filter(Boolean).join(', ')||'');}}
function documentMatches(d,type){if(!type||type==='all')return true;if(type==='checking')return d.status==='Checking Copy';if(type==='final')return d.status==='Completed'||d.finalApproved;if(type==='receipt')return /receipt|रसीद/i.test(`${d.documentType||''} ${d.registryType||''} ${d.outputType||''}`);if(type==='affidavit')return /affidavit|affidavite|शपथ|हलफ/i.test(`${d.documentType||''} ${d.registryType||''} ${d.outputType||''}`);return true;}
function criterionText(d,k){
  if(k==='appNo')return String(d.registryNo||'');
  if(k==='draftNo')return String(d.draftNumber||d.registryNo||d.id||'');
  if(k==='seller')return v14PartyNamesPlain(d.sellers,d.seller);
  if(k==='buyer')return v14PartyNamesPlain(d.buyers,d.buyer);
  if(k==='khasra')return khasraText(d);
  return '';
}
window.v116OpenRecordSearch=function(scope={}){
  v116SearchState={advocate:String(scope.advocate||''),docType:scope.docType||'all',criterion:'draftNo',q:'',from:'',to:''};
  showView('savedView');
  const hdr=document.querySelector('#savedView .header');
  if(hdr)hdr.classList.add('v1171-saved-header');
  const backBtn=document.querySelector('#savedView .header .btn');
  if(backBtn){backBtn.textContent='← Back';backBtn.setAttribute('onclick','showDashboard()');}
  v116BuildSearchUI();
  v116RenderSearchResults();
};
function v116BuildSearchUI(){
  const card=document.querySelector('#savedView .saved-search-card');if(!card)return;const s=v116SearchState;
  const isDate=s.criterion==='date';
  const scopeNote=s.advocate?`<span class="v1171-scope-note">${h(s.advocate)} • ${h(docLabel(s.docType))}</span>`:'';
  card.innerHTML=`<div class="v1171-saved-toolbar">
    ${scopeNote}
    <label class="v1171-field v1171-criterion"><span>Search By</span>
      <select id="v116Criterion" onchange="v116SetSearchCriterion(this.value)">
        <option value="draftNo">Draft No.</option>
        <option value="khasra">Khasra No.</option>
        <option value="seller">Seller</option>
        <option value="buyer">Buyer</option>
        <option value="date">Date Wise</option>
      </select>
    </label>
    ${isDate
      ? `<label class="v1171-field"><span>From Date</span><input id="v116From" type="date"></label>
         <label class="v1171-field"><span>To Date</span><input id="v116To" type="date"></label>`
      : `<label class="v1171-field v1171-query"><span>Search</span><input id="v116Query" type="text" placeholder="${s.criterion==='khasra'?'Search Khasra Number':s.criterion==='seller'?'Search Seller':s.criterion==='buyer'?'Search Buyer':'Search Draft Number'}" value="${h(s.q)}" onkeydown="if(event.key==='Enter')v116ApplySearch()"></label>`}
    <button class="btn primary compact v1171-search-btn" type="button" onclick="v116ApplySearch()">Search</button>
    <button class="btn outline compact v1171-clear-btn" type="button" onclick="v116ClearSearch()">Clear</button>
    <span id="savedResultCount" class="v1171-result-count">0 records</span>
  </div>`;
  const c=document.getElementById('v116Criterion');if(c)c.value=s.criterion;
  if(isDate){
    const f=document.getElementById('v116From'),t=document.getElementById('v116To');
    if(f)f.value=s.from||'';if(t)t.value=s.to||'';
  }
}
window.v116SetSearchCriterion=function(v){
  v116SearchState.criterion=v||'draftNo';
  v116SearchState.q='';v116SearchState.from='';v116SearchState.to='';
  v116BuildSearchUI();
};
window.v116ApplySearch=function(){
  if(v116SearchState.criterion==='date'){
    v116SearchState.from=document.getElementById('v116From')?.value||'';
    v116SearchState.to=document.getElementById('v116To')?.value||'';
    v116SearchState.q='';
  }else{
    v116SearchState.q=document.getElementById('v116Query')?.value||'';
    v116SearchState.from='';v116SearchState.to='';
  }
  v116RenderSearchResults();
};
window.v116SetSearchQuery=function(v){v116SearchState.q=v||'';};
window.v116SetSearchDate=function(which,v){if(which==='from')v116SearchState.from=v||'';else v116SearchState.to=v||'';};
window.v116SetDocFilter=function(v){v116SearchState.docType=v||'all';v116RenderSearchResults();};
window.v116ClearSearch=function(){
  v116SearchState.q='';v116SearchState.from='';v116SearchState.to='';
  v116BuildSearchUI();v116RenderSearchResults();
};
window.v116RenderSearchResults=function(){
  const box=document.getElementById('savedList');if(!box)return;const s=v116SearchState,q=low(s.q);
  let arr=v14VisibleDrafts()
    .filter(d=>!s.advocate||low(draftAdv(d))===low(s.advocate))
    .filter(d=>documentMatches(d,s.docType))
    .filter(d=>{const day=v14DateOnly(d)||'';return (!s.from||day>=s.from)&&(!s.to||day<=s.to);})
    .filter(d=>!q||low(criterionText(d,s.criterion)).includes(q));
  arr.sort((a,b)=>String(b.savedAtISO||b.savedAt||'').localeCompare(String(a.savedAtISO||a.savedAt||'')));
  const cnt=document.getElementById('savedResultCount');if(cnt)cnt.textContent=`${arr.length} record${arr.length===1?'':'s'}`;
  if(!arr.length){box.innerHTML='<div class="v1171-empty-row">No matching records</div>';return;}
  box.innerHTML=`<div class="v1171-saved-table">
    <div class="v1171-saved-head">
      <span>Draft No.</span><span>Deed</span><span>Seller</span><span>Buyer</span><span>Khasra No.</span><span>Date</span><span>Status</span><span>Action</span>
    </div>
    ${arr.map(d=>`<div class="v1171-saved-row">
      <span class="v1171-draftno">${h(d.draftNumber||d.registryNo||'Legacy Draft')}</span>
      <span>${h(d.registryType||'Registry Draft')}</span>
      <span title="${h(v14PartyNamesPlain(d.sellers,d.seller)||'-')}">${h(v14PartyNamesPlain(d.sellers,d.seller)||'-')}</span>
      <span title="${h(v14PartyNamesPlain(d.buyers,d.buyer)||'-')}">${h(v14PartyNamesPlain(d.buyers,d.buyer)||'-')}</span>
      <span title="${h(khasraText(d)||'-')}">${h(khasraText(d)||'-')}</span>
      <span>${h(v14DateOnly(d)||d.savedAt||'-')}</span>
      <span><b class="status-chip ${d.status==='Completed'?'':'progress'}">${h(d.status||'Saved')}</b></span>
      <span class="v1171-row-actions">
        <button class="btn primary compact" onclick="v116CloneDraft('${h(d.registryNo)}')">Open Draft — New Copy</button>
        <button class="btn outline compact" onclick="createNextSaleFromDraft('${h(d.registryNo)}')">Buyer → Seller</button>
      </span>
    </div>`).join('')}
  </div>`;
};

window.v116CloneDraft=function(registryNo){
  const src=v14AllDrafts().find(x=>x.registryNo===registryNo);if(!src||!v14DraftVisible(src)){toast('Source draft not available');return;}
  const d=JSON.parse(JSON.stringify(src));d.sourceRegistryNo=src.registryNo;delete d.registryNo;delete d.savedAtISO;delete d.savedAt;delete d.id;d.status='In Progress';d._workingDraft=true;d.finalApproved=false;d.checkingCopy=false;
  if(src.jurisdiction)v14WriteJSON('registryProJurisdiction',src.jurisdiction);
  v14LoadingDraft=true;v14ActiveRegistryNo=null;openNewRegistry();registrySelectedType=src.registryType||'Residential Plot';v14EnsureRegistryNo();document.getElementById('draftTypeScreen')?.classList.remove('active');document.getElementById('draftStepsScreen')?.classList.add('active');v14LoadDraftFields(d);goDraftStep(1);updateDraftNumberMini();v14LoadingDraft=false;saveDraftV04(false);toast(`New copy created: ${v14ActiveRegistryNo}. Original ${src.registryNo} unchanged.`);
};

// Left drawer/dashboard Search Draft uses the same new search engine.
openSavedDrafts=function(){v116OpenRecordSearch({});};
renderSavedDraftsV14=function(){if(document.getElementById('savedView')?.classList.contains('active'))v116RenderSearchResults();};
clearDraftFilters=function(){v116ClearSearch();};

// Existing advocate list opens the same searchable formula as dashboard advocate selector.
window.v19OpenAdvocateWorkspace=function(name,tab='copy'){v116OpenRecordSearch({advocate:name,docType:tab==='final'?'final':'checking'});};

// ---------- 7) Circle Rate manager sees ALL rows 2–45 / 46–57 and searches all aliases ----------
const v116RateManagerBase=openCircleRateManager;
openCircleRateManager=function(){v116RateManagerBase();setTimeout(()=>{const input=document.getElementById('v115RateSearch');if(input)input.placeholder='Village / mohalla / road / ward / page / category search...';},0);};
const v116RateMgrRender=window.v115RenderRateManagerRows;
window.v115RenderRateManagerRows=function(){
  const host=document.getElementById('v115RateTableBody');if(!host||typeof v116RateMgrRender!=='function')return v116RateMgrRender?.();
  const q=nrm(document.getElementById('v115RateSearch')?.value||'');let rows=rowsFor();if(q)rows=rows.filter(r=>nrm(circleSearchText(r)).includes(q));
  const count=document.getElementById('v115RateVisibleCount');if(count)count.textContent=`${rows.length} rows`;
  host.innerHTML=rows.map(r=>`<tr><td>${h(r.page)}</td><td>${h(r.group||'-')}</td><td><b>${h(r.name)}</b><small>${h(r.searchText||r.route||r.section||'')}</small></td><td>${r.agri==null?'—':h(r.agri)}</td><td>${r.nonAgri==null?'—':h(r.nonAgri)}</td><td>${r.multi==null?'—':h(r.multi)}</td><td>${r.shop==null?'—':h(r.shop)}</td><td><button class="btn outline compact" onclick="v115EditRateRow('${h(r.id)}')">Edit</button></td></tr>`).join('')||'<tr><td colspan="8" class="v115-empty">No matching row.</td></tr>';
};

// ---------- 8) One Back button at one fixed top-left location on every draft step ----------
window.v116DraftBack=function(){
  const type=document.getElementById('draftTypeScreen'),steps=document.getElementById('draftStepsScreen');
  if(steps?.classList.contains('active')){if(Number(currentDraftStep||1)>1)goDraftStep(Number(currentDraftStep)-1);else{steps.classList.remove('active');type?.classList.add('active');window.scrollTo(0,0);}return;}showDashboard();
};
window.v115DraftBack=window.v116DraftBack;window.v114DraftBackTop=window.v116DraftBack;
function hideDuplicateBack(){
  document.querySelectorAll('#registryView button').forEach(b=>{if(b.id==='v114DraftBack')return;const t=low(b.textContent),oc=String(b.getAttribute('onclick')||'');if((/^(←\s*)?back$/.test(t)||t==='cancel'||/showDashboard\(\)|draftBack|goDraftStep\(currentDraftStep-1\)/i.test(oc))&&!/save|continue/i.test(t)){b.classList.add('v116-duplicate-nav');b.tabIndex=-1;}});
}
window.v114InstallDraftBack=function(){
  const main=document.querySelector('#registryView .draft-workspace');if(main){let b=document.getElementById('v114DraftBack');if(!b){b=document.createElement('button');b.id='v114DraftBack';b.type='button';b.innerHTML='← Back';main.appendChild(b);}b.className='v114-draft-back v115-draft-back v116-fixed-back';b.onclick=v116DraftBack;}
  hideDuplicateBack();
};

// ---------- 9) Court AI rate search uses the same complete/tehsil-safe index ----------
v114CourtRateAnswer=function(q){
  const c=currentCtx(),cfg=cfgFor(c),range=rangeFor(c);if(!cfg||cfg.pdfPending)return `${c.tehsil} ki official circle-rate PDF abhi add nahi hai.`;
  const tokens=nrm(q).split(/\s+/).filter(x=>x.length>1&&!['circle','rate','batao','kya','hai','ka','ki','ke','दर','रेट'].includes(x));
  let cand=rowsFor(c).map(r=>{const hay=nrm(circleSearchText(r));let score=0;for(const t of tokens)if(hay.includes(t))score+=t.length;return {r,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8).map(x=>x.r);
  if(!cand.length)return `${c.tehsil} official pages ${range?.[0]||'-'}–${range?.[1]||'-'} ke searchable rows me exact match nahi mila. Village manually enter karke rate manually fill bhi kar sakte hain.`;
  return cand.map(r=>{const vals=[['Agriculture','agri'],['Non-Agriculture','nonAgri'],['Multi-storey','multi'],['Shop/Commercial','shop']].filter(x=>Number(r[x[1]])>0).map(x=>`${x[0]}: ${formatRateValue(x[1],r[x[1]])}`).join(' | ');return `${r.name} — ${vals}. Official PDF page ${r.page}, row ${r.row||'-'}, category ${r.group||'-'}.`;}).join('\n');
};

// ---------- init/version ----------
function init(){
  v116InstallManualControls();v114InstallDraftBack();v115SyncRoleUI();v114SyncCircleContext();
  // Source-page label: split PDF page 1 = official Roorkee page 2; UI always displays official numbers.
  const source=document.querySelector('#draftStep1 .source-note');if(source)source.textContent='Circle Rate source follows selected Tehsil. Official source page numbers are preserved.';
  document.addEventListener('click',e=>{if(!e.target.closest('#v116AdvocatePanel'))document.getElementById('v116AdvocateSuggestions')?.classList.remove('show');});
  console.info('Registry Pro v1.16 Full Final Fixed loaded — Roorkee pages 2–45 + unified search');
}
const refreshBase=refreshDashboard;
refreshDashboard=function(){const out=refreshBase.apply(this,arguments);setTimeout(()=>{v114SyncCircleContext();v116InstallAdvocateSearch();v114InstallDraftBack();},0);return out;};
document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));
})();

/* ===== Source: final.js ===== */
/* Registry Pro v1.17.2 — profile autofill, compact dashboard, advocate add-page patch */
(function(){
'use strict';
const V117='v1.17.2';
const PROFILE_KEY='registryProMineProfileV117';
const PROFILE_BOOK_KEY='registryProProfileBookV1172';
const MUTATION_KEY='registryProMutationV117';
const PROPERTY_ADJ_KEY='registryProPropertyAdjustmentsV117';
let advSearchState={mobile:'',name:'',docType:'final',criterion:'draftNo',q:''};

const e117=v=>{try{return esc(String(v??''));}catch(_){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}};
const digits=v=>String(v||'').replace(/\D/g,'');
const mobile10=v=>digits(v).slice(-10);
const lc=v=>String(v||'').trim().toLowerCase();
const read=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v??d;}catch(_){return d;}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const today=()=>new Date().toISOString().slice(0,10);
const plusDays=(day,n)=>{const d=new Date(`${day}T00:00:00`);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10);};
function profile(){return read(PROFILE_KEY,{});}
function saveProfile(p){write(PROFILE_KEY,p);}
function profileBook(){const x=read(PROFILE_BOOK_KEY,[]);return Array.isArray(x)?x:[];}
function saveProfileRecord(raw={}){
  const p={...raw,mobile:mobile10(raw.mobile)};if(p.mobile.length!==10)return;
  const arr=profileBook(),i=arr.findIndex(x=>mobile10(x.mobile)===p.mobile);
  if(i>=0)arr[i]={...arr[i],...Object.fromEntries(Object.entries(p).filter(([,v])=>String(v??'').trim()!==''))};else arr.unshift(p);
  write(PROFILE_BOOK_KEY,arr.slice(0,1000));
}
function profileByMobile(m){
  const mm=mobile10(m);if(mm.length!==10)return null;
  const cur=profile();if(mobile10(cur.mobile)===mm)return cur;
  const saved=profileBook().find(x=>mobile10(x.mobile)===mm);if(saved)return saved;
  try{const u=v114Users?.().find(x=>mobile10(x.mobile)===mm);if(u)return {name:u.name||'',address:u.address||'',mobile:mm,state:u.state||'',district:u.district||'',tehsil:u.tehsil||'',pin:u.pin||'',roleType:(u.roles||[]).includes('Typist')&&!((u.roles||[]).includes('Advocate'))?'Typist':'Advocate'};}catch(_){}
  return null;
}
function rememberProfileIdentity(raw={}){
  const p={...raw,mobile:mobile10(raw.mobile)};if(p.mobile.length!==10)return;
  saveProfileRecord(p);
  try{v113RememberParty?.({name:p.name||'',address:p.address||'',mobile:p.mobile},'profile');}catch(_){}
  try{
    const users=v114Users?.()||[],i=users.findIndex(x=>mobile10(x.mobile)===p.mobile);
    if(i>=0){users[i]={...users[i],name:p.name||users[i].name,address:p.address||users[i].address,state:p.state||users[i].state,district:p.district||users[i].district,tehsil:p.tehsil||users[i].tehsil,pin:p.pin||users[i].pin};v114SaveUsers?.(users);}
  }catch(_){}
}
function mergedKnownParties(){
  const src=[];
  try{src.push(...(window.__v117BaseKnownParties?.()||[]));}catch(_){}
  try{src.push(...(typeof v15PartyMasterAll==='function'?v15PartyMasterAll():[]));}catch(_){}
  try{src.push(...profileBook());}catch(_){}
  try{const x=profile();if(x&&x.mobile)src.push(x);}catch(_){}
  try{(v114Users?.()||[]).forEach(u=>src.push({name:u.name||'',address:u.address||'',mobile:u.mobile||''}));}catch(_){}
  const map=new Map(),loose=[];
  src.forEach(raw=>{if(!raw)return;const p={...raw,mobile:mobile10(raw.mobile),aadhaar:digits(raw.aadhaar||raw.id||raw.idNo)};const key=(p.aadhaar.length===12?'A:'+p.aadhaar:(p.mobile.length===10?'M:'+p.mobile:''));if(!key){loose.push(p);return;}const old=map.get(key)||{};map.set(key,{...old,...Object.fromEntries(Object.entries(p).filter(([,v])=>String(v??'').trim()!==''))});});
  return [...map.values(),...loose];
}
// Unify legacy party master + current/profile/account data so Mobile/Aadhaar lookup works app-wide.
window.__v117BaseKnownParties=window.v113AllKnownParties;
window.v113AllKnownParties=function(){return mergedKnownParties();};
window.v113FindPartyByIdentity=function(aadhaar,mobile){
  const a=digits(aadhaar),m=mobile10(mobile),list=mergedKnownParties();
  if(a.length===12){const x=list.find(p=>digits(p.aadhaar||p.id||p.idNo)===a);if(x)return x;}
  if(m.length===10){const x=list.find(p=>mobile10(p.mobile)===m);if(x)return x;}
  return null;
};

function currentIdentity(){
  const s=v14SessionData?.()||{},p=profile();
  if(s.role==='Advocate'&&p.roleType==='Advocate')return {name:p.name||s.name||'',mobile:mobile10(p.mobile||s.mobile),role:'Advocate'};
  if(s.role==='Typist'&&p.roleType==='Typist')return {name:p.name||s.name||'',mobile:mobile10(p.mobile||s.mobile),role:'Typist'};
  return {name:s.name||'',mobile:mobile10(s.mobile||''),role:s.role||''};
}
function advocateByMobile(m){const mm=mobile10(m);return getAdvocates().find(a=>mobile10(a.mobile)===mm)||null;}
function advocateByName(n){const nn=lc(n);return getAdvocates().find(a=>lc(a.name)===nn)||null;}
function advocateForDraft(d){return advocateByMobile(d?.ownerAdvocateMobile)||advocateByName(d?.ownerAdvocate||d?.advocate?.name||d?.advocateName)||null;}
function draftOwnerMobile(d){return mobile10(d?.ownerAdvocateMobile||d?.advocate?.mobile||advocateForDraft(d)?.mobile||'');}
function draftOwnerName(d){return String(d?.ownerAdvocate||d?.advocate?.name||d?.advocateName||advocateForDraft(d)?.name||'').trim();}
function draftCreatorMobile(d){return mobile10(d?.createdByMobile||d?.typistMobile||'');}
function draftCreatorName(d){return String(d?.createdBy||d?.assignedTypist||'').trim();}
function allDrafts(){return typeof v14AllDrafts==='function'?v14AllDrafts():read('registryProDrafts',[]);}
function saveDrafts(a){if(typeof v14SaveDrafts==='function')v14SaveDrafts(a);else write('registryProDrafts',a);}
function draftByNo(no){return allDrafts().find(d=>String(d.registryNo||d.draftNumber||'')===String(no||''));}
function partyNames(list,one){try{return v14PartyNamesPlain(list,one);}catch(_){return normalizePartyList(list,one).map(p=>p.name||'').filter(Boolean).join(', ');}}
function khasra(d){try{return v19KhasraText(d);}catch(_){return d.khasraNo||(d.agri?.gataRows||[]).map(x=>x.gata).filter(Boolean).join(', ');}}
function area(d){try{return v19PropertyAreaText(d);}catch(_){return d.agri?.totalAreaHa?`${Number(d.agri.totalAreaHa).toFixed(4)} ha`:`${Number(d.areaM2||0).toFixed(2)} m²`;}}
function buyerPrimary(d){return normalizePartyList(d?.buyers,d?.buyer)[0]||{};}
function sellerPrimary(d){return normalizePartyList(d?.sellers,d?.seller)[0]||{};}

// Extend identity autofill to remaining person-entry surfaces (Party Master + extra Witnesses).
function v117FillPartyMasterForm(p){
  if(!p)return;const set=(id,v)=>{const e=document.getElementById(id);if(e&&String(v??'').trim()!=='')e.value=v;};
  set('pmName',p.name);set('pmFather',p.father);set('pmAddress',p.address);set('pmMobile',p.mobile);set('pmAadhaar',p.aadhaar);set('pmEmail',p.email);
}
function v117FillExtraWitness(card,p){
  if(!card||!p)return;const set=(q,v)=>{const e=card.querySelector(q);if(e&&String(v??'').trim()!=='')e.value=v;};
  set('[data-w="name"]',p.name);set('[data-w="father"]',p.father);set('[data-w="address"]',p.address);set('[data-w="mobile"]',p.mobile);
  if(digits(p.aadhaar).length===12){set('[data-w="id"]',digits(p.aadhaar));set('[data-w="idType"]','AADHAAR');}
  const rel=card.querySelector('[data-w="relation"]');if(rel&&p.relation){const r=typeof relationMeta==='function'?relationMeta(p.relation).code:p.relation;if([...rel.options].some(o=>o.value===r))rel.value=r;}
  try{syncDraftPreview();}catch(_){}
}
document.addEventListener('input',e=>{
  const t=e.target;if(!t)return;
  if(t.id==='pmMobile'||t.id==='pmAadhaar'){
    const m=mobile10(document.getElementById('pmMobile')?.value||''),a=digits(document.getElementById('pmAadhaar')?.value||'');
    if(m.length===10||a.length===12){const p=v113FindPartyByIdentity?.(a,m);if(p)v117FillPartyMasterForm(p);}return;
  }
  if(t.matches?.('[data-w="mobile"],[data-w="id"]')){
    const card=t.closest('.v18-extra-witness');if(!card)return;const m=mobile10(card.querySelector('[data-w="mobile"]')?.value||''),a=digits(card.querySelector('[data-w="id"]')?.value||'');
    if(m.length===10||a.length===12){const p=v113FindPartyByIdentity?.(a,m);if(p)v117FillExtraWitness(card,p);}
  }
},true);

// ----- Strict record ownership -----
v14DraftVisible=function(d){
  const s=v14SessionData(),id=currentIdentity();
  if(s.role==='Admin')return true;
  if(s.role==='Typist'){
    const cm=draftCreatorMobile(d),cn=lc(draftCreatorName(d));
    if(cm&&id.mobile)return cm===id.mobile;
    return !!cn&&cn===lc(id.name);
  }
  if(s.role==='Advocate'){
    const om=draftOwnerMobile(d),on=lc(draftOwnerName(d));
    if(om&&id.mobile)return om===id.mobile;
    return !!on&&on===lc(id.name);
  }
  return false;
};
v14VisibleDrafts=function(){return allDrafts().filter(v14DraftVisible);};
v14CompletedVisible=function(){return v14VisibleDrafts().filter(d=>d.status==='Completed'&&!d._workingDraft);};

// Save immutable role links into every draft.
const baseDraftData=draftData;
draftData=function(){
  const d=baseDraftData();const s=v14SessionData(),id=currentIdentity();
  if(s.role==='Typist'){
    const a=advocateByMobile(s.advocateMobile)||advocateByName(s.advocateName)||advocateByName(d.advocate?.name);
    d.ownerAdvocate=a?.name||s.advocateName||d.ownerAdvocate||d.advocate?.name||'';
    d.ownerAdvocateMobile=mobile10(a?.mobile||s.advocateMobile||d.ownerAdvocateMobile||d.advocate?.mobile||'');
    d.createdBy=id.name||s.name||'';d.createdByMobile=id.mobile||mobile10(s.mobile);d.assignedTypist=d.createdBy;d.createdByRole='Typist';
  }else if(s.role==='Advocate'){
    const a=advocateByMobile(id.mobile)||advocateByName(id.name);
    d.ownerAdvocate=a?.name||id.name||d.ownerAdvocate||'';d.ownerAdvocateMobile=mobile10(a?.mobile||id.mobile||d.ownerAdvocateMobile||'');
    d.createdBy=d.createdBy||id.name;d.createdByMobile=d.createdByMobile||id.mobile;d.createdByRole=d.createdByRole||'Advocate';
  }
  return d;
};

const baseSetWorking=window.v114SetWorkingAdvocate;
window.v114SetWorkingAdvocate=function(name){
  const a=advocateByName(name);const s=v14SessionData();
  if(s.role!=='Typist')return;
  v14Session={...s,advocateName:a?.name||name,advocateMobile:mobile10(a?.mobile||'')};v14WriteJSON('registryProSession',v14Session);
  try{toast(`Drafts for Advocate: ${v14Session.advocateName||'-'}`);}catch(_){}
};

// Role switch keeps Mine profile identity when relevant.
window.v115SelectWorkMode=function(mode){
  const old=v14SessionData(),u=v114CurrentUser?.(),p=profile();
  if(mode==='Typist'){
    const id=p.roleType==='Typist'?p:{name:u?.name||old.name,mobile:u?.mobile||old.mobile};
    v14Session={...old,role:'Typist',workMode:'Typist',name:id.name||'Typist',mobile:mobile10(id.mobile),allowedRoles:u?.roles||old.allowedRoles};
    if(!v14Session.advocateName){const a=getAdvocates()[0];v14Session.advocateName=a?.name||'';v14Session.advocateMobile=mobile10(a?.mobile||'');}
  }else{
    const id=p.roleType==='Advocate'?p:{name:u?.name||old.name,mobile:u?.mobile||old.mobile};
    v14Session={...old,role:'Advocate',workMode:'AdvocateStaff',name:id.name||'Advocate',mobile:mobile10(id.mobile),advocateName:id.name||'Advocate',advocateMobile:mobile10(id.mobile),allowedRoles:u?.roles||old.allowedRoles};
  }
  v14WriteJSON('registryProSession',v14Session);localStorage.setItem('registryProWorkModeV115',mode);
  refreshDashboard();try{v115SyncRoleUI();}catch(_){};toast(`Work mode: ${mode==='Typist'?'Typist':'Advocate / Staff'}`);
};

// Hide the v1.16 extra advocate search block from Dashboard; keep only work-mode + working advocate dropdown.
function cleanDashboardAdvocatePanel(){const p=document.getElementById('v116AdvocatePanel');if(p)p.remove();const role=document.querySelector('#dashboardView .v114-role-switch.v115-role-switch');if(role)role.style.display='none';const s=document.getElementById('v114WorkingAdvocate');if(s)s.hidden=true;}
const roleSyncBase=window.v115SyncRoleUI;
window.v115SyncRoleUI=function(){try{roleSyncBase?.apply(this,arguments);}catch(_){}setTimeout(()=>{cleanDashboardAdvocatePanel();const id=currentIdentity(),box=document.getElementById('v18AdvocateName'),small=document.querySelector('#dashboardView .v18-profile small');if(box)box.textContent=id.name||'Registry Pro User';if(small)small.textContent=v14SessionData().role==='Typist'?'Typist':'Advocate';},0);};

// ----- Advocate drawer management -----
openAdvocatesHome=function(){v117RenderAdvocatesHome();};
window.v117RenderAdvocatesHome=function(){
  const all=getAdvocates(),id=currentIdentity();const arr=v14SessionData().role==='Advocate'?all.filter(a=>mobile10(a.mobile)===id.mobile||(!a.mobile&&lc(a.name)===lc(id.name))):all;
  openSimpleManagement('Advocates',`<div class="v117-adv-toolbar"><button class="btn primary" onclick="v117OpenAdvocateForm()">＋ Add Advocate</button><span>${arr.length} Saved</span></div><div class="v117-card v117-adv-list-card"><div class="v117-section-head"><h3>Saved Advocates</h3><span>${arr.length}</span></div><div class="v117-adv-list">${arr.map(a=>v117AdvocateRow(a)).join('')||'<div class="empty-party-records">No advocates added.</div>'}</div></div>`);
};
window.v117OpenAdvocateForm=function(mobile=''){
  const a=mobile?advocateByMobile(mobile):null;
  openSimpleManagement(a?'Update Advocate':'Add Advocate',`<div class="v117-card v117-adv-edit-card"><div class="form-grid five v117-adv-form"><div><label>Advocate Name</label><input id="v117AdvName" data-no-hindi="true" placeholder="Advocate name" value="${e117(a?.name||'')}"></div><div><label>Tehsil / Compound</label><input id="v117AdvCompound" data-no-hindi="true" placeholder="Roorkee / Bhagwanpur" value="${e117(a?.compound||a?.tehsilCompound||'')}"></div><div><label>Mobile No. <small>= Advocate ID</small></label><input id="v117AdvMobile" inputmode="numeric" maxlength="10" placeholder="10 digit mobile" value="${e117(a?.mobile||'')}"></div><div><label>Advocate Regd. / Enrollment No.</label><input id="v117AdvRegd" data-no-hindi="true" value="${e117(a?.enrollment||a?.regdNo||'')}"></div><div><label>Stamp Page</label><select id="v117AdvStamp">${Array.from({length:10},(_,i)=>`<option value="${i+1}">Page ${i+1}</option>`).join('')}<option value="none">No Stamp Space</option></select></div><div class="full v117-form-actions"><button class="btn outline" onclick="v117RenderAdvocatesHome()">← Advocates</button><button class="btn primary" onclick="v117SaveAdvocate()">Save Advocate</button></div></div></div>`);
  const st=document.getElementById('v117AdvStamp');if(st)st.value=String(a?.stampPage||'1');
};
function v117AdvocateRow(a){const own=allDrafts().filter(d=>mobile10(draftOwnerMobile(d))===mobile10(a.mobile)||(!a.mobile&&lc(draftOwnerName(d))===lc(a.name))),c=own.filter(d=>d.status==='Checking Copy').length,f=own.filter(d=>d.status==='Completed'||d.finalApproved).length;return `<div class="v117-adv-row"><div><strong>${e117(a.name)}</strong><small>${e117(a.compound||a.tehsilCompound||'-')} • ${e117(a.mobile||'-')} • ${e117(a.enrollment||a.regdNo||'-')} • Stamp ${e117(a.stampPage||'2')}</small></div><div class="v117-adv-actions"><button class="btn outline compact" onclick='v117OpenAdvocateRecordSearch(${JSON.stringify(mobile10(a.mobile))},${JSON.stringify(a.name)},"copy")'>Copy <b>${c}</b></button><button class="btn primary compact" onclick='v117OpenAdvocateRecordSearch(${JSON.stringify(mobile10(a.mobile))},${JSON.stringify(a.name)},"final")'>Final <b>${f}</b></button></div></div>`;}
window.v117SaveAdvocate=function(){
  const name=val('v117AdvName').trim(),compound=val('v117AdvCompound').trim(),mobile=mobile10(val('v117AdvMobile')),enrollment=val('v117AdvRegd').trim(),stampPage=val('v117AdvStamp')||'2';
  if(!name){toast('Advocate Name required');return;}if(mobile.length!==10){toast('Advocate ka valid 10 digit mobile required hai');return;}
  const arr=getAdvocates();let a=arr.find(x=>mobile10(x.mobile)===mobile)||arr.find(x=>lc(x.name)===lc(name));const data={name,compound,tehsilCompound:compound,mobile,enrollment,regdNo:enrollment,stampPage};
  if(a)Object.assign(a,data);else arr.push(data);v14WriteJSON('registryProAdvocates',arr);refreshAdvocateSelects?.();try{v113RememberParty?.({name,mobile},'advocate');}catch(_){}v117RenderAdvocatesHome();toast('Advocate saved');
};

// ----- Advocate Final / Copy search -----
window.v117OpenAdvocateRecordSearch=function(mobile,name,docType='final'){
  advSearchState={mobile:mobile10(mobile),name:name||advocateByMobile(mobile)?.name||'',docType,criterion:'draftNo',q:''};v117RenderAdvSearch();
};
function advScopeDrafts(){return v14VisibleDrafts().filter(d=>{const m=draftOwnerMobile(d);return advSearchState.mobile?m===advSearchState.mobile:lc(draftOwnerName(d))===lc(advSearchState.name);}).filter(d=>advSearchState.docType==='final'?(d.status==='Completed'||d.finalApproved):d.status==='Checking Copy');}
function criterionValue(d,k){if(k==='draftNo')return d.registryNo||d.draftNumber||'';if(k==='seller')return partyNames(d.sellers,d.seller);if(k==='buyer')return partyNames(d.buyers,d.buyer);if(k==='khasra')return khasra(d);if(k==='date')return d.registration?.date||v14DateOnly(d)||'';return '';}
window.v117SetAdvCriterion=function(k){advSearchState.criterion=k;advSearchState.q='';v117RenderAdvSearch();};
window.v117SetAdvQuery=function(v){advSearchState.q=v||'';v117RenderAdvResults();};
function v117RenderAdvSearch(){
  const isDate=advSearchState.criterion==='date';
  openSimpleManagement(`${advSearchState.name} — ${advSearchState.docType==='final'?'Final Draft':'Checking Copy'}`,`<div class="v117-searchbar"><label>Search By<select id="v117AdvCriterion" onchange="v117SetAdvCriterion(this.value)"><option value="draftNo">Draft No.</option><option value="seller">Seller</option><option value="buyer">Buyer</option><option value="khasra">Khasra</option><option value="date">Date Wise</option></select></label><label>Search<input id="v117AdvQuery" ${isDate?'type="date"':'type="text"'} placeholder="${isDate?'Select date':'Search '+advSearchState.criterion}" oninput="v117SetAdvQuery(this.value)" onchange="v117SetAdvQuery(this.value)"></label><button class="btn primary" onclick="v117RenderAdvResults()">Search</button></div><div id="v117AdvResults"></div>`);
  document.getElementById('v117AdvCriterion').value=advSearchState.criterion;v117RenderAdvResults();
}
window.v117RenderAdvResults=function(){
  const box=document.getElementById('v117AdvResults');if(!box)return;const q=lc(advSearchState.q);let rows=advScopeDrafts().filter(d=>!q||lc(criterionValue(d,advSearchState.criterion)).includes(q));
  box.innerHTML=rows.length?`<div class="v117-result-list">${rows.map(d=>`<div class="v117-result-row"><div><strong>${e117(d.registryNo||'Draft')}</strong><small>${e117(d.village||'-')} • Seller: ${e117(partyNames(d.sellers,d.seller)||'-')} • Buyer: ${e117(partyNames(d.buyers,d.buyer)||'-')} • Khasra ${e117(khasra(d)||'-')} • ${e117(v14DateOnly(d)||'-')}</small></div><div class="v117-result-actions"><button onclick="v117SendDraftWhatsApp('${e117(d.registryNo)}')">Send PDF</button><button onclick="v117PrintDraft('${e117(d.registryNo)}')">Print Draft</button><button onclick="v116CloneDraft('${e117(d.registryNo)}')">New Draft</button><button onclick="createNextSaleFromDraft('${e117(d.registryNo)}')">Buyer Convert Seller</button></div></div>`).join('')}</div>`:'<div class="empty-party-records">No matching draft.</div>';
};
window.v117PrintDraft=function(no){openSavedRegistry(no);setTimeout(()=>{try{goDraftStep(5);syncDraftPreview();window.print();}catch(_){window.print();}},450);};
window.v117SendDraftWhatsApp=function(no){
  const d=draftByNo(no),a=advocateForDraft(d),m=mobile10(a?.mobile||draftOwnerMobile(d));if(!d)return;if(!m){toast('Advocate mobile saved nahi hai');return;}
  const msg=encodeURIComponent(`Registry Pro Draft ${d.registryNo||''}\n${d.registryType||''}\nVillage: ${d.village||'-'}\nSeller: ${partyNames(d.sellers,d.seller)||'-'}\nBuyer: ${partyNames(d.buyers,d.buyer)||'-'}\nPDF share/attach from Registry Pro.`);window.open(`https://wa.me/91${m}?text=${msg}`,'_blank');
};

// ----- Mine / My Profile -----
openMineHome=function(){
  const p=profile(),s=v14SessionData(),c=currentJurisdiction?.()||{};const role=p.roleType||s.role||'Typist';
  openSimpleManagement('Mine — My Profile',`<div class="v117-card"><div class="form-grid four"><div><label>Name</label><input id="mineName" value="${e117(p.name||s.name||'')}"></div><div><label>Address</label><input id="mineAddress" value="${e117(p.address||'')}"></div><div><label>Mobile Number</label><input id="mineMobile" inputmode="numeric" maxlength="10" value="${e117(p.mobile||s.mobile||'')}" oninput="v117MineIdentityLookup()"></div><div><label>Role Type</label><select id="mineRole" onchange="v117MineRoleChanged()"><option value="Typist">Typist</option><option value="Advocate">Advocate</option></select></div><div><label>State</label><select id="mineState" onchange="v117MineStateChanged()"></select></div><div><label>District</label><select id="mineDistrict" onchange="v117MineDistrictChanged()"></select></div><div><label>Tehsil</label><select id="mineTehsil"></select></div><div><label>PIN Code</label><input id="minePin" inputmode="numeric" maxlength="6" value="${e117(p.pin||'')}"></div><div id="mineCourtWrap"><label>Court / Compound Name</label><input id="mineCourt" value="${e117(p.courtName||p.compound||'')}"></div><div id="mineRegWrap"><label>Advocate Regd. No.</label><input id="mineRegd" value="${e117(p.regdNo||'')}"></div><div class="full"><button class="btn primary" onclick="v117SaveMine()">Save Profile</button></div></div></div>`);
  v117FillMineGeo(p.state||c.state||'Uttarakhand',p.district||c.district||'Haridwar',p.tehsil||c.tehsil||'Roorkee');document.getElementById('mineRole').value=role==='Advocate'?'Advocate':'Typist';v117MineRoleChanged();
};
window.v117MineRoleChanged=function(){const yes=val('mineRole')==='Advocate';['mineCourtWrap','mineRegWrap'].forEach(id=>{const e=document.getElementById(id);if(e)e.hidden=!yes;});};
window.v117FillMineGeo=function(st,di,te){const se=document.getElementById('mineState'),de=document.getElementById('mineDistrict'),tt=document.getElementById('mineTehsil');if(!se||!de||!tt)return;const states=Object.keys(V114_ADMIN_UNITS||{});se.innerHTML=states.map(x=>`<option>${e117(x)}</option>`).join('');se.value=states.includes(st)?st:states[0];const ds=Object.keys(V114_ADMIN_UNITS[se.value]||{});de.innerHTML=ds.map(x=>`<option>${e117(x)}</option>`).join('');de.value=ds.includes(di)?di:ds[0]||'';const ts=V114_ADMIN_UNITS[se.value]?.[de.value]||[];tt.innerHTML=ts.map(x=>`<option>${e117(x)}</option>`).join('');tt.value=ts.includes(te)?te:ts[0]||'';};
window.v117MineStateChanged=function(){v117FillMineGeo(val('mineState'),'','');};window.v117MineDistrictChanged=function(){v117FillMineGeo(val('mineState'),val('mineDistrict'),'');};
window.v117MineIdentityLookup=function(){
  const m=mobile10(val('mineMobile'));if(m.length!==10)return;let p=profileByMobile(m);
  if(!p){try{const x=v113FindPartyByIdentity?.('',m);if(x)p={name:x.name||'',address:x.address||'',mobile:m};}catch(_){}}
  if(!p)return;
  const set=(id,v)=>{const e=document.getElementById(id);if(e&&String(v??'').trim()!=='')e.value=v;};
  set('mineName',p.name);set('mineAddress',p.address);set('minePin',p.pin);set('mineCourt',p.courtName||p.compound);set('mineRegd',p.regdNo||p.enrollment);
  if(p.roleType){set('mineRole',p.roleType==='Advocate'?'Advocate':'Typist');v117MineRoleChanged();}
  v117FillMineGeo(p.state||val('mineState')||'Uttarakhand',p.district||val('mineDistrict')||'',p.tehsil||val('mineTehsil')||'');
  try{toast(`Profile auto-filled: ${p.name||m}`);}catch(_){}
};
window.v117SaveMine=function(){
  const p={name:val('mineName').trim(),address:val('mineAddress').trim(),mobile:mobile10(val('mineMobile')),roleType:val('mineRole'),state:val('mineState'),district:val('mineDistrict'),tehsil:val('mineTehsil'),pin:digits(val('minePin')).slice(0,6),courtName:val('mineCourt').trim(),regdNo:val('mineRegd').trim()};
  if(!p.name||p.mobile.length!==10){toast('Name aur valid 10 digit mobile required');return;}saveProfile(p);rememberProfileIdentity(p);v14WriteJSON('registryProJurisdiction',{state:p.state,district:p.district,tehsil:p.tehsil});
  if(p.roleType==='Advocate'){
    let arr=getAdvocates(),a=arr.find(x=>mobile10(x.mobile)===p.mobile);const data={name:p.name,mobile:p.mobile,compound:p.courtName,tehsilCompound:p.courtName,enrollment:p.regdNo,regdNo:p.regdNo,stampPage:a?.stampPage||'2'};if(a)Object.assign(a,data);else arr.push(data);v14WriteJSON('registryProAdvocates',arr);refreshAdvocateSelects?.();
    v14Session={...v14SessionData(),role:'Advocate',workMode:'AdvocateStaff',name:p.name,mobile:p.mobile,advocateName:p.name,advocateMobile:p.mobile};v14WriteJSON('registryProSession',v14Session);showDashboard();refreshDashboard();toast('Advocate profile saved');
  }else{
    v14Session={...v14SessionData(),role:'Typist',workMode:'Typist',name:p.name,mobile:p.mobile};v14WriteJSON('registryProSession',v14Session);showDashboard();refreshDashboard();toast('Typist profile saved');
  }
};

// ----- Advocate dashboard: 7 cards + draft list + registration final -----
function currentAdvocateDrafts(){return v14VisibleDrafts();}
function monthKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
function filterAdvDash(kind){const a=currentAdvocateDrafts(),t=today(),now=new Date(),m=monthKey(now),prev=monthKey(new Date(now.getFullYear(),now.getMonth()-1,1));if(kind==='today')return a.filter(d=>v14DateOnly(d)===t);if(kind==='month')return a.filter(d=>v14DateOnly(d).startsWith(m));if(kind==='last')return a.filter(d=>v14DateOnly(d).startsWith(prev));if(kind==='pending')return a.filter(d=>d.status==='Checking Copy');if(kind==='final')return a.filter(d=>d.status==='Completed'||d.finalApproved);return a;}
function installAdvocateCards(){
  const grid=document.querySelector('#dashboardView .v18-stats-grid');if(!grid)return;const adv=v14SessionData().role==='Advocate';
  grid.querySelectorAll('.v117-mutation-card').forEach(x=>x.remove());const cards=[...grid.querySelectorAll('.v18-stat-card')];
  if(adv){const kinds=['today','month','last','pending','final'];cards.forEach((b,i)=>{b.onclick=()=>v117OpenAdvocateDashboardList(kinds[i]);});grid.insertAdjacentHTML('beforeend','<button class="v18-stat-card teal v117-mutation-card" onclick="v117OpenMutationList(false)"><span>↻</span><small>Total Mutation File</small><strong id="statMutationTotal">0</strong></button><button class="v18-stat-card green v117-mutation-card" onclick="v117OpenMutationList(true)"><span>✓</span><small>Final Mutation</small><strong id="statMutationFinal">0</strong></button>');}
  else cards.forEach(b=>b.onclick=openSavedDrafts);
}
window.v117OpenAdvocateDashboardList=function(kind){
  const rows=filterAdvDash(kind),labels={today:'Today Drafts',month:'This Month Drafts',last:'Last Month Drafts',pending:'Pending / Checking',final:'Final Drafts'};
  openSimpleManagement(labels[kind]||'Drafts',`<div class="v117-table-wrap"><table class="v117-table"><thead><tr><th>S.No.</th><th>Village</th><th>Buyer</th><th>Khasra No.</th><th>Area</th><th>Draft No.</th><th>Date</th><th>Final</th></tr></thead><tbody>${rows.map((d,i)=>`<tr><td>${i+1}</td><td>${e117(d.village||'-')}</td><td>${e117(partyNames(d.buyers,d.buyer)||'-')}</td><td>${e117(khasra(d)||'-')}</td><td>${e117(area(d)||'-')}</td><td>${e117(d.registryNo||'-')}</td><td>${e117(v14DateOnly(d)||'-')}</td><td>${d.registrationFinal?'<span class="v117-green-tick">✓ Registered</span>':`<button class="btn primary compact" onclick="v117OpenRegistrationFinal('${e117(d.registryNo)}')">Final</button>`}</td></tr>`).join('')||'<tr><td colspan="8">No drafts.</td></tr>'}</tbody></table></div>`);
};
window.v117OpenRegistrationFinal=function(no){const d=draftByNo(no);if(!d)return;if(!(d.status==='Completed'||d.finalApproved)){toast('Typist ki Final Draft banne ke baad registry final karein');return;}openSimpleManagement('Finalize Registry',`<div class="v117-card"><h3>${e117(no)}</h3><div class="form-grid four"><div><label>Registry / Registration No.</label><input id="v117RegNo" value="${e117(d.registration?.regNo||'')}"></div><div><label>Date</label><input id="v117RegDate" type="date" value="${e117(d.registration?.date||today())}"></div><div><label>Jild No.</label><input id="v117Jild" value="${e117(d.registration?.jildNo||'')}"></div><div><label>Book / Page (optional)</label><input id="v117BookPage" value="${e117(d.registration?.bookPage||'')}"></div><div class="full"><button class="btn primary" onclick="v117SaveRegistrationFinal('${e117(no)}')">Final Registry</button></div></div></div>`);};
window.v117SaveRegistrationFinal=function(no){const regNo=val('v117RegNo').trim(),date=val('v117RegDate')||today();if(!regNo){toast('Registry No. required');return;}const a=allDrafts(),i=a.findIndex(d=>d.registryNo===no);if(i<0)return;a[i].registration={regNo,date,jildNo:val('v117Jild').trim(),bookPage:val('v117BookPage').trim(),finalizedAt:new Date().toISOString()};a[i].registrationFinal=true;saveDrafts(a);openSimpleManagement('Registry Final',`<div class="v117-success"><div class="v117-green-tick big">✓</div><h2>Registry Final</h2><p>${e117(no)} • Registry No. ${e117(regNo)}</p><div class="draft-actions"><button class="btn primary" onclick="v117SendMutation('${e117(no)}')">Send Mutation</button><button class="btn outline" onclick="showDashboard()">Not Now</button></div></div>`);refreshDashboard();};

// ----- Mutation / 45 day reminder / buyer OTP -----
function mutations(){return read(MUTATION_KEY,[]);}function saveMutations(a){write(MUTATION_KEY,a);}
window.v117SendMutation=function(no){const d=draftByNo(no);if(!d)return;let a=mutations(),r=a.find(x=>x.draftNo===no);if(!r){const b=buyerPrimary(d),md=today();r={id:'M'+Date.now(),draftNo:no,advocateMobile:draftOwnerMobile(d),advocateName:draftOwnerName(d),village:d.village||'',buyer:{name:b.name||'',mobile:mobile10(b.mobile),aadhaar:b.aadhaar||'',address:b.address||''},khasra:khasra(d),area:area(d),mutationDate:md,finalMutationDate:plusDays(md,45),otpStatus:'not-sent',otpVerified:false,createdAt:new Date().toISOString()};a.unshift(r);saveMutations(a);}toast(`Mutation sent. Final Mutation Date: ${r.finalMutationDate}`);v117OpenMutationList(false);refreshDashboard();};
function myMutations(){const id=currentIdentity();return mutations().filter(r=>{if(v14SessionData().role==='Advocate'){if(r.advocateMobile&&id.mobile)return mobile10(r.advocateMobile)===id.mobile;return lc(r.advocateName)===lc(id.name);}if(v14SessionData().role==='Typist'){const d=draftByNo(r.draftNo);return !!d&&v14DraftVisible(d);}return true;});}
window.v117OpenMutationList=function(finalMode=false){const rows=myMutations();openSimpleManagement(finalMode?'Final Mutation':'Total Mutation File',`<div class="v117-table-wrap"><table class="v117-table"><thead><tr><th>S.No.</th><th>Village</th><th>Buyer Details</th><th>Khasra</th><th>Area</th><th>Draft No.</th><th>Mutation Date</th><th>Final Mutation Date</th>${finalMode?'<th>OTP / Final</th>':''}</tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${e117(r.village)}</td><td><b>${e117(r.buyer?.name||'-')}</b><small>${e117(r.buyer?.mobile||'-')} • Aadhaar ${e117(r.buyer?.aadhaar||'-')} • ${e117(r.buyer?.address||'')}</small></td><td>${e117(r.khasra||'-')}</td><td>${e117(r.area||'-')}</td><td>${e117(r.draftNo)}</td><td>${e117(r.mutationDate)}</td><td>${e117(r.finalMutationDate)}${today()>=r.finalMutationDate&&!r.otpVerified?'<small class="v117-due">45-day reminder due</small>':''}</td>${finalMode?`<td>${r.otpVerified?'<span class="v117-green-tick">✓ OTP Verified</span>':r.otpStatus==='sent'?`<button class="btn primary compact" onclick="v117OpenOtpVerify('${e117(r.id)}')">OTP Verified</button>`:`<button class="btn primary compact" onclick="v117SendBuyerOtp('${e117(r.id)}')">Send OTP</button>`}</td>`:''}</tr>`).join('')||`<tr><td colspan="${finalMode?9:8}">No mutation files.</td></tr>`}</tbody></table></div>`);};
window.v117SendBuyerOtp=function(id){let a=mutations(),r=a.find(x=>x.id===id);if(!r)return;const m=mobile10(r.buyer?.mobile);if(m.length!==10){toast('Buyer ka saved mobile number nahi mila');return;}r.otp=String(Math.floor(100000+Math.random()*900000));r.otpStatus='sent';r.otpSentAt=new Date().toISOString();saveMutations(a);openSimpleManagement('Buyer OTP Sent',`<div class="v117-card"><h3>${e117(r.buyer.name||'Buyer')}</h3><p>OTP automatically buyer ke saved mobile <b>******${e117(m.slice(-4))}</b> par send hoga.</p><p class="hint">Dummy test mode OTP: <b>${e117(r.otp)}</b></p><div class="form-grid two"><div><label>Enter OTP</label><input id="v117OtpInput" inputmode="numeric" maxlength="6"></div><div><button class="btn primary" onclick="v117VerifyBuyerOtp('${e117(id)}')">Verify OTP</button></div></div></div>`);};
window.v117OpenOtpVerify=function(id){const r=mutations().find(x=>x.id===id);if(!r)return;openSimpleManagement('Verify Buyer OTP',`<div class="v117-card"><p>Buyer: <b>${e117(r.buyer?.name||'-')}</b> • Mobile ending ${e117(mobile10(r.buyer?.mobile).slice(-4))}</p><p class="hint">Dummy test OTP: <b>${e117(r.otp||'-')}</b></p><input id="v117OtpInput" inputmode="numeric" maxlength="6" placeholder="6 digit OTP"><button class="btn primary" onclick="v117VerifyBuyerOtp('${e117(id)}')">Verify OTP</button></div>`);};
window.v117VerifyBuyerOtp=function(id){let a=mutations(),r=a.find(x=>x.id===id);if(!r)return;if(val('v117OtpInput')!==String(r.otp||'')){toast('OTP match nahi hua');return;}r.otpVerified=true;r.otpStatus='verified';r.otpVerifiedAt=new Date().toISOString();r.finalCompletedDate=today();delete r.otp;saveMutations(a);toast('OTP Verified — Final Mutation complete');v117OpenMutationList(true);refreshDashboard();};
function ensureMutationReminders(){const due=myMutations().filter(r=>!r.otpVerified&&r.finalMutationDate&&today()>=r.finalMutationDate),rem=read('registryProReminders',[]);let changed=false;due.forEach(r=>{const key='MUT:'+r.id;if(!rem.some(x=>x.key===key)){rem.push({key,title:`Mutation due — ${r.draftNo}`,date:r.finalMutationDate,note:`45 days complete. Buyer ${r.buyer?.name||''}, ${r.village||''}, Khasra ${r.khasra||''}`,done:false});changed=true;}});if(changed)write('registryProReminders',rem);}

// ----- Reports -----
function registrationDate(d){return d.registration?.date||v14DateOnly(d)||'';}
function registrationNo(d){return d.registration?.regNo||d.registrationNo||'-';}
function periodBounds(p){const n=new Date(),t=today(),y=n.getFullYear(),m=n.getMonth();if(p==='today')return [t,t];if(p==='month')return [`${y}-${String(m+1).padStart(2,'0')}-01`,t];if(p==='lastMonth'){const d=new Date(y,m-1,1),yy=d.getFullYear(),mm=d.getMonth();return [`${yy}-${String(mm+1).padStart(2,'0')}-01`,new Date(yy,mm+1,0).toISOString().slice(0,10)];}if(p==='year')return [`${y}-01-01`,t];if(p==='lastYear')return [`${y-1}-01-01`,`${y-1}-12-31`];if(p==='fy'){const sy=m<3?y-1:y;return [`${sy}-04-01`,`${sy+1}-03-31`];}return ['0000-00-00','9999-99-99'];}
function advFinalRegistries(a){return allDrafts().filter(d=>{const match=mobile10(a.mobile)?draftOwnerMobile(d)===mobile10(a.mobile):lc(draftOwnerName(d))===lc(a.name);return match&&d.registrationFinal;});}
openReportsHome=function(){
  const visible=v14VisibleDrafts(),done=visible.filter(d=>d.status==='Completed'||d.finalApproved),registered=visible.filter(d=>d.registrationFinal),by={};registered.forEach(d=>{const a=advocateForDraft(d)||{name:draftOwnerName(d),mobile:draftOwnerMobile(d)};const k=mobile10(a.mobile)||lc(a.name);if(!by[k])by[k]={a,count:0};by[k].count++;});
  openSimpleManagement('Reports',`<div class="report-mini-grid v117-report-grid"><div><small>Total Drafts</small><strong>${visible.length}</strong></div><div><small>Final Drafts</small><strong>${done.length}</strong></div><div><small>Advocates</small><strong>${Object.keys(by).length}</strong></div><button class="v117-report-card" onclick="openPropertiesHome()"><small>Property Holdings</small><strong>${typeof v15PropertyMaster==='function'?v15PropertyMaster().length:0}</strong></button><button class="v117-report-card typist" onclick="v117OpenTypistReportPicker()"><small>Typist Report</small><strong>Search</strong></button></div><h3>Advocate-wise Registry Count</h3><div class="v117-table-wrap"><table class="v117-table"><thead><tr><th>Advocate</th><th>Completed Registries</th></tr></thead><tbody>${Object.values(by).map(x=>`<tr class="v117-click-row" onclick='v117OpenAdvocateReport(${JSON.stringify(mobile10(x.a.mobile))},${JSON.stringify(x.a.name||'')})'><td>${e117(x.a.name||'-')}</td><td>${x.count}</td></tr>`).join('')||'<tr><td colspan="2">No data.</td></tr>'}</tbody></table></div>`);
};
window.v117OpenAdvocateReport=function(mobile,name){const a=advocateByMobile(mobile)||advocateByName(name)||{mobile,name};window.v117AdvReport={mobile:mobile10(a.mobile),name:a.name||name,period:'total'};v117RenderAdvReport();};
window.v117SetAdvReportPeriod=function(p){v117AdvReport.period=p;v117RenderAdvReport();};
function currentAdvReportRows(){const a=advocateByMobile(v117AdvReport.mobile)||{mobile:v117AdvReport.mobile,name:v117AdvReport.name},[from,to]=periodBounds(v117AdvReport.period);return advFinalRegistries(a).filter(d=>{const x=registrationDate(d);return x>=from&&x<=to;});}
window.v117RenderAdvReport=function(){const rows=currentAdvReportRows(),s=v117AdvReport;openSimpleManagement(`${s.name} — Registry Report`,`<div class="v117-periods"><button onclick="v117SetAdvReportPeriod('today')">Today</button><button onclick="v117SetAdvReportPeriod('month')">This Month</button><button onclick="v117SetAdvReportPeriod('year')">This Year</button><button onclick="v117SetAdvReportPeriod('lastYear')">Last Year</button><button onclick="v117SetAdvReportPeriod('total')">Total</button></div><div class="report-print-bar"><button class="btn outline" onclick="v117SendAdvReportWhatsApp()">Send PDF</button><button class="btn primary" onclick="v117PrintAdvReport()">Print Report</button></div><div id="v117AdvReportPrint">${v117AdvReportTable(rows,s.name)}</div>`);};
function v117AdvReportTable(rows,name){return `<h2>${e117(name)} — Registry Report</h2><table class="v117-table"><thead><tr><th>S.No.</th><th>Deed</th><th>Village</th><th>Seller</th><th>Buyer</th><th>Khasra No.</th><th>Area</th><th>Draft No.</th><th>Registry No.</th><th>Date</th></tr></thead><tbody>${rows.map((d,i)=>`<tr><td>${i+1}</td><td>${e117(d.registryType||'-')}</td><td>${e117(d.village||'-')}</td><td>${e117(partyNames(d.sellers,d.seller)||'-')}</td><td>${e117(partyNames(d.buyers,d.buyer)||'-')}</td><td>${e117(khasra(d)||'-')}</td><td>${e117(area(d)||'-')}</td><td>${e117(d.registryNo||'-')}</td><td>${e117(registrationNo(d))}</td><td>${e117(registrationDate(d)||'-')}</td></tr>`).join('')||'<tr><td colspan="10">No records.</td></tr>'}</tbody></table>`;}
window.v117PrintAdvReport=function(){v117PrintHtml(`${v117AdvReport.name} Registry Report`,document.getElementById('v117AdvReportPrint')?.innerHTML||'');};
window.v117SendAdvReportWhatsApp=function(){const a=advocateByMobile(v117AdvReport.mobile);if(!a?.mobile){toast('Advocate mobile missing');return;}const msg=encodeURIComponent(`Registry Pro — ${a.name} registry report (${v117AdvReport.period}). Total ${currentAdvReportRows().length}. PDF can be printed/shared from Registry Pro.`);window.open(`https://wa.me/91${mobile10(a.mobile)}?text=${msg}`,'_blank');};
window.v117OpenTypistReportPicker=function(){openSimpleManagement('Typist Report',`<div class="v117-card"><label>Period<select id="v117TypistPeriod" onchange="v117TypistPeriodChanged()"><option value="today">Today</option><option value="month">This Month</option><option value="lastMonth">Last Month</option><option value="fy">Financial Year</option><option value="range">Select Date Range</option></select></label><div id="v117TypistRange" class="form-grid two" hidden><div><label>From</label><input id="v117TypistFrom" type="date"></div><div><label>To</label><input id="v117TypistTo" type="date"></div></div><button class="btn primary" onclick="v117OpenTypistReport()">Open PDF / Print</button></div>`);};
window.v117TypistPeriodChanged=function(){const e=document.getElementById('v117TypistRange');if(e)e.hidden=val('v117TypistPeriod')!=='range';};
window.v117OpenTypistReport=function(){const p=val('v117TypistPeriod');let from,to;if(p==='range'){from=val('v117TypistFrom');to=val('v117TypistTo');if(!from||!to){toast('From aur To date select karein');return;}}else [from,to]=periodBounds(p);const rows=v14VisibleDrafts().filter(d=>{const x=v14DateOnly(d);return x>=from&&x<=to;});const html=`<h2>Typist Draft Report</h2><p>${e117(from)} to ${e117(to)} • Total ${rows.length}</p><table class="v117-table"><thead><tr><th>S.No.</th><th>Deed</th><th>Village</th><th>Seller</th><th>Buyer</th><th>Khasra No.</th><th>Area</th><th>Draft No.</th><th>Advocate Name</th><th>Date</th></tr></thead><tbody>${rows.map((d,i)=>`<tr><td>${i+1}</td><td>${e117(d.registryType||'-')}</td><td>${e117(d.village||'-')}</td><td>${e117(partyNames(d.sellers,d.seller)||'-')}</td><td>${e117(partyNames(d.buyers,d.buyer)||'-')}</td><td>${e117(khasra(d)||'-')}</td><td>${e117(area(d)||'-')}</td><td>${e117(d.registryNo||'-')}</td><td>${e117(draftOwnerName(d)||'-')}</td><td>${e117(v14DateOnly(d)||'-')}</td></tr>`).join('')}</tbody></table>`;v117PrintHtml('Typist Report',html);};
window.v117PrintHtml=function(title,html){const w=window.open('','_blank');if(!w){toast('Popup blocked. Browser me popups allow karein.');return;}w.document.write(`<!doctype html><html><head><title>${e117(title)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h2{text-align:center}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #555;padding:6px;text-align:left}th{background:#eee}@page{size:A4 landscape;margin:12mm}</style></head><body>${html}<script>setTimeout(()=>window.print(),150)<\/script></body></html>`);w.document.close();};

// ----- Property: Add / Minus + name-only party display -----
const basePropertyBalance=typeof v15PropertyBalance==='function'?v15PropertyBalance:null;
if(basePropertyBalance)v15PropertyBalance=function(h){const x=basePropertyBalance(h);const minus=Number(h.manualMinusHa||0);return {...x,manualMinusHa:minus,balanceHa:x.balanceHa-minus};};
function knownParties(){try{return v113AllKnownParties();}catch(_){return [];}}
openPropertiesHome=function(){v117RenderPropertyHome();};
window.v117RenderPropertyHome=function(){const parties=knownParties(),holds=typeof v15PropertyMaster==='function'?v15PropertyMaster():[];openSimpleManagement('Property',`<div class="v117-card"><h3>Add / Minus Property</h3><div class="form-grid four"><div><label>Name</label><select id="v117PropParty" onchange="v117PropPartyChanged()"><option value="">Select Name</option>${parties.map((p,i)=>`<option value="${i}">${e117(p.name||'-')}</option>`).join('')}</select></div><div><label>Aadhaar</label><input id="v117PropAadhaar" inputmode="numeric" maxlength="12" oninput="v117PropIdentityLookup()"></div><div><label>Mobile</label><input id="v117PropMobile" inputmode="numeric" maxlength="10" oninput="v117PropIdentityLookup()"></div><div><label>Village</label><input id="v117PropVillage"></div><div><label>Khasra / Gata No.</label><input id="v117PropKhasra"></div><div><label>Area (Hectare)</label><input id="v117PropArea" type="number" min="0" step="0.0001"></div><div class="full v117-property-actions"><button class="btn primary" onclick="v117AddProperty()">+ Add Property</button><button class="btn outline" onclick="v117MinusProperty()">− Minus Property</button></div></div></div><div class="v117-card"><h3>Property Holdings</h3><div class="v117-table-wrap"><table class="v117-table"><thead><tr><th>Name</th><th>Village</th><th>Khasra / Gata</th><th>Opening / Added</th><th>Buy</th><th>Sale</th><th>Manual Minus</th><th>Remaining</th></tr></thead><tbody>${holds.map(h=>{const x=v15PropertyBalance(h);return `<tr><td>${e117(h.party?.name||'-')}</td><td>${e117(h.village||'-')}</td><td>${e117(h.khasra||'-')}</td><td>${Number(x.openingHa||0).toFixed(4)}</td><td>+${Number(x.buys||0).toFixed(4)}</td><td>-${Number(x.sells||0).toFixed(4)}</td><td>-${Number(x.manualMinusHa||0).toFixed(4)}</td><td><b>${Number(x.balanceHa||0).toFixed(4)} ha</b></td></tr>`;}).join('')||'<tr><td colspan="8">No property saved.</td></tr>'}</tbody></table></div></div>`);window.v117KnownParties=parties;};
window.v117PropPartyChanged=function(){const p=window.v117KnownParties?.[Number(val('v117PropParty'))];if(!p)return;document.getElementById('v117PropAadhaar').value=p.aadhaar||'';document.getElementById('v117PropMobile').value=p.mobile||'';};
window.v117PropIdentityLookup=function(){const a=val('v117PropAadhaar'),m=val('v117PropMobile');let p=null;try{p=v113FindPartyByIdentity(a,m);}catch(_){}if(!p)return;const list=window.v117KnownParties||[];const i=list.findIndex(x=>v113PartyKey(x)===v113PartyKey(p));if(i>=0)document.getElementById('v117PropParty').value=String(i);};
function selectedPropParty(){return window.v117KnownParties?.[Number(val('v117PropParty'))]||null;}
window.v117AddProperty=function(){const p=selectedPropParty();if(!p){toast('Name select karein');return;}const village=val('v117PropVillage').trim(),khasraNo=val('v117PropKhasra').trim(),ha=Number(val('v117PropArea')||0);if(!village||!khasraNo||ha<=0){toast('Village, Khasra aur Area required');return;}let arr=v15PropertyMaster(),key=v15PartyKey(p),h=arr.find(x=>x.partyKey===key&&lc(x.village)===lc(village)&&lc(x.khasra)===lc(khasraNo));if(h){h.openingHa=Number(h.openingHa||0)+ha;h.openingQty=Number(h.openingQty||0)+ha;}else arr.push({id:'H'+Date.now(),ownerAdvocate:v15CurrentOwner(),partyKey:key,party:{...p,name:p.name||''},village,khata:'',khasra:khasraNo,openingQty:ha,unit:'Hectare',openingHa:ha,openingDate:today(),createdAt:new Date().toISOString(),source:'Manual Add Property'});v15SavePropertyMaster(arr);v117RenderPropertyHome();toast('Property added');};
window.v117MinusProperty=function(){const p=selectedPropParty();if(!p){toast('Name select karein');return;}const village=val('v117PropVillage').trim(),khasraNo=val('v117PropKhasra').trim(),ha=Number(val('v117PropArea')||0);if(!village||!khasraNo||ha<=0){toast('Village, Khasra aur Area required');return;}let arr=v15PropertyMaster(),key=v15PartyKey(p),h=arr.find(x=>x.partyKey===key&&lc(x.village)===lc(village)&&lc(x.khasra)===lc(khasraNo));if(!h){toast('Matching property row nahi mili');return;}const bal=v15PropertyBalance(h).balanceHa;if(ha>bal+1e-9){toast(`Available ${bal.toFixed(4)} ha se zyada minus nahi kar sakte`);return;}h.manualMinusHa=Number(h.manualMinusHa||0)+ha;v15SavePropertyMaster(arr);const log=read(PROPERTY_ADJ_KEY,[]);log.unshift({date:new Date().toISOString(),type:'minus',partyKey:key,village,khasra:khasraNo,areaHa:ha});write(PROPERTY_ADJ_KEY,log.slice(0,5000));v117RenderPropertyHome();toast('Property minus saved');};

// Targeted in-app notification record when a Typist finalizes an Advocate draft.
const saveStatusBase=window.v18SaveStatus;
window.v18SaveStatus=function(status){
  const d=saveStatusBase.apply(this,arguments);
  try{
    if(status==='Completed'&&v14SessionData().role==='Typist'&&d){
      const key=`FINAL:${d.registryNo}:${draftOwnerMobile(d)}`;let n=read('registryProAdvocateNotificationsV117',[]);
      if(!n.some(x=>x.key===key)){n.unshift({key,type:'draft-final',advocateMobile:draftOwnerMobile(d),advocateName:draftOwnerName(d),draftNo:d.registryNo,title:`Final Draft ready — ${d.registryNo}`,createdAt:new Date().toISOString(),read:false});write('registryProAdvocateNotificationsV117',n.slice(0,5000));}
    }
  }catch(_){}
  return d;
};

// ----- Dashboard refresh / final UI sync -----
const refreshBase=refreshDashboard;
refreshDashboard=function(){try{refreshBase.apply(this,arguments);}catch(_){}cleanDashboardAdvocatePanel();installAdvocateCards();ensureMutationReminders();const s=v14SessionData(),arr=v14VisibleDrafts();if(s.role==='Advocate'){const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};const t=today(),m=monthKey(),prev=monthKey(new Date(new Date().getFullYear(),new Date().getMonth()-1,1));set('statTodayDrafts',arr.filter(d=>v14DateOnly(d)===t).length);set('statThisMonth',arr.filter(d=>v14DateOnly(d).startsWith(m)).length);set('statLastMonth',arr.filter(d=>v14DateOnly(d).startsWith(prev)).length);set('statPendingDrafts',arr.filter(d=>d.status==='Checking Copy').length);set('statFinalDrafts',arr.filter(d=>d.status==='Completed'||d.finalApproved).length);const ms=myMutations();set('statMutationTotal',ms.length);set('statMutationFinal',ms.filter(r=>r.otpVerified).length);}try{v115SyncRoleUI();}catch(_){}cleanDashboardAdvocatePanel();setTimeout(cleanDashboardAdvocatePanel,20);};

// Re-label profile and keep drawer complete.
const drawerBase=v18DrawerHtml;
v18DrawerHtml=function(){return drawerBase().replace('Advocate</button>','Advocates</button>');};

function init(){
  try{const p=profile();if(p?.mobile)rememberProfileIdentity(p);(v114Users?.()||[]).forEach(u=>{try{v113RememberParty?.({name:u.name||'',address:u.address||'',mobile:u.mobile||''},'account');}catch(_){}});}catch(_){}cleanDashboardAdvocatePanel();try{v18BuildDrawers();}catch(_){}refreshDashboard();
  console.info('Registry Pro v1.17.2 loaded — Mine autofill + compact dashboard + Advocate add page');
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));
})();

/* ===== Source: final.js ===== */
/* Registry Pro v1.18 — final combined property / checking / advocate PDF / party full record patch */
(function(){
'use strict';
const V118='v1.18';
const PROP_KEY='registryProPropertyMaster';
const PROP_LOG_KEY='registryProPropertyAdjustmentsV117';
const MUT_KEY='registryProMutationV117';

const E=v=>{try{return esc(String(v??''));}catch(_){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}};
const D=v=>String(v||'').replace(/\D/g,'');
const M=v=>D(v).slice(-10);
const L=v=>String(v||'').trim().toLowerCase();
const R=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x??d;}catch(_){return d;}};
const W=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const TODAY=()=>new Date().toISOString().slice(0,10);
function draftsAll(){try{return v14AllDrafts();}catch(_){return R('registryProDrafts',[]);}}
function draftNo(d){return String(d?.registryNo||d?.draftNumber||'');}
function draftByNo118(no){return draftsAll().find(d=>draftNo(d)===String(no||''));}
function partyList(d,type){try{return normalizePartyList(d?.[type+'s'],d?.[type]);}catch(_){const p=d?.[type];return p?[p]:[];}}
function partyText(d,type){return partyList(d,type).map(p=>p?.name||'').filter(Boolean).join(', ');}
function advName(d){return String(d?.ownerAdvocate||d?.advocate?.name||d?.advocateName||'').trim();}
function advMobile(d){let x=M(d?.ownerAdvocateMobile||d?.advocate?.mobile||'');if(x)return x;try{const a=getAdvocates().find(a=>L(a.name)===L(advName(d)));return M(a?.mobile);}catch(_){return '';}}
function sessionIdentity(){const s=v14SessionData?.()||{};return {role:s.role||'',name:s.name||s.advocateName||'',mobile:M(s.mobile||s.advocateMobile||'')};}
function visibleDrafts(){try{return v14VisibleDrafts();}catch(_){return draftsAll();}}
function dateOf(d){return String(d?.registration?.date||d?.savedAt||d?.updatedAt||d?.createdAt||'').slice(0,10);}
function khasraText(d){try{return v19KhasraText(d);}catch(_){return d?.khasraNo||(d?.agri?.gataRows||[]).map(x=>x.gata).filter(Boolean).join(', ')||'';}}
function areaText(d){try{return v19PropertyAreaText(d);}catch(_){const h=Number(d?.agri?.totalAreaHa||0);return h?`${h.toFixed(4)} ha`:`${Number(d?.areaM2||0).toFixed(2)} m²`;}}
function parcels(d){try{return v15DraftParcelEntries(d);}catch(_){const a=Number(d?.agri?.totalAreaHa||0);return [{khata:String(d?.khataNo||''),khasra:String(d?.khasraNo||''),areaHa:a}];}}
function partyKey118(p){const a=D(p?.aadhaar||p?.id||p?.idNo),m=M(p?.mobile);if(a.length===12)return 'A:'+a;if(m.length===10)return 'M:'+m;try{return 'K:'+v15PartyKey(p);}catch(_){return 'N:'+L(p?.name)+'|'+L(p?.father)+'|'+L(p?.address);}}
function partyMatch118(a,b){if(!a||!b)return false;const aa=D(a.aadhaar||a.id||a.idNo),ba=D(b.aadhaar||b.id||b.idNo);if(aa.length===12&&ba.length===12)return aa===ba;const am=M(a.mobile),bm=M(b.mobile);if(am.length===10&&bm.length===10)return am===bm;try{return v15PartyKey(a)===v15PartyKey(b);}catch(_){return L(a.name)===L(b.name)&&L(a.father)===L(b.father)&&L(a.address)===L(b.address);}}
function parcelMatch(holder,d,pe){return L(holder?.village)===L(d?.village)&&L(holder?.khasra)===L(pe?.khasra);}
function propertyAll(){return R(PROP_KEY,[]);}
function savePropertyAll(a){W(PROP_KEY,a.slice(-15000));}
function ownerMatches(h,d){const hn=L(h?.ownerAdvocate),dn=L(advName(d));return !hn||!dn||hn===dn;}
function registeredDraftsForHolder(h){return draftsAll().filter(d=>d?.registrationFinal&&ownerMatches(h,d));}
function manualMinus(h){return Number(h?.manualMinusHa||0);}

// Registered-only property balance. A purchase becomes holding only after Advocate marks Registry Final/Registered.
window.v118PropertyBalance=function(h){
  let buys=0,sells=0,buyCount=0,sellCount=0;
  registeredDraftsForHolder(h).forEach(d=>{
    parcels(d).forEach(pe=>{
      if(!pe?.khasra||!parcelMatch(h,d,pe))return;
      const ar=Number(pe.areaHa||0);if(ar<=0)return;
      if(partyList(d,'buyer').some(p=>partyMatch118(p,h.party))){buys+=ar;buyCount++;}
      if(partyList(d,'seller').some(p=>partyMatch118(p,h.party))){sells+=ar;sellCount++;}
    });
  });
  const opening=Number(h?.openingHa||0),minus=manualMinus(h);
  return {openingHa:opening,buys,sells,manualMinusHa:minus,balanceHa:opening+buys-sells-minus,buyCount,sellCount};
};
// Keep older validation/report functions aligned with registered-only holdings.
try{window.v15PropertyBalance=window.v118PropertyBalance;}catch(_){}

function createHolderForBuyer(d,p,pe){
  const owner=advName(d)||v15CurrentOwner?.()||'';
  return {id:'H'+Date.now()+Math.random().toString(16).slice(2),ownerAdvocate:owner,partyKey:partyKey118(p),party:{name:p?.name||'',father:p?.father||'',relation:p?.relation||'S/O',address:p?.address||'',aadhaar:D(p?.aadhaar||p?.id),mobile:M(p?.mobile),email:p?.email||''},village:d?.village||'',khata:pe?.khata||'',khasra:String(pe?.khasra||''),openingQty:0,unit:'Hectare',openingHa:0,openingDate:d?.registration?.date||TODAY(),createdAt:new Date().toISOString(),source:'Auto from Registered '+draftNo(d)};
}
window.v118SyncRegisteredHoldings=function(onlyDraftNo=''){
  let arr=propertyAll(),changed=false;
  draftsAll().filter(d=>d?.registrationFinal&&(!onlyDraftNo||draftNo(d)===String(onlyDraftNo))).forEach(d=>{
    partyList(d,'buyer').forEach(p=>parcels(d).filter(pe=>pe?.khasra&&Number(pe.areaHa)>0).forEach(pe=>{
      const found=arr.find(h=>L(h.ownerAdvocate)===L(advName(d))&&L(h.village)===L(d.village)&&L(h.khasra)===L(pe.khasra)&&partyMatch118(h.party,p));
      if(!found){arr.push(createHolderForBuyer(d,p,pe));changed=true;}
      else{
        const np={...found.party};if(!np.mobile&&p.mobile)np.mobile=M(p.mobile);if(!np.aadhaar&&(p.aadhaar||p.id))np.aadhaar=D(p.aadhaar||p.id);if(!np.name&&p.name)np.name=p.name;found.party=np;
      }
    }));
  });
  if(changed)savePropertyAll(arr);return changed;
};

// Disable older 'Completed draft = property' behavior. Property must start only after Advocate marks Registered.
try{window.v17EnsureBuyerPropertyHoldings=function(){return;};}catch(_){}

// Hook registration final so buyer property appears immediately, without waiting for mutation.
const regFinalBase=window.v117SaveRegistrationFinal;
if(typeof regFinalBase==='function')window.v117SaveRegistrationFinal=function(no){const out=regFinalBase.apply(this,arguments);try{v118SyncRegisteredHoldings(no);}catch(e){console.warn('Property sync',e);}return out;};

// -------- Property: manual party + final ledger columns/actions --------
function knownParties118(){const src=[];try{src.push(...v113AllKnownParties());}catch(_){}try{src.push(...v15PartyMasterAll());}catch(_){}const map=new Map();src.forEach(p=>{if(!p)return;const k=partyKey118(p);if(!map.has(k))map.set(k,p);});return [...map.values()];}
function holderVisible118(h){try{const owner=L(v15CurrentOwner()),ho=L(h.ownerAdvocate||owner);return !owner||!ho||owner===ho;}catch(_){return true;}}
function propertyRows118(){v118SyncRegisteredHoldings();return propertyAll().filter(holderVisible118).filter(h=>{const x=v118PropertyBalance(h);return Number(h.openingHa||0)>0||x.buys>0||x.sells>0||x.manualMinusHa>0;});}
function unitToHa(q,u,manual){q=Number(q||0);if(u==='Hectare')return q;if(u==='SqM')return q/10000;if(u==='SqFt')return q*0.09290304/10000;return Number(manual||0);}
window.v118PropertyUnitChanged=function(prefix='v118Prop'){const u=document.getElementById(prefix+'Unit')?.value,q=Number(document.getElementById(prefix+'Area')?.value||0),h=document.getElementById(prefix+'AreaHa');if(!h)return;if(u==='Hectare')h.value=q||'';else if(u==='SqM')h.value=q?String(q/10000):'';else if(u==='SqFt')h.value=q?String(q*0.09290304/10000):'';};
window.v118PropPartyChanged=function(){const s=document.getElementById('v118PropParty'),manual=s?.value==='__manual__',wrap=document.getElementById('v118ManualPartyWrap');if(wrap)wrap.hidden=!manual;const p=!manual&&s?.value!==''?window.v118KnownParties?.[Number(s.value)]:null;const a=document.getElementById('v118PropAadhaar'),m=document.getElementById('v118PropMobile');if(p){if(a)a.value=D(p.aadhaar||p.id);if(m)m.value=M(p.mobile);}else if(!manual){if(a)a.value='';if(m)m.value='';}};
window.v118PropIdentityLookup=function(){const a=D(document.getElementById('v118PropAadhaar')?.value),m=M(document.getElementById('v118PropMobile')?.value);let p=null;try{p=v113FindPartyByIdentity(a,m);}catch(_){}if(!p)return;const list=window.v118KnownParties||[],i=list.findIndex(x=>partyMatch118(x,p));const s=document.getElementById('v118PropParty');if(i>=0&&s){s.value=String(i);v118PropPartyChanged();}};
function selectedParty118(){const s=document.getElementById('v118PropParty');if(!s)return null;if(s.value==='__manual__')return {name:(document.getElementById('v118ManualName')?.value||'').trim(),aadhaar:D(document.getElementById('v118PropAadhaar')?.value),mobile:M(document.getElementById('v118PropMobile')?.value),father:(document.getElementById('v118ManualFather')?.value||'').trim(),address:(document.getElementById('v118ManualAddress')?.value||'').trim(),relation:'S/O',role:'both'};return window.v118KnownParties?.[Number(s.value)]||null;}
function rememberManualParty118(p){if(!p?.name)return;try{const arr=v15PartyMaster(),k=partyKey118(p),i=arr.findIndex(x=>partyMatch118(x,p));const x={id:i>=0?arr[i].id:'P'+Date.now(),ownerAdvocate:v15CurrentOwner(),role:'both',name:p.name,father:p.father||'',relation:p.relation||'S/O',address:p.address||'',mobile:M(p.mobile),aadhaar:D(p.aadhaar),email:p.email||'',createdAt:i>=0?arr[i].createdAt:new Date().toISOString()};if(i>=0)arr[i]={...arr[i],...x};else arr.push(x);v15SavePartyMaster(arr);try{v113RememberParty?.(x,'property');}catch(_){}}catch(e){console.warn(e);}}
window.v118AddProperty=function(){
  const p=selectedParty118();if(!p?.name){toast('Name select karein ya New Party ka naam fill karein');return;}
  const village=(document.getElementById('v118PropVillage')?.value||'').trim(),khasra=(document.getElementById('v118PropKhasra')?.value||'').trim(),qty=Number(document.getElementById('v118PropArea')?.value||0),unit=document.getElementById('v118PropUnit')?.value||'Hectare',ha=unitToHa(qty,unit,document.getElementById('v118PropAreaHa')?.value);
  if(!village||!khasra||qty<=0||ha<=0){toast('Village, Khasra, Area aur Hectare Equivalent required');return;}
  if(document.getElementById('v118PropParty')?.value==='__manual__')rememberManualParty118(p);
  let arr=propertyAll(),owner=v15CurrentOwner?.()||'',h=arr.find(x=>L(x.ownerAdvocate)===L(owner)&&L(x.village)===L(village)&&L(x.khasra)===L(khasra)&&partyMatch118(x.party,p));
  if(h){h.openingHa=Number(h.openingHa||0)+ha;h.openingQty=Number(h.openingQty||0)+qty;h.unit=unit;h.party={...h.party,...p};}
  else{h={id:'H'+Date.now(),ownerAdvocate:owner,partyKey:partyKey118(p),party:{...p,aadhaar:D(p.aadhaar),mobile:M(p.mobile)},village,khata:'',khasra,openingQty:qty,unit,openingHa:ha,openingDate:TODAY(),createdAt:new Date().toISOString(),source:'Manual Add Property'};arr.push(h);}
  h.adjustments=Array.isArray(h.adjustments)?h.adjustments:[];h.adjustments.push({type:'add',date:TODAY(),areaHa:ha,qty,unit,reason:'Manual Add Property'});savePropertyAll(arr);v118RenderPropertyHome();toast('Property added');
};
function holderById118(id){return propertyAll().find(h=>String(h.id)===String(id));}
window.v118OpenPropertyAdd=function(id){const h=holderById118(id);if(!h)return;openSimpleManagement('Add Property — '+(h.party?.name||''),`<div class="v118-card"><p><b>${E(h.village)}</b> • Khasra ${E(h.khasra)}</p><div class="form-grid four"><div><label>Area</label><input id="v118AdjArea" type="number" min="0" step="0.0001" oninput="v118PropertyUnitChanged('v118Adj')"></div><div><label>Unit</label><select id="v118AdjUnit" onchange="v118PropertyUnitChanged('v118Adj')"><option>Hectare</option><option>Bigha</option><option>SqM</option><option>SqFt</option></select></div><div><label>Hectare Equivalent</label><input id="v118AdjAreaHa" type="number" min="0" step="0.0001"></div><div><label>Date</label><input id="v118AdjDate" type="date" value="${TODAY()}"></div><div class="full"><button class="btn primary" onclick="v118SavePropertyAdd('${E(id)}')">Save Add</button> <button class="btn outline" onclick="v118RenderPropertyHome()">Back</button></div></div></div>`);};
window.v118SavePropertyAdd=function(id){let arr=propertyAll(),h=arr.find(x=>String(x.id)===String(id));if(!h)return;const qty=Number(document.getElementById('v118AdjArea')?.value||0),u=document.getElementById('v118AdjUnit')?.value||'Hectare',ha=unitToHa(qty,u,document.getElementById('v118AdjAreaHa')?.value);if(qty<=0||ha<=0){toast('Valid area required');return;}h.openingHa=Number(h.openingHa||0)+ha;h.openingQty=Number(h.openingQty||0)+qty;h.adjustments=Array.isArray(h.adjustments)?h.adjustments:[];h.adjustments.push({type:'add',date:document.getElementById('v118AdjDate')?.value||TODAY(),areaHa:ha,qty,unit:u,reason:'Additional Manual Property'});savePropertyAll(arr);v118RenderPropertyHome();toast('Property added');};
window.v118OpenPropertyMinus=function(id){const h=holderById118(id);if(!h)return;openSimpleManagement('Minus Property — '+(h.party?.name||''),`<div class="v118-card"><p><b>${E(h.village)}</b> • Khasra ${E(h.khasra)} • Remaining <b>${v118PropertyBalance(h).balanceHa.toFixed(4)} ha</b></p><div class="form-grid four"><div><label>Minus Area</label><input id="v118MinusArea" type="number" min="0" step="0.0001" oninput="v118PropertyUnitChanged('v118Minus')"></div><div><label>Unit</label><select id="v118MinusUnit" onchange="v118PropertyUnitChanged('v118Minus')"><option>Hectare</option><option>Bigha</option><option>SqM</option><option>SqFt</option></select></div><div><label>Hectare Equivalent</label><input id="v118MinusAreaHa" type="number" min="0" step="0.0001"></div><div><label>Reason</label><select id="v118MinusReason"><option>Internal Road / Colony Development</option><option>Park</option><option>Common Area</option><option>Drain</option><option>Other</option></select></div><div><label>Date</label><input id="v118MinusDate" type="date" value="${TODAY()}"></div><div class="full"><button class="btn primary" onclick="v118SavePropertyMinus('${E(id)}')">Save Minus</button> <button class="btn outline" onclick="v118RenderPropertyHome()">Back</button></div></div></div>`);};
window.v118SavePropertyMinus=function(id){let arr=propertyAll(),h=arr.find(x=>String(x.id)===String(id));if(!h)return;const qty=Number(document.getElementById('v118MinusArea')?.value||0),u=document.getElementById('v118MinusUnit')?.value||'Hectare',ha=unitToHa(qty,u,document.getElementById('v118MinusAreaHa')?.value),bal=v118PropertyBalance(h).balanceHa;if(qty<=0||ha<=0){toast('Valid minus area required');return;}if(ha>bal+1e-9){toast(`Remaining ${bal.toFixed(4)} ha se zyada minus nahi kar sakte`);return;}const reason=document.getElementById('v118MinusReason')?.value||'Other',date=document.getElementById('v118MinusDate')?.value||TODAY();h.manualMinusHa=Number(h.manualMinusHa||0)+ha;h.adjustments=Array.isArray(h.adjustments)?h.adjustments:[];h.adjustments.push({type:'minus',date,areaHa:ha,qty,unit:u,reason});const log=R(PROP_LOG_KEY,[]);log.unshift({date,type:'minus',partyKey:h.partyKey,village:h.village,khasra:h.khasra,areaHa:ha,reason,holderId:h.id});W(PROP_LOG_KEY,log.slice(0,10000));savePropertyAll(arr);v118RenderPropertyHome();toast('Property minus saved');};
function historyEvents118(h){const ev=[];(h.adjustments||[]).forEach(x=>ev.push({...x,source:'Manual'}));registeredDraftsForHolder(h).forEach(d=>parcels(d).forEach(pe=>{if(!parcelMatch(h,d,pe))return;const ar=Number(pe.areaHa||0);if(partyList(d,'buyer').some(p=>partyMatch118(p,h.party)))ev.push({type:'buy',date:d.registration?.date||dateOf(d),areaHa:ar,reason:'Registered Buy',draftNo:draftNo(d),regNo:d.registration?.regNo||''});if(partyList(d,'seller').some(p=>partyMatch118(p,h.party)))ev.push({type:'sale',date:d.registration?.date||dateOf(d),areaHa:ar,reason:'Registered Sale',draftNo:draftNo(d),regNo:d.registration?.regNo||''});}));return ev.sort((a,b)=>String(a.date).localeCompare(String(b.date)));}
window.v118OpenPropertyHistory=function(id){const h=holderById118(id);if(!h)return;const ev=historyEvents118(h);let bal=0;const rows=ev.map((x,i)=>{bal+=x.type==='add'||x.type==='buy'?Number(x.areaHa||0):-Number(x.areaHa||0);return `<tr><td>${i+1}</td><td>${E(x.date||'-')}</td><td>${E(x.type)}</td><td>${Number(x.areaHa||0).toFixed(4)} ha</td><td>${E(x.reason||'-')}</td><td>${E(x.draftNo||'-')}</td><td>${E(x.regNo||'-')}</td><td>${bal.toFixed(4)} ha</td></tr>`;}).join('');openSimpleManagement('Property History — '+(h.party?.name||''),`<div class="v118-toolbar"><button class="btn outline" onclick="v118RenderPropertyHome()">← Property</button></div><div class="v117-table-wrap"><table class="v117-table"><thead><tr><th>S.No.</th><th>Date</th><th>Type</th><th>Area</th><th>Reason</th><th>Draft No.</th><th>Registry No.</th><th>Running Balance</th></tr></thead><tbody>${rows||'<tr><td colspan="8">No history.</td></tr>'}</tbody></table></div>`);};
window.v118RenderPropertyHome=function(){
  v118SyncRegisteredHoldings();const parties=knownParties118(),holds=propertyRows118();window.v118KnownParties=parties;
  openSimpleManagement('Property',`<div class="v118-card v118-property-add"><h3>Add Property</h3><div class="form-grid four"><div><label>Name</label><select id="v118PropParty" onchange="v118PropPartyChanged()"><option value="">Select Name</option>${parties.map((p,i)=>`<option value="${i}">${E(p.name||'-')}</option>`).join('')}<option value="__manual__">＋ New Party / Manual</option></select></div><div id="v118ManualPartyWrap" class="v118-manual-party" hidden><label>New Party Name</label><input id="v118ManualName" placeholder="Name"><label>Father / Husband</label><input id="v118ManualFather"><label>Address</label><input id="v118ManualAddress"></div><div><label>Aadhaar</label><input id="v118PropAadhaar" inputmode="numeric" maxlength="12" oninput="v118PropIdentityLookup()"></div><div><label>Mobile</label><input id="v118PropMobile" inputmode="numeric" maxlength="10" oninput="v118PropIdentityLookup()"></div><div><label>Village</label><input id="v118PropVillage"></div><div><label>Khasra / Gata No.</label><input id="v118PropKhasra"></div><div><label>Area</label><input id="v118PropArea" type="number" min="0" step="0.0001" oninput="v118PropertyUnitChanged('v118Prop')"></div><div><label>Unit</label><select id="v118PropUnit" onchange="v118PropertyUnitChanged('v118Prop')"><option>Hectare</option><option>Bigha</option><option>SqM</option><option>SqFt</option></select></div><div><label>Hectare Equivalent</label><input id="v118PropAreaHa" type="number" min="0" step="0.0001" placeholder="Bigha: confirm hectare"></div><div><button class="btn primary" onclick="v118AddProperty()">＋ Add Property</button></div></div></div><div class="v118-card"><div class="v118-section-head"><h3>Property Holdings</h3><small>Registered Buy/Sale + Development Ledger</small></div><div class="v117-table-wrap"><table class="v117-table v118-property-table"><thead><tr><th>Name</th><th>Village</th><th>Khasra/Gata</th><th>Total Added / Buy</th><th>Road / Development Minus</th><th>Sale</th><th>Remaining</th><th>Action</th></tr></thead><tbody>${holds.map(h=>{const x=v118PropertyBalance(h),total=x.openingHa+x.buys;return `<tr><td><b>${E(h.party?.name||'-')}</b></td><td>${E(h.village||'-')}</td><td>${E(h.khasra||'-')}</td><td>${total.toFixed(4)} ha</td><td>-${x.manualMinusHa.toFixed(4)} ha</td><td>-${x.sells.toFixed(4)} ha</td><td><b>${x.balanceHa.toFixed(4)} ha</b></td><td class="v118-actions"><button onclick="v118OpenPropertyAdd('${E(h.id)}')">Add</button><button onclick="v118OpenPropertyMinus('${E(h.id)}')">Minus</button><button onclick="v118OpenPropertyHistory('${E(h.id)}')">History</button></td></tr>`;}).join('')||'<tr><td colspan="8">No property saved.</td></tr>'}</tbody></table></div></div>`);
};
window.openPropertiesHome=function(){v118RenderPropertyHome();};

// -------- Checking Copy: exact same draft Open, no new number --------
window.v118OpenSameDraft=function(no){const d=draftByNo118(no);if(!d){toast('Draft nahi mila');return;}try{openSavedRegistry(no);toast(`Opened same draft ${no}`);}catch(e){console.warn(e);toast('Draft open nahi hua');}};
let v118AdvDocType='';
const advSearchOpenBase=window.v117OpenAdvocateRecordSearch;
if(typeof advSearchOpenBase==='function')window.v117OpenAdvocateRecordSearch=function(m,n,t){v118AdvDocType=t||'';return advSearchOpenBase.apply(this,arguments);};
const advResultsBase=window.v117RenderAdvResults;
if(typeof advResultsBase==='function')window.v117RenderAdvResults=function(){const out=advResultsBase.apply(this,arguments);setTimeout(()=>{if(v118AdvDocType!=='copy')return;document.querySelectorAll('#v117AdvResults .v117-result-row').forEach(row=>{const no=row.querySelector('strong')?.textContent?.trim();const actions=row.querySelector('.v117-result-actions');if(!no||!actions)return;[...actions.querySelectorAll('button')].forEach(b=>{if(/New Draft/i.test(b.textContent))b.remove();});if(!actions.querySelector('.v118-open-same')){const b=document.createElement('button');b.className='v118-open-same';b.textContent='Open';b.onclick=()=>v118OpenSameDraft(no);actions.prepend(b);}});},0);return out;};

// -------- Advocate dashboard lists + PDF/Share --------
function advRows118(kind){const a=visibleDrafts(),now=new Date(),ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`,pr=new Date(now.getFullYear(),now.getMonth()-1,1),pym=`${pr.getFullYear()}-${String(pr.getMonth()+1).padStart(2,'0')}`;if(kind==='today')return a.filter(d=>dateOf(d)===TODAY());if(kind==='month')return a.filter(d=>dateOf(d).startsWith(ym));if(kind==='last')return a.filter(d=>dateOf(d).startsWith(pym));if(kind==='pending')return a.filter(d=>d.status==='Checking Copy');if(kind==='final')return a.filter(d=>d.status==='Completed'||d.finalApproved);return a;}
const advLabel118={today:'Today Drafts',month:'This Month Drafts',last:'Last Month Drafts',pending:'Pending / Checking',final:'Final Drafts'};
function draftListTable118(rows,forPdf=false){return `<table class="v117-table"><thead><tr><th>S.No.</th><th>Village</th><th>Buyer</th><th>Khasra No.</th><th>Area</th><th>Draft No.</th><th>Date</th>${forPdf?'':'<th>Action</th>'}</tr></thead><tbody>${rows.map((d,i)=>`<tr><td>${i+1}</td><td>${E(d.village||'-')}</td><td>${E(partyText(d,'buyer')||'-')}</td><td>${E(khasraText(d)||'-')}</td><td>${E(areaText(d)||'-')}</td><td>${E(draftNo(d)||'-')}</td><td>${E(dateOf(d)||'-')}</td>${forPdf?'':`<td>${d.status==='Checking Copy'?`<button class="btn outline compact" onclick="v118OpenSameDraft('${E(draftNo(d))}')">Open</button>`:''}${(d.status==='Completed'||d.finalApproved)?(d.registrationFinal?'<span class="v117-green-tick">✓ Registered</span>':`<button class="btn primary compact" onclick="v117OpenRegistrationFinal('${E(draftNo(d))}')">Final</button>`):''}</td>`}</tr>`).join('')||`<tr><td colspan="${forPdf?7:8}">No drafts.</td></tr>`}</tbody></table>`;}
window.v117OpenAdvocateDashboardList=function(kind){const rows=advRows118(kind),label=advLabel118[kind]||'Drafts';openSimpleManagement(label,`<div class="v118-toolbar"><button class="btn primary" onclick="v118OpenAdvocateListPdf('${E(kind)}')">PDF</button></div><div class="v117-table-wrap">${draftListTable118(rows,false)}</div>`);};
function openReportWindow118(title,body,shareText){const w=window.open('','_blank');if(!w){toast('Popup blocked. Browser me popups allow karein.');return;}const payload=JSON.stringify(shareText||title).replace(/</g,'\\u003c');w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${E(title)}</title><style>body{font-family:Arial,sans-serif;margin:0;color:#111}.bar{position:sticky;top:0;background:#fff;border-bottom:1px solid #ddd;padding:10px 18px;display:flex;gap:10px;z-index:5}.bar button{padding:9px 14px;border:1px solid #1d6f42;border-radius:8px;background:#fff;cursor:pointer}.bar .p{background:#1d6f42;color:#fff}.page{padding:20px}h2{text-align:center;margin:4px 0 12px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #555;padding:5px;text-align:left;vertical-align:top}th{background:#eee}@media print{.bar{display:none}.page{padding:0}}@page{size:A4 landscape;margin:10mm}</style></head><body><div class="bar"><button class="p" onclick="window.print()">Print / Save PDF</button><button onclick="shareReport()">Send / Share</button></div><div class="page">${body}</div><script>async function shareReport(){const text=${payload};try{if(navigator.share){await navigator.share({title:${JSON.stringify(title)},text});return;}}catch(e){}window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank');}<\/script></body></html>`);w.document.close();}
window.v118OpenAdvocateListPdf=function(kind){const rows=advRows118(kind),label=advLabel118[kind]||'Drafts';openReportWindow118(`Registry Pro — ${label}`,`<h2>${E(label)}</h2><p>Advocate: <b>${E(sessionIdentity().name)}</b> • Total ${rows.length}</p>${draftListTable118(rows,true)}`,`${label} — ${rows.length} records — Registry Pro`);};

// Mutation list PDF injection while preserving existing row OTP workflow.
function mutationRows118(){const s=sessionIdentity();return R(MUT_KEY,[]).filter(r=>{if(s.role==='Advocate'){const rm=M(r.advocateMobile);if(rm&&s.mobile)return rm===s.mobile;return L(r.advocateName)===L(s.name);}if(s.role==='Typist'){const d=draftByNo118(r.draftNo);try{return !!d&&v14DraftVisible(d);}catch(_){return !!d;}}return true;});}
function mutationTable118(rows){return `<table class="v117-table"><thead><tr><th>S.No.</th><th>Village</th><th>Buyer</th><th>Mobile</th><th>Khasra</th><th>Area</th><th>Draft No.</th><th>Mutation Date</th><th>Final Mutation Date</th><th>Status</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${E(r.village||'-')}</td><td>${E(r.buyer?.name||'-')}</td><td>${E(r.buyer?.mobile||'-')}</td><td>${E(r.khasra||'-')}</td><td>${E(r.area||'-')}</td><td>${E(r.draftNo||'-')}</td><td>${E(r.mutationDate||'-')}</td><td>${E(r.finalMutationDate||'-')}</td><td>${r.otpVerified?'Final Mutation':'Pending'}</td></tr>`).join('')||'<tr><td colspan="10">No mutation files.</td></tr>'}</tbody></table>`;}
const mutListBase=window.v117OpenMutationList;
if(typeof mutListBase==='function')window.v117OpenMutationList=function(finalMode=false){const out=mutListBase.apply(this,arguments);setTimeout(()=>{const root=document.getElementById('simpleManagementBody')||document.querySelector('#simpleManagementView .management-content')||document.querySelector('#simpleManagementView .management-shell')||document.querySelector('#simpleManagementView .shell');if(!root||root.querySelector('.v118-mut-pdf'))return;const b=document.createElement('div');b.className='v118-toolbar v118-mut-pdf';b.innerHTML=`<button class="btn primary" onclick="v118OpenMutationPdf(${finalMode?'true':'false'})">PDF</button>`;const tw=root.querySelector('.v117-table-wrap');root.insertBefore(b,tw||root.firstChild);},0);return out;};
window.v118OpenMutationPdf=function(finalMode=false){let rows=mutationRows118();if(finalMode)rows=rows;const label=finalMode?'Final Mutation':'Total Mutation File';openReportWindow118(`Registry Pro — ${label}`,`<h2>${E(label)}</h2><p>Advocate: <b>${E(sessionIdentity().name)}</b> • Total ${rows.length}</p>${mutationTable118(rows)}`,`${label} — ${rows.length} records — Registry Pro`);};

// -------- Party Full Record (reuses former Seller / Buyer Parties drawer item) --------
function findParty118(kind,q){q=kind==='aadhaar'?D(q):M(q);if((kind==='aadhaar'&&q.length!==12)||(kind==='mobile'&&q.length!==10))return null;try{return v113FindPartyByIdentity(kind==='aadhaar'?q:'',kind==='mobile'?q:'');}catch(_){}const parties=knownParties118();return parties.find(p=>kind==='aadhaar'?D(p.aadhaar||p.id)===q:M(p.mobile)===q)||null;}
window.openPartiesHome=function(){openSimpleManagement('Party Full Record',`<div class="v118-card v118-party-search"><h3>Party Full Record</h3><div class="v118-party-search-row"><select id="v118PartySearchBy"><option value="aadhaar">Search Aadhaar</option><option value="mobile">Search Mobile</option></select><input id="v118PartySearchValue" placeholder="Aadhaar / Mobile Number" inputmode="numeric"><button class="btn primary" onclick="v118SearchPartyFullRecord()">Search</button></div><p class="hint">Registered Buy/Sale, Property Holding, Development Minus aur Registry history ek PDF me.</p></div>`);};
window.v118SearchPartyFullRecord=function(){const k=document.getElementById('v118PartySearchBy')?.value||'aadhaar',q=document.getElementById('v118PartySearchValue')?.value||'',p=findParty118(k,q);if(!p){toast('Party record nahi mila');return;}v118OpenPartyFullPdf(p);};
function partyHolders118(p){v118SyncRegisteredHoldings();return propertyRows118().filter(h=>partyMatch118(h.party,p));}
function partyTransactions118(p){const ev=[];const ds=visibleDrafts().filter(d=>d.registrationFinal);ds.forEach(d=>parcels(d).forEach(pe=>{const ar=Number(pe.areaHa||0);if(ar<=0)return;const base={date:d.registration?.date||dateOf(d),deed:d.registryType||'-',village:d.village||'-',khasra:pe.khasra||'-',areaHa:ar,seller:partyText(d,'seller')||'-',buyer:partyText(d,'buyer')||'-',draftNo:draftNo(d)||'-',regNo:d.registration?.regNo||'-',advocate:advName(d)||'-'};if(partyList(d,'buyer').some(x=>partyMatch118(x,p)))ev.push({...base,type:'Buy'});if(partyList(d,'seller').some(x=>partyMatch118(x,p)))ev.push({...base,type:'Sale'});}));partyHolders118(p).forEach(h=>(h.adjustments||[]).filter(x=>x.type==='minus').forEach(x=>ev.push({date:x.date||'-',deed:'Property Adjustment',village:h.village||'-',khasra:h.khasra||'-',type:'Development Minus',areaHa:Number(x.areaHa||0),seller:'-',buyer:h.party?.name||'-',draftNo:'-',regNo:'-',advocate:h.ownerAdvocate||'-',reason:x.reason||'Other'})));return ev.sort((a,b)=>String(a.date).localeCompare(String(b.date)));}
window.v118OpenPartyFullPdf=function(p){const holders=partyHolders118(p),ev=partyTransactions118(p);let buy=0,sale=0,dev=0,bal=holders.reduce((s,h)=>s+Number(h.openingHa||0),0);const rows=ev.map((x,i)=>{if(x.type==='Buy'){buy+=x.areaHa;bal+=x.areaHa;}else if(x.type==='Sale'){sale+=x.areaHa;bal-=x.areaHa;}else{dev+=x.areaHa;bal-=x.areaHa;}return `<tr><td>${i+1}</td><td>${E(x.date||'-')}</td><td>${E(x.deed||'-')}</td><td>${E(x.village||'-')}</td><td>${E(x.khasra||'-')}</td><td>${E(x.type||'-')}</td><td>${Number(x.areaHa||0).toFixed(4)} ha</td><td>${E(x.seller||'-')}</td><td>${E(x.buyer||'-')}</td><td>${E(x.draftNo||'-')}</td><td>${E(x.regNo||'-')}</td><td>${E(x.advocate||'-')}</td><td>${bal.toFixed(4)} ha</td></tr>`;}).join('');const current=holders.reduce((s,h)=>s+v118PropertyBalance(h).balanceHa,0),regs=new Set(ev.filter(x=>x.regNo&&x.regNo!=='-').map(x=>x.regNo)).size;const summary=`<table><tbody><tr><th>Party Name</th><td>${E(p.name||'-')}</td><th>Mobile</th><td>${E(M(p.mobile)||'-')}</td><th>Aadhaar</th><td>${E(D(p.aadhaar||p.id)||'-')}</td></tr><tr><th>Total Buy Area</th><td>${buy.toFixed(4)} ha</td><th>Total Sale Area</th><td>${sale.toFixed(4)} ha</td><th>Development / Road Minus</th><td>${dev.toFixed(4)} ha</td></tr><tr><th>Current Remaining Area</th><td><b>${current.toFixed(4)} ha</b></td><th>Total Registries</th><td>${regs}</td><th>Holdings</th><td>${holders.length}</td></tr></tbody></table>`;const table=`<table><thead><tr><th>S.No.</th><th>Date</th><th>Deed Type</th><th>Village</th><th>Khasra/Gata No.</th><th>Transaction Type</th><th>Area</th><th>Seller</th><th>Buyer</th><th>Draft No.</th><th>Registry No.</th><th>Advocate Name</th><th>Balance After Transaction</th></tr></thead><tbody>${rows||'<tr><td colspan="13">No registered transaction.</td></tr>'}</tbody></table>`;openReportWindow118('Party Full Record — '+(p.name||''),`<h2>Party Full Record</h2>${summary}<h3>Complete Transaction History</h3>${table}`,`Party Full Record — ${p.name||''} — Buy ${buy.toFixed(4)} ha, Sale ${sale.toFixed(4)} ha, Remaining ${current.toFixed(4)} ha`);};

// Drawer: preserve Reports, repurpose existing Seller / Buyer Parties as Party Full Record.
const drawerBase118=window.v18DrawerHtml;
if(typeof drawerBase118==='function')window.v18DrawerHtml=function(){return drawerBase118().replace('Seller / Buyer Parties','Party Full Record');};

function init118(){try{v118SyncRegisteredHoldings();}catch(e){console.warn(e);}try{v18BuildDrawers();}catch(_){}console.info('Registry Pro v1.18 loaded — final combined patch');}
document.addEventListener('DOMContentLoaded',()=>setTimeout(init118,30));
})();

/* ===== Source: final.js ===== */
/* Registry Pro v1.18.1 — final navigation/list correction patch
   Scope only:
   1) Advocate dashboard row action = individual Draft PDF (not Open)
   2) Saved Drafts rows = normal Open same draft number + separate New Copy / Buyer→Seller
   3) Advocates → Final/Copy count and default list use the same advocate/status data source
*/
(function(){
'use strict';
const V119='v1.18.1';
const esc119=v=>{try{return esc(String(v??''));}catch(_){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}};
const low119=v=>String(v||'').trim().toLowerCase();
const mobile119=v=>String(v||'').replace(/\D/g,'').slice(-10);
const draftNo119=d=>String(d?.registryNo||d?.draftNumber||'');
const date119=d=>{try{return v14DateOnly(d)||String(d?.registration?.date||'').slice(0,10);}catch(_){return String(d?.registration?.date||d?.savedAtISO||d?.savedAt||'').slice(0,10);}};
const ownerName119=d=>String(d?.ownerAdvocate||d?.advocate?.name||d?.advocateName||'').trim();
const ownerMobile119=d=>mobile119(d?.ownerAdvocateMobile||d?.advocate?.mobile||d?.advocateMobile||'');
function seller119(d){try{return v14PartyNamesPlain(d?.sellers,d?.seller)||'-';}catch(_){return d?.seller?.name||'-';}}
function buyer119(d){try{return v14PartyNamesPlain(d?.buyers,d?.buyer)||'-';}catch(_){return d?.buyer?.name||'-';}}
function khasra119(d){try{return v19KhasraText(d)||'-';}catch(_){return d?.khasraNo||(d?.agri?.gataRows||[]).map(x=>x.gata).filter(Boolean).join(', ')||'-';}}
function area119(d){try{return v19PropertyAreaText(d)||'-';}catch(_){const h=Number(d?.agri?.totalAreaHa||0);return h?`${h.toFixed(4)} ha`:`${Number(d?.areaM2||0).toFixed(2)} m²`;}}
function visible119(){try{return v14VisibleDrafts();}catch(_){try{return v14AllDrafts();}catch(__){return [];}}}
function matchAdv119(d,mobile,name){
  const dm=ownerMobile119(d),dn=low119(ownerName119(d)),m=mobile119(mobile),n=low119(name);
  // Mobile is strongest when both records have it; name is the legacy/fallback link.
  return (!!m&&!!dm&&m===dm)|| (!!n&&!!dn&&n===dn);
}
function statusMatch119(d,type){return type==='copy'?d?.status==='Checking Copy':(d?.status==='Completed'||!!d?.finalApproved);}
function advRecords119(mobile,name,type){
  return visible119().filter(d=>matchAdv119(d,mobile,name)).filter(d=>statusMatch119(d,type));
}
function currentAdvRecords119(kind){
  const a=visible119(),now=new Date(),today=now.toISOString().slice(0,10),ym=today.slice(0,7),p=new Date(now.getFullYear(),now.getMonth()-1,1),pym=`${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,'0')}`;
  if(kind==='today')return a.filter(d=>date119(d)===today);
  if(kind==='month')return a.filter(d=>date119(d).startsWith(ym));
  if(kind==='last')return a.filter(d=>date119(d).startsWith(pym));
  if(kind==='pending')return a.filter(d=>d?.status==='Checking Copy');
  if(kind==='final')return a.filter(d=>d?.status==='Completed'||!!d?.finalApproved);
  return a;
}

// ---------- Individual full draft PDF/preview ----------
window.v119OpenDraftPdf=function(no){
  if(!no)return;
  const base=location.href.split('?')[0].split('#')[0];
  window.open(`${base}?draftPdf=${encodeURIComponent(no)}`,'_blank');
};
function bootDraftPdf119(){
  const p=new URLSearchParams(location.search),no=p.get('draftPdf');if(!no)return;
  setTimeout(()=>{
    try{
      openSavedRegistry(no);
      setTimeout(()=>{
        try{goDraftStep(5);if(typeof syncDraftPreviewNow==='function')syncDraftPreviewNow();else syncDraftPreview();}catch(_){try{syncDraftPreview();}catch(__){}}
        setTimeout(()=>{
          const legal=document.getElementById('legalDraftPreview');
          if(!legal){document.body.innerHTML='<div style="padding:30px;font-family:Arial">Draft PDF preview could not be prepared.</div>';return;}
          const d=(typeof v14AllDrafts==='function'?v14AllDrafts():[]).find(x=>draftNo119(x)===no)||{};
          const html=legal.innerHTML;
          document.title=`Registry Pro — ${no}`;
          document.body.innerHTML=`<div class="v119-pdf-toolbar"><button onclick="window.print()">Print / Save PDF</button><button onclick="v119ShareDraftPdf()">Send / Share</button><span>${esc119(no)} • ${esc119(d.registryType||'Draft')}</span></div><main class="v119-pdf-document">${html}</main>`;
          window.v119ShareDraftPdf=async function(){const text=`Registry Pro Draft ${no} — ${d.registryType||''} — ${d.village||''}`;try{if(navigator.share){await navigator.share({title:`Registry Pro ${no}`,text});return;}}catch(_){}window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank');};
        },180);
      },220);
    }catch(e){console.error('draft pdf',e);}
  },250);
}

// ---------- Advocate dashboard: remove Open, add row PDF ----------
const advLabels119={today:'Today Drafts',month:'This Month Drafts',last:'Last Month Drafts',pending:'Pending / Checking',final:'Final Drafts'};
function advDashboardTable119(rows){
  return `<table class="v117-table"><thead><tr><th>S.No.</th><th>Village</th><th>Buyer</th><th>Khasra No.</th><th>Area</th><th>Draft No.</th><th>Date</th><th>Action</th></tr></thead><tbody>${rows.map((d,i)=>{
    const no=draftNo119(d),completed=d?.status==='Completed'||d?.finalApproved;
    let extra='';
    if(completed){extra=d?.registrationFinal?'<span class="v117-green-tick">✓ Registered</span>':`<button class="btn primary compact" onclick="v117OpenRegistrationFinal('${esc119(no)}')">Final</button>`;}
    return `<tr><td>${i+1}</td><td>${esc119(d?.village||'-')}</td><td>${esc119(buyer119(d))}</td><td>${esc119(khasra119(d))}</td><td>${esc119(area119(d))}</td><td>${esc119(no||'-')}</td><td>${esc119(date119(d)||'-')}</td><td class="v119-row-actions"><button class="btn outline compact" onclick="v119OpenDraftPdf('${esc119(no)}')">PDF</button>${extra}</td></tr>`;
  }).join('')||'<tr><td colspan="8">No drafts.</td></tr>'}</tbody></table>`;
}
window.v117OpenAdvocateDashboardList=function(kind){
  const rows=currentAdvRecords119(kind),label=advLabels119[kind]||'Drafts';
  openSimpleManagement(label,`<div class="v118-toolbar"><button class="btn primary" onclick="v118OpenAdvocateListPdf('${esc119(kind)}')">PDF</button></div><div class="v117-table-wrap">${advDashboardTable119(rows)}</div>`);
};

// ---------- Saved Drafts: normal Open same record; clone remains separate ----------
const savedRenderBase119=window.v116RenderSearchResults;
if(typeof savedRenderBase119==='function'){
  window.v116RenderSearchResults=function(){
    const out=savedRenderBase119.apply(this,arguments);
    setTimeout(()=>{
      document.querySelectorAll('#savedList .v1171-saved-row').forEach(row=>{
        const actions=row.querySelector('.v1171-row-actions');if(!actions||actions.querySelector('.v119-open-same'))return;
        const clone=[...actions.querySelectorAll('button')].find(b=>String(b.getAttribute('onclick')||'').includes('v116CloneDraft'));
        const m=String(clone?.getAttribute('onclick')||'').match(/v116CloneDraft\(['\"]([^'\"]+)['\"]\)/);if(!m)return;
        const no=m[1];
        const b=document.createElement('button');b.className='btn primary compact v119-open-same';b.textContent='Open';b.setAttribute('onclick',`openSavedRegistry(${JSON.stringify(no)})`);actions.insertBefore(b,actions.firstChild);
        if(clone)clone.textContent='New Copy';
      });
    },0);
    return out;
  };
}

// ---------- Advocates drawer: count and list use one identical data source ----------
window.v119AdvSearchState={mobile:'',name:'',docType:'final',criterion:'draftNo',q:''};
function advocateList119(){try{return getAdvocates()||[];}catch(_){return [];}}
function session119(){try{return v14SessionData()||{};}catch(_){return {};}}
window.v119RenderAdvocatesHome=function(){
  const all=advocateList119(),s=session119(),sm=mobile119(s.mobile||s.advocateMobile),sn=low119(s.name||s.advocateName);
  const arr=s.role==='Advocate'?all.filter(a=>(sm&&mobile119(a.mobile)===sm)||(!sm&&low119(a.name)===sn)):all;
  const rows=arr.map(a=>{
    const c=advRecords119(a.mobile,a.name,'copy').length,f=advRecords119(a.mobile,a.name,'final').length;
    return `<div class="v117-adv-row"><div><strong>${esc119(a.name||'-')}</strong><small>${esc119(a.compound||a.tehsilCompound||'-')} • ${esc119(a.mobile||'-')} • ${esc119(a.enrollment||a.regdNo||'-')} • Stamp ${esc119(a.stampPage||'2')}</small></div><div class="v117-adv-actions"><button class="btn outline compact" onclick='v117OpenAdvocateRecordSearch(${JSON.stringify(mobile119(a.mobile))},${JSON.stringify(a.name||'')},"copy")'>Copy <b>${c}</b></button><button class="btn primary compact" onclick='v117OpenAdvocateRecordSearch(${JSON.stringify(mobile119(a.mobile))},${JSON.stringify(a.name||'')},"final")'>Final <b>${f}</b></button></div></div>`;
  }).join('')||'<div class="empty-party-records">No advocates added.</div>';
  openSimpleManagement('Advocates',`<div class="v117-adv-toolbar"><button class="btn primary" onclick="v117OpenAdvocateForm()">＋ Add Advocate</button><span>${arr.length} Saved</span></div><div class="v117-card v117-adv-list-card"><div class="v117-section-head"><h3>Saved Advocates</h3><span>${arr.length}</span></div><div class="v117-adv-list">${rows}</div></div>`);
};
window.v117RenderAdvocatesHome=window.v119RenderAdvocatesHome;
window.openAdvocatesHome=window.v119RenderAdvocatesHome;

function criterion119(d,k){if(k==='draftNo')return draftNo119(d);if(k==='seller')return seller119(d);if(k==='buyer')return buyer119(d);if(k==='khasra')return khasra119(d);if(k==='date')return date119(d);return '';}
window.v117OpenAdvocateRecordSearch=function(mobile,name,docType='final'){
  window.v119AdvSearchState={mobile:mobile119(mobile),name:name||'',docType:docType==='copy'?'copy':'final',criterion:'draftNo',q:''};
  v119RenderAdvocateSearch();
};
window.v119RenderAdvocateSearch=function(){
  const s=window.v119AdvSearchState,isDate=s.criterion==='date';
  openSimpleManagement(`${s.name} — ${s.docType==='final'?'Final Draft':'Checking Copy'}`,`<div class="v117-searchbar"><label>Search By<select id="v119AdvCriterion" onchange="v119SetAdvCriterion(this.value)"><option value="draftNo">Draft No.</option><option value="seller">Seller</option><option value="buyer">Buyer</option><option value="khasra">Khasra</option><option value="date">Date Wise</option></select></label><label>Search<input id="v119AdvQuery" ${isDate?'type="date"':'type="text"'} placeholder="${isDate?'Select date':'Search '+s.criterion}" value="${esc119(s.q)}" onkeydown="if(event.key==='Enter')v119ApplyAdvSearch()"></label><button class="btn primary" onclick="v119ApplyAdvSearch()">Search</button><button class="btn outline" onclick="v119ClearAdvSearch()">Clear</button></div><div id="v119AdvResults"></div>`);
  const c=document.getElementById('v119AdvCriterion');if(c)c.value=s.criterion;
  v119RenderAdvocateResults(); // IMPORTANT: default full list immediately, no search required.
};
window.v119SetAdvCriterion=function(k){window.v119AdvSearchState.criterion=k||'draftNo';window.v119AdvSearchState.q='';v119RenderAdvocateSearch();};
window.v119ApplyAdvSearch=function(){window.v119AdvSearchState.q=document.getElementById('v119AdvQuery')?.value||'';v119RenderAdvocateResults();};
window.v119ClearAdvSearch=function(){window.v119AdvSearchState.q='';v119RenderAdvocateSearch();};
window.v119RenderAdvocateResults=function(){
  const box=document.getElementById('v119AdvResults');if(!box)return;const s=window.v119AdvSearchState,q=low119(s.q);
  let rows=advRecords119(s.mobile,s.name,s.docType).filter(d=>!q||low119(criterion119(d,s.criterion)).includes(q));
  rows.sort((a,b)=>String(b?.savedAtISO||b?.savedAt||'').localeCompare(String(a?.savedAtISO||a?.savedAt||'')));
  box.innerHTML=`<div class="v119-adv-count"><b>${rows.length}</b> ${s.docType==='final'?'Final':'Checking Copy'} record${rows.length===1?'':'s'}</div><div class="v117-table-wrap"><table class="v117-table"><thead><tr><th>Draft No.</th><th>Deed</th><th>Seller</th><th>Buyer</th><th>Village</th><th>Khasra</th><th>Date</th><th>PDF / Actions</th></tr></thead><tbody>${rows.map(d=>{const no=draftNo119(d);return `<tr><td><b>${esc119(no||'-')}</b></td><td>${esc119(d?.registryType||'-')}</td><td>${esc119(seller119(d))}</td><td>${esc119(buyer119(d))}</td><td>${esc119(d?.village||'-')}</td><td>${esc119(khasra119(d))}</td><td>${esc119(date119(d)||'-')}</td><td class="v119-row-actions"><button class="btn outline compact" onclick="v119OpenDraftPdf('${esc119(no)}')">PDF</button><button class="btn outline compact" onclick="v117SendDraftWhatsApp('${esc119(no)}')">Send PDF</button><button class="btn outline compact" onclick="v117PrintDraft('${esc119(no)}')">Print Draft</button><button class="btn primary compact" onclick="v116CloneDraft('${esc119(no)}')">New Draft</button><button class="btn outline compact" onclick="createNextSaleFromDraft('${esc119(no)}')">Buyer Convert Seller</button></td></tr>`;}).join('')||'<tr><td colspan="8">No matching draft.</td></tr>'}</tbody></table></div>`;
};
// Keep old calls harmless and routed to the corrected results.
window.v117RenderAdvResults=window.v119RenderAdvocateResults;

function init119(){
  
  bootDraftPdf119();
  console.info('Registry Pro v1.18.1 loaded — advocate row PDF + Saved Draft same-number Open + advocate count/list sync');
}
document.addEventListener('DOMContentLoaded',init119);
})();

/* ===== Source: final.js ===== */
/* Registry Pro v1.19 — final role / approval / navigation / PDF patch
   06-Sep-2026
   - Top-right Typist <-> Advocate work-mode switch for every login
   - Advocate mode = limited dashboard only
   - Mine profile read-only after save, Edit unlocks
   - Draft State/District/Tehsil row synced with circle-rate jurisdiction
   - Advocate list rows: PDF + Approve/Registered + deferred Send Mutation
   - Approved registry can Send Mutation later from Saved Drafts / opened draft
   - Individual draft PDF waits for full rendered deed (fixes blank advocate PDF)
   - Full final PDF shows advocate identity details in English
   - Draft Back history avoids duplicate-dashboard loop
*/
(function(){
'use strict';
const V120='v1.19';
const PROFILE_KEY='registryProMineProfileV117';
const PROFILE_BOOK_KEY='registryProProfileBookV1172';
const SESSION_KEY='registryProSession';
const ADV_KEY='registryProAdvocates';
const MUTATION_KEY='registryProMutationV117';
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x??d;}catch(_){return d;}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc120=v=>{try{return esc(String(v??''));}catch(_){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}};
const low=v=>String(v||'').trim().toLowerCase();
const digits=v=>String(v||'').replace(/\D/g,'');
const mobile10=v=>digits(v).slice(-10);
const today=()=>new Date().toISOString().slice(0,10);
const draftNo=d=>String(d?.registryNo||d?.draftNumber||'');
const allDrafts=()=>{try{return typeof v14AllDrafts==='function'?v14AllDrafts():read('registryProDrafts',[]);}catch(_){return read('registryProDrafts',[]);}};
const saveDrafts=a=>{try{if(typeof v14SaveDrafts==='function')return v14SaveDrafts(a);}catch(_){}write('registryProDrafts',a);};
const draftByNo=no=>allDrafts().find(d=>draftNo(d)===String(no||''));
const dateOf=d=>{try{return v14DateOnly(d)||String(d?.registration?.date||'').slice(0,10);}catch(_){return String(d?.registration?.date||d?.savedAtISO||d?.savedAt||'').slice(0,10);}};
const partyNames=(list,one)=>{try{return v14PartyNamesPlain(list,one)||'-';}catch(_){const a=Array.isArray(list)?list:(one?[one]:[]);return a.map(x=>x?.name||'').filter(Boolean).join(', ')||'-';}};
const buyerText=d=>partyNames(d?.buyers,d?.buyer);
const khasraText120=d=>{try{return v19KhasraText(d)||'-';}catch(_){return d?.khasraNo||(d?.agri?.gataRows||[]).map(x=>x.gata||x.khasra).filter(Boolean).join(', ')||'-';}};
const areaText120=d=>{try{return v19PropertyAreaText(d)||'-';}catch(_){const h=Number(d?.agri?.totalAreaHa||0);return h?`${h.toFixed(4)} ha`:`${Number(d?.areaM2||0).toFixed(2)} m²`;}};

// ---------- Identity / active work mode ----------
function profile120(){return read(PROFILE_KEY,{});}
function session120(){try{return typeof v14SessionData==='function'?(v14SessionData()||{}):read(SESSION_KEY,{});}catch(_){return read(SESSION_KEY,{});}}
function activeMode120(){const s=session120();return s.workMode==='AdvocateStaff'?'AdvocateStaff':'Typist';}
function identity120(){
  const p=profile120(),s=session120();
  return {name:String(p.name||s.name||s.advocateName||'').trim(),mobile:mobile10(p.mobile||s.mobile||s.advocateMobile||'')};
}
function ownerName120(d){return String(d?.ownerAdvocate||d?.advocate?.name||d?.advocateName||'').trim();}
function ownerMobile120(d){return mobile10(d?.ownerAdvocateMobile||d?.advocate?.mobile||d?.advocateMobile||'');}
function advocateScopedDrafts120(){
  const id=identity120(),n=low(id.name),m=id.mobile;
  return allDrafts().filter(d=>{
    const dm=ownerMobile120(d),dn=low(ownerName120(d));
    return (!!m&&!!dm&&m===dm)|| (!!n&&!!dn&&n===dn);
  });
}
function filterAdv120(kind){
  const a=advocateScopedDrafts120(),t=today(),ym=t.slice(0,7),p=new Date(),prev=new Date(p.getFullYear(),p.getMonth()-1,1),pym=`${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}`;
  if(kind==='today')return a.filter(d=>dateOf(d)===t);
  if(kind==='month')return a.filter(d=>dateOf(d).startsWith(ym));
  if(kind==='last')return a.filter(d=>dateOf(d).startsWith(pym));
  if(kind==='pending')return a.filter(d=>d?.status==='Checking Copy');
  if(kind==='final')return a.filter(d=>d?.status==='Completed'||d?.finalApproved||d?.registrationFinal);
  return a;
}
window.v120SwitchWorkMode=function(mode,ev){
  try{ev?.stopPropagation?.();}catch(_){}
  mode=mode==='AdvocateStaff'?'AdvocateStaff':'Typist';
  const s=read(SESSION_KEY,session120());s.workMode=mode;write(SESSION_KEY,s);
  try{if(typeof v14Session!=='undefined')v14Session={...s};}catch(_){}
  showDashboard();
  try{toast(mode==='AdvocateStaff'?'Advocate Mode':'Typist Mode');}catch(_){}
};

function mutationRows120(){const x=read(MUTATION_KEY,[]);return Array.isArray(x)?x:[];}
function mutationFor120(no){return mutationRows120().find(r=>String(r?.draftNo||'')===String(no||''))||null;}
function mutationAction120(d){
  if(!d?.registrationFinal)return '';
  const no=draftNo(d),r=mutationFor120(no);
  return r?'<span class="v120-mutation-sent">✓ Mutation Sent</span>':`<button class="btn soft-blue compact" onclick="v120SendMutationLater('${esc120(no)}')">Send Mutation</button>`;
}
window.v120SendMutationLater=function(no){
  const d=draftByNo(no);if(!d||!d.registrationFinal){try{toast('Registry pehle Approved / Registered honi chahiye');}catch(_){}return;}
  if(mutationFor120(no)){try{toast('Mutation already sent');}catch(_){}return;}
  if(typeof v117SendMutation==='function')v117SendMutation(no);
  setTimeout(()=>{try{v120ApplyModeUI();}catch(_){}},80);
};

// ---------- Dashboard mode UI ----------
function ensureMutationCards120(grid){
  grid.querySelectorAll('.v117-mutation-card').forEach(x=>x.remove());
  grid.insertAdjacentHTML('beforeend','<button class="v18-stat-card teal v117-mutation-card" onclick="v120OpenMutationList(false)"><span>↻</span><small>Total Mutation File</small><strong id="statMutationTotal">0</strong></button><button class="v18-stat-card green v117-mutation-card" onclick="v120OpenMutationList(true)"><span>✓</span><small>Final Mutation</small><strong id="statMutationFinal">0</strong></button>');
}
function scopedMutations120(){
  const id=identity120(),n=low(id.name),m=id.mobile;
  return mutationRows120().filter(r=>{const rm=mobile10(r?.advocateMobile),rn=low(r?.advocateName);return (!!m&&!!rm&&m===rm)|| (!!n&&!!rn&&n===rn);});
}
window.v120ApplyModeUI=function(){
  const mode=activeMode120(),adv=mode==='AdvocateStaff',id=identity120();
  document.body.dataset.rpMode=adv?'advocate':'typist';
  const sel=document.getElementById('v120TopModeSelect');if(sel)sel.value=mode;
  const role=document.getElementById('v120ProfileRoleLabel');if(role)role.textContent=adv?'Advocate Mode':'Typist Mode';
  const nm=document.getElementById('v18AdvocateName');if(nm&&id.name)nm.textContent=id.name;
  const av=document.getElementById('v18AdvocateAvatar');if(av&&id.name)av.textContent=id.name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'RP';
  const gr=document.getElementById('v18Greeting');if(gr)gr.textContent=`Good ${new Date().getHours()<12?'Morning':new Date().getHours()<17?'Afternoon':'Evening'}, ${id.name||'Registry Pro'} — ${adv?'Advocate':'Typist'}`;
  ['continueLastDraftCard'].forEach(x=>{const e=document.getElementById(x);if(e)e.hidden=adv;});
  document.querySelectorAll('#dashboardView .v18-create-title,#dashboardView .v18-deed-grid,#dashboardView .v18-recent').forEach(e=>e.style.display=adv?'none':'');
  const grid=document.querySelector('#dashboardView .v18-stats-grid');if(!grid)return;
  const cards=[...grid.querySelectorAll('.v18-stat-card:not(.v117-mutation-card)')].slice(0,5);
  if(adv){
    ensureMutationCards120(grid);
    const kinds=['today','month','last','pending','final'];
    cards.forEach((b,i)=>b.onclick=()=>v117OpenAdvocateDashboardList(kinds[i]));
    const rows=advocateScopedDrafts120();
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('statTodayDrafts',filterAdv120('today').length);set('statThisMonth',filterAdv120('month').length);set('statLastMonth',filterAdv120('last').length);set('statPendingDrafts',filterAdv120('pending').length);set('statFinalDrafts',filterAdv120('final').length);
    const ms=scopedMutations120();set('statMutationTotal',ms.length);set('statMutationFinal',ms.filter(x=>x.otpVerified).length);
  }else{
    grid.querySelectorAll('.v117-mutation-card').forEach(x=>x.remove());
    cards.forEach(b=>b.onclick=()=>openSavedDrafts());
  }
};

const refreshBase120=window.refreshDashboard;
if(typeof refreshBase120==='function')window.refreshDashboard=function(){const out=refreshBase120.apply(this,arguments);setTimeout(v120ApplyModeUI,0);return out;};
const showDashboardBase120=window.showDashboard;
if(typeof showDashboardBase120==='function')window.showDashboard=function(){
  // Returning from a draft consumes the single draft history state instead of stacking another dashboard.
  if(history.state?.rpView==='draft'&&!window.__v120Popping){history.back();return;}
  const out=showDashboardBase120.apply(this,arguments);try{history.replaceState({...(history.state||{}),rpView:'dashboard'},'',location.href);}catch(_){}setTimeout(v120ApplyModeUI,0);return out;
};

// ---------- Logical Draft Back + browser back ----------
const openRegistryBase120=window.openNewRegistry;
if(typeof openRegistryBase120==='function')window.openNewRegistry=function(){
  try{if(history.state?.rpView!=='draft')history.pushState({rpView:'draft'},'',location.href);}catch(_){}
  const out=openRegistryBase120.apply(this,arguments);setTimeout(v120PopulateDraftJurisdiction,0);return out;
};
window.v120DraftBack=function(){
  const type=document.getElementById('draftTypeScreen'),steps=document.getElementById('draftStepsScreen');
  if(steps?.classList.contains('active')){if(Number(window.currentDraftStep||currentDraftStep||1)>1){goDraftStep(Number(window.currentDraftStep||currentDraftStep)-1);}else{steps.classList.remove('active');type?.classList.add('active');window.scrollTo(0,0);}return;}
  if(history.state?.rpView==='draft'){history.back();return;}showDashboardBase120?.();
};
window.v116DraftBack=window.v120DraftBack;window.v115DraftBack=window.v120DraftBack;window.v114DraftBackTop=window.v120DraftBack;
window.addEventListener('popstate',e=>{
  if(e.state?.rpView==='dashboard'){window.__v120Popping=true;try{showDashboardBase120?.();setTimeout(v120ApplyModeUI,0);}finally{setTimeout(()=>window.__v120Popping=false,0);}}
});

// ---------- Mine: saved profile is read-only until Edit ----------
let mineEditing120=false;
function profileBook120(){const a=read(PROFILE_BOOK_KEY,[]);return Array.isArray(a)?a:[];}
function saveProfileBook120(p){let a=profileBook120(),i=a.findIndex(x=>mobile10(x.mobile)===mobile10(p.mobile));if(i>=0)a[i]={...a[i],...p};else a.unshift(p);write(PROFILE_BOOK_KEY,a.slice(0,1000));}
function input120(label,id,value,extra=''){return `<div><label>${label}</label><input id="${id}" value="${esc120(value||'')}" ${extra}></div>`;}
function renderMine120(editing){
  mineEditing120=!!editing;const p=profile120(),s=session120(),has=!!(p.name&&mobile10(p.mobile).length===10),lock=has&&!mineEditing120;
  const role=p.roleType||'Typist';
  if(lock){
    openSimpleManagement('Mine — My Profile',`<div class="v117-card v120-mine-readonly"><div class="form-grid four">${input120('Name','mineName',p.name,'readonly')}${input120('Address','mineAddress',p.address,'readonly')}${input120('Mobile Number','mineMobile',p.mobile,'readonly')}${input120('Role Type','mineRoleText',role,'readonly')}${input120('State','mineStateText',p.state,'readonly')}${input120('District','mineDistrictText',p.district,'readonly')}${input120('Tehsil','mineTehsilText',p.tehsil,'readonly')}${input120('PIN Code','minePin',p.pin,'readonly')}${role==='Advocate'?input120('Court / Compound Name','mineCourt',p.courtName,'readonly')+input120('Advocate Regd. No.','mineRegd',p.regdNo,'readonly'):''}</div><div class="v120-mine-actions"><button class="btn primary" onclick="v120EditMine()">Edit Profile</button></div></div>`);return;
  }
  openSimpleManagement('Mine — My Profile',`<div class="v117-card"><div class="form-grid four"><div><label>Name</label><input id="mineName" value="${esc120(p.name||s.name||'')}"></div><div><label>Address</label><input id="mineAddress" value="${esc120(p.address||'')}"></div><div><label>Mobile Number</label><input id="mineMobile" inputmode="numeric" maxlength="10" value="${esc120(p.mobile||s.mobile||'')}" oninput="v117MineIdentityLookup?.()"></div><div><label>Role Type</label><select id="mineRole" onchange="v120MineRoleChanged()"><option value="Typist">Typist</option><option value="Advocate">Advocate</option></select></div><div><label>State</label><select id="mineState"></select></div><div><label>District</label><select id="mineDistrict"></select></div><div><label>Tehsil</label><select id="mineTehsil"></select></div><div><label>PIN Code</label><input id="minePin" inputmode="numeric" maxlength="6" value="${esc120(p.pin||'')}"></div><div class="v120-adv-only"><label>Court / Compound Name</label><input id="mineCourt" value="${esc120(p.courtName||'')}"></div><div class="v120-adv-only"><label>Advocate Regd. No.</label><input id="mineRegd" value="${esc120(p.regdNo||'')}"></div></div><button class="btn primary" onclick="v120SaveMine()">Save Profile</button></div>`);
  try{if(typeof v117FillMineGeo==='function')v117FillMineGeo(p.state||'Uttarakhand',p.district||'Haridwar',p.tehsil||'Roorkee');else v120FillMineGeo(p);}catch(_){v120FillMineGeo(p);}const r=document.getElementById('mineRole');if(r)r.value=role;v120MineRoleChanged();
}
function v120FillMineGeo(p={}){
  const st=document.getElementById('mineState'),di=document.getElementById('mineDistrict'),te=document.getElementById('mineTehsil');if(!st||!di||!te)return;
  let cfg={};try{cfg=V14_JURISDICTIONS||{};}catch(_){}
  const states=Object.keys(cfg).length?Object.keys(cfg):['Uttarakhand'];st.innerHTML=states.map(x=>`<option>${esc120(x)}</option>`).join('');st.value=p.state||states[0];
  const ds=Object.keys(cfg?.[st.value]||{});di.innerHTML=(ds.length?ds:['Haridwar']).map(x=>`<option>${esc120(x)}</option>`).join('');di.value=p.district||di.options[0]?.value||'';
  const ts=Object.keys(cfg?.[st.value]?.[di.value]||{});te.innerHTML=(ts.length?ts:['Roorkee','Bhagwanpur']).map(x=>`<option>${esc120(x)}</option>`).join('');te.value=p.tehsil||te.options[0]?.value||'';
  st.onchange=()=>v120FillMineGeo({state:st.value});di.onchange=()=>v120FillMineGeo({state:st.value,district:di.value});
}
window.v120MineRoleChanged=function(){const adv=document.getElementById('mineRole')?.value==='Advocate';document.querySelectorAll('.v120-adv-only').forEach(e=>e.style.display=adv?'':'none');};
window.v120EditMine=function(){renderMine120(true);};
window.v120SaveMine=function(){
  const val=id=>String(document.getElementById(id)?.value||'').trim();
  const p={name:val('mineName'),address:val('mineAddress'),mobile:mobile10(val('mineMobile')),roleType:val('mineRole')||'Typist',state:val('mineState'),district:val('mineDistrict'),tehsil:val('mineTehsil'),pin:digits(val('minePin')).slice(0,6),courtName:val('mineCourt'),regdNo:val('mineRegd')};
  if(!p.name||p.mobile.length!==10){toast('Name aur valid 10 digit mobile required');return;}
  write(PROFILE_KEY,p);saveProfileBook120(p);
  try{v113RememberParty?.({name:p.name,address:p.address,mobile:p.mobile},'profile');}catch(_){}
  if(p.roleType==='Advocate'){
    let a=read(ADV_KEY,[]);if(!Array.isArray(a))a=[];let i=a.findIndex(x=>mobile10(x.mobile)===p.mobile);const rec={name:p.name,mobile:p.mobile,compound:p.courtName,tehsilCompound:p.courtName,enrollment:p.regdNo,regdNo:p.regdNo,stampPage:i>=0?(a[i].stampPage||'2'):'2'};if(i>=0)a[i]={...a[i],...rec};else a.unshift(rec);write(ADV_KEY,a);try{refreshAdvocateSelects?.();}catch(_){}
  }
  const s=read(SESSION_KEY,session120());write(SESSION_KEY,{...s,name:p.name,mobile:p.mobile,profileRole:p.roleType});
  try{v14WriteJSON?.('registryProJurisdiction',{state:p.state,district:p.district,tehsil:p.tehsil});}catch(_){write('registryProJurisdiction',{state:p.state,district:p.district,tehsil:p.tehsil});}
  toast('Profile saved');renderMine120(false);
};
window.openMineHome=function(){renderMine120(false);};

// ---------- Draft jurisdiction row ----------
window.v120PopulateDraftJurisdiction=function(){
  const st=document.getElementById('v120DraftState'),di=document.getElementById('v120DraftDistrict'),te=document.getElementById('v120DraftTehsil');if(!st||!di||!te)return;
  let ctx={state:'Uttarakhand',district:'Haridwar',tehsil:'Bhagwanpur'};try{ctx=currentJurisdiction();}catch(_){ctx=read('registryProJurisdiction',ctx);}
  let cfg={};try{cfg=V14_JURISDICTIONS||{};}catch(_){}
  const ss=Object.keys(cfg).length?Object.keys(cfg):[ctx.state||'Uttarakhand'];st.innerHTML=ss.map(x=>`<option>${esc120(x)}</option>`).join('');st.value=ss.includes(ctx.state)?ctx.state:ss[0];
  const ds=Object.keys(cfg?.[st.value]||{});const dd=ds.length?ds:[ctx.district||'Haridwar'];di.innerHTML=dd.map(x=>`<option>${esc120(x)}</option>`).join('');di.value=dd.includes(ctx.district)?ctx.district:dd[0];
  const ts=Object.keys(cfg?.[st.value]?.[di.value]||{});const tt=ts.length?ts:[ctx.tehsil||'Bhagwanpur'];te.innerHTML=tt.map(x=>`<option>${esc120(x)}</option>`).join('');te.value=tt.includes(ctx.tehsil)?ctx.tehsil:tt[0];
};
window.v120DraftJurisdictionChanged=function(level){
  const st=document.getElementById('v120DraftState'),di=document.getElementById('v120DraftDistrict'),te=document.getElementById('v120DraftTehsil');if(!st||!di||!te)return;
  let cfg={};try{cfg=V14_JURISDICTIONS||{};}catch(_){}
  if(level==='state'){const ds=Object.keys(cfg?.[st.value]||{});di.innerHTML=ds.map(x=>`<option>${esc120(x)}</option>`).join('');if(ds.length)di.value=ds[0];}
  if(level==='state'||level==='district'){const ts=Object.keys(cfg?.[st.value]?.[di.value]||{});te.innerHTML=ts.map(x=>`<option>${esc120(x)}</option>`).join('');if(ts.length)te.value=ts[0];}
  const old=(()=>{try{return currentJurisdiction();}catch(_){return read('registryProJurisdiction',{});}})();const ctx={state:st.value,district:di.value,tehsil:te.value};
  try{v14WriteJSON('registryProJurisdiction',ctx);}catch(_){write('registryProJurisdiction',ctx);}
  if(old?.tehsil!==ctx.tehsil){['villageSearch','village','selectedCircleRowId','rateRef'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});try{selectedCircleLocation=null;}catch(_){} }
  try{updateDraftJurisdictionContext?.();v114SyncCircleContext?.();v114PopulateDashboardJurisdiction?.();}catch(_){}
  v120PopulateDraftJurisdiction();
};
const startStepsBase120=window.startDraftSteps;
if(typeof startStepsBase120==='function')window.startDraftSteps=function(){const out=startStepsBase120.apply(this,arguments);setTimeout(v120PopulateDraftJurisdiction,0);return out;};
const openSavedBase120=window.openSavedRegistry;
if(typeof openSavedBase120==='function')window.openSavedRegistry=function(no){const out=openSavedBase120.apply(this,arguments);setTimeout(()=>{v120PopulateDraftJurisdiction();v120SyncOpenDraftMutation(no);},30);return out;};

// ---------- Advocate Approve / Registration + deferred mutation ----------
window.v120OpenApproval=function(no){
  const d=draftByNo(no);if(!d)return;
  openSimpleManagement('Approve & Register Registry',`<div class="v117-card"><h3>${esc120(no)}</h3><div class="form-grid four"><div><label>Registry / Registration No.</label><input id="v120RegNo" value="${esc120(d.registration?.regNo||'')}"></div><div><label>Registration Date</label><input id="v120RegDate" type="date" value="${esc120(d.registration?.date||today())}"></div><div><label>Office</label><select id="v120RegOffice"><option value="First">First Office</option><option value="Second">Second Office</option></select></div><div><label>Jild No.</label><input id="v120Jild" value="${esc120(d.registration?.jildNo||'')}"></div><div><label>Book / Page (optional)</label><input id="v120BookPage" value="${esc120(d.registration?.bookPage||'')}"></div><div class="full"><button class="btn primary" onclick="v120SaveApproval('${esc120(no)}')">Approve Registry</button></div></div></div>`);
  const o=document.getElementById('v120RegOffice');if(o)o.value=d.registration?.office||'First';
};
window.v120SaveApproval=function(no){
  const regNo=String(document.getElementById('v120RegNo')?.value||'').trim(),date=document.getElementById('v120RegDate')?.value||today();if(!regNo){toast('Registry / Registration No. required');return;}
  const a=allDrafts(),i=a.findIndex(d=>draftNo(d)===no);if(i<0)return;
  a[i].status='Completed';a[i].finalApproved=true;a[i].checkingCopy=false;a[i]._workingDraft=false;a[i].registration={...(a[i].registration||{}),regNo,date,office:document.getElementById('v120RegOffice')?.value||'First',jildNo:String(document.getElementById('v120Jild')?.value||'').trim(),bookPage:String(document.getElementById('v120BookPage')?.value||'').trim(),finalizedAt:new Date().toISOString()};a[i].registrationFinal=true;saveDrafts(a);
  try{v118SyncRegisteredHoldings?.(no);}catch(e){console.warn('Property sync',e);}
  openSimpleManagement('Registry Approved',`<div class="v117-success"><div class="v117-green-tick big">✓</div><h2>Registry Registered / Final</h2><p>${esc120(no)} • Registration No. ${esc120(regNo)}</p><div class="draft-actions"><button class="btn primary" onclick="v120SendMutationLater('${esc120(no)}')">Send Mutation</button><button class="btn outline" onclick="showDashboard()">Not Now</button></div></div>`);
  try{refreshDashboard();}catch(_){}
};
function rowAction120(d){
  const no=draftNo(d);let a=`<button class="btn outline compact" onclick="v120OpenDraftPdf('${esc120(no)}')">PDF</button>`;
  if(!d.registrationFinal)a+=`<button class="btn primary compact" onclick="v120OpenApproval('${esc120(no)}')">Approve</button>`;
  else a+=`<span class="v117-green-tick">✓ Registered</span>${mutationAction120(d)}`;
  return a;
}
window.v117OpenAdvocateDashboardList=function(kind){
  const rows=filterAdv120(kind),labels={today:'Today Drafts',month:'This Month Drafts',last:'Last Month Drafts',pending:'Pending / Checking',final:'Final Drafts'};
  openSimpleManagement(labels[kind]||'Drafts',`<div class="v118-toolbar"><button class="btn primary" onclick="v118OpenAdvocateListPdf('${esc120(kind)}')">PDF</button></div><div class="v117-table-wrap"><table class="v117-table"><thead><tr><th>S.No.</th><th>Village</th><th>Buyer</th><th>Khasra No.</th><th>Area</th><th>Draft No.</th><th>Date</th><th>Action</th></tr></thead><tbody>${rows.map((d,i)=>`<tr><td>${i+1}</td><td>${esc120(d.village||'-')}</td><td>${esc120(buyerText(d))}</td><td>${esc120(khasraText120(d))}</td><td>${esc120(areaText120(d))}</td><td>${esc120(draftNo(d)||'-')}</td><td>${esc120(dateOf(d)||'-')}</td><td class="v120-row-actions">${rowAction120(d)}</td></tr>`).join('')||'<tr><td colspan="8">No drafts.</td></tr>'}</tbody></table></div>`);
};

// Scope Mutation list by active Advocate mode identity, regardless of login role.
window.v120OpenMutationList=function(finalMode=false){
  const rows=scopedMutations120();
  openSimpleManagement(finalMode?'Final Mutation':'Total Mutation File',`<div class="v118-toolbar"><button class="btn primary" onclick="v118OpenMutationPdf(${finalMode?'true':'false'})">PDF</button></div><div class="v117-table-wrap"><table class="v117-table"><thead><tr><th>S.No.</th><th>Village</th><th>Buyer Details</th><th>Khasra</th><th>Area</th><th>Draft No.</th><th>Mutation Date</th><th>Final Mutation Date</th>${finalMode?'<th>OTP / Final</th>':''}</tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc120(r.village||'-')}</td><td><b>${esc120(r.buyer?.name||'-')}</b><small>${esc120(r.buyer?.mobile||'-')} • Aadhaar ${esc120(r.buyer?.aadhaar||'-')} • ${esc120(r.buyer?.address||'')}</small></td><td>${esc120(r.khasra||'-')}</td><td>${esc120(r.area||'-')}</td><td>${esc120(r.draftNo||'-')}</td><td>${esc120(r.mutationDate||'-')}</td><td>${esc120(r.finalMutationDate||'-')}${today()>=String(r.finalMutationDate||'9999')&&!r.otpVerified?'<small class="v117-due">45-day reminder due</small>':''}</td>${finalMode?`<td>${r.otpVerified?'<span class="v117-green-tick">✓ OTP Verified</span>':r.otpStatus==='sent'?`<button class="btn primary compact" onclick="v117OpenOtpVerify('${esc120(r.id)}')">OTP Verified</button>`:`<button class="btn primary compact" onclick="v117SendBuyerOtp('${esc120(r.id)}')">Send OTP</button>`}</td>`:''}</tr>`).join('')||`<tr><td colspan="${finalMode?9:8}">No mutation files.</td></tr>`}</tbody></table></div>`);
};

// ---------- Saved Drafts: Send Mutation later + green tick ----------
function decorateSavedMutation120(){
  document.querySelectorAll('#savedList .v1171-saved-row').forEach(row=>{
    const no=String(row.querySelector('.v1171-draftno')?.textContent||'').trim(),d=draftByNo(no),actions=row.querySelector('.v1171-row-actions');if(!d||!actions)return;
    actions.querySelectorAll('.v120-mutation-action').forEach(x=>x.remove());if(!d.registrationFinal)return;
    const wrap=document.createElement('span');wrap.className='v120-mutation-action';wrap.innerHTML=mutationAction120(d);actions.appendChild(wrap);
  });
}
const savedRender120=window.v116RenderSearchResults;
if(typeof savedRender120==='function')window.v116RenderSearchResults=function(){const out=savedRender120.apply(this,arguments);setTimeout(decorateSavedMutation120,0);return out;};

function v120SyncOpenDraftMutation(no){
  const host=document.getElementById('draftStepsScreen');if(!host)return;let bar=document.getElementById('v120OpenDraftMutation');if(!bar){bar=document.createElement('div');bar.id='v120OpenDraftMutation';bar.className='v120-open-draft-mutation';host.insertBefore(bar,host.firstChild);}
  const d=draftByNo(no||window.v14ActiveRegistryNo);if(!d?.registrationFinal){bar.hidden=true;bar.innerHTML='';return;}bar.hidden=false;bar.innerHTML=`<strong>Registered:</strong> ${esc120(d.registration?.regNo||draftNo(d))}<span>${mutationAction120(d)}</span>`;
}

// ---------- Individual full draft PDF (robust wait, fixes blank popup PDF) ----------
window.v120OpenDraftPdf=function(no){if(!no)return;const base=location.href.split('?')[0].split('#')[0];window.open(`${base}?draftPdf120=${encodeURIComponent(no)}`,'_blank');};
window.v119OpenDraftPdf=window.v120OpenDraftPdf;
function english120(v){const s=String(v||'').trim();if(!s)return '-';try{return /[\u0900-\u097F]/.test(s)&&typeof v192SmartEnglishRaw==='function'?v192SmartEnglishRaw(s):s;}catch(_){return s;}}
function advocateInfo120(d){
  const m=mobile10(d?.ownerAdvocateMobile||d?.advocate?.mobile),n=low(d?.ownerAdvocate||d?.advocate?.name),mine=profile120(),book=profileBook120();
  let p=(m&&mobile10(mine.mobile)===m)?mine:book.find(x=>(m&&mobile10(x.mobile)===m)||(!m&&n&&low(x.name)===n))||{};
  let adv=(read(ADV_KEY,[])||[]).find(x=>(m&&mobile10(x.mobile)===m)||(!m&&n&&low(x.name)===n))||{};
  return {name:english120(p.name||adv.name||d?.advocate?.name||d?.ownerAdvocate||'-'),address:english120(p.address||'-'),mobile:mobile10(p.mobile||adv.mobile||d?.advocate?.mobile)||'-',court:english120(p.courtName||adv.compound||adv.tehsilCompound||d?.agri?.advocateOffice||'-'),regd:english120(p.regdNo||adv.regdNo||adv.enrollment||d?.advocate?.enrollment||'-')};
}
function applyAdvocateDetails120(d,root=document){
  const legal=root.querySelector?.('#legalDraftPreview')||root.querySelector?.('.v120-pdf-document')||root;const pages=[...(legal?.querySelectorAll?.('.deed-page')||[])];if(!pages.length)return;
  const last=pages[pages.length-1],a=advocateInfo120(d);let block=last.querySelector('.v120-advocate-english');if(!block){block=document.createElement('div');block.className='v120-advocate-english';const footer=last.querySelector('.registry-page-footer');footer?last.insertBefore(block,footer):last.appendChild(block);}block.innerHTML=`<b>Advocate:</b> ${esc120(a.name)} &nbsp; | &nbsp; <b>Court / Compound:</b> ${esc120(a.court)}<br><b>Address:</b> ${esc120(a.address)} &nbsp; | &nbsp; <b>Mobile:</b> ${esc120(a.mobile)} &nbsp; | &nbsp; <b>Regd. No.:</b> ${esc120(a.regd)}`;
  const finalLine=last.querySelector('.v110-final-lines p:last-child,.deed-footer-lines p:last-child');if(finalLine)finalLine.innerHTML=`Drafted By — <b>${esc120(a.name)}</b>, Advocate, ${esc120(a.court)}. Mobile: ${esc120(a.mobile)} • Regd. No.: ${esc120(a.regd)}`;
}
const syncBase120=window.syncDraftPreview;
if(typeof syncBase120==='function')window.syncDraftPreview=function(){const out=syncBase120.apply(this,arguments);setTimeout(()=>{try{const d=draftByNo(window.v14ActiveRegistryNo)||((typeof draftData==='function')?draftData():{});applyAdvocateDetails120(d,document);}catch(_){}},0);return out;};

function bootPdf120(){
  const no=new URLSearchParams(location.search).get('draftPdf120');if(!no)return;
  const attemptOpen=()=>{try{openSavedRegistry(no);goDraftStep(5);syncDraftPreview();}catch(e){console.warn('pdf open',e);}};
  setTimeout(attemptOpen,220);
  let tries=0;const timer=setInterval(()=>{
    tries++;const legal=document.getElementById('legalDraftPreview'),pages=legal?[...legal.querySelectorAll('.deed-page')]:[],text=String(legal?.textContent||'').replace(/\s+/g,' ').trim();
    if(pages.length&&text.length>120){clearInterval(timer);const d=draftByNo(no)||{};applyAdvocateDetails120(d,document);const html=legal.innerHTML;document.title=`Registry Pro — ${no}`;document.body.innerHTML=`<div class="v120-pdf-toolbar"><button onclick="window.print()">Print / Save PDF</button><button id="v120SharePdf">Send / Share</button><span>${esc120(no)} • ${esc120(d.registryType||'Draft')}</span></div><main class="v120-pdf-document">${html}</main>`;document.getElementById('v120SharePdf').onclick=async()=>{const msg=`Registry Pro Draft ${no} — ${d.registryType||''} — ${d.village||''}`;try{if(navigator.share){await navigator.share({title:`Registry Pro ${no}`,text:msg});return;}}catch(_){}window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');};return;}
    if(tries===8)attemptOpen();
    if(tries>30){clearInterval(timer);document.body.innerHTML='<div style="padding:30px;font-family:Arial">Draft PDF preview could not be prepared. Please close this tab and retry PDF.</div>';}
  },180);
}

// ---------- Page-level filtered list PDFs (same records as current Advocate mode) ----------
function openReport120(title,body,shareText){
  const w=window.open('','_blank');if(!w){try{toast('Popup blocked. Browser me popups allow karein.');}catch(_){}return;}
  const payload=JSON.stringify(shareText||title).replace(/</g,'\\u003c');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc120(title)}</title><style>body{font-family:Arial,sans-serif;margin:0;color:#111}.bar{position:sticky;top:0;background:#fff;border-bottom:1px solid #ddd;padding:10px 18px;display:flex;gap:10px;z-index:5}.bar button{padding:9px 14px;border:1px solid #1d6f42;border-radius:8px;background:#fff;cursor:pointer}.bar .p{background:#1d6f42;color:#fff}.page{padding:20px}h2{text-align:center;margin:4px 0 12px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #555;padding:5px;text-align:left;vertical-align:top}th{background:#eee}@media print{.bar{display:none}.page{padding:0}}@page{size:A4 landscape;margin:10mm}</style></head><body><div class="bar"><button class="p" onclick="window.print()">Print / Save PDF</button><button onclick="shareReport()">Send / Share</button></div><div class="page">${body}</div><script>async function shareReport(){const text=${payload};try{if(navigator.share){await navigator.share({title:${JSON.stringify(title)},text});return;}}catch(e){}window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank');}<\/script></body></html>`);w.document.close();
}
window.v118OpenAdvocateListPdf=function(kind){
  const rows=filterAdv120(kind),labels={today:'Today Drafts',month:'This Month Drafts',last:'Last Month Drafts',pending:'Pending / Checking',final:'Final Drafts'},label=labels[kind]||'Drafts',id=identity120();
  const table=`<table><thead><tr><th>S.No.</th><th>Village</th><th>Buyer</th><th>Khasra No.</th><th>Area</th><th>Draft No.</th><th>Date</th><th>Status</th></tr></thead><tbody>${rows.map((d,i)=>`<tr><td>${i+1}</td><td>${esc120(d.village||'-')}</td><td>${esc120(buyerText(d))}</td><td>${esc120(khasraText120(d))}</td><td>${esc120(areaText120(d))}</td><td>${esc120(draftNo(d)||'-')}</td><td>${esc120(dateOf(d)||'-')}</td><td>${d.registrationFinal?'Registered':esc120(d.status||'-')}</td></tr>`).join('')||'<tr><td colspan="8">No drafts.</td></tr>'}</tbody></table>`;
  openReport120(`Registry Pro — ${label}`,`<h2>${esc120(label)}</h2><p>Advocate: <b>${esc120(id.name||'-')}</b> • Total ${rows.length}</p>${table}`,`${label} — ${rows.length} records — Registry Pro`);
};
window.v118OpenMutationPdf=function(finalMode=false){
  const rows=scopedMutations120(),label=finalMode?'Final Mutation':'Total Mutation File',id=identity120();
  const table=`<table><thead><tr><th>S.No.</th><th>Village</th><th>Buyer</th><th>Mobile</th><th>Khasra</th><th>Area</th><th>Draft No.</th><th>Mutation Date</th><th>Final Mutation Date</th><th>Status</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc120(r.village||'-')}</td><td>${esc120(r.buyer?.name||'-')}</td><td>${esc120(r.buyer?.mobile||'-')}</td><td>${esc120(r.khasra||'-')}</td><td>${esc120(r.area||'-')}</td><td>${esc120(r.draftNo||'-')}</td><td>${esc120(r.mutationDate||'-')}</td><td>${esc120(r.finalMutationDate||'-')}</td><td>${r.otpVerified?'Final Mutation':'Pending'}</td></tr>`).join('')||'<tr><td colspan="10">No mutation files.</td></tr>'}</tbody></table>`;
  openReport120(`Registry Pro — ${label}`,`<h2>${esc120(label)}</h2><p>Advocate: <b>${esc120(id.name||'-')}</b> • Total ${rows.length}</p>${table}`,`${label} — ${rows.length} records — Registry Pro`);
};

// ---------- Init ----------
document.addEventListener('DOMContentLoaded',()=>{
  try{history.replaceState({rpView:'dashboard'},'',location.href);v120PopulateDraftJurisdiction();v120ApplyModeUI();bootPdf120();}catch(e){console.warn('v1.19 init',e);}
});
})();

/* ===== Source: final.js ===== */
/* Registry Pro v1.19.1 — Property auto-holding + role-wise drawer patch
   06-Sep-2026
   - Registered buyer property reliably auto-added/merged by Party identity + Village + Khasra/Gata
   - Property ledger no longer disappears because of advocate-name ownership mismatch
   - Explicit New Party / Manual action in Add Property
   - Typist Mode drawer hides Property
   - Advocate Mode drawer hides Advocates
   - Drawer refreshes immediately when work mode changes
*/
(function(){
'use strict';
const PROP_KEY='registryProPropertyMaster';
const PROFILE_KEY='registryProMineProfileV117';
const SESSION_KEY='registryProSession';
const ADV_KEY='registryProAdvocates';
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x??d;}catch(_){return d;}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc121=v=>{try{return esc(String(v??''));}catch(_){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}};
const low=v=>String(v||'').trim().toLowerCase();
const digits=v=>String(v||'').replace(/\D/g,'');
const mobile10=v=>digits(v).slice(-10);
const today=()=>new Date().toISOString().slice(0,10);
const allDrafts=()=>{try{return typeof v14AllDrafts==='function'?(v14AllDrafts()||[]):read('registryProDrafts',[]);}catch(_){return read('registryProDrafts',[]);}};
const propertyAll=()=>{const a=read(PROP_KEY,[]);return Array.isArray(a)?a:[];};
const savePropertyAll=a=>write(PROP_KEY,a.slice(-15000));
const partyList=(d,type)=>{try{return normalizePartyList(d?.[type+'s'],d?.[type])||[];}catch(_){const p=d?.[type];return p?[p]:[];}};
function partyKey(p){const a=digits(p?.aadhaar||p?.id||p?.idNo),m=mobile10(p?.mobile);if(a.length===12)return 'A:'+a;if(m.length===10)return 'M:'+m;return 'N:'+low(p?.name)+'|'+low(p?.father)+'|'+low(p?.address);}
function partyMatch(a,b){if(!a||!b)return false;const aa=digits(a?.aadhaar||a?.id||a?.idNo),ba=digits(b?.aadhaar||b?.id||b?.idNo);if(aa.length===12&&ba.length===12)return aa===ba;const am=mobile10(a?.mobile),bm=mobile10(b?.mobile);if(am.length===10&&bm.length===10)return am===bm;return low(a?.name)===low(b?.name)&&low(a?.father)===low(b?.father)&&low(a?.address)===low(b?.address);}
function draftNo(d){return String(d?.registryNo||d?.draftNumber||'');}
function draftAdvocate(d){
  let name=String(d?.ownerAdvocate||d?.advocate?.name||d?.advocateName||'').trim();
  let mobile=mobile10(d?.ownerAdvocateMobile||d?.advocate?.mobile||d?.advocateMobile||'');
  if(!mobile&&name){try{const a=(typeof getAdvocates==='function'?getAdvocates():read(ADV_KEY,[])).find(x=>low(x?.name)===low(name));mobile=mobile10(a?.mobile);}catch(_){}}
  return {name,mobile};
}
function activeIdentity(){const p=read(PROFILE_KEY,{}),s=read(SESSION_KEY,{});return {name:String(p?.name||s?.name||s?.advocateName||'').trim(),mobile:mobile10(p?.mobile||s?.mobile||s?.advocateMobile||'')};}
function robustParcels(d){
  const rows=Array.isArray(d?.agri?.gataRows)?d.agri.gataRows:[];
  const out=[];
  rows.forEach(r=>{
    const k=String(r?.gata??r?.khasra??r?.khasraNo??'').trim();if(!k)return;
    let a=Number(r?.soldArea??r?.area??r?.saleArea??r?.soldRakba??r?.soldAreaHa??0)||0;
    out.push({khata:String(r?.khata??d?.khataNo??''),khasra:k,areaHa:a});
  });
  const total=Number(d?.agri?.totalAreaHa??d?.totalAreaHa??0)||0;
  if(out.length===1&&out[0].areaHa<=0&&total>0)out[0].areaHa=total;
  if(!out.length){const k=String(d?.khasraNo||(rows||[]).map(x=>x?.gata).filter(Boolean).join(', ')||'').trim();if(k&&total>0)out.push({khata:String(d?.khataNo||''),khasra:k,areaHa:total});}
  return out.filter(x=>x.khasra&&Number(x.areaHa)>0);
}
function holderMatches(h,p,village,khasra){return partyMatch(h?.party,p)&&low(h?.village)===low(village)&&low(h?.khasra)===low(khasra);}
function registeredDrafts(){return allDrafts().filter(d=>!!d?.registrationFinal);}

// Global property calculation by party + village + khasra. This intentionally does not depend on
// the advocate-name string, so a legitimate registered property cannot disappear after mode/profile changes.
window.v118PropertyBalance=function(h){
  let buys=0,sells=0,buyCount=0,sellCount=0;
  registeredDrafts().forEach(d=>{
    robustParcels(d).forEach(pe=>{
      if(low(d?.village)!==low(h?.village)||low(pe?.khasra)!==low(h?.khasra))return;
      const a=Number(pe.areaHa||0);if(a<=0)return;
      if(partyList(d,'buyer').some(p=>partyMatch(p,h?.party))){buys+=a;buyCount++;}
      if(partyList(d,'seller').some(p=>partyMatch(p,h?.party))){sells+=a;sellCount++;}
    });
  });
  const opening=Number(h?.openingHa||0),minus=Number(h?.manualMinusHa||0);
  return {openingHa:opening,buys,sells,manualMinusHa:minus,balanceHa:opening+buys-sells-minus,buyCount,sellCount};
};
try{window.v15PropertyBalance=window.v118PropertyBalance;}catch(_){}

window.v121SyncRegisteredHoldings=function(onlyDraftNo=''){
  const arr=propertyAll();let changed=false;
  registeredDrafts().filter(d=>!onlyDraftNo||draftNo(d)===String(onlyDraftNo)).forEach(d=>{
    const adv=draftAdvocate(d),village=String(d?.village||'').trim();
    partyList(d,'buyer').forEach(p=>robustParcels(d).forEach(pe=>{
      let h=arr.find(x=>holderMatches(x,p,village,pe.khasra));
      if(!h){
        h={id:'H'+Date.now()+Math.random().toString(16).slice(2),ownerAdvocate:adv.name||'',ownerAdvocateMobile:adv.mobile||'',partyKey:partyKey(p),party:{name:p?.name||'',father:p?.father||'',relation:p?.relation||'S/O',address:p?.address||'',aadhaar:digits(p?.aadhaar||p?.id),mobile:mobile10(p?.mobile),email:p?.email||''},village,khata:pe.khata||'',khasra:String(pe.khasra||''),openingQty:0,unit:'Hectare',openingHa:0,openingDate:d?.registration?.date||today(),createdAt:new Date().toISOString(),source:'Auto from Registered '+draftNo(d),adjustments:[]};
        arr.push(h);changed=true;
      }else{
        const before=JSON.stringify(h.party||{});
        h.party={...(h.party||{}),name:h.party?.name||p?.name||'',father:h.party?.father||p?.father||'',relation:h.party?.relation||p?.relation||'S/O',address:h.party?.address||p?.address||'',aadhaar:h.party?.aadhaar||digits(p?.aadhaar||p?.id),mobile:h.party?.mobile||mobile10(p?.mobile),email:h.party?.email||p?.email||''};
        h.partyKey=partyKey(h.party);if(!h.ownerAdvocate&&adv.name)h.ownerAdvocate=adv.name;if(!h.ownerAdvocateMobile&&adv.mobile)h.ownerAdvocateMobile=adv.mobile;if(JSON.stringify(h.party)!==before)changed=true;
      }
    }));
  });
  if(changed)savePropertyAll(arr);return changed;
};
window.v118SyncRegisteredHoldings=window.v121SyncRegisteredHoldings;

function knownParties(){const src=[];try{src.push(...(v113AllKnownParties?.()||[]));}catch(_){}try{src.push(...(v15PartyMasterAll?.()||[]));}catch(_){}registeredDrafts().forEach(d=>{src.push(...partyList(d,'seller'),...partyList(d,'buyer'));});const m=new Map();src.forEach(p=>{if(!p)return;const k=partyKey(p);if(!m.has(k))m.set(k,p);});return [...m.values()];}
function displayHolders(){v121SyncRegisteredHoldings();return propertyAll().filter(h=>{const x=v118PropertyBalance(h);return Number(h?.openingHa||0)>0||x.buys>0||x.sells>0||x.manualMinusHa>0;});}
function setManualParty121(){const s=document.getElementById('v118PropParty');if(!s)return;s.value='__manual__';try{v118PropPartyChanged?.();}catch(_){}setTimeout(()=>document.getElementById('v118ManualName')?.focus(),0);}
window.v121SetManualParty=setManualParty121;

// Manual Add merges into the same Party + Village + Khasra row, independent of advocate label.
const oldAddProperty121=window.v118AddProperty;
window.v118AddProperty=function(){
  const s=document.getElementById('v118PropParty');if(!s)return oldAddProperty121?.apply(this,arguments);
  const list=window.v118KnownParties||[];let p=null;
  if(s.value==='__manual__')p={name:String(document.getElementById('v118ManualName')?.value||'').trim(),father:String(document.getElementById('v118ManualFather')?.value||'').trim(),address:String(document.getElementById('v118ManualAddress')?.value||'').trim(),aadhaar:digits(document.getElementById('v118PropAadhaar')?.value),mobile:mobile10(document.getElementById('v118PropMobile')?.value),relation:'S/O',role:'both'};else p=list[Number(s.value)]||null;
  if(!p?.name){try{toast('Name select karein ya New Party / Manual ka naam fill karein');}catch(_){}return;}
  const village=String(document.getElementById('v118PropVillage')?.value||'').trim(),khasra=String(document.getElementById('v118PropKhasra')?.value||'').trim(),qty=Number(document.getElementById('v118PropArea')?.value||0),unit=document.getElementById('v118PropUnit')?.value||'Hectare',manualHa=Number(document.getElementById('v118PropAreaHa')?.value||0);
  let ha=0;if(unit==='Hectare')ha=qty;else if(unit==='SqM')ha=qty/10000;else if(unit==='SqFt')ha=qty*0.09290304/10000;else ha=manualHa;
  if(!village||!khasra||qty<=0||ha<=0){try{toast('Village, Khasra, Area aur Hectare Equivalent required');}catch(_){}return;}
  if(s.value==='__manual__'){try{const pm=v15PartyMaster?.()||[],i=pm.findIndex(x=>partyMatch(x,p)),row={...(i>=0?pm[i]:{}),id:i>=0?pm[i].id:'P'+Date.now(),name:p.name,father:p.father,address:p.address,aadhaar:p.aadhaar,mobile:p.mobile,relation:'S/O',role:'both'};if(i>=0)pm[i]=row;else pm.push(row);v15SavePartyMaster?.(pm);v113RememberParty?.(row,'property');}catch(_){} }
  const arr=propertyAll();let h=arr.find(x=>holderMatches(x,p,village,khasra));if(!h){const id=activeIdentity();h={id:'H'+Date.now()+Math.random().toString(16).slice(2),ownerAdvocate:id.name||'',ownerAdvocateMobile:id.mobile||'',partyKey:partyKey(p),party:{...p,aadhaar:digits(p.aadhaar),mobile:mobile10(p.mobile)},village,khata:'',khasra,openingQty:0,unit,openingHa:0,openingDate:today(),createdAt:new Date().toISOString(),source:'Manual Add Property',adjustments:[]};arr.push(h);}h.openingHa=Number(h.openingHa||0)+ha;h.openingQty=Number(h.openingQty||0)+qty;h.unit=unit;h.adjustments=Array.isArray(h.adjustments)?h.adjustments:[];h.adjustments.push({type:'add',date:today(),areaHa:ha,qty,unit,reason:'Manual Add Property'});savePropertyAll(arr);v118RenderPropertyHome();try{toast('Property added');}catch(_){}
};

window.v118RenderPropertyHome=function(){
  v121SyncRegisteredHoldings();const parties=knownParties(),holds=displayHolders();window.v118KnownParties=parties;
  openSimpleManagement('Property',`<div class="v118-card v118-property-add"><div class="v118-section-head"><h3>Add Property</h3><button class="btn soft-blue compact" onclick="v121SetManualParty()">＋ New Party / Manual</button></div><div class="form-grid four"><div><label>Name</label><select id="v118PropParty" onchange="v118PropPartyChanged()"><option value="">Select Name</option>${parties.map((p,i)=>`<option value="${i}">${esc121(p?.name||'-')}</option>`).join('')}<option value="__manual__">＋ New Party / Manual</option></select></div><div id="v118ManualPartyWrap" class="v118-manual-party" hidden><label>New Party Name</label><input id="v118ManualName" placeholder="Name"><label>Father / Husband</label><input id="v118ManualFather"><label>Address</label><input id="v118ManualAddress"></div><div><label>Aadhaar</label><input id="v118PropAadhaar" inputmode="numeric" maxlength="12" oninput="v118PropIdentityLookup()"></div><div><label>Mobile</label><input id="v118PropMobile" inputmode="numeric" maxlength="10" oninput="v118PropIdentityLookup()"></div><div><label>Village</label><input id="v118PropVillage"></div><div><label>Khasra / Gata No.</label><input id="v118PropKhasra"></div><div><label>Area</label><input id="v118PropArea" type="number" min="0" step="0.0001" oninput="v118PropertyUnitChanged('v118Prop')"></div><div><label>Unit</label><select id="v118PropUnit" onchange="v118PropertyUnitChanged('v118Prop')"><option>Hectare</option><option>Bigha</option><option>SqM</option><option>SqFt</option></select></div><div><label>Hectare Equivalent</label><input id="v118PropAreaHa" type="number" min="0" step="0.0001" placeholder="Bigha: confirm hectare"></div><div><button class="btn primary" onclick="v118AddProperty()">＋ Add Property</button></div></div></div><div class="v118-card"><div class="v118-section-head"><h3>Property Holdings</h3><small>Registered Buy/Sale + Development Ledger</small></div><div class="v117-table-wrap"><table class="v117-table v118-property-table"><thead><tr><th>Name</th><th>Village</th><th>Khasra/Gata</th><th>Total Added / Buy</th><th>Road / Development Minus</th><th>Sale</th><th>Remaining</th><th>Action</th></tr></thead><tbody>${holds.map(h=>{const x=v118PropertyBalance(h),total=x.openingHa+x.buys;return `<tr><td><b>${esc121(h?.party?.name||'-')}</b></td><td>${esc121(h?.village||'-')}</td><td>${esc121(h?.khasra||'-')}</td><td>${total.toFixed(4)} ha</td><td>-${x.manualMinusHa.toFixed(4)} ha</td><td>-${x.sells.toFixed(4)} ha</td><td><b>${x.balanceHa.toFixed(4)} ha</b></td><td class="v118-actions"><button onclick="v118OpenPropertyAdd('${esc121(h.id)}')">Add</button><button onclick="v118OpenPropertyMinus('${esc121(h.id)}')">Minus</button><button onclick="v118OpenPropertyHistory('${esc121(h.id)}')">History</button></td></tr>`;}).join('')||'<tr><td colspan="8">No property saved.</td></tr>'}</tbody></table></div></div>`);
};
window.openPropertiesHome=function(){v118RenderPropertyHome();};

// History aligned with the corrected global party/village/khasra balance.
window.v118OpenPropertyHistory=function(id){const h=propertyAll().find(x=>String(x?.id)===String(id));if(!h)return;const ev=[];(h.adjustments||[]).forEach(x=>ev.push({...x,source:'Manual'}));registeredDrafts().forEach(d=>robustParcels(d).forEach(pe=>{if(low(d?.village)!==low(h?.village)||low(pe?.khasra)!==low(h?.khasra))return;const a=Number(pe.areaHa||0);if(partyList(d,'buyer').some(p=>partyMatch(p,h?.party)))ev.push({type:'buy',date:d?.registration?.date||'',areaHa:a,reason:'Registered Buy',draftNo:draftNo(d),regNo:d?.registration?.regNo||''});if(partyList(d,'seller').some(p=>partyMatch(p,h?.party)))ev.push({type:'sale',date:d?.registration?.date||'',areaHa:a,reason:'Registered Sale',draftNo:draftNo(d),regNo:d?.registration?.regNo||''});}));ev.sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));let bal=0;const rows=ev.map((x,i)=>{bal+=(x.type==='add'||x.type==='buy'?1:-1)*Number(x.areaHa||0);return `<tr><td>${i+1}</td><td>${esc121(x.date||'-')}</td><td>${esc121(x.type||'-')}</td><td>${Number(x.areaHa||0).toFixed(4)} ha</td><td>${esc121(x.reason||'-')}</td><td>${esc121(x.draftNo||'-')}</td><td>${esc121(x.regNo||'-')}</td><td>${bal.toFixed(4)} ha</td></tr>`;}).join('');openSimpleManagement('Property History — '+(h?.party?.name||''),`<div class="v118-toolbar"><button class="btn outline" onclick="v118RenderPropertyHome()">← Property</button></div><div class="v117-table-wrap"><table class="v117-table"><thead><tr><th>S.No.</th><th>Date</th><th>Type</th><th>Area</th><th>Reason</th><th>Draft No.</th><th>Registry No.</th><th>Running Balance</th></tr></thead><tbody>${rows||'<tr><td colspan="8">No history.</td></tr>'}</tbody></table></div>`);};

// Role-wise drawer: Typist does not need Property; Advocate does not need Advocates management.
const drawerBase121=window.v18DrawerHtml;
function activeMode121(){const s=read(SESSION_KEY,{});return s?.workMode==='AdvocateStaff'?'AdvocateStaff':'Typist';}
function stripButton(html,fnName){const re=new RegExp(`<button\\s+class=["']side-item["'][^>]*onclick=["'][^"']*${fnName}[^"']*["'][^>]*>[\\s\\S]*?<\\/button>`,'i');return html.replace(re,'');}
if(typeof drawerBase121==='function')window.v18DrawerHtml=function(){let html=drawerBase121();const mode=activeMode121();if(mode==='AdvocateStaff')html=stripButton(html,'openAdvocatesHome');else html=stripButton(html,'openPropertiesHome');return html;};
function rebuildDrawers121(){try{v18BuildDrawers?.();}catch(e){console.warn('Drawer rebuild',e);}}
const switchBase121=window.v120SwitchWorkMode;
if(typeof switchBase121==='function')window.v120SwitchWorkMode=function(){const out=switchBase121.apply(this,arguments);setTimeout(rebuildDrawers121,0);return out;};
const showDashBase121=window.showDashboard;
if(typeof showDashBase121==='function')window.showDashboard=function(){const out=showDashBase121.apply(this,arguments);setTimeout(rebuildDrawers121,0);return out;};

// Re-sync immediately after approval too, even if an older wrapper order changes later.
const approveBase121=window.v120SaveApproval;
if(typeof approveBase121==='function')window.v120SaveApproval=function(no){const out=approveBase121.apply(this,arguments);try{v121SyncRegisteredHoldings(no);}catch(e){console.warn('Registered property sync',e);}return out;};

function init121(){try{v121SyncRegisteredHoldings();}catch(e){console.warn(e);}rebuildDrawers121();console.info('Registry Pro v1.19.1 loaded — property + role-wise drawer fix');}
document.addEventListener('DOMContentLoaded',()=>setTimeout(init121,80));
})();

/* ===== Source: final-fixes.js ===== */
/* Registry Pro v1.20.3 — Final targeted fixes
   1) Exact payment match is a HARD save/checking/final gate.
   2) Drafted-by advocate block is a single clean English block (no duplicate green box).
   3) Clean print root removes hidden-form spill/blank PDF pages.
   4) Dashboard deed cards open draft directly; Draft Back at step-1 returns dashboard in one click.
   5) Registry prefix is synchronized with the selected draft Tehsil before save.
*/
(function(){
'use strict';
const byId=id=>document.getElementById(id);
const txt=v=>String(v??'').trim();
const num=v=>Number(v||0)||0;
const esc125=v=>txt(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x??d;}catch(_){return d;}};
const PROFILE_KEY='registryProMineProfileV117';
const PROFILE_BOOK_KEY='registryProProfileBookV1172';
const ADV_KEY='registryProAdvocates';

function money125(v){try{return typeof inr==='function'?inr(v):'₹'+Math.round(num(v)).toLocaleString('en-IN');}catch(_){return '₹'+Math.round(num(v)).toLocaleString('en-IN');}}
function paymentTarget125(){
  const type=txt(window.registrySelectedType||byId('registryType')?.value).toLowerCase();
  if(type.startsWith('agreement')) return num(byId('agreementAdvance')?.value||byId('transactionAmount')?.value);
  return num(byId('transactionAmount')?.value);
}
function paymentTotal125(){
  try{if(typeof collectPaymentRows==='function')return (collectPaymentRows()||[]).reduce((s,x)=>s+num(x.amount),0);}catch(_){}
  return [...document.querySelectorAll('#paymentRows .pay-amount')].reduce((s,e)=>s+num(e.value),0);
}
window.v125PaymentExact=function(show=true){
  const target=paymentTarget125(),total=paymentTotal125(),diff=total-target,ok=target>0&&Math.abs(diff)<0.5;
  const match=byId('paymentMatch'),wrap=document.querySelector('.payment-total');
  if(wrap){wrap.classList.toggle('payment-ok',ok);wrap.classList.toggle('payment-error',target>0&&!ok);}
  if(match){
    if(target<=0){match.textContent='';match.className='';}
    else if(ok){match.textContent='✓ Exact payment match';match.className='match-ok';}
    else{const side=diff>0?'more':'less';match.textContent=`✕ ${money125(Math.abs(diff))} ${side} than Transaction Amount — exact match required`;match.className='match-bad';}
  }
  if(!ok&&show){try{if(typeof goDraftStep==='function')goDraftStep(4);}catch(_){};try{toast(`Save blocked: Payment Total ${money125(total)} must exactly match Transaction Amount ${money125(target)}.`);}catch(_){} }
  return ok;
};
const updatePayBase125=window.updatePaymentTotal;
if(typeof updatePayBase125==='function')window.updatePaymentTotal=function(){const out=updatePayBase125.apply(this,arguments);window.v125PaymentExact(false);return out;};

function draftTehsil125(){
  return txt(byId('v120DraftTehsil')?.value||byId('draftJurTehsil')?.value||(()=>{try{return currentJurisdiction?.().tehsil||'';}catch(_){return '';}})());
}
function expectedCode125(){
  const tehsil=draftTehsil125();
  try{return txt(V14_JURISDICTIONS?.Uttarakhand?.Haridwar?.[tehsil]?.code)||({Bhagwanpur:'BHP',Roorkee:'RKE',Laksar:'LKS',Haridwar:'HWR'}[tehsil]||'');}catch(_){return ({Bhagwanpur:'BHP',Roorkee:'RKE',Laksar:'LKS',Haridwar:'HWR'}[tehsil]||'');}
}
function typeCode125(){try{return v14TypeCode(window.registrySelectedType||byId('registryType')?.value||'Residential Plot');}catch(_){return /agriculture/i.test(txt(window.registrySelectedType))?'AG':'RP';}}
function allDrafts125(){try{return typeof v14AllDrafts==='function'?v14AllDrafts():read('registryProDrafts',[]);}catch(_){return read('registryProDrafts',[]);}}
function saveDrafts125(a){try{if(typeof v14SaveDrafts==='function')return v14SaveDrafts(a);}catch(_){}localStorage.setItem('registryProDrafts',JSON.stringify(a));}
window.v125EnsureRegistryPrefix=function(){
  const code=expectedCode125();if(!code||typeof v14ActiveRegistryNo==='undefined')return v14ActiveRegistryNo||'';
  const old=txt(v14ActiveRegistryNo);if(!old||old.startsWith(code+'/'))return old;
  const stored=allDrafts125().find(d=>txt(d.registryNo)===old);
  if(stored?.registrationFinal)return old; // registered records never get renumbered.
  const year=new Date().getFullYear(),tc=typeCode125(),seqKey=`registryProSeq:${code}:${year}:${tc}`;
  let n=num(localStorage.getItem(seqKey))+1,newNo='';
  const used=new Set(allDrafts125().map(d=>txt(d.registryNo)));
  do{newNo=`${code}/${year}/${tc}/${String(n).padStart(5,'0')}`;n++;}while(used.has(newNo));
  localStorage.setItem(seqKey,String(n-1));
  const arr=allDrafts125();let changed=false;
  arr.forEach(d=>{if(txt(d.registryNo)===old&&!d.registrationFinal){d.registryNo=newNo;changed=true;}});
  if(changed)saveDrafts125(arr);
  v14ActiveRegistryNo=newNo;
  try{if(v14LastOpenedDraft?.registryNo===old)v14LastOpenedDraft.registryNo=newNo;}catch(_){}
  try{if(v13LastCompletedDraft?.registryNo===old&&!v13LastCompletedDraft.registrationFinal)v13LastCompletedDraft.registryNo=newNo;}catch(_){}
  try{updateDraftNumberMini?.();}catch(_){}
  return newNo;
};
const jurBase125=window.v120DraftJurisdictionChanged;
if(typeof jurBase125==='function')window.v120DraftJurisdictionChanged=function(){const out=jurBase125.apply(this,arguments);setTimeout(()=>window.v125EnsureRegistryPrefix(),0);return out;};

// Hard-gate every relevant save path, while retaining all existing validations inside the wrapped functions.
const draftNextBase125=window.draftNext;
if(typeof draftNextBase125==='function')window.draftNext=function(){
  const step=Number(window.currentDraftStep||((typeof currentDraftStep!=='undefined')?currentDraftStep:1)||1);
  if(step>=4&&!window.v125PaymentExact(true))return;
  window.v125EnsureRegistryPrefix();
  return draftNextBase125.apply(this,arguments);
};
const checkBase125=window.v18GenerateCheckingCopy;
if(typeof checkBase125==='function')window.v18GenerateCheckingCopy=function(){if(!window.v125PaymentExact(true))return;window.v125EnsureRegistryPrefix();return checkBase125.apply(this,arguments);};
const approveBase125=window.v18ApproveFinal;
if(typeof approveBase125==='function')window.v18ApproveFinal=function(){if(!window.v125PaymentExact(true))return;window.v125EnsureRegistryPrefix();return approveBase125.apply(this,arguments);};
const saveStatusBase125=window.v18SaveStatus;
if(typeof saveStatusBase125==='function')window.v18SaveStatus=function(){window.v125EnsureRegistryPrefix();return saveStatusBase125.apply(this,arguments);};

function english125(v){
  const s=txt(v);if(!s)return '-';
  try{if(/[\u0900-\u097F]/.test(s)&&typeof v192SmartEnglishRaw==='function')return txt(v192SmartEnglishRaw(s))||s;}catch(_){}
  return s;
}
function advocateInfo125(d={}){
  const p=read(PROFILE_KEY,{}),book=read(PROFILE_BOOK_KEY,[]),adv=read(ADV_KEY,[]),mob=txt(d?.ownerAdvocateMobile||d?.advocate?.mobile||p.mobile).replace(/\D/g,'').slice(-10),name=txt(d?.ownerAdvocate||d?.advocate?.name||p.name);
  const same=x=>{const xm=txt(x?.mobile).replace(/\D/g,'').slice(-10);return (mob&&xm===mob)||(!mob&&name&&txt(x?.name).toLowerCase()===name.toLowerCase());};
  const bp=Array.isArray(book)?book.find(same)||{}:{},aa=Array.isArray(adv)?adv.find(same)||{}:{};
  const src=(p&&same(p))?p:bp;
  return {
    name:english125(src.name||aa.name||name||'-'),
    court:english125(src.courtName||aa.compound||aa.tehsilCompound||d?.agri?.advocateOffice||'-'),
    mobile:txt(src.mobile||aa.mobile||d?.advocate?.mobile||mob||'-').replace(/\D/g,'').slice(-10)||'-',
    regd:english125(src.regdNo||aa.regdNo||aa.enrollment||d?.advocate?.enrollment||'-')
  };
}
function activeDraft125(){try{return (typeof v111ResolveDraft==='function'?v111ResolveDraft():null)||allDrafts125().find(x=>txt(x.registryNo)===txt(v14ActiveRegistryNo))||draftData();}catch(_){return {};}}
window.v125FormatAdvocateBlock=function(root=document,d=activeDraft125()){
  const scope=root?.querySelector?root:document;
  scope.querySelectorAll?.('.v120-advocate-english,.v125-advocate-lines').forEach(x=>x.remove());
  const pages=[...(scope.querySelectorAll?.('.deed-page')||[])];if(!pages.length)return;
  const last=pages[pages.length-1],a=advocateInfo125(d);
  const lines=last.querySelector('.v110-final-lines,.deed-footer-lines')||last;
  // Keep execution date; remove only old drafted-by paragraph(s).
  [...(lines.querySelectorAll?.('p')||[])].forEach(p=>{if(/Drafted\s*By|ड्राफ्टिड|Advocate:\s*/i.test(txt(p.textContent)))p.remove();});
  const block=document.createElement('div');block.className='v125-advocate-lines';
  block.innerHTML=`<div><b>Advocate:</b> ${esc125(a.name)}</div><div><b>Compound:</b> ${esc125(a.court)}</div><div><b>Mobile:</b> ${esc125(a.mobile)}</div><div><b>Regd. No.:</b> ${esc125(a.regd)}</div>`;
  lines.appendChild(block);
};
const syncBase125=window.syncDraftPreview;
if(typeof syncBase125==='function')window.syncDraftPreview=function(){const out=syncBase125.apply(this,arguments);try{window.v125FormatAdvocateBlock(document,activeDraft125());}catch(_){}return out;};
// One Back from draft step-1 goes straight to main dashboard; no intermediate type picker.
window.v120DraftBack=function(){
  const steps=byId('draftStepsScreen'),type=byId('draftTypeScreen'),step=Number(window.currentDraftStep||((typeof currentDraftStep!=='undefined')?currentDraftStep:1)||1);
  if(steps?.classList.contains('active')&&step>1){try{goDraftStep(step-1);}catch(_){}return;}
  if(steps?.classList.contains('active')||type?.classList.contains('active')){
    try{if(history.state?.rpView==='draft'){history.back();return;}}catch(_){}
    try{showDashboard?.();}catch(_){}return;
  }
  try{showDashboard?.();}catch(_){}
};
window.v116DraftBack=window.v120DraftBack;window.v115DraftBack=window.v120DraftBack;window.v114DraftBackTop=window.v120DraftBack;

// Clean printing: clone only the deed into a dedicated print root, so hidden form/dashboard layout cannot create blank pages.
function preparePrint125(){
  try{document.getElementById('v125PrintRoot')?.remove();}catch(_){}
  const src=byId('legalDraftPreview')||document.querySelector('.v120-pdf-document');if(!src)return;
  try{window.v125FormatAdvocateBlock(src,activeDraft125());}catch(_){}
  const root=document.createElement('div');root.id='v125PrintRoot';root.innerHTML=src.innerHTML;document.body.appendChild(root);
  try{window.v125FormatAdvocateBlock(root,activeDraft125());}catch(_){}
  document.body.classList.add('v125-print-clean');
}
function cleanupPrint125(){document.body.classList.remove('v125-print-clean');document.getElementById('v125PrintRoot')?.remove();}
window.addEventListener('beforeprint',preparePrint125);
window.addEventListener('afterprint',()=>setTimeout(cleanupPrint125,0));

// Update title/version marker.
function init125(){
  
  try{window.v125PaymentExact(false);}catch(_){}
  try{window.v125FormatAdvocateBlock(document,activeDraft125());}catch(_){}
  console.info('Registry Pro v1.20.3 loaded — payment / PDF / drafted-by / navigation / prefix fixes');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init125,260),{once:true});else setTimeout(init125,260);
})();
