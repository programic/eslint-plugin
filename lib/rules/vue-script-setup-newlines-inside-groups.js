const { ReferenceTracker } = require('eslint-utils');
const {
  compositingVisitors,
  getScriptSetupElement,
  defineScriptSetupVisitor,
} = require('../utils/vue-utils');
const {
  isVueRootNode,
  getVueGroupOrder,
  getHooksTraceMap,
  getWatchersTraceMap,
  getNumberOfEmptyLinesBetween,
  getComputedPropertiesTraceMap,
  getStateNodesThatAreAbsentInOtherGroups,
} = require('../utils');

const searchGroups = [
  'defineModel',
  'defineProps',
  'defineEmits',
  'defineSlots',
  'states',
  'computedProperties',
  'watchers',
  'hooks',
  'methods',
  'defineExpose',
  'defineOptions',
];

const defaultNewlinesOptions = {
  numberOfNewlinesBetweenSingleLineItems: 0,
  numberOfNewlinesBetweenSingleAndMultiLineItems: 0,
  numberOfNewlinesBetweenMultiLineItems: 0,
};

const newlinesOptionsPerGroup = Object.fromEntries(searchGroups.map(groupType => {
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

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce newlines inside groups in Vue script setup tag',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/vue-script-setup-newlines-inside-groups.md',
    },
    schema: [{
      type: 'object',
      properties: {
        newlines: newlinesSchema,
        ...Object.fromEntries(searchGroups.map(groupType => {
          return [groupType, newlinesSchema];
        })),
      },
      additionalProperties: false,
    }],
  },
  create(context) {
    const scriptSetup = getScriptSetupElement(context);

    if (!scriptSetup) {
      return {};
    }

    setOptions(context.options[0]);

    const groups = getVueGroupOrder(context)
      .filter(groupType => searchGroups.includes(groupType));
    let groupedNodes = getInitialGroupedNodes();

    function getInitialGroupedNodes() {
      return Object.fromEntries(groups.map(groupType => [groupType, []]));
    }

    function isValidGroupOrder() {
      const startRangesByGroupTypeEntries = Object.entries(groupedNodes)
        .map(([groupType, nodes]) => [groupType, nodes.map(node => node.range[0])]);

      function getGroupType(node) {
        return startRangesByGroupTypeEntries.find(entry => entry[1].includes(node.range[0]))?.[0];
      }

      const allNodes = Object.values(groupedNodes).flat();
      allNodes.sort((nodeA, nodeB) => nodeA.range[0] - nodeB.range[0]);

      const groupOrder = [];

      for (const node of allNodes) {
        const lastGroupType = groupOrder[groupOrder.length - 1];
        const groupType = getGroupType(node);

        if (!lastGroupType || lastGroupType !== groupType) {
          if (groupOrder.includes(groupType)) {
            return false;
          }

          groupOrder.push(groupType);
        }
      }

      return true;
    }

    return compositingVisitors({
      Program() {
        const tracker = new ReferenceTracker(context.getScope());
        const traceMaps = {
          computedProperties: getComputedPropertiesTraceMap(context),
          watchers: getWatchersTraceMap(context),
          hooks: getHooksTraceMap(context),
        };

        for (const { node } of tracker.iterateEsmReferences(traceMaps.computedProperties)) {
          if (isVueRootNode(node)) {
            groupedNodes.computedProperties.push(node);
          }
        }

        for (const { node } of tracker.iterateEsmReferences(traceMaps.watchers)) {
          if (isVueRootNode(node)) {
            groupedNodes.watchers.push(node);
          }
        }

        for (const { node } of tracker.iterateEsmReferences(traceMaps.hooks)) {
          if (isVueRootNode(node)) {
            groupedNodes.hooks.push(node);
          }
        }
      },
      // eslint-disable-next-line object-shorthand
      'Program:exit'() {
        groupedNodes.states = getStateNodesThatAreAbsentInOtherGroups(groupedNodes);

        delete groupedNodes.defineProps;
        delete groupedNodes.defineEmits;
        delete groupedNodes.defineSlots;
        delete groupedNodes.defineOptions;
        delete groupedNodes.defineExpose;

        // START NODE COMPARING CODE SECTION
        if (isValidGroupOrder()) {
          Object.entries(groupedNodes).forEach(([groupType, nodes]) => {
            nodes.forEach((node, index) => {
              const node1 = node;
              const node2 = nodes[index + 1];

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
                    message: getReportMessage(expectedNewlinesBetween, actualNewlinesBetween),
                  });
                }
              }
            });
          });
        }

        groupedNodes = getInitialGroupedNodes();
      },
    }, defineScriptSetupVisitor(context, {
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
      'ExpressionStatement > CallExpression[callee.name="defineModel"]'(node) {
        groupedNodes.defineModel.push(node);
      },
      // eslint-disable-next-line object-shorthand
      'ExpressionStatement > CallExpression[callee.name="defineSlots"]'(node) {
        groupedNodes.defineSlots.push(node);
      },
      // eslint-disable-next-line object-shorthand
      'ExpressionStatement > CallExpression[callee.name="defineExpose"]'(node) {
        groupedNodes.defineExpose.push(node);
      },
      // eslint-disable-next-line object-shorthand
      'ExpressionStatement > CallExpression[callee.name="defineOptions"]'(node) {
        groupedNodes.defineOptions.push(node);
      },
      // eslint-disable-next-line object-shorthand
      'Program > FunctionDeclaration'(node) {
        groupedNodes.methods.push(node);
      },
    }));
  },
};
