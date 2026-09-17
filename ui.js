(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
window.RegistryProModules.saleAfterAgreement=Object.assign(window.RegistryProModules.saleAfterAgreement||{}, {
  key:'saleAfterAgreement',
  match:type=>/^sale after agreement/i.test(String(type||'')),
  title:'Sale After Agreement Registry Draft',
  theme:'rp-theme-sale-after',
  applyUI(){document.getElementById('registryView')?.classList.add('rp-sale-after-agreement-fields');},
  restoreUI(){document.getElementById('registryView')?.classList.remove('rp-sale-after-agreement-fields');}
});
})();
