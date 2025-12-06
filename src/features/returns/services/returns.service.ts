import { get, post } from '../../../lib/api/http';
import { API } from '../../../lib/api/api';

export interface ReturnSaleDto {
  saleId: string;
  reason?: string;
}

export interface ReturnRentalDto {
  rentalId: string;
  returnedAt?: string;
  reason?: string;
}

export interface LateFeeCalculation {
  isLate: boolean;
  daysLate: number;
  lateFee: number;
  deposit: number;
  refund: number;
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

export async function getReturn(id: string): Promise<ReturnRecord> {
  return await get<ReturnRecord>(API.returns.getOne(id));
}

export async function calculateLateFee(rentalId: string, returnedAt?: string): Promise<LateFeeCalculation> {
  const url = returnedAt 
    ? `${API.returns.calculateLateFee(rentalId)}?returnedAt=${encodeURIComponent(returnedAt)}`
    : API.returns.calculateLateFee(rentalId);
  return await get<LateFeeCalculation>(url);
}

export async function returnSale(dto: ReturnSaleDto): Promise<ReturnRecord> {
  return await post<ReturnRecord, ReturnSaleDto>(API.returns.sale, dto);
}

export async function returnRental(dto: ReturnRentalDto): Promise<ReturnRecord> {
  return await post<ReturnRecord, ReturnRentalDto>(API.returns.rental, dto);
}
