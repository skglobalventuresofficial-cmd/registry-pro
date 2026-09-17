(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.saleAfterAgreement=window.RegistryProModules.saleAfterAgreement||{};
module.beforeOpen=function(type){window.__registryRequestedDraftType=type||'Sale After Agreement';};
module.afterOpen=function(){module.applyUI?.();};
})();
