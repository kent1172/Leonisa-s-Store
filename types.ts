
export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER'
}

export interface User {
  id: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  productName: string;
  quantity: number;
  priceAtSale: number;
  lineTotal: number;
}

export interface Sale {
  id: number;
  totalAmount: number;
  createdAt: string;
  items: SaleItem[];
}

export interface DashboardStats {
  totalSalesToday: number;
  totalSalesMonth: number;
  activeProducts: number;
  recentSales: Sale[];
}
