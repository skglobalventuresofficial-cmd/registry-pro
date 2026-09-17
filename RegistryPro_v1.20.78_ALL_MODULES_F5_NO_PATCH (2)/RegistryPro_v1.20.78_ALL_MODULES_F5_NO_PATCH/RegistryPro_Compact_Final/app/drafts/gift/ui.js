(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
window.RegistryProModules.gift=Object.assign(window.RegistryProModules.gift||{},{
  key:'gift',match:type=>/^gift/i.test(String(type||'')),title:'Gift Deed Registry Draft',theme:'rp-theme-gift',
  applyUI(){document.getElementById('registryView')?.classList.add('rp-gift-fields');},
  restoreUI(){document.getElementById('registryView')?.classList.remove('rp-gift-fields');}
});
})();
