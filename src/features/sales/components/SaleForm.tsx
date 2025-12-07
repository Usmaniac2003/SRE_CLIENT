'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';

import { fetchInventory } from '../../../mocks/inventory.local';
import { createSaleWithItems } from '../../../mocks/sales.local';

import { useAuthStore } from '../../../store/auth.store';
import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';
import { formatMoney } from '../../../lib/utils/formatters';

interface LocalSaleItem {
  itemId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  itemName: string;
}

export function SaleForm({ onSuccess }: { onSuccess: () => void }) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();
  const auth = useAuthStore();

  const [inventory, setInventory] = useState<any[]>([]);
  const [saleItems, setSaleItems] = useState<LocalSaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [itemId, setItemId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentType, setPaymentType] = useState('');


  useEffect(() => {
    async function load() {
      const list = await fetchInventory();
      setInventory(list);
      setLoading(false);
    }
    load();
  }, []);

  function addItem() {
    if (!itemId) return toast.push("error", "Select an item");

    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const existing = saleItems.find((s) => s.itemId === itemId);

    // Update quantity if exists
    if (existing) {
      const newQty = existing.quantity + quantity;

      if (newQty > item.quantity)
        return toast.push("error", "Not enough stock");

      existing.quantity = newQty;
      existing.lineTotal = newQty * existing.unitPrice;

      setSaleItems([...saleItems]);
    } else {
      setSaleItems([
        ...saleItems,
        {
          itemId,
          quantity,
          unitPrice: item.price,
          lineTotal: quantity * item.price,
          itemName: item.name,
        },
      ]);
    }

    setItemId('');
    setQuantity(1);
  }

  function updateQty(id: number, q: number) {
    if (q <= 0) {
      setSaleItems(saleItems.filter((i) => i.itemId !== id));
      return;
    }

    const stock = inventory.find((i) => i.id === id);

    if (q > stock.quantity) {
      toast.push("error", "Not enough stock");
      return;
    }

    setSaleItems(
      saleItems.map((s) =>
        s.itemId === id
          ? { ...s, quantity: q, lineTotal: q * s.unitPrice }
          : s
      )
    );
  }

  async function createSale() {
    if (!auth.user) return toast.push("error", "Not logged in");
    if (saleItems.length === 0) return toast.push("error", "Add items");

    await createSaleWithItems({
      employeeId: auth.user.id,
      items: saleItems.map((x) => ({
        itemId: x.itemId,
        quantity: x.quantity,
      })),
      paymentMethod,
      couponCode: couponCode.trim() || undefined,
    });

    toast.push("success", "Sale created");
    closeModal();
    onSuccess();
  }

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );

  const subtotal = saleItems.reduce((s, x) => s + x.lineTotal, 0);
  const tax = subtotal * 0.07;
  const discount = couponCode ? subtotal * 0.1 : 0;
  const total = subtotal + tax - discount;

  return (
    <div className="space-y-6 p-1 max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold text-[#1B9C6F]">
        Create Sale
      </h2>

      <div className="bg-white p-4 border rounded-lg">
        <Select
          label="Item"
          value={itemId === '' ? '' : String(itemId)}
          onChange={(e) => setItemId(Number(e.target.value))}
          options={[
            { label: "Select item...", value: "" },
            ...inventory.map((i) => ({
              label: `${i.name} (${formatMoney(i.price)})`,
              value: i.id,
            })),
          ]}
        />

        <Input
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        <Button className="w-full mt-3" onClick={addItem}>
          Add Item
        </Button>
      </div>

      {saleItems.length > 0 && (
        <div className="bg-white p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Items</h3>

          {saleItems.map((item) => (
            <div
              key={item.itemId}
              className="flex justify-between border-b py-2"
            >
              <div>
                <div className="font-medium">{item.itemName}</div>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQty(item.itemId, Number(e.target.value))
                  }
                  className="w-20"
                />
              </div>

              <div className="flex items-center gap-2">
                <span>{formatMoney(item.lineTotal)}</span>
                <Button
                  variant="danger"
                  onClick={() =>
                    setSaleItems(saleItems.filter((x) => x.itemId !== item.itemId))
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-4 border rounded-lg">
        <Select
          label="Payment"
          value={paymentMethod}
          options={[
            { label: "Cash", value: "CASH" },
            { label: "Credit", value: "CREDIT" },
            { label: "Debit", value: "DEBIT" },
            { label: "Check", value: "CHECK" },
          ]}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />

        <Select
          label="Type"
          value={paymentType}
          options={[
            { label: "Purchase", value: "Purchase" },
            { label: "Rental", value: "Rental" },
            
          ]}
          onChange={(e) => setPaymentType(e.target.value)}
        />

        <Input
          label="Coupon"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />

        <div className="text-sm mt-3 space-y-1">
          <div>Subtotal: {formatMoney(subtotal)}</div>
          <div>Tax: {formatMoney(tax)}</div>
          <div>Discount: {formatMoney(discount)}</div>
          <div className="font-bold text-[#1B9C6F]">
            Total: {formatMoney(total)}
          </div>
        </div>

        <Button className="w-full mt-3" onClick={createSale}>
          Submit Sale
        </Button>
      </div>
    </div>
  );
}
