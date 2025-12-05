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

    try {
      setLoading(true);

      await createItem(form);
      toast.push('success', 'Item created');
      closeModal();
      onSuccess();
    } catch {
      toast.push('error', 'Failed to create item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Item ID"
        type="number"
        value={form.id}
        onChange={(e) => updateField('id', Number(e.target.value))}
      />

      <Input
        label="Name"
        value={form.name}
        onChange={(e) => updateField('name', e.target.value)}
      />

      <Input
        label="Price"
        type="number"
        value={form.price}
        onChange={(e) => updateField('price', Number(e.target.value))}
      />

      <Input
        label="Quantity"
        type="number"
        value={form.quantity}
        onChange={(e) => updateField('quantity', Number(e.target.value))}
      />

      <Button className="w-full" loading={loading}>
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

    try {
      setLoading(true);

      await updateItem(item.id, form);
      toast.push('success', 'Item updated');
      closeModal();
      onSuccess();
    } catch {
      toast.push('error', 'Failed to update item');
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
      />

      <Input
        label="Price"
        type="number"
        value={form.price ?? 0}
        onChange={(e) => updateField('price', Number(e.target.value))}
      />

      <Input
        label="Quantity"
        type="number"
        value={form.quantity ?? 0}
        onChange={(e) => updateField('quantity', Number(e.target.value))}
      />

      <Button className="w-full" loading={loading}>
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
            <td className="px-4 py-2">{item.name}</td>
            <td className="px-4 py-2">{formatMoney(item.price)}</td>
            <td className="px-4 py-2">{item.quantity}</td>

            <td className="px-4 py-2 flex gap-2">
              <Button variant="secondary" onClick={() => openEdit(item)}>
                Edit
              </Button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal />
    </div>
  );
}
