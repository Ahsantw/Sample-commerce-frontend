import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Cart } from '@/types';

interface CartContextType {
  cartCount: number;
  cart: Cart | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const refreshCart = async () => {
    if (!user || isAdmin) {
      setCart(null);
      setCartCount(0);
      return;
    }

    try {
      setLoading(true);
      const cartData = await api.getCart();
      setCart(cartData);
      setCartCount(cartData.items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error('Error refreshing cart:', error);
      setCart(null);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      throw new Error('Please login to add items to cart');
    }

    try {
      setLoading(true);
      const updatedCart = await api.addToCart(productId, quantity);
      setCart(updatedCart);
      setCartCount(updatedCart.items.reduce((sum, item) => sum + item.quantity, 0));
      
      toast({
        title: 'Added to cart',
        description: 'Item has been added to your cart',
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add item to cart',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      const updatedCart = await api.updateCartItem(productId, quantity);
      setCart(updatedCart);
      setCartCount(updatedCart.items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update item',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setLoading(true);
      const updatedCart = await api.removeFromCart(productId);
      setCart(updatedCart);
      setCartCount(updatedCart.items.reduce((sum, item) => sum + item.quantity, 0));
      
      toast({
        title: 'Success',
        description: 'Item removed from cart',
      });
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove item',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await api.clearCart();
      setCart(null);
      setCartCount(0);
      
      toast({
        title: 'Success',
        description: 'Cart cleared successfully',
      });
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear cart',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user, isAdmin]);

  return (
    <CartContext.Provider value={{
      cartCount,
      cart,
      loading,
      refreshCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};