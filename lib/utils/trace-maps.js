const { ReferenceTracker } = require('eslint-utils');
const { getSetting } = require('./plugin');

const watcherModuleNames = Object.freeze([
  'watch',
  'watchEffect',
  'watchSyncEffect',
  'watchPostEffect',
]);

const hookModuleNames = Object.freeze([
  'onMounted',
  'onUpdated',
  'onUnmounted',
  'onBeforeMount',
  'onBeforeUpdate',
  'onBeforeUnmount',
  'onErrorCaptured',
  'onRenderTracked',
  'onRenderTriggered',
  'onActivated',
  'onDeactivated',
  'onServerPrefetch',
]);

const initialModuleTraceMap = Object.freeze({
  [ReferenceTracker.ESM]: true,
});
const traceModuleReferenceCall = Object.freeze({
  [ReferenceTracker.CALL]: true,
});

const piniaDefineStoreTraceMap = Object.freeze({
  pinia: {
    ...initialModuleTraceMap,
    defineStore: { ...traceModuleReferenceCall },
  },
});

function createCompositionApiTraceMap(map, extendedLibraries = []) {
  let traceMap = { vue: map, '@vue/composition-api': map };

  if (Array.isArray(extendedLibraries) && extendedLibraries.length > 0) {
    const extendedLibraryEntries = extendedLibraries.map(extendedLibrary => [extendedLibrary, map]);

    traceMap = { ...traceMap, ...Object.fromEntries(extendedLibraryEntries) };
  }

  return traceMap;
}

function getComputedPropertiesTraceMap(context) {
  const extendedComputedPropertiesSetting = getSetting(context, 'vue.extendedComputedProperties');
  const extendedLibraries = Object.keys(extendedComputedPropertiesSetting);
  const extendedComputedPropertyModuleNames = Object.values(
    extendedComputedPropertiesSetting,
  ).flat();

  return createCompositionApiTraceMap({
    ...initialModuleTraceMap,
    computed: traceModuleReferenceCall,
    ...Object.fromEntries(extendedComputedPropertyModuleNames.map(computedPropertyModuleName => {
      return [computedPropertyModuleName, traceModuleReferenceCall];
    })),
  }, extendedLibraries);
}

function getWatchersTraceMap(context) {
  const extendedWatchersSetting = getSetting(context, 'vue.extendedWatchers');
  const extendedWatcherModuleNames = Object.values(extendedWatchersSetting).flat();
  const extendedLibraries = Object.keys(extendedWatchersSetting);
  const allWatcherModuleNames = [...new Set([
    ...watcherModuleNames,
    ...extendedWatcherModuleNames,
  ])];

  return createCompositionApiTraceMap({
    ...initialModuleTraceMap,
    ...Object.fromEntries(allWatcherModuleNames.map(watcherModuleName => {
      return [watcherModuleName, traceModuleReferenceCall];
    })),
  }, extendedLibraries);
}

function getHooksTraceMap(context) {
  const extendedHooksSetting = getSetting(context, 'vue.extendedHooks');
  const extendedHookModuleNames = Object.values(extendedHooksSetting).flat();
  const extendedLibraries = Object.keys(extendedHooksSetting);
  const allHookModuleNames = [...new Set([
    ...hookModuleNames,
    ...extendedHookModuleNames,
  ])];

  return createCompositionApiTraceMap({
    ...initialModuleTraceMap,
    ...Object.fromEntries(allHookModuleNames.map(hookModuleName => {
      return [hookModuleName, traceModuleReferenceCall];
    })),
  }, extendedLibraries);
}

module.exports = {
  hookModuleNames,
  watcherModuleNames,
  initialModuleTraceMap,
  traceModuleReferenceCall,
  piniaDefineStoreTraceMap,

  getHooksTraceMap,
  getWatchersTraceMap,
  createCompositionApiTraceMap,
  getComputedPropertiesTraceMap,
};
