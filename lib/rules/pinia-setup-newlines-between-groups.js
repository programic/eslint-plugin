const { ReferenceTracker } = require('eslint-utils');
const {
  getPiniaGroupOrder,
  getWatchersTraceMap,
  isValidStoreDefinition,
  piniaDefineStoreTraceMap,
  addNodeToStoreDefinition,
  getHumanizedVueGroupName,
  getChildNodesInStoreSetup,
  getFilledStoreDefinitions,
  getGroupedNodesInStoreSetup,
  getNumberOfEmptyLinesBetween,
  getComputedPropertiesTraceMap,
} = require('../utils');

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce newline between every group in Pinia store setup definitions',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/pinia-setup-newlines-between-groups.md',
    },
    schema: [{
      type: 'object',
      properties: {
        numberOfNewlines: {
          type: 'integer',
          minimum: 0,
        },
      },
      additionalProperties: false,
    }],
  },
  create(context) {
    const { options } = context;
    const newlinesOption = options[0] && options[0].numberOfNewlines;
    let numberOfNewlines = 1;

    if (Number.isInteger(newlinesOption) && newlinesOption >= 0) {
      numberOfNewlines = newlinesOption;
    }

    const order = getPiniaGroupOrder(context);
    let storeDefinitions = [];

    function getInitialGroupedNodes() {
      return Object.fromEntries(order.map(groupType => [groupType, []]));
    }

    function getReportMessage(actualNewlinesBetween, groupType1, groupType2) {
      const newlinesWord = `newline${numberOfNewlines !== 1 ? 's' : ''}`;
      const detected = `(detected ${actualNewlinesBetween} newlines)`;
      const groupName1 = getHumanizedVueGroupName(groupType1);
      const groupName2 = getHumanizedVueGroupName(groupType2);

      // eslint-disable-next-line max-len
      return `There must be exactly ${numberOfNewlines} ${newlinesWord} between ${groupName1} and ${groupName2} ${detected}`;
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
          const { groupedNodes } = storeDefinition;

          Object.keys(groupedNodes).forEach(groupType => {
            // Sort all the nodes by location, because we cannot trust the order of the nodes found by trace maps
            groupedNodes[groupType].sort((nodeA, nodeB) => nodeA.range[0] - nodeB.range[0]);
          });

          const startRangesByGroupTypeEntries = Object.entries(groupedNodes)
            .map(([groupType, nodes]) => [groupType, nodes.map(node => node.range[0])]);

          function getGroupType(node) {
            return startRangesByGroupTypeEntries.find(entry => entry[1].includes(node.range[0]))?.[0];
          }

          const allNodes = Object.values(groupedNodes).flat();
          allNodes.sort((nodeA, nodeB) => nodeA.range[0] - nodeB.range[0]);

          // START NODE COMPARING CODE SECTION
          allNodes.forEach((node, index) => {
            const previousNode = allNodes[index - 1];

            if (previousNode) {
              const groupTypeOfNode = getGroupType(node);
              const groupTypeOfPreviousNode = getGroupType(previousNode);

              if (groupTypeOfNode !== groupTypeOfPreviousNode) {
                const newlines = getNumberOfEmptyLinesBetween(context, previousNode, node, true);

                if (newlines !== numberOfNewlines) {
                  context.report({
                    node,
                    message: getReportMessage(
                      newlines,
                      groupTypeOfPreviousNode,
                      groupTypeOfNode,
                    ),
                  });
                }
              }
            }
          });
        });

        storeDefinitions = [];
      },
    };
  },
};
