# bpmnlint-plugin-camunda-compat

[![CI](https://github.com/camunda/bpmnlint-plugin-camunda-compat/workflows/CI/badge.svg)](https://github.com/camunda/bpmnlint-plugin-camunda-compat/actions?query=workflow%3ACI)

Camunda BPMN compatibility provided as a [bpmnlint](https://github.com/bpmn-io/bpmnlint) plug-in.


## Usage

To configure the linter dynamically based on the [execution platform and version](https://github.com/camunda/modeler-moddle), use [`@camunda/linting`](https://github.com/camunda/linting).

To configure the linter statically, add the configuration corresponding to your execution platform and version to your `.bpmnlintrc` file:

```
{
  "extends": [
    "bpmnlint:recommended",
    "plugin:camunda-compat/camunda-cloud-8-0"
  ]
}
```

## Resources

* [Issues](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues)
* BPMN coverage for [Camunda Cloud](https://docs.camunda.io/docs/reference/bpmn-processes/bpmn-coverage/) and [Camunda Platform](https://docs.camunda.org/manual/latest/reference/bpmn20/)


## License

MIT
