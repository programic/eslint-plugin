const { getScriptSetupElement, defineScriptSetupVisitor } = require('../utils/vue-utils');

module.exports = {
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description: 'disallow imports of Vue compiler macros',
      url: 'https://github.com/programic/eslint-plugin/blob/master/docs/rules/vue-no-compiler-macro-imports.md',
    },
  },
  create(context) {
    const scriptSetup = getScriptSetupElement(context);

    if (!scriptSetup) {
      return {};
    }

    const sourceCode = context.getSourceCode();

    const compilerMacros = [
      'defineProps',
      'defineEmits',
      'defineSlots',
      'defineModel',
      'defineOptions',
      'defineExpose',
      'withDefaults',
    ];

    const reportMessage = 'Vue compiler macros do not need to be imported';
    const baseSelector = 'Program > ImportDeclaration[source.value="vue"]';
    const selector = compilerMacros.map(macro => {
      return `${baseSelector} > ImportSpecifier[imported.name="${macro}"]`;
    }).join(', ');

    return defineScriptSetupVisitor(context, {
      [selector](node) {
        context.report({
          node,
          message: reportMessage,
          fix: fixer => {
            const fixes = [fixer.remove(node)];

            const importDeclaration = node.parent;
            const specifierIndex = importDeclaration.specifiers.indexOf(node);
            const nextSpecifier = importDeclaration.specifiers[specifierIndex + 1];

            if (nextSpecifier) {
              const tokensBetween = sourceCode.getTokensBetween(node, nextSpecifier);

              tokensBetween.forEach(token => {
                fixes.push(fixer.remove(token));
              });
            }

            return fixes;
          },
        });
      },
    });
  },
};
