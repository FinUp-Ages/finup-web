/**
 * `env` dos testes, no mesmo formato de shared/config/env, com valores seguros por padrao:
 * mocks ligados, sem widgets da API e sem Cognito configurado.
 *
 * Uso no topo do arquivo de teste:
 *   vi.mock('@/shared/config/env', async () => (await import('@/test/env')).mockEnv());
 * Com outro valor inicial: mockEnv({ useMocks: false }).
 * Para trocar no meio do arquivo: setEnv({ useMocks: false }), e resetEnv() no afterEach.
 */
import type { env as appEnv } from '@/shared/config/env';

type Env = { -readonly [K in keyof typeof appEnv]: (typeof appEnv)[K] };

const defaults: Env = {
  dashboardWidgetsApi: false,
  apiBaseUrl: 'http://localhost:8080',
  useMocks: true,
  cognito: { region: '', clientId: '' },
};

let initial: Env = { ...defaults };
// Mesmo objeto que o vi.mock entrega como `env`: setEnv e resetEnv mudam o que o codigo le.
let current: Env = { ...defaults };

export function mockEnv(overrides: Partial<Env> = {}): { env: Env } {
  initial = { ...defaults, ...overrides };
  current = { ...initial };
  return { env: current };
}

export function setEnv(patch: Partial<Env>): void {
  Object.assign(current, patch);
}

export function resetEnv(): void {
  Object.assign(current, initial);
}
