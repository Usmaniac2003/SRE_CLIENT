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
  Coupon,
  CreateCouponDto,
  UpdateCouponDto,
} from '../services/coupons.service';

import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';

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

    const dto: CreateCouponDto = { code };

    try {
      setLoading(true);
      await createCoupon(dto);
      toast.push('success', 'Coupon created');
      closeModal();
      onSuccess();
    } catch {
      toast.push('error', 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        label="Coupon Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <Button loading={loading} className="w-full">
        Create Coupon
      </Button>
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

    try {
      setLoading(true);
      await updateCoupon(coupon.id, form);
      toast.push('success', 'Coupon updated');
      closeModal();
      onSuccess();
    } catch {
      toast.push('error', 'Failed to update coupon');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        label="Coupon Code"
        value={form.code ?? ''}
        onChange={(e) => updateField('code', e.target.value)}
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.isActive ?? false}
          onChange={(e) => updateField('isActive', e.target.checked)}
        />
        <label className="text-sm text-[#4A5A52]">Active</label>
      </div>

      <Button loading={loading} className="w-full">
        Save Changes
      </Button>
    </form>
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
    } catch {
      toast.push('error', 'Failed to load coupons');
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
        <Button onClick={openCreate}>Add Coupon</Button>
      </div>

      <Table columns={['Code', 'Status', 'Actions']}>
        {coupons.map((coupon) => (
          <tr key={coupon.id} className="border-b border-[#D9E6DF]">
            <td className="px-4 py-2">{coupon.code}</td>

            <td className="px-4 py-2">
              {coupon.isActive ? 'Active' : 'Inactive'}
            </td>

            <td className="px-4 py-2 flex gap-2">
              <Button variant="secondary" onClick={() => openEdit(coupon)}>
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
