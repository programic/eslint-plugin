/* eslint-disable global-require, max-len */
module.exports = {
  configs: {
    base: require('./configs/base'),
    typescript: require('./configs/typescript'),
    'vue-typescript': require('./configs/vue-typescript'),
    vue: require('./configs/vue'),
  },
  rules: {
    'newline-before-first-type-only-import': require('./rules/newline-before-first-type-only-import'),
    'pinia-no-function-expressions': require('./rules/pinia-no-function-expressions'),
    'pinia-setup-order': require('./rules/pinia-setup-order'),
    'pinia-setup-return': require('./rules/pinia-setup-return'),
    'pinia-style': require('./rules/pinia-style'),
    'typescript-explicit-function-return-type': require('./rules/typescript-explicit-function-return-type'),
    'typescript-explicit-module-boundary-types': require('./rules/typescript-explicit-module-boundary-types'),
    'vue-block-attributes-order': require('./rules/vue-block-attributes-order'),
    'vue-computed-property-return-type': require('./rules/vue-computed-property-return-type'),
    'vue-dom-class-no-capital-letters': require('./rules/vue-dom-class-no-capital-letters'),
    'vue-dom-id-no-capital-letters': require('./rules/vue-dom-id-no-capital-letters'),
    'vue-method-return-type': require('./rules/vue-method-return-type'),
    'vue-no-function-expressions': require('./rules/vue-no-function-expressions'),
    'vue-no-multiple-template-root': require('./rules/vue-no-multiple-template-root'),
    'vue-script-setup-order': require('./rules/vue-script-setup-order'),
  },
};
