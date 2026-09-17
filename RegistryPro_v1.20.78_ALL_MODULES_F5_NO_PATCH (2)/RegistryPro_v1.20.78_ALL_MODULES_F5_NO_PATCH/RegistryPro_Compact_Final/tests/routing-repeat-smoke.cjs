const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert');

class ClassList{
  constructor(...names){this.values=new Set(names);}
  add(...names){names.forEach(name=>this.values.add(name));}
  remove(...names){names.forEach(name=>this.values.delete(name));}
  toggle(name,on){if(on===undefined)on=!this.values.has(name);on?this.values.add(name):this.values.delete(name);return on;}
  contains(name){return this.values.has(name);}
}
const make=(id,classes=[])=>({id,textContent:'',value:'',hidden:false,dataset:{},classList:new ClassList(...classes),style:{},setAttribute(){},querySelector(){return null}});
const ids={};
for(const id of ['registryView','loginView','dashboardView','draftTypeScreen','draftStepsScreen','draftStep1','draftPageNo','draftNextBtn','selectedTypeLabel','draftTypeMini','v1212DraftName','v1216DraftTitle','giftOptions','agreementOptions','saleAfterOptions'])ids[id]=make(id);
ids.loginView.classList.add('view');ids.dashboardView.classList.add('view');ids.registryView.classList.add('view');
const cards=['Residential Plot','Residential Building','Agriculture Land','Gift Residential Plot Family','Agreement Agriculture Land'].map(type=>{const card=make('');card.dataset.type=type;return card;});
const panels=[ids.draftStep1,make('draftStep2')];panels.forEach(panel=>panel.classList.add('draft-step-panel'));
const steps=[1,2].map(number=>{const step=make('');step.dataset.step=String(number);step.classList.add('wizard-step');return step;});
const parentCards=[make('giftParent'),make('agreementParent')];parentCards.forEach(card=>card.classList.add('deed-parent-card'));
const noop=()=>{};
const modules={
  agriculture:{key:'agriculture',match:type=>type==='Agriculture Land',title:'Agriculture Land Registry Draft',theme:'',applyUI:noop,restoreUI:noop},
  residentialPlot:{key:'residentialPlot',match:type=>type==='Residential Plot',title:'Residential Plot Registry Draft',theme:'rp-theme-residential-plot',applyUI:noop,restoreUI:noop},
  residentialBuilding:{key:'residentialBuilding',match:type=>type==='Residential Building',title:'Residential Building Registry Draft',theme:'rp-theme-residential-building',applyUI:noop,restoreUI:noop},
  gift:{key:'gift',match:type=>/^Gift/.test(type),title:'Gift Deed Registry Draft',theme:'rp-theme-gift',applyUI:noop,restoreUI:noop},
  agreement:{key:'agreement',match:type=>/^Agreement/.test(type),title:'Agreement Registry Draft',theme:'rp-theme-agreement',applyUI:noop,restoreUI:noop}
  ,commercialBuilding:{key:'commercialBuilding',match:type=>type==='Commercial Building',title:'Commercial Building Registry Draft',theme:'rp-theme-commercial',applyUI:noop,restoreUI:noop}
  ,industrialBuilding:{key:'industrialBuilding',match:type=>type==='Industrial Building',title:'Industrial Building Registry Draft',theme:'rp-theme-industrial',applyUI:noop,restoreUI:noop}
  ,lease:{key:'lease',match:type=>/^Lease/.test(type),title:'Lease Registry Draft',theme:'rp-theme-lease',applyUI:noop,restoreUI:noop}
  ,saleAfterAgreement:{key:'saleAfterAgreement',match:type=>/^Sale After Agreement/.test(type),title:'Sale After Agreement Registry Draft',theme:'rp-theme-sale-after',applyUI:noop,restoreUI:noop}
};
const context={console,document:{title:'',getElementById:id=>ids[id]||null,querySelectorAll(selector){
  if(selector==='.view')return [ids.loginView,ids.dashboardView,ids.registryView];
  if(selector==='.draft-step-panel')return panels;
  if(selector==='.wizard-step')return steps;
  if(selector==='.property-type-card')return cards;
  if(selector==='.deed-parent-card')return parentCards;
  return [];
}},RegistryProModules:modules,scrollTo:noop,v14SessionData:()=>({role:'Advocate'}),RegistryProAgricultureReset:noop,
  toggleAgriElements:noop,applyDraftTypeFieldVisibility:noop,v123Build:noop,v123SyncVisibility:noop,v124SyncMode:noop,v1216Apply:noop,
  recalculate:()=>({}),recalculateStampDuty:noop,syncDraftPreview:noop,v14EnsureRegistryNo:noop,updateDraftNumberMini:noop,
  addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},sessionStorage:{getItem:()=>null,setItem:noop}
};
context.window=context;context.globalThis=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../app/core/routing.js'),'utf8'),context,{filename:'routing.js'});

context.startDashboardDeed('Residential Plot');
assert.strictEqual(context.RegistryProRouting.activeType(),'Residential Plot');
assert(ids.registryView.classList.contains('rp-theme-residential-plot'));

context.startDashboardDeed('Agriculture Land');
assert.strictEqual(context.RegistryProRouting.activeType(),'Agriculture Land');
assert(!ids.registryView.classList.contains('rp-theme-residential-plot'));

context.startDashboardDeed('Residential Building');
assert.strictEqual(context.RegistryProRouting.activeType(),'Residential Building');
assert(ids.registryView.classList.contains('rp-theme-residential-building'));

context.openPropertyTypeDirect({dataset:{type:'Gift Residential Plot Family'}});
assert.strictEqual(context.RegistryProRouting.activeType(),'Gift Residential Plot Family');
assert(ids.registryView.classList.contains('rp-theme-gift'));
assert(!ids.registryView.classList.contains('rp-theme-residential-building'));

context.openPropertyTypeDirect({dataset:{type:'Agreement Agriculture Land'}});
assert.strictEqual(context.RegistryProRouting.activeType(),'Agreement Agriculture Land');
assert(ids.registryView.classList.contains('rp-theme-agreement'));
assert(!ids.registryView.classList.contains('rp-theme-gift'));

context.startDashboardDeed('Commercial Building');
assert.strictEqual(context.RegistryProRouting.activeType(),'Commercial Building');
assert(ids.registryView.classList.contains('rp-theme-commercial'));

context.startDashboardDeed('Industrial Building');
assert.strictEqual(context.RegistryProRouting.activeType(),'Industrial Building');
assert(ids.registryView.classList.contains('rp-theme-industrial'));

context.startDashboardDeed('Lease');
assert.strictEqual(context.RegistryProRouting.activeType(),'Lease');
assert(ids.registryView.classList.contains('rp-theme-lease'));

context.openPropertyTypeDirect({dataset:{type:'Sale After Agreement Residential Plot'}});
assert.strictEqual(context.RegistryProRouting.activeType(),'Sale After Agreement Residential Plot');
assert(ids.registryView.classList.contains('rp-theme-sale-after'));
assert.strictEqual(context.document.title,'Registry Pro v1.20.78');

console.log('Repeat-open routing smoke test passed');
