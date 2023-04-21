const { defaultPluginSettings, getSetting } = require('./plugin');
const { getParentNode, isVariableNode, getAncestorNode } = require('./nodes');

const vueComponentGroups = defaultPluginSettings.vue.groupOrder;
const piniaGroups = defaultPluginSettings.vue.piniaGroupOrder;

function getVueGroupOrder(context) {
  const groupOrder = getSetting(context, 'vue.groupOrder');
  const isValidGroupOrder = Array.isArray(groupOrder)
    && groupOrder.length === vueComponentGroups.length
    && groupOrder.every(group => vueComponentGroups.includes(group));

  if (isValidGroupOrder) {
    return groupOrder;
  }

  return [...vueComponentGroups];
}

function getPiniaGroupOrder(context) {
  const groupOrder = getSetting(context, 'vue.piniaGroupOrder');
  const isValidGroupOrder = Array.isArray(groupOrder)
    && groupOrder.length === piniaGroups.length
    && groupOrder.every(group => piniaGroups.includes(group));

  if (isValidGroupOrder) {
    return groupOrder;
  }

  return [...piniaGroups];
}

function getStateNodesThatAreAbsentInOtherGroups(groupedNodes) {
  const { imports, states, ...groupedNonStateNodes } = groupedNodes;

  const nonStateNodes = Object.values(groupedNonStateNodes).flat();
  const nonStateVariableNodes = nonStateNodes.map(node => {
    return getAncestorNode(node, isVariableNode);
  }).filter(Boolean);

  return states.filter(stateNode => {
    return !nonStateVariableNodes.includes(stateNode);
  }).map(getParentNode);
}

function getHumanizedVueGroupName(groupName) {
  switch (groupName) {
    case 'imports':
      return 'imports';
    case 'defineProps':
      return 'props';
    case 'defineEmits':
      return 'emits';
    case 'states':
      return 'states';
    case 'computedProperties':
      return 'computed properties';
    case 'watchers':
      return 'watchers';
    case 'hooks':
      return 'hooks';
    case 'methods':
      return 'methods';
    case 'defineExpose':
      return 'defineExpose';
    default:
      return groupName;
  }
}

module.exports = {
  piniaGroups,
  vueComponentGroups,

  getVueGroupOrder,
  getPiniaGroupOrder,
  getHumanizedVueGroupName,
  getStateNodesThatAreAbsentInOtherGroups,
};
