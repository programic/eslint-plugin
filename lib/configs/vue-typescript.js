/* eslint-disable no-var, object-shorthand */
var typescriptOverride = require('./typescript-override');

var parser = 'vue-eslint-parser';
var parserOptions = {
  ecmaVersion: 2020,
  sourceType: 'module',
  parser: '@typescript-eslint/parser',
  extraFileExtensions: ['.vue'],
  project: true,
};

module.exports = {
  parser: parser,

  parserOptions: parserOptions,

  settings: {
    'import/resolver': {
      typescript: true,
    },
  },

  plugins: [
    'vue',
    '@typescript-eslint',
    '@programic',
  ],

  overrides: [
    {
      files: ['*.js'],
      parser: 'espree',
      extends: [
        require.resolve('./base'),
      ],
    },
    {
      files: ['*.ts', '*.tsx', '*.vue'],
      parser: parser,
      parserOptions: parserOptions,
      extends: [
        require.resolve('./vue'),
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        ...typescriptOverride.rules,
        indent: 'off',
        'vue/block-lang': ['error', {
          script: {
            lang: 'ts',
            allowNoLang: false,
          },
        }],
        'vue/define-emits-declaration': ['error', 'type-based'],
        'vue/define-props-declaration': ['error', 'type-based'],
        '@programic/vue-computed-property-return-type': 'error',
        '@programic/vue-method-return-type': 'error',
        'unicorn/prevent-abbreviations': ['error', {
          checkShorthandProperties: true,
          checkProperties: true,
          ignore: [
            /^src$/i,
            // Vue specific ignores
            /attrs|params|prop|props|ref|refs/i,
          ],
        }],
      },
    },
  ],
};
