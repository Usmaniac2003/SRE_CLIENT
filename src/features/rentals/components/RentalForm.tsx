'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';

import {
  createRental,
  addRentalItem,
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
  async function handleStartRental() {
    if (!userId) return toast.push('error', 'Select a customer');
    if (!dueDate) return toast.push('error', 'Select a due date');

    try {
      const created = await createRental({
        userId,
        employeeId: auth.user?.id ?? '',
        dueDate,
        deposit,
      });

      setRental(created);
      toast.push('success', 'Rental created');

    } catch {
      toast.push('error', 'Failed to create rental');
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
      toast.push('success', 'Item added');

    } catch {
      toast.push('error', 'Failed to add item');
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
            options={users.map((u) => ({
              label: `${u.name} (${u.phone})`,
              value: u.id,
            }))}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
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

          <Button onClick={handleStartRental}>Create Rental</Button>
        </div>
      )}

      {/* Step 2: Add items */}
      {rental && (
        <>
          <div className="bg-white border border-[#D9E6DF] p-4 rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-[#1B9C6F]">Add Item</h3>

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

            <Button onClick={handleAddItem}>Add To Rental</Button>
          </div>

          {/* Step 3: Totals */}
          <div className="bg-white border border-[#D9E6DF] p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-[#1B9C6F]">Totals</h3>

            <p className="text-sm">Deposit: {formatMoney(rental.deposit)}</p>
            <p className="text-lg font-semibold text-[#1B9C6F]">
              Total: {formatMoney(rental.total)}
            </p>

            <Button variant="primary" className="mt-4 w-full" onClick={handleFinalize}>
              Finalize Rental
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
