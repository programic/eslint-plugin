# @programic/pinia-setup-order

> Enforce a specific order in Pinia store setup definitions

- :hammer: This rule is **not** automatically fixable
- :information_source: This rule assumes you are using Pinia stores

## :book: Rule details
This rule enforces a specific order in in Pinia store setup definitions, so that the stores remain consistent and developers always know where to look.

The order is seperated into multiple groups. The default group order is:
1. States (`Any variable that is not part of another group`)
2. Computed properties (`computed`)
3. Watchers (`watch`, `watchEffect`, `watchSyncEffect`, `watchPostEffect`)
4. Methods (`Any function statement`)

## :gear: Options
```json
{
  "@programic/pinia-setup-order": ["error", {
    "order": [
      "states",
      "computedProperties",
      "watchers",
      "methods"
    ]
  }]
}
```

- `order` (`string[]`) ... The groups order.

  Every group must exist in the given order array. Default is above.

