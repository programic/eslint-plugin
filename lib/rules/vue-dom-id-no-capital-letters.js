module.exports = {
  meta: {
    type: 'layout',
    docs: {
      // eslint-disable-next-line max-len
      description: 'disallows using capital letters in a DOM element id attribute inside Vue template',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/src/rules/vue-dom-id-no-capital-letters.md',
    },
  },
  create(context) {
    const message = 'Capital letters are forbidden in DOM id\'s to prevent camelCase';
    const getAttributeName = key => {
      return typeof key === 'string' ? key : key.name;
    };
    const getAttributeValue = value => {
      return typeof value === 'string' ? value : value.value;
    };

    return context.parserServices.defineTemplateBodyVisitor({
      VAttribute(node) {
        if (
          getAttributeName(node.key) === 'id'
          && /[A-Z]/gm.test(getAttributeValue(node.value))
        ) {
          context.report({ node, message });
        }
      },
    });
  },
};
