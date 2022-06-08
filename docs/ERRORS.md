# Errors

## General

### Example

```js
{
  id: 'ServiceTask_1',
  message: 'foo',
  path: [ 'bar', 'baz' ],
  error: {
    ...
  }
}
```

## Error Types

```js
/** @enum {string} */
const ERROR_TYPES = {
  ELEMENT_TYPE_NOT_ALLOWED: 'elementTypeNotAllowed',
  EXTENSION_ELEMENT_REQUIRED: 'extensionElementRequired',
  PROPERTY_DEPENDEND_REQUIRED: 'propertyDependendRequired',
  PROPERTY_REQUIRED: 'propertyRequired',
  PROPERTY_TYPE_NOT_ALLOWED: 'propertyTypeNotAllowed'
};
```

## ❌ Element Type Not Allowed Error

### Type Definition

```js
/**
 * @typedef ElementTypeNotAllowedError
 *
 * @type {Object}
 *
 * @property {string} id
 * @property {string} message
 * @property {(number|string)[]|null} path
 * @property {Object} error
 * @property {ERROR_TYPES} error.type
 * @property {import('moddle/lib/base')} error.node
 * @property {import('moddle/lib/base')|null} error.parentNode
 */
```

### Examples

```js
{
  id: 'ComplexGateway_1',
  message: 'Element of type <bpmn:ComplexGateway> not allowed',
  path: null,
  error: {
    type: ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED,
    node: Base { $type: 'bpmn:ComplexGateway', ... }
    parentNode: null
  }
}
```

## ❌ Extension Element Not Allowed Error

### Type Definition

```js
/**
 * @typedef ExtensionElementNotAllowedError
 *
 * @type {Object}
 *
 * @property {string} id
 * @property {string} message
 * @property {(number|string)[]|null} path
 * @property {Object} error
 * @property {ERROR_TYPES} error.type
 * @property {import('moddle/lib/base')} error.node
 * @property {import('moddle/lib/base')|null} error.parentNode
 * @property {import('moddle/lib/base')} error.extensionElement
 */
```

### Example

```js
{
  id: 'BusinessRuleTask_1',
  message: 'Extension element of type <zeebe:CalledDecision> not allowed',
  path: [
    'extensionElements',
    'values',
    0
  ],
  error: {
    type: ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED,
    node: Base { $type: 'bpmn:BusinessRuleTask', ... },
    parentNode: null,
    extensionElement: Base { $type: 'zeebe:CalledDecision', ... }
  }
}
```

## ❌ Extension Element Required Error

### Type Definition

```js
/**
 * @typedef ExtensionElementRequiredError
 *
 * @type {Object}
 *
 * @property {string} id
 * @property {string} message
 * @property {(number|string)[]|null} path
 * @property {Object} error
 * @property {ERROR_TYPES} error.type
 * @property {import('moddle/lib/base')} error.node
 * @property {import('moddle/lib/base')|null} error.parentNode
 * @property {string|string[]} error.requiredExtensionElement
 * @property {boolean} [error.exclusive]
 */
```

### Example

```js
{
  id: 'ServiceTask_1',
  message: 'Element of type <bpmn:ServiceTask> must have extension element of type <zeebe:TaskDefinition>',
  path: null,
  error: {
    type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
    node: Base { $type: 'bpmn:ServiceTask', ... },
    parentNode: null,
    requiredExtensionElement: 'zeebe:TaskDefinition'
  }
}
```

```js
{
  id: 'BusinessRuleTask_1',
  message: 'Element of type <bpmn:BusinessRuleTask> must have one extension element of type <zeebe:CalledDecision> or <zeebe:TaskDefinition>',
  path: null,
  error: {
    type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
    node: Base { $type: 'bpmn:BusinessRuleTask', ... },
    parentNode: null,
    requiredExtensionElement: [
      'zeebe:CalledDecision',
      'zeebe:TaskDefinition'
    ],
    exclusive: true
  }
}
```

## ❌ Property Dependend Required Error

### Type Definition

```js
/**
 * @typedef PropertyDependendRequiredError
 *
 * @type {Object}
 *
 * @property {string} id
 * @property {string} message
 * @property {(number|string)[]|null} path
 * @property {Object} error
 * @property {ERROR_TYPES} error.type
 * @property {import('moddle/lib/base')} error.node
 * @property {import('moddle/lib/base')|null} error.parentNode
 * @property {string} error.property
 * @property {string} error.dependendRequiredProperty
 */
```

