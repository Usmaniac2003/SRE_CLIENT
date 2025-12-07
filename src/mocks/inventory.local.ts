import { mockDB } from "./db";

mockDB.items = mockDB.items.length
  ? mockDB.items
  : [
      { id: 1, name: "Drill Machine", price: 100, quantity: 20 },
      { id: 2, name: "Hammer", price: 20, quantity: 50 },
      { id: 3, name: "Screwdriver Set", price: 15, quantity: 35 },
    ];

export function fetchInventory() {
  return Promise.resolve(mockDB.items);
}
