'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';

import {
  getSalesReport,
  getRentalReport,
  getInventoryReport,
  SalesReport,
  RentalReport,
  InventoryReport,
} from '../services/reports.service';

import { useToastStore } from '../../../store/toast.store';
import { formatMoney } from '../../../lib/utils/formatters';

export function ReportsCards() {
  const toast = useToastStore();

  const [sales, setSales] = useState<SalesReport | null>(null);
  const [rentals, setRentals] = useState<RentalReport | null>(null);
  const [inventory, setInventory] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------------------- */
  /*                         Load all reports in parallel                    */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);

        const [salesData, rentalData, inventoryData] = await Promise.all([
          getSalesReport(),
          getRentalReport(),
          getInventoryReport(),
        ]);

        setSales(salesData);
        setRentals(rentalData);
        setInventory(inventoryData);

      } catch {
        toast.push('error', 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [toast]);

  /* ---------------------------------------------------------------------- */
  /*                                 Loading                                 */
  /* ---------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (!sales || !rentals || !inventory) {
    return (
      <div className="text-center text-red-600 font-semibold py-6">
        Error loading reports.
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                                Render UI                                */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Sales report */}
      <Card className="p-6 bg-white border border-[#D9E6DF] shadow-sm rounded-xl">
        <h3 className="text-xl font-semibold text-[#1B9C6F] mb-4">Sales Summary</h3>

        <p className="text-[#4A5A52]">
          Total Sales: <span className="font-medium">{sales.totalSales}</span>
        </p>

        <p className="text-[#4A5A52]">
          Revenue: <span className="font-medium">{formatMoney(sales.totalRevenue)}</span>
        </p>

        <p className="text-[#4A5A52]">
          Tax Collected: <span className="font-medium">{formatMoney(sales.totalTax)}</span>
        </p>
      </Card>

      {/* Rentals report */}
      <Card className="p-6 bg-white border border-[#D9E6DF] shadow-sm rounded-xl">
        <h3 className="text-xl font-semibold text-[#1B9C6F] mb-4">Rental Summary</h3>

        <p className="text-[#4A5A52]">
          Total Rentals: <span className="font-medium">{rentals.totalRentals}</span>
        </p>

        <p className="text-[#4A5A52]">
          Revenue: <span className="font-medium">{formatMoney(rentals.totalRevenue)}</span>
        </p>

        <p className="text-[#4A5A52]">
          Active Rentals: <span className="font-medium">{rentals.activeRentals}</span>
        </p>
      </Card>

      {/* Inventory report */}
      <Card className="p-6 bg-white border border-[#D9E6DF] shadow-sm rounded-xl">
        <h3 className="text-xl font-semibold text-[#1B9C6F] mb-4">Inventory Summary</h3>

        <p className="text-[#4A5A52]">
          Total Items: <span className="font-medium">{inventory.totalItems}</span>
        </p>

        <p className="text-[#4A5A52]">
          Low Stock Items: <span className="font-medium">{inventory.lowStock}</span>
        </p>

        <p className="text-[#4A5A52]">
          Inventory Value: <span className="font-medium">
            {formatMoney(inventory.totalValue)}
          </span>
        </p>
      </Card>
    </div>
  );
}
