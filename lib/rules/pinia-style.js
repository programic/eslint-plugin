const { ReferenceTracker } = require('eslint-utils');
const { piniaDefineStoreTraceMap } = require('../utils');

const COMPOSITION_API_STYLE = 'setup';
const OPTIONS_API_STYLE = 'options';

const possibleStoreStyles = [
  COMPOSITION_API_STYLE,
  OPTIONS_API_STYLE,
];

let storeStyle = COMPOSITION_API_STYLE;

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce a specific store style when defining Pinia stores',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/src/rules/pinia-style.md',
    },
    schema: [{
      enum: possibleStoreStyles,
    }],
  },
  create(context) {
    if (possibleStoreStyles.includes(context.options[0])) {
      storeStyle = context.options[0];
    }

    return {
      Program() {
        const tracker = new ReferenceTracker(context.getScope());

        for (const { node } of tracker.iterateEsmReferences(piniaDefineStoreTraceMap)) {
          if (node.arguments.length > 1) {
            const storeDefinerNode = node.arguments[1];

            if (
              storeStyle === COMPOSITION_API_STYLE
              && storeDefinerNode.type === 'ObjectExpression'
            ) {
              context.report({
                node: storeDefinerNode,
                message: 'Stores must be defined in the Composition API style',
              });
            }

            if (
              storeStyle === OPTIONS_API_STYLE
              && storeDefinerNode.type !== 'ObjectExpression'
            ) {
              context.report({
                node: storeDefinerNode,
                message: 'Stores must be defined in the Options API style',
              });
            }
          }
        }
      },
    };
  },
};
