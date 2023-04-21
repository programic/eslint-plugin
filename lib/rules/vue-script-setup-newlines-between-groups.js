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

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce newlines between groups in Vue script setup tag',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/vue-script-setup-newlines-between-groups.md',
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
    const scriptSetup = getScriptSetupElement(context);

    if (!scriptSetup) {
      return {};
    }

    const { options } = context;
    const newlinesOption = options[0] && options[0].numberOfNewlines;
    let numberOfNewlines = 1;

    if (Number.isInteger(newlinesOption) && newlinesOption >= 0) {
      numberOfNewlines = newlinesOption;
    }

    const groups = getVueGroupOrder(context);
    let groupedNodes = getInitialGroupedNodes();

    function getInitialGroupedNodes() {
      return Object.fromEntries(groups.map(groupType => [groupType, []]));
    }

    function getReportMessage(actualNewlinesBetween) {
      const newlinesWord = `newline${numberOfNewlines !== 1 ? 's' : ''}`;
      const detected = `(detected ${actualNewlinesBetween} newlines)`;

      // eslint-disable-next-line max-len
      return `There must be exactly ${numberOfNewlines} ${newlinesWord} between each group ${detected}`;
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
      // eslint-disable-next-line object-shorthand
      'ExpressionStatement > CallExpression[callee.name="defineExpose"]'(node) {
        groupedNodes.defineExpose.push(node);
      },
    }));
  },
};
