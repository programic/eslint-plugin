const { getScriptSetupElement, defineScriptSetupVisitor } = require('../utils/vue-utils');

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'disallows function expressions inside Vue script setup',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/vue-no-function-expressions.md',
    },
  },
  create(context) {
    const scriptSetup = getScriptSetupElement(context);

    if (!scriptSetup) {
      return {};
    }

    const baseSelector = 'Program > VariableDeclaration > VariableDeclarator';

    return defineScriptSetupVisitor(context, {
      [`${baseSelector} > FunctionExpression, ${baseSelector} > ArrowFunctionExpression`](node) {
        context.report({
          node: node.parent.parent,
          message: 'Function expression is forbidden when it\'s a direct child of script setup tag',
        });
      },
    });
  },
};
