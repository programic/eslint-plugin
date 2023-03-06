const { defineDocumentVisitor } = require('../utils/vue-utils');

module.exports = {
  type: 'layout',
  docs: {
    description: 'enforce shorthand boolean attributes to be defined last in vue blocks',
    url: 'https://github.com/programic/eslint-plugin/blob/master/docs/src/rules/vue-script-setup-order.md',
  },
  create(context) {
    const verifyBlock = node => {
      const { attributes } = node.startTag;
      const attributesWithValue = attributes.filter(({ value }) => !!value);
      const attributesWithoutValue = attributes.filter(({ value }) => !value);
      const message = 'Shorthand boolean attributes should be placed after other attributes';

      for (const attribute of attributesWithoutValue) {
        if (attributesWithValue.some(({ range }) => range[0] > attribute.range[0])) {
          context.report({ node: attribute, message });
        }
      }
    };

    return defineDocumentVisitor(context, {
      'VDocumentFragment > VElement': verifyBlock,
    });
  },
};
