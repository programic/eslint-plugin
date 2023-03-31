const nuxtConfig = require('./nuxt');

module.exports = {
  plugins: [
    'vue',
    '@typescript-eslint',
    '@programic',
  ],

  settings: {
    ...nuxtConfig.settings,
  },

  extends: [
    require.resolve('./vue-typescript'),
  ],

  rules: {
    ...nuxtConfig.rules,
  },
};
