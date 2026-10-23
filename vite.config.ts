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
    options: { typeAware: true, typeCheck: true },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
