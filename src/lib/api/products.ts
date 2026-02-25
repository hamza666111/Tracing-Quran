import { supabaseClient } from '../supabase/client';
import { ProductType } from '../types';

export async function fetchActiveProducts() {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('type', { ascending: true })
    .order('created_at', { ascending: true });

  return { data: (data as ProductType[]) || [], error };
}

export async function fetchAllProducts() {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return { data: (data as ProductType[]) || [], error };
}

export async function upsertProduct(payload: Partial<ProductType> & { id?: string }) {
  const { data, error } = await supabaseClient
    .from('products')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  return { data: data as ProductType | null, error };
}

export async function deleteProduct(id: string) {
  return supabaseClient.from('products').delete().eq('id', id);
}

export async function toggleProductActive(id: string, isActive: boolean) {
  return supabaseClient.from('products').update({ is_active: isActive }).eq('id', id);
}
