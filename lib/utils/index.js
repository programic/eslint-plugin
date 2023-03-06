const { ReferenceTracker } = require('eslint-utils');

const initialModuleTraceMap = Object.freeze({
  [ReferenceTracker.ESM]: true,
});
const traceModuleReferenceCall = Object.freeze({
  [ReferenceTracker.CALL]: true,
});

const piniaDefineStoreTraceMap = Object.freeze({
  pinia: {
    ...initialModuleTraceMap,
    defineStore: { ...traceModuleReferenceCall },
  },
});

const upperFirst = givenString => {
  return givenString.charAt(0).toUpperCase() + givenString.slice(1);
};

const isVariableNode = node => {
  return node?.type === 'VariableDeclaration' || (
    node?.type === 'VariableDeclarator' && node?.parent?.type === 'VariableDeclaration'
  );
};

const isFunctionNode = node => {
  return [
    'ArrowFunctionExpression',
    'FunctionDeclaration',
    'FunctionExpression',
  ].includes(node?.type);
};

const isFunctionDeclarationNode = node => {
  return node?.type === 'FunctionDeclaration';
};

const getParentNode = node => {
  return node?.parent;
};

const getAncestorNode = (node, isAncestorCallback) => {
  let currentNode = node;

  while (currentNode && currentNode.type !== 'Program') {
    currentNode = currentNode?.parent;

    if (isAncestorCallback(currentNode)) {
      return currentNode;
    }
  }

  return null;
};

const getNumberOfEmptyLinesBetween = (context, node1, node2) => {
  const sourceCode = context.getSourceCode();
  const linesBetweenImports = sourceCode.lines.slice(
    node1.loc.end.line,
    node2.loc.start.line - 1,
  );

  return linesBetweenImports.filter(line => {
    return line.trim().length <= 0;
  }).length;
};

module.exports = {
  upperFirst,
  getParentNode,
  isVariableNode,
  isFunctionNode,
  getAncestorNode,
  initialModuleTraceMap,
  traceModuleReferenceCall,
  piniaDefineStoreTraceMap,
  isFunctionDeclarationNode,
  getNumberOfEmptyLinesBetween,
};
