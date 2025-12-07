/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';

import { fetchRentals, } from '../../../mocks/rentals.local';

import { formatDateTime, formatMoney, formatDate } from '../../../lib/utils/formatters';
import { useUIStore } from '../../../store/ui.store';
import { RentalForm } from './RentalForm';

export function RentalsTable() {
  const { openModal } = useUIStore();
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const list = await fetchRentals();
    setRentals(list);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

      <Button onClick={() => openModal(<RentalForm onSuccess={load} />)}>
        New Rental
      </Button>

      <Table
        columns={[
          "Rental #",
          "Created",
          "Due Date",
          "Deposit",
          "Total",
          "Status",
        ]}
      >
        {rentals.map((r) => (
          <tr key={r.id} className="border-b">
            <td>{r.rentalNumber}</td>
            <td>{formatDateTime(r.createdAt)}</td>
            <td>{formatDate(r.dueDate)}</td>
            <td>{formatMoney(r.deposit)}</td>
            <td>{formatMoney(r.total)}</td>
            <td>
              {r.returnedAt ? (
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
