// ESLint also enforces the screen architecture (docs/arquitetura.md, section 4):
// a feature never imports another feature, only shared/api talks to the server and
// only shared/storage touches IndexedDB.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const FEATURES = ['adaptation', 'sheet', 'profiles', 'history'];

const featureBoundaries = FEATURES.map((feature) => {
  const others = FEATURES.filter((name) => name !== feature).join('|');
  return {
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: `(^@/features/(${others}))|(^(\\.\\./)+(${others})(/|$))`,
              message: 'Uma funcionalidade não importa de outra. Mova o que é comum para shared.',
            },
            {
              regex: '^idb$',
              message: 'Use shared/storage para acessar o IndexedDB.',
            },
          ],
        },
      ],
    },
  };
});

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2023, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use o cliente em shared/api para chamar o servidor.' },
        { name: 'indexedDB', message: 'Use shared/storage para acessar o IndexedDB.' },
      ],
    },
  },
  ...featureBoundaries,
  prettier,
);
