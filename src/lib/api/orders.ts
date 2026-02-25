import { supabaseClient } from '../supabase/client';
import { OrderFilters, OrderGroupType, OrderStatus } from '../types';

export type CreateOrderItemInput = {
  product_id: string;
  quantity: number;
};

export type CreateOrderGroupPayload = {
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  items: CreateOrderItemInput[];
};

export async function placeGroupedOrder(payload: CreateOrderGroupPayload) {
  const { customer_name, phone, city, address, items } = payload;

  if (!items.length) {
    return { data: null, error: new Error('Cart is empty') };
  }

  const { data: orderGroup, error: groupError } = await supabaseClient
    .from('order_groups')
    .insert({ customer_name, phone, city, address })
    .select('*')
    .single();

  if (groupError || !orderGroup) {
    return { data: null, error: groupError || new Error('Unable to create order') };
  }

  const itemsPayload = items.map((item) => ({
    order_id: orderGroup.id,
    product_id: item.product_id,
    quantity: item.quantity,
  }));

  const { data: orderItems, error: itemsError } = await supabaseClient
    .from('order_items')
    .insert(itemsPayload)
    .select('*, product:products(id, name, price, type, stock_quantity)');

  if (itemsError || !orderItems) {
    return { data: null, error: itemsError || new Error('Unable to add items') };
  }

  const assembled: OrderGroupType = {
    ...orderGroup,
    items: orderItems,
  };

  return { data: assembled, error: null };
}

export async function fetchOrders(filters: OrderFilters = {}) {
  let query = supabaseClient
    .from('order_groups')
    .select('*, items:order_items(*, product:products(id, name, price, type, stock_quantity))')
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
  return { data: (data as OrderGroupType[]) || [], error };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return supabaseClient.from('order_groups').update({ status }).eq('id', id);
}

export async function deleteOrder(id: string) {
  return supabaseClient.from('order_groups').delete().eq('id', id);
}
