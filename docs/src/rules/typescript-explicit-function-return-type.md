# @programic/typescript-explicit-function-return-type

> Require explicit return and argument types on exported functions' and classes' public class methods

- :hammer: This rule is **not** automatically fixable

## :book: Rule details
This rule is the same as the `@typescript-eslint/explicit-function-return-type`, but it replaced the `allowedNames` option with `allowedPatterns` option. This is useful when you want to allow specific patterns with Regex.

## :gear: Options
```json
{
  "@programic/typescript-explicit-function-return-type": ["error", {
    "allowConciseArrowFunctionExpressionsStartingWithVoid": false,
    "allowDirectConstAssertionInArrowFunctions": true,
    "allowFunctionsWithoutTypeParameters": false,
    "allowTypedFunctionExpressions": true,
    "allowHigherOrderFunctions": true,
    "allowExpressions": false,
    "allowedPatterns": [],
    "allowIIFEs": false
  }]
}
```

- `allowConciseArrowFunctionExpressionsStartingWithVoid` (`boolean`)

  Whether to allow arrow functions that start with the `void` keyword. Default is above.

- `allowDirectConstAssertionInArrowFunctions` (`boolean`)

  Whether to ignore arrow functions immediately returning a `as const` value. Default is above.

- `allowFunctionsWithoutTypeParameters` (`boolean`)

  Whether to ignore functions that don't have generic type parameters. Default is above.

- `allowTypedFunctionExpressions` (`boolean`)

  Whether to ignore type annotations on the variable of function expressions. Default is above.

- `allowHigherOrderFunctions` (`boolean`)

  Whether to ignore functions immediately returning another function expression. Default is above.

- `allowExpressions` (`boolean`)

  Whether to ignore function expressions (functions which are not part of a declaration). Default is above.

- `allowedPatterns` (`string[]`)

  An array of function/method pattern names that will not have their arguments or return values checked. Default is above.

- `allowIIFEs` (`boolean`)

  Whether to ignore immediately invoked function expressions (IIFEs). Default is above.
