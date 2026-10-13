import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  // Determine correct base path:
  // 1. Explicit VITE_BASE_PATH environment variable (highest priority)
  // 2. If a CNAME file exists in public/, a custom domain is active -> '/'
  // 3. In GitHub Actions without custom domain -> '/<repo-name>/'
  // 4. Default fallback -> './' (relative for maximum portability)
  const hasCNAME = fs.existsSync(path.resolve(__dirname, 'public/CNAME'));
  let calculatedBase = './';

  if (process.env.VITE_BASE_PATH) {
    calculatedBase = process.env.VITE_BASE_PATH;
  } else if (hasCNAME || process.env.CUSTOM_DOMAIN) {
    calculatedBase = '/';
  } else if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
    if (repoName) {
      calculatedBase = `/${repoName}/`;
    }
  }

  return {
    base: calculatedBase,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

