import { create } from 'zustand';

export interface InventoryItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface InventoryState {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  loading: boolean;

  setItems: (items: InventoryItem[]) => void;
  selectItem: (item: InventoryItem | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  selectedItem: null,
  loading: false,

  setItems: (items) => set({ items }),
  selectItem: (item) => set({ selectedItem: item }),
  setLoading: (loading) => set({ loading }),
}));
