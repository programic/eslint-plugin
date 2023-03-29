module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce one template root element',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/vue-no-multiple-template-root.md',
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      Program(node) {
        const { templateBody } = node;

        if (templateBody == null) {
          return;
        }

        const rootElements = templateBody.children.filter(child => {
          return sourceCode.getText(child).trim() !== '';
        });

        if (rootElements.length > 1) {
          context.report({
            node: templateBody,
            message: 'Multiple template root elements found. Define only one root element.',
          });
        }
      },
    };
  },
};
