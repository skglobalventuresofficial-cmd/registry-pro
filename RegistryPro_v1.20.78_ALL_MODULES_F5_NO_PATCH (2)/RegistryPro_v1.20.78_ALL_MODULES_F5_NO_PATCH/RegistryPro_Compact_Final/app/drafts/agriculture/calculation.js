/* Registry Pro clean source module. Edit this file directly; no runtime patch loader. */

/* ===== Source: final.js ===== */
/* Registry Pro v1.19.2.1 — Khasra distance auto-rule stability fix
   06-Sep-2026
   Fixes login/UI freeze caused by an over-eager MutationObserver in v1.19.2.
   Keeps the verified Hasan Alipur starter rules and editable override behavior.
*/
(function(){
'use strict';
const RULE_PDF='data/states/uttarakhand/haridwar/pdfs/circle_rate_rules_khasra_pages_58_112.pdf';
const RULE_STORE='registryProOfficialKhasraRuleOverridesV1192';
const norm=v=>String(v||'').trim().toLowerCase().replace(/[\s._\-–—/\\(),]+/g,'');
const read=(k,d)=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x??d;}catch(_){return d;}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(_){}};
const tehsilNow=()=>{try{return String(currentJurisdiction?.().tehsil||document.getElementById('jurTehsil')?.value||document.getElementById('draftTehsil')?.value||'').trim();}catch(_){return String(document.getElementById('jurTehsil')?.value||document.getElementById('draftTehsil')?.value||'').trim();}};
const villageNow=()=>String(document.getElementById('village')?.value||'').trim();
const khasraNow=()=>{try{return String(v18CurrentKhasra?.()||'').trim();}catch(_){return String(document.getElementById('khasraNo')?.value||'').trim();}};
const key=(t,v,k)=>`${norm(t)}|${norm(v)}|${norm(k)}`;

const VERIFIED_RULES=[];
function addRules(tehsil,aliases,khasras,category,page){
  (Array.isArray(aliases)?aliases:[aliases]).forEach(v=>(khasras||[]).forEach(k=>VERIFIED_RULES.push({tehsil,village:v,khasra:String(k),category,page,verified:true})));
}
// Official source page 63 starter verification.
addRules('Roorkee',['हसन अलीपुर','Hasan Alipur','Hassan Alipur'],['13','12','11','10','4','1','2'],'0-50','63');
addRules('Roorkee',['हसन अलीपुर','Hasan Alipur','Hassan Alipur'],['14','5','9','16'],'51-200','63');

const RULE_MAP={};
VERIFIED_RULES.forEach(r=>RULE_MAP[key(r.tehsil,r.village,r.khasra)]=r);
function hitRule(){
  const t=tehsilNow(),v=villageNow(),k=khasraNow();
  if(!t||!v||!k)return null;
  const exact=RULE_MAP[key(t,v,k)];
  if(exact)return exact;
  const candidates=VERIFIED_RULES.filter(r=>norm(r.village)===norm(v)&&norm(r.khasra)===norm(k));
  return candidates.length===1?candidates[0]:null;
}
function humanCat(cat){return cat==='0-50'?'0–50 Meter':cat==='51-200'?'51–200 Meter':cat==='200+'?'More than 200 Meter':cat||'';}
function setDistanceText(cat){
  try{ if(typeof v18ApplyRoadDistanceText==='function') v18ApplyRoadDistanceText(cat); }
  catch(_){
    const e=document.getElementById('mainRoadDistance');
    if(e){
      if(cat==='0-50')e.value='प्रमुख/मुख्य मार्ग से 0 से 50 मीटर की दूरी पर स्थित है।';
      if(cat==='51-200')e.value='प्रमुख/मुख्य मार्ग से 51 से 200 मीटर की दूरी पर स्थित है।';
    }
  }
}
function ensureBanner(){
  const panel=document.getElementById('v18RoadDistanceCategory')?.closest('.v18-road-map-panel');
  if(!panel)return null;
  let b=document.getElementById('v122OfficialRuleBanner');
  if(!b){
    b=document.createElement('div');
    b.id='v122OfficialRuleBanner';
    b.style.cssText='margin:10px 0 0;padding:12px 14px;border:1px solid #f0c36d;border-radius:10px;background:#fff8e7;color:#714f00;font-weight:700;display:none';
    panel.appendChild(b);
  }
  const btn=panel.querySelector('.v18-panel-title button');
  if(btn && !btn.dataset.v122Hook){
    btn.dataset.v122Hook='1';
    btn.textContent='Open Official Rules PDF';
    btn.addEventListener('click',e=>{e.preventDefault();window.open(`${RULE_PDF}#page=6`,'_blank');});
  }
  return b;
}
function markOverride(official,selected){
  const t=tehsilNow(),v=villageNow(),k=khasraNow();
  if(!official||!t||!v||!k)return;
  const all=read(RULE_STORE,{}),kk=key(t,v,k);
  if(selected&&selected!==official.category){
    all[kk]={officialCategory:official.category,userCategory:selected,page:official.page,changedAt:new Date().toISOString()};
    write(RULE_STORE,all);
  }else if(all[kk]){
    delete all[kk];write(RULE_STORE,all);
  }
}

