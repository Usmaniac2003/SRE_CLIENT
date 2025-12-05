import { get, post, patch } from '../../../lib/api/http';
import { API } from '../../../lib/api/api';

export interface CreateRentalDto {
  userId: string;
  employeeId: string;
  dueDate: string; // ISO date
  deposit: number;
}

export interface AddRentalItemDto {
  itemId: number;
  quantity: number;
}

export interface FinalizeRentalDto {
  total: number;
}

export interface RentalItem {
  id: string;
  itemId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Rental {
  id: string;
  rentalNumber: string;
  userId: string;
  employeeId: string;
  deposit: number;
  total: number;
  dueDate: string;
  returnedAt?: string | null;
  items: RentalItem[];
  createdAt: string;
}

export async function fetchRentals(): Promise<Rental[]> {
  return await get<Rental[]>(API.rentals.base);
}

export async function createRental(dto: CreateRentalDto): Promise<Rental> {
  return await post<Rental, CreateRentalDto>(API.rentals.create, dto);
}

export async function addRentalItem(
  id: string,
  dto: AddRentalItemDto,
): Promise<Rental> {
  return await patch<Rental, AddRentalItemDto>(API.rentals.addItem(id), dto);
}

export async function finalizeRental(
  id: string,
  dto: FinalizeRentalDto,
): Promise<Rental> {
  return await patch<Rental, FinalizeRentalDto>(API.rentals.finalize(id), dto);
}
