import { supabaseClient } from '../supabase/client';
import { OrderFilters, OrderStatus, OrderType } from '../types';

export type CreateOrderPayload = {
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  product_id: string;
  quantity: number;
};

export async function placeOrder(payload: CreateOrderPayload) {
  const { data, error } = await supabaseClient
    .from('orders')
    .insert(payload)
    .select()
    .single();

  return { data: data as OrderType | null, error };
}

export async function fetchOrders(filters: OrderFilters = {}) {
  let query = supabaseClient
    .from('orders')
    .select('*, product:products(id, name, price, type, stock_quantity)')
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status as OrderStatus);
  }

  if (filters.phone) {
    query = query.ilike('phone', `%${filters.phone}%`);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data, error } = await query;
  return { data: (data as OrderType[]) || [], error };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return supabaseClient.from('orders').update({ status }).eq('id', id);
}

export async function deleteOrder(id: string) {
  return supabaseClient.from('orders').delete().eq('id', id);
}
