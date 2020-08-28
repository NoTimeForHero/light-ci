const projects = {
  'example-project': {
    script: 'build.sh', // Возможность поменять название сборочного скрипта для конкретного проекта
    security: {
      type: 'github', // Допустимые значения: ['github']
      secret: '%the_very_secret_key%'
    }
  }
};

const database = {
  type: 'memory' // Допустимые значения: ['memory', 'sqlite']
};

const authorization = {
  type: 'disabled'
};

export default {
  projects, authorization, database
};
