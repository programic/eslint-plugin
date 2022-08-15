/* eslint-disable global-require, max-len */
module.exports = {
  rules: {
    'newline-before-first-type-only-import': require('./rules/newline-before-first-type-only-import'),
    'vue-computed-property-return-type': require('./rules/vue-computed-property-return-type'),
    'vue-dom-class-no-capital-letters': require('./rules/vue-dom-class-no-capital-letters'),
    'vue-dom-id-no-capital-letters': require('./rules/vue-dom-id-no-capital-letters'),
    'vue-method-return-type': require('./rules/vue-method-return-type'),
    'vue-newline-after-component-option': require('./rules/vue-newline-after-component-option'),
  },
};
