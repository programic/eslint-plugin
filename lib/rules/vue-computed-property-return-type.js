const { defineVueVisitor } = require('../utils/vue-utils');

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce a TypeScript return type in computed properties in Vue',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/src/rules/vue-computed-property-return-type.md',
    },
  },
  create(context) {
    const baseMessage = 'Missing return type for';
    const validComputedNodeTypes = [
      'FunctionExpression',
      'ObjectExpression',
    ];

    const reportComputed = (node, computedName, type = null) => {
      const message = ['getter', 'setter'].includes(type)
        ? `${baseMessage} ${type} in computed property '${computedName}'`
        : `${baseMessage} computed property '${computedName}'`;

      context.report({ node, message });
    };

    return defineVueVisitor(context, {
      onVueObjectEnter(vueObject) {
        const computedProperties = vueObject.properties.find(property => {
          return property.key?.name === 'computed';
        })?.value?.properties;

        computedProperties?.forEach?.(computedProperty => {
          if (validComputedNodeTypes.includes(computedProperty.value?.type)) {
            if (computedProperty.value.type === 'FunctionExpression') {
              if (!computedProperty.value.returnType) {
                reportComputed(computedProperty.value, computedProperty.key.name);
              }
            } else if (computedProperty.value.type === 'ObjectExpression') {
              const { properties } = computedProperty.value;
              const computedGetter = properties.find(property => {
                return property.key.name === 'get';
              });
              const computedSetter = properties.find(property => {
                return property.key.name === 'set';
              });

              if (computedGetter && !computedGetter.value.returnType) {
                reportComputed(computedGetter.value, computedProperty.key.name, 'getter');
              }

              if (computedSetter && !computedSetter.value.returnType) {
                reportComputed(computedSetter.value, computedProperty.key.name, 'setter');
              }
            }
          }
        });
      },
    });
  },
};
