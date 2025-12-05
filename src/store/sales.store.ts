import { create } from 'zustand';

export interface SaleItem {
  itemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface SaleState {
  saleId: string | null;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  couponCode: string | null;

  // actions
  startSale: (saleId: string) => void;
  addItem: (item: SaleItem) => void;
  setTotals: (subtotal: number, tax: number, total: number) => void;
  applyCoupon: (code: string) => void;
  reset: () => void;
}

export const useSalesStore = create<SaleState>((set) => ({
  saleId: null,
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  couponCode: null,

  startSale: (saleId) => set({ saleId, items: [], subtotal: 0, tax: 0, total: 0 }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  setTotals: (subtotal, tax, total) => set({ subtotal, tax, total }),

  applyCoupon: (code) => set({ couponCode: code }),

  reset: () =>
    set({
      saleId: null,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      couponCode: null,
    }),
}));
