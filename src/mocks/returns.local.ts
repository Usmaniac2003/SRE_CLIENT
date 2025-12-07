import { mockDB } from "./db";

export function fetchReturns() {
  return Promise.resolve(mockDB.returns);
}

export function getReturn(id: string) {
  return Promise.resolve(mockDB.returns.find(r => r.id === id)!);
}

export function returnSale(dto: any) {
  const sale = mockDB.sales.find(s => s.id === dto.saleId)!;

  const rec = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    type: "SALE",
    saleId: sale.id,
    amount: sale.total,
    reason: dto.reason
  };

  mockDB.returns.push(rec);
  mockDB.save();

  return Promise.resolve(rec);
}

export function returnRental(dto: any) {
  const rental = mockDB.rentals.find(r => r.id === dto.rentalId)!;

  const rec = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    type: "RENTAL",
    rentalId: rental.id,
    amount: rental.deposit,
    reason: dto.reason
  };

  rental.returnedAt = new Date().toISOString();

  mockDB.returns.push(rec);
  mockDB.save();

  return Promise.resolve(rec);
}
