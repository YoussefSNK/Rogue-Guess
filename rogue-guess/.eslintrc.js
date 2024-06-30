module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    'linebreak-style': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vuejs-accessibility/label-has-for': 0,
    'vuejs-accessibility/click-events-have-key-events': 0,
    'max-len': ['error', { code: 150 }], // Augmenté à 150
    'object-curly-newline': 0,
    'comma-dangle': 0,
    'arrow-parens': 0,
    'no-bitwise': 0,
    'no-mixed-operators': 0,
    'import/order': 0,
  },
};
