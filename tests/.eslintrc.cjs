module.exports = {
  parser: '@typescript-eslint/parser',

  plugins: [
    'jest',
  ],

  env: {
    'jest': true,
    'jest/globals': true,
  },

  extends: [
    'plugin:jest/all',
  ],

  rules: {
    'global-require': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    'jest/no-conditional-in-test': 'off',
    'jest/prefer-expect-assertions': ['error', {
      onlyFunctionsWithAsyncKeyword: true
    }],
  },
};
