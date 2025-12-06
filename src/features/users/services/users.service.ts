import { get, post, patch, del } from '../../../lib/api/http';
import { API } from '../../../lib/api/api';

export interface CreateUserDto {
  name: string;
  phone: string;
  email?: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  email?: string;
  hasCredit?: boolean;
  creditValue?: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  hasCredit: boolean;
  creditValue: number;
  createdAt: string;
}

export async function fetchUsers(): Promise<User[]> {
  return await get<User[]>(API.users.findAll);
}

export async function fetchUser(id: string): Promise<User> {
  return await get<User>(API.users.findOne(id));
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  return await post<User, CreateUserDto>(API.users.create, dto);
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<User> {
  return await patch<User, UpdateUserDto>(API.users.update(id), dto);
}

export async function deleteUser(id: string): Promise<void> {
  return await del<void>(API.users.delete(id));
}
