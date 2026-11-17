import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

// Rule ids in messages (CS-*, UI-*) point at .claude/skills/*/SKILL.md.
const sharedRestrictedImports = [
  {
    group: ['../../*'],
    message: 'Use the @/ alias for imports that leave the current folder pair (CS-03).'
  }
];

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
      // Giant files are where dead branches hide (CS-08).
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'no-restricted-globals': [
        'error',
        { name: 'confirm', message: 'Use <ConfirmDialog> (UI-04).' },
        { name: 'alert', message: 'Use toast() from @/shared/ui (UI-04).' },
        { name: 'prompt', message: 'Use a form in a <Dialog> (UI-04).' },
        { name: 'fetch', message: 'Use apiClient from @/shared/api (CS-04).' }
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'axios', message: 'Only src/shared/api may import axios (CS-04).' }],
          patterns: sharedRestrictedImports
        }
      ]
    }
  },
  {
    // The HTTP client is the one place axios is allowed.
    files: ['src/shared/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: sharedRestrictedImports }]
    }
  },
  {
    // shared/ is domain-agnostic: it never reaches up into app/ or a module (CS-02).
    files: ['src/shared/**/*.{ts,tsx}'],
    ignores: ['src/shared/api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'axios', message: 'Only src/shared/api may import axios (CS-04).' }],
          patterns: [
            ...sharedRestrictedImports,
            {
              group: ['@/modules/*', '@/app/*'],
              message: 'shared/ must not import app/ or modules/ (CS-02).'
            }
          ]
        }
      ]
    }
  },
  {
    // A module never imports another module. Shared code moves to shared/ (CS-02, CS-07).
    files: ['src/modules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'axios', message: 'Only src/shared/api may import axios (CS-04).' }],
          patterns: [
            ...sharedRestrictedImports,
            {
              group: ['@/modules/*', '@/app/*'],
              message:
                'Modules are isolated. Use relative imports inside a module and move shared code to src/shared (CS-02).'
            }
          ]
        }
      ]
    }
  },
  {
    // app/ wires modules through their public index only.
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'axios', message: 'Only src/shared/api may import axios (CS-04).' }],
          patterns: [
            ...sharedRestrictedImports,
            { group: ['@/modules/*/*'], message: 'Import a module through its index.ts (CS-02).' }
          ]
        }
      ]
    }
  },
  {
    // Route tables and test helpers are not hot-reloaded components.
    files: ['src/**/routes.tsx', 'src/shared/test/**'],
    rules: { 'react-refresh/only-export-components': 'off' }
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/shared/test/**'],
    rules: {
      'max-lines': 'off'
    }
  },
  {
    files: ['scripts/**/*.mjs', '*.config.{js,ts,cjs}', 'dev/**/*.ts'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: {
      'no-console': 'off',
      'no-restricted-globals': 'off',
      'max-lines': 'off'
    }
  },
  {
    // dev/ is TypeScript: the base rule reads the parameter names of a function type as unused variables.
    files: ['dev/**/*.ts'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
);
