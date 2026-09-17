/* Registry Pro clean source module. Edit this file directly; no runtime patch loader. */

/* ===== Source: app.js ===== */
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}
function showLogin(){ showView('loginView'); }
function showCreate(){ showView('createView'); }
function showForgot(){ showView('forgotView'); }
function showDashboard(){ showView('dashboardView'); }
function openNewRegistry(){ showView('registryView'); recalculate(); }
function demoLogin(){ showDashboard(); toast('Dashboard opened (starter mode)'); }
function starterCreateAccount(){ toast('Account form ready. Firebase connection next step.'); showLogin(); }
function starterForgot(){ toast('Reset flow UI ready. Firebase connection next step.'); }
function comingSoon(name){ toast(name + ' module will be added next.'); }

function num(id){
  const v=parseFloat(document.getElementById(id).value);
  return isNaN(v)?0:v;
}
function money(v){
  try { return '₹' + Math.round(v).toLocaleString('en-IN'); }
  catch(e){ return '₹' + Math.round(v); }
}
function recalculate(){
  const east=num('east'), west=num('west'), north=num('north'), south=num('south');
  const avgLength=(east+west)/2;
  const avgWidth=(north+south)/2;
  const area=(east && west && north && south) ? avgLength*avgWidth : 0;
  const rate=num('circleRate');
  const factor=parseFloat(document.getElementById('roadWidth').value || '1');
  const base=area*rate;
  const value=base*factor;
  document.getElementById('areaOut').textContent=area.toFixed(2)+' m²';
  document.getElementById('baseOut').textContent=money(base);
  document.getElementById('valueOut').textContent=money(value);
}
function loadDemoRate(){
  const v=document.getElementById('village').value;
  if(v==='Bhagwanpur'){
    document.getElementById('circleRate').value='8000';
    document.getElementById('rateRef').value='Demo: Page 52 / Col 2 / Row 6 / Col 5';
  } else {
    document.getElementById('circleRate').value='';
    document.getElementById('rateRef').value='';
  }
  recalculate();
}
function currentDraft(){
  return {
    id: Date.now(),
    savedAt: new Date().toLocaleString(),
    registryType: document.getElementById('registryType').value,
    village: document.getElementById('village').value,
    circleRate: num('circleRate'),
    rateRef: document.getElementById('rateRef').value,
    roadWidth: document.getElementById('roadWidth').options[document.getElementById('roadWidth').selectedIndex].text,
    roadFactor: parseFloat(document.getElementById('roadWidth').value),
    east:num('east'),west:num('west'),north:num('north'),south:num('south')
  }
}
function saveDraft(){
  const d=currentDraft();
  const arr=JSON.parse(localStorage.getItem('registryProDrafts')||'[]');
  arr.unshift(d);
  localStorage.setItem('registryProDrafts',JSON.stringify(arr.slice(0,50)));
  toast('Draft saved on this laptop');
}
function nextStarterStep(){
  saveDraft();
  toast('Property step complete. Parties screen will be built next.');
}
function openSavedDrafts(){
  const list=document.getElementById('savedList');
  const arr=JSON.parse(localStorage.getItem('registryProDrafts')||'[]');
  if(!arr.length){
    list.innerHTML='<div class="card"><h3>No saved drafts yet</h3><p class="hint">Create a Residential Plot draft and press Save Draft.</p></div>';
  } else {
    list.innerHTML=arr.map(d=>{
      const area=((d.east+d.west)/2)*((d.north+d.south)/2);
      const val=area*d.circleRate*(d.roadFactor||1);
      return `<div class="saved-item">
        <h4>${d.registryType || 'Residential Plot'} — ${d.village || 'Village not selected'}</h4>
        <div><strong>Area:</strong> ${area.toFixed(2)} m² &nbsp; <strong>Value:</strong> ${money(val)}</div>
        <div class="saved-meta">${d.savedAt} • ${d.rateRef || 'No rate reference'}</div>
      </div>`;
    }).join('');
  }
  showView('savedView');
}
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2200);
}


function toggleSidebar(){
  const s=document.querySelector('.sidebar');
  if(s) s.classList.toggle('open');
}
function dashboardSearch(q){
  q=(q||'').trim().toLowerCase();
  if(!q) return;
  const targets=[
    ['new registry','openNewRegistry'],
    ['saved','openSavedDrafts'],
    ['party','comingSoon'],
    ['property','comingSoon'],
    ['template','comingSoon'],
    ['report','comingSoon'],
    ['setting','comingSoon']
  ];
}
function refreshDashboard(){
  const arr=JSON.parse(localStorage.getItem('registryProDrafts')||'[]');
  const total=arr.length;
  const el1=document.getElementById('statTotalDrafts');
  const el2=document.getElementById('statSavedDrafts');
  const ov=document.getElementById('ovCreated');
  if(el1) el1.textContent=total;
  if(el2) el2.textContent=total;
  if(ov) ov.textContent=total;
  const box=document.getElementById('recentDrafts');
  if(!box) return;
  if(!arr.length){
    box.innerHTML='<div class="empty-recent">No draft yet.<br>Create your first Registry Draft.</div>';
    return;
  }
  const items=arr.slice(0,5).map((d,i)=>{
    const buyer = d.village || 'Village not selected';
    const date = d.savedAt || '';
    const stat = i===1 ? '<span class="status-chip progress">In Progress</span>' : '<span class="status-chip">Saved</span>';
    return `<div class="recent-item">
      <div class="recent-doc">▤</div>
      <div class="recent-main">
        <strong>${d.registryType || 'Residential Plot'} — ${buyer}</strong>
        <small>Draft #RD-${String(d.id||Date.now()).slice(-6)} • ${date}</small>
      </div>
      ${stat}
      <div class="more-dot">⋮</div>
    </div>`;
  }).join('');
  box.innerHTML=items;
}

const _oldShowDashboard = showDashboard;
showDashboard = function(){
  showView('dashboardView');
  refreshDashboard();
};

const _oldDemoLogin = demoLogin;
demoLogin = function(){
  showDashboard();
  toast('Dashboard opened (starter mode)');
};

const _oldSaveDraft = saveDraft;
saveDraft = function(){
  const d=currentDraft();
  const arr=JSON.parse(localStorage.getItem('registryProDrafts')||'[]');
  arr.unshift(d);
  localStorage.setItem('registryProDrafts',JSON.stringify(arr.slice(0,50)));
  refreshDashboard();
  toast('Draft saved on this laptop');
};


/* ===== v0.4 Full Draft Wizard Logic ===== */
let registrySelectedType = 'Residential Plot';
let currentDraftStep = 1;
let paymentRowCounter = 0;

function val(id){
  const e=document.getElementById(id);
  return e ? (e.value || '').trim() : '';
}
function numv(id){
  const x=parseFloat(val(id));
  return isNaN(x)?0:x;
}
function inr(v){
  const n=isNaN(Number(v))?0:Number(v);
  try{return '₹'+Math.round(n).toLocaleString('en-IN')}catch(e){return '₹'+Math.round(n)}
}
function selectPropertyType(el){
  document.querySelectorAll('.property-type-card').forEach(x=>x.classList.remove('selected'));
  el.classList.add('selected');
  registrySelectedType=el.dataset.type || 'Residential Plot';
  const lab=document.getElementById('selectedTypeLabel');
  const mini=document.getElementById('draftTypeMini');
  if(lab) lab.textContent=registrySelectedType;
  if(mini) mini.textContent=registrySelectedType;
}
function openNewRegistry(){
  showView('registryView');
  const a=document.getElementById('draftTypeScreen');
  const b=document.getElementById('draftStepsScreen');
  if(a)a.classList.add('active');
  if(b)b.classList.remove('active');
  currentDraftStep=1;
  if(document.getElementById('paymentRows') && !document.getElementById('paymentRows').children.length){
    addPaymentRow(); addPaymentRow(); addPaymentRow();
  }
  recalculate();
  recalculateStampDuty();
}
function startDraftSteps(){
  document.getElementById('draftTypeScreen').classList.remove('active');
  document.getElementById('draftStepsScreen').classList.add('active');
  goDraftStep(1);
}
function goDraftStep(step){
  currentDraftStep=Math.min(5,Math.max(1,Number(step)||1));
  document.querySelectorAll('.draft-step-panel').forEach(p=>p.classList.remove('active'));
  const panel=document.getElementById('draftStep'+currentDraftStep);
  if(panel) panel.classList.add('active');
  document.querySelectorAll('.wizard-step').forEach(s=>{
    const n=Number(s.dataset.step);
    s.classList.toggle('active',n===currentDraftStep);
    s.classList.toggle('done',n<currentDraftStep);
  });
  const page=document.getElementById('draftPageNo');
  if(page) page.textContent=currentDraftStep;
  const next=document.getElementById('draftNextBtn');
  if(next) next.textContent=currentDraftStep===5?'Save Final Draft':'Save & Continue →';
  if(currentDraftStep===5){ syncDraftPreview(); }
  window.scrollTo(0,0);
}
function draftBack(){
  if(currentDraftStep===1){
    document.getElementById('draftStepsScreen').classList.remove('active');
    document.getElementById('draftTypeScreen').classList.add('active');
  } else goDraftStep(currentDraftStep-1);
}
function draftNext(){
  saveDraftV04(false);
  if(currentDraftStep<5) goDraftStep(currentDraftStep+1);
  else{
    saveDraftV04(true);
    toast('Final draft saved on this laptop');
  }
}
function showPartyTab(which,btn){
  document.querySelectorAll('.party-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.party-tabs .party-tab').forEach(b=>b.classList.remove('active'));
  const p=document.getElementById(which+'Party'); if(p)p.classList.add('active');
  if(btn)btn.classList.add('active');
}
function showWitnessTab(n,btn){
  document.querySelectorAll('.witness-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.witness-tabs .party-tab').forEach(b=>b.classList.remove('active'));
  const p=document.getElementById('witness'+n); if(p)p.classList.add('active');
  if(btn)btn.classList.add('active');
}
function toggleFinger(btn){
  btn.classList.toggle('captured');
  btn.querySelector('span').textContent=btn.classList.contains('captured')?'✓':'◉';
}
function filePicked(input){
  const card=input.closest('.upload-card');
  if(!card)return;
  if(input.files && input.files[0]){
    card.classList.add('picked');
    card.querySelector('span').textContent=input.files[0].name.slice(0,18);
  }
}
function loadDemoRate(){
  const v=val('village');
  const select=document.getElementById('circleRateSelect');
  if(!select)return;
  if(v==='Bhagwanpur'){
    select.value='6300';
    const ref=document.getElementById('rateRef');
    if(ref && !ref.value) ref.value='Demo reference — official PDF mapping pending';
  } else if(!select.value){
    select.value='5300';
  }
  applyCircleRateOption();
}
function applyCircleRateOption(){
  let hidden=document.getElementById('circleRate');
  if(!hidden){
    hidden=document.createElement('input');
    hidden.type='hidden';hidden.id='circleRate';
    document.body.appendChild(hidden);
  }
  hidden.value=val('circleRateSelect');
  recalculate(); recalculateStampDuty(); syncDraftPreview();
}
let areaManualOverride=false;
function calculateAreaFromDimensions(){
  const east=numv('east'), west=numv('west'), north=numv('north'), south=numv('south');
  if(!(east&&west&&north&&south)) return 0;
  return ((east+west)/2)*((north+south)/2);
}
function calculateArea(){
  const dimensionSqft=calculateAreaFromDimensions();
  const manualSqft=numv('totalAreaSqft');
  const sqft=(areaManualOverride && manualSqft>0) ? manualSqft : (dimensionSqft || manualSqft || 0);
  return {sqft, m2:sqft*0.092903};
}
function writeAreaFieldFromDimensions(){
  const input=document.getElementById('totalAreaSqft');
  const sqft=calculateAreaFromDimensions();
  if(input) input.value=sqft>0 ? sqft.toFixed(2) : '';
  const m2=document.getElementById('editableAreaM2');
  if(m2)m2.textContent=(sqft*0.092903).toFixed(2)+' m²';
}
function onDimensionsChanged(){
  areaManualOverride=false;
  writeAreaFieldFromDimensions();
  recalculate();recalculateStampDuty();syncDraftPreview();
}
function onTotalAreaEdited(){
  areaManualOverride=true;
  const sqft=numv('totalAreaSqft');
  const m2=document.getElementById('editableAreaM2');
  if(m2)m2.textContent=(sqft*0.092903).toFixed(2)+' m²';
  recalculate();recalculateStampDuty();syncDraftPreview();
}
function recalculate(){
  const area=calculateArea();
  const rate=numv('circleRateSelect') || numv('circleRate');
  const road=parseFloat(val('roadWidth')||'1')||1;
  const base=area.m2*rate;
  const plot=base*road;
  const areaOut=document.getElementById('areaOut'); if(areaOut)areaOut.textContent=area.sqft.toFixed(2)+' sq ft';
  const areaM=document.getElementById('areaM2Out'); if(areaM)areaM.textContent=area.m2.toFixed(2)+' m²';
  const editM=document.getElementById('editableAreaM2'); if(editM)editM.textContent=area.m2.toFixed(2)+' m²';
  const cr=document.getElementById('circleRateOut'); if(cr)cr.textContent=inr(rate);
  const vo=document.getElementById('valueOut'); if(vo)vo.textContent=inr(base);
  const pv=document.getElementById('plotValueDisplay'); if(pv)pv.value=inr(plot);
  return {area,rate,road,base,plot};
}
function addPaymentRow(){
  const body=document.getElementById('paymentRows'); if(!body)return;
  paymentRowCounter++;
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${paymentRowCounter}</td>
    <td><select onchange="updatePaymentTotal()">
      <option>Cash / नकद</option><option>RTGS</option><option>NEFT</option><option>Cheque</option><option>Bank Transfer</option><option>UPI</option><option>Other</option>
    </select></td>
    <td><input class="pay-amount" type="number" min="0" oninput="updatePaymentTotal()" placeholder="0"></td>
    <td><input class="pay-ref" placeholder="Reference / Cheque / RTGS No."></td>
    <td><input class="pay-date" type="date"></td>
    <td><button class="del-row" onclick="deletePaymentRow(this)">✕</button></td>`;
  body.appendChild(tr);
  updatePaymentTotal();
}
function deletePaymentRow(btn){
  const tr=btn.closest('tr'); if(tr)tr.remove();
  renumberPayments(); updatePaymentTotal();
}
function renumberPayments(){
  document.querySelectorAll('#paymentRows tr').forEach((tr,i)=>tr.children[0].textContent=i+1);
}
function updatePaymentTotal(){
  let total=0;
  document.querySelectorAll('.pay-amount').forEach(x=>total+=parseFloat(x.value)||0);
  const out=document.getElementById('paymentTotal'); if(out)out.textContent=inr(total);
  const txn=numv('transactionAmount');
  const match=document.getElementById('paymentMatch');
  if(match){
    if(!txn) match.textContent='';
    else if(Math.abs(total-txn)<0.5){match.textContent='✓ Matches transaction amount';match.className='match-ok'}
    else{match.textContent='Difference '+inr(txn-total);match.className='match-bad'}
  }
}
let selectedRebateType='none';
function rebateUseCount(){
  const checked=document.querySelector('input[name="rebateUse"]:checked');
  return checked ? Number(checked.value||1) : 1;
}
function selectRebateType(type,source){
  selectedRebateType=['none','female','army','mixed'].includes(type)?type:'none';
  const ids={none:'rebateNo',female:'rebateFemale',army:'rebateArmy',mixed:'rebateMixed'};
  Object.entries(ids).forEach(([key,id])=>{
    const input=document.getElementById(id);
    if(input)input.checked=(key===selectedRebateType);
    const label=input?.closest('.rebate-choice');
    if(label)label.classList.toggle('active',key===selectedRebateType);
  });
  const extra=document.getElementById('rebateExtra');
  if(extra)extra.hidden=(selectedRebateType==='none');
  const mixed=document.getElementById('mixedShareWrap');
  if(mixed)mixed.hidden=(selectedRebateType!=='mixed');
  updateMixedShare();
  recalculateStampDuty();syncDraftPreview();
}
function updateMixedShare(){
  const input=document.getElementById('femaleSharePercent');
  let female=parseFloat(input?.value||'50');
  if(!Number.isFinite(female))female=50;
  female=Math.min(99,Math.max(1,female));
  const male=100-female;
  const out=document.getElementById('maleShareText');
  if(out)out.textContent='Male Share: '+male.toFixed(Number.isInteger(male)?0:2)+'%';
  return {female,male};
}
function concessionDuty(amount){
  const concessionCap=2500000;
  const concessional=Math.min(Math.max(amount,0),concessionCap);
  const normal=Math.max(amount-concessionCap,0);
  return {concessional,normal,duty:(concessional*0.0375)+(normal*0.05)};
}
function stampDutyDetails(){
  const c=recalculate();
  const txn=numv('transactionAmount');
  const applicable=Math.max(c.plot||0,txn||0);
  const use=rebateUseCount();
  let payable=applicable*0.05;
  let rateLabel='5%';
  let breakdown='No Rebate: 5% on applicable value.';

  if((selectedRebateType==='female' || selectedRebateType==='army') && use<=2){
    const d=concessionDuty(applicable);
    payable=d.duty;
    rateLabel='3.75% up to ₹25L + 5%';
    const who=selectedRebateType==='female'?'Female Buyer':'Army Buyer';
    breakdown=`${who} • ${use===1?'First':'Second'} concession: ${inr(d.concessional)} @ 3.75%${d.normal>0?' + '+inr(d.normal)+' @ 5%':''}.`;
  }else if(selectedRebateType==='mixed' && use<=2){
    const shares=updateMixedShare();
    const femaleAmount=applicable*(shares.female/100);
    const maleAmount=applicable-femaleAmount;
    const fd=concessionDuty(femaleAmount);
    payable=(maleAmount*0.05)+fd.duty;
    rateLabel='Male 5% + Female 3.75%/5%';
    breakdown=`Male ${shares.male.toFixed(Number.isInteger(shares.male)?0:2)}%: ${inr(maleAmount)} @ 5%. Female ${shares.female.toFixed(Number.isInteger(shares.female)?0:2)}%: ${inr(fd.concessional)} @ 3.75%${fd.normal>0?' + '+inr(fd.normal)+' @ 5%':''}.`;
  }
  return {c,txn,applicable,payable,rateLabel,breakdown,use,rebateType:selectedRebateType};
}
function recalculateStampDuty(){
  const s=stampDutyDetails();
  const map={
    stampGovValue:inr(s.c.plot||0),
    stampTxnValue:inr(s.txn),
    stampApplicable:inr(s.applicable),
    stampRate:s.rateLabel,
    stampPayable:inr(s.payable)
  };
  for(const [id,txt] of Object.entries(map)){const e=document.getElementById(id);if(e)e.textContent=txt}
  const detail=document.getElementById('stampRuleBreakdown');if(detail)detail.textContent=s.breakdown;
  updatePaymentTotal();
  return s;
}
function collectPaymentRows(){
  return [...document.querySelectorAll('#paymentRows tr')].map(tr=>{
    const sel=tr.querySelector('select');
    return {
      mode:sel?sel.value:'',
      amount:parseFloat(tr.querySelector('.pay-amount')?.value)||0,
      ref:tr.querySelector('.pay-ref')?.value||'',
      date:tr.querySelector('.pay-date')?.value||''
    };
  });
}
function draftData(){
  const c=recalculate();
  return {
    id: Date.now(),
    savedAt:new Date().toLocaleString(),
    registryType:registrySelectedType,
    village:val('village'),
    circleRate:numv('circleRateSelect'),
    circleRateKey:selectedCircleRateKey || (document.getElementById('circleRateSelect')?.selectedOptions?.[0]?.dataset?.rateKey||''),
    circleRateColumn:document.getElementById('circleRateSelect')?.selectedOptions?.[0]?.dataset?.column||'',
    circleRateRowId:val('selectedCircleRowId'),
    rateRef:val('rateRef'),
    east:numv('east'),west:numv('west'),north:numv('north'),south:numv('south'),
    areaSqft:c.area.sqft,areaM2:c.area.m2,areaManualOverride:areaManualOverride,roadFactor:c.road,plotValue:c.plot,
    khataNo:val('khataNo'),khasraNo:val('khasraNo'),houseFlatNo:val('houseFlatNo'),floor:val('floorSelect'),
    rebateType:selectedRebateType,rebateUse:rebateUseCount(),femaleSharePercent:numv('femaleSharePercent')||50,
    boundaries:{east:val('boundaryEast'),west:val('boundaryWest'),north:val('boundaryNorth'),south:val('boundarySouth')},
    seller:{name:val('sellerName'),father:val('sellerFather'),address:val('sellerAddress'),pan:val('sellerPan'),aadhaar:val('sellerAadhaar'),email:val('sellerEmail'),mobile:val('sellerMobile')},
    buyer:{name:val('buyerName'),father:val('buyerFather'),address:val('buyerAddress'),pan:val('buyerPan'),aadhaar:val('buyerAadhaar'),email:val('buyerEmail'),mobile:val('buyerMobile')},
    witness1:{name:val('witness1Name'),father:val('witness1Father'),address:val('witness1Address'),mobile:val('witness1Mobile'),id:val('witness1Id')},
    witness2:{name:val('witness2Name'),father:val('witness2Father'),address:val('witness2Address'),mobile:val('witness2Mobile'),id:val('witness2Id')},
    advocate:{name:val('advocateName'),enrollment:val('advocateEnrollment'),mobile:val('advocateMobile')},
    transactionAmount:numv('transactionAmount'),
    advanceAmount:numv('advanceAmount'),
    stampDuty:stampDutyDetails().payable,
    payments:collectPaymentRows(),
    reraApproved:document.getElementById('reraApproved')?.checked||false,
    reraNo:val('reraNo'),reraDate:val('reraDate')
  };
}
function saveDraftV04(finalSave){
  const d=draftData();
  d.status=finalSave?'Completed':'In Progress';
  const arr=JSON.parse(localStorage.getItem('registryProDrafts')||'[]');
  const same=arr.findIndex(x=>x._workingDraft===true);
  d._workingDraft=!finalSave;
  if(same>=0)arr[same]=d;else arr.unshift(d);
  localStorage.setItem('registryProDrafts',JSON.stringify(arr.slice(0,50)));
  if(typeof refreshDashboard==='function')refreshDashboard();
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function syncDraftPreview(){
  const d=draftData();
  const summary=document.getElementById('reviewSummary');
  if(summary){
    summary.innerHTML=`
      <div class="review-block"><h3>Property</h3>
        <div class="review-row"><span>Type</span><strong>${esc(d.registryType)}</strong></div>
        <div class="review-row"><span>Village</span><strong>${esc(d.village||'-')}</strong></div>
        <div class="review-row"><span>Area</span><strong>${d.areaSqft.toFixed(2)} sq ft / ${d.areaM2.toFixed(2)} m²</strong></div>
        <div class="review-row"><span>Khata / Khasra</span><strong>${esc(d.khataNo||'-')} / ${esc(d.khasraNo||'-')}</strong></div>
        <div class="review-row"><span>House / Floor</span><strong>${esc(d.houseFlatNo||'-')} / ${esc(d.floor||'-')}</strong></div>
        <div class="review-row"><span>Circle Rate</span><strong>${d.circleRateKey ? formatRateValue(d.circleRateKey,d.circleRate) : inr(d.circleRate)}</strong></div>
        <div class="review-row"><span>Calculated Value</span><strong>${inr(d.plotValue)}</strong></div>
      </div>
      <div class="review-block"><h3>Parties</h3>
        <div class="review-row"><span>Seller</span><strong>${esc(d.seller.name||'-')}</strong></div>
        <div class="review-row"><span>Buyer</span><strong>${esc(d.buyer.name||'-')}</strong></div>
      </div>
      <div class="review-block"><h3>Witness & Advocate</h3>
        <div class="review-row"><span>Witness 1</span><strong>${esc(d.witness1.name||'-')}</strong></div>
        <div class="review-row"><span>Witness 2</span><strong>${esc(d.witness2.name||'-')}</strong></div>
        <div class="review-row"><span>Drafted By</span><strong>${esc(d.advocate.name||'-')}</strong></div>
      </div>
      <div class="review-block"><h3>Transaction</h3>
        <div class="review-row"><span>Consideration</span><strong>${inr(d.transactionAmount)}</strong></div>
        <div class="review-row"><span>Advance</span><strong>${inr(d.advanceAmount)}</strong></div>
        <div class="review-row"><span>Stamp Duty</span><strong>${inr(d.stampDuty)}</strong></div>
        <div class="review-row"><span>Rebate</span><strong>${esc(d.rebateType==='none'?'No Rebate':d.rebateType==='female'?'Female Buyer':d.rebateType==='army'?'Army Buyer':'Male + Female Buyer')}</strong></div>
        <div class="review-row"><span>Payments</span><strong>${d.payments.length}</strong></div>
        <div class="review-row"><span>Rate Ref.</span><strong>${esc(d.rateRef||'-')}</strong></div>
      </div>`;
  }
  const legal=document.getElementById('legalDraftPreview');
  if(legal){
    const seller=d.seller.name||'[Seller Name]';
    const buyer=d.buyer.name||'[Buyer Name]';
    legal.innerHTML=`
      <h2>SALE DEED / REGISTRY DRAFT</h2>
      <div class="draft-meta">${esc(d.registryType)} • ${esc(d.village||'[Village]')}</div>
      <p>This draft is prepared for transfer of the property described below by <strong>${esc(seller)}</strong> (Seller) in favour of <strong>${esc(buyer)}</strong> (Buyer).</p>
      <p>The property is situated at <strong>${esc(d.village||'[Village / Location]')}</strong>, bearing Khata No. <strong>${esc(d.khataNo||'[Khata]')}</strong> and Khasra No. <strong>${esc(d.khasraNo||'[Khasra]')}</strong>${d.houseFlatNo?', House/Flat No. <strong>'+esc(d.houseFlatNo)+'</strong>':''}${d.floor?' on <strong>'+esc(d.floor)+'</strong>':''}. The area used for valuation is <strong>${d.areaSqft.toFixed(2)} sq. ft. (${d.areaM2.toFixed(2)} sq. m.)</strong>.</p>
      <p><strong>Boundaries:</strong> East – ${esc(d.boundaries.east||'[East]')}; West – ${esc(d.boundaries.west||'[West]')}; North – ${esc(d.boundaries.north||'[North]')}; South – ${esc(d.boundaries.south||'[South]')}.</p>
      <p>The circle-rate reference entered for this draft is <strong>${esc(d.rateRef||'[Official rate-list reference pending]')}</strong>. The calculated property value currently shown by the system is <strong>${inr(d.plotValue)}</strong>, while the transaction consideration entered is <strong>${inr(d.transactionAmount)}</strong>.</p>
      <p>Witnesses: (1) ${esc(d.witness1.name||'[Witness 1]')} and (2) ${esc(d.witness2.name||'[Witness 2]')}.</p>
      <p>Drafted by: <strong>${esc(d.advocate.name||'[Advocate]')}</strong>${d.advocate.enrollment?' • Enrollment No. '+esc(d.advocate.enrollment):''}.</p>
      <p><em>Starter preview: final legal deed wording, clauses, stamp-duty rules and official circle-rate references will be configured before production use.</em></p>`;
  }
}


/* ===== v0.5 Searchable PDF Circle Rate Data ===== */
const CIRCLE_RATE_DATA = [{"page":32,"group":"A","name":"शान्तरशाह","agri":360,"nonAgri":14000,"multi":27800,"shop":60950,"otherCommercial":54855,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - अर्द्धनगरीय","id":"CR0001","alias":""},{"page":32,"group":"A","name":"बढ़ेड़ी राजपुतान","agri":360,"nonAgri":14000,"multi":27800,"shop":60950,"otherCommercial":54855,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - अर्द्धनगरीय","id":"CR0002","alias":"Badhedi Rajputana"},{"page":32,"group":"A","name":"पंचायनपुर","agri":360,"nonAgri":14000,"multi":27800,"shop":60950,"otherCommercial":54855,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - अर्द्धनगरीय","id":"CR0003","alias":""},{"page":32,"group":"A","name":"बावली कलंजरी","agri":360,"nonAgri":14000,"multi":27800,"shop":60950,"otherCommercial":54855,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"रुड़की - अर्द्धनगरीय","id":"CR0004","alias":""},{"page":32,"group":"A","name":"रामपुर मुस्तहकम","agri":360,"nonAgri":14000,"multi":27800,"shop":60950,"otherCommercial":54855,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"रुड़की - अर्द्धनगरीय","id":"CR0005","alias":"Rampur Mustahkam"},{"page":32,"group":"A","name":"तल्हेड़ी","agri":360,"nonAgri":14000,"multi":27800,"shop":60950,"otherCommercial":54855,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"रुड़की - अर्द्धनगरीय","id":"CR0006","alias":""},{"page":32,"group":"A","name":"बहादरपुर सैनी","agri":360,"nonAgri":14000,"multi":27800,"shop":60950,"otherCommercial":54855,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"रुड़की - अर्द्धनगरीय","id":"CR0007","alias":""},{"page":32,"group":"A","name":"ब्रह्मपुर","agri":360,"nonAgri":14000,"multi":27800,"shop":60950,"otherCommercial":54855,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"रुड़की - अर्द्धनगरीय","id":"CR0008","alias":""},{"page":32,"group":"B","name":"नगला इमरती","agri":242,"nonAgri":9900,"multi":23900,"shop":53350,"otherCommercial":48015,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - अर्द्धनगरीय","id":"CR0009","alias":"Nagla Imarti"},{"page":32,"group":"B","name":"बिझौली","agri":242,"nonAgri":9900,"multi":23900,"shop":53350,"otherCommercial":48015,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - अर्द्धनगरीय","id":"CR0010","alias":""},{"page":32,"group":"B","name":"पाडली गुर्जर","agri":242,"nonAgri":9900,"multi":23900,"shop":53350,"otherCommercial":48015,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - अर्द्धनगरीय","id":"CR0011","alias":""},{"page":32,"group":"B","name":"बेलडा अहतमाल","agri":242,"nonAgri":9900,"multi":23900,"shop":53350,"otherCommercial":48015,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"रुड़की - अर्द्धनगरीय","id":"CR0012","alias":""},{"page":32,"group":"B","name":"बेलडा मुस्तहकम","agri":242,"nonAgri":9900,"multi":23900,"shop":53350,"otherCommercial":48015,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"रुड़की - अर्द्धनगरीय","id":"CR0013","alias":""},{"page":32,"group":"B","name":"बेलडी साल्हापुर","agri":242,"nonAgri":9900,"multi":23900,"shop":53350,"otherCommercial":48015,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"रुड़की - अर्द्धनगरीय","id":"CR0014","alias":""},{"page":32,"group":"B","name":"फिरोजपुर","agri":242,"nonAgri":9900,"multi":23900,"shop":53350,"otherCommercial":48015,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"रुड़की - अर्द्धनगरीय","id":"CR0015","alias":""},{"page":32,"group":"C","name":"टोडा कल्याणपुर मु०","agri":230,"nonAgri":8050,"multi":22050,"shop":52325,"otherCommercial":47093,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - अर्द्धनगरीय","id":"CR0016","alias":""},{"page":32,"group":"C","name":"बंदाखेड़ी महावतपुर मु०","agri":230,"nonAgri":8050,"multi":22050,"shop":52325,"otherCommercial":47093,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - अर्द्धनगरीय","id":"CR0017","alias":""},{"page":32,"group":"C","name":"कान्हापुर मुस्तहकम","agri":230,"nonAgri":8050,"multi":22050,"shop":52325,"otherCommercial":47093,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - अर्द्धनगरीय","id":"CR0018","alias":""},{"page":33,"group":"D","name":"भारापुर मु०","agri":165,"nonAgri":7370,"multi":21400,"shop":49555,"otherCommercial":44600,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - अर्द्धनगरीय","id":"CR0019","alias":""},{"page":33,"group":"D","name":"भौरी","agri":165,"nonAgri":7370,"multi":21400,"shop":49555,"otherCommercial":44600,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - अर्द्धनगरीय","id":"CR0020","alias":""},{"page":33,"group":"D","name":"जलालपुर मु०","agri":165,"nonAgri":7370,"multi":21400,"shop":49555,"otherCommercial":44600,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - अर्द्धनगरीय","id":"CR0021","alias":""},{"page":33,"group":"E","name":"केलनपुर","agri":143,"nonAgri":5500,"multi":20000,"shop":46750,"otherCommercial":42075,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - अर्द्धनगरीय","id":"CR0022","alias":""},{"page":33,"group":"E","name":"गोविन्दपुर वाजिदपुर","agri":143,"nonAgri":5500,"multi":20000,"shop":46750,"otherCommercial":42075,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - अर्द्धनगरीय","id":"CR0023","alias":""},{"page":33,"group":"E","name":"रहमतपुर मुस्तहकम","agri":143,"nonAgri":5500,"multi":20000,"shop":46750,"otherCommercial":42075,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - अर्द्धनगरीय","id":"CR0024","alias":""},{"page":33,"group":"E","name":"दौलतपुर","agri":143,"nonAgri":5500,"multi":20000,"shop":46750,"otherCommercial":42075,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"रुड़की - अर्द्धनगरीय","id":"CR0025","alias":""},{"page":33,"group":"E","name":"हतलावेहड़ी","agri":143,"nonAgri":5500,"multi":20000,"shop":46750,"otherCommercial":42075,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"रुड़की - अर्द्धनगरीय","id":"CR0026","alias":""},{"page":34,"group":"A","name":"मंगलौर बाहर नगरपालिका","agri":300,"nonAgri":9000,"multi":23500,"shop":45700,"otherCommercial":44200,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0027","alias":"Manglaur"},{"page":34,"group":"B","name":"मखियाली खुर्द","agri":200,"nonAgri":8000,"multi":22500,"shop":44200,"otherCommercial":42700,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0028","alias":""},{"page":34,"group":"B","name":"शिमलौनी","agri":200,"nonAgri":8000,"multi":22500,"shop":44200,"otherCommercial":42700,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0029","alias":""},{"page":34,"group":"C","name":"झबरेड़ा बाहर नगर पंचायत","agri":180,"nonAgri":7500,"multi":22000,"shop":43450,"otherCommercial":41950,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0030","alias":""},{"page":34,"group":"C","name":"झबरेड़ी कला","agri":180,"nonAgri":7500,"multi":22000,"shop":43450,"otherCommercial":41950,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0031","alias":""},{"page":34,"group":"D","name":"लादपुर खुर्द","agri":110,"nonAgri":7300,"multi":21800,"shop":43150,"otherCommercial":41650,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0032","alias":""},{"page":34,"group":"D","name":"खानपुर","agri":110,"nonAgri":7300,"multi":21800,"shop":43150,"otherCommercial":41650,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0033","alias":""},{"page":34,"group":"D","name":"जैनपुर झंझेड़ी","agri":110,"nonAgri":7300,"multi":21800,"shop":43150,"otherCommercial":41650,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0034","alias":""},{"page":34,"group":"E","name":"नारसन खुर्द","agri":100,"nonAgri":6900,"multi":21400,"shop":42550,"otherCommercial":41050,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0035","alias":"Narsan Khurd"},{"page":34,"group":"E","name":"कुरड़ी","agri":100,"nonAgri":6900,"multi":21400,"shop":42550,"otherCommercial":41050,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0036","alias":""},{"page":34,"group":"E","name":"लिब्बरहेड़ी","agri":100,"nonAgri":6900,"multi":21400,"shop":42550,"otherCommercial":41050,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0037","alias":""},{"page":34,"group":"E","name":"मंडावली","agri":100,"nonAgri":6900,"multi":21400,"shop":42550,"otherCommercial":41050,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0038","alias":""},{"page":34,"group":"F","name":"दहियाकी","agri":90,"nonAgri":6200,"multi":20700,"shop":41500,"otherCommercial":40000,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0039","alias":""},{"page":34,"group":"F","name":"मुंडियाकी","agri":90,"nonAgri":6200,"multi":20700,"shop":41500,"otherCommercial":40000,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0040","alias":""},{"page":34,"group":"F","name":"कुंआहेड़ी","agri":90,"nonAgri":6200,"multi":20700,"shop":41500,"otherCommercial":40000,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0041","alias":""},{"page":34,"group":"G","name":"कल्याणपुर उर्फ नारसन कला","agri":85,"nonAgri":5400,"multi":19900,"shop":40300,"otherCommercial":38800,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0042","alias":""},{"page":35,"group":"G","name":"कुलचन्दी","agri":85,"nonAgri":5400,"multi":19900,"shop":40300,"otherCommercial":38800,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0043","alias":""},{"page":35,"group":"G","name":"लखनौता","agri":85,"nonAgri":5400,"multi":19900,"shop":40300,"otherCommercial":38800,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0044","alias":""},{"page":35,"group":"H","name":"रामनगर","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0045","alias":""},{"page":35,"group":"H","name":"शिकारपुर","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0046","alias":""},{"page":35,"group":"H","name":"थिथौल","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0047","alias":""},{"page":35,"group":"H","name":"भगवानपुर चन्दनपुर","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0048","alias":""},{"page":35,"group":"H","name":"पीरपुरा","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0049","alias":""},{"page":35,"group":"H","name":"कोटवाल आलमपुर","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0050","alias":""},{"page":35,"group":"H","name":"शेरपुर खेलमऊ","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0051","alias":""},{"page":35,"group":"H","name":"लाठरदेवा हूण","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0052","alias":""},{"page":35,"group":"H","name":"गदरजुड्डा","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":9,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0053","alias":""},{"page":35,"group":"H","name":"खजूरी","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":10,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0054","alias":"Khajuri"},{"page":35,"group":"H","name":"थीथकी कवायदपुर","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":11,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0055","alias":""},{"page":35,"group":"H","name":"खेड़ाजट","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":12,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0056","alias":""},{"page":35,"group":"H","name":"सकोती","agri":80,"nonAgri":4800,"multi":19300,"shop":39400,"otherCommercial":37900,"nonCommercial1":14000,"nonCommercial2":12000,"row":13,"section":"मंगलौर - अर्द्धनगरीय","id":"CR0057","alias":""},{"page":36,"group":"A","name":"पुहाना","agri":165,"nonAgri":7150,"multi":21150,"shop":57200,"otherCommercial":51480,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0058","alias":"Puhana"},{"page":36,"group":"A","name":"बंदाखेड़ी","agri":165,"nonAgri":7150,"multi":21150,"shop":57200,"otherCommercial":51480,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0059","alias":""},{"page":36,"group":"A","name":"करौंदी","agri":165,"nonAgri":7150,"multi":21150,"shop":57200,"otherCommercial":51480,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0060","alias":"Karondi"},{"page":36,"group":"A","name":"सालियर साल्हापुर मुस्तहकम","agri":165,"nonAgri":7150,"multi":21150,"shop":57200,"otherCommercial":51480,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0061","alias":""},{"page":36,"group":"A","name":"इब्राहिमपुर देह","agri":165,"nonAgri":7150,"multi":21150,"shop":57200,"otherCommercial":51480,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0062","alias":""},{"page":36,"group":"B","name":"किशनपुर जमालपुर","agri":110,"nonAgri":6800,"multi":20800,"shop":55880,"otherCommercial":50300,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0063","alias":""},{"page":36,"group":"B","name":"नल्हेड़ी देहवीरान","agri":110,"nonAgri":6800,"multi":20800,"shop":55880,"otherCommercial":50300,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0064","alias":""},{"page":36,"group":"C","name":"माधोपुर हजरतपुर","agri":104,"nonAgri":5830,"multi":19830,"shop":53240,"otherCommercial":48000,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0065","alias":"Madhopur Hazratpur"},{"page":36,"group":"C","name":"रहीमपुर","agri":104,"nonAgri":5830,"multi":19830,"shop":53240,"otherCommercial":48000,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0066","alias":"Rahimpur"},{"page":36,"group":"C","name":"पनियाला चन्दापुर","agri":104,"nonAgri":5830,"multi":19830,"shop":53240,"otherCommercial":48000,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0067","alias":""},{"page":36,"group":"C","name":"नन्हेड़ा अनन्तपुर","agri":104,"nonAgri":5830,"multi":19830,"shop":53240,"otherCommercial":48000,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0068","alias":""},{"page":36,"group":"D","name":"तांशीपुर","agri":77,"nonAgri":3850,"multi":18000,"shop":47300,"otherCommercial":42600,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0069","alias":""},{"page":36,"group":"D","name":"हथियाथल","agri":77,"nonAgri":3850,"multi":18000,"shop":47300,"otherCommercial":42600,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0070","alias":""},{"page":37,"group":"A","name":"पिरान कलियर","agri":165,"nonAgri":7150,"multi":21000,"shop":52800,"otherCommercial":47520,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","id":"CR0071","alias":"Piran Kaliyar"},{"page":37,"group":"B","name":"कमालपुर सैनीबास","agri":110,"nonAgri":5500,"multi":19500,"shop":49500,"otherCommercial":44550,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","id":"CR0072","alias":""},{"page":37,"group":"B","name":"बिचपड़ी","agri":110,"nonAgri":5500,"multi":19500,"shop":49500,"otherCommercial":44550,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - ग्रामीण","id":"CR0073","alias":""},{"page":37,"group":"B","name":"धनौरी","agri":110,"nonAgri":5500,"multi":19500,"shop":49500,"otherCommercial":44550,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - ग्रामीण","id":"CR0074","alias":"Dhanori"},{"page":37,"group":"C","name":"मकरबपुर","agri":105,"nonAgri":4730,"multi":18800,"shop":47960,"otherCommercial":43164,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","id":"CR0075","alias":""},{"page":37,"group":"C","name":"बेडपुर","agri":105,"nonAgri":4730,"multi":18800,"shop":47960,"otherCommercial":43164,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - ग्रामीण","id":"CR0076","alias":""},{"page":37,"group":"D","name":"रहमतपुर अहतमाल","agri":95,"nonAgri":4700,"multi":18700,"shop":47740,"otherCommercial":42966,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","id":"CR0077","alias":""},{"page":37,"group":"D","name":"कोट कलियर चक-1","agri":95,"nonAgri":4700,"multi":18700,"shop":47740,"otherCommercial":42966,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - ग्रामीण","id":"CR0078","alias":""},{"page":37,"group":"D","name":"कोट कलियर चक-2","agri":95,"nonAgri":4700,"multi":18700,"shop":47740,"otherCommercial":42966,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - ग्रामीण","id":"CR0079","alias":""},{"page":37,"group":"E","name":"महमूदपुर","agri":77,"nonAgri":3520,"multi":17700,"shop":45540,"otherCommercial":40986,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","id":"CR0080","alias":""},{"page":37,"group":"E","name":"मोहनपुर मजरा सालियर","agri":77,"nonAgri":3520,"multi":17700,"shop":45540,"otherCommercial":40986,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - ग्रामीण","id":"CR0081","alias":""},{"page":37,"group":"E","name":"जबरदस्तपुर","agri":77,"nonAgri":3520,"multi":17700,"shop":45540,"otherCommercial":40986,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - ग्रामीण","id":"CR0082","alias":""},{"page":37,"group":"E","name":"भैंसरहेड़ी मुस्तहकम","agri":77,"nonAgri":3520,"multi":17700,"shop":45540,"otherCommercial":40986,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"रुड़की - ग्रामीण","id":"CR0083","alias":""},{"page":37,"group":"F","name":"डडेड़ी ख्वाजागीपुर","agri":55,"nonAgri":3080,"multi":17300,"shop":44660,"otherCommercial":40194,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","id":"CR0084","alias":""},{"page":37,"group":"F","name":"खटका मुस्तहकम","agri":55,"nonAgri":3080,"multi":17300,"shop":44660,"otherCommercial":40194,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - ग्रामीण","id":"CR0085","alias":""},{"page":37,"group":"F","name":"मीरपुर सिकन्दरपुर","agri":55,"nonAgri":3080,"multi":17300,"shop":44660,"otherCommercial":40194,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - ग्रामीण","id":"CR0086","alias":""},{"page":37,"group":"F","name":"मरगूबपुर दीदाहेड़ी","agri":55,"nonAgri":3080,"multi":17300,"shop":44660,"otherCommercial":40194,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"रुड़की - ग्रामीण","id":"CR0087","alias":""},{"page":38,"group":"F","name":"रत्नपुर","agri":55,"nonAgri":3080,"multi":17300,"shop":44660,"otherCommercial":40194,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","id":"CR0088","alias":""},{"page":38,"group":"F","name":"मिजाजपुर मुस्तफाबाद मु०","agri":55,"nonAgri":3080,"multi":17300,"shop":44660,"otherCommercial":40194,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - ग्रामीण","id":"CR0089","alias":""},{"page":38,"group":"F","name":"मूलदासपुर माजरा","agri":55,"nonAgri":3080,"multi":17300,"shop":44660,"otherCommercial":40194,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - ग्रामीण","id":"CR0090","alias":""},{"page":38,"group":"F","name":"जौरासी मुस्तहकम","agri":55,"nonAgri":3080,"multi":17300,"shop":44660,"otherCommercial":40194,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"रुड़की - ग्रामीण","id":"CR0091","alias":""},{"page":38,"group":"F","name":"जमालपुर","agri":55,"nonAgri":3080,"multi":17300,"shop":44660,"otherCommercial":40194,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"रुड़की - ग्रामीण","id":"CR0092","alias":""},{"page":38,"group":"G","name":"मेहवड़ कला","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","id":"CR0093","alias":""},{"page":38,"group":"G","name":"बाजूहेड़ी","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - ग्रामीण","id":"CR0094","alias":""},{"page":38,"group":"G","name":"सोहलपुर मजरा बेलडा","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - ग्रामीण","id":"CR0095","alias":""},{"page":38,"group":"G","name":"सेदपुर","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"रुड़की - ग्रामीण","id":"CR0096","alias":""},{"page":38,"group":"G","name":"गोपालपुर","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"रुड़की - ग्रामीण","id":"CR0097","alias":""},{"page":38,"group":"G","name":"सुधारी","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"रुड़की - ग्रामीण","id":"CR0098","alias":""},{"page":38,"group":"G","name":"उल्हेड़ी","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"रुड़की - ग्रामीण","id":"CR0099","alias":""},{"page":38,"group":"G","name":"खटका","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"रुड़की - ग्रामीण","id":"CR0100","alias":""},{"page":38,"group":"G","name":"मोजमपुर उर्फ महदूद मजरा मु०","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":9,"section":"रुड़की - ग्रामीण","id":"CR0101","alias":""},{"page":38,"group":"G","name":"कान्हापुर अहतमाल","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":10,"section":"रुड़की - ग्रामीण","id":"CR0102","alias":""},{"page":38,"group":"G","name":"अकबरपुर मूव जदीद मु०","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":11,"section":"रुड़की - ग्रामीण","id":"CR0103","alias":""},{"page":38,"group":"G","name":"टोडा कल्याणपुर अहतमाल","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":12,"section":"रुड़की - ग्रामीण","id":"CR0104","alias":""},{"page":38,"group":"G","name":"बंदेड़ी महावतपुर अहतमाल","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":13,"section":"रुड़की - ग्रामीण","id":"CR0105","alias":""},{"page":38,"group":"G","name":"जलालपुर अहतमाल","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":14,"section":"रुड़की - ग्रामीण","id":"CR0106","alias":""},{"page":38,"group":"G","name":"जौरासी अहतमाल","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":15,"section":"रुड़की - ग्रामीण","id":"CR0107","alias":""},{"page":38,"group":"G","name":"खटका अहतमाल","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":16,"section":"रुड़की - ग्रामीण","id":"CR0108","alias":""},{"page":51,"group":"क","name":"भगवानपुर मेन बाजार","agri":null,"nonAgri":17500,"multi":32000,"shop":88000,"otherCommercial":73000,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर नगर पंचायत","id":"CR0109","alias":"Bhagwanpur Main Bazar"},{"page":51,"group":"ख","name":"शाहपुर मुस्तहकम","agri":600,"nonAgri":15000,"multi":30000,"shop":88000,"otherCommercial":73000,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर नगर पंचायत","id":"CR0110","alias":""},{"page":51,"group":"ख","name":"भगवानपुर मुस्तहकम","agri":660,"nonAgri":15000,"multi":30000,"shop":88000,"otherCommercial":73000,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर नगर पंचायत","id":"CR0111","alias":"Bhagwanpur Mustahkam"},{"page":51,"group":"ग","name":"मक्खनपुर महमूद आलम मुस्तहकम","agri":310,"nonAgri":9500,"multi":24000,"shop":55000,"otherCommercial":47000,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर नगर पंचायत","id":"CR0112","alias":""},{"page":51,"group":"घ","name":"खानपुर","agri":300,"nonAgri":7500,"multi":22000,"shop":53000,"otherCommercial":47000,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर नगर पंचायत","id":"CR0113","alias":""},{"page":51,"group":"ड","name":"मक्खनपुर महमूद आलम जदीद मुस्तहकम","agri":160,"nonAgri":6000,"multi":20000,"shop":50000,"otherCommercial":44000,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर नगर पंचायत","id":"CR0114","alias":""},{"page":51,"group":"ड","name":"भगवानपुर जदीद मु०","agri":160,"nonAgri":6000,"multi":20000,"shop":50000,"otherCommercial":44000,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर नगर पंचायत","id":"CR0115","alias":"Bhagwanpur Jadid"},{"page":51,"group":"ड","name":"शाहपुर जदीद मु०","agri":200,"nonAgri":6000,"multi":20000,"shop":50000,"otherCommercial":44000,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर नगर पंचायत","id":"CR0116","alias":""},{"page":52,"group":"क","name":"मंडावर","agri":170,"nonAgri":8000,"multi":22000,"shop":62000,"otherCommercial":50500,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0117","alias":"Mandawar"},{"page":52,"group":"क","name":"सिसौना मुस्तहकम","agri":170,"nonAgri":8000,"multi":22000,"shop":62000,"otherCommercial":50500,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0118","alias":""},{"page":52,"group":"क","name":"चौली शाहबुद्दीनपुर मु०","agri":170,"nonAgri":8000,"multi":22000,"shop":62000,"otherCommercial":50500,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0119","alias":""},{"page":52,"group":"क","name":"लकेशरी","agri":170,"nonAgri":8000,"multi":22000,"shop":62000,"otherCommercial":50500,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0120","alias":""},{"page":52,"group":"क","name":"लतीफपुर खुब्बनपुर","agri":170,"nonAgri":8000,"multi":22000,"shop":62000,"otherCommercial":50500,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0121","alias":""},{"page":52,"group":"क","name":"सिकन्दरपुर भैंसवाल","agri":170,"nonAgri":8000,"multi":22000,"shop":62000,"otherCommercial":50500,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0122","alias":"Sikandarpur Bhainswal"},{"page":52,"group":"क","name":"रायपुर","agri":170,"nonAgri":8000,"multi":22000,"shop":62000,"otherCommercial":50500,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0123","alias":"Raipur"},{"page":52,"group":"ख","name":"औरंगजेबपुर","agri":120,"nonAgri":6000,"multi":20500,"shop":56500,"otherCommercial":50500,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0124","alias":"Aurangzebpur"},{"page":52,"group":"ख","name":"छापुर शेर अफगानपुर","agri":120,"nonAgri":6000,"multi":20500,"shop":56500,"otherCommercial":50500,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0125","alias":""},{"page":52,"group":"ख","name":"खेलपुर नसरुल्लापुर","agri":120,"nonAgri":6000,"multi":20500,"shop":56500,"otherCommercial":50500,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0126","alias":""},{"page":52,"group":"ख","name":"लालवा मुस्तहकम","agri":120,"nonAgri":6000,"multi":20500,"shop":56500,"otherCommercial":50500,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0127","alias":""},{"page":52,"group":"ग","name":"बेहेड़की सैदाबाद","agri":80,"nonAgri":3500,"multi":18000,"shop":48000,"otherCommercial":42500,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - अर्द्धनगरीय","id":"CR0128","alias":""},{"page":53,"group":"क","name":"सिसौना जदीद मु०","agri":100,"nonAgri":5000,"multi":19500,"shop":44500,"otherCommercial":37000,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","id":"CR0129","alias":""},{"page":53,"group":"क","name":"भगवानपुर जदीद मु०","agri":100,"nonAgri":5000,"multi":19500,"shop":44500,"otherCommercial":37000,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","id":"CR0130","alias":"Bhagwanpur Jadid"},{"page":53,"group":"क","name":"शाहपुर जदीद मु०","agri":100,"nonAgri":5000,"multi":19500,"shop":44500,"otherCommercial":37000,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - ग्रामीण","id":"CR0131","alias":""},{"page":53,"group":"क","name":"नौदीवाला","agri":100,"nonAgri":5000,"multi":19500,"shop":44500,"otherCommercial":37000,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - ग्रामीण","id":"CR0132","alias":""},{"page":53,"group":"क","name":"काजीवाला मु०","agri":100,"nonAgri":5000,"multi":19500,"shop":44500,"otherCommercial":37000,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - ग्रामीण","id":"CR0133","alias":""},{"page":53,"group":"क","name":"तेजुपुर","agri":100,"nonAgri":5000,"multi":19500,"shop":44500,"otherCommercial":37000,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"भगवानपुर - ग्रामीण","id":"CR0134","alias":""},{"page":53,"group":"ख","name":"चुड़ियाला मोहनपुर","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","id":"CR0135","alias":"Chudiyala Mohanpur"},{"page":53,"group":"ख","name":"कुंजा बहादुरपुर","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","id":"CR0136","alias":"Kunja Bahadurpur"},{"page":53,"group":"ख","name":"फक्करेहड़ी","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - ग्रामीण","id":"CR0137","alias":""},{"page":53,"group":"ख","name":"मोलना","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - ग्रामीण","id":"CR0138","alias":"Molna"},{"page":53,"group":"ख","name":"बिन्डुखड़क","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - ग्रामीण","id":"CR0139","alias":""},{"page":53,"group":"ख","name":"खजूरी","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"भगवानपुर - ग्रामीण","id":"CR0140","alias":"Khajuri"},{"page":53,"group":"ख","name":"मानकपुर आदमपुर","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"भगवानपुर - ग्रामीण","id":"CR0141","alias":""},{"page":53,"group":"ख","name":"भलस्वागाज","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"भगवानपुर - ग्रामीण","id":"CR0142","alias":""},{"page":54,"group":"ख","name":"मोहितपुर","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","id":"CR0143","alias":""},{"page":54,"group":"ख","name":"कादरपुर","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","id":"CR0144","alias":""},{"page":54,"group":"ख","name":"सरठेड़ी शाहजहांपुर","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - ग्रामीण","id":"CR0145","alias":""},{"page":54,"group":"ख","name":"रुहालकी दयालपुर","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - ग्रामीण","id":"CR0146","alias":""},{"page":54,"group":"ख","name":"सिरचन्दी","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - ग्रामीण","id":"CR0147","alias":""},{"page":54,"group":"ख","name":"सुनेहटी आलापुर","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"भगवानपुर - ग्रामीण","id":"CR0148","alias":""},{"page":54,"group":"ख","name":"अमरपुर काजी","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"भगवानपुर - ग्रामीण","id":"CR0149","alias":""},{"page":54,"group":"ख","name":"शेरपुर","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"भगवानपुर - ग्रामीण","id":"CR0150","alias":""},{"page":54,"group":"ख","name":"बिनारसी उर्फ बुलेड","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":9,"section":"भगवानपुर - ग्रामीण","id":"CR0151","alias":""},{"page":54,"group":"ख","name":"महेष्वरी","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":10,"section":"भगवानपुर - ग्रामीण","id":"CR0152","alias":""},{"page":54,"group":"ख","name":"मुकरमपुर उर्फ कालावाला","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":11,"section":"भगवानपुर - ग्रामीण","id":"CR0153","alias":""},{"page":54,"group":"ख","name":"लालवाला मजबता","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":12,"section":"भगवानपुर - ग्रामीण","id":"CR0154","alias":""},{"page":54,"group":"ख","name":"मजाहिदपुर सतीवाला खालसा","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":13,"section":"भगवानपुर - ग्रामीण","id":"CR0155","alias":""},{"page":54,"group":"ख","name":"शहीदवाला ग्रन्ट","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":14,"section":"भगवानपुर - ग्रामीण","id":"CR0156","alias":""},{"page":54,"group":"ख","name":"बजाजेवाला ग्रन्ट","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":15,"section":"भगवानपुर - ग्रामीण","id":"CR0157","alias":""},{"page":54,"group":"ख","name":"हसनावाला ग्रन्ट","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":16,"section":"भगवानपुर - ग्रामीण","id":"CR0158","alias":""},{"page":54,"group":"ख","name":"खेड़ी शिकोहपुर मुस्तहकम","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":17,"section":"भगवानपुर - ग्रामीण","id":"CR0159","alias":"Khedi Shikohpur Mustahkam"},{"page":55,"group":"ख","name":"मजाहिदपुर सतीवाला मजबता","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","id":"CR0160","alias":""},{"page":55,"group":"ख","name":"फिरोजपुर उर्फ बुग्गावाला","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","id":"CR0161","alias":"Firozpur Buggawala"},{"page":55,"group":"ख","name":"नौकराग्रन्ट","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - ग्रामीण","id":"CR0162","alias":""},{"page":55,"group":"ख","name":"दौलतपुर हजरतपुर उर्फ बुधवाशहीद","agri":80,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - ग्रामीण","id":"CR0163","alias":""},{"page":55,"group":"ग","name":"बहेड़ी बुजुर्ग","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","id":"CR0164","alias":""},{"page":55,"group":"ग","name":"धीरमजरा अहतमाल","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","id":"CR0165","alias":""},{"page":55,"group":"ग","name":"पट्टी डाडा","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - ग्रामीण","id":"CR0166","alias":""},{"page":55,"group":"ग","name":"जलालपुर डाडा","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - ग्रामीण","id":"CR0167","alias":""},{"page":55,"group":"ग","name":"अहमदपुर खेड़ी","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - ग्रामीण","id":"CR0168","alias":""},{"page":55,"group":"ग","name":"हसनपुर मदनपुर मुस्तहकम","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"भगवानपुर - ग्रामीण","id":"CR0169","alias":""},{"page":55,"group":"ग","name":"हकीमपुर तुर्ती","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"भगवानपुर - ग्रामीण","id":"CR0170","alias":""},{"page":55,"group":"ग","name":"कलालहटी","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"भगवानपुर - ग्रामीण","id":"CR0171","alias":""},{"page":55,"group":"ग","name":"अकबरपुर कालसो","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":9,"section":"भगवानपुर - ग्रामीण","id":"CR0172","alias":""},{"page":55,"group":"ग","name":"अलावलपुर","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":10,"section":"भगवानपुर - ग्रामीण","id":"CR0173","alias":""},{"page":55,"group":"ग","name":"झिडियान ग्रन्ट","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":11,"section":"भगवानपुर - ग्रामीण","id":"CR0174","alias":""},{"page":55,"group":"ग","name":"फतेहउल्लापुर उर्फ तेलपुरा","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":12,"section":"भगवानपुर - ग्रामीण","id":"CR0175","alias":""},{"page":55,"group":"ग","name":"बिरसंगपुर","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":13,"section":"भगवानपुर - ग्रामीण","id":"CR0176","alias":""},{"page":56,"group":"ग","name":"बालेकी युसुफपुर","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","id":"CR0177","alias":""},{"page":56,"group":"ग","name":"छछरोली","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","id":"CR0178","alias":""},{"page":56,"group":"ग","name":"बलपुर","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - ग्रामीण","id":"CR0179","alias":""},{"page":56,"group":"ग","name":"हरचन्दपुर माजरा","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - ग्रामीण","id":"CR0180","alias":""},{"page":56,"group":"ग","name":"दरियापुर दयालपुर अहतमाल","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - ग्रामीण","id":"CR0181","alias":""},{"page":56,"group":"ग","name":"रोलाहेड़ी","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"भगवानपुर - ग्रामीण","id":"CR0182","alias":""},{"page":56,"group":"ग","name":"हबीबपुर निवादा","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"भगवानपुर - ग्रामीण","id":"CR0183","alias":""},{"page":56,"group":"ग","name":"सिकरोढा-प्रथम","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"भगवानपुर - ग्रामीण","id":"CR0184","alias":""},{"page":56,"group":"ग","name":"सिकरोढा-द्वितीय","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":9,"section":"भगवानपुर - ग्रामीण","id":"CR0185","alias":""},{"page":56,"group":"ग","name":"लामग्रन्ट","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":10,"section":"भगवानपुर - ग्रामीण","id":"CR0186","alias":""},{"page":56,"group":"ग","name":"लालवाला खालसा","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":11,"section":"भगवानपुर - ग्रामीण","id":"CR0187","alias":""},{"page":56,"group":"ग","name":"बहबलपुर हसोवाला","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":12,"section":"भगवानपुर - ग्रामीण","id":"CR0188","alias":""},{"page":56,"group":"ग","name":"दरियापुर दयालपुर मुस्तहकम","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":13,"section":"भगवानपुर - ग्रामीण","id":"CR0189","alias":""},{"page":56,"group":"ग","name":"बहादपुर ठग्गामजरी","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":14,"section":"भगवानपुर - ग्रामीण","id":"CR0190","alias":""},{"page":56,"group":"ग","name":"शाहपुर मुस्तहकम (खसरा नं. 01 से 54 तक)","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":15,"section":"भगवानपुर - ग्रामीण","id":"CR0191","alias":""},{"page":56,"group":"ग","name":"इब्राहिमपुर मसाही","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":16,"section":"भगवानपुर - ग्रामीण","id":"CR0192","alias":"Ibrahimpur Masahi"},{"page":56,"group":"ग","name":"कुतुबपुर ग्रन्ट","agri":50,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":17,"section":"भगवानपुर - ग्रामीण","id":"CR0193","alias":""},{"page":57,"group":"घ","name":"गी मोहम्मदपुर सईदपुर मुस्तहकम","agri":45,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","id":"CR0194","alias":""},{"page":57,"group":"घ","name":"अलीपुर खोतौला","agri":45,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","id":"CR0195","alias":""},{"page":57,"group":"घ","name":"प्रेमराजपुर","agri":45,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - ग्रामीण","id":"CR0196","alias":""},{"page":57,"group":"घ","name":"डाडली","agri":45,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - ग्रामीण","id":"CR0197","alias":""},{"page":57,"group":"घ","name":"मानक मजरा","agri":45,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - ग्रामीण","id":"CR0198","alias":""},{"page":57,"group":"ड","name":"खेड़ी शिकोहपुर जदीद मुस्तहकम","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","id":"CR0199","alias":""},{"page":57,"group":"ड","name":"कंजेवास जदीद मुस्तहकम","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","id":"CR0200","alias":""},{"page":57,"group":"ड","name":"लालवा जदीद मुस्तहकम","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - ग्रामीण","id":"CR0201","alias":""},{"page":57,"group":"ड","name":"खुब्बनपुर लतीफपुर जदीद मुस्तहकम","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - ग्रामीण","id":"CR0202","alias":""},{"page":57,"group":"ड","name":"पलुनी","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - ग्रामीण","id":"CR0203","alias":""},{"page":57,"group":"ड","name":"नागल","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"भगवानपुर - ग्रामीण","id":"CR0204","alias":"Nagal"},{"page":57,"group":"ड","name":"धीरमजरा अहतमाल","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"भगवानपुर - ग्रामीण","id":"CR0205","alias":""},{"page":57,"group":"ड","name":"हसनपुर मदनपुर अहतमाल","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"भगवानपुर - ग्रामीण","id":"CR0206","alias":""},{"page":57,"group":"ड","name":"चौली शाहबुद्दीनपुर जदीद मुस्तहकम","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":9,"section":"भगवानपुर - ग्रामीण","id":"CR0207","alias":""},{"page":57,"group":"ड","name":"गी मोहम्मदपुर सईदपुर जदीद मुस्तहकम","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":10,"section":"भगवानपुर - ग्रामीण","id":"CR0208","alias":""},{"page":57,"group":"ड","name":"मक्खनपुर महमूद आलम जदीद मुस्तहकम","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":11,"section":"भगवानपुर - ग्रामीण","id":"CR0209","alias":""},{"page":57,"group":"ड","name":"हलमजरा","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":12,"section":"भगवानपुर - ग्रामीण","id":"CR0210","alias":""},{"page":57,"group":"ड","name":"खेड़ली","agri":40,"nonAgri":3000,"multi":18000,"shop":40000,"otherCommercial":33500,"nonCommercial1":14000,"nonCommercial2":12000,"row":13,"section":"भगवानपुर - ग्रामीण","id":"CR0211","alias":""}];



/* PDF index continuation: verified pages 39-45 */
CIRCLE_RATE_DATA.push(...[{"id":"CRX0001","page":39,"group":"G","name":"भारापुर जदीद मुस्तहकम","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","alias":""},{"id":"CRX0002","page":39,"group":"G","name":"भौरी जदीद मुस्तहकम","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - ग्रामीण","alias":""},{"id":"CRX0003","page":39,"group":"G","name":"डडेड़ी ख्वाजागीपुर जदीद मुस्तहकम","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"रुड़की - ग्रामीण","alias":""},{"id":"CRX0004","page":39,"group":"G","name":"मिर्जापुर मुस्तफाबाद जदीद मुस्तहकम","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"रुड़की - ग्रामीण","alias":""},{"id":"CRX0005","page":39,"group":"G","name":"भैंसरहेड़ी अहतमाल","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"रुड़की - ग्रामीण","alias":""},{"id":"CRX0006","page":39,"group":"G","name":"मोहम्मदपुर पाण्डा","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"रुड़की - ग्रामीण","alias":""},{"id":"CRX0007","page":39,"group":"G","name":"मौजमपुर उर्फ महदूद मजरा अहतमाल","agri":45,"nonAgri":2860,"multi":17100,"shop":44220,"otherCommercial":39798,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"रुड़की - ग्रामीण","alias":""},{"id":"CRX0008","page":39,"group":"H","name":"रामपुर जदीद मुस्तहकम","agri":35,"nonAgri":4300,"multi":18300,"shop":42735,"otherCommercial":30690,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","alias":""},{"id":"CRX0009","page":39,"group":"I","name":"मेहवड़ खुर्द उर्फ नागल","agri":35,"nonAgri":2200,"multi":16400,"shop":39600,"otherCommercial":30800,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","alias":""},{"id":"CRX0010","page":39,"group":"J","name":"अब्दुल हसनपुर","agri":22,"nonAgri":1700,"multi":15850,"shop":33880,"otherCommercial":27170,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"रुड़की - ग्रामीण","alias":""},{"id":"CRX0011","page":39,"group":"J","name":"अलमासपुर","agri":22,"nonAgri":1700,"multi":15850,"shop":33880,"otherCommercial":27170,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"रुड़की - ग्रामीण","alias":""},{"id":"CRX0012","page":40,"group":"A","name":"कमौरा","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0013","page":40,"group":"A","name":"फतेहउल्लापुर","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0014","page":40,"group":"A","name":"झबीरण","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0015","page":40,"group":"A","name":"बरमपुर","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0016","page":40,"group":"A","name":"सुसाड़ी खुर्द","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0017","page":40,"group":"A","name":"सुसाड़ी कला","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0018","page":40,"group":"A","name":"उल्हेड़ी","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0019","page":40,"group":"A","name":"उल्हेडा","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0020","page":40,"group":"A","name":"टिकोला कला","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":9,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0021","page":40,"group":"A","name":"नसीरपुर अफजलपुर","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":10,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0022","page":40,"group":"A","name":"भगतवाली मजरा झबरेड़ा","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":11,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0023","page":40,"group":"A","name":"मोहम्मदपुर जट","agri":40,"nonAgri":2600,"multi":16700,"shop":42130,"otherCommercial":37917,"nonCommercial1":14000,"nonCommercial2":12000,"row":12,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0024","page":40,"group":"B","name":"मन्नाखेड़ी","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0025","page":40,"group":"B","name":"मुण्डेट","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0026","page":40,"group":"B","name":"लहबोली","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0027","page":40,"group":"B","name":"जटबेड़ी","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0028","page":40,"group":"B","name":"उदलहेड़ी","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0029","page":41,"group":"B","name":"बुडपुर जट","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0030","page":41,"group":"B","name":"कांवावली","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0031","page":41,"group":"B","name":"हरजौली जट","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0032","page":41,"group":"B","name":"सिकन्दरपुर मवाल","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0033","page":41,"group":"B","name":"मुण्डलाना","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0034","page":41,"group":"B","name":"रसूलपुर निठारी","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0035","page":41,"group":"B","name":"जैनपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0036","page":41,"group":"B","name":"मलदसपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0037","page":41,"group":"B","name":"सढौली","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":9,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0038","page":41,"group":"B","name":"खानमपुर कसौली","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":10,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0039","page":41,"group":"B","name":"कासमपुर खुर्द","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":11,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0040","page":41,"group":"B","name":"माधपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":12,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0041","page":41,"group":"B","name":"चक करमपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":13,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0042","page":41,"group":"B","name":"हरचन्दपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":14,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0043","page":41,"group":"B","name":"कवादपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":15,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0044","page":41,"group":"B","name":"सुसाडा","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":16,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0045","page":41,"group":"B","name":"बुडपुर चौहान","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":17,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0046","page":41,"group":"B","name":"नूरपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":18,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0047","page":41,"group":"B","name":"हसीमपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":19,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0048","page":41,"group":"B","name":"शीतलपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":20,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0049","page":42,"group":"B","name":"कुमराडा","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0050","page":42,"group":"B","name":"कुमराडी","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0051","page":42,"group":"B","name":"बसवाखेड़ी","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0052","page":42,"group":"B","name":"गजरौला","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0053","page":42,"group":"B","name":"बन्हेड़ा टांडा","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0054","page":42,"group":"B","name":"नाथूखेड़ी","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0055","page":42,"group":"B","name":"आमखेड़ी","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0056","page":42,"group":"B","name":"खेमपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0057","page":42,"group":"B","name":"नगला चीना","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":9,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0058","page":42,"group":"B","name":"सढोला","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":10,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0059","page":42,"group":"B","name":"राजपुर मुस्तफाबाद उर्फ गाधारोना","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":11,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0060","page":42,"group":"B","name":"नगला ऐमाद","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":12,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0061","page":42,"group":"B","name":"नगला सिकन्दर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":13,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0062","page":42,"group":"B","name":"नगला कोयल","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":14,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0063","page":42,"group":"B","name":"नगला सलारू","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":15,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0064","page":42,"group":"B","name":"नगला सकटू","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":16,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0065","page":42,"group":"B","name":"नाहरपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":17,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0066","page":42,"group":"B","name":"निजामपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":18,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0067","page":42,"group":"B","name":"रायपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":19,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0068","page":42,"group":"B","name":"सैदपुरा","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":20,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0069","page":42,"group":"B","name":"शेरपुर","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":21,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0070","page":42,"group":"B","name":"ठसका","agri":36,"nonAgri":2500,"multi":16600,"shop":42000,"otherCommercial":37800,"nonCommercial1":14000,"nonCommercial2":12000,"row":22,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0071","page":43,"group":"C","name":"अकबरपुर ढाढेकी","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0072","page":43,"group":"C","name":"नारायणपुर","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0073","page":43,"group":"C","name":"सलापुर","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0074","page":43,"group":"C","name":"टिकोला खुर्द","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0075","page":43,"group":"C","name":"हज्जरपुर मुस्तहकम","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0076","page":43,"group":"C","name":"मिखबर घोषपुर","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0077","page":43,"group":"C","name":"गोपालपुर","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0078","page":43,"group":"C","name":"नकीबपुर उर्फ घोषीपुरा","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0079","page":43,"group":"C","name":"सिकन्दर","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":9,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0080","page":43,"group":"C","name":"ठोई","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":10,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0081","page":43,"group":"C","name":"अब्दुल हसनपुर उर्फ भिसरपड़ी","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":11,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0082","page":43,"group":"C","name":"बुडकपुर","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":12,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0083","page":43,"group":"C","name":"मुकीमपुर","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":13,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0084","page":43,"group":"C","name":"हज्जरपुर अहतमाल","agri":34,"nonAgri":2200,"multi":16500,"shop":41800,"otherCommercial":37620,"nonCommercial1":14000,"nonCommercial2":12000,"row":14,"section":"मंगलौर - ग्रामीण","alias":""},{"id":"CRX0085","page":44,"group":"A","name":"शाहपुर साल्हापुर","agri":70,"nonAgri":4500,"multi":18300,"shop":52500,"otherCommercial":47250,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0086","page":44,"group":"B","name":"खाताखेड़ी","agri":44,"nonAgri":3080,"multi":17300,"shop":51000,"otherCommercial":45900,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0087","page":44,"group":"B","name":"डेलना","agri":44,"nonAgri":3080,"multi":17300,"shop":51000,"otherCommercial":45900,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0088","page":44,"group":"C","name":"रसूलपुर","agri":39,"nonAgri":2200,"multi":16500,"shop":50000,"otherCommercial":45000,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0089","page":44,"group":"C","name":"लाठरदेवा शेख","agri":39,"nonAgri":2200,"multi":16500,"shop":50000,"otherCommercial":45000,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0090","page":44,"group":"C","name":"पाडली गुर्जर","agri":39,"nonAgri":2200,"multi":16500,"shop":50000,"otherCommercial":45000,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0091","page":44,"group":"C","name":"झबरेड़ी खुर्द","agri":39,"nonAgri":2200,"multi":16500,"shop":50000,"otherCommercial":45000,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0092","page":44,"group":"C","name":"इकबालपुर कमेलपुर","agri":39,"nonAgri":2200,"multi":16500,"shop":50000,"otherCommercial":45000,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0093","page":44,"group":"C","name":"कवादपुर लोदीवाला","agri":39,"nonAgri":2200,"multi":16500,"shop":50000,"otherCommercial":45000,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0094","page":44,"group":"C","name":"बलेलपुर मजरा पनियाला चन्दापुर","agri":39,"nonAgri":2200,"multi":16500,"shop":50000,"otherCommercial":45000,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0095","page":44,"group":"D","name":"समसपुर खुन्डेवाली","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0096","page":44,"group":"D","name":"सफरपुर","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0097","page":44,"group":"D","name":"महमूदपुर","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0098","page":44,"group":"D","name":"नुननगर पनियाली","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0099","page":44,"group":"D","name":"नौबतपुर मूलेवाला","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0100","page":44,"group":"D","name":"धर्मपुर","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0101","page":45,"group":"D","name":"खण्डखेड़ी दयाला","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":1,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0102","page":45,"group":"D","name":"हरजौली झोझा","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":2,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0103","page":45,"group":"D","name":"सरकड़ी ताहिरपुर","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":3,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0104","page":45,"group":"D","name":"सुल्तानपुर साबतवाली","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":4,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0105","page":45,"group":"D","name":"होसनपुर","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":5,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0106","page":45,"group":"D","name":"बहिस्तीपुर","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":6,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0107","page":45,"group":"D","name":"साल्हापुर","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":7,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0108","page":45,"group":"D","name":"अहमदपुर सरवाकरी","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":8,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0109","page":45,"group":"D","name":"अकबरपुर झोझा","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":9,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0110","page":45,"group":"D","name":"बलेलपुर मजरा हरजौली झोझा","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":10,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0111","page":45,"group":"D","name":"नगला कुबड़ा","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":11,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0112","page":45,"group":"D","name":"अकबरपुर फाजिलपुर","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":12,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0113","page":45,"group":"D","name":"सोहलपुर गाडा","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":13,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0114","page":45,"group":"D","name":"हीराहेड़ी","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":14,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0115","page":45,"group":"D","name":"मकनपुर देवपुर","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":15,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0116","page":45,"group":"D","name":"करौंदी जदीद","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":16,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0117","page":45,"group":"D","name":"सालियर साल्हापुर जदीद मु०","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":17,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0118","page":45,"group":"D","name":"किशनपुर जमालपुर जदीद मु०","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":18,"section":"भगवानपुर - ग्रामीण","alias":""},{"id":"CRX0119","page":45,"group":"D","name":"पुहाना जदीद मु०","agri":30,"nonAgri":2200,"multi":16300,"shop":49200,"otherCommercial":44280,"nonCommercial1":14000,"nonCommercial2":12000,"row":19,"section":"भगवानपुर - ग्रामीण","alias":""}]);

let selectedCircleLocation = null;
let selectedCircleRateKey = null;

function circleNorm(s){
  return String(s||'').toLowerCase().replace(/[\s._\-\/()]+/g,'').replace(/[^a-z0-9\u0900-\u097f]/g,'');
}
function hindiRomanRough(s){
  const m={'अ':'a','आ':'aa','इ':'i','ई':'i','उ':'u','ऊ':'u','ए':'e','ऐ':'ai','ओ':'o','औ':'au','क':'k','ख':'kh','ग':'g','घ':'gh','च':'ch','छ':'chh','ज':'j','झ':'jh','ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n','प':'p','फ':'f','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h','ा':'a','ि':'i','ी':'i','ु':'u','ू':'u','े':'e','ै':'ai','ो':'o','ौ':'au','ं':'n','ँ':'n','ः':'h','्':'','़':''};
  return String(s||'').split('').map(c=>m[c]??c).join('').replace(/[^a-z0-9]/gi,'').toLowerCase();
}
function latinSkeleton(s){ return String(s||'').toLowerCase().replace(/w/g,'v').replace(/[aeiouy\s._\/()-]/g,'').replace(/[^a-z0-9]/g,''); }
function circleSearchText(e){ return circleNorm(e.name+' '+(e.alias||'')+' '+e.section+' '+e.group+' page '+e.page)+' '+hindiRomanRough(e.name)+' '+latinSkeleton(e.alias||'')+' '+latinSkeleton(hindiRomanRough(e.name)); }
function defaultRateKey(){
  const t=String(registrySelectedType||'Residential Plot').toLowerCase();
  if(t.includes('agriculture')) return 'agri';
  if(t.includes('commercial')) return 'shop';
  if(t.includes('building')) return 'multi';
  return 'nonAgri';
}
function rateLabel(key){
  return ({agri:'कृषि भूमि (₹ लाख/हेक्टेयर)',nonAgri:'अकृषि भूमि / Residential Plot (₹/m²)',multi:'बहुमंजिला आवासीय प्लॉट (₹/m²)',shop:'दुकान / रेस्टोरेंट / कार्यालय (₹/m²)',otherCommercial:'अन्य वाणिज्यिक प्रतिष्ठान (₹/m²)',nonCommercial1:'गैर वाणिज्यिक प्रथम श्रेणी (₹/m²)',nonCommercial2:'गैर वाणिज्यिक द्वितीय श्रेणी (₹/m²)'})[key]||key;
}
function formatRateValue(key,v){ if(v===null||v===undefined||v==='')return 'N/A'; return key==='agri' ? ('₹ '+Number(v).toLocaleString('en-IN')+' लाख/हेक्टेयर') : ('₹ '+Number(v).toLocaleString('en-IN')+'/m²'); }
function filterCircleLocations(){
  const input=document.getElementById('villageSearch'), box=document.getElementById('villageSuggestions'); if(!input||!box)return;
  const q=circleNorm(input.value), qRoman=String(input.value||'').toLowerCase().replace(/[^a-z0-9]/g,''), qSkeleton=latinSkeleton(input.value);
  let rows=CIRCLE_RATE_DATA.filter(e=>{
    const hay=circleSearchText(e);
    return !q || hay.includes(q) || (qRoman && hay.includes(qRoman)) || (qSkeleton && hay.includes(qSkeleton));
  });
  rows=rows.slice(0,18);
  if(!rows.length){box.innerHTML='<div class="location-empty">Is indexed section me match nahi mila. Hindi spelling try karein.</div>';box.classList.add('show');return;}
  const k=defaultRateKey();
  box.innerHTML=rows.map(e=>`<button type="button" class="location-option" onclick="selectCircleLocation('${e.id}')"><span><strong>${esc(e.name)}</strong><small>${esc(e.section)} • PDF page ${e.page} • श्रेणी ${esc(e.group)}</small></span><span class="rate-chip">${formatRateValue(k,e[k])}</span></button>`).join('');
  box.classList.add('show');
}
function selectCircleLocation(id){
  const e=CIRCLE_RATE_DATA.find(x=>x.id===id); if(!e)return;
  selectedCircleLocation=e;
  selectedCircleRateKey=null;
  const input=document.getElementById('villageSearch'), hidden=document.getElementById('village'), idEl=document.getElementById('selectedCircleRowId');
  if(input)input.value=e.name;if(hidden)hidden.value=e.name;if(idEl)idEl.value=e.id;
  const box=document.getElementById('villageSuggestions');if(box)box.classList.remove('show');
  populateCircleRateOptions(e);
  const count=LAND_RATE_KEYS.filter(key=>e[key]!==null&&e[key]!==undefined&&e[key]!=='').length;
  const meta=document.getElementById('selectedLocationMeta');
  if(meta){meta.className='selected-location-meta ready';meta.innerHTML=`✓ PDF page ${e.page} • ${esc(e.section)} • श्रेणी ${esc(e.group)} • <strong>${count} land-rate options available — Circle Rate par click karke select karein.</strong>`;}
  const ref=document.getElementById('rateRef'); if(ref)ref.value=`ROORKEE_BHAGWANPUR PDF • Page ${e.page} • Row ${e.row||'-'} • ${e.section} • श्रेणी ${e.group} • ${e.name}`;
  applyCircleRateOption(); syncDraftPreview();
}

const LAND_RATE_KEYS=['agri','nonAgri','multi','shop','otherCommercial','nonCommercial1','nonCommercial2'];
const LAND_RATE_CONFIG={
  agri:{type:'कृषि भूमि',area:'प्रति हेक्टेयर',unit:'₹ लाख/हेक्टेयर',column:4},
  nonAgri:{type:'अकृषि भूमि / Residential Plot',area:'प्रति वर्ग मीटर',unit:'₹/m²',column:5},
  multi:{type:'बहुमंजिला व आवासीय भवन / Residential',area:'सुपर एरिया प्रति वर्ग मीटर',unit:'₹/m²',column:6},
  shop:{type:'वाणिज्यिक भवन — दुकान / रेस्टोरेंट / कार्यालय',area:'सुपर एरिया प्रति वर्ग मीटर',unit:'₹/m²',column:7},
  otherCommercial:{type:'अन्य वाणिज्यिक प्रतिष्ठान',area:'सुपर एरिया प्रति वर्ग मीटर',unit:'₹/m²',column:8},
  nonCommercial1:{type:'गैर वाणिज्यिक निर्माण — प्रथम श्रेणी',area:'प्रति वर्ग मीटर',unit:'₹/m²',column:9},
  nonCommercial2:{type:'गैर वाणिज्यिक निर्माण — द्वितीय श्रेणी',area:'प्रति वर्ग मीटर',unit:'₹/m²',column:10}
};

function landRateConfig(key){return LAND_RATE_CONFIG[key]||{type:rateLabel(key),area:'',unit:'',column:'-'};}
function rateNumber(v){return Number(v).toLocaleString('en-IN');}
function populateCircleRateOptions(e){
  const sel=document.getElementById('circleRateSelect');
  if(sel){sel.innerHTML='<option value="">Select Land Rate</option>';sel.value='';sel.disabled=true;}
  const picker=document.getElementById('circleRatePicker');
  if(picker){picker.disabled=!e;picker.classList.remove('selected');const main=picker.querySelector('.picker-main');if(main)main.innerHTML='Select Land Rate <small>Official PDF options</small>';}
  let hidden=document.getElementById('circleRate'); if(hidden)hidden.value='';
  const cr=document.getElementById('circleRateOut'); if(cr)cr.textContent='₹0';
}
function loadDemoRate(){ /* disabled: user selects exact official PDF land-rate row */ }
function applyCircleRateOption(){
  let hidden=document.getElementById('circleRate'); if(!hidden){hidden=document.createElement('input');hidden.type='hidden';hidden.id='circleRate';document.body.appendChild(hidden)}
  const sel=document.getElementById('circleRateSelect'); hidden.value=sel?sel.value:'';
  recalculate(); recalculateStampDuty(); syncDraftPreview();
}
function openLandRateModal(){
  if(!selectedCircleLocation){toast('Pehle Village / Plot Location select karein');return;}
  const e=selectedCircleLocation;
  const modal=document.getElementById('landRateModal'), rows=document.getElementById('landRateRows');
  if(!modal||!rows)return;
  const recommended=defaultRateKey();
  const available=LAND_RATE_KEYS.filter(key=>e[key]!==null&&e[key]!==undefined&&e[key]!=='');
  rows.innerHTML=available.map(key=>{
    const c=landRateConfig(key), isRec=key===recommended, isSel=key===selectedCircleRateKey;
    return `<tr class="${isSel?'selected-rate ':''}${isRec?'recommended-rate':''}">
      <td><strong>${esc(e.name)}</strong><small>${esc(e.section)} • श्रेणी ${esc(e.group)} • PDF page ${e.page}, row ${e.row||'-'}</small></td>
      <td><strong>${esc(c.type)}</strong>${isRec?'<span class="recommended-badge">Registry Type Match</span>':''}</td>
      <td>${esc(c.area)}</td>
      <td class="rate-cell">${rateNumber(e[key])}</td>
      <td>${esc(c.unit)}</td>
      <td><button type="button" class="rate-select-arrow" title="Select this rate" onclick="chooseLandRate('${key}')">→</button></td>
    </tr>`;
  }).join('');
  const sub=document.getElementById('landRateSubtitle');
  if(sub)sub.textContent=`${e.name} • ${e.section} • PDF Page ${e.page} • Row ${e.row||'-'}`;
  const pdfRef=document.getElementById('landRatePdfRef');
  if(pdfRef)pdfRef.textContent=`Official source: ROORKEE_BHAGWANPUR PDF • Page ${e.page} • Row ${e.row||'-'} • Columns 4–10`;
  modal.classList.add('show');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
}
function closeLandRateModal(){
  const modal=document.getElementById('landRateModal');if(modal){modal.classList.remove('show');modal.setAttribute('aria-hidden','true');}
  document.body.classList.remove('modal-open');
}
function chooseLandRate(key){
  const e=selectedCircleLocation,c=landRateConfig(key);if(!e||!LAND_RATE_KEYS.includes(key))return;
  const v=e[key];if(v===null||v===undefined||v===''){toast('Is PDF row me ye rate available nahi hai');return;}
  selectedCircleRateKey=key;
  const sel=document.getElementById('circleRateSelect');
  if(sel){sel.innerHTML=`<option value="${v}" data-rate-key="${key}" data-column="${c.column}">${esc(c.type)}</option>`;sel.value=String(v);sel.disabled=false;}
  const picker=document.getElementById('circleRatePicker');
  if(picker){picker.disabled=false;picker.classList.add('selected');const main=picker.querySelector('.picker-main');if(main)main.innerHTML=`${esc(c.type)} <small>${formatRateValue(key,v)} • PDF Column ${c.column}</small>`;}
  const ref=document.getElementById('rateRef');
  if(ref)ref.value=`ROORKEE_BHAGWANPUR PDF • Page ${e.page} • Row ${e.row||'-'} • Column ${c.column} • ${e.section} • श्रेणी ${e.group} • ${e.name} • ${c.type}`;
  const meta=document.getElementById('selectedLocationMeta');
  if(meta){meta.className='selected-location-meta ready';meta.innerHTML=`✓ Selected: <strong>${esc(c.type)} — ${formatRateValue(key,v)}</strong> • PDF page ${e.page}, row ${e.row||'-'}, column ${c.column}`;}
  closeLandRateModal();applyCircleRateOption();toast('Circle rate selected from official PDF row');
}
function openOfficialCircleSourcePage(page){
  const p=Math.max(1,Number(page)||1);
  const ctx=typeof currentJurisdiction==='function'?currentJurisdiction():{};
  let file='data/states/uttarakhand/haridwar/pdfs/circle_rates_roorkee.pdf',physical=p;
  if(ctx.tehsil==='Haridwar'){file='data/states/uttarakhand/haridwar/pdfs/circle_rates_haridwar_2025.pdf';}
  else if(ctx.tehsil==='Laksar'){file='data/states/uttarakhand/haridwar/pdfs/circle_rates_laksar_2025.pdf';}
  else if(p>=58){file='data/states/uttarakhand/haridwar/pdfs/circle_rate_rules_khasra_pages_58_112.pdf';physical=p-57;}
  else if(p>=46){file='data/states/uttarakhand/haridwar/pdfs/circle_rates_bhagwanpur.pdf';physical=p-45;}
  else if(p>=2){file='data/states/uttarakhand/haridwar/pdfs/circle_rates_roorkee.pdf';physical=p-1;}
  window.open(`${file}#page=${Math.max(1,physical)}`,'_blank');
}
window.openOfficialCircleSourcePage=openOfficialCircleSourcePage;
function openCircleRatePdf(){
  if(!selectedCircleLocation){toast('Pehle Village / Plot Location select karein');return;}
  openOfficialCircleSourcePage(selectedCircleLocation.page);
}
// Property type changes only update the recommended row; user's selected PDF rate is never auto-overwritten.
const _v05SelectPropertyType=selectPropertyType;
selectPropertyType=function(el){_v05SelectPropertyType(el);const modal=document.getElementById('landRateModal');if(selectedCircleLocation&&modal?.classList.contains('show'))openLandRateModal();}

document.addEventListener('click',function(ev){
  const wrap=ev.target.closest && ev.target.closest('.location-search-wrap');
  if(!wrap){const b=document.getElementById('villageSuggestions');if(b)b.classList.remove('show');}
});
document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closeLandRateModal();});


/* v0.5 authoritative PDF-rate calculation override */
function recalculate(){
  const area=calculateArea();
  const sel=document.getElementById('circleRateSelect');
  const opt=sel && sel.selectedOptions && sel.selectedOptions[0] ? sel.selectedOptions[0] : null;
  const key=opt ? (opt.dataset.rateKey||'nonAgri') : 'nonAgri';
  const rate=parseFloat(sel?.value||'0')||0;
  let base=0;
  if(key==='agri') base=(area.m2/10000)*rate*100000; // ₹ lakh/hectare -> ₹ total
  else base=area.m2*rate;
  const plot=base; // no invented road multiplier: exact PDF base rate only
  const areaOut=document.getElementById('areaOut'); if(areaOut)areaOut.textContent=area.sqft.toFixed(2)+' sq ft';
  const areaM=document.getElementById('areaM2Out'); if(areaM)areaM.textContent=area.m2.toFixed(2)+' m²';
  const editM=document.getElementById('editableAreaM2'); if(editM)editM.textContent=area.m2.toFixed(2)+' m²';
  const cr=document.getElementById('circleRateOut'); if(cr)cr.textContent=key==='agri' ? ('₹'+rate.toLocaleString('en-IN')+' लाख/हेक्टेयर') : inr(rate);
  const vo=document.getElementById('valueOut'); if(vo)vo.textContent=inr(base);
  const pv=document.getElementById('plotValueDisplay'); if(pv)pv.value=inr(plot);
  return {area,rate,road:1,base,plot,rateKey:key};
}


/* ===== v0.7 FINAL: Road-width adjustment on Property Details page ===== */
function roadWidthInfo(){
  const sel=document.getElementById('roadWidth');
  if(!sel) return {factor:1,percent:0,label:'LESS THAN 5 METER'};
  const opt=sel.selectedOptions && sel.selectedOptions[0] ? sel.selectedOptions[0] : null;
  const factor=parseFloat(sel.value||'1')||1;
  const percent=opt ? (parseFloat(opt.dataset.percent||String((factor-1)*100))||0) : Math.round((factor-1)*100);
  const label=opt ? opt.text.replace(/\s+[—-]\s+\+?\d+%\s*$/,'') : '';
  return {factor,percent,label};
}

function updateRoadRateUI(baseRate, finalRate, rateKey){
  const r=roadWidthInfo();
  const note=document.getElementById('roadRateNote');
  const detail=document.getElementById('circleRateDetail');
  const roadSummary=document.getElementById('roadWidthSummary');
  const premiumSummary=document.getElementById('roadPremiumSummary');
  if(roadSummary) roadSummary.value=r.label;
  if(premiumSummary) premiumSummary.value=(r.percent>0?'+':'')+r.percent+'%';

  if(!baseRate){
    if(note) note.textContent='PDF base rate select karne ke baad road-width premium automatically add hoga.';
    if(detail) detail.textContent='PDF base rate + road adjustment';
    return;
  }
  const baseText=rateKey==='agri'
    ? ('₹'+Number(baseRate).toLocaleString('en-IN')+' लाख/हेक्टेयर')
    : ('₹'+Number(baseRate).toLocaleString('en-IN')+'/m²');
  const finalText=rateKey==='agri'
    ? ('₹'+Number(finalRate).toLocaleString('en-IN',{maximumFractionDigits:2})+' लाख/हेक्टेयर')
    : ('₹'+Number(finalRate).toLocaleString('en-IN',{maximumFractionDigits:2})+'/m²');
  if(note) note.innerHTML=`PDF Base: <strong>${baseText}</strong> &nbsp; + Road Premium: <strong>${r.percent}%</strong> &nbsp; = Final: <strong>${finalText}</strong>`;
  if(detail) detail.textContent=`PDF Base ${baseText} + Road ${r.percent}%`;
}

// Keep the official PDF rate in circleRateSelect. Hidden circleRate stores the final adjusted rate.
function applyCircleRateOption(){
  let hidden=document.getElementById('circleRate');
  if(!hidden){hidden=document.createElement('input');hidden.type='hidden';hidden.id='circleRate';document.body.appendChild(hidden);}
  recalculate();
  recalculateStampDuty();
  syncDraftPreview();
}

function recalculate(){
  const area=calculateArea();
  const sel=document.getElementById('circleRateSelect');
  const opt=sel && sel.selectedOptions && sel.selectedOptions[0] ? sel.selectedOptions[0] : null;
  const key=opt ? (opt.dataset.rateKey||selectedCircleRateKey||'nonAgri') : (selectedCircleRateKey||'nonAgri');
  const baseRate=parseFloat(sel?.value||'0')||0;
  const r=roadWidthInfo();
  const finalRate=baseRate*r.factor;

  let pdfBaseValue=0, plot=0;
  if(key==='agri'){
    pdfBaseValue=(area.m2/10000)*baseRate*100000;      // ₹ lakh/hectare -> total
    plot=(area.m2/10000)*finalRate*100000;
  }else{
    pdfBaseValue=area.m2*baseRate;
    plot=area.m2*finalRate;
  }

  const hidden=document.getElementById('circleRate');
  if(hidden) hidden.value=finalRate ? String(finalRate) : '';
  const areaOut=document.getElementById('areaOut'); if(areaOut)areaOut.textContent=area.sqft.toFixed(2)+' sq ft';
  const areaM=document.getElementById('areaM2Out'); if(areaM)areaM.textContent=area.m2.toFixed(2)+' m²';
  const editM=document.getElementById('editableAreaM2'); if(editM)editM.textContent=area.m2.toFixed(2)+' m²';
  const cr=document.getElementById('circleRateOut');
  if(cr){
    cr.textContent=key==='agri'
      ? ('₹'+finalRate.toLocaleString('en-IN',{maximumFractionDigits:2})+' लाख/हेक्टेयर')
      : inr(finalRate);
  }
  const vo=document.getElementById('valueOut'); if(vo)vo.textContent=inr(plot);
  const pv=document.getElementById('plotValueDisplay'); if(pv)pv.value=inr(plot);
  updateRoadRateUI(baseRate,finalRate,key);
  return {area,rate:finalRate,baseRate,finalRate,road:r.factor,roadPercent:r.percent,roadLabel:r.label,base:pdfBaseValue,plot,rateKey:key};
}

// v0.7 draft persistence: save the untouched PDF base rate and road-adjusted final rate separately.
const _v06DraftData=draftData;
draftData=function(){
  const d=_v06DraftData();
  const c=recalculate();
  d.pdfBaseCircleRate=c.baseRate;
  d.circleRate=c.finalRate;
  d.finalCircleRate=c.finalRate;
  d.roadFactor=c.road;
  d.roadPremiumPercent=c.roadPercent;
  d.roadWidth=c.roadLabel;
  d.plotValue=c.plot;
  return d;
};

// v0.7 preview: clearly show PDF base rate, road premium and final circle rate.
const _v06SyncDraftPreview=syncDraftPreview;
syncDraftPreview=function(){
  _v06SyncDraftPreview();
  const summary=document.getElementById('reviewSummary');
  if(summary){
    const c=recalculate();
    const rateKey=c.rateKey||selectedCircleRateKey||'nonAgri';
    const baseTxt=rateKey==='agri' ? formatRateValue('agri',c.baseRate) : inr(c.baseRate)+'/m²';
    const finalTxt=rateKey==='agri' ? ('₹ '+Number(c.finalRate).toLocaleString('en-IN',{maximumFractionDigits:2})+' लाख/हेक्टेयर') : inr(c.finalRate)+'/m²';
    const circleRow=[...summary.querySelectorAll('.review-row')].find(x=>x.querySelector('span')?.textContent==='Circle Rate');
    if(circleRow){
      circleRow.querySelector('span').textContent='Circle Rate (Final)';
      circleRow.querySelector('strong').innerHTML=`${esc(finalTxt)}<small class="review-rate-breakdown">PDF Base ${esc(baseTxt)} + Road ${c.roadPercent}%</small>`;
    }
  }
};

// Initialize road summary once DOM is ready.
document.addEventListener('DOMContentLoaded',()=>{try{writeAreaFieldFromDimensions();selectRebateType('none');recalculate();recalculateStampDuty();}catch(e){}});

/* ===== v0.9 Agriculture Sale Deed Template (based on supplied 5-page sample) ===== */
let agriGataCounter=0;
let agriAreaManualOverride=false;

function isAgricultureMode(){
  return String(registrySelectedType||'').toLowerCase().includes('agriculture');
}
function toggleAgriElements(){
  const agri=isAgricultureMode();
  document.querySelectorAll('.agri-only').forEach(el=>{el.style.display=agri?'':'none';});
  document.querySelectorAll('.non-agri-only').forEach(el=>{el.style.display=agri?'none':'';});
  if(agri){
    const body=document.getElementById('agriGataRows');
    if(body && !body.children.length) addAgriGataRow();
    updateAgriAreaDisplay();
  }
}
const _v08SelectPropertyType=selectPropertyType;
selectPropertyType=function(el){
  _v08SelectPropertyType(el);
  toggleAgriElements();
  recalculate();recalculateStampDuty();syncDraftPreview();
};
const _v08StartDraftSteps=startDraftSteps;
startDraftSteps=function(){
  _v08StartDraftSteps();
  toggleAgriElements();
  if(isAgricultureMode() && document.getElementById('agriGataRows') && !document.getElementById('agriGataRows').children.length) addAgriGataRow();
  recalculate();recalculateStampDuty();syncDraftPreview();
};

function addAgriGataRow(data={}){
  const body=document.getElementById('agriGataRows');if(!body)return;
  agriGataCounter++;
  const tr=document.createElement('tr');
  tr.innerHTML=`<td class="gata-index"></td>
    <td><input class="gata-chak" value="${esc(data.chak||'')}" placeholder="चक सं." oninput="updateAgriAreaFromRows();syncDraftPreview()"></td>
    <td><input class="gata-number" value="${esc(data.gata||'')}" placeholder="गाटा / खसरा" oninput="syncDraftPreview()"></td>
    <td><input class="gata-area" type="number" min="0" step="0.0001" value="${data.area||''}" placeholder="0.0000" oninput="updateAgriAreaFromRows();syncDraftPreview()"></td>
    <td><button type="button" class="del-row" onclick="deleteAgriGataRow(this)">✕</button></td>`;
  body.appendChild(tr);
  renumberAgriGataRows();
  updateAgriAreaFromRows();
}
function deleteAgriGataRow(btn){
  const tr=btn.closest('tr');if(tr)tr.remove();
  renumberAgriGataRows();
  updateAgriAreaFromRows();syncDraftPreview();
}
function renumberAgriGataRows(){
  document.querySelectorAll('#agriGataRows tr').forEach((tr,i)=>{const c=tr.querySelector('.gata-index');if(c)c.textContent=i+1;});
}
function collectAgriGataRows(){
  return [...document.querySelectorAll('#agriGataRows tr')].map(tr=>({
    chak:(tr.querySelector('.gata-chak')?.value||'').trim(),
    gata:(tr.querySelector('.gata-number')?.value||'').trim(),
    area:parseFloat(tr.querySelector('.gata-area')?.value||'0')||0
  })).filter(x=>x.chak||x.gata||x.area>0);
}
function gataAreaTotal(){return collectAgriGataRows().reduce((a,x)=>a+(x.area||0),0);}
function updateAgriAreaDisplay(){
  const ha=parseFloat(document.getElementById('agriTotalAreaHa')?.value||'0')||0;
  const m2=ha*10000, sqft=m2/0.092903;
  const out=document.getElementById('agriAreaConversion');
  if(out)out.textContent=`${m2.toLocaleString('en-IN',{maximumFractionDigits:2})} m² / ${sqft.toLocaleString('en-IN',{maximumFractionDigits:2})} sq ft`;
}
function updateAgriAreaFromRows(){
  if(!isAgricultureMode())return;
  agriAreaManualOverride=false;
  const total=gataAreaTotal();
  const input=document.getElementById('agriTotalAreaHa');
  if(input)input.value=total>0?total.toFixed(4):'';
  updateAgriAreaDisplay();
  recalculate();recalculateStampDuty();
}
function onAgriTotalAreaEdited(){
  agriAreaManualOverride=true;
  updateAgriAreaDisplay();
  recalculate();recalculateStampDuty();syncDraftPreview();
}

const _v08CalculateArea=calculateArea;
calculateArea=function(){
  if(isAgricultureMode()){
    const rowTotal=gataAreaTotal();
    const manual=parseFloat(document.getElementById('agriTotalAreaHa')?.value||'0')||0;
    const hectare=(agriAreaManualOverride && manual>0)?manual:(rowTotal||manual||0);
    const m2=hectare*10000;
    return {sqft:m2/0.092903,m2,hectare};
  }
  const a=_v08CalculateArea();
  a.hectare=(a.m2||0)/10000;
  return a;
};
const _v08Recalculate=recalculate;
recalculate=function(){
  const c=_v08Recalculate();
  if(isAgricultureMode()){
    const ha=(c.area?.hectare ?? ((c.area?.m2||0)/10000));
    const ao=document.getElementById('areaOut');if(ao)ao.textContent=ha.toFixed(4)+' hectare';
    const am=document.getElementById('areaM2Out');if(am)am.textContent=(c.area?.m2||0).toLocaleString('en-IN',{maximumFractionDigits:2})+' m²';
    const pv=document.getElementById('plotValueDisplay');if(pv)pv.value=inr(c.plot||0);
    updateAgriAreaDisplay();
  }
  return c;
};

function autoFillAgriAdminFromCircle(){
  if(!selectedCircleLocation)return;
  const head=String(selectedCircleLocation.section||'').split('-')[0].trim();
  if(head){
    const p=document.getElementById('pargana'),t=document.getElementById('tehsil');
    if(p && (!p.value || p.value==='भगवानपुर'))p.value=head;
    if(t && (!t.value || t.value==='भगवानपुर'))t.value=head;
  }
  const d=document.getElementById('district');if(d && !d.value)d.value='हरिद्वार';
}
const _v08SelectCircleLocation=selectCircleLocation;
selectCircleLocation=function(id){
  _v08SelectCircleLocation(id);
  autoFillAgriAdminFromCircle();
  syncDraftPreview();
};

const _v08AddPaymentRow=addPaymentRow;
addPaymentRow=function(){
  const body=document.getElementById('paymentRows');if(!body)return;
  paymentRowCounter++;
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${paymentRowCounter}</td>
    <td><select onchange="updatePaymentTotal();syncDraftPreview()">
      <option>Cash / नकद</option><option>RTGS</option><option>NEFT</option><option>Cheque</option><option>Bank Transfer</option><option>UPI</option><option>Previous Advance / पूर्व भुगतान</option><option>Other</option>
    </select></td>
    <td><input class="pay-amount" type="number" min="0" oninput="updatePaymentTotal();syncDraftPreview()" placeholder="0"></td>
    <td><input class="pay-ref" placeholder="Reference / Cheque / RTGS No." oninput="syncDraftPreview()"></td>
    <td><input class="pay-date" type="date" onchange="syncDraftPreview()"></td>
    <td><button class="del-row" onclick="deletePaymentRow(this);syncDraftPreview()">✕</button></td>`;
  body.appendChild(tr);updatePaymentTotal();
};

function partyRelationText(p){
  const rel=p.relation||'पुत्र';
  return `${esc(p.name||'[नाम]')} ${esc(rel)} ${esc(p.father||'[पिता/पति का नाम]')}`;
}
function formatDeedMoney(n){return `${Math.round(Number(n)||0).toLocaleString('en-IN')}/-रुपये`;}
function formatDateDeed(v){
  if(!v)return '[दिनांक]';
  const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:esc(v);
}
function laganText(v){
  const n=Math.max(0,Number(v)||0),ru=Math.floor(n),pa=Math.round((n-ru)*100);
  if(!n)return '0 रुपये';
  return `${ru.toLocaleString('en-IN')} रुपये${pa?` ${pa} पैसे`:''}`;
}
function circleAreaRateRupees(d){
  const base=Number(d.pdfBaseCircleRate ?? d.circleRate ?? 0)||0;
  return d.circleRateKey==='agri'?base*100000:base;
}
function roadDeedSentence(d){
  const p=Number(d.roadPremiumPercent||0);
  const label=String(d.roadWidth||'');
  if(p===0)return '5 मीटर से कम चौड़े मार्ग के किनारे स्थित होने के कारण सामान्य दर';
  if(p===5)return '5 मीटर या अधिक परन्तु 12 मीटर से कम चौड़े मार्ग के किनारे स्थित होने के कारण 5 प्रतिशत अधिक दर';
  if(p===10)return '12 मीटर या अधिक परन्तु 15 मीटर से कम चौड़े मार्ग के किनारे स्थित होने के कारण 10 प्रतिशत अधिक दर';
  if(label.includes('18 METER OR MORE'))return '18 मीटर या अधिक चौड़े मार्ग के किनारे स्थित होने के कारण 15 प्रतिशत अधिक दर';
  return '15 मीटर या अधिक चौड़े मार्ग के किनारे स्थित होने के कारण 15 प्रतिशत अधिक दर';
}
function locationFull(d){
  return `ग्राम ${esc(d.village||'[ग्राम]')} परगना व तहसील ${esc(d.agri.pargana||'[परगना/तहसील]')} जिला ${esc(d.agri.district||'[जिला]')}`;
}
function personLine(p){
  return `${partyRelationText(p)} निवासी ${esc(p.address||'[पता]')}${p.aadhaar?` आधार कार्ड सं0 ${esc(p.aadhaar)}`:''}${p.mobile?`, मो0नं0 ${esc(p.mobile)}`:''}`;
}
function groupedGataNarrative(d){
  const rows=d.agri.gataRows||[];
  if(!rows.length)return `खाता/खसरा सं0 ${esc(d.khataNo||'[खाता]')} / ${esc(d.khasraNo||'[खसरा]')} रकबा ${Number(d.agri.totalAreaHa||0).toFixed(4)} हेक्टेयर`;
  const groups=[];
  rows.forEach(r=>{
    let g=groups.find(x=>x.chak===(r.chak||''));
    if(!g){g={chak:r.chak||'[चक]',rows:[]};groups.push(g);}g.rows.push(r);
  });
  return groups.map(g=>{
    const sum=g.rows.reduce((a,r)=>a+(Number(r.area)||0),0);
    const bits=g.rows.map((r,i)=>`${i?'व ':''}गाटा सं0 ${esc(r.gata||'[गाटा]')} रकबा ${(Number(r.area)||0).toFixed(4)} हे0`).join(' ');
    return `चक सं0 ${esc(g.chak)} के प्रस्तावित ${bits} कुल ${g.rows.length} किते कुल रकबा ${sum.toFixed(4)} हेक्टेयर`;
  }).join(' व ');
}
function paymentNarrative(d){
  const rows=(d.payments||[]).filter(x=>Number(x.amount)>0);
  const modeText=m=>{
    m=String(m||'');
    if(m.includes('RTGS'))return 'आर टी जी एस';
    if(m.includes('Cheque'))return 'चेक';
    if(m.includes('Bank'))return 'बैंक ट्रांसफर';
    if(m.includes('UPI'))return 'यू पी आई';
    if(m.includes('Previous'))return 'पूर्व में समय समय पर';
    if(m.includes('Cash'))return 'नकद';
    return 'अन्य माध्यम से';
  };
  const parts=rows.map(x=>{
    const ref=x.ref?` संदर्भ/यूटीआर ${esc(x.ref)}`:'';
    const dt=x.date?` दिनांक ${formatDateDeed(x.date)}`:'';
    return `अंकन ${formatDeedMoney(x.amount)} ${modeText(x.mode)}${ref}${dt} प्राप्त कर लिये हैं`;
  });
  if(!parts.length && d.advanceAmount>0)parts.push(`अंकन ${formatDeedMoney(d.advanceAmount)} पूर्व में एडवांस के रूप में प्राप्त कर लिये हैं`);
  if(!parts.length)return 'कुल मूल्य राशि की प्राप्ति विक्रेता द्वारा स्वीकार की गयी है';
  return parts.join(' व ');
}

const _v08DraftData=draftData;
draftData=function(){
  const d=_v08DraftData();
  d.seller.relation=val('sellerRelation')||'पुत्र';
  d.buyer.relation=val('buyerRelation')||'पुत्र';
  d.agri={
    pargana:val('pargana'),tehsil:val('tehsil'),district:val('district'),annualLagan:numv('annualLagan'),
    landCondition:val('agriLandCondition'),treeBoringStatus:val('treeBoringStatus'),coveredAreaText:val('coveredAreaText'),
    sellerOwnershipBasis:val('sellerOwnershipBasis'),leaseLand:val('leaseLand'),consolidationStatus:val('consolidationStatus'),
    scstRelated:val('scstRelated'),housingDevelopmentFee:val('housingDevelopmentFee'),buyerFarmerStatus:val('buyerFarmerStatus'),
    mainRoadDistance:val('mainRoadDistance'),landRecordBasis:val('landRecordBasis'),gataRows:collectAgriGataRows(),
    totalAreaHa:isAgricultureMode()?((recalculate().area.m2||0)/10000):0,areaManualOverride:agriAreaManualOverride,
    buyerHoldingLimit:val('buyerHoldingLimit'),sellerRemainingShare:val('sellerRemainingShare'),possessionGiven:val('possessionGiven'),
    latitude:val('propertyLatitude'),longitude:val('propertyLongitude'),mutationSupport:val('mutationSupport'),
    agreementStampPaid:numv('agreementStampPaid'),stampSheetCount:numv('stampSheetCount'),executionDate:val('executionDate'),
    advocateOffice:val('advocateOffice'),photoCertifier:val('photoCertifier'),
    circlePage:selectedCircleLocation?.page||'',circleRow:selectedCircleLocation?.row||'',circleGroup:selectedCircleLocation?.group||'',circleSection:selectedCircleLocation?.section||''
  };
  return d;
};

function agriReviewSummary(d){
  const summary=document.getElementById('reviewSummary');if(!summary)return;
  const c=recalculate();
  const rateRupees=circleAreaRateRupees(d);
  summary.innerHTML=`
    <div class="review-block"><h3>कृषि सम्पत्ति</h3>
      <div class="review-row"><span>ग्राम</span><strong>${esc(d.village||'-')}</strong></div>
      <div class="review-row"><span>परगना / तहसील / जिला</span><strong>${esc(d.agri.pargana||'-')} / ${esc(d.agri.tehsil||'-')} / ${esc(d.agri.district||'-')}</strong></div>
      <div class="review-row"><span>कुल क्षेत्रफल</span><strong>${Number(d.agri.totalAreaHa||0).toFixed(4)} hectare</strong></div>
      <div class="review-row"><span>चक / गाटा</span><strong>${d.agri.gataRows.length} entries</strong></div>
      <div class="review-row"><span>Circle Rate (PDF Base)</span><strong>${inr(rateRupees)} / hectare</strong></div>
      <div class="review-row"><span>Road Adjustment</span><strong>${esc(roadDeedSentence(d))}</strong></div>
      <div class="review-row"><span>बाजारी मालियत</span><strong>${inr(d.plotValue)}</strong></div>
    </div>
    <div class="review-block"><h3>Parties</h3>
      <div class="review-row"><span>विक्रेता</span><strong>${partyNamesForReview(d.sellers,d.seller)}</strong></div>
      <div class="review-row"><span>क्रेता</span><strong>${partyNamesForReview(d.buyers,d.buyer)}</strong></div>
      <div class="review-row"><span>साक्षी 1</span><strong>${esc(d.witness1.name||'-')}</strong></div>
      <div class="review-row"><span>साक्षी 2</span><strong>${esc(d.witness2.name||'-')}</strong></div>
    </div>
    <div class="review-block"><h3>Amount & Stamp</h3>
      <div class="review-row"><span>बैनामा राशि</span><strong>${inr(d.transactionAmount)}</strong></div>
      <div class="review-row"><span>स्टाम्प शुल्क</span><strong>${inr(d.stampDuty)}</strong></div>
      <div class="review-row"><span>Agreement Stamp</span><strong>${inr(d.agri.agreementStampPaid)}</strong></div>
      <div class="review-row"><span>Payment Entries</span><strong>${d.payments.filter(x=>x.amount>0).length}</strong></div>
    </div>
    <div class="review-block"><h3>Rate List Reference</h3>
      <div class="review-row"><span>PDF</span><strong>Page ${esc(d.agri.circlePage||'-')} • Row ${esc(d.agri.circleRow||'-')} • Column ${esc(d.circleRateColumn||'-')}</strong></div>
      <div class="review-row"><span>Reference</span><strong>${esc(d.rateRef||'-')}</strong></div>
    </div>`;
}

function renderAgricultureDeed(d){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;
  const section=(d.agri.circleSection||'भगवानपुर - अर्द्धनगरीय').replace(/\s*-\s*/g,' ');
  const currentStamp=Math.max(0,(Number(d.stampDuty)||0)-(Number(d.agri.agreementStampPaid)||0));
  const rateRs=circleAreaRateRupees(d);
  const landDesc=(d.agri.treeBoringStatus && d.agri.treeBoringStatus!=='नहीं') || d.agri.landCondition==='बाग है' ? 'कृषि भूमि (जिसमें पेड़/बोरिंग आदि हैं)' : 'कृषि भूमि (जिसमें कोई पेड़ बोरिंग आदि नहीं है)';
  const farmer=d.agri.buyerFarmerStatus==='notfarmer'?'12/09/2003 से पहले अचल सम्पत्ति है।':'क्रेता उत्तराखण्ड राज्य का कृषक/कृषक परिवार से है।';
  const holding=d.agri.buyerHoldingLimit==='above'?'क्रेता के पास इस खरीदी गयी भूमि सहित 12-1/2 एकड़ से अधिक भूमि है।':'क्रेता के पास इस खरीदी गयी भूमि सहित 12-1/2 एकड़ से अधिक भूमि नहीं है।';
  const sellerRemain=d.agri.sellerRemainingShare==='yes'?'विक्रेता का उक्त गाटा नम्बरान में अंश/हिस्सा शेष है।':'विक्रेता का उक्त गाटा नम्बरान में कोई अंश व हिस्सा शेष नहीं रहा है।';
  const possession=d.agri.possessionGiven==='no'?'विक्रित भूमि का कब्जा मौके पर दिया जाना शेष है।':'विक्रित भूमि पर मौके पर क्रेता का कब्जा करा दिया है';
  const mutate=d.agri.mutationSupport==='no'?'दाखिल खारिज में सहयोग सम्बन्धी विवरण पृथक होगा।':'विक्रेता क्रेता के नाम दाखिल खारिज होने में पूरा पूरा सहयोग करेगा।';
  const photoCert=d.agri.photoCertifier||`क्रेता व गवाहान के आधार पर ${d.advocate.name||'[एडवोकेट]'} एडवोकेट रुड़की`;
  const sellerParties=normalizePartyList(d.sellers,d.seller),buyerParties=normalizePartyList(d.buyers,d.buyer);
  const seller=partiesPersonLines(sellerParties,'विक्रेता'),buyer=partiesPersonLines(buyerParties,'क्रेता');
  const loc=locationFull(d);
  const rateLine=`रेट लिस्ट में पृष्ठ संख्या-${esc(d.agri.circlePage||'-')} क्रमांक-${esc(d.agri.circleRow||'-')} कालम संख्या-${esc(d.circleRateColumn||'4')} सर्किल रेट ${formatDeedMoney(rateRs)} प्रति हेक्टेयर ${roadDeedSentence(d)}`;
  const mainRoad=d.agri.mainRoadDistance||'[मुख्य सड़क से दूरी भरें]';
  const propNarr=groupedGataNarrative(d);
  const payments=paymentNarrative(d);
  const sellerFinger='<div class="finger-row"><span>अंगूठा</span><span>तर्जनी</span><span>मध्यमा</span><span>अनामिका</span><span>कनिष्ठिका</span></div>';
  const buyerFinger=sellerFinger;

  legal.innerHTML=`
  <div class="deed-document hindi-deed">
    <section class="deed-page deed-page-1">
      <h1>विक्रय- पत्र<span>(${esc(section)} क्षेत्र)</span></h1>
      <div class="deed-top-grid">
        <div>बैनामा- <b class="v red">${formatDeedMoney(d.transactionAmount)}</b></div>
        <div>बाजारी मालियत- <b class="v red">${formatDeedMoney(d.plotValue)}</b></div>
        <div>स्टाम्प शुल्क- <b class="v red">${formatDeedMoney(d.stampDuty)}</b></div>
        <div>इकरारनामे में अदा स्टाम्प शुल्क-<b>${d.agri.agreementStampPaid?formatDeedMoney(d.agri.agreementStampPaid):'शून्य'}</b></div>
        <div>वर्तमान में दिया गया स्टाम्प शुल्क- <b class="v red">${formatDeedMoney(currentStamp)}</b></div>
        <div>स्टाम्प शीटों की संख्या- <b>${d.agri.stampSheetCount||''}</b></div>
      </div>
      <p>विक्रित सम्पत्ति का कुल क्षेत्रफल- <b class="v red">${Number(d.agri.totalAreaHa||0).toFixed(4)} हेक्टेयर</b> <b>लगान ${laganText(d.agri.annualLagan)} सालाना</b></p>
      <p>विक्रित सम्पत्ति का विवरण- <b class="v green">${landDesc}</b></p>
      <p class="deed-small">कृषि/आवासीय/व्यवसायिक/औद्योगिक, और सम्पत्ति यदि भवन है तो निर्माण का वर्ष और निर्माण का प्रकार व एक मंजिली अथवा बहुमंजिली</p>
      <p>कवर्ड एरिया (यदि निर्माण है तो)- <b class="v green">${esc(d.agri.coveredAreaText||'नहीं')}</b></p>
      <p>स्थित ग्राम:- <b class="v green">${loc}।</b></p>
      <p class="deed-small">(मौजा या मौहल्ला, परगना, तहसील, नगरीय, अर्द्धनगरीय आदि)</p>
      <p>क्रेता तथा विक्रेता अनुसूचित जाति अथवा जनजाति से सम्बन्धित है अथवा नहीं:- <b class="v green">${esc(d.agri.scstRelated||'नहीं')}</b></p>
      <p>विक्रेता का स्वामित्व का आधार:- <b class="v green">${esc(d.agri.sellerOwnershipBasis||'द्वारा संक्रमणीय भूमिधर')}</b></p>
      <p>भूमि पट्टे आदि की है अथवा नहीं:- <b class="v green">${esc(d.agri.leaseLand||'नहीं')}</b></p>
      <p>चकबन्दी चल रही है अथवा नहीं:- <b class="v green">${esc(d.agri.consolidationStatus||'चल रही है')}।</b></p>
      <p>कृषि भूमि की स्थिति में:- <b class="v green">${esc(d.agri.landCondition||'सिंचित है')}।</b></p>
      <p class="deed-small">(बाग,सिंचित/असिंचित अथवा सर्किल दर सूची की श्रेणी के अनुसार सिंचित अथवा असिंचित)</p>
      <p><b class="v red">${rateLine}</b></p>
      <p>आवास विकास शुल्क के अन्दर है अथवा बाहर:- <b class="v green">${esc(d.agri.housingDevelopmentFee||'लागू नहीं')}।</b></p>
      <p>मुख्य सड़क से दूरी-<b class="v green">${esc(mainRoad)}।</b></p>
      <p>क्या क्रेता उत्तरांचल का कृषक है अथवा नहीं:-<b class="v green">${farmer}</b></p>
      <p>फोटो व अंगूठा चिन्ह प्रमाणित कर्ता:- <b class="v green">${esc(photoCert)}।</b></p>
      <p>विक्रेता/विक्रेताओं का नाम, पिता/पति का नाम व पता:-<b class="v green">${seller}</b></p>
    </section>

    <section class="deed-page deed-page-2">
      <div class="page2-bottom">
        <p>विदित हो कि प्रतिज्ञ (विक्रेता) निम्नलिखित सम्पत्ति के स्वामी व अधिकारी है जो इस समय तक हर प्रकार के भार तथा प्रतिबन्ध आदि से मुक्त है किसी प्रकार के हस्तान्तरण तथा बन्धक आदि नहीं है और कोई ऋण आदि महकमें बैंक सोसायटी आदि से या व्यक्तिगत रूप से निम्नलिखित</p>
      </div>
    </section>

    <section class="deed-page deed-page-3">
      <p>सम्पत्ति को बन्धक करके लिया हुआ नहीं है और निम्नलिखित सम्पत्ति को विक्रय व हस्तान्तरित करने में प्रतिज्ञ पूर्ण रूप सक्षम है अतः प्रतिज्ञ ने अपनी मनबुद्धि तथा इन्द्रियों की स्वस्थ दशा में बिना किसी जोर व दबाव के निम्नलिखित सम्पत्ति को बदले <b class="v red">${formatDeedMoney(d.transactionAmount)}</b> में <b class="v green">${buyer}</b> को विक्रय व हस्तान्तरित कर दी है तथा कुल मूल्य राशि की प्राप्ति का ब्यौरा निम्नलिखित है तत्पश्चात इसके कोई मूल्य राशि क्रेता के जिम्मे शेष नहीं रही है और न भविष्य में होगी कब्जा व दखल क्रेता महोदय का बखूबी मौके पर करा दिया है और अपना कब्जा हर प्रकार से हटा लिया है अब प्रतिज्ञ वचन देते और प्रतिज्ञा करते हैं कि क्रेता महोदय सदैव निम्नलिखित सम्पत्ति पर अपना समस्त अधिकार व स्वामित्व सहित कब्जा करके लाभ हर प्रकार का प्राप्त करें हर प्रकार से अपने भोग व प्रयोग में लावे और जो चाहे सो करें प्रतिज्ञ तथा उसके उत्तराधिकारी को विक्रय की हुई निम्नलिखित सम्पत्ति तथा उसकी मूल्य राशि से कोई सम्बन्ध किसी प्रकार का नहीं रहा है और न ही भविष्य में होगा यदि बाद में किसी नुक्स कानूनी के कारण या किसी वाद विवाद करने पर निम्न सम्पत्ति कुल या अंश कब्जा व दखल क्रेता उक्त निकल जाये तो क्रेता को अधिकार होगा कि वह अपनी कुल या अंश मूल्य राशि मुझ प्रतिज्ञ से या मेरी जात खास जायदाद से वसूल कर लेवे इसमें मुझ प्रतिज्ञ या उसके वारिसान को उज्र कोई नहीं होगा नीज प्रतिज्ञ उन जुमला कानूनी जिम्मेदारी जो कि बसूले एक प्रतिज्ञ पर आयद होता है, का पूरा पूरा पाबन्द व जिम्मेदार होगा व रहेगा।</p>
      <p class="center-clause">अतः यह विक्रय पत्र लिख दिया है कि प्रमाण रहे और समय पर काम आवे।</p>
    </section>

    <section class="deed-page deed-page-4">
      <p><b><u>विवरण सम्पत्ति जो विक्रय की गई है-</u></b> <b class="v green">कृषि भूमि संक्रमणीय भूमिधरी जोत ${esc(d.agri.landRecordBasis||'चकबन्दी आकार पत्र 23 भाग 1 के अनुसार')} ${propNarr} इस प्रकार कुल विक्रित रकबा ${Number(d.agri.totalAreaHa||0).toFixed(4)} हेक्टेयर लगान ${laganText(d.agri.annualLagan)} सालाना जिसकी सीमा, पूरब में ${esc(d.boundaries.east||'[पूरब]')}, पश्चिम में ${esc(d.boundaries.west||'[पश्चिम]')}, उत्तर में ${esc(d.boundaries.north||'[उत्तर]')}, दक्षिण में ${esc(d.boundaries.south||'[दक्षिण]')} स्थित ${loc}।</b></p>
      <p>${esc(possession)} तथा ${esc(mutate)} <span class="v purple">${esc(holding)} ${esc(sellerRemain)}</span> सम्पत्ति का अक्षांश <b class="v red">${esc(d.agri.latitude||'[अक्षांश]')}</b> है तथा सम्पत्ति का देशान्तर <b class="v red">${esc(d.agri.longitude||'[देशान्तर]')}</b> है। विक्रेता एवं क्रेता एक दूसरे से परिचित है तथा विक्रेता एवं क्रेता बताये एवं उपलब्ध कराये कागजात के अनुसार बैनामा ड्राफ्ट किया गया है।</p>
      <p><b><u>विवरण विक्रय धनराशि प्राप्ति-</u></b> विक्रेता ने क्रेता से कुल मूल्य राशि अंकन <b class="v red">${formatDeedMoney(d.transactionAmount)}</b> में से ${payments}, विक्रेता की कोई धनराशि क्रेता के जिम्मे शेष नहीं रही है।</p>
      ${partyFingerBlocks(sellerParties,'विक्रेता',sellerFinger)}
    </section>

    <section class="deed-page deed-page-5">
      ${partyFingerBlocks(buyerParties,'क्रेता',buyerFinger,'buyer-finger')}
      <div class="witness-lines">
        <p>साक्षी- <b>${esc(d.witness1.name||'[साक्षी 1]')}</b>${d.witness1.father?` ${esc('पुत्र')} ${esc(d.witness1.father)}`:''} निवासी ${esc(d.witness1.address||'[पता]')}</p>
        <p>साक्षी- <b>${esc(d.witness2.name||'[साक्षी 2]')}</b>${d.witness2.father?` ${esc('पुत्र')} ${esc(d.witness2.father)}`:''} निवासी ${esc(d.witness2.address||'[पता]')}</p>
      </div>
      <div class="deed-footer-lines">
        <p>तहरीर तारीख:-<b>${formatDateDeed(d.agri.executionDate)}</b></p>
        <p>ड्राफ्टिडबाई:- <b>${esc(d.advocate.name||'[एडवोकेट]')}</b> एडवोकेट ${esc(d.agri.advocateOffice||'कचहरी रुड़की, जिला हरिद्वार')}।</p>
      </div>
    </section>
  </div>`;
}

const _v08SyncDraftPreviewFinal=syncDraftPreview;
syncDraftPreview=function(){
  _v08SyncDraftPreviewFinal();
  if(isAgricultureMode()){
    const d=draftData();
    agriReviewSummary(d);
    renderAgricultureDeed(d);
  }
};

// Set execution date to today once, and keep agriculture UI hidden for other property types.
document.addEventListener('DOMContentLoaded',()=>{
  try{
    const ex=document.getElementById('executionDate');
    if(ex && !ex.value){const n=new Date(),p=x=>String(x).padStart(2,'0');ex.value=`${n.getFullYear()}-${p(n.getMonth()+1)}-${p(n.getDate())}`;}
    toggleAgriElements();
  }catch(e){console.warn('v0.9 init',e)}
});

/* ===== v1.0 Agriculture partial-sale + clean payment breakdown ===== */
let governmentValueManual=false;
let stampValueManual=false;

// Female ownership share is relevant only when Male + Female Buyer is selected.
const _v10SelectRebateTypeBase=selectRebateType;
selectRebateType=function(type,source){
  _v10SelectRebateTypeBase(type,source);
  const mixed=document.getElementById('mixedShareWrap');
  if(mixed){
    const show=selectedRebateType==='mixed';
    mixed.hidden=!show;
    mixed.setAttribute('aria-hidden',show?'false':'true');
  }
};

function onGovernmentValueEdited(){
  const el=document.getElementById('stampGovValue');
  governmentValueManual=!!(el && String(el.value).trim()!=='');
  recalculateStampDuty();syncDraftPreview();
}
function onStampValueEdited(){
  const el=document.getElementById('stampPayable');
  stampValueManual=!!(el && String(el.value).trim()!=='');
  recalculateStampDuty();syncDraftPreview();
}

// Use editable Government Value for the higher-value rule; Stamp Value can also be manually overridden.
stampDutyDetails=function(){
  const c=recalculate();
  const txn=numv('transactionAmount');
  const govInput=document.getElementById('stampGovValue');
  const autoGovernment=Math.max(0,Number(c.plot)||0);
  const governmentValue=governmentValueManual && govInput ? Math.max(0,parseFloat(govInput.value)||0) : autoGovernment;
  const applicable=Math.max(governmentValue,txn||0);
  const use=rebateUseCount();
  let calculatedPayable=applicable*0.05;
  let rateLabel='5%';
  let breakdown='No Rebate: 5% on applicable value.';

  if((selectedRebateType==='female' || selectedRebateType==='army') && use<=2){
    const duty=concessionDuty(applicable);
    calculatedPayable=duty.duty;
    rateLabel='3.75% up to ₹25L + 5%';
    const who=selectedRebateType==='female'?'Female Buyer':'Army Buyer';
    breakdown=`${who} • ${use===1?'First':'Second'} concession: ${inr(duty.concessional)} @ 3.75%${duty.normal>0?' + '+inr(duty.normal)+' @ 5%':''}.`;
  }else if(selectedRebateType==='mixed' && use<=2){
    const shares=updateMixedShare();
    const femaleAmount=applicable*(shares.female/100);
    const maleAmount=applicable-femaleAmount;
    const fd=concessionDuty(femaleAmount);
    calculatedPayable=(maleAmount*0.05)+fd.duty;
    rateLabel='Male 5% + Female 3.75%/5%';
    breakdown=`Male ${shares.male.toFixed(Number.isInteger(shares.male)?0:2)}%: ${inr(maleAmount)} @ 5%. Female ${shares.female.toFixed(Number.isInteger(shares.female)?0:2)}%: ${inr(fd.concessional)} @ 3.75%${fd.normal>0?' + '+inr(fd.normal)+' @ 5%':''}.`;
  }

  const stampInput=document.getElementById('stampPayable');
  const payable=stampValueManual && stampInput ? Math.max(0,parseFloat(stampInput.value)||0) : calculatedPayable;
  if(stampValueManual) breakdown+=` Manual Stamp Value: ${inr(payable)} (Auto calculation ${inr(calculatedPayable)}).`;
  return {c,txn,governmentValue,autoGovernment,applicable,payable,calculatedPayable,rateLabel,breakdown,use,rebateType:selectedRebateType};
};

recalculateStampDuty=function(){
  const s=stampDutyDetails();
  const gov=document.getElementById('stampGovValue');
  if(gov && !governmentValueManual) gov.value=String(Math.round(s.autoGovernment||0));
  const govHint=document.getElementById('stampGovAutoHint');
  if(govHint)govHint.textContent=`Auto: ${inr(s.autoGovernment||0)} • field खाली करें = Auto`;
  const txn=document.getElementById('stampTxnValue');if(txn)txn.textContent=inr(s.txn);
  const applicable=document.getElementById('stampApplicable');if(applicable)applicable.textContent=inr(s.applicable);
  const rate=document.getElementById('stampRate');if(rate)rate.textContent=s.rateLabel;
  const payable=document.getElementById('stampPayable');
  if(payable && !stampValueManual)payable.value=String(Math.round(s.calculatedPayable||0));
  const payHint=document.getElementById('stampPayableAutoHint');
  if(payHint)payHint.textContent=`Auto: ${inr(s.calculatedPayable||0)} • field खाली करें = Auto`;
  const detail=document.getElementById('stampRuleBreakdown');if(detail)detail.textContent=s.breakdown;
  updatePaymentTotal();
  return s;
};

// Agriculture table: Chak + Khasra + total holding area + area being sold from it.
addAgriGataRow=function(data={}){
  const body=document.getElementById('agriGataRows');if(!body)return;
  agriGataCounter++;
  const oldArea=Number(data.area)||0;
  const totalArea=Number(data.totalArea ?? data.total ?? oldArea)||0;
  const soldArea=Number(data.soldArea ?? data.saleArea ?? oldArea)||0;
  const tr=document.createElement('tr');
  tr.innerHTML=`<td class="gata-index"></td>
    <td><input class="gata-chak" value="${esc(data.chak||'')}" placeholder="चक सं." oninput="syncDraftPreview()"></td>
    <td><input class="gata-number" value="${esc(data.gata||'')}" placeholder="खसरा / गाटा" oninput="syncDraftPreview()"></td>
    <td><input class="gata-total-area" type="number" min="0" step="0.0001" value="${totalArea||''}" placeholder="0.1115" oninput="validateAgriGataRow(this);syncDraftPreview()"></td>
    <td><input class="gata-sold-area" type="number" min="0" step="0.0001" value="${soldArea||''}" placeholder="0.0500" oninput="validateAgriGataRow(this);updateAgriAreaFromRows();syncDraftPreview()"></td>
    <td><button type="button" class="del-row" onclick="deleteAgriGataRow(this)">✕</button></td>`;
  body.appendChild(tr);
  renumberAgriGataRows();
  validateAgriGataRow(tr.querySelector('.gata-sold-area'));
  updateAgriAreaFromRows();
};

function validateAgriGataRow(source){
  const tr=source?.closest?.('tr');if(!tr)return true;
  const totalEl=tr.querySelector('.gata-total-area');
  const soldEl=tr.querySelector('.gata-sold-area');
  const total=parseFloat(totalEl?.value||'0')||0;
  const sold=parseFloat(soldEl?.value||'0')||0;
  const invalid=total>0 && sold>total;
  if(soldEl)soldEl.setCustomValidity(invalid?'विक्रित रकबा कुल रकबा से अधिक नहीं हो सकता।':'');
  if(totalEl)totalEl.setCustomValidity(invalid?'कुल रकबा विक्रित रकबे से कम है।':'');
  return !invalid;
}

collectAgriGataRows=function(){
  return [...document.querySelectorAll('#agriGataRows tr')].map(tr=>{
    const totalArea=parseFloat(tr.querySelector('.gata-total-area')?.value||'0')||0;
    const soldArea=parseFloat(tr.querySelector('.gata-sold-area')?.value||'0')||0;
    return {
      chak:(tr.querySelector('.gata-chak')?.value||'').trim(),
      gata:(tr.querySelector('.gata-number')?.value||'').trim(),
      totalArea,
      soldArea,
      area:soldArea // backward-compatible field used by earlier v0.9 logic
    };
  }).filter(x=>x.chak||x.gata||x.totalArea>0||x.soldArea>0);
};

gataAreaTotal=function(){return collectAgriGataRows().reduce((a,x)=>a+(Number(x.soldArea)||0),0);};

groupedGataNarrative=function(d){
  const rows=d.agri.gataRows||[];
  if(!rows.length)return `खसरा विवरण अनुसार कुल विक्रित रकबा ${Number(d.agri.totalAreaHa||0).toFixed(4)} हेक्टेयर`;
  const groups=[];
  rows.forEach(r=>{
    let g=groups.find(x=>x.chak===(r.chak||''));
    if(!g){g={chak:r.chak||'[चक]',rows:[]};groups.push(g);}g.rows.push(r);
  });
  return groups.map(g=>{
    const soldSum=g.rows.reduce((a,r)=>a+(Number(r.soldArea ?? r.area)||0),0);
    const bits=g.rows.map((r,i)=>{
      const total=Number(r.totalArea ?? r.area)||0;
      const sold=Number(r.soldArea ?? r.area)||0;
      return `${i?'व ':''}खसरा/गाटा सं0 ${esc(r.gata||'[खसरा]')} कुल रकबा ${total.toFixed(4)} हे0 में से विक्रित रकबा ${sold.toFixed(4)} हे0`;
    }).join(' ');
    return `चक सं0 ${esc(g.chak)} के प्रस्तावित ${bits}${g.rows.length>1?` कुल विक्रित रकबा ${soldSum.toFixed(4)} हेक्टेयर`:''}`;
  }).join(' व ');
};

const V10_BANKS=[
  ['','Select Bank'],['PNB','Punjab National Bank (PNB)'],['SBI','State Bank of India (SBI)'],
  ['HDFC Bank','HDFC Bank'],['ICICI Bank','ICICI Bank'],['Axis Bank','Axis Bank'],
  ['Bank of Baroda','Bank of Baroda'],['Canara Bank','Canara Bank'],['Union Bank of India','Union Bank of India'],
  ['Bank of India','Bank of India'],['Indian Bank','Indian Bank'],['Central Bank of India','Central Bank of India'],
  ['Kotak Mahindra Bank','Kotak Mahindra Bank'],['IDBI Bank','IDBI Bank'],['YES Bank','YES Bank'],['OTHER','Other Bank']
];
function bankOptionsHtml(){return V10_BANKS.map(([v,l])=>`<option value="${esc(v)}">${esc(l)}</option>`).join('');}

addPaymentRow=function(data={}){
  const body=document.getElementById('paymentRows');if(!body)return;
  paymentRowCounter++;
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${paymentRowCounter}</td>
    <td><select class="pay-mode" onchange="onPaymentModeChanged(this);updatePaymentTotal();syncDraftPreview()">
      <option>Cash / नकद</option><option>Cheque</option><option>RTGS</option><option>NEFT</option><option>Bank Transfer</option><option>UPI</option><option>Other</option>
    </select></td>
    <td><input class="pay-amount" type="number" min="0" oninput="updatePaymentTotal();syncDraftPreview()" placeholder="0"></td>
    <td><div class="pay-field-label">Reference No.</div><input class="pay-ref" placeholder="Reference No." oninput="syncDraftPreview()"></td>
    <td><select class="pay-bank" onchange="onPaymentBankChanged(this);syncDraftPreview()">${bankOptionsHtml()}</select><input class="pay-bank-other" placeholder="Bank name" hidden oninput="syncDraftPreview()"></td>
    <td><input class="pay-branch" placeholder="Branch" oninput="syncDraftPreview()"></td>
    <td><input class="pay-date" type="date" onchange="syncDraftPreview()"></td>
    <td><button class="del-row" onclick="deletePaymentRow(this);syncDraftPreview()">✕</button></td>`;
  body.appendChild(tr);
  tr.querySelector('.pay-mode').value=data.mode||'Cash / नकद';
  tr.querySelector('.pay-amount').value=data.amount||'';
  tr.querySelector('.pay-ref').value=data.ref||'';
  tr.querySelector('.pay-date').value=data.date||'';
  const bankSel=tr.querySelector('.pay-bank');
  const known=V10_BANKS.some(([v])=>v && v===data.bank);
  if(data.bank){bankSel.value=known?data.bank:'OTHER';if(!known)tr.querySelector('.pay-bank-other').value=data.bank;}
  tr.querySelector('.pay-branch').value=data.branch||'';
  onPaymentBankChanged(bankSel);
  onPaymentModeChanged(tr.querySelector('.pay-mode'));
  updatePaymentTotal();
};

function onPaymentBankChanged(select){
  const tr=select?.closest('tr');if(!tr)return;
  const other=tr.querySelector('.pay-bank-other');
  if(other)other.hidden=(select.value!=='OTHER');
}
function onPaymentModeChanged(select){
  const tr=select?.closest('tr');if(!tr)return;
  const mode=String(select.value||'');
  const label=tr.querySelector('.pay-field-label');
  const ref=tr.querySelector('.pay-ref');
  const bank=tr.querySelector('.pay-bank');
  const bankOther=tr.querySelector('.pay-bank-other');
  const branch=tr.querySelector('.pay-branch');
  let refLabel='Reference No.';
  if(mode.includes('Cheque'))refLabel='Cheque No.';
  else if(mode.includes('RTGS'))refLabel='RTGS No.';
  else if(mode.includes('Bank Transfer'))refLabel='Transaction / UTR No.';
  else if(mode.includes('UPI'))refLabel='UPI / Transaction ID';
  else if(mode.includes('Cash'))refLabel='Not required';
  if(label)label.textContent=refLabel;
  if(ref){ref.placeholder=refLabel;ref.disabled=mode.includes('Cash');if(ref.disabled)ref.value='';}
  const needsBank=!mode.includes('Cash');
  if(bank)bank.disabled=!needsBank;
  if(branch){branch.disabled=!needsBank;if(!needsBank)branch.value='';}
  if(bankOther){
    if(!needsBank){bankOther.hidden=true;bankOther.value='';}
    else onPaymentBankChanged(bank);
  }
}

collectPaymentRows=function(){
  return [...document.querySelectorAll('#paymentRows tr')].map(tr=>{
    const bankSel=tr.querySelector('.pay-bank');
    const bank=bankSel?.value==='OTHER'?(tr.querySelector('.pay-bank-other')?.value||''):(bankSel?.value||'');
    return {
      mode:tr.querySelector('.pay-mode')?.value||'',
      amount:parseFloat(tr.querySelector('.pay-amount')?.value||'0')||0,
      ref:(tr.querySelector('.pay-ref')?.value||'').trim(),
      bank:String(bank||'').trim(),
      branch:(tr.querySelector('.pay-branch')?.value||'').trim(),
      date:tr.querySelector('.pay-date')?.value||''
    };
  });
};

paymentNarrative=function(d){
  const rows=(d.payments||[]).filter(x=>Number(x.amount)>0);
  const parts=rows.map(x=>{
    const mode=String(x.mode||'');
    const amount=`अंकन ${formatDeedMoney(x.amount)}`;
    const dt=x.date?` दिनांक ${formatDateDeed(x.date)}`:'';
    const bank=x.bank?` बैंक ${esc(x.bank)}`:'';
    const branch=x.branch?` शाखा ${esc(x.branch)}`:'';
    if(mode.includes('Cheque'))return `${amount} द्वारा चेक संख्या ${esc(x.ref||'[चेक संख्या]')}${dt}${bank}${branch} से प्राप्त कर लिये हैं`;
    if(mode.includes('RTGS'))return `${amount} द्वारा RTGS No. ${esc(x.ref||'[RTGS No.]')}${dt}${bank}${branch} से प्राप्त कर लिये हैं`;
    if(mode.includes('Bank Transfer'))return `${amount} द्वारा बैंक ट्रांसफर संदर्भ संख्या ${esc(x.ref||'[संदर्भ संख्या]')}${dt}${bank}${branch} से प्राप्त कर लिये हैं`;
    if(mode.includes('UPI'))return `${amount} द्वारा यू०पी०आई०/ट्रांजैक्शन संख्या ${esc(x.ref||'[ट्रांजैक्शन संख्या]')}${dt}${bank}${branch} से प्राप्त कर लिये हैं`;
    if(mode.includes('Cash'))return `${amount} नकद${dt} प्राप्त कर लिये हैं`;
    return `${amount} द्वारा अन्य माध्यम${x.ref?` संदर्भ संख्या ${esc(x.ref)}`:''}${dt}${bank}${branch} से प्राप्त कर लिये हैं`;
  });
  if(!parts.length)return 'कुल मूल्य राशि की प्राप्ति विक्रेता द्वारा स्वीकार की गयी है';
  return parts.join(' व ');
};

// Final data layer: no agriculture advance; deed uses editable government value and editable stamp value.
const _v10DraftDataBase=draftData;
draftData=function(){
  const d=_v10DraftDataBase();
  const s=stampDutyDetails();
  d.calculatedPlotValue=Number(s.c.plot)||0;
  d.governmentValue=Number(s.governmentValue)||0;
  d.plotValue=d.governmentValue;
  d.autoStampDuty=Number(s.calculatedPayable)||0;
  d.stampDuty=Number(s.payable)||0;
  d.governmentValueManual=governmentValueManual;
  d.stampValueManual=stampValueManual;
  d.payments=collectPaymentRows();
  if(isAgricultureMode())d.advanceAmount=0;
  return d;
};

// Keep mode-specific UI and editable values initialized after all v1.0 overrides are loaded.
document.addEventListener('DOMContentLoaded',()=>{
  try{
    document.querySelectorAll('#paymentRows .pay-mode').forEach(onPaymentModeChanged);
    const mixed=document.getElementById('mixedShareWrap');if(mixed)mixed.hidden=selectedRebateType!=='mixed';
    recalculateStampDuty();
  }catch(e){console.warn('v1.0 init',e)}
});


/* ===== v1.1 Multiple Seller / Buyer Parties ===== */
let multiPartyCounter={seller:1,buyer:1};

function normalizePartyList(list,primary){
  const arr=Array.isArray(list)?list.filter(Boolean):[];
  if(arr.length)return arr;
  return primary?[primary]:[];
}
function partyNamesForReview(list,primary){
  const arr=normalizePartyList(list,primary);
  if(!arr.length)return '-';
  return arr.map((p,i)=>`${arr.length>1?`${i+1}. `:''}${esc(p.name||'-')}`).join('<br>');
}
function partiesPersonLines(list,label){
  const arr=normalizePartyList(list,null);
  if(!arr.length)return '[नाम / पता]';
  return arr.map((p,i)=>`${arr.length>1?`${esc(label)} ${i+1} — `:''}${personLine(p)}`).join('<br>');
}
function partyFingerBlocks(list,label,fingerHtml,extraClass=''){
  const arr=normalizePartyList(list,null);
  const safe=arr.length?arr:[{name:''}];
  return safe.map((p,i)=>`<div class="finger-block ${extraClass}"><b>${esc(label)}${safe.length>1?` ${i+1}`:''}${p.name?` (${esc(p.name)})`:''} के बायें हाथ की अंगुलियों के निशान:-</b>${fingerHtml}<div class="finger-space"></div>${fingerHtml}</div>`).join('');
}
function readExtraPartyCard(card){
  const get=f=>(card.querySelector(`[data-party-field="${f}"]`)?.value||'').trim();
  return {name:get('name'),father:get('father'),relation:get('relation')||'पुत्र',address:get('address'),pan:get('pan'),aadhaar:get('aadhaar'),email:get('email'),mobile:get('mobile')};
}
function collectParties(type,primary){
  const panel=document.getElementById(type+'Party');
  const extras=panel?[...panel.querySelectorAll(`.additional-party-card[data-party-type="${type}"]`)].map(readExtraPartyCard):[];
  const arr=[primary,...extras].filter(p=>p && (p.name||p.father||p.address||p.pan||p.aadhaar||p.email||p.mobile));
  return arr.length?arr:[primary];
}
function renumberPartyCards(type){
  const panel=document.getElementById(type+'Party');if(!panel)return;
  const primaryTitle=panel.querySelector('.form-card:not(.additional-party-card) h2');
  const label=type==='seller'?'Seller':'Buyer';
  if(primaryTitle)primaryTitle.textContent=`${label} 1 Details`;
  const cards=[...panel.querySelectorAll(`.additional-party-card[data-party-type="${type}"]`)];
  cards.forEach((card,i)=>{
    const h=card.querySelector('.multi-party-heading');if(h)h.textContent=`${label} ${i+2} Details`;
  });
  multiPartyCounter[type]=cards.length+1;
  const count=document.getElementById(type+'PartyCount');if(count)count.textContent=`Total ${label}${cards.length?'s':''}: ${cards.length+1}`;
}
function addParty(type,data={}){
  if(type!=='seller' && type!=='buyer')return;
  const panel=document.getElementById(type+'Party');if(!panel)return;
  const label=type==='seller'?'Seller':'Buyer';
  const card=document.createElement('div');
  card.className='form-card additional-party-card';
  card.dataset.partyType=type;
  card.innerHTML=`
    <div class="party-card-title multi-party-title">
      <h2 class="multi-party-heading">${label} Details</h2>
      <button type="button" class="remove-party-btn" onclick="removeParty(this)">✕ Remove ${label}</button>
    </div>
    <div class="form-grid two">
      <div><label>Full Name <span class="req">*</span></label><input data-party-field="name" value="${esc(data.name||'')}" oninput="syncDraftPreview()"></div>
      <div><label>Father's / Husband's Name <span class="req">*</span></label><input data-party-field="father" value="${esc(data.father||'')}" oninput="syncDraftPreview()"></div>
      <div><label>Relation</label><select data-party-field="relation" onchange="syncDraftPreview()"><option>पुत्र</option><option>पुत्री</option><option>पत्नी</option><option>पति</option></select></div>
      <div class="full"><label>Address <span class="req">*</span></label><input data-party-field="address" value="${esc(data.address||'')}" oninput="syncDraftPreview()"></div>
      <div><label>PAN Number</label><input data-party-field="pan" value="${esc(data.pan||'')}" oninput="syncDraftPreview()"></div>
      <div><label>Aadhaar Card</label><input data-party-field="aadhaar" value="${esc(data.aadhaar||'')}" oninput="syncDraftPreview()"></div>
      <div><label>Email ID</label><input data-party-field="email" type="email" value="${esc(data.email||'')}" oninput="syncDraftPreview()"></div>
      <div><label>Mobile Number <span class="req">*</span></label><input data-party-field="mobile" value="${esc(data.mobile||'')}" oninput="syncDraftPreview()"></div>
    </div>
    <div class="verified-row"><span>Mobile Verification</span><b>OTP Verification will be connected with Firebase</b></div>
    <h3 class="subheading">Biometric / Fingerprint (${label})</h3>
    <div class="finger-grid">
      <div class="hand-label">Right Hand</div>
      <button type="button" class="finger" onclick="toggleFinger(this)">Thumb <span>◉</span></button>
      <button type="button" class="finger" onclick="toggleFinger(this)">Index <span>◉</span></button>
      <button type="button" class="finger" onclick="toggleFinger(this)">Middle <span>◉</span></button>
      <button type="button" class="finger" onclick="toggleFinger(this)">Ring <span>◉</span></button>
      <button type="button" class="finger" onclick="toggleFinger(this)">Little <span>◉</span></button>
      <div class="hand-label">Left Hand</div>
      <button type="button" class="finger" onclick="toggleFinger(this)">Thumb <span>◉</span></button>
      <button type="button" class="finger" onclick="toggleFinger(this)">Index <span>◉</span></button>
      <button type="button" class="finger" onclick="toggleFinger(this)">Middle <span>◉</span></button>
      <button type="button" class="finger" onclick="toggleFinger(this)">Ring <span>◉</span></button>
      <button type="button" class="finger" onclick="toggleFinger(this)">Little <span>◉</span></button>
    </div>`;
  panel.appendChild(card);
  const rel=card.querySelector('[data-party-field="relation"]');if(rel)rel.value=data.relation||'पुत्र';
  renumberPartyCards(type);
  syncDraftPreview();
  card.scrollIntoView({behavior:'smooth',block:'center'});
}
function removeParty(btn){
  const card=btn?.closest?.('.additional-party-card');if(!card)return;
  const type=card.dataset.partyType;
  card.remove();
  renumberPartyCards(type);
  syncDraftPreview();
}
function ensureMultiPartyUI(){
  ['seller','buyer'].forEach(type=>{
    const panel=document.getElementById(type+'Party');if(!panel || panel.querySelector('.add-party-bar'))return;
    const label=type==='seller'?'Seller':'Buyer';
    const bar=document.createElement('div');
    bar.className='add-party-bar';
    bar.innerHTML=`<span id="${type}PartyCount">Total ${label}: 1</span><button type="button" class="btn add-party-btn" onclick="addParty('${type}')">＋ Add ${label}</button>`;
    const firstCard=panel.querySelector('.form-card');
    if(firstCard)firstCard.insertAdjacentElement('afterend',bar);else panel.appendChild(bar);
    renumberPartyCards(type);
  });
}

const _v11DraftDataBase=draftData;
draftData=function(){
  const d=_v11DraftDataBase();
  d.sellers=collectParties('seller',d.seller);
  d.buyers=collectParties('buyer',d.buyer);
  // Keep single-party fields for old saved drafts / older code paths.
  d.seller=d.sellers[0]||d.seller;
  d.buyer=d.buyers[0]||d.buyer;
  return d;
};

// Add all parties to the standard (non-agriculture) preview too.
const _v11SyncDraftPreviewBase=syncDraftPreview;
syncDraftPreview=function(){
  _v11SyncDraftPreviewBase();
  if(isAgricultureMode())return;
  const d=draftData();
  const summary=document.getElementById('reviewSummary');
  if(summary){
    const partyBlock=summary.querySelector('.review-block:nth-child(2)');
    if(partyBlock)partyBlock.innerHTML=`<h3>Parties</h3><div class="review-row"><span>Seller(s)</span><strong>${partyNamesForReview(d.sellers,d.seller)}</strong></div><div class="review-row"><span>Buyer(s)</span><strong>${partyNamesForReview(d.buyers,d.buyer)}</strong></div>`;
  }
  const legal=document.getElementById('legalDraftPreview');
  if(legal){
    const sellerNames=normalizePartyList(d.sellers,d.seller).map(p=>p.name||'[Seller Name]').join(', ');
    const buyerNames=normalizePartyList(d.buyers,d.buyer).map(p=>p.name||'[Buyer Name]').join(', ');
    const first=legal.querySelector('p');
    if(first)first.innerHTML=`This draft is prepared for transfer of the property described below by <strong>${esc(sellerNames)}</strong> (Seller${d.sellers.length>1?'s':''}) in favour of <strong>${esc(buyerNames)}</strong> (Buyer${d.buyers.length>1?'s':''}).`;
  }
};

document.addEventListener('DOMContentLoaded',()=>{
  try{ ensureMultiPartyUI(); }catch(e){console.warn('v1.1 multi-party init',e)}
});

/* ===== v1.2 Agriculture Valuation + Party Navigation + Biometric Notes ===== */
let selectedPartyHomeType='';

function openPartiesHome(){
  selectedPartyHomeType='';
  document.querySelectorAll('.party-home-card').forEach(x=>x.classList.remove('selected'));
  const btn=document.getElementById('openSelectedPartyBtn');if(btn)btn.disabled=true;
  showView('partiesView');
}
function selectPartyHomeCard(card){
  document.querySelectorAll('.party-home-card').forEach(x=>x.classList.remove('selected'));
  if(card){card.classList.add('selected');selectedPartyHomeType=card.dataset.partyOpen||'';}
  const btn=document.getElementById('openSelectedPartyBtn');if(btn)btn.disabled=!selectedPartyHomeType;
}
function openSelectedPartyHome(){if(selectedPartyHomeType)openPartyDetails(selectedPartyHomeType);}
function openPartyDetails(type){
  if(type!=='seller' && type!=='buyer')return;
  showView('registryView');
  const typeScreen=document.getElementById('draftTypeScreen');
  const steps=document.getElementById('draftStepsScreen');
  if(typeScreen)typeScreen.classList.remove('active');
  if(steps)steps.classList.add('active');
  goDraftStep(2);
  const tab=document.querySelector(`.party-tab[data-party="${type}"]`);
  showPartyTab(type,tab);
  ensureMultiPartyUI();
  setTimeout(()=>document.getElementById(type+'Party')?.scrollIntoView({behavior:'smooth',block:'start'}),30);
}

function addAgriTreeRow(kind,data={}){
  const body=document.getElementById(kind==='orchard'?'orchardTreeRows':'treeBoringTreeRows');if(!body)return;
  const tr=document.createElement('tr');
  tr.innerHTML=`<td><input class="tree-name" value="${esc(data.name||'')}" placeholder="आम / Poplar" oninput="onAgriEnhancementChanged()"></td>
    <td><input class="tree-qty" type="number" min="0" step="1" value="${Number(data.qty)||''}" placeholder="0" oninput="onAgriEnhancementChanged()"></td>
    <td><input class="tree-age" value="${esc(data.age||'')}" placeholder="उदा. 8 वर्ष" oninput="syncDraftPreview()"></td>
    <td><input class="tree-value" type="number" min="0" step="1" value="${Number(data.value)||''}" placeholder="0" oninput="onAgriEnhancementChanged()"></td>
    <td><button type="button" class="del-row" onclick="deleteAgriTreeRow(this)">✕</button></td>`;
  body.appendChild(tr);
}
function deleteAgriTreeRow(btn){
  btn?.closest?.('tr')?.remove();
  onAgriEnhancementChanged();
}
function collectAgriTreeRows(kind){
  const body=document.getElementById(kind==='orchard'?'orchardTreeRows':'treeBoringTreeRows');
  if(!body)return [];
  return [...body.querySelectorAll('tr')].map(tr=>({
    name:(tr.querySelector('.tree-name')?.value||'').trim(),
    qty:parseFloat(tr.querySelector('.tree-qty')?.value||'0')||0,
    age:(tr.querySelector('.tree-age')?.value||'').trim(),
    value:parseFloat(tr.querySelector('.tree-value')?.value||'0')||0
  })).filter(x=>x.name||x.qty||x.age||x.value);
}
function treeRowsValue(rows){return (rows||[]).reduce((a,x)=>a+(Number(x.value)||0),0);}

function onAgriLandConditionChanged(){
  const show=val('agriLandCondition')==='बाग है';
  const panel=document.getElementById('orchardTreePanel');if(panel)panel.hidden=!show;
  const body=document.getElementById('orchardTreeRows');if(show && body && !body.children.length)addAgriTreeRow('orchard');
  onAgriEnhancementChanged();
}
function onTreeBoringStatusChanged(){
  const status=val('treeBoringStatus');
  const panel=document.getElementById('treeBoringDetailPanel');
  const boring=document.getElementById('boringFixedBox');
  const trees=document.getElementById('treeBoringTreeWrap');
  const hasTree=status.includes('पेड़');
  const hasBoring=status.includes('बोरिंग');
  if(panel)panel.hidden=!(hasTree||hasBoring);
  if(boring)boring.hidden=!hasBoring;
  if(trees)trees.hidden=!hasTree;
  const body=document.getElementById('treeBoringTreeRows');if(hasTree && body && !body.children.length)addAgriTreeRow('treeBoring');
  onAgriEnhancementChanged();
}
function onCoveredAreaStatusChanged(){
  const show=val('coveredAreaStatus')==='हाँ';
  const panel=document.getElementById('coveredAreaPanel');if(panel)panel.hidden=!show;
  onAgriEnhancementChanged();
}

function onBoundaryWallStatusChanged(){
  const show=val('boundaryWallStatus')==='हाँ';
  const count=document.getElementById('boundarySideCountWrap');if(count)count.hidden=!show;
  const details=document.getElementById('boundaryWallDetails');if(details)details.hidden=!show;
  if(show)renderBoundarySideInputs();
  onAgriEnhancementChanged();
}
function collectBoundarySides(){
  return [...document.querySelectorAll('#boundarySideInputs .boundary-side-row')].map(row=>({
    direction:row.querySelector('.boundary-direction')?.value||'',
    length:parseFloat(row.querySelector('.boundary-length')?.value||'0')||0
  }));
}
function renderBoundarySideInputs(){
  const wrap=document.getElementById('boundarySideInputs');if(!wrap)return;
  const old=collectBoundarySides();
  const count=Math.min(4,Math.max(1,parseInt(val('boundarySideCount')||'1',10)||1));
  const dirs=['East / पूरब','West / पश्चिम','North / उत्तर','South / दक्षिण'];
  wrap.innerHTML=Array.from({length:count},(_,i)=>{
    const d=old[i]?.direction||dirs[i]||`Side ${i+1}`;
    const len=old[i]?.length||'';
    const opts=dirs.map(x=>`<option${x===d?' selected':''}>${x}</option>`).join('');
    return `<div class="boundary-side-row"><label>Side ${i+1}</label><select class="boundary-direction" onchange="syncDraftPreview()">${opts}</select><div class="input-unit"><input class="boundary-length" type="number" min="0" step="0.01" value="${len}" placeholder="Length" oninput="onAgriEnhancementChanged()"><span>m</span></div></div>`;
  }).join('');
  onAgriEnhancementChanged();
}

function agriEnhancementValue(){
  const boundaryEnabled=val('boundaryWallStatus')==='हाँ';
  const boundarySides=boundaryEnabled?collectBoundarySides():[];
  const runningMeter=boundarySides.reduce((a,x)=>a+(Number(x.length)||0),0);
  const boundaryRate=1500;
  const boundaryValue=runningMeter*boundaryRate;

  const orchardRows=val('agriLandCondition')==='बाग है'?collectAgriTreeRows('orchard'):[];
  const orchardValue=treeRowsValue(orchardRows);
  const treeStatus=val('treeBoringStatus');
  const treeRows=treeStatus.includes('पेड़')?collectAgriTreeRows('treeBoring'):[];
  const treeValue=treeRowsValue(treeRows);
  const boringValue=treeStatus.includes('बोरिंग')?25000:0;
  const coveredAreaM2=val('coveredAreaStatus')==='हाँ'?numv('coveredAreaM2'):0;
  const coveredRate=14000;
  const coveredValue=coveredAreaM2*coveredRate;
  const total=boundaryValue+orchardValue+treeValue+boringValue+coveredValue;
  return {boundaryEnabled,boundarySides,runningMeter,boundaryRate,boundaryValue,orchardRows,orchardValue,treeRows,treeValue,boringValue,coveredAreaM2,coveredRate,coveredValue,total};
}
function updateAgriEnhancementUI(landValue){
  const a=agriEnhancementValue();
  const rm=document.getElementById('boundaryRunningMeter');if(rm)rm.textContent=a.runningMeter.toFixed(2)+' m';
  const bw=document.getElementById('boundaryWallValue');if(bw)bw.textContent=inr(a.boundaryValue);
  const cv=document.getElementById('coveredAreaValue');if(cv)cv.value=inr(a.coveredValue);
  const land=document.getElementById('agriLandValue');if(land)land.textContent=inr(landValue||0);
  const imp=document.getElementById('agriImprovementValue');if(imp)imp.textContent=inr(a.total);
  const gov=document.getElementById('agriGovernmentValue');if(gov)gov.textContent=inr((Number(landValue)||0)+a.total);
  return a;
}
function onAgriEnhancementChanged(){
  try{recalculateStampDuty();syncDraftPreview();}catch(e){console.warn('v1.2 agri valuation',e)}
}

const _v12RecalculateBase=recalculate;
recalculate=function(){
  const c=_v12RecalculateBase();
  if(isAgricultureMode()){
    const landValue=Number(c.plot)||0;
    const a=updateAgriEnhancementUI(landValue);
    c.landValue=landValue;
    c.improvementValue=a.total;
    c.plot=landValue+a.total;
    const vo=document.getElementById('valueOut');if(vo)vo.textContent=inr(c.plot);
    const pv=document.getElementById('plotValueDisplay');if(pv)pv.value=inr(c.plot);
  }
  return c;
};

function updateBiometricNoteVisibility(scope){
  const root=scope?.closest?.('.form-card')||scope;
  if(!root)return;
  const fingers=[...root.querySelectorAll('.finger')];
  const wrap=root.querySelector('.biometric-note-wrap');
  if(!fingers.length || !wrap)return;
  const captured=fingers.filter(x=>x.classList.contains('captured')).length;
  // Do not show note before biometric work starts. Show it when some, but not all, fingers are captured.
  wrap.hidden=!(captured>0 && captured<fingers.length);
}
const _v12ToggleFingerBase=toggleFinger;
toggleFinger=function(btn){
  _v12ToggleFingerBase(btn);
  updateBiometricNoteVisibility(btn);
  syncDraftPreview();
};

readExtraPartyCard=function(card){
  const get=f=>(card.querySelector(`[data-party-field="${f}"]`)?.value||'').trim();
  return {name:get('name'),father:get('father'),relation:get('relation')||'पुत्र',address:get('address'),pan:get('pan'),aadhaar:get('aadhaar'),email:get('email'),mobile:get('mobile'),biometricNote:get('biometricNote')};
};

const _v12AddPartyBase=addParty;
addParty=function(type,data={}){
  _v12AddPartyBase(type,data);
  const panel=document.getElementById(type+'Party');
  const card=panel?.querySelector(`.additional-party-card[data-party-type="${type}"]:last-of-type`);
  if(card && !card.querySelector('.biometric-note-wrap')){
    const note=document.createElement('div');
    note.className='biometric-note-wrap';
    note.hidden=true;
    note.innerHTML=`<label>Biometric Note / अंगुली उपलब्ध न होने का कारण</label><textarea data-party-field="biometricNote" rows="2" placeholder="उदा. अंगुली कटी हुई है / उपलब्ध नहीं है" oninput="syncDraftPreview()">${esc(data.biometricNote||'')}</textarea>`;
    const grid=card.querySelector('.finger-grid');if(grid)grid.insertAdjacentElement('afterend',note);else card.appendChild(note);
  }
};

partyFingerBlocks=function(list,label,fingerHtml,extraClass=''){
  const arr=normalizePartyList(list,null);
  const safe=arr.length?arr:[{name:''}];
  return safe.map((p,i)=>`<div class="finger-block ${extraClass}"><b>${esc(label)}${safe.length>1?` ${i+1}`:''}${p.name?` (${esc(p.name)})`:''} के बायें हाथ की अंगुलियों के निशान:-</b>${fingerHtml}<div class="finger-space"></div>${fingerHtml}${p.biometricNote?`<p class="finger-note"><b>नोट:</b> ${esc(p.biometricNote)}</p>`:''}</div>`).join('');
};

const _v12DraftDataBase=draftData;
draftData=function(){
  const d=_v12DraftDataBase();
  if(d.seller)d.seller.biometricNote=val('sellerBiometricNote');
  if(d.buyer)d.buyer.biometricNote=val('buyerBiometricNote');
  d.sellers=collectParties('seller',d.seller);
  d.buyers=collectParties('buyer',d.buyer);
  d.seller=d.sellers[0]||d.seller;
  d.buyer=d.buyers[0]||d.buyer;
  if(d.agri){
    const a=agriEnhancementValue();
    d.agri.annualLagan=5.06;
    d.agri.boundaryWallStatus=val('boundaryWallStatus');
    d.agri.boundarySideCount=a.boundarySides.length;
    d.agri.boundarySides=a.boundarySides;
    d.agri.boundaryRunningMeter=a.runningMeter;
    d.agri.boundaryWallRate=1500;
    d.agri.boundaryWallValue=a.boundaryValue;
    d.agri.orchardTrees=a.orchardRows;
    d.agri.treeBoringTrees=a.treeRows;
    d.agri.boringValue=a.boringValue;
    d.agri.coveredAreaStatus=val('coveredAreaStatus');
    d.agri.coveredAreaM2=a.coveredAreaM2;
    d.agri.coveredAreaRate=14000;
    d.agri.coveredAreaValue=a.coveredValue;
    d.agri.improvementValue=a.total;
    d.agri.coveredAreaText=a.coveredAreaM2>0?`${a.coveredAreaM2.toFixed(2)} वर्ग मीटर, मूल्य ${inr(a.coveredValue)}`:'नहीं';
    d.agri.buyerHoldingLimit='within';
    d.agri.possessionGiven='yes';
    d.agri.mutationSupport='yes';
  }
  return d;
};

const _v12AgriReviewBase=agriReviewSummary;
agriReviewSummary=function(d){
  _v12AgriReviewBase(d);
  const first=document.querySelector('#reviewSummary .review-block');
  if(first && d.agri){
    const a=d.agri;
    first.insertAdjacentHTML('beforeend',`<div class="review-row"><span>Boundary Wall</span><strong>${a.boundaryWallStatus==='हाँ'?`${Number(a.boundaryRunningMeter||0).toFixed(2)} running m = ${inr(a.boundaryWallValue||0)}`:'नहीं'}</strong></div><div class="review-row"><span>Ped / Boring / Covered</span><strong>${inr((a.orchardTrees||[]).reduce((x,r)=>x+(Number(r.value)||0),0)+(a.treeBoringTrees||[]).reduce((x,r)=>x+(Number(r.value)||0),0)+(Number(a.boringValue)||0)+(Number(a.coveredAreaValue)||0))}</strong></div><div class="review-row"><span>Extra Valuation</span><strong>${inr(a.improvementValue||0)}</strong></div>`);
  }
};

const _v12RenderAgricultureDeedBase=renderAgricultureDeed;
renderAgricultureDeed=function(d){
  _v12RenderAgricultureDeedBase(d);
  const legal=document.getElementById('legalDraftPreview');if(!legal||!d.agri)return;
  const a=d.agri;
  const parts=[];
  if(a.boundaryWallStatus==='हाँ')parts.push(`चारदीवारी ${Number(a.boundaryRunningMeter||0).toFixed(2)} रनिंग मीटर @ 1500 रुपये = ${inr(a.boundaryWallValue||0)}`);
  if((a.orchardTrees||[]).length)parts.push(`बाग के पेड़: ${(a.orchardTrees||[]).map(x=>`${esc(x.name||'पेड़')} ${Number(x.qty)||0} नग, उम्र ${esc(x.age||'-')}, मूल्य ${inr(x.value||0)}`).join('; ')}`);
  if((a.treeBoringTrees||[]).length)parts.push(`अन्य पेड़: ${(a.treeBoringTrees||[]).map(x=>`${esc(x.name||'पेड़')} ${Number(x.qty)||0} नग, उम्र ${esc(x.age||'-')}, मूल्य ${inr(x.value||0)}`).join('; ')}`);
  if(Number(a.boringValue)>0)parts.push(`बोरिंग मूल्य ${inr(a.boringValue)}`);
  if(Number(a.coveredAreaM2)>0)parts.push(`कवर्ड एरिया ${Number(a.coveredAreaM2).toFixed(2)} वर्ग मीटर @ 14000 रुपये = ${inr(a.coveredAreaValue||0)}`);
  if(parts.length){
    const p=document.querySelector('#legalDraftPreview .deed-page-1 p:nth-of-type(2)');
    if(p)p.insertAdjacentHTML('afterend',`<p>अतिरिक्त निर्माण / पेड़ / बोरिंग / चारदीवारी मूल्य:- <b class="v green">${parts.join('। ')}</b></p>`);
  }
};

const _v12ToggleAgriElementsBase=toggleAgriElements;
toggleAgriElements=function(){
  _v12ToggleAgriElementsBase();
  if(isAgricultureMode()){
    const lagan=document.getElementById('annualLagan');if(lagan)lagan.value='5.06';
    onAgriLandConditionChanged();
    onTreeBoringStatusChanged();
    onCoveredAreaStatusChanged();
    onBoundaryWallStatusChanged();
  }
};

document.addEventListener('DOMContentLoaded',()=>{
  try{
    const lagan=document.getElementById('annualLagan');if(lagan)lagan.value='5.06';
    document.querySelectorAll('#sellerParty .form-card,#buyerParty .form-card').forEach(updateBiometricNoteVisibility);
    onAgriLandConditionChanged();
    onTreeBoringStatusChanged();
    onCoveredAreaStatusChanged();
    onBoundaryWallStatusChanged();
  }catch(e){console.warn('v1.2 init',e)}
});

/* ===== v1.3 Required Save + Relation Auto Text + Read-only Parties + Hindi Typing + PDF/Word ===== */

function relationMeta(relation){
  const r=String(relation||'S/O').trim().toUpperCase();
  if(r==='W/O' || relation==='पत्नी') return {code:'W/O',namePrefix:'श्रीमती',word:'पत्नी'};
  if(r==='D/O' || relation==='पुत्री') return {code:'D/O',namePrefix:'कुमारी',word:'पुत्री'};
  if(r==='H/O' || relation==='पति') return {code:'H/O',namePrefix:'श्री',word:'पति'};
  return {code:'S/O',namePrefix:'',word:'पुत्र'};
}
function relationName(p){
  const m=relationMeta(p?.relation);
  const name=String(p?.name||'').trim();
  if(!name)return '';
  if(!m.namePrefix)return name;
  const low=name.toLowerCase();
  if(name.startsWith(m.namePrefix+' ') || low.startsWith('mrs ') || low.startsWith('miss '))return name;
  return `${m.namePrefix} ${name}`;
}
function onRelationChanged(select){
  if(!select)return;
  const card=select.closest('.form-card,.witness-panel');
  if(card){
    card.dataset.relationCode=select.value;
    card.dataset.relationHindi=relationMeta(select.value).word;
  }
}
function partyRelationText(p){
  const m=relationMeta(p?.relation);
  return `${esc(relationName(p)||'[नाम]')} ${esc(m.word)} ${esc(p?.father||'[पिता/पति का नाम]')}`;
}
function personLine(p){
  const bits=[partyRelationText(p),`निवासी ${esc(p?.address||'[पता]')}`];
  if(p?.aadhaar)bits.push(`Aadhaar Card ${esc(p.aadhaar)}`);
  if(p?.mobile)bits.push(`Mobile Number ${esc(p.mobile)}`);
  if(p?.email)bits.push(`Email ID ${esc(p.email)}`);
  return bits.join(', ');
}
function witnessPersonLine(w,label){
  const m=relationMeta(w?.relation);
  const name=relationName(w)||`[${label}]`;
  let out=`साक्षी- <b>${esc(name)}</b>`;
  if(w?.father)out+=` ${esc(m.word)} ${esc(w.father)}`;
  out+=` निवासी ${esc(w?.address||'[पता]')}`;
  if(w?.id)out+=`, Aadhaar Card ${esc(w.id)}`;
  if(w?.mobile)out+=`, Mobile Number ${esc(w.mobile)}`;
  return out;
}

// Exact English payment reference label requested for RTGS.
const _v13PaymentModeBase=onPaymentModeChanged;
onPaymentModeChanged=function(select){
  _v13PaymentModeBase(select);
  const tr=select?.closest('tr');if(!tr)return;
  const mode=String(select.value||'');
  const label=tr.querySelector('.pay-field-label');
  const ref=tr.querySelector('.pay-ref');
  if(mode.includes('RTGS')){
    if(label)label.textContent='RTGS No.';
    if(ref)ref.placeholder='RTGS No.';
  }else if(mode.includes('NEFT')){
    if(label)label.textContent='NEFT No.';
    if(ref)ref.placeholder='NEFT No.';
  }
};
paymentNarrative=function(d){
  const rows=(d.payments||[]).filter(x=>Number(x.amount)>0);
  const parts=rows.map(x=>{
    const mode=String(x.mode||'');
    const amount=`अंकन ${formatDeedMoney(x.amount)}`;
    const dt=x.date?` दिनांक ${formatDateDeed(x.date)}`:'';
    const bank=x.bank?` बैंक ${esc(x.bank)}`:'';
    const branch=x.branch?` शाखा ${esc(x.branch)}`:'';
    if(mode.includes('Cheque'))return `${amount} द्वारा Cheque No. ${esc(x.ref||'[Cheque No.]')}${dt}${bank}${branch} से प्राप्त कर लिये हैं`;
    if(mode.includes('RTGS'))return `${amount} द्वारा RTGS No. ${esc(x.ref||'[RTGS No.]')}${dt}${bank}${branch} से प्राप्त कर लिये हैं`;
    if(mode.includes('NEFT'))return `${amount} द्वारा NEFT No. ${esc(x.ref||'[NEFT No.]')}${dt}${bank}${branch} से प्राप्त कर लिये हैं`;
    if(mode.includes('Bank Transfer'))return `${amount} द्वारा Bank Transfer No. ${esc(x.ref||'[Transaction No.]')}${dt}${bank}${branch} से प्राप्त कर लिये हैं`;
    if(mode.includes('UPI'))return `${amount} द्वारा UPI / Transaction ID ${esc(x.ref||'[Transaction ID]')}${dt}${bank}${branch} से प्राप्त कर लिये हैं`;
    if(mode.includes('Cash'))return `${amount} नकद${dt} प्राप्त कर लिये हैं`;
    return `${amount} द्वारा अन्य माध्यम${x.ref?` Reference No. ${esc(x.ref)}`:''}${dt}${bank}${branch} से प्राप्त कर लिये हैं`;
  });
  if(!parts.length)return 'कुल मूल्य राशि की प्राप्ति विक्रेता द्वारा स्वीकार की गयी है';
  return parts.join(' व ');
};

// Relation values for additional Seller/Buyer cards.
readExtraPartyCard=function(card){
  const get=f=>(card.querySelector(`[data-party-field="${f}"]`)?.value||'').trim();
  return {name:get('name'),father:get('father'),relation:get('relation')||'S/O',address:get('address'),pan:get('pan'),aadhaar:get('aadhaar'),email:get('email'),mobile:get('mobile'),biometricNote:get('biometricNote')};
};
function upgradeRelationSelect(select,value){
  if(!select)return;
  const old=value||select.value||'S/O';
  const code=relationMeta(old).code;
  select.innerHTML='<option value="S/O">S/O (पुत्र)</option><option value="W/O">W/O (पत्नी)</option><option value="D/O">D/O (पुत्री)</option>';
  select.value=code==='H/O'?'S/O':code;
  select.setAttribute('onchange','onRelationChanged(this);syncDraftPreview()');
}
function upgradeAllRelationSelects(){
  ['sellerRelation','buyerRelation','witness1Relation','witness2Relation'].forEach(id=>upgradeRelationSelect(document.getElementById(id)));
  document.querySelectorAll('[data-party-field="relation"]').forEach(s=>upgradeRelationSelect(s));
}
const _v13AddPartyBase=addParty;
addParty=function(type,data={}){
  _v13AddPartyBase(type,data);
  const panel=document.getElementById(type+'Party');
  const select=panel?.querySelector(`.additional-party-card[data-party-type="${type}"]:last-of-type [data-party-field="relation"]`);
  upgradeRelationSelect(select,data.relation||'S/O');
  syncDraftPreview();
};

// Final draft data keeps S/O-W/O-D/O and witness relation values.
const _v13DraftDataBase=draftData;
draftData=function(){
  const d=_v13DraftDataBase();
  if(d.seller)d.seller.relation=val('sellerRelation')||'S/O';
  if(d.buyer)d.buyer.relation=val('buyerRelation')||'S/O';
  if(d.witness1)d.witness1.relation=val('witness1Relation')||'S/O';
  if(d.witness2)d.witness2.relation=val('witness2Relation')||'S/O';
  d.sellers=collectParties('seller',d.seller);
  d.buyers=collectParties('buyer',d.buyer);
  d.seller=d.sellers[0]||d.seller;
  d.buyer=d.buyers[0]||d.buyer;
  return d;
};

// Printed deed fingerprint boxes (not only labels/blank space).
partyFingerBlocks=function(list,label,fingerHtml,extraClass=''){
  const arr=normalizePartyList(list,null);
  const safe=arr.length?arr:[{name:''}];
  const fingerNames=['अंगूठा','तर्जनी','मध्यमा','अनामिका','कनिष्ठिका'];
  return safe.map((p,i)=>{
    const boxes=fingerNames.map(n=>`<div class="finger-print-box"><span>${n}</span></div>`).join('');
    return `<div class="finger-block ${extraClass}"><b>${esc(label)}${safe.length>1?` ${i+1}`:''}${p.name?` (${esc(relationName(p))})`:''} के बायें हाथ की अंगुलियों के निशान:-</b><div class="finger-print-box-row">${boxes}</div>${p.biometricNote?`<p class="finger-note"><b>नोट:</b> ${esc(p.biometricNote)}</p>`:''}</div>`;
  }).join('');
};

// Patch witness lines after agriculture deed rendering; seller/buyer use personLine above.
const _v13RenderAgricultureDeedBase=renderAgricultureDeed;
renderAgricultureDeed=function(d){
  _v13RenderAgricultureDeedBase(d);
  const wrap=document.querySelector('#legalDraftPreview .witness-lines');
  if(wrap){
    wrap.innerHTML=`<p>${witnessPersonLine(d.witness1,'साक्षी 1')}</p><p>${witnessPersonLine(d.witness2,'साक्षी 2')}</p>`;
  }
};

// Double-click any property type card to open it immediately; single click still only selects it.
function openPropertyTypeDirect(card){
  if(!card)return;
  selectPropertyType(card);
  startDraftSteps();
}

// Required-save validation: no Khasra, Area, Transaction, Stamp, Lat/Long (agriculture) => no draft save.
function clearRequiredErrors(){document.querySelectorAll('.required-save-error').forEach(x=>x.classList.remove('required-save-error'));}
function markRequiredError(el){if(el)el.classList.add('required-save-error');}
function validateDraftRequiredFields(){
  clearRequiredErrors();
  const d=draftData();
  const missing=[];
  const agri=isAgricultureMode();
  const agriGatas=agri?(d.agri?.gataRows||[]):[];
  const hasKhasra=Boolean(String(d.khasraNo||'').trim() || agriGatas.some(r=>String(r.gata||'').trim()));
  const hasArea=agri ? Number(d.agri?.totalAreaHa||0)>0 : Number(d.areaM2||0)>0;
  const hasTxn=Number(d.transactionAmount||0)>0;
  const hasStamp=Number(d.stampDuty||0)>0;
  const hasLat=Boolean(String(d.agri?.latitude||'').trim());
  const hasLong=Boolean(String(d.agri?.longitude||'').trim());
  if(!hasKhasra){
    missing.push('Khasra Number');
    markRequiredError(document.querySelector('#agriGataRows .gata-number')||document.getElementById('khasraNo'));
  }
  if(!hasArea){missing.push('Area / Rakba');markRequiredError(agri?document.getElementById('agriTotalAreaHa'):document.getElementById('east'));}
  if(!hasTxn){missing.push('Transaction Amount');markRequiredError(document.getElementById('transactionAmount'));}
  if(!hasStamp){missing.push('Stamp');markRequiredError(document.getElementById('stampPayable'));}
  if(!hasLat){missing.push('Latitude');markRequiredError(document.getElementById('propertyLatitude'));}
  if(!hasLong){missing.push('Longitude');markRequiredError(document.getElementById('propertyLongitude'));}
  if(missing.length){
    goDraftStep(1);
    const first=document.querySelector('.required-save-error');
    setTimeout(()=>{first?.scrollIntoView({behavior:'smooth',block:'center'});first?.focus?.();},50);
    toast('Save blocked: '+missing.join(', ')+' required');
    return false;
  }
  return true;
}

let v13LastCompletedDraft=null;
draftNext=function(){
  if(!validateDraftRequiredFields())return;
  if(currentDraftStep<5){
    saveDraftV04(false);
    goDraftStep(currentDraftStep+1);
    return;
  }
  saveDraftV04(true);
  const arr=JSON.parse(localStorage.getItem('registryProDrafts')||'[]');
  v13LastCompletedDraft=arr.find(x=>x.status==='Completed' && !x._workingDraft)||draftData();
  toast('Final draft saved on this laptop');
  refreshDashboard();
  showSaveSuccessModal();
};
function showSaveSuccessModal(){
  const m=document.getElementById('saveSuccessModal');if(!m)return;
  m.classList.add('show');m.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
}
function closeSaveSuccessModal(){
  const m=document.getElementById('saveSuccessModal');if(!m)return;
  m.classList.remove('show');m.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');
}
function saveCurrentDraftPdf(){
  closeSaveSuccessModal();
  goDraftStep(5);syncDraftPreview();
  setTimeout(()=>window.print(),80);
}
function safeFilePart(v){return String(v||'Registry').replace(/[^a-zA-Z0-9\u0900-\u097F_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,60)||'Registry';}
// Unicode Hindi -> Kruti Dev 010 legacy encoding for Word export.
// The on-screen preview stays Unicode; only Devanagari text runs are converted in the Word copy.
const V13_KD_MAP={
  'त्त्':'Ù','त्त':'Ùk','क्त':'ä','दृ':'–','कृ':'—',
  'ह्न':'à','ह्य':'á','हृ':'â','ह्म':'ã','ह्र':'ºz','ह्':'º','द्द':'í','क्ष्':'{','क्ष':'{k','त्र्':'«','त्र':'=','ज्ञ':'K',
  'छ्य':'Nî','ट्य':'Vî','ठ्य':'Bî','ड्य':'Mî','ढ्य':'<î','द्य':'|','द्व':'}','श्र':'J','ट्र':'Vª','ड्र':'Mª','ढ्र':'<ªª','छ्र':'Nª','क्र':'Ø','फ्र':'Ý','द्र':'æ','प्र':'ç','ग्र':'xz','रु':'#','रू':':',
  'फ़्':'¶','क़':'d','ख़':'[k','ग़':'x','ज़्':'T','ज़':'t','ड़':'M+','ढ़':'<+','फ़':'Q','य़':';','ऱ':'j','ऩ':'u',
  'ओ':'vks','औ':'vkS','आ':'vk','अ':'v','ई':'bZ','इ':'b','उ':'m','ऊ':'Å','ऐ':',s','ए':',','ऋ':'_',
  'क्':'D','क':'d','क्क':'ô','ख्':'[','ख':'[k','ग्':'X','ग':'x','घ्':'?','घ':'?k','ङ':'³',
  'चै':'pkS','च्':'P','च':'p','छ':'N','ज्':'T','ज':'t','झ्':'÷','झ':'>','ञ':'¥',
  'ट्ट':'ê','ट्ठ':'ë','ट':'V','ठ':'B','ड्ड':'ì','ड्ढ':'ï','ड्':'M~','ड':'M','ढ्':'<~','ढ':'<','ण्':'.','ण':'.k',
  'त्':'R','त':'r','थ्':'F','थ':'Fk','द्ध':')','द्':'n~','द':'n','ध्':'/','ध':'/k','न्':'U','न':'u',
  'प्':'I','प':'i','फ्':'¶','फ':'Q','ब्':'C','ब':'c','भ्':'H','भ':'Hk','म्':'E','म':'e',
  'य्':'¸','य':';','र':'j','ल्':'Y','ल':'y','ळ':'G','व्':'O','व':'o','श्':"'",'श':"'k",'ष्':'"','ष':'"k','स्':'L','स':'l','ह':'g',
  'ऑ':'v‚','ॉ':'‚','ो':'ks','ौ':'kS','ा':'k','ी':'h','ु':'q','ू':'w','ृ':'`','े':'s','ै':'S','ं':'a','ँ':'¡','ः':'%','ॅ':'W','ऽ':'·',
  '०':'å','१':'ƒ','२':'„','३':'…','४':'†','५':'‡','६':'ˆ','७':'‰','८':'Š','९':'‹','।':'A','॰':'Œ'
};
const V13_KD_KEYS=Object.keys(V13_KD_MAP).sort((a,b)=>b.length-a.length);
function unicodeToKrutiDev(text){
  let x=String(text||'').normalize('NFC')
    .replace(/क़/g,'क़').replace(/ख़/g,'ख़').replace(/ग़/g,'ग़').replace(/ज़/g,'ज़')
    .replace(/ड़/g,'ड़').replace(/ढ़/g,'ढ़').replace(/फ़/g,'फ़').replace(/य़/g,'य़').replace(/ऱ/g,'ऱ').replace(/ऩ/g,'ऩ');
  // Move short-i before the complete consonant cluster (Kruti Dev's "f" behavior).
  let pos=x.indexOf('ि');
  while(pos>0){
    let start=pos-1;
    if(start>0 && x[start]==='़')start--;
    while(start>=2 && x[start-1]==='्'){
      start-=2;
      if(start>0 && x[start]==='़')start--;
    }
    const cluster=x.slice(start,pos);
    x=x.slice(0,start)+'\uE101'+cluster+x.slice(pos+1);
    pos=x.indexOf('ि',start+cluster.length+1);
  }
  // Move Unicode reph (र्) after the following consonant cluster and its matras.
  const matras='ािीुूृेैोौंःँॅ';
  let rp=x.indexOf('र्');
  let guard=0;
  while(rp>=0 && guard++<100){
    const after=rp+2;
    if(after>=x.length){x=x.slice(0,rp)+'\uE102'+x.slice(after);break;}
    let e=after+1;
    if(x[e]==='़')e++;
    while(e<x.length && x[e]==='्' && e+1<x.length){e+=2;if(x[e]==='़')e++;}
    while(e<x.length && matras.includes(x[e]))e++;
    const cluster=x.slice(after,e);
    x=x.slice(0,rp)+cluster+'\uE102'+x.slice(e);
    rp=x.indexOf('र्',rp+cluster.length+1);
  }
  // Generic rakar (्र) uses Kruti Dev's z marker.
  x=x.replace(/्र/g,'\uE103');
  for(const k of V13_KD_KEYS)x=x.split(k).join(V13_KD_MAP[k]);
  x=x.replace(/\uE101/g,'f').replace(/\uE102/g,'Z').replace(/\uE103/g,'z').replace(/्/g,'~');
  return x;
}
function buildKrutiDevWordHtml(source){
  const clone=source.cloneNode(true);
  const walker=document.createTreeWalker(clone,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    const txt=node.nodeValue||'';
    if(!/[\u0900-\u097F]/.test(txt))return;
    const frag=document.createDocumentFragment();
    let last=0;const re=/[\u0900-\u097F]+/g;let m;
    while((m=re.exec(txt))){
      if(m.index>last)frag.appendChild(document.createTextNode(txt.slice(last,m.index)));
      const span=document.createElement('span');
      const kd=unicodeToKrutiDev(m[0]);
      if(/[\u0900-\u097F]/.test(kd)){span.className='unicode-hi';span.textContent=m[0];}
      else{span.className='kd';span.textContent=kd;}
      frag.appendChild(span);last=m.index+m[0].length;
    }
    if(last<txt.length)frag.appendChild(document.createTextNode(txt.slice(last)));
    node.parentNode.replaceChild(frag,node);
  });
  return clone.innerHTML;
}
function openCurrentDraftWord(){
  syncDraftPreview();
  const legal=document.getElementById('legalDraftPreview');
  if(!legal){toast('Preview not ready');return;}
  const d=v13LastCompletedDraft||draftData();
  const bodyHtml=buildKrutiDevWordHtml(legal);
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Registry Pro</title><style>
    @page{size:A4;margin:20mm 18mm} body{font-family:Arial,Calibri,sans-serif;font-size:12pt;line-height:1.45;color:#000}.kd{font-family:"Kruti Dev 010";font-size:16pt}.unicode-hi{font-family:"Nirmala UI","Mangal",sans-serif;font-size:12pt}
    .deed-page{page-break-after:always;min-height:250mm;box-sizing:border-box}.deed-page:last-child{page-break-after:auto}.deed-top-grid{display:table;width:100%}.deed-top-grid>div{display:inline-block;width:48%;vertical-align:top}.deed-small{font-size:11pt}.v{font-weight:bold}.finger-print-box-row{display:table;width:100%;table-layout:fixed;margin-top:8px}.finger-print-box{display:table-cell;border:1px solid #000;height:28mm;text-align:center;vertical-align:bottom;font-size:10pt}.witness-lines{margin-top:25mm}.witness-lines p{margin-bottom:18mm}.finger-note{font-size:10pt}
  </style></head><body>${bodyHtml}</body></html>`;
  const blob=new Blob(['\ufeff',html],{type:'application/msword'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`Registry_Pro_${safeFilePart(d.village||d.registryType)}.doc`;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
  closeSaveSuccessModal();
  toast('Word file prepared: Hindi in Kruti Dev 010, English labels preserved');
}

// Completed-registry party records are read-only in the Parties module.
function completedPartyRecords(type){
  const arr=JSON.parse(localStorage.getItem('registryProDrafts')||'[]').filter(d=>d.status==='Completed' && !d._workingDraft);
  const out=[];
  arr.forEach(d=>{
    const list=type==='seller'?(Array.isArray(d.sellers)&&d.sellers.length?d.sellers:[d.seller]):(Array.isArray(d.buyers)&&d.buyers.length?d.buyers:[d.buyer]);
    list.filter(Boolean).forEach((p,i)=>out.push({type,party:p,draft:d,index:i}));
  });
  return out;
}
function renderSavedPartyRecords(type){
  const box=document.getElementById('savedPartyRecords');if(!box)return;
  const records=completedPartyRecords(type);
  if(!records.length){box.innerHTML=`<div class="empty-party-records">Abhi kisi completed registry me ${type==='seller'?'Seller':'Buyer'} record save nahi hai.</div>`;return;}
  box.innerHTML=`<div class="saved-party-head"><h3>${type==='seller'?'Seller / विक्रेता':'Buyer / क्रेता'} — Read Only</h3><span>${records.length} record${records.length===1?'':'s'}</span></div>`+records.map((r,idx)=>{
    const p=r.party,m=relationMeta(p.relation),d=r.draft;
    return `<div class="readonly-party-record" data-party-record="${idx}">
      <div class="readonly-party-title"><strong>${esc(relationName(p)||'-')}</strong><span>READ ONLY</span></div>
      <div class="readonly-party-grid">
        <label>Name<input readonly value="${esc(relationName(p)||'')}"></label>
        <label>Relation<input readonly value="${esc(m.code)} / ${esc(m.word)}"></label>
        <label>Father / Husband<input readonly value="${esc(p.father||'')}"></label>
        <label>Aadhaar Card<input readonly value="${esc(p.aadhaar||'')}"></label>
        <label>Mobile Number<input readonly value="${esc(p.mobile||'')}"></label>
        <label>Email ID<input readonly value="${esc(p.email||'')}"></label>
        <label class="full">Address<input readonly value="${esc(p.address||'')}"></label>
      </div>
      <div class="readonly-party-source">Registry: ${esc(d.registryType||'-')} • Village: ${esc(d.village||'-')} • Saved: ${esc(d.savedAt||'-')}</div>
    </div>`;
  }).join('');
}
openPartiesHome=function(){
  selectedPartyHomeType='';
  document.querySelectorAll('.party-home-card').forEach(x=>x.classList.remove('selected'));
  const btn=document.getElementById('openSelectedPartyBtn');if(btn)btn.disabled=true;
  const box=document.getElementById('savedPartyRecords');if(box)box.innerHTML='<div class="empty-party-records">Seller ya Buyer select karke completed registry party records dekhen.</div>';
  showView('partiesView');
};
selectPartyHomeCard=function(card){
  document.querySelectorAll('.party-home-card').forEach(x=>x.classList.remove('selected'));
  if(card){card.classList.add('selected');selectedPartyHomeType=card.dataset.partyOpen||'';}
  const btn=document.getElementById('openSelectedPartyBtn');if(btn)btn.disabled=!selectedPartyHomeType;
  if(selectedPartyHomeType)renderSavedPartyRecords(selectedPartyHomeType);
};
openSelectedPartyHome=function(){if(selectedPartyHomeType)renderSavedPartyRecords(selectedPartyHomeType);};
openPartyDetails=function(type){
  if(type!=='seller'&&type!=='buyer')return;
  selectedPartyHomeType=type;
  document.querySelectorAll('.party-home-card').forEach(x=>x.classList.toggle('selected',x.dataset.partyOpen===type));
  const btn=document.getElementById('openSelectedPartyBtn');if(btn)btn.disabled=false;
  renderSavedPartyRecords(type);
};

// Dashboard party count is based only on completed registry party records.
const _v13RefreshDashboardBase=refreshDashboard;
refreshDashboard=function(){
  _v13RefreshDashboardBase();
  const total=completedPartyRecords('seller').length+completedPartyRecords('buyer').length;
  const el=document.getElementById('statTotalParties');if(el)el.textContent=total;
};

// Local Roman-English -> Hindi typing helper. Technical IDs/numbers/emails stay untouched.
const V13_HINDI_WORDS={
  'salman':'सलमान','khan':'खान','amit':'अमित','sharma':'शर्मा','nirmal':'निर्मल','rajendra':'राजेन्द्र','singh':'सिंह','kumar':'कुमार','kumari':'कुमारी','shrimati':'श्रीमती','smt':'श्रीमती','shri':'श्री','village':'ग्राम','vill':'ग्राम','gaon':'गाँव','gram':'ग्राम','tehsil':'तहसील','district':'जिला','haridwar':'हरिद्वार','roorkee':'रुड़की','bhagwanpur':'भगवानपुर','sikanderpur':'सिकन्दरपुर','bhainswal':'भैंसवाल','chanchak':'चांचक','majra':'माजरा','putra':'पुत्र','putri':'पुत्री','patni':'पत्नी','pati':'पति','nivas':'निवास','niwasi':'निवासी','road':'रोड','rasta':'रास्ता','khet':'खेत','zameen':'जमीन','jameen':'जमीन','aam':'आम','ped':'पेड़','bag':'बाग','bagh':'बाग','saal':'साल','varsh':'वर्ष'
};
const V13_CONS=[['chh','छ'],['ksh','क्ष'],['gy','ज्ञ'],['jny','ज्ञ'],['kh','ख'],['gh','घ'],['ch','च'],['jh','झ'],['th','थ'],['dh','ध'],['ph','फ'],['bh','भ'],['sh','श'],['zh','झ'],['tr','त्र'],['dr','द्र'],['kr','क्र'],['gr','ग्र'],['pr','प्र'],['br','ब्र'],['fr','फ्र'],['q','क़'],['f','फ़'],['z','ज़'],['x','क्स'],['k','क'],['g','ग'],['c','क'],['j','ज'],['t','त'],['d','द'],['n','न'],['p','प'],['b','ब'],['m','म'],['y','य'],['r','र'],['l','ल'],['v','व'],['w','व'],['s','स'],['h','ह']];
const V13_VOW=[['aa','आ','ा'],['ai','ऐ','ै'],['au','औ','ौ'],['ee','ई','ी'],['ii','ई','ी'],['oo','ऊ','ू'],['uu','ऊ','ू'],['ri','ऋ','ृ'],['a','अ',''],['i','इ','ि'],['u','उ','ु'],['e','ए','े'],['o','ओ','ो']];
const V13_JOIN=new Set(['rm','rn','rt','rd','rk','rg','nd','nt','nk','ng','mb','mp','kt','ks','st','sk','sp','sm','sn','sr','tr','dr','kr','gr','pr','br','vr','ty','dy','tm','dm']);
function v13Match(list,w,i){for(const item of list){if(w.startsWith(item[0],i))return item;}return null;}
function romanHindiWord(word){
  const key=word.toLowerCase();
  if(V13_HINDI_WORDS[key])return V13_HINDI_WORDS[key];
  if(!/^[a-z]+$/i.test(word))return word;
  let out='',i=0;
  while(i<key.length){
    const vowel=v13Match(V13_VOW,key,i);
    if(vowel){out+=vowel[1];i+=vowel[0].length;continue;}
    const con=v13Match(V13_CONS,key,i);
    if(!con){out+=word[i];i++;continue;}
    out+=con[1];i+=con[0].length;
    const after=v13Match(V13_VOW,key,i);
    if(after){out+=after[2];i+=after[0].length;continue;}
    const next=v13Match(V13_CONS,key,i);
    if(next && V13_JOIN.has(con[0]+next[0]))out+='्';
  }
  return out;
}
function transliterateTextLocal(text){
  return String(text||'').replace(/[A-Za-z]+/g,w=>romanHindiWord(w));
}
function shouldHindiAuto(el){
  if(!el || !(el.matches('input,textarea')))return false;
  const type=(el.getAttribute('type')||'text').toLowerCase();
  if(['number','date','email','tel','password','file','hidden','checkbox','radio'].includes(type))return false;
  const id=(el.id||'').toLowerCase(), cls=(el.className||'').toString().toLowerCase();
  const technical='aadhaar|aadhar|mobile|phone|email|pan|gst|ref|utr|rtgs|cheque|transaction|latitude|longitude|rera|enrollment|rate|amount|area|qty|value|number|khasra|gata|chak|bank|branch|search|rowid|sheetcount';
  if(new RegExp(technical).test(id+' '+cls))return false;
  if(el.readOnly || el.disabled)return false;
  return true;
}
function applyHindiAuto(el){
  if(!shouldHindiAuto(el))return;
  const before=el.value;
  if(!/[A-Za-z]/.test(before))return;
  const after=transliterateTextLocal(before);
  if(after!==before){el.value=after;el.classList.add('auto-hindi-done');try{syncDraftPreview();}catch(e){}}
}
document.addEventListener('input',e=>{
  const el=e.target;if(!shouldHindiAuto(el))return;
  if(/[\s,.;:!?-]$/.test(el.value))applyHindiAuto(el);
});
document.addEventListener('blur',e=>{if(shouldHindiAuto(e.target))applyHindiAuto(e.target);},true);

// On-screen preview remains Unicode-readable; Word export converts Hindi runs to Kruti Dev 010 legacy text.
document.addEventListener('DOMContentLoaded',()=>{
  try{
    upgradeAllRelationSelects();
    document.querySelectorAll('#paymentRows .pay-mode').forEach(onPaymentModeChanged);
    const defaults=['advocateName'];defaults.forEach(id=>{const el=document.getElementById(id);if(el)applyHindiAuto(el);});
    refreshDashboard();
  }catch(e){console.warn('v1.3 init',e)}
});

/* ===== v1.4 FINAL DISCUSSION IMPLEMENTATION =====
   Jurisdiction-aware workflow, deed hierarchy, advocate/typist ownership,
   auto Registry No + autosave, searchable drafts, Buyer→Seller reuse,
   smart Hindi suggestions, compact party grouping, stamp-page preference,
   page border/footer, mutation workflow and true Unicode .docx export.
*/

const V14_JURISDICTIONS={
  Uttarakhand:{
    Haridwar:{
      Bhagwanpur:{sectionPrefixes:['भगवानपुर'],code:'BHP',ratePdf:'data/states/uttarakhand/haridwar/pdfs/circle_rates_bhagwanpur.pdf'},
      Roorkee:{sectionPrefixes:['रुड़की'],code:'RKE',ratePdf:'data/states/uttarakhand/haridwar/pdfs/circle_rates_roorkee.pdf'},
      Manglaur:{sectionPrefixes:['मंगलौर'],code:'MGL',ratePdf:'data/states/uttarakhand/haridwar/pdfs/circle_rates_roorkee.pdf'}
    }
  }
};
let v14Session=null;
let v14LoadingDraft=false;
let v14ActiveRegistryNo=null;
let v14AutosaveTimer=null;
let v14LastOpenedDraft=null;

function v14ReadJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch(e){return fallback;}}
function v14WriteJSON(key,value){localStorage.setItem(key,JSON.stringify(value));}
function v14AllDrafts(){return v14ReadJSON('registryProDrafts',[]);}
function v14SaveDrafts(arr){v14WriteJSON('registryProDrafts',arr.slice(0,500));}
function v14SessionData(){return v14Session||v14ReadJSON('registryProSession',{role:'Advocate',name:'Amit Sharma',advocateName:'Amit Sharma'});}
function currentJurisdiction(){return v14ReadJSON('registryProJurisdiction',{state:'Uttarakhand',district:'Haridwar',tehsil:'Bhagwanpur'});}
function jurisdictionConfig(ctx=currentJurisdiction()){
  return V14_JURISDICTIONS?.[ctx.state]?.[ctx.district]?.[ctx.tehsil]||null;
}
function v14HindiTehsil(v){return ({Bhagwanpur:'भगवानपुर',Roorkee:'रुड़की',Manglaur:'मंगलौर'})[v]||v;}
function v14HindiDistrict(v){return ({Haridwar:'हरिद्वार'})[v]||v;}

function bootstrapOfficeProfiles(){
  let advocates=v14ReadJSON('registryProAdvocates',[]);
  if(!advocates.length){advocates=[{name:'Amit Sharma',enrollment:'',mobile:'',stampPage:'2'}];v14WriteJSON('registryProAdvocates',advocates);}
  if(!Array.isArray(v14ReadJSON('registryProTypists',[])))v14WriteJSON('registryProTypists',[]);
  refreshAdvocateSelects();
}
function getAdvocates(){return v14ReadJSON('registryProAdvocates',[]);}
function getTypists(){return v14ReadJSON('registryProTypists',[]);}
function refreshAdvocateSelects(){
  const advs=getAdvocates();
  ['sessionAdvocate','manageTypistAdvocate'].forEach(id=>{
    const s=document.getElementById(id);if(!s)return;
    const old=s.value;
    s.innerHTML=advs.map(a=>`<option value="${esc(a.name)}">${esc(a.name)}</option>`).join('')||'<option value="">Add Advocate first</option>';
    if(old && advs.some(a=>a.name===old))s.value=old;
  });
}
function populateDistrictOptions(){
  const state=document.getElementById('jurisdictionState')?.value||'Uttarakhand';
  const sel=document.getElementById('jurisdictionDistrict');if(!sel)return;
  const districts=Object.keys(V14_JURISDICTIONS[state]||{});
  sel.innerHTML=districts.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  populateTehsilOptions();
}
function populateTehsilOptions(){
  const state=document.getElementById('jurisdictionState')?.value||'Uttarakhand';
  const dist=document.getElementById('jurisdictionDistrict')?.value||'Haridwar';
  const sel=document.getElementById('jurisdictionTehsil');if(!sel)return;
  const tehsils=Object.keys(V14_JURISDICTIONS?.[state]?.[dist]||{});
  sel.innerHTML=tehsils.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  updateJurisdictionRateStatus();
}
function updateJurisdictionRateStatus(){
  const state=document.getElementById('jurisdictionState')?.value||'Uttarakhand';
  const district=document.getElementById('jurisdictionDistrict')?.value||'Haridwar';
  const tehsil=document.getElementById('jurisdictionTehsil')?.value||'Bhagwanpur';
  const cfg=V14_JURISDICTIONS?.[state]?.[district]?.[tehsil];
  const el=document.getElementById('jurisdictionRateStatus');
  if(el)el.innerHTML=cfg?`✓ ${esc(tehsil)} circle-rate rows mapped from <strong>ROORKEE / BHAGWANPUR official PDF</strong>.`:'Rate list not mapped yet.';
}
function onSessionRoleChange(){
  const role=document.getElementById('sessionRole')?.value||'Advocate';
  const wrap=document.getElementById('assignedAdvocateWrap');if(wrap)wrap.style.display=role==='Advocate'?'none':'';
  if(role==='Advocate'){
    const name=document.getElementById('sessionUserName')?.value.trim();
    const sel=document.getElementById('sessionAdvocate');if(sel && name && [...sel.options].some(o=>o.value===name))sel.value=name;
  }
}
function showJurisdiction(){
  bootstrapOfficeProfiles();
  const saved=currentJurisdiction();
  showView('jurisdictionView');
  const st=document.getElementById('jurisdictionState');if(st)st.value=saved.state||'Uttarakhand';
  populateDistrictOptions();
  const dist=document.getElementById('jurisdictionDistrict');if(dist && [...dist.options].some(o=>o.value===saved.district))dist.value=saved.district;
  populateTehsilOptions();
  const teh=document.getElementById('jurisdictionTehsil');if(teh && [...teh.options].some(o=>o.value===saved.tehsil))teh.value=saved.tehsil;
  const old=v14SessionData();
  const role=document.getElementById('sessionRole');if(role)role.value=old.role||'Advocate';
  const name=document.getElementById('sessionUserName');if(name)name.value=old.name||'Amit Sharma';
  const adv=document.getElementById('sessionAdvocate');if(adv && old.advocateName && [...adv.options].some(o=>o.value===old.advocateName))adv.value=old.advocateName;
  onSessionRoleChange();updateJurisdictionRateStatus();
}
function enterRegistryWorkspace(){
  const ctx={state:val('jurisdictionState')||'Uttarakhand',district:val('jurisdictionDistrict')||'Haridwar',tehsil:val('jurisdictionTehsil')||'Bhagwanpur'};
  if(!jurisdictionConfig(ctx)){toast('Selected tehsil ki rate list mapped nahi hai');return;}
  v14WriteJSON('registryProJurisdiction',ctx);
  const role=val('sessionRole')||'Advocate';
  const name=val('sessionUserName')||'Amit Sharma';
  let advocateName=role==='Advocate'?name:(val('sessionAdvocate')||getAdvocates()[0]?.name||'');
  v14Session={role,name,advocateName};v14WriteJSON('registryProSession',v14Session);
  if(role==='Advocate' && name && !getAdvocates().some(a=>a.name.toLowerCase()===name.toLowerCase())){
    const a=getAdvocates();a.push({name,enrollment:'',mobile:'',stampPage:'2'});v14WriteJSON('registryProAdvocates',a);refreshAdvocateSelects();
  }
  showDashboard();toast(`${ctx.tehsil} rate list selected`);
}
// Login now enters State → District → Tehsil workflow.
demoLogin=function(){showJurisdiction();};

function updateDraftJurisdictionContext(){
  const c=currentJurisdiction();
  const map={draftCtxState:c.state,draftCtxDistrict:c.district,draftCtxTehsil:c.tehsil};
  Object.entries(map).forEach(([id,t])=>{const e=document.getElementById(id);if(e)e.textContent=t||'-';});
  const r=document.getElementById('draftCtxRate');if(r)r.textContent=jurisdictionConfig(c)?'Mapped PDF':'Not mapped';
}
function toggleDeedChildren(id,btn){
  const el=document.getElementById(id);if(!el)return;
  el.hidden=!el.hidden;btn?.classList.toggle('open',!el.hidden);
  if(!el.hidden)el.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function v14TypeCode(t){
  t=String(t||'').toLowerCase();
  if(t.includes('sale after agreement')&&t.includes('agriculture'))return 'SAA-AG';
  if(t.includes('sale after agreement')&&t.includes('industrial'))return 'SAA-IN';
  if(t.includes('sale after agreement'))return 'SAA-RP';
  if(t.includes('gift')&&t.includes('agriculture'))return t.includes('family')?'GF-AG':'GO-AG';
  if(t.includes('gift')&&t.includes('building'))return t.includes('family')?'GF-RB':'GO-RB';
  if(t.includes('gift'))return t.includes('family')?'GF-RP':'GO-RP';
  if(t.includes('agreement')&&t.includes('agriculture'))return 'AGR-AG';
  if(t.includes('agreement')&&t.includes('building'))return 'AGR-RB';
  if(t.includes('agreement')&&t.includes('industrial'))return 'AGR-IN';
  if(t.includes('agreement'))return 'AGR-RP';
  if(t.includes('lease'))return 'LSE';
  if(t.includes('agriculture'))return 'AG';
  if(t.includes('building'))return 'RB';
  return 'RP';
}
function v14EnsureRegistryNo(){
  if(v14ActiveRegistryNo)return v14ActiveRegistryNo;
  const ctx=currentJurisdiction(),cfg=jurisdictionConfig(ctx)||{code:'REG'};
  const year=new Date().getFullYear(),tc=v14TypeCode(registrySelectedType);
  const seqKey=`registryProSeq:${cfg.code}:${year}:${tc}`;
  let n=Number(localStorage.getItem(seqKey)||0)+1;localStorage.setItem(seqKey,String(n));
  v14ActiveRegistryNo=`${cfg.code}/${year}/${tc}/${String(n).padStart(5,'0')}`;
  updateDraftNumberMini();return v14ActiveRegistryNo;
}
function updateDraftNumberMini(){const e=document.getElementById('draftNumberMini');if(e)e.textContent=`Registry No.: ${v14ActiveRegistryNo||'Auto after selection'}`;}
function applyDraftTypeFieldVisibility(){
  const t=String(registrySelectedType||'').toLowerCase();
  try{toggleAgriElements();}catch(e){}
  const building=t.includes('building');
  ['houseFlatNo','floorSelect'].forEach(id=>{const el=document.getElementById(id);if(el?.parentElement)el.parentElement.style.display=building?'':'none';});
  const notice=document.getElementById('deedTemplateNotice');
  if(notice){
    const mapped=(t==='residential plot'||t==='agriculture land');
    notice.className='deed-template-notice '+(mapped?'mapped':'pending');
    notice.innerHTML=mapped?`✓ <strong>${esc(registrySelectedType)}</strong> ka working draft format mapped hai.`:`<strong>${esc(registrySelectedType)}</strong> workflow ready hai. Exact legal clauses/field mapping aapke sample PDF milte hi isi template slot me lock hogi.`;
  }
}
const _v14SelectPropertyTypeBase=selectPropertyType;
selectPropertyType=function(el){
  _v14SelectPropertyTypeBase(el);
  if(!v14LoadingDraft)v14ActiveRegistryNo=null;
  v14EnsureRegistryNo();applyDraftTypeFieldVisibility();updateDraftNumberMini();scheduleV14Autosave();
};
const _v14OpenNewRegistryBase=openNewRegistry;
openNewRegistry=function(){
  if(!v14LoadingDraft){v14ActiveRegistryNo=null;v14LastOpenedDraft=null;}
  _v14OpenNewRegistryBase();updateDraftJurisdictionContext();updateDraftNumberMini();
  const s=v14SessionData(),adv=document.getElementById('advocateName');
  if(adv && !v14LoadingDraft)adv.value=s.advocateName||s.name||adv.value;
  loadAdvocateStampDefault();applyDraftTypeFieldVisibility();
};

function selectedStampPage(){
  const v=val('stampPageSetting')||'2';if(v==='none')return 0;if(v==='custom')return Math.max(1,Math.floor(numv('customStampPage')||1));return Number(v)||2;
}
function onStampPageSettingChange(){
  const custom=val('stampPageSetting')==='custom';const w=document.getElementById('customStampPageWrap');if(w)w.hidden=!custom;
  saveAdvocateDefaultFromDraft();scheduleV14Autosave();
}
function loadAdvocateStampDefault(){
  const name=val('advocateName')||v14SessionData().advocateName;
  const a=getAdvocates().find(x=>x.name===name);const s=document.getElementById('stampPageSetting');
  if(s && a?.stampPage && [...s.options].some(o=>o.value===String(a.stampPage)))s.value=String(a.stampPage);
  onStampPageSettingChange();
}
function saveAdvocateDefaultFromDraft(){
  const name=val('advocateName');if(!name)return;
  const arr=getAdvocates();let a=arr.find(x=>x.name.toLowerCase()===name.toLowerCase());
  if(!a){a={name,enrollment:val('advocateEnrollment'),mobile:val('advocateMobile'),stampPage:val('stampPageSetting')||'2'};arr.push(a);}
  else{a.enrollment=val('advocateEnrollment')||a.enrollment;a.mobile=val('advocateMobile')||a.mobile;a.stampPage=val('stampPageSetting')||a.stampPage||'2';}
  v14WriteJSON('registryProAdvocates',arr);refreshAdvocateSelects();
}

// Final data ownership and stable Registry No.
const _v14DraftDataBase=draftData;
draftData=function(){
  const d=_v14DraftDataBase();
  const ctx=currentJurisdiction(),sess=v14SessionData();
  d.registryNo=v14ActiveRegistryNo||d.registryNo||'';
  d.savedAtISO=new Date().toISOString();
  d.jurisdiction=ctx;
  d.ownerAdvocate=sess.role==='Advocate'?(sess.name||d.advocate?.name):(sess.advocateName||d.advocate?.name);
  d.createdBy=sess.name||'';
  d.createdByRole=sess.role||'Advocate';
  d.assignedTypist=sess.role==='Typist'?sess.name:'';
  d.stampPageSetting=val('stampPageSetting')||'2';
  d.customStampPage=numv('customStampPage')||0;
  d.previousTitleHolderText=val('previousTitleHolderText');
  d.templateVersion='v1.4';
  return d;
};

function v14MeaningfulDraft(d){return !!(d.registryType && (d.village||d.seller?.name||d.buyer?.name||d.khasraNo||(d.agri?.gataRows||[]).length));}
saveDraftV04=function(finalSave){
  const d=draftData();
  if(!d.registryNo)d.registryNo=v14EnsureRegistryNo();
  if(!finalSave && !v14MeaningfulDraft(d))return;
  d.status=finalSave?'Completed':'In Progress';d._workingDraft=!finalSave;
  const arr=v14AllDrafts();
  const idx=arr.findIndex(x=>x.registryNo===d.registryNo);
  if(idx>=0)arr[idx]=d;else arr.unshift(d);
  v14SaveDrafts(arr);v14LastOpenedDraft=d;
  if(finalSave)v13LastCompletedDraft=d;
  refreshDashboard();
};
function scheduleV14Autosave(){
  if(v14LoadingDraft)return;
  clearTimeout(v14AutosaveTimer);v14AutosaveTimer=setTimeout(()=>{
    const view=document.getElementById('registryView');const steps=document.getElementById('draftStepsScreen');
    if(view?.classList.contains('active')&&steps?.classList.contains('active')){try{v14EnsureRegistryNo();saveDraftV04(false);}catch(e){console.warn('autosave',e);}}
  },650);
}
document.addEventListener('input',e=>{if(e.target.closest?.('#registryView'))scheduleV14Autosave();},true);
document.addEventListener('change',e=>{if(e.target.closest?.('#registryView'))scheduleV14Autosave();},true);

// Required fields are deed-aware. Exact yet-unmapped templates are not blocked by guessed legal requirements.
validateDraftRequiredFields=function(){
  clearRequiredErrors();const d=draftData(),missing=[];const t=String(d.registryType||'').toLowerCase();
  const agri=t.includes('agriculture'),mapped=(t==='residential plot'||t==='agriculture land');
  const agriGatas=agri?(d.agri?.gataRows||[]):[];
  const hasKhasra=Boolean(String(d.khasraNo||'').trim()||agriGatas.some(r=>String(r.gata||'').trim()));
  const hasArea=agri?Number(d.agri?.totalAreaHa||0)>0:Number(d.areaM2||0)>0;
  if(mapped && !hasKhasra){missing.push(agri?'Gata / Khasra Number':'Khasra Number');markRequiredError(document.querySelector('#agriGataRows .gata-number')||document.getElementById('khasraNo'));}
  if(mapped && !hasArea){missing.push('Area / Rakba');markRequiredError(agri?document.getElementById('agriTotalAreaHa'):document.getElementById('east'));}
  if(mapped && Number(d.transactionAmount||0)<=0){missing.push('Transaction Amount');markRequiredError(document.getElementById('transactionAmount'));}
  if(mapped && Number(d.stampDuty||0)<=0){missing.push('Stamp');markRequiredError(document.getElementById('stampPayable'));}
  if(agri && mapped && !String(d.agri?.latitude||'').trim()){missing.push('Latitude');markRequiredError(document.getElementById('propertyLatitude'));}
  if(agri && mapped && !String(d.agri?.longitude||'').trim()){missing.push('Longitude');markRequiredError(document.getElementById('propertyLongitude'));}
  if(missing.length){goDraftStep(1);const first=document.querySelector('.required-save-error');setTimeout(()=>{first?.scrollIntoView({behavior:'smooth',block:'center'});first?.focus?.();},60);toast('Save blocked: '+missing.join(', ')+' required');return false;}
  return true;
};
draftNext=function(){
  if(!validateDraftRequiredFields())return;
  v14EnsureRegistryNo();
  if(currentDraftStep<5){saveDraftV04(false);goDraftStep(currentDraftStep+1);return;}
  saveDraftV04(true);v13LastCompletedDraft=v14AllDrafts().find(x=>x.registryNo===v14ActiveRegistryNo)||draftData();
  toast(`Registry ${v14ActiveRegistryNo} saved`);refreshDashboard();showSaveSuccessModal();
};

function v14DraftVisible(d){
  const s=v14SessionData();if(s.role==='Admin')return true;
  const owner=String(d.ownerAdvocate||d.advocate?.name||'').toLowerCase();
  if(s.role==='Advocate')return owner===String(s.name||'').toLowerCase();
  if(s.role==='Typist')return String(d.createdBy||d.assignedTypist||'').toLowerCase()===String(s.name||'').toLowerCase();
  return false;
}
function v14VisibleDrafts(){return v14AllDrafts().filter(v14DraftVisible);}
function v14CompletedVisible(){return v14VisibleDrafts().filter(d=>d.status==='Completed'&&!d._workingDraft);}

function v14PartyNamesPlain(list,primary){return normalizePartyList(list,primary).map(p=>relationName(p)||p.name||'').filter(Boolean).join(', ');}
function v14DateOnly(d){const iso=d.savedAtISO;if(iso)return iso.slice(0,10);const x=new Date(d.savedAt||'');return isNaN(x)?'':x.toISOString().slice(0,10);}
function populateDraftTypeFilter(){
  const s=document.getElementById('filterRegistryType');if(!s)return;const old=s.value;
  const types=[...new Set(v14VisibleDrafts().map(d=>d.registryType).filter(Boolean))].sort();
  s.innerHTML='<option value="">All Types</option>'+types.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');if(types.includes(old))s.value=old;
}
function clearDraftFilters(){['filterRegistryNo','filterAdvocate','filterVillage','filterSeller','filterBuyer','filterFromDate','filterToDate'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});const t=document.getElementById('filterRegistryType');if(t)t.value='';renderSavedDraftsV14();}
function renderSavedDraftsV14(){
  const box=document.getElementById('savedList');if(!box)return;populateDraftTypeFilter();
  const q=id=>String(document.getElementById(id)?.value||'').trim().toLowerCase();
  const rn=q('filterRegistryNo'),adv=q('filterAdvocate'),vill=q('filterVillage'),sel=q('filterSeller'),buy=q('filterBuyer'),typ=document.getElementById('filterRegistryType')?.value||'',from=val('filterFromDate'),to=val('filterToDate');
  let arr=v14VisibleDrafts().filter(d=>{
    const dt=v14DateOnly(d);return (!rn||String(d.registryNo||'').toLowerCase().includes(rn))&&(!adv||String(d.ownerAdvocate||d.advocate?.name||'').toLowerCase().includes(adv))&&(!vill||String(d.village||'').toLowerCase().includes(vill))&&(!sel||v14PartyNamesPlain(d.sellers,d.seller).toLowerCase().includes(sel))&&(!buy||v14PartyNamesPlain(d.buyers,d.buyer).toLowerCase().includes(buy))&&(!typ||d.registryType===typ)&&(!from||dt>=from)&&(!to||dt<=to);
  });
  const c=document.getElementById('savedResultCount');if(c)c.textContent=`${arr.length} draft${arr.length===1?'':'s'}`;
  if(!arr.length){box.innerHTML='<div class="card"><h3>No matching drafts</h3><p class="hint">Filters clear karke dobara dekhein.</p></div>';return;}
  box.innerHTML=arr.map(d=>`<article class="saved-draft-card">
    <div class="saved-draft-top"><div><span class="registry-no-chip">${esc(d.registryNo||'Legacy Draft')}</span><h3>${esc(d.registryType||'Registry Draft')}</h3><p>${esc(d.village||'-')} • ${esc(d.jurisdiction?.tehsil||'-')} • ${esc(d.ownerAdvocate||d.advocate?.name||'-')}</p></div><span class="status-chip ${d.status==='Completed'?'':'progress'}">${esc(d.status||'Saved')}</span></div>
    <div class="saved-draft-parties"><span><small>Seller</small>${esc(v14PartyNamesPlain(d.sellers,d.seller)||'-')}</span><span><small>Buyer</small>${esc(v14PartyNamesPlain(d.buyers,d.buyer)||'-')}</span><span><small>Date</small>${esc(v14DateOnly(d)||d.savedAt||'-')}</span></div>
    <div class="saved-draft-actions"><button class="btn primary compact" onclick="openSavedRegistry('${esc(d.registryNo)}')">Open Draft</button><button class="btn outline compact" onclick="createNextSaleFromDraft('${esc(d.registryNo)}')">Buyer → Seller / Next Sale</button>${d.status==='Completed'?`<button class="btn soft-blue compact" onclick="openMutationHome('${esc(d.registryNo)}')">Mutation</button>`:''}</div>
  </article>`).join('');
}
openSavedDrafts=function(){showView('savedView');renderSavedDraftsV14();};

function v14Set(id,v){const e=document.getElementById(id);if(!e)return;e.value=v??'';}
function v14ClearExtraParties(type){document.querySelectorAll(`#${type}Party .additional-party-card`).forEach(x=>x.remove());try{renumberPartyCards(type);}catch(e){}}
function v14LoadParties(type,list,primary){
  const arr=normalizePartyList(list,primary);const p=arr[0]||{};
  const pre=type==='seller'?'seller':'buyer';
  v14Set(pre+'Name',p.name);v14Set(pre+'Father',p.father);v14Set(pre+'Relation',relationMeta(p.relation).code);v14Set(pre+'Address',p.address);v14Set(pre+'Pan',p.pan);v14Set(pre+'Aadhaar',p.aadhaar);v14Set(pre+'Email',p.email);v14Set(pre+'Mobile',p.mobile);
  v14ClearExtraParties(type);arr.slice(1).forEach(x=>addParty(type,x));
}
function v14LoadDraftFields(d){
  registrySelectedType=d.registryType||'Residential Plot';
  const lab=document.getElementById('selectedTypeLabel');if(lab)lab.textContent=registrySelectedType;const mini=document.getElementById('draftTypeMini');if(mini)mini.textContent=registrySelectedType;
  v14Set('villageSearch',d.village);v14Set('village',d.village);v14Set('selectedCircleRowId',d.circleRateRowId);v14Set('rateRef',d.rateRef);
  const loc=CIRCLE_RATE_DATA.find(x=>x.id===d.circleRateRowId)||CIRCLE_RATE_DATA.find(x=>x.name===d.village && (!d.jurisdiction?.tehsil||v14CircleRowInTehsil(x,d.jurisdiction.tehsil)));
  if(loc){selectedCircleLocation=loc;populateCircleRateOptions(loc);if(d.circleRateKey)chooseLandRate(d.circleRateKey);}
  v14Set('east',d.east);v14Set('west',d.west);v14Set('north',d.north);v14Set('south',d.south);v14Set('totalAreaSqft',d.areaSqft);areaManualOverride=!!d.areaManualOverride;
  v14Set('khataNo',d.khataNo);v14Set('khasraNo',d.khasraNo);v14Set('houseFlatNo',d.houseFlatNo);v14Set('floorSelect',d.floor);
  v14Set('boundaryEast',d.boundaries?.east);v14Set('boundaryWest',d.boundaries?.west);v14Set('boundaryNorth',d.boundaries?.north);v14Set('boundarySouth',d.boundaries?.south);
  v14LoadParties('seller',d.sellers,d.seller);v14LoadParties('buyer',d.buyers,d.buyer);
  ['witness1','witness2'].forEach(k=>{const w=d[k]||{};v14Set(k+'Name',w.name);v14Set(k+'Father',w.father);v14Set(k+'Relation',relationMeta(w.relation).code);v14Set(k+'Address',w.address);v14Set(k+'Mobile',w.mobile);v14Set(k+'Id',w.id);});
  v14Set('advocateName',d.advocate?.name||d.ownerAdvocate);v14Set('advocateEnrollment',d.advocate?.enrollment);v14Set('advocateMobile',d.advocate?.mobile);v14Set('advocateOffice',d.agri?.advocateOffice);v14Set('photoCertifier',d.agri?.photoCertifier);
  v14Set('transactionAmount',d.transactionAmount);v14Set('advanceAmount',d.advanceAmount);v14Set('stampPageSetting',d.stampPageSetting||'2');v14Set('customStampPage',d.customStampPage||2);v14Set('previousTitleHolderText',d.previousTitleHolderText||'');onStampPageSettingChange();
  const pay=document.getElementById('paymentRows');if(pay){pay.innerHTML='';paymentRowCounter=0;(d.payments||[]).forEach(x=>addPaymentRow(x));if(!(d.payments||[]).length)addPaymentRow();}
  if(d.agri){
    v14Set('pargana',d.agri.pargana);v14Set('tehsil',d.agri.tehsil);v14Set('district',d.agri.district);v14Set('propertyLatitude',d.agri.latitude);v14Set('propertyLongitude',d.agri.longitude);v14Set('annualLagan',d.agri.annualLagan||5.06);v14Set('executionDate',d.agri.executionDate);v14Set('stampSheetCount',d.agri.stampSheetCount);v14Set('agreementStampPaid',d.agri.agreementStampPaid);
    const body=document.getElementById('agriGataRows');if(body){body.innerHTML='';agriGataCounter=0;(d.agri.gataRows||[]).forEach(x=>addAgriGataRow(x));}
  }
  applyDraftTypeFieldVisibility();try{recalculate();recalculateStampDuty();syncDraftPreview();}catch(e){console.warn('load draft preview',e);}
}
function openSavedRegistry(registryNo){
  const d=v14AllDrafts().find(x=>x.registryNo===registryNo);if(!d||!v14DraftVisible(d)){toast('Draft access not available for this login');return;}
  v14LoadingDraft=true;v14ActiveRegistryNo=d.registryNo;v14LastOpenedDraft=d;
  const ctx=d.jurisdiction;if(ctx)v14WriteJSON('registryProJurisdiction',ctx);
  openNewRegistry();document.getElementById('draftTypeScreen')?.classList.remove('active');document.getElementById('draftStepsScreen')?.classList.add('active');
  v14LoadDraftFields(d);goDraftStep(1);updateDraftJurisdictionContext();updateDraftNumberMini();v14LoadingDraft=false;toast(`Opened ${registryNo}`);
}
function compactPartiesPlain(list,primary){
  const holder=document.createElement('div');holder.innerHTML=compactPartiesHtml(list,primary,'');return holder.textContent.replace(/\s+/g,' ').trim();
}
function createNextSaleFromDraft(registryNo){
  const src=v14AllDrafts().find(x=>x.registryNo===registryNo);if(!src||!v14DraftVisible(src)){toast('Source draft not available');return;}
  const d=JSON.parse(JSON.stringify(src));
  d.sourceRegistryNo=src.registryNo;d.previousTitleHolderText=compactPartiesPlain(src.buyers,src.buyer);d.sellers=JSON.parse(JSON.stringify(normalizePartyList(src.buyers,src.buyer)));d.seller=d.sellers[0]||{};
  d.buyers=[{name:'',father:'',relation:'S/O',address:'',pan:'',aadhaar:'',email:'',mobile:''}];d.buyer=d.buyers[0];
  d.transactionAmount=0;d.advanceAmount=0;d.stampDuty=0;d.payments=[];delete d.registryNo;delete d.savedAtISO;d.status='In Progress';d._workingDraft=true;
  v14LoadingDraft=true;v14ActiveRegistryNo=null;openNewRegistry();registrySelectedType=src.registryType||'Residential Plot';v14EnsureRegistryNo();document.getElementById('draftTypeScreen')?.classList.remove('active');document.getElementById('draftStepsScreen')?.classList.add('active');v14LoadDraftFields(d);v14Set('previousTitleHolderText',d.previousTitleHolderText);goDraftStep(2);updateDraftNumberMini();v14LoadingDraft=false;saveDraftV04(false);toast(`New draft ${v14ActiveRegistryNo}: old Buyer is now Seller`);
}

// Tehsil-specific circle-rate rows.
function v14CircleRowInTehsil(row,tehsil=currentJurisdiction().tehsil){
  const cfg=V14_JURISDICTIONS?.Uttarakhand?.Haridwar?.[tehsil];if(!cfg)return false;
  return cfg.sectionPrefixes.some(p=>String(row.section||'').startsWith(p));
}
filterCircleLocations=function(){
  const input=document.getElementById('villageSearch'),box=document.getElementById('villageSuggestions');if(!input||!box)return;
  const q=circleNorm(input.value),qRoman=String(input.value||'').toLowerCase().replace(/[^a-z0-9]/g,''),qSkeleton=latinSkeleton(input.value),tehsil=currentJurisdiction().tehsil;
  let rows=CIRCLE_RATE_DATA.filter(e=>v14CircleRowInTehsil(e,tehsil)).filter(e=>{const hay=circleSearchText(e);return !q||hay.includes(q)||(qRoman&&hay.includes(qRoman))||(qSkeleton&&hay.includes(qSkeleton));}).slice(0,24);
  if(!rows.length){box.innerHTML=`<div class="location-empty">${esc(tehsil)} ki mapped rate list me match nahi mila.</div>`;box.classList.add('show');return;}
  const k=defaultRateKey();box.innerHTML=rows.map(e=>`<button type="button" class="location-option" onclick="selectCircleLocation('${e.id}')"><span><strong>${esc(e.name)}</strong><small>${esc(e.section)} • PDF page ${e.page} • श्रेणी ${esc(e.group)}</small></span><span class="rate-chip">${formatRateValue(k,e[k])}</span></button>`).join('');box.classList.add('show');
};
const _v14SelectCircleLocationBase=selectCircleLocation;
selectCircleLocation=function(id){
  const row=CIRCLE_RATE_DATA.find(x=>x.id===id);if(row&&!v14CircleRowInTehsil(row)){toast('Ye location selected tehsil ki rate list me nahi hai');return;}
  _v14SelectCircleLocationBase(id);const ctx=currentJurisdiction();v14Set('tehsil',v14HindiTehsil(ctx.tehsil));v14Set('district',v14HindiDistrict(ctx.district));scheduleV14Autosave();
};

// Compact grouped Seller/Buyer writing: common father + common address => नाम..., पुत्रगण..., निवासीगण...
function compactIdentityTrail(arr){
  const parts=arr.map(p=>{const x=[];if(p.aadhaar)x.push(`Aadhaar ${esc(p.aadhaar)}`);if(p.mobile)x.push(`Mobile ${esc(p.mobile)}`);if(p.email)x.push(`Email ${esc(p.email)}`);return x.length?`${esc(relationName(p)||p.name)} — ${x.join(', ')}`:'';}).filter(Boolean);
  return parts.length?` <span class="party-id-trail">(${parts.join('; ')})</span>`:'';
}
function compactGroupHtml(arr){
  if(arr.length===1)return personLine(arr[0]);
  const names=arr.map(p=>esc(relationName(p)||p.name||'[नाम]')).join(', ');
  const codes=[...new Set(arr.map(p=>relationMeta(p.relation).code))];
  let rel='सन्तानगण';if(codes.length===1&&codes[0]==='S/O')rel='पुत्रगण';else if(codes.length===1&&codes[0]==='D/O')rel='पुत्रीगण';
  return `${names}, ${rel} ${esc(arr[0].father||'[पिता का नाम]')}, निवासीगण ${esc(arr[0].address||'[पता]')}${compactIdentityTrail(arr)}`;
}
function compactPartiesHtml(list,primary,label){
  const arr=normalizePartyList(list,primary).filter(Boolean);if(!arr.length)return '[नाम / पता]';
  const used=new Set(),out=[];
  arr.forEach((p,i)=>{
    if(used.has(i))return;const m=relationMeta(p.relation),canGroup=['S/O','D/O'].includes(m.code)&&p.father&&p.address;
    if(canGroup){
      const grp=arr.map((x,j)=>({x,j})).filter(z=>!used.has(z.j)&&['S/O','D/O'].includes(relationMeta(z.x.relation).code)&&String(z.x.father||'').trim().toLowerCase()===String(p.father).trim().toLowerCase()&&String(z.x.address||'').trim().toLowerCase()===String(p.address).trim().toLowerCase());
      if(grp.length>1){grp.forEach(z=>used.add(z.j));out.push(compactGroupHtml(grp.map(z=>z.x)));return;}
    }
    used.add(i);out.push(personLine(p));
  });
  return out.map((x,i)=>`${out.length>1?`${esc(label||'पक्षकार')} ${i+1} — `:''}${x}`).join('<br>');
}
partiesPersonLines=function(list,label){return compactPartiesHtml(list,null,label);};

// Smart Hindi typing: 4 candidates, arrow selection, Space/Enter accepts highlighted option.
shouldHindiAuto=function(){return false;}; // disable v1.3 one-shot converter; v1.4 chooser owns text conversion.
const V14_HINDI_CANDIDATES={
  roorkee:['रुड़की','रूड़की','रुड़की','रूरकी'],bhagwanpur:['भगवानपुर','भगवानपूर','भगवानपुरा','भगवानपुर्'],haridwar:['हरिद्वार','हरिदवार','हरिद्वार्','हरीद्वार'],
  sikanderpur:['सिकन्दरपुर','सिकंदरपुर','सिकन्दरपूर','सिकंदरपूर'],bhainswal:['भैंसवाल','भैसवाल','भैंसवाला','भेंसवाल'],chanchak:['चांचक','चंचक','चानचक','चांचक्'],majra:['माजरा','मजरा','माज़रा','माजराा'],
  salman:['सलमान','सलमान्','सालमान','सल्मान'],khan:['खान','ख़ान','खान्','खाँ'],rajendra:['राजेन्द्र','राजेंद्र','राजेन्दर','राजेन्द्र्'],nirmal:['निर्मल','निरमल','निर्मल्','नीर्मल']
};
let v14HindiBox=null,v14HindiField=null,v14HindiToken='',v14HindiStart=0,v14HindiIndex=0,v14HindiCandidates=[];
function v14HindiPrefs(){return v14ReadJSON('registryProHindiPrefs',{});}
function v14ShouldHindi(el){
  if(!el||!el.matches('input,textarea')||el.dataset.noHindi==='true'||el.readOnly||el.disabled)return false;
  const type=(el.type||'text').toLowerCase();if(['number','date','email','tel','password','file','hidden','checkbox','radio'].includes(type))return false;
  const key=((el.id||'')+' '+(el.className||'')).toLowerCase();
  if(/advocate|enrollment|aadhaar|aadhar|mobile|phone|email|pan|gst|ref|utr|rtgs|cheque|transaction|latitude|longitude|rera|rate|amount|area|qty|value|number|khasra|gata|chak|bank|branch|search|rowid|sheetcount/.test(key))return false;
  return true;
}
function v14Unique(a){return [...new Set(a.filter(Boolean))];}
function v14GenericHindiVariants(word){
  const base=romanHindiWord(word);const vars=[base];
  const swaps=[['ु','ू'],['ू','ु'],['ि','ी'],['ी','ि'],['े','ै'],['ै','े'],['ड़','ड'],['ड','ड़'],['ं','ँ']];
  swaps.forEach(([a,b])=>{if(base.includes(a))vars.push(base.replace(a,b));});
  if(base.length>1)vars.push(base+'्');
  vars.push(base.replace(/ा/,'').replace(/्$/,''));
  return v14Unique(vars);
}
function v14HindiOptions(word){
  const key=String(word||'').toLowerCase();const pref=v14HindiPrefs()[key];let a=[];
  if(pref)a.push(pref);if(V14_HINDI_CANDIDATES[key])a.push(...V14_HINDI_CANDIDATES[key]);a.push(V13_HINDI_WORDS[key]);a.push(...v14GenericHindiVariants(word));
  a=v14Unique(a);
  while(a.length<4){a.push((a[0]||romanHindiWord(word))+['','ा','्','ं'][a.length]||romanHindiWord(word));a=v14Unique(a);}
  return a.slice(0,6);
}
function ensureHindiBox(){
  if(v14HindiBox)return v14HindiBox;v14HindiBox=document.createElement('div');v14HindiBox.className='hindi-suggest-popover';document.body.appendChild(v14HindiBox);return v14HindiBox;
}
function hideHindiSuggestions(){if(v14HindiBox)v14HindiBox.classList.remove('show');v14HindiField=null;}
function positionHindiBox(el){const b=ensureHindiBox(),r=el.getBoundingClientRect();b.style.left=Math.max(8,r.left)+'px';b.style.top=Math.min(window.innerHeight-220,r.bottom+5)+'px';b.style.width=Math.max(240,Math.min(r.width,420))+'px';}
function renderHindiSuggestions(el,word,start){
  v14HindiField=el;v14HindiToken=word;v14HindiStart=start;v14HindiCandidates=v14HindiOptions(word);v14HindiIndex=0;const b=ensureHindiBox();positionHindiBox(el);
  b.innerHTML=`<div class="hindi-suggest-head"><strong>Hindi suggestions</strong><small>Space / Enter = select</small></div>`+v14HindiCandidates.slice(0,4).map((x,i)=>`<button type="button" class="hindi-suggest-option ${i===0?'active':''}" data-i="${i}" onmousedown="event.preventDefault();acceptHindiSuggestion(${i},true)"><b>${i+1}</b><span>${esc(x)}</span></button>`).join('');b.classList.add('show');
}
function updateHindiActive(){v14HindiBox?.querySelectorAll('.hindi-suggest-option').forEach((x,i)=>x.classList.toggle('active',i===v14HindiIndex));}
function acceptHindiSuggestion(index=v14HindiIndex,addSpace=false){
  const el=v14HindiField;if(!el)return;const choice=v14HindiCandidates[index]||v14HindiCandidates[0];if(!choice)return;
  const caret=el.selectionStart??el.value.length;const before=el.value.slice(0,v14HindiStart),after=el.value.slice(caret);el.value=before+choice+(addSpace?' ':'')+after;const pos=(before+choice+(addSpace?' ':'')).length;el.setSelectionRange?.(pos,pos);
  const prefs=v14HindiPrefs();prefs[v14HindiToken.toLowerCase()]=choice;v14WriteJSON('registryProHindiPrefs',prefs);hideHindiSuggestions();try{syncDraftPreview();}catch(e){}scheduleV14Autosave();
}
document.addEventListener('input',e=>{
  const el=e.target;if(!v14ShouldHindi(el))return;const caret=el.selectionStart??el.value.length,left=el.value.slice(0,caret),m=left.match(/([A-Za-z]{2,})$/);
  if(m)renderHindiSuggestions(el,m[1],caret-m[1].length);else hideHindiSuggestions();
},true);
document.addEventListener('keydown',e=>{
  if(!v14HindiField||e.target!==v14HindiField||!v14HindiBox?.classList.contains('show'))return;
  if(e.key==='ArrowDown'){e.preventDefault();v14HindiIndex=(v14HindiIndex+1)%Math.min(4,v14HindiCandidates.length);updateHindiActive();}
  else if(e.key==='ArrowUp'){e.preventDefault();v14HindiIndex=(v14HindiIndex-1+Math.min(4,v14HindiCandidates.length))%Math.min(4,v14HindiCandidates.length);updateHindiActive();}
  else if(e.key===' '||e.key==='Enter'){e.preventDefault();acceptHindiSuggestion(v14HindiIndex,true);}
  else if(e.key==='Escape')hideHindiSuggestions();
},true);
document.addEventListener('focusout',e=>{if(e.target===v14HindiField)setTimeout(hideHindiSuggestions,120);},true);
window.addEventListener('resize',()=>{if(v14HindiField)positionHindiBox(v14HindiField);});

// Page border + footer + advocate English + Registry No. on every preview page.
function applyDraftPageChrome(){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;
  let pages=[...legal.querySelectorAll('.deed-page')];
  if(!pages.length && legal.children.length){const wrap=document.createElement('div');wrap.className='deed-document standard-deed';const page=document.createElement('section');page.className='deed-page standard-deed-page';while(legal.firstChild)page.appendChild(legal.firstChild);wrap.appendChild(page);legal.appendChild(wrap);pages=[page];}
  const d=draftData(),stamp=selectedStampPage();
  pages.forEach((page,i)=>{
    page.querySelectorAll(':scope > .registry-page-footer,:scope > .stamp-reserve').forEach(x=>x.remove());page.classList.remove('stamp-selected-page','stamp-normal-page');
    if(page.classList.contains('deed-page-2')&&stamp!==2)page.classList.add('stamp-normal-page');
    if(stamp===i+1){page.classList.add('stamp-selected-page');const needsSpacer=!(i+1===2&&page.classList.contains('deed-page-2'));if(needsSpacer){const sp=document.createElement('div');sp.className='stamp-reserve';sp.innerHTML='<span>STAMP PAPER SPACE</span>';page.prepend(sp);}}
    const f=document.createElement('div');f.className='registry-page-footer';f.innerHTML=`<span>Advocate: <b>${esc(d.advocate?.name||d.ownerAdvocate||'-')}</b></span><span class="registry-footer-center"><strong>Registry Pro</strong><small>Registry No.: ${esc(d.registryNo||v14ActiveRegistryNo||'-')}</small></span><span>Page ${i+1}/${pages.length}</span>`;page.appendChild(f);
  });
}
const _v14SyncDraftPreviewBase=syncDraftPreview;
syncDraftPreview=function(){_v14SyncDraftPreviewBase();try{applyDraftPageChrome();}catch(e){console.warn('page chrome',e);}};

// True .docx writer (Unicode Devanagari, A4, page border, footer). No PDF-to-Word conversion.
function v14Xml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));}
function v14TextParasFromElement(root){
  const pages=[...root.querySelectorAll('.deed-page')];const use=pages.length?pages:[root];const out=[];
  use.forEach((page,pi)=>{
    const picked=[...page.querySelectorAll('h1,h2,.deed-top-grid>div,p,.finger-block')].filter(el=>!el.closest('.registry-page-footer')&&!el.closest('.stamp-reserve'));
    const seen=new Set();picked.forEach(el=>{if(seen.has(el))return;seen.add(el);let text=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();if(!text)return;out.push({text,heading:/^H[12]$/.test(el.tagName),center:/center-clause/.test(el.className)||/^H[12]$/.test(el.tagName),page:pi});});
    if(pi<use.length-1)out.push({pageBreak:true,page:pi});
  });return out;
}
function v14WordRun(text,bold=false,size=24){return `<w:r><w:rPr><w:rFonts w:ascii="Nirmala UI" w:hAnsi="Nirmala UI" w:eastAsia="Nirmala UI" w:cs="Nirmala UI"/>${bold?'<w:b/>':''}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${v14Xml(text)}</w:t></w:r>`;}
function v14WordParagraph(x){if(x.pageBreak)return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';const jc=x.center?'center':'both';return `<w:p><w:pPr><w:jc w:val="${jc}"/><w:spacing w:after="80" w:line="300" w:lineRule="auto"/></w:pPr>${v14WordRun(x.text,!!x.heading,x.heading?30:24)}</w:p>`;}
function v14DocxParts(root,d,title='Registry Pro'){
  const paras=v14TextParasFromElement(root).map(v14WordParagraph).join('');
  const borderColor='2F8F5B';
  const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${paras}<w:sectPr><w:footerReference w:type="default" r:id="rId1"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1020" w:bottom="1134" w:left="1020" w:header="500" w:footer="500" w:gutter="0"/><w:pgBorders w:offsetFrom="page" w:display="allPages"><w:top w:val="double" w:sz="12" w:space="20" w:color="${borderColor}"/><w:left w:val="double" w:sz="12" w:space="20" w:color="${borderColor}"/><w:bottom w:val="double" w:sz="12" w:space="20" w:color="${borderColor}"/><w:right w:val="double" w:sz="12" w:space="20" w:color="${borderColor}"/></w:pgBorders></w:sectPr></w:body></w:document>`;
  const footer=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr>${v14WordRun(`Advocate: ${d.advocate?.name||d.ownerAdvocate||'-'}   |   Registry Pro   |   Registry No.: ${d.registryNo||v14ActiveRegistryNo||'-'}   |   Page `,true,18)}<w:fldSimple w:instr="PAGE"><w:r><w:t>1</w:t></w:r></w:fldSimple>${v14WordRun(' of ',false,18)}<w:fldSimple w:instr="NUMPAGES"><w:r><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>`;
  const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Nirmala UI" w:hAnsi="Nirmala UI" w:eastAsia="Nirmala UI" w:cs="Nirmala UI"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style></w:styles>`;
  return {
    '[Content_Types].xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>`,
    '_rels/.rels':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    'word/document.xml':documentXml,
    'word/styles.xml':styles,
    'word/footer1.xml':footer,
    'word/_rels/document.xml.rels':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
  };
}
const V14_CRC_TABLE=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function v14Crc32(bytes){let c=0xFFFFFFFF;for(const b of bytes)c=V14_CRC_TABLE[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function v14Le16(n){return [n&255,(n>>>8)&255];}function v14Le32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];}
function v14Concat(chunks){const len=chunks.reduce((a,x)=>a+x.length,0),o=new Uint8Array(len);let p=0;chunks.forEach(x=>{o.set(x,p);p+=x.length;});return o;}
function v14ZipStore(files){
  const enc=new TextEncoder(),locals=[],centrals=[];let offset=0,count=0;
  Object.entries(files).forEach(([name,text])=>{const nb=enc.encode(name),data=enc.encode(text),crc=v14Crc32(data),flags=0x0800;const lh=new Uint8Array([...v14Le32(0x04034b50),...v14Le16(20),...v14Le16(flags),...v14Le16(0),...v14Le16(0),...v14Le16(0),...v14Le32(crc),...v14Le32(data.length),...v14Le32(data.length),...v14Le16(nb.length),...v14Le16(0),...nb]);locals.push(lh,data);const ch=new Uint8Array([...v14Le32(0x02014b50),...v14Le16(20),...v14Le16(20),...v14Le16(flags),...v14Le16(0),...v14Le16(0),...v14Le16(0),...v14Le32(crc),...v14Le32(data.length),...v14Le32(data.length),...v14Le16(nb.length),...v14Le16(0),...v14Le16(0),...v14Le16(0),...v14Le16(0),...v14Le32(0),...v14Le32(offset),...nb]);centrals.push(ch);offset+=lh.length+data.length;count++;});
  const central=v14Concat(centrals),body=v14Concat(locals),end=new Uint8Array([...v14Le32(0x06054b50),...v14Le16(0),...v14Le16(0),...v14Le16(count),...v14Le16(count),...v14Le32(central.length),...v14Le32(body.length),...v14Le16(0)]);return v14Concat([body,central,end]);
}
function downloadDocxFromElement(root,d,filename){const bytes=v14ZipStore(v14DocxParts(root,d));const blob=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
openCurrentDraftWord=function(){
  syncDraftPreview();const legal=document.getElementById('legalDraftPreview');if(!legal){toast('Preview not ready');return;}const d=v13LastCompletedDraft||v14LastOpenedDraft||draftData();if(!d.registryNo)d.registryNo=v14ActiveRegistryNo||v14EnsureRegistryNo();downloadDocxFromElement(legal,d,`Registry_Pro_${safeFilePart(d.registryNo)}.docx`);closeSaveSuccessModal();toast('Editable Unicode Word (.docx) downloaded');if(document.getElementById('mutationAfterSave')?.checked)setTimeout(()=>openMutationHome(d.registryNo),200);
};
saveCurrentDraftPdf=function(){
  closeSaveSuccessModal();goDraftStep(5);syncDraftPreview();const d=v13LastCompletedDraft||v14LastOpenedDraft||draftData();setTimeout(()=>{window.print();if(document.getElementById('mutationAfterSave')?.checked)setTimeout(()=>openMutationHome(d.registryNo||v14ActiveRegistryNo),150);},80);
};

// Mutation document workflow: registry data auto-map now; exact supplied format plugs into this renderer later.
function mutationDraftOptions(){return v14CompletedVisible();}
function openMutationHome(registryNo=''){
  showView('mutationView');const sel=document.getElementById('mutationRegistrySelect'),arr=mutationDraftOptions();if(sel){sel.innerHTML='<option value="">Select completed registry</option>'+arr.map(d=>`<option value="${esc(d.registryNo)}">${esc(d.registryNo)} — ${esc(d.village||'')} — ${esc(d.registryType||'')}</option>`).join('');if(registryNo&&arr.some(d=>d.registryNo===registryNo))sel.value=registryNo;}
  if(registryNo)loadMutationRegistry(registryNo);else{const p=document.getElementById('mutationDocumentPreview');if(p)p.innerHTML='<div class="empty-party-records">Completed registry select karein. Registry se party/property details auto-fill hongi.</div>';}
}
function openMutationFromLastDraft(){const d=v13LastCompletedDraft||v14LastOpenedDraft||draftData();closeSaveSuccessModal();openMutationHome(d.registryNo||v14ActiveRegistryNo);}
function mutationHtml(d){
  const seller=compactPartiesHtml(d.sellers,d.seller,'विक्रेता'),buyer=compactPartiesHtml(d.buyers,d.buyer,'क्रेता');const area=d.agri?.totalAreaHa?`${Number(d.agri.totalAreaHa).toFixed(4)} हेक्टेयर`:`${Number(d.areaSqft||0).toFixed(2)} sq.ft.`;
  return `<div class="mutation-doc"><div class="mutation-template-badge">MUTATION TEMPLATE MAPPING • exact supplied format pending</div><h1>दाखिल-खारिज / Mutation Documents</h1><div class="mutation-meta"><b>Registry No.:</b> ${esc(d.registryNo)} &nbsp; <b>Date:</b> ${esc(v14DateOnly(d)||'-')} &nbsp; <b>Tehsil:</b> ${esc(d.jurisdiction?.tehsil||'-')}</div><p><b>विक्रेता:</b> ${seller}</p><p><b>क्रेता:</b> ${buyer}</p><p><b>सम्पत्ति:</b> ग्राम ${esc(d.village||'-')}, खाता ${esc(d.khataNo||'-')}, खसरा/गाटा ${esc(d.khasraNo||(d.agri?.gataRows||[]).map(x=>x.gata).filter(Boolean).join(', ')||'-')}, रकबा ${esc(area)}।</p><p><b>सीमायें:</b> पूरब ${esc(d.boundaries?.east||'-')}, पश्चिम ${esc(d.boundaries?.west||'-')}, उत्तर ${esc(d.boundaries?.north||'-')}, दक्षिण ${esc(d.boundaries?.south||'-')}।</p><p><b>बैनामा / मूल्य:</b> ${inr(d.transactionAmount||0)} &nbsp; <b>Advocate:</b> ${esc(d.ownerAdvocate||d.advocate?.name||'-')}</p><div class="mutation-placeholder-fields"><label>Mutation Case / Application No. <input placeholder="Format ke hisaab se fill hoga"></label><label>Registry Book / Volume / Page <input placeholder="Format ke hisaab se fill hoga"></label></div><p class="mutation-note">Aap mutation ka original format denge to isi auto-mapped data ko exact boxes/lines me place kiya jayega; party/property dobara type nahi karni padegi.</p></div>`;
}
function loadMutationRegistry(registryNo){const d=mutationDraftOptions().find(x=>x.registryNo===registryNo),p=document.getElementById('mutationDocumentPreview');if(!d||!p)return;p.innerHTML=mutationHtml(d);const t=document.getElementById('mutationRegistryTitle');if(t)t.textContent=`${d.registryNo} • ${d.village||''} • ${d.registryType||''}`;v14LastOpenedDraft=d;}
function printMutationDocuments(){const p=document.getElementById('mutationDocumentPreview');if(!p||!p.querySelector('.mutation-doc')){toast('Pehle registry select karein');return;}document.body.classList.add('print-mutation');setTimeout(()=>{window.print();document.body.classList.remove('print-mutation');},50);}
function downloadMutationWord(){const p=document.getElementById('mutationDocumentPreview'),d=v14LastOpenedDraft;if(!p?.querySelector('.mutation-doc')||!d){toast('Pehle registry select karein');return;}downloadDocxFromElement(p,d,`Mutation_${safeFilePart(d.registryNo)}.docx`);toast('Mutation Word downloaded');}

// Advocate / Typist management.
function openAdvocatesHome(){showView('advocatesView');renderAdvocateList();}
function renderAdvocateList(){const b=document.getElementById('advocateList');if(!b)return;const arr=getAdvocates();b.innerHTML=arr.map(a=>`<div class="management-row"><div><strong>${esc(a.name)}</strong><small>${esc(a.enrollment||'No enrollment')} • ${esc(a.mobile||'No mobile')}</small></div><span>Default Stamp: ${esc(a.stampPage||'2')}</span></div>`).join('')||'<div class="empty-party-records">No advocates added.</div>';}
function saveManagedAdvocate(){const name=val('manageAdvocateName');if(!name){toast('Advocate Name required');return;}const arr=getAdvocates();let a=arr.find(x=>x.name.toLowerCase()===name.toLowerCase());const data={name,enrollment:val('manageAdvocateEnrollment'),mobile:val('manageAdvocateMobile'),stampPage:val('manageAdvocateStamp')||'2'};if(a)Object.assign(a,data);else arr.push(data);v14WriteJSON('registryProAdvocates',arr);refreshAdvocateSelects();renderAdvocateList();toast('Advocate saved');}
function openTypistsHome(){showView('typistsView');refreshAdvocateSelects();renderTypistList();}
function renderTypistList(){const b=document.getElementById('typistList');if(!b)return;const arr=getTypists();b.innerHTML=arr.map(a=>`<div class="management-row"><div><strong>${esc(a.name)}</strong><small>${esc(a.login||'')}</small></div><span>Advocate: ${esc(a.advocateName||'-')}</span></div>`).join('')||'<div class="empty-party-records">No staff added.</div>';}
function saveManagedTypist(){const name=val('manageTypistName');if(!name){toast('Staff Name required');return;}const arr=getTypists();let a=arr.find(x=>x.name.toLowerCase()===name.toLowerCase());const data={name,login:val('manageTypistLogin'),advocateName:val('manageTypistAdvocate')};if(a)Object.assign(a,data);else arr.push(data);v14WriteJSON('registryProTypists',arr);renderTypistList();toast('Staff saved');}

function openSimpleManagement(title,html){showView('simpleManagementView');const t=document.getElementById('simpleManagementTitle');if(t)t.textContent=title;const b=document.getElementById('simpleManagementBody');if(b)b.innerHTML=html;}
function openPropertiesHome(){const arr=v14CompletedVisible();openSimpleManagement('Properties',arr.length?`<div class="management-list">${arr.map(d=>`<div class="management-row"><div><strong>${esc(d.village||'-')} • ${esc(d.khasraNo||(d.agri?.gataRows||[]).map(x=>x.gata).join(', ')||'-')}</strong><small>${esc(d.registryNo)} • ${esc(d.registryType)}</small></div><button class="btn outline compact" onclick="openSavedRegistry('${esc(d.registryNo)}')">Open</button></div>`).join('')}</div>`:'<div class="empty-party-records">Completed registry se property records automatically yahan aayenge.</div>');}
function openMutationHomeButton(){openMutationHome();}
function openCircleRateManager(){const c=currentJurisdiction(),cfg=jurisdictionConfig(c),count=CIRCLE_RATE_DATA.filter(x=>v14CircleRowInTehsil(x,c.tehsil)).length;openSimpleManagement('Circle Rate Lists',`<h3>${esc(c.state)} → ${esc(c.district)} → ${esc(c.tehsil)}</h3><p class="hint">Mapped locations: <b>${count}</b>. Current source: <b>${cfg?.ratePdf||'Not mapped'}</b>.</p><button class="btn primary" onclick="window.open('${esc(cfg?.ratePdf||'data/states/uttarakhand/haridwar/pdfs/circle_rates_roorkee.pdf')}','_blank')">Open Rate List PDF</button><p class="hint">Nayi tehsil ki PDF upload/mapping ke baad State → District → Tehsil list me activate ki ja sakti hai.</p>`);}
function openReportsHome(){const a=v14VisibleDrafts(),done=a.filter(x=>x.status==='Completed'),today=new Date().toISOString().slice(0,10),td=a.filter(x=>v14DateOnly(x)===today);openSimpleManagement('Reports',`<div class="report-print-bar"><button class="btn primary compact" onclick="window.print()">Print Report</button></div><div class="report-mini-grid"><div><small>Total Drafts</small><strong>${a.length}</strong></div><div><small>Completed</small><strong>${done.length}</strong></div><div><small>Today</small><strong>${td.length}</strong></div><div><small>Advocate</small><strong>${esc(v14SessionData().advocateName||v14SessionData().name||'-')}</strong></div></div>`);}
function openRecycleBin(){openSimpleManagement('Recycle Bin','<div class="empty-party-records">Deleted drafts yahan restore option ke saath rahenge. Current v1.4 me delete action intentionally enabled nahi hai, isliye accidental data loss nahi hoga.</div>');}
function openSettingsHome(){const c=currentJurisdiction(),s=v14SessionData();openSimpleManagement('Settings',`<h3>Current Office Context</h3><p><b>${esc(c.state)} → ${esc(c.district)} → ${esc(c.tehsil)}</b></p><p>Login: <b>${esc(s.name||'-')}</b> • Role: <b>${esc(s.role||'-')}</b> • Advocate: <b>${esc(s.advocateName||s.name||'-')}</b></p><button class="btn primary" onclick="showJurisdiction()">Change State / District / Tehsil / Role</button><h3 style="margin-top:20px">Theme</h3><p class="hint">White base + Orange + Light Green + Blue accents are active.</p>`);}
// HTML nav calls this name.
function openMutationHomeFromNav(){openMutationHome();}

// Override generic nav binding name safely.
const _v14OpenMutationHomeRef=openMutationHome;
// openMutationHome already handles no argument and is used by nav/actions.

// Dashboard now uses only drafts visible to current Advocate/Typist.
const _v14RefreshDashboardBase=refreshDashboard;
refreshDashboard=function(){
  try{_v14RefreshDashboardBase();}catch(e){}
  const arr=v14VisibleDrafts(),completed=arr.filter(x=>x.status==='Completed'&&!x._workingDraft);const today=new Date().toISOString().slice(0,10),month=today.slice(0,7);
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};set('statTotalDrafts',arr.length);set('statSavedDrafts',arr.filter(x=>x.status!=='Completed').length);set('statTotalParties',completedPartyRecords('seller').length+completedPartyRecords('buyer').length);set('ovCreated',arr.filter(x=>v14DateOnly(x).startsWith(month)).length);
  const box=document.getElementById('recentDrafts');if(box){box.innerHTML=arr.slice(0,5).map(d=>`<div class="recent-item" onclick="openSavedRegistry('${esc(d.registryNo||'')}')"><div class="recent-doc">▤</div><div class="recent-main"><strong>${esc(d.registryType||'Draft')} — ${esc(d.village||'-')}</strong><small>${esc(d.registryNo||'Legacy')} • ${esc(v14DateOnly(d)||d.savedAt||'')}</small></div><span class="status-chip ${d.status==='Completed'?'':'progress'}">${esc(d.status||'Saved')}</span><div class="more-dot">›</div></div>`).join('')||'<div class="empty-recent">No draft yet.<br>Create your first Registry Draft.</div>';}
};
completedPartyRecords=function(type){
  const out=[];v14CompletedVisible().forEach(d=>{const list=type==='seller'?normalizePartyList(d.sellers,d.seller):normalizePartyList(d.buyers,d.buyer);list.filter(Boolean).forEach((p,i)=>out.push({type,party:p,draft:d,index:i}));});return out;
};

// Final init.
document.addEventListener('DOMContentLoaded',()=>{
  bootstrapOfficeProfiles();
  document.getElementById('advocateName')?.setAttribute('data-no-hindi','true');
  document.getElementById('manageAdvocateName')?.setAttribute('data-no-hindi','true');
  updateDraftJurisdictionContext();onSessionRoleChange();onStampPageSettingChange();
  // Smart party writing style control.
  const tabs=document.querySelector('#draftStep2 .party-tabs');if(tabs&&!document.getElementById('partyWritingStyle')){const wrap=document.createElement('div');wrap.className='party-writing-style';wrap.innerHTML='<label>Party Writing Style</label><select id="partyWritingStyle"><option value="auto">Auto Compact — common father/address grouped</option><option value="individual">Individual Full Detail</option></select>';tabs.parentElement?.insertBefore(wrap,tabs);wrap.querySelector('select').addEventListener('change',syncDraftPreview);}
  // Respect current style by switching renderer dynamically.
  refreshDashboard();
});

// If user chooses Individual Full Detail, bypass compact grouping.
const _v14CompactPartiesPersonLines=partiesPersonLines;
partiesPersonLines=function(list,label){
  if(document.getElementById('partyWritingStyle')?.value==='individual'){
    const arr=normalizePartyList(list,null);return arr.length?arr.map((p,i)=>`${arr.length>1?`${esc(label)} ${i+1} — `:''}${personLine(p)}`).join('<br>'):'[नाम / पता]';
  }
  return _v14CompactPartiesPersonLines(list,label);
};


/* ===== v1.5 ALL USER-REQUESTED FIXES =====
   - In-draft State/District/Tehsil switching + tehsil-specific circle rates
   - Smaller deed buttons for future expansion
   - Hindi suggestion freeze fix + lighter preview updates
   - Cleaner Saved Drafts back navigation
   - Compact Seller/Buyer party search + real Add New Party master
   - Property opening-balance ledger + automatic sale/buy balance reporting
   - Stamp-page border only around written matter
   - Both-hand (10) fingerprint boxes for every Seller/Buyer
   - Party photo boxes + witness detail boxes
   - Payment receipt table inside deed
   - Improved structured Unicode DOCX with tables, page sections and Word compatibility mode
*/

let v15PreviewTimer=null;
const v15SyncPreviewImmediate=syncDraftPreview;
function syncDraftPreviewNow(){
  clearTimeout(v15PreviewTimer);
  return v15SyncPreviewImmediate();
}
syncDraftPreview=function(){
  clearTimeout(v15PreviewTimer);
  v15PreviewTimer=setTimeout(()=>{try{v15SyncPreviewImmediate();}catch(e){console.warn('preview',e);}},120);
};

// FIX: old v1.4 filler could loop forever for short roman words such as "ra".
v14HindiOptions=function(word){
  const raw=String(word||'').trim(), key=raw.toLowerCase();
  const pref=v14HindiPrefs()[key];
  let seed=[];
  if(pref) seed.push(pref);
  if(V14_HINDI_CANDIDATES[key]) seed.push(...V14_HINDI_CANDIDATES[key]);
  if(V13_HINDI_WORDS[key]) seed.push(V13_HINDI_WORDS[key]);
  seed.push(...v14GenericHindiVariants(raw));
  const base=romanHindiWord(raw)||raw;
  seed.push(base,base+'ा',base+'ि',base+'ी',base+'ु',base+'ू',base+'े',base+'ै',base+'ं',base+'्');
  const out=v14Unique(seed).filter(Boolean);
  // Always return quickly; never spin waiting for four unique variants.
  while(out.length<4) out.push(`${base}${out.length+1}`);
  return out.slice(0,6);
};

function v15EscKey(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ');}
function v15NormName(s){return v15EscKey(s).replace(/^(श्री|श्रीमती|कुमारी|mr\.?|mrs\.?|miss)\s+/i,'');}
function v15PartyKey(p){
  const ad=String(p?.aadhaar||p?.id||'').replace(/\D/g,'');
  if(ad)return 'aadhaar:'+ad;
  return 'name:'+v15NormName(relationName(p)||p?.name||'')+'|father:'+v15NormName(p?.father||'')+'|addr:'+v15EscKey(p?.address||'');
}
function v15ParcelKey(village,khata,khasra){return [village,khata,khasra].map(v15EscKey).join('|');}

// ---------- Jurisdiction controls directly on New Draft screen ----------
function v15DraftJurisdictionHtml(){
  return `<div class="jurisdiction-inline-control"><label>State</label><select id="draftJurState" onchange="v15DraftStateChanged()"></select></div>
  <div class="jurisdiction-inline-control"><label>District</label><select id="draftJurDistrict" onchange="v15DraftDistrictChanged()"></select></div>
  <div class="jurisdiction-inline-control"><label>Tehsil</label><select id="draftJurTehsil" onchange="v15DraftTehsilChanged()"></select></div>
  <div class="jurisdiction-inline-control rate-control"><label>Circle Rate</label><button type="button" class="rate-source-btn" onclick="v15OpenCurrentRatePdf()"><b id="draftCtxRate">Mapped PDF</b><small>Open selected tehsil rate list</small></button></div>`;
}
function v15InitDraftJurisdiction(){
  const strip=document.querySelector('#draftTypeScreen .jurisdiction-context-strip');if(!strip)return;
  strip.innerHTML=v15DraftJurisdictionHtml();
  const st=document.getElementById('draftJurState'),saved=currentJurisdiction();
  st.innerHTML=Object.keys(V14_JURISDICTIONS).map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  if([...st.options].some(o=>o.value===saved.state))st.value=saved.state;
  v15FillDraftDistricts(saved.district,saved.tehsil);
}
function v15FillDraftDistricts(preferredDistrict='',preferredTehsil=''){
  const state=val('draftJurState')||'Uttarakhand',dist=document.getElementById('draftJurDistrict');if(!dist)return;
  const ds=Object.keys(V14_JURISDICTIONS[state]||{});dist.innerHTML=ds.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  if(ds.includes(preferredDistrict))dist.value=preferredDistrict;
  v15FillDraftTehsils(preferredTehsil);
}
function v15FillDraftTehsils(preferred=''){
  const state=val('draftJurState')||'Uttarakhand',district=val('draftJurDistrict')||'',teh=document.getElementById('draftJurTehsil');if(!teh)return;
  const ts=Object.keys(V14_JURISDICTIONS?.[state]?.[district]||{});teh.innerHTML=ts.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  if(ts.includes(preferred))teh.value=preferred;
  v15CommitDraftJurisdiction(false);
}
function v15DraftStateChanged(){v15FillDraftDistricts();}
function v15DraftDistrictChanged(){v15FillDraftTehsils();}
function v15DraftTehsilChanged(){v15CommitDraftJurisdiction(true);}
function v15CommitDraftJurisdiction(showToast=true){
  const ctx={state:val('draftJurState')||'Uttarakhand',district:val('draftJurDistrict')||'Haridwar',tehsil:val('draftJurTehsil')||'Bhagwanpur'};
  const cfg=jurisdictionConfig(ctx);if(!cfg){if(showToast)toast('Is tehsil ki circle rate list abhi mapped nahi hai');return false;}
  v14WriteJSON('registryProJurisdiction',ctx);
  selectedCircleLocation=null;
  const vs=document.getElementById('villageSearch');if(vs)vs.value='';
  const vv=document.getElementById('village');if(vv)vv.value='';
  const cr=document.getElementById('circleRate');if(cr)cr.value='';
  const rr=document.getElementById('rateRef');if(rr)rr.value='';
  v14Set('tehsil',v14HindiTehsil(ctx.tehsil));v14Set('district',v14HindiDistrict(ctx.district));
  updateDraftJurisdictionContext();
  const rate=document.getElementById('draftCtxRate');if(rate)rate.textContent=cfg?'Mapped PDF':'Not mapped';
  v14ActiveRegistryNo=null;updateDraftNumberMini();
  if(showToast)toast(`${ctx.tehsil} selected — ab isi tehsil ki circle rate list use hogi`);
  return true;
}
function v15OpenCurrentRatePdf(){
  const cfg=jurisdictionConfig(currentJurisdiction());if(!cfg){toast('Rate PDF mapped nahi hai');return;}
  window.open(cfg.ratePdf,'_blank');
}
const v15OpenNewRegistryBase=openNewRegistry;
openNewRegistry=function(){v15OpenNewRegistryBase();v15InitDraftJurisdiction();};

// ---------- Party master ----------
function v15CurrentOwner(){const s=v14SessionData();return String(s.role==='Advocate'?(s.name||s.advocateName):(s.advocateName||s.name)||'').trim();}
function v15PartyMasterAll(){return v14ReadJSON('registryProPartyMaster',[]);}
function v15PartyMaster(){const owner=v15CurrentOwner().toLowerCase();return v15PartyMasterAll().filter(p=>String(p.ownerAdvocate||owner).toLowerCase()===owner);}
function v15SavePartyMaster(a){const owner=v15CurrentOwner(),low=owner.toLowerCase(),other=v15PartyMasterAll().filter(p=>String(p.ownerAdvocate||owner).toLowerCase()!==low);v14WriteJSON('registryProPartyMaster',[...other,...a.map(p=>({...p,ownerAdvocate:p.ownerAdvocate||owner}))].slice(-5000));}
function v15AllKnownParties(){
  const map=new Map();
  v15PartyMaster().forEach(p=>map.set(v15PartyKey(p),{...p,source:'Master'}));
  ['seller','buyer'].forEach(type=>completedPartyRecords(type).forEach(r=>{const p={...r.party,role:type,source:r.draft.registryNo};const k=v15PartyKey(p);if(!map.has(k))map.set(k,p);}));
  return [...map.values()];
}
function v15PartyFormHtml(){return `<div class="party-add-launch"><button class="btn primary compact" onclick="v15TogglePartyForm(true)">＋ Add New Party</button></div><div id="partyMasterCard" class="party-master-card card" hidden>
  <div class="party-master-head"><div><h3>Add New Party</h3><p>Name, father, address, mobile, Aadhaar aur Gmail ek baar save karein.</p></div><div><button class="btn outline compact" onclick="v15ClearPartyForm()">Clear</button> <button class="btn outline compact" onclick="v15TogglePartyForm(false)">Close</button></div></div>
  <div class="form-grid three party-master-form">
   <div><label>Party Use</label><select id="pmRole"><option value="both">Seller + Buyer</option><option value="seller">Seller</option><option value="buyer">Buyer</option></select></div>
   <div><label>Name</label><input id="pmName"></div><div><label>Father / Husband Name</label><input id="pmFather"></div>
   <div class="full"><label>Address</label><input id="pmAddress"></div>
   <div><label>Mobile</label><input id="pmMobile" inputmode="numeric"></div><div><label>Aadhaar</label><input id="pmAadhaar" inputmode="numeric"></div><div><label>Gmail / Email</label><input id="pmEmail" type="email"></div>
   <div class="full"><button class="btn primary" onclick="v15SaveParty()">＋ Save Party</button></div>
  </div></div>`;}
function v15PartyColumnsHtml(){return `<div class="party-simple-grid">
  <section class="party-simple-col"><div class="party-simple-title seller"><strong>Seller / विक्रेता</strong><span id="sellerPartyCount">0</span></div><div class="party-search-line"><span>⌕</span><input id="partySellerSearch" placeholder="Seller name search" oninput="v15RenderPartyColumns()"></div><div id="partySellerList" class="party-simple-list"></div></section>
  <section class="party-simple-col"><div class="party-simple-title buyer"><strong>Buyer / क्रेता</strong><span id="buyerPartyCount">0</span></div><div class="party-search-line"><span>⌕</span><input id="partyBuyerSearch" placeholder="Buyer name search" oninput="v15RenderPartyColumns()"></div><div id="partyBuyerList" class="party-simple-list"></div></section>
  </div>`;}
function v15SetupPartiesView(){
  const view=document.getElementById('partiesView');if(!view)return;
  view.innerHTML=`<div class="page shell parties-home-shell"><div class="topbar parties-home-topbar"><button class="back" onclick="showDashboard()">← Dashboard</button><div><h2>Parties</h2><p>Seller aur Buyer records seedhe search karein; nayi party bhi yahin save karein.</p></div></div>${v15PartyFormHtml()}${v15PartyColumnsHtml()}</div>`;
  v15RenderPartyColumns();
}
function v15TogglePartyForm(show){const c=document.getElementById('partyMasterCard');if(c)c.hidden=!show;if(show)setTimeout(()=>document.getElementById('pmName')?.focus(),30);}
function v15ClearPartyForm(){['pmName','pmFather','pmAddress','pmMobile','pmAadhaar','pmEmail'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});}
function v15SaveParty(){
  const name=val('pmName');if(!name){toast('Party Name required');return;}
  const p={id:'P'+Date.now(),ownerAdvocate:v15CurrentOwner(),role:val('pmRole')||'both',name,father:val('pmFather'),relation:'S/O',address:val('pmAddress'),mobile:val('pmMobile'),aadhaar:val('pmAadhaar'),email:val('pmEmail'),createdAt:new Date().toISOString()};
  const arr=v15PartyMaster(),key=v15PartyKey(p),idx=arr.findIndex(x=>v15PartyKey(x)===key);
  if(idx>=0)arr[idx]={...arr[idx],...p,id:arr[idx].id||p.id};else arr.push(p);
  v15SavePartyMaster(arr);v15ClearPartyForm();v15RenderPartyColumns();v15RefreshPropertyPartyOptions();refreshDashboard();toast('Party saved');
}
function v15PartyCompactRow(p){return `<div class="party-compact-row"><div><strong>${esc(relationName(p)||p.name||'-')}</strong><small>${p.father?`${esc(relationMeta(p.relation).word)} ${esc(p.father)} • `:''}${esc(p.address||'')}</small></div><div class="party-compact-meta"><span>${esc(p.mobile||'-')}</span><span>Aadhaar ${esc(p.aadhaar||'-')}</span></div></div>`;}
function v15RenderPartyColumns(){
  const master=v15PartyMaster(),sellerQ=v15EscKey(document.getElementById('partySellerSearch')?.value),buyerQ=v15EscKey(document.getElementById('partyBuyerSearch')?.value);
  const completedS=completedPartyRecords('seller').map(r=>({...r.party,role:'seller',source:r.draft.registryNo})),completedB=completedPartyRecords('buyer').map(r=>({...r.party,role:'buyer',source:r.draft.registryNo}));
  const uniq=(arr)=>{const m=new Map();arr.forEach(p=>{const k=v15PartyKey(p);if(!m.has(k))m.set(k,p)});return [...m.values()]};
  const sellers=uniq([...master.filter(p=>p.role==='seller'||p.role==='both'),...completedS]).filter(p=>!sellerQ||v15EscKey(relationName(p)||p.name).includes(sellerQ));
  const buyers=uniq([...master.filter(p=>p.role==='buyer'||p.role==='both'),...completedB]).filter(p=>!buyerQ||v15EscKey(relationName(p)||p.name).includes(buyerQ));
  const sb=document.getElementById('partySellerList'),bb=document.getElementById('partyBuyerList');if(sb)sb.innerHTML=sellers.map(v15PartyCompactRow).join('')||'<div class="party-simple-empty">No seller found</div>';if(bb)bb.innerHTML=buyers.map(v15PartyCompactRow).join('')||'<div class="party-simple-empty">No buyer found</div>';
  const sc=document.getElementById('sellerPartyCount'),bc=document.getElementById('buyerPartyCount');if(sc)sc.textContent=sellers.length;if(bc)bc.textContent=buyers.length;
}
openPartiesHome=function(){showView('partiesView');v15RenderPartyColumns();};
function v15OpenAddParty(){openPartiesHome();v15TogglePartyForm(true);}

// ---------- Property ledger ----------
function v15PropertyMasterAll(){return v14ReadJSON('registryProPropertyMaster',[]);}
function v15PropertyMaster(){const owner=v15CurrentOwner().toLowerCase();return v15PropertyMasterAll().filter(h=>String(h.ownerAdvocate||owner).toLowerCase()===owner);}
function v15SavePropertyMaster(a){const owner=v15CurrentOwner(),low=owner.toLowerCase(),other=v15PropertyMasterAll().filter(h=>String(h.ownerAdvocate||owner).toLowerCase()!==low);v14WriteJSON('registryProPropertyMaster',[...other,...a.map(h=>({...h,ownerAdvocate:h.ownerAdvocate||owner}))].slice(-10000));}
function v15CreatePropertyView(){
  if(document.getElementById('propertyLedgerView'))return;
  const sec=document.createElement('section');sec.id='propertyLedgerView';sec.className='view';
  sec.innerHTML=`<div class="page shell management-shell property-ledger-shell"><div class="topbar"><button class="back" onclick="showDashboard()">← Dashboard</button><div><h2>Property Ledger</h2><p>Party-wise Khata/Khasra holding aur remaining land track karein.</p></div></div>
  <div class="card property-add-card"><div class="party-master-head"><div><h3>Add Property / Opening Holding</h3><p>Party Aadhaar + Village + Khata + Khasra ke saath opening area save karein.</p></div></div>
   <div class="form-grid three">
    <div><label>Party</label><select id="propParty" onchange="v15PropertyPartyChanged()"></select></div><div><label>Aadhaar</label><input id="propAadhaar" readonly></div><div><label>Opening Date</label><input id="propOpeningDate" type="date"></div>
    <div><label>Village</label><input id="propVillage"></div><div><label>Khata No.</label><input id="propKhata" data-no-hindi="true"></div><div><label>Khasra / Gata No.</label><input id="propKhasra" data-no-hindi="true"></div>
    <div><label>Opening Area</label><input id="propArea" type="number" min="0" step="0.0001"></div><div><label>Unit</label><select id="propUnit" onchange="v15PropertyUnitChanged()"><option value="Hectare">Hectare</option><option value="Bigha">Bigha</option><option value="SqM">Sq. Meter</option><option value="SqFt">Sq. Ft.</option></select></div><div><label>Hectare Equivalent <small>(auto balance)</small></label><input id="propAreaHa" type="number" min="0" step="0.0001" placeholder="Bigha ho to hectare equivalent fill karein"></div>
    <div class="full"><button class="btn primary" onclick="v15SavePropertyHolding()">＋ Save Property</button></div>
   </div></div>
  <div class="card property-ledger-card"><div class="property-ledger-tools"><div><label>Search Party / Village / Khata / Khasra</label><input id="propertyLedgerSearch" oninput="v15RenderPropertyLedger()" placeholder="Search..."></div><button class="btn outline compact" onclick="v15RenderPropertyLedger()">Refresh</button></div><div id="propertyLedgerList"></div></div></div>`;
  document.body.insertBefore(sec,document.getElementById('saveSuccessModal'));
}
function v15RefreshPropertyPartyOptions(){
  const s=document.getElementById('propParty');if(!s)return;const old=s.value,arr=v15AllKnownParties();
  s.innerHTML='<option value="">Select party</option>'+arr.map((p,i)=>`<option value="${i}">${esc(relationName(p)||p.name||'-')} • Aadhaar ${esc(p.aadhaar||'-')}</option>`).join('');
  s._partyData=arr;if([...s.options].some(o=>o.value===old))s.value=old;v15PropertyPartyChanged();
}
function v15PropertyPartyChanged(){const s=document.getElementById('propParty'),p=(s&&s.value!=='')?s._partyData?.[Number(s.value)]:null;const a=document.getElementById('propAadhaar');if(a)a.value=p?.aadhaar||'';}
function v15PropertyUnitChanged(){const unit=val('propUnit'),q=numv('propArea'),h=document.getElementById('propAreaHa');if(!h)return;if(unit==='Hectare')h.value=q||'';else if(unit==='SqM')h.value=q?String(q/10000):'';else if(unit==='SqFt')h.value=q?String(q*0.09290304/10000):'';}
function v15SavePropertyHolding(){
  const s=document.getElementById('propParty'),p=(s&&s.value!=='')?s._partyData?.[Number(s.value)]:null;if(!p){toast('Party select karein');return;}
  const village=val('propVillage'),khata=val('propKhata'),khasra=val('propKhasra'),qty=numv('propArea'),unit=val('propUnit')||'Hectare';if(!village||!khata||!khasra||qty<=0){toast('Village, Khata, Khasra aur Area required');return;}
  let ha=numv('propAreaHa');if(unit==='Hectare')ha=qty;if(unit==='SqM')ha=qty/10000;if(unit==='SqFt')ha=qty*0.09290304/10000;
  const item={id:'H'+Date.now(),ownerAdvocate:v15CurrentOwner(),partyKey:v15PartyKey(p),party:{name:p.name||relationName(p),father:p.father||'',relation:p.relation||'S/O',address:p.address||'',aadhaar:p.aadhaar||'',mobile:p.mobile||'',email:p.email||''},village,khata,khasra,openingQty:qty,unit,openingHa:ha||0,openingDate:val('propOpeningDate')||new Date().toISOString().slice(0,10),createdAt:new Date().toISOString()};
  const arr=v15PropertyMaster();arr.push(item);v15SavePropertyMaster(arr);v15RenderPropertyLedger();refreshDashboard();toast('Property opening holding saved');
}
function v15DraftParcelEntries(d){
  const rows=(d.agri?.gataRows||[]).filter(r=>r.gata);if(rows.length)return rows.map(r=>({khata:String(d.khataNo||''),khasra:String(r.gata||''),areaHa:Number(r.soldArea??r.area??0)||0}));
  const areaHa=d.agri?.totalAreaHa?Number(d.agri.totalAreaHa):((Number(d.areaM2)||0)/10000);
  return [{khata:String(d.khataNo||''),khasra:String(d.khasraNo||''),areaHa}];
}
function v15PartyMatches(p,holder){return v15PartyKey(p)===holder.partyKey || (!!p?.aadhaar&&String(p.aadhaar).replace(/\D/g,'')===String(holder.party?.aadhaar||'').replace(/\D/g,''));}
function v15PropertyBalance(holder){
  let buys=0,sells=0,buyCount=0,sellCount=0;const start=holder.openingDate||'0000-00-00',pk=v15ParcelKey(holder.village,holder.khata,holder.khasra);
  v14CompletedVisible().forEach(d=>{
    if((v14DateOnly(d)||'')<start)return;
    const village=d.village||'';
    v15DraftParcelEntries(d).forEach(pe=>{
      if(v15ParcelKey(village,pe.khata||holder.khata,pe.khasra)!==pk)return;
      const sellers=normalizePartyList(d.sellers,d.seller),buyers=normalizePartyList(d.buyers,d.buyer);
      if(sellers.some(p=>v15PartyMatches(p,holder))){sells+=pe.areaHa;sellCount++;}
      if(buyers.some(p=>v15PartyMatches(p,holder))){buys+=pe.areaHa;buyCount++;}
    });
  });
  return {openingHa:Number(holder.openingHa)||0,buys,sells,balanceHa:(Number(holder.openingHa)||0)+buys-sells,buyCount,sellCount};
}
function v15RenderPropertyLedger(){
  const b=document.getElementById('propertyLedgerList');if(!b)return;const q=v15EscKey(document.getElementById('propertyLedgerSearch')?.value);let arr=v15PropertyMaster();
  if(q)arr=arr.filter(h=>[relationName(h.party)||h.party?.name,h.village,h.khata,h.khasra,h.party?.aadhaar].some(x=>v15EscKey(x).includes(q)));
  if(!arr.length){b.innerHTML='<div class="empty-party-records">No property opening holding saved.</div>';return;}
  b.innerHTML=`<div class="property-table-wrap"><table class="property-ledger-table"><thead><tr><th>Party</th><th>Aadhaar</th><th>Village</th><th>Khata</th><th>Khasra/Gata</th><th>Opening</th><th>Buy</th><th>Sale</th><th>Remaining</th></tr></thead><tbody>${arr.map(h=>{const x=v15PropertyBalance(h);return `<tr><td><b>${esc(relationName(h.party)||h.party?.name||'-')}</b><small>${esc(h.party?.father||'')}</small></td><td>${esc(h.party?.aadhaar||'-')}</td><td>${esc(h.village)}</td><td>${esc(h.khata)}</td><td>${esc(h.khasra)}</td><td>${x.openingHa.toFixed(4)} ha<small>${esc(h.openingQty)} ${esc(h.unit)}</small></td><td class="buy-cell">+${x.buys.toFixed(4)}<small>${x.buyCount} buy</small></td><td class="sale-cell">-${x.sells.toFixed(4)}<small>${x.sellCount} sale</small></td><td class="balance-cell">${x.balanceHa.toFixed(4)} ha</td></tr>`;}).join('')}</tbody></table></div>`;
}
openPropertiesHome=function(){v15CreatePropertyView();v15RefreshPropertyPartyOptions();const d=document.getElementById('propOpeningDate');if(d&&!d.value)d.value=new Date().toISOString().slice(0,10);showView('propertyLedgerView');v15RenderPropertyLedger();};

// ---------- Reports ----------
function v15ReportPartyStats(){
  const m=new Map();v14CompletedVisible().forEach(d=>{
    const parcels=v15DraftParcelEntries(d),area=parcels.reduce((a,x)=>a+x.areaHa,0);
    normalizePartyList(d.sellers,d.seller).forEach(p=>{const k=v15PartyKey(p),x=m.get(k)||{p,saleCount:0,buyCount:0,saleHa:0,buyHa:0};x.saleCount++;x.saleHa+=area;m.set(k,x)});
    normalizePartyList(d.buyers,d.buyer).forEach(p=>{const k=v15PartyKey(p),x=m.get(k)||{p,saleCount:0,buyCount:0,saleHa:0,buyHa:0};x.buyCount++;x.buyHa+=area;m.set(k,x)});
  });return [...m.values()];
}
openReportsHome=function(){
  const a=v14VisibleDrafts(),done=a.filter(x=>x.status==='Completed'&&!x._workingDraft),byAdv={};done.forEach(d=>{const n=d.ownerAdvocate||d.advocate?.name||'-';byAdv[n]=(byAdv[n]||0)+1});
  const ps=v15ReportPartyStats(),holdings=v15PropertyMaster();
  openSimpleManagement('Reports',`<div class="report-print-bar"><button class="btn primary compact" onclick="window.print()">Print Report</button></div><div class="report-mini-grid"><div><small>Total Drafts</small><strong>${a.length}</strong></div><div><small>Completed</small><strong>${done.length}</strong></div><div><small>Advocates</small><strong>${Object.keys(byAdv).length}</strong></div><div><small>Property Holdings</small><strong>${holdings.length}</strong></div></div>
  <h3 class="report-subtitle">Advocate-wise Registry Count</h3><div class="report-table-wrap"><table class="report-detail-table"><thead><tr><th>Advocate</th><th>Completed Registries</th></tr></thead><tbody>${Object.entries(byAdv).map(([n,c])=>`<tr><td>${esc(n)}</td><td>${c}</td></tr>`).join('')||'<tr><td colspan="2">No data</td></tr>'}</tbody></table></div>
  <h3 class="report-subtitle">Party-wise Sale / Buy</h3><div class="report-table-wrap"><table class="report-detail-table"><thead><tr><th>Party</th><th>Sale Count</th><th>Sale Area</th><th>Buy Count</th><th>Buy Area</th></tr></thead><tbody>${ps.map(x=>`<tr><td>${esc(relationName(x.p)||x.p?.name||'-')}</td><td>${x.saleCount}</td><td>${x.saleHa.toFixed(4)} ha</td><td>${x.buyCount}</td><td>${x.buyHa.toFixed(4)} ha</td></tr>`).join('')||'<tr><td colspan="5">No data</td></tr>'}</tbody></table></div>
  <h3 class="report-subtitle">Party-wise Remaining Land by Khata / Khasra</h3><div class="report-table-wrap"><table class="report-detail-table"><thead><tr><th>Party</th><th>Village</th><th>Khata</th><th>Khasra</th><th>Remaining</th></tr></thead><tbody>${holdings.map(h=>{const x=v15PropertyBalance(h);return `<tr><td>${esc(relationName(h.party)||h.party?.name||'-')}</td><td>${esc(h.village)}</td><td>${esc(h.khata)}</td><td>${esc(h.khasra)}</td><td><b>${x.balanceHa.toFixed(4)} ha</b></td></tr>`}).join('')||'<tr><td colspan="5">No property ledger data</td></tr>'}</tbody></table></div>`);
};

// ---------- Deed print layout: payment, photos, witness boxes, 10 fingerprints ----------
partyFingerBlocks=function(list,label,fingerHtml,extraClass=''){
  const arr=normalizePartyList(list,null),safe=arr.length?arr:[{name:''}],names=['अंगूठा','तर्जनी','मध्यमा','अनामिका','कनिष्ठिका'];
  const hand=(title)=>`<div class="finger-hand-block"><b class="finger-hand-title">${title}</b><div class="finger-print-box-row">${names.map(n=>`<div class="finger-print-box"><span>${n}</span></div>`).join('')}</div></div>`;
  return safe.map((p,i)=>`<div class="finger-block party-finger-person ${extraClass}"><b>${esc(label)}${safe.length>1?` ${i+1}`:''}${p.name?` (${esc(relationName(p))})`:''} — दोनों हाथ की अंगुलियों के निशान</b>${hand('बायाँ हाथ / Left Hand')}${hand('दायाँ हाथ / Right Hand')}${p.biometricNote?`<p class="finger-note"><b>नोट:</b> ${esc(p.biometricNote)}</p>`:''}</div>`).join('');
};
function v15PaymentTableHtml(d){
  const rows=(d.payments||[]).filter(x=>Number(x.amount)>0),total=rows.reduce((a,x)=>a+Number(x.amount||0),0);
  if(!rows.length)return '<div class="payment-deed-empty">भुगतान विवरण नहीं भरा गया है।</div>';
  return `<table class="payment-deed-table"><thead><tr><th>S.no</th><th>Payment Mode</th><th>Amount</th><th>Cheque / RTGS No.</th><th>Bank</th><th>Branch</th><th>Payment Date</th></tr></thead><tbody>${rows.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.mode||'')}</td><td>${Math.round(Number(x.amount)||0).toLocaleString('en-IN')}</td><td>${esc(x.ref||'')}</td><td>${esc(x.bank||'')}</td><td>${esc(x.branch||'')}</td><td>${esc(x.date?formatDateDeed(x.date):'')}</td></tr>`).join('')}<tr class="payment-deed-total"><td>${rows.length+1}</td><td><b>Total</b></td><td><b>${Math.round(total).toLocaleString('en-IN')}</b></td><td colspan="4"></td></tr></tbody></table>`;
}
function v15PhotoGridHtml(d){
  const items=[];normalizePartyList(d.sellers,d.seller).forEach((p,i)=>items.push({type:'Seller / विक्रेता',p,i}));normalizePartyList(d.buyers,d.buyer).forEach((p,i)=>items.push({type:'Buyer / क्रेता',p,i}));
  if(!items.length)return '';
  return `<div class="party-photo-section"><b>विक्रेता / क्रेता फोटो</b><div class="party-photo-grid ${items.length>6?'many':''}">${items.map(x=>`<div class="party-photo-box"><div class="photo-placeholder">PHOTO</div><strong>${esc(x.type)}${x.i?` ${x.i+1}`:''}</strong><small>${esc(relationName(x.p)||x.p?.name||'')}</small></div>`).join('')}</div></div>`;
}
function v15WitnessBox(w,label){const m=relationMeta(w?.relation);return `<div class="witness-detail-box"><strong>${esc(label)}</strong><p><b>${esc(relationName(w)||'')}</b>${w?.father?` ${esc(m.word)} ${esc(w.father)}`:''}</p><p>निवासी: ${esc(w?.address||'')}</p><p>मोबाइल: ${esc(w?.mobile||'-')} &nbsp; Aadhaar: ${esc(w?.id||'-')}</p></div>`;}
function v15PatchAgriculturePreview(d){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;
  const page3=legal.querySelector('.deed-page-3');if(page3&&!legal.querySelector('.deed-page-photo')){const photoPage=document.createElement('section');photoPage.className='deed-page deed-page-photo';photoPage.innerHTML=`<h2 class="photo-page-title">विक्रेता / क्रेता फोटो</h2>${v15PhotoGridHtml(d)}`;page3.parentNode.insertBefore(photoPage,page3);}
  const page4=legal.querySelector('.deed-page-4');if(page4){
    const p=[...page4.querySelectorAll(':scope > p')].find(x=>x.textContent.includes('विवरण विक्रय धनराशि प्राप्ति'));
    if(p){p.outerHTML=`<div class="payment-deed-section"><p><b><u>विवरण विक्रय धनराशि प्राप्ति-</u></b> विक्रेता ने क्रेता से कुल मूल्य राशि अंकन <b class="v red">${formatDeedMoney(d.transactionAmount)}</b> में से</p>${v15PaymentTableHtml(d)}<p>मूल्य की राशि की प्राप्ति विक्रेता द्वारा स्वीकार की गई है तथा उपरोक्त भुगतान के पश्चात विक्रेता की कोई धनराशि क्रेता के जिम्मे शेष नहीं रही है।</p></div>`;}
  }
  const wl=legal.querySelector('.witness-lines');if(wl){wl.className='witness-box-grid';wl.innerHTML=v15WitnessBox(d.witness1,'साक्षी 1')+v15WitnessBox(d.witness2,'साक्षी 2');}
  // Extra parties get extra fingerprint pages instead of being clipped by the fixed A4 page.
  const p4=legal.querySelector('.deed-page-4'),p5=legal.querySelector('.deed-page-5');
  if(p4&&p5){
    const sellerBlocks=[...p4.querySelectorAll(':scope > .party-finger-person')];
    sellerBlocks.slice(1).forEach((block,idx)=>{const pg=document.createElement('section');pg.className='deed-page deed-page-extra-finger seller-extra-finger-page';pg.innerHTML=`<p class="finger-cont-heading"><b>विक्रेता के दोनों हाथ की अंगुलियों के निशान (जारी)</b></p>`;pg.appendChild(block);p5.parentNode.insertBefore(pg,p5);});
    const buyerBlocks=[...p5.querySelectorAll(':scope > .party-finger-person')];
    if(buyerBlocks.length>1){
      const witness=p5.querySelector('.witness-box-grid'),foot=p5.querySelector('.deed-footer-lines');
      let anchor=p5;
      buyerBlocks.slice(1).forEach((block,idx)=>{const pg=document.createElement('section');pg.className='deed-page deed-page-extra-finger buyer-extra-finger-page';pg.innerHTML=`<p class="finger-cont-heading"><b>क्रेता के दोनों हाथ की अंगुलियों के निशान (जारी)</b></p>`;pg.appendChild(block);anchor.parentNode.insertBefore(pg,anchor.nextSibling);anchor=pg;});
      if(witness||foot){const wp=document.createElement('section');wp.className='deed-page deed-page-witness-final';if(witness)wp.appendChild(witness);if(foot)wp.appendChild(foot);anchor.parentNode.insertBefore(wp,anchor.nextSibling);}
    }
  }
}
const v15RenderAgricultureDeedBase=renderAgricultureDeed;
renderAgricultureDeed=function(d){v15RenderAgricultureDeedBase(d);v15PatchAgriculturePreview(d);};

// Stamp page: no full-page decorative border; only written content gets a border.
applyDraftPageChrome=function(){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;
  let pages=[...legal.querySelectorAll('.deed-page')];
  if(!pages.length&&legal.children.length){const wrap=document.createElement('div');wrap.className='deed-document standard-deed';const page=document.createElement('section');page.className='deed-page standard-deed-page';while(legal.firstChild)page.appendChild(legal.firstChild);wrap.appendChild(page);legal.appendChild(wrap);pages=[page];}
  const d=draftData(),stamp=selectedStampPage();
  pages.forEach((page,i)=>{
    page.querySelectorAll(':scope > .registry-page-footer,:scope > .stamp-reserve').forEach(x=>x.remove());
    page.classList.remove('stamp-selected-page','stamp-normal-page');
    page.querySelectorAll('.stamp-content-wrapper-created').forEach(w=>{while(w.firstChild)w.parentNode.insertBefore(w.firstChild,w);w.remove();});page.querySelectorAll('.page2-bottom.stamp-written-content-border').forEach(x=>x.classList.remove('stamp-written-content-border'));
    if(page.classList.contains('deed-page-2')&&stamp!==2)page.classList.add('stamp-normal-page');
    if(stamp===i+1){
      page.classList.add('stamp-selected-page');
      if(i+1===2&&page.classList.contains('deed-page-2')){
        const bottom=page.querySelector('.page2-bottom');if(bottom)bottom.classList.add('stamp-written-content-border');
      }else{
        const sp=document.createElement('div');sp.className='stamp-reserve';sp.innerHTML='<span>STAMP PAPER SPACE</span>';page.prepend(sp);
        const wrap=document.createElement('div');wrap.className='stamp-written-content-border stamp-content-wrapper-created';
        [...page.children].filter(x=>!x.classList.contains('stamp-reserve')&&!x.classList.contains('registry-page-footer')).forEach(x=>wrap.appendChild(x));page.appendChild(wrap);
      }
    }
    const f=document.createElement('div');f.className='registry-page-footer';f.innerHTML=`<span>Advocate: <b>${esc(d.advocate?.name||d.ownerAdvocate||'-')}</b></span><span class="registry-footer-center"><strong>Registry Pro</strong><small>Registry No.: ${esc(d.registryNo||v14ActiveRegistryNo||'-')}</small></span><span>Page ${i+1}/${pages.length}</span>`;page.appendChild(f);
  });
};

// ---------- Structured DOCX exporter ----------
function v15WordRun(text,opt={}){const size=opt.size||24,b=opt.bold?'<w:b/>':'',u=opt.underline?'<w:u w:val="single"/>':'';return `<w:r><w:rPr><w:rFonts w:ascii="Nirmala UI" w:hAnsi="Nirmala UI" w:eastAsia="Nirmala UI" w:cs="Nirmala UI"/>${b}${u}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${v14Xml(text)}</w:t></w:r>`;}
function v15Runs(node,opt={}){
  if(node.nodeType===Node.TEXT_NODE)return v15WordRun(node.nodeValue||'',opt);
  if(node.nodeType!==Node.ELEMENT_NODE)return '';
  const tag=node.tagName, next={...opt,bold:opt.bold||tag==='B'||tag==='STRONG',underline:opt.underline||tag==='U'};
  if(tag==='BR')return '<w:r><w:br/></w:r>';
  return [...node.childNodes].map(n=>v15Runs(n,next)).join('');
}
function v15PFromNode(node,opt={}){const jc=opt.center?'center':(opt.left?'left':'both'),before=opt.before||0,after=opt.after??70;return `<w:p><w:pPr><w:jc w:val="${jc}"/><w:spacing w:before="${before}" w:after="${after}" w:line="300" w:lineRule="auto"/></w:pPr>${v15Runs(node,{size:opt.size||24,bold:opt.bold||false,underline:opt.underline||false})}</w:p>`;}
function v15PText(text,opt={}){const jc=opt.center?'center':(opt.left?'left':'both');return `<w:p><w:pPr><w:jc w:val="${jc}"/><w:spacing w:before="${opt.before||0}" w:after="${opt.after??70}"/></w:pPr>${v15WordRun(text,opt)}</w:p>`;}
function v15Cell(content,width=2500,opt={}){return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${opt.shade?`<w:shd w:fill="${opt.shade}"/>`:''}${opt.borders===false?'<w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders>':''}${opt.height?`<w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar>`:''}</w:tcPr>${content||'<w:p/>'}${content&&content.includes('<w:tbl')?'<w:p/>':''}</w:tc>`;}
function v15Table(rows,opt={}){const borders=opt.borders===false?'<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>':'<w:tblBorders><w:top w:val="single" w:sz="6" w:color="7D8E83"/><w:left w:val="single" w:sz="6" w:color="7D8E83"/><w:bottom w:val="single" w:sz="6" w:color="7D8E83"/><w:right w:val="single" w:sz="6" w:color="7D8E83"/><w:insideH w:val="single" w:sz="4" w:color="B6C3BB"/><w:insideV w:val="single" w:sz="4" w:color="B6C3BB"/></w:tblBorders>';
  return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/>${borders}<w:tblLayout w:type="fixed"/></w:tblPr>${rows.join('')}</w:tbl>`;}
function v15DomTable(tbl){
  const trs=[...tbl.querySelectorAll('tr')];if(!trs.length)return '';
  const cols=Math.max(...trs.map(r=>r.children.length)),width=Math.floor(9000/Math.max(1,cols));
  return v15Table(trs.map((tr,ri)=>`<w:tr>${[...tr.children].map(td=>v15Cell(v15PText((td.innerText||td.textContent||'').replace(/\s+/g,' ').trim(),{size:ri===0?18:19,bold:ri===0,left:true,after:20}),width,{shade:ri===0?'EAF5EE':undefined})).join('')}</w:tr>`));
}
function v15TopGrid(el){const items=[...el.children];const rows=[];for(let i=0;i<items.length;i+=2)rows.push(`<w:tr>${v15Cell(v15PFromNode(items[i],{size:22,left:true,after:30}),4500,{borders:false})}${v15Cell(items[i+1]?v15PFromNode(items[i+1],{size:22,left:true,after:30}):'<w:p/>',4500,{borders:false})}</w:tr>`);return v15Table(rows,{borders:false});}
function v15FingerWord(el){
  let out=v15PText(el.querySelector(':scope > b')?.textContent||'Fingerprints',{bold:true,left:true,size:21});
  el.querySelectorAll('.finger-hand-block').forEach(h=>{out+=v15PText(h.querySelector('.finger-hand-title')?.textContent||'',{bold:true,left:true,size:19,after:30});const cells=[...h.querySelectorAll('.finger-print-box')].map(c=>v15Cell(v15PText(c.textContent.trim(),{center:true,size:17,after:0}),1800,{height:true}));out+=v15Table([`<w:tr><w:trPr><w:trHeight w:val="1350" w:hRule="atLeast"/></w:trPr>${cells.join('')}</w:tr>`]);});return out;
}
function v15PhotoWord(el){const boxes=[...el.querySelectorAll('.party-photo-box')],rows=[];for(let i=0;i<boxes.length;i+=4){const cs=boxes.slice(i,i+4).map(b=>v15Cell(v15PText((b.innerText||'').replace(/\s+/g,' ').trim(),{center:true,size:18}),2250,{height:true}));while(cs.length<4)cs.push(v15Cell('<w:p/>',2250,{height:true}));rows.push(`<w:tr><w:trPr><w:trHeight w:val="1500" w:hRule="atLeast"/></w:trPr>${cs.join('')}</w:tr>`);}return v15PText(el.querySelector(':scope > b')?.textContent||'Photos',{bold:true,left:true})+v15Table(rows);}
function v15WitnessWord(el){const boxes=[...el.querySelectorAll('.witness-detail-box')];return v15Table([`<w:tr><w:trPr><w:trHeight w:val="1850" w:hRule="atLeast"/></w:trPr>${boxes.map(b=>v15Cell([...b.children].map((x,i)=>v15PFromNode(x,{left:true,size:i===0?21:20,bold:i===0,after:30})).join(''),4500)).join('')}</w:tr>`]);}
function v15ElementBlocks(el){
  if(!el)return '';
  if(el.classList?.contains('stamp-reserve'))return v15PText('',{before:3300,after:50});
  if(el.classList?.contains('stamp-written-content-border')){const inner=[...el.children].map(v15ElementBlocks).join('');return v15Table([`<w:tr>${v15Cell(inner,9000)}</w:tr>`]);}
  if(el.classList?.contains('deed-top-grid'))return v15TopGrid(el);
  if(el.matches?.('table'))return v15DomTable(el);
  if(el.classList?.contains('party-finger-person'))return v15FingerWord(el);
  if(el.classList?.contains('party-photo-section'))return v15PhotoWord(el);
  if(el.classList?.contains('witness-box-grid'))return v15WitnessWord(el);
  if(el.classList?.contains('payment-deed-section')||el.classList?.contains('deed-footer-lines')||el.classList?.contains('page2-bottom'))return [...el.children].map(v15ElementBlocks).join('');
  if(/^H[12]$/.test(el.tagName))return v15PFromNode(el,{center:true,bold:true,underline:el.tagName==='H1',size:30,after:120});
  if(el.tagName==='P')return v15PFromNode(el,{center:el.classList.contains('center-clause'),size:el.classList.contains('deed-small')?20:24});
  if(el.tagName==='DIV')return [...el.children].map(v15ElementBlocks).join('');
  return '';
}
function v15SectionPr(withBorder=true){const pb=withBorder?'<w:pgBorders w:offsetFrom="page" w:display="allPages"><w:top w:val="double" w:sz="10" w:space="18" w:color="2F8F5B"/><w:left w:val="double" w:sz="10" w:space="18" w:color="2F8F5B"/><w:bottom w:val="double" w:sz="10" w:space="18" w:color="2F8F5B"/><w:right w:val="double" w:sz="10" w:space="18" w:color="2F8F5B"/></w:pgBorders>':'';return `<w:sectPr><w:type w:val="nextPage"/><w:footerReference w:type="default" r:id="rId1"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1100" w:right="1050" w:bottom="1200" w:left="1050" w:header="400" w:footer="500" w:gutter="0"/>${pb}</w:sectPr>`;}
v14DocxParts=function(root,d,title='Registry Pro'){
  const pages=[...root.querySelectorAll('.deed-page')],use=pages.length?pages:[root],parts=[];
  use.forEach((page,i)=>{const blocks=[...page.children].filter(x=>!x.classList?.contains('registry-page-footer')).map(v15ElementBlocks).join('');parts.push(blocks);if(i<use.length-1)parts.push(`<w:p><w:pPr>${v15SectionPr(!page.classList.contains('stamp-selected-page'))}</w:pPr></w:p>`);});
  const last=use[use.length-1],body=parts.join('')+v15SectionPr(!last?.classList?.contains('stamp-selected-page'));
  const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}</w:body></w:document>`;
  const footer=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/><w:pBdr><w:top w:val="single" w:sz="4" w:color="B8CFC0"/></w:pBdr></w:pPr>${v15WordRun(`Advocate: ${d.advocate?.name||d.ownerAdvocate||'-'}   |   Registry Pro   |   Registry No.: ${d.registryNo||v14ActiveRegistryNo||'-'}   |   Page `,{bold:true,size:17})}<w:fldSimple w:instr="PAGE"><w:r><w:t>1</w:t></w:r></w:fldSimple>${v15WordRun(' of ',{size:17})}<w:fldSimple w:instr="NUMPAGES"><w:r><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>`;
  const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Nirmala UI" w:hAnsi="Nirmala UI" w:eastAsia="Nirmala UI" w:cs="Nirmala UI"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>`;
  const settings=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat><w:defaultTabStop w:val="720"/><w:doNotTrackMoves/><w:doNotTrackFormatting/></w:settings>`;
  const core=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${v14Xml(title)}</dc:title><dc:creator>Registry Pro</dc:creator><cp:lastModifiedBy>Registry Pro</cp:lastModifiedBy></cp:coreProperties>`;
  const app=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Registry Pro</Application><AppVersion>1.5</AppVersion></Properties>`;
  return {
    '[Content_Types].xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`,
    '_rels/.rels':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
    'word/document.xml':documentXml,'word/styles.xml':styles,'word/settings.xml':settings,'word/footer1.xml':footer,'docProps/core.xml':core,'docProps/app.xml':app,
    'word/_rels/document.xml.rels':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/></Relationships>`
  };
};
openCurrentDraftWord=function(){
  syncDraftPreviewNow();const legal=document.getElementById('legalDraftPreview');if(!legal){toast('Preview not ready');return;}const d=v13LastCompletedDraft||v14LastOpenedDraft||draftData();if(!d.registryNo)d.registryNo=v14ActiveRegistryNo||v14EnsureRegistryNo();downloadDocxFromElement(legal,d,`Registry_Pro_${safeFilePart(d.registryNo)}.docx`);closeSaveSuccessModal();toast('Editable structured Unicode Word (.docx) downloaded');if(document.getElementById('mutationAfterSave')?.checked)setTimeout(()=>openMutationHome(d.registryNo),200);
};
saveCurrentDraftPdf=function(){closeSaveSuccessModal();goDraftStep(5);syncDraftPreviewNow();const d=v13LastCompletedDraft||v14LastOpenedDraft||draftData();setTimeout(()=>{window.print();if(document.getElementById('mutationAfterSave')?.checked)setTimeout(()=>openMutationHome(d.registryNo||v14ActiveRegistryNo),150);},80);};

// ---------- UI setup ----------
function v15SetupUi(){
  // Cleaner New Draft header: remove duplicate title/profile/advocate display.
  document.querySelector('#registryView .draft-title-mini')?.classList.add('v15-hidden');
  document.querySelector('#registryView .profile-box')?.classList.add('v15-hidden');
  document.querySelector('#registryView .mobile-brand')?.classList.add('v15-registry-brand');
  v15InitDraftJurisdiction();
  // Saved drafts gets a clear Back button.
  const savedBtn=document.querySelector('#savedView .header .btn');if(savedBtn){savedBtn.textContent='← Back';savedBtn.setAttribute('onclick','showDashboard()');}
  // Dashboard quick actions are functional.
  const quick=[...document.querySelectorAll('#dashboardView .quick-card')];
  quick.forEach(b=>{const t=b.textContent||'';if(t.includes('Add New Party'))b.setAttribute('onclick','v15OpenAddParty()');else if(t.includes('Add Property'))b.setAttribute('onclick','openPropertiesHome()');else if(t.includes('Reports'))b.setAttribute('onclick','openReportsHome()');else if(t.includes('Settings'))b.setAttribute('onclick','openSettingsHome()');});
  v15SetupPartiesView();v15CreatePropertyView();v15RefreshPropertyPartyOptions();
}
const v15RefreshDashboardBase=refreshDashboard;
refreshDashboard=function(){v15RefreshDashboardBase();const prop=document.querySelector('#dashboardView .stat-card:nth-child(4) strong');if(prop)prop.textContent=v15PropertyMaster().length;};

document.addEventListener('DOMContentLoaded',()=>{try{v15SetupUi();refreshDashboard();}catch(e){console.error('v1.5 init',e);}});


/* ===== v1.6 PARTY + PDF LAYOUT FIXES =====
   User-confirmed 03-Sep-2026:
   - Party row like Uttarakhand PDE: Name | Relation | Father | Address | Mobile | Email | ID Type | ID No. (no Occupation)
   - Exact validation: Mobile 10 digits, PAN exact valid 10-char format, Aadhaar 12 digits
   - ID Type/ID No stored with every Seller/Buyer; PAN/Aadhaar ID types sync to dedicated fields
   - Party identity line in deed no stretched Aadhaar/Mobile/Email gaps
   - Photos on deed page 3 immediately below final प्रमाण/समय clause (not a separate page)
   - Larger 10-finger boxes; witness boxes larger and lower after fingerprints
*/

function v16PartyFieldOf(root,field){
  if(!root)return null;
  if(root.matches?.('.form-card')){
    const pre=root.closest('#sellerParty')?'seller':(root.closest('#buyerParty')?'buyer':'');
    const cap=field.charAt(0).toUpperCase()+field.slice(1);
    return (pre&&document.getElementById(pre+cap))||root.querySelector(`[data-party-field="${field}"]`);
  }
  return null;
}
function v16RuleError(el,msg=''){
  if(!el)return;
  el.classList.toggle('party-invalid',!!msg);
  const wrap=el.parentElement, note=wrap?.querySelector('.party-field-error');
  if(note){note.textContent=msg;note.style.display=msg?'block':'none';}
}
function v16PanValid(v){return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(v||'').toUpperCase());}
function v16Digits(v){return String(v||'').replace(/\D/g,'');}
function v16ValidateOneIdentityField(el,show=true){
  if(!el)return true;
  const rule=el.dataset.partyRule||'';let v=String(el.value||'').trim(),msg='';
  if(rule==='mobile'){
    if(!/^\d{10}$/.test(v))msg='Mobile number exactly 10 digits hona chahiye.';
  }else if(rule==='aadhaar'){
    if(v && !/^\d{12}$/.test(v))msg='Aadhaar exactly 12 digits hona chahiye.';
  }else if(rule==='pan'){
    if(v && !v16PanValid(v))msg='PAN format ABCDE1234F (10 characters) hona chahiye.';
  }else if(rule==='idno'){
    const card=el.closest('.form-card');const type=v16PartyFieldOf(card,'idType')?.value||'';
    if(type && !v)msg='Selected ID Type ka ID No. fill karein.';
    else if(type==='AADHAAR' && v && !/^\d{12}$/.test(v))msg='Aadhaar ID No. exactly 12 digits hona chahiye.';
    else if(type==='PAN CARD' && v && !v16PanValid(v))msg='PAN ID No. valid 10-character PAN hona chahiye.';
  }
  if(show)v16RuleError(el,msg);return !msg;
}
function v16PartyFieldInput(el){
  if(!el)return;
  if(el.dataset.partyRule==='pan')el.value=String(el.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(el.dataset.partyRule==='mobile'||el.dataset.partyRule==='aadhaar')el.value=String(el.value||'').replace(/\D/g,'');
  v16ValidateOneIdentityField(el,true);
  const card=el.closest('.form-card');if(card){
    const typ=v16PartyFieldOf(card,'idType'),idn=v16PartyFieldOf(card,'idNo');
    if(typ&&idn){if(typ.value==='PAN CARD'&&el.dataset.partyRule==='pan')idn.value=el.value;if(typ.value==='AADHAAR'&&el.dataset.partyRule==='aadhaar')idn.value=el.value;}
  }
}
function v16IdentityTypeChanged(select){
  const card=select?.closest('.form-card');if(!card)return;
  const idn=v16PartyFieldOf(card,'idNo'),pan=v16PartyFieldOf(card,'pan'),aad=v16PartyFieldOf(card,'aadhaar');
  if(!idn)return;
  if(select.value==='PAN CARD'&&!idn.value&&pan?.value)idn.value=pan.value;
  if(select.value==='AADHAAR'&&!idn.value&&aad?.value)idn.value=aad.value;
  v16ValidateOneIdentityField(idn,true);
}
function v16IdentityNoInput(el){
  const card=el?.closest('.form-card');if(!card)return;
  const type=v16PartyFieldOf(card,'idType')?.value||'';
  if(type==='AADHAAR')el.value=String(el.value||'').replace(/\D/g,'');
  if(type==='PAN CARD')el.value=String(el.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const pan=v16PartyFieldOf(card,'pan'),aad=v16PartyFieldOf(card,'aadhaar');
  if(type==='PAN CARD'&&pan){pan.value=el.value;v16ValidateOneIdentityField(pan,true);}
  if(type==='AADHAAR'&&aad){aad.value=el.value;v16ValidateOneIdentityField(aad,true);}
  v16ValidateOneIdentityField(el,true);
}
function v16UpgradePartyCard(card,type,data={}){
  if(!card)return;
  const grid=card.querySelector('.form-grid.two,.party-official-grid');if(!grid)return;
  grid.classList.remove('form-grid','two');grid.classList.add('party-official-grid');
  const map={name:'name',relation:'relation',father:'father',address:'address',mobile:'mobile',email:'email',pan:'pan',aadhaar:'aadhaar'};
  Object.entries(map).forEach(([f,c])=>{const e=grid.querySelector(`[data-party-field="${f}"]`),w=e?.parentElement;if(w)w.classList.add('party-field-'+c);});
  const mobile=grid.querySelector('[data-party-field="mobile"]');if(mobile){mobile.inputMode='numeric';mobile.dataset.partyRule='mobile';mobile.setAttribute('oninput','v16PartyFieldInput(this);syncDraftPreview()');if(!mobile.parentElement.querySelector('.party-field-error'))mobile.insertAdjacentHTML('afterend','<small class="party-field-error"></small>');}
  const pan=grid.querySelector('[data-party-field="pan"]');if(pan){pan.maxLength=10;pan.dataset.partyRule='pan';pan.placeholder='ABCDE1234F';pan.setAttribute('oninput','v16PartyFieldInput(this);syncDraftPreview()');if(!pan.parentElement.querySelector('.party-field-error'))pan.insertAdjacentHTML('afterend','<small class="party-field-error"></small>');}
  const aad=grid.querySelector('[data-party-field="aadhaar"]');if(aad){aad.inputMode='numeric';aad.dataset.partyRule='aadhaar';aad.placeholder='12 digit Aadhaar';aad.setAttribute('oninput','v16PartyFieldInput(this);syncDraftPreview()');if(!aad.parentElement.querySelector('.party-field-error'))aad.insertAdjacentHTML('afterend','<small class="party-field-error"></small>');}
  if(!grid.querySelector('[data-party-field="idType"]')){
    const idType=document.createElement('div');idType.className='party-field-idtype';idType.innerHTML=`<label>ID Type</label><select data-party-field="idType" onchange="v16IdentityTypeChanged(this);syncDraftPreview()"><option value="">--Select--</option><option value="VOTER ID">VOTER ID</option><option value="PAN CARD">PAN CARD</option><option value="DL">DL</option><option value="AADHAAR">AADHAAR</option><option value="OTHERS">OTHERS</option></select>`;
    const idNo=document.createElement('div');idNo.className='party-field-idno';idNo.innerHTML=`<label>ID No.</label><input data-party-field="idNo" data-party-rule="idno" oninput="v16IdentityNoInput(this);syncDraftPreview()"><small class="party-field-error"></small>`;
    grid.append(idType,idNo);idType.querySelector('select').value=data.idType||'';idNo.querySelector('input').value=data.idNo||'';
  }
}
function v16UpgradePrimaryParty(prefix){
  const card=document.querySelector(`#${prefix}Party .form-card:not(.additional-party-card)`);if(!card)return;
  card.querySelector('.party-official-grid')?.classList.add('party-official-grid');
  ['mobile','pan','aadhaar','idno'].forEach(rule=>{const id=prefix+(rule==='idno'?'IdNo':rule.charAt(0).toUpperCase()+rule.slice(1));const el=document.getElementById(id);if(el){el.dataset.partyRule=rule==='idno'?'idno':rule;}});
}

const _v16AddPartyBase=addParty;
addParty=function(type,data={}){
  _v16AddPartyBase(type,data);
  const panel=document.getElementById(type+'Party');const card=panel?.querySelector(`.additional-party-card[data-party-type="${type}"]:last-of-type`);
  v16UpgradePartyCard(card,type,data);
};
readExtraPartyCard=function(card){
  const get=f=>(card.querySelector(`[data-party-field="${f}"]`)?.value||'').trim();
  return {name:get('name'),father:get('father'),relation:get('relation')||'S/O',address:get('address'),pan:get('pan'),aadhaar:get('aadhaar'),email:get('email'),mobile:get('mobile'),idType:get('idType'),idNo:get('idNo'),biometricNote:get('biometricNote')};
};
const _v16DraftDataBase=draftData;
draftData=function(){
  const d=_v16DraftDataBase();
  ['seller','buyer'].forEach(type=>{const p=d[type]||{};p.idType=val(type+'IdType');p.idNo=val(type+'IdNo');d[type]=p;});
  d.sellers=collectParties('seller',d.seller);d.buyers=collectParties('buyer',d.buyer);d.seller=d.sellers[0]||d.seller;d.buyer=d.buyers[0]||d.buyer;d.templateVersion='v1.6';return d;
};
const _v16LoadPartiesBase=v14LoadParties;
v14LoadParties=function(type,list,primary){
  _v16LoadPartiesBase(type,list,primary);const arr=normalizePartyList(list,primary),p=arr[0]||{};
  v14Set(type+'IdType',p.idType||'');v14Set(type+'IdNo',p.idNo||'');
  document.querySelectorAll(`#${type}Party .additional-party-card`).forEach((card,i)=>v16UpgradePartyCard(card,type,arr[i+1]||{}));
};
function v16ValidateAllParties(show=true){
  const cards=[...document.querySelectorAll('#sellerParty .form-card,#buyerParty .form-card')];let ok=true,first=null;
  cards.forEach(card=>{
    const fields=[v16PartyFieldOf(card,'mobile'),v16PartyFieldOf(card,'pan'),v16PartyFieldOf(card,'aadhaar'),v16PartyFieldOf(card,'idNo')].filter(Boolean);
    fields.forEach(el=>{if(!v16ValidateOneIdentityField(el,show)){ok=false;if(!first)first=el;}});
  });
  if(!ok&&show){goDraftStep(2);setTimeout(()=>{first?.scrollIntoView({behavior:'smooth',block:'center'});first?.focus?.();},80);toast('Party details check karein: Mobile 10 digits, Aadhaar 12 digits aur PAN valid 10-character format hona chahiye.');}
  return ok;
}
const _v16DraftNextBase=draftNext;
draftNext=function(){if((currentDraftStep===2||currentDraftStep===5)&&!v16ValidateAllParties(true))return;return _v16DraftNextBase();};

function v16PatchDeedIdentitySpacing(legal){
  legal?.querySelectorAll('.party-id-trail').forEach(x=>x.closest('p')?.classList.add('party-identity-line'));
  [...(legal?.querySelectorAll('.deed-page-1 p')||[])].filter(p=>p.textContent.includes('विक्रेता/विक्रेताओं का नाम')).forEach(p=>p.classList.add('party-identity-line'));
}
function v16MovePhotosToPage3(d){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;
  legal.querySelectorAll('.deed-page-photo').forEach(x=>x.remove());
  legal.querySelectorAll('.deed-page-3 > .party-photo-section').forEach(x=>x.remove());
  const page3=legal.querySelector('.deed-page-3'),clause=page3?.querySelector('.center-clause');if(!page3||!clause)return;
  const holder=document.createElement('div');holder.innerHTML=v15PhotoGridHtml(d);const sec=holder.firstElementChild;if(sec){sec.classList.add('photo-after-final-clause');clause.insertAdjacentElement('afterend',sec);}
}
const _v16RenderAgricultureDeedBase=renderAgricultureDeed;
renderAgricultureDeed=function(d){_v16RenderAgricultureDeedBase(d);const legal=document.getElementById('legalDraftPreview');v16MovePhotosToPage3(d);v16PatchDeedIdentitySpacing(legal);};

// Larger Word fingerprint & witness cells to match printed layout.
v15FingerWord=function(el){
  let out=v15PText(el.querySelector(':scope > b')?.textContent||'Fingerprints',{bold:true,left:true,size:21});
  el.querySelectorAll('.finger-hand-block').forEach(h=>{out+=v15PText(h.querySelector('.finger-hand-title')?.textContent||'',{bold:true,left:true,size:19,after:35});const cells=[...h.querySelectorAll('.finger-print-box')].map(c=>v15Cell(v15PText(c.textContent.trim(),{center:true,size:17,after:0}),1800,{height:true}));out+=v15Table([`<w:tr><w:trPr><w:trHeight w:val="1750" w:hRule="atLeast"/></w:trPr>${cells.join('')}</w:tr>`]);});return out;
};
v15WitnessWord=function(el){const boxes=[...el.querySelectorAll('.witness-detail-box')];return v15PText('',{before:650,after:20})+v15Table([`<w:tr><w:trPr><w:trHeight w:val="2600" w:hRule="atLeast"/></w:trPr>${boxes.map(b=>v15Cell([...b.children].map((x,i)=>v15PFromNode(x,{left:true,size:i===0?21:20,bold:i===0,after:40})).join(''),4500)).join('')}</w:tr>`]);};

document.addEventListener('DOMContentLoaded',()=>{
  try{
    v16UpgradePrimaryParty('seller');v16UpgradePrimaryParty('buyer');
    document.querySelectorAll('#sellerParty .additional-party-card').forEach(x=>v16UpgradePartyCard(x,'seller',{}));
    document.querySelectorAll('#buyerParty .additional-party-card').forEach(x=>v16UpgradePartyCard(x,'buyer',{}));
  }catch(e){console.warn('v1.6 party init',e)}
});


/* ===== v1.7 FINAL BATCH FIXES =====
   1) Compact colorful sidebar + all dashboard actions active
   2) Payment table fit + exact payment/transaction match required
   3) Duplicate Aadhaar field removed; Aadhaar uses ID Type + ID No.
   4) Witness layout matches party row (without Email)
   5) Auto Compact: extra same-family members inherit common fields read-only
   6) Stamp page is advocate-wise Settings only; Page-1 stamp splits first 3 lines correctly
   7) Photo Seller-left / Buyer-right
   8) Fingerprint blocks never cross footer; move to continuation page when needed
   9) Property ledger browser + manual opening holding + sale stock validation + auto buyer holding
*/

// ---------- PDF wording: short Mob ----------
personLine=function(p){
  const bits=[partyRelationText(p),`निवासी ${esc(p?.address||'[पता]')}`];
  if(p?.aadhaar)bits.push(`Aadhaar Card: ${esc(p.aadhaar)}`);
  if(p?.mobile)bits.push(`Mob: ${esc(p.mobile)}`);
  if(p?.email)bits.push(`Email ID: ${esc(p.email)}`);
  return bits.join(', ');
};
witnessPersonLine=function(w,label){
  const m=relationMeta(w?.relation),name=relationName(w)||`[${label}]`;
  let out=`साक्षी- <b>${esc(name)}</b>`;
  if(w?.father)out+=` ${esc(m.word)} ${esc(w.father)}`;
  out+=` निवासी ${esc(w?.address||'[पता]')}`;
  if(w?.id)out+=`, ${esc(w?.idType||'ID')}: ${esc(w.id)}`;
  if(w?.mobile)out+=`, Mob: ${esc(w.mobile)}`;
  return out;
};
compactIdentityTrail=function(arr){
  const parts=arr.map(p=>{
    const x=[];
    if(p.aadhaar)x.push(`Aadhaar: ${esc(p.aadhaar)}`);
    if(p.mobile)x.push(`Mob: ${esc(p.mobile)}`);
    if(p.email)x.push(`Email: ${esc(p.email)}`);
    return x.length?`${esc(relationName(p)||p.name)} — ${x.join(', ')}`:'';
  }).filter(Boolean);
  return parts.length?` <span class="party-id-trail">(${parts.join('; ')})</span>`:'';
};
v15WitnessBox=function(w,label){
  const m=relationMeta(w?.relation),idLabel=w?.idType||'ID';
  return `<div class="witness-detail-box"><strong>${esc(label)}</strong><p><b>${esc(relationName(w)||'')}</b>${w?.father?` ${esc(m.word)} ${esc(w.father)}`:''}</p><p>निवासी: ${esc(w?.address||'')}</p><p>Mob: ${esc(w?.mobile||'-')} &nbsp; ${esc(idLabel)}: ${esc(w?.id||'-')}</p></div>`;
};

// ---------- Party ID normalization after duplicate Aadhaar removal ----------
function v17PartyNormalizeIdentity(p){
  if(!p)return p;
  const type=String(p.idType||'').toUpperCase(),id=String(p.idNo||'').trim();
  if(type==='AADHAAR'&&id)p.aadhaar=id.replace(/\D/g,'');
  if(type==='PAN CARD'&&id&&!p.pan)p.pan=id.toUpperCase();
  return p;
}
readExtraPartyCard=function(card){
  const get=f=>(card.querySelector(`[data-party-field="${f}"]`)?.value||'').trim();
  const p={name:get('name'),father:get('father'),relation:get('relation')||'S/O',address:get('address'),pan:get('pan'),email:get('email'),mobile:get('mobile'),idType:get('idType'),idNo:get('idNo'),biometricNote:get('biometricNote')};
  return v17PartyNormalizeIdentity(p);
};
const _v17DraftDataIdentityBase=draftData;
draftData=function(){
  const d=_v17DraftDataIdentityBase();
  ['seller','buyer'].forEach(type=>{
    const p=d[type]||{};
    p.idType=val(type+'IdType')||p.idType||'';
    p.idNo=val(type+'IdNo')||p.idNo||'';
    v17PartyNormalizeIdentity(p);
    d[type]=p;
  });
  d.sellers=collectParties('seller',d.seller).map(v17PartyNormalizeIdentity);
  d.buyers=collectParties('buyer',d.buyer).map(v17PartyNormalizeIdentity);
  d.seller=d.sellers[0]||d.seller;d.buyer=d.buyers[0]||d.buyer;
  ['witness1','witness2'].forEach(k=>{if(d[k])d[k].idType=val(k+'IdType')||d[k].idType||'';});
  const sp=selectedStampPage();
  d.stampPageSetting=sp?String(sp):'none';d.customStampPage=0;d.templateVersion='v1.7';
  return d;
};

// Load older drafts: old Aadhaar automatically becomes ID Type=AADHAAR.
const _v17LoadPartiesBase=v14LoadParties;
v14LoadParties=function(type,list,primary){
  _v17LoadPartiesBase(type,list,primary);
  const arr=normalizePartyList(list,primary),p=arr[0]||{};
  if(!p.idType&&p.aadhaar){v14Set(type+'IdType','AADHAAR');v14Set(type+'IdNo',p.aadhaar);}
  document.querySelectorAll(`#${type}Party .additional-party-card`).forEach((card,i)=>{
    const x=arr[i+1]||{},typ=card.querySelector('[data-party-field="idType"]'),idn=card.querySelector('[data-party-field="idNo"]');
    if(typ&&!typ.value&&x.aadhaar)typ.value='AADHAAR';
    if(idn&&!idn.value&&x.aadhaar)idn.value=x.aadhaar;
  });
  v17ApplyCompactMode(type);
};

// Hide any leftover standalone Aadhaar fields that dynamic older code may create.
function v17RemoveDuplicateAadhaar(root=document){
  root.querySelectorAll('.party-field-aadhaar').forEach(x=>x.remove());
}

// ---------- Auto Compact party editing ----------
function v17PartyStyle(){return document.getElementById('partyWritingStyle')?.value||'auto';}
function v17ApplyCompactMode(type){
  const panel=document.getElementById(type+'Party');if(!panel)return;
  const compact=v17PartyStyle()==='auto';
  const common={
    father:val(type+'Father'),relation:val(type+'Relation')||'S/O',address:val(type+'Address')
  };
  panel.querySelectorAll(`.additional-party-card[data-party-type="${type}"]`).forEach(card=>{
    v17RemoveDuplicateAadhaar(card);
    const father=card.querySelector('[data-party-field="father"]'),rel=card.querySelector('[data-party-field="relation"]'),address=card.querySelector('[data-party-field="address"]');
    const idType=card.querySelector('[data-party-field="idType"]'),idNo=card.querySelector('[data-party-field="idNo"]');
    if(compact){
      card.classList.add('compact-linked');
      if(father){father.value=common.father;father.readOnly=true;}
      if(rel){rel.value=common.relation;rel.disabled=true;}
      if(address){address.value=common.address;address.readOnly=true;}
      if(idType){idType.value='AADHAAR';idType.disabled=true;}
      if(idNo){idNo.inputMode='numeric';idNo.maxLength=12;idNo.placeholder='12 digit Aadhaar';idNo.dataset.partyRule='idno';}
    }else{
      card.classList.remove('compact-linked');
      if(father)father.readOnly=false;if(rel)rel.disabled=false;if(address)address.readOnly=false;if(idType)idType.disabled=false;
    }
  });
}
function v17ApplyAllCompact(){v17ApplyCompactMode('seller');v17ApplyCompactMode('buyer');syncDraftPreview();}

const _v17AddPartyBase=addParty;
addParty=function(type,data={}){
  _v17AddPartyBase(type,data);
  const panel=document.getElementById(type+'Party'),card=panel?.querySelector(`.additional-party-card[data-party-type="${type}"]:last-of-type`);
  if(card){v17RemoveDuplicateAadhaar(card);v17ApplyCompactMode(type);}
};

// ---------- Witness validation ----------
function v17WitnessError(el,msg){
  const small=el?.parentElement?.querySelector('.party-field-error');if(small){small.textContent=msg||'';small.classList.toggle('show',!!msg);}
  el?.classList.toggle('identity-invalid',!!msg);
}
function v17WitnessFieldInput(el){
  if(!el)return;el.value=String(el.value||'').replace(/\D/g,'').slice(0,10);
  const msg=el.value && !/^\d{10}$/.test(el.value)?'Mobile exactly 10 digits hona chahiye.':'';
  v17WitnessError(el,msg);
}
function v17WitnessIdTypeChanged(sel){
  const n=sel?.id?.match(/witness([12])IdType/)?.[1];if(!n)return;
  const id=document.getElementById('witness'+n+'Id');if(!id)return;
  id.value='';id.inputMode=sel.value==='AADHAAR'?'numeric':'text';id.maxLength=sel.value==='AADHAAR'?12:(sel.value==='PAN CARD'?10:40);v17WitnessError(id,'');
}
function v17WitnessIdNoInput(el){
  const n=el?.id?.match(/witness([12])Id/)?.[1];if(!n)return;
  const t=val('witness'+n+'IdType');
  if(t==='AADHAAR')el.value=String(el.value||'').replace(/\D/g,'').slice(0,12);
  else if(t==='PAN CARD')el.value=String(el.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);
  let msg='';
  if(t==='AADHAAR'&&el.value&&!/^\d{12}$/.test(el.value))msg='Aadhaar exactly 12 digits hona chahiye.';
  if(t==='PAN CARD'&&el.value&&!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(el.value))msg='PAN format ABCDE1234F hona chahiye.';
  v17WitnessError(el,msg);
}
function v17ValidateWitnesses(show=true){
  let ok=true,first=null;
  [1,2].forEach(n=>{
    const mob=document.getElementById('witness'+n+'Mobile'),id=document.getElementById('witness'+n+'Id'),typ=val('witness'+n+'IdType');
    if(mob?.value&&!/^\d{10}$/.test(mob.value)){ok=false;first=first||mob;v17WitnessError(mob,'Mobile exactly 10 digits hona chahiye.');}
    if(id?.value){
      if(!typ){ok=false;first=first||id;v17WitnessError(id,'ID Type select karein.');}
      else if(typ==='AADHAAR'&&!/^\d{12}$/.test(id.value)){ok=false;first=first||id;v17WitnessError(id,'Aadhaar exactly 12 digits hona chahiye.');}
      else if(typ==='PAN CARD'&&!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(id.value)){ok=false;first=first||id;v17WitnessError(id,'PAN format ABCDE1234F hona chahiye.');}
    }
  });
  if(!ok&&show){goDraftStep(3);setTimeout(()=>{first?.scrollIntoView({behavior:'smooth',block:'center'});first?.focus?.();},60);toast('Witness details check karein.');}
  return ok;
}

// ---------- Advocate-wise Stamp Settings only ----------
function v17FindAdvocate(name){
  const low=String(name||'').trim().toLowerCase();return getAdvocates().find(a=>String(a.name||'').trim().toLowerCase()===low);
}
selectedStampPage=function(){
  const name=val('advocateName')||v14SessionData().advocateName||v14SessionData().name;
  const a=v17FindAdvocate(name),v=String(a?.stampPage||'2');
  if(v==='none')return 0;return Number(v)===1?1:2;
};
loadAdvocateStampDefault=function(){scheduleV14Autosave();};
onStampPageSettingChange=function(){scheduleV14Autosave();};
saveAdvocateDefaultFromDraft=function(){
  const name=val('advocateName');if(!name)return;
  const arr=getAdvocates();let a=arr.find(x=>String(x.name||'').toLowerCase()===name.toLowerCase());
  if(!a){a={name,enrollment:val('advocateEnrollment'),mobile:val('advocateMobile'),stampPage:'2'};arr.push(a);}
  else{a.enrollment=val('advocateEnrollment')||a.enrollment;a.mobile=val('advocateMobile')||a.mobile;a.stampPage=a.stampPage||'2';}
  v14WriteJSON('registryProAdvocates',arr);refreshAdvocateSelects();
};
saveManagedAdvocate=function(){
  const name=val('manageAdvocateName');if(!name){toast('Advocate Name required');return;}
  const arr=getAdvocates();let a=arr.find(x=>String(x.name||'').toLowerCase()===name.toLowerCase());
  const stamp=a?.stampPage||'2',data={name,enrollment:val('manageAdvocateEnrollment'),mobile:val('manageAdvocateMobile'),stampPage:stamp};
  if(a)Object.assign(a,data);else arr.push(data);
  v14WriteJSON('registryProAdvocates',arr);refreshAdvocateSelects();renderAdvocateList();toast('Advocate saved');
};
function v17SaveAdvocateStamp(index,value){
  const arr=getAdvocates();if(!arr[index])return;arr[index].stampPage=value==='1'?'1':value==='none'?'none':'2';v14WriteJSON('registryProAdvocates',arr);toast(`${arr[index].name}: Stamp ${value==='none'?'None':'Page '+value}`);syncDraftPreview();
}
openSettingsHome=function(){
  const c=currentJurisdiction(),s=v14SessionData(),arr=getAdvocates();
  openSimpleManagement('Settings',`<h3>Current Office Context</h3><p><b>${esc(c.state)} → ${esc(c.district)} → ${esc(c.tehsil)}</b></p><p>Login: <b>${esc(s.name||'-')}</b> • Role: <b>${esc(s.role||'-')}</b> • Advocate: <b>${esc(s.advocateName||s.name||'-')}</b></p><button class="btn primary" onclick="showJurisdiction()">Change State / District / Tehsil / Role</button>
  <h3 style="margin-top:22px">Advocate-wise Stamp Page Setting</h3><p class="hint">Stamp page sirf yahin se set hoga. Draft advocate ko dekhkar Registry Pro automatically Page 1 / Page 2 use karega.</p>
  <table class="stamp-settings-table"><thead><tr><th>Advocate</th><th>Enrollment</th><th>Default Stamp Page</th></tr></thead><tbody>${arr.map((a,i)=>`<tr><td><b>${esc(a.name)}</b></td><td>${esc(a.enrollment||'-')}</td><td><select onchange="v17SaveAdvocateStamp(${i},this.value)"><option value="1" ${String(a.stampPage)==='1'?'selected':''}>Page 1</option><option value="2" ${!a.stampPage||String(a.stampPage)==='2'?'selected':''}>Page 2</option><option value="none" ${String(a.stampPage)==='none'?'selected':''}>No Stamp Space</option></select></td></tr>`).join('')||'<tr><td colspan="3">Pehle Advocate add karein.</td></tr>'}</tbody></table>
  <h3 style="margin-top:20px">Theme</h3><p class="hint">White + Orange + Light Green + Blue professional theme active.</p>`);
};

// ---------- Exact payment match ----------
function v17PaymentExact(show=true){
  const txn=Number(numv('transactionAmount')||0),total=collectPaymentRows().reduce((a,x)=>a+Number(x.amount||0),0),diff=txn-total;
  const wrap=document.querySelector('.payment-total'),match=document.getElementById('paymentMatch');
  if(wrap){wrap.classList.toggle('payment-ok',txn>0&&Math.abs(diff)<0.5);wrap.classList.toggle('payment-error',txn>0&&Math.abs(diff)>=0.5);}
  if(match&&txn>0&&Math.abs(diff)>=0.5){match.textContent=`✕ Exact match required • Difference ${inr(diff)}`;match.className='match-bad';}
  const ok=txn>0&&Math.abs(diff)<0.5;
  if(!ok&&show){goDraftStep(4);toast(`Save blocked: Payment Total ${inr(total)} must exactly match Transaction Amount ${inr(txn)}.`);}
  return ok;
}
const _v17UpdatePaymentBase=updatePaymentTotal;
updatePaymentTotal=function(){_v17UpdatePaymentBase();v17PaymentExact(false);};

// ---------- Property balance validation + auto buyer property ----------
function v17SellerParcelAvailability(d,parcel){
  const sellers=normalizePartyList(d.sellers,d.seller),village=d.village||'';
  const holders=v15PropertyMaster().filter(h=>v15ParcelKey(h.village,h.khata,h.khasra)===v15ParcelKey(village,parcel.khata,parcel.khasra)&&sellers.some(p=>v15PartyMatches(p,h)));
  return {holders,available:holders.reduce((a,h)=>a+Math.max(0,v15PropertyBalance(h).balanceHa),0)};
}
function v17ValidateSellerPropertyBalance(d,show=true){
  if(!d||!String(d.registryType||'').toLowerCase().includes('agriculture'))return true;
  const parcels=v15DraftParcelEntries(d).filter(p=>p.khasra&&Number(p.areaHa)>0);
  for(const p of parcels){
    const x=v17SellerParcelAvailability(d,p);
    if(!x.holders.length){
      if(show){goDraftStep(1);toast(`Sale blocked: Khasra/Gata ${p.khasra} ki opening/bought holding seller ke Property Ledger me add karein.`);}
      return false;
    }
    if(Number(p.areaHa)>x.available+0.0000001){
      if(show){goDraftStep(1);toast(`Sale blocked: Khasra/Gata ${p.khasra} me available ${x.available.toFixed(4)} ha hai, sale ${Number(p.areaHa).toFixed(4)} ha nahi ho sakti.`);}
      return false;
    }
  }
  return true;
}
function v17EnsureBuyerPropertyHoldings(d){
  if(!d||d.status!=='Completed'||!String(d.registryType||'').toLowerCase().includes('agriculture'))return;
  const buyers=normalizePartyList(d.buyers,d.buyer),parcels=v15DraftParcelEntries(d).filter(p=>p.khasra&&Number(p.areaHa)>0),arr=v15PropertyMaster();
  let changed=false;
  buyers.forEach(p=>parcels.forEach(pe=>{
    const exists=arr.some(h=>v15ParcelKey(h.village,h.khata,h.khasra)===v15ParcelKey(d.village||'',pe.khata,pe.khasra)&&v15PartyMatches(p,h));
    if(!exists){
      arr.push({id:'H'+Date.now()+Math.random().toString(16).slice(2),ownerAdvocate:v15CurrentOwner(),partyKey:v15PartyKey(p),party:{name:p.name||relationName(p),father:p.father||'',relation:p.relation||'S/O',address:p.address||'',aadhaar:p.aadhaar||'',mobile:p.mobile||'',email:p.email||''},village:d.village||'',khata:pe.khata||'',khasra:pe.khasra||'',openingQty:0,unit:'Hectare',openingHa:0,openingDate:v14DateOnly(d)||new Date().toISOString().slice(0,10),createdAt:new Date().toISOString(),source:'Auto from buy '+(d.registryNo||'')});changed=true;
    }
  }));
  if(changed)v15SavePropertyMaster(arr);
}

// ---------- One final Save/Continue gate ----------
const _v17DraftNextBase=draftNext;
draftNext=function(){
  const step=currentDraftStep;
  if(step===3&&!v17ValidateWitnesses(true))return;
  if((step===4||step===5)&&!v17PaymentExact(true))return;
  if(step===5){
    const d=draftData();if(!v17ValidateSellerPropertyBalance(d,true))return;
  }
  const out=_v17DraftNextBase();
  if(step===5){
    const saved=v14AllDrafts().find(x=>x.registryNo===v14ActiveRegistryNo&&x.status==='Completed');
    if(saved)v17EnsureBuyerPropertyHoldings(saved);
  }
  return out;
};

// ---------- Property ledger party browser ----------
function v17InjectPropertyBrowser(){
  const view=document.getElementById('propertyLedgerView');if(!view)return;
  const head=view.querySelector('.property-master-head');
  if(head&&!head.querySelector('.v17-add-party-btn'))head.insertAdjacentHTML('beforeend','<button class="btn soft-blue compact v17-add-party-btn" type="button" onclick="v15OpenAddParty()">＋ Add Party</button>');
  const add=view.querySelector('.property-add-card');
  if(add&&!document.getElementById('propertyPartyHoldings'))add.insertAdjacentHTML('afterend',`<div id="propertyPartyHoldings" class="card property-party-browser"><div class="property-party-browser-head"><div><h3>Selected Party Holdings</h3><p class="hint">Party select karte hi uske Village / Khata / Khasra aur current remaining area yahan dikhega.</p></div></div><div id="propertyPartyHoldingBody"></div></div>`);
}
function v17RenderSelectedPartyHoldings(){
  const body=document.getElementById('propertyPartyHoldingBody'),s=document.getElementById('propParty');if(!body||!s)return;
  const p=s.value!==''?s._partyData?.[Number(s.value)]:null;
  if(!p){body.innerHTML='<div class="empty-party-records">Party select karein, ya + Add Party se nayi party banayein.</div>';return;}
  const holders=v15PropertyMaster().filter(h=>v15PartyMatches(p,h));
  if(!holders.length){body.innerHTML=`<div class="empty-party-records"><b>${esc(relationName(p)||p.name||'Party')}</b> ki koi holding nahi mili. Neeche Add Property / Opening Holding se purani property manually add karein.</div>`;return;}
  const opts=holders.map((h,i)=>{const x=v15PropertyBalance(h);return `<option value="${i}">${esc(h.khasra)} — ${x.balanceHa.toFixed(4)} ha</option>`}).join('');
  body.innerHTML=`<div class="property-party-browser-grid"><label>Party<input readonly value="${esc(relationName(p)||p.name||'')}"></label><label>Khasra / Gata<select id="propertyHoldingKhasraSelect" onchange="v17PropertyBrowserSelectChanged()">${opts}</select></label><label>Available Area<input id="propertyHoldingAvailable" readonly></label></div><div class="property-holding-list">${holders.map(h=>{const x=v15PropertyBalance(h);return `<div class="property-holding-item"><span><small>Village</small><b>${esc(h.village)}</b></span><span><small>Khata / Khasra</small><b>${esc(h.khata)} / ${esc(h.khasra)}</b></span><span><small>Buy / Sale</small>+${x.buys.toFixed(4)} / -${x.sells.toFixed(4)} ha</span><span class="remaining"><small>Remaining</small>${x.balanceHa.toFixed(4)} ha</span></div>`}).join('')}</div>`;
  body._holders=holders;v17PropertyBrowserSelectChanged();
}
function v17PropertyBrowserSelectChanged(){
  const body=document.getElementById('propertyPartyHoldingBody'),sel=document.getElementById('propertyHoldingKhasraSelect'),out=document.getElementById('propertyHoldingAvailable');
  const h=body?._holders?.[Number(sel?.value||0)];if(out)out.value=h?v15PropertyBalance(h).balanceHa.toFixed(4)+' hectare':'';
}
const _v17PropertyPartyChangedBase=v15PropertyPartyChanged;
v15PropertyPartyChanged=function(){_v17PropertyPartyChangedBase();v17RenderSelectedPartyHoldings();};
const _v17OpenPropertiesBase=openPropertiesHome;
openPropertiesHome=function(){_v17OpenPropertiesBase();v17InjectPropertyBrowser();v17RenderSelectedPartyHoldings();};

// ---------- Photo boxes: Seller left / Buyer right ----------
v15PhotoGridHtml=function(d){
  const sellers=normalizePartyList(d.sellers,d.seller),buyers=normalizePartyList(d.buyers,d.buyer),rows=Math.max(sellers.length,buyers.length,1),cells=[];
  for(let i=0;i<rows;i++){
    const s=sellers[i],b=buyers[i];
    cells.push(s?`<div class="party-photo-box photo-seller"><div class="photo-placeholder">PHOTO</div><strong>Seller / विक्रेता${sellers.length>1?` ${i+1}`:''}</strong><small>${esc(relationName(s)||s.name||'')}</small></div>`:`<div class="party-photo-spacer photo-seller"></div>`);
    cells.push(b?`<div class="party-photo-box photo-buyer"><div class="photo-placeholder">PHOTO</div><strong>Buyer / क्रेता${buyers.length>1?` ${i+1}`:''}</strong><small>${esc(relationName(b)||b.name||'')}</small></div>`:`<div class="party-photo-spacer photo-buyer"></div>`);
  }
  return `<div class="party-photo-section"><b>विक्रेता / क्रेता फोटो</b><div class="party-photo-grid">${cells.join('')}</div></div>`;
};

// ---------- Stamp Page 1: only first three visual lines at bottom, rest continues next page ----------
function v17PrepareStampPageOne(){
  if(selectedStampPage()!==1)return;
  const legal=document.getElementById('legalDraftPreview'),p1=legal?.querySelector('.deed-page-1');if(!p1||p1.classList.contains('stamp-page-one-special'))return;
  const h1=p1.querySelector(':scope > h1'),grid=p1.querySelector(':scope > .deed-top-grid');if(!h1||!grid)return;
  const first=document.createElement('div');first.className='stamp-page-one-lines';
  first.appendChild(h1.cloneNode(true));
  const g=grid.cloneNode(true);[...g.children].slice(4).forEach(x=>x.remove());first.appendChild(g);
  h1.remove();[...grid.children].slice(0,4).forEach(x=>x.remove());
  const cont=document.createElement('section');cont.className='deed-page deed-page-page1-continuation';
  [...p1.children].forEach(x=>{if(!x.classList.contains('registry-page-footer'))cont.appendChild(x);});
  p1.className='deed-page deed-page-1 stamp-page-one-special';p1.innerHTML='';p1.appendChild(first);
  p1.parentNode.insertBefore(cont,p1.nextSibling);
}

// ---------- Fingerprint pagination ----------
function v17PageCapacity(page){return page?.clientHeight||1120;}
function v17BlockNeedsNextPage(page,block,extra=120){
  if(!page||!block)return false;
  const ph=v17PageCapacity(page),top=block.offsetTop||0,bh=block.offsetHeight||270;
  return top+bh>ph-extra;
}
function v17PaginateFingerprints(){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;
  const p4=legal.querySelector('.deed-page-4');
  if(p4){
    const seller=[...p4.querySelectorAll(':scope > .party-finger-person')];
    const manyPayments=p4.querySelectorAll('.payment-deed-table tbody tr').length>3;
    if(seller.length&&(manyPayments||v17BlockNeedsNextPage(p4,seller[0],135))){
      const pg=document.createElement('section');pg.className='deed-page deed-page-finger-continuation seller-finger-continuation';pg.innerHTML='<p class="finger-cont-heading"><b>विक्रेता — दोनों हाथ की अंगुलियों के निशान</b></p>';
      seller.forEach(x=>pg.appendChild(x));p4.parentNode.insertBefore(pg,p4.nextSibling);
    }
  }
  const p5=legal.querySelector('.deed-page-5');
  if(p5){
    const witness=p5.querySelector(':scope > .witness-box-grid'),foot=p5.querySelector(':scope > .deed-footer-lines'),buyers=[...p5.querySelectorAll(':scope > .party-finger-person')];
    if(witness&&buyers.length){
      const last=buyers[buyers.length-1],need=v17BlockNeedsNextPage(p5,witness,85)||(last.offsetTop+last.offsetHeight+(witness.offsetHeight||180)>v17PageCapacity(p5)-95);
      if(need){
        const wp=document.createElement('section');wp.className='deed-page deed-page-witness-final';wp.appendChild(witness);if(foot)wp.appendChild(foot);p5.parentNode.insertBefore(wp,p5.nextSibling);
      }
    }
  }
}

// Render pipeline: v1.6 renderer first, then stamp split + fingerprint pagination.
const _v17RenderAgricultureBase=renderAgricultureDeed;
renderAgricultureDeed=function(d){
  _v17RenderAgricultureBase(d);
  v17PrepareStampPageOne();
  v17PaginateFingerprints();
};

// Page chrome override aware of special Page-1 stamp layout.
applyDraftPageChrome=function(){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;
  let pages=[...legal.querySelectorAll('.deed-page')];if(!pages.length)return;
  const d=draftData(),stamp=selectedStampPage();
  pages.forEach((page,i)=>{
    page.querySelectorAll(':scope > .registry-page-footer,:scope > .stamp-reserve').forEach(x=>x.remove());
    page.classList.remove('stamp-selected-page','stamp-normal-page');
    page.querySelectorAll('.stamp-content-wrapper-created').forEach(w=>{while(w.firstChild)w.parentNode.insertBefore(w.firstChild,w);w.remove();});
    page.querySelectorAll('.page2-bottom.stamp-written-content-border').forEach(x=>x.classList.remove('stamp-written-content-border'));
    if(page.classList.contains('stamp-page-one-special')&&stamp===1){
      page.classList.add('stamp-selected-page');
    }else{
      if(page.classList.contains('deed-page-2')&&stamp!==i+1)page.classList.add('stamp-normal-page');
      if(stamp===i+1){
        page.classList.add('stamp-selected-page');
        if(page.classList.contains('deed-page-2')){
          const bottom=page.querySelector('.page2-bottom');if(bottom)bottom.classList.add('stamp-written-content-border');
        }else{
          const sp=document.createElement('div');sp.className='stamp-reserve';page.prepend(sp);
          const wrap=document.createElement('div');wrap.className='stamp-written-content-border stamp-content-wrapper-created';
          [...page.children].filter(x=>!x.classList.contains('stamp-reserve')&&!x.classList.contains('registry-page-footer')).forEach(x=>wrap.appendChild(x));page.appendChild(wrap);
        }
      }
    }
    const f=document.createElement('div');f.className='registry-page-footer';f.innerHTML=`<span>Advocate: <b>${esc(d.advocate?.name||d.ownerAdvocate||'-')}</b></span><span class="registry-footer-center"><strong>Registry Pro</strong><small>Registry No.: ${esc(d.registryNo||v14ActiveRegistryNo||'-')}</small></span><span>Page ${i+1}/${pages.length}</span>`;page.appendChild(f);
  });
};

// ---------- Dashboard property count + keep all dashboard buttons active ----------
const _v17RefreshDashboardBase=refreshDashboard;
refreshDashboard=function(){
  _v17RefreshDashboardBase();
  let e=document.getElementById('statPropertyRecords');
  if(!e){
    const card=[...document.querySelectorAll('.stat-card')].find(x=>(x.textContent||'').includes('Property Records'));
    if(card){e=card.querySelector('.stat-info strong');if(e)e.id='statPropertyRecords';const em=card.querySelector('.stat-info em');if(em)em.textContent='↑ Live property ledger';}
  }
  if(e)e.textContent=v15PropertyMaster().length;
  document.querySelectorAll('#dashboardView button[disabled]').forEach(b=>{if(!b.matches('[data-intentionally-disabled]'))b.disabled=false;});
};

// ---------- Init ----------
document.addEventListener('DOMContentLoaded',()=>{
  try{
    v17RemoveDuplicateAadhaar();
    const style=document.getElementById('partyWritingStyle');
    if(style)style.addEventListener('change',v17ApplyAllCompact);
    ['sellerFather','sellerAddress','sellerRelation','buyerFather','buyerAddress','buyerRelation'].forEach(id=>{
      const e=document.getElementById(id);if(e){e.addEventListener('input',()=>v17ApplyCompactMode(id.startsWith('seller')?'seller':'buyer'));e.addEventListener('change',()=>v17ApplyCompactMode(id.startsWith('seller')?'seller':'buyer'));}
    });
    v17ApplyAllCompact();
    refreshDashboard();
  }catch(e){console.warn('v1.7 init',e);}
});

function openTemplatesHome(){
  openSimpleManagement('Templates',`<div class="management-list"><div class="management-row"><div><strong>Agriculture Sale Deed</strong><small>Mapped and active</small></div><span class="status-chip">Active</span></div><div class="management-row"><div><strong>Residential Plot</strong><small>Dynamic workflow active; exact supplied legal format can be mapped here.</small></div><span class="status-chip">Active</span></div><div class="management-row"><div><strong>Gift / Agreement / Lease / Sale After Agreement</strong><small>Deed buttons active; supplied PDF templates will lock exact wording/fields.</small></div><span class="status-chip progress">Ready to map</span></div></div>`);
}

/* ===== v1.8 FINAL MASTER UPDATE =====
   Finalized 04-09-2026 discussion:
   - Clean dashboard + drawer
   - Website/App shared architecture + subscription scaffold
   - Rulebook pages 58-62 + Khasra distance mapping pages 63-112
   - Auto-fill + editable road-distance category
   - Property ledger is informational; sale area NEVER hard-blocks draft/checking copy
   - Checking Copy -> Approve Final workflow with soft warnings
   - Agreement to Sell module (advance, balance, due date, possession, clauses, previous deed)
   - Add Witness support
   - Boundary 1500/running m, Boring 25000 each
   - Building/commercial/industrial rule fields + depreciation helper
   - Terms, Language, Updates/Reminder, Mine, Upgrade/Subscription
*/

const V18_RULES={
  source:'ROORKEE_BHAGWANPUR circle-rate PDF',
  pages:{valuation:'58–62',khasra:'63–112'},
  boundaryRate:1500,
  boringRate:25000,
  road:[
    {min:0,max:5,factor:1,label:'Less than 5 m — normal/base rate'},
    {min:5,max:12,factor:1.05,label:'5 m to <12 m — +5%'},
    {min:12,max:15,factor:1.10,label:'12 m to <15 m — +10%'},
    {min:15,max:18,factor:1.15,label:'15 m to <18 m — +15%'},
    {min:18,max:null,factor:1.15,label:'18 m or more — +15%'}
  ],
  smallAgri:{generalSqM:1000,outsideUrbanSqM:500,note:'Small agricultural transfers may require non-agricultural rate as per supplied circle-rate rule.'},
  commercialDevelopedFactor:1.10,
  depreciationFactor(age){const a=Math.max(0,Math.min(100,Number(age)||0));return Math.pow(.99,a);}
};

// ---------- Drawer / clean navigation ----------
function v18DrawerHtml(){
  return `
    <button class="side-item" onclick="v18DrawerGo(showDashboard)"><span>⌂</span>Dashboard</button>
    <button class="side-item" onclick="v18DrawerGo(openSavedDrafts)"><span>⌕</span>Search / Drafts</button>
    <button class="side-item" onclick="v18DrawerGo(openAdvocatesHome)"><span>⚖</span>Advocate</button>
    <button class="side-item" onclick="v18DrawerGo(openPartiesHome)"><span>♙</span>Seller / Buyer Parties</button>
    <button class="side-item" onclick="v18DrawerGo(openPropertiesHome)"><span>▥</span>Property</button>
    <button class="side-item" onclick="v18DrawerGo(openReportsHome)"><span>⌁</span>Reports</button>
    <button class="side-item" onclick="v18DrawerGo(openRulesHome)"><span>▦</span>Rules & Circle Rate</button>
    <button class="side-item" onclick="v18DrawerGo(openUpdatesReminderHome)"><span>♧</span>Updates & Reminder <b class="drawer-badge" id="v18ReminderBadge">0</b></button>
    <button class="side-item" onclick="v18DrawerGo(openTermsHome)"><span>§</span>Terms & Conditions</button>
    <button class="side-item" onclick="v18DrawerGo(openSettingsHome)"><span>⚙</span>Settings</button>
    <button class="side-item" onclick="v18DrawerGo(openLanguageHome)"><span>文</span>Language</button>
    <button class="side-item" onclick="v18DrawerGo(openMineHome)"><span>◉</span>Mine</button>
    <div class="v18-upgrade-drawer"><strong>♛ Upgrade</strong><small id="v18DrawerPlanText">Free Trial</small><button class="btn primary compact" onclick="v18DrawerGo(openSubscriptionHome)">Upgrade Now →</button></div>`;
}
function v18BuildDrawers(){
  document.querySelectorAll('.sidebar .side-nav').forEach(n=>n.innerHTML=v18DrawerHtml());
  if(!document.getElementById('drawerBackdrop')){const d=document.createElement('div');d.id='drawerBackdrop';d.className='drawer-backdrop';d.onclick=closeSidebar;document.body.appendChild(d);}
}
function closeSidebar(){document.querySelectorAll('.sidebar').forEach(s=>s.classList.remove('open'));document.getElementById('drawerBackdrop')?.classList.remove('show');}
function toggleSidebar(){const active=[...document.querySelectorAll('.view.active .sidebar')][0]||document.querySelector('.sidebar');if(!active)return;const willOpen=!active.classList.contains('open');document.querySelectorAll('.sidebar').forEach(s=>s.classList.remove('open'));if(willOpen)active.classList.add('open');document.getElementById('drawerBackdrop')?.classList.toggle('show',willOpen);}
function v18DrawerGo(fn){closeSidebar();setTimeout(()=>{try{fn?.();}catch(e){console.warn(e)}},30);}

// ---------- Dashboard ----------
function v18SessionAdvocate(){const s=v14SessionData?.()||{};return s.advocateName||s.name||val('advocateName')||'Amit Sharma';}
function v18Greeting(){const h=new Date().getHours();return h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening';}
function v18SyncDashboardContext(){
  const c=currentJurisdiction?.()||{state:'Uttarakhand',district:'Haridwar',tehsil:'Bhagwanpur'};
  const setSel=(id,value,opts)=>{const e=document.getElementById(id);if(!e)return;if(opts){e.innerHTML=opts.map(x=>`<option ${x===value?'selected':''}>${esc(x)}</option>`).join('');}else if(![...e.options].some(o=>o.value===value))e.add(new Option(value,value));e.value=value;};
  setSel('dashState',c.state||'Uttarakhand',['Uttarakhand']);
  setSel('dashDistrict',c.district||'Haridwar',['Haridwar']);
  setSel('dashTehsil',c.tehsil||'Bhagwanpur',['Bhagwanpur','Roorkee','Manglaur']);
  const a=v18SessionAdvocate(),name=document.getElementById('v18AdvocateName');if(name)name.textContent=a;
  const av=document.getElementById('v18AdvocateAvatar');if(av)av.textContent=a.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'RP';
  const g=document.getElementById('v18Greeting');if(g)g.textContent=`${v18Greeting()}, ${a}`;
  const lang=localStorage.getItem('registryProLanguage')||'Hinglish';const le=document.getElementById('dashLanguage');if(le)le.value=lang;
}
function v18DashboardJurisdictionChanged(which){
  const c={state:val('dashState')||'Uttarakhand',district:val('dashDistrict')||'Haridwar',tehsil:val('dashTehsil')||'Bhagwanpur'};
  v14WriteJSON('registryProJurisdiction',c);try{updateDraftJurisdictionContext();}catch(e){};toast(`Jurisdiction: ${c.state} → ${c.district} → ${c.tehsil}`);
}
function startDashboardDeed(type){
  if(type==='Gift Deed'){openNewRegistry();setTimeout(()=>{document.getElementById('giftOptions')?.removeAttribute('hidden');},30);return;}
  if(type==='Agreement'){openNewRegistry();setTimeout(()=>{document.getElementById('agreementOptions')?.removeAttribute('hidden');},30);return;}
  openNewRegistry();setTimeout(()=>{
    v18EnsureExtraDeedTypes();
    const el=[...document.querySelectorAll('.property-type-card')].find(x=>x.dataset.type===type);
    if(el){selectPropertyType(el);startDraftSteps();}
  },30);
}
function openMoreRegistryTypes(){openSimpleManagement('More Registry Types',`<div class="management-list"><div class="management-row"><div><strong>Wasiyat / Will</strong><small>Future deed template</small></div><span class="status-chip progress">Coming Soon</span></div><div class="management-row"><div><strong>Release / Relinquishment</strong><small>Future deed template</small></div><span class="status-chip progress">Coming Soon</span></div><div class="management-row"><div><strong>Exchange</strong><small>Future deed template</small></div><span class="status-chip progress">Coming Soon</span></div><div class="management-row"><div><strong>Mortgage</strong><small>Future deed template</small></div><span class="status-chip progress">Coming Soon</span></div><div class="management-row"><div><strong>Partition</strong><small>Future deed template</small></div><span class="status-chip progress">Coming Soon</span></div></div>`);}
function continueLastDraft(){const d=v14VisibleDrafts().slice().sort((a,b)=>String(b.savedAtISO||'').localeCompare(String(a.savedAtISO||'')))[0];if(!d){openNewRegistry();return;}openSavedRegistry(d.registryNo);}
function v18MonthKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;}
const _v18RefreshDashboardBase=refreshDashboard;
refreshDashboard=function(){
  try{_v18RefreshDashboardBase();}catch(e){}
  const arr=v14VisibleDrafts?.()||[];const today=new Date().toISOString().slice(0,10),now=new Date(),thisM=v18MonthKey(now),prev=new Date(now.getFullYear(),now.getMonth()-1,1),lastM=v18MonthKey(prev);
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('statTodayDrafts',arr.filter(d=>v14DateOnly(d)===today).length);
  set('statThisMonth',arr.filter(d=>v14DateOnly(d).startsWith(thisM)).length);
  set('statLastMonth',arr.filter(d=>v14DateOnly(d).startsWith(lastM)).length);
  set('statPendingDrafts',arr.filter(d=>d.status!=='Completed').length);
  set('statFinalDrafts',arr.filter(d=>d.status==='Completed').length);
  const sorted=arr.slice().sort((a,b)=>String(b.savedAtISO||'').localeCompare(String(a.savedAtISO||''))),card=document.getElementById('continueLastDraftCard'),txt=document.getElementById('continueLastDraftText');
  if(card){card.hidden=!sorted.length;if(sorted.length&&txt){const d=sorted[0];txt.textContent=`${d.registryType||'Draft'} | ${d.registryNo||''} | ${d.village||''} | ${d.status||'In Progress'}`;}}
  const recent=document.getElementById('recentDrafts');if(recent){recent.innerHTML=sorted.slice(0,5).map(d=>`<div class="recent-item" onclick="openSavedRegistry('${esc(d.registryNo||'')}')"><div class="recent-doc">▤</div><div class="recent-main"><strong>${esc(d.registryType||'Draft')} — ${esc(d.village||'-')}</strong><small>${esc(d.registryNo||'Legacy')} • ${esc(v14DateOnly(d)||d.savedAt||'')}</small></div><span class="status-chip ${d.status==='Completed'?'':'progress'}">${esc(d.status||'Saved')}</span><div class="more-dot">›</div></div>`).join('')||'<div class="empty-recent">No draft yet.<br>Create your first Registry Draft.</div>';}
  v18SyncDashboardContext();v18RefreshSubscriptionBadges();v18RefreshReminderBadge();
};

// ---------- Utility views ----------
function openRulesHome(){
  const age=20,f=V18_RULES.depreciationFactor(age);
  openSimpleManagement('Rules & Circle Rate',`<div class="v18-rule-panel"><div class="v18-panel-title"><div><h3>Master Valuation Rulebook</h3><small>${V18_RULES.source} • Pages 58–62 + 63–112</small></div><button class="btn primary compact" onclick="window.open('data/states/uttarakhand/haridwar/pdfs/circle_rate_rules_khasra_pages_58_112.pdf','_blank')">Open PDF</button></div><div class="v18-rule-grid">
  <div class="v18-rule-item"><b>Road Width</b><small>&lt;5m base; 5–&lt;12m +5%; 12–&lt;15m +10%; 15–&lt;18m +15%; 18m+ +15%.</small></div>
  <div class="v18-rule-item"><b>Main Road Khasra Mapping</b><small>Pages 63–112: Village + Khasra/Gata → 0–50m / 51–200m auto suggestion; always editable.</small></div>
  <div class="v18-rule-item"><b>Boundary Wall</b><small>₹1,500 per running meter. 1/2/3/4 selected sides are added.</small></div>
  <div class="v18-rule-item"><b>Boring</b><small>₹25,000 per boring × quantity.</small></div>
  <div class="v18-rule-item"><b>Commercial / Developed Plot</b><small>Applicable rule can use 1.10× normal rate; widest road basis where applicable.</small></div>
  <div class="v18-rule-item"><b>Building Depreciation</b><small>Page 62 age factor is auto-calculated. Example ${age} years ≈ ${f.toFixed(3)}.</small></div>
  <div class="v18-rule-item"><b>Small Agriculture Transfer</b><small>1000 m² or less general / 500 m² or less outside urban area can trigger non-agri rate rule per supplied list; system warns/recommends.</small></div>
  <div class="v18-rule-item"><b>Mandatory Property Details</b><small>Urban/Semi-Urban/Rural, nature, Khata/Khasra, four boundaries/map, road distance/width, latitude-longitude and latest photo.</small></div>
  <div class="v18-rule-item"><b>Industrial</b><small>Construction type + machinery value as per Government Approved Valuer report; higher applicable rate where rules require.</small></div>
  <div class="v18-rule-item"><b>Auto-fill is editable</b><small>Rule engine suggests values. Advocate/user can edit the distance/category before checking/final copy.</small></div>
  </div></div>`);
}
function openUpdatesReminderHome(){const items=v18ReminderItems();openSimpleManagement('Updates & Reminder',`<div class="management-list">${items.map((x,i)=>`<div class="management-row"><div><strong>${esc(x.title)}</strong><small>${esc(x.note)}</small></div><button class="btn outline compact" onclick="v18MarkReminderDone(${i})">${x.done?'Done':'Mark Done'}</button></div>`).join('')||'<div class="empty-party-records">No reminders.</div>'}</div><div class="card" style="margin-top:14px"><h3>Add Reminder</h3><div class="form-grid three"><div><label>Title</label><input id="v18ReminderTitle"></div><div><label>Date</label><input id="v18ReminderDate" type="date"></div><div><label>Note</label><input id="v18ReminderNote"></div><div class="full"><button class="btn primary" onclick="v18AddReminder()">Add Reminder</button></div></div></div>`);}
function v18ReminderItems(){return v14ReadJSON('registryProReminders',[]);}
function v18SaveReminders(a){v14WriteJSON('registryProReminders',a);}
function v18AddReminder(){const title=val('v18ReminderTitle');if(!title){toast('Reminder title required');return;}const a=v18ReminderItems();a.push({title,date:val('v18ReminderDate'),note:val('v18ReminderNote')||'Registry Pro reminder',done:false});v18SaveReminders(a);openUpdatesReminderHome();v18RefreshReminderBadge();}
function v18MarkReminderDone(i){const a=v18ReminderItems();if(a[i])a[i].done=true;v18SaveReminders(a);openUpdatesReminderHome();v18RefreshReminderBadge();}
function v18RefreshReminderBadge(){const c=v18ReminderItems().filter(x=>!x.done).length;document.querySelectorAll('#v18ReminderBadge').forEach(e=>e.textContent=c);}
function openTermsHome(){openSimpleManagement('Terms & Conditions',`<div class="v18-terms"><h3>Registry Pro</h3><p>Registry Pro is a deed-drafting and record-management tool. Drafts must be reviewed by the responsible advocate/deed writer before final use or registration.</p><h3>Checking Copy</h3><p>System-generated checking copies may contain user-entered data or rule suggestions. Warnings are review aids and do not replace legal verification.</p><h3>Circle Rate & Rules</h3><p>Circle-rate references are based on mapped source documents uploaded to the system. The user remains responsible for confirming current applicable notifications/rates before final registration.</p><h3>Subscription</h3><p>Access to paid features may depend on an active subscription. Website and Android app are designed to share one entitlement state through the common backend.</p><h3>Privacy & Security</h3><p>Production deployment should use authenticated accounts, encrypted transport, role-based access and account-scoped cloud storage. Sensitive identity data should only be collected where required for the drafting workflow.</p></div>`);}
function setRegistryLanguage(v){localStorage.setItem('registryProLanguage',v||'Hinglish');toast(`Language preference: ${v}`);}
function openLanguageHome(){const cur=localStorage.getItem('registryProLanguage')||'Hinglish';openSimpleManagement('Language',`<div class="card"><h3>App Language</h3><p class="hint">Draft language and UI preference can be different. Current UI preference: <b>${esc(cur)}</b>.</p><div class="form-grid three"><button class="btn ${cur==='Hindi'?'primary':'outline'}" onclick="setRegistryLanguage('Hindi');openLanguageHome()">हिंदी</button><button class="btn ${cur==='English'?'primary':'outline'}" onclick="setRegistryLanguage('English');openLanguageHome()">English</button><button class="btn ${cur==='Hinglish'?'primary':'outline'}" onclick="setRegistryLanguage('Hinglish');openLanguageHome()">Hinglish</button></div></div>`);}
function openMineHome(){const s=v14SessionData?.()||{},sub=v18Subscription();openSimpleManagement('Mine',`<div class="card"><h3>${esc(v18SessionAdvocate())}</h3><p>Role: <b>${esc(s.role||'Advocate')}</b></p><p>Assigned Advocate: <b>${esc(s.advocateName||s.name||'-')}</b></p><p>Plan: <b>${esc(sub.plan)}</b> • Status: <b>${esc(sub.status)}</b></p><div class="draft-actions"><button class="btn outline" onclick="openSettingsHome()">Settings</button><button class="btn primary" onclick="openSubscriptionHome()">Manage Subscription</button></div></div>`);}

// ---------- Subscription scaffold (web + future Play Store shared entitlement) ----------
function v18Subscription(){let s=v14ReadJSON('registryProSubscription',null);if(!s){const start=new Date(),end=new Date(start.getTime()+30*86400000);s={plan:'Free Trial',status:'trial',source:'web',startedAt:start.toISOString(),expiresAt:end.toISOString(),entitlement:'registry_pro'};v14WriteJSON('registryProSubscription',s);}return s;}
function v18SetPlan(plan){const s=v18Subscription();s.plan=plan;s.status='active';s.source='web-demo';s.updatedAt=new Date().toISOString();s.expiresAt=new Date(Date.now()+(plan.includes('Year')?365:30)*86400000).toISOString();v14WriteJSON('registryProSubscription',s);toast(`${plan} selected in prototype. Production website gateway / Google Play purchase verification will connect to the same entitlement.`);openSubscriptionHome();refreshDashboard();}
function v18RefreshSubscriptionBadges(){const s=v18Subscription(),txt=s.status==='active'?s.plan:`${s.plan} • Trial`;document.querySelectorAll('#v18DrawerPlanText').forEach(e=>e.textContent=txt);}
function openSubscriptionHome(){const s=v18Subscription();openSimpleManagement('Upgrade / Subscription',`<div class="card"><div class="v18-panel-title"><div><h3>Registry Pro Subscription</h3><small>Website + Android app share one entitlement state.</small></div><span class="v18-subscription-chip ${s.status==='active'?'active':''}">${esc(s.status.toUpperCase())}</span></div><p>Current plan: <b>${esc(s.plan)}</b>${s.expiresAt?` • Valid until ${esc(String(s.expiresAt).slice(0,10))}`:''}</p><div class="v18-plan-grid"><div class="v18-plan"><strong>Free Trial</strong><div class="price">₹0</div><small>Try drafting workflow with trial limits.</small></div><div class="v18-plan recommended"><strong>Monthly Pro</strong><div class="price">₹—</div><small>Final price/payment gateway can be configured before launch.</small><button class="btn primary compact" onclick="v18SetPlan('Monthly Pro')">Select</button></div><div class="v18-plan"><strong>Yearly Pro</strong><div class="price">₹—</div><small>One shared entitlement for web + Android account.</small><button class="btn outline compact" onclick="v18SetPlan('Yearly Pro')">Select</button></div></div><p class="hint" style="margin-top:15px">Production rule: Android purchases use Google Play Billing and server-side verification; web payments use the configured web gateway. Both write to the same backend subscription entitlement.</p></div>`);}

// ---------- Add direct deed types missing from old selector ----------
function v18EnsureExtraDeedTypes(){
  const box=document.querySelector('#draftTypeScreen .deed-type-scroll');if(!box||box.querySelector('[data-type="Commercial Building"]'))return;
  const lease=[...box.children].find(x=>x.matches?.('[data-type="Lease"]'));
  const html=`<button class="property-type-card" data-type="Commercial Building" onclick="selectPropertyType(this)" ondblclick="openPropertyTypeDirect(this)"><span class="pt-icon blue">🏢</span><strong>Commercial Building</strong><small>Shop / Office / Commercial</small></button><button class="property-type-card" data-type="Industrial Building" onclick="selectPropertyType(this)" ondblclick="openPropertyTypeDirect(this)"><span class="pt-icon orange">🏭</span><strong>Industrial Building</strong><small>Factory / Industrial</small></button>`;
  lease?.insertAdjacentHTML('beforebegin',html);
}

// ---------- Agreement module ----------
function isAgreementMode(){return String(registrySelectedType||'').toLowerCase().startsWith('agreement');}
function v18AgreementDefaults(){return '1. प्रथम पक्ष संपत्ति को तय समय तक किसी तृतीय पक्ष के पक्ष में हस्तांतरित नहीं करेगा।\n2. द्वितीय पक्ष शेष राशि अंतिम बैनामा/विक्रय-पत्र के समय अदा करेगा।\n3. तय अंतिम तिथि तक बैनामा निष्पादित किया जाएगा।\n4. किसी पक्ष की चूक होने पर उपलब्ध कानूनी उपाय/विशिष्ट पालन (specific performance) का अधिकार लागू कानून व दस्तावेज की शर्तों के अनुसार रहेगा।';}
function v18InjectAgreementPanel(){
  const step=document.getElementById('draftStep4');if(!step||document.getElementById('agreementDetailsPanel'))return;
  const panel=document.createElement('div');panel.id='agreementDetailsPanel';panel.className='form-card v18-agreement-panel';panel.style.display='none';
  panel.innerHTML=`<div class="v18-panel-title"><div><h3>Agreement to Sell Details</h3><small>First Party / Second Party • Bayana • Balance • Due Date • Possession</small></div><span class="agri-badge">Agreement</span></div><div class="form-grid three"><div><label>Total Agreed Sale Price</label><input id="agreementTotalDisplay" readonly></div><div><label>Advance / Bayana (₹)</label><input id="agreementAdvance" type="number" min="0" step="1" oninput="v18AgreementAmountChanged()"></div><div><label>Balance Amount</label><input id="agreementBalance" readonly></div><div><label>Possession</label><select id="agreementPossession" onchange="syncDraftPreview()"><option value="without">Without Possession / बिना कब्जा</option><option value="with">With Possession / कब्जा सहित</option></select></div><div><label>Final Sale Deed / Registry Due Date</label><input id="agreementDueDate" type="date" onchange="v18SyncAgreementReminder();syncDraftPreview()"></div><div><label>Agreement Stamp Paid (₹)</label><input id="agreementStamp" type="number" min="0" step="1" oninput="syncDraftPreview()"></div><div class="full"><label>Agreement Conditions / शर्तें <small>Editable</small></label><textarea id="agreementClauses" rows="6" oninput="syncDraftPreview()">${v18AgreementDefaults()}</textarea></div></div><h3 class="subheading">Previous Ownership / Previous Deed Reference</h3><div class="form-grid four"><div><label>Previous Document Type</label><input id="agreementPrevDocType" placeholder="Sale Deed / Gift / etc."></div><div><label>Previous Seller / Title Holder</label><input id="agreementPrevSeller"></div><div><label>Registration Date</label><input id="agreementPrevDate" type="date"></div><div><label>Serial / Document No.</label><input id="agreementPrevSerial"></div><div><label>Book / Jild</label><input id="agreementPrevBook"></div><div><label>Page From</label><input id="agreementPrevPageFrom"></div><div><label>Page To</label><input id="agreementPrevPageTo"></div><div><label>Other Reference</label><input id="agreementPrevOther"></div></div><div class="v18-balance-box"><span>Balance payable at/for final sale deed</span><strong id="agreementBalanceText">₹0</strong></div>`;
  step.insertBefore(panel,step.firstChild);
}
function v18AgreementAmountChanged(render=true){const total=numv('transactionAmount'),adv=numv('agreementAdvance'),bal=Math.max(0,total-adv);const t=document.getElementById('agreementTotalDisplay'),b=document.getElementById('agreementBalance'),bt=document.getElementById('agreementBalanceText');if(t)t.value=inr(total);if(b)b.value=inr(bal);if(bt)bt.textContent=inr(bal);if(render)syncDraftPreview();}
function v18SyncAgreementVisibility(){
  v18InjectAgreementPanel();const yes=isAgreementMode(),p=document.getElementById('agreementDetailsPanel');if(p)p.style.display=yes?'':'none';
  const sellerTab=document.querySelector('#draftStep2 .party-tabs .party-tab:nth-child(1)'),buyerTab=document.querySelector('#draftStep2 .party-tabs .party-tab:nth-child(2)');if(sellerTab)sellerTab.textContent=yes?'First Party / प्रथम पक्ष':'Seller / विक्रेता';if(buyerTab)buyerTab.textContent=yes?'Second Party / द्वितीय पक्ष':'Buyer / क्रेता';
  v18AgreementAmountChanged(false);
}
function v18AgreementData(){const total=numv('transactionAmount'),advance=numv('agreementAdvance');return {total,advance,balance:Math.max(0,total-advance),possession:val('agreementPossession')||'without',dueDate:val('agreementDueDate'),stampPaid:numv('agreementStamp'),clauses:val('agreementClauses')||v18AgreementDefaults(),previous:{docType:val('agreementPrevDocType'),seller:val('agreementPrevSeller'),date:val('agreementPrevDate'),serial:val('agreementPrevSerial'),book:val('agreementPrevBook'),pageFrom:val('agreementPrevPageFrom'),pageTo:val('agreementPrevPageTo'),other:val('agreementPrevOther')}};}
function v18SyncAgreementReminder(){const due=val('agreementDueDate');if(!due)return;const no=v14ActiveRegistryNo||'Current Agreement',title=`Agreement Registry Due: ${no}`,a=v18ReminderItems();const i=a.findIndex(x=>x.autoKey===`agreement:${no}`);const item={title,date:due,note:'Final sale deed / registry due date from Agreement',done:false,autoKey:`agreement:${no}`};if(i>=0)a[i]={...a[i],...item};else a.push(item);v18SaveReminders(a);v18RefreshReminderBadge();}
function v18PaymentRowsHtml(rows){const use=(rows||[]).filter(x=>Number(x.amount)>0);if(!use.length)return '<p>Payment details: —</p>';return `<table class="payment-deed-table"><thead><tr><th>#</th><th>Mode</th><th>Amount</th><th>Ref.</th><th>Date</th></tr></thead><tbody>${use.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.mode||'')}</td><td>${formatDeedMoney(x.amount)}</td><td>${esc(x.ref||'')}</td><td>${esc(x.date||'')}</td></tr>`).join('')}</tbody></table>`;}
function v18AllWitnesses(d){const x=[d.witness1,d.witness2,...(d.additionalWitnesses||[])].filter(w=>w&&w.name);return x;}
function v18AgreementReview(d){const s=document.getElementById('reviewSummary');if(!s)return;const a=d.agreement,ws=v18AllWitnesses(d);s.innerHTML=`<div class="review-block"><h3>Agreement</h3><div class="review-row"><span>Type</span><strong>${esc(d.registryType)}</strong></div><div class="review-row"><span>Total Price</span><strong>${inr(a.total)}</strong></div><div class="review-row"><span>Advance / Bayana</span><strong>${inr(a.advance)}</strong></div><div class="review-row"><span>Balance</span><strong>${inr(a.balance)}</strong></div><div class="review-row"><span>Possession</span><strong>${a.possession==='with'?'With Possession':'Without Possession'}</strong></div><div class="review-row"><span>Final Registry Due</span><strong>${esc(a.dueDate||'-')}</strong></div></div><div class="review-block"><h3>Parties</h3><div class="review-row"><span>First Party</span><strong>${partyNamesForReview(d.sellers,d.seller)}</strong></div><div class="review-row"><span>Second Party</span><strong>${partyNamesForReview(d.buyers,d.buyer)}</strong></div><div class="review-row"><span>Witnesses</span><strong>${ws.length}</strong></div></div><div class="review-block"><h3>Property</h3><div class="review-row"><span>Village</span><strong>${esc(d.village||'-')}</strong></div><div class="review-row"><span>Khata / Khasra</span><strong>${esc(d.khataNo||'-')} / ${esc(d.khasraNo||(d.agri?.gataRows||[]).map(x=>x.gata).join(', ')||'-')}</strong></div><div class="review-row"><span>Area</span><strong>${d.agri?Number(d.agri.totalAreaHa||0).toFixed(4)+' hectare':Number(d.areaM2||0).toFixed(2)+' m²'}</strong></div><div class="review-row"><span>Circle Rate Ref.</span><strong>${esc(d.rateRef||'-')}</strong></div></div><div class="review-block"><h3>Previous Deed</h3><div class="review-row"><span>Type / Serial</span><strong>${esc(a.previous.docType||'-')} / ${esc(a.previous.serial||'-')}</strong></div><div class="review-row"><span>Previous Title Holder</span><strong>${esc(a.previous.seller||'-')}</strong></div></div>`;}
function v18AgreementDeed(d){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;const a=d.agreement,first=partiesPersonLines(normalizePartyList(d.sellers,d.seller),'प्रथम पक्ष'),second=partiesPersonLines(normalizePartyList(d.buyers,d.buyer),'द्वितीय पक्ष'),ws=v18AllWitnesses(d),pos=a.possession==='with'?'कब्जा सहित':'बिना कब्जा',clauses=String(a.clauses||'').split(/\n+/).map(x=>x.replace(/^\d+[.)-]?\s*/,'').trim()).filter(Boolean),prop=d.agri?groupedGataNarrative(d):`खाता सं0 ${esc(d.khataNo||'-')} खसरा सं0 ${esc(d.khasraNo||'-')} क्षेत्रफल ${Number(d.areaM2||0).toFixed(2)} वर्ग मीटर`;
  legal.innerHTML=`<div class="deed-document hindi-deed v18-agreement-deed"><section class="deed-page deed-page-1"><h1 class="agreement-title">इकरारनामा मायदा बय (${pos})</h1><div class="agreement-amount-grid"><div><small>कुल सौदा राशि</small><b>${formatDeedMoney(a.total)}</b></div><div><small>अग्रिम / बयाना</small><b>${formatDeedMoney(a.advance)}</b></div><div><small>शेष राशि</small><b>${formatDeedMoney(a.balance)}</b></div></div><p><b>सम्पत्ति का प्रकार:</b> ${esc(d.registryType.replace(/^Agreement\s*/i,'')||'सम्पत्ति')}</p><p><b>स्थित ग्राम:</b> ${esc(d.village||'-')} • ${esc(d.jurisdiction?.tehsil||d.agri?.tehsil||'')} • ${esc(d.jurisdiction?.district||d.agri?.district||'')}</p><p><b>Circle Rate Reference:</b> ${esc(d.rateRef||'-')}</p><p><b>प्रथम पक्ष:</b><br>${first}</p><p><b>द्वितीय पक्ष:</b><br>${second}</p><p>प्रथम पक्ष ने अपनी स्वेच्छा से उपरोक्त सम्पत्ति का सौदा कुल ${formatDeedMoney(a.total)} में द्वितीय पक्ष के साथ किया, जिसमें ${formatDeedMoney(a.advance)} अग्रिम/बयाना प्राप्त होना दर्ज है और ${formatDeedMoney(a.balance)} शेष है।</p></section><section class="deed-page deed-page-2"><h2>इकरारनामे की मुख्य शर्तें</h2><p><b>अंतिम बैनामा / विक्रय-पत्र की नियत तिथि:</b> ${esc(a.dueDate||'[तिथि]')}</p><p><b>कब्जा:</b> ${a.possession==='with'?'समझौते के अनुसार कब्जा दिया/स्वीकार किया गया है।':'अंतिम बैनामा के समय कब्जा दिया जाएगा; वर्तमान इकरारनामा बिना कब्जा है।'}</p><ol class="clause-list">${clauses.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p>यह इकरारनामा पक्षकारों द्वारा उपलब्ध कराये गये दस्तावेजों, पहचान विवरण और घोषित तथ्यों के आधार पर Checking Copy के रूप में तैयार किया गया है। Final Copy से पहले पक्षकार/अधिवक्ता सत्यापन करेंगे।</p></section><section class="deed-page deed-page-3"><h2>विवरण सम्पत्ति जिसका मायदा किया गया है</h2><p>${prop}</p><p><b>सीमायें:</b> पूरब — ${esc(d.boundaries?.east||'-')}; पश्चिम — ${esc(d.boundaries?.west||'-')}; उत्तर — ${esc(d.boundaries?.north||'-')}; दक्षिण — ${esc(d.boundaries?.south||'-')}.</p>${d.agri?`<p><b>मुख्य सड़क / दूरी:</b> ${esc(d.agri.mainRoadDistance||'-')}</p><p><b>अक्षांश / देशान्तर:</b> ${esc(d.agri.latitude||'-')} / ${esc(d.agri.longitude||'-')}</p>`:''}<h3>पूर्व स्वामित्व / Previous Deed</h3><p>${esc(a.previous.docType||'Previous document')} ${a.previous.serial?`सं0 ${esc(a.previous.serial)}`:''} ${a.previous.date?`दिनांक ${esc(a.previous.date)}`:''} ${a.previous.book?`जिल्द/बुक ${esc(a.previous.book)}`:''} ${a.previous.pageFrom?`पृष्ठ ${esc(a.previous.pageFrom)}${a.previous.pageTo?' से '+esc(a.previous.pageTo):''}`:''} ${a.previous.seller?`पूर्व स्वामी ${esc(a.previous.seller)}`:''} ${esc(a.previous.other||'')}</p></section><section class="deed-page deed-page-4"><h2>विवरण धनराशि प्राप्ति</h2>${v18PaymentRowsHtml(d.payments)}<p><b>Agreement Stamp Paid:</b> ${formatDeedMoney(a.stampPaid||0)}</p><h3>साक्षी</h3><div class="witness-box-grid">${ws.map((w,i)=>v15WitnessBox?v15WitnessBox(w,`साक्षी ${i+1}`):`<p>${witnessPersonLine(w,`साक्षी ${i+1}`)}</p>`).join('')}</div><p><b>Drafted By:</b> ${esc(d.advocate?.name||d.ownerAdvocate||'-')} ${esc(d.agri?.advocateOffice||'')}</p></section></div>`;
}

// ---------- Additional witnesses ----------
let v18WitnessCounter=2;
function v18InjectAddWitness(){const card=document.querySelector('#draftStep3 .form-card');if(!card||document.getElementById('v18AdditionalWitnesses'))return;const wrap=document.createElement('div');wrap.innerHTML=`<div id="v18AdditionalWitnesses"></div><div class="v18-add-witness-row"><button class="btn outline compact" type="button" onclick="v18AddWitness()">＋ Add Witness</button></div>`;card.appendChild(wrap);}
function v18AddWitness(data={}){v18WitnessCounter++;const box=document.getElementById('v18AdditionalWitnesses');if(!box)return;const n=v18WitnessCounter,d=document.createElement('div');d.className='v18-extra-witness';d.dataset.witnessIndex=n;d.innerHTML=`<div class="v18-extra-witness-head"><strong>Witness ${n}</strong><button class="btn danger compact" type="button" onclick="this.closest('.v18-extra-witness').remove();syncDraftPreview()">Remove</button></div><div class="party-official-grid witness-official-grid"><div><label>Name</label><input data-w="name" value="${esc(data.name||'')}" oninput="syncDraftPreview()"></div><div><label>Relation</label><select data-w="relation" onchange="syncDraftPreview()"><option value="S/O">S/O (पुत्र)</option><option value="W/O">W/O (पत्नी)</option><option value="D/O">D/O (पुत्री)</option></select></div><div><label>Father / Husband</label><input data-w="father" value="${esc(data.father||'')}" oninput="syncDraftPreview()"></div><div><label>Address</label><input data-w="address" value="${esc(data.address||'')}" oninput="syncDraftPreview()"></div><div><label>Mobile</label><input data-w="mobile" inputmode="numeric" value="${esc(data.mobile||'')}" oninput="this.value=this.value.replace(/\D/g,'').slice(0,10);syncDraftPreview()"></div><div><label>ID Type</label><select data-w="idType" onchange="syncDraftPreview()"><option value="">--Select--</option><option>VOTER ID</option><option>PAN CARD</option><option>DL</option><option>AADHAAR</option><option>OTHERS</option></select></div><div><label>ID No.</label><input data-w="id" value="${esc(data.id||'')}" oninput="syncDraftPreview()"></div></div>`;box.appendChild(d);d.querySelector('[data-w="relation"]').value=data.relation||'S/O';d.querySelector('[data-w="idType"]').value=data.idType||'';syncDraftPreview();}
function v18CollectExtraWitnesses(){return [...document.querySelectorAll('#v18AdditionalWitnesses .v18-extra-witness')].map(b=>{const g=k=>b.querySelector(`[data-w="${k}"]`)?.value||'';return {name:g('name'),relation:g('relation')||'S/O',father:g('father'),address:g('address'),mobile:g('mobile'),idType:g('idType'),id:g('id')};}).filter(x=>x.name||x.father||x.address||x.mobile||x.id);}
function v18LoadExtraWitnesses(list=[]){const box=document.getElementById('v18AdditionalWitnesses');if(box)box.innerHTML='';v18WitnessCounter=2;(list||[]).forEach(x=>v18AddWitness(x));}

// ---------- Boring quantity ----------
function v18InjectBoringQty(){const fixed=document.getElementById('boringFixedBox');if(!fixed||document.getElementById('boringQty'))return;fixed.innerHTML=`<span>Boring Value <small>₹25,000 each</small></span><label style="display:flex;align-items:center;gap:8px">Qty <input id="boringQty" type="number" min="1" step="1" value="1" style="width:80px" oninput="onAgriEnhancementChanged()"></label><strong id="boringQtyValue">₹25,000</strong>`;}
const _v18AgriEnhancementBase=agriEnhancementValue;
agriEnhancementValue=function(){const a=_v18AgriEnhancementBase(),treeStatus=val('treeBoringStatus'),qty=treeStatus.includes('बोरिंग')?Math.max(1,Math.floor(numv('boringQty')||1)):0,old=Number(a.boringValue)||0,newV=qty*V18_RULES.boringRate;a.boringQty=qty;a.boringRate=V18_RULES.boringRate;a.boringValue=newV;a.total=(Number(a.total)||0)-old+newV;const out=document.getElementById('boringQtyValue');if(out)out.textContent=inr(newV);return a;};

// ---------- Khasra road-distance mapping: auto suggestion + editable + remembers manual corrections ----------
const V18_KHASRA_DISTANCE_SEED={}; // Official pages 63–112 are the source. User/manual confirmed mappings are persisted locally and become auto-fill next time.
function v18NormKhasra(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,'');}
function v18MapKey(village,khasra){return `${circleNorm(village)}|${v18NormKhasra(khasra)}`;}
function v18KhasraOverrides(){return v14ReadJSON('registryProKhasraDistanceOverrides',{});}
function v18InjectRoadMappingPanel(){
  const area=document.getElementById('agricultureDeedFields');if(!area||document.getElementById('v18RoadDistanceCategory'))return;const target=document.getElementById('mainRoadDistance')?.closest('.form-grid');if(!target)return;
  const p=document.createElement('div');p.className='v18-road-map-panel';p.innerHTML=`<div class="v18-panel-title"><div><h3>Main Road Distance — Khasra Mapping</h3><small>Source: Circle-rate PDF pages 63–112 • Auto-fill + Editable</small></div><button class="btn outline compact" type="button" onclick="openOfficialCircleSourcePage(63)">Open Pages 63–112</button></div><div class="form-grid three"><div><label>Distance Category</label><select id="v18RoadDistanceCategory" onchange="v18RoadCategoryManualChanged()"><option value="">Auto / Not Found</option><option value="0-50">0–50 Meter</option><option value="51-200">51–200 Meter</option><option value="200+">More than 200 Meter</option><option value="manual">Manual / Other</option></select></div><div><label>Matched Khasra/Gata</label><input id="v18RoadMatchedKhasra" readonly></div><div><label>Rule Source Page</label><input id="v18RoadSourcePage" placeholder="63–112" oninput="v18RememberRoadMapping()"></div></div><div id="v18RoadAutoNote" class="v18-khasra-auto-note">Village + Khasra/Gata fill karte hi mapping search hogi. Agar official mapping seed me na mile to manual category select karein; system ise next time auto-fill karega.</div>`;target.parentNode.insertBefore(p,target);
}
function v18CurrentKhasra(){const rows=typeof collectAgriGataRows==='function'?collectAgriGataRows():[];return (rows.find(x=>String(x.gata||'').trim())?.gata)||val('khasraNo');}
function v18ApplyRoadDistanceText(cat){const e=document.getElementById('mainRoadDistance');if(!e)return;if(cat==='0-50')e.value='प्रमुख/मुख्य मार्ग से 0 से 50 मीटर की दूरी पर स्थित है।';else if(cat==='51-200')e.value='प्रमुख/मुख्य मार्ग से 51 से 200 मीटर की दूरी पर स्थित है।';else if(cat==='200+')e.value='प्रमुख/मुख्य मार्ग से 200 मीटर से अधिक दूरी पर स्थित है।';}
function v18AutoApplyKhasraDistance(){if(!isAgricultureMode())return;const v=val('village'),k=v18CurrentKhasra(),key=v18MapKey(v,k),ov=v18KhasraOverrides(),hit=ov[key]||V18_KHASRA_DISTANCE_SEED[key],sel=document.getElementById('v18RoadDistanceCategory'),mk=document.getElementById('v18RoadMatchedKhasra'),pg=document.getElementById('v18RoadSourcePage'),note=document.getElementById('v18RoadAutoNote');if(mk)mk.value=k||'';if(hit&&sel){sel.value=hit.category||'';if(pg)pg.value=hit.page||'';v18ApplyRoadDistanceText(hit.category);if(note){note.textContent=`Auto applied: ${hit.category==='0-50'?'0–50m':hit.category==='51-200'?'51–200m':hit.category==='200+'?'>200m':hit.category} • Source page ${hit.page||'63–112'} • Editable.`;note.className='v18-khasra-auto-note matched';}}else if(note){note.textContent=k?'Official mapping not yet confirmed in local searchable seed. Select category manually; it will be remembered and stay editable.':'Enter Khasra/Gata to search distance mapping.';note.className='v18-khasra-auto-note manual';}}
function v18RoadCategoryManualChanged(){const cat=val('v18RoadDistanceCategory');if(cat&&cat!=='manual')v18ApplyRoadDistanceText(cat);v18RememberRoadMapping();syncDraftPreview();}
function v18RememberRoadMapping(){const v=val('village'),k=v18CurrentKhasra(),cat=val('v18RoadDistanceCategory');if(!v||!k||!cat||cat==='manual')return;const o=v18KhasraOverrides();o[v18MapKey(v,k)]={category:cat,page:val('v18RoadSourcePage')||'63–112',updatedAt:new Date().toISOString()};v14WriteJSON('registryProKhasraDistanceOverrides',o);}
const _v18UpdateAgriAreaFromRows=typeof updateAgriAreaFromRows==='function'?updateAgriAreaFromRows:null;
if(_v18UpdateAgriAreaFromRows){updateAgriAreaFromRows=function(){const r=_v18UpdateAgriAreaFromRows();setTimeout(v18AutoApplyKhasraDistance,0);return r;};}

// ---------- Building / commercial / industrial rule panel ----------
function v18InjectBuildingRules(){const step=document.getElementById('draftStep1');if(!step||document.getElementById('v18BuildingRules'))return;const panel=document.createElement('div');panel.id='v18BuildingRules';panel.className='form-card v18-rule-panel';panel.style.display='none';panel.innerHTML=`<div class="v18-panel-title"><div><h3>Building / Commercial / Industrial Valuation Rules</h3><small>Circle-rate master rules pages 58–62</small></div></div><div class="form-grid four"><div><label>Construction Year</label><input id="v18ConstructionYear" type="number" min="1900" max="2100" oninput="v18UpdateBuildingRulePreview()"></div><div><label>Construction Type</label><select id="v18ConstructionType" onchange="syncDraftPreview()"><option>RCC</option><option>Load Bearing</option><option>Temporary</option><option>Industrial Shed</option><option>Other</option></select></div><div><label>No. of Floors</label><input id="v18Floors" type="number" min="1" value="1" oninput="syncDraftPreview()"></div><div><label>Widest Road (m)</label><input id="v18WidestRoad" type="number" min="0" step="0.1" oninput="syncDraftPreview()"></div><div><label>Approved Map</label><select id="v18ApprovedMap"><option>Yes</option><option>No</option><option>Not Applicable</option></select></div><div><label>Developed Commercial Plot?</label><select id="v18DevelopedCommercial" onchange="v18UpdateBuildingRulePreview()"><option value="no">No</option><option value="yes">Yes — 1.10× rule where applicable</option></select></div><div><label>Govt. Approved Valuer Machinery Value</label><input id="v18MachineryValue" type="number" min="0" oninput="syncDraftPreview()"></div><div><label>Property Category</label><select id="v18SettlementCategory"><option>Urban / नगरीय</option><option>Semi-Urban / अर्द्धनगरीय</option><option>Rural / ग्रामीण</option></select></div></div><div class="valuation-strip"><span>Age / Depreciation Factor <strong id="v18DepreciationFactor">1.000</strong></span><span>Commercial Factor <strong id="v18CommercialFactor">1.00×</strong></span></div>`;step.insertBefore(panel,step.firstChild.nextSibling);}
function v18IsBuildingMode(){return /building|industrial|commercial/i.test(String(registrySelectedType||''));}
function v18UpdateBuildingRulePreview(){const y=numv('v18ConstructionYear'),age=y?Math.max(0,new Date().getFullYear()-y):0,f=V18_RULES.depreciationFactor(age),df=document.getElementById('v18DepreciationFactor'),cf=document.getElementById('v18CommercialFactor');if(df)df.textContent=`${f.toFixed(3)} (${age} yr)`;if(cf)cf.textContent=val('v18DevelopedCommercial')==='yes'?'1.10×':'1.00×';syncDraftPreview();}
function v18SyncBuildingRuleVisibility(){v18InjectBuildingRules();const p=document.getElementById('v18BuildingRules');if(p)p.style.display=v18IsBuildingMode()?'':'none';}

// ---------- Common mandatory property data ----------
function v18InjectCommonPropertyRules(){const step=document.getElementById('draftStep1');if(!step||document.getElementById('v18CommonPropertyRules'))return;const p=document.createElement('div');p.id='v18CommonPropertyRules';p.className='form-card v18-rule-panel non-agri-only';p.innerHTML=`<div class="v18-panel-title"><div><h3>Rulebook Property Details</h3><small>Mandatory/reference fields from pages 58–62</small></div></div><div class="form-grid four"><div><label>Area Category</label><select id="v18CommonSettlement"><option>Urban / नगरीय</option><option>Semi-Urban / अर्द्धनगरीय</option><option>Rural / ग्रामीण</option></select></div><div><label>Latitude</label><input id="v18CommonLatitude" data-no-hindi="true"></div><div><label>Longitude</label><input id="v18CommonLongitude" data-no-hindi="true"></div><div><label>Latest Property Photo</label><input id="v18PropertyPhoto" type="file" accept="image/*" onchange="v18RememberFileName(this,'v18PropertyPhotoName')"><input id="v18PropertyPhotoName" type="hidden"></div><div><label>Four-boundary Map</label><select id="v18BoundaryMap"><option>Available</option><option>To be attached</option><option>Not Applicable</option></select></div><div><label>Main Road Distance Category</label><select id="v18CommonRoadDistance"><option>0–50 Meter</option><option>51–200 Meter</option><option>More than 200 Meter</option><option>Manual</option></select></div><div><label>Road Width (meter)</label><input id="v18CommonRoadWidth" type="number" min="0" step="0.1"></div><div><label>Property Nature</label><input id="v18PropertyNature" readonly></div></div>`;const anchor=document.getElementById('draftStep1').querySelector('.form-card');anchor?.parentNode.insertBefore(p,anchor.nextSibling);}
function v18RememberFileName(input,target){const e=document.getElementById(target);if(e)e.value=input.files?.[0]?.name||'';}

// ---------- Data layer additions ----------
const _v18DraftDataBase=draftData;
draftData=function(){const d=_v18DraftDataBase();d.templateVersion='v1.8';d.additionalWitnesses=v18CollectExtraWitnesses();d.ruleEngine={sourcePages:'58–112',roadDistanceCategory:val('v18RoadDistanceCategory'),roadSourcePage:val('v18RoadSourcePage'),settlementCategory:val('v18CommonSettlement')||val('v18SettlementCategory'),commonLatitude:val('v18CommonLatitude'),commonLongitude:val('v18CommonLongitude'),propertyPhotoName:val('v18PropertyPhotoName'),boundaryMap:val('v18BoundaryMap'),commonRoadDistance:val('v18CommonRoadDistance'),commonRoadWidth:numv('v18CommonRoadWidth'),constructionYear:numv('v18ConstructionYear'),constructionType:val('v18ConstructionType'),floors:numv('v18Floors'),widestRoad:numv('v18WidestRoad'),approvedMap:val('v18ApprovedMap'),developedCommercial:val('v18DevelopedCommercial'),machineryValuerValue:numv('v18MachineryValue')};if(d.ruleEngine.constructionYear){const age=Math.max(0,new Date().getFullYear()-d.ruleEngine.constructionYear);d.ruleEngine.buildingAge=age;d.ruleEngine.depreciationFactor=V18_RULES.depreciationFactor(age);}if(isAgreementMode()){d.agreement=v18AgreementData();d.advanceAmount=d.agreement.advance;}if(d.agri){const a=agriEnhancementValue();d.agri.boringQty=a.boringQty||0;d.agri.boringRate=a.boringRate||V18_RULES.boringRate;d.agri.boringValue=a.boringValue||0;d.agri.roadDistanceCategory=val('v18RoadDistanceCategory');d.agri.roadDistanceSourcePage=val('v18RoadSourcePage');}return d;};

const _v18LoadDraftFieldsBase=v14LoadDraftFields;
v14LoadDraftFields=function(d){_v18LoadDraftFieldsBase(d);v18LoadExtraWitnesses(d.additionalWitnesses||[]);const r=d.ruleEngine||{};[['v18RoadDistanceCategory',d.agri?.roadDistanceCategory||r.roadDistanceCategory],['v18RoadSourcePage',d.agri?.roadDistanceSourcePage||r.roadSourcePage],['v18CommonSettlement',r.settlementCategory],['v18CommonLatitude',r.commonLatitude],['v18CommonLongitude',r.commonLongitude],['v18PropertyPhotoName',r.propertyPhotoName],['v18BoundaryMap',r.boundaryMap],['v18CommonRoadDistance',r.commonRoadDistance],['v18CommonRoadWidth',r.commonRoadWidth],['v18ConstructionYear',r.constructionYear],['v18ConstructionType',r.constructionType],['v18Floors',r.floors],['v18WidestRoad',r.widestRoad],['v18ApprovedMap',r.approvedMap],['v18DevelopedCommercial',r.developedCommercial],['v18MachineryValue',r.machineryValuerValue],['boringQty',d.agri?.boringQty||1]].forEach(([id,v])=>v14Set(id,v));if(d.agreement){[['agreementAdvance',d.agreement.advance],['agreementPossession',d.agreement.possession],['agreementDueDate',d.agreement.dueDate],['agreementStamp',d.agreement.stampPaid],['agreementClauses',d.agreement.clauses],['agreementPrevDocType',d.agreement.previous?.docType],['agreementPrevSeller',d.agreement.previous?.seller],['agreementPrevDate',d.agreement.previous?.date],['agreementPrevSerial',d.agreement.previous?.serial],['agreementPrevBook',d.agreement.previous?.book],['agreementPrevPageFrom',d.agreement.previous?.pageFrom],['agreementPrevPageTo',d.agreement.previous?.pageTo],['agreementPrevOther',d.agreement.previous?.other]].forEach(([id,v])=>v14Set(id,v));}v18SyncAgreementVisibility();v18SyncBuildingRuleVisibility();v18AgreementAmountChanged(false);v18AutoApplyKhasraDistance();};

// ---------- Soft warning / checking copy workflow ----------
function v18PartyIdentityWarnings(d){const w=[];[...normalizePartyList(d.sellers,d.seller),...normalizePartyList(d.buyers,d.buyer)].forEach((p,i)=>{if(p.mobile&&!/^\d{10}$/.test(String(p.mobile).replace(/\D/g,'')))w.push(`Party ${p.name||i+1}: mobile should be 10 digits.`);if(p.aadhaar&&!/^\d{12}$/.test(String(p.aadhaar).replace(/\D/g,'')))w.push(`Party ${p.name||i+1}: Aadhaar should be 12 digits.`);if(p.pan&&!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(p.pan).toUpperCase()))w.push(`Party ${p.name||i+1}: PAN format check.`);});return w;}
function v18SellerPropertyWarnings(d){const out=[];if(!String(d.registryType||'').toLowerCase().includes('agriculture'))return out;for(const p of v15DraftParcelEntries(d).filter(x=>x.khasra&&Number(x.areaHa)>0)){const x=v17SellerParcelAvailability(d,p);if(!x.holders.length)out.push(`Khasra/Gata ${p.khasra}: seller opening/bought holding is not recorded in Property Ledger.`);else if(Number(p.areaHa)>x.available+1e-7)out.push(`Khasra/Gata ${p.khasra}: sale ${Number(p.areaHa).toFixed(4)} ha exceeds ledger available ${x.available.toFixed(4)} ha. Draft is still allowed.`);}return out;}
function v18CollectWarnings(d=draftData()){
  const w=[];const t=String(d.registryType||'').toLowerCase(),agri=t.includes('agriculture');
  const hasK=String(d.khasraNo||'').trim()||(d.agri?.gataRows||[]).some(r=>String(r.gata||'').trim());if(!hasK)w.push('Khasra / Gata number is missing.');
  if(agri&&Number(d.agri?.totalAreaHa||0)<=0)w.push('Agriculture sold area / rakba is missing.');if(!agri&&Number(d.areaM2||0)<=0)w.push('Property area is missing.');
  if(Number(d.transactionAmount||0)<=0)w.push(isAgreementMode()?'Total agreed sale price is missing.':'Transaction / sale consideration is missing.');
  const pay=(d.payments||[]).reduce((a,x)=>a+Number(x.amount||0),0);if(d.transactionAmount>0&&Math.abs(pay-d.transactionAmount)>.5)w.push(`Payment total ${inr(pay)} does not match transaction amount ${inr(d.transactionAmount)}.`);
  if(agri){if(!String(d.agri?.latitude||'').trim())w.push('Latitude is missing.');if(!String(d.agri?.longitude||'').trim())w.push('Longitude is missing.');if(!d.agri?.roadDistanceCategory)w.push('Khasra main-road distance category has not been confirmed.');const areaSqM=Number(d.agri?.totalAreaHa||0)*10000;const rural=String(d.agri?.circleSection||'').includes('ग्रामीण')||String(d.ruleEngine?.settlementCategory||'').toLowerCase().includes('rural');const threshold=rural?V18_RULES.smallAgri.outsideUrbanSqM:V18_RULES.smallAgri.generalSqM;if(areaSqM>0&&areaSqM<=threshold&&d.circleRateKey==='agri')w.push(`Small agriculture transfer (${areaSqM.toFixed(2)} m²) may require non-agricultural rate under the supplied rule; please verify.`);}
  if(isAgreementMode()){const a=d.agreement;if(a.advance>a.total)w.push('Agreement advance/bayana is greater than total agreed sale price.');if(!a.dueDate)w.push('Agreement final sale deed / registry due date is missing.');}
  w.push(...v18PartyIdentityWarnings(d),...v18SellerPropertyWarnings(d));return [...new Set(w)];
}
function v18RenderWarnings(d=draftData()){
  const step=document.getElementById('draftStep5'),sum=document.getElementById('reviewSummary');if(!step||!sum)return;let box=document.getElementById('v18ReviewWarnings');if(!box){box=document.createElement('div');box.id='v18ReviewWarnings';sum.parentElement.insertBefore(box,sum);}const w=v18CollectWarnings(d);box.className=w.length?'v18-warning-box':'v18-warning-box v18-warning-ok';box.innerHTML=w.length?`<h3>⚠ Checking Copy Warnings (${w.length})</h3><ul>${w.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'✓ No current soft warnings.';
}
function v18SaveStatus(status){const d=draftData();if(!d.registryNo)d.registryNo=v14EnsureRegistryNo();d.status=status;d.checkingCopy=status==='Checking Copy';d.finalApproved=status==='Completed';d._workingDraft=status==='In Progress';d.savedAtISO=new Date().toISOString();const arr=v14AllDrafts(),i=arr.findIndex(x=>x.registryNo===d.registryNo);if(i>=0)arr[i]=d;else arr.unshift(d);v14SaveDrafts(arr);v14LastOpenedDraft=d;if(status==='Completed'){v13LastCompletedDraft=d;try{v17EnsureBuyerPropertyHoldings(d);}catch(e){}}refreshDashboard();return d;}
function v18GenerateCheckingCopy(){v14EnsureRegistryNo();const d=v18SaveStatus('Checking Copy');syncDraftPreview();toast(`Checking Copy ${d.registryNo} saved. Warnings can be reviewed; edit remains allowed.`);goDraftStep(5);}
function v18ApproveFinal(){v14EnsureRegistryNo();const d=draftData(),w=v18CollectWarnings(d);if(w.length&&!confirm(`Checking Copy has ${w.length} warning(s). Advocate/user review ke baad Final approve karna hai?`))return;const saved=v18SaveStatus('Completed');syncDraftPreview();toast(`Final Copy approved: ${saved.registryNo}`);showSaveSuccessModal?.();}
function v18InjectCheckingControls(){const card=document.querySelector('#draftStep5 .form-card.preview-card');if(!card||document.getElementById('v18CheckingBanner'))return;const banner=document.createElement('div');banner.id='v18CheckingBanner';banner.className='v18-checking-banner';banner.innerHTML=`<div><strong>CHECKING COPY MODE</strong><small>Review → Edit → Approve Final. Warnings do not block checking copy.</small></div><span id="v18CopyStatus">Editable Draft</span>`;card.insertBefore(banner,card.firstChild);const toolbar=card.querySelector('.preview-toolbar');toolbar?.insertAdjacentHTML('afterend','<div class="v18-review-actions"><button class="btn primary" onclick="v18GenerateCheckingCopy()">Generate / Save Checking Copy</button><button class="btn outline" onclick="v18ApproveFinal()">✓ Approve Final Copy</button><button class="btn outline" onclick="openCurrentDraftWord()">Word</button></div>');}
function v18ApplyCopyState(d){const legal=document.getElementById('legalDraftPreview'),banner=document.getElementById('v18CheckingBanner'),status=document.getElementById('v18CopyStatus');if(!legal)return;const final=d.status==='Completed'||d.finalApproved;legal.classList.toggle('v18-checking-copy',!final);legal.classList.toggle('v18-final-copy',final);if(banner){banner.classList.toggle('final',final);banner.querySelector('strong').textContent=final?'FINAL COPY APPROVED':'CHECKING COPY MODE';}if(status)status.textContent=final?'Final / Locked Output':'Editable Checking Copy';}

// Remove old hard blocking. These remain visual checks only.
v17PaymentExact=function(show=true){const txn=Number(numv('transactionAmount')||0),total=collectPaymentRows().reduce((a,x)=>a+Number(x.amount||0),0),diff=txn-total,match=document.getElementById('paymentMatch'),wrap=document.querySelector('.payment-total');const ok=txn>0&&Math.abs(diff)<.5;if(wrap){wrap.classList.toggle('payment-ok',ok);wrap.classList.toggle('payment-error',txn>0&&!ok);}if(match){match.textContent=txn<=0?'':ok?'✓ Payment total matched':`⚠ Difference ${inr(diff)} — Checking Copy allowed`;match.className=ok?'match-ok':'match-bad';}if(show&&!ok)toast('Payment mismatch warning added to Checking Copy; draft is not blocked.');return true;};
v17ValidateSellerPropertyBalance=function(d,show=true){const w=v18SellerPropertyWarnings(d);if(show&&w.length)toast('Property Ledger warning added; draft/checking copy is not blocked.');return true;};
validateDraftRequiredFields=function(){return true;};
v16ValidateAllParties=function(show=true){const w=v18PartyIdentityWarnings(draftData());if(show&&w.length)toast('Party identity warnings added to Checking Copy; draft is not blocked.');return true;};
v17ValidateWitnesses=function(show=true){return true;};

// Final Save & Continue: step 5 creates checking copy; Final requires explicit Approve Final.
draftNext=function(){v14EnsureRegistryNo();if(currentDraftStep<5){v18SaveStatus('In Progress');goDraftStep(currentDraftStep+1);return;}v18GenerateCheckingCopy();};

// ---------- Preview override ----------
const _v18SyncDraftPreviewBase=syncDraftPreview;
syncDraftPreview=function(){
  try{_v18SyncDraftPreviewBase();}catch(e){console.warn('v1.8 base preview',e)}
  const d=draftData();if(isAgreementMode()){v18AgreementReview(d);v18AgreementDeed(d);try{applyDraftPageChrome();}catch(e){}}
  // Add extra witnesses to agriculture witness box after existing render.
  if(!isAgreementMode()&&d.additionalWitnesses?.length){const legal=document.getElementById('legalDraftPreview'),wl=legal?.querySelector('.witness-box-grid');if(wl)d.additionalWitnesses.forEach((w,i)=>wl.insertAdjacentHTML('beforeend',v15WitnessBox?v15WitnessBox(w,`साक्षी ${i+3}`):`<p>${witnessPersonLine(w,`साक्षी ${i+3}`)}</p>`));}
  v18RenderWarnings(d);v18ApplyCopyState(d);v18SyncAgreementVisibility();v18SyncBuildingRuleVisibility();
};

// ---------- Agreement -> Sale linkage ----------
function openSaleAfterAgreementPicker(){const arr=v14VisibleDrafts().filter(d=>String(d.registryType||'').startsWith('Agreement'));openSimpleManagement('Sale After Agreement',arr.length?`<div class="management-list">${arr.map(d=>`<div class="management-row"><div><strong>${esc(d.registryNo||'Agreement')} • ${esc(d.village||'-')}</strong><small>${esc(v14PartyNamesPlain(d.sellers,d.seller))} → ${esc(v14PartyNamesPlain(d.buyers,d.buyer))} • ${inr(d.agreement?.balance||0)} balance</small></div><button class="btn primary compact" onclick="createSaleAfterAgreement('${esc(d.registryNo)}')">Create Sale Draft</button></div>`).join('')}</div>`:'<div class="empty-party-records">No Agreement draft found. Pehle Agreement बनाएं.</div>');}
function createSaleAfterAgreement(no){const src=v14AllDrafts().find(x=>x.registryNo===no);if(!src)return;const d=JSON.parse(JSON.stringify(src)),raw=String(src.registryType||'').replace(/^Agreement\s*/,'').trim();d.registryType=raw==='Agriculture Land'?'Agriculture Land':raw||'Residential Plot';d.sourceAgreementNo=no;d.status='In Progress';d._workingDraft=true;d.finalApproved=false;d.checkingCopy=false;d.advanceAmount=src.agreement?.advance||0;delete d.registryNo;delete d.savedAtISO;v14LoadingDraft=true;v14ActiveRegistryNo=null;openNewRegistry();registrySelectedType=d.registryType;v14EnsureRegistryNo();document.getElementById('draftTypeScreen')?.classList.remove('active');document.getElementById('draftStepsScreen')?.classList.add('active');v14LoadDraftFields(d);goDraftStep(1);v14LoadingDraft=false;v18SaveStatus('In Progress');toast(`Sale draft created from Agreement ${no}`);}

// ---------- Rule suggestion hooks ----------
function v18SmallAgriRuleSuggestion(){if(!isAgricultureMode()||!selectedCircleLocation)return;const area=(Number(numv('agriTotalAreaHa'))||0)*10000;if(!area)return;const rural=String(selectedCircleLocation.section||'').includes('ग्रामीण'),threshold=rural?V18_RULES.smallAgri.outsideUrbanSqM:V18_RULES.smallAgri.generalSqM;if(area<=threshold&&selectedCircleRateKey==='agri'){const meta=document.getElementById('selectedLocationMeta');if(meta)meta.insertAdjacentHTML('beforeend',`<br><b style="color:#9a6200">Rule suggestion: area ${area.toFixed(2)} m² ≤ ${threshold} m²; verify whether non-agricultural rate must apply.</b>`);}}
const _v18RecalculateStamp=recalculateStampDuty;
recalculateStampDuty=function(){const r=_v18RecalculateStamp();setTimeout(()=>{try{v18SmallAgriRuleSuggestion();v18AgreementAmountChanged(false);}catch(e){}},0);return r;};

// ---------- Saved Drafts labels ----------
const _v18RenderSavedDraftsBase=renderSavedDraftsV14;
renderSavedDraftsV14=function(){_v18RenderSavedDraftsBase();document.querySelectorAll('.saved-draft-card').forEach(card=>{const chip=card.querySelector('.status-chip');if(chip&&chip.textContent==='Checking Copy')chip.classList.add('progress');});};

// ---------- Open view / setup ----------
const _v18SelectPropertyTypeBase=selectPropertyType;
selectPropertyType=function(el){_v18SelectPropertyTypeBase(el);v18SyncAgreementVisibility();v18SyncBuildingRuleVisibility();const n=document.getElementById('v18PropertyNature');if(n)n.value=registrySelectedType;};
const _v18OpenNewRegistryBase=openNewRegistry;
openNewRegistry=function(){_v18OpenNewRegistryBase();v18EnsureExtraDeedTypes();v18SyncAgreementVisibility();v18SyncBuildingRuleVisibility();v18AutoApplyKhasraDistance();};
const _v18ShowDashboardBase=showDashboard;
showDashboard=function(){closeSidebar();_v18ShowDashboardBase();refreshDashboard();};

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded',()=>{
  try{
    v18BuildDrawers();v18EnsureExtraDeedTypes();v18InjectAgreementPanel();v18InjectAddWitness();v18InjectBoringQty();v18InjectRoadMappingPanel();v18InjectBuildingRules();v18InjectCommonPropertyRules();v18InjectCheckingControls();
    const tx=document.getElementById('transactionAmount');tx?.addEventListener('input',v18AgreementAmountChanged);
    const village=document.getElementById('village');village?.addEventListener('change',()=>setTimeout(v18AutoApplyKhasraDistance,0));
    const tbs=document.getElementById('treeBoringStatus');tbs?.addEventListener('change',()=>setTimeout(()=>{const q=document.getElementById('boringQty');if(q&&!q.value)q.value='1';onAgriEnhancementChanged();},0));
    const status=document.getElementById('draftNextBtn');if(status)status.textContent='Save & Continue →';
    v18SyncDashboardContext();v18SyncAgreementVisibility();v18SyncBuildingRuleVisibility();refreshDashboard();
  }catch(e){console.warn('v1.8 init',e)}
});

/* ===== v1.9 FINAL ALL FIXES — 04 SEP 2026 =====
   Final user-confirmed corrections:
   - Checking copy exactly 2 pages; Final full deed 5–6 pages; final has no checking watermark
   - Residential Plot: simple rulebook, no floor/advance, covered-area valuation, sample-style Hindi sale deed
   - Agreement: Area Category + Property Nature only, 2% stamp on total agreed value, payment breakdown = advance only,
     dedicated Agreement Search + Create Registry linkage, sample-style agreement deed
   - Agriculture: Khasra road mapping panel immediately below Chak/Khasra rows; auto/editable mapping hook
   - Hard total-rakba validation: sold area cannot exceed total area
   - Aadhaar max 12, Mobile max 10, PAN max 10 for seller/buyer/witness/additional parties
   - Dynamic compact photo boxes: only actual Seller/Buyer count
   - Word stamp-page writing starts below reserved stamp content
   - Advocate workspace: Checking Copy / Final tabs, search, date filters, counts, printable PDF-style report
*/

const V19_VERSION='v1.9';
function v19Type(){return String(registrySelectedType||'').trim();}
function v19IsAgreement(){return typeof isAgreementMode==='function'&&isAgreementMode();}
function v19IsResidentialPlot(){return /residential\s*plot/i.test(v19Type())&&!v19IsAgreement();}
function v19IsPlotNature(){return /residential\s*plot/i.test(v19Type());}
function v19StoredDraftFor(d={}){const no=d.registryNo||v14ActiveRegistryNo||v14LastOpenedDraft?.registryNo;return no?(v14AllDrafts?.()||[]).find(x=>x.registryNo===no):null;}
function v19Status(d={}){return v19StoredDraftFor(d)?.status||d.status||((v14LastOpenedDraft?.registryNo===(d.registryNo||v14ActiveRegistryNo))?v14LastOpenedDraft?.status:'')||'In Progress';}
function v19IsFinal(d={}){return v19Status(d)==='Completed'||d.finalApproved===true||v19StoredDraftFor(d)?.finalApproved===true;}
function v19DateText(v){try{return v?formatDateDeed(v):'-';}catch(e){return v||'-';}}
function v19PlainNames(list,one){try{return v14PartyNamesPlain(list,one)||'-';}catch(e){const a=normalizePartyList(list,one);return a.map(x=>relationName(x)||x.name).filter(Boolean).join(', ')||'-';}}
function v19PropertyAreaText(d){if(String(d.registryType||'').toLowerCase().includes('agriculture'))return `${Number(d.agri?.totalAreaHa||0).toFixed(4)} ha`;return `${Number(d.areaSqft||0).toFixed(2)} sq ft / ${Number(d.areaM2||0).toFixed(2)} m²`;}
function v19KhasraText(d){return d.khasraNo||(d.agri?.gataRows||[]).map(x=>x.gata).filter(Boolean).join(', ')||'-';}

// ---------- Common Rulebook layout: remove duplicates ----------
function v19SyncCommonRulebook(){
  const p=document.getElementById('v18CommonPropertyRules');if(!p)return;
  p.classList.remove('non-agri-only');
  const agri=isAgricultureMode(),agreement=v19IsAgreement(),plainPlot=v19IsResidentialPlot();
  if(agri&&!agreement){p.style.display='none';return;}
  p.style.display='';
  const keep=agreement?['Area Category','Property Nature']:(plainPlot?['Area Category']:null);
  [...p.querySelectorAll('.form-grid > div')].forEach(box=>{
    const label=(box.querySelector('label')?.textContent||'').trim();
    box.style.display=(!keep||keep.some(k=>label.startsWith(k)))?'':'none';
  });
  const grid=p.querySelector('.form-grid');if(grid)grid.classList.toggle('v19-two-field-rulebook',!!keep);
  const sub=p.querySelector('.v18-panel-title small');if(sub)sub.textContent=agreement?'Agreement property classification':'Applicable property classification';
}

// ---------- Residential Plot: Covered Area, no floor, no advance ----------
function v19InjectResidentialCovered(){
  if(document.getElementById('v19ResidentialCoveredPanel'))return;
  const area=document.getElementById('totalAreaSqft')?.closest('.form-card');if(!area)return;
  const p=document.createElement('div');p.id='v19ResidentialCoveredPanel';p.className='form-card v19-covered-panel';p.style.display='none';
  p.innerHTML=`<div class="v18-panel-title"><div><h3>Covered Area / Plot Construction</h3><small>Plot par construction ho to Agriculture wale same covered-area valuation rule se add hoga.</small></div><span class="agri-badge">Optional</span></div><div class="form-grid four"><div><label>Construction / Covered Area?</label><select id="v19ResCoveredStatus" onchange="v19ResidentialCoveredChanged()"><option value="no">No / नहीं</option><option value="yes">Yes / हाँ</option></select></div><div><label>Covered Area (m²)</label><input id="v19ResCoveredM2" type="number" min="0" step="0.01" oninput="v19ResidentialCoveredChanged()"></div><div><label>Rate / m² <small>Fixed</small></label><input id="v19ResCoveredRate" value="14000" readonly></div><div><label>Covered Area Value</label><input id="v19ResCoveredValue" value="₹0" readonly></div></div>`;
  area.insertAdjacentElement('afterend',p);
}
function v19ResidentialCovered(){const yes=val('v19ResCoveredStatus')==='yes',m2=yes?numv('v19ResCoveredM2'):0,rate=14000,value=m2*rate;return {enabled:yes,m2,rate,value};}
function v19ResidentialCoveredChanged(){const a=v19ResidentialCovered(),e=document.getElementById('v19ResCoveredM2'),v=document.getElementById('v19ResCoveredValue');if(e)e.disabled=!a.enabled;if(v)v.value=inr(a.value);recalculate();recalculateStampDuty();syncDraftPreview();}
function v19SyncResidentialFields(){
  v19InjectResidentialCovered();const plot=v19IsPlotNature(),plain=v19IsResidentialPlot(),agreement=v19IsAgreement();
  const floor=document.getElementById('floorSelect')?.closest('div');if(floor)floor.style.display=plot?'none':'';
  const adv=document.getElementById('advanceAmount')?.closest('div');if(adv)adv.style.display=(plain||agreement)?'none':'';
  const cov=document.getElementById('v19ResidentialCoveredPanel');if(cov)cov.style.display=plain?'':'none';
  if(plain)v19ResidentialCoveredChangedSilent();
}
function v19ResidentialCoveredChangedSilent(){const a=v19ResidentialCovered(),e=document.getElementById('v19ResCoveredM2'),v=document.getElementById('v19ResCoveredValue');if(e)e.disabled=!a.enabled;if(v)v.value=inr(a.value);}
const _v19RecalculateBase=recalculate;
recalculate=function(){const c=_v19RecalculateBase();if(v19IsResidentialPlot()){const a=v19ResidentialCovered();c.baseLandValue=Number(c.plot)||0;c.coveredValue=a.value;c.plot=c.baseLandValue+a.value;const vo=document.getElementById('valueOut');if(vo)vo.textContent=inr(c.plot);const pv=document.getElementById('plotValueDisplay');if(pv)pv.value=inr(c.plot);}return c;};

// ---------- Agreement: 2% stamp on total transaction ----------
const _v19StampDutyDetailsBase=stampDutyDetails;
stampDutyDetails=function(){
  if(!v19IsAgreement())return _v19StampDutyDetailsBase();
  const c=recalculate(),txn=Math.max(0,numv('transactionAmount')),calculatedPayable=txn*.02;
  return {c,txn,governmentValue:Number(c.plot)||0,autoGovernment:Number(c.plot)||0,applicable:txn,payable:calculatedPayable,calculatedPayable,rateLabel:'2%',breakdown:`Agreement: Total agreed transaction ${inr(txn)} × 2% = ${inr(calculatedPayable)}.`,use:0,rebateType:'agreement'};
};
const _v19RecalculateStampDutyBase=recalculateStampDuty;
recalculateStampDuty=function(){
  if(!v19IsAgreement())return _v19RecalculateStampDutyBase();
  const s=stampDutyDetails(),set=(id,txt)=>{const e=document.getElementById(id);if(!e)return;if(e.tagName==='INPUT')e.value=txt;else e.textContent=txt;};
  const gov=document.getElementById('stampGovValue');if(gov)gov.value=String(Math.round(s.governmentValue||0));
  set('stampTxnValue',inr(s.txn));set('stampApplicable',inr(s.txn));set('stampRate','2%');
  const pay=document.getElementById('stampPayable');if(pay){pay.value=String(Math.round(s.calculatedPayable));pay.readOnly=true;}
  const detail=document.getElementById('stampRuleBreakdown');if(detail)detail.textContent=s.breakdown;
  const ah=document.getElementById('agreementStamp');if(ah){ah.value=String(Math.round(s.calculatedPayable));ah.readOnly=true;}
  const ph=document.getElementById('stampPayableAutoHint');if(ph)ph.textContent=`Agreement 2% auto: ${inr(s.calculatedPayable)}`;
  updatePaymentTotal();return s;
};

// Agreement Payment Breakdown = only Advance/Bayana
const _v19UpdatePaymentTotalBase=updatePaymentTotal;
updatePaymentTotal=function(){
  if(!v19IsAgreement())return _v19UpdatePaymentTotalBase();
  let total=0;document.querySelectorAll('#paymentRows .pay-amount').forEach(x=>total+=parseFloat(x.value)||0);
  const out=document.getElementById('paymentTotal');if(out)out.textContent=inr(total);
  const target=Math.max(0,numv('agreementAdvance')),match=document.getElementById('paymentMatch');
  if(match){if(!target&&total===0){match.textContent='Advance / Bayana payment details';match.className='';}else if(Math.abs(total-target)<.5){match.textContent='✓ Matches Advance / Bayana';match.className='match-ok';}else{match.textContent=`Advance difference ${inr(target-total)}`;match.className='match-bad';}}
};
v17PaymentExact=function(show=true){
  const target=v19IsAgreement()?Math.max(0,numv('agreementAdvance')):Math.max(0,numv('transactionAmount'));
  const total=collectPaymentRows().reduce((a,x)=>a+Number(x.amount||0),0),diff=target-total,match=document.getElementById('paymentMatch'),wrap=document.querySelector('.payment-total'),ok=target>0&&Math.abs(diff)<.5;
  if(wrap){wrap.classList.toggle('payment-ok',ok);wrap.classList.toggle('payment-error',target>0&&!ok);}if(match){match.textContent=target<=0?'':ok?(v19IsAgreement()?'✓ Matches Advance / Bayana':'✓ Payment total matched'):`⚠ Difference ${inr(diff)} — Checking Copy allowed`;match.className=ok?'match-ok':'match-bad';}if(show&&!ok)toast(v19IsAgreement()?'Advance/Bayana payment breakdown check karein.':'Payment mismatch warning added to Checking Copy.');return true;
};
const _v19AgreementAmountChangedBase=v18AgreementAmountChanged;
v18AgreementAmountChanged=function(render=true){_v19AgreementAmountChangedBase(false);const total=numv('transactionAmount'),stamp=total*.02,a=document.getElementById('agreementStamp');if(a){a.value=String(Math.round(stamp));a.readOnly=true;}const lab=a?.closest('div')?.querySelector('label');if(lab)lab.textContent='Agreement Stamp Duty — 2% Auto (₹)';updatePaymentTotal();if(render){recalculateStampDuty();syncDraftPreview();}};

// ---------- Data layer v1.9 ----------
const _v19DraftDataBase=draftData;
draftData=function(){const d=_v19DraftDataBase();d.templateVersion=V19_VERSION;d.residentialCovered=v19ResidentialCovered();if(v19IsAgreement()){d.agreement=d.agreement||v18AgreementData();d.agreement.stampPaid=Math.round(Number(d.transactionAmount||0)*.02);d.advanceAmount=d.agreement.advance;}return d;};
const _v19LoadDraftFieldsBase=v14LoadDraftFields;
v14LoadDraftFields=function(d){_v19LoadDraftFieldsBase(d);if(d.residentialCovered){v14Set('v19ResCoveredStatus',d.residentialCovered.enabled?'yes':'no');v14Set('v19ResCoveredM2',d.residentialCovered.m2||'');}v19SyncAllModeUi();};

// ---------- Hard total rakba validation ----------
function v19ValidateSaleAreas(show=true){
  let ok=true,first=null;document.querySelectorAll('#agriGataRows tr').forEach(tr=>{const t=tr.querySelector('.gata-total-area'),s=tr.querySelector('.gata-sold-area'),total=Number(t?.value||0),sold=Number(s?.value||0),bad=sold>total+1e-9;if(s)s.setCustomValidity(bad?'विक्रित रकबा कुल रकबा से अधिक नहीं हो सकता।':'');if(t)t.setCustomValidity(bad?'कुल रकबा विक्रित रकबे से कम है।':'');tr.classList.toggle('v19-area-error',bad);if(bad){ok=false;first=first||s;}});
  if(!ok&&show){goDraftStep(1);setTimeout(()=>{first?.scrollIntoView({behavior:'smooth',block:'center'});first?.focus();first?.reportValidity?.();},80);toast('विक्रित रकबा कुल रकबा के बराबर या उससे कम होना चाहिए।');}
  return ok;
}
const _v19ValidateAgriGataRowBase=validateAgriGataRow;
validateAgriGataRow=function(source){const tr=source?.closest?.('tr'),t=tr?.querySelector('.gata-total-area'),s=tr?.querySelector('.gata-sold-area'),total=Number(t?.value||0),sold=Number(s?.value||0);if(source===s&&total>=0&&sold>total){s.value=total>0?total.toFixed(4):'';s.setCustomValidity('');s.classList.remove('identity-invalid');toast('Sale / विक्रित रकबा कुल रकबा से अधिक नहीं हो सकता।');updateAgriAreaFromRows();return true;}const ok=_v19ValidateAgriGataRowBase(source);if(t&&s&&Number(s.value||0)>Number(t.value||0)){s.classList.add('identity-invalid');}else s?.classList.remove('identity-invalid');return ok;};

// ---------- Identity hard input lengths ----------
function v19LimitIdentityInput(el){
  if(!el)return;const rule=el.dataset.partyRule||el.dataset.witnessRule||'';
  if(rule==='mobile'){el.value=String(el.value||'').replace(/\D/g,'').slice(0,10);el.maxLength=10;}
  if(rule==='aadhaar'){el.value=String(el.value||'').replace(/\D/g,'').slice(0,12);el.maxLength=12;}
  if(rule==='pan'){el.value=String(el.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);el.maxLength=10;}
  if(rule==='idno'){
    const card=el.closest('.form-card'),type=(card?.querySelector('[data-party-field="idType"],select[id$="IdType"]')?.value||'').toUpperCase();
    if(type==='AADHAAR'){el.value=String(el.value||'').replace(/\D/g,'').slice(0,12);el.maxLength=12;}
    else if(type==='PAN CARD'){el.value=String(el.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);el.maxLength=10;}
  }
}
const _v19PartyFieldInputBase=v16PartyFieldInput;
v16PartyFieldInput=function(el){v19LimitIdentityInput(el);return _v19PartyFieldInputBase(el);};
const _v19IdentityNoInputBase=v16IdentityNoInput;
v16IdentityNoInput=function(el){v19LimitIdentityInput(el);const r=_v19IdentityNoInputBase(el);v19LimitIdentityInput(el);return r;};
const _v19WitnessFieldInputBase=v17WitnessFieldInput;
v17WitnessFieldInput=function(el){v19LimitIdentityInput(el);return _v19WitnessFieldInputBase(el);};
const _v19WitnessIdNoInputBase=v17WitnessIdNoInput;
v17WitnessIdNoInput=function(el){v19LimitIdentityInput(el);const r=_v19WitnessIdNoInputBase(el);v19LimitIdentityInput(el);return r;};
function v19ApplyIdentityMaxima(root=document){
  root.querySelectorAll('[data-party-rule="mobile"],[data-witness-rule="mobile"]').forEach(e=>{e.maxLength=10;e.inputMode='numeric';});
  root.querySelectorAll('[data-party-rule="aadhaar"]').forEach(e=>{e.maxLength=12;e.inputMode='numeric';});
  root.querySelectorAll('[data-party-rule="pan"]').forEach(e=>e.maxLength=10);
  root.querySelectorAll('[data-party-rule="idno"],[data-witness-rule="idno"]').forEach(e=>v19LimitIdentityInput(e));
}

// ---------- Khasra road-distance panel position + editable auto logic ----------
function v19MoveRoadMappingPanel(){
  const panel=document.querySelector('.v18-road-map-panel'),wrap=document.querySelector('#agricultureDeedFields .gata-table-wrap');if(!panel||!wrap)return;
  wrap.insertAdjacentElement('afterend',panel);
  const title=panel.querySelector('.v18-panel-title small');if(title)title.textContent='Official source: Circle-rate pages 63–112 • Village + Khasra/Gata Auto-fill • Editable';
}
// Works for Agriculture and Agreement-Agriculture. Official seed/verified overrides are searched; manual edit remains persisted.
const _v19AutoApplyKhasraDistanceBase=v18AutoApplyKhasraDistance;
v18AutoApplyKhasraDistance=function(){if(!isAgricultureMode())return;_v19AutoApplyKhasraDistanceBase();const cat=val('v18RoadDistanceCategory');if(cat){const r=document.getElementById('roadWidth');if(r)r.dispatchEvent(new Event('change',{bubbles:true}));recalculate();recalculateStampDuty();syncDraftPreview();}};

// ---------- Dynamic compact actual-count photo boxes ----------
v15PhotoGridHtml=function(d){
  const items=[];normalizePartyList(d.sellers,d.seller).forEach((p,i)=>items.push({type:'Seller / विक्रेता',p,i,total:normalizePartyList(d.sellers,d.seller).length}));normalizePartyList(d.buyers,d.buyer).forEach((p,i)=>items.push({type:'Buyer / क्रेता',p,i,total:normalizePartyList(d.buyers,d.buyer).length}));if(!items.length)return '';
  return `<div class="party-photo-section v19-photo-section"><b>विक्रेता / क्रेता फोटो</b><div class="party-photo-grid v19-photo-grid" data-count="${items.length}">${items.map(x=>`<div class="party-photo-box ${x.type.startsWith('Seller')?'photo-seller':'photo-buyer'}"><div class="photo-placeholder">PHOTO</div><strong>${esc(x.type)}${x.total>1?` ${x.i+1}`:''}</strong><small>${esc(relationName(x.p)||x.p?.name||'')}</small></div>`).join('')}</div></div>`;
};
v15PhotoWord=function(el){const boxes=[...el.querySelectorAll('.party-photo-box')],cols=Math.min(4,Math.max(1,boxes.length)),w=Math.floor(9000/cols),rows=[];for(let i=0;i<boxes.length;i+=cols){const cs=boxes.slice(i,i+cols).map(b=>v15Cell(v15PText((b.innerText||'').replace(/\s+/g,' ').trim(),{center:true,size:17}),w,{height:true}));while(cs.length<cols)cs.push(v15Cell('<w:p/>',w,{height:true}));rows.push(`<w:tr><w:trPr><w:trHeight w:val="1050" w:hRule="atLeast"/></w:trPr>${cs.join('')}</w:tr>`);}return v15PText(el.querySelector(':scope > b')?.textContent||'Photos',{bold:true,left:true})+v15Table(rows);};

// ---------- Word stamp page: reserve writing area before stamp-page content ----------
const _v19ElementBlocksBase=v15ElementBlocks;
v15ElementBlocks=function(el){
  if(el?.classList?.contains('page2-bottom')&&el.classList.contains('stamp-written-content-border')){
    const inner=[...el.children].map(v15ElementBlocks).join('');
    return v15PText('',{before:5200,after:50})+v15Table([`<w:tr>${v15Cell(inner,9000)}</w:tr>`]);
  }
  return _v19ElementBlocksBase(el);
};

// ---------- 2-page Checking Copy ----------
function v19CheckingCopyHtml(d){
  const agri=String(d.registryType||'').toLowerCase().includes('agriculture'),agreement=String(d.registryType||'').toLowerCase().startsWith('agreement'),a=d.agreement||{},warnings=v18CollectWarnings(d),pay=(d.payments||[]).filter(x=>Number(x.amount)>0),payTotal=pay.reduce((s,x)=>s+Number(x.amount||0),0);
  const partyRows=[...normalizePartyList(d.sellers,d.seller).map((p,i)=>`<tr><td>Seller ${i+1}</td><td>${esc(relationName(p)||p.name||'-')}</td><td>${esc(p.mobile||'-')}</td><td>${esc(p.idNo||p.aadhaar||p.pan||'-')}</td></tr>`),...normalizePartyList(d.buyers,d.buyer).map((p,i)=>`<tr><td>Buyer ${i+1}</td><td>${esc(relationName(p)||p.name||'-')}</td><td>${esc(p.mobile||'-')}</td><td>${esc(p.idNo||p.aadhaar||p.pan||'-')}</td></tr>`)].join('');
  const gata=agri?(d.agri?.gataRows||[]).map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.chak||'-')}</td><td>${esc(x.gata||'-')}</td><td>${Number(x.totalArea||0).toFixed(4)}</td><td>${Number((x.soldArea ?? x.area) || 0).toFixed(4)}</td></tr>`).join(''):'';
  return `<div class="deed-document hindi-deed v19-checking-deed"><section class="deed-page deed-page-1"><h1>CHECKING COPY / जाँच प्रति</h1><p class="center-clause"><b>${esc(d.registryType||'Registry Draft')}</b> • Registry No. ${esc(d.registryNo||v14ActiveRegistryNo||'-')}</p><div class="v19-check-summary"><p><b>Village:</b> ${esc(d.village||'-')} &nbsp; <b>Area:</b> ${esc(v19PropertyAreaText(d))}</p><p><b>Khata:</b> ${esc(d.khataNo||'-')} &nbsp; <b>Khasra/Gata:</b> ${esc(v19KhasraText(d))}</p><p><b>Circle Rate Ref.:</b> ${esc(d.rateRef||'-')}</p><p><b>Government Value:</b> ${inr(d.plotValue||0)} &nbsp; <b>Total Transaction:</b> ${inr(d.transactionAmount||0)}</p>${agreement?`<p><b>Advance/Bayana:</b> ${inr(a.advance||0)} &nbsp; <b>Balance:</b> ${inr(a.balance||0)} &nbsp; <b>Agreement Stamp 2%:</b> ${inr(a.stampPaid||0)}</p>`:''}<p><b>Road Distance:</b> ${esc(d.agri?.roadDistanceCategory||d.ruleEngine?.roadDistanceCategory||d.mainRoadDistance||'-')} &nbsp; <b>Area Category:</b> ${esc(d.ruleEngine?.settlementCategory||'-')}</p></div><h2>Seller / Buyer Details</h2><table class="payment-deed-table"><thead><tr><th>Party</th><th>Name</th><th>Mobile</th><th>ID</th></tr></thead><tbody>${partyRows||'<tr><td colspan="4">Party details pending</td></tr>'}</tbody></table>${agri?`<h2>Chak / Gata / Rakba</h2><table class="payment-deed-table"><thead><tr><th>#</th><th>Chak</th><th>Khasra/Gata</th><th>Total Ha</th><th>Sale Ha</th></tr></thead><tbody>${gata||'<tr><td colspan="5">No Gata rows</td></tr>'}</tbody></table>`:`<h2>Boundaries</h2><p>East — ${esc(d.boundaries?.east||'-')} &nbsp; West — ${esc(d.boundaries?.west||'-')}</p><p>North — ${esc(d.boundaries?.north||'-')} &nbsp; South — ${esc(d.boundaries?.south||'-')}</p>`}</section><section class="deed-page deed-page-2"><h1>CHECKING COPY — Review</h1><h2>Payment / Consideration</h2><p>${agreement?`Payment breakdown target is Advance/Bayana ${inr(a.advance||0)}.`:`Payment breakdown target is transaction ${inr(d.transactionAmount||0)}.`} Current payment rows total: <b>${inr(payTotal)}</b>.</p>${v15PaymentTableHtml({...d,payments:pay})}<h2>Witness / Advocate</h2><p><b>Witnesses:</b> ${esc(v18AllWitnesses(d).map(x=>relationName(x)||x.name).filter(Boolean).join(', ')||'-')}</p><p><b>Drafted By:</b> ${esc(d.advocate?.name||d.ownerAdvocate||'-')}</p><h2>Review Warnings</h2>${warnings.length?`<ul>${warnings.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>✓ No current warnings.</p>'}<p class="center-clause"><b>यह केवल Checking Copy है। सुधार/सत्यापन के बाद Approve Final Copy करें।</b></p></section></div>`;
}

// ---------- Residential Plot full final deed ----------
function v19ResidentialFinalDeed(d){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;const sellers=normalizePartyList(d.sellers,d.seller),buyers=normalizePartyList(d.buyers,d.buyer),cov=d.residentialCovered||{},place=[d.village,d.jurisdiction?.tehsil||d.agri?.tehsil,d.jurisdiction?.district||d.agri?.district].filter(Boolean).join(', '),area=`${Number(d.areaSqft||0).toFixed(2)} वर्गफुट यानी ${Number(d.areaM2||0).toFixed(2)} वर्गमीटर`,property=`खाता सं0 ${esc(d.khataNo||'-')} खसरा सं0 ${esc(d.khasraNo||'-')} कुल क्षेत्रफल ${area}`;
  legal.innerHTML=`<div class="deed-document hindi-deed v19-residential-deed"><section class="deed-page deed-page-1"><h1>विक्रय-पत्र ${d.ruleEngine?.settlementCategory?`(${esc(d.ruleEngine.settlementCategory.replace(/.*\/\s*/,''))} क्षेत्र)`:''}</h1><div class="deed-top-grid"><div>बैनामा- <b class="v red">${formatDeedMoney(d.transactionAmount)}</b></div><div>बाजारी मालियत- <b class="v red">${formatDeedMoney(d.plotValue)}</b></div><div>स्टाम्प शुल्क- <b class="v red">${formatDeedMoney(d.stampDuty||stampDutyDetails().payable||0)}</b></div><div>वर्तमान में दिया गया स्टाम्प शुल्क- <b>${formatDeedMoney(d.stampDuty||stampDutyDetails().payable||0)}</b></div></div><p><b>विक्रित सम्पत्ति का कुल क्षेत्रफल-</b> ${area}</p><p><b>विक्रित सम्पत्ति का विवरण-</b> आवासीय खाली प्लाट${cov.enabled?` (जिसमें ${Number(cov.m2||0).toFixed(2)} वर्गमीटर कवर्ड/निर्मित क्षेत्र है)`:''}</p><p><b>स्थित ग्राम:-</b> ${esc(place||'-')}</p><p><b>रेट लिस्ट संदर्भ:-</b> ${esc(d.rateRef||'-')}</p><p><b>मुख्य सड़क से दूरी:-</b> ${esc(d.mainRoadDistance||d.ruleEngine?.commonRoadDistance||'-')}</p><p><b>विक्रेता का नाम, पिता/पति का नाम व पता:-</b><br>${partiesPersonLines(sellers,'विक्रेता')}</p></section><section class="deed-page deed-page-2"><p>विदित हो कि प्रतिज्ञ (विक्रेता/विक्रेतागण) निम्नलिखित सम्पत्ति के स्वामी व अधिकारी हैं और उपलब्ध कराये गये कागजात के अनुसार सम्पत्ति किसी घोषित भार/प्रतिबन्ध से मुक्त बतायी गयी है।</p><p>प्रतिज्ञ ने अपनी स्वस्थ मस्तिष्क अवस्था में बिना किसी जोर व दबाव के निम्नलिखित सम्पत्ति कुल मूल्य राशि <b>${formatDeedMoney(d.transactionAmount)}</b> में क्रेता/क्रेतागण के पक्ष में विक्रय व हस्तान्तरित की है।</p><p><b>क्रेता का नाम, पिता/पति का नाम व पता:-</b><br>${partiesPersonLines(buyers,'क्रेता')}</p><p>कुल मूल्य राशि की प्राप्ति का ब्यौरा इस विक्रय-पत्र में अंकित भुगतान विवरण के अनुसार है। कब्जा व दखल क्रेता को मौके पर दिया जाना/दिया गया माना जायेगा और विक्रेता नामान्तरण/दाखिल-खारिज में सहयोग करेगा।</p></section><section class="deed-page deed-page-3"><p>अब क्रेता उक्त सम्पत्ति पर अपने समस्त अधिकार व स्वामित्व सहित भोग व प्रयोग कर सकेगा। विक्रेता तथा उसके उत्तराधिकारी का विक्रित सम्पत्ति एवं उसकी मूल्य राशि से कोई सम्बन्ध शेष नहीं रहेगा, सिवाय लागू कानून व इस दस्तावेज में वर्णित जिम्मेदारियों के।</p><p>यदि किसी कानूनी दोष/वाद के कारण सम्पत्ति का कुल या अंश कब्जा प्रभावित होता है तो पक्षकार लागू कानून एवं इस विक्रय-पत्र की शर्तों के अनुसार उत्तरदायी होंगे।</p><p class="center-clause">अतः यह विक्रय पत्र लिख दिया है कि प्रमाण रहे और समय पर काम आवे।</p>${v15PhotoGridHtml(d)}</section><section class="deed-page deed-page-4"><p><b><u>विवरण सम्पत्ति जो विक्रय की गई है-</u></b> आवासीय प्लाट ${property}, जिसकी सीमा पूरब में ${esc(d.boundaries?.east||'-')}, पश्चिम में ${esc(d.boundaries?.west||'-')}, उत्तर में ${esc(d.boundaries?.north||'-')}, दक्षिण में ${esc(d.boundaries?.south||'-')} स्थित ${esc(place||'-')}।</p>${cov.enabled?`<p><b>कवर्ड एरिया:</b> ${Number(cov.m2||0).toFixed(2)} वर्गमीटर × ₹${Number(cov.rate||14000).toLocaleString('en-IN')}/वर्गमीटर = ${formatDeedMoney(cov.value||0)}.</p>`:''}<div class="payment-deed-section"><p><b><u>विवरण विक्रय धनराशि प्राप्ति-</u></b> कुल मूल्य राशि ${formatDeedMoney(d.transactionAmount)} में से</p>${v15PaymentTableHtml(d)}<p>उपरोक्त भुगतान विवरण विक्रेता/पक्षकारों द्वारा जाँच व स्वीकृति के अधीन है।</p></div>${partyFingerBlocks(sellers,'विक्रेता','', 'seller-finger')}</section><section class="deed-page deed-page-5">${partyFingerBlocks(buyers,'क्रेता','', 'buyer-finger')}<div class="witness-box-grid">${v18AllWitnesses(d).map((w,i)=>v15WitnessBox(w,`साक्षी ${i+1}`)).join('')}</div><div class="deed-footer-lines"><p>तहरीर तारीख:- ${esc(v19DateText(d.executionDate||v14DateOnly(d)))}</p><p>ड्राफ्टिड बाई:- ${esc(d.advocate?.name||d.ownerAdvocate||'-')} एडवोकेट।</p></div></section></div>`;
}

// ---------- Agreement full final deed, based on supplied इकरारनामा sample ----------
function v19AgreementFinalDeed(d){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;const a=d.agreement||{},first=normalizePartyList(d.sellers,d.seller),second=normalizePartyList(d.buyers,d.buyer),ws=v18AllWitnesses(d),raw=String(d.registryType||'').replace(/^Agreement\s*/i,'')||'सम्पत्ति',pos=a.possession==='with'?'कब्जा सहित':'बिना कब्जा',agri=String(d.registryType||'').toLowerCase().includes('agriculture'),prop=agri?groupedGataNarrative(d):`खाता सं0 ${esc(d.khataNo||'-')} खसरा सं0 ${esc(d.khasraNo||'-')} क्षेत्रफल ${Number(d.areaSqft||0).toFixed(2)} वर्गफुट यानी ${Number(d.areaM2||0).toFixed(2)} वर्गमीटर`,clauses=String(a.clauses||v18AgreementDefaults()).split(/\n+/).map(x=>x.replace(/^\d+[.)-]?\s*/,'').trim()).filter(Boolean);
  legal.innerHTML=`<div class="deed-document hindi-deed v19-agreement-final"><section class="deed-page deed-page-1"><h1>इकरारनामा मायदा बय (${pos})</h1><div class="deed-top-grid"><div>सौदा राशि- <b class="v red">${formatDeedMoney(a.total||d.transactionAmount)}</b></div><div>अग्रिम / बयाना- <b class="v red">${formatDeedMoney(a.advance||0)}</b></div><div>शेष कीमत- <b class="v red">${formatDeedMoney(a.balance||0)}</b></div><div>स्टाम्प शुल्क (2%)- <b class="v red">${formatDeedMoney(a.stampPaid||Number(d.transactionAmount||0)*.02)}</b></div></div><p><b>सम्पत्ति का प्रकार-</b> ${esc(raw)}</p><p><b>स्थित ग्राम/नगर:-</b> ${esc(d.village||'-')} ${esc(d.jurisdiction?.tehsil||d.agri?.tehsil||'')} ${esc(d.jurisdiction?.district||d.agri?.district||'')}</p><p><b>Area Category:</b> ${esc(d.ruleEngine?.settlementCategory||'-')} &nbsp; <b>Property Nature:</b> ${esc(raw)}</p><p><b>रेट लिस्ट संदर्भ:-</b> ${esc(d.rateRef||'-')}</p><p><b>प्रथम पक्ष:-</b><br>${partiesPersonLines(first,'प्रथम पक्ष')}</p></section><section class="deed-page deed-page-2"><p><b>द्वितीय पक्ष:-</b><br>${partiesPersonLines(second,'द्वितीय पक्ष')}</p><p>यह कि प्रथम पक्ष उपरोक्त सम्पत्ति का स्वामी/अधिकारी है और उसने अपनी स्वेच्छा से उक्त सम्पत्ति का सौदा कुल <b>${formatDeedMoney(a.total||d.transactionAmount)}</b> में द्वितीय पक्ष के साथ किया है।</p><p>आज की तारीख तक प्रथम पक्ष ने द्वितीय पक्ष से <b>${formatDeedMoney(a.advance||0)}</b> अग्रिम/बयाना प्राप्त किया है तथा शेष <b>${formatDeedMoney(a.balance||0)}</b> अंतिम बैनामा/विक्रय-पत्र के समय अदा किया जायेगा।</p><p><b>अंतिम बैनामा की नियत तिथि:</b> ${esc(v19DateText(a.dueDate))}</p><p><b>कब्जा:</b> ${a.possession==='with'?'इस इकरारनामे के अनुसार कब्जा दिया/स्वीकार किया गया है।':'यह इकरारनामा बिना कब्जा है; कब्जा अंतिम बैनामा के समय दिया जायेगा।'}</p></section><section class="deed-page deed-page-3"><h2>इकरारनामे की शर्तें</h2><ol class="clause-list">${clauses.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p>यदि किसी पक्ष द्वारा निर्धारित शर्तों का पालन न किया जाये तो दूसरा पक्ष लागू कानून के अनुसार उपलब्ध उपचार/विशिष्ट पालन हेतु सक्षम होगा।</p><p class="center-clause">अतः यह इकरारनामा पक्षकारों ने पढ़/समझकर प्रमाण हेतु लिख दिया।</p>${v15PhotoGridHtml(d)}</section><section class="deed-page deed-page-4"><p><b><u>विवरण सम्पत्ति जिसका इकरार किया गया है-</u></b> ${prop}, जिसकी सीमायें पूरब में ${esc(d.boundaries?.east||'-')}, पश्चिम में ${esc(d.boundaries?.west||'-')}, उत्तर में ${esc(d.boundaries?.north||'-')}, दक्षिण में ${esc(d.boundaries?.south||'-')}।</p><p><b>Previous Ownership / Previous Deed:</b> ${esc(a.previous?.docType||'-')} • Previous Title Holder ${esc(a.previous?.seller||'-')} • Registration Date ${esc(v19DateText(a.previous?.date))} • Serial ${esc(a.previous?.serial||'-')} • Book/Jild ${esc(a.previous?.book||'-')} • Pages ${esc(a.previous?.pageFrom||'-')}–${esc(a.previous?.pageTo||'-')} ${a.previous?.other?`• ${esc(a.previous.other)}`:''}</p><div class="payment-deed-section"><p><b><u>अग्रिम / बयाना धनराशि प्राप्ति-</u></b> भुगतान विवरण केवल प्राप्त Advance/Bayana <b>${formatDeedMoney(a.advance||0)}</b> का है:</p>${v15PaymentTableHtml({...d,payments:(d.payments||[]).filter(x=>Number(x.amount)>0)})}<p>शेष राशि ${formatDeedMoney(a.balance||0)} अंतिम बैनामा/विक्रय-पत्र के समय देय रहेगी।</p></div></section><section class="deed-page deed-page-5">${partyFingerBlocks(first,'प्रथम पक्ष','', 'seller-finger')}${partyFingerBlocks(second,'द्वितीय पक्ष','', 'buyer-finger')}</section><section class="deed-page deed-page-6"><div class="witness-box-grid">${ws.map((w,i)=>v15WitnessBox(w,`साक्षी ${i+1}`)).join('')}</div><div class="deed-footer-lines"><p>तहरीर तारीख:- ${esc(v19DateText(d.executionDate||v14DateOnly(d)))}</p><p>ड्राफ्टिड बाई:- ${esc(d.advocate?.name||d.ownerAdvocate||'-')} एडवोकेट।</p></div></section></div>`;
}

function v19UnwrapCheckingStamp(){const legal=document.getElementById('legalDraftPreview');if(!legal)return;legal.querySelectorAll('.stamp-reserve').forEach(x=>x.remove());legal.querySelectorAll('.stamp-written-content-border').forEach(w=>{while(w.firstChild)w.parentNode.insertBefore(w.firstChild,w);w.remove();});legal.querySelectorAll('.deed-page').forEach(p=>p.classList.remove('stamp-selected-page','stamp-normal-page','stamp-page-one-special'));}

// Final watermark state must use persisted status, not transient draftData status.
v18ApplyCopyState=function(d){const legal=document.getElementById('legalDraftPreview'),banner=document.getElementById('v18CheckingBanner'),status=document.getElementById('v18CopyStatus');if(!legal)return;const final=v19IsFinal(d);legal.classList.toggle('v18-checking-copy',!final);legal.classList.toggle('v18-final-copy',final);if(banner){banner.classList.toggle('final',final);const b=banner.querySelector('strong');if(b)b.textContent=final?'FINAL COPY APPROVED':'CHECKING COPY MODE';}if(status)status.textContent=final?'Final / Approved Output':'Editable Checking Copy';};

const _v19SyncDraftPreviewBase=syncDraftPreview;
syncDraftPreview=function(){
  try{_v19SyncDraftPreviewBase();}catch(e){console.warn('v1.9 base preview',e)}
  const d=draftData(),final=v19IsFinal(d);d.status=v19Status(d);d.finalApproved=final;
  if(!final){const legal=document.getElementById('legalDraftPreview');if(legal)legal.innerHTML=v19CheckingCopyHtml(d);try{applyDraftPageChrome();}catch(e){}v19UnwrapCheckingStamp();}
  else if(v19IsAgreement()){v19AgreementFinalDeed(d);try{applyDraftPageChrome();}catch(e){}}
  else if(v19IsResidentialPlot()){v19ResidentialFinalDeed(d);try{applyDraftPageChrome();}catch(e){}}
  // Agriculture final remains the mapped agriculture renderer from v1.8.
  v18ApplyCopyState(d);v19SyncAllModeUi();
};

// Final approve re-renders immediately as full deed and clears checking watermark.
v18ApproveFinal=function(){if(!v19ValidateSaleAreas(true))return;v14EnsureRegistryNo();const d=draftData(),w=v18CollectWarnings(d);if(w.length&&!confirm(`Checking Copy has ${w.length} warning(s). Advocate/user review ke baad Final approve karna hai?`))return;const saved=v18SaveStatus('Completed');v14LastOpenedDraft=saved;syncDraftPreview();toast(`Final Copy approved: ${saved.registryNo}`);showSaveSuccessModal?.();};
v18GenerateCheckingCopy=function(){if(!v19ValidateSaleAreas(true))return;v14EnsureRegistryNo();const d=v18SaveStatus('Checking Copy');v14LastOpenedDraft=d;syncDraftPreview();toast(`2-page Checking Copy ${d.registryNo} saved.`);goDraftStep(5);};
draftNext=function(){v14EnsureRegistryNo();if(!v19ValidateSaleAreas(true))return;if(currentDraftStep<5){v18SaveStatus('In Progress');goDraftStep(currentDraftStep+1);return;}v18GenerateCheckingCopy();};

// Current draft export must use active persisted status, not an older completed draft.
openCurrentDraftWord=function(){syncDraftPreview();const legal=document.getElementById('legalDraftPreview');if(!legal){toast('Preview not ready');return;}let d=draftData(),stored=v19StoredDraftFor(d);if(stored)d={...d,status:stored.status,finalApproved:stored.finalApproved,registryNo:stored.registryNo};if(!d.registryNo)d.registryNo=v14ActiveRegistryNo||v14EnsureRegistryNo();downloadDocxFromElement(legal,d,`Registry_Pro_${safeFilePart(d.registryNo)}_${v19IsFinal(d)?'FINAL':'CHECKING'}.docx`);closeSaveSuccessModal();toast(v19IsFinal(d)?'Final editable Word downloaded':'2-page Checking Copy Word downloaded');};
saveCurrentDraftPdf=function(){closeSaveSuccessModal();goDraftStep(5);syncDraftPreview();setTimeout(()=>window.print(),100);};

// ---------- Agreement Search / Create Registry ----------
function v19AgreementDrafts(){return (v14AllDrafts?.()||[]).filter(d=>String(d.registryType||'').toLowerCase().startsWith('agreement'));}
function openAgreementSearch(){
  const rows=v19AgreementDrafts().sort((a,b)=>String(b.savedAtISO||'').localeCompare(String(a.savedAtISO||'')));
  openSimpleManagement('Agreement Search',`<div class="v19-agreement-search-head"><div><h3>Saved Agreements</h3><p class="hint">Agreement search karke सीधे Registry Draft बनाएं. Parties, property, transaction, advance aur agreement reference auto-fill होंगे.</p></div><input id="v19AgreementSearchBox" placeholder="Search Agreement No., Village, Party, Khasra" oninput="v19FilterAgreementRows(this.value)"></div><div id="v19AgreementSearchRows" class="management-list">${rows.map(d=>`<div class="management-row v19-agreement-row" data-search="${esc([d.registryNo,d.village,v19PlainNames(d.sellers,d.seller),v19PlainNames(d.buyers,d.buyer),v19KhasraText(d)].join(' ').toLowerCase())}"><div><strong>${esc(d.registryNo||'Agreement')} • ${esc(d.village||'-')}</strong><small>${esc(v19PlainNames(d.sellers,d.seller))} → ${esc(v19PlainNames(d.buyers,d.buyer))} • Total ${inr(d.transactionAmount||0)} • Advance ${inr(d.agreement?.advance||0)} • Balance ${inr(d.agreement?.balance||0)}</small></div><button class="btn primary compact" onclick="createSaleAfterAgreement('${esc(d.registryNo||'')}')">☑ Create Registry</button></div>`).join('')||'<div class="empty-party-records">No saved Agreement found.</div>'}</div>`);
}
function v19FilterAgreementRows(q){const n=String(q||'').toLowerCase().trim();document.querySelectorAll('.v19-agreement-row').forEach(r=>r.style.display=!n||String(r.dataset.search||'').includes(n)?'':'none');}
const _v19DrawerHtmlBase=v18DrawerHtml;
v18DrawerHtml=function(){const base=_v19DrawerHtmlBase();return base.replace('<button class="side-item" onclick="v18DrawerGo(openAdvocatesHome)"><span>⚖</span>Advocate</button>',`<button class="side-item" onclick="v18DrawerGo(openAdvocatesHome)"><span>⚖</span>Advocate</button><button class="side-item" onclick="v18DrawerGo(openAgreementSearch)"><span>✍</span>Agreement Search</button>`);};

// ---------- Advocate Copy / Final workspace + report ----------
let v19AdvReportState={name:'',tab:'copy',period:'all',date:'',q:''};
function v19DraftAdvocate(d){return String(d.ownerAdvocate||d.advocate?.name||'').trim();}
function v19AdvocateAll(name){const n=String(name||'').trim().toLowerCase();return (v14AllDrafts?.()||[]).filter(d=>v19DraftAdvocate(d).toLowerCase()===n);}
function v19PeriodBounds(period,date=''){
  const now=new Date(),today=now.toISOString().slice(0,10);if(period==='today')return {from:today,to:today};if(period==='month')return {from:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`,to:today};if(period==='fy'){let y=now.getFullYear();if(now.getMonth()<3)y--;return {from:`${y}-04-01`,to:`${y+1}-03-31`};}if(period==='date'&&date)return {from:date,to:date};return {from:'0000-00-00',to:'9999-99-99'};
}
function v19AdvocateFiltered(){const s=v19AdvReportState,all=v19AdvocateAll(s.name),want=s.tab==='final'?'Completed':'Checking Copy',b=v19PeriodBounds(s.period,s.date),q=String(s.q||'').toLowerCase();return all.filter(d=>d.status===want).filter(d=>{const day=v14DateOnly(d)||'';return day>=b.from&&day<=b.to;}).filter(d=>!q||[d.registryNo,d.village,v19PlainNames(d.sellers,d.seller),v19PlainNames(d.buyers,d.buyer),v19KhasraText(d),d.registryType].join(' ').toLowerCase().includes(q)).sort((a,b)=>String(b.savedAtISO||'').localeCompare(String(a.savedAtISO||'')));}
function v19AdvocateReportRowsHtml(rows){return rows.map((d,i)=>`<tr><td>${i+1}</td><td>${esc(d.village||'-')}</td><td>${esc(v19PlainNames(d.sellers,d.seller))}</td><td>${esc(v19PlainNames(d.buyers,d.buyer))}</td><td>${esc(v19PropertyAreaText(d))}</td><td>${esc(v19KhasraText(d))}</td><td>${esc(v14DateOnly(d)||'-')}</td></tr>`).join('')||'<tr><td colspan="7">No draft found for this filter.</td></tr>';}
function v19OpenAdvocateWorkspace(name,tab='copy'){v19AdvReportState={name,tab,period:'all',date:'',q:''};v19RenderAdvocateWorkspace();}
function v19SetAdvTab(tab){v19AdvReportState.tab=tab;v19RenderAdvocateWorkspace();}
function v19SetAdvPeriod(p){v19AdvReportState.period=p;v19RenderAdvocateWorkspace();}
function v19SetAdvDate(v){v19AdvReportState.period='date';v19AdvReportState.date=v;v19RenderAdvocateWorkspace();}
function v19SetAdvSearch(v){v19AdvReportState.q=v;v19RenderAdvocateWorkspace(true);}
function v19RenderAdvocateWorkspace(preserveFocus=false){
  const s=v19AdvReportState,all=v19AdvocateAll(s.name),copy=all.filter(d=>d.status==='Checking Copy'),fin=all.filter(d=>d.status==='Completed'),rows=v19AdvocateFiltered(),b=v19PeriodBounds(s.period,s.date),title=s.tab==='final'?'Final Drafts':'Checking Copies';
  openSimpleManagement(`Advocate — ${s.name}`,`<div class="v19-adv-workspace"><div class="v19-adv-top"><div><h3>${esc(s.name)}</h3><small>Date-wise Registry Draft Report</small></div><div class="v19-adv-total"><small>${esc(title)} Total</small><strong>${rows.length}</strong></div></div><div class="v19-adv-tabs"><button class="${s.tab==='copy'?'active':''}" onclick="v19SetAdvTab('copy')">Checking Copy <b>${copy.length}</b></button><button class="${s.tab==='final'?'active':''}" onclick="v19SetAdvTab('final')">Final <b>${fin.length}</b></button></div><div class="v19-adv-controls"><input id="v19AdvSearch" value="${esc(s.q)}" placeholder="Search village, seller, buyer, khasra, draft no." oninput="v19SetAdvSearch(this.value)"><button class="${s.period==='today'?'active':''}" onclick="v19SetAdvPeriod('today')">Today</button><button class="${s.period==='month'?'active':''}" onclick="v19SetAdvPeriod('month')">This Month</button><button class="${s.period==='fy'?'active':''}" onclick="v19SetAdvPeriod('fy')">Financial Year</button><label>Select Date <input type="date" value="${esc(s.date||'')}" onchange="v19SetAdvDate(this.value)"></label><button class="${s.period==='all'?'active':''}" onclick="v19SetAdvPeriod('all')">All</button><button class="btn primary compact" onclick="v19PrintAdvocateReport()">Open PDF / Print</button></div><div id="v19AdvocatePrintable" class="v19-adv-report-page"><h2>${esc(s.name)} — ${esc(title)}</h2><p><b>Period:</b> ${s.period==='all'?'All Dates':`${b.from} to ${b.to}`} &nbsp; <b>Total:</b> ${rows.length}</p><table><thead><tr><th>S.no</th><th>Vill</th><th>Seller</th><th>Buyer</th><th>Area</th><th>Khasra</th><th>Date</th></tr></thead><tbody>${v19AdvocateReportRowsHtml(rows)}</tbody></table><div class="v19-report-total">Total ${rows.length}</div></div></div>`);
  if(preserveFocus){setTimeout(()=>{const e=document.getElementById('v19AdvSearch');if(e){e.focus();e.setSelectionRange(e.value.length,e.value.length);}},0);}
}
function v19PrintAdvocateReport(){document.body.classList.add('print-advocate-report');setTimeout(()=>{window.print();setTimeout(()=>document.body.classList.remove('print-advocate-report'),200);},50);}
renderAdvocateList=function(){const b=document.getElementById('advocateList');if(!b)return;const arr=getAdvocates();b.innerHTML=arr.map(a=>{const all=v19AdvocateAll(a.name),c=all.filter(d=>d.status==='Checking Copy').length,f=all.filter(d=>d.status==='Completed').length;return `<div class="management-row v19-advocate-row"><button class="v19-advocate-name" onclick="v19OpenAdvocateWorkspace('${esc(a.name)}','copy')"><strong>${esc(a.name)}</strong><small>${esc(a.enrollment||'No enrollment')} • ${esc(a.mobile||'No mobile')}</small></button><div class="v19-advocate-actions"><button onclick="v19OpenAdvocateWorkspace('${esc(a.name)}','copy')">Copy <b>${c}</b></button><button onclick="v19OpenAdvocateWorkspace('${esc(a.name)}','final')">Final <b>${f}</b></button><span>Default Stamp: ${esc(a.stampPage||'2')}</span></div></div>`}).join('')||'<div class="empty-party-records">No advocates added.</div>';};

// ---------- Mode UI sync / init ----------
function v19SyncAllModeUi(){v19SyncCommonRulebook();v19SyncResidentialFields();v19MoveRoadMappingPanel();v19ApplyIdentityMaxima();if(v19IsAgreement()){const a=document.getElementById('agreementStamp');if(a){a.readOnly=true;a.value=String(Math.round(numv('transactionAmount')*.02));}}}
const _v19SelectPropertyTypeBase=selectPropertyType;
selectPropertyType=function(el){_v19SelectPropertyTypeBase(el);setTimeout(()=>{v19SyncAllModeUi();recalculate();recalculateStampDuty();syncDraftPreview();},0);};
const _v19StartDraftStepsBase=startDraftSteps;
startDraftSteps=function(){_v19StartDraftStepsBase();setTimeout(()=>{v19SyncAllModeUi();syncDraftPreview();},0);};
const _v19OpenNewRegistryBase=openNewRegistry;
openNewRegistry=function(){_v19OpenNewRegistryBase();setTimeout(v19SyncAllModeUi,0);};
const _v19AddPartyBase=addParty;
addParty=function(type,data={}){const r=_v19AddPartyBase(type,data);setTimeout(()=>v19ApplyIdentityMaxima(document.getElementById(type+'Party')||document),0);return r;};
const _v19AddGataRowBase=addAgriGataRow;
addAgriGataRow=function(data={}){const r=_v19AddGataRowBase(data);setTimeout(()=>{v19MoveRoadMappingPanel();v18AutoApplyKhasraDistance();},0);return r;};

// Override agreement warning payment target and seller property warning wording after hard total-rakba rule.
const _v19CollectWarningsBase=v18CollectWarnings;
v18CollectWarnings=function(d=draftData()){let w=_v19CollectWarningsBase(d).filter(x=>!/^Payment total /.test(x));const pay=(d.payments||[]).reduce((a,x)=>a+Number(x.amount||0),0),target=String(d.registryType||'').toLowerCase().startsWith('agreement')?Number(d.agreement?.advance||0):Number(d.transactionAmount||0);if(target>0&&Math.abs(pay-target)>.5)w.push(`${String(d.registryType||'').toLowerCase().startsWith('agreement')?'Advance/Bayana':'Payment'} breakdown ${inr(pay)} does not match ${inr(target)}.`);if(isAgricultureMode()){for(const r of (d.agri?.gataRows||[])){if(Number((r.soldArea ?? r.area) || 0)>Number(r.totalArea||0)+1e-9)w.push(`Khasra/Gata ${r.gata||'-'}: sold area exceeds total rakba — Final/Checking save blocked until corrected.`);}}return [...new Set(w)];};


// ---------- Agreement/Residential late UI polish ----------
const _v19SyncAllModeUiContentBase=v19SyncAllModeUi;
v19SyncAllModeUi=function(){
  _v19SyncAllModeUiContentBase();
  const agreement=v19IsAgreement();
  const note=document.querySelector('#draftStep4 .payment-linked-note');
  if(note){
    note.textContent=agreement
      ? 'Agreement में यहाँ केवल प्राप्त Advance / Bayana का payment-wise breakup भरें. Total transaction amount नहीं; बाकी राशि Final Registry के समय Balance रहेगी.'
      : 'Total Transaction Amount Property Details पर है. यहाँ payment-wise breakup भरें; mode चुनने पर Cheque No. / RTGS No. वाला सही field अपने-आप आएगा.';
  }
  const payHead=document.querySelector('#draftStep4 .form-card h2');
  if(payHead) payHead.textContent=agreement?'Advance / Bayana Payment Breakdown':'Payment Breakdown';
  const nature=document.getElementById('v18PropertyNature');
  if(nature){
    const raw=v19Type().replace(/^Agreement\s+/i,'').trim();
    nature.value=agreement?(raw||'Property'):v19Type();
  }
};

// Version badge/readme-visible console marker.
document.addEventListener('DOMContentLoaded',()=>{try{v18BuildDrawers();v19InjectResidentialCovered();v19SyncAllModeUi();renderAdvocateList();const t=document.querySelector('title');if(t)t.textContent='Registry Pro v1.9 Final';console.info('Registry Pro v1.9 Final All Fixes loaded');}catch(e){console.error('v1.9 init',e)}});

/* v1.9 late-binding safety patches */
// Stamp page 2 on custom Residential/Agreement deeds also reserves the printed stamp area.
const _v19ApplyDraftPageChromeBase=applyDraftPageChrome;
applyDraftPageChrome=function(){_v19ApplyDraftPageChromeBase();const legal=document.getElementById('legalDraftPreview');if(!legal)return;legal.querySelectorAll('.deed-page.stamp-selected-page').forEach(page=>{if(page.classList.contains('deed-page-2')&&!page.querySelector('.page2-bottom')&&!page.querySelector(':scope > .stamp-reserve')){const sp=document.createElement('div');sp.className='stamp-reserve';page.prepend(sp);}});};

// Preserve source Agreement reference when "Create Registry" is used.
let v19ActiveSourceAgreementNo='';
const _v19CreateSaleAfterAgreementBase=createSaleAfterAgreement;
createSaleAfterAgreement=function(no){v19ActiveSourceAgreementNo=no||'';const r=_v19CreateSaleAfterAgreementBase(no);setTimeout(()=>{try{v18SaveStatus('In Progress');}catch(e){}},0);return r;};
const _v19DraftDataWithSourceBase=draftData;
draftData=function(){const d=_v19DraftDataWithSourceBase();if(v19ActiveSourceAgreementNo)d.sourceAgreementNo=v19ActiveSourceAgreementNo;return d;};
const _v19LoadDraftWithSourceBase=v14LoadDraftFields;
v14LoadDraftFields=function(d){if(d?.sourceAgreementNo)v19ActiveSourceAgreementNo=d.sourceAgreementNo;return _v19LoadDraftWithSourceBase(d);};

/* ===== v1.9.1 PATCH — AGRICULTURE HINDI / ENGLISH DRAFT LANGUAGE =====
   Targeted patch only. Dashboard UI stays Hinglish.
   Language selector controls Agriculture deed/checking-copy rendering only.
   Draft/Checking stage: Hindi <-> English can be switched freely.
   Completed/Final registry: language is locked to the language saved with that final record.
*/

function v191NormalizeDraftLanguage(v){
  return String(v||'').toLowerCase()==='english'?'English':'Hindi';
}
function v191RegistryViewActive(){return !!document.getElementById('registryView')?.classList.contains('active');}
function v191StoredLanguage(d={}){
  const s=v19StoredDraftFor?.(d);
  return s?.draftLanguage? v191NormalizeDraftLanguage(s.draftLanguage) : '';
}
function v191LanguageForDraft(d={}){
  const stored=v19StoredDraftFor?.(d);
  if(stored && (stored.status==='Completed'||stored.finalApproved===true)){
    return v191NormalizeDraftLanguage(stored.draftLanguage||d.draftLanguage||'Hindi');
  }
  return v191NormalizeDraftLanguage(localStorage.getItem('registryProLanguage')||d.draftLanguage||'Hindi');
}
function v191SyncLanguageSelector(d={}){
  const el=document.getElementById('dashLanguage');if(!el)return;
  [...el.options].filter(o=>String(o.value).toLowerCase()==='hinglish').forEach(o=>o.remove());
  if(![...el.options].some(o=>o.value==='Hindi'))el.add(new Option('Hindi','Hindi'));
  if(![...el.options].some(o=>o.value==='English'))el.add(new Option('English','English'));
  const lang=v191LanguageForDraft(d);el.value=lang;
  const locked=v191RegistryViewActive()&&v19IsFinal?.(d);
  el.title=locked?'Final registry language locked. Create/copy a new draft to change language.':'Registry draft language';
}

// Language selector now controls deed language, not dashboard UI language.
setRegistryLanguage=function(v){
  const requested=v191NormalizeDraftLanguage(v),d=(typeof draftData==='function'?draftData():{}),stored=v19StoredDraftFor?.(d);
  if(v191RegistryViewActive() && stored && (stored.status==='Completed'||stored.finalApproved===true)){
    const locked=v191NormalizeDraftLanguage(stored.draftLanguage||d.draftLanguage||'Hindi');
    localStorage.setItem('registryProLanguage',locked);
    v191SyncLanguageSelector({...d,draftLanguage:locked});
    toast(`Final Registry language locked: ${locked}. Language change ke liye new/copy draft banayein.`);
    return;
  }
  localStorage.setItem('registryProLanguage',requested);
  v191SyncLanguageSelector({...d,draftLanguage:requested});
  try{syncDraftPreview();}catch(e){console.warn('v1.9.1 language preview',e)}
  toast(`Registry Draft Language: ${requested}`);
};

// Persist selected language with every draft. It becomes authoritative once Final is approved.
const _v191DraftDataBase=draftData;
draftData=function(){
  const d=_v191DraftDataBase();
  d.draftLanguage=v191LanguageForDraft(d);
  return d;
};

// ---------- Lightweight Devanagari -> Roman transliteration for user-entered names/addresses ----------
const V191_DEV_VOW={
  'अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au'
};
const V191_DEV_MAT={'ा':'aa','ि':'i','ी':'ee','ु':'u','ू':'oo','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au','ॅ':'e','ॉ':'o'};
const V191_DEV_CON={
  'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'ng','च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'ny',
  'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n',
  'प':'p','फ':'ph','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h',
  'क़':'q','ख़':'kh','ग़':'g','ज़':'z','ड़':'r','ढ़':'rh','फ़':'f','ऩ':'n','ऱ':'r','ळ':'l'
};
const V191_DEV_DIG={'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'};
function v191DevToRoman(text){
  const s=String(text??'').normalize('NFC');let out='';
  for(let i=0;i<s.length;i++){
    const ch=s[i];
    if(V191_DEV_DIG[ch]!=null){out+=V191_DEV_DIG[ch];continue;}
    if(V191_DEV_VOW[ch]!=null){out+=V191_DEV_VOW[ch];continue;}
    if(V191_DEV_CON[ch]!=null){
      let base=V191_DEV_CON[ch],j=i+1;
      if(s[j]==='़')j++;
      const next=s[j];
      if(next==='्'){out+=base;i=j;continue;}
      if(V191_DEV_MAT[next]!=null){out+=base+V191_DEV_MAT[next];i=j;continue;}
      out+=base+'a';continue;
    }
    if(ch==='ं'||ch==='ँ'){out+='n';continue;}
    if(ch==='ः'){out+='h';continue;}
    if(ch==='़'||ch==='्'){continue;}
    out+=ch;
  }
  return out.replace(/\s+/g,' ').trim();
}
function v191EnRaw(v){
  const s=String(v??'');return /[\u0900-\u097F]/.test(s)?v191DevToRoman(s):s;
}
function v191En(v){return esc(v191EnRaw(v));}
function v191EnStatus(v){
  const s=String(v??'');const k=s.toLowerCase();
  if(s.includes('असिंचित'))return 'Unirrigated';
  if(s.includes('सिंचित'))return 'Irrigated';
  if(s.includes('बाग'))return 'Orchard';
  if(s==='नहीं'||k==='no')return 'No';
  if(s.includes('चल रही'))return 'In progress';
  if(s.includes('लागू नहीं'))return 'Not applicable';
  return v191EnRaw(s);
}
function v191RelationEn(p){
  const r=String(p?.relation||'').toUpperCase();
  if(r.includes('W/O')||String(p?.relation||'').includes('पत्नी'))return 'wife of';
  if(r.includes('D/O')||String(p?.relation||'').includes('पुत्री'))return 'daughter of';
  if(r.includes('H/O')||String(p?.relation||'').includes('पति'))return 'husband of';
  return 'son of';
}
function v191PartyLineEn(p){
  const bits=[`${v191En(p?.name||'[Name]')} ${v191RelationEn(p)} ${v191En(p?.father||'[Father/Spouse Name]')}`,`resident of ${v191En(p?.address||'[Address]')}`];
  if(p?.aadhaar||p?.idNo)bits.push(`Aadhaar/ID ${esc(p.aadhaar||p.idNo)}`);
  if(p?.mobile)bits.push(`Mobile ${esc(p.mobile)}`);
  if(p?.email)bits.push(`Email ${esc(p.email)}`);
  return bits.join(', ');
}
function v191PartiesEn(list,primary,label){
  const a=normalizePartyList(list,primary);return a.map((p,i)=>`${a.length>1?`${label} ${i+1}: `:''}${v191PartyLineEn(p)}`).join('<br>');
}
function v191MoneyEn(n){return `Rs. ${Math.round(Number(n)||0).toLocaleString('en-IN')}/-`;}
function v191LaganEn(v){const n=Math.max(0,Number(v)||0),ru=Math.floor(n),pa=Math.round((n-ru)*100);return `${ru.toLocaleString('en-IN')} Rupees${pa?` ${pa} Paise`:''}`;}
function v191RoadSentenceEn(d){
  const p=Number(d.roadPremiumPercent||0),label=String(d.roadWidth||'');
  if(p===0)return 'situated on a road less than 5 metres wide; normal/base rate applies';
  if(p===5)return 'situated on a road 5 metres or more but less than 12 metres wide; 5% higher rate applies';
  if(p===10)return 'situated on a road 12 metres or more but less than 15 metres wide; 10% higher rate applies';
  if(label.includes('18 METER OR MORE'))return 'situated on a road 18 metres or more wide; 15% higher rate applies';
  return 'situated on a road 15 metres or more wide; 15% higher rate applies';
}
function v191LocationEn(d){return `Village ${v191En(d.village||'[Village]')}, Pargana/Tehsil ${v191En(d.agri?.pargana||d.agri?.tehsil||'[Tehsil]')}, District ${v191En(d.agri?.district||'[District]')}`;}
function v191GroupedGataEn(d){
  const rows=d.agri?.gataRows||[];
  if(!rows.length)return `Khata/Khasra No. ${v191En(d.khataNo||'[Khata]')} / ${v191En(d.khasraNo||'[Khasra]')}, area ${Number(d.agri?.totalAreaHa||0).toFixed(4)} hectare`;
  const groups=[];rows.forEach(r=>{let g=groups.find(x=>x.chak===(r.chak||''));if(!g){g={chak:r.chak||'[Chak]',rows:[]};groups.push(g);}g.rows.push(r);});
  return groups.map(g=>{const sold=g.rows.reduce((a,r)=>a+Number((r.soldArea??r.area)||0),0);return `Chak No. ${v191En(g.chak)}: ${g.rows.map(r=>`Khasra/Gata No. ${v191En(r.gata||'-')} total area ${Number(r.totalArea||0).toFixed(4)} ha, area sold ${Number((r.soldArea??r.area)||0).toFixed(4)} ha`).join('; ')}; total sold ${sold.toFixed(4)} hectare`;}).join(' and ');
}
function v191PaymentTableEn(d){
  const rows=(d.payments||[]).filter(x=>Number(x.amount)>0),total=rows.reduce((a,x)=>a+Number(x.amount||0),0);
  if(!rows.length)return '<div class="payment-deed-empty">Payment details not entered.</div>';
  return `<table class="payment-deed-table"><thead><tr><th>S.No.</th><th>Payment Mode</th><th>Amount</th><th>Cheque / RTGS / Ref. No.</th><th>Bank</th><th>Branch</th><th>Payment Date</th></tr></thead><tbody>${rows.map((x,i)=>`<tr><td>${i+1}</td><td>${v191En(x.mode||'')}</td><td>${Math.round(Number(x.amount)||0).toLocaleString('en-IN')}</td><td>${esc(x.ref||'')}</td><td>${v191En(x.bank||'')}</td><td>${v191En(x.branch||'')}</td><td>${esc(x.date?formatDateDeed(x.date):'')}</td></tr>`).join('')}<tr class="payment-deed-total"><td>${rows.length+1}</td><td><b>Total</b></td><td><b>${Math.round(total).toLocaleString('en-IN')}</b></td><td colspan="4"></td></tr></tbody></table>`;
}
function v191PaymentNarrativeEn(d){
  const rows=(d.payments||[]).filter(x=>Number(x.amount)>0);
  if(!rows.length)return 'The seller acknowledges receipt of the total consideration amount.';
  return rows.map(x=>{const ref=x.ref?` Ref./UTR/Cheque No. ${esc(x.ref)}`:'',dt=x.date?` dated ${esc(formatDateDeed(x.date))}`:'',bank=x.bank?` through ${v191En(x.bank)}`:'',branch=x.branch?` ${v191En(x.branch)} Branch`:'';return `${v191MoneyEn(x.amount)} received by ${v191En(x.mode||'payment')}${ref}${dt}${bank}${branch}`;}).join('; ');
}
function v191PhotoGridEn(d){
  const items=[];normalizePartyList(d.sellers,d.seller).forEach((p,i,a)=>items.push({type:'Seller',p,i,total:a.length}));normalizePartyList(d.buyers,d.buyer).forEach((p,i,a)=>items.push({type:'Buyer',p,i,total:a.length}));
  if(!items.length)return '';
  return `<div class="party-photo-section v19-photo-section"><b>Seller / Buyer Photographs</b><div class="party-photo-grid v19-photo-grid" data-count="${items.length}">${items.map(x=>`<div class="party-photo-box ${x.type==='Seller'?'photo-seller':'photo-buyer'}"><div class="photo-placeholder">PHOTO</div><strong>${x.type}${x.total>1?` ${x.i+1}`:''}</strong><small>${v191En(x.p?.name||'')}</small></div>`).join('')}</div></div>`;
}
function v191FingerBlocksEn(list,label,extraClass=''){
  const a=normalizePartyList(list,null),safe=a.length?a:[{name:''}],names=['Thumb','Index','Middle','Ring','Little'];
  const hand=t=>`<div class="finger-hand-block"><b class="finger-hand-title">${t}</b><div class="finger-print-box-row">${names.map(n=>`<div class="finger-print-box"><span>${n}</span></div>`).join('')}</div></div>`;
  return safe.map((p,i)=>`<div class="finger-block party-finger-person ${extraClass}"><b>${label}${safe.length>1?` ${i+1}`:''}${p.name?` (${v191En(p.name)})`:''} — Finger impressions of both hands</b>${hand('Left Hand')}${hand('Right Hand')}${p.biometricNote?`<p class="finger-note"><b>Note:</b> ${v191En(p.biometricNote)}</p>`:''}</div>`).join('');
}
function v191WitnessBoxEn(w,label){return `<div class="witness-detail-box"><strong>${label}</strong><p><b>${v191En(w?.name||'')}</b>${w?.father?` ${v191RelationEn(w)} ${v191En(w.father)}`:''}</p><p>Resident of: ${v191En(w?.address||'')}</p><p>Mobile: ${esc(w?.mobile||'-')} &nbsp; Aadhaar/ID: ${esc(w?.id||w?.idNo||'-')}</p></div>`;}

function v191RenderAgricultureEnglish(d){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;
  const sectionRaw=String(d.agri?.circleSection||'Semi-Urban');
  const section=sectionRaw.includes('अर्द्ध')?'Semi-Urban':sectionRaw.includes('ग्रामीण')?'Rural':sectionRaw.includes('नगरीय')?'Urban':v191EnRaw(sectionRaw.replace(/.*-\s*/,''));
  const currentStamp=Math.max(0,(Number(d.stampDuty)||0)-(Number(d.agri?.agreementStampPaid)||0)),rateRs=circleAreaRateRupees(d);
  const hasAssets=(d.agri?.treeBoringStatus&&d.agri.treeBoringStatus!=='नहीं')||d.agri?.landCondition==='बाग है';
  const landDesc=hasAssets?'Agricultural land (with trees/boring or other recorded improvements)':'Agricultural land (without trees, boring or other such improvements)';
  const farmer=d.agri?.buyerFarmerStatus==='notfarmer'?'Immovable property exists from before 12/09/2003.':'The buyer is an agriculturist / belongs to an agriculturist family of Uttarakhand State.';
  const holding=d.agri?.buyerHoldingLimit==='above'?'The buyer, including this purchase, holds more than 12-1/2 acres of land.':'The buyer, including this purchase, does not hold more than 12-1/2 acres of land.';
  const sellerRemain=d.agri?.sellerRemainingShare==='yes'?'The seller retains a share/interest in the aforesaid Gata number(s).':'No share/interest of the seller remains in the aforesaid Gata number(s).';
  const possession=d.agri?.possessionGiven==='no'?'Possession of the sold land remains to be delivered at site.':'Possession of the sold land has been delivered to the buyer at the site.';
  const mutate=d.agri?.mutationSupport==='no'?'Mutation assistance, if any, shall be dealt with separately.':'The seller shall fully cooperate in mutation of the land in favour of the buyer.';
  const sellers=normalizePartyList(d.sellers,d.seller),buyers=normalizePartyList(d.buyers,d.buyer),loc=v191LocationEn(d),prop=v191GroupedGataEn(d),payments=v191PaymentNarrativeEn(d);
  const rateLine=`Rate List Page No. ${v191En(d.agri?.circlePage||'-')}, Serial/Row No. ${v191En(d.agri?.circleRow||'-')}, Column No. ${v191En(d.circleRateColumn||'4')}, Circle Rate ${v191MoneyEn(rateRs)} per hectare; ${v191RoadSentenceEn(d)}.`;
  const mainRoad=v191En(d.agri?.mainRoadDistance||d.agri?.roadDistanceCategory||'[Main road distance]');
  const photoCert=v191En(d.agri?.photoCertifier||`Buyer and witnesses identified before ${d.advocate?.name||'[Advocate]'}`);
  const stampPaid=d.agri?.agreementStampPaid?v191MoneyEn(d.agri.agreementStampPaid):'Nil';
  legal.innerHTML=`<div class="deed-document hindi-deed v191-english-agri">
    <section class="deed-page deed-page-1">
      <h1>SALE DEED <span>(${section} Area)</span></h1>
      <div class="deed-top-grid">
        <div>Sale Consideration — <b class="v red">${v191MoneyEn(d.transactionAmount)}</b></div>
        <div>Market / Government Value — <b class="v red">${v191MoneyEn(d.plotValue)}</b></div>
        <div>Stamp Duty — <b class="v red">${v191MoneyEn(d.stampDuty)}</b></div>
        <div>Stamp Duty already paid on Agreement — <b>${stampPaid}</b></div>
        <div>Stamp Duty paid presently — <b class="v red">${v191MoneyEn(currentStamp)}</b></div>
        <div>Number of Stamp Sheets — <b>${esc(d.agri?.stampSheetCount||'')}</b></div>
      </div>
      <p>Total area of property sold — <b class="v red">${Number(d.agri?.totalAreaHa||0).toFixed(4)} hectare</b>; annual land revenue <b>${v191LaganEn(d.agri?.annualLagan)}</b>.</p>
      <p>Description of property sold — <b class="v green">${landDesc}</b></p>
      <p class="deed-small">Agricultural / Residential / Commercial / Industrial; where a building exists, construction year/type and number of floors are to be stated as applicable.</p>
      <p>Covered Area (if any construction exists) — <b class="v green">${v191En(d.agri?.coveredAreaText||'No')}</b></p>
      <p>Situated at — <b class="v green">${loc}.</b></p>
      <p class="deed-small">(Mauza/Mohalla, Pargana, Tehsil and Urban/Semi-Urban/Rural classification, as applicable.)</p>
      <p>Whether buyer/seller belongs to Scheduled Caste / Scheduled Tribe — <b class="v green">${v191EnStatus(d.agri?.scstRelated||'No')}</b></p>
      <p>Basis of seller's ownership — <b class="v green">${v191En(d.agri?.sellerOwnershipBasis||'Transferable tenure holder')}</b></p>
      <p>Whether land is leasehold etc. — <b class="v green">${v191EnStatus(d.agri?.leaseLand||'No')}</b></p>
      <p>Whether consolidation proceedings are in progress — <b class="v green">${v191EnStatus(d.agri?.consolidationStatus||'In progress')}</b></p>
      <p>Status of agricultural land — <b class="v green">${v191EnStatus(d.agri?.landCondition||'Irrigated')}</b></p>
      <p class="deed-small">(Orchard / Irrigated / Unirrigated or category as per the applicable Circle Rate List.)</p>
      <p><b class="v red">${rateLine}</b></p>
      <p>Housing Development Fee area — <b class="v green">${v191EnStatus(d.agri?.housingDevelopmentFee||'Not applicable')}</b></p>
      <p>Distance from Main Road — <b class="v green">${mainRoad}</b></p>
      <p>Buyer agriculturist status — <b class="v green">${farmer}</b></p>
      <p>Photograph / thumb impression certified by — <b class="v green">${photoCert}</b></p>
      <p>Seller(s), parent/spouse name and address — <b class="v green">${v191PartiesEn(sellers,d.seller,'Seller')}</b></p>
    </section>
    <section class="deed-page deed-page-2"><div class="page2-bottom"><p>Whereas the executant/seller is the lawful owner and person entitled to transfer the property described herein and, according to the documents and declarations produced, the property is stated to be free from undisclosed encumbrances, prohibitions, prior transfers, mortgages and loans with any department, bank, society or private person, except as specifically disclosed in this deed.</p></div></section>
    <section class="deed-page deed-page-3">
      <p>The seller represents that he/she is fully competent to sell and transfer the property described below and, while being of sound mind and acting voluntarily and without force or coercion, has sold and transferred the said property for a total consideration of <b class="v red">${v191MoneyEn(d.transactionAmount)}</b> in favour of <b class="v green">${v191PartiesEn(buyers,d.buyer,'Buyer')}</b>. The consideration has been paid/acknowledged in the manner recorded in this deed. Possession has been delivered or shall be dealt with as specifically stated herein. The seller and the seller's successors shall have no right, title or interest in the property sold except any obligation expressly preserved by law or by this deed. If any lawful defect in title causes the buyer to lose the whole or any part of the property, the parties shall have the remedies available under applicable law and the terms of this deed.</p>
      <p class="center-clause">Accordingly, this Sale Deed has been executed as evidence of the transaction and for use whenever required.</p>
      ${v191PhotoGridEn(d)}
    </section>
    <section class="deed-page deed-page-4">
      <p><b><u>DESCRIPTION OF PROPERTY SOLD —</u></b> <b class="v green">Agricultural land / transferable tenure holding, according to ${v191En(d.agri?.landRecordBasis||'the applicable land record')}; ${prop}. Total area sold ${Number(d.agri?.totalAreaHa||0).toFixed(4)} hectare, annual land revenue ${v191LaganEn(d.agri?.annualLagan)}. Boundaries: East — ${v191En(d.boundaries?.east||'[East]')}; West — ${v191En(d.boundaries?.west||'[West]')}; North — ${v191En(d.boundaries?.north||'[North]')}; South — ${v191En(d.boundaries?.south||'[South]')}; situated at ${loc}.</b></p>
      <p>${possession} ${mutate} <span class="v purple">${holding} ${sellerRemain}</span> Latitude: <b class="v red">${esc(d.agri?.latitude||'[Latitude]')}</b>; Longitude: <b class="v red">${esc(d.agri?.longitude||'[Longitude]')}</b>. The seller and buyer are acquainted with each other and this deed has been drafted on the basis of the documents and particulars supplied by them.</p>
      <div class="payment-deed-section"><p><b><u>DETAILS OF RECEIPT OF SALE CONSIDERATION —</u></b> Out of the total consideration of <b class="v red">${v191MoneyEn(d.transactionAmount)}</b>, the following payments have been received/acknowledged:</p>${v191PaymentTableEn(d)}<p>${payments}. After the above payments, no amount remains due from the buyer to the seller, subject to verification of the entered payment details.</p></div>
      ${v191FingerBlocksEn(sellers,'Seller','seller-finger')}
    </section>
    <section class="deed-page deed-page-5">
      ${v191FingerBlocksEn(buyers,'Buyer','buyer-finger')}
      <div class="witness-box-grid">${v191WitnessBoxEn(d.witness1,'Witness 1')}${v191WitnessBoxEn(d.witness2,'Witness 2')}${(d.additionalWitnesses||[]).map((w,i)=>v191WitnessBoxEn(w,`Witness ${i+3}`)).join('')}</div>
      <div class="deed-footer-lines"><p>Date of Execution — <b>${esc(formatDateDeed(d.agri?.executionDate))}</b></p><p>Drafted By — <b>${v191En(d.advocate?.name||'[Advocate]')}</b>, Advocate, ${v191En(d.agri?.advocateOffice||'Court Roorkee, District Haridwar')}.</p></div>
    </section>
  </div>`;
}

function v191AgricultureCheckingCopyHtml(d,lang){
  const en=lang==='English',warnings=v18CollectWarnings(d),pay=(d.payments||[]).filter(x=>Number(x.amount)>0),payTotal=pay.reduce((s,x)=>s+Number(x.amount||0),0),sellers=normalizePartyList(d.sellers,d.seller),buyers=normalizePartyList(d.buyers,d.buyer),gata=d.agri?.gataRows||[];
  const partyRows=[...sellers.map((p,i)=>`<tr><td>${en?'Seller':'विक्रेता'} ${i+1}</td><td>${en?v191En(p.name||'-'):esc(relationName(p)||p.name||'-')}</td><td>${esc(p.mobile||'-')}</td><td>${esc(p.idNo||p.aadhaar||p.pan||'-')}</td></tr>`),...buyers.map((p,i)=>`<tr><td>${en?'Buyer':'क्रेता'} ${i+1}</td><td>${en?v191En(p.name||'-'):esc(relationName(p)||p.name||'-')}</td><td>${esc(p.mobile||'-')}</td><td>${esc(p.idNo||p.aadhaar||p.pan||'-')}</td></tr>`)].join('');
  const gataRows=gata.map((x,i)=>`<tr><td>${i+1}</td><td>${v191En(x.chak||'-')}</td><td>${v191En(x.gata||'-')}</td><td>${Number(x.totalArea||0).toFixed(4)}</td><td>${Number((x.soldArea??x.area)||0).toFixed(4)}</td></tr>`).join('');
  if(en)return `<div class="deed-document hindi-deed v19-checking-deed v191-english-check"><section class="deed-page deed-page-1"><h1>CHECKING COPY</h1><p class="center-clause"><b>Agriculture Land Sale Deed</b> • Registry No. ${esc(d.registryNo||v14ActiveRegistryNo||'-')}</p><div class="v19-check-summary"><p><b>Village:</b> ${v191En(d.village||'-')} &nbsp; <b>Sold Area:</b> ${Number(d.agri?.totalAreaHa||0).toFixed(4)} ha</p><p><b>Khata:</b> ${v191En(d.khataNo||'-')} &nbsp; <b>Khasra/Gata:</b> ${v191En(v19KhasraText(d))}</p><p><b>Circle Rate Reference:</b> ${v191En(d.rateRef||'-')}</p><p><b>Government Value:</b> ${inr(d.plotValue||0)} &nbsp; <b>Total Transaction:</b> ${inr(d.transactionAmount||0)}</p><p><b>Road Distance:</b> ${v191En(d.agri?.roadDistanceCategory||d.mainRoadDistance||'-')} &nbsp; <b>Area Category:</b> ${v191En(d.ruleEngine?.settlementCategory||'-')}</p></div><h2>Seller / Buyer Details</h2><table class="payment-deed-table"><thead><tr><th>Party</th><th>Name</th><th>Mobile</th><th>ID</th></tr></thead><tbody>${partyRows||'<tr><td colspan="4">Party details pending</td></tr>'}</tbody></table><h2>Chak / Gata / Rakba</h2><table class="payment-deed-table"><thead><tr><th>#</th><th>Chak</th><th>Khasra/Gata</th><th>Total Ha</th><th>Sale Ha</th></tr></thead><tbody>${gataRows||'<tr><td colspan="5">No Gata rows</td></tr>'}</tbody></table></section><section class="deed-page deed-page-2"><h1>CHECKING COPY — REVIEW</h1><h2>Payment / Consideration</h2><p>Payment breakdown target: ${inr(d.transactionAmount||0)}. Current payment rows total: <b>${inr(payTotal)}</b>.</p>${v191PaymentTableEn({...d,payments:pay})}<h2>Witness / Advocate</h2><p><b>Witnesses:</b> ${v18AllWitnesses(d).map(x=>v191EnRaw(x.name||relationName(x)||'')).filter(Boolean).join(', ')||'-'}</p><p><b>Drafted By:</b> ${v191En(d.advocate?.name||d.ownerAdvocate||'-')}</p><h2>Review Warnings</h2>${warnings.length?`<ul>${warnings.map(x=>`<li>${v191En(x)}</li>`).join('')}</ul>`:'<p>✓ No current warnings.</p>'}<p class="center-clause"><b>This is only a Checking Copy. Review/correct the draft and then Approve Final Copy.</b></p></section></div>`;
  return `<div class="deed-document hindi-deed v19-checking-deed"><section class="deed-page deed-page-1"><h1>जाँच प्रति / CHECKING COPY</h1><p class="center-clause"><b>कृषि भूमि विक्रय-पत्र</b> • रजिस्ट्री नं. ${esc(d.registryNo||v14ActiveRegistryNo||'-')}</p><div class="v19-check-summary"><p><b>ग्राम:</b> ${esc(d.village||'-')} &nbsp; <b>विक्रित रकबा:</b> ${Number(d.agri?.totalAreaHa||0).toFixed(4)} हे.</p><p><b>खाता:</b> ${esc(d.khataNo||'-')} &nbsp; <b>खसरा/गाटा:</b> ${esc(v19KhasraText(d))}</p><p><b>सर्किल रेट संदर्भ:</b> ${esc(d.rateRef||'-')}</p><p><b>बाजारी/सरकारी मालियत:</b> ${inr(d.plotValue||0)} &nbsp; <b>कुल लेन-देन:</b> ${inr(d.transactionAmount||0)}</p><p><b>मुख्य सड़क दूरी:</b> ${esc(d.agri?.roadDistanceCategory||d.mainRoadDistance||'-')} &nbsp; <b>क्षेत्र श्रेणी:</b> ${esc(d.ruleEngine?.settlementCategory||'-')}</p></div><h2>विक्रेता / क्रेता विवरण</h2><table class="payment-deed-table"><thead><tr><th>पक्ष</th><th>नाम</th><th>मोबाइल</th><th>पहचान</th></tr></thead><tbody>${partyRows||'<tr><td colspan="4">पक्ष विवरण बाकी है</td></tr>'}</tbody></table><h2>चक / गाटा / रकबा</h2><table class="payment-deed-table"><thead><tr><th>#</th><th>चक</th><th>खसरा/गाटा</th><th>कुल हे.</th><th>विक्रित हे.</th></tr></thead><tbody>${gataRows||'<tr><td colspan="5">गाटा विवरण नहीं है</td></tr>'}</tbody></table></section><section class="deed-page deed-page-2"><h1>जाँच प्रति — समीक्षा</h1><h2>भुगतान / मूल्य राशि</h2><p>भुगतान विवरण का लक्ष्य ${inr(d.transactionAmount||0)} है। भरी हुई भुगतान पंक्तियों का कुल: <b>${inr(payTotal)}</b>.</p>${v15PaymentTableHtml({...d,payments:pay})}<h2>साक्षी / अधिवक्ता</h2><p><b>साक्षी:</b> ${esc(v18AllWitnesses(d).map(x=>relationName(x)||x.name).filter(Boolean).join(', ')||'-')}</p><p><b>ड्राफ्टिड बाई:</b> ${esc(d.advocate?.name||d.ownerAdvocate||'-')}</p><h2>जाँच चेतावनियाँ</h2>${warnings.length?`<ul>${warnings.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>✓ वर्तमान में कोई चेतावनी नहीं।</p>'}<p class="center-clause"><b>यह केवल Checking Copy है। सुधार/सत्यापन के बाद Approve Final Copy करें।</b></p></section></div>`;
}

// Final targeted renderer: only Agriculture is language-aware in this test patch.
const _v191SyncDraftPreviewBase=syncDraftPreview;
syncDraftPreview=function(){
  _v191SyncDraftPreviewBase();
  try{
    if(!isAgricultureMode()){
      v191SyncLanguageSelector(typeof draftData==='function'?draftData():{});
      return;
    }
    const d=draftData(),lang=v191LanguageForDraft(d),final=v19IsFinal(d),legal=document.getElementById('legalDraftPreview');
    d.draftLanguage=lang;
    if(!final){
      if(legal)legal.innerHTML=v191AgricultureCheckingCopyHtml(d,lang);
      try{applyDraftPageChrome();}catch(e){}
      try{v19UnwrapCheckingStamp();}catch(e){}
    }else if(lang==='English'){
      v191RenderAgricultureEnglish(d);
      try{applyDraftPageChrome();}catch(e){}
    }else{
      renderAgricultureDeed(d);
      try{applyDraftPageChrome();}catch(e){}
    }
    v18ApplyCopyState(d);
    v191SyncLanguageSelector(d);
  }catch(e){console.error('v1.9.1 Agriculture language patch',e);}
};

// Keep dashboard selector as Hindi/English only. Dashboard labels themselves remain Hinglish.
document.addEventListener('DOMContentLoaded',()=>{
  const old=localStorage.getItem('registryProLanguage');
  if(!old||String(old).toLowerCase()==='hinglish')localStorage.setItem('registryProLanguage','Hindi');
  try{v191SyncLanguageSelector({});}catch(e){}
  console.info('Registry Pro v1.9.1 Agriculture Hindi/English language patch loaded');
});

/* ===== v1.9.2 PATCH — AGRICULTURE ENGLISH INPUT + SMART ENGLISH + FINGERPRINT PAGINATION =====
   Targeted patch on top of v1.9.1 only.
   - Default draft language becomes English for new/in-progress work.
   - In English mode, Seller/Buyer/Witness Name, Father/Spouse and Address fields are NOT auto-converted to Hindi.
   - English deed keeps Latin spelling exactly as typed.
   - Common Hindi address/boundary/property words are rendered in clean English instead of crude romanization.
   - Seller/Buyer fingerprint blocks are moved to continuation pages when they cannot fit, so boxes are not clipped at page bottom.
*/

const V192_EN_WORDS = [
  ['चकबन्दी आकार पत्र 23 भाग 1 के अनुसार','Consolidation Form 23 Part 1'],
  ['चकबंदी आकार पत्र 23 भाग 1 के अनुसार','Consolidation Form 23 Part 1'],
  ['आकार पत्र 23 भाग 1 के अनुसार','Consolidation Form 23 Part 1'],
  ['सिकन्दरपुर भैंसवाल','Sikanderpur Bhainswal'],
  ['सिकंदरपुर भैंसवाल','Sikanderpur Bhainswal'],
  ['अर्द्धनगरीय','Semi-Urban'],['अर्धनगरीय','Semi-Urban'],['नगरीय','Urban'],['ग्रामीण','Rural'],
  ['स्थानान्तरणीय भूमिधरी','Transferable tenure holding'],['संक्रमणीय भूमिधरी','Transferable tenure holding'],
  ['कृषि भूमि','Agricultural land'],['आवासीय','Residential'],['वाणिज्यिक','Commercial'],['औद्योगिक','Industrial'],
  ['मुख्य सड़क','Main Road'],['मुख्य मार्ग','Main Road'],['सड़क','Road'],['रास्ता','Road'],['नाली','Drain'],['नहर','Canal'],
  ['खाली प्लॉट','Vacant Plot'],['खाली प्लाट','Vacant Plot'],['प्लॉट','Plot'],['प्लाट','Plot'],
  ['मकान','House'],['दुकान','Shop'],['खेत','Agricultural Field'],['भूमि','Land'],['जमीन','Land'],
  ['निवासी','Resident of'],['ग्राम','Village'],['गाँव','Village'],['माजरा','Majra'],['मजरा','Majra'],
  ['परगना','Pargana'],['तहसील','Tehsil'],['जिला','District'],
  ['भगवानपुर','Bhagwanpur'],['हरिद्वार','Haridwar'],['रुड़की','Roorkee'],['चांचक','Chanchak'],
  ['सिकन्दरपुर','Sikanderpur'],['सिकंदरपुर','Sikanderpur'],['भैंसवाल','Bhainswal'],['पुहाना','Puhana'],
  ['सलमान','Salman'],['खान','Khan'],['मनोज','Manoj'],['शमीम','Shameem'],['अमजद','Amjad'],['मोनिश','Monish'],
  ['अमित','Amit'],['शर्मा','Sharma'],['मुनीर','Munir'],['अहमद','Ahmed'],['अहमेद','Ahmed'],
  ['पुत्र','son of'],['पुत्री','daughter of'],['पत्नी','wife of'],['पति','husband of'],
  ['नकद','Cash'],['चेक','Cheque'],['आरटीजीएस','RTGS'],['एनईएफटी','NEFT'],
  ['हाँ','Yes'],['नहीं','No'],['सिंचित','Irrigated'],['असिंचित','Unirrigated'],['बाग','Orchard']
];

function v192UnknownDevWord(word){
  let r=v191DevToRoman(word).trim();
  if(!r)return word;
  r=r.replace(/a$/,'');
  // A few common schwa cleanups for readable fallback; exact Latin input is never changed.
  r=r.replace(/bhagavaanapur/gi,'Bhagwanpur').replace(/haridvaar/gi,'Haridwar').replace(/salamaan/gi,'Salman');
  return r.charAt(0).toUpperCase()+r.slice(1);
}
function v192SmartEnglishRaw(value){
  let s=String(value??'').trim();
  if(!s)return s;
  if(!/[\u0900-\u097F]/.test(s))return s; // Latin spelling stays exactly as entered.

  // Natural boundary phrases first.
  const boundaryRules=[
    ['खेत','Agricultural field of'],['मकान','House of'],['दुकान','Shop of'],['प्लॉट','Plot of'],['प्लाट','Plot of'],
    ['रास्ता','Road'],['सड़क','Road'],['नाली','Drain'],['नहर','Canal']
  ];
  for(const [hi,en] of boundaryRules){
    if(s===hi)return en.replace(/ of$/,'');
    if(s.startsWith(hi+' ')){
      const tail=s.slice(hi.length).trim();
      return `${en}${tail?` ${v192SmartEnglishRaw(tail)}`:''}`.trim();
    }
  }

  // Replace known legal/address/name vocabulary, longest phrases first.
  let out=s;
  [...V192_EN_WORDS].sort((a,b)=>b[0].length-a[0].length).forEach(([hi,en])=>{out=out.split(hi).join(en);});
  // Convert any remaining Devanagari token with a conservative readable fallback.
  out=out.replace(/[\u0900-\u097F]+/g,w=>v192UnknownDevWord(w));
  return out.replace(/\s+/g,' ').replace(/\s+,/g,',').trim();
}
function v192SmartEnglish(value){return esc(v192SmartEnglishRaw(value));}

// Replace v1.9.1's crude transliteration renderer with smart English rendering.
v191EnRaw=function(v){return v192SmartEnglishRaw(v);};
v191En=function(v){return v192SmartEnglish(v);};

function v192PartyExactOrEnglish(v){
  const s=String(v??'').trim();
  return /[\u0900-\u097F]/.test(s)?v192SmartEnglishRaw(s):s;
}
v191PartyLineEn=function(p){
  const name=v192PartyExactOrEnglish(p?.name||'[Name]');
  const father=v192PartyExactOrEnglish(p?.father||'[Father/Spouse Name]');
  const address=v192SmartEnglishRaw(p?.address||'[Address]');
  const bits=[`${esc(name)} ${v191RelationEn(p)} ${esc(father)}`,`resident of ${esc(address)}`];
  if(p?.aadhaar||p?.idNo)bits.push(`Aadhaar/ID ${esc(p.aadhaar||p.idNo)}`);
  if(p?.mobile)bits.push(`Mobile ${esc(p.mobile)}`);
  if(p?.email)bits.push(`Email ${esc(p.email)}`);
  return bits.join(', ');
};
v191PartiesEn=function(list,primary,label){
  const a=normalizePartyList(list,primary);return a.map((p,i)=>`${a.length>1?`${label} ${i+1}: `:''}${v191PartyLineEn(p)}`).join('<br>');
};
v191LocationEn=function(d){
  return `Village ${esc(v192SmartEnglishRaw(d.village||'[Village]'))}, Pargana/Tehsil ${esc(v192SmartEnglishRaw(d.agri?.pargana||d.agri?.tehsil||'[Tehsil]'))}, District ${esc(v192SmartEnglishRaw(d.agri?.district||'[District]'))}`;
};
v191PhotoGridEn=function(d){
  const items=[];normalizePartyList(d.sellers,d.seller).forEach((p,i,a)=>items.push({type:'Seller',p,i,total:a.length}));normalizePartyList(d.buyers,d.buyer).forEach((p,i,a)=>items.push({type:'Buyer',p,i,total:a.length}));
  if(!items.length)return '';
  return `<div class="party-photo-section v19-photo-section"><b>Seller / Buyer Photographs</b><div class="party-photo-grid v19-photo-grid" data-count="${items.length}">${items.map(x=>`<div class="party-photo-box ${x.type==='Seller'?'photo-seller':'photo-buyer'}"><div class="photo-placeholder">PHOTO</div><strong>${x.type}${x.total>1?` ${x.i+1}`:''}</strong><small>${esc(v192PartyExactOrEnglish(x.p?.name||''))}</small></div>`).join('')}</div></div>`;
};
v191FingerBlocksEn=function(list,label,extraClass=''){
  const a=normalizePartyList(list,null),safe=a.length?a:[{name:''}],names=['Thumb','Index','Middle','Ring','Little'];
  const hand=t=>`<div class="finger-hand-block"><b class="finger-hand-title">${t}</b><div class="finger-print-box-row">${names.map(n=>`<div class="finger-print-box"><span>${n}</span></div>`).join('')}</div></div>`;
  return safe.map((p,i)=>`<div class="finger-block party-finger-person ${extraClass}"><b>${label}${safe.length>1?` ${i+1}`:''}${p.name?` (${esc(v192PartyExactOrEnglish(p.name))})`:''} — Finger impressions of both hands</b>${hand('Left Hand')}${hand('Right Hand')}${p.biometricNote?`<p class="finger-note"><b>Note:</b> ${v192SmartEnglish(p.biometricNote)}</p>`:''}</div>`).join('');
};
v191WitnessBoxEn=function(w,label){
  const n=esc(v192PartyExactOrEnglish(w?.name||'')),f=esc(v192PartyExactOrEnglish(w?.father||'')),a=esc(v192SmartEnglishRaw(w?.address||''));
  return `<div class="witness-detail-box"><strong>${label}</strong><p><b>${n}</b>${w?.father?` ${v191RelationEn(w)} ${f}`:''}</p><p>Resident of: ${a}</p><p>Mobile: ${esc(w?.mobile||'-')} &nbsp; Aadhaar/ID: ${esc(w?.id||w?.idNo||'-')}</p></div>`;
};

// In English draft mode, preserve Seller/Buyer/Witness spelling exactly as typed; do not auto-Hindi these fields.
const _v192ShouldHindiAutoBase=shouldHindiAuto;
function v192IsPartyTextField(el){
  if(!el)return false;
  const id=String(el.id||'').toLowerCase();
  if(/^(seller|buyer)(name|father|address)$/.test(id))return true;
  if(/^witness[12](name|father|address)$/.test(id))return true;
  const pf=String(el.getAttribute?.('data-party-field')||'').toLowerCase();
  return ['name','father','address'].includes(pf);
}
shouldHindiAuto=function(el){
  const lang=v191NormalizeDraftLanguage(localStorage.getItem('registryProLanguage')||'English');
  if(lang==='English'&&v192IsPartyTextField(el))return false;
  return _v192ShouldHindiAutoBase(el);
};

// English fingerprint pagination: never let Seller/Buyer boxes be clipped at A4 page bottom.
function v192InsertFingerPage(parent,before,block,title,cls){
  const pg=document.createElement('section');pg.className=`deed-page deed-page-finger-continuation ${cls||''}`;
  pg.innerHTML=`<p class="finger-cont-heading"><b>${esc(title)}</b></p>`;pg.appendChild(block);parent.insertBefore(pg,before);return pg;
}
function v192PaginateEnglishFingerprints(){
  const legal=document.getElementById('legalDraftPreview');if(!legal?.querySelector('.v191-english-agri'))return;
  const p4=legal.querySelector('.deed-page-4'),p5=legal.querySelector('.deed-page-5');if(!p4||!p5)return;
  const parent=p5.parentNode;
  const sellers=[...p4.querySelectorAll(':scope > .party-finger-person')];
  const manyPayments=p4.querySelectorAll('.payment-deed-table tbody tr').length>3;
  if(sellers.length&&(sellers.length>1||manyPayments||v17BlockNeedsNextPage(p4,sellers[0],150))){
    sellers.forEach((b,i)=>v192InsertFingerPage(parent,p5,b,`Seller${sellers.length>1?` ${i+1}`:''} — Finger impressions of both hands`,'seller-finger-continuation'));
  }
  const buyers=[...p5.querySelectorAll(':scope > .party-finger-person')];
  const witness=p5.querySelector(':scope > .witness-box-grid'),foot=p5.querySelector(':scope > .deed-footer-lines');
  const buyerWitnessOverflow=buyers.length&&witness&&((buyers[buyers.length-1].offsetTop||0)+(buyers[buyers.length-1].offsetHeight||260)+(witness.offsetHeight||180)>v17PageCapacity(p5)-105);
  if(buyers.length>1||buyerWitnessOverflow){
    buyers.forEach((b,i)=>v192InsertFingerPage(parent,p5,b,`Buyer${buyers.length>1?` ${i+1}`:''} — Finger impressions of both hands`,'buyer-finger-continuation'));
  }
  if(witness&&(buyers.length>1||buyerWitnessOverflow||v17BlockNeedsNextPage(p5,witness,95))){
    const wp=document.createElement('section');wp.className='deed-page deed-page-witness-final';wp.innerHTML='<p class="finger-cont-heading"><b>Witness Details</b></p>';
    wp.appendChild(witness);if(foot)wp.appendChild(foot);parent.insertBefore(wp,p5.nextSibling);
  }
  // If page 5 became empty after moving sections, remove it.
  const meaningful=[...p5.children].some(x=>!x.classList.contains('registry-page-footer'));
  if(!meaningful)p5.remove();
}

// Run the extra pagination after v1.9.1 renders English Agriculture, then rebuild borders/footer/page numbers.
const _v192SyncDraftPreviewBase=syncDraftPreview;
syncDraftPreview=function(){
  _v192SyncDraftPreviewBase();
  try{
    const d=(typeof draftData==='function'?draftData():{});
    if(isAgricultureMode()&&v19IsFinal(d)&&v191LanguageForDraft(d)==='English'){
      v192PaginateEnglishFingerprints();
      applyDraftPageChrome();
      v18ApplyCopyState(d);
    }
  }catch(e){console.error('v1.9.2 English fingerprint pagination',e);}
};

// One-time migration: English is the default draft language from this patch onward.
document.addEventListener('DOMContentLoaded',()=>{
  try{
    if(!localStorage.getItem('registryProV192DefaultEnglishApplied')){
      localStorage.setItem('registryProLanguage','English');
      localStorage.setItem('registryProV192DefaultEnglishApplied','1');
    }
    v191SyncLanguageSelector({});
    setTimeout(()=>{try{syncDraftPreview();}catch(e){}},0);
    console.info('Registry Pro v1.9.2 Agriculture English input/fingerprint patch loaded');
  }catch(e){console.warn('v1.9.2 init',e);}
});

/* ===== Registry Pro PATCH v1.9.3 — Advocate English + Agriculture PDF Page 5 Packing =====
   Targeted patch only:
   - English Agriculture: advocate office/footer wording is normalized to clean English.
   - English mode: Advocate Office / Photo Certifier / Advocate Name fields do not auto-Hindi.
   - Final English Agriculture: one Seller + one Buyer fingerprints are packed intelligently so Page 5 is not left half-empty.
   - If witnesses still cannot fit safely, only witness/footer moves to a continuation page.
*/
function v193EnsureStyle(){
  if(document.getElementById('v193AgricultureEnglishStyle'))return;
  const st=document.createElement('style');st.id='v193AgricultureEnglishStyle';
  st.textContent=`
    .v191-english-agri .deed-page-5.v193-combined-finger-page .party-finger-person{margin:0 0 4.5mm 0;break-inside:avoid;page-break-inside:avoid}
    .v191-english-agri .deed-page-5.v193-combined-finger-page .finger-hand-block{margin-top:2mm;margin-bottom:2mm;break-inside:avoid;page-break-inside:avoid}
    .v191-english-agri .deed-page-5.v193-combined-finger-page .finger-hand-title{font-size:10.5pt;line-height:1.1}
    .v191-english-agri .deed-page-5.v193-combined-finger-page .finger-print-box-row{margin-top:3px}
    .v191-english-agri .deed-page-5.v193-combined-finger-page .finger-print-box{height:22mm;font-size:9pt}
    .v191-english-agri .deed-page-5.v193-combined-finger-page .witness-box-grid{margin-top:3mm;gap:3mm;break-inside:avoid;page-break-inside:avoid}
    .v191-english-agri .deed-page-5.v193-combined-finger-page .witness-detail-box{min-height:0;padding:7px 9px;font-size:10.25pt;line-height:1.15}
    .v191-english-agri .deed-page-5.v193-combined-finger-page .witness-detail-box p{margin:2px 0}
    .v191-english-agri .deed-page-5.v193-combined-finger-page .deed-footer-lines{margin-top:3mm;break-inside:avoid;page-break-inside:avoid}
    .v191-english-agri .deed-page-5.v193-combined-finger-page .deed-footer-lines p{margin:3px 0}
    .v191-english-agri .deed-page-witness-final.v193-witness-continuation .witness-box-grid{margin-top:6mm}
  `;
  document.head.appendChild(st);
}

function v193AdvocateOfficeEnglish(value){
  let s=String(value??'').trim();
  if(!s)return 'Court Roorkee, District Haridwar';
  if(/[\u0900-\u097F]/.test(s))s=v192SmartEnglishRaw(s);
  // Clean common legacy Roman-Hindi spellings created by the old transliteration helper.
  const reps=[
    [/\b(kachaharee|kachahari|kachahri|kachaheree|kachaheree|kacheri|kacheri|kachehari|kachhari|kacheri)\b/gi,'Court'],
    [/\b(rudakee|rudaki|rudkee|roorki|roorkee)\b/gi,'Roorkee'],
    [/\b(jila|jilaa|zila|zilaa|district)\b/gi,'District'],
    [/\b(haridvaara|haridvara|haridwaara|haridwar)\b/gi,'Haridwar']
  ];
  reps.forEach(([re,to])=>{s=s.replace(re,to);});
  s=s.replace(/\s*,\s*/g,', ').replace(/\s+/g,' ').trim();
  // Add a natural separator for the standard office phrase.
  s=s.replace(/\bCourt\s+Roorkee\s+District\s+Haridwar\b/i,'Court Roorkee, District Haridwar');
  s=s.replace(/\bCourt\s+Roorkee,?\s+District\s+Haridwar\b/i,'Court Roorkee, District Haridwar');
  return s;
}

function v193FixEnglishAdvocateFooter(d){
  const legal=document.getElementById('legalDraftPreview');
  if(!legal?.querySelector('.v191-english-agri'))return;
  const name=v192PartyExactOrEnglish(d?.advocate?.name||d?.ownerAdvocate||'[Advocate]');
  const office=v193AdvocateOfficeEnglish(d?.agri?.advocateOffice||'Court Roorkee, District Haridwar');
  const line=legal.querySelector('.deed-footer-lines p:last-child');
  if(line)line.innerHTML=`Drafted By — <b>${esc(name)}</b>, Advocate, ${esc(office)}.`;
}

// English mode should keep advocate-related typing in English too.
const _v193ShouldHindiAutoBase=shouldHindiAuto;
function v193IsAdvocateEnglishField(el){
  if(!el)return false;
  const id=String(el.id||'').toLowerCase();
  return ['advocatename','advocateoffice','photocertifier'].includes(id);
}
shouldHindiAuto=function(el){
  const lang=v191NormalizeDraftLanguage(localStorage.getItem('registryProLanguage')||'English');
  if(lang==='English'&&v193IsAdvocateEnglishField(el))return false;
  return _v193ShouldHindiAutoBase(el);
};

// Keep the old multi-party fallback, but pack the common 1 Seller + 1 Buyer case on Page 5.
const _v193PaginateEnglishFingerprintsBase=v192PaginateEnglishFingerprints;
v192PaginateEnglishFingerprints=function(){
  const legal=document.getElementById('legalDraftPreview');if(!legal?.querySelector('.v191-english-agri'))return;
  v193EnsureStyle();
  const p4=legal.querySelector('.deed-page-4'),p5=legal.querySelector('.deed-page-5');if(!p4||!p5)return;
  const sellers=[...p4.querySelectorAll(':scope > .party-finger-person')];
  const buyers=[...p5.querySelectorAll(':scope > .party-finger-person')];

  // More than one seller/buyer keeps the safe continuation-page logic from v1.9.2.
  if(sellers.length>1||buyers.length>1){_v193PaginateEnglishFingerprintsBase();return;}

  const seller=sellers[0]||null,buyer=buyers[0]||null;
  const witness=p5.querySelector(':scope > .witness-box-grid');
  const foot=p5.querySelector(':scope > .deed-footer-lines');

  // If seller cannot safely fit after property/payment section, place it before Buyer on Page 5.
  if(seller&&v17BlockNeedsNextPage(p4,seller,85)){
    p5.insertBefore(seller,buyer||witness||foot||p5.firstChild);
  }

  // When both parties are on Page 5, use a compact but printable 10-finger layout.
  if(p5.querySelectorAll(':scope > .party-finger-person').length>=2)p5.classList.add('v193-combined-finger-page');

  // Let the browser settle after the DOM move before measuring the lower blocks.
  void p5.offsetHeight;

  // Only if the witness/footer cannot fit, continue those details to the next page.
  if(witness){
    const cap=v17PageCapacity(p5)-70;
    const end=(witness.offsetTop||0)+(witness.offsetHeight||0)+(foot?.offsetHeight||0);
    if(end>cap){
      const wp=document.createElement('section');
      wp.className='deed-page deed-page-witness-final v193-witness-continuation';
      wp.innerHTML='<p class="finger-cont-heading"><b>Witness Details</b></p>';
      wp.appendChild(witness);if(foot)wp.appendChild(foot);
      p5.parentNode.insertBefore(wp,p5.nextSibling);
    }
  }
};

// Post-render cleanup: advocate/footer English and page chrome after the new packing.
const _v193SyncDraftPreviewBase=syncDraftPreview;
syncDraftPreview=function(){
  _v193SyncDraftPreviewBase();
  try{
    const d=(typeof draftData==='function'?draftData():{});
    if(isAgricultureMode()&&v19IsFinal(d)&&v191LanguageForDraft(d)==='English'){
      v193FixEnglishAdvocateFooter(d);
      applyDraftPageChrome();
      v18ApplyCopyState(d);
    }
  }catch(e){console.error('v1.9.3 advocate/page5 patch',e);}
};

document.addEventListener('DOMContentLoaded',()=>{
  try{v193EnsureStyle();setTimeout(()=>{try{syncDraftPreview();}catch(e){}},0);console.info('Registry Pro v1.9.3 Advocate English + PDF Page 5 patch loaded');}
  catch(e){console.warn('v1.9.3 init',e);}
});

/* ===== Registry Pro PATCH v1.9.4 — Language selector + English typing fix =====
   Fixes:
   - Dashboard Hindi/English selector always reflects the user's current draft-language choice.
   - Final registry language is locked only while that saved Final registry is actually open.
   - New / in-progress drafts follow the dashboard language immediately.
   - English mode disables the active v1.4 Hindi suggestion/transliteration engine for form typing.
   - Hindi mode keeps the existing Hindi typing suggestions.
*/
function v194CurrentDraftLanguage(){
  return v191NormalizeDraftLanguage(localStorage.getItem('registryProLanguage')||'English');
}
function v194FinalLanguageIfOpen(d={}){
  if(!v191RegistryViewActive())return '';
  const stored=v19StoredDraftFor?.(d);
  if(stored && (stored.status==='Completed'||stored.finalApproved===true)){
    return v191NormalizeDraftLanguage(stored.draftLanguage||d.draftLanguage||'Hindi');
  }
  return '';
}

// Do not let an old/previous Final record overwrite the Dashboard language choice.
v191LanguageForDraft=function(d={}){
  const locked=v194FinalLanguageIfOpen(d);
  return locked||v194CurrentDraftLanguage();
};

v191SyncLanguageSelector=function(d={}){
  const el=document.getElementById('dashLanguage');if(!el)return;
  [...el.options].filter(o=>String(o.value).toLowerCase()==='hinglish').forEach(o=>o.remove());
  if(![...el.options].some(o=>o.value==='Hindi'))el.add(new Option('Hindi','Hindi'));
  if(![...el.options].some(o=>o.value==='English'))el.add(new Option('English','English'));
  const locked=v194FinalLanguageIfOpen(d),lang=locked||v194CurrentDraftLanguage();
  el.value=lang;
  el.disabled=!!locked;
  el.title=locked?`Final registry language locked: ${locked}. Copy as New Draft to change language.`:'Registry draft language';
};

setRegistryLanguage=function(v){
  const requested=v191NormalizeDraftLanguage(v);
  let d={};try{d=(typeof draftData==='function'?draftData():{});}catch(e){}
  const locked=v194FinalLanguageIfOpen(d);
  if(locked){
    localStorage.setItem('registryProLanguage',locked);
    v191SyncLanguageSelector({...d,draftLanguage:locked});
    toast(`Final Registry language locked: ${locked}. Language change ke liye Copy as New Draft use karein.`);
    return;
  }
  localStorage.setItem('registryProLanguage',requested);
  const el=document.getElementById('dashLanguage');if(el){el.disabled=false;el.value=requested;}
  if(requested==='English'){try{hideHindiSuggestions();}catch(e){}}
  try{v191SyncLanguageSelector({...d,draftLanguage:requested});}catch(e){}
  // If a draft is currently open, re-render it immediately in the selected language.
  try{if(v191RegistryViewActive())syncDraftPreview();}catch(e){console.warn('v1.9.4 language refresh',e);}
  toast(`Registry Draft Language: ${requested}`);
};

// The actual Hindi chooser is v14ShouldHindi (v1.4), not only shouldHindiAuto (v1.3).
const _v194V14ShouldHindiBase=v14ShouldHindi;
v14ShouldHindi=function(el){
  if(v194CurrentDraftLanguage()==='English')return false;
  return _v194V14ShouldHindiBase(el);
};
const _v194ShouldHindiAutoBase=shouldHindiAuto;
shouldHindiAuto=function(el){
  if(v194CurrentDraftLanguage()==='English')return false;
  return _v194ShouldHindiAutoBase(el);
};

// Keep selector synced when dashboard/new-registry views are opened.
const _v194ShowDashboardBase=showDashboard;
showDashboard=function(){
  _v194ShowDashboardBase();
  try{v191SyncLanguageSelector({});}catch(e){}
};
const _v194OpenNewRegistryBase=openNewRegistry;
openNewRegistry=function(){
  _v194OpenNewRegistryBase();
  try{v191SyncLanguageSelector({});}catch(e){}
};

// Catch native select changes even if older inline handlers or refresh code ran first.
document.addEventListener('change',e=>{
  if(e.target?.id!=='dashLanguage')return;
  const requested=v191NormalizeDraftLanguage(e.target.value);
  const d=(typeof draftData==='function'?draftData():{}),locked=v194FinalLanguageIfOpen(d);
  if(locked){e.target.value=locked;return;}
  localStorage.setItem('registryProLanguage',requested);
  e.target.value=requested;
  if(requested==='English'){try{hideHindiSuggestions();}catch(err){}}
},true);

document.addEventListener('DOMContentLoaded',()=>{
  try{
    if(!localStorage.getItem('registryProLanguage'))localStorage.setItem('registryProLanguage','English');
    v191SyncLanguageSelector({});
    console.info('Registry Pro v1.9.4 language selector + English typing fix loaded');
  }catch(e){console.warn('v1.9.4 init',e);}
});

/* ===== Registry Pro v1.10 CONSOLIDATED AGRICULTURE FINAL-LAYOUT FIX =====
   04-Sep-2026 — full-build consolidation on top of v1.9.4.
   Goals:
   - Website final preview/PDF and Word use the same persisted Hindi/English language.
   - Final approval explicitly locks the selected draft language.
   - Agriculture final output uses a deterministic 5-page base layout when stamp page is 1 or 2:
       summary + dedicated stamp-only page + legal/photos + property/payment + fingerprints/witnesses.
     Extra Seller/Buyer/Photo/Witness pages are created only when actual party count requires them.
   - Stamp page follows each Advocate's Default Stamp (Page 1 or Page 2) automatically.
   - Dynamic photo/fingerprint boxes: only actual parties, no fixed empty boxes.
   - English cleanup: boundary words, ownership basis, payment mode, advocate office and main-road text.
   - Agriculture Word export uses compact legal-document spacing so one visual deed page remains one Word page.
*/
const V110_VERSION='v1.10';

function v110CurrentLanguage(){
  return v191NormalizeDraftLanguage(localStorage.getItem('registryProLanguage')||'English');
}
function v110StoredDraft(d={}){try{return v19StoredDraftFor?.(d)||null;}catch(e){return null;}}
function v110FinalLanguage(d={}){
  const s=v110StoredDraft(d);
  if(s && (s.status==='Completed'||s.finalApproved===true) && s.draftLanguage){return v191NormalizeDraftLanguage(s.draftLanguage);}
  if(d?.draftLanguage && (d.status==='Completed'||d.finalApproved===true))return v191NormalizeDraftLanguage(d.draftLanguage);
  return v110CurrentLanguage();
}
// Final records without a legacy language no longer silently fall back to Hindi.
v191LanguageForDraft=function(d={}){
  const s=v110StoredDraft(d);
  if(s && (s.status==='Completed'||s.finalApproved===true) && s.draftLanguage)return v191NormalizeDraftLanguage(s.draftLanguage);
  return v110CurrentLanguage();
};

function v110PersistDraftRecord(saved){
  if(!saved?.registryNo)return saved;
  const arr=v14AllDrafts();const i=arr.findIndex(x=>x.registryNo===saved.registryNo);
  if(i>=0)arr[i]=saved;else arr.unshift(saved);v14SaveDrafts(arr);return saved;
}

// Explicit language lock at approval/checking-save time.
v18ApproveFinal=function(){
  if(!v19ValidateSaleAreas(true))return;
  v14EnsureRegistryNo();
  const lang=v110CurrentLanguage(),d=draftData(),w=v18CollectWarnings(d);
  if(w.length&&!confirm(`Checking Copy has ${w.length} warning(s). Advocate/user review ke baad Final approve karna hai?`))return;
  let saved=v18SaveStatus('Completed');saved.draftLanguage=lang;saved.finalApproved=true;saved.status='Completed';saved.checkingCopy=false;saved._workingDraft=false;
  v110PersistDraftRecord(saved);v14LastOpenedDraft=saved;v13LastCompletedDraft=saved;
  localStorage.setItem('registryProLanguage',lang);
  syncDraftPreview();toast(`Final Copy approved (${lang}): ${saved.registryNo}`);showSaveSuccessModal?.();
};
v18GenerateCheckingCopy=function(){
  if(!v19ValidateSaleAreas(true))return;
  v14EnsureRegistryNo();const lang=v110CurrentLanguage();let d=v18SaveStatus('Checking Copy');d.draftLanguage=lang;v110PersistDraftRecord(d);v14LastOpenedDraft=d;
  syncDraftPreview();toast(`2-page Checking Copy ${d.registryNo} saved (${lang}).`);goDraftStep(5);
};

function v110OwnershipEnglish(v){
  let s=String(v??'').trim();if(!s)return 'Transferable tenure holder (Bhumidhar with transferable rights)';
  if(/संक्रमणीय|transferable|sankram/i.test(s))return 'Transferable tenure holder (Bhumidhar with transferable rights)';
  if(/असंक्रमणीय|non.?transfer/i.test(s))return 'Non-transferable tenure holder';
  return /[\u0900-\u097F]/.test(s)?v192SmartEnglishRaw(s):s;
}
function v110BoundaryEnglish(v){
  let s=String(v??'').trim();if(!s)return '-';
  if(/[\u0900-\u097F]/.test(s))return v192SmartEnglishRaw(s);
  const rules=[
    [/^\s*khet\s+(.+)$/i,'Agricultural field of $1'],[/^\s*kheta\s+(.+)$/i,'Agricultural field of $1'],
    [/^\s*(rasta|raasta|rastha)\s*$/i,'Road'],[/^\s*(sadak|sarak)\s*$/i,'Road'],
    [/^\s*(makan|makaan)\s+(.+)$/i,'House of $2'],[/^\s*(makan|makaan)\s*$/i,'House'],
    [/^\s*nali\s*$/i,'Drain'],[/^\s*nahar\s*$/i,'Canal'],[/^\s*plot\s+(.+)$/i,'Plot of $1']
  ];
  for(const [re,to] of rules)if(re.test(s))return s.replace(re,to);
  return s;
}
function v110PaymentModeEnglish(v){
  let s=String(v??'').trim();if(!s)return 'Payment';
  if(/[\u0900-\u097F]/.test(s))s=v192SmartEnglishRaw(s);
  s=s.replace(/\bCash\s*\/\s*Cash\b/gi,'Cash').replace(/\bCheque\s*\/\s*Cheque\b/gi,'Cheque').replace(/\bRTGS\s*\/\s*RTGS\b/gi,'RTGS').replace(/\s+/g,' ').trim();
  return s;
}
function v110MainRoadEnglish(d){
  const raw=String(d.agri?.mainRoadDistance||'').trim();
  if(raw && !/^\[.*\]$/.test(raw))return /[\u0900-\u097F]/.test(raw)?v192SmartEnglishRaw(raw):raw;
  const cat=String(d.agri?.roadDistanceCategory||d.ruleEngine?.roadDistanceCategory||'').trim();
  if(cat==='0-50'||/0\s*[–-]\s*50/.test(cat))return '0–50 metres from the main road';
  if(cat==='51-200'||/51\s*[–-]\s*200/.test(cat))return '51–200 metres from the main road';
  if(cat==='200+'||/more than 200|200\+/.test(cat))return 'More than 200 metres from the main road';
  return 'Not specified';
}
function v110PhotoCertEnglish(d){
  const raw=String(d.agri?.photoCertifier||'').trim();
  if(raw)return /[\u0900-\u097F]/.test(raw)?v192SmartEnglishRaw(raw):raw;
  return `Buyer and witnesses identified before ${v192PartyExactOrEnglish(d.advocate?.name||'[Advocate]')}, Advocate`;
}

// Clean English payment rendering.
v191PaymentTableEn=function(d){
  const rows=(d.payments||[]).filter(x=>Number(x.amount)>0),total=rows.reduce((a,x)=>a+Number(x.amount||0),0);
  if(!rows.length)return '<div class="payment-deed-empty">Payment details not entered.</div>';
  return `<table class="payment-deed-table"><thead><tr><th>S.No.</th><th>Payment Mode</th><th>Amount</th><th>Cheque / RTGS / Ref. No.</th><th>Bank</th><th>Branch</th><th>Payment Date</th></tr></thead><tbody>${rows.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(v110PaymentModeEnglish(x.mode))}</td><td>${Math.round(Number(x.amount)||0).toLocaleString('en-IN')}</td><td>${esc(x.ref||'')}</td><td>${esc(v192SmartEnglishRaw(x.bank||''))}</td><td>${esc(v192SmartEnglishRaw(x.branch||''))}</td><td>${esc(x.date?formatDateDeed(x.date):'')}</td></tr>`).join('')}<tr class="payment-deed-total"><td>${rows.length+1}</td><td><b>Total</b></td><td><b>${Math.round(total).toLocaleString('en-IN')}</b></td><td colspan="4"></td></tr></tbody></table>`;
};
v191PaymentNarrativeEn=function(d){
  const rows=(d.payments||[]).filter(x=>Number(x.amount)>0);if(!rows.length)return 'The seller acknowledges receipt of the total consideration amount.';
  return rows.map(x=>{const mode=esc(v110PaymentModeEnglish(x.mode)),ref=x.ref?` Ref./UTR/Cheque No. ${esc(x.ref)}`:'',dt=x.date?` dated ${esc(formatDateDeed(x.date))}`:'',bank=x.bank?` through ${esc(v192SmartEnglishRaw(x.bank))}`:'',branch=x.branch?` ${esc(v192SmartEnglishRaw(x.branch))} Branch`:'';return `${v191MoneyEn(x.amount)} received by ${mode}${ref}${dt}${bank}${branch}`;}).join('; ');
};

function v110StampPageHtml(){return `<section class="deed-page v110-stamp-only stamp-selected-page" aria-label="Stamp Paper Page"></section>`;}
function v110PhotoItems(d,lang){
  const out=[];normalizePartyList(d.sellers,d.seller).forEach((p,i,a)=>out.push({type:lang==='English'?'Seller':'विक्रेता',p,i,total:a.length,cls:'photo-seller'}));normalizePartyList(d.buyers,d.buyer).forEach((p,i,a)=>out.push({type:lang==='English'?'Buyer':'क्रेता',p,i,total:a.length,cls:'photo-buyer'}));return out;
}
function v110PartyName(p,lang){return lang==='English'?v192PartyExactOrEnglish(p?.name||''):(relationName(p)||p?.name||'');}
function v110PhotoGridFromItems(items,lang){if(!items.length)return '';return `<div class="party-photo-section v110-photo-section"><b>${lang==='English'?'Seller / Buyer Photographs':'विक्रेता / क्रेता फोटो'}</b><div class="party-photo-grid v110-photo-grid" data-count="${items.length}">${items.map(x=>`<div class="party-photo-box ${x.cls}"><div class="photo-placeholder">PHOTO</div><strong>${esc(x.type)}${x.total>1?` ${x.i+1}`:''}</strong><small>${esc(v110PartyName(x.p,lang))}</small></div>`).join('')}</div></div>`;}
function v110ExtraPhotoPages(d,lang){const all=v110PhotoItems(d,lang),rest=all.slice(4),pages=[];for(let i=0;i<rest.length;i+=6){pages.push(`<section class="deed-page v110-photo-continuation"><h2 class="photo-page-title">${lang==='English'?'Seller / Buyer Photographs (Continued)':'विक्रेता / क्रेता फोटो (जारी)'}</h2>${v110PhotoGridFromItems(rest.slice(i,i+6),lang)}</section>`);}return pages.join('');}
function v110Witnesses(d){return v18AllWitnesses(d).filter(w=>w&&(w.name||w.mobile||w.id||w.idNo||w.address));}
function v110WitnessGrid(d,lang,wits=v110Witnesses(d)){if(!wits.length)return '';return `<div class="witness-box-grid v110-witness-grid">${wits.map((w,i)=>lang==='English'?v191WitnessBoxEn(w,`Witness ${i+1}`):v15WitnessBox(w,`साक्षी ${i+1}`)).join('')}</div>`;}
function v110FingerBlock(p,typeLabel,index,total,lang){
  const names=lang==='English'?['Thumb','Index','Middle','Ring','Little']:['अंगूठा','तर्जनी','मध्यमा','अनामिका','कनिष्ठिका'];
  const hand=t=>`<div class="finger-hand-block"><b class="finger-hand-title">${t}</b><div class="finger-print-box-row">${names.map(n=>`<div class="finger-print-box"><span>${n}</span></div>`).join('')}</div></div>`;
  const nm=v110PartyName(p,lang),title=`${typeLabel}${total>1?` ${index+1}`:''}${nm?` (${esc(nm)})`:''} — ${lang==='English'?'Finger impressions of both hands':'दोनों हाथ की अंगुलियों के निशान'}`;
  return `<div class="finger-block party-finger-person v110-finger-person"><b>${title}</b>${hand(lang==='English'?'Left Hand':'बायाँ हाथ / Left Hand')}${hand(lang==='English'?'Right Hand':'दायाँ हाथ / Right Hand')}${p?.biometricNote?`<p class="finger-note"><b>${lang==='English'?'Note':'नोट'}:</b> ${lang==='English'?esc(v192SmartEnglishRaw(p.biometricNote)):esc(p.biometricNote)}</p>`:''}</div>`;
}
function v110FingerprintPages(d,lang){
  const people=[];const sellers=normalizePartyList(d.sellers,d.seller),buyers=normalizePartyList(d.buyers,d.buyer);
  sellers.forEach((p,i)=>people.push({p,label:lang==='English'?'Seller':'विक्रेता',i,total:sellers.length}));buyers.forEach((p,i)=>people.push({p,label:lang==='English'?'Buyer':'क्रेता',i,total:buyers.length}));
  const wits=v110Witnesses(d),pages=[];
  if(!people.length)people.push({p:{},label:lang==='English'?'Seller / Buyer':'विक्रेता / क्रेता',i:0,total:1});
  for(let i=0;i<people.length;i+=2){const chunk=people.slice(i,i+2);const isLast=i+2>=people.length;let body=chunk.map(x=>v110FingerBlock(x.p,x.label,x.i,x.total,lang)).join('');if(isLast&&wits.length<=4)body+=v110WitnessGrid(d,lang,wits);if(isLast)body+=`<div class="deed-footer-lines v110-final-lines"><p>${lang==='English'?'Date of Execution':'तहरीर तारीख'} — <b>${esc(formatDateDeed(d.agri?.executionDate||d.executionDate))}</b></p><p>${lang==='English'?'Drafted By':'ड्राफ्टिडबाई'} — <b>${esc(lang==='English'?v192PartyExactOrEnglish(d.advocate?.name||d.ownerAdvocate||'[Advocate]'):(d.advocate?.name||d.ownerAdvocate||'[एडवोकेट]'))}</b>${lang==='English'?`, Advocate, ${esc(v193AdvocateOfficeEnglish(d.agri?.advocateOffice||'Court Roorkee, District Haridwar'))}.`:` एडवोकेट ${esc(d.agri?.advocateOffice||'कचहरी रुड़की, जिला हरिद्वार')}।`}</p></div>`;pages.push(`<section class="deed-page v110-fingerprint-page">${body}</section>`);}
  if(wits.length>4){for(let i=0;i<wits.length;i+=4)pages.push(`<section class="deed-page deed-page-witness-final v110-witness-page"><h2>${lang==='English'?'Witness Details':'साक्षी विवरण'}</h2>${v110WitnessGrid(d,lang,wits.slice(i,i+4))}</section>`);}
  return pages.join('');
}
function v110PlaceStamp(contentPages,stampPage){
  const pages=[...contentPages];if(stampPage===1)pages.splice(0,0,v110StampPageHtml());else if(stampPage===2)pages.splice(1,0,v110StampPageHtml());return pages.join('');
}

function v110RenderAgricultureEnglish(d){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;
  const sectionRaw=String(d.agri?.circleSection||'Semi-Urban'),section=sectionRaw.includes('अर्द्ध')?'Semi-Urban':sectionRaw.includes('ग्रामीण')?'Rural':sectionRaw.includes('नगरीय')?'Urban':v192SmartEnglishRaw(sectionRaw.replace(/.*-\s*/,''));
  const currentStamp=Math.max(0,(Number(d.stampDuty)||0)-(Number(d.agri?.agreementStampPaid)||0)),rateRs=circleAreaRateRupees(d),hasAssets=(d.agri?.treeBoringStatus&&d.agri.treeBoringStatus!=='नहीं')||d.agri?.landCondition==='बाग है';
  const sellers=normalizePartyList(d.sellers,d.seller),buyers=normalizePartyList(d.buyers,d.buyer),loc=v191LocationEn(d),prop=v191GroupedGataEn(d),payments=v191PaymentNarrativeEn(d),photoItems=v110PhotoItems(d,'English');
  const farmer=d.agri?.buyerFarmerStatus==='notfarmer'?'Immovable property exists from before 12/09/2003.':'The buyer is an agriculturist / belongs to an agriculturist family of Uttarakhand State.';
  const holding=d.agri?.buyerHoldingLimit==='above'?'The buyer, including this purchase, holds more than 12-1/2 acres of land.':'The buyer, including this purchase, does not hold more than 12-1/2 acres of land.';
  const sellerRemain=d.agri?.sellerRemainingShare==='yes'?'The seller retains a share/interest in the aforesaid Gata number(s).':'No share/interest of the seller remains in the aforesaid Gata number(s).';
  const possession=d.agri?.possessionGiven==='no'?'Possession of the sold land remains to be delivered at site.':'Possession of the sold land has been delivered to the buyer at the site.';
  const mutate=d.agri?.mutationSupport==='no'?'Mutation assistance, if any, shall be dealt with separately.':'The seller shall fully cooperate in mutation of the land in favour of the buyer.';
  const rateLine=`Rate List Page No. ${esc(d.agri?.circlePage||'-')}, Serial/Row No. ${esc(d.agri?.circleRow||'-')}, Column No. ${esc(d.circleRateColumn||'4')}, Circle Rate ${v191MoneyEn(rateRs)} per hectare; ${v191RoadSentenceEn(d)}.`;
  const stampPaid=d.agri?.agreementStampPaid?v191MoneyEn(d.agri.agreementStampPaid):'Nil';
  const p1=`<section class="deed-page deed-page-1 v110-summary-page"><h1>SALE DEED <span>(${esc(section)} Area)</span></h1><div class="deed-top-grid"><div>Sale Consideration — <b>${v191MoneyEn(d.transactionAmount)}</b></div><div>Market / Government Value — <b>${v191MoneyEn(d.plotValue)}</b></div><div>Stamp Duty — <b>${v191MoneyEn(d.stampDuty)}</b></div><div>Stamp Duty already paid on Agreement — <b>${stampPaid}</b></div><div>Stamp Duty paid presently — <b>${v191MoneyEn(currentStamp)}</b></div><div>Number of Stamp Sheets — <b>${esc(d.agri?.stampSheetCount||'')}</b></div></div><p>Total area of property sold — <b>${Number(d.agri?.totalAreaHa||0).toFixed(4)} hectare</b>; annual land revenue <b>${v191LaganEn(d.agri?.annualLagan)}</b>.</p><p>Description of property sold — <b>${hasAssets?'Agricultural land (with trees/boring or other recorded improvements)':'Agricultural land (without trees, boring or other such improvements)'}</b></p><p>Covered Area (if any construction exists) — <b>${esc(v192SmartEnglishRaw(d.agri?.coveredAreaText||'No'))}</b></p><p>Situated at — <b>${loc}.</b></p><p>Whether buyer/seller belongs to Scheduled Caste / Scheduled Tribe — <b>${esc(v191EnStatus(d.agri?.scstRelated||'No'))}</b></p><p>Basis of seller's ownership — <b>${esc(v110OwnershipEnglish(d.agri?.sellerOwnershipBasis))}</b></p><p>Whether land is leasehold etc. — <b>${esc(v191EnStatus(d.agri?.leaseLand||'No'))}</b></p><p>Whether consolidation proceedings are in progress — <b>${esc(v191EnStatus(d.agri?.consolidationStatus||'In progress'))}</b></p><p>Status of agricultural land — <b>${esc(v191EnStatus(d.agri?.landCondition||'Irrigated'))}</b></p><p><b>${rateLine}</b></p><p>Housing Development Fee area — <b>${esc(v191EnStatus(d.agri?.housingDevelopmentFee||'Not applicable'))}</b></p><p>Distance from Main Road — <b>${esc(v110MainRoadEnglish(d))}</b></p><p>Buyer agriculturist status — <b>${farmer}</b></p><p>Photograph / thumb impression certified by — <b>${esc(v110PhotoCertEnglish(d))}</b></p><p>Seller(s), parent/spouse name and address — <b>${v191PartiesEn(sellers,d.seller,'Seller')}</b></p></section>`;
  const p3=`<section class="deed-page deed-page-3 v110-legal-page"><p>Whereas the executant/seller is the lawful owner and person entitled to transfer the property described herein and, according to the documents and declarations produced, the property is stated to be free from undisclosed encumbrances, prohibitions, prior transfers, mortgages and loans with any department, bank, society or private person, except as specifically disclosed in this deed.</p><p>The seller represents that he/she is fully competent to sell and transfer the property described below and, while being of sound mind and acting voluntarily and without force or coercion, has sold and transferred the said property for a total consideration of <b>${v191MoneyEn(d.transactionAmount)}</b> in favour of <b>${v191PartiesEn(buyers,d.buyer,'Buyer')}</b>. The consideration has been paid/acknowledged in the manner recorded in this deed. Possession has been delivered or shall be dealt with as specifically stated herein. The seller and the seller's successors shall have no right, title or interest in the property sold except any obligation expressly preserved by law or by this deed. If any lawful defect in title causes the buyer to lose the whole or any part of the property, the parties shall have the remedies available under applicable law and the terms of this deed.</p><p class="center-clause">Accordingly, this Sale Deed has been executed as evidence of the transaction and for use whenever required.</p>${v110PhotoGridFromItems(photoItems.slice(0,4),'English')}</section>`;
  const p4=`<section class="deed-page deed-page-4 v110-property-payment-page"><p><b><u>DESCRIPTION OF PROPERTY SOLD —</u></b> <b>Agricultural land / transferable tenure holding, according to ${esc(v192SmartEnglishRaw(d.agri?.landRecordBasis||'the applicable land record'))}; ${prop}. Total area sold ${Number(d.agri?.totalAreaHa||0).toFixed(4)} hectare, annual land revenue ${v191LaganEn(d.agri?.annualLagan)}. Boundaries: East — ${esc(v110BoundaryEnglish(d.boundaries?.east))}; West — ${esc(v110BoundaryEnglish(d.boundaries?.west))}; North — ${esc(v110BoundaryEnglish(d.boundaries?.north))}; South — ${esc(v110BoundaryEnglish(d.boundaries?.south))}; situated at ${loc}.</b></p><p>${possession} ${mutate} <b>${holding} ${sellerRemain}</b> Latitude: <b>${esc(d.agri?.latitude||'-')}</b>; Longitude: <b>${esc(d.agri?.longitude||'-')}</b>. The seller and buyer are acquainted with each other and this deed has been drafted on the basis of the documents and particulars supplied by them.</p><div class="payment-deed-section"><p><b><u>DETAILS OF RECEIPT OF SALE CONSIDERATION —</u></b> Out of the total consideration of <b>${v191MoneyEn(d.transactionAmount)}</b>, the following payments have been received/acknowledged:</p>${v191PaymentTableEn(d)}<p>${payments}. After the above payments, no amount remains due from the buyer to the seller, subject to verification of the entered payment details.</p></div></section>`;
  const pages=[p1,p3,v110ExtraPhotoPages(d,'English'),p4,v110FingerprintPages(d,'English')].filter(Boolean);legal.innerHTML=`<div class="deed-document hindi-deed v191-english-agri v110-agri-final">${v110PlaceStamp(pages,selectedStampPage())}</div>`;
}

function v110RenderAgricultureHindi(d){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return;
  const section=(d.agri?.circleSection||'भगवानपुर - अर्द्धनगरीय').replace(/\s*-\s*/g,' '),currentStamp=Math.max(0,(Number(d.stampDuty)||0)-(Number(d.agri?.agreementStampPaid)||0)),rateRs=circleAreaRateRupees(d),hasAssets=(d.agri?.treeBoringStatus&&d.agri.treeBoringStatus!=='नहीं')||d.agri?.landCondition==='बाग है';
  const sellers=normalizePartyList(d.sellers,d.seller),buyers=normalizePartyList(d.buyers,d.buyer),loc=locationFull(d),prop=groupedGataNarrative(d),photoItems=v110PhotoItems(d,'Hindi'),payments=paymentNarrative(d);
  const farmer=d.agri?.buyerFarmerStatus==='notfarmer'?'12/09/2003 से पहले अचल सम्पत्ति है।':'क्रेता उत्तराखण्ड राज्य का कृषक/कृषक परिवार से है।',holding=d.agri?.buyerHoldingLimit==='above'?'क्रेता के पास इस खरीदी गयी भूमि सहित 12-1/2 एकड़ से अधिक भूमि है।':'क्रेता के पास इस खरीदी गयी भूमि सहित 12-1/2 एकड़ से अधिक भूमि नहीं है।',sellerRemain=d.agri?.sellerRemainingShare==='yes'?'विक्रेता का उक्त गाटा नम्बरान में अंश/हिस्सा शेष है।':'विक्रेता का उक्त गाटा नम्बरान में कोई अंश व हिस्सा शेष नहीं रहा है।',possession=d.agri?.possessionGiven==='no'?'विक्रित भूमि का कब्जा मौके पर दिया जाना शेष है।':'विक्रित भूमि पर मौके पर क्रेता का कब्जा करा दिया है',mutate=d.agri?.mutationSupport==='no'?'दाखिल खारिज में सहयोग सम्बन्धी विवरण पृथक होगा।':'विक्रेता क्रेता के नाम दाखिल खारिज होने में पूरा पूरा सहयोग करेगा।';
  const p1=`<section class="deed-page deed-page-1 v110-summary-page"><h1>विक्रय- पत्र<span>(${esc(section)} क्षेत्र)</span></h1><div class="deed-top-grid"><div>बैनामा- <b>${formatDeedMoney(d.transactionAmount)}</b></div><div>बाजारी मालियत- <b>${formatDeedMoney(d.plotValue)}</b></div><div>स्टाम्प शुल्क- <b>${formatDeedMoney(d.stampDuty)}</b></div><div>इकरारनामे में अदा स्टाम्प शुल्क- <b>${d.agri?.agreementStampPaid?formatDeedMoney(d.agri.agreementStampPaid):'शून्य'}</b></div><div>वर्तमान में दिया गया स्टाम्प शुल्क- <b>${formatDeedMoney(currentStamp)}</b></div><div>स्टाम्प शीटों की संख्या- <b>${esc(d.agri?.stampSheetCount||'')}</b></div></div><p>विक्रित सम्पत्ति का कुल क्षेत्रफल- <b>${Number(d.agri?.totalAreaHa||0).toFixed(4)} हेक्टेयर</b> लगान <b>${laganText(d.agri?.annualLagan)} सालाना</b></p><p>विक्रित सम्पत्ति का विवरण- <b>${hasAssets?'कृषि भूमि (जिसमें पेड़/बोरिंग आदि हैं)':'कृषि भूमि (जिसमें कोई पेड़ बोरिंग आदि नहीं है)'}</b></p><p>कवर्ड एरिया (यदि निर्माण है तो)- <b>${esc(d.agri?.coveredAreaText||'नहीं')}</b></p><p>स्थित ग्राम:- <b>${loc}।</b></p><p>क्रेता तथा विक्रेता अनुसूचित जाति अथवा जनजाति से सम्बन्धित है अथवा नहीं:- <b>${esc(d.agri?.scstRelated||'नहीं')}</b></p><p>विक्रेता का स्वामित्व का आधार:- <b>${esc(d.agri?.sellerOwnershipBasis||'द्वारा संक्रमणीय भूमिधर')}</b></p><p>भूमि पट्टे आदि की है अथवा नहीं:- <b>${esc(d.agri?.leaseLand||'नहीं')}</b></p><p>चकबन्दी चल रही है अथवा नहीं:- <b>${esc(d.agri?.consolidationStatus||'चल रही है')}</b></p><p>कृषि भूमि की स्थिति में:- <b>${esc(d.agri?.landCondition||'सिंचित है')}</b></p><p><b>रेट लिस्ट में पृष्ठ संख्या-${esc(d.agri?.circlePage||'-')} क्रमांक-${esc(d.agri?.circleRow||'-')} कालम संख्या-${esc(d.circleRateColumn||'4')} सर्किल रेट ${formatDeedMoney(rateRs)} प्रति हेक्टेयर ${roadDeedSentence(d)}</b></p><p>आवास विकास शुल्क के अन्दर है अथवा बाहर:- <b>${esc(d.agri?.housingDevelopmentFee||'लागू नहीं')}</b></p><p>मुख्य सड़क से दूरी- <b>${esc(d.agri?.mainRoadDistance||d.agri?.roadDistanceCategory||'-')}</b></p><p>क्या क्रेता उत्तरांचल का कृषक है अथवा नहीं:- <b>${farmer}</b></p><p>फोटो व अंगूठा चिन्ह प्रमाणित कर्ता:- <b>${esc(d.agri?.photoCertifier||`क्रेता व गवाहान के आधार पर ${d.advocate?.name||'[एडवोकेट]'} एडवोकेट रुड़की`)}</b></p><p>विक्रेता/विक्रेताओं का नाम, पिता/पति का नाम व पता:- <b>${partiesPersonLines(sellers,'विक्रेता')}</b></p></section>`;
  const p3=`<section class="deed-page deed-page-3 v110-legal-page"><p>विदित हो कि प्रतिज्ञ (विक्रेता) निम्नलिखित सम्पत्ति के स्वामी व अधिकारी है जो इस समय तक हर प्रकार के भार तथा प्रतिबन्ध आदि से मुक्त है किसी प्रकार के हस्तान्तरण तथा बन्धक आदि नहीं है और कोई ऋण आदि महकमें बैंक सोसायटी आदि से या व्यक्तिगत रूप से निम्नलिखित सम्पत्ति को बन्धक करके लिया हुआ नहीं है और निम्नलिखित सम्पत्ति को विक्रय व हस्तान्तरित करने में प्रतिज्ञ पूर्ण रूप सक्षम है।</p><p>अतः प्रतिज्ञ ने अपनी मनबुद्धि तथा इन्द्रियों की स्वस्थ दशा में बिना किसी जोर व दबाव के निम्नलिखित सम्पत्ति को बदले <b>${formatDeedMoney(d.transactionAmount)}</b> में <b>${partiesPersonLines(buyers,'क्रेता')}</b> को विक्रय व हस्तान्तरित कर दी है तथा कुल मूल्य राशि की प्राप्ति का ब्यौरा निम्नलिखित है। कब्जा व दखल क्रेता महोदय का मौके पर करा दिया है और प्रतिज्ञ तथा उसके उत्तराधिकारी का विक्रय की हुई सम्पत्ति से कोई सम्बन्ध नहीं रहेगा। यदि बाद में किसी कानूनी दोष के कारण क्रेता को सम्पत्ति का कुल या अंश नुकसान होता है तो लागू कानून व इस विक्रय-पत्र की शर्तों के अनुसार उपचार उपलब्ध रहेगा।</p><p class="center-clause">अतः यह विक्रय पत्र लिख दिया है कि प्रमाण रहे और समय पर काम आवे।</p>${v110PhotoGridFromItems(photoItems.slice(0,4),'Hindi')}</section>`;
  const p4=`<section class="deed-page deed-page-4 v110-property-payment-page"><p><b><u>विवरण सम्पत्ति जो विक्रय की गई है-</u></b> <b>कृषि भूमि संक्रमणीय भूमिधरी जोत ${esc(d.agri?.landRecordBasis||'चकबन्दी आकार पत्र 23 भाग 1 के अनुसार')} ${prop} इस प्रकार कुल विक्रित रकबा ${Number(d.agri?.totalAreaHa||0).toFixed(4)} हेक्टेयर लगान ${laganText(d.agri?.annualLagan)} सालाना जिसकी सीमा, पूरब में ${esc(d.boundaries?.east||'-')}, पश्चिम में ${esc(d.boundaries?.west||'-')}, उत्तर में ${esc(d.boundaries?.north||'-')}, दक्षिण में ${esc(d.boundaries?.south||'-')} स्थित ${loc}।</b></p><p>${esc(possession)} तथा ${esc(mutate)} <b>${esc(holding)} ${esc(sellerRemain)}</b> सम्पत्ति का अक्षांश <b>${esc(d.agri?.latitude||'-')}</b> है तथा सम्पत्ति का देशान्तर <b>${esc(d.agri?.longitude||'-')}</b> है। विक्रेता एवं क्रेता एक दूसरे से परिचित है तथा उपलब्ध कराये कागजात के अनुसार बैनामा ड्राफ्ट किया गया है।</p><div class="payment-deed-section"><p><b><u>विवरण विक्रय धनराशि प्राप्ति-</u></b> विक्रेता ने क्रेता से कुल मूल्य राशि अंकन <b>${formatDeedMoney(d.transactionAmount)}</b> में से निम्न भुगतान प्राप्त/स्वीकार किये:</p>${v15PaymentTableHtml(d)}<p>${payments}, विक्रेता की कोई धनराशि क्रेता के जिम्मे शेष नहीं रही है।</p></div></section>`;
  const pages=[p1,p3,v110ExtraPhotoPages(d,'Hindi'),p4,v110FingerprintPages(d,'Hindi')].filter(Boolean);legal.innerHTML=`<div class="deed-document hindi-deed v110-agri-final">${v110PlaceStamp(pages,selectedStampPage())}</div>`;
}

function v110ApplyAgricultureChrome(d){
  const legal=document.getElementById('legalDraftPreview'),doc=legal?.querySelector('.v110-agri-final');if(!doc)return;
  const pages=[...doc.querySelectorAll(':scope > .deed-page')];pages.forEach((page,i)=>{
    page.querySelectorAll(':scope > .registry-page-footer,:scope > .stamp-reserve').forEach(x=>x.remove());page.classList.remove('stamp-normal-page');
    if(page.classList.contains('v110-stamp-only')){page.classList.add('stamp-selected-page');return;}
    page.classList.remove('stamp-selected-page');const f=document.createElement('div');f.className='registry-page-footer';f.innerHTML=`<span>Advocate: <b>${esc(d.advocate?.name||d.ownerAdvocate||'-')}</b></span><span class="registry-footer-center"><strong>Registry Pro</strong><small>Registry No.: ${esc(d.registryNo||v14ActiveRegistryNo||'-')}</small></span><span>Page ${i+1}/${pages.length}</span>`;page.appendChild(f);
  });
}

// Final renderer: Website preview, browser PDF and Word all consume the same DOM and saved language.
const _v110SyncDraftPreviewBase=syncDraftPreview;
syncDraftPreview=function(){
  _v110SyncDraftPreviewBase();
  try{
    if(!isAgricultureMode())return;
    let d=draftData(),stored=v110StoredDraft(d);if(stored)d={...d,...stored,agri:{...(d.agri||{}),...(stored.agri||{})}};
    const final=v19IsFinal(d),lang=v110FinalLanguage(d);d.draftLanguage=lang;
    if(final){if(lang==='English')v110RenderAgricultureEnglish(d);else v110RenderAgricultureHindi(d);v110ApplyAgricultureChrome(d);v18ApplyCopyState(d);v191SyncLanguageSelector({...d,draftLanguage:lang});}
  }catch(e){console.error('v1.10 Agriculture consolidated final render',e);}
};

// Compact, matching Word pagination for Agriculture final output only.
let v110WordCompactMode=false;
const _v110ElementBlocksBase=v15ElementBlocks,_v110SectionPrBase=v15SectionPr;
v15ElementBlocks=function(el){
  if(!v110WordCompactMode)return _v110ElementBlocksBase(el);
  if(!el)return '';
  if(el.classList?.contains('registry-page-footer')||el.classList?.contains('v110-stamp-only'))return '';
  if(el.tagName==='TABLE')return v15TableWord(el);
  if(el.classList?.contains('party-finger-person'))return v15FingerWord(el);
  if(el.classList?.contains('party-photo-section'))return v15PhotoWord(el);
  if(el.classList?.contains('witness-box-grid'))return v15WitnessWord(el);
  if(el.classList?.contains('payment-deed-section')||el.classList?.contains('deed-footer-lines'))return [...el.children].map(v15ElementBlocks).join('');
  if(/^H[12]$/.test(el.tagName))return v15PFromNode(el,{center:true,bold:true,underline:el.tagName==='H1',size:el.tagName==='H1'?25:22,after:55});
  if(el.tagName==='P')return v15PFromNode(el,{center:el.classList.contains('center-clause'),size:el.classList.contains('deed-small')?17:20,after:26});
  if(el.tagName==='DIV')return [...el.children].map(v15ElementBlocks).join('');
  return '';
};
v15SectionPr=function(withBorder=true){
  if(!v110WordCompactMode)return _v110SectionPrBase(withBorder);
  const pb=withBorder?'<w:pgBorders w:offsetFrom="page" w:display="allPages"><w:top w:val="double" w:sz="10" w:space="16" w:color="2F8F5B"/><w:left w:val="double" w:sz="10" w:space="16" w:color="2F8F5B"/><w:bottom w:val="double" w:sz="10" w:space="16" w:color="2F8F5B"/><w:right w:val="double" w:sz="10" w:space="16" w:color="2F8F5B"/></w:pgBorders>':'';
  return `<w:sectPr><w:type w:val="nextPage"/><w:footerReference w:type="default" r:id="rId1"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="720" w:right="820" w:bottom="900" w:left="820" w:header="300" w:footer="420" w:gutter="0"/>${pb}</w:sectPr>`;
};
const _v110DocxPartsBase=v14DocxParts;
v14DocxParts=function(root,d,title='Registry Pro'){
  const old=v110WordCompactMode;v110WordCompactMode=!!(isAgricultureMode()&&root?.querySelector?.('.v110-agri-final'));
  try{return _v110DocxPartsBase(root,d,title);}finally{v110WordCompactMode=old;}
};

// Keep PDF/Word export synchronized with final stored language before export.
openCurrentDraftWord=function(){
  syncDraftPreview();const legal=document.getElementById('legalDraftPreview');if(!legal){toast('Preview not ready');return;}
  let d=draftData(),stored=v110StoredDraft(d);if(stored)d={...d,...stored};if(!d.registryNo)d.registryNo=v14ActiveRegistryNo||v14EnsureRegistryNo();
  downloadDocxFromElement(legal,d,`Registry_Pro_${safeFilePart(d.registryNo)}_${v19IsFinal(d)?'FINAL':'CHECKING'}.docx`);closeSaveSuccessModal();toast(v19IsFinal(d)?`Final ${v110FinalLanguage(d)} Word downloaded`:'2-page Checking Copy Word downloaded');
};
saveCurrentDraftPdf=function(){closeSaveSuccessModal();goDraftStep(5);syncDraftPreview();setTimeout(()=>window.print(),120);};

document.addEventListener('DOMContentLoaded',()=>{
  try{const t=document.querySelector('title');if(t)t.textContent='Registry Pro v1.10 Consolidated';v191SyncLanguageSelector({});console.info('Registry Pro v1.10 consolidated full build loaded');}catch(e){console.warn('v1.10 init',e);}
});

/* ===== Registry Pro v1.11 ONE-PASS AGRICULTURE OUTPUT FIX =====
   04-Sep-2026
   - Agriculture preview no longer calls the older delayed renderer, so a later Hindi render
     cannot overwrite an English Final preview.
   - Checking Copy is always a dedicated two-page review document (no stamp-only page).
   - Final Copy uses the consolidated dynamic layout: normal 1 Seller + 1 Buyer = 5 pages
     including the Advocate's Page-1/Page-2 stamp sheet; extra parties add pages only as needed.
   - Website preview, browser PDF and Word all export the exact same rendered DOM/language.
   - Boundary entry stays Hindi-friendly even when Final language is English; English final
     output converts common boundary descriptions semantically.
   - Payment bank dropdown includes an explicit manual-bank option.
*/
const V111_VERSION='v1.11';
const V111_BOUNDARY_IDS=['boundaryEast','boundaryWest','boundaryNorth','boundarySouth'];
const V111_BOUNDARY_DIR={boundaryEast:'east',boundaryWest:'west',boundaryNorth:'north',boundarySouth:'south'};

function v111IsBoundaryEl(el){return !!el&&V111_BOUNDARY_IDS.includes(el.id);}
function v111ActiveRegistryNo(live={}){return live.registryNo||v14ActiveRegistryNo||v14LastOpenedDraft?.registryNo||'';}
function v111StoredByNo(no){return no?(v14AllDrafts?.()||[]).find(x=>x.registryNo===no):null;}
function v111LiveDraft(){let d=draftData();if(!d.registryNo&&v14ActiveRegistryNo)d.registryNo=v14ActiveRegistryNo;return d;}
function v111ResolveDraft(){
  const live=v111LiveDraft(),no=v111ActiveRegistryNo(live),stored=v111StoredByNo(no);
  if(!stored)return live;
  const isFinal=stored.status==='Completed'||stored.finalApproved===true;
  if(isFinal)return {...live,...stored,registryNo:no,agri:{...(live.agri||{}),...(stored.agri||{})},boundaries:{...(live.boundaries||{}),...(stored.boundaries||{})},boundaryRoman:{...(live.boundaryRoman||{}),...(stored.boundaryRoman||{})}};
  return {...live,registryNo:no,status:stored.status||live.status,finalApproved:stored.finalApproved===true,checkingCopy:stored.checkingCopy===true,draftLanguage:stored.draftLanguage||live.draftLanguage};
}
function v111IsFinal(d={}){const no=v111ActiveRegistryNo(d),s=v111StoredByNo(no);return s?.status==='Completed'||s?.finalApproved===true||d.status==='Completed'||d.finalApproved===true;}
function v111SelectedLanguage(){
  const el=document.getElementById('dashLanguage'),v=el?.value;
  if(v==='Hindi'||v==='English')return v;
  return v191NormalizeDraftLanguage(localStorage.getItem('registryProLanguage')||'English');
}
function v111Language(d={}){
  const s=v111StoredByNo(v111ActiveRegistryNo(d));
  if((s?.status==='Completed'||s?.finalApproved===true)&&s?.draftLanguage)return v191NormalizeDraftLanguage(s.draftLanguage);
  if((d.status==='Completed'||d.finalApproved===true)&&d.draftLanguage)return v191NormalizeDraftLanguage(d.draftLanguage);
  return v111SelectedLanguage();
}
function v111Persist(saved){
  if(!saved?.registryNo)return saved;const arr=v14AllDrafts(),i=arr.findIndex(x=>x.registryNo===saved.registryNo);if(i>=0)arr[i]=saved;else arr.unshift(saved);v14SaveDrafts(arr);return saved;
}
function v111SyncLanguageSelector(d={}){
  const el=document.getElementById('dashLanguage');if(!el)return;
  [...el.options].filter(o=>!['Hindi','English'].includes(o.value)).forEach(o=>o.remove());
  if(![...el.options].some(o=>o.value==='English'))el.add(new Option('English','English'));
  if(![...el.options].some(o=>o.value==='Hindi'))el.add(new Option('Hindi','Hindi'));
  const final=v191RegistryViewActive()&&v111IsFinal(d),lang=v111Language(d);el.value=lang;el.disabled=!!final;
  el.title=final?`Final registry language locked: ${lang}`:'Registry draft language (Dashboard stays Hinglish)';
}
setRegistryLanguage=function(v){
  const requested=v191NormalizeDraftLanguage(v),d=v111ResolveDraft();
  if(v191RegistryViewActive()&&v111IsFinal(d)){
    const locked=v111Language(d);localStorage.setItem('registryProLanguage',locked);v111SyncLanguageSelector(d);toast(`Final Registry language locked: ${locked}. Copy as New Draft to change language.`);return;
  }
  localStorage.setItem('registryProLanguage',requested);const el=document.getElementById('dashLanguage');if(el){el.value=requested;el.disabled=false;}
  if(requested==='English')try{hideHindiSuggestions();}catch(e){}
  try{syncDraftPreview();}catch(e){console.warn('v1.11 language refresh',e)}
  toast(`Registry Draft Language: ${requested}`);
};
openLanguageHome=function(){const cur=v111SelectedLanguage();openSimpleManagement('Registry Draft Language',`<div class="card"><h3>Draft / Registry Language</h3><p class="hint">Dashboard Hinglish hi rahega. Sirf Checking/Final Registry output language badlegi.</p><div class="form-grid two"><button class="btn ${cur==='English'?'primary':'outline'}" onclick="setRegistryLanguage('English');openLanguageHome()">English</button><button class="btn ${cur==='Hindi'?'primary':'outline'}" onclick="setRegistryLanguage('Hindi');openLanguageHome()">हिंदी</button></div></div>`);};

// Boundary fields: type Roman-English, field auto-converts to Hindi. Other English-mode party fields remain English.
try{Object.assign(V13_HINDI_WORDS,{makan:'मकान',makaan:'मकान',sadak:'सड़क',sarak:'सड़क',nali:'नाली',nahar:'नहर',canal:'नहर',plot:'प्लॉट',passage:'रास्ता'});}catch(e){}
const _v111V14ShouldHindiBase=v14ShouldHindi;
v14ShouldHindi=function(el){if(v111IsBoundaryEl(el))return false;return _v111V14ShouldHindiBase(el);};
const _v111ShouldHindiAutoBase=shouldHindiAuto;
shouldHindiAuto=function(el){if(v111IsBoundaryEl(el))return true;return _v111ShouldHindiAutoBase(el);};

function v111BoundaryRomanTracker(el){
  if(!v111IsBoundaryEl(el))return;
  let committed=(el.dataset.romanCommitted||'').trim(),current='';const value=String(el.value||'');
  const done=value.match(/([A-Za-z]+)[\s,.;:!?-]+$/),tail=value.match(/([A-Za-z]+)$/);
  if(done){const token=done[1];const a=committed?committed.split(/\s+/):[];if(a[a.length-1]?.toLowerCase()!==token.toLowerCase())committed=(committed+' '+token).trim();el.dataset.romanCommitted=committed;}
  else if(tail)current=tail[1];
  el.dataset.romanSource=(committed+(current?' '+current:'')).trim();
}
document.addEventListener('input',e=>{if(v111IsBoundaryEl(e.target))v111BoundaryRomanTracker(e.target);},true);

const _v111DraftDataBase=draftData;
draftData=function(){
  const d=_v111DraftDataBase();d.templateVersion=V111_VERSION;d.boundaryRoman=d.boundaryRoman||{};
  V111_BOUNDARY_IDS.forEach(id=>{const el=document.getElementById(id),dir=V111_BOUNDARY_DIR[id];if(el&&el.dataset.romanSource)d.boundaryRoman[dir]=el.dataset.romanSource;});
  return d;
};
const _v111LoadDraftFieldsBase=v14LoadDraftFields;
v14LoadDraftFields=function(d){const out=_v111LoadDraftFieldsBase(d);setTimeout(()=>{V111_BOUNDARY_IDS.forEach(id=>{const el=document.getElementById(id),dir=V111_BOUNDARY_DIR[id];if(el&&d?.boundaryRoman?.[dir]){el.dataset.romanSource=d.boundaryRoman[dir];el.dataset.romanCommitted=d.boundaryRoman[dir];}});},0);return out;};

function v111CapWords(s){return String(s||'').trim().replace(/\b[a-z]/g,m=>m.toUpperCase());}
function v111BoundaryEnglishRoman(s){
  s=String(s||'').trim();if(!s)return '-';
  let m;
  if((m=s.match(/^\s*(khet|field)\s+(.+)$/i)))return `Agricultural field of ${v111CapWords(m[2])}`;
  if((m=s.match(/^\s*(makan|makaan|house)\s+(.+)$/i)))return `House of ${v111CapWords(m[2])}`;
  if((m=s.match(/^\s*plot\s+(.+)$/i)))return `Plot of ${v111CapWords(m[1])}`;
  if(/^\s*(rasta|raasta|rastha|road|sadak|sarak|passage)\s*$/i.test(s))return 'Road / Passage';
  if(/^\s*(nali|drain)\s*$/i.test(s))return 'Drain';
  if(/^\s*(nahar|canal)\s*$/i.test(s))return 'Canal';
  if(/^\s*(khet|field)\s*$/i.test(s))return 'Agricultural field';
  if(/^\s*(makan|makaan|house)\s*$/i.test(s))return 'House';
  return v111CapWords(s);
}
function v111DevNameRoman(s){let r=v191DevToRoman(String(s||''));return r.split(/\s+/).map(w=>w.replace(/a$/i,'')).join(' ');}
function v111BoundaryEnglishValue(d,dir){
  const roman=String(d.boundaryRoman?.[dir]||'').trim();if(roman)return v111BoundaryEnglishRoman(roman);
  const raw=String(d.boundaries?.[dir]||'').trim();if(!raw)return '-';
  let m;
  if((m=raw.match(/^\s*खेत\s*(.*)$/)))return m[1]?`Agricultural field of ${v111CapWords(v111DevNameRoman(m[1]))}`:'Agricultural field';
  if((m=raw.match(/^\s*मकान\s*(.*)$/)))return m[1]?`House of ${v111CapWords(v111DevNameRoman(m[1]))}`:'House';
  if((m=raw.match(/^\s*प्लॉट\s*(.*)$/)))return m[1]?`Plot of ${v111CapWords(v111DevNameRoman(m[1]))}`:'Plot';
  if(/^(रास्ता|रोड|सड़क)$/.test(raw))return 'Road / Passage';if(/^नाली$/.test(raw))return 'Drain';if(/^नहर$/.test(raw))return 'Canal';
  if(/[\u0900-\u097F]/.test(raw))return v111CapWords(v111DevNameRoman(raw));return v111BoundaryEnglishRoman(raw);
}
function v111BoundaryHindiValue(d,dir){const raw=String(d.boundaries?.[dir]||'').trim();return /[A-Za-z]/.test(raw)?transliterateTextLocal(raw):raw||'-';}
function v111RenderDraftForLanguage(d,lang){
  const clone=JSON.parse(JSON.stringify(d||{}));clone.boundaries=clone.boundaries||{};
  for(const dir of ['east','west','north','south'])clone.boundaries[dir]=lang==='English'?v111BoundaryEnglishValue(d,dir):v111BoundaryHindiValue(d,dir);
  if(lang==='English')v110RenderAgricultureEnglish(clone);else v110RenderAgricultureHindi(clone);
  return clone;
}

function v111CheckingHtml(d,lang){
  const en=lang==='English',warnings=v18CollectWarnings(d),sellers=normalizePartyList(d.sellers,d.seller),buyers=normalizePartyList(d.buyers,d.buyer),gata=d.agri?.gataRows||[],pay=(d.payments||[]).filter(x=>Number(x.amount)>0),payTotal=pay.reduce((s,x)=>s+Number(x.amount||0),0),wits=v110Witnesses(d);
  const partyRows=[...sellers.map((p,i)=>`<tr><td>${en?'Seller':'विक्रेता'} ${i+1}</td><td>${en?v191En(p.name||'-'):esc(relationName(p)||p.name||'-')}</td><td>${esc(p.mobile||'-')}</td><td>${esc(p.idNo||p.aadhaar||p.pan||'-')}</td><td>${en?v191En(p.address||'-'):esc(p.address||'-')}</td></tr>`),...buyers.map((p,i)=>`<tr><td>${en?'Buyer':'क्रेता'} ${i+1}</td><td>${en?v191En(p.name||'-'):esc(relationName(p)||p.name||'-')}</td><td>${esc(p.mobile||'-')}</td><td>${esc(p.idNo||p.aadhaar||p.pan||'-')}</td><td>${en?v191En(p.address||'-'):esc(p.address||'-')}</td></tr>`)].join('');
  const gataRows=gata.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.chak||'-')}</td><td>${esc(x.gata||'-')}</td><td>${Number(x.totalArea||0).toFixed(4)}</td><td>${Number((x.soldArea??x.area)||0).toFixed(4)}</td></tr>`).join('');
  const b={east:en?v111BoundaryEnglishValue(d,'east'):v111BoundaryHindiValue(d,'east'),west:en?v111BoundaryEnglishValue(d,'west'):v111BoundaryHindiValue(d,'west'),north:en?v111BoundaryEnglishValue(d,'north'):v111BoundaryHindiValue(d,'north'),south:en?v111BoundaryEnglishValue(d,'south'):v111BoundaryHindiValue(d,'south')};
  const page1=en?`<section class="deed-page v111-check-page"><h1>CHECKING COPY</h1><p class="center-clause"><b>Agriculture Land Sale Deed</b> • Registry No. ${esc(d.registryNo||v14ActiveRegistryNo||'-')}</p><div class="v19-check-summary"><p><b>Village:</b> ${v191En(d.village||'-')} &nbsp; <b>Sold Area:</b> ${Number(d.agri?.totalAreaHa||0).toFixed(4)} ha</p><p><b>Khata:</b> ${v191En(d.khataNo||'-')} &nbsp; <b>Khasra/Gata:</b> ${v191En(v19KhasraText(d))}</p><p><b>Circle Rate:</b> ${v191En(d.rateRef||'-')} &nbsp; <b>Government Value:</b> ${inr(d.plotValue||0)}</p><p><b>Transaction:</b> ${inr(d.transactionAmount||0)} &nbsp; <b>Stamp Duty:</b> ${inr(d.stampDuty||0)}</p><p><b>Main Road:</b> ${esc(v110MainRoadEnglish(d))} &nbsp; <b>Area Category:</b> ${v191En(d.ruleEngine?.settlementCategory||'-')}</p><p><b>Coordinates:</b> ${esc(d.agri?.latitude||'-')}, ${esc(d.agri?.longitude||'-')}</p><p><b>Boundaries:</b> East — ${esc(b.east)}; West — ${esc(b.west)}; North — ${esc(b.north)}; South — ${esc(b.south)}.</p></div><h2>Seller / Buyer</h2><table class="payment-deed-table v111-party-table"><thead><tr><th>Party</th><th>Name</th><th>Mobile</th><th>ID</th><th>Address</th></tr></thead><tbody>${partyRows||'<tr><td colspan="5">Party details pending</td></tr>'}</tbody></table><h2>Chak / Gata / Rakba</h2><table class="payment-deed-table"><thead><tr><th>#</th><th>Chak</th><th>Khasra/Gata</th><th>Total Ha</th><th>Sale Ha</th></tr></thead><tbody>${gataRows||'<tr><td colspan="5">No Gata rows</td></tr>'}</tbody></table></section>`:`<section class="deed-page v111-check-page"><h1>जाँच प्रति / CHECKING COPY</h1><p class="center-clause"><b>कृषि भूमि विक्रय-पत्र</b> • रजिस्ट्री नं. ${esc(d.registryNo||v14ActiveRegistryNo||'-')}</p><div class="v19-check-summary"><p><b>ग्राम:</b> ${esc(d.village||'-')} &nbsp; <b>विक्रित रकबा:</b> ${Number(d.agri?.totalAreaHa||0).toFixed(4)} हे.</p><p><b>खाता:</b> ${esc(d.khataNo||'-')} &nbsp; <b>खसरा/गाटा:</b> ${esc(v19KhasraText(d))}</p><p><b>सर्किल रेट:</b> ${esc(d.rateRef||'-')} &nbsp; <b>बाजारी/सरकारी मालियत:</b> ${inr(d.plotValue||0)}</p><p><b>कुल लेन-देन:</b> ${inr(d.transactionAmount||0)} &nbsp; <b>स्टाम्प शुल्क:</b> ${inr(d.stampDuty||0)}</p><p><b>मुख्य सड़क दूरी:</b> ${esc(d.agri?.roadDistanceCategory||d.agri?.mainRoadDistance||'-')} &nbsp; <b>क्षेत्र श्रेणी:</b> ${esc(d.ruleEngine?.settlementCategory||'-')}</p><p><b>अक्षांश/देशान्तर:</b> ${esc(d.agri?.latitude||'-')}, ${esc(d.agri?.longitude||'-')}</p><p><b>सीमायें:</b> पूरब — ${esc(b.east)}; पश्चिम — ${esc(b.west)}; उत्तर — ${esc(b.north)}; दक्षिण — ${esc(b.south)}।</p></div><h2>विक्रेता / क्रेता</h2><table class="payment-deed-table v111-party-table"><thead><tr><th>पक्ष</th><th>नाम</th><th>मोबाइल</th><th>पहचान</th><th>पता</th></tr></thead><tbody>${partyRows||'<tr><td colspan="5">पक्ष विवरण बाकी है</td></tr>'}</tbody></table><h2>चक / गाटा / रकबा</h2><table class="payment-deed-table"><thead><tr><th>#</th><th>चक</th><th>खसरा/गाटा</th><th>कुल हे.</th><th>विक्रित हे.</th></tr></thead><tbody>${gataRows||'<tr><td colspan="5">गाटा विवरण नहीं है</td></tr>'}</tbody></table></section>`;
  const witnessText=wits.map((w,i)=>`${en?'Witness':'साक्षी'} ${i+1}: ${en?v191EnRaw(w.name||relationName(w)||'-'):esc(relationName(w)||w.name||'-')} • ${esc(w.mobile||'-')}`).join('<br>')||'-';
  const page2=en?`<section class="deed-page v111-check-page"><h1>CHECKING COPY — REVIEW</h1><h2>Payment / Consideration</h2><p>Target transaction: <b>${inr(d.transactionAmount||0)}</b> • Payment rows total: <b>${inr(payTotal)}</b>.</p>${v191PaymentTableEn({...d,payments:pay})}<h2>Witness / Advocate</h2><p>${witnessText}</p><p><b>Drafted By:</b> ${v191En(d.advocate?.name||d.ownerAdvocate||'-')}</p><h2>Review Warnings</h2>${warnings.length?`<ul>${warnings.map(x=>`<li>${v191En(x)}</li>`).join('')}</ul>`:'<p>✓ No current warnings.</p>'}<p class="center-clause"><b>This is only a Checking Copy. Review/correct it, then Approve Final Copy.</b></p></section>`:`<section class="deed-page v111-check-page"><h1>जाँच प्रति — समीक्षा</h1><h2>भुगतान / मूल्य राशि</h2><p>कुल लेन-देन: <b>${inr(d.transactionAmount||0)}</b> • भुगतान पंक्तियों का कुल: <b>${inr(payTotal)}</b>.</p>${v15PaymentTableHtml({...d,payments:pay})}<h2>साक्षी / अधिवक्ता</h2><p>${witnessText}</p><p><b>ड्राफ्टिड बाई:</b> ${esc(d.advocate?.name||d.ownerAdvocate||'-')}</p><h2>जाँच चेतावनियाँ</h2>${warnings.length?`<ul>${warnings.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>✓ वर्तमान में कोई चेतावनी नहीं।</p>'}<p class="center-clause"><b>यह केवल Checking Copy है। सुधार/सत्यापन के बाद Approve Final Copy करें।</b></p></section>`;
  return `<div class="deed-document v19-checking-deed v111-checking-deed ${en?'v191-english-check':'hindi-deed'}">${page1}${page2}</div>`;
}
function v111ApplyCheckingChrome(d){
  const legal=document.getElementById('legalDraftPreview'),pages=[...legal?.querySelectorAll('.v111-checking-deed>.deed-page')||[]];
  pages.forEach((page,i)=>{page.querySelectorAll(':scope > .registry-page-footer,:scope > .stamp-reserve').forEach(x=>x.remove());page.classList.remove('stamp-selected-page','stamp-normal-page');const f=document.createElement('div');f.className='registry-page-footer';f.innerHTML=`<span>Advocate: <b>${esc(d.advocate?.name||d.ownerAdvocate||'-')}</b></span><span class="registry-footer-center"><strong>Registry Pro</strong><small>Registry No.: ${esc(d.registryNo||v14ActiveRegistryNo||'-')}</small></span><span>Page ${i+1}/2</span>`;page.appendChild(f);});
}

// CRITICAL: Agriculture never calls the older debounced renderer. This removes the English->Hindi overwrite race.
const _v111SyncNonAgriBase=syncDraftPreview;
syncDraftPreview=function(){
  if(!isAgricultureMode())return _v111SyncNonAgriBase();
  try{if(typeof v15PreviewTimer!=='undefined')clearTimeout(v15PreviewTimer);}catch(e){}
  try{
    let d=v111ResolveDraft(),final=v111IsFinal(d),lang=v111Language(d);d.draftLanguage=lang;
    try{agriReviewSummary(d);}catch(e){}try{v18RenderWarnings(d);}catch(e){}
    const legal=document.getElementById('legalDraftPreview');
    if(final){const rendered=v111RenderDraftForLanguage(d,lang);v110ApplyAgricultureChrome(rendered);}
    else if(legal){legal.innerHTML=v111CheckingHtml(d,lang);v111ApplyCheckingChrome(d);}
    v18ApplyCopyState({...d,status:final?'Completed':(d.status||'Checking Copy'),finalApproved:final});v111SyncLanguageSelector(d);
  }catch(e){console.error('v1.11 Agriculture render',e);}
};

v18GenerateCheckingCopy=function(){
  if(!v19ValidateSaleAreas(true))return;v14EnsureRegistryNo();const lang=v111SelectedLanguage();let d=v18SaveStatus('Checking Copy');d.draftLanguage=lang;d.status='Checking Copy';d.finalApproved=false;d.checkingCopy=true;v111Persist(d);v14LastOpenedDraft=d;localStorage.setItem('registryProLanguage',lang);syncDraftPreview();toast(`2-page Checking Copy ${d.registryNo} saved (${lang}).`);goDraftStep(5);
};
v18ApproveFinal=function(){
  if(!v19ValidateSaleAreas(true))return;v14EnsureRegistryNo();const lang=v111SelectedLanguage(),live=draftData(),w=v18CollectWarnings(live);if(w.length&&!confirm(`Checking Copy has ${w.length} warning(s). Advocate/user review ke baad Final approve karna hai?`))return;
  let saved=v18SaveStatus('Completed');saved.draftLanguage=lang;saved.status='Completed';saved.finalApproved=true;saved.checkingCopy=false;saved._workingDraft=false;v111Persist(saved);v14LastOpenedDraft=saved;v13LastCompletedDraft=saved;localStorage.setItem('registryProLanguage',lang);syncDraftPreview();toast(`Final Copy approved (${lang}): ${saved.registryNo}`);showSaveSuccessModal?.();
};
openCurrentDraftWord=function(){
  syncDraftPreview();const legal=document.getElementById('legalDraftPreview');if(!legal){toast('Preview not ready');return;}const d=v111ResolveDraft();if(!d.registryNo)d.registryNo=v14ActiveRegistryNo||v14EnsureRegistryNo();downloadDocxFromElement(legal,d,`Registry_Pro_${safeFilePart(d.registryNo)}_${v111IsFinal(d)?'FINAL':'CHECKING'}.docx`);closeSaveSuccessModal();toast(v111IsFinal(d)?`Final ${v111Language(d)} Word downloaded`:`2-page ${v111Language(d)} Checking Copy Word downloaded`);
};
saveCurrentDraftPdf=function(){closeSaveSuccessModal();goDraftStep(5);syncDraftPreview();setTimeout(()=>window.print(),80);};

// Explicit manual-bank option; stored custom names already round-trip through collectPaymentRows().
try{const other=V10_BANKS.find(x=>x[0]==='OTHER');if(other)other[1]='Other / Enter Bank Manually';}catch(e){}
bankOptionsHtml=function(){return V10_BANKS.map(([v,l])=>`<option value="${esc(v)}">${esc(v==='OTHER'?'Other / Enter Bank Manually':l)}</option>`).join('');};
function v111RefreshManualBankLabels(){document.querySelectorAll('#paymentRows .pay-bank option[value="OTHER"]').forEach(o=>o.textContent='Other / Enter Bank Manually');document.querySelectorAll('#paymentRows .pay-bank-other').forEach(i=>i.placeholder='Enter Bank Name Manually');}
const _v111AddPaymentRowBase=addPaymentRow;
addPaymentRow=function(data={}){const out=_v111AddPaymentRowBase(data);v111RefreshManualBankLabels();return out;};

// Keep dashboard selector and fresh drafts in sync; default output language is English.
const _v111ShowDashboardBase=showDashboard;
showDashboard=function(){const out=_v111ShowDashboardBase();v111SyncLanguageSelector({});return out;};
const _v111OpenNewRegistryBase=openNewRegistry;
openNewRegistry=function(){const out=_v111OpenNewRegistryBase();v111SyncLanguageSelector({});return out;};

document.addEventListener('DOMContentLoaded',()=>{
  try{
    if(!localStorage.getItem('registryProLanguage')||localStorage.getItem('registryProLanguage')==='Hinglish')localStorage.setItem('registryProLanguage','English');
    const t=document.querySelector('title');if(t)t.textContent='Registry Pro v1.11 Final';
    v111RefreshManualBankLabels();v111SyncLanguageSelector({});
    console.info('Registry Pro v1.11 one-pass Agriculture output fix loaded');
  }catch(e){console.warn('v1.11 init',e);}
});

/* ===== Registry Pro v1.12 — FULL CHECKING COPY + STAMP BOTTOM + WORD COMPATIBILITY =====
   04-Sep-2026
   - Checking Copy contains the complete Agriculture deed text from start to finish in exactly 2 pages.
     Seller/Buyer photo boxes and fingerprint boxes are intentionally excluded only from Checking Copy.
   - Final stamp sheet keeps the stamp area reserved, but the first legal deed paragraph is placed in a bordered
     written-matter box at the bottom of whichever page the Advocate uses for stamp (Page 1 or Page 2).
   - Final non-stamp pages use larger typography/spacing so A4 space is used better without creating blank-looking pages.
   - Word export uses a UTF-8 Microsoft Word compatible .doc HTML package instead of the fragile custom .docx zip.
*/
const V112_VERSION='v1.12';

function v112StripMediaFromChecking(doc){
  if(!doc)return doc;
  doc.querySelectorAll('.registry-page-footer,.stamp-reserve,.v110-stamp-only,.party-photo-section,.party-finger-person,.photo-page-title').forEach(x=>x.remove());
  [...doc.querySelectorAll(':scope > .deed-page')].forEach(p=>{
    if(p.classList.contains('v110-photo-continuation') && !(p.textContent||'').trim())p.remove();
    if(!(p.textContent||'').trim() && !p.querySelector('table,.witness-box-grid,.deed-footer-lines'))p.remove();
  });
  return doc;
}
function v112FullTextClone(d,lang){
  const legal=document.getElementById('legalDraftPreview');if(!legal)return null;
  const old=legal.innerHTML;
  try{
    v111RenderDraftForLanguage(d,lang);
    const doc=legal.querySelector('.v110-agri-final')?.cloneNode(true)||null;
    return v112StripMediaFromChecking(doc);
  }finally{legal.innerHTML=old;}
}
function v112CheckingHtml(d,lang){
  const en=lang==='English',doc=v112FullTextClone(d,lang);
  if(!doc)return `<div class="deed-document v112-checking-deed"><section class="deed-page v112-check-page"><h1>CHECKING COPY</h1><p>Preview data is not ready. Please return to the form and save again.</p></section><section class="deed-page v112-check-page"><p>Registry Pro</p></section></div>`;
  const pages=[...doc.querySelectorAll(':scope > .deed-page')];
  const summary=pages.find(p=>p.classList.contains('v110-summary-page'));
  const legalPage=pages.find(p=>p.classList.contains('v110-legal-page'));
  const property=pages.find(p=>p.classList.contains('v110-property-payment-page'));
  const used=new Set([summary,legalPage,property].filter(Boolean));
  const rest=pages.filter(p=>!used.has(p)).map(p=>p.innerHTML).join('');
  const first=`${summary?.innerHTML||''}${legalPage?.innerHTML||''}`;
  const second=`${property?.innerHTML||''}${rest}`;
  const wm=en?'CHECKING COPY':'जाँच प्रति / CHECKING COPY';
  return `<div class="deed-document v112-checking-deed ${en?'v191-english-check':'hindi-deed'}">
    <section class="deed-page v112-check-page"><div class="v112-check-watermark">${wm}</div><div class="v112-check-body">${first}</div></section>
    <section class="deed-page v112-check-page"><div class="v112-check-watermark">${wm}</div><div class="v112-check-body">${second}</div></section>
  </div>`;
}
// Replace v1.11 summary-only checking renderer with the complete deed renderer.
v111CheckingHtml=v112CheckingHtml;

function v112FitCheckingPages(){
  document.querySelectorAll('.v112-check-page').forEach(page=>{
    const body=page.querySelector('.v112-check-body');if(!body)return;
    body.style.zoom='1';
    // Chrome/Edge supports zoom in print. Shrink only if actual content needs it.
    let avail=Math.max(100,page.clientHeight-70),need=body.scrollHeight||1;
    let z=Math.min(1,Math.max(.62,avail/need*.985));
    body.style.zoom=String(z);
    // A second pass handles table reflow after zoom.
    requestAnimationFrame(()=>{
      const need2=body.scrollHeight||1,avail2=Math.max(100,page.clientHeight-70);
      if(need2>avail2){z=Math.max(.58,z*(avail2/need2)*.985);body.style.zoom=String(z);}
    });
  });
}

function v112StampBottomText(d,lang){
  if(lang==='English')return 'Whereas the executant/seller is the lawful owner and person entitled to transfer the property described herein and, according to the documents and declarations produced, the property is stated to be free from undisclosed encumbrances, prohibitions, prior transfers, mortgages and loans, except as specifically disclosed in this deed.';
  return 'विदित हो कि प्रतिज्ञ (विक्रेता) निम्नलिखित सम्पत्ति के स्वामी व अधिकारी है जो इस समय तक हर प्रकार के भार तथा प्रतिबन्ध आदि से मुक्त है, किसी प्रकार के हस्तान्तरण तथा बन्धक आदि नहीं है और कोई ऋण आदि महकमे, बैंक, सोसायटी अथवा व्यक्तिगत रूप से, सिवाय इस विक्रय-पत्र में वर्णित विवरण के, शेष नहीं है।';
}
function v112EnhanceFinalLayout(d,lang){
  const legal=document.getElementById('legalDraftPreview'),doc=legal?.querySelector('.v110-agri-final');if(!doc)return;
  doc.classList.add('v112-final-enhanced');
  const stamp=doc.querySelector(':scope > .v110-stamp-only'),legalPage=doc.querySelector(':scope > .v110-legal-page');
  if(stamp && !stamp.querySelector('.v112-stamp-bottom')){
    const box=document.createElement('div');box.className='v112-stamp-bottom stamp-written-content-border';
    const first=legalPage?.querySelector(':scope > p');
    if(first){box.appendChild(first);}else{const p=document.createElement('p');p.textContent=v112StampBottomText(d,lang);box.appendChild(p);}
    stamp.appendChild(box);
  }
}

// Re-wrap current v1.11 renderer: checking gets complete two-page text; Final gets stamp-bottom + balanced A4 styling.
const _v112SyncBase=syncDraftPreview;
syncDraftPreview=function(){
  const out=_v112SyncBase();
  try{
    if(isAgricultureMode()){
      const d=v111ResolveDraft(),lang=v111Language(d);
      if(v111IsFinal(d))v112EnhanceFinalLayout(d,lang);else setTimeout(v112FitCheckingPages,0);
    }
  }catch(e){console.warn('v1.12 layout enhancement',e);}
  return out;
};

function v112WordHtml(root,d){
  const clone=root.cloneNode(true);
  clone.querySelectorAll('script,button,.no-print').forEach(x=>x.remove());
  clone.querySelectorAll('.v112-check-body').forEach(x=>x.style.zoom='1');
  const css=`
    @page{size:A4;margin:10mm 10mm 12mm 10mm}
    body{font-family:'Nirmala UI','Mangal','Arial',sans-serif;color:#111;margin:0}
    .deed-document{width:100%}
    .deed-page{box-sizing:border-box;position:relative;min-height:267mm;border:1.2pt solid #2f8f5b;padding:10mm 11mm 15mm;margin:0;page-break-after:always}
    .deed-page:last-child{page-break-after:auto}
    h1{text-align:center;text-decoration:underline;font-size:18pt;margin:0 0 8pt}
    h2{font-size:12pt;margin:8pt 0 4pt} p{font-size:10.5pt;line-height:1.25;text-align:justify;margin:3pt 0}
    .deed-top-grid{display:table;width:100%}.deed-top-grid>div{display:inline-block;width:48%;font-size:10.5pt;margin:2pt 0;vertical-align:top}
    table{border-collapse:collapse;width:100%;font-size:8.5pt;margin:5pt 0}th,td{border:1px solid #555;padding:3pt;text-align:left}
    .party-photo-grid,.finger-print-box-row,.witness-box-grid{display:table;width:100%;table-layout:fixed}.party-photo-box,.finger-print-box,.witness-detail-box{display:table-cell;border:1px solid #777;padding:4pt;vertical-align:top}
    .finger-print-box{height:38pt}.finger-hand-block{margin:4pt 0}.party-finger-person{page-break-inside:avoid;margin:5pt 0}
    .registry-page-footer{position:absolute;left:8mm;right:8mm;bottom:4mm;font-size:7.5pt;display:table;width:calc(100% - 16mm)}
    .registry-page-footer>span{display:table-cell;width:33%;text-align:center}.registry-page-footer>span:first-child{text-align:left}.registry-page-footer>span:last-child{text-align:right}
    .v110-stamp-only{border:0;min-height:267mm}.v112-stamp-bottom{position:absolute;left:10mm;right:10mm;bottom:12mm;border:1.2pt solid #2f8f5b;padding:5mm}.v112-stamp-bottom p{font-size:11pt}
    .v112-checking-deed .party-photo-section,.v112-checking-deed .party-finger-person{display:none!important}
    .v112-checking-deed .deed-page{padding:6mm 8mm 12mm}.v112-checking-deed p{font-size:8pt;line-height:1.05;margin:1.5pt 0}.v112-checking-deed h1{font-size:13pt;margin-bottom:4pt}.v112-checking-deed h2{font-size:9pt;margin:4pt 0 2pt}.v112-checking-deed table{font-size:6.8pt;margin:2pt 0}.v112-checking-deed th,.v112-checking-deed td{padding:1.5pt}
    .v112-check-watermark{position:absolute;top:48%;left:18%;font-size:34pt;color:#ddd;transform:rotate(-28deg);z-index:0}.v112-check-body{position:relative;z-index:1}
  `;
  return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="UTF-8"><meta name="ProgId" content="Word.Document"><title>Registry Pro</title><style>${css}</style></head><body>${clone.innerHTML}</body></html>`;
}
function v112DownloadWordCompatible(root,d,filename){
  const html='\ufeff'+v112WordHtml(root,d),blob=new Blob([html],{type:'application/msword;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename.replace(/\.docx?$/i,'')+'.doc';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
}
openCurrentDraftWord=function(){
  syncDraftPreview();const legal=document.getElementById('legalDraftPreview');if(!legal){toast('Preview not ready');return;}
  const d=v111ResolveDraft();if(!d.registryNo)d.registryNo=v14ActiveRegistryNo||v14EnsureRegistryNo();
  v112DownloadWordCompatible(legal,d,`Registry_Pro_${safeFilePart(d.registryNo)}_${v111IsFinal(d)?'FINAL':'CHECKING'}.doc`);
  closeSaveSuccessModal();toast(v111IsFinal(d)?'Final Word (.doc) downloaded':'2-page full Checking Copy Word (.doc) downloaded');
};

// Keep PDF print output synchronized and fitted immediately before print.
saveCurrentDraftPdf=function(){
  closeSaveSuccessModal();goDraftStep(5);syncDraftPreview();
  setTimeout(()=>{try{if(!v111IsFinal(v111ResolveDraft()))v112FitCheckingPages();}catch(e){}window.print();},120);
};

document.addEventListener('DOMContentLoaded',()=>{
  try{const t=document.querySelector('title');if(t)t.textContent='Registry Pro v1.12 Final';console.info('Registry Pro v1.12 full checking/stamp/Word fix loaded');}catch(e){}
});

/* ===== Registry Pro v1.13 targeted stability update =====
   ONLY these four changes are introduced on top of v1.12:
   1) Seller/Buyer/Witness party auto-fill from saved party identity (Aadhaar or mobile).
   2) More readable, fuller two-page Checking Copy layout.
   3) Larger final fingerprint boxes with witness/advocate details moved lower.
   4) Real Unicode .docx export with fixed A4 page breaks/tables instead of HTML renamed as .doc.
*/
const V113_VERSION='v1.13';

// ---------- 1) Unified Party Master + Aadhaar/Mobile auto-fill ----------
function v113Digits(v){return String(v||'').replace(/\D/g,'');}
function v113CleanParty(p={}){
  const id=v113Digits(p.aadhaar||p.id||p.idNo||'');
  return {
    name:String(p.name||'').trim(),father:String(p.father||'').trim(),relation:String(p.relation||'S/O').trim(),
    address:String(p.address||'').trim(),pan:String(p.pan||'').trim(),
    aadhaar:id.length===12?id:String(p.aadhaar||'').trim(),email:String(p.email||'').trim(),
    mobile:v113Digits(p.mobile||''),sourceRole:String(p.sourceRole||'').trim()
  };
}
function v113PartyMasterRead(){
  try{const a=JSON.parse(localStorage.getItem('registryProPartyMasterV113')||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}
}
function v113PartyKey(p){const a=v113Digits(p?.aadhaar||''),m=v113Digits(p?.mobile||'');return a.length===12?'A:'+a:(m.length===10?'M:'+m:'');}
function v113RememberParty(raw,sourceRole=''){
  const p=v113CleanParty({...raw,sourceRole});if(!p.name)return;
  const key=v113PartyKey(p);if(!key)return;
  const arr=v113PartyMasterRead();
  let i=arr.findIndex(x=>v113PartyKey(x)===key);
  if(i<0 && p.aadhaar)i=arr.findIndex(x=>v113Digits(x.aadhaar)===p.aadhaar);
  if(i<0 && p.mobile)i=arr.findIndex(x=>v113Digits(x.mobile)===p.mobile);
  if(i>=0)arr[i]={...arr[i],...Object.fromEntries(Object.entries(p).filter(([,v])=>String(v||'').trim()!==''))};else arr.unshift(p);
  localStorage.setItem('registryProPartyMasterV113',JSON.stringify(arr.slice(0,2500)));
}
function v113RememberDraftParties(d){
  try{
    normalizePartyList(d?.sellers,d?.seller).forEach(p=>v113RememberParty(p,'seller'));
    normalizePartyList(d?.buyers,d?.buyer).forEach(p=>v113RememberParty(p,'buyer'));
    (typeof v18AllWitnesses==='function'?v18AllWitnesses(d):[d?.witness1,d?.witness2]).filter(Boolean).forEach(w=>v113RememberParty({...w,aadhaar:(v113Digits(w.aadhaar||w.id||w.idNo).length===12?(w.aadhaar||w.id||w.idNo):'')},'witness'));
  }catch(e){console.warn('v1.13 party master remember',e);}
}
function v113AllKnownParties(){
  const out=[...v113PartyMasterRead()];
  try{(typeof v14AllDrafts==='function'?v14AllDrafts():JSON.parse(localStorage.getItem('registryProDrafts')||'[]')).forEach(d=>{
    normalizePartyList(d.sellers,d.seller).forEach(p=>out.push(v113CleanParty({...p,sourceRole:'seller'})));
    normalizePartyList(d.buyers,d.buyer).forEach(p=>out.push(v113CleanParty({...p,sourceRole:'buyer'})));
    (typeof v18AllWitnesses==='function'?v18AllWitnesses(d):[d.witness1,d.witness2]).filter(Boolean).forEach(w=>out.push(v113CleanParty({...w,aadhaar:(v113Digits(w.aadhaar||w.id||w.idNo).length===12?(w.aadhaar||w.id||w.idNo):''),sourceRole:'witness'})));
  });}catch(e){}
  const seen=new Set();return out.filter(p=>{const k=v113PartyKey(p);if(!k||seen.has(k))return false;seen.add(k);return true;});
}
function v113FindPartyByIdentity(aadhaar,mobile){
  const a=v113Digits(aadhaar),m=v113Digits(mobile),list=v113AllKnownParties();
  if(a.length===12){const x=list.find(p=>v113Digits(p.aadhaar)===a);if(x)return x;}
  if(m.length===10){const x=list.find(p=>v113Digits(p.mobile)===m);if(x)return x;}
  return null;
}
function v113SetId(id,v){const el=document.getElementById(id);if(el&&v!==undefined&&v!==null&&String(v)!=='')el.value=v;}
function v113FillPrimary(type,p){
  if(!p)return false;
  const pre=type;
  v113SetId(pre+'Name',p.name);v113SetId(pre+'Father',p.father);v113SetId(pre+'Address',p.address);
  v113SetId(pre+'Mobile',p.mobile);
  if(type==='seller'||type==='buyer'){
    v113SetId(pre+'Pan',p.pan);v113SetId(pre+'Aadhaar',p.aadhaar);v113SetId(pre+'Email',p.email);
  }else{
    if(p.aadhaar){v113SetId(pre+'Id',p.aadhaar);v113SetId(pre+'IdType','AADHAAR');}
  }
  const rel=document.getElementById(pre+'Relation');if(rel&&p.relation){const code=typeof relationMeta==='function'?relationMeta(p.relation).code:p.relation;[...rel.options].some(o=>{if(o.value===code){rel.value=code;return true;}return false;});}
  try{syncDraftPreview();}catch(e){}return true;
}
function v113FillExtraCard(card,p){
  if(!card||!p)return false;
  const set=(f,v)=>{const el=card.querySelector(`[data-party-field="${f}"]`);if(el&&v!==undefined&&v!==null&&String(v)!=='')el.value=v;};
  set('name',p.name);set('father',p.father);set('address',p.address);set('pan',p.pan);set('aadhaar',p.aadhaar);set('email',p.email);set('mobile',p.mobile);
  const rel=card.querySelector('[data-party-field="relation"]');if(rel&&p.relation){const code=typeof relationMeta==='function'?relationMeta(p.relation).code:p.relation;[...rel.options].some(o=>{if(o.value===code){rel.value=code;return true;}return false;});}
  try{syncDraftPreview();}catch(e){}return true;
}
const v113AutofillSeen=new WeakMap();
function v113MaybeAutofill(target){
  if(!target)return;
  let kind='',aadhaar='',mobile='',card=null;
  const id=target.id||'';
  if(/^seller(Aadhaar|Mobile)$/.test(id)){kind='seller';aadhaar=val('sellerAadhaar');mobile=val('sellerMobile');}
  else if(/^buyer(Aadhaar|Mobile)$/.test(id)){kind='buyer';aadhaar=val('buyerAadhaar');mobile=val('buyerMobile');}
  else if(/^witness[12](Id|Mobile)$/.test(id)){
    kind=id.startsWith('witness1')?'witness1':'witness2';aadhaar=val(kind+'Id');mobile=val(kind+'Mobile');
    if(v113Digits(aadhaar).length!==12)aadhaar='';
  }else if(target.matches?.('[data-party-field="aadhaar"],[data-party-field="mobile"]')){
    card=target.closest('.additional-party-card');if(!card)return;kind=card.dataset.partyType||'';
    aadhaar=card.querySelector('[data-party-field="aadhaar"]')?.value||'';mobile=card.querySelector('[data-party-field="mobile"]')?.value||'';
  }else return;
  const a=v113Digits(aadhaar),m=v113Digits(mobile);if(a.length!==12&&m.length!==10)return;
  const p=v113FindPartyByIdentity(a,m);if(!p)return;
  const key=v113PartyKey(p);if(v113AutofillSeen.get(target)===key)return;
  v113AutofillSeen.set(target,key);
  if(card)v113FillExtraCard(card,p);else v113FillPrimary(kind,p);
  try{toast(`Party auto-filled: ${p.name||'saved party'}`);}catch(e){}
}
document.addEventListener('input',e=>{
  const t=e.target;if(!t)return;
  if(/^(seller|buyer)(Aadhaar|Mobile)$/.test(t.id||'')||/^witness[12](Id|Mobile)$/.test(t.id||'')||t.matches?.('[data-party-field="aadhaar"],[data-party-field="mobile"]'))setTimeout(()=>v113MaybeAutofill(t),40);
},true);

// Remember parties whenever the current draft is saved by either save path.
try{
  const _v113SaveDraftV04=saveDraftV04;
  saveDraftV04=function(finalSave){const r=_v113SaveDraftV04.apply(this,arguments);try{v113RememberDraftParties(draftData());}catch(e){}return r;};
}catch(e){}
try{
  const _v113V18SaveStatus=v18SaveStatus;
  v18SaveStatus=function(status){const d=_v113V18SaveStatus.apply(this,arguments);try{v113RememberDraftParties(d);}catch(e){}return d;};
}catch(e){}

// ---------- 2) Checking Copy: larger readable type + automatic two-page fit ----------
function v113FitCheckingPages(){
  document.querySelectorAll('.v112-check-page').forEach(page=>{
    const body=page.querySelector('.v112-check-body');if(!body)return;
    body.style.zoom='1';
    requestAnimationFrame(()=>{
      const avail=Math.max(100,page.clientHeight-88),need=Math.max(1,body.scrollHeight);
      // Base CSS is intentionally readable. Scale down only when needed, and scale up modestly when a page is sparse.
      let z=avail/need*0.955;z=Math.min(1.18,Math.max(.72,z));body.style.zoom=String(z);
      requestAnimationFrame(()=>{
        const need2=Math.max(1,body.scrollHeight),avail2=Math.max(100,page.clientHeight-88);
        if(need2*z>avail2)z=Math.max(.68,z*(avail2/(need2*z))*.98);
        body.style.zoom=String(z);
      });
    });
  });
}
v112FitCheckingPages=v113FitCheckingPages;

// ---------- 4) REAL .DOCX fixed-layout exporter ----------
function v113WRun(text,opt={}){
  const size=opt.size||20,bold=opt.bold?'<w:b/>':'',underline=opt.underline?'<w:u w:val="single"/>':'',color=opt.color?`<w:color w:val="${opt.color}"/>`:'';
  return `<w:r><w:rPr><w:rFonts w:ascii="Nirmala UI" w:hAnsi="Nirmala UI" w:eastAsia="Nirmala UI" w:cs="Nirmala UI"/>${bold}${underline}${color}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${v14Xml(text)}</w:t></w:r>`;
}
function v113RunsFromNode(node,opt={}){
  if(!node)return '';
  if(node.nodeType===Node.TEXT_NODE)return v113WRun(node.nodeValue||'',opt);
  if(node.nodeType!==Node.ELEMENT_NODE)return '';
  const tag=node.tagName,childOpt={...opt};if(tag==='B'||tag==='STRONG')childOpt.bold=true;if(tag==='U')childOpt.underline=true;
  if(tag==='BR')return '<w:r><w:br/></w:r>';
  return [...node.childNodes].map(n=>v113RunsFromNode(n,childOpt)).join('');
}
function v113WParaEl(el,opt={}){
  const size=opt.size||20,jc=opt.center?'center':(opt.left?'left':'both'),after=opt.after??55,line=opt.line??250;
  const runs=el?v113RunsFromNode(el,{size,bold:!!opt.bold}):v113WRun(opt.text||'',{size,bold:!!opt.bold,underline:!!opt.underline,color:opt.color});
  return `<w:p><w:pPr><w:jc w:val="${jc}"/><w:spacing w:after="${after}" w:line="${line}" w:lineRule="auto"/>${opt.keep?'<w:keepNext/>':''}</w:pPr>${runs}</w:p>`;
}
function v113WParaText(text,opt={}){return v113WParaEl(null,{...opt,text});}
function v113Cell(content,width=4500,opt={}){
  const shade=opt.shade?`<w:shd w:fill="${opt.shade}"/>`:'';
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${shade}<w:vAlign w:val="${opt.valign||'top'}"/><w:tcBorders><w:top w:val="single" w:sz="6" w:color="777777"/><w:left w:val="single" w:sz="6" w:color="777777"/><w:bottom w:val="single" w:sz="6" w:color="777777"/><w:right w:val="single" w:sz="6" w:color="777777"/></w:tcBorders></w:tcPr>${content||'<w:p/>'}</w:tc>`;
}
function v113Table(rows,widths,opt={}){
  const grid=widths.map(w=>`<w:gridCol w:w="${w}"/>`).join('');
  const trs=rows.map(r=>`<w:tr>${opt.rowHeight?`<w:trPr><w:trHeight w:val="${opt.rowHeight}" w:hRule="${opt.exact?'exact':'atLeast'}"/></w:trPr>`:''}${r.map((c,i)=>typeof c==='string'&&c.startsWith('<w:tc')?c:v113Cell(c,widths[i]||Math.floor(9000/widths.length),opt.cell||{})).join('')}</w:tr>`).join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="single" w:sz="6" w:color="777777"/><w:left w:val="single" w:sz="6" w:color="777777"/><w:bottom w:val="single" w:sz="6" w:color="777777"/><w:right w:val="single" w:sz="6" w:color="777777"/><w:insideH w:val="single" w:sz="4" w:color="AAAAAA"/><w:insideV w:val="single" w:sz="4" w:color="AAAAAA"/></w:tblBorders></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${trs}</w:tbl>`;
}
function v113TextCell(text,size=18,bold=false,center=false){return v113WParaText(String(text||''),{size,bold,center,left:!center,after:20,line:220});}
function v113DomTable(table){
  const trs=[...table.querySelectorAll(':scope > thead > tr,:scope > tbody > tr,:scope > tr')];if(!trs.length)return '';
  const cols=Math.max(...trs.map(tr=>tr.children.length),1),widths=Array(cols).fill(Math.floor(9000/cols));
  const rows=trs.map((tr,ri)=>[...tr.children].map(td=>v113TextCell((td.innerText||td.textContent||'').replace(/\s+/g,' ').trim(),ri===0?15:16,ri===0,false)));
  return v113Table(rows,widths);
}
function v113PhotoTable(grid){
  const items=[...grid.querySelectorAll(':scope > .party-photo-box')],rows=[];for(let i=0;i<items.length;i+=2){const pair=items.slice(i,i+2);const cells=pair.map(box=>{const txt=[...box.querySelectorAll('strong,small')].map(x=>(x.textContent||'').trim()).filter(Boolean).join(' — ');return v113Cell(v113WParaText('PHOTO',{size:18,bold:true,center:true,after:700,line:220})+v113WParaText(txt,{size:16,bold:true,center:true}),4500,{valign:'center'});});while(cells.length<2)cells.push(v113Cell('<w:p/>',4500));rows.push(cells);}return v113Table(rows,[4500,4500],{rowHeight:1700,exact:true});
}
function v113WitnessTable(grid){
  const boxes=[...grid.querySelectorAll(':scope > .witness-detail-box')],rows=[];for(let i=0;i<boxes.length;i+=2){const pair=boxes.slice(i,i+2);const cells=pair.map(box=>{const lines=[];const st=box.querySelector('strong');if(st)lines.push(v113WParaText((st.textContent||'').trim(),{size:18,bold:true,left:true,after:25}));box.querySelectorAll('p').forEach(p=>lines.push(v113WParaEl(p,{size:17,left:true,after:18,line:220})));return v113Cell(lines.join(''),4500,{valign:'top'});});while(cells.length<2)cells.push(v113Cell('<w:p/>',4500));rows.push(cells);}return v113Table(rows,[4500,4500],{rowHeight:900});
}
function v113FingerPerson(el){
  let out=v113WParaText((el.querySelector(':scope > b')?.textContent||'').trim(),{size:18,bold:true,left:true,after:35,keep:true});
  [...el.querySelectorAll(':scope > .finger-hand-block')].forEach(hand=>{
    out+=v113WParaText((hand.querySelector('.finger-hand-title')?.textContent||'').trim(),{size:17,bold:true,left:true,after:18,keep:true});
    const labels=[...hand.querySelectorAll('.finger-print-box span')].map(x=>(x.textContent||'').trim());
    const cells=labels.map(t=>v113Cell(v113WParaText(t,{size:14,bold:true,center:true,after:850}),1800,{valign:'bottom'}));
    out+=v113Table([cells],[1800,1800,1800,1800,1800],{rowHeight:1450,exact:true});
  });
  const note=el.querySelector('.finger-note');if(note)out+=v113WParaEl(note,{size:16,left:true,after:25});return out;
}
function v113TopGrid(el){
  const items=[...el.children],rows=[];for(let i=0;i<items.length;i+=2){const cells=items.slice(i,i+2).map(x=>v113Cell(v113WParaEl(x,{size:18,left:true,after:18,line:220}),4500));while(cells.length<2)cells.push(v113Cell('<w:p/>',4500));rows.push(cells);}return v113Table(rows,[4500,4500]);
}
function v113BlockXml(el){
  if(!el||el.classList?.contains('registry-page-footer')||el.classList?.contains('v112-check-watermark'))return '';
  if(el.matches?.('h1'))return v113WParaEl(el,{size:28,bold:true,center:true,after:90,line:300});
  if(el.matches?.('h2'))return v113WParaEl(el,{size:21,bold:true,left:true,after:50,line:250});
  if(el.matches?.('p'))return v113WParaEl(el,{size:19,left:!el.classList.contains('center-clause'),center:el.classList.contains('center-clause'),after:48,line:245});
  if(el.matches?.('table'))return v113DomTable(el);
  if(el.classList?.contains('deed-top-grid'))return v113TopGrid(el);
  if(el.classList?.contains('party-photo-grid'))return v113PhotoTable(el);
  if(el.classList?.contains('witness-box-grid'))return v113WitnessTable(el);
  if(el.classList?.contains('party-finger-person'))return v113FingerPerson(el);
  if(el.classList?.contains('v112-stamp-bottom')){
    const inner=[...el.children].map(v113BlockXml).join('')||v113WParaText((el.textContent||'').trim(),{size:19,left:true});
    return v113Table([[v113Cell(inner,9000,{valign:'top'})]],[9000]);
  }
  if(el.classList?.contains('v112-check-body')||el.classList?.contains('payment-deed-section')||el.classList?.contains('party-photo-section')||el.classList?.contains('deed-footer-lines'))return [...el.children].map(v113BlockXml).join('');
  const kids=[...el.children];if(kids.length)return kids.map(v113BlockXml).join('');
  const text=(el.textContent||'').replace(/\s+/g,' ').trim();return text?v113WParaText(text,{size:19,left:true,after:40}):'';
}
function v113PageXml(page){
  if(page.classList.contains('v110-stamp-only')){
    const bottom=page.querySelector('.v112-stamp-bottom');
    return v113WParaText('',{size:12,after:10200})+(bottom?v113BlockXml(bottom):'');
  }
  const body=page.querySelector(':scope > .v112-check-body');
  let out='';
  if(page.querySelector(':scope > .v112-check-watermark'))out+=v113WParaText('CHECKING COPY',{size:20,bold:true,center:true,color:'B7B7B7',after:45});
  out+=(body?[...body.children]:[...page.children]).map(v113BlockXml).join('');return out;
}
function v113DocxParts(root,d){
  const pages=[...root.querySelectorAll(':scope > .deed-document > .deed-page,:scope > .v110-agri-final > .deed-page,:scope > .v112-checking-deed > .deed-page')];
  const use=pages.length?pages:[...root.querySelectorAll('.deed-page')];
  let body='';use.forEach((p,i)=>{body+=v113PageXml(p);if(i<use.length-1)body+='<w:p><w:r><w:br w:type="page"/></w:r></w:p>';});
  const borderColor='2F8F5B';
  const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}<w:sectPr><w:footerReference w:type="default" r:id="rId1"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="720" w:right="720" w:bottom="900" w:left="720" w:header="360" w:footer="360" w:gutter="0"/><w:pgBorders w:offsetFrom="page" w:display="allPages"><w:top w:val="single" w:sz="8" w:space="18" w:color="${borderColor}"/><w:left w:val="single" w:sz="8" w:space="18" w:color="${borderColor}"/><w:bottom w:val="single" w:sz="8" w:space="18" w:color="${borderColor}"/><w:right w:val="single" w:sz="8" w:space="18" w:color="${borderColor}"/></w:pgBorders></w:sectPr></w:body></w:document>`;
  const footer=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr>${v113WRun(`Advocate: ${d.advocate?.name||d.ownerAdvocate||'-'}   |   Registry Pro   |   Registry No.: ${d.registryNo||v14ActiveRegistryNo||'-'}   |   Page `,{size:14,bold:true})}<w:fldSimple w:instr="PAGE"><w:r><w:t>1</w:t></w:r></w:fldSimple>${v113WRun(' / ',{size:14})}<w:fldSimple w:instr="NUMPAGES"><w:r><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>`;
  const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Nirmala UI" w:hAnsi="Nirmala UI" w:eastAsia="Nirmala UI" w:cs="Nirmala UI"/><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:style></w:styles>`;
  return {
    '[Content_Types].xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>`,
    '_rels/.rels':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    'word/document.xml':documentXml,'word/styles.xml':styles,'word/footer1.xml':footer,
    'word/_rels/document.xml.rels':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
  };
}
function v113DownloadDocx(root,d,filename){const bytes=v14ZipStore(v113DocxParts(root,d)),blob=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename.replace(/\.docx?$/i,'')+'.docx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}
openCurrentDraftWord=function(){
  syncDraftPreview();const legal=document.getElementById('legalDraftPreview');if(!legal){toast('Preview not ready');return;}
  const d=typeof v111ResolveDraft==='function'?v111ResolveDraft():(v13LastCompletedDraft||v14LastOpenedDraft||draftData());if(!d.registryNo)d.registryNo=v14ActiveRegistryNo||v14EnsureRegistryNo();
  setTimeout(()=>{v113DownloadDocx(legal,d,`Registry_Pro_${safeFilePart(d.registryNo)}_${(typeof v111IsFinal==='function'&&v111IsFinal(d))?'FINAL':'CHECKING'}.docx`);closeSaveSuccessModal();toast('Proper editable Word (.docx) downloaded');},80);
};

// Keep latest fit after any preview render / before print.
const _v113SyncBase=syncDraftPreview;
syncDraftPreview=function(){const r=_v113SyncBase();try{if(document.querySelector('.v112-check-page'))setTimeout(v113FitCheckingPages,20);}catch(e){}return r;};

// Version label only; no other logic changed.
document.addEventListener('DOMContentLoaded',()=>{try{const t=document.querySelector('title');if(t)t.textContent='Registry Pro v1.13 Party Autofill + Layout + DOCX';console.info('Registry Pro v1.13 targeted 4-fix update loaded');}catch(e){};});
