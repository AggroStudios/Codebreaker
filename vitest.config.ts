import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [solid()],
    test: {
        include: ['**/*.test.ts', '**/*.test.tsx'],
        globals: true,
        environment: 'jsdom',
        root: './',
        alias: {
            '@src': './src',
            '@test': './test',
        },
    },
    resolve: {
        conditions: ['development', 'browser'],
        alias: {
            '@src': './src',
            '@test': './test',
        },
    },
});
