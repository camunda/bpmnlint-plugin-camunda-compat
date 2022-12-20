# bpmnlint-plugin-camunda-compat

[![CI](https://github.com/camunda/bpmnlint-plugin-camunda-compat/workflows/CI/badge.svg)](https://github.com/camunda/bpmnlint-plugin-camunda-compat/actions?query=workflow%3ACI)

A [bpmnlint](https://github.com/bpmn-io/bpmnlint) plug-in that checks whether a given BPMN process can be executed with [Camunda](https://camunda.com/).


## Usage

Add configuration corresponding to your execution platform and version to your [`.bpmnlintrc` configuration](https://github.com/bpmn-io/bpmnlint#configuration):

```json
{
  "extends": [
    "bpmnlint:recommended",
    "plugin:camunda-compat/camunda-cloud-8-0"
  ],
  "rules": {
    "camunda-compat/timer": "off"
  }
}
```

Use [`@camunda/linting`](https://github.com/camunda/linting) to configure the linter dynamically based on the [execution platform and version](https://github.com/camunda/modeler-moddle).


## Resources

* [Issues](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues)


## Related

* BPMN coverage for [Camunda 8](https://docs.camunda.io/docs/reference/bpmn-processes/bpmn-coverage/) and [Camunda 7](https://docs.camunda.org/manual/latest/reference/bpmn20/)


## License

MIT
