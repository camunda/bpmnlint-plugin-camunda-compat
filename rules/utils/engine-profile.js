/**
 * Strip patch version of a major.minor.patch
 * semver identifier.
 *
 * @param {String|null} string
 * @return {String|null}
 */
module.exports.toSemverMinor = function(string) {
  return string && string.split(/\./).slice(0, 2).join('.');
};