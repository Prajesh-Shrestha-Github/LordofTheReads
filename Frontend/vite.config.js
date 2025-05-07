import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-select/creatable': path.resolve(__dirname, 'node_modules/react-select/creatable/dist/react-select-creatable.cjs.js')
    }
  }
});
