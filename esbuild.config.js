import esbuild from 'esbuild';
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsSrc = join(__dirname, 'server', 'migrations');
const migrationsDest = join(__dirname, 'dist', 'migrations');

const externals = [
  'vite',
  '@vitejs/plugin-react',
  'vite/client',
  '@replit/vite-plugin-cartographer',
  '@replit/vite-plugin-runtime-error-modal',
  '@tailwindcss/vite'
];

esbuild.build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.js',
  external: externals,
  packages: 'external',
  minify: false,
  sourcemap: false,
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}).then(() => {
  mkdirSync(migrationsDest, { recursive: true });
  cpSync(migrationsSrc, migrationsDest, { recursive: true });
  console.log('Copied server/migrations -> dist/migrations');
}).catch(() => process.exit(1));
