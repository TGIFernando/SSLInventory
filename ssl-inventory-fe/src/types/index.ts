export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export interface Item {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  quantity: number;
  quantity_min: number;
  unit: string;
  condition: 'good' | 'fair' | 'poor';
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
}

export interface Transaction {
  id: number;
  item_id: number;
  type: 'check_in' | 'check_out' | 'adjustment';
  quantity: number;
  event_name: string | null;
  notes: string | null;
  reference_tx_id: number | null;
  delivery_type: 'will_call' | 'install' | null;
  created_at: string;
  item_name?: string;
}

export interface Stats {
  total: number;
  low_stock: number;
  byCategory: Array<{
    id: number;
    name: string;
    slug: string;
    icon: string;
    item_count: number;
    total_quantity: number;
  }>;
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  item_name?: string;
  unit?: string;
}

export interface Order {
  id: number;
  order_name: string;
  client_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  delivery_type: 'will_call' | 'install' | null;
  status: 'pending' | 'complete' | 'returned';
  created_at: string;
  updated_at: string;
  item_count?: number;
  items?: OrderItem[];
}
