const { getNumbersBetween } = require('./helpers');

function isVariableNode(node) {
  return node?.type === 'VariableDeclaration' || (
    node?.type === 'VariableDeclarator' && node?.parent?.type === 'VariableDeclaration'
  );
}

function isFunctionNode(node) {
  return [
    'ArrowFunctionExpression',
    'FunctionDeclaration',
    'FunctionExpression',
  ].includes(node?.type);
}

function isFunctionDeclarationNode(node) {
  return node?.type === 'FunctionDeclaration';
}

function getParentNode(node) {
  return node?.parent;
}

function getAncestorNode(node, isAncestorCallback) {
  let currentNode = node;

  while (currentNode && currentNode.type !== 'Program') {
    currentNode = currentNode?.parent;

    if (isAncestorCallback(currentNode)) {
      return currentNode;
    }
  }

  return null;
}

function getCommentTokensBetween(context, node1, node2) {
  const sourceCode = context.getSourceCode();

  if (sourceCode.commentsExistBetween(node1, node2)) {
    const filterTokens = token => {
      return ['Block', 'Line'].includes(token.type)
        && token.loc.start.line > node1.loc.end.line
        && token.loc.end.line < node2.loc.start.line;
    };
    const skipOptions = { includeComments: true, filter: filterTokens };

    return sourceCode.getTokensBetween(node1, node2, skipOptions);
  }

  return [];
}

function getNumberOfEmptyLinesBetween(context, node1, node2, ignoreComments = false) {
  const sourceCode = context.getSourceCode();
  const linesBetween = sourceCode.lines.slice(
    node1.loc.end.line,
    node2.loc.start.line - 1,
  );
  const ignoreLines = [];

  if (ignoreComments && sourceCode.commentsExistBetween(node1, node2)) {
    const commentTokens = getCommentTokensBetween(context, node1, node2);

    ignoreLines.push(...new Set(commentTokens.flatMap(commentToken => {
      return getNumbersBetween(commentToken.loc.start.line, commentToken.loc.end.line, true);
    })));
  }

  return linesBetween.filter((line, index) => {
    const actualLineNumber = node1.loc.end.line + index + 1;

    return !ignoreLines.includes(actualLineNumber) && line.trim().length <= 0;
  }).length;
}

module.exports = {
  getParentNode,
  isVariableNode,
  isFunctionNode,
  getAncestorNode,
  getCommentTokensBetween,
  isFunctionDeclarationNode,
  getNumberOfEmptyLinesBetween,
};
