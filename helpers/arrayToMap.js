module.exports.arrayToMap = arrayToMap;

function arrayToMap(arr, keyResolver = (x) => x) {
  return arr.reduce((acc, cur) => ({ ...acc, [keyResolver(cur)]: cur }), {});
}
