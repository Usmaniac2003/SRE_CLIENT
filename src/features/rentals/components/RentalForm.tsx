'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';

import {
  createRental,
  addRentalItem,
  removeRentalItem,
  finalizeRental,
  Rental,
} from '../services/rentals.service';

import { fetchUsers, User } from '../../users/services/users.service';
import { fetchInventory, Item } from '../../inventory/services/inventory.service';

import { useAuthStore } from '../../../store/auth.store';
import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';
import { formatMoney } from '../../../lib/utils/formatters';

interface RentalFormProps {
  onSuccess: () => void;
}

export function RentalForm({ onSuccess }: RentalFormProps) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();
  const auth = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [userId, setUserId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [deposit, setDeposit] = useState(0);
  const [itemId, setItemId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  /* ---------------------------------------------------------------------- */
  /*                          INITIALIZE FORM                                */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        const usersList = await fetchUsers();
        const inventoryList = await fetchInventory();

        setUsers(usersList);
        setInventory(inventoryList);

      } catch {
        toast.push('error', 'Failed to load required data');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [toast]);

  /* ---------------------------------------------------------------------- */
  /*                          CREATE RENTAL                                  */
  /* ---------------------------------------------------------------------- */
  async function handleStartRental(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (!userId || userId === '') {
      return toast.push('error', 'Please select a customer');
    }
    if (!dueDate || dueDate.trim() === '') {
      return toast.push('error', 'Please select a due date');
    }

    if (!auth.user?.id) {
      return toast.push('error', 'User not authenticated');
    }

    try {
      const created = await createRental({
        userId,
        employeeId: auth.user.id,
        dueDate,
        deposit: deposit || 0,
      });

      setRental(created);
      toast.push('success', 'Rental created');

    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create rental';
      toast.push('error', message);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                           ADD RENTAL ITEM                               */
  /* ---------------------------------------------------------------------- */
  async function handleAddItem() {
    if (!rental) return toast.push('error', 'Start rental first');
    if (quantity <= 0) return toast.push('error', 'Quantity must be positive');

    try {
      const updated = await addRentalItem(rental.id, {
        itemId,
        quantity,
      });

      setRental(updated);
      setItemId(0);
      setQuantity(1);
      toast.push('success', 'Item added');

    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to add item';
      toast.push('error', message);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                        Remove item from rental                          */
  /* ---------------------------------------------------------------------- */
  async function handleRemoveItem(itemId: string) {
    if (!rental) return;

    try {
      const updated = await removeRentalItem(rental.id, itemId);
      setRental(updated);
      toast.push('success', 'Item removed');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to remove item';
      toast.push('error', message);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                           FINALIZE RENTAL                               */
  /* ---------------------------------------------------------------------- */
  async function handleFinalize() {
    if (!rental) return;

    try {
      const finalized = await finalizeRental(rental.id, {
        total: rental.total,
      });

      toast.push('success', 'Rental completed');
      closeModal();
      onSuccess();

    } catch {
      toast.push('error', 'Failed to finalize rental');
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                             RENDER LOADING                              */
  /* ---------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                           RENDER RENTAL FORM                            */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="space-y-6">

      {/* Step 1: Create rental */}
      {!rental && (
        <div className="space-y-4 bg-white border border-[#D9E6DF] p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-[#1B9C6F]">Start Rental</h2>

          <Select
            label="Select Customer"
            options={[
              { label: 'Select a customer...', value: '' },
              ...users.map((u) => ({
                label: `${u.name} (${u.phone})`,
                value: u.id,
              })),
            ]}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Input
            label="Deposit Amount"
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
          />

          <Button 
            type="button"
            onClick={handleStartRental}
            disabled={!userId || userId === '' || !dueDate}
          >
            Create Rental
          </Button>
        </div>
      )}

      {/* Step 2: Add items */}
      {rental && (
        <>
          {/* Rental Info */}
          <div className="bg-white border border-[#D9E6DF] p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-[#1B9C6F] mb-3">Rental Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Rental Number:</span>
                <span className="font-medium">{rental.rentalNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">{new Date(rental.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Add Item Section */}
          <div className="bg-white border border-[#D9E6DF] p-4 rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-[#1B9C6F]">Add Item</h3>

            <Select
              label="Item"
              options={[
                { label: 'Select an item...', value: 0 },
                ...inventory.map((i) => ({
                  label: `${i.name} - ${formatMoney(i.price)} (Stock: ${i.quantity})`,
                  value: i.id,
                })),
              ]}
              value={itemId}
              onChange={(e) => setItemId(Number(e.target.value))}
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
                <Button onClick={handleAddItem} className="w-full" disabled={!itemId || itemId === 0}>
                  Add To Rental
                </Button>
              </div>
            </div>
          </div>

          {/* Itemized Charges */}
          {rental.items && rental.items.length > 0 && (
            <div className="bg-white border border-[#D9E6DF] p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-[#1B9C6F] mb-3">Itemized Charges</h3>
              <div className="space-y-2">
                {rental.items.map((item) => {
                  const inventoryItem = inventory.find((i) => i.id === item.itemId);
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b border-[#D9E6DF] last:border-0"
                    >
                      <div>
                        <span className="font-medium">
                          {inventoryItem?.name || `Item ${item.itemId}`}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          x{item.quantity} @ {formatMoney(item.unitPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-semibold">{formatMoney(item.lineTotal)}</div>
                        <Button
                          variant="danger"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-xs px-2 py-1"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center pt-2 border-t-2 border-[#1B9C6F] mt-2">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-semibold">{formatMoney(rental.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Totals Summary */}
          <div className="bg-white border border-[#D9E6DF] p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-[#1B9C6F] mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Item Charges:</span>
                <span className="font-medium">{formatMoney(rental.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit:</span>
                <span className="font-medium">{formatMoney(rental.deposit)}</span>
              </div>
              <div className="flex justify-between border-t border-[#D9E6DF] pt-2">
                <span className="font-semibold">Total Due:</span>
                <span className="font-semibold text-[#1B9C6F] text-lg">
                  {formatMoney(rental.total + rental.deposit)}
                </span>
              </div>
            </div>

            <Button 
              variant="primary" 
              className="mt-4 w-full" 
              onClick={handleFinalize}
              disabled={!rental.items || rental.items.length === 0}
            >
              Finalize Rental
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
