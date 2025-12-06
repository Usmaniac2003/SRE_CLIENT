'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';

import {
  fetchSales,
  getSale,
  cancelSale,
  Sale,
} from '../services/sales.service';

import { useUIStore } from '../../../store/ui.store';
import { useToastStore } from '../../../store/toast.store';
import { useAuthStore } from '../../../store/auth.store';
import { SaleForm } from './SaleForm';
import { formatMoney, formatDateTime } from '../../../lib/utils/formatters';

export function SalesTable() {
  const toast = useToastStore();
  const { openModal } = useUIStore();
  const auth = useAuthStore();

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSales();
      setSales(data);
    } catch {
      toast.push('error', 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  function openCreateSale() {
    openModal(<SaleForm onSuccess={loadSales} />);
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
      {/* Create sale button */}
      <div className="flex justify-end">
        <Button onClick={openCreateSale}>New Sale</Button>
      </div>

      <Table columns={['Date', 'Subtotal', 'Tax', 'Total', 'Payment', 'Coupon', 'Actions']}>
        {sales.map((sale) => (
          <tr key={sale.id} className="border-b border-[#D9E6DF]">
            <td className="px-4 py-2">{formatDateTime(sale.createdAt)}</td>
            <td className="px-4 py-2">{formatMoney(sale.subtotal)}</td>
            <td className="px-4 py-2">{formatMoney(sale.tax)}</td>
            <td className="px-4 py-2 font-semibold text-[#1B9C6F]">
              {formatMoney(sale.total)}
            </td>
            <td className="px-4 py-2">{sale.paymentMethod}</td>
            <td className="px-4 py-2">{sale.couponCode ?? '-'}</td>
            <td className="px-4 py-2">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      const saleDetails = await getSale(sale.id);
                      openModal(
                        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                          <h2 className="text-lg font-semibold text-[#1B9C6F]">Sale Details</h2>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Sale ID:</span>
                              <span className="font-medium">{saleDetails.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date:</span>
                              <span className="font-medium">{formatDateTime(saleDetails.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">{formatMoney(saleDetails.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax:</span>
                              <span className="font-medium">{formatMoney(saleDetails.tax)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total:</span>
                              <span className="font-semibold text-[#1B9C6F]">{formatMoney(saleDetails.total)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Method:</span>
                              <span className="font-medium">{saleDetails.paymentMethod}</span>
                            </div>
                            {saleDetails.couponCode && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Coupon:</span>
                                <span className="font-medium">{saleDetails.couponCode}</span>
                              </div>
                            )}
                            {saleDetails.items && saleDetails.items.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-[#D9E6DF]">
                                <p className="font-semibold mb-2">Items ({saleDetails.items.length}):</p>
                                <div className="space-y-1">
                                  {saleDetails.items.map((item) => (
                                    <div key={item.id} className="text-xs text-gray-600">
                                      • {item.quantity}x @ {formatMoney(item.unitPrice)} = {formatMoney(item.lineTotal)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    } catch (error: any) {
                      toast.push('error', error?.response?.data?.message || 'Failed to load sale details');
                    }
                  }}
                >
                  View
                </Button>
                {auth.user?.position === 'ADMIN' && sale.total > 0 && (
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (!confirm('Are you sure you want to cancel this sale? This will restore inventory.')) {
                        return;
                      }
                      try {
                        await cancelSale(sale.id);
                        toast.push('success', 'Sale cancelled');
                        loadSales();
                      } catch (error: any) {
                        toast.push('error', error?.response?.data?.message || 'Failed to cancel sale');
                      }
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal />
    </div>
  );
}
