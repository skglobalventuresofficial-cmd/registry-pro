(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.lease=window.RegistryProModules.lease||{};
module.beforeOpen=function(type){window.__registryRequestedDraftType=type||'Lease';};
module.afterOpen=function(){module.applyUI?.();};
})();
