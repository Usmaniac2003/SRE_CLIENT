import { mockDB } from "./db";

export function fetchRentals() {
  return Promise.resolve(mockDB.rentals);
}

export function createRental(dto: any) {
  const rental = {
    id: crypto.randomUUID(),
    rentalNumber: "R-" + Math.floor(Math.random() * 90000),
    createdAt: new Date().toISOString(),
    dueDate: dto.dueDate,
    total: 0,
    deposit: dto.deposit,
    userId: dto.userId,
    items: []
  };

  mockDB.rentals.push(rental);
  mockDB.save();

  return Promise.resolve(rental);
}

export function addRentalItem(id: string, dto: any) {
  const rental = mockDB.rentals.find(r => r.id === id)!;

  const price = mockDB.items.find(i => i.id === dto.itemId)!.price;

  rental.items.push({
    id: crypto.randomUUID(),
    itemId: dto.itemId,
    quantity: dto.quantity,
    unitPrice: price,
    lineTotal: price * dto.quantity
  });

  rental.total = rental.items.reduce((s, x) => s + x.lineTotal, 0);

  mockDB.save();

  return Promise.resolve(rental);
}

export function finalizeRental(id: string) {
  return Promise.resolve(mockDB.rentals.find(r => r.id === id)!);
}
