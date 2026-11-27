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
      coverage: {
        provider: 'v8',
        // Conta todo arquivo de src/, inclusive os que nenhum teste importa.
        all: true,
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/test/**',
          'src/**/*.d.ts',
          // Bootstrap do React (createRoot): coberto pelo build, nao por teste unitario.
          'src/main.tsx',
          // Feature de referencia do padrao (README) e a antiga tela inicial: nenhuma rota usa.
          'src/features/example/**',
          'src/features/welcome/**',
        ],
        reporter: ['text-summary', 'text', 'html', 'json-summary'],
        // Piso do CI: abaixo disso `npm run test:coverage` falha.
        thresholds: {
          lines: 85,
          statements: 85,
          functions: 85,
          branches: 85,
        },
      },
    },
  }),
);
