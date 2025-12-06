'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';

import {
  returnSale,
  returnRental,
  calculateLateFee,
  ReturnSaleDto,
  ReturnRentalDto,
  LateFeeCalculation,
} from '../services/returns.service';

import { fetchSales, getSale, Sale } from '../../sales/services/sales.service';
import { fetchRentals, getRental, Rental } from '../../rentals/services/rentals.service';

import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';
import { formatMoney, formatDate } from '../../../lib/utils/formatters';

interface ReturnFormProps {
  onSuccess: () => void;
}

export function ReturnForm({ onSuccess }: ReturnFormProps) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const [mode, setMode] = useState<'SALE' | 'RENTAL'>('SALE');

  const [sales, setSales] = useState<Sale[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);

  const [selectedId, setSelectedId] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [lateFeeCalc, setLateFeeCalc] = useState<LateFeeCalculation | null>(null);
  const [returnedAt, setReturnedAt] = useState('');
  const [reason, setReason] = useState('');

  /* ---------------------------------------------------------------------- */
  /*                      Load sales & rentals for selection                 */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        const [salesList, rentalList] = await Promise.all([
          fetchSales(),
          fetchRentals(),
        ]);

        setSales(salesList);
        setRentals(rentalList.filter(r => !r.returnedAt)); // Only show non-returned rentals
      } catch {
        toast.push('error', 'Failed to load return data');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [toast]);

  /* ---------------------------------------------------------------------- */
  /*                      Load selected sale/rental details                  */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    async function loadDetails() {
      if (!selectedId) {
        setSelectedSale(null);
        setSelectedRental(null);
        setLateFeeCalc(null);
        return;
      }

      try {
        if (mode === 'SALE') {
          const sale = await getSale(selectedId);
          setSelectedSale(sale);
          setSelectedRental(null);
          setLateFeeCalc(null);
        } else {
          const rental = await getRental(selectedId);
          setSelectedRental(rental);
          setSelectedSale(null);
          // Calculate late fee with current date
          await calculateLateFeeForRental(rental.id);
        }
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to load details';
        toast.push('error', message);
      }
    }

    loadDetails();
  }, [selectedId, mode, toast]);

  /* ---------------------------------------------------------------------- */
  /*                      Calculate late fee for rental                      */
  /* ---------------------------------------------------------------------- */
  async function calculateLateFeeForRental(rentalId: string, returnDate?: string) {
    try {
      setCalculating(true);
      const calc = await calculateLateFee(rentalId, returnDate);
      setLateFeeCalc(calc);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to calculate late fee';
      toast.push('error', message);
    } finally {
      setCalculating(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                      Handle returned date change                        */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    if (mode === 'RENTAL' && selectedId && returnedAt) {
      calculateLateFeeForRental(selectedId, returnedAt);
    }
  }, [returnedAt, selectedId, mode]);

  /* ---------------------------------------------------------------------- */
  /*                                Submit                                   */
  /* ---------------------------------------------------------------------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedId) {
      return toast.push('error', 'Select sale or rental');
    }

    try {
      if (mode === 'SALE') {
        if (selectedSale?.returnRecords && selectedSale.returnRecords.length > 0) {
          return toast.push('error', 'This sale has already been returned');
        }

        const dto: ReturnSaleDto = {
          saleId: selectedId,
          reason: reason.trim() || undefined,
        };

        await returnSale(dto);
      } else {
        if (selectedRental?.returnRecord) {
          return toast.push('error', 'This rental has already been returned');
        }

        const dto: ReturnRentalDto = {
          rentalId: selectedId,
          returnedAt: returnedAt || undefined,
          reason: reason.trim() || undefined,
        };

        await returnRental(dto);
      }

      toast.push('success', 'Return processed successfully');
      closeModal();
      onSuccess();

    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to process return';
      toast.push('error', message);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                                Render                                   */
  /* ---------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  const selectableOptions =
    mode === 'SALE'
      ? sales
          .filter(s => !s.returnRecords || s.returnRecords.length === 0)
          .map((s) => ({
            label: `Sale #${s.id.substring(0, 8)}... — Total: ${formatMoney(s.total)}`,
            value: s.id,
          }))
      : rentals.map((r) => ({
          label: `Rental #${r.rentalNumber} — Due: ${formatDate(r.dueDate)}`,
          value: r.id,
        }));

  return (
    <form className="space-y-6 max-h-[80vh] overflow-y-auto" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-[#1B9C6F]">Process Return</h2>

      {/* Select mode */}
      <Select
        label="Return Type"
        value={mode}
        options={[
          { label: 'Sale Return', value: 'SALE' },
          { label: 'Rental Return', value: 'RENTAL' },
        ]}
        onChange={(e) => {
          setMode(e.target.value as 'SALE' | 'RENTAL');
          setSelectedId('');
          setSelectedSale(null);
          setSelectedRental(null);
          setLateFeeCalc(null);
          setReturnedAt('');
          setReason('');
        }}
      />

      {/* Select sale or rental */}
      <Select
        label={mode === 'SALE' ? 'Select Sale' : 'Select Rental'}
        value={selectedId}
        options={selectableOptions}
        onChange={(e) => setSelectedId(e.target.value)}
      />

      {/* Sale Details */}
      {mode === 'SALE' && selectedSale && (
        <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-[#1B9C6F] mb-3">Sale Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatMoney(selectedSale.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">{formatMoney(selectedSale.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-[#D9E6DF] pt-2">
              <span className="font-semibold">Refund Amount:</span>
              <span className="font-semibold text-[#1B9C6F] text-lg">
                {formatMoney(selectedSale.total)}
              </span>
            </div>
            {selectedSale.items && selectedSale.items.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#D9E6DF]">
                <p className="text-gray-600 mb-2">Items ({selectedSale.items.length}):</p>
                <div className="space-y-1">
                  {selectedSale.items.map((item) => (
                    <div key={item.id} className="text-xs text-gray-500">
                      • {item.quantity}x @ {formatMoney(item.unitPrice)} = {formatMoney(item.lineTotal)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rental Details */}
      {mode === 'RENTAL' && selectedRental && (
        <>
          <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-[#1B9C6F] mb-3">Rental Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Rental Number:</span>
                <span className="font-medium">{selectedRental.rentalNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">{formatDate(selectedRental.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit:</span>
                <span className="font-medium">{formatMoney(selectedRental.deposit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rental Total:</span>
                <span className="font-medium">{formatMoney(selectedRental.total)}</span>
              </div>
              {selectedRental.items && selectedRental.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#D9E6DF]">
                  <p className="text-gray-600 mb-2">Items ({selectedRental.items.length}):</p>
                  <div className="space-y-1">
                    {selectedRental.items.map((item) => (
                      <div key={item.id} className="text-xs text-gray-500">
                        • {item.quantity}x @ {formatMoney(item.unitPrice)} = {formatMoney(item.lineTotal)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Return Date Input */}
          <Input
            label="Return Date (optional, defaults to today)"
            type="datetime-local"
            value={returnedAt}
            onChange={(e) => setReturnedAt(e.target.value)}
          />

          {/* Late Fee Calculation */}
          {calculating ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : lateFeeCalc ? (
            <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-[#1B9C6F] mb-3">Late Fee Calculation</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Is Late:</span>
                  <span className={`font-medium ${lateFeeCalc.isLate ? 'text-red-600' : 'text-green-600'}`}>
                    {lateFeeCalc.isLate ? 'Yes' : 'No'}
                  </span>
                </div>
                {lateFeeCalc.isLate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Late:</span>
                    <span className="font-medium text-red-600">{lateFeeCalc.daysLate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Late Fee:</span>
                  <span className={`font-medium ${lateFeeCalc.lateFee > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {formatMoney(lateFeeCalc.lateFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#D9E6DF] pt-2">
                  <span className="text-gray-600">Deposit:</span>
                  <span className="font-medium">{formatMoney(lateFeeCalc.deposit)}</span>
                </div>
                <div className="flex justify-between border-t border-[#D9E6DF] pt-2">
                  <span className="font-semibold">Refund Amount:</span>
                  <span className="font-semibold text-[#1B9C6F] text-lg">
                    {formatMoney(lateFeeCalc.refund)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Reason */}
      <Input
        label="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter return reason"
      />

      <Button className="w-full" variant="primary" disabled={!selectedId}>
        Process Return
      </Button>
    </form>
  );
}
