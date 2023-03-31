const { ReferenceTracker } = require('eslint-utils');
const {
  piniaGroups,
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

const defaultNewlinesOptions = {
  numberOfNewlinesBetweenSingleLineItems: 0,
  numberOfNewlinesBetweenSingleAndMultiLineItems: 0,
  numberOfNewlinesBetweenMultiLineItems: 0,
};

const newlinesOptionsPerGroup = Object.fromEntries(piniaGroups.map(groupType => {
  const newlinesOptions = { ...defaultNewlinesOptions };

  if (groupType === 'methods') {
    newlinesOptions.numberOfNewlinesBetweenSingleLineItems = 1;
    newlinesOptions.numberOfNewlinesBetweenSingleAndMultiLineItems = 1;
    newlinesOptions.numberOfNewlinesBetweenMultiLineItems = 1;
  }

  return [groupType, newlinesOptions];
}));

const newlinesSchema = Object.fromEntries(
  Object.keys(defaultNewlinesOptions).map(newlinesOption => {
    return [newlinesOption, { type: 'integer', minimum: 0 }];
  }),
);

function setOptions(options) {
  for (const [groupType, newlinesOptions] of Object.entries(newlinesOptionsPerGroup)) {
    Object.keys(newlinesOptions).forEach(newlinesOption => {
      const givenNewlinesOption = options?.[groupType]?.[newlinesOption]
        ?? options?.newlines?.[newlinesOption];

      if (Number.isInteger(givenNewlinesOption) && givenNewlinesOption > 0) {
        newlinesOptionsPerGroup[groupType][newlinesOption] = givenNewlinesOption;
      }
    });
  }
}

function getReportMessage(expectedNewlinesBetween, actualNewlinesBetween) {
  const newlinesWord = `newline${expectedNewlinesBetween !== 1 ? 's' : ''}`;
  const detected = `(detected ${actualNewlinesBetween} newlines)`;

  // eslint-disable-next-line max-len
  return `There must be exactly ${expectedNewlinesBetween} ${newlinesWord} between this group item and the group item above ${detected}`;
}

function checkNodes(context, groupType, node1, node2) {
  if (node1 && node2) {
    const bothAreSingleLineNodes = (node1.loc.end.line - node1.loc.start.line) === 0
      && (node2.loc.end.line - node2.loc.start.line) === 0;
    const bothAreMultiLineNodes = (node1.loc.end.line - node1.loc.start.line) > 0
      && (node2.loc.end.line - node2.loc.start.line) > 0;

    let expectedNewlinesBetween = newlinesOptionsPerGroup[groupType]
      .numberOfNewlinesBetweenSingleAndMultiLineItems;

    if (bothAreSingleLineNodes || bothAreMultiLineNodes) {
      expectedNewlinesBetween = bothAreSingleLineNodes
        ? newlinesOptionsPerGroup[groupType].numberOfNewlinesBetweenSingleLineItems
        : newlinesOptionsPerGroup[groupType].numberOfNewlinesBetweenMultiLineItems;
    }

    const actualNewlinesBetween = getNumberOfEmptyLinesBetween(context, node1, node2, true);

    if (actualNewlinesBetween !== expectedNewlinesBetween) {
      context.report({
        node: node2,
        message: getReportMessage(
          expectedNewlinesBetween,
          actualNewlinesBetween,
        ),
      });
    }
  }
}

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce newline inside groups in Pinia store setup definitions',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/pinia-setup-newlines-inside-groups.md',
    },
    schema: [{
      type: 'object',
      properties: {
        newlines: newlinesSchema,
        ...Object.fromEntries(piniaGroups.map(groupType => {
          return [groupType, newlinesSchema];
        })),
      },
      additionalProperties: false,
    }],
  },
  create(context) {
    setOptions(context.options[0]);

    const order = getPiniaGroupOrder(context);
    let storeDefinitions = [];

    function getInitialGroupedNodes() {
      return Object.fromEntries(order.map(groupType => [groupType, []]));
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

          for (const [groupType, nodes] of Object.entries(groupedNodes)) {
            nodes.forEach((node, index) => {
              checkNodes(context, groupType, node, nodes[index + 1]);
            });
          }
        });

        storeDefinitions = [];
      },
    };
  },
};
