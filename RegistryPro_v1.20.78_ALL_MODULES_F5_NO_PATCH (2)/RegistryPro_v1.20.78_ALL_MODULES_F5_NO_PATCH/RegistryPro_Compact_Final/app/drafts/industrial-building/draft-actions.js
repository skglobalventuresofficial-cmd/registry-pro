(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.industrialBuilding=window.RegistryProModules.industrialBuilding||{};
module.beforeOpen=function(type){window.__registryRequestedDraftType=type||'Industrial Building';};
module.afterOpen=function(){module.applyUI?.();};
})();
