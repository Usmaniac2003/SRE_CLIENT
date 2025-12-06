import { get, post, patch, del } from '../../../lib/api/http';
import { API } from '../../../lib/api/api';

export interface CreateRentalDto {
  userId: string;
  employeeId: string;
  dueDate: string; // ISO date
  deposit: number;
  rentalNumber?: string; // Optional, backend will generate if not provided
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

export interface ReturnRecord {
  id: string;
  type: 'SALE' | 'RENTAL';
  amount: number;
  createdAt: string;
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
  returnRecord?: ReturnRecord | null;
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

export async function getRental(id: string): Promise<Rental> {
  return await get<Rental>(API.rentals.getOne(id));
}

export async function removeRentalItem(rentalId: string, itemId: string): Promise<Rental> {
  await del<void>(API.rentals.removeItem(rentalId, itemId));
  return await getRental(rentalId); // Fetch updated rental
}

export async function finalizeRental(
  id: string,
  dto: FinalizeRentalDto,
): Promise<Rental> {
  return await patch<Rental, FinalizeRentalDto>(API.rentals.finalize(id), dto);
}

export async function returnRental(id: string): Promise<Rental> {
  return await patch<Rental, void>(API.rentals.return(id));
}

export async function cancelRental(id: string): Promise<Rental> {
  return await patch<Rental, void>(API.rentals.cancel(id));
}
