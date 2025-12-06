import { get, post, patch, del } from '../../../lib/api/http';
import { API } from '../../../lib/api/api';

export interface CreateSaleDto {
  employeeId: string;
}

export interface SaleItemInput {
  itemId: number;
  quantity: number;
}

export interface CreateSaleWithItemsDto {
  employeeId: string;
  items: SaleItemInput[];
  paymentMethod: 'CASH' | 'CREDIT' | 'DEBIT' | 'CHECK';
  couponCode?: string;
}

export interface AddSaleItemDto {
  itemId: number;
  quantity: number;
}

export interface FinalizeSaleDto {
  paymentMethod: 'CASH' | 'CREDIT' | 'DEBIT' | 'CHECK';
  couponCode?: string;
}

export interface SaleItem {
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

export interface Sale {
  id: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  couponCode?: string;
  items: SaleItem[];
  returnRecords?: ReturnRecord[];
  createdAt: string;
}

export async function fetchSales(): Promise<Sale[]> {
  return await get<Sale[]>(API.sales.base);
}

export async function getSale(id: string): Promise<Sale> {
  return await get<Sale>(API.sales.getOne(id));
}

export async function createSale(dto: CreateSaleDto): Promise<Sale> {
  return await post<Sale, CreateSaleDto>(API.sales.create, dto);
}

export async function createSaleWithItems(dto: CreateSaleWithItemsDto): Promise<Sale> {
  return await post<Sale, CreateSaleWithItemsDto>(API.sales.create, dto);
}

export async function addSaleItem(id: string, dto: AddSaleItemDto): Promise<Sale> {
  return await patch<Sale, AddSaleItemDto>(API.sales.addItem(id), dto);
}

export async function removeSaleItem(saleId: string, itemId: string): Promise<Sale> {
  await del<void>(API.sales.removeItem(saleId, itemId));
  return await getSale(saleId); // Fetch updated sale
}

export async function finalizeSale(id: string, dto: FinalizeSaleDto): Promise<Sale> {
  return await patch<Sale, FinalizeSaleDto>(API.sales.finalize(id), dto);
}

export async function cancelSale(id: string): Promise<Sale> {
  return await patch<Sale, void>(API.sales.cancel(id));
}
