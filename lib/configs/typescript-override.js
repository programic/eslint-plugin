module.exports = {
  files: ['*.ts', '*.tsx'],

  extends: [
    require.resolve('./base'),
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],

  settings: {
    'import/resolver': {
      typescript: true,
    },
  },

  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: true,
  },

  rules: {
    'no-undef': 'off',
    'no-shadow': 'off',
    'func-call-spacing': 'off',
    'no-use-before-define': 'off',
    // Cannot annotate types within deconstructing, so it's necessary
    // to declare variables without object/array destructing
    'prefer-destructuring': 'off',
    // Don't add file extensions in imports for the following file types
    'import/extensions': ['error', 'ignorePackages', {
      // Default of airbnb
      js: 'never',
      mjs: 'never',
      jsx: 'never',
      // Also TypeScript files
      ts: 'never',
      tsx: 'never',
    }],
    'import/order': ['error', {
      groups: [
        ['builtin', 'external'],
        ['internal', 'parent', 'sibling', 'index', 'object'],
        ['type'],
      ],
      pathGroups: [
        {
          pattern: '@tests/**',
          group: 'internal',
        },
        {
          pattern: '?(@)[a-z]*',
          group: 'type',
          position: 'before',
        },
        {
          pattern: '?(@)[a-z]*/**',
          group: 'type',
          position: 'before',
        },
      ],
      pathGroupsExcludedImportTypes: ['builtin', 'external'],
    }],
    '@programic/newline-before-first-type-only-import': 'error',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/func-call-spacing': 'error',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-use-before-define': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/array-type': ['error', {
      default: 'array-simple',
    }],
    '@typescript-eslint/class-literal-property-style': 'error',
    '@typescript-eslint/consistent-indexed-object-style': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-member-accessibility': 'error',
    '@typescript-eslint/explicit-module-boundary-types': ['error', {
      allowDirectConstAssertionInArrowFunctions: true,
      allowArgumentsExplicitlyTypedAsAny: false,
      allowTypedFunctionExpressions: false,
      allowHigherOrderFunctions: false,
      allowedNames: [],
    }],
    '@typescript-eslint/member-delimiter-style': 'error',
    '@typescript-eslint/method-signature-style': ['error', 'property'],
    '@typescript-eslint/no-confusing-non-null-assertion': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/prefer-enum-initializers': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      // Default selector
      {
        selector: 'default',
        format: ['strictCamelCase'],
      },
      // Group selectors
      {
        selector: 'property',
        format: ['strictCamelCase', 'StrictPascalCase'],
      },
      {
        selector: 'method',
        format: ['strictCamelCase'],
      },
      {
        selector: 'memberLike',
        format: ['strictCamelCase'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      // Individual selectors
      {
        selector: 'import',
        format: ['strictCamelCase', 'StrictPascalCase'],
      },
      {
        selector: 'variable',
        format: ['strictCamelCase', 'UPPER_CASE'],
      },
      {
        selector: 'function',
        format: ['strictCamelCase'],
      },
      {
        selector: 'parameter',
        format: ['strictCamelCase'],
      },
      {
        selector: 'objectLiteralProperty',
        modifiers: ['requiresQuotes'],
        format: null,
      },
      {
        selector: 'objectLiteralMethod',
        modifiers: ['requiresQuotes'],
        format: null,
      },
      {
        selector: 'enum',
        format: ['StrictPascalCase'],
      },
      {
        selector: 'enumMember',
        format: ['strictCamelCase', 'StrictPascalCase'],
      },
    ],
  },
};
