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

// // Пример использования SQLite для сохранения логов билдов:
// const database = {
//   type: 'sqlite',
//   filename: '/app/temp/database.sqlite3'
// };

const authorization = {
  type: 'disabled'
};

export default {
  projects, authorization, database
};
