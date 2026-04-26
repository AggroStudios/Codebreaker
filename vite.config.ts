import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import config from 'config';
import pkg from './package.json';

export default defineConfig({
    define: {
        $config: JSON.stringify(config.get('frontend') || {}),
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    },
    plugins: [
        react(),
        // Only active when building/running for Electron
        ...(process.env.ELECTRON === 'true'
            ? [
                  electron({
                      main: {
                          entry: 'electron/main.ts',
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
        // Relative paths required for Electron's file:// protocol
        ...(process.env.ELECTRON === 'true' ? { outDir: 'dist' } : {}),
    },
    base: process.env.ELECTRON === 'true' ? './' : '/',
});
