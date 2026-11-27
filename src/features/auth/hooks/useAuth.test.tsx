import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../session/authContext';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('devolve o valor do AuthProvider', () => {
    const value: AuthContextValue = {
      state: { status: 'unauthenticated', notice: null },
      signIn: vi.fn(),
      signOut: vi.fn(),
      dismissNotice: vi.fn(),
    };
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );

    expect(renderHook(() => useAuth(), { wrapper }).result.current).toBe(value);
  });

  it('falha fora do AuthProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth precisa ser usado dentro de <AuthProvider>.',
    );
    vi.restoreAllMocks();
  });
});
