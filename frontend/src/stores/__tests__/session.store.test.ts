import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSessionStore } from '../session.store';

const mockLogin = vi.fn();
const mockFetchCurrentUser = vi.fn();

vi.mock('../../services/auth.service', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  fetchCurrentUser: (...args: unknown[]) => mockFetchCurrentUser(...args),
}));

const sampleUser = {
  id: 'user-123',
  email: 'alice@example.com',
  displayName: 'Alice Example',
  avatarColor: '#6366F1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

describe('session.store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('realiza login e persiste token/usuario', async () => {
    const store = useSessionStore();
    mockLogin.mockResolvedValue({
      status: 'ok',
      token: 'token-abc',
      user: sampleUser,
    });

    await store.login({ email: 'alice@example.com', password: 'secret' });

    expect(store.token).toBe('token-abc');
    expect(store.user).toEqual(sampleUser);
    expect(mockLogin).toHaveBeenCalledExactlyOnceWith({
      email: 'alice@example.com',
      password: 'secret',
    });
    expect(localStorage.getItem('fluxolab.token')).toContain('token-abc');
  });

  it('armazena erro quando login falha', async () => {
    const store = useSessionStore();
    const failure = new Error('Credenciais invalidas.');
    mockLogin.mockRejectedValue(failure);

    await expect(store.login({ email: 'alice@example.com', password: 'fail' })).rejects.toThrow(
      failure,
    );
    expect(store.error).toBe('Credenciais invalidas.');
  });

  it('carrega sessao persistida na inicializacao', async () => {
    localStorage.setItem('fluxolab.token', JSON.stringify('persisted-token'));
    localStorage.setItem('fluxolab.user', JSON.stringify(sampleUser));

    mockFetchCurrentUser.mockResolvedValue({
      ...sampleUser,
      displayName: 'Alice Atualizada',
    });

    const store = useSessionStore();
    await store.initialize();

    expect(mockFetchCurrentUser).toHaveBeenCalledExactlyOnceWith('persisted-token');
    expect(store.user?.displayName).toBe('Alice Atualizada');
    expect(store.initialized).toBe(true);
  });
});
