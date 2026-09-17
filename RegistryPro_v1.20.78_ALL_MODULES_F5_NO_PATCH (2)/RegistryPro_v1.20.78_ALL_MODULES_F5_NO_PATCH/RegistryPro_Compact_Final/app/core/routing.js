(function(){
'use strict';

const RELEASE_TITLE='Registry Pro v1.20.78';
const $=id=>document.getElementById(id);
const themeClasses=[
  'rp-theme-residential-plot','rp-theme-residential-building','rp-theme-gift',
  'rp-theme-commercial','rp-theme-industrial','rp-theme-agreement','rp-theme-lease','rp-theme-sale-after','rp-theme-more'
];
const directTypes=new Set(['Residential Plot','Residential Building','Agriculture Land','Commercial Building','Industrial Building','Lease']);
let requestedType='Agriculture Land';

window.RegistryProModules=window.RegistryProModules||{};

function normalizeType(type){
  const value=String(type||'').trim();
  return value||'Agriculture Land';
}

function moduleFor(type){
  const value=normalizeType(type);
  return Object.values(window.RegistryProModules).find(module=>typeof module?.match==='function'&&module.match(value))
    ||window.RegistryProModules.agriculture||{};
}

function fallbackTheme(type){
  if(/^commercial/i.test(type))return 'rp-theme-commercial';
  if(/^industrial/i.test(type))return 'rp-theme-industrial';
  if(/^lease/i.test(type))return 'rp-theme-lease';
  if(/^sale after/i.test(type))return 'rp-theme-sale-after';
  return '';
}

function displayTitle(type,module){
  const value=normalizeType(type);
  if(/^gift/i.test(value)||/^agreement/i.test(value)||/^sale after/i.test(value))return `${value} Registry Draft`;
  return module?.title||`${value} Registry Draft`;
}

/* Keep the legacy calculation engine and the router on the same active type.
   The old code hard-coded Agriculture Land here, which made every later deed
   inherit Agriculture visibility, defaults and preview fields. */
function setEngineType(type=requestedType){
  const value=normalizeType(type);
  try{registrySelectedType=value;}catch(_){window.registrySelectedType=value;}
  window.__registryEngineDraftType=value;
}

function setRequestedType(type){
  requestedType=normalizeType(type);
  window.__registryRequestedDraftType=requestedType;
  window.__registryActiveDraftType=requestedType;
  setEngineType(requestedType);
}

function setLabels(type){
  const module=moduleFor(type),title=displayTitle(type,module);
  const selected=$('selectedTypeLabel'),mini=$('draftTypeMini'),draftName=$('v1212DraftName'),compactTitle=$('v1216DraftTitle');
  if(selected)selected.textContent=type;
  if(mini)mini.textContent=type;
  if(draftName)draftName.textContent=title;
  if(compactTitle)compactTitle.textContent=title;
  document.querySelectorAll('.property-type-card').forEach(card=>card.classList.toggle('selected',card.dataset.type===type));
}

function clearModuleUI(activeModule){
  for(const module of Object.values(window.RegistryProModules)){
    if(module!==activeModule)try{module?.restoreUI?.();}catch(error){console.warn('Module UI restore',error);}
  }
}

function applyModuleUI(type){
  const value=normalizeType(type),module=moduleFor(value),view=$('registryView'),theme=module?.theme||fallbackTheme(value);
  setRequestedType(value);
  clearModuleUI(module);
  if(view){view.classList.remove(...themeClasses);if(theme)view.classList.add(theme);}
  setLabels(value);
  try{module?.beforeOpen?.(value);}catch(error){console.warn('Module beforeOpen',error);}
  try{module?.applyUI?.(value);}catch(error){console.warn('Module applyUI',error);}
  try{module?.afterOpen?.(value);}catch(error){console.warn('Module afterOpen',error);}
  setLabels(value);
  document.title=RELEASE_TITLE;
}

function showRegistryView(){
  document.querySelectorAll('.view').forEach(view=>view.classList.remove('active'));
  $('registryView')?.classList.add('active');
}

function activateStepOne(){
  $('draftTypeScreen')?.classList.remove('active');
  $('draftStepsScreen')?.classList.add('active');
  try{currentDraftStep=1;}catch(_){window.currentDraftStep=1;}
  document.querySelectorAll('.draft-step-panel').forEach(panel=>panel.classList.remove('active'));
  $('draftStep1')?.classList.add('active');
  document.querySelectorAll('.wizard-step').forEach(step=>{
    const number=Number(step.dataset.step);step.classList.toggle('active',number===1);step.classList.remove('done');
  });
  if($('draftPageNo'))$('draftPageNo').textContent='1';
  if($('draftNextBtn'))$('draftNextBtn').textContent='Save & Continue →';
}

function closeChoosers(){
  for(const id of ['giftOptions','agreementOptions','saleAfterOptions'])if($(id))$(id).hidden=true;
  document.querySelectorAll('.deed-parent-card').forEach(card=>card.classList.remove('open','selected'));
}

function withoutHeavyRefresh(work){
  const names=['recalculate','recalculateStampDuty','syncDraftPreview'],saved={};
  for(const name of names){saved[name]=window[name];window[name]=function(){return {};};}
  try{return work();}
  finally{for(const name of names){if(saved[name])window[name]=saved[name];else delete window[name];}}
}

function clearGenericDraftForm(){
  const root=$('draftStepsScreen');if(!root)return;
  root.querySelectorAll('input,textarea,select').forEach(el=>{
    if(el.readOnly||el.disabled)return;
    if(el.type==='checkbox'||el.type==='radio'){el.checked=el.type==='checkbox'&&el.id==='rebateNo';return;}
    if(el.tagName==='SELECT'){el.selectedIndex=0;return;}
    el.value='';
  });
  ['agriGataRows','orchardTreeRows','treeBoringTreeRows','paymentRows'].forEach(id=>{const el=$(id);if(el)el.innerHTML='';});
  root.querySelectorAll('.additional-party-card').forEach(el=>el.remove());
  root.querySelectorAll('.captured,.picked').forEach(el=>el.classList.remove('captured','picked'));
}

function resetWorkingDraft(type){
  const value=normalizeType(type);
  setRequestedType(value);
  withoutHeavyRefresh(()=>{
    try{
      if(value==='Agriculture Land'&&typeof window.RegistryProAgricultureReset==='function')window.RegistryProAgricultureReset();
      else clearGenericDraftForm();
    }catch(error){console.warn('Draft reset',error);clearGenericDraftForm();}
  });
}

function buildSharedLayout(type){
  setEngineType(type);
  try{window.toggleAgriElements?.();}catch(_){ }
  try{window.applyDraftTypeFieldVisibility?.();}catch(_){ }
  try{window.v123Build?.();}catch(_){ }
  try{window.v123SyncVisibility?.();}catch(_){ }
  try{window.v124SyncMode?.();}catch(_){ }
  try{window.v1216Apply?.();}catch(_){ }
}

function refreshDraftOnce(){
  try{window.recalculate?.();}catch(error){console.warn('Draft calculation',error);}
  try{window.recalculateStampDuty?.();}catch(error){console.warn('Stamp calculation',error);}
  try{window.syncDraftPreview?.();}catch(error){console.warn('Draft preview',error);}
}

function prepareDraftShell(type,{reset=true}={}){
  const target=normalizeType(type);
  if(reset)resetWorkingDraft(target);
  setRequestedType(target);
  showRegistryView();activateStepOne();closeChoosers();
  withoutHeavyRefresh(()=>buildSharedLayout(target));
  setRequestedType(target);applyModuleUI(target);
  try{window.v14EnsureRegistryNo?.();window.updateDraftNumberMini?.();}catch(_){ }
  try{window.scrollTo(0,0);}catch(_){ }
  return target;
}

function openRequestedDraft(type){
  try{if(window.v14SessionData?.()?.role==='Staff'){window.toast?.('Staff mode sirf post-registration workflow ke liye hai.');return;}}catch(_){ }
  const target=prepareDraftShell(type,{reset:true});
  refreshDraftOnce();
  return target;
}

function showTypeChooser(kind='all'){
  showRegistryView();closeChoosers();
  $('draftTypeScreen')?.classList.add('active');
  $('draftStepsScreen')?.classList.remove('active');
  if(kind==='gift'&&$('giftOptions'))$('giftOptions').hidden=false;
  if(kind==='agreement'&&$('agreementOptions'))$('agreementOptions').hidden=false;
  if(kind==='saleAfter'&&$('saleAfterOptions'))$('saleAfterOptions').hidden=false;
  document.title=RELEASE_TITLE;
  try{window.scrollTo(0,0);}catch(_){ }
}

const baseDraftData=window.draftData;
if(typeof baseDraftData==='function')window.draftData=function(){
  let draft=baseDraftData.apply(this,arguments);
  const type=normalizeType(window.__registryRequestedDraftType||requestedType);
  draft.registryType=type;draft.moduleKey=moduleFor(type)?.key||'agriculture';
  try{draft=moduleFor(type)?.enrichDraft?.(draft)||draft;}catch(error){console.warn('Module calculation data',error);}
  return draft;
};

const baseLoadDraft=window.v14LoadDraftFields;
if(typeof baseLoadDraft==='function')window.v14LoadDraftFields=function(draft){
  const type=normalizeType(draft?.registryType||'Agriculture Land');
  setRequestedType(type);
  const result=baseLoadDraft.call(this,{...(draft||{}),registryType:type});
  setRequestedType(type);buildSharedLayout(type);applyModuleUI(type);refreshDraftOnce();
  return result;
};

const baseV19Type=window.v19Type;
if(typeof baseV19Type==='function')window.v19Type=function(){return normalizeType(window.__registryRequestedDraftType||requestedType)||baseV19Type.apply(this,arguments);};

window.selectPropertyType=function(element){
  const type=normalizeType(element?.dataset?.type||'Residential Plot');
  setRequestedType(type);setLabels(type);
  document.querySelectorAll('.property-type-card').forEach(card=>card.classList.toggle('selected',card===element));
};

window.startDraftSteps=function(){return openRequestedDraft(window.__registryRequestedDraftType||$('selectedTypeLabel')?.textContent||'Residential Plot');};
window.openPropertyTypeDirect=function(element){return openRequestedDraft(element?.dataset?.type);};
window.openNewRegistry=function(){return showTypeChooser('all');};
window.startDashboardDeed=function(type){
  if(type==='Gift Deed')return showTypeChooser('gift');
  if(type==='Agreement')return showTypeChooser('agreement');
  if(directTypes.has(type))return openRequestedDraft(type);
  return showTypeChooser('all');
};
window.openSaleAfterAgreementPicker=function(){return showTypeChooser('saleAfter');};

window.openSavedRegistry=function(registryNo){
  const draft=window.v14AllDrafts?.().find(item=>item.registryNo===registryNo);
  if(!draft||!window.v14DraftVisible?.(draft)){window.toast?.('Draft access not available for this login');return;}
  resetWorkingDraft(draft.registryType||'Agriculture Land');
  try{v14LoadingDraft=true;v14ActiveRegistryNo=draft.registryNo;v14LastOpenedDraft=draft;}catch(_){ }
  if(draft.jurisdiction)try{window.v14WriteJSON?.('registryProJurisdiction',draft.jurisdiction);}catch(_){ }
  prepareDraftShell(draft.registryType||'Agriculture Land',{reset:false});
  window.v14LoadDraftFields?.(draft);window.goDraftStep?.(1);window.updateDraftJurisdictionContext?.();window.updateDraftNumberMini?.();
  try{v14LoadingDraft=false;}catch(_){ }
  applyModuleUI(draft.registryType||'Agriculture Land');window.toast?.(`Opened ${registryNo}`);
};

window.RegistryProRouting={openDraft:openRequestedDraft,openSaved:window.openSavedRegistry,activeType:()=>requestedType,applyModuleUI};
setRequestedType('Agriculture Land');
if($('selectedTypeLabel'))$('selectedTypeLabel').textContent='Select Deed Type';
if($('draftTypeMini'))$('draftTypeMini').textContent='Select Deed Type';
document.querySelectorAll('.property-type-card').forEach(card=>card.classList.remove('selected'));
document.title=RELEASE_TITLE;
})();
