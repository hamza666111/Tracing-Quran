export type ProductType = {
  id: string;
  name: string;
  type: 'full' | 'para' | 'surah';
  price: number;
  image_url: string | null;
  is_active: boolean;
  stock_quantity: number;
  created_at: string;
};

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export type OrderType = {
  id: string;
  user_id?: string | null;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  product?: ProductType;
};

export type OrderFilters = {
  status?: OrderStatus | 'all';
  phone?: string;
  startDate?: string;
  endDate?: string;
};
