const projects = {
    'test-project1': {
      //script: 'build.sh', // Возможность поменять название сборочного скрипта для конкретного проекта
      security: {
        type: 'GITHUB',
        secret: 'BLj1O-G_vwAAIKZRthEN8'
      }
    }
  };

  const database = {
    type: 'sqlite', // Допустимые значения: ['memory', 'sqlite']
    filename: '/app/temp/sqlite.dat'
  };

  // const authorization = null;
  
  const authorization = {
    type: 'jwt',
    secret: process.env.SECRET_KEY ?? 'your_secret_key',
    authUrl: process.env.AUTH_URL ?? 'http://localhost:4000/app/login?callback=',
    alghorithm: 'HS256'
  };
  
  export default {
    projects, authorization, database
  };
  