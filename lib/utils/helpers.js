function upperFirst(givenString) {
  return givenString.charAt(0).toUpperCase() + givenString.slice(1);
}

function arrayWrap(value) {
  return Array.isArray(value) ? value : [value];
}

function objectGet(givenObject, path, defaultValue) {
  if (!path) {
    return undefined;
  }

  const pathArray = Array.isArray(path) ? path : path.match(/([^.[\]])+/g);

  // eslint-disable-next-line unicorn/no-array-reduce
  const result = pathArray.reduce((previousObject, key) => {
    return previousObject && previousObject[key];
  }, givenObject);

  return result === undefined ? defaultValue : result;
}

function getNumbersBetween(startNumber, endNumber, includeStartAndEnd = false) {
  let initialStart = startNumber;
  let length = (endNumber - initialStart) - 1;

  if (includeStartAndEnd) {
    initialStart -= 1;
    length = endNumber - initialStart;
  }

  return Array.from({ length }, (value, index) => {
    return (initialStart + index) + 1;
  });
}

module.exports = {
  arrayWrap,
  objectGet,
  upperFirst,
  getNumbersBetween,
};
