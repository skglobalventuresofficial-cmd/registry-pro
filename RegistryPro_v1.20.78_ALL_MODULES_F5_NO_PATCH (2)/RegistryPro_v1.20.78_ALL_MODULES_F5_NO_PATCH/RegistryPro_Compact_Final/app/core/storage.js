(function(){
'use strict';
const cleanupKey='registryProCleanCacheV12078';
async function clearLegacyRuntimeCache(){
  if(sessionStorage.getItem(cleanupKey)==='1')return;
  try{
    if('serviceWorker' in navigator){const registrations=await navigator.serviceWorker.getRegistrations();await Promise.all(registrations.map(item=>item.unregister()));}
    if('caches' in window){const names=await caches.keys();await Promise.all(names.filter(name=>/^registry-pro-/i.test(name)).map(name=>caches.delete(name)));}
    sessionStorage.setItem(cleanupKey,'1');
  }catch(error){console.warn('Legacy cache cleanup',error);}
}
if(document.readyState==='complete')clearLegacyRuntimeCache();else window.addEventListener('load',clearLegacyRuntimeCache,{once:true});
})();
