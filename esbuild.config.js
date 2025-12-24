import esbuild from 'esbuild';

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
  minify: true,
  sourcemap: false,
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}).catch(() => process.exit(1));
