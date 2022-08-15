const vueUtils = require('../utils/vue-utils');

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce a TypeScript return type in methods in Vue',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/src/rules/vue-method-return-type.md',
    },
  },
  create(context) {
    const baseMessage = 'Missing return type for method';

    return vueUtils.defineVueVisitor(context, {
      onVueObjectEnter(vueObject) {
        const methods = vueObject.properties.find(property => {
          return property.key?.name === 'methods';
        })?.value?.properties;

        methods?.forEach?.(method => {
          if (method.value && !method.value.returnType) {
            const methodName = method.key.name;
            const message = `${baseMessage} '${methodName}'`;

            context.report({ node: method.value, message });
          }
        });
      },
    });
  },
};
