(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.gift=window.RegistryProModules.gift||{};
module.beforeOpen=function(type){window.__registryRequestedDraftType=type||'Gift Deed';};
module.afterOpen=function(){module.applyUI?.();};
})();
