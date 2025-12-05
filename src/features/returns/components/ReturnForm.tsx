'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';

import {
  returnSale,
  returnRental,
  ReturnSaleDto,
  ReturnRentalDto,
} from '../services/returns.service';

import { fetchSales, Sale } from '../../sales/services/sales.service';
import { fetchRentals, Rental } from '../../rentals/services/rentals.service';

import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';
import { formatMoney } from '../../../lib/utils/formatters';

interface ReturnFormProps {
  onSuccess: () => void;
}

export function ReturnForm({ onSuccess }: ReturnFormProps) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<'SALE' | 'RENTAL'>('SALE');

  const [sales, setSales] = useState<Sale[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);

  const [selectedId, setSelectedId] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
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
        setRentals(rentalList);
      } catch {
        toast.push('error', 'Failed to load return data');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [toast]);

  /* ---------------------------------------------------------------------- */
  /*                                Submit                                   */
  /* ---------------------------------------------------------------------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedId) {
      return toast.push('error', 'Select sale or rental ID');
    }

    if (refundAmount <= 0) {
      return toast.push('error', 'Refund amount must be positive');
    }

    try {
      if (mode === 'SALE') {
        const dto: ReturnSaleDto = {
          saleId: selectedId,
          amount: refundAmount,
          reason: reason.trim() || undefined,
        };

        await returnSale(dto);
      } else {
        const dto: ReturnRentalDto = {
          rentalId: selectedId,
          amount: refundAmount,
          reason: reason.trim() || undefined,
        };

        await returnRental(dto);
      }

      toast.push('success', 'Return processed');
      closeModal();
      onSuccess();

    } catch {
      toast.push('error', 'Failed to process return');
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
      ? sales.map((s) => ({
          label: `Sale #${s.id} — Total: ${formatMoney(s.total)}`,
          value: s.id,
        }))
      : rentals.map((r) => ({
          label: `Rental #${r.rentalNumber} — Total: ${formatMoney(r.total)}`,
          value: r.id,
        }));

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
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
          setRefundAmount(0);
        }}
      />

      {/* Select sale or rental */}
      <Select
        label={mode === 'SALE' ? 'Sale ID' : 'Rental ID'}
        value={selectedId}
        options={selectableOptions}
        onChange={(e) => setSelectedId(e.target.value)}
      />

      {/* Refund amount */}
      <Input
        label="Refund Amount"
        type="number"
        value={refundAmount}
        onChange={(e) => setRefundAmount(Number(e.target.value))}
      />

      {/* Reason */}
      <Input
        label="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <Button className="w-full" variant="primary">
        Submit Return
      </Button>
    </form>
  );
}
