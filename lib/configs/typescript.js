module.exports = {
  parser: '@typescript-eslint/parser',

  plugins: [
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
    // eslint-disable-next-line global-require
    require('./typescript-override'),
  ],
};
