'use client';

import React, { useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';

import { fetchReturns, getReturn } from '../../../mocks/returns.local';
import { ReturnForm } from './ReturnForm';

import { useUIStore } from '../../../store/ui.store';
import { useToastStore } from '../../../store/toast.store';
import { formatDateTime, formatMoney } from '../../../lib/utils/formatters';

export function ReturnsTable() {
  const { openModal } = useUIStore();
  const toast = useToastStore();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetchReturns();
    setRecords(r);
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
      <Button onClick={() => openModal(<ReturnForm onSuccess={load} />)}>
        New Return
      </Button>

      <Table columns={["Type", "Ref ID", "Amount", "Date"]}>
        {records.map((rec) => (
          <tr key={rec.id} className="border-b">
            <td>{rec.type}</td>
            <td>{rec.saleId ?? rec.rentalId}</td>
            <td className="text-[#1B9C6F] font-semibold">
              {formatMoney(rec.amount)}
            </td>
            <td>{formatDateTime(rec.createdAt)}</td>
          </tr>
        ))}
      </Table>

      <Modal />
    </div>
  );
}
