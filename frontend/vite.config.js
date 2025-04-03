import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    mimeTypes: {
      'jsx': 'application/javascript',
      'js': 'application/javascript'
    }
  }
});
