import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    silent: false,
    // Custom reporter: prints only test name + PASS/FAIL status.
    reporters: ['./vitest-reporters/name-status.cjs'],
    // Integration tests share one PostgreSQL database; parallel test files
    // would delete each other's fixtures mid-run (global cleanup per file).
    fileParallelism: false,
    setupFiles: [],
    env: {
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/tests/',
        '**/*.test.ts',
        '**/*.config.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
