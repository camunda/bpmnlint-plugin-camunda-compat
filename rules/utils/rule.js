const {
  isString,
  every,
  some,
} = require('min-dash');

const {
  is,
  isAny
} = require('bpmnlint-utils');

const { toSemverMinor } = require('./engine-profile');

module.exports.createRule = function(ruleExecutionPlatform, ruleExecutionPlatformVersion, checks) {
  return () => {
    return {
      check: (node, reporter) => {
        if (is(node, 'bpmn:Definitions')) {
          executionPlatform = node.get('modeler:executionPlatform');
          executionPlatformVersion = node.get('modeler:executionPlatformVersion');

          if (!executionPlatform
            || executionPlatform !== ruleExecutionPlatform
            || !executionPlatformVersion
            || toSemverMinor(executionPlatformVersion) !== ruleExecutionPlatformVersion) {
            return false;
          }
        } else if (!isAny(node, [ 'bpmn:FlowElement', 'bpmn:FlowElementsContainer' ])) {
          return;
        }

        const result = checkNode(node, checks);

        const id = node.get('id') || '';

        if (result === false) {
          reporter.report(id, `Element of type <${ node.$type }> not supported by ${ ruleExecutionPlatform } ${ toSemverMinor(ruleExecutionPlatformVersion) }`);
        }

        if (isString(result)) {
          const message = addExecutionPlatform(result, ruleExecutionPlatform, toSemverMinor(ruleExecutionPlatformVersion));

          reporter.report(id, message);
        }
      }
    };
  };
};

/**
 * Create no-op rule that always returns false resulting in early return.
 *
 * @returns {Function}
 */
module.exports.createNoopRule = function() {
  return () => {
    return {
      check: () => false
    };
  };
};

/**
 * Run checks on a node. Return true if at least one of the checks returns
 * true. Otherwise return the first string returned by a check. Otherwise return
 * false.
 *
 * @param {ModdleElement} node
 * @param {Array<Function>} checks
 *
 * @returns boolean|string
 */
function checkNode(node, checks) {
  const results = checks.map((check) => {

    // (1) check using type only
    if (isString(check)) {
      return is(node, check);
    }

    const { type } = check;

    // (2) check using function only
    if (!type) {
      return check.check(node);
    }

    // (3) check using type and function
    if (!is(node, type)) {
      return false;
    }

    return check.check(node);
  });

  return results.find((result) => result === true)
    || results.find((result) => isString(result))
    || false;
}

module.exports.checkNode = checkNode;

/**
 * Create function that runs checks on a node. Return true if all checks return
 * true. Otherwise return the first string returned by a check. Otherwise return
 * false.
 *
 * @param  {Array<Function>} checks
 *
 * @returns {boolean|String}
 */
module.exports.checkEvery = function(...checks) {
  return function(node) {
    const results = checks.map((check) => check(node));

    return every(results, result => result === true)
      || results.find((result) => isString(result))
      || false;
  };
}

/**
 * Create function that runs checks on a node. Return true if at least one of
 * the checks returns true. Otherwise return the first string returned by a
 * check. Otherwise return false.
 *
 * @param  {Array<Function>} checks
 *
 * @returns {boolean|String}
 */
module.exports.checkSome = function(...checks) {
  return function(node) {
    const results = checks.map((check) => check(node));

    return some(results, result => result === true)
      || results.find((result) => isString(result))
      || false;
  };
}

function addExecutionPlatform(string, executionPlatform, executionPlatformVersion) {
  return string
    .replace('{{ executionPlatform }}', executionPlatform)
    .replace('{{ executionPlatformVersion }}', executionPlatformVersion);
}