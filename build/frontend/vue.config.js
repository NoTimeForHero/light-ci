module.exports = {
  configureWebpack: {
    devServer: {
      port: 9123,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          secure: false
        }
      }
    }
  }
};
