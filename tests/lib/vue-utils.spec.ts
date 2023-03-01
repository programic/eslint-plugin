const vueUtilsLib = require('eslint-plugin-vue/lib/utils');
const vueUtilsExport = require('../../lib/utils/vue-utils');

describe('the eslint-plugin-vue utils export file', () => {
  it('exports the eslint-plugin-vue utils', () => {
    expect(vueUtilsExport).toStrictEqual(vueUtilsLib);
  });
});
