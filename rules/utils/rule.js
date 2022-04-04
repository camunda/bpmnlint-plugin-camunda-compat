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

const { ERROR_TYPES } = require('./element');

const { getTypeString } = require('./type');

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
module.exports.createRule = function(ruleExecutionPlatform, ruleExecutionPlatformVersion, checks, label) {
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
          const message = getMessage(node, ruleExecutionPlatform, ruleExecutionPlatformVersion, label);

          reporter.report(id, message, {
            error: {
              type: ERROR_TYPES.ELEMENT_TYPE,
              element: node.$type
            }
          });
        } else {
          if (!isArray(results)) {
            results = [ results ];
          }

          results.forEach((result) => {
            if (isString(result)) {
              result = { message: result };
            }

            let {
              message,
              ...rest
            } = result;

            message = addExecutionPlatform(message, label || `${ ruleExecutionPlatform } ${ toSemverMinor(ruleExecutionPlatformVersion) }`);

            reporter.report(id, message, rest);
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
      return isExactly(node, check);
    }

    const { type } = check;

    // (2) check using function only
    if (!type) {
      return check.check(node);
    }

    // (3) check using type and function
    if (!isExactly(node, type)) {
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
 * @param {Function} check
 *
 * @returns {(Object|string)[]}
 */
module.exports.replaceCheck = function(checks, type, check) {
  return replaceChecks(checks, [
    {
      type,
      check
    }
  ]);
};

function replaceChecks(checks, replacements) {
  return checks.map((check) => {
    if (isString(check)) {
      const replacement = replacements.find((replacement) => check === replacement.type);

      if (replacement) {
        return {
          check: replacement.check,
          type: check
        };
      }
    }

    if (check.type) {
      const replacement = replacements.find((replacement) => check.type === replacement.type);

      if (replacement) {
        return {
          ...check,
          check: replacement.check
        };
      }
    }

    return check;
  });
}

module.exports.replaceChecks = replaceChecks;

function addExecutionPlatform(string, executionPlatform) {
  return string
    .replace('{{ executionPlatform }}', executionPlatform);
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

  if (errors.length === 1) {
    return errors[ 0 ];
  } else if (errors.length > 1) {
    return errors;
  }

  return false;
}

function isExactly(node, type) {
  const { $model } = node;

  return $model.getType(node.$type) === $model.getType(type);
}

function getIndefiniteArticle(type) {
  if ([
    'Error',
    'Escalation',
    'Event',
    'Intermediate',
    'Undefined'
  ].includes(type.split(' ')[ 0 ])) {
    return 'An';
  }

  return 'A';
}

function getMessage(node, executionPlatform, executionPlatformVersion, label) {
  const type = getTypeString(node);

  const indefiniteArticle = getIndefiniteArticle(type);

  return addExecutionPlatform(`${ indefiniteArticle } <${ type }> is not supported by {{ executionPlatform }}`, label || `${ executionPlatform } ${ toSemverMinor(executionPlatformVersion) }`);
}