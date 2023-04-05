module.exports = {
  plugins: [
    'tailwindcss',
  ],

  extends: [
    'plugin:tailwindcss/recommended',
  ],

  rules: {
    'tailwindcss/classnames-order': 'error',
    'tailwindcss/enforces-negative-arbitrary-values': 'error',
    'tailwindcss/enforces-shorthand': 'error',
    'tailwindcss/no-custom-classname': 'error',
    'tailwindcss/no-contradicting-classname': 'error',
  },
};
