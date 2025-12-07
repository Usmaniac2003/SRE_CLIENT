// A tiny in-memory database for frontend-only operation.
// (Persists to localStorage so refreshing doesn't lose data)

export interface MockItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface MockSaleItem {
  id: string;
  itemId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface MockSale {
  id: string;
  createdAt: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  couponCode?: string;
  items: MockSaleItem[];
}

export interface MockRentalItem {
  id: string;
  itemId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface MockRental {
  id: string;
  rentalNumber: string;
  createdAt: string;
  dueDate: string;
  deposit: number;
  total: number;
  userId: string;
  returnedAt?: string;
  items: MockRentalItem[];
}

export interface MockReturnRecord {
  id: string;
  type: "SALE" | "RENTAL";
  createdAt: string;
  saleId?: string;
  rentalId?: string;
  amount: number;
  reason?: string;
}

export const mockDB = {
  items: [] as MockItem[],
  sales: [] as MockSale[],
  rentals: [] as MockRental[],
  returns: [] as MockReturnRecord[],
  users: [
    { id: "u1", name: "John Doe", phone: "111-222" },
    { id: "u2", name: "Alice Smith", phone: "333-444" },
  ],

  save() {
    localStorage.setItem("mockDB", JSON.stringify(this));
  },

  load() {
    const raw = localStorage.getItem("mockDB");
    if (raw) {
      const saved = JSON.parse(raw);
      Object.assign(this, saved);
    }
  }
};

mockDB.load();
