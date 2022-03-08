const {
  every,
  isArray,
  isObject,
  isString,
  some
} = require('min-dash');

const {
  is,
  isAny
} = require('bpmnlint-utils');

const { toSemverMinor } = require('./engine-profile');

/**
 * Factory function for rules. Returns a rule for a given execution platform,
 * execution platform version and an array of checks. Must be run on
 * bpmn:Definitions node. Returns early without traversing further if execution
 * platform or execution platform version doesn't match. Returns early if node
 * is not a bpmn:FlowElement or bpmn:FlowElementContainer.
 *
 * @param {string} ruleExecutionPlatform
 * @param {string} ruleExecutionPlatformVersion
 * @param {(Object|string)[]} checks
 *
 * @returns {Function}
 */
module.exports.createRule = function(ruleExecutionPlatform, ruleExecutionPlatformVersion, checks) {
  return () => {
    return {
      check: (node, reporter) => {
        if (is(node, 'bpmn:Definitions')) {
          const executionPlatform = node.get('modeler:executionPlatform');
          const executionPlatformVersion = node.get('modeler:executionPlatformVersion');

          if (!executionPlatform
            || executionPlatform !== ruleExecutionPlatform
            || !executionPlatformVersion
            || toSemverMinor(executionPlatformVersion) !== ruleExecutionPlatformVersion) {
            return false;
          }
        } else if (!isAny(node, [ 'bpmn:FlowElement', 'bpmn:FlowElementsContainer' ])) {
          return;
        }

        let results = checkNode(node, checks);

        if (results === true) {
          return;
        }

        const id = node.get('id') || '';

        if (results === false) {
          reporter.report(id, `Element of type <${ node.$type }> not supported by ${ ruleExecutionPlatform } ${ toSemverMinor(ruleExecutionPlatformVersion) }`);
        } else {
          results.forEach((result) => {
            if (isString(result)) {
              result = { message: result };
            }

            let {
              message,
              path
            } = result;

            message = addExecutionPlatform(message, ruleExecutionPlatform, toSemverMinor(ruleExecutionPlatformVersion));

            if (path) {
              reporter.report(id, message, path);
            } else {
              reporter.report(id, message);
            }
          });
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
 * Run checks on a node. Return true if at least one of the checks returns true.
 * Otherwise return all errors or false.
 *
 * @param {ModdleElement} node
 * @param {Array<Function>} checks
 *
 * @returns {boolean|Object|Object[]|string|string[]}
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

  return results.find((result) => result === true) || getErrors(results);
}

module.exports.checkNode = checkNode;

/**
 * Create function that runs checks on a node. Return true if all checks return
 * true. Otherwise return all errors or false.
 *
 * @param  {Array<Function>} checks
 *
 * @returns {boolean|Object|Object[]|string|string[]}
 */
module.exports.checkEvery = function(...checks) {
  return function(node) {
    const results = checks.map((check) => check(node));

    return every(results, result => result === true) || getErrors(results);
  };
};

/**
 * Create function that runs checks on a node. Return true if at least one of
 * the checks returns true. Otherwise return all errors or false.
 *
 * @param  {Array<Function>} checks
 *
 * @returns {boolean|Object|Object[]|string|string[]}
 */
module.exports.checkSome = function(...checks) {
  return function(node) {
    const results = checks.map((check) => check(node));

    return some(results, result => result === true) || getErrors(results);
  };
};

/**
 * Replace check for element of type.
 *
 * @param {(Object|string)[]} checks
 * @param {string} type
 * @param {Function} replacement
 *
 * @returns {(Object|string)[]}
 */
module.exports.replaceCheck = function(checks, type, replacement) {
  return checks.map((check) => {
    if (isString(check) && check === type) {
      return {
        check: replacement,
        type
      };
    }

    if (check.type === type) {
      return {
        ...check,
        check: replacement
      };
    }

    return check;
  });
};

function addExecutionPlatform(string, executionPlatform, executionPlatformVersion) {
  return string
    .replace('{{ executionPlatform }}', executionPlatform)
    .replace('{{ executionPlatformVersion }}', executionPlatformVersion);
}

/**
 * Return all errors or false.
 *
 * @param {(boolean|Object|string)[]} result
 *
 * @returns {boolean|(Object|string)[]}
 */
function getErrors(results) {
  const errors = results.reduce((errors, result) => {
    if (isArray(result)) {
      return [
        ...errors,
        ...result
      ];
    }

    if (isObject(result) || isString(result)) {
      return [
        ...errors,
        result
      ];
    }

    return errors;
  }, []);

  if (errors.length) {
    return errors;
  }

  return false;
}