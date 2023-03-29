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
  'defineProps',
  'defineEmits',
  'states',
  'computedProperties',
  'watchers',
  'hooks',
  'methods',
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

const newlinesOptions = {
  numberOfNewlinesBetweenSingleLineItems: 0,
  numberOfNewlinesBetweenSingleAndMultiLineItems: 0,
  numberOfNewlinesBetweenMultiLineItems: 0,
};

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

const setOptions = options => {
  Object.keys(newlinesOptions).forEach(optionKey => {
    if (Number.isInteger(options[0]?.[optionKey]) && options[0]?.[optionKey]?.length >= 0) {
      newlinesOptions[optionKey] = options[0][optionKey];
    }
  });
};

const getReportMessage = (expectedNewlinesBetween, actualNewlinesBetween) => {
  const newlinesWord = `newline${expectedNewlinesBetween !== 1 ? 's' : ''}`;
  const detected = `(detected ${actualNewlinesBetween} newlines)`;

  // eslint-disable-next-line max-len
  return `There must be exactly ${expectedNewlinesBetween} ${newlinesWord} between this group item and the group item above ${detected}`;
};

const checkNodes = (context, node1, node2) => {
  if (node1 && node2) {
    const bothAreSingleLineNodes = (node1.loc.end.line - node1.loc.start.line) === 0
      && (node2.loc.end.line - node2.loc.start.line) === 0;
    const bothAreMultiLineNodes = (node1.loc.end.line - node1.loc.start.line) > 0
      && (node2.loc.end.line - node2.loc.start.line) > 0;

    let expectedNewlinesBetween = newlinesOptions.numberOfNewlinesBetweenSingleAndMultiLineItems;

    if (bothAreSingleLineNodes || bothAreMultiLineNodes) {
      expectedNewlinesBetween = bothAreSingleLineNodes
        ? newlinesOptions.numberOfNewlinesBetweenSingleLineItems
        : newlinesOptions.numberOfNewlinesBetweenMultiLineItems;
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
};

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce newline inside every group in Vue script setup tag',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/vue-script-setup-newlines-inside-groups.md',
    },
    schema: [{
      type: 'object',
      properties: {
        ...Object.fromEntries(Object.keys(newlinesOptions).map(newlinesOption => {
          return [newlinesOption, { type: 'integer', minimum: 0 }];
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

    setOptions(context.options);

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

        delete groupedNodes.defineProps;
        delete groupedNodes.defineEmits;

        for (const nodes of Object.values(groupedNodes)) {
          nodes.forEach((node, index) => {
            checkNodes(context, node, nodes[index + 1]);
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
      'Program > FunctionDeclaration'(node) {
        groupedNodes.methods.push(node);
      },
    }));
  },
};
