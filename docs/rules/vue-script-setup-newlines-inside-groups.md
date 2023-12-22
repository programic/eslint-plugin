# @programic/vue-script-setup-newlines-inside-groups

> Enforce newlines inside groups in Vue script setup tags

- :hammer: This rule is **not** automatically fixable
- :information_source: This rule only works when using the Composition API and script setup tags
- :information_source: This rule assumes you are using the `@programic/vue-script-setup-order` rule
- :warning: This rule only works when the script setup code is in the right order (enforced by `@programic/vue-script-setup-order`). If it's not in the right order, this rule will **not** produce any errors.

## :book: Rule details
This rule enforces newlines inside groups in Vue script setup tag.

Below are the different groups (default):
1. defineModel (`Any variable that is not part of another group`)
2. States (`Any variable that is not part of another group`)
3. Computed properties (`computed`)
4. Watchers (`watch`, `watchEffect`, `watchSyncEffect`, `watchPostEffect`)
5. Lifecycle hooks (`onMounted`, `onUpdated`, `onUnmounted`, `onBeforeMount`, `onBeforeUpdate`, `onBeforeUnmount`, `onErrorCaptured`, `onRenderTracked`, `onRenderTriggered`, `onActivated`, `onDeactivated`, `onServerPrefetch`)
6. Methods (`Any function statement`)

The order of the groups is determined by the settings object. Please read the [settings docs](https://github.com/programic/eslint-plugin/blob/master/docs/settings.md).

## :gear: Options
You can set the `newlines` option to set the number of expected newlines for all groups. If you want to make an exception for a group, you can set the `{groupType}` option. See example below.

```json
{
  "@programic/vue-script-setup-newlines-inside-groups": ["error", {
    "newlines": {
      "numberOfNewlinesBetweenSingleLineItems": 0,
      "numberOfNewlinesBetweenSingleAndMultiLineItems": 0,
      "numberOfNewlinesBetweenMultiLineItems": 0
    },
    "defineModel": {
      "numberOfNewlinesBetweenSingleLineItems": 0,
      "numberOfNewlinesBetweenSingleAndMultiLineItems": 0,
      "numberOfNewlinesBetweenMultiLineItems": 0
    },
    "states": {
      "numberOfNewlinesBetweenSingleLineItems": 0,
      "numberOfNewlinesBetweenSingleAndMultiLineItems": 0,
      "numberOfNewlinesBetweenMultiLineItems": 0
    },
    "computedProperties": {
      "numberOfNewlinesBetweenSingleLineItems": 0,
      "numberOfNewlinesBetweenSingleAndMultiLineItems": 0,
      "numberOfNewlinesBetweenMultiLineItems": 0
    },
    "watchers": {
      "numberOfNewlinesBetweenSingleLineItems": 0,
      "numberOfNewlinesBetweenSingleAndMultiLineItems": 0,
      "numberOfNewlinesBetweenMultiLineItems": 0
    },
    "hooks": {
      "numberOfNewlinesBetweenSingleLineItems": 0,
      "numberOfNewlinesBetweenSingleAndMultiLineItems": 0,
      "numberOfNewlinesBetweenMultiLineItems": 0
    },
    "methods": {
      "numberOfNewlinesBetweenSingleLineItems": 1,
      "numberOfNewlinesBetweenSingleAndMultiLineItems": 1,
      "numberOfNewlinesBetweenMultiLineItems": 1
    }
  }]
}
```

- `numberOfNewlinesBetweenSingleLineItems` (`integer`) ... The number of newlines that are enforced between single line items. For every group except `methods`, the default is `0`. For `methods` the default is `1`.
- `numberOfNewlinesBetweenSingleAndMultiLineItems` (`integer`) ... The number of newlines that are enforced between single line and multi line items. For every group except `methods`, the default is `0`. For `methods` the default is `1`.
- `numberOfNewlinesBetweenMultiLineItems` (`integer`) ... The number of newlines that are enforced between multi line items. For every group except `methods`, the default is `0`. For `methods` the default is `1`.
