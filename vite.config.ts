import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import config from 'config';
import pkg from './package.json';

export default defineConfig({
    define: {
        $config: JSON.stringify(config.get('frontend') || {}),
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    },
    plugins: [react()],
    build: {
        target: 'esnext',
    },
});
