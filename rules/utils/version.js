const cmp = require('semver-compare');

module.exports.greaterOrEqual = function(a, b) {
  return cmp(a, b) !== -1;
};