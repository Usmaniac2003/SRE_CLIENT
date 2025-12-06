'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';

import {
  createSaleWithItems,
} from '../services/sales.service';

import { fetchInventory, Item } from '../../inventory/services/inventory.service';
import { useAuthStore } from '../../../store/auth.store';
import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';
import { formatMoney } from '../../../lib/utils/formatters';

interface SaleItem {
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

  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Local state for items in the sale
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

  // Form fields
  const [itemId, setItemId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<'CASH' | 'CREDIT' | 'DEBIT' | 'CHECK'>('CASH');

  /* ---------------------------------------------------------------------- */
  /*                          Load inventory                                 */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const list = await fetchInventory();
        setInventory(list);
      } catch {
        toast.push('error', 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [toast]);

  /* ---------------------------------------------------------------------- */
  /*                          Add item to local list                         */
  /* ---------------------------------------------------------------------- */
  function handleAddItem(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (!itemId || itemId === '') {
      return toast.push('error', 'Please select an item');
    }
    if (quantity <= 0) {
      return toast.push('error', 'Quantity must be positive');
    }

    const selectedItem = inventory.find((i) => i.id === itemId);
    if (!selectedItem) {
      return toast.push('error', 'Item not found');
    }

    // Check stock availability
    if (selectedItem.quantity < quantity) {
      return toast.push(
        'error',
        `Not enough stock. Available: ${selectedItem.quantity}, Requested: ${quantity}`,
      );
    }

    // Check if item already in sale
    const existingIndex = saleItems.findIndex((si) => si.itemId === itemId);
    if (existingIndex >= 0) {
      // Update quantity
      const updated = [...saleItems];
      const newQuantity = updated[existingIndex].quantity + quantity;
      
      // Check total quantity doesn't exceed stock
      if (selectedItem.quantity < newQuantity) {
        return toast.push(
          'error',
          `Not enough stock. Available: ${selectedItem.quantity}, Total requested: ${newQuantity}`,
        );
      }
      
      updated[existingIndex].quantity = newQuantity;
      updated[existingIndex].lineTotal = updated[existingIndex].unitPrice * updated[existingIndex].quantity;
      setSaleItems(updated);
    } else {
      // Add new item
      const unitPrice = selectedItem.price;
      const newItem: SaleItem = {
        itemId: Number(itemId),
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
        itemName: selectedItem.name,
      };
      setSaleItems([...saleItems, newItem]);
    }

    // Reset form
    setItemId('');
    setQuantity(1);
    toast.push('success', 'Item added to sale');
  }

  /* ---------------------------------------------------------------------- */
  /*                          Remove item from local list                    */
  /* ---------------------------------------------------------------------- */
  function handleRemoveItem(itemId: number) {
    setSaleItems(saleItems.filter((item) => item.itemId !== itemId));
    toast.push('success', 'Item removed');
  }

  /* ---------------------------------------------------------------------- */
  /*                          Update item quantity                           */
  /* ---------------------------------------------------------------------- */
  function handleUpdateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setSaleItems(
      saleItems.map((item) =>
        item.itemId === itemId
          ? { ...item, quantity: newQuantity, lineTotal: item.unitPrice * newQuantity }
          : item,
      ),
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                          Calculate totals (updates automatically)       */
  /* ---------------------------------------------------------------------- */
  const subtotal = saleItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxRate = 0.07;
  const tax = subtotal * taxRate;
  const discount = couponCode.trim() ? subtotal * 0.1 : 0;
  const total = subtotal + tax - discount;

  // Calculate preview totals for selected item (before adding to sale)
  const selectedItem = itemId ? inventory.find((i) => i.id === itemId) : null;
  const previewSubtotal = selectedItem && quantity > 0 ? selectedItem.price * quantity : 0;
  const previewTax = previewSubtotal * taxRate;
  const previewTotal = previewSubtotal + previewTax;

  /* ---------------------------------------------------------------------- */
  /*                          Create sale                                    */
  /* ---------------------------------------------------------------------- */
  async function handleCreateSale(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (saleItems.length === 0) {
      return toast.push('error', 'Please add at least one item to the sale');
    }

    if (!auth.user?.id) {
      return toast.push('error', 'User not authenticated');
    }

    // Validate stock availability
    for (const saleItem of saleItems) {
      const inventoryItem = inventory.find((i) => i.id === saleItem.itemId);
      if (!inventoryItem) {
        return toast.push('error', `Item ${saleItem.itemName} not found in inventory`);
      }
      if (inventoryItem.quantity < saleItem.quantity) {
        return toast.push(
          'error',
          `Not enough stock for ${saleItem.itemName}. Available: ${inventoryItem.quantity}, Requested: ${saleItem.quantity}`,
        );
      }
    }

    try {
      setSubmitting(true);

      const result = await createSaleWithItems({
        employeeId: auth.user.id,
        items: saleItems.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        paymentMethod,
        couponCode: couponCode.trim() || undefined,
      });

      toast.push('success', 'Sale created successfully');
      closeModal();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create sale';
      toast.push('error', message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                          Render UI                                      */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold text-[#1B9C6F]">Create New Sale</h2>

      {/* Add Item Section */}
      <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-[#1B9C6F] mb-4">Add Item</h3>
        <div className="space-y-4">
          <Select
            label="Item"
            options={[
              { label: 'Select an item...', value: '' },
              ...inventory
                .filter((i) => i.quantity > 0)
                .map((i) => ({
                  label: `${i.name} - ${formatMoney(i.price)} (Stock: ${i.quantity})`,
                  value: String(i.id),
                })),
            ]}
            value={itemId === '' ? '' : String(itemId)}
            onChange={(e) => {
              const val = e.target.value;
              setItemId(val === '' ? '' : Number(val));
              setQuantity(1); // Reset quantity when item changes
            }}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const val = Number(e.target.value);
                setQuantity(val > 0 ? val : 1);
              }}
            />
            <div className="flex items-end">
              <Button 
                type="button"
                onClick={handleAddItem} 
                className="w-full" 
                disabled={!itemId || itemId === '' || quantity <= 0}
              >
                Add to Sale
              </Button>
            </div>
          </div>

          {/* Preview totals for selected item */}
          {selectedItem && quantity > 0 && (
            <div className="bg-[#F0F5F2] rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Preview:</span>
                <span className="font-medium">{selectedItem.name} x{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{formatMoney(previewSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (7%):</span>
                <span className="font-medium">{formatMoney(previewTax)}</span>
              </div>
              <div className="flex justify-between border-t border-[#D9E6DF] pt-1">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold text-[#1B9C6F]">{formatMoney(previewTotal)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Items in Sale */}
      {saleItems.length > 0 && (
        <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-[#1B9C6F] mb-3">Items in Sale</h3>
          <div className="space-y-2">
            {saleItems.map((item) => (
              <div
                key={item.itemId}
                className="flex justify-between items-center py-2 border-b border-[#D9E6DF] last:border-0"
              >
                <div className="flex-1">
                  <span className="font-medium">{item.itemName}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.itemId, Number(e.target.value))}
                      className="w-20 text-sm"
                    />
                    <span className="text-sm text-gray-600">
                      @ {formatMoney(item.unitPrice)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{formatMoney(item.lineTotal)}</div>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveItem(item.itemId)}
                    className="text-xs px-2 py-1"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment & Totals */}
      <div className="bg-white border border-[#D9E6DF] rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-[#1B9C6F] mb-4">Payment & Totals</h3>
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

          {/* Totals Display - Updates automatically */}
          <div className="bg-[#F0F5F2] rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (7%):</span>
              <span className="font-medium">{formatMoney(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount (10%):</span>
                <span className="font-medium">-{formatMoney(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#D9E6DF] pt-2">
              <span className="font-semibold">Total:</span>
              <span className="font-semibold text-[#1B9C6F] text-lg">{formatMoney(total)}</span>
            </div>
            {saleItems.length === 0 && (
              <div className="text-xs text-gray-500 italic text-center pt-2">
                Add items to see totals
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleCreateSale}
            className="w-full"
            disabled={saleItems.length === 0 || submitting}
            loading={submitting}
          >
            Create Sale
          </Button>
        </div>
      </div>
    </div>
  );
}
