const fs=require('fs');
const path=require('path');
const assert=require('assert');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.existsSync(path.join(root,rel));

const requiredCore=['runtime.js','auth.js','dashboard.js','storage.js','routing.js','common.css'];
for(const file of requiredCore)assert(exists(`app/core/${file}`),`Missing core file: ${file}`);

const drafts=[
  'agriculture','residential-plot','residential-building','gift','agreement',
  'commercial-building','industrial-building','lease','sale-after-agreement','more-registry-types'
];
const moduleFiles=['ui.css','ui.js','calculation.js','pdf.js','draft-actions.js'];
for(const draft of drafts)for(const file of moduleFiles)assert(exists(`app/drafts/${draft}/${file}`),`Missing ${draft}/${file}`);
assert(exists('.vscode/launch.json'),'Missing VS Code F5 launch configuration');
const launch=JSON.parse(read('.vscode/launch.json'));
assert(launch.configurations?.some(item=>item.request==='launch'&&item.file==='${workspaceFolder}/index.html'),'F5 launch does not open index.html');

const html=read('index.html');
const refs=[...html.matchAll(/<(?:script|link)[^>]+(?:src|href)=["']([^"']+)["']/gi)].map(match=>match[1].split('?')[0]);
for(const ref of refs)if(!/^(?:https?:|data:)/.test(ref))assert(exists(ref),`Missing active reference: ${ref}`);
assert(!refs.some(ref=>/(?:^|\/)v\d{3,}[-.]/i.test(ref)),`Numbered patch reference remains: ${refs.join(', ')}`);
assert(!/serviceWorker\.register/.test(html),'Legacy service worker registration remains in index.html');
assert(/<title>Registry Pro v1\.20\.78<\/title>/.test(html),'Release title is not stable');

const routing=read('app/core/routing.js');
assert.strictEqual((routing.match(/window\.startDashboardDeed\s*=/g)||[]).length,1,'Canonical router must assign startDashboardDeed once');
for(const token of ['openSavedRegistry','v116CloneDraft','createNextSaleFromDraft','RegistryProRouting'])assert(routing.includes(token),`Routing action missing: ${token}`);

for(const draft of drafts){
  for(const file of ['ui.js','draft-actions.js']){
    const source=read(`app/drafts/${draft}/${file}`);
    assert(!/new\s+MutationObserver\s*\(/.test(source),`${draft}/${file} contains delayed UI observer`);
  }
}
assert(!/setTimeout\s*\(/.test(routing),'Canonical routing contains delayed UI apply');

const pdfRoot='data/states/uttarakhand/haridwar/pdfs';
for(const file of ['circle_rates_roorkee.pdf','circle_rates_bhagwanpur.pdf','circle_rate_rules_khasra_pages_58_112.pdf','circle_rates_haridwar_2025.pdf','circle_rates_laksar_2025.pdf'])assert(exists(`${pdfRoot}/${file}`),`Missing PDF: ${file}`);

console.log('Clean architecture smoke test passed');
