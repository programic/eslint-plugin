# @programic/vue-script-setup-order

> Enforce a specific order in Vue components inside the script setup tag

- :hammer: This rule is **not** automatically fixable
- :information_source: This rule only works when using the Composition API and script setup tags

## :book: Rule details
This rule enforces a specific order in Vue components inside the script setup tag, so that the components remain consistent and developers always know where to look.

The order is seperated into multiple groups. The default group order is:
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

You can change the order via the `settings` options. Please read the [settings docs](https://github.com/programic/eslint-plugin/blob/master/docs/settings.md).

Note: only direct children of the script setup root will be included by this rule.

## :gear: Options
Nothing.
