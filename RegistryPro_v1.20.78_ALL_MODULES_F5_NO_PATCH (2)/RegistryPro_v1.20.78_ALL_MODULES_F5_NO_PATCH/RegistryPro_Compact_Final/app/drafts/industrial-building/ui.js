(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
window.RegistryProModules.industrialBuilding=Object.assign(window.RegistryProModules.industrialBuilding||{}, {
  key:'industrialBuilding',
  match:type=>String(type||'').trim().toLowerCase()==='industrial building',
  title:'Industrial Building Registry Draft',
  theme:'rp-theme-industrial',
  applyUI(){document.getElementById('registryView')?.classList.add('rp-industrial-building-fields');},
  restoreUI(){document.getElementById('registryView')?.classList.remove('rp-industrial-building-fields');}
});
})();
