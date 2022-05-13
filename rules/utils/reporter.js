const { isArray } = require('min-dash');

module.exports.reportErrors = function(node, reporter, errors) {
  if (!isArray(errors)) {
    errors = [ errors ];
  }

  errors.forEach(({ message, ...options }) => {
    reporter.report(node.get('id'), message, options);
  });
};