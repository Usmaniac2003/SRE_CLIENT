import { mockDB } from "./db";

export function fetchSales() {
  return Promise.resolve(mockDB.sales);
}

export function getSale(id: string) {
  return Promise.resolve(mockDB.sales.find(s => s.id === id)!);
}

export function createSaleWithItems(dto: any) {
  const id = crypto.randomUUID();
  const items = dto.items.map((x: any) => ({
    id: crypto.randomUUID(),
    itemId: x.itemId,
    quantity: x.quantity,
    unitPrice: mockDB.items.find(i => i.id === x.itemId)!.price,
    lineTotal: mockDB.items.find(i => i.id === x.itemId)!.price * x.quantity
  }));

  const subtotal = items.reduce((s: number, i: any) => s + i.lineTotal, 0);
  const tax = subtotal * 0.07;

  const sale = {
    id,
    createdAt: new Date().toISOString(),
    subtotal,
    tax,
    total: subtotal + tax,
    paymentMethod: dto.paymentMethod,
    items
  };

  mockDB.sales.push(sale);
  mockDB.save();

  return Promise.resolve(sale);
}

export function cancelSale(id: string) {
  mockDB.sales = mockDB.sales.filter(s => s.id !== id);
  mockDB.save();
  return Promise.resolve(true);
}
