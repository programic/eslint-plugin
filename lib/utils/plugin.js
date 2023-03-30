const { objectGet } = require('./helpers');

const vueComponentGroups = Object.freeze([
  'imports',
  'defineProps',
  'defineEmits',
  'states',
  'computedProperties',
  'watchers',
  'hooks',
  'methods',
  'defineExpose',
]);

// Caution: this also will be used as group order!
const piniaGroups = Object.freeze([
  'states',
  'computedProperties',
  'watchers',
  'methods',
]);

const defaultPluginSettings = Object.freeze({
  vue: {
    groupOrder: [...vueComponentGroups],
    piniaGroupOrder: [...piniaGroups],
    extendedComputedProperties: {},
    extendedWatchers: {},
    extendedHooks: {},
  },
});

function getSetting(context, settingPath) {
  const setting = objectGet(context.settings, `programic.${settingPath}`);

  return setting === undefined ? objectGet(defaultPluginSettings, settingPath) : setting;
}

module.exports = {
  defaultPluginSettings,
  getSetting,
};
