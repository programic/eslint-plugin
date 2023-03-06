const { ReferenceTracker } = require('eslint-utils');
const { createCompositionApiTraceMap } = require('../utils/vue-utils');
const {
  upperFirst,
  getParentNode,
  isVariableNode,
  isFunctionNode,
  getAncestorNode,
  initialModuleTraceMap,
  traceModuleReferenceCall,
  piniaDefineStoreTraceMap,
  isFunctionDeclarationNode,
} = require('../utils');

const defaultOrder = [
  'states',
  'computedProperties',
  'watchers',
  'methods',
];

let order = defaultOrder;

const getHumanizedGroupName = groupName => {
  switch (groupName) {
    case 'states':
      return 'states';
    case 'computedProperties':
      return 'computed properties';
    case 'watchers':
      return 'watchers';
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

const getInitialGroupedNodes = () => {
  return Object.fromEntries(order.map(groupType => {
    return [groupType, []];
  }));
};

let storeDefinitions = [];

const getGroupedNodesInStoreSetup = storeSetupFunctionBody => {
  const groupedNodes = getInitialGroupedNodes();

  storeSetupFunctionBody.forEach(node => {
    if (isVariableNode(node)) {
      groupedNodes.states.push(node);
    }

    if (isFunctionDeclarationNode(node)) {
      groupedNodes.methods.push(node);
    }
  });

  return groupedNodes;
};

const addStoreDefinition = node => {
  if (node.arguments.length > 1) {
    const storeDefinerNode = node.arguments[1];

    if (
      isFunctionNode(storeDefinerNode)
      && Array.isArray(storeDefinerNode?.body?.body)
    ) {
      const storeSetupFunctionBody = storeDefinerNode.body.body;
      const groupedNodes = getGroupedNodesInStoreSetup(storeSetupFunctionBody);

      storeDefinitions.push({ storeSetupNode: node, groupedNodes });
    }
  }
};

const addNodeToStoreDefinition = (node, nodeType) => {
  const storeItem = storeDefinitions.find(storeDefinition => {
    return !!getAncestorNode(node, ancestorNode => {
      return ancestorNode === storeDefinition.storeSetupNode;
    });
  });

  if (storeItem && Array.isArray(storeItem.groupedNodes[nodeType])) {
    storeItem.groupedNodes[nodeType].push(node);
  }
};

const getStateNodesThatAreAbsentInOtherGroups = groupedNodes => {
  const { states, ...groupedNonStateNodes } = groupedNodes;

  const nonStateNodes = Object.values(groupedNonStateNodes).flat();
  const nonStateVariableNodes = nonStateNodes.map(node => {
    return getParentNode(getAncestorNode(node, isVariableNode));
  }).filter(Boolean);

  return states.filter(stateNode => {
    return !nonStateVariableNodes.includes(stateNode);
  });
};

const getFilledStoreDefinitions = () => {
  return storeDefinitions.map(storeDefinition => {
    return {
      ...storeDefinition,
      groupedNodes: {
        ...storeDefinition.groupedNodes,
        states: getStateNodesThatAreAbsentInOtherGroups(storeDefinition.groupedNodes),
      },
    };
  }).filter(storeDefinition => {
    return Object.values(storeDefinition.groupedNodes).flat().length > 0;
  });
};

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce a specific order in Vue components inside Pinia store setup definition',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/src/rules/pinia-setup-order.md',
    },
    schema: [{
      type: 'object',
      properties: {
        order: {
          type: 'array',
          uniqueItems: true,
          additionalItems: false,
          minItems: defaultOrder.length,
          maxItems: defaultOrder.length,
          items: { enum: defaultOrder },
        },
      },
      additionalProperties: false,
    }],
  },
  create(context) {
    const { options } = context;
    const givenOrder = options[0] && options[0].order;

    if (
      Array.isArray(givenOrder)
      && givenOrder.length === defaultOrder.length
      && givenOrder.every(group => defaultOrder.includes(group))
    ) {
      order = givenOrder;
    }

    return {
      Program() {
        const tracker = new ReferenceTracker(context.getScope());

        for (const { node } of tracker.iterateEsmReferences(piniaDefineStoreTraceMap)) {
          addStoreDefinition(node);
        }

        for (const { node } of tracker.iterateEsmReferences(getComputedPropertiesTraceMap())) {
          addNodeToStoreDefinition(node, 'computedProperties');
        }

        for (const { node } of tracker.iterateEsmReferences(getWatchersTraceMap())) {
          addNodeToStoreDefinition(node, 'watchers');
        }
      },
      // eslint-disable-next-line object-shorthand
      'Program:exit'() {
        storeDefinitions = getFilledStoreDefinitions();

        storeDefinitions.forEach(storeDefinition => {
          for (const [groupName, nodes] of Object.entries(storeDefinition.groupedNodes)) {
            const currentGroupIndex = order.indexOf(groupName);
            const followingGroupNames = order.slice(currentGroupIndex + 1);

            if (followingGroupNames.length > 0) {
              const followingGroupEntries = followingGroupNames.map(nameOfGroup => {
                return [nameOfGroup, storeDefinition.groupedNodes[nameOfGroup]];
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
        });

        storeDefinitions = [];
      },
    };
  },
};
