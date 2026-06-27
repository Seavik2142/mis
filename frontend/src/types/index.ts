export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Product {
  id: number;
  product_code: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  customer_code: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  segment: string;
  orders: number;
  spend: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_name: string;
  sku: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  customer: {
    id: number;
    customer_code: string;
    name: string;
    company: string | null;
    email: string;
  };
  channel: string;
  status: string;
  ordered_at: string;
  total: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  movement_type: string;
  quantity: number;
  note: string | null;
  created_by: number | null;
  created_at: string;
}

export interface DashboardSummary {
  revenue: number;
  orders: number;
  customers: number;
  inventory_value: number;
  low_stock_products: number;
  units_in_stock: number;
  active_products: number;
}

