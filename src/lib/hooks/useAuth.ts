'use client';

import { useCallback } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { post } from '../api/http';
import { API } from '../api/api';

interface LoginResponse {
  accessToken: string;
  employee: {
    id: string;
    username: string;
    position: 'ADMIN' | 'CASHIER';
  };
}

export function useAuth() {
  const { token, user, isAuthenticated, setAuth, logout } = useAuthStore();

  const login = useCallback(async (username: string, password: string) => {
    const response = await post<LoginResponse>(API.auth.login, {
      username,
      password,
    });

    setAuth(response.accessToken, response.employee);
    return response;
  }, [setAuth]);

  return {
    token,
    user,
    isAuthenticated,

    login,
    logout,
  };
}
