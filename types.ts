
export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER'
}

export interface User {
  id: string; // UUID from Auth
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_name?: string; // Helper for UI
  quantity: number;
  price_at_sale: number;
  line_total: number;
  products?: Partial<Product>; // For joined queries
}

export interface Sale {
  id: number;
  total_amount: number;
  created_at: string;
  created_by: string;
  sale_items?: SaleItem[];
}

export interface DashboardStats {
  todaySales: number;
  monthSales: number;
  activeProducts: number;
  totalOrders: number;
}
