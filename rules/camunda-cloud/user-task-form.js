const { is } = require('bpmnlint-utils');

const {
  findExtensionElement,
  findExtensionElements,
  findParent,
  hasProperties,
  hasProperty
} = require('../utils/element');

const { reportErrors } = require('../utils/reporter');

const { skipInNonExecutableProcess } = require('../utils/rule');

const { greaterOrEqual } = require('../utils/version');

const formIdAllowedVersions = {
  desktop: '8.4',
  web: '8.0'
};

module.exports = skipInNonExecutableProcess(function({ modeler = 'desktop', version }) {
  function check(node, reporter) {
    if (!is(node, 'bpmn:UserTask')) {
      return;
    }

    const formDefinition = findExtensionElement(node, 'zeebe:FormDefinition');

    if (!formDefinition) {
      return;
    }

    let errors = [];

    const formIdAllowedVersion = formIdAllowedVersions[ modeler ];

    if (isFormIdAllowed(version, formIdAllowedVersion)) {
      errors = hasProperty(formDefinition, [
        'formKey',
        'formId'
      ], node);
    } else {
      errors = hasProperties(formDefinition, {
        formId: {
          allowed: false,
          allowedVersion: formIdAllowedVersion
        }
      }, node);

      if (errors.length) {
        reportErrors(node, reporter, errors);

        return;
      }

      errors = hasProperties(formDefinition, {
        formKey: {
          required: true
        }
      }, node);
    }

    if (errors.length) {
      reportErrors(node, reporter, errors);

      return;
    }

    const formKey = formDefinition.get('formKey');

    const userTaskForm = findUserTaskForm(node, formKey);

    if (!userTaskForm) {
      return;
    }

    errors = hasProperties(userTaskForm, {
      body: {
        required: true
      }
    }, node);

    if (errors.length) {
      reportErrors(node, reporter, errors);
    }
  }

  return {
    check
  };
});

// helpers //////////

function findUserTaskForm(node, formKey) {
  const process = findParent(node, 'bpmn:Process');

  if (!process) {
    return;
  }

  const userTaskForms = findExtensionElements(process, 'zeebe:UserTaskForm');

  if (userTaskForms && userTaskForms.length) {
    return userTaskForms.find(userTaskForm => {
      const id = userTaskForm.get('id');

      return `camunda-forms:bpmn:${ id }` === formKey;
    });
  }
}

function isFormIdAllowed(version, formIdAllowedVersion) {
  return greaterOrEqual(version, formIdAllowedVersion);
}