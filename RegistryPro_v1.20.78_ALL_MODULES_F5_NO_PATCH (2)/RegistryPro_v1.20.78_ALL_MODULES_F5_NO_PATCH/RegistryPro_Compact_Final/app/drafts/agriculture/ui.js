/* Registry Pro clean source module. Edit this file directly; no runtime patch loader. */

/* ===== Source: agri.js ===== */
/* Registry Pro v1.20 — Agriculture Circle-Rate & Layout Final Patch
   Base: v1.19.2.1 Rule Auto Fixed
   Scope: Agriculture drafting flow only. Existing Typist/Advocate, mutation, property,
   saved-draft, approval and PDF workflows are intentionally left intact.
*/
(function(){
'use strict';
const V123_VERSION='v1.20.1 Agriculture Distance Fixed';
let v123ManualDistanceRate=false;
let v123Busy=false;

const byId=id=>document.getElementById(id);
const str=v=>String(v??'').trim();
const num=v=>{const n=parseFloat(v);return Number.isFinite(n)?n:0;};
const safeCall=(fn,...args)=>{try{return typeof fn==='function'?fn(...args):undefined;}catch(e){console.warn('v1.20',e);}};
const esc123=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
function norm(v){
  return str(v).toLowerCase().normalize('NFKC')
    .replace(/\([^)]*\)/g,' ')
    .replace(/[\s._\-–—/\\,;:]+/g,'')
    .replace(/मुस्तहकम|अहतमाल|जदीद|पुराना/g,'');
}
function isAgri(){try{return !!isAgricultureMode();}catch(_){return /agriculture|कृषि/i.test(String(window.registrySelectedType||''));}}
function currentTehsil123(){
  try{return str(currentJurisdiction?.().tehsil||byId('dashTehsil')?.value||byId('draftTehsil')?.value||'');}
  catch(_){return str(byId('dashTehsil')?.value||byId('draftTehsil')?.value||'');}
}
function currentVillage123(){return str(byId('village')?.value||byId('villageSearch')?.value||selectedCircleLocation?.name||'');}
function currentRateKey123(){
  const sel=byId('circleRateSelect'),opt=sel?.selectedOptions?.[0];
  return str(opt?.dataset?.rateKey||selectedCircleRateKey||'agri')||'agri';
}
function currentBaseRate123(){return num(byId('circleRateSelect')?.value||0);}
function fmtRate123(rate,key=currentRateKey123()){
  if(!rate)return '₹0';
  return key==='agri'?`₹${Number(rate).toLocaleString('en-IN',{maximumFractionDigits:2})} लाख/हेक्टेयर`:`₹${Number(rate).toLocaleString('en-IN',{maximumFractionDigits:2})}/m²`;
}
function humanCategory123(cat){
  if(cat==='0-50')return '0–50 Meter';
  if(cat==='51-200')return '51–200 Meter';
  if(cat==='200+')return 'More than 200 Meter';
  return cat||'Not selected';
}
function isMajorRoadRow123(r){return !!r&&(!!r.route||r.nonAgriFar!=null||/प्रमुख\s*मार्ग|major\s*road/i.test(str(r.section)));
}
function rowMatchesVillage123(row,village){
  const q=norm(village);if(!q)return false;
  const vals=[row?.name,row?.alias,row?.searchText].filter(Boolean).map(norm).filter(Boolean);
  return vals.some(x=>x===q||(q.length>=4&&x.includes(q))||(x.length>=4&&q.includes(x)));
}
function rowTehsilOk123(row){try{return typeof v14CircleRowInTehsil==='function'?v14CircleRowInTehsil(row,currentTehsil123()):true;}catch(_){return true;}}
function candidateScore123(row,village,key,cat){
  const q=norm(village),rn=norm(row?.name),ra=norm(row?.alias);let s=0;
  if(rn===q)s+=100;if(ra===q)s+=90;if(rn.includes(q)||q.includes(rn))s+=45;if(ra&& (ra.includes(q)||q.includes(ra)))s+=35;
  if(row?.route)s+=10;if(row?.nonAgriFar!=null)s+=8;
  const rv=cat==='51-200'&&key==='nonAgri'?num(row?.nonAgriFar):num(row?.[key]);
  if(rv>0)s+=5;
  return s;
}
function roadCandidates123(village=currentVillage123(),key=currentRateKey123(),cat=str(byId('v123DistanceCategory')?.value||'0-50')){
  if(typeof CIRCLE_RATE_DATA==='undefined')return [];
  return CIRCLE_RATE_DATA.filter(r=>rowTehsilOk123(r)&&isMajorRoadRow123(r)&&rowMatchesVillage123(r,village))
    .map(r=>({row:r,score:candidateScore123(r,village,key,cat)}))
    .sort((a,b)=>b.score-a.score||num(b.row?.[key])-num(a.row?.[key])||num(a.row?.page)-num(b.row?.page));
}
function normalBaseRow123(village=currentVillage123(),key=currentRateKey123()){
  const selected=(typeof selectedCircleLocation!=='undefined'?selectedCircleLocation:null);
  if(selected&&!isMajorRoadRow123(selected)&&num(selected?.[key])>0)return selected;
  if(typeof CIRCLE_RATE_DATA==='undefined')return selected||null;
  return CIRCLE_RATE_DATA.filter(r=>rowTehsilOk123(r)&&!isMajorRoadRow123(r)&&rowMatchesVillage123(r,village)&&num(r?.[key])>0)
    .sort((a,b)=>{const q=norm(village);return (norm(b.name)===q?1:0)-(norm(a.name)===q?1:0)||num(a.page)-num(b.page);})[0]||(!isMajorRoadRow123(selected)?selected:null)||null;
}
function resolveDistanceRate123(cat=str(byId('v123DistanceCategory')?.value||'')){
  const key=currentRateKey123(),base=currentBaseRate123(),village=currentVillage123();
  if(!cat)return {key,base,rate:base,source:'Main-road distance not selected',page:selectedCircleLocation?.page||'',route:'',road:null,normal:normalBaseRow123(village,key),supported:false,ambiguous:false,candidates:[]};
  const candidates=roadCandidates123(village,key,cat),road=candidates[0]?.row||null,normal=normalBaseRow123(village,key);
  let rate=base,source='Selected circle-rate row',page=selectedCircleLocation?.page||'',route='',supported=false;
  if(cat==='200+'){
    const normalRate=num(normal?.[key]);
    if(normalRate>0){rate=normalRate;supported=true;source='Normal village/base rate (>200m)';page=normal?.page||page;}
  }else if(road){
    let rv=0;
    if(key==='nonAgri')rv=cat==='51-200'?num(road.nonAgriFar):num(road.nonAgri);
    else if(key==='agri')rv=num(road.agri); // official major-road table: agriculture rate up to 200m
    else rv=num(road[key]);
    if(rv>0){rate=rv;supported=true;source=key==='agri'?'Official main-road agriculture rate (up to 200m)':cat==='51-200'?'Official 51–200m road rate':'Official 0–50m road rate';page=road.page||page;route=road.route||'';}
  }
  const ambiguous=candidates.length>1&&candidates[0].score===candidates[1].score;
  return {key,base,rate,source,page,route,road,normal,supported,ambiguous,candidates};
}
function distanceText123(cat){
  if(cat==='0-50')return 'प्रमुख/मुख्य मार्ग से 0 से 50 मीटर की दूरी पर स्थित है।';
  if(cat==='51-200')return 'प्रमुख/मुख्य मार्ग से 51 से 200 मीटर की दूरी पर स्थित है।';
  if(cat==='200+')return 'प्रमुख/मुख्य मार्ग से 200 मीटर से अधिक दूरी पर स्थित है।';
  return '';
}

function buildDistanceSelector123(rateGrid){
  const road=byId('roadWidth')?.closest('div');if(!rateGrid||!road)return;
  // v1.20.1: the selector is also present statically in HTML so it can never disappear
  // because of draft-screen rebuild timing. Keep the dynamic fallback for older cached HTML.
  const existing=byId('v123DistanceWrap');
  if(existing){
    rateGrid.classList.add('v123-rate-grid');
    if(existing.parentElement!==rateGrid) rateGrid.insertBefore(existing,road);
    else if(existing.nextElementSibling!==road) rateGrid.insertBefore(existing,road);
    return;
  }
  const wrap=document.createElement('div');wrap.id='v123DistanceWrap';wrap.className='v123-distance-wrap agri-only';
  wrap.innerHTML=`<label>Main Road Distance / मुख्य मार्ग से दूरी <span class="req">*</span></label>
    <select id="v123DistanceCategory" onchange="v123DistanceChanged()">
      <option value="">SELECT MAIN ROAD DISTANCE</option>
      <option value="0-50">LESS THAN 50 METER</option>
      <option value="51-200">MORE THAN 50 METER BUT LESS THAN / EQUAL TO 200 METER</option>
      <option value="200+">MORE THAN 200 METER</option>
    </select>
    <div id="v123DistanceHint" class="v123-distance-hint">Distance select karte hi applicable official rate auto check hoga.</div>`;
  rateGrid.insertBefore(wrap,road);rateGrid.classList.add('v123-rate-grid');
}
function buildSummary123(rebate){
  if(byId('v123CircleSummary')||!rebate)return;
  const box=document.createElement('div');box.id='v123CircleSummary';box.className='v123-circle-summary agri-only';
  box.innerHTML=`<div class="v123-summary-title"><strong>Circle Rate / Main Road Summary</strong><small id="v123SummarySource">Auto from mapped circle-rate data • Editable</small></div>
    <div class="v123-summary-grid">
      <div><label>Base Rate</label><input id="v123BaseRateView" readonly></div>
      <div><label>Distance Category</label><input id="v123DistanceView" readonly></div>
      <div><label>Distance Rate <small>Editable</small></label><input id="v123DistanceRate" type="number" min="0" step="0.01" oninput="v123DistanceRateEdited()"></div>
      <div><label>Rule / PDF Page</label><input id="v123RulePageView" readonly></div>
      <div><label>Road Width Premium</label><input id="v123RoadPremiumView" readonly></div>
      <div><label>Final Circle Rate</label><input id="v123FinalRateView" readonly></div>
    </div>
    <div id="v123RouteNote" class="v123-route-note"></div>`;
  rebate.insertAdjacentElement('afterend',box);
}
function buildPrevious123(agri){
  if(byId('v123PreviousTitleHolder')||!agri)return;
  const box=document.createElement('div');box.id='v123PreviousTitleHolder';box.className='v123-prev-card';
  box.innerHTML=`<div class="v123-prev-head"><div><h3>Previous Buyer / Title Holder Reference</h3><small>Old registry / title reference • structured fields</small></div></div>
    <div class="v123-prev-grid">
      <div class="v123-prev-name"><label>Name / नाम</label><input id="v123PrevName" oninput="v123PrevChanged()"></div>
      <div class="v123-prev-address"><label>Address / पता</label><input id="v123PrevAddress" oninput="v123PrevChanged()"></div>
      <div><label>Regn No.</label><input id="v123PrevRegNo" oninput="v123PrevChanged()"></div>
      <div><label>Date</label><input id="v123PrevDate" type="date" onchange="v123PrevChanged()"></div>
      <div><label>Jild No.</label><input id="v123PrevJild" oninput="v123PrevChanged()"></div>
      <div><label>Page From</label><input id="v123PrevPageFrom" oninput="v123PrevChanged()"></div>
      <div><label>Page To</label><input id="v123PrevPageTo" oninput="v123PrevChanged()"></div>
      <div><label>Bahi No.</label><input id="v123PrevBahi" oninput="v123PrevChanged()"></div>
      <div><label>Office</label><input id="v123PrevOffice" placeholder="Roorkee / First Office" oninput="v123PrevChanged()"></div>
    </div>`;
  agri.appendChild(box);
}
function restructureAgri123(){
  const agri=byId('agricultureDeedFields');if(!agri)return;
  safeCall(window.v18InjectRoadMappingPanel);
  const main=byId('mainRoadDistance')?.closest('.form-grid');
  let gata=byId('v123GataBlock');
  if(!gata){
    const tbody=byId('agriGataRows');if(tbody){
      const tableWrap=tbody.closest('.gata-table-wrap'),add=agri.querySelector('button[onclick*="addAgriGataRow"]');
      let heading=null,recordGrid=null;
      for(let n=tableWrap?.previousElementSibling;n;n=n.previousElementSibling){
        if(n.matches?.('.form-grid'))recordGrid=n;
        if(n.matches?.('h3.agri-subheading')){heading=n;break;}
      }
      gata=document.createElement('div');gata.id='v123GataBlock';gata.className='v123-gata-block';
      if(heading)gata.appendChild(heading);if(recordGrid)gata.appendChild(recordGrid);if(tableWrap)gata.appendChild(tableWrap);if(add)gata.appendChild(add);
    }
  }
  const addBtn=agri.querySelector('button[onclick*="addAgriGataRow"]');if(gata&&addBtn&&!gata.contains(addBtn))gata.appendChild(addBtn);
  const map=byId('v18RoadDistanceCategory')?.closest('.v18-road-map-panel');
  const head=agri.querySelector('.agri-panel-head');
  if(main){main.classList.add('v123-main-road-row');const ta=byId('mainRoadDistance');if(ta)ta.rows=1;agri.insertBefore(main,head);}
  if(gata)agri.insertBefore(gata,head);
  if(map){map.classList.add('v123-road-map-compact');agri.insertBefore(map,head);}
  buildPrevious123(agri);
}
function v123Build(){
  const first=byId('draftStep1')?.querySelector('.form-card');if(!first)return false;
  const grid=first.querySelector('.form-grid.three');buildDistanceSelector123(grid);
  buildSummary123(first.querySelector('.rebate-panel'));
  restructureAgri123();
  v123SyncVisibility();return true;
}
function v123SyncVisibility(){
  const ag=isAgri(),step=byId('draftStep1');if(step)step.classList.toggle('v123-agri-active',ag);
  const old=step?.querySelector('.previous-title-holder-row');if(old)old.style.display=ag?'none':'';
  [byId('v123DistanceWrap'),byId('v123CircleSummary')].forEach(e=>{if(e)e.style.display=ag?'':'none';});
  if(ag){
    const map=byId('v18RoadDistanceCategory');const top=byId('v123DistanceCategory');if(map&&top&&map.value&&map.value!=='manual')top.value=map.value;
    v123UpdateDistanceText(false);safeCall(window.recalculate);
  }
}
function v123UpdateDistanceText(force=true){
  const cat=str(byId('v123DistanceCategory')?.value);if(!cat)return;
  const text=distanceText123(cat),e=byId('mainRoadDistance');
  if(e&&(force||!str(e.value)||/प्रमुख\/मुख्य मार्ग से .*मीटर/.test(e.value)))e.value=text;
}
window.v123DistanceChanged=function(){
  if(v123Busy)return;v123Busy=true;
  try{
    v123ManualDistanceRate=false;const cat=str(byId('v123DistanceCategory')?.value);
    const map=byId('v18RoadDistanceCategory');if(map){map.value=cat;safeCall(window.v18RoadCategoryManualChanged);}
    else v123UpdateDistanceText(true);
    safeCall(window.recalculate);safeCall(window.recalculateStampDuty);safeCall(window.syncDraftPreview);
  }finally{v123Busy=false;}
};
window.v123DistanceRateEdited=function(){v123ManualDistanceRate=true;safeCall(window.recalculate);safeCall(window.recalculateStampDuty);safeCall(window.syncDraftPreview);};
function previousData123(){return {name:str(byId('v123PrevName')?.value),address:str(byId('v123PrevAddress')?.value),regNo:str(byId('v123PrevRegNo')?.value),date:str(byId('v123PrevDate')?.value),jildNo:str(byId('v123PrevJild')?.value),pageFrom:str(byId('v123PrevPageFrom')?.value),pageTo:str(byId('v123PrevPageTo')?.value),bahiNo:str(byId('v123PrevBahi')?.value),office:str(byId('v123PrevOffice')?.value)};}
function previousText123(p=previousData123()){
  return [p.name,p.address,p.regNo&&`Regn ${p.regNo}`,p.date&&`Date ${p.date}`,p.jildNo&&`Jild ${p.jildNo}`,(p.pageFrom||p.pageTo)&&`Page ${p.pageFrom||'-'} to ${p.pageTo||'-'}`,p.bahiNo&&`Bahi ${p.bahiNo}`,p.office].filter(Boolean).join(' • ');
}
window.v123PrevChanged=function(){const old=byId('previousTitleHolderText');if(old)old.value=previousText123();safeCall(window.syncDraftPreview);};
function setPrevious123(p={}){[['v123PrevName','name'],['v123PrevAddress','address'],['v123PrevRegNo','regNo'],['v123PrevDate','date'],['v123PrevJild','jildNo'],['v123PrevPageFrom','pageFrom'],['v123PrevPageTo','pageTo'],['v123PrevBahi','bahiNo'],['v123PrevOffice','office']].forEach(([id,k])=>{const e=byId(id);if(e)e.value=p?.[k]??'';});window.v123PrevChanged?.();}

function updateSummary123(c){
  if(!isAgri())return;
  const cat=str(byId('v123DistanceCategory')?.value),res=resolveDistanceRate123(cat),manual=v123ManualDistanceRate,numRate=num(byId('v123DistanceRate')?.value),dist=manual&&numRate>0?numRate:res.rate;
  const rw=safeCall(window.roadWidthInfo)||{percent:0,factor:1,label:''},final=dist*(num(rw.factor)||1);
  const set=(id,val)=>{const e=byId(id);if(e&&e.value!==String(val??''))e.value=val??'';};
  set('v123BaseRateView',fmtRate123(res.base,res.key));set('v123DistanceView',humanCategory123(cat));
  if(!manual)set('v123DistanceRate',dist?String(dist):'');
  const rulePage=str(byId('v18RoadSourcePage')?.value);const pages=[res.page&&`Rate p${res.page}`,rulePage&&`Rule p${rulePage}`].filter(Boolean).join(' • ');set('v123RulePageView',pages||'Verify');set('v123RoadPremiumView',`${num(rw.percent)>0?'+':''}${num(rw.percent)}%`);set('v123FinalRateView',fmtRate123(final,res.key));
  const src=byId('v123SummarySource');if(src)src.textContent=`${manual?'Manual override':'Auto'} • ${res.source}${res.page?` • PDF page ${res.page}`:''}`;
  const route=byId('v123RouteNote');if(route){let t=res.route?`Applicable road: ${res.route}`:'';if(res.ambiguous)t+=(t?' • ':'')+'Multiple official road rows match; best exact/highest-priority match selected. Rate remains editable.';if(!res.supported)t=(t?t+' • ':'')+'Separate distance rate not found in structured row; base rate kept, please verify official PDF.';route.textContent=t;route.classList.toggle('warn',!res.supported||res.ambiguous);}
  const hint=byId('v123DistanceHint');if(hint)hint.textContent=res.supported?`${humanCategory123(cat)} → ${fmtRate123(dist,res.key)} • source page ${res.page||'-'}`:'Separate distance rate not mapped; current base rate retained (editable).';
  return {res,dist,final,rw};
}

// Recalculate Agriculture valuation after distance rate, then road-width premium.
const v123RecalculateBase=window.recalculate;
window.recalculate=function(){
  const c=typeof v123RecalculateBase==='function'?v123RecalculateBase.apply(this,arguments):{};
  if(!isAgri()||!byId('v123DistanceCategory'))return c;
  const map=byId('v18RoadDistanceCategory'),top=byId('v123DistanceCategory');
  if(map&&top&&map.value&&map.value!=='manual'&&top.value!==map.value){top.value=map.value;v123ManualDistanceRate=false;}
  const cat=str(top?.value||''),res=resolveDistanceRate123(cat);
  const currentManual=num(byId('v123DistanceRate')?.value),distanceRate=(v123ManualDistanceRate&&currentManual>0)?currentManual:res.rate;
  const rw=safeCall(window.roadWidthInfo)||{factor:1,percent:0,label:''};const factor=num(rw.factor)||1,finalRate=distanceRate*factor;
  const area=c?.area||safeCall(window.calculateArea)||{m2:0,hectare:0};const ha=Number(area?.hectare??(num(area?.m2)/10000))||0;
  const landValue=res.key==='agri'?ha*finalRate*100000:num(area?.m2)*finalRate;
  let improvement=0;try{const a=typeof updateAgriEnhancementUI==='function'?updateAgriEnhancementUI(landValue):null;improvement=num(a?.total);}catch(_){try{improvement=num(agriEnhancementValue?.().total);}catch(__){}}
  const total=landValue+improvement;
  const hidden=byId('circleRate');if(hidden)hidden.value=finalRate?String(finalRate):'';
  const cr=byId('circleRateOut');if(cr)cr.textContent=fmtRate123(finalRate,res.key);
  const vo=byId('valueOut');if(vo)vo.textContent=typeof inr==='function'?inr(total):String(total);
  const pv=byId('plotValueDisplay');if(pv)pv.value=typeof inr==='function'?inr(total):String(total);
  const note=byId('roadRateNote');if(note)note.innerHTML=`Base: <strong>${fmtRate123(res.base,res.key)}</strong> &nbsp; → Distance: <strong>${fmtRate123(distanceRate,res.key)}</strong> &nbsp; + Road Width: <strong>${num(rw.percent)}%</strong> &nbsp; = Final: <strong>${fmtRate123(finalRate,res.key)}</strong>`;
  const detail=byId('circleRateDetail');if(detail)detail.textContent=`Distance ${humanCategory123(cat)} + Road Width ${num(rw.percent)}%`;
  Object.assign(c,{baseRate:res.base,distanceRate,distanceRateAuto:res.rate,distanceRateSource:res.source,distanceSourcePage:res.page,distanceCategory:cat,finalRate,rate:finalRate,road:factor,roadPercent:num(rw.percent),roadLabel:rw.label,landValue,improvementValue:improvement,plot:total,rateKey:res.key});
  updateSummary123(c);return c;
};

// Keep top selector and compact map selector synchronized, including official Khasra auto rules.
const v123AutoKhasraBase=window.v18AutoApplyKhasraDistance;
window.v18AutoApplyKhasraDistance=function(){
  const out=typeof v123AutoKhasraBase==='function'?v123AutoKhasraBase.apply(this,arguments):undefined;
  if(!isAgri())return out;if(!byId('v123DistanceCategory')||!byId('v123CircleSummary'))v123Build();const m=byId('v18RoadDistanceCategory'),t=byId('v123DistanceCategory');if(m&&t&&m.value&&m.value!=='manual'){t.value=m.value;v123ManualDistanceRate=false;v123UpdateDistanceText(false);safeCall(window.recalculate);safeCall(window.recalculateStampDuty);}
  return out;
};
const v123ManualMapBase=window.v18RoadCategoryManualChanged;
window.v18RoadCategoryManualChanged=function(){
  const out=typeof v123ManualMapBase==='function'?v123ManualMapBase.apply(this,arguments):undefined;
  if(!v123Busy){const m=byId('v18RoadDistanceCategory'),t=byId('v123DistanceCategory');if(m&&t&&m.value&&m.value!=='manual'){t.value=m.value;v123ManualDistanceRate=false;safeCall(window.recalculate);safeCall(window.recalculateStampDuty);}}
  return out;
};

// Reset automatic distance rate when official location/rate changes.
function resetAuto123(){v123ManualDistanceRate=false;v123Build();safeCall(window.recalculate);safeCall(window.recalculateStampDuty);safeCall(window.v18AutoApplyKhasraDistance);}
const v123SelectCircleBase=window.selectCircleLocation;window.selectCircleLocation=function(){const out=v123SelectCircleBase?.apply(this,arguments);resetAuto123();return out;};
const v123ChooseLandRateBase=window.chooseLandRate;window.chooseLandRate=function(){const out=v123ChooseLandRateBase?.apply(this,arguments);resetAuto123();return out;};

// Persist new agriculture values while retaining all old fields for compatibility.
const v123DraftDataBase=window.draftData;
window.draftData=function(){
  const d=v123DraftDataBase.apply(this,arguments);if(!isAgri())return d;
  const c=safeCall(window.recalculate)||{},p=previousData123();d.templateVersion='v1.20';d.agri=d.agri||{};
  d.agri.roadDistanceCategory=str(byId('v123DistanceCategory')?.value||d.agri.roadDistanceCategory||'');
  d.agri.mainRoadDistance=str(byId('mainRoadDistance')?.value||d.agri.mainRoadDistance||'');
  d.agri.distanceAdjustedCircleRate=num(c.distanceRate);d.agri.distanceAutoCircleRate=num(c.distanceRateAuto);d.agri.distanceManualOverride=!!v123ManualDistanceRate;
  d.agri.distanceRateSource=str(c.distanceRateSource||'');d.agri.distanceRateSourcePage=str(c.distanceSourcePage||'');
  d.previousTitleHolder=p;d.previousTitleHolderText=previousText123(p);return d;
};

const v123LoadBase=window.v14LoadDraftFields;
window.v14LoadDraftFields=function(d){
  const out=v123LoadBase.apply(this,arguments);v123Build();if(!isAgri())return out;
  const a=d?.agri||{},cat=a.roadDistanceCategory||d?.ruleEngine?.roadDistanceCategory;if(cat&&byId('v123DistanceCategory'))byId('v123DistanceCategory').value=cat;
  v123ManualDistanceRate=!!a.distanceManualOverride;if(v123ManualDistanceRate&&num(a.distanceAdjustedCircleRate)>0&&byId('v123DistanceRate'))byId('v123DistanceRate').value=a.distanceAdjustedCircleRate;
  if(d?.previousTitleHolder)setPrevious123(d.previousTitleHolder);else if(d?.previousTitleHolderText&&byId('previousTitleHolderText'))byId('previousTitleHolderText').value=d.previousTitleHolderText;
  v123UpdateDistanceText(false);safeCall(window.v18AutoApplyKhasraDistance);safeCall(window.recalculate);safeCall(window.recalculateStampDuty);return out;
};

// Buyer -> Seller / Next Sale: also carry structured previous-title details.
const v123NextSaleBase=window.createNextSaleFromDraft;
window.createNextSaleFromDraft=function(registryNo){
  let src=null;try{src=v14AllDrafts?.().find(x=>x.registryNo===registryNo)||null;}catch(_){}
  const out=v123NextSaleBase.apply(this,arguments);
  if(src){
    v123Build();let p={};try{p=(normalizePartyList(src.buyers,src.buyer)||[])[0]||src.buyer||{};}catch(_){p=src.buyer||{};}
    const bp=str(src.registration?.bookPage||'');let pf=bp,pt='';const m=bp.match(/^\s*([^\-–]+)\s*[\-–]\s*(.+)\s*$/);if(m){pf=str(m[1]);pt=str(m[2]);}
    setPrevious123({name:p.name||'',address:p.address||'',regNo:src.registration?.regNo||src.registryNo||'',date:str(src.registration?.date||'').slice(0,10),jildNo:src.registration?.jildNo||'',pageFrom:pf,pageTo:pt,bahiNo:src.registration?.bahiNo||src.registration?.bookNo||'',office:src.registration?.office||src.agri?.advocateOffice||''});
    safeCall(window.saveDraftV04,false);
  }
  return out;
};

// Rebuild/sync when draft type or registry screen changes.
const v123SelectTypeBase=window.selectPropertyType;window.selectPropertyType=function(){const out=v123SelectTypeBase?.apply(this,arguments);v123Build();v123SyncVisibility();return out;};
const v123OpenNewBase=window.openNewRegistry;window.openNewRegistry=function(){const out=v123OpenNewBase?.apply(this,arguments);v123Build();v123SyncVisibility();return out;};
if(typeof window.applyDraftTypeFieldVisibility==='function'){
  const b=window.applyDraftTypeFieldVisibility;window.applyDraftTypeFieldVisibility=function(){const out=b.apply(this,arguments);v123SyncVisibility();return out;};
}

window.v123Build=v123Build;
window.v123SyncVisibility=v123SyncVisibility;
function init123(){
  if(!v123Build())return;
  const road=byId('roadWidth');if(road&&!road.dataset.v123Hook){road.dataset.v123Hook='1';road.addEventListener('change',()=>{safeCall(window.recalculate);safeCall(window.recalculateStampDuty);});}
  // Keep old rule panel compact and source button accurate.
  const map=byId('v18RoadDistanceCategory')?.closest('.v18-road-map-panel');if(map)map.classList.add('v123-road-map-compact');
  v123SyncVisibility();safeCall(window.recalculate);
  console.info('Registry Pro v1.20.1 loaded — Agriculture distance selector render fix');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init123,{once:true});else init123();
})();

