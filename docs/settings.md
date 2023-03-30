# Shared plugin settings
Some rules use a shared configuration. You can change the configuration via the `settings` option. See example below.

*Note: If you provide an invalid setting, the default will be used.*

## Default configuration
```json
{
  "plugins": [
    "Programic"
  ],

  "settings": {
    "programic": {
      "vue": {
        "groupOrder": [
          "imports",
          "defineProps",
          "defineEmits",
          "states",
          "computedProperties",
          "watchers",
          "hooks",
          "methods",
          "defineExpose"
        ],
        "piniaGroupOrder": [
          "states",
          "computedProperties",
          "watchers",
          "methods",
        ],
        "extendedComputedProperties": {},
        "extendedWatchers": {},
        "extendedHooks": {}
      }
    }
  }
}
```

## Options
- **`groupOrder` (`string[]`) ... The group order that will be used in Vue components (inside `script setup` tag).**
  When providing this option, you must declare every group type (like the example above). The order is up to you. If you declare this option the wrong way, the default will be used. Default is above.

- **`piniaGroupOrder` (`string[]`) ... The group order that will be used in Pinia setup functions.**
  When providing this option, you must declare every group type (like the example above). The order is up to you. If you declare this option the wrong way, the default will be used. Default is above.

- **`extendedComputedProperties` (`ExtendedModules` type info below) ... Extended computed property functions from other libraries.**
  Sometimes you use a framework or library that use Composition API code to create a wrapper function. For example, `VueUse` has functions like `computedAsync` and `reactiveComputed`. This kind of functions must be considered as computed properties in our rules that use Vue/Pinia groups. You can include these functions via this option. In the section below you can find out how.

- **`extendedWatchers` (`ExtendedModules` type info below) ... Extended watcher functions from other libraries.**
  Sometimes you use a framework or library that use Composition API code to create a wrapper function. For example, `VueUse` has functions like `watchThrottled` and `watchPausable`. This kind of functions must be considered as watchers in our rules that use Vue/Pinia groups. You can include these functions via this option. In the section below you can find out how.

- **`extendedHooks` (`ExtendedModules` type info below) ... Extended hook functions from other libraries.**
  Sometimes you use a framework or library that use Composition API code to create a wrapper function. For example, `VueRouter` has his own hooks like `onBeforeRouteLeave` and `onBeforeRouteUpdate`. This kind of functions must be considered as hooks in our rules that use Vue/Pinia groups. You can include these functions via this option. In the section below you can find out how.

```typescript
// This must be the exact library name, e.g. 'vue-router'
type LibraryName = string;

// The functions that will be imported from the library
type ModuleFunctionNames = string[];

type ExtendedModule = Record<LibraryName, ModuleFunctionNames>;
```

## How to configure extended library functions (example)
```json
{
  "plugins": [
    "Programic"
  ],

  "settings": {
    "programic": {
      "vue": {
        "extendedComputedProperties": {
          "vueuse": [
            "computedAsync",
            "computedEager",
            "computedInject",
            "computedWithControl",
            "reactiveComputed"
          ]
        },
        "extendedWatchers": {
          "vueuse": [
            "until",
            "watchArray",
            "watchAtMost",
            "watchDebounced",
            "watchDeep",
            "watchIgnorable",
            "watchImmediate",
            "watchOnce",
            "watchPausable",
            "watchThrottled",
            "watchTriggerable",
            "watchWithFilter",
            "whenever"
          ]
        },
        "extendedHooks": {
          "vue-router": [
            "onBeforeRouteLeave",
            "onBeforeRouteUpdate"
          ],
          "nuxt": [
            "onNuxtReady"
          ]
        }
      }
    }
  }
}
```

## Configuration usage per rule
|                                                       | groupOrder         | piniaGroupOrder    | extendedComputedProperties | extendedWatchers   | extendedHooks      |
|-------------------------------------------------------|--------------------|--------------------|----------------------------|--------------------|--------------------|
| `@programic/vue-script-setup-order`                   | :white_check_mark: | :x:                | :white_check_mark:         | :white_check_mark: | :white_check_mark: |
| `@programic/vue-script-setup-newlines-between-groups` | :white_check_mark: | :x:                | :white_check_mark:         | :white_check_mark: | :white_check_mark: |
| `@programic/vue-script-setup-newlines-inside-groups`  | :white_check_mark: | :x:                | :white_check_mark:         | :white_check_mark: | :white_check_mark: |
| `@programic/pinia-setup-order`                        | :x:                | :white_check_mark: | :white_check_mark:         | :white_check_mark: | :x:                |
| `@programic/pinia-setup-newlines-between-groups`      | :x:                | :white_check_mark: | :white_check_mark:         | :white_check_mark: | :x:                |
| `@programic/pinia-setup-newlines-inside-groups`       | :x:                | :white_check_mark: | :white_check_mark:         | :white_check_mark: | :x:                |
