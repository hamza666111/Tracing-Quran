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

export type CartItem = {
  product: ProductType;
  quantity: number;
};

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export type OrderItemType = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: ProductType;
};

export type OrderGroupType = {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  status: OrderStatus;
  created_at: string;
  items: OrderItemType[];
};

export type OrderFilters = {
  status?: OrderStatus | 'all';
  phone?: string;
  startDate?: string;
  endDate?: string;
};
