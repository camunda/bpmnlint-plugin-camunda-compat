# bpmnlint-plugin-camunda-compat

[![CI](https://github.com/camunda/bpmnlint-plugin-camunda-compat/workflows/CI/badge.svg)](https://github.com/camunda/bpmnlint-plugin-camunda-compat/actions?query=workflow%3ACI)

A [bpmnlint](https://github.com/bpmn-io/bpmnlint) plug-in that checks whether a given BPMN process can be executed with [Camunda](https://camunda.com/).

## Installation

To use the plug-in, ensure it is installed is installed in your project, alongside [bpmnlint](https://github.com/bpmn-io/bpmnlint):

```sh
npm install -D bpmnlint bpmnlint-plugin-camunda-compat
```

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

> [!WARNING]
> BPMN diagrams validated must be parsed with the respective [Camunda 7](https://github.com/camunda/camunda-bpmn-moddle) or [Camunda 8](https://github.com/camunda/zeebe-bpmn-moddle) moddle extension. 
>
> See also [command line use](#command-line-use).

## Dynamic Linter Configuration

Use [`@camunda/linting`](https://github.com/camunda/linting) to configure the linter dynamically based on the [execution platform and version](https://github.com/camunda/modeler-moddle).

## Command Line Use

When using `bpmnlint` via the command line, ensure it picks up the respective [Camunda 7](https://github.com/camunda/camunda-bpmn-moddle) or [Camunda 8](https://github.com/camunda/zeebe-bpmn-moddle) moddle extension.

For Camunda 8, install the [zeebe-bpmn-moddle extension](https://github.com/camunda/zeebe-bpmn-moddle):

```
npm install bpmnlint zeebe-bpmn-moddle bpmnlint-plugin-camunda-compat
```

Extend your configuration so bpmnlint picks-up the extension when parsing a BPMN diagram:

```diff
--- .bpmnlintrc
+++ .bpmnlintrc
@@ -1,9 +1,12 @@
 {
   "extends": [
     "bpmnlint:recommended",
     "plugin:camunda-compat/camunda-cloud-8-7"
   ],
   "rules": {
     "camunda-compat/timer": "off"
+  },
+  "moddleExtensions": {
+    "zeebe": "zeebe-bpmn-moddle/resources/zeebe.json"
   }
 }
```

Invoke `bpmnlint` from your command line in the usual ways:

```
npx bpmnlint my-diagram.bpmn
```

## Resources

* [Issues](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues)


## Related

* BPMN coverage for [Camunda 8](https://docs.camunda.io/docs/reference/bpmn-processes/bpmn-coverage/) and [Camunda 7](https://docs.camunda.org/manual/latest/reference/bpmn20/)


## License

MIT
