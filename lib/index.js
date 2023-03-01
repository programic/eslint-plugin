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
    'vue-computed-property-return-type': require('./rules/vue-computed-property-return-type'),
    'vue-dom-class-no-capital-letters': require('./rules/vue-dom-class-no-capital-letters'),
    'vue-dom-id-no-capital-letters': require('./rules/vue-dom-id-no-capital-letters'),
    'vue-method-return-type': require('./rules/vue-method-return-type'),
    'vue-script-setup-order': require('./rules/vue-script-setup-order'),
  },
};
