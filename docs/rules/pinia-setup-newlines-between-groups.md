# @programic/pinia-setup-newlines-between-groups

> Enforce newlines between groups in Pinia store setup definitions

- :hammer: This rule is **not** automatically fixable
- :information_source: This rule only works when using the Composition API and Pinia stores
- :information_source: This rule assumes you are using the `@programic/pinia-setup-order` rule
- :warning: This rule can give false positives when the setup definition code is not in the right order (enforced by `@programic/pinia-setup-order`)

## :book: Rule details
This rule enforces newlines between groups in Pinia store setup definitions.

Below are the different groups (default):
1. States (`Any variable that is not part of another group`)
2. Computed properties (`computed`)
3. Watchers (`watch`, `watchEffect`, `watchSyncEffect`, `watchPostEffect`)
4. Methods (`Any function statement`)

The order of the groups is determined by the settings object. Please read the [settings docs](https://github.com/programic/eslint-plugin/blob/master/docs/settings.md).

Note: only direct children of the store setup function root will be included by this rule.

## :gear: Options
```json
{
  "@programic/pinia-setup-newlines-between-groups": ["error", {
    "numberOfNewlines": 1
  }]
}
```

- `numberOfNewlines` (`integer`) ... The number of newlines that are enforced between groups. Default is 1.
