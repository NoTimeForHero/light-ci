const proxyPass = process.env.PROXY_PASS || 'http://localhost:3000';
const environment = process.env.NODE_ENV;

module.exports = {
  chainWebpack: (config) => {
    if (environment !== 'production') return;
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
  },
  configureWebpack: {
    devServer: {
      port: 9123,
      proxy: {
        '/api': {
          target: proxyPass,
          secure: false
        }
      }
    }
  }
};
