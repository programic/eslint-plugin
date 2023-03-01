# @programic/vue-script-setup-order

> Enforce a specific order in Vue components inside the script setup tag

- :hammer: This rule is **not** automatically fixable
- :information_source: This rule only works when using the Composition API and script setup tags

## :book: Rule details
This rule enforces a specific order in Vue components inside the script setup tag, so that the components remain consistent and developers always know where to look.

The order is seperated into multiple groups. The default group order is:
1. Import declarations
2. Props (`defineProps`)
3. Emits (`defineEmits`)
4. States (`Any variable that is not part of another group`)
5. Computed properties (`computed`)
6. Watchers (`watch`, `watchEffect`, `watchSyncEffect`, `watchPostEffect`)
7. Lifecycle hooks (`onMounted`, `onUpdated`, `onUnmounted`, `onBeforeMount`, `onBeforeUpdate`, `onBeforeUnmount`, `onErrorCaptured`, `onRenderTracked`, `onRenderTriggered`, `onActivated`, `onDeactivated`, `onServerPrefetch`)
8. Methods (`Any function statement`)

## :gear: Options
Nothing.

