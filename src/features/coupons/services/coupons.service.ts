import { get, post, patch, del } from '../../../lib/api/http';
import { API } from '../../../lib/api/api';

export interface CreateCouponDto {
  code: string;
}

export interface UpdateCouponDto {
  code?: string;
  isActive?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export async function fetchCoupons(): Promise<Coupon[]> {
  return await get<Coupon[]>(API.coupons.findAll);
}

export async function fetchCoupon(id: string): Promise<Coupon> {
  return await get<Coupon>(API.coupons.findOne(id));
}

export async function createCoupon(dto: CreateCouponDto): Promise<Coupon> {
  return await post<Coupon, CreateCouponDto>(API.coupons.create, dto);
}

export async function updateCoupon(id: string, dto: UpdateCouponDto): Promise<Coupon> {
  return await patch<Coupon, UpdateCouponDto>(API.coupons.update(id), dto);
}

export async function deleteCoupon(id: string): Promise<void> {
  return await del<void>(API.coupons.delete(id));
}