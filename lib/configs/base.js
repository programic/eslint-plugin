module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
  },

  plugins: [
    'import',
    'unicorn',
  ],

  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'airbnb-base',
  ],

  rules: {
    'no-spaced-func': 'off',
    'arrow-body-style': 'off',
    'object-curly-newline': 'off',
    'import/prefer-default-export': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'prefer-destructuring': ['error', {
      VariableDeclarator: {
        object: true,
        array: false,
      },
      AssignmentExpression: {
        object: false,
        array: false,
      },
    }, {
      enforceForRenamedProperties: false,
    }],
    'no-multiple-empty-lines': ['error', {
      max: 1,
    }],
    'padding-line-between-statements': ['error', {
      prev: '*',
      blankLine: 'always',
      next: ['if', 'for', 'function', 'switch', 'do', 'while', 'try'],
    }],
    'no-restricted-syntax': 'off',
    'no-param-reassign': ['error', {
      props: false,
    }],
    'lines-between-class-members': ['error', 'always', {
      exceptAfterSingleLine: true,
    }],
    'no-underscore-dangle': ['error', {
      allow: ['_uid'],
    }],
    'no-constant-condition': 'error',
    'no-alert': 'error',
    'no-console': ['error', {
      allow: ['warn', 'error'],
    }],
    'func-names': 'error',
    'id-length': ['error', {
      min: 2,
      max: Infinity,
      properties: 'always',
    }],
    'max-len': ['error', 140, 2, {
      ignoreUrls: true,
      ignoreStrings: false,
      ignoreComments: false,
      ignoreRegExpLiterals: false,
      ignoreTemplateLiterals: false,
      ignoreTrailingComments: false,
    }],
    eqeqeq: 'error',
    'import/no-named-as-default': 'off',
    'unicorn/better-regex': 'error',
    'unicorn/catch-error-name': 'error',
    'unicorn/empty-brace-spaces': 'error',
    'unicorn/error-message': 'error',
    'unicorn/escape-case': 'error',
    'unicorn/explicit-length-check': 'error',
    'unicorn/import-index': 'error',
    'unicorn/new-for-builtins': 'error',
    'unicorn/no-abusive-eslint-disable': 'error',
    'unicorn/no-array-method-this-argument': 'error',
    'unicorn/no-array-push-push': 'error',
    'unicorn/no-array-reduce': 'error',
    'unicorn/no-await-expression-member': 'error',
    'unicorn/no-console-spaces': 'error',
    'unicorn/no-document-cookie': 'error',
    'unicorn/no-empty-file': 'error',
    'unicorn/no-instanceof-array': 'error',
    'unicorn/no-invalid-remove-event-listener': 'error',
    'unicorn/no-lonely-if': 'error',
    'unicorn/no-new-array': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/no-unreadable-array-destructuring': 'error',
    'unicorn/no-unsafe-regex': 'error',
    'unicorn/no-useless-length-check': 'error',
    'unicorn/no-useless-spread': 'error',
    'unicorn/no-zero-fractions': 'error',
    'unicorn/number-literal-case': 'error',
    'unicorn/numeric-separators-style': 'error',
    'unicorn/prefer-add-event-listener': 'error',
    'unicorn/prefer-array-find': 'error',
    'unicorn/prefer-array-flat-map': 'error',
    'unicorn/prefer-array-index-of': 'error',
    'unicorn/prefer-array-some': 'error',
    'unicorn/prefer-code-point': 'error',
    'unicorn/prefer-date-now': 'error',
    'unicorn/prefer-dom-node-append': 'error',
    'unicorn/prefer-dom-node-dataset': 'error',
    'unicorn/prefer-dom-node-remove': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-keyboard-event-key': 'error',
    'unicorn/prefer-math-trunc': 'error',
    'unicorn/prefer-modern-dom-apis': 'error',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-object-from-entries': 'error',
    'unicorn/prefer-optional-catch-binding': 'error',
    'unicorn/prefer-regexp-test': 'error',
    'unicorn/prefer-spread': 'error',
    'unicorn/prefer-string-slice': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/prefer-string-trim-start-end': 'error',
    'unicorn/prefer-switch': 'error',
    'unicorn/prefer-type-error': 'error',
    'unicorn/prevent-abbreviations': ['error', {
      checkShorthandProperties: true,
      checkProperties: true,
      ignore: [/^src$/i],
    }],
    'unicorn/throw-new-error': 'error',
  },
};
