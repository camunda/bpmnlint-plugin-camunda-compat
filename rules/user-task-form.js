const { is } = require('bpmnlint-utils');

const {
  findExtensionElement,
  findExtensionElements,
  hasProperties
} = require('./utils/element');

const { reportErrors } = require('./utils/reporter');

const { skipInNonExecutableProcess } = require('./utils/rule');

module.exports = skipInNonExecutableProcess(function() {
  function check(node, reporter) {
    if (!is(node, 'bpmn:UserTask')) {
      return;
    }

    const formDefinition = findExtensionElement(node, 'zeebe:FormDefinition');

    if (!formDefinition) {
      return;
    }

    let errors = hasProperties(formDefinition, {
      formKey: {
        required: true
      }
    }, node);

    if (errors && errors.length) {
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

    if (errors && errors.length) {
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

function findParent(node, type) {
  if (!node) {
    return null;
  }

  const parent = node.$parent;

  if (!parent) {
    return node;
  }

  if (is(parent, type)) {
    return parent;
  }

  return findParent(parent, type);
}