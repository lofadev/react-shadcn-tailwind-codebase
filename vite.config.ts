import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

// https://vite.dev/config/
export default defineConfig({
  fmt: {
    printWidth: 120,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    jsxSingleQuote: false,
    trailingComma: 'all',
    arrowParens: 'always',
    endOfLine: 'lf',
    sortPackageJson: false,
    ignorePatterns: ['dist/**', 'node_modules/**', 'public/**', '**/*.{css,scss,md,mdx,html,json,jsonc,yaml,yml}'],
    sortTailwindcss: {},
    sortImports: {
      customGroups: [
        { groupName: 'react', elementNamePattern: ['react'] },
        { groupName: 'components', elementNamePattern: ['@/components/**'] },
      ],
      groups: [
        'react',
        ['builtin', 'external'],
        'components',
        'internal',
        ['parent', 'sibling', 'index', 'style', 'side_effect'],
        'unknown',
      ],
      newlinesBetween: true,
      internalPattern: ['@/'],
    },
  },
  lint: {
    plugins: ['eslint', 'typescript', 'react', 'oxc'],
    ignorePatterns: ['dist/**', 'node_modules/**', 'public/**', 'build/**', 'src/assets/**', '**/*.md'],
    rules: {
      'no-console': 'error',
      'no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
      'typescript/no-explicit-any': 'warn',
      'no-use-before-define': 'error',
      'no-duplicate-imports': 'warn',
      'react/jsx-key': [
        'error',
        { checkFragmentShorthand: true, checkKeyMustBeforeSpread: true, warnOnDuplicates: true },
      ],
      'react/rules-of-hooks': 'error',
      'react/exhaustive-deps': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'react/react-in-jsx-scope': 'off',
      'react/only-export-components': 'off',
      eqeqeq: 'off',
      'typescript/no-floating-promises': 'off',
      'typescript/no-useless-default-assignment': 'off',
    },
    options: { typeAware: true, typeCheck: true },
  },
  staged: {
    '*.{js,jsx,ts,tsx}': ['vp lint --fix --fix-suggestions', 'vp fmt'],
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
