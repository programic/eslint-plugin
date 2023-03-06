# @programic/vue-no-function-expressions

> Disallows function expressions inside Vue script setup tag

- :hammer: This rule is **not** automatically fixable
- :information_source: This rule only works when using the Composition API and script setup tags

## :book: Rule details
This rule disallows function expressions inside Vue script setup tag, instead use function statements. This will increase readability in Composition API code.

Incorrect:
```vue
<script setup>
  const mapUser = function () { /**/ };
  const mapUser = () => { /**/ };
</script>
```

Correct:
```vue
<script setup>
  function mapUser() {
    /**/
  }
</script>
```

## :gear: Options
Nothing.

