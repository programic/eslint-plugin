const plugin = require('../../lib');

describe('the Programic ESLint plugin', () => {
  it('exports the right configs', () => {
    expect(plugin.configs).toStrictEqual({
      base: require('../../lib/configs/base'),
      typescript: require('../../lib/configs/typescript'),
      'vue-typescript': require('../../lib/configs/vue-typescript'),
      vue: require('../../lib/configs/vue'),
    });
  });

  it('exports the right custom rules', () => {
    expect(plugin.rules).toStrictEqual({
      'newline-before-first-type-only-import': require(
        '../../lib/rules/newline-before-first-type-only-import',
      ),
      'pinia-no-function-expressions': require(
        '../../lib/rules/pinia-no-function-expressions',
      ),
      'pinia-setup-newlines-between-groups': require(
        '../../lib/rules/pinia-setup-newlines-between-groups',
      ),
      'pinia-setup-newlines-inside-groups': require(
        '../../lib/rules/pinia-setup-newlines-inside-groups',
      ),
      'pinia-setup-order': require(
        '../../lib/rules/pinia-setup-order',
      ),
      'pinia-setup-return': require(
        '../../lib/rules/pinia-setup-return',
      ),
      'pinia-style': require(
        '../../lib/rules/pinia-style',
      ),
      'typescript-explicit-function-return-type': require(
        '../../lib/rules/typescript-explicit-function-return-type',
      ),
      'typescript-explicit-module-boundary-types': require(
        '../../lib/rules/typescript-explicit-module-boundary-types',
      ),
      'vue-block-attributes-order': require(
        '../../lib/rules/vue-block-attributes-order',
      ),
      'vue-computed-property-return-type': require(
        '../../lib/rules/vue-computed-property-return-type',
      ),
      'vue-dom-class-no-capital-letters': require(
        '../../lib/rules/vue-dom-class-no-capital-letters',
      ),
      'vue-dom-id-no-capital-letters': require(
        '../../lib/rules/vue-dom-id-no-capital-letters',
      ),
      'vue-method-return-type': require(
        '../../lib/rules/vue-method-return-type',
      ),
      'vue-no-compiler-macro-imports': require(
        '../../lib/rules/vue-no-compiler-macro-imports',
      ),
      'vue-no-function-expressions': require(
        '../../lib/rules/vue-no-function-expressions',
      ),
      'vue-no-multiple-template-root': require(
        '../../lib/rules/vue-no-multiple-template-root',
      ),
      'vue-script-setup-newlines-inside-groups': require(
        '../../lib/rules/vue-script-setup-newlines-inside-groups',
      ),
      'vue-script-setup-newlines-between-groups': require(
        '../../lib/rules/vue-script-setup-newlines-between-groups',
      ),
      'vue-script-setup-order': require(
        '../../lib/rules/vue-script-setup-order',
      ),
      'vue-v-on-handler-style': require(
        '../../lib/rules/vue-v-on-handler-style',
      ),
    });
  });
});
