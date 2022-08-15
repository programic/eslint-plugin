module.exports = {
  getNumberOfEmptyLinesBetween(context, node1, node2) {
    const sourceCode = context.getSourceCode();
    const linesBetweenImports = sourceCode.lines.slice(
      node1.loc.end.line,
      node2.loc.start.line - 1,
    );

    return linesBetweenImports.filter(line => {
      return line.trim().length <= 0;
    }).length;
  },
};
