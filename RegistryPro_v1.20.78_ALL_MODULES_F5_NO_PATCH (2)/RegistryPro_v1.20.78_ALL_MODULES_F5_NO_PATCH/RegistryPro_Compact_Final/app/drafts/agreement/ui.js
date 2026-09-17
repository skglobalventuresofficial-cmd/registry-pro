(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
window.RegistryProModules.agreement=Object.assign(window.RegistryProModules.agreement||{},{
  key:'agreement',match:type=>/^agreement/i.test(String(type||'')),title:'Agreement Registry Draft',theme:'rp-theme-agreement',
  applyUI(){document.getElementById('registryView')?.classList.add('rp-agreement-fields');},
  restoreUI(){document.getElementById('registryView')?.classList.remove('rp-agreement-fields');}
});
})();
