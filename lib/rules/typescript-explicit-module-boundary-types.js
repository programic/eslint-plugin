const {
  ancestorHasReturnType,
  checkFunctionReturnType,
  isTypedFunctionExpression,
  checkFunctionExpressionReturnType,
  doesImmediatelyReturnFunctionExpression,
} = require('@typescript-eslint/eslint-plugin/dist/util/explicitReturnTypeUtils');
const { isFunction } = require('@typescript-eslint/utils/dist/ast-utils');
const { DefinitionType } = require('@typescript-eslint/scope-manager');
const { AST_NODE_TYPES } = require('@typescript-eslint/utils');

module.exports = {
  name: 'explicit-module-boundary-types',
  meta: {
    type: 'problem',
    docs: {
      // eslint-disable-next-line max-len
      description: 'Require explicit return and argument types on exported functions\' and classes\' public class methods',
      recommended: false,
    },
    messages: {
      missingReturnType: 'Missing return type on function.',
      // eslint-disable-next-line unicorn/prevent-abbreviations
      missingArgType: 'Argument \'{{name}}\' should be typed.',
      // eslint-disable-next-line unicorn/prevent-abbreviations
      missingArgTypeUnnamed: '{{type}} argument should be typed.',
      // eslint-disable-next-line unicorn/prevent-abbreviations
      anyTypedArg: 'Argument \'{{name}}\' should be typed with a non-any type.',
      // eslint-disable-next-line unicorn/prevent-abbreviations
      anyTypedArgUnnamed: '{{type}} argument should be typed with a non-any type.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowArgumentsExplicitlyTypedAsAny: {
            description: 'Whether to ignore arguments that are explicitly typed as `any`.',
            type: 'boolean',
          },
          allowDirectConstAssertionInArrowFunctions: {
            description: [
              // eslint-disable-next-line max-len
              'Whether to ignore return type annotations on body-less arrow functions that return an `as const` type assertion.',
              'You must still type the parameters of the function.',
            ].join('\n'),
            type: 'boolean',
          },
          allowedPatterns: {
            // eslint-disable-next-line max-len
            description: 'An array of function/method name patterns that will not have their arguments or return values checked.',
            items: { type: 'string' },
            type: 'array',
          },
          allowHigherOrderFunctions: {
            description: [
              // eslint-disable-next-line max-len
              'Whether to ignore return type annotations on functions immediately returning another function expression.',
              'You must still type the parameters of the function.',
            ].join('\n'),
            type: 'boolean',
          },
          allowTypedFunctionExpressions: {
            // eslint-disable-next-line max-len
            description: 'Whether to ignore type annotations on the variable of a function expresion.',
            type: 'boolean',
          },
          // DEPRECATED - To be removed in next major
          shouldTrackReferences: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowArgumentsExplicitlyTypedAsAny: false,
      allowDirectConstAssertionInArrowFunctions: true,
      allowedPatterns: [],
      allowHigherOrderFunctions: true,
      allowTypedFunctionExpressions: true,
    },
  ],
  create(context) {
    const [options] = context.options;
    const sourceCode = context.getSourceCode();

    // tracks all of the functions we've already checked
    const checkedFunctions = new Set();

    // tracks functions that were found whilst traversing
    const foundFunctions = [];

    // all nodes visited, avoids infinite recursion for cyclic references
    // (such as class member referring to itself)
    const alreadyVisited = new Set();

    function checkParameters(node) {
      // eslint-disable-next-line unicorn/prevent-abbreviations
      function checkParameter(param) {
        function report(namedMessageId, unnamedMessageId) {
          // eslint-disable-next-line unicorn/prefer-switch
          if (param.type === AST_NODE_TYPES.Identifier) {
            context.report({
              node: param,
              messageId: namedMessageId,
              data: { name: param.name },
            });
          } else if (param.type === AST_NODE_TYPES.ArrayPattern) {
            context.report({
              node: param,
              messageId: unnamedMessageId,
              data: { type: 'Array pattern' },
            });
          } else if (param.type === AST_NODE_TYPES.ObjectPattern) {
            context.report({
              node: param,
              messageId: unnamedMessageId,
              data: { type: 'Object pattern' },
            });
          } else if (param.type === AST_NODE_TYPES.RestElement) {
            if (param.argument.type === AST_NODE_TYPES.Identifier) {
              context.report({
                node: param,
                messageId: namedMessageId,
                data: { name: param.argument.name },
              });
            } else {
              context.report({
                node: param,
                messageId: unnamedMessageId,
                data: { type: 'Rest' },
              });
            }
          }
        }

        // eslint-disable-next-line default-case
        switch (param.type) {
          case AST_NODE_TYPES.ArrayPattern:
          case AST_NODE_TYPES.Identifier:
          case AST_NODE_TYPES.ObjectPattern:
          case AST_NODE_TYPES.RestElement:
            if (!param.typeAnnotation) {
              report('missingArgType', 'missingArgTypeUnnamed');
            } else if (
              options.allowArgumentsExplicitlyTypedAsAny !== true
              && param.typeAnnotation.typeAnnotation.type === AST_NODE_TYPES.TSAnyKeyword
            ) {
              report('anyTypedArg', 'anyTypedArgUnnamed');
            }

            return;

          case AST_NODE_TYPES.TSParameterProperty:
            // eslint-disable-next-line consistent-return
            return checkParameter(param.parameter);

          case AST_NODE_TYPES.AssignmentPattern: // ignored as it has a type via its assignment
            // eslint-disable-next-line no-useless-return
            return;
        }
      }

      for (const argument of node.params) {
        checkParameter(argument);
      }
    }

    function isAllowedFunctionName(functionName) {
      return options.allowedPatterns.some(pattern => {
        return (new RegExp(pattern)).test(functionName);
      });
    }

    /**
     * Checks if a function name is allowed and should not be checked.
     */
    function isAllowedName(node) {
      if (!node || !options.allowedPatterns || options.allowedPatterns.length === 0) {
        return false;
      }

      if (
        node.type === AST_NODE_TYPES.VariableDeclarator
        || node.type === AST_NODE_TYPES.FunctionDeclaration
      ) {
        return node.id?.type === AST_NODE_TYPES.Identifier
          && isAllowedFunctionName(node.id.name);
      }

      if (
        node.type === AST_NODE_TYPES.MethodDefinition
        || node.type === AST_NODE_TYPES.TSAbstractMethodDefinition
        || (node.type === AST_NODE_TYPES.Property && node.method)
        || node.type === AST_NODE_TYPES.PropertyDefinition
      ) {
        if (
          node.key.type === AST_NODE_TYPES.Literal
          && typeof node.key.value === 'string'
        ) {
          return isAllowedFunctionName(node.key.value);
        }

        if (
          node.key.type === AST_NODE_TYPES.TemplateLiteral
          && node.key.expressions.length === 0
        ) {
          return isAllowedFunctionName(node.key.quasis[0].value.raw);
        }

        if (!node.computed && node.key.type === AST_NODE_TYPES.Identifier) {
          return isAllowedFunctionName(node.key.name);
        }
      }

      return false;
    }

    function checkFunctionExpression(node) {
      if (checkedFunctions.has(node)) {
        return;
      }

      checkedFunctions.add(node);

      if (
        isAllowedName(node.parent)
        || isTypedFunctionExpression(node, options)
        || ancestorHasReturnType(node)
      ) {
        return;
      }

      checkFunctionExpressionReturnType(node, options, sourceCode, loc => {
        context.report({ node, loc, messageId: 'missingReturnType' });
      });

      checkParameters(node);
    }

    function checkFunction(node) {
      if (checkedFunctions.has(node)) {
        return;
      }

      checkedFunctions.add(node);

      if (isAllowedName(node) || ancestorHasReturnType(node)) {
        return;
      }

      checkFunctionReturnType(node, options, sourceCode, loc => {
        context.report({ node, loc, messageId: 'missingReturnType' });
      });

      checkParameters(node);
    }

    function checkEmptyBodyFunctionExpression(node) {
      const isConstructor = node.parent?.type === AST_NODE_TYPES.MethodDefinition
        && node.parent.kind === 'constructor';
      const isSetAccessor = [
        AST_NODE_TYPES.MethodDefinition,
        AST_NODE_TYPES.TSAbstractMethodDefinition,
      ].includes(node.parent?.type) && node.parent.kind === 'set';

      if (!isConstructor && !isSetAccessor && !node.returnType) {
        context.report({ node, messageId: 'missingReturnType' });
      }

      checkParameters(node);
    }

    function checkNode(node) {
      if (node == null || alreadyVisited.has(node)) {
        return;
      }

      alreadyVisited.add(node);

      // eslint-disable-next-line default-case
      switch (node.type) {
        case AST_NODE_TYPES.ArrowFunctionExpression:
        case AST_NODE_TYPES.FunctionExpression:
          // eslint-disable-next-line consistent-return
          return checkFunctionExpression(node);

        case AST_NODE_TYPES.ArrayExpression:
          for (const element of node.elements) {
            checkNode(element);
          }

          return;

        case AST_NODE_TYPES.PropertyDefinition:
          if (
            node.accessibility === 'private'
            || node.key.type === AST_NODE_TYPES.PrivateIdentifier
          ) {
            return;
          }

          // eslint-disable-next-line consistent-return
          return checkNode(node.value);

        case AST_NODE_TYPES.ClassDeclaration:
        case AST_NODE_TYPES.ClassExpression:
          for (const element of node.body.body) {
            checkNode(element);
          }

          return;

        case AST_NODE_TYPES.FunctionDeclaration:
          // eslint-disable-next-line consistent-return
          return checkFunction(node);

        case AST_NODE_TYPES.MethodDefinition:
        case AST_NODE_TYPES.TSAbstractMethodDefinition:
          if (
            node.accessibility === 'private'
            || node.key.type === AST_NODE_TYPES.PrivateIdentifier
          ) {
            return;
          }

          // eslint-disable-next-line consistent-return
          return checkNode(node.value);

        case AST_NODE_TYPES.Identifier:
          // eslint-disable-next-line consistent-return, no-use-before-define
          return followReference(node);

        case AST_NODE_TYPES.ObjectExpression:
          for (const property of node.properties) {
            checkNode(property);
          }
          return;

        case AST_NODE_TYPES.Property:
          // eslint-disable-next-line consistent-return
          return checkNode(node.value);

        case AST_NODE_TYPES.TSEmptyBodyFunctionExpression:
          // eslint-disable-next-line consistent-return
          return checkEmptyBodyFunctionExpression(node);

        case AST_NODE_TYPES.VariableDeclaration:
          for (const declaration of node.declarations) {
            checkNode(declaration);
          }

          return;

        case AST_NODE_TYPES.VariableDeclarator:
          // eslint-disable-next-line consistent-return
          return checkNode(node.init);
      }
    }

    function followReference(node) {
      const scope = context.getScope();
      const variable = scope.set.get(node.name);

      if (!variable) {
        return;
      }

      // check all of the definitions
      for (const definition of variable.defs) {
        // cases we don't care about in this rule
        if (
          [
            DefinitionType.ImplicitGlobalVariable,
            DefinitionType.ImportBinding,
            DefinitionType.CatchClause,
            DefinitionType.Parameter,
          ].includes(definition.type)
        ) {
          // eslint-disable-next-line no-continue
          continue;
        }

        checkNode(definition.node);
      }

      // follow references to find writes to the variable
      for (const reference of variable.references) {
        if (
          // we don't want to check the initialization ref,
          // as this is handled by the declaration check
          !reference.init && reference.writeExpr
        ) {
          checkNode(reference.writeExpr);
        }
      }
    }

    function isExportedHigherOrderFunction(node) {
      let current = node.parent;

      while (current) {
        if (current.type === AST_NODE_TYPES.ReturnStatement) {
          // the parent of a return will always be a block statement, so we can skip over it
          current = current.parent?.parent;

          // eslint-disable-next-line no-continue
          continue;
        }

        if (isFunction(current) || !doesImmediatelyReturnFunctionExpression(current)) {
          return false;
        }

        if (checkedFunctions.has(current)) {
          return true;
        }

        current = current.parent;
      }

      return false;
    }

    /**
    # How the rule works:

    As the rule traverses the AST, it immediately checks every single function that it finds
    is exported. "exported" means that it is either directly exported, or that its name is exported.

    It also collects a list of every single function it finds on the way, but does not check them.
    After it's finished traversing the AST, it then iterates through the list of found functions,
    and checks to see if any of them are part of a higher-order function
    */

    return {
      ExportDefaultDeclaration(node) {
        checkNode(node.declaration);
      },
      // eslint-disable-next-line object-shorthand
      'ExportNamedDeclaration:not([source])'(node) {
        if (node.declaration) {
          checkNode(node.declaration);
        } else {
          for (const specifier of node.specifiers) {
            followReference(specifier.local);
          }
        }
      },
      TSExportAssignment(node) {
        checkNode(node.expression);
      },
      // eslint-disable-next-line object-shorthand
      'ArrowFunctionExpression, FunctionDeclaration, FunctionExpression'(node) {
        foundFunctions.push(node);
      },
      // eslint-disable-next-line object-shorthand
      'Program:exit'() {
        for (const foundFunction of foundFunctions) {
          if (isExportedHigherOrderFunction(foundFunction)) {
            checkNode(foundFunction);
          }
        }
      },
    };
  },
};
