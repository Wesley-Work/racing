import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

const srcRootPath = path.resolve(__dirname, './src');
const packagesRootPath = path.resolve(__dirname, '../');

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  server: {
    port: 40156,
    host: '0.0.0.0',
    open: true,
  },
  resolve: {
    alias: {
      '@': srcRootPath,
      '@rac/config': path.resolve(packagesRootPath, 'config'),
    },
  },
  plugins: [vue(), vueJsx()],
});
