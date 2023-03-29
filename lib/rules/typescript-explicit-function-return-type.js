const {
  ancestorHasReturnType,
  checkFunctionReturnType,
  isValidFunctionExpressionReturnType,
} = require('@typescript-eslint/eslint-plugin/dist/util/explicitReturnTypeUtils');
const { AST_NODE_TYPES } = require('@typescript-eslint/utils');

module.exports = {
  name: 'typescript-explicit-function-return-type',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require explicit return types on functions and class methods',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/typescript-explicit-function-return-type.md',
    },
    messages: {
      missingReturnType: 'Missing return type on function.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowConciseArrowFunctionExpressionsStartingWithVoid: {
            description: 'Whether to allow arrow functions that start with the `void` keyword.',
            type: 'boolean',
          },
          allowExpressions: {
            // eslint-disable-next-line max-len
            description: 'Whether to ignore function expressions (functions which are not part of a declaration).',
            type: 'boolean',
          },
          allowHigherOrderFunctions: {
            // eslint-disable-next-line max-len
            description: 'Whether to ignore functions immediately returning another function expression.',
            type: 'boolean',
          },
          allowTypedFunctionExpressions: {
            // eslint-disable-next-line max-len
            description: 'Whether to ignore type annotations on the variable of function expressions.',
            type: 'boolean',
          },
          allowDirectConstAssertionInArrowFunctions: {
            // eslint-disable-next-line max-len
            description: 'Whether to ignore arrow functions immediately returning a `as const` value.',
            type: 'boolean',
          },
          allowFunctionsWithoutTypeParameters: {
            description: 'Whether to ignore functions that don\'t have generic type parameters.',
            type: 'boolean',
          },
          allowedPatterns: {
            // eslint-disable-next-line max-len
            description: 'An array of function/method name patterns that will not have their arguments or return values checked.',
            items: { type: 'string' },
            type: 'array',
          },
          allowIIFEs: {
            description: 'Whether to ignore immediately invoked function expressions (IIFEs).',
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowExpressions: false,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
      allowDirectConstAssertionInArrowFunctions: true,
      allowConciseArrowFunctionExpressionsStartingWithVoid: false,
      allowFunctionsWithoutTypeParameters: false,
      allowedPatterns: [],
      allowIIFEs: false,
    },
  ],
  create(context) {
    const [options] = context.options;
    const sourceCode = context.getSourceCode();

    function isIIFE(node) {
      return node.parent.type === AST_NODE_TYPES.CallExpression;
    }

    function isAllowedFunctionName(functionName) {
      return options.allowedPatterns.some(pattern => {
        return (new RegExp(pattern)).test(functionName);
      });
    }

    function isAllowedFunction(node) {
      if (options.allowFunctionsWithoutTypeParameters && !node.typeParameters) {
        return true;
      }

      if (options.allowIIFEs && isIIFE(node)) {
        return true;
      }

      if (!options.allowedPatterns?.length) {
        return false;
      }

      if (
        node.type === AST_NODE_TYPES.ArrowFunctionExpression
        || node.type === AST_NODE_TYPES.FunctionExpression
      ) {
        const { parent } = node;
        let functionName = null;

        if (node.id?.name) {
          functionName = node.id.name;
        } else if (parent) {
          // eslint-disable-next-line default-case
          switch (parent.type) {
            case AST_NODE_TYPES.VariableDeclarator: {
              if (parent.id.type === AST_NODE_TYPES.Identifier) {
                functionName = parent.id.name;
              }
              break;
            }
            case AST_NODE_TYPES.MethodDefinition:
            case AST_NODE_TYPES.PropertyDefinition:
            case AST_NODE_TYPES.Property: {
              if (
                parent.key.type === AST_NODE_TYPES.Identifier
                && parent.computed === false
              ) {
                functionName = parent.key.name;
              }
              break;
            }
          }
        }

        if (!!functionName && !!isAllowedFunctionName(functionName)) {
          return true;
        }
      }

      if (
        node.type === AST_NODE_TYPES.FunctionDeclaration
        && node.id
        && node.id.type === AST_NODE_TYPES.Identifier
        && !!isAllowedFunctionName(node.id.name)
      ) {
        return true;
      }

      return false;
    }

    return {
      // eslint-disable-next-line object-shorthand
      'ArrowFunctionExpression, FunctionExpression'(node) {
        if (
          options.allowConciseArrowFunctionExpressionsStartingWithVoid
          && node.type === AST_NODE_TYPES.ArrowFunctionExpression
          && node.expression
          && node.body.type === AST_NODE_TYPES.UnaryExpression
          && node.body.operator === 'void'
        ) {
          return;
        }

        if (isAllowedFunction(node)) {
          return;
        }

        if (
          options.allowTypedFunctionExpressions
          && (
            isValidFunctionExpressionReturnType(node, options)
            || ancestorHasReturnType(node)
          )
        ) {
          return;
        }

        checkFunctionReturnType(node, options, sourceCode, loc => {
          context.report({ node, loc, messageId: 'missingReturnType' });
        });
      },
      FunctionDeclaration(node) {
        if (isAllowedFunction(node)) {
          return;
        }

        if (options.allowTypedFunctionExpressions && node.returnType) {
          return;
        }

        checkFunctionReturnType(node, options, sourceCode, loc => {
          context.report({ node, loc, messageId: 'missingReturnType' });
        });
      },
    };
  },
};
