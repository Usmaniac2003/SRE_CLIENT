import { get } from '../../../lib/api/http';
import { API } from '../../../lib/api/api';

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  totalTax: number;
}

export interface RentalReport {
  totalRentals: number;
  totalRevenue: number;
  activeRentals: number;
}

export interface InventoryReport {
  totalItems: number;
  lowStock: number;
  totalValue: number;
}

export async function getSalesReport(): Promise<SalesReport> {
  return await get<SalesReport>(API.reports.sales);
}

export async function getRentalReport(): Promise<RentalReport> {
  return await get<RentalReport>(API.reports.rentals);
}

export async function getInventoryReport(): Promise<InventoryReport> {
  return await get<InventoryReport>(API.reports.inventory);
}
