(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
window.RegistryProModules.residentialBuilding=Object.assign(window.RegistryProModules.residentialBuilding||{},{
  key:'residentialBuilding',match:type=>String(type||'').toLowerCase()==='residential building',
  title:'Residential Building Registry Draft',theme:'rp-theme-residential-building',
  applyUI(){document.getElementById('registryView')?.classList.add('rp-residential-building-fields');},
  restoreUI(){document.getElementById('registryView')?.classList.remove('rp-residential-building-fields');}
});
})();