let applying=false;
function scheduleApply(force=false){applyOfficialRule(force);}
function applyOfficialRule(force=false){
  if(applying)return;
  // Do nothing on Login/Dashboard unless the agriculture rule UI actually exists.
  let sel=document.getElementById('v18RoadDistanceCategory');
  if(!sel){
    const agri=document.getElementById('agricultureDeedFields');
    if(!agri || agri.offsetParent===null)return;
    try{if(typeof v18InjectRoadMappingPanel==='function')v18InjectRoadMappingPanel();}catch(_){return;}
    sel=document.getElementById('v18RoadDistanceCategory');
    if(!sel)return;
  }
  applying=true;
  try{
    const banner=ensureBanner();
    const pg=document.getElementById('v18RoadSourcePage');
    const mk=document.getElementById('v18RoadMatchedKhasra');
    const note=document.getElementById('v18RoadAutoNote');
    const t=tehsilNow(),v=villageNow(),k=khasraNow();
    const ruleKey=key(t,v,k);
    const hit=hitRule();
    if(!hit){
      if(banner)banner.style.display='none';
      if(sel.dataset.v122RuleKey && sel.dataset.v122RuleKey!==ruleKey){
        delete sel.dataset.v122OfficialCategory;
        delete sel.dataset.v122RuleKey;
      }
      return;
    }
    if(mk && mk.value!==k)mk.value=k;
    const saved=read(RULE_STORE,{})[ruleKey];
    const chosen=saved?.userCategory||hit.category;
    const current=String(sel.value||'');
    const mayAutoSet=force || !sel.dataset.v122ManualFor || sel.dataset.v122ManualFor!==ruleKey;
    let changed=false;
    if(mayAutoSet && current!==chosen){sel.value=chosen;changed=true;setDistanceText(chosen);}
    if(pg && pg.value!==hit.page)pg.value=hit.page;
    sel.dataset.v122OfficialCategory=hit.category;
    sel.dataset.v122RuleKey=ruleKey;
    sel.dataset.v122ManualFor=saved?.userCategory?ruleKey:'';
    const msg=`⚠ Official Khasra Rule Found: <b>${humanCat(hit.category)}</b> • Village: ${String(hit.village)} • Khasra/Gata: ${String(hit.khasra)} • Source Page ${hit.page}. ${saved?.userCategory?`Manual override active: <b>${humanCat(saved.userCategory)}</b>.`:'Auto-selected; you can change it manually.'}`;
    if(banner){banner.style.display='block';if(banner.innerHTML!==msg)banner.innerHTML=msg;}
    if(note){
      const txt=`Official rule auto-selected: ${humanCat(hit.category)} • Page ${hit.page}. Editable before final copy.`;
      if(note.textContent!==txt)note.textContent=txt;
      note.className='v18-khasra-auto-note matched';
    }
    // Recalculate only when this patch actually changed the selected category.
    if(changed){
      try{if(typeof recalculate==='function')recalculate();}catch(_){}
      try{if(typeof recalculateStampDuty==='function')recalculateStampDuty();}catch(_){}
      try{if(typeof syncDraftPreview==='function')syncDraftPreview();}catch(_){}
    }
  }finally{applying=false;}
}

const oldAuto=window.v18AutoApplyKhasraDistance;
window.v18AutoApplyKhasraDistance=function(){
  try{if(typeof oldAuto==='function')oldAuto.apply(this,arguments);}catch(_){}
  scheduleApply(false,0);
};
const oldManual=window.v18RoadCategoryManualChanged;
window.v18RoadCategoryManualChanged=function(){
  const sel=document.getElementById('v18RoadDistanceCategory'),hit=hitRule();
  if(hit&&sel){markOverride(hit,sel.value);sel.dataset.v122ManualFor=key(tehsilNow(),villageNow(),khasraNow());}
  try{if(typeof oldManual==='function')oldManual.apply(this,arguments);}catch(_){}
  scheduleApply(false,0);
};

