const { watcherModuleNames, hookModuleNames } = require('../utils');

module.exports = {
  plugins: [
    'vue',
    '@programic',
  ],

  settings: {
    programic: {
      vue: {
        extendedComputedProperties: {
          '#imports': [
            'computed',
          ],
        },
        extendedWatchers: {
          '#imports': [
            ...watcherModuleNames,
          ],
        },
        extendedHooks: {
          '#imports': [
            ...hookModuleNames,
            'onBeforeRouteLeave',
            'onBeforeRouteUpdate',
            'onNuxtReady',
          ],
          'vue-router': [
            'onBeforeRouteLeave',
            'onBeforeRouteUpdate',
          ],
        },
      },
    },
  },

  extends: [
    require.resolve('./vue'),
  ],

  rules: {
    'vue/no-undef-components': ['error', {
      ignorePatterns: [
        '^Router(View|Link)$',
        '^Nuxt(ClientFallback|Page|Layout|Link|LoadingIndicator|ErrorBoundary|Welcome)$',
        '^ClientOnly$',
      ],
    }],
  },
};
