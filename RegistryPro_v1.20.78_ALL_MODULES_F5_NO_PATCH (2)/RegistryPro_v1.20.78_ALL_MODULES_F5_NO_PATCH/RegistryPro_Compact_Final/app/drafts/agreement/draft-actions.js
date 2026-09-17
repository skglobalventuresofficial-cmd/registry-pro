(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.agreement=window.RegistryProModules.agreement||{};
module.beforeOpen=function(type){window.__registryRequestedDraftType=type||'Agreement';};
module.afterOpen=function(){module.applyUI?.();};
})();
