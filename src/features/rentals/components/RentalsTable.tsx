'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';

import {
  fetchRentals,
  getRental,
  returnRental,
  cancelRental,
  Rental,
} from '../services/rentals.service';

import { useUIStore } from '../../../store/ui.store';
import { useToastStore } from '../../../store/toast.store';
import { useAuthStore } from '../../../store/auth.store';
import { formatMoney, formatDate, formatDateTime } from '../../../lib/utils/formatters';
import { RentalForm } from './RentalForm';

export function RentalsTable() {
  const toast = useToastStore();
  const { openModal, closeModal } = useUIStore();
  const auth = useAuthStore();

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
          'Actions',
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
            <td className="px-4 py-2">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      const rentalDetails = await getRental(rental.id);
                      openModal(
                        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                          <h2 className="text-lg font-semibold text-[#1B9C6F]">Rental Details</h2>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rental Number:</span>
                              <span className="font-medium">{rentalDetails.rentalNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created:</span>
                              <span className="font-medium">{formatDateTime(rentalDetails.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Due Date:</span>
                              <span className="font-medium">{formatDate(rentalDetails.dueDate)}</span>
                            </div>
                            {rentalDetails.returnedAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Returned:</span>
                                <span className="font-medium">{formatDateTime(rentalDetails.returnedAt)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Deposit:</span>
                              <span className="font-medium">{formatMoney(rentalDetails.deposit)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total:</span>
                              <span className="font-semibold text-[#1B9C6F]">{formatMoney(rentalDetails.total)}</span>
                            </div>
                            {rentalDetails.items && rentalDetails.items.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-[#D9E6DF]">
                                <p className="font-semibold mb-2">Items ({rentalDetails.items.length}):</p>
                                <div className="space-y-1">
                                  {rentalDetails.items.map((item) => (
                                    <div key={item.id} className="text-xs text-gray-600">
                                      • {item.quantity}x @ {formatMoney(item.unitPrice)} = {formatMoney(item.lineTotal)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    } catch (error: any) {
                      toast.push('error', error?.response?.data?.message || 'Failed to load rental details');
                    }
                  }}
                >
                  View
                </Button>
                {!rental.returnedAt && (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      if (!confirm('Process return for this rental? You will be redirected to the return form.')) {
                        return;
                      }
                      closeModal();
                      // Redirect to returns page or open return form
                      window.location.href = '/dashboard/returns';
                    }}
                  >
                    Return
                  </Button>
                )}
                {auth.user?.position === 'ADMIN' && !rental.returnedAt && (
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (!confirm('Are you sure you want to cancel this rental? This will restore inventory.')) {
                        return;
                      }
                      try {
                        await cancelRental(rental.id);
                        toast.push('success', 'Rental cancelled');
                        loadRentals();
                      } catch (error: any) {
                        toast.push('error', error?.response?.data?.message || 'Failed to cancel rental');
                      }
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal />
    </div>
  );
}
