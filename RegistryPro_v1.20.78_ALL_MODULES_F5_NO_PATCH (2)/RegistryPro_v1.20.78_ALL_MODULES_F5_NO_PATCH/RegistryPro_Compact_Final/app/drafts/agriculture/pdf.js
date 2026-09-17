/* Registry Pro clean source module. Edit this file directly; no runtime patch loader. */

/* ===== Source: selected-road-pdf-fix.js ===== */
/* Registry Pro v1.20.9 — selected main-road name in Agriculture draft/PDF */
(function(){
'use strict';
const byId=id=>document.getElementById(id);
const text=v=>String(v??'').trim();

function cleanRoadName(v){
  return text(v)
    .replace(/^\s*[A-Z]\s*-?\s*\d+\s*[—–:-]\s*/i,'')
    .replace(/^\s*[A-Z]-\d+\s*/i,'')
    .replace(/[।.\s]+$/,'')
    .trim();
}
function categorySentence(category){
  if(category==='0-50')return 'मुख्य मार्ग से 0 से 50 मीटर की दूरी पर स्थित है।';
  if(category==='51-200')return 'मुख्य मार्ग से 51 से 200 मीटर की दूरी पर स्थित है।';
  if(category==='200+')return 'मुख्य मार्ग से 200 मीटर से अधिक दूरी पर स्थित है।';
  return '';
}
function currentDetail(){
  const resolution=window.V1208_DISTRICT_RATE_API?.getLastResolution?.()||null;
  const row=resolution?.road||null;
  const category=text(resolution?.category||byId('v123DistanceCategory')?.value||byId('v18RoadDistanceCategory')?.value);
  const road=cleanRoadName(row?.route||row?.name||'');
  const sentence=categorySentence(category);
  return {
    category,
    road,
    sentence:road&&sentence?`${road} ${sentence}`:sentence,
    row,
    rate:Number(resolution?.distanceRate||resolution?.rate||byId('v123DistanceRate')?.value||0)||0
  };
}
function syncMainRoadField(){
  const detail=currentDetail(),field=byId('mainRoadDistance');
  if(field&&detail.sentence)field.value=detail.sentence;
  return detail;
}
function enrichDraft(d,detail=syncMainRoadField()){
  if(!d?.agri||!detail.sentence)return d;
  d.agri.mainRoadDistance=detail.sentence;
  d.agri.applicableMainRoadName=detail.road;
  d.agri.applicableMainRoadSentence=detail.sentence;
  d.agri.applicableMainRoadRate=detail.rate;
  if(detail.row){
    d.agri.applicableMainRoadPage=detail.row.page||'';
    d.agri.applicableMainRoadRow=detail.row.row||'';
    d.agri.applicableMainRoadGroup=detail.row.group||'';
    d.agri.applicableMainRoadRowId=detail.row.id||'';
  }
  return d;
}

const oldRecalculate=window.recalculate;
window.recalculate=function(){
  const out=oldRecalculate?.apply(this,arguments);
  syncMainRoadField();
  return out;
};

const oldDraftData=window.draftData;
window.draftData=function(){
  const detail=syncMainRoadField();
  return enrichDraft(oldDraftData.apply(this,arguments),detail);
};

// Latest Checking Copy renderer used the short category before the detailed
// main-road sentence. Feed it a copy containing the complete selected road text.
if(typeof window.v111CheckingHtml==='function'){
  const oldCheckingHtml=window.v111CheckingHtml;
  window.v111CheckingHtml=function(d,lang){
    const copy={...d,agri:{...(d?.agri||{})}};
    if(copy.agri.applicableMainRoadSentence||copy.agri.mainRoadDistance){
      copy.agri.roadDistanceCategory=copy.agri.applicableMainRoadSentence||copy.agri.mainRoadDistance;
    }
    return oldCheckingHtml(copy,lang);
  };
}

for(const fn of ['v1208RoadChanged','v123DistanceChanged','v18RoadCategoryManualChanged','v18AutoApplyKhasraDistance']){
  if(typeof window[fn]!=='function')continue;
  const old=window[fn];
  window[fn]=function(){
    const out=old.apply(this,arguments);
    syncMainRoadField();try{window.syncDraftPreview?.();}catch(_){}
    return out;
  };
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncMainRoadField,{once:true});else syncMainRoadField();

window.V1209_SELECTED_ROAD_API={cleanRoadName,categorySentence,currentDetail,enrichDraft};
})();

