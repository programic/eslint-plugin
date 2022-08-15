# @programic/eslint-plugin

[![npm version](https://badge.fury.io/js/@programic%2Feslint-plugin.svg)](https://badge.fury.io/js/@programic%2Feslint-plugin)

This package contains Programic's custom rules that we were missing in existing plugins.

## Usage

1. Install `@programic/eslint-plugin` as a dev dependency in your project with npm or yarn along with ESLint:

  ```sh
  npm install eslint @programic/eslint-plugin --save-dev
  ```
  ```sh
  yarn add eslint @programic/eslint-plugin --dev
  ```

2. Add `"@programic"` (or `"@programic/eslint-plugin"`) to `plugins` in your .eslintrc.

3. Add the rules you want to use to your .eslintrc, like this:

  ```json
  {
    "rules": {
      "@programic/newline-before-first-type-import": "error",
      "@programic/dom-class-no-capital-letters": "error"
    }
}
  ```

4. Add a lint script to your package.json: `eslint . --ext .js,.jsx` so you can run `npm run lint` or `yarn lint`. The `.` can be replaced with the path to your files and the value for the flag `--ext` can be replaced by a comma seperated list of the file extensions you want to lint. Replace the lint script if it already exists.
