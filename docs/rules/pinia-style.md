# @programic/pinia-style

> Enforce a specific Pinia store definition style

- :hammer: This rule is **not** automatically fixable
- :information_source: This rule assumes you are using Pinia stores

## :book: Rule details
This rule enforce a specific Pinia store definition style, so that the stores remain consistent and developers always know where to look.

## :gear: Options
Default is set to `setup`.

```json
{
  "@programic/pinia-style": ["error", "setup" | "options"]
}
```

- `"setup"` (default) ... ensure using the Composition API style.
- `"options"` ... ensure using the Options API style.
