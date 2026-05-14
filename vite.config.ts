import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import config from 'config';
import pkg from './package.json';

export default defineConfig(({ command }) => {
    return {
        define: {
            $config: JSON.stringify(config.get('frontend') || {}),
            'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
        },
        plugins: [
            command === 'serve' ? eslint({
                include: ['src/**/*.ts', 'src/**/*.tsx'],
                exclude: ['node_modules', 'dist'],
                fix: true,
                lintOnStart: true,
            }) : [],
            react({
                babel: {
                    plugins: [['babel-plugin-react-compiler']],
                },
            }),
            // Only active when building/running for Electron
            ...(process.env.ELECTRON === 'true'
                ? [
                    electron({
                        main: {
                            entry: 'electron/main.ts',
                            vite: {
                                build: {
                                    // Mark native node modules as external so Rolldown does not try
                                    // to read their .node binaries as UTF-8 source files. They will
                                    // be resolved at runtime by Node's require() from node_modules.
                                    rollupOptions: {
                                        external: ['steamworks.js'],
                                    },
                                },
                            },
                        },
                        preload: {
                            input: 'electron/preload.ts',
                        },
                    }),
                ]
                : []),
        ],
        build: {
            target: 'esnext',
            minify: 'oxc',
            assetsInlineLimit: 0,
            // Relative paths required for Electron's file:// protocol
            ...(process.env.ELECTRON === 'true' ? {
                outDir: 'dist',
            } : {}),
        },
        base: process.env.ELECTRON === 'true' ? './' : '/',
    }
});
