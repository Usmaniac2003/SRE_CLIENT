'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';

import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
  CreateUserDto,
  UpdateUserDto,
} from '../services/users.service';

import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';

/* ========================================================================== */
/*                              CREATE USER FORM                               */
/* ========================================================================== */

function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [form, setForm] = useState<CreateUserDto>({
    name: '',
    phone: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);

  function updateField<T extends keyof CreateUserDto>(key: T, value: CreateUserDto[T]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      await createUser(form);
      toast.push('success', 'User created');
      closeModal();
      onSuccess();
    } catch {
      toast.push('error', 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={form.name}
        onChange={(e) => updateField('name', e.target.value)}
        required
      />

      <Input
        label="Phone"
        value={form.phone}
        onChange={(e) => updateField('phone', e.target.value)}
        required
      />

      <Input
        label="Email (optional)"
        type="email"
        value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
      />

      <Button loading={loading} className="w-full" disabled={!form.name || !form.phone}>
        Create User
      </Button>
    </form>
  );
}

/* ========================================================================== */
/*                                EDIT USER FORM                               */
/* ========================================================================== */

function EditUserForm({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess: () => void;
}) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [form, setForm] = useState<UpdateUserDto>({
    name: user.name,
    phone: user.phone,
    email: user.email ?? '',
    hasCredit: user.hasCredit,
    creditValue: user.creditValue,
  });

  const [loading, setLoading] = useState(false);

  function updateField<T extends keyof UpdateUserDto>(key: T, value: UpdateUserDto[T]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required fields
    if (!form.name || !form.phone) {
      toast.push('error', 'Name and phone are required');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data - only include fields that are defined
      const updateData: UpdateUserDto = {
        name: form.name,
        phone: form.phone,
        email: form.email === '' ? null : (form.email || null),
        hasCredit: form.hasCredit ?? false,
      };

      // Only include creditValue if hasCredit is true
      if (form.hasCredit) {
        updateData.creditValue = form.creditValue ?? 0;
      } else {
        updateData.creditValue = 0;
      }

      await updateUser(user.id, updateData);
      toast.push('success', 'User updated successfully');
      closeModal();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update user';
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
      />

      <Input
        label="Phone"
        value={form.phone ?? ''}
        onChange={(e) => updateField('phone', e.target.value)}
      />

      <Input
        label="Email"
        value={form.email ?? ''}
        onChange={(e) => updateField('email', e.target.value)}
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.hasCredit ?? false}
          onChange={(e) => updateField('hasCredit', e.target.checked)}
        />
        <label className="text-sm text-[#4A5A52]">Has Store Credit</label>
      </div>

      {form.hasCredit && (
        <Input
          label="Credit Value"
          type="number"
          value={form.creditValue ?? 0}
          onChange={(e) => updateField('creditValue', Number(e.target.value))}
        />
      )}

      <Button loading={loading} className="w-full">
        Save Changes
      </Button>
    </form>
  );
}

/* ========================================================================== */
/*                               USERS TABLE UI                                */
/* ========================================================================== */

export function UsersTable() {
  const toast = useToastStore();
  const { openModal } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch {
      toast.push('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function openCreate() {
    openModal(<CreateUserForm onSuccess={loadUsers} />);
  }

  function openEdit(user: User) {
    openModal(<EditUserForm user={user} onSuccess={loadUsers} />);
  }

  async function handleDelete(user: User) {
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(user.id);
      toast.push('success', 'User deleted successfully');
      loadUsers();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete user';
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
        <Button onClick={openCreate}>Add User</Button>
      </div>

      <Table columns={['Name', 'Phone', 'Email', 'Credit', 'Actions']}>
        {users.map((user) => (
          <tr key={user.id} className="border-b border-[#D9E6DF]">
            <td className="px-4 py-2">{user.name}</td>
            <td className="px-4 py-2">{user.phone}</td>
            <td className="px-4 py-2">{user.email || '-'}</td>
            <td className="px-4 py-2">
              {user.hasCredit ? `$${user.creditValue}` : 'None'}
            </td>

            <td className="px-4 py-2">
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => openEdit(user)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDelete(user)}>
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
