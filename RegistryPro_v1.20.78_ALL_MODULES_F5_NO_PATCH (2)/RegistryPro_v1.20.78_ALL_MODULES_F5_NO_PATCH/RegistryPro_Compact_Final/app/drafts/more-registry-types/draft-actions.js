(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.moreRegistryTypes=window.RegistryProModules.moreRegistryTypes||{};
module.beforeOpen=function(type){window.__registryRequestedDraftType=type||'Other Registry Type';};
module.afterOpen=function(){module.applyUI?.();};
})();
