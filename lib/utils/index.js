const unicodeWords = require('./unicode-words').default;

const upperFirst = givenString => {
  return givenString.charAt(0).toUpperCase() + givenString.slice(1);
};

const words = (givenString, pattern) => {
  const hasUnicodeWord = RegExp.prototype.test
    // eslint-disable-next-line unicorn/better-regex
    .bind(/[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/);

  // Used to match words composed of alphanumeric characters
  // eslint-disable-next-line no-control-regex, unicorn/escape-case
  const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

  const asciiWords = otherString => {
    return otherString.match(reAsciiWord);
  };

  if (pattern === undefined) {
    const result = hasUnicodeWord(givenString)
      ? unicodeWords(givenString)
      : asciiWords(givenString);

    return result || [];
  }

  return givenString.match(pattern) || [];
};

const isVariableNode = node => {
  return node?.type === 'VariableDeclaration' || (
    node?.type === 'VariableDeclarator' && node?.parent?.type === 'VariableDeclaration'
  );
};

const isFunctionNode = node => {
  return ['FunctionExpression', 'ArrowFunctionExpression'].includes(node?.type);
};

const getParentNode = node => {
  return node?.parent;
};

const getVariableAncestorNode = node => {
  let currentNode = node;

  while (currentNode && currentNode.type !== 'Program') {
    currentNode = currentNode?.parent;

    if (isVariableNode(currentNode)) {
      return currentNode.parent;
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
  words,
  upperFirst,
  isVariableNode,
  isFunctionNode,
  getParentNode,
  getVariableAncestorNode,
  getNumberOfEmptyLinesBetween,
};
