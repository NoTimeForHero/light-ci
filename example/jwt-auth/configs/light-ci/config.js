const database = {
  type: 'sqlite',
  filename: '/app/temp/sqlite.dat'
};
 
const authorization = {
  type: 'jwt',
  secret: process.env.SECRET_KEY,
  authUrl: process.env.AUTH_URL,
  alghorithm: 'HS256'
};
  
export default {
  projects, authorization, database
};
  