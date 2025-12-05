import { create } from 'zustand';
import { tokenStorage } from '../lib/auth/token-storage';

export interface AuthUser {
  id: string;
  username: string;
  position: 'ADMIN' | 'CASHIER';
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  // actions
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    tokenStorage.set(token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    tokenStorage.clear();
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = tokenStorage.get();
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
