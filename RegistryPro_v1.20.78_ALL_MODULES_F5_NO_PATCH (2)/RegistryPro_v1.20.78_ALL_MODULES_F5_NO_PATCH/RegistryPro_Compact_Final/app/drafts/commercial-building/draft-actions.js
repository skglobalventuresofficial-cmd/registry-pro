(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.commercialBuilding=window.RegistryProModules.commercialBuilding||{};
module.beforeOpen=function(type){window.__registryRequestedDraftType=type||'Commercial Building';};
module.afterOpen=function(){module.applyUI?.();};
})();
