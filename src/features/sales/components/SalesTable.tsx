'use client';

import React, { useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';

import { fetchSales, getSale, cancelSale } from '../../../mocks/sales.local';

import { useUIStore } from '../../../store/ui.store';
import { useToastStore } from '../../../store/toast.store';
import { formatMoney, formatDateTime } from '../../../lib/utils/formatters';
import { SaleForm } from './SaleForm';

export function SalesTable() {
  const toast = useToastStore();
  const { openModal } = useUIStore();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await fetchSales();
    setSales(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-4">
      <Button onClick={() => openModal(<SaleForm onSuccess={load} />)}>
        New Sale
      </Button>

      <Table columns={['Date', 'Subtotal', 'Tax', 'Total', 'Payment']}>
        {sales.map((s) => (
          <tr key={s.id} className="border-b">
            <td>{formatDateTime(s.createdAt)}</td>
            <td>{formatMoney(s.subtotal)}</td>
            <td>{formatMoney(s.tax)}</td>
            <td className="font-semibold text-[#1B9C6F]">
              {formatMoney(s.total)}
            </td>
            <td>{s.paymentMethod}</td>
          </tr>
        ))}
      </Table>

      <Modal />
    </div>
  );
}
