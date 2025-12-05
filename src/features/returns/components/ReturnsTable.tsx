'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';

import {
  fetchReturns,
  ReturnRecord,
} from '../services/returns.service';

import { useUIStore } from '../../../store/ui.store';
import { useToastStore } from '../../../store/toast.store';
import { formatMoney, formatDateTime } from '../../../lib/utils/formatters';
import { ReturnForm } from './ReturnForm';

export function ReturnsTable() {
  const toast = useToastStore();
  const { openModal } = useUIStore();

  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReturns = useCallback(async () => {
    try {
      setLoading(true);
      const list = await fetchReturns();
      setReturns(list);
    } catch {
      toast.push('error', 'Failed to load return records');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  function openReturnForm() {
    openModal(<ReturnForm onSuccess={loadReturns} />);
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

      {/* Create new return button */}
      <div className="flex justify-end">
        <Button onClick={openReturnForm}>New Return</Button>
      </div>

      {/* Return records */}
      <Table columns={['Type', 'Reference ID', 'Amount', 'Reason', 'Date']}>
        {returns.map((rec) => (
          <tr key={rec.id} className="border-b border-[#D9E6DF]">
            <td className="px-4 py-2">
              {rec.type === 'SALE' ? (
                <span className="text-blue-600 font-semibold">Sale Return</span>
              ) : (
                <span className="text-purple-600 font-semibold">Rental Return</span>
              )}
            </td>

            <td className="px-4 py-2">
              {rec.saleId ?? rec.rentalId}
            </td>

            <td className="px-4 py-2 text-[#1B9C6F] font-semibold">
              {formatMoney(rec.amount)}
            </td>

            <td className="px-4 py-2">{rec.reason ?? '-'}</td>

            <td className="px-4 py-2">{formatDateTime(rec.createdAt)}</td>
          </tr>
        ))}
      </Table>

      <Modal />
    </div>
  );
}
