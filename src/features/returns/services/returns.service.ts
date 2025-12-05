import { get, post } from '../../../lib/api/http';
import { API } from '../../../lib/api/api';

export interface ReturnSaleDto {
  saleId: string;
  amount: number;
  reason?: string;
}

export interface ReturnRentalDto {
  rentalId: string;
  amount: number;
  reason?: string;
}

export interface ReturnRecord {
  id: string;
  type: 'SALE' | 'RENTAL';
  saleId?: string | null;
  rentalId?: string | null;
  amount: number;
  reason?: string | null;
  createdAt: string;
}

export async function fetchReturns(): Promise<ReturnRecord[]> {
  return await get<ReturnRecord[]>(API.returns.base);
}

export async function returnSale(dto: ReturnSaleDto): Promise<ReturnRecord> {
  return await post<ReturnRecord, ReturnSaleDto>(API.returns.sale, dto);
}

export async function returnRental(dto: ReturnRentalDto): Promise<ReturnRecord> {
  return await post<ReturnRecord, ReturnRentalDto>(API.returns.rental, dto);
}
