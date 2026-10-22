const RuleTester = require('bpmnlint/lib/testers/rule-tester');

const sinon = require('sinon');

const rule = require('../../rules/camunda-cloud/timer-past-date');

const {
  createModdle,
  createProcess
} = require('../helper');

const { ERROR_TYPES } = require('../../rules/utils/error-types');

const NOW = '2026-06-01T00:00:00Z';

const TIME_DATE_MESSAGE = 'Time date is in the past. Note that the timer will fire right after the deployment. Consider using a future date to start in the future.';

const TIME_CYCLE_MESSAGE = 'Start date of time cycle is in the past. Note that the timer will fire right after the deployment, and the cycle continues from the deployment time. Consider using a future start date or a cron expression to run on a fixed schedule.';

function createTimerStartEvent(property, value) {
  return createProcess(`
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:timerEventDefinition id="TimerEventDefinition_1">
        <bpmn:${ property } xsi:type="bpmn:tFormalExpression">${ value }</bpmn:${ property }>
      </bpmn:timerEventDefinition>
    </bpmn:startEvent>
  `);
}

const valid = [
  {
    name: 'timer start event with time date in the future',
    moddleElement: createModdle(createTimerStartEvent('timeDate', '2027-01-01T09:00:00Z'))
  },
  {
    name: 'timer start event with time date in the future (zone ID)',
    moddleElement: createModdle(createTimerStartEvent('timeDate', '2026-06-01T09:00:00+01:00[Europe/Berlin]'))
  },
  {
    name: 'timer start event with time cycle start date in the future',
    moddleElement: createModdle(createTimerStartEvent('timeCycle', 'R/2027-01-01T02:00:00+10:00[Australia/Melbourne]/P1M'))
  },
  {
    name: 'timer start event with time date in the future (fractional seconds)',
    moddleElement: createModdle(createTimerStartEvent('timeDate', '2027-01-01T09:00:00.123Z'))
  },
  {
    name: 'timer start event with time date in the future (offset above 13 hours)',
    moddleElement: createModdle(createTimerStartEvent('timeDate', '2026-05-31T20:00:00-18:00'))
  },
  {
    name: 'timer start event with time cycle start date in the future (no seconds)',
    moddleElement: createModdle(createTimerStartEvent('timeCycle', 'R/2027-01-01T02:00Z/P1M'))
  },
  {
    name: 'timer start event with time cycle without start date',
    moddleElement: createModdle(createTimerStartEvent('timeCycle', 'R/P1D'))
  },
  {
    name: 'timer start event with time cycle (cron)',
    moddleElement: createModdle(createTimerStartEvent('timeCycle', '0 0 2 1 * ?'))
  },
  {
    name: 'timer start event with time date (expression)',
    moddleElement: createModdle(createTimerStartEvent('timeDate', '=date and time("2025-01-01T09:00:00Z")'))
  },
  {
    name: 'timer start event with time cycle (expression)',
    moddleElement: createModdle(createTimerStartEvent('timeCycle', '="R/2025-01-01T09:00:00Z/P1D"'))
  },
  {
    name: 'timer start event with invalid time date',
    moddleElement: createModdle(createTimerStartEvent('timeDate', 'foo'))
  },
  {
    name: 'timer start event without time date value',
    moddleElement: createModdle(createProcess(`
      <bpmn:startEvent id="StartEvent_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1">
          <bpmn:timeDate xsi:type="bpmn:tFormalExpression" />
        </bpmn:timerEventDefinition>
      </bpmn:startEvent>
    `))
  },
  {
    name: 'timer start event in event sub-process with time date in the past',
    moddleElement: createModdle(createProcess(`
      <bpmn:subProcess id="SubProcess_1" triggeredByEvent="true">
        <bpmn:startEvent id="StartEvent_1">
          <bpmn:timerEventDefinition id="TimerEventDefinition_1">
            <bpmn:timeDate xsi:type="bpmn:tFormalExpression">2025-01-01T09:00:00Z</bpmn:timeDate>
          </bpmn:timerEventDefinition>
        </bpmn:startEvent>
      </bpmn:subProcess>
    `))
  },
  {
    name: 'intermediate timer catch event with time date in the past',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1">
          <bpmn:timeDate xsi:type="bpmn:tFormalExpression">2025-01-01T09:00:00Z</bpmn:timeDate>
        </bpmn:timerEventDefinition>
      </bpmn:intermediateCatchEvent>
    `))
  },
  {
    name: 'intermediate timer catch event with time date in the future',
    moddleElement: createModdle(createProcess(`
      <bpmn:intermediateCatchEvent id="IntermediateCatchEvent_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1">
          <bpmn:timeDate xsi:type="bpmn:tFormalExpression">2027-01-01T09:00:00Z</bpmn:timeDate>
        </bpmn:timerEventDefinition>
      </bpmn:intermediateCatchEvent>
    `))
  },
  {
    name: 'timer boundary event with time date in the past',
    moddleElement: createModdle(createProcess(`
      <bpmn:task id="Task_1" />
      <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="Task_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1">
          <bpmn:timeDate xsi:type="bpmn:tFormalExpression">2025-01-01T09:00:00Z</bpmn:timeDate>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'timer boundary event with time date in the future',
    moddleElement: createModdle(createProcess(`
      <bpmn:task id="Task_1" />
      <bpmn:boundaryEvent id="BoundaryEvent_1" attachedToRef="Task_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1">
          <bpmn:timeDate xsi:type="bpmn:tFormalExpression">2027-01-01T09:00:00Z</bpmn:timeDate>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'timer boundary event with time cycle start date in the past',
    moddleElement: createModdle(createProcess(`
      <bpmn:task id="Task_1" />
      <bpmn:boundaryEvent id="BoundaryEvent_1" cancelActivity="false" attachedToRef="Task_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1">
          <bpmn:timeCycle xsi:type="bpmn:tFormalExpression">R/2025-01-01T09:00:00Z/P1D</bpmn:timeCycle>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'timer boundary event with time cycle start date in the future',
    moddleElement: createModdle(createProcess(`
      <bpmn:task id="Task_1" />
      <bpmn:boundaryEvent id="BoundaryEvent_1" cancelActivity="false" attachedToRef="Task_1">
        <bpmn:timerEventDefinition id="TimerEventDefinition_1">
          <bpmn:timeCycle xsi:type="bpmn:tFormalExpression">R/2027-01-01T09:00:00Z/P1D</bpmn:timeCycle>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
    `))
  },
  {
    name: 'timer start event with time date in the past (non-executable process)',
    config: { version: '8.2' },
    moddleElement: createModdle(createTimerStartEvent('timeDate', '2025-01-01T09:00:00Z')
      .replace('isExecutable="true"', 'isExecutable="false"'))
  }
];

const invalid = [
  {
    name: 'timer start event with time date in the past',
    moddleElement: createModdle(createTimerStartEvent('timeDate', '2025-01-01T09:00:00Z')),
    report: {
      id: 'StartEvent_1',
      message: TIME_DATE_MESSAGE,
      path: [
        'eventDefinitions',
        0,
        'timeDate'
      ],
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: 'bpmn:FormalExpression',
        parentNode: 'StartEvent_1',
        property: 'timeDate'
      }
    }
  },
  {
    name: 'timer start event with time date in the past (offset)',
    moddleElement: createModdle(createTimerStartEvent('timeDate', '2026-06-01T01:00:00+02:00')),
    report: {
      id: 'StartEvent_1',
      message: TIME_DATE_MESSAGE,
      path: [
        'eventDefinitions',
        0,
        'timeDate'
      ],
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: 'bpmn:FormalExpression',
        parentNode: 'StartEvent_1',
        property: 'timeDate'
      }
    }
  },
  {
    name: 'timer start event with time cycle start date in the past',
    moddleElement: createModdle(createTimerStartEvent('timeCycle', 'R/2026-01-01T02:00:00+10:00[Australia/Melbourne]/P1M')),
    report: {
      id: 'StartEvent_1',
      message: TIME_CYCLE_MESSAGE,
      path: [
        'eventDefinitions',
        0,
        'timeCycle'
      ],
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: 'bpmn:FormalExpression',
        parentNode: 'StartEvent_1',
        property: 'timeCycle'
      }
    }
  },
  {
    name: 'timer start event with time date in the past (fractional seconds)',
    moddleElement: createModdle(createTimerStartEvent('timeDate', '2025-01-01T09:00:00.123Z')),
    report: {
      id: 'StartEvent_1',
      message: TIME_DATE_MESSAGE,
      path: [
        'eventDefinitions',
        0,
        'timeDate'
      ],
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: 'bpmn:FormalExpression',
        parentNode: 'StartEvent_1',
        property: 'timeDate'
      }
    }
  },
  {
    name: 'timer start event with time date in the past (no seconds)',
    moddleElement: createModdle(createTimerStartEvent('timeDate', '2025-01-01T09:00Z')),
    report: {
      id: 'StartEvent_1',
      message: TIME_DATE_MESSAGE,
      path: [
        'eventDefinitions',
        0,
        'timeDate'
      ],
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: 'bpmn:FormalExpression',
        parentNode: 'StartEvent_1',
        property: 'timeDate'
      }
    }
  },
  {
    name: 'timer start event with time date in the past (Z with zone ID)',
    moddleElement: createModdle(createTimerStartEvent('timeDate', '2025-01-01T09:00:00Z[UTC]')),
    report: {
      id: 'StartEvent_1',
      message: TIME_DATE_MESSAGE,
      path: [
        'eventDefinitions',
        0,
        'timeDate'
      ],
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: 'bpmn:FormalExpression',
        parentNode: 'StartEvent_1',
        property: 'timeDate'
      }
    }
  },
  {
    name: 'timer start event with time date in the past (offset above 13 hours)',
    moddleElement: createModdle(createTimerStartEvent('timeDate', '2026-06-01T10:00:00+14:00')),
    report: {
      id: 'StartEvent_1',
      message: TIME_DATE_MESSAGE,
      path: [
        'eventDefinitions',
        0,
        'timeDate'
      ],
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: 'bpmn:FormalExpression',
        parentNode: 'StartEvent_1',
        property: 'timeDate'
      }
    }
  },
  {
    name: 'timer start event with time cycle start date in the past (fractional seconds)',
    moddleElement: createModdle(createTimerStartEvent('timeCycle', 'R/2025-01-01T09:00:00.123Z/P1D')),
    report: {
      id: 'StartEvent_1',
      message: TIME_CYCLE_MESSAGE,
      path: [
        'eventDefinitions',
        0,
        'timeCycle'
      ],
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: 'bpmn:FormalExpression',
        parentNode: 'StartEvent_1',
        property: 'timeCycle'
      }
    }
  },
  {
    name: 'timer start event with time cycle start date in the past (no seconds)',
    moddleElement: createModdle(createTimerStartEvent('timeCycle', 'R/2025-01-01T09:00Z/P1D')),
    report: {
      id: 'StartEvent_1',
      message: TIME_CYCLE_MESSAGE,
      path: [
        'eventDefinitions',
        0,
        'timeCycle'
      ],
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: 'bpmn:FormalExpression',
        parentNode: 'StartEvent_1',
        property: 'timeCycle'
      }
    }
  },
  {
    name: 'timer start event in participant with time date in the past',
    moddleElement: createModdle(`
      <bpmn:definitions
        xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        id="Definitions_1">
        <bpmn:collaboration id="Collaboration_1">
          <bpmn:participant id="Participant_1" processRef="Process_1" />
        </bpmn:collaboration>
        <bpmn:process id="Process_1" isExecutable="true">
          <bpmn:startEvent id="StartEvent_1">
            <bpmn:timerEventDefinition id="TimerEventDefinition_1">
              <bpmn:timeDate xsi:type="bpmn:tFormalExpression">2025-01-01T09:00:00Z</bpmn:timeDate>
            </bpmn:timerEventDefinition>
          </bpmn:startEvent>
        </bpmn:process>
      </bpmn:definitions>
    `),
    report: {
      id: 'StartEvent_1',
      message: TIME_DATE_MESSAGE,
      path: [
        'eventDefinitions',
        0,
        'timeDate'
      ],
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: 'bpmn:FormalExpression',
        parentNode: 'StartEvent_1',
        property: 'timeDate'
      }
    }
  },
  {
    name: 'timer start events in executable and non-executable participant with time date in the past',
    config: { version: '8.6' },
    moddleElement: createModdle(`
      <bpmn:definitions
        xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        id="Definitions_1">
        <bpmn:collaboration id="Collaboration_1">
          <bpmn:participant id="Participant_1" processRef="Process_1" />
          <bpmn:participant id="Participant_2" processRef="Process_2" />
        </bpmn:collaboration>
        <bpmn:process id="Process_1" isExecutable="true">
          <bpmn:startEvent id="StartEvent_1">
            <bpmn:timerEventDefinition id="TimerEventDefinition_1">
              <bpmn:timeDate xsi:type="bpmn:tFormalExpression">2025-01-01T09:00:00Z</bpmn:timeDate>
            </bpmn:timerEventDefinition>
          </bpmn:startEvent>
        </bpmn:process>
        <bpmn:process id="Process_2" isExecutable="false">
          <bpmn:startEvent id="StartEvent_2">
            <bpmn:timerEventDefinition id="TimerEventDefinition_2">
              <bpmn:timeDate xsi:type="bpmn:tFormalExpression">2025-01-01T09:00:00Z</bpmn:timeDate>
            </bpmn:timerEventDefinition>
          </bpmn:startEvent>
        </bpmn:process>
      </bpmn:definitions>
    `),
    report: {
      id: 'StartEvent_1',
      message: TIME_DATE_MESSAGE,
      path: [
        'eventDefinitions',
        0,
        'timeDate'
      ],
      data: {
        type: ERROR_TYPES.TIMER_DATE_IN_PAST,
        node: 'bpmn:FormalExpression',
        parentNode: 'StartEvent_1',
        property: 'timeDate'
      }
    }
  }
];


describe('timer-past-date', function() {

  let clock;

  before(function() {
    clock = sinon.useFakeTimers({ now: new Date(NOW), toFake: [ 'Date' ] });
  });

  after(function() {
    clock.restore();
  });

  RuleTester.verify('timer-past-date', rule, {
    valid,
    invalid
  });

});
