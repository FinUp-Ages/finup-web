import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

/** Testes com Vitest + Testing Library, reaproveitando plugins e alias "@" do Vite. */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }),
);
