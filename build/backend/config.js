const projects = {
  'example-project': {
    script: 'build.sh', // Возможность поменять название сборочного скрипта для конкретного проекта
    security: {
      type: 'GITHUB',
      secret: 'hello_world'
    }
  }
};

const authorization = {
  type: 'disabled'
};

export default {
  projects, authorization
};
