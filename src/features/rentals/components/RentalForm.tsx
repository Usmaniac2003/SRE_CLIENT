/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Spinner } from "../../../components/ui/Spinner";

import { fetchInventory } from "../../../mocks/inventory.local";
import { fetchUsers } from "../../../mocks/users.local";
import {
  createRental,
  addRentalItem,
  finalizeRental,
} from "../../../mocks/rentals.local";

import { useToastStore } from "../../../store/toast.store";
import { useUIStore } from "../../../store/ui.store";
import { formatMoney } from "../../../lib/utils/formatters";
import { mockAuth } from "@/mocks/auth.local";

export function RentalForm({ onSuccess }: { onSuccess: () => void }) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [users, setUsers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [rental, setRental] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [deposit, setDeposit] = useState(0);

  const [itemId, setItemId] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function init() {
      setUsers(await fetchUsers());
      setInventory(await fetchInventory());
      setLoading(false);
    }
    init();
  }, []);

  // -------------------- START RENTAL --------------------
 async function startRental() {
  if (!userId) return toast.push("error", "Select user");
  if (!dueDate) return toast.push("error", "Select due date");

  const newRental = await createRental({
  userId,
  employeeId: "mock-employee-1", // now guaranteed to exist
  dueDate,
  deposit,
});


  setRental({ ...newRental, items: newRental.items ?? [] });
}


  // -------------------- ADD ITEM --------------------
  async function addItem() {
    if (!rental) return;

    const updated = await addRentalItem(rental.id, { itemId, quantity });

    // FIX: ensure updated.items exists
    setRental({ ...updated, items: updated.items ?? [] });
  }

  // -------------------- FINALIZE --------------------
  async function finalize() {
    await finalizeRental(rental.id);

    toast.push("success", "Rental completed");
    closeModal();
    onSuccess();
  }

  // -------------------- RENDER LOADING --------------------
  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6">

      {/* START RENTAL VIEW */}
      {!rental && (
        <div className="bg-white border p-4 rounded-lg space-y-4">
          <Select
            label="Customer"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            options={[
              { label: "Select user...", value: "" },
              ...users.map((u) => ({
                label: `${u.name} (${u.phone})`,
                value: u.id,
              })),
            ]}
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Input
            label="Deposit"
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
          />

          <Button onClick={startRental}>Start Rental</Button>
        </div>
      )}

      {/* RENTAL IN PROGRESS */}
      {rental && (
        <>
          <div className="bg-white border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-[#1B9C6F]">
              Rental #{rental.rentalNumber}
            </h3>
          </div>

          {/* ADD ITEM */}
          <div className="bg-white border p-4 rounded-lg space-y-4">
            <Select
              label="Item"
              value={itemId}
              onChange={(e) => setItemId(Number(e.target.value))}
              options={[
                { label: "Select...", value: 0 },
                ...inventory.map((i) => ({
                  label: `${i.name} (${formatMoney(i.price)})`,
                  value: i.id,
                })),
              ]}
            />

            <Input
              label="Qty"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            <Button onClick={addItem} disabled={!itemId}>
              Add Item
            </Button>
          </div>

          {/* ITEMS LIST */}
          {rental.items?.length > 0 && (
            <div className="bg-white border p-4 rounded-lg space-y-2">
              <h3 className="font-semibold mb-2">Items</h3>

              {(rental.items ?? []).map((it: any) => (
                <div className="border-b py-2" key={it.id}>
                  • {it.quantity} × {formatMoney(it.unitPrice)} ={" "}
                  {formatMoney(it.lineTotal)}
                </div>
              ))}

              <div className="flex justify-between border-t pt-2 mt-2">
                <span>Total:</span>
                <span className="font-semibold text-[#1B9C6F]">
                  {formatMoney(rental.total)}
                </span>
              </div>

              <Button className="w-full mt-3" onClick={finalize}>
                Finalize Rental
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
