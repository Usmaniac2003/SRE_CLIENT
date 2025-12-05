import { create } from 'zustand';

export interface RentalItem {
  itemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface RentalState {
  rentalId: string | null;
  rentalNumber: string | null;
  items: RentalItem[];
  dueDate: string | null;
  deposit: number;
  subtotal: number;
  total: number;

  // actions
  startRental: (id: string, rentalNumber: string, deposit: number, dueDate: string) => void;
  addItem: (item: RentalItem) => void;
  setTotals: (subtotal: number, total: number) => void;
  reset: () => void;
}

export const useRentalsStore = create<RentalState>((set) => ({
  rentalId: null,
  rentalNumber: null,
  items: [],
  dueDate: null,
  deposit: 0,
  subtotal: 0,
  total: 0,

  startRental: (id, rentalNumber, deposit, dueDate) =>
    set({
      rentalId: id,
      rentalNumber,
      deposit,
      dueDate,
      items: [],
      subtotal: 0,
      total: 0,
    }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  setTotals: (subtotal, total) => set({ subtotal, total }),

  reset: () =>
    set({
      rentalId: null,
      rentalNumber: null,
      items: [],
      dueDate: null,
      deposit: 0,
      subtotal: 0,
      total: 0,
    }),
}));
