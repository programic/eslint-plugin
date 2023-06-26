# @programic/vue-script-setup-newlines-between-groups

> Enforce newlines between groups in Vue script setup tags

- :hammer: This rule is **not** automatically fixable
- :information_source: This rule only works when using the Composition API and script setup tags
- :information_source: This rule assumes you are using the `@programic/vue-script-setup-order` rule
- :warning: This rule can give false positives when the script setup code is not in the right order (enforced by `@programic/vue-script-setup-order`)

## :book: Rule details
This rule enforces newlines between groups in Vue script setup tag.

Below are the different groups (default):
1. Import declarations
2. Models (`defineModel`)
3. Props (`defineProps`)
4. Emits (`defineEmits`)
5. Slots (`defineSlots`)
6. States (`Any variable that is not part of another group`)
7. Computed properties (`computed`)
8. Watchers (`watch`, `watchEffect`, `watchSyncEffect`, `watchPostEffect`)
9. Lifecycle hooks (`onMounted`, `onUpdated`, `onUnmounted`, `onBeforeMount`, `onBeforeUpdate`, `onBeforeUnmount`, `onErrorCaptured`, `onRenderTracked`, `onRenderTriggered`, `onActivated`, `onDeactivated`, `onServerPrefetch`)
10. Methods (`Any function statement`)
11. Expose (`defineExpose`)
12. Options (`defineOptions`)

The order of the groups is determined by the settings object. Please read the [settings docs](https://github.com/programic/eslint-plugin/blob/master/docs/settings.md).

Note: only direct children of the script setup root will be included by this rule.

## :gear: Options
```json
{
  "@programic/vue-script-setup-newlines-between-groups": ["error", {
    "numberOfNewlines": 1
  }]
}
```

- `numberOfNewlines` (`integer`) ... The number of newlines that are enforced between groups. Default is 1.
