(function(){
'use strict';
window.RegistryProModules=window.RegistryProModules||{};
const module=window.RegistryProModules.residentialBuilding=window.RegistryProModules.residentialBuilding||{};
module.enrichDraft=function(draft){draft.registryType='Residential Building';return draft;};
})();
