const { ReferenceTracker } = require('eslint-utils');
const {
  getPiniaGroupOrder,
  getWatchersTraceMap,
  isValidStoreDefinition,
  piniaDefineStoreTraceMap,
  addNodeToStoreDefinition,
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

    function getReportMessage(actualNewlinesBetween) {
      const newlinesWord = `newline${numberOfNewlines !== 1 ? 's' : ''}`;
      const detected = `(detected ${actualNewlinesBetween} newlines)`;

      // eslint-disable-next-line max-len
      return `There must be exactly ${numberOfNewlines} ${newlinesWord} between each group ${detected}`;
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
          const allNodes = Object.values(groupedNodes).filter(nodes => nodes.length > 0);
          const comparingNodeEntries = allNodes.map((nodes, index) => {
            return [nodes[nodes.length - 1], allNodes[index + 1]?.[0]];
          }).filter(nodes => nodes.every(node => !!node));

          comparingNodeEntries.forEach(([node1, node2]) => {
            const newlines = getNumberOfEmptyLinesBetween(context, node1, node2, true);

            if (newlines !== numberOfNewlines) {
              context.report({ node: node2, message: getReportMessage(newlines) });
            }
          });
        });

        storeDefinitions = [];
      },
    };
  },
};
