const { ReferenceTracker } = require('eslint-utils');
const {
  upperFirst,
  getPiniaGroupOrder,
  getWatchersTraceMap,
  isValidStoreDefinition,
  piniaDefineStoreTraceMap,
  addNodeToStoreDefinition,
  getHumanizedVueGroupName,
  getChildNodesInStoreSetup,
  getFilledStoreDefinitions,
  getGroupedNodesInStoreSetup,
  getComputedPropertiesTraceMap,
} = require('../utils');

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce a specific order in Vue components inside Pinia store setup definition',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/pinia-setup-order.md',
    },
  },
  create(context) {
    const order = getPiniaGroupOrder(context);
    let storeDefinitions = [];

    function getInitialGroupedNodes() {
      return Object.fromEntries(order.map(groupType => [groupType, []]));
    }

    return {
      Program() {
        const tracker = new ReferenceTracker(context.getScope());
        const traceMaps = {
          piniaDefineStore: piniaDefineStoreTraceMap,
          computedProperties: getComputedPropertiesTraceMap(context),
          watchers: getWatchersTraceMap(context),
        };

        for (const { node } of tracker.iterateEsmReferences(traceMaps.piniaDefineStore)) {
          if (isValidStoreDefinition) {
            const groupedNodes = getGroupedNodesInStoreSetup(
              getChildNodesInStoreSetup(node),
              getInitialGroupedNodes(),
            );

            storeDefinitions.push({ storeSetupNode: node, groupedNodes });
          }
        }

        for (const { node } of tracker.iterateEsmReferences(traceMaps.computedProperties)) {
          addNodeToStoreDefinition(storeDefinitions, node, 'computedProperties');
        }

        for (const { node } of tracker.iterateEsmReferences(traceMaps.watchers)) {
          addNodeToStoreDefinition(storeDefinitions, node, 'watchers');
        }
      },
      // eslint-disable-next-line object-shorthand
      'Program:exit'() {
        storeDefinitions = getFilledStoreDefinitions(storeDefinitions);

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
                    currentGroupName: upperFirst(getHumanizedVueGroupName(groupName)),
                    followingGroupName: getHumanizedVueGroupName(
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