/* ===== Source: agri-stability.js ===== */
/* Registry Pro v1.20.2 — Agriculture Final Stability & Layout Fixes
   Scope only: Agriculture Step-1 UX. Other Registry Pro workflows are untouched.
*/
(function(){
'use strict';
const byId=id=>document.getElementById(id);
const text=v=>String(v??'').trim();
let boundaryOrigin=null;

function isAgri124(){try{return !!window.isAgricultureMode?.();}catch(_){return /agriculture|कृषि/i.test(String(window.registrySelectedType||''));}}
function qsa(sel,root=document){return [...(root?.querySelectorAll?.(sel)||[])];}
function hasPrevData(){return ['v123PrevName','v123PrevAddress','v123PrevRegNo','v123PrevDate','v123PrevJild','v123PrevPageFrom','v123PrevPageTo','v123PrevBahi','v123PrevOffice'].some(id=>text(byId(id)?.value));}

// 1) Keep the small-agriculture rule as ONE live message; never append duplicates.
window.v18SmallAgriRuleSuggestion=function(){
  const meta=byId('selectedLocationMeta');if(!meta)return;
  qsa('b',meta).forEach(b=>{if(/^Rule suggestion:\s*area/i.test(text(b.textContent))){const prev=b.previousSibling;if(prev&&prev.nodeName==='BR')prev.remove();b.remove();}});
  let box=byId('v124SmallAgriRuleWarning');
  let area=0,threshold=0,show=false;
  try{
    const loc=(typeof selectedCircleLocation!=='undefined'?selectedCircleLocation:window.selectedCircleLocation);
    const rateKey=(typeof selectedCircleRateKey!=='undefined'?selectedCircleRateKey:window.selectedCircleRateKey);
    const rules=(typeof V18_RULES!=='undefined'?V18_RULES:window.V18_RULES);
    if(isAgri124()&&loc){
      area=(Number((typeof numv==='function'?numv('agriTotalAreaHa'):byId('agriTotalAreaHa')?.value)||0)||0)*10000;
      const rural=String(loc?.section||'').includes('ग्रामीण');
      threshold=rural?Number(rules?.smallAgri?.outsideUrbanSqM||500):Number(rules?.smallAgri?.generalSqM||1000);
      show=area>0&&area<=threshold&&String(rateKey||'')==='agri';
    }
  }catch(_){show=false;}
  if(!show){box?.remove();return;}
  if(!box){box=document.createElement('div');box.id='v124SmallAgriRuleWarning';box.className='v124-live-rule-warning';meta.appendChild(box);}
  box.textContent=`Rule suggestion: area ${area.toFixed(2)} m² ≤ ${threshold} m²; verify whether non-agricultural rate must apply.`;
};

// 2) Sold-area typing must not rebuild/move the focused Gata block on every keypress.
window.updateAgriAreaFromRows=function(){
  if(!isAgri124())return;
  try{window.agriAreaManualOverride=false;}catch(_){try{agriAreaManualOverride=false;}catch(__){}}
  let total=0;
  qsa('#agriGataRows tr').forEach(tr=>{total+=Number(tr.querySelector('.gata-sold-area')?.value||tr.querySelector('.gata-area')?.value||0)||0;});
  const input=byId('agriTotalAreaHa');if(input)input.value=total>0?total.toFixed(4):'';
  try{window.updateAgriAreaDisplay?.();}catch(_){}
  try{window.recalculate?.();}catch(_){}
  try{window.recalculateStampDuty?.();}catch(_){}
};

// 3) Add Gata belongs directly below the Gata table, on the RIGHT, before Khasra Mapping.
function placeAddGata(){
  const block=byId('v123GataBlock'),agri=byId('agricultureDeedFields');if(!block||!agri)return;
  const btn=agri.querySelector('button[onclick*="addAgriGataRow"]')||block.querySelector('button[onclick*="addAgriGataRow"]');if(!btn)return;
  let actions=byId('v124GataActions');
  if(!actions){actions=document.createElement('div');actions.id='v124GataActions';actions.className='v124-gata-actions';const table=block.querySelector('.gata-table-wrap');if(table)table.insertAdjacentElement('afterend',actions);else block.appendChild(actions);}
  if(btn.parentElement!==actions)actions.appendChild(btn);
}

// 4) Agriculture Chauhadhi must sit immediately above Previous Buyer / Title Holder Reference.
function findBoundaryPair(){
  const headings=qsa('h3.subheading');const h=headings.find(x=>/Boundaries\s*\(Chauhadhi\)/i.test(text(x.textContent)));if(!h)return null;
  const grid=h.nextElementSibling;if(!grid?.classList?.contains('form-grid'))return null;return {h,grid};
}
function moveBoundaries(){
  const pair=findBoundaryPair();if(!pair)return;
  if(!boundaryOrigin)boundaryOrigin={parent:pair.h.parentNode,marker:(()=>{const m=document.createComment('v124-boundary-origin');pair.h.parentNode.insertBefore(m,pair.h);return m;})()};
  const agri=byId('agricultureDeedFields'),prev=byId('v123PreviousTitleHolder');
  if(isAgri124()&&agri&&prev){pair.h.classList.add('v124-chauhadhi-heading');pair.grid.classList.add('v124-chauhadhi-grid');agri.insertBefore(pair.h,prev);agri.insertBefore(pair.grid,prev);}
  else if(boundaryOrigin?.marker?.parentNode){const parent=boundaryOrigin.marker.parentNode;parent.insertBefore(pair.h,boundaryOrigin.marker.nextSibling);parent.insertBefore(pair.grid,pair.h.nextSibling);pair.h.classList.remove('v124-chauhadhi-heading');pair.grid.classList.remove('v124-chauhadhi-grid');}
}

// 5) Previous-title fields are optional/collapsible. Default = one compact line.
function setupPreviousToggle(){
  const card=byId('v123PreviousTitleHolder');if(!card)return;
  const head=card.querySelector('.v123-prev-head'),grid=card.querySelector('.v123-prev-grid');if(!head||!grid)return;
  grid.id='v124PrevBody';
  let toggle=byId('v124PrevToggle');
  if(!toggle){
    const label=document.createElement('label');label.className='v124-prev-toggle';label.innerHTML='<input id="v124PrevToggle" type="checkbox"> <span>Add / Show Previous Title Details</span>';head.appendChild(label);toggle=label.querySelector('input');
    toggle.addEventListener('change',()=>{syncPreviousVisibility();try{window.syncDraftPreview?.();}catch(_){}});
  }
  if(!toggle.dataset.initialized){toggle.dataset.initialized='1';toggle.checked=hasPrevData();}
  syncPreviousVisibility();
}
function syncPreviousVisibility(){
  const toggle=byId('v124PrevToggle'),body=byId('v124PrevBody');if(!toggle||!body)return;
  body.hidden=!toggle.checked;body.setAttribute('aria-hidden',toggle.checked?'false':'true');
  byId('v123PreviousTitleHolder')?.classList.toggle('v124-prev-open',toggle.checked);
}

// If Buyer→Seller auto-carries previous title data, automatically expand the optional section.
const oldPrevChanged=window.v123PrevChanged;
window.v123PrevChanged=function(){const out=typeof oldPrevChanged==='function'?oldPrevChanged.apply(this,arguments):undefined;setupPreviousToggle();if(hasPrevData()){const t=byId('v124PrevToggle');if(t&&!t.checked){t.checked=true;syncPreviousVisibility();}}return out;};

// Save the toggle state; when OFF, previous-title data is intentionally omitted from this draft.
const oldDraftData=window.draftData;
window.draftData=function(){const d=oldDraftData.apply(this,arguments);if(!isAgri124())return d;const enabled=!!byId('v124PrevToggle')?.checked;d.previousTitleHolderEnabled=enabled;if(!enabled){d.previousTitleHolder={};d.previousTitleHolderText='';}return d;};
const oldLoad=window.v14LoadDraftFields;
window.v14LoadDraftFields=function(d){const out=oldLoad.apply(this,arguments);build124();const t=byId('v124PrevToggle');if(t){const p=d?.previousTitleHolder||{};const filled=Object.values(p).some(v=>text(v));t.checked=d?.previousTitleHolderEnabled===true||filled;syncPreviousVisibility();}return out;};

function build124(){
  if(!byId('agricultureDeedFields'))return false;
  placeAddGata();setupPreviousToggle();moveBoundaries();
  return true;
}
function syncMode124(){if(!build124())return;moveBoundaries();placeAddGata();setupPreviousToggle();}

// Follow property-type changes without touching other workflows.
const oldSelectType=window.selectPropertyType;
window.selectPropertyType=function(){const out=typeof oldSelectType==='function'?oldSelectType.apply(this,arguments):undefined;syncMode124();return out;};
const oldOpenNew=window.openNewRegistry;
window.openNewRegistry=function(){const out=typeof oldOpenNew==='function'?oldOpenNew.apply(this,arguments):undefined;syncMode124();return out;};

window.v124SyncMode=syncMode124;
function init(){
  if(!build124())return;
  console.info('Registry Pro v1.20.2 loaded — agriculture final stability/layout fixes');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* ===== Source: agriculture-compact.js ===== */
/* Registry Pro v1.20.16 — approved compact Agriculture Step-1 layout.
   Layout-only patch: existing fields, IDs, events and calculation functions are retained. */
(function(){
'use strict';

const byId=id=>document.getElementById(id);
const text=v=>String(v??'').trim();
const state={calc:null,transaction:null,recordsCard:null,wrapped:false};

function isAgriculture(){
  try{return !!window.isAgricultureMode?.();}
  catch(_){return /agriculture|कृषि/i.test(text(window.registrySelectedType));}
}

function fieldFor(id){
  const el=byId(id);if(!el)return null;
  return el.closest('.full')||el.parentElement;
}

function remember(node,key){
  if(!node||state[key])return;
  const marker=document.createComment(`v1216-${key}-origin`);
  node.parentNode?.insertBefore(marker,node);
  state[key]={node,marker};
}

function restore(key){
  const item=state[key];
  if(item?.node&&item?.marker?.parentNode)item.marker.parentNode.insertBefore(item.node,item.marker.nextSibling);
}

function move(parent,node,className=''){
  if(!parent||!node)return;
  if(className)node.classList.add(...className.split(/\s+/).filter(Boolean));
  if(node.parentNode!==parent)parent.appendChild(node);
}

function section(host,id,title){
  let box=byId(id);
  if(!box){
    box=document.createElement('section');
    box.id=id;box.className='v1216-section';
    box.innerHTML='<h3 class="v1216-section-head"></h3><div class="v1216-section-body"></div>';
    host.appendChild(box);
  }
  const head=box.querySelector('.v1216-section-head');if(head)head.textContent=title;
  return box.querySelector('.v1216-section-body');
}

function ensureHeader(){
  const top=byId('registryView')?.querySelector('.dash-topbar');if(!top)return;
  let brand=byId('v1216TopBrand');
  if(!brand){
    brand=document.createElement('div');brand.id='v1216TopBrand';brand.className='v1216-top-brand';
    brand.innerHTML='<span>RP</span><strong>Registry Pro</strong>';
    top.appendChild(brand);
  }
  const jurisdiction=byId('v120DraftJurisdiction');if(!jurisdiction)return;
  let title=byId('v1216DraftTitle');
  if(!title){title=document.createElement('strong');title.id='v1216DraftTitle';title.className='v1216-draft-title';jurisdiction.appendChild(title);}
  title.textContent='Agriculture Land Registry Draft';
  const back=byId('v114DraftBack');if(back){back.textContent='←  Back';back.setAttribute('aria-label','Back');}
}

function ensureGis(recordBody){
  if(!recordBody)return;
  let wrap=byId('v1216EnterpriseGis');
  if(!wrap){
    wrap=document.createElement('label');wrap.id='v1216EnterpriseGis';wrap.className='v1216-gis-check';
    wrap.innerHTML='<input id="enterpriseGisCode" type="checkbox"> <span>Enterprise GIS Code</span>';
    wrap.querySelector('input')?.addEventListener('change',()=>{try{window.syncDraftPreview?.();}catch(_){}});
  }
  const map=byId('v18RoadDistanceCategory')?.closest('.v18-road-map-panel');
  if(map?.parentElement===recordBody)map.insertAdjacentElement('afterend',wrap);else recordBody.appendChild(wrap);
}

function moveLocationFields(firstCard){
  const locationGrid=byId('villageSearch')?.closest('.form-grid');if(!locationGrid)return;
  locationGrid.classList.add('v1216-location-grid');

  const roadChoice=byId('v1208RoadChoice');
  if(roadChoice){roadChoice.classList.add('agri-only','v1216-road-choice-field');move(locationGrid,roadChoice);}

  const widthField=fieldFor('roadWidth');if(widthField)widthField.classList.add('v1216-road-width-field');
  const roadDetail=byId('mainRoadDistance')?.closest('.form-grid');
  if(roadDetail){
    roadDetail.classList.add('agri-only','v1216-main-road-detail');
    const area=byId('mainRoadDistance');if(area)area.rows=1;
    move(locationGrid,roadDetail);
  }

  firstCard?.classList.add('v1216-property-card');
  firstCard?.querySelector('.rebate-panel')?.classList.add('v1216-rebate');
}

function moveAgricultureSections(firstCard){
  const agri=byId('agricultureDeedFields');if(!agri)return;
  agri.classList.add('v1216-agriculture-layout');
  if(!state.recordsCard)state.recordsCard=byId('khataNo')?.closest('.form-card')||null;

  const basic=section(agri,'v1216BasicSection','कृषि भूमि का मूल विवरण');
  const ownership=section(agri,'v1216OwnershipSection','विक्रेता के स्वामित्व का आधार एवं क्रेता उत्तराखंड का कृषक');
  const record=section(agri,'v1216RecordSection','चक / गाटा / रकबा एवं मुख्य सड़क नियम');
  const legal=section(agri,'v1216LegalSection','कृषि भूमि की अतिरिक्त कानूनी जानकारी');
  const limits=section(agri,'v1216BoundarySection','सीमाएं (चौहद्दी) एवं पूर्व स्वामी');

  move(basic,byId('pargana')?.closest('.form-grid'),'v1216-basic-location');
  move(basic,byId('agriLandCondition')?.closest('.form-grid'),'v1216-basic-status');
  move(basic,byId('orchardTreePanel'));
  move(basic,byId('treeBoringDetailPanel'));
  move(basic,byId('coveredAreaPanel'));

  let pair=byId('v1216EnhancementPair');
  if(!pair){pair=document.createElement('div');pair.id='v1216EnhancementPair';pair.className='v1216-enhancement-pair';basic.appendChild(pair);}
  move(pair,agri.querySelector('.boundary-wall-box'));
  move(pair,agri.querySelector('.agri-total-row'));
  move(basic,agri.querySelector('.agri-total-valuation'));

  move(ownership,fieldFor('sellerOwnershipBasis')?.closest('.form-grid')||byId('sellerOwnershipBasis')?.closest('.form-grid'),'v1216-ownership-grid');

  move(record,byId('v123GataBlock'));
  move(record,byId('v18RoadDistanceCategory')?.closest('.v18-road-map-panel'));
  ensureGis(record);

  move(legal,byId('buyerHoldingLimitText')?.closest('.form-grid'),'v1216-legal-grid');

  const boundaryGrid=byId('boundaryEast')?.closest('.form-grid');
  if(boundaryGrid){
    let heading=boundaryGrid.previousElementSibling;
    if(!heading?.matches?.('h3.subheading'))heading=[...document.querySelectorAll('h3.subheading')].find(h=>/Boundaries\s*\(Chauhadhi\)/i.test(text(h.textContent)));
    let boundaryFields=byId('v1216BoundaryFields');
    if(!boundaryFields){boundaryFields=document.createElement('div');boundaryFields.id='v1216BoundaryFields';boundaryFields.className='v1216-boundary-fields';limits.appendChild(boundaryFields);}
    if(heading)move(boundaryFields,heading,'v1216-original-boundary-heading');
    move(boundaryFields,boundaryGrid,'v1216-boundary-grid');
  }
  move(limits,byId('v123PreviousTitleHolder'));

  const calc=firstCard?.querySelector('.calc-summary')||state.calc?.node;
  if(calc){remember(calc,'calc');move(limits,calc,'v1216-calc-summary');}
}

function moveTransaction(){
  const amountField=fieldFor('transactionAmount'),agriGrid=byId('agreementStampPaid')?.closest('.form-grid');
  if(amountField&&agriGrid){
    remember(amountField,'transaction');
    amountField.classList.add('v1216-transaction-amount');
    agriGrid.insertBefore(amountField,agriGrid.firstChild);
    agriGrid.classList.add('v1216-transaction-grid');
  }
  byId('transactionAmount')?.closest('.form-card')?.classList.add('v1216-transaction-card');
  byId('stampGovValue')?.closest('.form-card')?.classList.add('v1216-stamp-card');
}

function hideEmptyRecordsCard(){
  const card=state.recordsCard;
  if(card)card.classList.add('v1216-records-card');
}

function applyLayout(){
  const registry=byId('registryView');if(!registry)return;
  const active=isAgriculture();registry.classList.toggle('v1216-agri-active',active);
  ensureHeader();
  if(!active){restore('calc');restore('transaction');return;}

  try{window.v18InjectRoadMappingPanel?.();}catch(_){ }
  const first=byId('draftStep1')?.querySelector('.form-card');if(!first)return;
  moveLocationFields(first);
  moveAgricultureSections(first);
  moveTransaction();
  hideEmptyRecordsCard();
  const saved=window.__v1216PendingGisValue;
  if(saved!==undefined&&byId('enterpriseGisCode')){byId('enterpriseGisCode').checked=!!saved;delete window.__v1216PendingGisValue;}
}

function schedule(){
  try{applyLayout();}catch(e){console.warn('v1216 layout',e);}
}

function wrapLifecycle(){
  if(state.wrapped)return;state.wrapped=true;
  ['selectPropertyType','startDraftSteps','openNewRegistry','applyDraftTypeFieldVisibility'].forEach(name=>{
    const base=window[name];if(typeof base!=='function')return;
    window[name]=function(){const out=base.apply(this,arguments);schedule();return out;};
  });

  const saveBase=window.draftData;
  if(typeof saveBase==='function')window.draftData=function(){
    const data=saveBase.apply(this,arguments);
    if(isAgriculture()){data.agri=data.agri||{};data.agri.enterpriseGisCode=!!byId('enterpriseGisCode')?.checked;}
    return data;
  };

  const loadBase=window.v14LoadDraftFields;
  if(typeof loadBase==='function')window.v14LoadDraftFields=function(data){
    const out=loadBase.apply(this,arguments);
    window.__v1216PendingGisValue=!!data?.agri?.enterpriseGisCode;
    schedule();return out;
  };
}

window.v1216Apply=applyLayout;
function init(){
  wrapLifecycle();schedule();
  console.info('Registry Pro v1.20.16 loaded — approved compact Agriculture layout; calculations unchanged');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* ===== Source: agriculture-four-target-fixes.js ===== */
/* Registry Pro — FOUR TARGETED AGRICULTURE FIXES ONLY
   1) Hide upper duplicate Previous Buyer / Title Holder row.
   2) Tree rows: Per Tree Price + auto Total Value = Qty × Per Tree Price.
   3) Hide lower duplicate Covered Area / Plot Construction panel.
   4) Wizard: one draft page at a time; next step opens as its own page.
   No rate/stamp/rebate/routing formula changes. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const qsa=(s,r=document)=>[...(r?.querySelectorAll?.(s)||[])];
const escHtml=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function isAgri(){
  try{return !!window.isAgricultureMode?.();}
  catch(_){return /agriculture|कृषि/i.test(String(window.registrySelectedType||''));}
}

// ---------- 1 & 3: only the two duplicate rows/panels ----------
function applyDuplicateCleanup(){
  const agri=isAgri();
  const step=$('draftStep1');
  if(!step)return;

  // Upper duplicate Previous Buyer row: the legacy row before Buyer / Stamp Rebate.
  const rebate=step.querySelector('.rebate-panel');
  qsa('.previous-title-holder-row',step).forEach(row=>{
    const beforeRebate=!!(rebate && (row.compareDocumentPosition(rebate)&Node.DOCUMENT_POSITION_FOLLOWING));
    if(agri && beforeRebate){row.dataset.v1232Hidden='1';row.style.setProperty('display','none','important');}
    else if(row.dataset.v1232Hidden==='1'){row.style.removeProperty('display');delete row.dataset.v1232Hidden;}
  });

  // Residential Plot's optional Previous Title card can be injected beside the legacy row.
  // It must never appear in Agriculture; keep Agriculture's own structured previous-title section untouched.
  const duplicatePlotPrev=$('v1211PlotPrevious');
  if(duplicatePlotPrev){
    if(agri){duplicatePlotPrev.dataset.v1232Hidden='1';duplicatePlotPrev.style.setProperty('display','none','important');}
    else if(duplicatePlotPrev.dataset.v1232Hidden==='1'){duplicatePlotPrev.style.removeProperty('display');delete duplicatePlotPrev.dataset.v1232Hidden;}
  }

  // Lower duplicate Covered Area / Plot Construction injected for Residential Plot.
  // Keep Agriculture's own #coveredAreaPanel untouched.
  const duplicateCovered=$('v19ResidentialCoveredPanel');
  if(duplicateCovered){
    if(agri){duplicateCovered.dataset.v1232Hidden='1';duplicateCovered.style.setProperty('display','none','important');}
    else if(duplicateCovered.dataset.v1232Hidden==='1'){duplicateCovered.style.removeProperty('display');delete duplicateCovered.dataset.v1232Hidden;}
  }
}

// ---------- 2: Tree table semantics ----------
function setTreeHeaders(){
  ['orchardTreeRows','treeBoringTreeRows'].forEach(id=>{
    const body=$(id), table=body?.closest('table');if(!table)return;
    const tr=table.tHead?.rows?.[0];if(!tr)return;
    tr.innerHTML='<th>Ped Name</th><th>Qty</th><th>Umar</th><th>Per Tree Price (₹)</th><th>Total Value (₹)</th><th></th>';
  });
  const orchardHelp=$('orchardTreePanel')?.querySelector('.agri-detail-head small');
  if(orchardHelp)orchardHelp.textContent='Ped Name, Qty, Umar aur Per Tree Price भरें. Total Value auto calculate होगा.';
}
function updateTreeTotal(tr){
  if(!tr)return;
  const qty=parseFloat(tr.querySelector('.tree-qty')?.value||'0')||0;
  const unit=parseFloat(tr.querySelector('.tree-unit-price')?.value||'0')||0;
  const total=qty*unit;
  const out=tr.querySelector('.tree-total-value');if(out)out.value=total?String(total):'';
  return total;
}
window.v1232TreeInput=function(el){
  const tr=el?.closest?.('tr');updateTreeTotal(tr);
  try{window.onAgriEnhancementChanged?.();}catch(_){ }
};

window.addAgriTreeRow=function(kind,data={}){
  setTreeHeaders();
  const body=$(kind==='orchard'?'orchardTreeRows':'treeBoringTreeRows');if(!body)return;
  const tr=document.createElement('tr');
  const qty=Number(data.qty)||0;
  const unit=Number(data.perTreePrice ?? data.unitPrice ?? data.value)||0;
  const total=qty*unit;
  tr.innerHTML=`<td><input class="tree-name" value="${escHtml(data.name||'')}" placeholder="आम / Poplar" oninput="v1232TreeInput(this)"></td>
    <td><input class="tree-qty" type="number" min="0" step="1" value="${qty||''}" placeholder="0" oninput="v1232TreeInput(this)"></td>
    <td><input class="tree-age" value="${escHtml(data.age||'')}" placeholder="उदा. 8 वर्ष" oninput="v1232TreeInput(this)"></td>
    <td><input class="tree-unit-price" type="number" min="0" step="1" value="${unit||''}" placeholder="0" oninput="v1232TreeInput(this)"></td>
    <td><input class="tree-total-value" type="number" min="0" step="1" value="${total||''}" placeholder="0" readonly aria-readonly="true"></td>
    <td><button type="button" class="del-row" onclick="deleteAgriTreeRow(this)">✕</button></td>`;
  body.appendChild(tr);
};

window.collectAgriTreeRows=function(kind){
  const body=$(kind==='orchard'?'orchardTreeRows':'treeBoringTreeRows');if(!body)return [];
  return qsa('tr',body).map(tr=>{
    const qty=parseFloat(tr.querySelector('.tree-qty')?.value||'0')||0;
    const perTreePrice=parseFloat(tr.querySelector('.tree-unit-price')?.value||'0')||0;
    const value=qty*perTreePrice;
    const totalEl=tr.querySelector('.tree-total-value');if(totalEl)totalEl.value=value?String(value):'';
    return {
      name:(tr.querySelector('.tree-name')?.value||'').trim(),
      qty,
      age:(tr.querySelector('.tree-age')?.value||'').trim(),
      perTreePrice,
      unitPrice:perTreePrice,
      value
    };
  }).filter(x=>x.name||x.qty||x.age||x.perTreePrice||x.value);
};
window.treeRowsValue=function(rows){return (rows||[]).reduce((a,x)=>a+(Number(x.value)||0),0);};

function migrateExistingTreeRows(){
  setTreeHeaders();
  ['orchardTreeRows','treeBoringTreeRows'].forEach(id=>{
    const body=$(id);if(!body)return;
    qsa('tr',body).forEach(tr=>{
      if(tr.querySelector('.tree-unit-price')){updateTreeTotal(tr);return;}
      const name=tr.querySelector('.tree-name')?.value||'';
      const qty=tr.querySelector('.tree-qty')?.value||'';
      const age=tr.querySelector('.tree-age')?.value||'';
      const old=tr.querySelector('.tree-value')?.value||'';
      tr.innerHTML=`<td><input class="tree-name" value="${escHtml(name)}" placeholder="आम / Poplar" oninput="v1232TreeInput(this)"></td>
        <td><input class="tree-qty" type="number" min="0" step="1" value="${escHtml(qty)}" placeholder="0" oninput="v1232TreeInput(this)"></td>
        <td><input class="tree-age" value="${escHtml(age)}" placeholder="उदा. 8 वर्ष" oninput="v1232TreeInput(this)"></td>
        <td><input class="tree-unit-price" type="number" min="0" step="1" value="${escHtml(old)}" placeholder="0" oninput="v1232TreeInput(this)"></td>
        <td><input class="tree-total-value" type="number" min="0" step="1" readonly aria-readonly="true"></td>
        <td><button type="button" class="del-row" onclick="deleteAgriTreeRow(this)">✕</button></td>`;
      updateTreeTotal(tr);
    });
  });
}

// ---------- 4: Strict one-page-at-a-time wizard ----------
function enforceSingleWizardPage(step){
  const n=Math.min(5,Math.max(1,Number(step)||1));
  const screen=$('draftStepsScreen');if(!screen)return;
  qsa('.draft-step-panel',screen).forEach(panel=>{
    const active=panel.id===`draftStep${n}`;
    panel.classList.toggle('active',active);
    panel.hidden=!active;
    panel.style.setProperty('display',active?'block':'none','important');
  });
  qsa('.wizard-step',screen).forEach(s=>{
    const k=Number(s.dataset.step);s.classList.toggle('active',k===n);s.classList.toggle('done',k<n);
  });
  const page=$('draftPageNo');if(page)page.textContent=String(n);
  const next=$('draftNextBtn');if(next)next.textContent=n===5?'Save Final Draft':'Save & Continue →';
  const panel=$(`draftStep${n}`);
  requestAnimationFrame(()=>{try{panel?.scrollIntoView({block:'start',behavior:'auto'});}catch(_){window.scrollTo(0,0);}});
}
const baseGo=window.goDraftStep;
if(typeof baseGo==='function'){
  window.goDraftStep=function(step){
    const out=baseGo.apply(this,arguments);
    enforceSingleWizardPage(step);
    applyDuplicateCleanup();
    migrateExistingTreeRows();
    return out;
  };
}

function syncAll(){applyDuplicateCleanup();migrateExistingTreeRows();
  let n=1;try{n=Number(window.currentDraftStep||currentDraftStep||1)||1;}catch(_){n=1;}
  if($('draftStepsScreen')?.classList.contains('active'))enforceSingleWizardPage(n);
}
['startDraftSteps','openPropertyTypeDirect','startDashboardDeed'].forEach(name=>{
  const base=window[name];if(typeof base!=='function')return;
  window[name]=function(){const out=base.apply(this,arguments);syncAll();return out;};
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncAll,{once:true});else syncAll();
syncAll();
console.info('Registry Pro four targeted Agriculture fixes loaded');
})();

/* ===== Source: agriculture-three-legal-fixes.js ===== */
/* Registry Pro — THREE TARGETED AGRICULTURE LEGAL-FIELD FIXES ONLY
   1) Seller ownership basis auto-text follows Previous Buyer toggle/details.
   2) Buyer farmer second option text = immovable property before 12/09/2003.
   3) Lease = Yes reveals Permission No. + Date and persists them in the draft.
   No valuation/rate/stamp/rebate/routing/layout calculations changed. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const txt=v=>String(v??'').trim();

function isAgri(){
  try{return !!window.isAgricultureMode?.();}
  catch(_){return String(window.registrySelectedType||'').toLowerCase()==='agriculture land';}
}
function fmtDate(v){
  v=txt(v);if(!v)return '';
  const m=v.match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:v;
}
function previousEnabled(){return !!$('v124PrevToggle')?.checked;}
function ownershipText(){
  if(!previousEnabled())return 'खतौनी/ द्वारा संक्रमणीय भूमिधर';
  const dt=fmtDate($('v123PrevDate')?.value),reg=txt($('v123PrevRegNo')?.value);
  let out='द्वारा बैनामा';
  if(dt)out+=` दिनांक ${dt}`;
  if(reg)out+=` द0सं0 ${reg}`;
  return out;
}
function syncOwnership(){
  if(!isAgri())return;
  const e=$('sellerOwnershipBasis');if(!e)return;
  const next=ownershipText();
  if(e.value!==next)e.value=next;
}
function hookPreviousToggle(){
  const t=$('v124PrevToggle');if(!t||t.dataset.v1234Hook)return;
  t.dataset.v1234Hook='1';
  t.addEventListener('change',()=>{syncOwnership();try{window.syncDraftPreview?.();}catch(_){}});
  syncOwnership();
}

function syncFarmerOption(){
  const s=$('buyerFarmerStatus');if(!s)return;
  const opt=[...s.options].find(o=>o.value==='notfarmer')||s.options[1];
  if(opt)opt.textContent='12/09/2003 से पहले अचल सम्पत्ति है';
}

function ensureLeasePermissionFields(){
  const lease=$('leaseLand');if(!lease)return;
  let wrap=$('v1234LeasePermission');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='v1234LeasePermission';
    wrap.className='v1234-lease-permission';
    wrap.innerHTML=`<div><label>अनुमति संख्या</label><input id="leasePermissionNo" autocomplete="off"></div><div><label>दिनांक</label><input id="leasePermissionDate" type="date"></div>`;
    const field=lease.closest('div');
    const grid=lease.closest('.form-grid');
    if(grid&&field){field.insertAdjacentElement('afterend',wrap);}else lease.insertAdjacentElement('afterend',wrap);
    ['leasePermissionNo','leasePermissionDate'].forEach(id=>$(id)?.addEventListener('change',()=>{try{window.syncDraftPreview?.();}catch(_){}}));
  }
  syncLeaseVisibility();
}
function syncLeaseVisibility(){
  const wrap=$('v1234LeasePermission'),lease=$('leaseLand');if(!wrap||!lease)return;
  const yes=txt(lease.value)==='हाँ';
  wrap.hidden=!yes;
  wrap.style.display=yes?'contents':'none';
  wrap.setAttribute('aria-hidden',yes?'false':'true');
}
function hookLease(){
  const lease=$('leaseLand');if(!lease)return;
  ensureLeasePermissionFields();
  if(lease.dataset.v1234Hook)return;
  lease.dataset.v1234Hook='1';
  lease.addEventListener('change',syncLeaseVisibility);
}

function syncAll(){
  if(!isAgri())return;
  syncFarmerOption();ensureLeasePermissionFields();hookLease();hookPreviousToggle();syncOwnership();
}

// Previous-title edits immediately update the ownership-basis line.
const prevBase=window.v123PrevChanged;
if(typeof prevBase==='function')window.v123PrevChanged=function(){const out=prevBase.apply(this,arguments);syncOwnership();return out;};

// v124 may build the Previous Title toggle after page construction; hook it whenever its sync runs.
const v124Base=window.v124SyncMode;
if(typeof v124Base==='function')window.v124SyncMode=function(){const out=v124Base.apply(this,arguments);syncAll();return out;};

// Persist only the two new lease-permission values; all existing fields stay untouched.
const dataBase=window.draftData;
if(typeof dataBase==='function')window.draftData=function(){
  const d=dataBase.apply(this,arguments);if(!isAgri())return d;
  d.agri=d.agri||{};
  d.agri.leasePermissionNo=txt($('leasePermissionNo')?.value);
  d.agri.leasePermissionDate=txt($('leasePermissionDate')?.value);
  return d;
};

// Restore the new values and re-derive ownership basis from Previous Buyer state/details.
const loadBase=window.v14LoadDraftFields;
if(typeof loadBase==='function')window.v14LoadDraftFields=function(d){
  const out=loadBase.apply(this,arguments);
  syncAll();
  const a=d?.agri||{};
  if($('leasePermissionNo'))$('leasePermissionNo').value=a.leasePermissionNo||'';
  if($('leasePermissionDate'))$('leasePermissionDate').value=a.leasePermissionDate||'';
  syncLeaseVisibility();syncOwnership();
  return out;
};

// Keep the targeted UI rules active when Agriculture is opened/refreshed, without reordering DOM.
['startDraftSteps','applyDraftTypeFieldVisibility'].forEach(name=>{
  const base=window[name];if(typeof base!=='function')return;
  window[name]=function(){const out=base.apply(this,arguments);syncAll();return out;};
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncAll,{once:true});else syncAll();
syncAll();
console.info('Registry Pro three targeted Agriculture legal-field fixes loaded');
})();

(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
window.RegistryProModules.agriculture=Object.assign(window.RegistryProModules.agriculture||{},{
  key:'agriculture',match:type=>String(type||'').toLowerCase()==='agriculture land',
  title:'Agriculture Land Registry Draft',theme:'',
  applyUI(){window.v123Build?.();window.v123SyncVisibility?.();window.v124SyncMode?.();window.v1216Apply?.();},
  restoreUI(){}
});
})();