/* ===== Source: applicable-rate-pdf-fix.js ===== */
/* Registry Pro v1.20.10 — selected official road becomes the PDF rate line */
(function(){
'use strict';
const text=v=>String(v??'').trim();
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0;};
const esc=v=>text(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function distanceLabel(cat){
  if(cat==='0-50')return '0 से 50 मीटर';
  if(cat==='51-200')return '51 से 200 मीटर';
  if(cat==='200+')return '200 मीटर से अधिक';
  return text(cat)||'-';
}
function rateHindi(lakh){return `${Math.round(num(lakh)*100000).toLocaleString('en-IN')}/- रुपये प्रति हेक्टेयर`;}
function rateEnglish(lakh){return `INR ${Math.round(num(lakh)*100000).toLocaleString('en-IN')} per hectare`;}
function selectedReference(d){
  const a=d?.agri||{},r=d?.ruleEngine?.districtRateResolution||{};
  const road=text(a.applicableMainRoadName||a.mainRoadRoute||a.mainRoadRateName||r.road);
  const category=text(r.distanceCategory||a.roadDistanceCategory);
  const rate=num(a.applicableMainRoadRate||r.selectedDistanceRate);
  const finalRate=num(r.finalRate||d?.finalCircleRate||d?.circleRate||rate);
  return {
    road,category,rate,finalRate,
    page:a.applicableMainRoadPage||a.mainRoadRatePage||r.ratePage||'',
    row:a.applicableMainRoadRow||a.mainRoadRateRow||r.rateRow||'',
    group:text(a.applicableMainRoadGroup||a.mainRoadRateGroup||r.rateGroup),
    column:d?.circleRateColumn||4,
    sentence:text(a.applicableMainRoadSentence||a.mainRoadDistance),
    premium:num(d?.roadPremiumPercent)
  };
}
function roadWidthHindi(d){
  try{return text(window.roadDeedSentence?.(d));}catch(_){}
  const p=num(d?.roadPremiumPercent);
  if(!p)return 'रास्ते की चौड़ाई के कारण कोई अतिरिक्त वृद्धि लागू नहीं है';
  return `रास्ते की चौड़ाई के कारण ${p} प्रतिशत वृद्धि लागू है`;
}
function hindiNarrative(d){
  const x=selectedReference(d);if(!x.road||!x.rate)return '';
  const ref=`आधिकारिक रेट सूची पृष्ठ संख्या-${x.page||'-'}, क्रमांक/पंक्ति-${x.row||'-'}, श्रेणी-${x.group||'-'}, कालम संख्या-${x.column}`;
  return `चयनित प्रमुख मार्ग- ${x.road}; दूरी श्रेणी- ${distanceLabel(x.category)}; ${ref}; लागू कृषि दर ${rateHindi(x.rate)} है। ${roadWidthHindi(d)}। अंतिम सर्किल दर ${rateHindi(x.finalRate)} है।`;
}
function englishNarrative(d){
  const x=selectedReference(d);if(!x.road||!x.rate)return '';
  return `Selected Main Road: ${x.road}; Distance: ${distanceLabel(x.category)}; Official Rate List page ${x.page||'-'}, row ${x.row||'-'}, group ${x.group||'-'}, column ${x.column}; applicable agriculture rate ${rateEnglish(x.rate)}; road-width premium ${x.premium}%; final circle rate ${rateEnglish(x.finalRate)}.`;
}
function enrich(d){
  if(!d?.agri)return d;
  const hi=hindiNarrative(d),en=englishNarrative(d);
  if(hi){d.agri.applicableRateNarrativeHindi=hi;d.agri.applicableRateNarrativeEnglish=en;}
  return d;
}
function patchPreview(d){
  const root=document.getElementById('legalDraftPreview');if(!root||!d?.agri)return;
  const hi=hindiNarrative(d),en=englishNarrative(d);if(!hi)return;
  const isEnglish=!!root.querySelector('.v191-english-agri,.v191-english-check');
  const narrative=isEnglish?en:hi;
  const paras=[...root.querySelectorAll('p')];
  const oldRate=paras.find(p=>/रेट लिस्ट में पृष्ठ संख्या-|Rate List Page No\./i.test(p.textContent||''));
  if(oldRate)oldRate.innerHTML=`<b>${esc(narrative)}</b>`;
  const summaryRate=paras.find(p=>/सर्किल रेट:|Circle Rate:/i.test(p.textContent||''));
  if(summaryRate){
    let detail=root.querySelector('.v1210-selected-rate-reference');
    if(!detail){detail=document.createElement('p');detail.className='v1210-selected-rate-reference';summaryRate.insertAdjacentElement('afterend',detail);}
    detail.innerHTML=`<b>${isEnglish?'Selected Road / Applicable Rate':'चयनित प्रमुख मार्ग / लागू दर'}:</b> ${esc(narrative)}`;
  }
}

const oldDraftData=window.draftData;
window.draftData=function(){return enrich(oldDraftData.apply(this,arguments));};

const oldSync=window.syncDraftPreview;
window.syncDraftPreview=function(){
  const out=oldSync?.apply(this,arguments);
  try{patchPreview(enrich(window.draftData()));}catch(e){console.warn('v1.20.10 PDF rate detail',e);}
  return out;
};

window.V1210_APPLICABLE_RATE_API={distanceLabel,selectedReference,hindiNarrative,englishNarrative,enrich};
function initApplicableRatePreview(){try{window.syncDraftPreview?.();}catch(_){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initApplicableRatePreview,{once:true});else initApplicableRatePreview();
})();
