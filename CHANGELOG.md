# Changelog

All notable changes to [bpmnlint-plugin-camunda-compat](https://github.com/camunda/bpmnlint-plugin-camunda-compat) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 0.7.0

* `FEAT`: refactor plugin structure ([#29](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/29))
* `DEPS`: update to `bpmnlint@7.8.0` ([#29](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/29))

### Breaking Changes

* configuration not selected based on execution platform and version anymore
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
