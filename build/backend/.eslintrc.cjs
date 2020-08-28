module.exports = {
  env: {
    browser: false,
    es2020: true
  },
  extends: [
    'airbnb-base'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'max-len': ['warn', { code: 120 }],
    'import/extensions': ['off'],
    'no-console': ['off'],
    'comma-dangle': ['error', 'never'],
    'no-restricted-syntax': ['error', 'FunctionExpression', 'WithStatement', 'BinaryExpression[operator=\'in\']']
  }
};
