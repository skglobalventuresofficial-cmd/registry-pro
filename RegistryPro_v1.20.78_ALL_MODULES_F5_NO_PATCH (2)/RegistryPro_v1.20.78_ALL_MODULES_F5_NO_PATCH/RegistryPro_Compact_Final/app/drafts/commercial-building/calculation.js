(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.commercialBuilding=window.RegistryProModules.commercialBuilding||{};
module.enrichDraft=function(draft){draft.registryType='Commercial Building';return draft;};
})();