### Example

```js
{
  id: 'ServiceTask_1',
  message: 'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if it has property <outputElement>',
  path: [
    'loopCharacteristics',
    'extensionElements',
    'values',
    0,
    'outputCollection'
  ],
  error: {
    type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
    node: Base { $type: 'zeebe:LoopCharacteristics', ... },
    parentNode: Base { $type: 'bpmn:ServiceTask', ... },
    property: 'outputElement',
    dependendRequiredProperty: 'outputCollection'
  }
}
```

## ❌ Property Not Allowed Error

### Type Definition

```js
/**
 * @typedef PropertyNotAllowedError
 *
 * @type {Object}
 *
 * @property {string} id
 * @property {(number|string)[]|null} path
 * @property {Object} error
 * @property {ERROR_TYPES} error.type
 * @property {import('moddle/lib/base')} error.node
 * @property {import('moddle/lib/base')|null} error.parentNode
 * @property {string} error.property
 */
```

### Example

```js
{
  id: 'ServiceTask_1',
  message: 'Property <modelerTemplate> not allowed',
  path: [
    'modelerTemplate'
  ],
  error: {
    type: ERROR_TYPES.PROPERTY_NOT_ALLOWED,
    node: Base { $type: 'bpmn:ServiceTask', ... },
    parentNode: null,
    property: 'modelerTemplate'
  }
}
```

## ❌ Property Required Error

### Type Definition

```js
/**
 * @typedef PropertyRequiredError
 *
 * @type {Object}
 *
 * @property {string} id
 * @property {string} message
 * @property {(number|string)[]|null} path
 * @property {Object} error
 * @property {ERROR_TYPES} error.type
 * @property {import('moddle/lib/base')} error.node
 * @property {import('moddle/lib/base')|null} error.parentNode
 * @property {string} error.requiredProperty
 */
```

### Example

```js
{
  id: 'BoundaryEvent_1',
  message: 'Element of type <bpmn:ErrorEventDefinition> must have property <errorRef>',
  path: [
    'eventDefinitions',
    0,
    'errorRef'
  ],
  error: {
    type: ERROR_TYPES.PROPERTY_REQUIRED,
    node: Base { $type: 'bpmn:ErrorEventDefinition', ... },
    parentNode: Base { $type: 'bpmn:BoundaryEvent', ... },
    requiredProperty: 'errorRef'
  }
}
```

## ❌ Property Type Not Allowed Error

### Type Definition

```js
/**
 * @typedef PropertyTypeNotAllowedError
 *
 * @type {Object}
 *
 * @property {string} id
 * @property {(number|string)[]|null} path
 * @property {Object} error
 * @property {ERROR_TYPES} error.type
 * @property {import('moddle/lib/base')} error.node
 * @property {import('moddle/lib/base')|null} error.parentNode
 * @property {string} error.property
 * @property {string|string[]} error.allowedPropertyType
 */
```

### Example

```js
{
  id: 'StartEvent_1',
  message: 'Property <eventDefinitions> of type <bpmn:SignalEventDefinition> not allowed',
  path: [
    'eventDefinitions',
    0
  ],
  error: {
    type: ERROR_TYPES.PROPERTY_TYPE_NOT_ALLOWED,
    node: Base { $type: 'bpmn:StartEvent', ... },
    parentNode: null,
    property: 'eventDefinitions',
    allowedPropertyType: [
      'bpmn:ErrorEventDefinition',
      'bpmn:MessageEventDefinition',
      'bpmn:TimerEventDefinition'
    ]
  }
}
```

```js
{
  id: 'ServiceTask_1',
  message: 'Property <loopCharacteristics> of type <bpmn:StandardInstanceLoopCharacteristics> not allowed',
  path: [
    'loopCharacteristics'
  ],
  error: {
    type: ERROR_TYPES.PROPERTY_TYPE_NOT_ALLOWED,
    node: Base { $type: 'bpmn:ServiceTask', ... },
    parentNode: null,
    property: 'loopCharacteristics',
    allowedPropertyType: 'bpmn:MultiInstanceLoopCharacteristics'
  }
}
```