const { isString } = require('min-dash');

const { is } = require('bpmnlint-utils');

const { getPath, pathConcat } = require('@bpmn-io/moddle-utils');

const {
  findExtensionElement,
  getEventDefinition
} = require('../utils/element');

const { ERROR_TYPES } = require('../utils/error-types');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

const { greaterOrEqual } = require('../utils/version');

// `camunda.secrets.<name>` only resolves on engines with this version or newer;
// before that, `{{secrets.<name>}}` remains the only working format
const CAMUNDA_SECRETS_FORMAT_ALLOWED_VERSION = '8.10';

module.exports = skipInNonExecutableProcess(function({ version }) {
  function check(node, reporter) {
    const errors = [
      validateIoMapping,
      validateProperties,
      validateSubscription
    ].reduce((errors, validationFunction) => {
      return [
        ...errors,
        ...validationFunction(node)
      ];
    }, []);

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  function validateIoMapping(node) {
    const ioMapping = findExtensionElement(node, 'zeebe:IoMapping');

    if (!ioMapping) {
      return [];
    }

    return ioMapping.get('inputParameters')
      .map(inputParameter => {
        const format = getInvalidSecretFormat(inputParameter.get('source'));

        return format && getReport('source', inputParameter, node, format);
      })
      .filter(Boolean);
  }

  function validateProperties(node) {
    const properties = findExtensionElement(node, 'zeebe:Properties');

    if (!properties) {
      return [];
    }

    return (properties.get('properties'))
      .map(property => {
        const format = getInvalidSecretFormat(property.get('value'));

        return format && getReport('value', property, node, format);
      })
      .filter(Boolean);
  }

  function validateSubscription(node) {
    let message;

    if (is(node, 'bpmn:ReceiveTask')) {
      message = node.get('messageRef');
    } else {
      const messageEventDefinition = getEventDefinition(node, 'bpmn:MessageEventDefinition');

      if (!messageEventDefinition) {
        return [];
      }

      message = messageEventDefinition.get('messageRef');
    }

    if (!message) {
      return [];
    }

    const subscription = findExtensionElement(message, 'zeebe:Subscription');

    if (!subscription) {
      return [];
    }

    const correlationKey = subscription.get('correlationKey');

    const format = getInvalidSecretFormat(correlationKey);

    return format ? [ getReport('correlationKey', subscription, node, format) ] : [];
  }

  // returns `null` when `value` is a valid secret expression, otherwise which
  // kind of outdated format it uses:
  //
  // - 'deprecated': `secrets.<name>`, never a working format on its own
  // - 'legacy': `{{secrets.<name>}}`, worked until `camunda.secrets.<name>`
  //   became available and is only reported from that version on
  function getInvalidSecretFormat(value) {
    if (!value || !isString(value) || !value.includes('secrets.')) {
      return null;
    }

    // the current, opt-in `camunda.secrets.<name>` format is always accepted;
    // `<name>` may be backtick-escaped (e.g. `` `db-password` ``, `` `tls.crt` ``)
    // when it is not a plain FEEL identifier
    if (/camunda\.secrets\.(?:[\w-]+|`[^`]+`)/.test(value)) {
      return null;
    }

    const isLegacyFormat = /{{\s*secrets\.[\w-]+\s*}}/.test(value);

    // once the engine supports `camunda.secrets.<name>`, any remaining
    // `secrets.<name>` reference is outdated: the legacy wrapped format is
    // superseded, anything else never resolved in the first place
    if (greaterOrEqual(version, CAMUNDA_SECRETS_FORMAT_ALLOWED_VERSION)) {
      return isLegacyFormat ? 'legacy' : 'deprecated';
    }

    return isLegacyFormat ? null : 'deprecated';
  }

  const meta = {};

  // the migration guide only applies once there is actually something to
  // migrate to; below that version, the wrapped legacy format is still the
  // correct fix, not a migration
  if (greaterOrEqual(version, CAMUNDA_SECRETS_FORMAT_ALLOWED_VERSION)) {
    meta.documentation = {
      url: 'https://docs.camunda.io/docs/components/connectors/use-connectors/migrate-secrets/'
    };
  }

  return {
    meta,
    check
  };
});

function getReport(propertyName, node, parentNode, format) {
  const path = getPath(node, parentNode);

  const isLegacy = format === 'legacy';

  return {
    message: `Property <${ propertyName }> uses ${ isLegacy ? 'legacy' : 'deprecated' } secret expression format`,
    path: pathConcat(path || [], propertyName),
    data: {
      type: isLegacy ? ERROR_TYPES.SECRET_EXPRESSION_FORMAT_LEGACY : ERROR_TYPES.SECRET_EXPRESSION_FORMAT_DEPRECATED,
      node,
      parentNode: parentNode,
      property: propertyName,
      allowedVersion: CAMUNDA_SECRETS_FORMAT_ALLOWED_VERSION
    }
  };
}
