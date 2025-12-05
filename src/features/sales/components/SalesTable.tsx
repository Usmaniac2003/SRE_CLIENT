'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';

import {
  fetchSales,
  Sale,
} from '../services/sales.service';

import { useUIStore } from '../../../store/ui.store';
import { useToastStore } from '../../../store/toast.store';
import { SaleForm } from './SaleForm';
import { formatMoney, formatDateTime } from '../../../lib/utils/formatters';

export function SalesTable() {
  const toast = useToastStore();
  const { openModal } = useUIStore();

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSales();
      setSales(data);
    } catch {
      toast.push('error', 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  function openCreateSale() {
    openModal(<SaleForm onSuccess={loadSales} />);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create sale button */}
      <div className="flex justify-end">
        <Button onClick={openCreateSale}>New Sale</Button>
      </div>

      <Table columns={['Date', 'Subtotal', 'Tax', 'Total', 'Payment', 'Coupon']}>
        {sales.map((sale) => (
          <tr key={sale.id} className="border-b border-[#D9E6DF]">
            <td className="px-4 py-2">{formatDateTime(sale.createdAt)}</td>
            <td className="px-4 py-2">{formatMoney(sale.subtotal)}</td>
            <td className="px-4 py-2">{formatMoney(sale.tax)}</td>
            <td className="px-4 py-2 font-semibold text-[#1B9C6F]">
              {formatMoney(sale.total)}
            </td>
            <td className="px-4 py-2">{sale.paymentMethod}</td>
            <td className="px-4 py-2">{sale.couponCode ?? '-'}</td>
          </tr>
        ))}
      </Table>

      <Modal />
    </div>
  );
}
