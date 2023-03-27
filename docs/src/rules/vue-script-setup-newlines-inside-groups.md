# @programic/vue-script-setup-newlines-inside-groups

> Enforce newlines inside groups in Vue script setup tags

- :hammer: This rule is **not** automatically fixable
- :information_source: This rule only works when using the Composition API and script setup tags
- :information_source: This rule assumes you are using the `@programic/vue-script-setup-order` rule
- :warning: This rule can give false positives when the script setup code is not in the right order (the specified order of `@programic/vue-script-setup-order`)

## :book: Rule details
This rule enforces newlines inside groups in Vue script setup tag.

Below are the different groups:
1. States (`Any variable that is not part of another group`)
2. Computed properties (`computed`)
3. Watchers (`watch`, `watchEffect`, `watchSyncEffect`, `watchPostEffect`)
4. Lifecycle hooks (`onMounted`, `onUpdated`, `onUnmounted`, `onBeforeMount`, `onBeforeUpdate`, `onBeforeUnmount`, `onErrorCaptured`, `onRenderTracked`, `onRenderTriggered`, `onActivated`, `onDeactivated`, `onServerPrefetch`)
5. Methods (`Any function statement`)

## :gear: Options
```json
{
  "@programic/vue-script-setup-newlines-inside-groups": ["error", {
    "numberOfNewlinesBetweenSingleLineItems": 0,
    "numberOfNewlinesBetweenSingleAndMultiLineItems": 0,
    "numberOfNewlinesBetweenMultiLineItems": 0
  }]
}
```

- `numberOfNewlinesBetweenSingleLineItems` (`integer`) ... The number of newlines that are enforced between single line items. Default is 0.
- `numberOfNewlinesBetweenSingleAndMultiLineItems` (`integer`) ... The number of newlines that are enforced between single line and multi line items. Default is 0.
- `numberOfNewlinesBetweenMultiLineItems` (`integer`) ... The number of newlines that are enforced between multi line items. Default is 0.
