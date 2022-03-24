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
  ELEMENT_TYPE: 'elementType',
  EXTENSION_ELEMENT_REQUIRED: 'extensionElementRequired',
  PROPERTY_DEPENDEND_REQUIRED: 'propertyDependendRequired',
  PROPERTY_REQUIRED: 'propertyRequired',
  PROPERTY_TYPE: 'propertyType'
};
```

## ❌ Element Type Error

### Type Definition

```js
/**
 * @typedef ElementTypeError
 *
 * @type {Object}
 *
 * @property {string} id
 * @property {string} message
 * @property {(number|string)[]} [path]
 * @property {Object} [error]
 * @property {ERROR_TYPES} [error.type]
 * @property {string} [elementType]
 * @property {string} [propertyType]
 */
```

### Examples

```js
{
  id: 'ComplexGateway_1',
  message: 'Element of type <bpmn:ComplexGateway> not supported by Zeebe 1.0',
  path: null,
  error: {
    type: ERROR_TYPES.ELEMENT_TYPE,
    elementType: 'bpmn:ComplexGateway'
  }
}
```

```js
{
  id: 'StartEvent_1',
  message: 'Element of type <bpmn:StartEvent> (<bpmn:ErrorEventDefinition>) not supported by Zeebe 1.0',
  path: [ 'eventDefinitions', 0 ],
  error: {
    type: ERROR_TYPES.ELEMENT_TYPE,
    elementType: 'bpmn:ComplexGateway',
    propertyType: 'bpmn:ErrorEventDefinition'
  }
}
```

```js
{
  id: 'ServiceTask_1',
  message: 'Element of type <bpmn:ServiceTask> (<bpmn:StandardLoopCharacteristics>) not supported by Zeebe 1.0',
  path: [ 'loopCharacteristics' ],
  error: {
    type: ERROR_TYPES.ELEMENT_TYPE,
    elementType: 'bpmn:ServiceTask',
    propertyType: 'bpmn:StandardLoopCharacteristics'
  }
}
```

```js
{
  id: 'Process_1',
  message: 'Element of type <bpmn:Process> (<bpmn:LaneSet>) not supported by Zeebe 1.0',
  path: [ 'laneSets' ],
  error: {
    type: ERROR_TYPES.ELEMENT_TYPE,
    elementType: 'bpmn:Process',
    propertyType: 'bpmn:LaneSet'
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
 * @property {(number|string)[]} [path]
 * @property {Object} [error]
 * @property {ERROR_TYPES} [error.type]
 * @property {string} [requiredExtensionElementType]
 */
```

### Example

```js
{
  id: 'ServiceTask_1',
  message: 'Element of type <bpmn:ServiceTask> must have <zeebe:TaskDefinition> extension element',
  path: null,
  error: {
    type: ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
    requiredExtensionElement: 'zeebe:TaskDefinition'
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
 * @property {(number|string)[]} [path]
 * @property {Object} [error]
 * @property {ERROR_TYPES} [error.type]
 * @property {string} [dependendRequiredProperty]
 * @property {string} [dependendRequiredPropertyType]
 */
```

### Example

```js
{
  id: 'ServiceTask_1',
  message: 'Element of type <zeebe:LoopCharacteristics> must have property <outputCollection> if property <outputElement> is set',
  path: [
    'loopCharacteristics',
    'extensionElements',
    'values',
    0,
    'outputCollection'
  ],
  error: {
    type: ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED,
    dependendRequiredProperty: 'outputCollection',
    dependendRequiredPropertyType: undefined
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
 * @property {(number|string)[]} [path]
 * @property {Object} [error]
 * @property {ERROR_TYPES} [error.type]
 * @property {string} [requiredProperty]
 * @property {string} [requiredPropertyType]
 */
```

### Example

```js
{
  id: 'BoundaryEvent_1',
  message: 'Element of type <bpmn:ErrorEventDefinition> must reference <bpmn:Error>',
  path: [ 'eventDefinitions', 0, 'errorRef' ],
  error: {
    type: ERROR_TYPES.PROPERTY_REQUIRED,
    requiredProperty: 'errorRef',
    requiredPropertyType: 'bpmn:error'
  }
}
```

## ❌ Property Type Error

### Type Definition

```js
/**
 * @typedef PropertyTypeError
 *
 * @type {Object}
 *
 * @property {string} id
 * @property {string} message
 * @property {(number|string)[]} [path]
 * @property {Object} [error]
 * @property {ERROR_TYPES} [error.type]
 * @property {string} [property]
 * @property {string} [propertyType]
 */
```

### Example

```js
{
  id: 'ServiceTask_1',
  message: 'Element of type <bpmn:ServiceTask> must have property <loopCharacteristics> of type <bpmn:MultiInstanceLoopCharacteristics>',
  path: [
    'loopCharacteristics'
  ],
  error: {
    type: ERROR_TYPES.PROPERTY_TYPE,
    property: 'loopCharacteristics',
    propertyType: 'bpmn:MultiInstanceLoopCharacteristics'
  }
}
```