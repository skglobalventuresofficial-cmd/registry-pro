/* Registry Pro clean source module. Edit this file directly; no runtime patch loader. */

/* ===== Source: agriculture-two-target-fixes.js ===== */
/* Registry Pro — TWO TARGETED AGRICULTURE FIXES ONLY
   1) Hide the visible "कुल विक्रित क्षेत्रफल (Auto total + Editable)" row while keeping its
      hidden input available for the existing Agriculture calculation engine.
   2) Dashboard Agriculture button always starts a fresh blank Agriculture draft.
      Saved Drafts/openSavedRegistry is intentionally untouched.
   No valuation, rate, stamp, rebate, PDF, wizard, Gift/Plot/Agreement changes. */
(function(){
'use strict';
const $=id=>document.getElementById(id);

function isAgriType(type){return String(type||'').toLowerCase()==='agriculture land';}
function isAgri(){
  try{return !!window.isAgricultureMode?.();}
  catch(_){return isAgriType(window.registrySelectedType);}
}

// 1) UI only: keep #agriTotalAreaHa in DOM because the existing calculation/validation
// engine reads it. Hide only its visible wrapper.
function syncSoldAreaVisibility(){
  const row=$('agriTotalAreaHa')?.closest('.agri-total-row');
  if(!row)return;
  if(isAgri()){
    row.dataset.v1233Hidden='1';
    row.style.setProperty('display','none','important');
    row.setAttribute('aria-hidden','true');
  }else if(row.dataset.v1233Hidden==='1'){
    row.style.removeProperty('display');
    row.removeAttribute('aria-hidden');
    delete row.dataset.v1233Hidden;
  }
}

function setGlobal(name,value){
  try{
    // Most project state is global lexical state; explicit cases below handle those names.
    if(name==='v14ActiveRegistryNo')v14ActiveRegistryNo=value;
    else if(name==='v14LastOpenedDraft')v14LastOpenedDraft=value;
    else if(name==='v13LastCompletedDraft')v13LastCompletedDraft=value;
    else if(name==='selectedCircleLocation')selectedCircleLocation=value;
    else if(name==='selectedCircleRateKey')selectedCircleRateKey=value;
    else if(name==='agriAreaManualOverride')agriAreaManualOverride=value;
    else if(name==='areaManualOverride')areaManualOverride=value;
    else window[name]=value;
  }catch(_){try{window[name]=value;}catch(__){}}
}

function clearFreshDraftDom(){
  const root=$('draftStepsScreen');if(!root)return;

  // Clear every user-editable control inside the wizard. Readonly fixed/rule values stay intact.
  root.querySelectorAll('input,textarea,select').forEach(el=>{
    if(el.readOnly || el.disabled)return;
    const type=String(el.type||'').toLowerCase();
    if(type==='checkbox'||type==='radio'){el.checked=false;return;}
    if(el.tagName==='SELECT'){el.selectedIndex=0;return;}
    try{el.value='';}catch(_){ }
  });

  // Restore only intentional blank-draft defaults.
  if($('rebateNo'))$('rebateNo').checked=true;
  const firstRebate=root.querySelector('input[name="rebateUse"][value="1"]');if(firstRebate)firstRebate.checked=true;

  // Remove repeated rows/cards from the previous working draft. Their normal builders will
  // create fresh rows as needed after the Agriculture screen opens.
  ['agriGataRows','orchardTreeRows','treeBoringTreeRows','paymentRows'].forEach(id=>{const e=$(id);if(e)e.innerHTML='';});
  root.querySelectorAll('.additional-party-card').forEach(e=>e.remove());
  try{window.renumberPartyCards?.('seller');window.renumberPartyCards?.('buyer');}catch(_){ }

  // Old captured fingerprint/UI state must not leak into a new draft.
  root.querySelectorAll('.captured').forEach(e=>e.classList.remove('captured'));
  root.querySelectorAll('.picked').forEach(e=>e.classList.remove('picked'));
}

function blankAgricultureData(){
  let session={};try{session=window.v14SessionData?.()||{};}catch(_){ }
  return {
    registryType:'Agriculture Land',
    village:'',circleRateRowId:'',circleRateKey:'',rateRef:'',
    east:'',west:'',north:'',south:'',areaSqft:'',areaManualOverride:false,
    khataNo:'',khasraNo:'',houseFlatNo:'',floor:'',
    boundaries:{east:'',west:'',north:'',south:''},
    sellers:[],seller:{},buyers:[],buyer:{},witness1:{},witness2:{},
    advocate:{name:session.advocateName||session.name||'',enrollment:'',mobile:session.mobile||''},
    transactionAmount:'',advanceAmount:'',payments:[],previousTitleHolderText:'',previousTitleHolder:{},previousTitleHolderEnabled:false,
    agri:{pargana:'',tehsil:'',district:'',latitude:'',longitude:'',annualLagan:5.06,executionDate:'',stampSheetCount:'',agreementStampPaid:'',gataRows:[]}
  };
}

function resetFreshAgriculture(){
  // Reset only current working-draft pointers; saved drafts in localStorage are never touched.
  setGlobal('v14ActiveRegistryNo',null);
  setGlobal('v14LastOpenedDraft',null);
  setGlobal('v13LastCompletedDraft',null);
  setGlobal('selectedCircleLocation',null);
  setGlobal('selectedCircleRateKey','');
  setGlobal('agriAreaManualOverride',false);
  setGlobal('areaManualOverride',false);
  try{registrySelectedType='Agriculture Land';}catch(_){window.registrySelectedType='Agriculture Land';}

  clearFreshDraftDom();

  // Let the existing loader clear all version-specific Agriculture fields too, but suppress
  // expensive preview/stamp passes while the blank state is being installed.
  const saved={};
  ['recalculate','recalculateStampDuty','syncDraftPreview'].forEach(n=>{saved[n]=window[n];window[n]=function(){return {};};});
  try{window.v14LoadDraftFields?.(blankAgricultureData());}
  catch(e){console.warn('Fresh Agriculture reset',e);}
  finally{['recalculate','recalculateStampDuty','syncDraftPreview'].forEach(n=>{if(saved[n])window[n]=saved[n];else delete window[n];});}
}

// Reapply only the hidden-row rule after mode/layout syncs. No DOM reordering.
['startDraftSteps','applyDraftTypeFieldVisibility'].forEach(name=>{
  const base=window[name];if(typeof base!=='function')return;
  window[name]=function(){const out=base.apply(this,arguments);syncSoldAreaVisibility();return out;};
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncSoldAreaVisibility,{once:true});
else syncSoldAreaVisibility();
syncSoldAreaVisibility();
window.RegistryProAgricultureReset=resetFreshAgriculture;
console.info('Registry Pro two targeted Agriculture fixes loaded');
})();
