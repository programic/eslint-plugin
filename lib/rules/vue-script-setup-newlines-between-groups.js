const { ReferenceTracker } = require('eslint-utils');
const {
  compositingVisitors,
  createCompositionApiTraceMap,
  defineScriptSetupVisitor,
  getScriptSetupElement,
} = require('../utils/vue-utils');
const {
  getParentNode,
  isVariableNode,
  getAncestorNode,
  initialModuleTraceMap,
  traceModuleReferenceCall,
  getNumberOfEmptyLinesBetween,
} = require('../utils');

const groups = [
  'imports',
  'defineProps',
  'defineEmits',
  'states',
  'computedProperties',
  'watchers',
  'hooks',
  'methods',
  'defineExpose',
];

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
  return Object.fromEntries(groups.map(groupType => {
    return [groupType, []];
  }));
};

let groupedNodes = getInitialGroupedNodes();
let numberOfNewlines = 1;

const getStateNodesThatAreAbsentInOtherGroups = () => {
  const { imports, states, ...groupedNonStateNodes } = groupedNodes;

  const nonStateNodes = Object.values(groupedNonStateNodes).flat();
  const nonStateVariableNodes = nonStateNodes.map(node => {
    return getAncestorNode(node, isVariableNode);
  }).filter(Boolean);

  return states.filter(stateNode => {
    return !nonStateVariableNodes.includes(stateNode);
  }).map(getParentNode);
};

const getReportMessage = actualNewlinesBetween => {
  const newlinesWord = `newline${numberOfNewlines !== 1 ? 's' : ''}`;
  const detected = `(detected ${actualNewlinesBetween} newlines)`;

  return `There must be exactly ${numberOfNewlines} ${newlinesWord} between each group ${detected}`;
};

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce newline between every group in Vue script setup tag',
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

    if (Number.isInteger(newlinesOption) && newlinesOption >= 0) {
      numberOfNewlines = newlinesOption;
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

        const comparingNodes = Object.values(groupedNodes).map((nodes, index) => {
          return index % 2 ? nodes[0] : nodes[nodes.length - 1];
        }).filter(Boolean);

        comparingNodes.forEach((node, index) => {
          const nextNode = comparingNodes[index + 1];

          if (nextNode) {
            const newlines = getNumberOfEmptyLinesBetween(context, node, nextNode, true);

            if (newlines !== numberOfNewlines) {
              context.report({ node: nextNode, message: getReportMessage(newlines) });
            }
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
