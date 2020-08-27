module.exports = {
  env: {
    browser: false,
    es2020: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'max-len': ['warn', { code: 120 }],
    'import/extensions': ['off'],
    'no-console': ['off'],
  },
};
