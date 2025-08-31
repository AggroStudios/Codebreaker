import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['**/*.test.ts'],
        globals: true,
        environment: 'node',
        root: './',
        alias: {
            '@src': './src',
            '@test': './test',
        },
    },
    resolve: {
        alias: {
            '@src': './src',
            '@test': './test',
        },
    },
});
