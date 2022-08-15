const vueUtils = require('../utils/vue-utils');
const utils = require('../utils');

module.exports = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: {
      description: 'enforce exactly one newline after every Vue component option',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/src/rules/vue-newline-after-component-option.md',
    },
  },
  create(context) {
    const message = 'There must be exactly one newline after a Vue component option';

    return vueUtils.defineVueVisitor(context, {
      onVueObjectEnter(vueObject) {
        vueObject.properties.forEach((property, index) => {
          const nextProperty = vueObject.properties[index + 1];

          if (nextProperty) {
            const numberOfEmptyLinesBetween = utils.getNumberOfEmptyLinesBetween(
              context,
              property,
              nextProperty,
            );

            if (numberOfEmptyLinesBetween !== 1) {
              const fix = fixer => fixer.replaceTextRange([
                property.range[1] + 1,
                nextProperty.range[0],
              ], '\n\n');

              context.report({ node: property, message, fix });
            }
          }
        });
      },
    });
  },
};
