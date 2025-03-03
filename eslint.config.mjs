import js from '@eslint/js';
import globals from 'globals'; // Импортируем весь объект

export default [
  {
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.browser, // Глобальные переменные браузера
        ...globals.es2021,  // Глобальные переменные ES2021
        ...globals.node, // Раскомментируйте, если нужны переменные Node.js
      },
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
    rules: {},
  },
];