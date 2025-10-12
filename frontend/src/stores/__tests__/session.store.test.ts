import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSessionStore } from '../session.store';
import * as authService from '../../services/auth.service';

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

describe('Session Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    displayName: 'Test User',
    avatarColor: '#6366f1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: '2024-01-01T00:00:00.000Z',
  };

  const mockToken = 'mock-jwt-token';

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      const store = useSessionStore();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should restore session from localStorage', async () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn().mockImplementation((key) => {
          if (key === 'fluxolab.token') return mockToken;
          if (key === 'fluxolab.user') return JSON.stringify(mockUser);
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
      });

      vi.mocked(authService.fetchCurrentUser).mockResolvedValue(mockUser);

      const store = useSessionStore();
      await store.initialize();

      expect(store.token).toBe(mockToken);
      expect(store.user).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
    });

    it('should handle invalid stored session', async () => {
      const mockLocalStorage = {
        getItem: vi.fn().mockImplementation((key) => {
          if (key === 'fluxolab.token') return 'invalid-token';
          if (key === 'fluxolab.user') return 'invalid-json';
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
      });

      vi.mocked(authService.fetchCurrentUser).mockRejectedValue(new Error('Invalid token'));

      const store = useSessionStore();
      await store.initialize();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(authService.login).mockResolvedValue({
        token: mockToken,
        user: mockUser,
      });

      const store = useSessionStore();
      const result = await store.login(credentials);

      expect(result).toEqual(mockUser);
      expect(store.token).toBe(mockToken);
      expect(store.user).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
      expect(store.error).toBeNull();
    });

    it('should handle login errors', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const errorMessage = 'Invalid credentials';
      vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage));

      const store = useSessionStore();

      await expect(store.login(credentials)).rejects.toThrow(errorMessage);
      expect(store.error).toBe(errorMessage);
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });

    it('should set loading state during login', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(authService.login).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          token: mockToken,
          user: mockUser,
        }), 100))
      );

      const store = useSessionStore();

      const loginPromise = store.login(credentials);
      expect(store.loading).toBe(true);

      await loginPromise;
      expect(store.loading).toBe(false);
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      vi.mocked(authService.register).mockResolvedValue(undefined);
      vi.mocked(authService.login).mockResolvedValue({
        token: mockToken,
        user: mockUser,
      });

      const store = useSessionStore();
      const result = await store.register(userData);

      expect(result).toEqual(mockUser);
      expect(store.token).toBe(mockToken);
      expect(store.user).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
    });

    it('should handle registration errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      const errorMessage = 'Email already exists';
      vi.mocked(authService.register).mockRejectedValue(new Error(errorMessage));

      const store = useSessionStore();

      await expect(store.register(userData)).rejects.toThrow(errorMessage);
      expect(store.error).toBe(errorMessage);
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should clear session data', () => {
      const store = useSessionStore();

      // Set some data first
      store.setSession(mockToken, mockUser);
      expect(store.isAuthenticated).toBe(true);

      // Clear session
      store.clearSession();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('refreshUser', () => {
    it('should refresh user data successfully', async () => {
      const updatedUser = { ...mockUser, displayName: 'Updated Name' };

      vi.mocked(authService.fetchCurrentUser).mockResolvedValue(updatedUser);

      const store = useSessionStore();
      store.setSession(mockToken, mockUser);

      const result = await store.refreshUser();

      expect(result).toEqual(updatedUser);
      expect(store.user).toEqual(updatedUser);
    });

    it('should clear session on refresh failure', async () => {
      vi.mocked(authService.fetchCurrentUser).mockRejectedValue(new Error('Token expired'));

      const store = useSessionStore();
      store.setSession(mockToken, mockUser);

      const result = await store.refreshUser();

      expect(result).toBeNull();
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });
});
