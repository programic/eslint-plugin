# @programic/vue-no-compiler-macro-imports

> Disallow imports of Vue compiler macros

- :hammer: This rule is automatically fixable
- :information_source: You should only include this rule when using the Composition API and script setup tags

## :book: Rule details
This rule disallows importing Vue compiler macros. They do not need to be imported, because they are compiled away when `<script setup>` is processed.

## :gear: Options
Nothing.

