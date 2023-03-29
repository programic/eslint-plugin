/* eslint-disable no-continue */
const {
  defineVueVisitor,
  iterateProperties,
  defineTemplateBodyVisitor,
} = require('../utils/vue-utils');

function parseOptions(context) {
  const { options } = context;
  const allows = [];

  if (options[0]) {
    if (Array.isArray(options[0])) {
      allows.push(...options[0]);
    } else {
      allows.push(options[0]);
    }
  } else {
    allows.push('method', 'inline-function');
  }

  const option = options[1] || {};
  const ignoreIncludesComment = !!option.ignoreIncludesComment;
  const allowAnyInlineFunction = !!option.allowAnyInlineFunction;

  return { allows, ignoreIncludesComment, allowAnyInlineFunction };
}

// Check whether the given token is a quote
function isQuote(token) {
  return token != null
    && token.type === 'Punctuator'
    && (token.value === '"' || token.value === "'");
}

// Check whether the given node is an identifier call expression. e.g. `foo()`
function isIdentifierCallExpression(node) {
  if (node.type !== 'CallExpression') {
    return false;
  }

  if (node.optional) {
    // optional chaining
    return false;
  }

  return node.callee.type === 'Identifier';
}

// Returns a call expression node if the given VOnExpression or
// BlockStatement consists of only a single identifier call expression
function getIdentifierCallExpression(node) {
  let exprStatement;
  let { body } = node;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const statements = body.filter(statement => {
      return statement.type !== 'EmptyStatement';
    });

    if (statements.length !== 1) {
      return null;
    }

    const statement = statements[0];

    if (statement.type === 'ExpressionStatement') {
      exprStatement = statement;
      break;
    }

    if (statement.type === 'BlockStatement') {
      body = statement.body;
      continue;
    }

    return null;
  }

  const { expression } = exprStatement;

  if (!isIdentifierCallExpression(expression)) {
    return null;
  }

  return expression;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce writing style for handlers in v-on directives',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/vue-v-on-handler-style.md',
    },
    fixable: 'code',
    schema: [
      {
        oneOf: [
          { enum: ['inline', 'inline-function'] },
          {
            type: 'array',
            items: [
              { const: 'method' },
              { enum: ['inline', 'inline-function'] },
            ],
            uniqueItems: true,
            additionalItems: false,
            minItems: 2,
            maxItems: 2,
          },
        ],
      },
      {
        type: 'object',
        properties: {
          ignoreIncludesComment: { type: 'boolean' },
          allowAnyInlineFunction: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferMethodOverInline: 'Prefer method handler over inline handler in v-on.',
      // eslint-disable-next-line max-len
      preferMethodOverInlineWithoutIdCall: 'Prefer method handler over inline handler in v-on. Note that you may need to create a new method.',
      preferMethodOverInlineFunction: 'Prefer method handler over inline function in v-on.',
      // eslint-disable-next-line max-len
      preferMethodOverInlineFunctionWithoutIdCall: 'Prefer method handler over inline function in v-on. Note that you may need to create a new method.',
      preferInlineOverMethod: 'Prefer inline handler over method handler in v-on.',
      preferInlineOverInlineFunction: 'Prefer inline handler over inline function in v-on.',
      // eslint-disable-next-line max-len, unicorn/prevent-abbreviations
      preferInlineOverInlineFunctionWithMultipleParams: 'Prefer inline handler over inline function in v-on. Note that the custom event must be changed to a single payload.',
      preferInlineFunctionOverMethod: 'Prefer inline function over method handler in v-on.',
      preferInlineFunctionOverInline: 'Prefer inline function over inline handler in v-on.',
    },
  },
  create(context) {
    const { allows, ignoreIncludesComment, allowAnyInlineFunction } = parseOptions(context);

    const upperElements = new Set();
    const methodParameterCountMap = new Map();
    const $eventIdentifiers = [];

    // Get token information for the given VExpressionContainer node
    function getVExpressionContainerTokenInfo(node) {
      const tokenStore = context.parserServices.getTemplateBodyTokenStore();
      const tokens = tokenStore.getTokens(node, { includeComments: true });

      const firstToken = tokens[0];
      const lastToken = tokens[tokens.length - 1];

      const hasQuote = isQuote(firstToken);
      const rangeWithoutQuotes = hasQuote
        ? [firstToken.range[1], lastToken.range[0]]
        : [firstToken.range[0], lastToken.range[1]];

      return {
        rangeWithoutQuotes,
        get hasComment() {
          return tokens.some(token => {
            return token.type === 'Block' || token.type === 'Line';
          });
        },
        hasQuote,
      };
    }

    // Checks whether the given node refers to a variable of the element
    function hasReferenceUpperElementVariable(node) {
      for (const element of upperElements) {
        for (const variable of element.variables) {
          for (const reference of variable.references) {
            const { range } = reference.id;

            if (node.range[0] <= range[0] && range[1] <= node.range[1]) {
              return true;
            }
          }
        }
      }

      return false;
    }

    // Check if `v-on:click="foo()"` can be converted to `v-on:click="foo"` and report if it can
    function verifyCanUseMethodHandlerForInlineHandler(node) {
      const { rangeWithoutQuotes, hasComment } = getVExpressionContainerTokenInfo(node.parent);

      if (ignoreIncludesComment && hasComment) {
        return false;
      }

      const idCallExpr = getIdentifierCallExpression(node);

      if (
        (!idCallExpr || idCallExpr.arguments.length > 0)
        && hasReferenceUpperElementVariable(node)
      ) {
        // It cannot be converted to method because it refers to the variable of the element.
        // e.g. <template v-for="e in list"><button @click="foo(e)" /></template>
        return false;
      }

      context.report({
        node,
        messageId: idCallExpr
          ? 'preferMethodOverInline'
          : 'preferMethodOverInlineWithoutIdCall',
        fix: fixer => {
          if (
            hasComment // The statement contains comment and cannot be fixed.
            || !idCallExpr // The statement is not a simple identifier call and cannot be fixed.
            || idCallExpr.arguments.length > 0
          ) {
            return null;
          }

          const parameterCount = methodParameterCountMap.get(idCallExpr.callee.name);

          if (parameterCount != null && parameterCount > 0) {
            // The behavior of target method can change given the arguments.
            return null;
          }

          return fixer.replaceTextRange(
            rangeWithoutQuotes,
            context.getSourceCode().getText(idCallExpr.callee),
          );
        },
      });

      return true;
    }

    // Report `v-on:click="foo()"` can be converted to `v-on:click="()=>foo()"`
    function reportCanUseInlineFunctionForInlineHandler(node) {
      context.report({
        node,
        messageId: 'preferInlineFunctionOverInline',
        * fix(fixer) {
          const has$Event = $eventIdentifiers.some(({ range }) => {
            return node.range[0] <= range[0] && range[1] <= node.range[1];
          });

          if (has$Event) {
            /* The statements contain $event and cannot be fixed. */
            return;
          }

          const { rangeWithoutQuotes, hasQuote } = getVExpressionContainerTokenInfo(node.parent);

          if (!hasQuote) {
            /* The statements are not enclosed in quotes and cannot be fixed. */
            return;
          }

          yield fixer.insertTextBeforeRange(rangeWithoutQuotes, '() => ');
          const tokenStore = context.parserServices.getTemplateBodyTokenStore();
          const firstToken = tokenStore.getFirstToken(node);
          const lastToken = tokenStore.getLastToken(node);

          if (firstToken.value === '{' && lastToken.value === '}') {
            return;
          }

          if (
            lastToken.value !== ';'
            && node.body.length === 1
            && node.body[0].type === 'ExpressionStatement'
          ) {
            // it is a single expression
            return;
          }

          yield fixer.insertTextBefore(firstToken, '{');
          yield fixer.insertTextAfter(lastToken, '}');
        },
      });
    }

    // Checks whether parameters are passed as arguments as-is
    function isSameParameterAndArgument(node, expression) {
      return node.params.length === expression.arguments.length
        && node.params.every((parameter, index) => {
          if (parameter.type !== 'Identifier') {
            return false;
          }

          const argument = expression.arguments[index];

          if (!argument || argument.type !== 'Identifier') {
            return false;
          }

          return parameter.name === argument.name;
        });
    }

    // Check if `v-on:click="() => foo()"` can be converted
    // to `v-on:click="foo"` and report if it can.
    function verifyCanUseMethodHandlerForInlineFunction(node) {
      const { rangeWithoutQuotes, hasComment } = getVExpressionContainerTokenInfo(node.parent);

      if (ignoreIncludesComment && hasComment) {
        return false;
      }

      let idCallExpr = null;

      if (node.body.type === 'BlockStatement') {
        idCallExpr = getIdentifierCallExpression(node.body);
      } else if (isIdentifierCallExpression(node.body)) {
        idCallExpr = node.body;
      }

      if (
        (!idCallExpr || !isSameParameterAndArgument(node, idCallExpr))
        && (hasReferenceUpperElementVariable(node) || allowAnyInlineFunction)
      ) {
        // It cannot be converted to method because it refers to the variable of the element.
        // e.g. <template v-for="e in list"><button @click="() => foo(e)" /></template>
        return false;
      }

      context.report({
        node,
        messageId: idCallExpr
          ? 'preferMethodOverInlineFunction'
          : 'preferMethodOverInlineFunctionWithoutIdCall',
        fix: fixer => {
          if (
            hasComment // The function contains comment and cannot be fixed
            || !idCallExpr // The function is not a simple identifier call and cannot be fixed
          ) {
            return null;
          }

          if (!isSameParameterAndArgument(node, idCallExpr)) {
            // It is not a call with the arguments given as is
            return null;
          }

          const parameterCount = methodParameterCountMap.get(idCallExpr.callee.name);

          if (
            parameterCount != null
            && parameterCount !== idCallExpr.arguments.length
          ) {
            // The behavior of target method can change given the arguments
            return null;
          }

          return fixer.replaceTextRange(
            rangeWithoutQuotes,
            context.getSourceCode().getText(idCallExpr.callee),
          );
        },
      });

      return true;
    }

    // Report `v-on:click="() => foo()"` can be converted to `v-on:click="foo()"`
    function reportCanUseInlineHandlerForInlineFunction(node) {
      // If a function has one parameter, you can turn it into an
      // inline handler using $event. If a function has two or more
      // parameters, it cannot be easily converted to an inline handler.
      // However, users can use inline handlers by changing the payload
      // of the component's custom event. So we report it regardless of
      // the number of parameters.

      context.report({
        node,
        messageId:
          node.params.length > 1
            ? 'preferInlineOverInlineFunctionWithMultipleParams'
            : 'preferInlineOverInlineFunction',
        fix:
          node.params.length > 0
            ? null /* The function has parameters and cannot be fixed. */
            : fixer => {
              let text = context.getSourceCode().getText(node.body);

              if (node.body.type === 'BlockStatement') {
                text = text.slice(1, -1); // strip braces
              }

              return fixer.replaceText(node, text);
            },
      });
    }

    // Report for method handler
    function reportForMethodHandler(node, kind) {
      switch (kind) {
        case 'inline':
        case 'inline-function':
          context.report({
            node,
            messageId:
              kind === 'inline'
                ? 'preferInlineOverMethod'
                : 'preferInlineFunctionOverMethod',
          });

          return true;
        default:
          // This path is currently not taken
          return false;
      }
    }

    // Verify for inline handler
    function verifyForInlineHandler(node, kind) {
      switch (kind) {
        case 'method':
          return verifyCanUseMethodHandlerForInlineHandler(node);
        case 'inline-function':
          reportCanUseInlineFunctionForInlineHandler(node);
          return true;
        default:
          return false;
      }
    }

    // Verify for inline function handler
    function verifyForInlineFunction(node, kind) {
      switch (kind) {
        case 'method':
          return verifyCanUseMethodHandlerForInlineFunction(node);
        case 'inline':
          reportCanUseInlineHandlerForInlineFunction(node);
          return true;
        default:
          return false;
      }
    }

    return defineTemplateBodyVisitor(
      context,
      {
        VElement(node) {
          upperElements.add(node);
        },
        // eslint-disable-next-line object-shorthand
        'VElement:exit'(node) {
          upperElements.delete(node);
        },
        // eslint-disable-next-line max-len, object-shorthand
        "VAttribute[directive=true][key.name.name='on'][key.argument!=null] > VExpressionContainer.value:exit"(node) {
          const { expression } = node;

          if (!expression) {
            return;
          }

          switch (expression.type) {
            case 'VOnExpression': {
              // e.g. v-on:click="foo()"
              if (allows[0] === 'inline') {
                return;
              }

              for (const allow of allows) {
                if (verifyForInlineHandler(expression, allow)) {
                  return;
                }
              }

              break;
            }
            case 'Identifier': {
              // e.g. v-on:click="foo"
              if (allows[0] === 'method') {
                return;
              }

              for (const allow of allows) {
                if (reportForMethodHandler(expression, allow)) {
                  return;
                }
              }

              break;
            }
            case 'ArrowFunctionExpression':
            case 'FunctionExpression': {
              // e.g. v-on:click="()=>foo()"
              if (allows[0] === 'inline-function') {
                return;
              }

              for (const allow of allows) {
                if (verifyForInlineFunction(expression, allow)) {
                  return;
                }
              }

              break;
            }
            default:
          }
        },
        ...(allows.includes('inline-function') ? {
          // Collect $event identifiers to check for side effects
          // when converting from `v-on:click="foo($event)"` to `v-on:click="()=>foo($event)"`.

          // eslint-disable-next-line object-shorthand
          'Identifier[name="$event"]'(node) {
            $eventIdentifiers.push(node);
          },
        } : {}),
      },
      allows.includes('method') ? defineVueVisitor(context, {
        // Collect method definition with params information to check for side effects.
        // when converting from `v-on:click="foo()"` to `v-on:click="foo"`, or
        // converting from `v-on:click="() => foo()"` to `v-on:click="foo"`.

        onVueObjectEnter(node) {
          for (const method of iterateProperties(node, new Set(['methods']))) {
            if (method.type !== 'object') {
              // This branch is usually not passed.
              continue;
            }

            const { value } = method.property;

            if (['FunctionExpression', 'ArrowFunctionExpression'].includes(value.type)) {
              const parameterHasRestElement = value.params.some(parameter => {
                return parameter.type === 'RestElement';
              });
              const methodParameterCount = parameterHasRestElement
                ? Number.POSITIVE_INFINITY
                : value.params.length;

              methodParameterCountMap.set(method.name, methodParameterCount);
            }
          }
        },
      }) : {},
    );
  },
};
