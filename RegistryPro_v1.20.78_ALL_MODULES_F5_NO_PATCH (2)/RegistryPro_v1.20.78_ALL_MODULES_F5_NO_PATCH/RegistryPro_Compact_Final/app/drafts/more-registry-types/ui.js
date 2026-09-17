(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
window.RegistryProModules.moreRegistryTypes=Object.assign(window.RegistryProModules.moreRegistryTypes||{}, {
  key:'moreRegistryTypes',
  match:type=>/^(wasiyat|will|release|relinquishment|exchange|mortgage|partition)/i.test(String(type||'')),
  title:'Other Registry Type Draft',
  theme:'rp-theme-more',
  applyUI(){document.getElementById('registryView')?.classList.add('rp-more-registry-fields');},
  restoreUI(){document.getElementById('registryView')?.classList.remove('rp-more-registry-fields');}
});
})();
