import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function adminRoutePlugin() {
  return {
    name: 'admin-route-plugin',
    closeBundle() {
      try {
        const distDir = path.resolve(__dirname, 'dist');
        const adminDir = path.resolve(distDir, 'admin');
        const indexPath = path.resolve(distDir, 'index.html');
        if (fs.existsSync(indexPath)) {
          fs.mkdirSync(adminDir, { recursive: true });
          fs.copyFileSync(indexPath, path.resolve(adminDir, 'index.html'));
          console.log('[vite-build] Created dist/admin/index.html for guaranteed direct route support');
        }
      } catch (err) {
        console.error('Failed to create admin static index:', err);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '';

  return {
    plugins: [react(), adminRoutePlugin()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
    server: {
      port: 5173,
      host: true,
    },
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/xlsx')) {
              return 'vendor-xlsx';
            }
            if (id.includes('node_modules/jspdf')) {
              return 'vendor-jspdf';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('src/components/AdminPanel')) {
              return 'chunk-admin-panel';
            }
          },
        },
      },
    },
  };
});

