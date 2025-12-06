'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';

import {
  fetchInventory,
  createItem,
  updateItem,
  deleteItem,
  Item,
  CreateItemDto,
  UpdateItemDto,
} from '../services/inventory.service';

import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';
import { formatMoney } from '../../../lib/utils/formatters';

/* ========================================================================== */
/*                         CREATE INVENTORY ITEM FORM                          */
/* ========================================================================== */

function CreateItemForm({ onSuccess }: { onSuccess: () => void }) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [form, setForm] = useState<CreateItemDto>({
    id: 0,
    name: '',
    price: 0,
    quantity: 0,
  });

  const [loading, setLoading] = useState(false);

  function updateField<T extends keyof CreateItemDto>(key: T, value: CreateItemDto[T]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.id || !form.name || form.price < 0 || form.quantity < 0) {
      return toast.push('error', 'Please fill in all required fields correctly');
    }

    try {
      setLoading(true);

      await createItem(form);
      toast.push('success', 'Item created successfully');
      closeModal();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create item';
      toast.push('error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Item ID"
        type="number"
        min="1"
        value={form.id || ''}
        onChange={(e) => updateField('id', Number(e.target.value) || 0)}
        required
      />

      <Input
        label="Name"
        value={form.name}
        onChange={(e) => updateField('name', e.target.value)}
        required
      />

      <Input
        label="Price"
        type="number"
        min="0"
        step="0.01"
        value={form.price || ''}
        onChange={(e) => updateField('price', Number(e.target.value) || 0)}
        required
      />

      <Input
        label="Quantity"
        type="number"
        min="0"
        value={form.quantity || ''}
        onChange={(e) => updateField('quantity', Number(e.target.value) || 0)}
        required
      />

      <Button
        className="w-full"
        loading={loading}
        disabled={!form.id || !form.name || form.price < 0 || form.quantity < 0}
      >
        Add Item
      </Button>
    </form>
  );
}

/* ========================================================================== */
/*                          EDIT INVENTORY ITEM FORM                           */
/* ========================================================================== */

function EditItemForm({
  item,
  onSuccess,
}: {
  item: Item;
  onSuccess: () => void;
}) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [form, setForm] = useState<UpdateItemDto>({
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  });

  const [loading, setLoading] = useState(false);

  function updateField<T extends keyof UpdateItemDto>(key: T, value: UpdateItemDto[T]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name || (form.price ?? 0) < 0 || (form.quantity ?? 0) < 0) {
      return toast.push('error', 'Please fill in all required fields correctly');
    }

    try {
      setLoading(true);

      await updateItem(item.id, form);
      toast.push('success', 'Item updated successfully');
      closeModal();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update item';
      toast.push('error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={form.name ?? ''}
        onChange={(e) => updateField('name', e.target.value)}
        required
      />

      <Input
        label="Price"
        type="number"
        min="0"
        step="0.01"
        value={form.price ?? 0}
        onChange={(e) => updateField('price', Number(e.target.value) || 0)}
        required
      />

      <Input
        label="Quantity"
        type="number"
        min="0"
        value={form.quantity ?? 0}
        onChange={(e) => updateField('quantity', Number(e.target.value) || 0)}
        required
      />

      <Button
        className="w-full"
        loading={loading}
        disabled={!form.name || (form.price ?? 0) < 0 || (form.quantity ?? 0) < 0}
      >
        Save Changes
      </Button>
    </form>
  );
}

/* ========================================================================== */
/*                           INVENTORY TABLE COMPONENT                         */
/* ========================================================================== */

export function InventoryTable() {
  const toast = useToastStore();
  const { openModal } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const list = await fetchInventory();
      setItems(list);
    } catch {
      toast.push('error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function openCreate() {
    openModal(<CreateItemForm onSuccess={loadItems} />);
  }

  function openEdit(item: Item) {
    openModal(<EditItemForm item={item} onSuccess={loadItems} />);
  }

  async function handleDelete(item: Item) {
    if (
      !confirm(
        `Are you sure you want to delete "${item.name}" (ID: ${item.id})? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteItem(item.id);
      toast.push('success', 'Item deleted successfully');
      loadItems();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete item';
      toast.push('error', message);
    }
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
      <div className="flex justify-end">
        <Button onClick={openCreate}>Add Item</Button>
      </div>

      <Table columns={['ID', 'Name', 'Price', 'Quantity', 'Actions']}>
        {items.map((item) => (
          <tr key={item.id} className="border-b border-[#D9E6DF]">
            <td className="px-4 py-2">{item.id}</td>
            <td className="px-4 py-2 font-medium">{item.name}</td>
            <td className="px-4 py-2">{formatMoney(item.price)}</td>
            <td className="px-4 py-2">
              <span
                className={
                  item.quantity === 0
                    ? 'text-red-600 font-semibold'
                    : item.quantity < 10
                      ? 'text-orange-600 font-medium'
                      : 'text-gray-700'
                }
              >
                {item.quantity}
              </span>
              {item.quantity === 0 && (
                <span className="ml-2 text-xs text-red-500">(Out of Stock)</span>
              )}
              {item.quantity > 0 && item.quantity < 10 && (
                <span className="ml-2 text-xs text-orange-500">(Low Stock)</span>
              )}
            </td>

            <td className="px-4 py-2">
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => openEdit(item)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDelete(item)}>
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal />
    </div>
  );
}
