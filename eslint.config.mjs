import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const files = {
  test: [
    'test/**/*.js'
  ]
};

export default [

  // rules + test
  ...bpmnIoPlugin.configs.node,

  // test
  ...bpmnIoPlugin.configs.mocha.map(config => {

    return {
      ...config,
      files: files.test,
    };
  }),
  {
    languageOptions: {
      globals: {
        sinon: true,
        require: true
      }
    },
    files: files.test
  }
];