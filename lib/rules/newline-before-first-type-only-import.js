const { getNumberOfEmptyLinesBetween } = require('../utils');

module.exports = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: {
      description: 'enforce exactly one newline before the first type-only import',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/newline-before-first-type-only-import.md',
    },
  },
  create(context) {
    const message = 'There must be exactly one newline before the first type-only import';
    const isTypeImport = node => {
      return node.importKind === 'type';
    };
    let currentImport = null;
    let previousImport = null;

    return {
      ImportDeclaration(node) {
        currentImport = node;

        if (previousImport && !isTypeImport(previousImport) && isTypeImport(currentImport)) {
          const numberOfEmptyLinesBetween = getNumberOfEmptyLinesBetween(
            context,
            previousImport,
            currentImport,
          );

          if (numberOfEmptyLinesBetween !== 1) {
            const fix = fixer => fixer.replaceTextRange([
              previousImport.range[1] + 1,
              currentImport.range[0],
            ], '\n');

            context.report({ node, message, fix });
          }
        }

        previousImport = node;
      },
    };
  },
};
