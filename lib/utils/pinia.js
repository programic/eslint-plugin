const {
  isVariableNode,
  isFunctionNode,
  getAncestorNode,
  isFunctionCallNode,
  isFunctionDeclarationNode,
} = require('./nodes');
const { arrayWrap } = require('./helpers');
const { getStateNodesThatAreAbsentInOtherGroups } = require('./groups');

function isStoreRootNode(storeSetupFunctionNode, node) {
  if (isVariableNode(node?.parent) || isFunctionCallNode(node?.parent)) {
    const possibleParentRootNodes = [
      node?.parent?.parent?.parent,
      node?.parent?.parent?.parent?.parent,
    ];

    return possibleParentRootNodes.includes(storeSetupFunctionNode);
  }

  return node?.parent === storeSetupFunctionNode;
}

function isValidStoreDefinition(node) {
  if (node.arguments.length > 1) {
    const storeDefinerNode = node.arguments[1];

    return isFunctionNode(storeDefinerNode)
      && Array.isArray(storeDefinerNode?.body?.body);
  }

  return false;
}

function getChildNodesInStoreSetup(node) {
  if (isValidStoreDefinition(node)) {
    return node.arguments[1].body.body;
  }

  return [];
}

function getFilledStoreDefinitions(storeDefinitions) {
  return storeDefinitions.map(storeDefinition => {
    return {
      ...storeDefinition,
      groupedNodes: {
        ...storeDefinition.groupedNodes,
        states: getStateNodesThatAreAbsentInOtherGroups(storeDefinition.groupedNodes),
      },
    };
  }).filter(storeDefinition => {
    return Object.values(storeDefinition.groupedNodes).flat().length > 0;
  });
}

function addNodeToStoreDefinition(storeDefinitions, node, groupType) {
  const storeItem = storeDefinitions.find(storeDefinition => {
    const { storeSetupNode } = storeDefinition;
    const storeSetupFunction = storeSetupNode.arguments[1];
    const isAncestorCallback = ancestor => ancestor === storeSetupFunction;

    return isStoreRootNode(storeSetupFunction, node)
      && !!getAncestorNode(node, isAncestorCallback);
  });

  if (storeItem && Array.isArray(storeItem.groupedNodes[groupType])) {
    storeItem.groupedNodes[groupType].push(node);
  }
}

function getGroupedNodesInStoreSetup(storeSetupFunctionBody, initialGroupedNodes) {
  const groupedNodes = initialGroupedNodes;

  storeSetupFunctionBody.forEach(node => {
    if (isVariableNode(node)) {
      const isVariableDeclaration = node.type === 'VariableDeclaration';
      const variableNodes = arrayWrap(isVariableDeclaration ? node.declarations : node);

      groupedNodes.states.push(...variableNodes);
    }

    if (isFunctionDeclarationNode(node)) {
      groupedNodes.methods.push(node);
    }
  });

  return groupedNodes;
}

module.exports = {
  isStoreRootNode,
  isValidStoreDefinition,
  addNodeToStoreDefinition,
  getChildNodesInStoreSetup,
  getFilledStoreDefinitions,
  getGroupedNodesInStoreSetup,
};
