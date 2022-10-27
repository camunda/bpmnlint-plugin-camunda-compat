const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const rule = require('../../rules/timer');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/element');

const valid = [
  {
    name: 'time duration (ISO-8601)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
      <bpmn:task id="Task" />
      <bpmn:boundaryEvent id="Event" cancelActivity="false" attachedToRef="Task">
        <bpmn:timerEventDefinition id="TimerEventDefinition">
          <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P1Y2M</bpmn:timeDuration>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'time duration (expression)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
      <bpmn:task id="Task" />
      <bpmn:boundaryEvent id="Event" cancelActivity="false" attachedToRef="Task">
        <bpmn:timerEventDefinition id="TimerEventDefinition">
          <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">= expression</bpmn:timeDuration>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'time date (ISO-8601)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="Event">
        <bpmn:timerEventDefinition id="TimerEventDefinition">
          <bpmn:timeDate xsi:type="bpmn:tFormalExpression">2022-09-21T00:00:00Z</bpmn:timeDate>
        </bpmn:timerEventDefinition>
      </bpmn:startEvent>
    `))
  },
  {
    name: 'time date (expression)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="Event">
        <bpmn:timerEventDefinition id="TimerEventDefinition">
          <bpmn:timeDate xsi:type="bpmn:tFormalExpression">= date and time("2022-09-21T00:00:00Z")</bpmn:timeDate>
        </bpmn:timerEventDefinition>
      </bpmn:startEvent>
    `))
  },
  {
    name: 'time cycle (ISO-8601)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
      <bpmn:task id="Task" />
      <bpmn:boundaryEvent id="Event" cancelActivity="false" attachedToRef="Task">
        <bpmn:timerEventDefinition id="TimerEventDefinition">
          <bpmn:timeCycle xsi:type="bpmn:tFormalExpression">R5/P1D</bpmn:timeCycle>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'time cycle (cron)',
    config: { version: '8.1' },
    moddleElement: createModdle(createProcess(`
      <bpmn:task id="Task" />
      <bpmn:boundaryEvent id="Event" cancelActivity="false" attachedToRef="Task">
        <bpmn:timerEventDefinition id="TimerEventDefinition">
          <bpmn:timeCycle xsi:type="bpmn:tFormalExpression">0 0 9-17 * * MON-FRI</bpmn:timeCycle>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'time cycle (cron macro)',
    config: { version: '8.1' },
    moddleElement: createModdle(createProcess(`
      <bpmn:task id="Task" />
      <bpmn:boundaryEvent id="Event" cancelActivity="false" attachedToRef="Task">
        <bpmn:timerEventDefinition id="TimerEventDefinition">
          <bpmn:timeCycle xsi:type="bpmn:tFormalExpression">@yearly</bpmn:timeCycle>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'time cycle (expression)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
      <bpmn:task id="Task" />
      <bpmn:boundaryEvent id="Event" cancelActivity="false" attachedToRef="Task">
        <bpmn:timerEventDefinition id="TimerEventDefinition">
          <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">= today</bpmn:timeDuration>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
    `))
  }
];

const invalid = [
  {
    name: 'timer start event (no expression)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="Event">
        <bpmn:timerEventDefinition id="TimerEventDefinition" />
      </bpmn:startEvent>
    `)),
    report: {
      id: 'Event',
      message: 'Element of type <bpmn:TimerEventDefinition> must have one property of type <timeCycle> or <timeDate>',
      path: [
        'eventDefinitions',
        0
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'TimerEventDefinition',
        parentNode: 'Event',
        requiredProperty: [
          'timeCycle',
          'timeDate'
        ]
      }
    }
  },
  {
    name: 'timer intermediate catch event (no expression)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="Event">
        <bpmn:timerEventDefinition id="TimerEventDefinition" />
      </bpmn:intermediateCatchEvent>
    `)),
    report: {
      id: 'Event',
      message: 'Element of type <bpmn:TimerEventDefinition> must have property <timeDuration>',
      path: [
        'eventDefinitions',
        0,
        'timeDuration'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'TimerEventDefinition',
        parentNode: 'Event',
        requiredProperty: 'timeDuration'
      }
    }
  },
  {
    name: 'timer interrupting boundary event (no expression)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
    <bpmn:task id="Task" />
    <bpmn:boundaryEvent id="Event" attachedToRef="Task">
      <bpmn:timerEventDefinition id="TimerEventDefinition" />
    </bpmn:boundaryEvent>
    `)),
    report: {
      id: 'Event',
      message: 'Element of type <bpmn:TimerEventDefinition> must have property <timeDuration>',
      path: [
        'eventDefinitions',
        0,
        'timeDuration'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'TimerEventDefinition',
        parentNode: 'Event',
        requiredProperty: 'timeDuration'
      }
    }
  },
  {
    name: 'timer non-interrupting boundary event (no expression)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
    <bpmn:task id="Task" />
    <bpmn:boundaryEvent id="Event" cancelActivity="false" attachedToRef="Task">
      <bpmn:timerEventDefinition id="TimerEventDefinition" />
    </bpmn:boundaryEvent>
    `)),
    report: {
      id: 'Event',
      message: 'Element of type <bpmn:TimerEventDefinition> must have one property of type <timeCycle> or <timeDuration>',
      path: [
        'eventDefinitions',
        0
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'TimerEventDefinition',
        parentNode: 'Event',
        requiredProperty: [
          'timeCycle',
          'timeDuration'
        ]
      }
    }
  },
  {
    name: 'timer start event (empty expression)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
    <bpmn:task id="Task" />
    <bpmn:boundaryEvent id="Event" cancelActivity="false" attachedToRef="Task">
      <bpmn:timerEventDefinition id="TimerEventDefinition">
        <bpmn:timeDuration xsi:type="bpmn:tFormalExpression" />
      </bpmn:timerEventDefinition>
    </bpmn:boundaryEvent>
    `)),
    report: {
      id: 'Event',
      message: 'Element of type <bpmn:FormalExpression> must have property <body>',
      path: [
        'eventDefinitions',
        0,
        'timeDuration',
        'body'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_REQUIRED,
        node: 'bpmn:FormalExpression',
        parentNode: 'Event',
        requiredProperty: 'body'
      }
    }
  },
  {
    name: 'timer boundary event (cron in Camunda Platform 8.0)',
    config: { version: '8.0' },
    moddleElement: createModdle(createProcess(`
    <bpmn:task id="Task" />
    <bpmn:boundaryEvent id="Event" cancelActivity="false" attachedToRef="Task">
      <bpmn:timerEventDefinition id="TimerEventDefinition">
        <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">@daily</bpmn:timeDuration>
      </bpmn:timerEventDefinition>
    </bpmn:boundaryEvent>
    `)),
    report: {
      id: 'Event',
      message: 'Property value of <@daily> not allowed',
      path: [
        'eventDefinitions',
        0,
        'timeDuration',
        'body'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'bpmn:FormalExpression',
        parentNode: 'Event',
        property: 'body',
        allowedVersion: null
      }
    }
  },
  {
    name: 'timer boundary event (invalid duration)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
    <bpmn:task id="Task" />
    <bpmn:boundaryEvent id="Event" cancelActivity="false" attachedToRef="Task">
      <bpmn:timerEventDefinition id="TimerEventDefinition">
        <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">invalid</bpmn:timeDuration>
      </bpmn:timerEventDefinition>
    </bpmn:boundaryEvent>
    `)),
    report: {
      id: 'Event',
      message: 'Property value of <invalid> not allowed',
      path: [
        'eventDefinitions',
        0,
        'timeDuration',
        'body'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'bpmn:FormalExpression',
        parentNode: 'Event',
        property: 'body',
        allowedVersion: null
      }
    }
  },
  {
    name: 'timer boundary event (invalid cycle)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
    <bpmn:task id="Task" />
    <bpmn:boundaryEvent id="Event" cancelActivity="false" attachedToRef="Task">
      <bpmn:timerEventDefinition id="TimerEventDefinition">
        <bpmn:timeCycle xsi:type="bpmn:tFormalExpression">invalid</bpmn:timeCycle>
      </bpmn:timerEventDefinition>
    </bpmn:boundaryEvent>
    `)),
    report: {
      id: 'Event',
      message: 'Property value of <invalid> not allowed',
      path: [
        'eventDefinitions',
        0,
        'timeCycle',
        'body'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'bpmn:FormalExpression',
        parentNode: 'Event',
        property: 'body',
        allowedVersion: null
      }
    }
  },
  {
    name: 'timer start event (invalid date)',
    config: { version: '1.0' },
    moddleElement: createModdle(createProcess(`
    <bpmn:startEvent id="Event">
      <bpmn:timerEventDefinition id="TimerEventDefinition">
        <bpmn:timeDate xsi:type="bpmn:tFormalExpression">invalid</bpmn:timeDate>
      </bpmn:timerEventDefinition>
    </bpmn:startEvent>
    `)),
    report: {
      id: 'Event',
      message: 'Property value of <invalid> not allowed',
      path: [
        'eventDefinitions',
        0,
        'timeDate',
        'body'
      ],
      error: {
        type: ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED,
        node: 'bpmn:FormalExpression',
        parentNode: 'Event',
        property: 'body',
        allowedVersion: null
      }
    }
  }
];

RuleTester.verify('timer', rule, {
  valid,
  invalid
});
