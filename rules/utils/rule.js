const {
  isArray,
  isNil,
  isString,
} = require('min-dash');

const {
  is,
  isAny
} = require('bpmnlint-utils');

const { toSemverMinor } = require('./engine-profile');

module.exports.createRule = function(version, checks) {
  return () => {
    return {
      check: (node, reporter) => {

        // do not lint properties (yet)
        if (!isAny(node, [ 'bpmn:FlowElement', 'bpmn:FlowElementsContainer' ])) {
          return;
        }

        const engineProfile = getEngineProfile(node);

        if (!engineProfile) {
          return;
        }

        const {
          executionPlatform,
          executionPlatformVersion
        } = engineProfile;

        if (!executionPlatformVersion || toSemverMinor(executionPlatformVersion) !== version) {
          return;
        }

        const result = checkNode(node, checks);

        if (result === false) {
          reporter.report(node.get('id') || '', `Element of type <${ node.$type }> not supported by ${ executionPlatform } ${ toSemverMinor(executionPlatformVersion) }`);
        }

        if (isString(result)) {
          reporter.report(node.get('id') || '', `Element of type <${ result }> not supported by ${ executionPlatform } ${ toSemverMinor(executionPlatformVersion) }`);
        }
      }
    };
  };
}

function getDefinitions(node) {
  if (is(node, 'bpmn:Definitions')) {
    return node;
  }

  const parent = node.$parent;

  if (!parent) {
    return null;
  }

  return getDefinitions(parent);
}

function getEngineProfile(node) {
  const definitions = getDefinitions(node);

  if (!definitions) {
    return null;
  }

  const executionPlatform = definitions.get('modeler:executionPlatform'),
        executionPlatformVersion = definitions.get('modeler:executionPlatformVersion');

  if (!executionPlatform) {
    return null;
  }

  return {
    executionPlatform,
    executionPlatformVersion
  };
}

/**
 * @param {ModdleElement} node
 * @param {Array<Function>} checks
 *
 * @returns boolean|String
 */
function checkNode(node, checks) {
  return checks.reduce((previousResult, check) => {
    if (previousResult === true) {
      return previousResult;
    }

    // (1) check using type only
    if (isString(check)) {
      return is(node, check) || previousResult;
    }

    const { type } = check;

    // (2) check using function only
    if (!type) {
      return check.check(node) || previousResult;
    }

    // (3) check using type and function
    if (!is(node, type)) {
      return previousResult;
    }

    return check.check(node) || previousResult;
  }, false);
}

/**
 * If every check returns true return true.
 * Otherwise return the first false or string returned by a check.
 *
 * @param  {Array<Function>} checks
 *
 * @returns {boolean|String}
 */
module.exports.checkEvery = function(...checks) {
  return function(node) {
    return checks.reduce((previousResult, check) => {
      if (!isNil(previousResult) && previousResult !== true) {
        return previousResult;
      }

      const result = check(node);

      return result;
    }, null);
  };
}

/**
 * If some check returns true return true.
 * Otherwise return the first false or string returned by a check.
 *
 * @param  {Array<Function>} checks
 *
 * @returns {boolean|String}
 */
module.exports.checkSome = function(...checks) {
  return function(node) {
    return checks.reduce((previousResult, check) => {
      if (previousResult === true) {
        return previousResult;
      }

      const result = check(node);

      if (isNil(previousResult) || result === true) {
        return result;
      }

      return previousResult;
    }, null);
  };
}

module.exports.hasEventDefinition = function(node) {
  const eventDefinitions = node.get('eventDefinitions');

  return eventDefinitions && eventDefinitions.length === 1;
}

module.exports.hasNoEventDefinition = function(node) {
  const eventDefinitions = node.get('eventDefinitions');

  return !eventDefinitions || !eventDefinitions.length || `${ node.$type} (${ eventDefinitions[ 0 ].$type })`;
}

module.exports.hasEventDefinitionOfType = function(types) {
  return function(node) {
    if (!isArray(types)) {
      types = [ types ];
    }

    const eventDefinitions = node.get('eventDefinitions');

    if (!eventDefinitions || eventDefinitions.length !== 1) {
      return false;
    }

    const eventDefinition = eventDefinitions[ 0 ];

    return isAny(eventDefinition, types) || `${ node.$type} (${ eventDefinition.$type })`;
  };
}

module.exports.hasLoopCharacteristics = function(node) {
  const loopCharacteristics = node.get('loopCharacteristics');

  return !!loopCharacteristics;
}

module.exports.hasNoLoopCharacteristics = function(node) {
  const loopCharacteristics = node.get('loopCharacteristics');

  return !loopCharacteristics || `${ node.$type} (${ loopCharacteristics.$type })`;
}

module.exports.hasNoLanes = function(node) {
  const laneSets = node.get('laneSets');

  return !laneSets || !laneSets.length || `${ node.$type} (bpmn:LaneSet)`;
}

module.exports.hasLoopCharacteristicsOfType = function(type) {
  return function(node) {
    const loopCharacteristics = node.get('loopCharacteristics');

    if (!loopCharacteristics) {
      return false;
    }

    return is(loopCharacteristics, type) || `${ node.$type} (${ loopCharacteristics.$type })`;
  };
}

module.exports.isNotBpmn = function(node) {
  const { $descriptor: descriptor } = node;

  const { $pkg: package } = descriptor;

  const { uri } = package;

  return uri !== 'http://www.omg.org/spec/BPMN/20100524/MODEL';
}