function relevantRuleInput(element){
  if(!element?.matches)return false;
  if(element.matches('#village,#jurTehsil,#draftTehsil,#agriGataRows input'))return true;
  if(!element.closest('#agricultureDeedFields'))return false;
  const signature=String(element.placeholder||'')+String(element.name||'')+String(element.id||'');
  return /gata|khasra|खसरा|गाटा/i.test(signature)||!!element.closest('[data-gata-row]');
}
function delegatedRuleInput(event){if(relevantRuleInput(event.target))scheduleApply(false);}
function init(){
  try{
    if(typeof V18_KHASRA_DISTANCE_SEED==='object' && typeof v18MapKey==='function'){
      VERIFIED_RULES.forEach(r=>{V18_KHASRA_DISTANCE_SEED[v18MapKey(r.village,r.khasra)]={category:r.category,page:r.page};});
    }
  }catch(_){}
  document.addEventListener('input',delegatedRuleInput);
  document.addEventListener('change',delegatedRuleInput);
  // Only apply at startup if rule UI is already present; never inject anything on login.
  if(document.getElementById('v18RoadDistanceCategory'))scheduleApply(true);
  
  console.info('Registry Pro v1.19.2.1 loaded — rule auto patch stable');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();

/* ===== Source: district-rate-fix.js ===== */
/* Registry Pro v1.20.8 — Haridwar District No-Guess Rate Resolver
   Scope: Agriculture main-road distance/rate resolution for Haridwar district.
   Preserves the verified v1.20.3 workflows and the v1.20.7 official datasets.
*/
(function(){
'use strict';

const VERSION='v1.20.8';
const DISTRICT_TEHSILS=new Set(['Haridwar','Roorkee','Bhagwanpur','Laksar']);
const byId=id=>typeof document!=='undefined'?document.getElementById(id):null;
const text=v=>String(v??'').trim();
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0;};
const safe=(fn,...args)=>{try{return typeof fn==='function'?fn(...args):undefined;}catch(e){console.warn('v1.20.8',e);}};
const escapeHtml=v=>text(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let selectedRoadId='';
let manualDistanceRate=false;
let lastDistanceCategory='';
let lastResolution=null;
let refreshSignature='';

function normalize(v){
  return text(v).toLowerCase().normalize('NFKC')
    .replace(/\([^)]*\)/g,' ')
    .replace(/[\s._\-–—/\\,;:]+/g,'')
    .replace(/मुस्तहकम|अहतमाल|जदीद|पुराना/g,'');
}
function rows(){try{return typeof CIRCLE_RATE_DATA!=='undefined'?CIRCLE_RATE_DATA:[];}catch(_){return [];}}
function contextTehsil(){
  try{return text(currentJurisdiction?.().tehsil||byId('dashTehsil')?.value||byId('v120DraftTehsil')?.value||byId('draftTehsil')?.value);}
  catch(_){return text(byId('dashTehsil')?.value||byId('v120DraftTehsil')?.value||byId('draftTehsil')?.value);}
}
function isAgriculture(){
  try{return !!isAgricultureMode();}
  catch(_){return /agriculture|कृषि/i.test(text(window.registrySelectedType||byId('registryType')?.value));}
}
function selectedRow(){try{return typeof selectedCircleLocation!=='undefined'?selectedCircleLocation:null;}catch(_){return null;}}
function currentVillage(){return text(byId('village')?.value||byId('villageSearch')?.value||selectedRow()?.name);}
function currentRateKey(){
  const opt=byId('circleRateSelect')?.selectedOptions?.[0];
  try{return text(opt?.dataset?.rateKey||selectedCircleRateKey||'agri')||'agri';}
  catch(_){return text(opt?.dataset?.rateKey||'agri')||'agri';}
}
function currentBaseRate(){return num(byId('circleRateSelect')?.value);}
function rowInTehsil(row,tehsil){
  if(!row||!tehsil)return false;
  if(row.tehsil)return text(row.tehsil)===tehsil;
  try{return typeof window.v14CircleRowInTehsil==='function'?!!window.v14CircleRowInTehsil(row,tehsil):true;}
  catch(_){return true;}
}
function isMajorRoadRow(row){return !!row&&(!!row.route||row.nonAgriFar!==null&&row.nonAgriFar!==undefined||/प्रमुख\s*मार्ग|मुख्य\s*मार्ग|major\s*road/i.test(text(row.section)))}
function rowRate(row,key,category){
  if(!row)return 0;
  if(key==='nonAgri')return category==='51-200'?num(row.nonAgriFar):num(row.nonAgri);
  if(key==='agri')return num(row.agri); // Official agriculture main-road rate applies up to 200m.
  return num(row[key]);
}
function rowMatchesVillage(row,village){
  const q=normalize(village);if(!q)return false;
  const values=[row?.name,row?.alias,row?.latinAlias,row?.searchText].filter(Boolean).map(normalize).filter(Boolean);
  return values.some(v=>v===q||(q.length>=4&&v.includes(q))||(v.length>=4&&q.includes(v)));
}
function candidateScore(row,village,key,category){
  const q=normalize(village),name=normalize(row?.name),alias=normalize(row?.alias||row?.latinAlias),search=normalize(row?.searchText);let score=0;
  if(name===q)score+=500;if(alias===q)score+=450;
  if(name&&q&&(name.includes(q)||q.includes(name)))score+=180;
  if(alias&&q&&(alias.includes(q)||q.includes(alias)))score+=150;
  if(search&&q&&search.includes(q))score+=100;
  if(row?.route)score+=20;if(row?.nonAgriFar!==null&&row?.nonAgriFar!==undefined)score+=10;
  if(rowRate(row,key,category)>0)score+=5;
  return score;
}
function candidatesFor({tehsil='',village='',key='agri',category='0-50'}={}){
  if(!DISTRICT_TEHSILS.has(tehsil)||!village||category==='200+')return [];
  const seen=new Set();
  return rows().filter(row=>rowInTehsil(row,tehsil)&&isMajorRoadRow(row)&&rowMatchesVillage(row,village)&&rowRate(row,key,category)>0)
    .map(row=>({row,score:candidateScore(row,village,key,category)}))
    .filter(x=>{if(seen.has(x.row.id))return false;seen.add(x.row.id);return true;})
    .sort((a,b)=>b.score-a.score||num(a.row.page)-num(b.row.page)||num(a.row.row)-num(b.row.row));
}
function normalBaseRow({tehsil='',village='',key='agri',selected=null}={}){
  // The row explicitly selected from Select Land Rate is authoritative. Preserve it
  // even when an older source row carries a mismatched legacy section prefix.
  if(selected&&!isMajorRoadRow(selected)&&num(selected[key])>0)return selected;
  const exact=rows().filter(row=>rowInTehsil(row,tehsil)&&!isMajorRoadRow(row)&&num(row[key])>0&&rowMatchesVillage(row,village));
  exact.sort((a,b)=>{const q=normalize(village),ae=normalize(a.name)===q?1:0,be=normalize(b.name)===q?1:0;return be-ae||num(a.page)-num(b.page)||num(a.row)-num(b.row);});
  return exact[0]||null;
}
function resolveFor({tehsil='',village='',key='agri',category='',baseRate=0,selected=null,roadId=''}={}){
  const candidates=candidatesFor({tehsil,village,key,category}),direct=selected&&isMajorRoadRow(selected)&&rowRate(selected,key,category)>0?selected:null;
  const chosen=candidates.find(x=>text(x.row.id)===text(roadId))?.row||null;
  const road=direct||chosen||(candidates.length===1?candidates[0].row:null);
  const normal=normalBaseRow({tehsil,village,key,selected});
  let rate=0,source='Rate pending',page='',status='missing-distance',supported=false;
  if(!category){return {tehsil,village,key,category,baseRate:num(baseRate),rate,source,page,status,supported,road:null,normal,candidates,ambiguous:false};}
  if(category==='200+'){
    const normalRate=num(normal?.[key]);
    if(normalRate>0){rate=normalRate;source='Official village/base rate (>200m)';page=normal.page||'';status='base-exact';supported=true;}
    else{status='base-required';source='Select exact village/base row for >200m';}
  }else if(road){
    rate=rowRate(road,key,category);page=road.page||'';supported=rate>0;
    status=direct?'road-row-exact':chosen?'road-user-selected':'road-single-exact';
    source=key==='agri'?'Official main-road agriculture rate (up to 200m)':category==='51-200'?'Official 50–200m main-road rate':'Official 0–50m main-road rate';
  }else if(candidates.length>1){status='road-ambiguous';source=`${candidates.length} official main-road rows match; select one`;}
  else{status='road-not-mapped';source='No exact official main-road row matched';}
  return {tehsil,village,key,category,baseRate:num(baseRate),rate,source,page,status,supported,road,normal,candidates,ambiguous:category!=='200+'&&candidates.length>1&&!road};
}
function liveResolution(){
  return resolveFor({tehsil:contextTehsil(),village:currentVillage(),key:currentRateKey(),category:text(byId('v123DistanceCategory')?.value),baseRate:currentBaseRate(),selected:selectedRow(),roadId:selectedRoadId});
}
function formatRate(rate,key){
  if(!(num(rate)>0))return '—';
  return key==='agri'?`₹${num(rate).toLocaleString('en-IN',{maximumFractionDigits:2})} लाख/हेक्टेयर`:`₹${num(rate).toLocaleString('en-IN',{maximumFractionDigits:2})}/m²`;
}
function humanDistance(category){return category==='0-50'?'0–50 Meter':category==='51-200'?'50–200 Meter':category==='200+'?'More than 200 Meter':'Not selected';}
function officialReference(row){return row?`PDF p${row.page} • row ${row.row||'-'} • group ${row.group||'-'}`:'';}

function ensureRoadSelector(){
  const distance=byId('v123DistanceWrap');if(!distance)return null;
  let wrap=byId('v1208RoadChoice');if(wrap)return wrap;
  wrap=document.createElement('div');wrap.id='v1208RoadChoice';wrap.className='v1208-road-choice';
  wrap.innerHTML=`<label>Applicable Main Road / Official Reference</label><div class="v1208-road-control"><select id="v1208RoadSelect" onchange="v1208RoadChanged()"><option value="">SELECT DISTANCE FIRST</option></select><button id="v1208RoadSource" type="button" class="btn outline compact" onclick="v1208OpenRoadSource()" disabled>View Source</button></div><div id="v1208RoadStatus" class="v1208-road-status">Exact road match ke bina rate apply nahi hoga.</div>`;
  distance.appendChild(wrap);return wrap;
}
function optionLabel(row,key,category){
  const road=text(row.route||row.name),short=road.length>92?road.slice(0,89)+'…':road;
  return `${short} — ${formatRate(rowRate(row,key,category),key)} — p${row.page}/${row.group||'-'}`;
}
function refreshRoadSelector(force=false){
  if(typeof document==='undefined'||!isAgriculture())return null;
  ensureRoadSelector();const select=byId('v1208RoadSelect'),button=byId('v1208RoadSource');if(!select)return null;
  const category=text(byId('v123DistanceCategory')?.value),tehsil=contextTehsil(),village=currentVillage(),key=currentRateKey(),direct=selectedRow(),candidates=candidatesFor({tehsil,village,key,category});
  const signature=[tehsil,village,key,category,direct?.id||'',selectedRoadId,candidates.map(x=>x.row.id).join(',')].join('|');
  if(!force&&signature===refreshSignature)return liveResolution();refreshSignature=signature;
  let options=[],disabled=false;
  if(!category){options=[['','SELECT MAIN ROAD DISTANCE FIRST']];disabled=true;selectedRoadId='';}
  else if(category==='200+') {options=[['','>200m — exact village/base rate applies']];disabled=true;selectedRoadId='';}
  else if(direct&&isMajorRoadRow(direct)&&rowRate(direct,key,category)>0){selectedRoadId=text(direct.id);options=[[selectedRoadId,optionLabel(direct,key,category)]];}
  else if(!candidates.length){options=[['','NO EXACT OFFICIAL ROAD MATCH — ENTER RATE MANUALLY']];disabled=true;selectedRoadId='';}
  else{
    const valid=candidates.some(x=>text(x.row.id)===text(selectedRoadId));if(!valid)selectedRoadId=candidates.length===1?text(candidates[0].row.id):'';
    if(candidates.length>1)options.push(['',`SELECT EXACT MAIN ROAD — ${candidates.length} MATCHES`]);
    options.push(...candidates.map(x=>[text(x.row.id),optionLabel(x.row,key,category)]));
  }
  select.innerHTML=options.map(([value,label])=>`<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('');select.value=selectedRoadId;select.disabled=disabled;
  const road=(direct&&isMajorRoadRow(direct)?direct:candidates.find(x=>text(x.row.id)===text(selectedRoadId))?.row)||null;
  if(button){button.disabled=!road;button.dataset.tehsil=tehsil;button.dataset.page=road?.page||'';}
  return liveResolution();
}
function statusMessage(res,manual=false){
  if(manual)return 'Manual distance rate active — official PDF/reference verify karein.';
  if(res.status==='missing-distance')return 'Main Road Distance select karein.';
  if(res.status==='base-exact')return `>200m: ${formatRate(res.rate,res.key)} • ${officialReference(res.normal)}`;
  if(res.status==='base-required')return '>200m ke liye exact village/base row select karein; main-road rate use nahi hua.';
  if(res.status==='road-ambiguous')return `${res.candidates.length} official main-road matches मिले — exact road चुनें; कोई rate guess नहीं किया गया.`;
  if(res.status==='road-not-mapped')return 'Exact official main-road match नहीं मिला; rate manually भरें और PDF verify करें.';
  if(res.road)return `${text(res.road.route||res.road.name)} • ${formatRate(res.rate,res.key)} • ${officialReference(res.road)}`;
  return res.source;
}
function setValue(id,value){const el=byId(id);if(el&&el.value!==String(value??''))el.value=value??'';}
function applyResolution(result){
  if(!isAgriculture())return result;
  const res=refreshRoadSelector(false)||liveResolution(),rateInput=byId('v123DistanceRate'),entered=num(rateInput?.value),manual=manualDistanceRate&&entered>0;
  const distanceRate=manual?entered:num(res.rate),valid=distanceRate>0;
  const rw=safe(window.roadWidthInfo)||{factor:1,percent:0,label:''},factor=num(rw.factor)||1,finalRate=valid?distanceRate*factor:0;
  const area=result?.area||safe(window.calculateArea)||{m2:0,hectare:0},hectare=num(area?.hectare??num(area?.m2)/10000),landValue=valid?(res.key==='agri'?hectare*finalRate*100000:num(area?.m2)*finalRate):0;
  let improvement=0;try{const a=typeof updateAgriEnhancementUI==='function'?updateAgriEnhancementUI(landValue):null;improvement=num(a?.total);}catch(_){try{improvement=num(agriEnhancementValue?.().total);}catch(__){}}
  const total=valid?landValue+improvement:0,message=statusMessage(res,manual);
  if(!manual)setValue('v123DistanceRate',valid?distanceRate:'');
  setValue('v123BaseRateView',formatRate(res.baseRate,res.key));setValue('v123DistanceView',humanDistance(res.category));
  setValue('v123RulePageView',manual?'Manual override':res.road?officialReference(res.road):res.normal?officialReference(res.normal):'Verification required');
  setValue('v123RoadPremiumView',`${num(rw.percent)>0?'+':''}${num(rw.percent)}%`);setValue('v123FinalRateView',valid?formatRate(finalRate,res.key):'RATE PENDING');
  const src=byId('v123SummarySource');if(src)src.textContent=manual?'Manual override • official source verification required':`${res.source}${res.page?` • PDF page ${res.page}`:''}`;
  const routeNote=byId('v123RouteNote');if(routeNote){routeNote.textContent=message;routeNote.classList.toggle('warn',!res.supported&&!manual);}
  const hint=byId('v123DistanceHint');if(hint){hint.textContent=message;hint.classList.toggle('v1208-pending',!res.supported&&!manual);}
  const roadStatus=byId('v1208RoadStatus');if(roadStatus){roadStatus.textContent=message;roadStatus.classList.toggle('pending',!res.supported&&!manual);}
  const hidden=byId('circleRate');if(hidden)hidden.value=valid?String(finalRate):'';
  const circleOut=byId('circleRateOut');if(circleOut)circleOut.textContent=valid?formatRate(finalRate,res.key):'Rate pending';
  const valueOut=byId('valueOut');if(valueOut)valueOut.textContent=valid?(typeof inr==='function'?inr(total):String(total)):'Rate pending';
  const plot=byId('plotValueDisplay');if(plot)plot.value=valid?(typeof inr==='function'?inr(total):String(total)):'';
  const note=byId('roadRateNote');if(note)note.innerHTML=valid?`Base: <strong>${escapeHtml(formatRate(res.baseRate,res.key))}</strong> &nbsp; → Distance: <strong>${escapeHtml(formatRate(distanceRate,res.key))}</strong> &nbsp; + Road Width: <strong>${num(rw.percent)}%</strong> &nbsp; = Final: <strong>${escapeHtml(formatRate(finalRate,res.key))}</strong>`:`Base: <strong>${escapeHtml(formatRate(res.baseRate,res.key))}</strong> &nbsp; → Distance: <strong>SELECT EXACT ROAD / ENTER MANUAL RATE</strong> &nbsp; → Final: <strong>Pending</strong>`;
  const detail=byId('circleRateDetail');if(detail)detail.textContent=valid?`Distance ${humanDistance(res.category)} + Road Width ${num(rw.percent)}%`:'Official distance rate pending';
  Object.assign(result,{baseRate:res.baseRate,distanceRate,distanceRateAuto:res.rate,distanceRateSource:manual?'Manual override':res.source,distanceSourcePage:res.page,distanceCategory:res.category,finalRate,rate:finalRate,road:factor,roadPercent:num(rw.percent),roadLabel:rw.label,landValue,improvementValue:improvement,plot:total,rateKey:res.key,rateResolutionStatus:manual?'manual-override':res.status,mainRoadRateRowId:res.road?.id||''});
  lastResolution={...res,manual,distanceRate,finalRate,landValue,improvementValue:improvement,total,status:manual?'manual-override':res.status};
  return result;
}

window.v1208RoadChanged=function(){
  selectedRoadId=text(byId('v1208RoadSelect')?.value);manualDistanceRate=false;refreshSignature='';refreshRoadSelector(true);
  safe(oldDistanceChanged);safe(window.recalculate);safe(window.recalculateStampDuty);safe(window.syncDraftPreview);
};
window.v1208OpenRoadSource=function(){
  const button=byId('v1208RoadSource'),tehsil=text(button?.dataset.tehsil||contextTehsil()),page=num(button?.dataset.page);if(!page)return;
  if(typeof window.v128OpenOfficialPage==='function'&&(tehsil==='Haridwar'||tehsil==='Laksar'))return window.v128OpenOfficialPage(tehsil,page);
  try{if(typeof window.v115OpenSourcePage==='function')return window.v115OpenSourcePage(page);}catch(_){ }
};

const previousRecalculate=window.recalculate;
window.recalculate=function(){const out=typeof previousRecalculate==='function'?previousRecalculate.apply(this,arguments):{};return applyResolution(out||{});};

const oldDistanceChanged=window.v123DistanceChanged;
window.v123DistanceChanged=function(){
  const category=text(byId('v123DistanceCategory')?.value);if(category!==lastDistanceCategory)selectedRoadId='';lastDistanceCategory=category;manualDistanceRate=false;refreshSignature='';refreshRoadSelector(true);
  return typeof oldDistanceChanged==='function'?oldDistanceChanged.apply(this,arguments):safe(window.recalculate);
};
const oldDistanceEdited=window.v123DistanceRateEdited;
window.v123DistanceRateEdited=function(){manualDistanceRate=num(byId('v123DistanceRate')?.value)>0;const out=typeof oldDistanceEdited==='function'?oldDistanceEdited.apply(this,arguments):undefined;safe(window.recalculate);return out;};

const oldSelectLocation=window.selectCircleLocation;
window.selectCircleLocation=function(){const out=oldSelectLocation?.apply(this,arguments);selectedRoadId='';manualDistanceRate=false;refreshSignature='';refreshRoadSelector(true);safe(window.recalculate);safe(window.recalculateStampDuty);return out;};
const oldChooseRate=window.chooseLandRate;
window.chooseLandRate=function(){const out=oldChooseRate?.apply(this,arguments);manualDistanceRate=false;refreshSignature='';refreshRoadSelector(true);safe(window.recalculate);safe(window.recalculateStampDuty);return out;};
const oldAutoKhasra=window.v18AutoApplyKhasraDistance;
window.v18AutoApplyKhasraDistance=function(){const out=oldAutoKhasra?.apply(this,arguments);refreshSignature='';refreshRoadSelector(true);safe(window.recalculate);safe(window.recalculateStampDuty);return out;};

const oldDraftData=window.draftData;
window.draftData=function(){
  const d=oldDraftData.apply(this,arguments);if(!isAgriculture())return d;safe(window.recalculate);const r=lastResolution||liveResolution(),road=r.road||null;d.agri=d.agri||{};
  d.agri.mainRoadRateRowId=road?.id||'';d.agri.mainRoadRateName=text(road?.name||'');d.agri.mainRoadRoute=text(road?.route||'');d.agri.mainRoadRatePage=road?.page||'';d.agri.mainRoadRateRow=road?.row||'';d.agri.mainRoadRateGroup=text(road?.group||'');
  d.agri.distanceResolutionStatus=lastResolution?.status||r.status;d.agri.distanceOfficialReference=road?officialReference(road):'';d.agri.distanceManualOverride=!!lastResolution?.manual;
  d.ruleEngine=d.ruleEngine||{};d.ruleEngine.districtRateResolution={tehsil:r.tehsil,distanceCategory:r.category,status:lastResolution?.status||r.status,baseRate:r.baseRate,selectedDistanceRate:lastResolution?.distanceRate||0,finalRate:lastResolution?.finalRate||0,roadRowId:road?.id||'',road:text(road?.route||road?.name||''),ratePage:road?.page||r.normal?.page||'',rateRow:road?.row||r.normal?.row||'',rateGroup:text(road?.group||r.normal?.group||''),manualOverride:!!lastResolution?.manual,source:'Official circle-rate row; no-guess resolver v1.20.8'};
  return d;
};

const oldLoadDraft=window.v14LoadDraftFields;
window.v14LoadDraftFields=function(d){const out=oldLoadDraft.apply(this,arguments),a=d?.agri||{};selectedRoadId=text(a.mainRoadRateRowId);manualDistanceRate=!!a.distanceManualOverride;lastDistanceCategory=text(a.roadDistanceCategory);refreshSignature='';ensureRoadSelector();refreshRoadSelector(true);safe(window.recalculate);safe(window.recalculateStampDuty);return out;};

function resetContext(){selectedRoadId='';manualDistanceRate=false;lastDistanceCategory='';refreshSignature='';ensureRoadSelector();refreshRoadSelector(true);safe(window.recalculate);}
const oldOpenNew=window.openNewRegistry;window.openNewRegistry=function(){const out=oldOpenNew?.apply(this,arguments);resetContext();return out;};
const oldSelectType=window.selectPropertyType;window.selectPropertyType=function(){const out=oldSelectType?.apply(this,arguments);ensureRoadSelector();refreshRoadSelector(true);safe(window.recalculate);return out;};
const oldJurisdiction=window.v18DashboardJurisdictionChanged;window.v18DashboardJurisdictionChanged=function(){const out=oldJurisdiction?.apply(this,arguments);resetContext();return out;};
if(typeof window.v120DraftJurisdictionChanged==='function'){
  const oldDraftJurisdiction=window.v120DraftJurisdictionChanged;window.v120DraftJurisdictionChanged=function(){const out=oldDraftJurisdiction.apply(this,arguments);resetContext();return out;};
}

window.V1208_DISTRICT_RATE_API={version:VERSION,isMajorRoadRow,rowMatchesVillage,candidatesFor,normalBaseRow,resolveFor,getLastResolution:()=>lastResolution};

function init(){ensureRoadSelector();lastDistanceCategory=text(byId('v123DistanceCategory')?.value);refreshRoadSelector(true);safe(window.recalculate);console.info('Registry Pro district no-guess rate resolver loaded');}
if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}
})();

/* ===== Source: agriculture-lag-clean-fix.js ===== */
/* Registry Pro — targeted Agriculture lag + duplicate-row cleanup.
   Scope ONLY: defer heavy preview/stamp refresh while typing in Agriculture,
   hide leaked Residential-Plot road block, hide duplicate old Previous Buyer row.
   No valuation/rate/rebate/routing formulas changed. */
(function(){
'use strict';
let typing=false, typingClear=0, previewTimer=0, stampTimer=0;
const baseSync=window.syncDraftPreview;
const baseStamp=window.recalculateStampDuty;

function isAgri(){
  try{return !!window.isAgricultureMode?.();}
  catch(_){return /agriculture|कृषि/i.test(String(window.registrySelectedType||''));}
}
function inRegistry(el){return !!el?.closest?.('#registryView');}
function cleanDuplicates(){
  const view=document.getElementById('registryView');
  if(!view)return;
  const agri=isAgri();
  view.classList.toggle('v1231-agri-clean',agri);
  const leaked=document.getElementById('v1211PlotRoad');
  if(leaked)leaked.hidden=agri;
  const oldPrev=document.querySelector('#draftStep1 .previous-title-holder-row');
  if(oldPrev)oldPrev.hidden=agri;
}

// Set a same-event flag before inline oninput handlers run. Heavy preview work is then
// collapsed into one refresh after the user pauses, so typed characters paint immediately.
document.addEventListener('input',function(e){
  if(!isAgri()||!inRegistry(e.target))return;
  typing=true;
  clearTimeout(typingClear);
  queueMicrotask(()=>{typing=false;});
},true);

if(typeof baseSync==='function'){
  window.syncDraftPreview=function(){
    const ctx=this,args=arguments;
    if(isAgri()&&typing){
      clearTimeout(previewTimer);
      previewTimer=setTimeout(()=>{try{baseSync.apply(ctx,args);}catch(_){}},320);
      return;
    }
    return baseSync.apply(ctx,args);
  };
}
if(typeof baseStamp==='function'){
  window.recalculateStampDuty=function(){
    const ctx=this,args=arguments;
    if(isAgri()&&typing){
      clearTimeout(stampTimer);
      stampTimer=setTimeout(()=>{try{baseStamp.apply(ctx,args);}catch(_){}},220);
      return;
    }
    return baseStamp.apply(ctx,args);
  };
}

// Re-apply only the two visibility rules when draft mode changes. No layout rebuild.
['startDashboardDeed','openPropertyTypeDirect','selectPropertyType','startDraftSteps'].forEach(name=>{
  const base=window[name];
  if(typeof base!=='function')return;
  window[name]=function(){const out=base.apply(this,arguments);cleanDuplicates();return out;};
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanDuplicates,{once:true});
else cleanDuplicates();
cleanDuplicates();
console.info('Agriculture lag/duplicate cleanup loaded');
})();
