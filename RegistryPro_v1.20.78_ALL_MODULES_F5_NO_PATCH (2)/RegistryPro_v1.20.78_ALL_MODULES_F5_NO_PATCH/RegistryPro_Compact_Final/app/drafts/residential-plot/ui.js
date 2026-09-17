/* Registry Pro clean source module. Edit this file directly; no runtime patch loader. */

/* ===== Source: residential-plot-fields.js ===== */
/* Registry Pro v1.20.47 — Residential Plot one-shot field/unit/legal/GIS fix.
   Scope: Residential Plot only. Agriculture core/UI/calculation files remain untouched. */
(function(){
'use strict';
const SQFT_PER_M2=10.76;
const SQFT_PER_HA=107639.104167;
const isRP=()=>String(window.__registryRequestedDraftType||'')==='Residential Plot';
const $=id=>document.getElementById(id);
const val=id=>($(id)?.value||'').trim();
const num=id=>parseFloat(val(id)||'0')||0;
const fieldBox=id=>$(id)?.closest('.form-grid>div')||$(id)?.closest('div');
const hiddenState=new Map(), relabelState=new Map();
let legalOriginalPos=null, areaSyncLock=false;

function rememberDisplay(el){if(el&&!hiddenState.has(el))hiddenState.set(el,el.style.display);}
function hide(el){if(!el)return;rememberDisplay(el);el.style.setProperty('display','none','important');}
function show(el){if(!el)return;if(hiddenState.has(el)){const old=hiddenState.get(el);if(old)el.style.display=old;else el.style.removeProperty('display');hiddenState.delete(el);}else el.style.removeProperty('display');}
function rememberText(el){if(el&&!relabelState.has(el))relabelState.set(el,el.textContent);}
function setText(el,t){if(!el)return;rememberText(el);el.textContent=t;}
function restoreLabels(){relabelState.forEach((t,e)=>{if(e)e.textContent=t});relabelState.clear();}
function restoreDisplays(){hiddenState.forEach((v,e)=>{if(!e)return;if(v)e.style.display=v;else e.style.removeProperty('display')});hiddenState.clear();}
function sync(){try{window.syncDraftPreview?.();}catch(_){} }
function fmt(n,d=2){return Number(n||0).toFixed(d);}
function sqftToM2(v){return (Number(v)||0)/SQFT_PER_M2;}
function m2ToSqft(v){return (Number(v)||0)*SQFT_PER_M2;}
function sqftToHa(v){return (Number(v)||0)/SQFT_PER_HA;}
function haToSqft(v){return (Number(v)||0)*SQFT_PER_HA;}

const RP_HEADINGS={
  v1216BasicSection:'Residential Plot / आवासीय प्लॉट का मूल विवरण',
  v1216OwnershipSection:'विक्रेता के स्वामित्व का आधार एवं प्लॉट की कानूनी स्थिति',
  v1216RecordSection:'Plot No. / Khasra No. / Area एवं मुख्य सड़क नियम',
  v1216LegalSection:'चारों तरफ की लंबाई-चौड़ाई / Dimensions एवं क्षेत्रफल'
};
function ensurePlotHeadings(){if(!isRP())return;Object.entries(RP_HEADINGS).forEach(([id,title])=>{const h=$(id)?.querySelector('.v1216-section-head');if(h&&h.textContent!==title)h.textContent=title;});}
function ensureSectionOrder(){
  if(!isRP())return;
  const legal=$('v1216LegalSection'),record=$('v1216RecordSection');
  if(!legal||!record||legal.parentNode!==record.parentNode)return;
  if(!legalOriginalPos)legalOriginalPos={parent:legal.parentNode,next:legal.nextSibling};
  if(legal.nextElementSibling!==record)record.parentNode.insertBefore(legal,record);
}
function restoreSectionOrder(){
  const legal=$('v1216LegalSection');
  if(!legal||!legalOriginalPos?.parent)return;
  const {parent,next}=legalOriginalPos;
  if(next&&next.parentNode===parent)parent.insertBefore(legal,next);else parent.appendChild(legal);
  legalOriginalPos=null;
}

function makeApprovalCard(id,label,detailsHtml){
  let card=$(id);if(card)return card;
  card=document.createElement('div');card.id=id;card.className='rp-approval-card';
  card.innerHTML=`<label class="rp-check-label"><input type="checkbox" class="rp-approval-toggle"> <span>${label}</span></label><div class="rp-inline-details" hidden>${detailsHtml}</div>`;
  return card;
}
function ensureOwnershipReplacements(){
  const ownership=$('v1216OwnershipSection');if(!ownership)return;
  const body=ownership.querySelector('.v1216-section-body');if(!body)return;
  hide(fieldBox('buyerFarmerStatus'));hide(fieldBox('housingDevelopmentFee'));
  hide($('rpReraBox'));hide($('rp143Box'));hide($('rpAuthorityApproval'));
  let row=$('rpLegalApprovalsRow');
  if(!row){
    row=document.createElement('div');row.id='rpLegalApprovalsRow';row.className='rp-legal-approvals-row';
    const sec143=makeApprovalCard('rp143Card','धारा 143 लागू है?',`<input id="rp143CaseNo" placeholder="वाद संख्या"><input id="rp143Date" type="date" aria-label="143 आदेश दिनांक">`);
    const rera=makeApprovalCard('rpReraCard','RERA Approved / Registered?',`<input id="rpReraNo" placeholder="RERA No."><input id="rpReraDate" type="date" aria-label="RERA Date">`);
    const hrda=makeApprovalCard('rpHrdaCard','HRDA Approved / स्वीकृत नक्शा?',`<input id="rpAuthorityFileNo" placeholder="नक्शा / File No."><input id="rpAuthorityDate" type="date" aria-label="Approval Date">`);
    const gis=makeApprovalCard('rpGisCard','GIS ID',`<input id="rpGisId" placeholder="Enter GIS ID"><button type="button" class="btn primary compact" id="rpSaveGis">Save</button>`);
    sec143.querySelector('input[type=checkbox]').id='rp143Approved';
    rera.querySelector('input[type=checkbox]').id='rpReraApproved';
    hrda.querySelector('input[type=checkbox]').id='rpMapApproved';
    gis.querySelector('input[type=checkbox]').id='rpGisEnabled';
    row.append(sec143,rera,hrda,gis);body.appendChild(row);
  }
  show(row);
}

function updateConditional(){
  [['rp143Card','rp143Approved'],['rpReraCard','rpReraApproved'],['rpHrdaCard','rpMapApproved'],['rpGisCard','rpGisEnabled']].forEach(([cardId,checkId])=>{
    const card=$(cardId),details=card?.querySelector('.rp-inline-details');if(details)details.hidden=!$(checkId)?.checked;
  });
}

function ensureDimensions(){
  const legal=$('v1216LegalSection');if(!legal)return;
  const head=legal.querySelector('.v1216-section-head');if(head)setText(head,RP_HEADINGS.v1216LegalSection);
  hide(fieldBox('buyerHoldingLimitText'));hide(fieldBox('sellerRemainingShare'));hide(fieldBox('annualLagan'));hide($('coveredAreaPanel'));
  let dim=$('rpPlotDimensions');
  if(!dim){
    dim=document.createElement('div');dim.id='rpPlotDimensions';dim.className='rp-plot-dimensions';
    dim.innerHTML=`<div class="form-grid four rp-dimension-grid">
      <div><label>East / Purab (ft)</label><input id="rpEast" type="number" step="0.01" placeholder="0.00"></div>
      <div><label>West / Paschim (ft)</label><input id="rpWest" type="number" step="0.01" placeholder="0.00"></div>
      <div><label>North / Uttar (ft)</label><input id="rpNorth" type="number" step="0.01" placeholder="0.00"></div>
      <div><label>South / Dakshin (ft)</label><input id="rpSouth" type="number" step="0.01" placeholder="0.00"></div>
    </div><div class="form-grid two rp-area-grid">
      <div><label>Total Area (sq ft) <small>Auto + Editable</small></label><input id="rpTotalAreaSqft" type="number" step="0.01" placeholder="0.00"></div>
      <div><label>Total Area (m²) <small>Auto + Editable</small></label><input id="rpTotalAreaM2" type="number" step="0.01" placeholder="0.00"></div>
    </div>`;
    legal.querySelector('.v1216-section-body')?.prepend(dim);
  }
  show(dim);
}

function dimensionAreaSqft(){
  const e=num('rpEast'),w=num('rpWest'),n=num('rpNorth'),s=num('rpSouth');
  return (e>0&&w>0&&n>0&&s>0)?((e+w)/2)*((n+s)/2):0;
}
function firstPlotRow(){return $('agriGataRows')?.querySelector('tr')||null;}
function setInputValue(el,v){if(!el)return;el.value=(Number(v)>0?fmt(v,2):'');}
function syncDimensionsFromSides(){
  if(!isRP()||areaSyncLock)return;areaSyncLock=true;
  const sqft=dimensionAreaSqft(),m2=sqftToM2(sqft);
  if(sqft>0){setInputValue($('rpTotalAreaSqft'),sqft);setInputValue($('rpTotalAreaM2'),m2);syncSaleAreaFromDimensions(sqft);}
  areaSyncLock=false;
}
function syncDimensionPair(source){
  if(areaSyncLock)return;areaSyncLock=true;
  if(source==='sqft'){const sqft=num('rpTotalAreaSqft');setInputValue($('rpTotalAreaM2'),sqftToM2(sqft));syncSaleAreaFromDimensions(sqft);}
  else {const m2=num('rpTotalAreaM2');const sqft=m2ToSqft(m2);setInputValue($('rpTotalAreaSqft'),sqft);syncSaleAreaFromDimensions(sqft);}
  areaSyncLock=false;
}
function syncSaleAreaFromDimensions(sqft){
  const tr=firstPlotRow();if(!tr||!(sqft>0))return;
  const sold=tr.querySelector('.gata-sold-area');if(sold){sold.value=fmt(sqft,2);sold.dispatchEvent(new Event('input',{bubbles:true}));}
  const soldM2=tr.querySelector('.rp-row-sold-m2');if(soldM2)soldM2.value=fmt(sqftToM2(sqft),2);
}

function ensureRowMeters(tr){
  if(!tr)return;
  const total=tr.querySelector('.gata-total-area'),sold=tr.querySelector('.gata-sold-area');
  if(total){total.step='0.01';total.placeholder='sq ft';}
  if(sold){sold.step='0.01';sold.placeholder='sq ft';}
  const totalTd=total?.closest('td'),soldTd=sold?.closest('td');
  if(totalTd&&!totalTd.querySelector('.rp-row-total-m2')){const m=document.createElement('input');m.type='number';m.step='0.01';m.placeholder='m²';m.className='rp-row-m2 rp-row-total-m2';total.insertAdjacentElement('afterend',m);}
  if(soldTd&&!soldTd.querySelector('.rp-row-sold-m2')){const m=document.createElement('input');m.type='number';m.step='0.01';m.placeholder='m²';m.className='rp-row-m2 rp-row-sold-m2';sold.insertAdjacentElement('afterend',m);}
  syncRowPair(tr,'sqft-total',false);syncRowPair(tr,'sqft-sold',false);
}
function syncRowPair(tr,source,doCore=true){
  if(!tr||areaSyncLock)return;areaSyncLock=true;
  const total=tr.querySelector('.gata-total-area'),sold=tr.querySelector('.gata-sold-area'),tm=tr.querySelector('.rp-row-total-m2'),sm=tr.querySelector('.rp-row-sold-m2');
  if(source==='sqft-total'&&tm)tm.value=Number(total?.value||0)>0?fmt(sqftToM2(total.value),2):'';
  if(source==='m2-total'&&total)total.value=Number(tm?.value||0)>0?fmt(m2ToSqft(tm.value),2):'';
  if(source==='sqft-sold'&&sm)sm.value=Number(sold?.value||0)>0?fmt(sqftToM2(sold.value),2):'';
  if(source==='m2-sold'&&sold)sold.value=Number(sm?.value||0)>0?fmt(m2ToSqft(sm.value),2):'';
  areaSyncLock=false;
  if(doCore){try{window.updateAgriAreaFromRows?.();window.recalculate?.();window.recalculateStampDuty?.();}catch(_){} sync();}
}
function ensureRecordSection(){
  const head=$('v1216RecordSection')?.querySelector('.v1216-section-head');if(head)setText(head,RP_HEADINGS.v1216RecordSection);
  const table=$('agriGataRows')?.closest('table');
  if(table){
    const th=[...table.querySelectorAll('thead th')];
    if(th[1])setText(th[1],'Plot No.');if(th[2])setText(th[2],'Khasra No.');
    if(th[3])setText(th[3],'Area (sq ft / m²)');if(th[4])setText(th[4],'में से विक्रित क्षेत्रफल (sq ft / m²)');
    table.querySelectorAll('.gata-chak').forEach(i=>{if(!i.dataset.rpOrigPlaceholder)i.dataset.rpOrigPlaceholder=i.placeholder||'';i.placeholder='Plot No.';});
    table.querySelectorAll('.gata-number').forEach(i=>{if(!i.dataset.rpOrigPlaceholder)i.dataset.rpOrigPlaceholder=i.placeholder||'';i.placeholder='Khasra No.';});
    table.querySelectorAll('tbody tr').forEach(ensureRowMeters);
  }
  const addBtn=$('agriGataRows')?.closest('.v1216-section-body')?.querySelector('.agri-add-row');if(addBtn)setText(addBtn,'＋ Add Plot / Khasra');
}

function ensureGisBox(){
  // Residential Plot GIS now lives only in the top legal-status row.
  // Keep the original Agriculture GIS control hidden so no duplicate row appears below.
  const wrap=$('v1216EnterpriseGis');if(wrap)hide(wrap);
  const old=$('rpGisDetails');if(old)old.remove();
  const card=$('rpGisCard');if(card)show(card);
  updateConditional();
}
function saveGis(){
  const id=val('rpGisId');try{localStorage.setItem('registryProResidentialPlotGIS',id);}catch(_){}
  try{window.toast?.(id?'GIS ID saved':'GIS ID cleared');}catch(_){}
  sync();
}

// Residential Plot uses sq ft in visible Gata/Plot fields. Convert to hectare only for the untouched Agriculture engine.
const baseCollect=window.collectAgriGataRows;
if(typeof baseCollect==='function')window.collectAgriGataRows=function(){
  if(!isRP())return baseCollect.apply(this,arguments);
  return [...document.querySelectorAll('#agriGataRows tr')].map(tr=>{
    const totalSqft=parseFloat(tr.querySelector('.gata-total-area')?.value||'0')||0;
    const soldSqft=parseFloat(tr.querySelector('.gata-sold-area')?.value||'0')||0;
    return {chak:(tr.querySelector('.gata-chak')?.value||'').trim(),gata:(tr.querySelector('.gata-number')?.value||'').trim(),totalArea:sqftToHa(totalSqft),soldArea:sqftToHa(soldSqft),area:sqftToHa(soldSqft),_rpTotalSqft:totalSqft,_rpSoldSqft:soldSqft};
  }).filter(x=>x.chak||x.gata||x._rpTotalSqft>0||x._rpSoldSqft>0);
};
const baseGataTotal=window.gataAreaTotal;
window.gataAreaTotal=function(){if(!isRP())return typeof baseGataTotal==='function'?baseGataTotal.apply(this,arguments):0;return [...document.querySelectorAll('#agriGataRows .gata-sold-area')].reduce((a,e)=>a+sqftToHa(parseFloat(e.value||'0')||0),0);};
const baseAddGata=window.addAgriGataRow;
if(typeof baseAddGata==='function')window.addAgriGataRow=function(data={}){
  if(!isRP())return baseAddGata.apply(this,arguments);
  const converted={...data};
  if(Number(data.totalArea)>0&&Number(data.totalArea)<100)converted.totalArea=haToSqft(data.totalArea);
  if(Number(data.soldArea)>0&&Number(data.soldArea)<100)converted.soldArea=haToSqft(data.soldArea);
  const r=baseAddGata.call(this,converted);ensureRecordSection();const rows=[...document.querySelectorAll('#agriGataRows tr')];ensureRowMeters(rows[rows.length-1]);return r;
};

function plotData(){
  const row=firstPlotRow();
  const totalSqft=parseFloat(row?.querySelector('.gata-total-area')?.value||'0')||0;
  const soldSqft=parseFloat(row?.querySelector('.gata-sold-area')?.value||'0')||num('rpTotalAreaSqft')||0;
  return {
    plotNo:(row?.querySelector('.gata-chak')?.value||'').trim(),khasraNo:(row?.querySelector('.gata-number')?.value||'').trim(),
    sourceAreaSqft:totalSqft,sourceAreaM2:sqftToM2(totalSqft),saleAreaSqft:soldSqft,saleAreaM2:sqftToM2(soldSqft),
    east:num('rpEast'),west:num('rpWest'),north:num('rpNorth'),south:num('rpSouth'),totalAreaSqft:num('rpTotalAreaSqft')||soldSqft,totalAreaM2:num('rpTotalAreaM2')||sqftToM2(soldSqft),
    reraApproved:!!$('rpReraApproved')?.checked,reraNo:val('rpReraNo'),reraDate:val('rpReraDate'),
    section143:!!$('rp143Approved')?.checked,case143No:val('rp143CaseNo'),case143Date:val('rp143Date'),
    mapApproved:!!$('rpMapApproved')?.checked,authority:'HRDA',authorityFileNo:val('rpAuthorityFileNo'),authorityDate:val('rpAuthorityDate'),
    gisEnabled:!!$('rpGisEnabled')?.checked,gisId:val('rpGisId')
  };
}

if(typeof window.v19Type==='function'){const base=window.v19Type;window.v19Type=function(){return isRP()?'Residential Plot':base.apply(this,arguments);};}
if(typeof window.draftData==='function'){
  const base=window.draftData;window.draftData=function(){
    const d=base.apply(this,arguments);if(!isRP())return d;const p=plotData();
    d.registryType='Residential Plot';d.residentialPlot=p;d.residentialCovered={enabled:false,m2:0,rate:0,value:0};
    d.khasraNo=p.khasraNo||d.khasraNo;d.houseFlatNo=p.plotNo||d.houseFlatNo;
    // Actual sold plot area is the Residential Plot area. Source/parent area may legally remain 0.
    if(p.saleAreaM2>0){d.areaM2=p.saleAreaM2;d.areaSqft=p.saleAreaSqft;}
    else if(p.totalAreaM2>0){d.areaM2=p.totalAreaM2;d.areaSqft=p.totalAreaSqft;}
    d.reraApproved=p.reraApproved;d.reraNo=p.reraNo;d.reraDate=p.reraDate;return d;
  };
}
if(typeof window.v14LoadDraftFields==='function'){
  const base=window.v14LoadDraftFields;window.v14LoadDraftFields=function(d){const r=base.apply(this,arguments);
    if(!isRP()||!d?.residentialPlot)return r;const p=d.residentialPlot,set=(id,v)=>{if($(id))$(id).value=v??''},chk=(id,v)=>{if($(id))$(id).checked=!!v};
    set('rpEast',p.east);set('rpWest',p.west);set('rpNorth',p.north);set('rpSouth',p.south);set('rpTotalAreaSqft',p.totalAreaSqft||p.saleAreaSqft);set('rpTotalAreaM2',p.totalAreaM2||p.saleAreaM2);
    chk('rpReraApproved',p.reraApproved);set('rpReraNo',p.reraNo);set('rpReraDate',p.reraDate);chk('rp143Approved',p.section143);set('rp143CaseNo',p.case143No);set('rp143Date',p.case143Date);chk('rpMapApproved',p.mapApproved);set('rpAuthorityFileNo',p.authorityFileNo);set('rpAuthorityDate',p.authorityDate);chk('rpGisEnabled',p.gisEnabled);set('rpGisId',p.gisId);updateConditional();
    return r;};
}

// Residential Plot final PDF additions; never print zero source area.
if(typeof window.v19ResidentialFinalDeed==='function'){
  const base=window.v19ResidentialFinalDeed;window.v19ResidentialFinalDeed=function(d){base.apply(this,arguments);if(!isRP())return;const p=d.residentialPlot||{};const pages=document.querySelectorAll('#legalDraftPreview .v19-residential-deed .deed-page');const p1=pages[0],p4=pages[3];
    if(p1){const anchor=[...p1.querySelectorAll('p')].find(x=>/विक्रेता का नाम/.test(x.textContent||''));const lines=[];
      if(p.reraApproved)lines.push(`<p><b>RERA विवरण:-</b> उक्त सम्पत्ति RERA से सम्बन्धित है, RERA REG.No- <b>${esc(p.reraNo||'-')}</b>${p.reraDate?` दिनांक <b>${esc(v19DateText(p.reraDate))}</b>`:''}।</p>`);
      if(p.section143)lines.push(`<p><b>धारा 143 विवरण:-</b> वाद संख्या <b>${esc(p.case143No||'-')}</b>${p.case143Date?` में आदेश दिनांक <b>${esc(v19DateText(p.case143Date))}</b>`:''} द्वारा आवासीय/अकृषिक प्रयोजन हेतु घोषित।</p>`);
      if(p.mapApproved)lines.push(`<p><b>HRDA स्वीकृत मानचित्र:-</b> नक्शा/फाइल संख्या <b>${esc(p.authorityFileNo||'-')}</b>${p.authorityDate?` दिनांक <b>${esc(v19DateText(p.authorityDate))}</b>`:''}।</p>`);
      if(lines.length&&anchor)anchor.insertAdjacentHTML('beforebegin',lines.join(''));
    }
    if(p4){const first=p4.querySelector('p');if(first){const bits=[];if(p.plotNo)bits.push(`प्लॉट नं0 ${esc(p.plotNo)}`);if(p.khasraNo)bits.push(`खसरा नं0 ${esc(p.khasraNo)}`);if(p.east>0)bits.push(`पूरब ${fmt(p.east)} फुट`);if(p.west>0)bits.push(`पश्चिम ${fmt(p.west)} फुट`);if(p.north>0)bits.push(`उत्तर ${fmt(p.north)} फुट`);if(p.south>0)bits.push(`दक्षिण ${fmt(p.south)} फुट`);const aSqft=Number(p.saleAreaSqft||p.totalAreaSqft||0),aM2=Number(p.saleAreaM2||p.totalAreaM2||0);if(aSqft>0)bits.push(`कुल क्षेत्रफल ${fmt(aSqft)} वर्गफुट`);if(aM2>0)bits.push(`${fmt(aM2)} वर्गमीटर`);if(bits.length)first.insertAdjacentHTML('afterend',`<p><b>प्लॉट माप/क्षेत्रफल:-</b> ${bits.join(', ')}।</p>`);}}
  };
}

function bindOnce(){
  if(document.documentElement.dataset.rpPlotBound47)return;document.documentElement.dataset.rpPlotBound47='1';
  document.addEventListener('change',e=>{if(!isRP())return;
    if(['rpReraApproved','rp143Approved','rpMapApproved','rpGisEnabled'].includes(e.target?.id)){updateConditional();sync();}
  });
  document.addEventListener('input',e=>{if(!isRP())return;const id=e.target?.id||'';
    if(['rpEast','rpWest','rpNorth','rpSouth'].includes(id)){syncDimensionsFromSides();sync();}
    if(id==='rpTotalAreaSqft'){syncDimensionPair('sqft');sync();}if(id==='rpTotalAreaM2'){syncDimensionPair('m2');sync();}
    const tr=e.target?.closest?.('#agriGataRows tr');if(tr){if(e.target.matches('.gata-total-area'))syncRowPair(tr,'sqft-total');else if(e.target.matches('.rp-row-total-m2'))syncRowPair(tr,'m2-total');else if(e.target.matches('.gata-sold-area'))syncRowPair(tr,'sqft-sold');else if(e.target.matches('.rp-row-sold-m2'))syncRowPair(tr,'m2-sold');}
    if(['rpReraNo','rpReraDate','rp143CaseNo','rp143Date','rpAuthorityFileNo','rpAuthorityDate','rpGisId'].includes(id))sync();
  });
  document.addEventListener('click',e=>{if(isRP()&&e.target?.id==='rpSaveGis'){e.preventDefault();saveGis();}});
}

function apply(){
  if(!isRP()){restore();return;}
  ensurePlotHeadings();ensureOwnershipReplacements();ensureDimensions();ensureSectionOrder();ensureRecordSection();ensureGisBox();updateConditional();
  document.getElementById('registryView')?.classList.add('rp-residential-plot-fields');
}
function restore(){
  document.getElementById('registryView')?.classList.remove('rp-residential-plot-fields');
  ['rpLegalApprovalsRow','rpPlotDimensions'].forEach(id=>hide($(id)));restoreSectionOrder();restoreDisplays();restoreLabels();
  document.querySelectorAll('.rp-row-m2').forEach(x=>x.remove());
  document.querySelectorAll('.gata-chak').forEach(i=>{if(i.dataset.rpOrigPlaceholder!==undefined)i.placeholder=i.dataset.rpOrigPlaceholder});document.querySelectorAll('.gata-number').forEach(i=>{if(i.dataset.rpOrigPlaceholder!==undefined)i.placeholder=i.dataset.rpOrigPlaceholder});
}

bindOnce();
window.RegistryProModules=window.RegistryProModules||{};
window.RegistryProModules.residentialPlot=Object.assign(window.RegistryProModules.residentialPlot||{},{
  key:'residentialPlot',match:type=>String(type||'').toLowerCase()==='residential plot',
  title:'Residential Plot Registry Draft',theme:'rp-theme-residential-plot',applyUI:apply,restoreUI:restore
});
console.info('Registry Pro v1.20.48 Residential Plot GIS/legal toggle/conversion fix loaded; Agriculture untouched');
})();
