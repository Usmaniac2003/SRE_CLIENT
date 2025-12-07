// src/mocks/users.local.ts

import { mockDB } from './db';

export function fetchUsers() {
  return Promise.resolve(mockDB.users);
}

export function createUser(data: { name: string; phone: string }) {
  const newUser = {
    id: String(Date.now()),
    name: data.name,
    phone: data.phone,
    email: null,
    hasCredit: false,
    creditValue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockDB.users.push(newUser);
  save();
  return Promise.resolve(newUser);
}

export function updateUser(id: string, changes: Partial<any>) {
  const user = mockDB.users.find((u) => u.id === id);
  if (!user) return Promise.reject("User not found");

  Object.assign(user, changes, { updatedAt: new Date().toISOString() });
  save();
  return Promise.resolve(user);
}

function save() {
  localStorage.setItem("mock_posdb", JSON.stringify(mockDB));
}
