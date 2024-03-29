const typescriptOverride = require('./lib/configs/typescript-override');
const typescriptOverrideClone = { ...typescriptOverride };

delete typescriptOverrideClone.rules['@programic/newline-before-first-type-only-import'];

module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2020
  },

  plugins: [
    '@typescript-eslint',
  ],

  overrides: [
    {
      files: ['*.js'],
      parser: 'espree',
      extends: [
        require.resolve('./lib/configs/base'),
      ],
      rules: {
        'no-use-before-define': ['error', {
          allowNamedExports: false,
          functions: false,
          variables: true,
          classes: true,
        }],
        'unicorn/prevent-abbreviations': ['error', {
          checkShorthandProperties: true,
          ignore: [/^src|docs$/gmi],
          checkProperties: true,
        }],
      },
    },
    typescriptOverrideClone,
  ],
};
