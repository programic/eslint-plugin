# @programic/typescript-explicit-module-boundary-types

> Require explicit return and argument types on exported functions' and classes' public class methods

- :hammer: This rule is **not** automatically fixable

## :book: Rule details
This rule is the same as the `@typescript-eslint/explicit-module-boundary-types`, but it replaced the `allowedNames` option with `allowedPatterns` option. This is useful when you want to allow specific patterns with Regex.

## :gear: Options
```json
{
  "@programic/typescript-explicit-function-return-type": ["error", {
    "allowDirectConstAssertionInArrowFunctions": true,
    "allowArgumentsExplicitlyTypedAsAny": false,
    "allowTypedFunctionExpressions": true,
    "allowHigherOrderFunctions": true,
    "allowedPatterns": []
  }]
}
```

- `allowDirectConstAssertionInArrowFunctions` (`boolean`)

  Whether to ignore return type annotations on body-less arrow functions that return an `as const` type assertion.

  You must still type the parameters of the function. Default is above.

- `allowArgumentsExplicitlyTypedAsAny` (`boolean`)

  Whether to ignore arguments that are explicitly typed as `any`. Default is above.

- `allowTypedFunctionExpressions` (`boolean`)

  Whether to ignore type annotations on the variable of a function expression. Default is above.

- `allowHigherOrderFunctions` (`boolean`)

  Whether to ignore return type annotations on functions immediately returning another function expression.

  You must still type the parameters of the function. Default is above.

- `allowedPatterns` (`string[]`)

  An array of function/method pattern names that will not have their arguments or return values checked. Default is above.
