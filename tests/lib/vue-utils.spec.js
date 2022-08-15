const vueUtilsLib = require('eslint-plugin-vue/lib/utils');
const vueUtilsSpec = require('../../lib/utils/vue-utils');

describe('the Programic ESLint plugin', () => {
  it('exports the eslint-plugin-vue utils', () => {
    expect(vueUtilsSpec).toStrictEqual(vueUtilsLib);
  });
});
