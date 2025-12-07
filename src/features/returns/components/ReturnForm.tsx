'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';

import { fetchSales, getSale } from '../../../mocks/sales.local';
import { fetchRentals, getRental } from '../../../mocks/rentals.local';
import { returnSale, returnRental } from '../../../mocks/returns.local';

import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';
import { formatMoney } from '../../../lib/utils/formatters';

export function ReturnForm({ onSuccess }: { onSuccess: () => void }) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [mode, setMode] = useState<"SALE" | "RENTAL">("SALE");
  const [sales, setSales] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setSales(await fetchSales());
      const r = await fetchRentals();
      setRentals(r.filter((x: any) => !x.returnedAt));
      setLoading(false);
    }
    init();
  }, []);

  async function handleSubmit() {
    if (!selectedId) return toast.push("error", "Select record");

    if (mode === "SALE") {
      await returnSale({ saleId: selectedId });
    } else {
      await returnRental({ rentalId: selectedId });
    }

    toast.push("success", "Return processed");
    closeModal();
    onSuccess();
  }

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );

  const options =
    mode === "SALE"
      ? sales.map((s) => ({
          label: `Sale #${s.id.substring(0, 6)} — ${formatMoney(s.total)}`,
          value: s.id,
        }))
      : rentals.map((r) => ({
          label: `Rental #${r.rentalNumber}`,
          value: r.id,
        }));

  return (
    <div className="space-y-6">

      <Select
        label="Return Type"
        value={mode}
        onChange={(e) => setMode(e.target.value as any)}
        options={[
          { label: "Sale", value: "SALE" },
          { label: "Rental", value: "RENTAL" },
        ]}
      />

      <Select
        label={mode === "SALE" ? "Select Sale" : "Select Rental"}
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        options={options}
      />

      <Button className="w-full" onClick={handleSubmit}>
        Process Return
      </Button>
    </div>
  );
}
