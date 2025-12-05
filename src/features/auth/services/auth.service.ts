import { post } from '../../../lib/api/http';
import { API } from '../../../lib/api/api';
import { useAuthStore } from '../../../store/auth.store';

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  employee: {
    id: string;
    username: string;
    position: 'ADMIN' | 'CASHIER';
  };
}

export async function loginService(dto: LoginDto): Promise<LoginResponse> {
  const response = await post<LoginResponse, LoginDto>(API.auth.login, dto);

  // Store token + user in Zustand
  useAuthStore.getState().setAuth(response.accessToken, response.employee);

  return response;
}
