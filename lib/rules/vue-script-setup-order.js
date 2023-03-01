const { ReferenceTracker } = require('eslint-utils');
const {
  compositingVisitors,
  createCompositionApiTraceMap,
  defineScriptSetupVisitor,
  getScriptSetupElement,
} = require('../utils/vue-utils');
const {
  upperFirst,
  getParentNode,
  getVariableAncestorNode,
} = require('../utils');

const defaultOrder = [
  'imports',
  'defineProps',
  'defineEmits',
  'states',
  'computedProperties',
  'watchers',
  'hooks',
  'methods',
];

const getHumanizedGroupName = groupName => {
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
    default:
      return null;
  }
};

const watcherModuleNames = [
  'watch',
  'watchEffect',
  'watchSyncEffect',
  'watchPostEffect',
];

const hookModuleNames = [
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
];

const initialModuleTraceMap = { [ReferenceTracker.ESM]: true };
const traceModuleReferenceCall = { [ReferenceTracker.CALL]: true };

const getComputedPropertiesTraceMap = () => {
  return createCompositionApiTraceMap({
    ...initialModuleTraceMap,
    computed: traceModuleReferenceCall,
  });
};

const getWatchersTraceMap = () => {
  return createCompositionApiTraceMap({
    ...initialModuleTraceMap,
    ...Object.fromEntries(watcherModuleNames.map(watcherModuleName => {
      return [watcherModuleName, traceModuleReferenceCall];
    })),
  });
};

const getHooksTraceMap = () => {
  return createCompositionApiTraceMap({
    ...initialModuleTraceMap,
    ...Object.fromEntries(hookModuleNames.map(hookModuleName => {
      return [hookModuleName, traceModuleReferenceCall];
    })),
  });
};

const getInitialGroupedNodes = () => {
  return Object.fromEntries(defaultOrder.map(groupType => {
    return [groupType, []];
  }));
};

let groupedNodes = getInitialGroupedNodes();

const getStateNodesThatAreAbsentInOtherGroups = () => {
  const { imports, states, ...groupedNonStateNodes } = groupedNodes;

  const nonStateNodes = Object.values(groupedNonStateNodes).flat();
  const nonStateVariableNodes = nonStateNodes.map(getVariableAncestorNode).filter(Boolean);

  return states.map(getParentNode).filter(stateNode => !nonStateVariableNodes.includes(stateNode));
};

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce a specific order in Vue components inside the script setup tag',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/src/rules/vue-script-setup-order.md',
    },
  },
  create(context) {
    const scriptSetup = getScriptSetupElement(context);

    if (!scriptSetup) {
      return {};
    }

    return compositingVisitors({
      Program() {
        const tracker = new ReferenceTracker(context.getScope());

        for (const { node } of tracker.iterateEsmReferences(getComputedPropertiesTraceMap())) {
          groupedNodes.computedProperties.push(node);
        }

        for (const { node } of tracker.iterateEsmReferences(getWatchersTraceMap())) {
          groupedNodes.watchers.push(node);
        }

        for (const { node } of tracker.iterateEsmReferences(getHooksTraceMap())) {
          groupedNodes.hooks.push(node);
        }
      },
      // eslint-disable-next-line object-shorthand
      'Program:exit'() {
        groupedNodes.states = getStateNodesThatAreAbsentInOtherGroups();

        for (const [groupName, nodes] of Object.entries(groupedNodes)) {
          const currentGroupIndex = defaultOrder.indexOf(groupName);
          const followingGroupNames = defaultOrder.slice(currentGroupIndex + 1);

          if (followingGroupNames.length > 0) {
            // eslint-disable-next-line no-loop-func
            const followingGroupEntries = followingGroupNames.map(nameOfGroup => {
              return [nameOfGroup, groupedNodes[nameOfGroup]];
            });

            let wrongOrderedNodeShouldGoBefore = null;
            const firstWrongOrderedNode = nodes.find(node => {
              for (const [followingGroupName, nodesOfFollowingGroup] of followingGroupEntries) {
                const shouldGoBeforeNode = nodesOfFollowingGroup.find(nodeOfFollowingGroup => {
                  return nodeOfFollowingGroup.loc.start.line < node.loc.start.line;
                });

                if (shouldGoBeforeNode) {
                  wrongOrderedNodeShouldGoBefore = {
                    groupName: followingGroupName,
                    node: shouldGoBeforeNode,
                  };

                  return true;
                }
              }

              return false;
            });

            if (firstWrongOrderedNode && wrongOrderedNodeShouldGoBefore) {
              context.report({
                node: firstWrongOrderedNode,
                message: '{{currentGroupName}} should be placed above {{followingGroupName}}',
                data: {
                  currentGroupName: upperFirst(getHumanizedGroupName(groupName)),
                  followingGroupName: getHumanizedGroupName(
                    wrongOrderedNodeShouldGoBefore.groupName,
                  ),
                },
              });
            }
          }
        }

        groupedNodes = getInitialGroupedNodes();
      },
    }, defineScriptSetupVisitor(context, {
      // eslint-disable-next-line object-shorthand
      'Program > ImportDeclaration'(node) {
        groupedNodes.imports.push(node);
      },
      // eslint-disable-next-line object-shorthand
      'Program > VariableDeclaration > VariableDeclarator'(node) {
        groupedNodes.states.push(node);
      },
      // eslint-disable-next-line unicorn/prevent-abbreviations
      onDefinePropsExit(node) {
        groupedNodes.defineProps.push(node);
      },
      onDefineEmitsExit(node) {
        groupedNodes.defineEmits.push(node);
      },
      // eslint-disable-next-line object-shorthand
      'Program > FunctionDeclaration'(node) {
        groupedNodes.methods.push(node);
      },
    }));
  },
};