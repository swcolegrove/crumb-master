module.exports = {
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
  },
  extends: [
    'airbnb-base',
    'plugin:vue/recommended',
  ],
  rules: {
    'max-len': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'func-names': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'vue/require-default-prop': 'off'
  },
  plugins: [
    'vue',
  ],
};
