const { ReferenceTracker } = require('eslint-utils');
const { isVariableNode, isFunctionNode, piniaDefineStoreTraceMap } = require('../utils');

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'disallows function expressions inside Pinia store setup definition',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/pinia-no-function-variable-declarations.md',
    },
  },
  create(context) {
    return {
      Program() {
        const tracker = new ReferenceTracker(context.getScope());

        for (const { node } of tracker.iterateEsmReferences(piniaDefineStoreTraceMap)) {
          if (node.arguments.length > 1) {
            const storeDefinerNode = node.arguments[1];

            if (isFunctionNode(storeDefinerNode) && Array.isArray(storeDefinerNode?.body?.body)) {
              const storeSetupFunctionBody = storeDefinerNode.body.body;
              const functionExpressionNodes = storeSetupFunctionBody.filter(bodyNode => {
                return isVariableNode(bodyNode)
                  && Array.isArray(bodyNode.declarations)
                  && bodyNode.declarations.length > 0
                  && isVariableNode(bodyNode.declarations[0])
                  && isFunctionNode(bodyNode.declarations[0].init);
              });

              functionExpressionNodes.forEach(functionExpressionNode => {
                context.report({
                  node: functionExpressionNode,
                  message: 'Function expression is forbidden when it\'s'
                    + ' a direct child of Pinia store setup definition',
                });
              });
            }
          }
        }
      },
    };
  },
};
