
import { supabase } from './supabase';
import { Product, Sale, SaleItem } from './types';

// Products API
export const productAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data as Product[];
  },
  
  getActive: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true });
    if (error) throw error;
    return data as Product[];
  },

  save: async (product: Partial<Product>) => {
    if (product.id) {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          price: product.price,
          category: product.category,
          status: product.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          price: product.price,
          category: product.category,
          status: product.status || 'active'
        }]);
      if (error) throw error;
    }
  },

  delete: async (id: number) => {
    const { error } = await supabase
      .from('products')
      .update({ status: 'inactive' })
      .eq('id', id);
    if (error) throw error;
  }
};

// Sales API
export const salesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          *,
          products (name)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  create: async (items: { productId: number; quantity: number; price: number }[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // 1. Create the Sale record
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        total_amount: totalAmount,
        created_by: user.id
      }])
      .select()
      .single();

    if (saleError) throw saleError;

    // 2. Create the Sale Items
    const saleItemsData = items.map(item => ({
      sale_id: sale.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_sale: item.price,
      line_total: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItemsData);

    if (itemsError) throw itemsError;

    return sale;
  }
};
