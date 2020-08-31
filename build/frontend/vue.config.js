const proxy_pass = process.env.PROXY_PASS || 'http://localhost:3000';

module.exports = {
  configureWebpack: {
    devServer: {
      port: 9123,
      proxy: {
        '/api': {
          target: proxy_pass,
          secure: false
        }
      }
    }
  }
};
