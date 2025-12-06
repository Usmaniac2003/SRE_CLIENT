import { create } from 'zustand';
import { tokenStorage } from '../lib/auth/token-storage';
import { decodeJwt, isTokenExpired } from '../lib/auth/jwt-utils';

export interface AuthUser {
  id: string;
  username: string;
  position: 'ADMIN' | 'CASHIER';
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // actions
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token, user) => {
    tokenStorage.set(token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    tokenStorage.clear();
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  loadFromStorage: () => {
    const token = tokenStorage.get();
    if (token && !isTokenExpired(token)) {
      const payload = decodeJwt(token);
      if (payload) {
        // Map role to position (backend uses 'role', frontend uses 'position')
        const user: AuthUser = {
          id: payload.sub,
          username: payload.username,
          position: payload.role as 'ADMIN' | 'CASHIER',
        };
        set({ token, user, isAuthenticated: true, isLoading: false });
        return;
      }
    }
    // Token is invalid or expired, clear it
    if (token) {
      tokenStorage.clear();
    }
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },
}));
