(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
window.RegistryProModules.lease=Object.assign(window.RegistryProModules.lease||{}, {
  key:'lease',
  match:type=>/^lease/i.test(String(type||'')),
  title:'Lease Registry Draft',
  theme:'rp-theme-lease',
  applyUI(){document.getElementById('registryView')?.classList.add('rp-lease-fields');},
  restoreUI(){document.getElementById('registryView')?.classList.remove('rp-lease-fields');}
});
})();
