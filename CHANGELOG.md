# Changelog

All notable changes to [bpmnlint-plugin-camunda-compat](https://github.com/camunda/bpmnlint-plugin-camunda-compat) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

# 1.0.0

* `FIX`: fix typo in error type `PROPERTY_DEPENDENT_REQUIRED` ([#90](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/90))

### Breaking Changes

* `PROPERTY_DEPENDEND_REQUIRED` error type renamed to `PROPERTY_DEPENDENT_REQUIRED`

# 0.25.0

* `FEAT`: adjust `element-type` configuration and add `no-signal-event-sub-process` rule to allow signal start events in Camunda 8.2 ([#88](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/88))
* `FIX`: adjust `error-reference` rule to disallow error references without error code ([#89](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/89))

## 0.24.0

* `FEAT`: add `task-schedule` and `no-task-schedule` rules ([#86](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/86))

## 0.23.0

* `FEAT`: require history time to live in Camunda 7.19 ([#83](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/83))

## 0.22.0

* `FEAT`: allow error catch event without error code in Camunda 8.2 ([#81](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/81))

## 0.21.0

* `FEAT`: skip non-executable process ([#80](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/80))

## 0.20.0

* `FEAT`: add candidate users rule ([#76](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/76))
* `FEAT`: require escalation and escalation code in Camunda 8.2

## 0.19.0

* `FEAT`: allow escalation events in Camunda 8.2 ([#73](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/73))
* `FIX`: disallow error code expression for catch events ([#74](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/74))

## 0.18.0

* `FEAT`: add `no-expression` rule ([#69](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/69))

## 0.17.0

* `FEAT`: support `zeebe:Script` ([#67](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/67))

### Breaking Changes

* Rule `called-decision-or-task-definition` was renamed to `implementation`.

## 0.16.0

* `FEAT`: add link events to `element-type` rule ([#63](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/63))
* `DEPS`: update to `@bpmn-io/feel-lint@0.1.1`

## 0.15.2

* `FIX`: support weeks in timer duration and cycle ([#64](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/64))

## 0.15.1

* `FIX`: report process not executable for all affected flow element (containers) ([#61](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/61))

## 0.15.0

* `FEAT`: add `executable-process` rule ([#56](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/56))
* `FEAT`: add `sequence-flow-condition` rule ([#58](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/58))
* `FEAT`: add Camunda Platform 8.2 config ([#59](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/59))
* `FEAT`: add elements supported by Camunda Platform 8.2 to `element-type` rule ([#59](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/59))

## 0.14.1

* `FIX`: lint subprocesses without `isExpanded` attribute ([#55](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/55))
* `FIX`: correct typo in `FEEL_EXPRESSION_INVALID` message ([#55](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/55))

## 0.14.0

* `FEAT`: add `feel` rule to validate feel expressions ([#51](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/51))
* `FEAT`: add `collapsed-subprocess` rule to disallow collapsed subprocess ([#52](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/52))
* `CHORE`: `element-type` rule handles all errors using `ELEMENT_TYPE_NOT_ALLOWED` error type ([#50](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/50))
* `CHORE`: `timer` rule handles `bpmn:FormalExpression` elements using new error types `EXPRESSION_REQUIRED` and `EXPRESSION_VALUE_NOT_ALLOWED` ([#50](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/50))
* `CHORE`: refactor configuration of rules ([#50](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/50))

### Breaking Changes

* rules that need configuration (e.g. element-type) are now configured by specifying execution platform version
* element-type rule only reports `ELEMENT_TYPE_NOT_ALLOWED` errors
* timer rule reports new error types `EXPRESSION_REQUIRED` and `EXPRESSION_VALUE_NOT_ALLOWED`
* `report.error` was renamed to `report.data` as it is meant to be used for any additional data
* `ERROR_TYPES` were namespaced to avoid mistaking reports with `report.data.type` for Camunda-specific reports

## 0.13.1

* `FIX`: improve time date validation ([#49](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/49))

## 0.13.0

* `FEAT`: allow terminate end event in Camunda Platform 8.1 ([#48](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/48))
* `FEAT`: add `timer` rule ([#45](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/45))

## 0.12.0

* `FEAT`: add `inclusive-gateway` rule ([#44](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/44))

## 0.11.0

* `FEAT`: add `no-zeebe-properties` rule ([#43](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/43))
* `FEAT`: add Camunda Platform 8.1

## 0.10.0

* `FEAT`: add duplicate task headers rule ([#41](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/41))

## 0.9.2

* `FIX`: ignore null properties ([#39](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/39))

## 0.9.1

* `FIX`: add name to reports ([#38](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/38))

## 0.9.0

* `FEAT`: add user task forms rule ([#32](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/32))

## 0.8.0

* `FEAT`: add templates rule ([#31](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/31))

## 0.7.1

* `FIX`: lint subscription only if start event child of sub process ([#34](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/34))

## 0.7.0

* `FEAT`: refactor plugin structure ([#29](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/29))
* `DEPS`: update to `bpmnlint@7.8.0` ([#29](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/29))

### Breaking Changes

* configuration not selected based on execution platform and version anymore, either configure manually or use [`@camunda/linting`](https://github.com/camunda/linting)
* error message not adjusted to be shown in Camunda Modeler anymore
* error type ELEMENT_TYPE changed to ELEMENT_TYPE_NOT_ALLOWED
* error type PROPERTY_TYPE changed to PROPERTY_TYPE_NOT_ALLOWED
* error data changed (cf. docs/ERRORS.md)

## 0.6.2

* `FIX`: fix error message formatting ([#27](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/27))

## 0.6.1

* `FIX`: lanes supported ([#26](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/26))

## 0.6.0

* `FEAT`: adjust error messages to be more friendly ([#22](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/22))
* `FEAT`: lint error code and message name ([#21](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/21))
* `FIX`: task definition retries not required ([#20](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/20))

## 0.5.0

* `FEAT`: update Camunda Cloud rules to lint extension elements and their properties ([#18](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/18))

## 0.4.0

* `CHORE`: rename `Cloud` `1.4` to `8.0` ([#14](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/14))
* `CHORE`: rename `Cloud` to `Platform`/`Zeebe` ([#15](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/15))

## 0.3.0

* `FEAT`: support multiInstance for subprocesses with cloud 1.0 ([#6](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/6))
* `FEAT`: add Camunda Platform rules ([#5](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/5))
* `FEAT`: add Camunda Cloud 1.4 rule ([#5](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/5))
* `TEST`: add Cloud 1.1, 1.2, 1.3 integration tests ([#4](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/4))
* `TEST`: verify exported configs ([#5](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/5))
* `DEPS`: fix security audit warnings ([#6](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/6))
* `DOCS`: update link to documentation
* `DOCS`: link Camunda Cloud and Platform BPMN coverage

## 0.2.0

* `FEAT`: early return if execution platform does not match
* `FIX`: correct check for `bpmn:BaseElement`

## 0.1.1

* `FEAT`: initial support for Camunda Cloud 1.0, 1.1, 1.2, and 1.3

## ...

Check `git log` for earlier history.
