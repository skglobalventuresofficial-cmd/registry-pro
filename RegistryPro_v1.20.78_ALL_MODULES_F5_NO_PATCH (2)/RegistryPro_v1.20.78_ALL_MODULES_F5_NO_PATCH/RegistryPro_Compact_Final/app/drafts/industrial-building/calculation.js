(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.industrialBuilding=window.RegistryProModules.industrialBuilding||{};
module.enrichDraft=function(draft){draft.registryType='Industrial Building';return draft;};
})();
