const { ReferenceTracker } = require('eslint-utils');
const { piniaDefineStoreTraceMap } = require('../utils');

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Pinia store setup definitions must return something',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/src/rules/pinia-setup-return.md',
    },
  },
  create(context) {
    return {
      Program() {
        const tracker = new ReferenceTracker(context.getScope());

        for (const { node } of tracker.iterateEsmReferences(piniaDefineStoreTraceMap)) {
          if (node.arguments.length > 1) {
            const storeDefinerNode = node.arguments[1];

            if (
              ['FunctionExpression', 'ArrowFunctionExpression'].includes(storeDefinerNode.type)
              && Array.isArray(storeDefinerNode?.body?.body)
            ) {
              const storeSetupFunctionBody = storeDefinerNode.body.body;
              const returnStatement = storeSetupFunctionBody.find(bodyNode => {
                return bodyNode.type === 'ReturnStatement';
              });
              const returnArgument = returnStatement?.argument;
              const isInvalidReturnStatement = returnArgument?.type === 'ObjectExpression'
                && Array.isArray(returnArgument?.properties)
                && returnArgument?.properties?.length < 1;

              if (!returnStatement || isInvalidReturnStatement) {
                context.report({
                  node: storeDefinerNode,
                  message: 'Pinia store setup definition must return something',
                });
              }
            }
          }
        }
      },
    };
  },
};
