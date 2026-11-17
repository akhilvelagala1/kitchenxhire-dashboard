import path from 'node:path';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { mockApi } from './dev/mockApi.ts';

/** In-memory API when `VITE_API_BASE_URL` is same-origin (e.g. `/api/v1`) or `--mode mock`. Never in builds. */
function useDevMockApi(mode: string, apiBase: string): boolean {
  if (mode === 'mock') return true;
  return apiBase.startsWith('/') && !apiBase.startsWith('//');
}

/** Lets the Pages build import mock handlers without putting `dev/` in tsconfig.app. */
function browserMockVirtual(): Plugin {
  return {
    name: 'kitchenxhire-browser-mock-virtual',
    resolveId(id) {
      if (id === 'virtual:browser-mock') return id;
      return undefined;
    },
    load(id) {
      if (id !== 'virtual:browser-mock') return undefined;
      return `export { handleMockApiRequest } from ${JSON.stringify(
        path.resolve(import.meta.dirname, './dev/mockApi.ts')
      )};`;
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = env.VITE_API_BASE_URL ?? '';
  const mockApiEnabled = useDevMockApi(mode, apiBase);
  const browserMock = env.VITE_BROWSER_MOCK === 'true';

  return {
    base: '/kitchenxhire-dashboard/',
    plugins: [
      react(),
      tailwindcss(),
      ...(browserMock ? [browserMockVirtual()] : []),
      ...(mockApiEnabled ? [mockApi()] : [])
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        buffer: 'buffer/'
      }
    },
    define: {
      global: 'globalThis'
    },
    optimizeDeps: {
      include: ['buffer']
    },
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true
    },
    build: {
      sourcemap: true
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/shared/test/setup.ts',
      css: false,
      testTimeout: 15_000,
      // CI has no .env file; env.ts validates this at import time.
      env: {
        VITE_API_BASE_URL: 'http://127.0.0.1:8080/api/v1'
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/shared/test/**', 'src/main.tsx']
      }
    }
  };
});
