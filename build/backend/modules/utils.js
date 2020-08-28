const deepCopy = (source) => JSON.parse(JSON.stringify(source));

const mapValues = (input, map) => {
  const entries = Object.entries(input);
  const output = {};
  for (const entry of entries) {
    const key = entry[0];
    const value = entry[1];
    output[key] = map(value, key, input);
  }
  return output;
};

export {
  deepCopy, mapValues
};
