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
      'vue-script-setup-order': require(
        '../../lib/rules/vue-script-setup-order',
      ),
    });
  });
});
