# @programic/pinia-no-function-variable-declarations

> Disallows function expressions inside Pinia store setup definition

- :hammer: This rule is **not** automatically fixable
- :information_source: This rule assumes you are using Pinia stores

## :book: Rule details
This rule disallows function expressions inside Pinia store setup definition, instead use function statements. This will increase readability in Composition API code.

Incorrect:
```javascript
import { defineStore } from 'pinia';

const useAuthStore = defineStore('auth', () => {
  const getCurrentUser = function () { /**/ };
  const getCurrentUser = () => { /**/ };
});
```

Correct:
```javascript
import { defineStore } from 'pinia';

const useAuthStore = defineStore('auth', () => {
  function getCurrentUser() {
    /**/
  }
});
```

## :gear: Options
Nothing.

