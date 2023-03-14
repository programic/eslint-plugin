> :warning: This package is deprecated. Use `@programic/eslint-plugin` instead.

# @programic/eslint-plugin

[![npm version](https://badge.fury.io/js/@programic%2Feslint-plugin.svg)](https://badge.fury.io/js/@programic%2Feslint-plugin)

This package contains Programic's code styling presets and our own custom rules that we were missing in existing plugins.

## Usage

1. Install `@programic/eslint-plugin` as a dev dependency in your project with npm or yarn along with ESLint:

  ```sh
  npm install eslint @programic/eslint-plugin --save-dev
  ```
  ```sh
  yarn add eslint @programic/eslint-plugin --dev
  ```

2. Add `"@programic"` (or `"@programic/eslint-plugin"`) to `plugins` in your .eslintrc.

3. [Optional] Extend one of our presets, like this `"extends": ["plugin:programic/typescript-vue"]`

4. [Optional] You can add the custom rules you need to your .eslintrc, like this:

  ```json
  {
    "rules": {
      "@programic/newline-before-first-type-import": "error",
      "@programic/dom-class-no-capital-letters": "error"
    }
}
  ```

5. Add a lint script to your package.json: `eslint . --ext .js,.jsx` so you can run `npm run lint` or `yarn lint`. The `.` can be replaced with the path to your files and the value for the flag `--ext` can be replaced by a comma seperated list of the file extensions you want to lint. Replace the lint script if it already exists.

## Setup requirements
Before using any config or rule from this package, you should include the necessary packages.

### Configs

|                                   | base    | typescript | vue     | vue-typescript |
|-----------------------------------|---------|------------|---------|----------------|
| eslint                            | ^8.2.0  | ^8.2.0     | ^8.2.0  | ^8.2.0         |
| eslint-plugin-import              | ^2.27.5 | ^2.27.5    | ^2.27.5 | ^2.27.5        |
| eslint-plugin-import-newlines     | ^1.3.1  | ^1.3.1     | ^1.3.1  | ^1.3.1         |
| eslint-plugin-unicorn             | ^45.0.2 | ^45.0.2    | ^45.0.2 | ^45.0.2        |
| eslint-config-airbnb-base         | ^15.0.0 | ^15.0.0    | ^15.0.0 | ^15.0.0        |
| typescript                        | -       | ^4.9.5     | -       | ^4.9.5         |
| @typescript-eslint/eslint-plugin  | -       | ^5.53.0    | -       | ^5.53.0        |
| @typescript-eslint/parser         | -       | ^5.53.0    | -       | ^5.53.0        |
| eslint-import-resolver-typescript | -       | ^3.5.3     | -       | ^3.5.3         |
| vue                               | -       | -          | ^3.2.45 | ^3.2.45        |
| eslint-plugin-vue                 | -       | -          | ^9.9.0  | ^9.9.0         |
| vue-eslint-parser                 | -       | -          | ^9.1.0  | ^9.1.0         |

You can find out for yourself which packages mentioned above are required per custom rule. For example, any TypeScript related rules requires the TypeScript ESLint packages (mentioned above) and any Vue related rule requires the Vue ESlint packages (mentioned above).
