import { get, post, patch, del } from '../../../lib/api/http';
import { API } from '../../../lib/api/api';

export interface CreateItemDto {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface UpdateItemDto {
  name?: string;
  price?: number;
  quantity?: number;
}

export interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
  createdAt: string;
}

export async function fetchInventory(): Promise<Item[]> {
  return await get<Item[]>(API.inventory.findAll);
}

export async function fetchItem(id: number): Promise<Item> {
  return await get<Item>(API.inventory.findOne(id));
}

export async function createItem(dto: CreateItemDto): Promise<Item> {
  return await post<Item, CreateItemDto>(API.inventory.create, dto);
}

export async function updateItem(
  id: number,
  dto: UpdateItemDto,
): Promise<Item> {
  return await patch<Item, UpdateItemDto>(API.inventory.update(id), dto);
}

export async function deleteItem(id: number): Promise<void> {
  return await del<void>(API.inventory.delete(id));
}
