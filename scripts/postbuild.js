import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('[postbuild] Error: dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

const htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

// List of clean routes to generate static directory fallbacks for GitHub Pages
const routes = [
  'admin',
  'services',
  'case-studies',
  'products',
  'about',
  'contact',
  'privacy',
  'terms',
];

console.log('[postbuild] Generating static entry points for clean URL access on GitHub Pages...');

routes.forEach((route) => {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  const routeIndexPath = path.join(routeDir, 'index.html');
  fs.writeFileSync(routeIndexPath, htmlContent, 'utf-8');
  console.log(`  ✓ Generated ${route}/index.html (Clean URL /${route})`);
});

// Ensure .nojekyll exists in dist
const nojekyllPath = path.join(distDir, '.nojekyll');
if (!fs.existsSync(nojekyllPath)) {
  fs.writeFileSync(nojekyllPath, '# Disable Jekyll processing on GitHub Pages\n', 'utf-8');
  console.log('  ✓ Created dist/.nojekyll');
}

// Ensure 404.html exists in dist
const notFoundPath = path.join(distDir, '404.html');
if (!fs.existsSync(notFoundPath)) {
  fs.writeFileSync(notFoundPath, htmlContent, 'utf-8');
  console.log('  ✓ Created dist/404.html SPA fallback');
}

console.log('[postbuild] All static routes generated successfully.');
