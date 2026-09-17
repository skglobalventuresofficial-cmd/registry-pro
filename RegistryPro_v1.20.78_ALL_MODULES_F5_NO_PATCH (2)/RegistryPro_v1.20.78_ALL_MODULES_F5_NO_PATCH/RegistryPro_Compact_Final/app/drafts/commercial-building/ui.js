(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
window.RegistryProModules.commercialBuilding=Object.assign(window.RegistryProModules.commercialBuilding||{}, {
  key:'commercialBuilding',
  match:type=>String(type||'').trim().toLowerCase()==='commercial building',
  title:'Commercial Building Registry Draft',
  theme:'rp-theme-commercial',
  applyUI(){document.getElementById('registryView')?.classList.add('rp-commercial-building-fields');},
  restoreUI(){document.getElementById('registryView')?.classList.remove('rp-commercial-building-fields');}
});
})();
