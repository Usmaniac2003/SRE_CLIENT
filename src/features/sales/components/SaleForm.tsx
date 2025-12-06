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
  const [itemId, setItemId] = useState<number | ''>('');
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

        if (auth.user?.id) {
          const newSale = await createSale({
            employeeId: auth.user.id,
          });

          setSale(newSale);
        }
      } catch {
        toast.push('error', 'Failed to start sale');
      } finally {
        setLoading(false);
      }
    }

    if (auth.user?.id) {
      init();
    }
  }, [auth.user?.id, toast]);


  /* ---------------------------------------------------------------------- */
  /*                                Add item                                 */
  /* ---------------------------------------------------------------------- */
  async function handleAddItem() {
    if (!sale) return;
    if (!itemId || itemId === '') {
      return toast.push('error', 'Please select an item');
    }
    if (quantity <= 0) {
      return toast.push('error', 'Quantity must be positive');
    }

    try {
      const updated = await addSaleItem(sale.id, {
        itemId: Number(itemId),
        quantity,
      });

      setSale(updated);
      setItemId('');
      setQuantity(1);
      toast.push('success', 'Item added');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to add item';
      toast.push('error', message);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                              Finalize sale                              */
  /* ---------------------------------------------------------------------- */
  async function handleFinalize() {
    if (!sale) return;

    if (sale.items.length === 0) {
      return toast.push('error', 'Cannot finalize sale with no items');
    }

    try {
      const finalized = await finalizeSale(sale.id, {
        paymentMethod,
        couponCode: couponCode.trim() || undefined,
      });

      toast.push('success', 'Sale completed');
      closeModal();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to finalize sale';
      toast.push('error', message);
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
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Sale totals - always visible at top */}
      <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1B9C6F] mb-3">Sale Totals</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Subtotal:</span>
            <div className="font-semibold">{formatMoney(sale.subtotal)}</div>
          </div>
          <div>
            <span className="text-gray-600">Tax:</span>
            <div className="font-semibold">{formatMoney(sale.tax)}</div>
          </div>
          <div>
            <span className="text-gray-600">Total:</span>
            <div className="font-semibold text-[#1B9C6F] text-lg">
              {formatMoney(sale.total)}
            </div>
          </div>
        </div>
      </div>

      {/* Main form - horizontal layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Add Item Section */}
        <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-[#1B9C6F] mb-4">Add Item</h3>
          <div className="space-y-4">
            <Select
              label="Item"
              options={[
                { label: 'Select an item...', value: '' },
                ...inventory.map((i) => ({
                  label: `${i.name} ($${i.price})`,
                  value: String(i.id),
                })),
              ]}
              value={itemId === '' ? '' : String(itemId)}
              onChange={(e) => {
                const val = e.target.value;
                setItemId(val === '' ? '' : Number(val));
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <div className="flex items-end">
                <Button onClick={handleAddItem} className="w-full">
                  Add to Sale
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment + Finalize Section */}
        <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-[#1B9C6F] mb-4">Payment & Finalize</h3>
          <div className="space-y-4">
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
              placeholder="Enter coupon code"
            />

            <Button 
              variant="primary" 
              onClick={handleFinalize}
              className="w-full"
              disabled={sale.items.length === 0}
            >
              Finalize Sale
            </Button>
          </div>
        </div>
      </div>

      {/* Sale Items List */}
      {sale.items.length > 0 && (
        <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-[#1B9C6F] mb-3">Items in Sale</h3>
          <div className="space-y-2">
            {sale.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b border-[#D9E6DF] last:border-0"
              >
                <div>
                  <span className="font-medium">
                    {inventory.find((i) => i.id === item.itemId)?.name || `Item ${item.itemId}`}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    x{item.quantity} @ {formatMoney(item.unitPrice)}
                  </span>
                </div>
                <div className="font-semibold">{formatMoney(item.lineTotal)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
