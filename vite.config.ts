import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import config from 'config';

export default defineConfig({
    define: {
        $config: JSON.stringify(config.get('frontend') || {}),
    },
    plugins: [react()],
    build: {
        target: 'esnext',
    },
});
