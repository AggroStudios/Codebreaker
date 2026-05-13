// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
  {
    files: ["src/**/*.{js,ts,tsx}"],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      'no-async-promise-executor': 'off',
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    }
  }
);