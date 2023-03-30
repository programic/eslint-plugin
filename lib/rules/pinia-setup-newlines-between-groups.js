const { ReferenceTracker } = require('eslint-utils');
const {
  getParentNode,
  isVariableNode,
  isFunctionNode,
  getAncestorNode,
  getPiniaGroupOrder,
  getWatchersTraceMap,
  piniaDefineStoreTraceMap,
  isFunctionDeclarationNode,
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

    function getGroupedNodesInStoreSetup(storeSetupFunctionBody) {
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
    }

    function addStoreDefinition(node) {
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
    }

    function addNodeToStoreDefinition(node, nodeType) {
      const storeItem = storeDefinitions.find(storeDefinition => {
        return !!getAncestorNode(node, ancestorNode => {
          return ancestorNode === storeDefinition.storeSetupNode;
        });
      });

      if (storeItem && Array.isArray(storeItem.groupedNodes[nodeType])) {
        storeItem.groupedNodes[nodeType].push(node);
      }
    }

    function getStateNodesThatAreAbsentInOtherGroups(groupedNodes) {
      const { states, ...groupedNonStateNodes } = groupedNodes;

      const nonStateNodes = Object.values(groupedNonStateNodes).flat();
      const nonStateVariableNodes = nonStateNodes.map(node => {
        return getParentNode(getAncestorNode(node, isVariableNode));
      }).filter(Boolean);

      return states.filter(stateNode => {
        return !nonStateVariableNodes.includes(stateNode);
      });
    }

    function getFilledStoreDefinitions() {
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
          addStoreDefinition(node);
        }

        for (const { node } of tracker.iterateEsmReferences(traceMaps.computedProperties)) {
          addNodeToStoreDefinition(node, 'computedProperties');
        }

        for (const { node } of tracker.iterateEsmReferences(traceMaps.watchers)) {
          addNodeToStoreDefinition(node, 'watchers');
        }
      },
      // eslint-disable-next-line object-shorthand
      'Program:exit'() {
        storeDefinitions = getFilledStoreDefinitions();

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
