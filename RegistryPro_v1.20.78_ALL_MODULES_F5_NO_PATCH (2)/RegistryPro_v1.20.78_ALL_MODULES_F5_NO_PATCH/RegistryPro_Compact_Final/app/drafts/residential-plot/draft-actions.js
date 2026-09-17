(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.residentialPlot=window.RegistryProModules.residentialPlot||{};
module.key='residentialPlot';
module.match=module.match||function(type){return String(type||'').toLowerCase()==='residential plot';};
module.beforeOpen=function(){window.__registryRequestedDraftType='Residential Plot';};
module.afterOpen=function(){module.applyUI?.();};
})();
