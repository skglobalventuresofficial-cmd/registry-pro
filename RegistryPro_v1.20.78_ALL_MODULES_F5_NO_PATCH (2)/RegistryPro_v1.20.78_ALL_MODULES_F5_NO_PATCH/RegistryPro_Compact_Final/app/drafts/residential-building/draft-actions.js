(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.residentialBuilding=window.RegistryProModules.residentialBuilding||{};
module.beforeOpen=function(){window.__registryRequestedDraftType='Residential Building';};
module.afterOpen=function(){module.applyUI?.();};
})();
