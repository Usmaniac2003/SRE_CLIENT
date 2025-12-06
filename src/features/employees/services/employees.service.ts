import { get, post, patch, del } from '../../../lib/api/http';
import { API } from '../../../lib/api/api';

export interface CreateEmployeeDto {
  username: string;
  password: string;
  position: 'ADMIN' | 'CASHIER';
}

export interface UpdateEmployeeDto {
  username?: string;
  password?: string;
  position?: 'ADMIN' | 'CASHIER';
  isActive?: boolean;
}

export interface Employee {
  id: string;
  username: string;
  position: 'ADMIN' | 'CASHIER';
  isActive: boolean;
  createdAt: string;
}

export async function fetchEmployees(): Promise<Employee[]> {
  return await get<Employee[]>(API.employees.findAll);
}

export async function fetchEmployee(id: string): Promise<Employee> {
  return await get<Employee>(API.employees.findOne(id));
}

export async function createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
  return await post<Employee, CreateEmployeeDto>(API.employees.create, dto);
}

export async function updateEmployee(
  id: string,
  dto: UpdateEmployeeDto,
): Promise<Employee> {
  return await patch<Employee, UpdateEmployeeDto>(API.employees.update(id), dto);
}

export async function toggleEmployeeStatus(id: string): Promise<Employee> {
  return await patch<Employee, void>(API.employees.toggleStatus(id));
}

export async function deleteEmployee(id: string): Promise<void> {
  return await del<void>(API.employees.delete(id));
}
