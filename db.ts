
import { Product, Sale, User, UserRole, SaleItem } from './types';

const STORAGE_KEY = 'leonisa_store_db';

interface DBStructure {
  products: Product[];
  sales: Sale[];
  users: User[];
}

const DEFAULT_DB: DBStructure = {
  users: [
    { id: 1, username: 'admin', role: UserRole.ADMIN, createdAt: new Date().toISOString() },
    { id: 2, username: 'cashier1', role: UserRole.CASHIER, createdAt: new Date().toISOString() },
  ],
  products: [
    { id: 1, name: 'Premium Espresso Beans 1kg', price: 45.00, category: 'Coffee', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 2, name: 'Artisan Dark Chocolate', price: 12.50, category: 'Sweets', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 3, name: 'Honey Lavender Syrup', price: 18.00, category: 'Beverages', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  sales: []
};

export const getDB = (): DBStructure => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : DEFAULT_DB;
};

export const saveDB = (db: DBStructure) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// Products API
export const productAPI = {
  getAll: () => getDB().products,
  getActive: () => getDB().products.filter(p => p.status === 'active'),
  save: (product: Partial<Product>) => {
    const db = getDB();
    if (product.id) {
      db.products = db.products.map(p => p.id === product.id ? { ...p, ...product, updatedAt: new Date().toISOString() } as Product : p);
    } else {
      const newProduct: Product = {
        ...(product as any),
        id: Math.max(0, ...db.products.map(p => p.id)) + 1,
        status: product.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.products.push(newProduct);
    }
    saveDB(db);
  },
  delete: (id: number) => {
    const db = getDB();
    db.products = db.products.map(p => p.id === id ? { ...p, status: 'inactive' } as Product : p);
    saveDB(db);
  }
};

// Sales API
export const salesAPI = {
  getAll: () => getDB().sales,
  create: (items: { productId: number; quantity: number }[]) => {
    const db = getDB();
    const products = db.products;
    
    const saleItems: SaleItem[] = items.map((item, index) => {
      const product = products.find(p => p.id === item.productId)!;
      const lineTotal = product.price * item.quantity;
      return {
        id: index + 1,
        saleId: 0, // Placeholder
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        priceAtSale: product.price,
        lineTotal
      };
    });

    const totalAmount = saleItems.reduce((acc, item) => acc + item.lineTotal, 0);
    const newSale: Sale = {
      id: Math.max(0, ...db.sales.map(s => s.id)) + 1,
      totalAmount,
      createdAt: new Date().toISOString(),
      items: saleItems.map(si => ({ ...si, saleId: Math.max(0, ...db.sales.map(s => s.id)) + 1 }))
    };

    db.sales.unshift(newSale);
    saveDB(db);
    return newSale;
  }
};
