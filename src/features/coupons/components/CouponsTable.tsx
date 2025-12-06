'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';

import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  Coupon,
  CreateCouponDto,
  UpdateCouponDto,
} from '../services/coupons.service';

import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';
import { formatDateTime } from '../../../lib/utils/formatters';

/* ========================================================================== */
/*                           CREATE COUPON FORM                                */
/* ========================================================================== */

function CreateCouponForm({ onSuccess }: { onSuccess: () => void }) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!code.trim()) {
      return toast.push('error', 'Coupon code is required');
    }

    const dto: CreateCouponDto = { code: code.trim() };

    try {
      setLoading(true);
      await createCoupon(dto);
      toast.push('success', 'Coupon created successfully');
      closeModal();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create coupon';
      toast.push('error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-[#1B9C6F]">Create New Coupon</h2>
      
      <Input
        label="Coupon Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter coupon code"
        required
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={closeModal}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Create Coupon
        </Button>
      </div>
    </form>
  );
}

/* ========================================================================== */
/*                           EDIT COUPON FORM                                  */
/* ========================================================================== */

function EditCouponForm({
  coupon,
  onSuccess,
}: {
  coupon: Coupon;
  onSuccess: () => void;
}) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [form, setForm] = useState<UpdateCouponDto>({
    code: coupon.code,
    isActive: coupon.isActive,
  });

  const [loading, setLoading] = useState(false);

  function updateField<T extends keyof UpdateCouponDto>(
    key: T,
    value: UpdateCouponDto[T],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.code?.trim()) {
      return toast.push('error', 'Coupon code is required');
    }

    try {
      setLoading(true);
      await updateCoupon(coupon.id, {
        code: form.code.trim(),
        isActive: form.isActive,
      });
      toast.push('success', 'Coupon updated successfully');
      closeModal();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update coupon';
      toast.push('error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-[#1B9C6F]">Edit Coupon</h2>
      
      <Input
        label="Coupon Code"
        value={form.code ?? ''}
        onChange={(e) => updateField('code', e.target.value)}
        placeholder="Enter coupon code"
        required
      />

      <div className="flex items-center gap-3 p-3 bg-[#F7FAF8] rounded-lg border border-[#D9E6DF]">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive ?? false}
          onChange={(e) => updateField('isActive', e.target.checked)}
          className="w-4 h-4 text-[#1B9C6F] border-[#D9E6DF] rounded focus:ring-[#1B9C6F]"
        />
        <label htmlFor="isActive" className="text-sm text-[#4A5A52] cursor-pointer">
          Active (coupon can be used)
        </label>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={closeModal}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Save Changes
        </Button>
      </div>
    </form>
  );
}

/* ========================================================================== */
/*                        DELETE CONFIRMATION MODAL                            */
/* ========================================================================== */

function DeleteConfirmationModal({
  coupon,
  onConfirm,
  onCancel,
}: {
  coupon: Coupon;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const toast = useToastStore();

  async function handleDelete() {
    try {
      setLoading(true);
      await deleteCoupon(coupon.id);
      toast.push('success', 'Coupon deleted successfully');
      onConfirm();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete coupon';
      toast.push('error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[#1B9C6F]">Delete Coupon</h2>
      
      <p className="text-[#4A5A52]">
        Are you sure you want to delete coupon <strong>{coupon.code}</strong>?
        This action cannot be undone.
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleDelete}
          loading={loading}
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*                           COUPONS TABLE COMPONENT                           */
/* ========================================================================== */

export function CouponsTable() {
  const toast = useToastStore();
  const { openModal } = useUIStore();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const list = await fetchCoupons();
      setCoupons(list);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load coupons';
      toast.push('error', message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  function openCreate() {
    openModal(<CreateCouponForm onSuccess={loadCoupons} />);
  }

  function openEdit(coupon: Coupon) {
    openModal(<EditCouponForm coupon={coupon} onSuccess={loadCoupons} />);
  }

  function openDelete(coupon: Coupon) {
    openModal(
      <DeleteConfirmationModal
        coupon={coupon}
        onConfirm={() => {
          loadCoupons();
          useUIStore.getState().closeModal();
        }}
        onCancel={() => useUIStore.getState().closeModal()}
      />,
    );
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#1B9C6F]">Coupons</h1>
        <Button onClick={openCreate}>Add Coupon</Button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white border border-[#D9E6DF] rounded-lg p-8 text-center">
          <p className="text-[#4A5A52]">No coupons found. Create your first coupon to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#D9E6DF] rounded-lg overflow-hidden">
          <Table columns={['Code', 'Status', 'Created', 'Actions']}>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-[#D9E6DF] hover:bg-[#F7FAF8]">
                <td className="px-4 py-3">
                  <span className="font-medium text-[#1A1F1C]">{coupon.code}</span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      coupon.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {coupon.isActive ? '✓ Active' : '✗ Inactive'}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm text-[#4A5A52]">
                  {formatDateTime(coupon.createdAt)}
                </td>

                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => openEdit(coupon)}
                      className="text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => openDelete(coupon)}
                      className="text-sm bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <Modal />
    </div>
  );
}
