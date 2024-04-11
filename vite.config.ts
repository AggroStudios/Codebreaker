import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import suidPlugin from '@suid/vite-plugin'
import config from 'config';

export default defineConfig({
  define: {
    $config: JSON.stringify(config.get('frontend') || {})
  },
  plugins: [suidPlugin(), solid()],
  build: {
    target: "esnext"
  },
});
