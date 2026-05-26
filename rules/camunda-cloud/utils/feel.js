const { isString } = require('min-dash');

// Properties ignored globally
const IGNORED_PROPERTIES = [
  'name'
];

// Properties ignored only for specific element types
const IGNORED_PROPERTIES_BY_TYPE = {
  'zeebe:Input': [ 'target' ],
  'zeebe:Output': [ 'target' ],
  'zeebe:Header': [ 'key', 'value' ],
  'zeebe:Property': [ 'name', 'value' ],
  'zeebe:CalledDecision': [ 'resultVariable' ],
  'zeebe:Script': [ 'resultVariable' ]
};

const isIgnoredProperty = (node, propertyName) => {
  if (propertyName.startsWith('$') || IGNORED_PROPERTIES.includes(propertyName)) {
    return true;
  }

  const nodeType = node.$type;
  const ignoredForType = IGNORED_PROPERTIES_BY_TYPE[nodeType];

  return ignoredForType && ignoredForType.includes(propertyName);
};

const isFeelProperty = (node, propertyName, value) => {
  return !isIgnoredProperty(node, propertyName) && isString(value) && value.startsWith('=');
};

module.exports = {
  isFeelProperty
};
