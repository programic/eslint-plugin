const { ReferenceTracker } = require('eslint-utils');
const {
  compositingVisitors,
  getScriptSetupElement,
  defineScriptSetupVisitor,
} = require('../utils/vue-utils');
const {
  upperFirst,
  isVueRootNode,
  getVueGroupOrder,
  getHooksTraceMap,
  getWatchersTraceMap,
  getHumanizedVueGroupName,
  getComputedPropertiesTraceMap,
  getStateNodesThatAreAbsentInOtherGroups,
} = require('../utils');

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce a specific order in Vue components inside the script setup tag',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/vue-script-setup-order.md',
    },
  },
  create(context) {
    const scriptSetup = getScriptSetupElement(context);

    if (!scriptSetup) {
      return {};
    }

    const order = getVueGroupOrder(context);
    let groupedNodes = getInitialGroupedNodes();

    function getInitialGroupedNodes() {
      return Object.fromEntries(order.map(groupType => [groupType, []]));
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

        Object.keys(groupedNodes).forEach(groupType => {
          // Sort all the nodes by location, because we cannot trust the order of the nodes found by trace maps
          groupedNodes[groupType].sort((nodeA, nodeB) => nodeA.range[0] - nodeB.range[0]);
        });

        for (const [groupName, nodes] of Object.entries(groupedNodes)) {
          const currentGroupIndex = order.indexOf(groupName);
          const followingGroupNames = order.slice(currentGroupIndex + 1);

          if (followingGroupNames.length > 0) {
            // eslint-disable-next-line no-loop-func
            const followingGroupEntries = followingGroupNames.map(nameOfGroup => {
              return [nameOfGroup, groupedNodes[nameOfGroup]];
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

        groupedNodes = getInitialGroupedNodes();
      },
    }, defineScriptSetupVisitor(context, {
      // eslint-disable-next-line object-shorthand
      'Program > ImportDeclaration'(node) {
        groupedNodes.imports.push(node);
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
      'Program > VariableDeclaration > VariableDeclarator'(node) {
        groupedNodes.states.push(node);
      },
      // eslint-disable-next-line object-shorthand
      'Program > FunctionDeclaration'(node) {
        groupedNodes.methods.push(node);
      },
    }));
  },
};
