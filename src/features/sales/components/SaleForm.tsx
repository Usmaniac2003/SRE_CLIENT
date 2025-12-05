'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';

import {
  createSale,
  addSaleItem,
  finalizeSale,
  Sale,
} from '../services/sales.service';

import { fetchInventory, Item } from '../../inventory/services/inventory.service';
import { useAuthStore } from '../../../store/auth.store';
import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';
import { formatMoney } from '../../../lib/utils/formatters';

export function SaleForm({ onSuccess }: { onSuccess: () => void }) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();
  const auth = useAuthStore();

  const [sale, setSale] = useState<Sale | null>(null);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // form fields
  const [itemId, setItemId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<'CASH' | 'CREDIT' | 'DEBIT' | 'CHECK'>('CASH');

  /* ---------------------------------------------------------------------- */
  /*                          Load inventory + create sale                   */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        const list = await fetchInventory();
        setInventory(list);

        const newSale = await createSale({
          employeeId: auth.user?.id ?? '',
        });

        setSale(newSale);
      } catch {
        toast.push('error', 'Failed to start sale');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [auth.user, toast]);

  /* ---------------------------------------------------------------------- */
  /*                                Add item                                 */
  /* ---------------------------------------------------------------------- */
  async function handleAddItem() {
    if (!sale) return;
    if (quantity <= 0) return toast.push('error', 'Quantity must be positive');

    try {
      const updated = await addSaleItem(sale.id, {
        itemId,
        quantity,
      });

      setSale(updated);
      toast.push('success', 'Item added');
    } catch {
      toast.push('error', 'Failed to add item');
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                              Finalize sale                              */
  /* ---------------------------------------------------------------------- */
  async function handleFinalize() {
    if (!sale) return;

    try {
      const finalized = await finalizeSale(sale.id, {
        paymentMethod,
        couponCode: couponCode.trim() || undefined,
      });

      toast.push('success', 'Sale completed');
      closeModal();
      onSuccess();
    } catch {
      toast.push('error', 'Failed to finalize sale');
    }
  }

  if (loading || !sale) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                                Render UI                                */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Sale totals */}
      <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1B9C6F] mb-3">Sale Totals</h2>

        <div className="space-y-1 text-sm">
          <div>Subtotal: {formatMoney(sale.subtotal)}</div>
          <div>Tax: {formatMoney(sale.tax)}</div>
          <div className="font-semibold text-[#1B9C6F]">
            Total: {formatMoney(sale.total)}
          </div>
        </div>
      </div>

      {/* Add Item */}
      <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 space-y-4 shadow-sm">
        <h3 className="font-semibold text-[#1B9C6F]">Add Item</h3>

        <Select
          label="Item"
          options={inventory.map((i) => ({
            label: `${i.name} ($${i.price})`,
            value: i.id,
          }))}
          value={itemId}
          onChange={(e) => setItemId(Number(e.target.value))}
        />

        <Input
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        <Button onClick={handleAddItem}>Add to Sale</Button>
      </div>

      {/* Payment + coupon */}
      <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 space-y-4 shadow-sm">
        <Select
          label="Payment Method"
          value={paymentMethod}
          options={[
            { label: 'Cash', value: 'CASH' },
            { label: 'Credit', value: 'CREDIT' },
            { label: 'Debit', value: 'DEBIT' },
            { label: 'Check', value: 'CHECK' },
          ]}
          onChange={(e) => setPaymentMethod(e.target.value as any)}
        />

        <Input
          label="Coupon Code (optional)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />

        <Button variant="primary" onClick={handleFinalize}>
          Finalize Sale
        </Button>
      </div>
    </div>
  );
}
