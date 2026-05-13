import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import react from '@vitejs/plugin-react';
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
                fix: true,
                lintOnStart: true,
            }) : [],
            react({
                babel: {
                    plugins: [['babel-plugin-react-compiler']],
                },
            }),
        ],
        build: {
            target: 'esnext',
            minify: 'oxc',
            assetsInlineLimit: 0,
        },
    }
});
