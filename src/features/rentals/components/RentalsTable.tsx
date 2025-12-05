'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';

import {
  fetchRentals,
  Rental,
} from '../services/rentals.service';

import { useUIStore } from '../../../store/ui.store';
import { useToastStore } from '../../../store/toast.store';
import { formatMoney, formatDate, formatDateTime } from '../../../lib/utils/formatters';
import { RentalForm } from './RentalForm';

export function RentalsTable() {
  const toast = useToastStore();
  const { openModal } = useUIStore();

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRentals = useCallback(async () => {
    try {
      setLoading(true);
      const list = await fetchRentals();
      setRentals(list);
    } catch {
      toast.push('error', 'Failed to load rentals');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRentals();
  }, [loadRentals]);

  function openCreateRental() {
    openModal(<RentalForm onSuccess={loadRentals} />);
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

      {/* New rental button */}
      <div className="flex justify-end">
        <Button onClick={openCreateRental}>New Rental</Button>
      </div>

      {/* Rental table */}
      <Table
        columns={[
          'Rental #',
          'Created',
          'Due Date',
          'Deposit',
          'Total',
          'Status',
        ]}
      >
        {rentals.map((rental) => (
          <tr key={rental.id} className="border-b border-[#D9E6DF]">
            <td className="px-4 py-2">{rental.rentalNumber}</td>
            <td className="px-4 py-2">{formatDateTime(rental.createdAt)}</td>
            <td className="px-4 py-2">{formatDate(rental.dueDate)}</td>
            <td className="px-4 py-2">{formatMoney(rental.deposit)}</td>
            <td className="px-4 py-2">{formatMoney(rental.total)}</td>

            <td className="px-4 py-2 font-semibold">
              {rental.returnedAt ? (
                <span className="text-green-600">Returned</span>
              ) : (
                <span className="text-red-600">Active</span>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <Modal />
    </div>
  );
}
