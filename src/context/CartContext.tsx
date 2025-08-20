'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { cartService } from '@/lib/firestore/services';
import { Cart, CartItem } from '@/lib/firestore/schemas';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface CartContextType {
  cart: Cart | null;
  addToCart: (product: Product, quantity: number, size: string, color: string) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      // Wait for authentication to complete
      if (authLoading) {
        return;
      }
      
      if (user) {
        console.log('Fetching cart for authenticated user:', user.id);
        setIsLoading(true);
        try {
          const fetchedCart = await cartService.getUserCart(user.id);
          if (fetchedCart && fetchedCart.items && fetchedCart.items.length > 0) {
            setCart(fetchedCart);
          } else {
            setCart(null);
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
          setCart(null);
        }
        setIsLoading(false);
      } else {
        console.log('No user authenticated, clearing cart');
        setCart(null);
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [user, authLoading]);

  const addToCart = async (product: Product, quantity: number, size: string, color: string): Promise<boolean> => {
    if (!user) {
      setError('Please sign in to add items to your cart');
      return false;
    }

    setError(null);

    try {
      const cartItem: Omit<CartItem, 'id' | 'addedAt'> = {
        productId: product.id,
        productName: product.name,
        productSku: product.id, // Use product ID as SKU fallback
        quantity,
        size,
        color,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
        productImage: product.images[0] || '',
        availability: product.inStock ? 'in_stock' : 'out_of_stock'
      };

      await cartService.addToCart(user.id, cartItem);
      
      // Refresh cart data
      const updatedCart = await cartService.getUserCart(user.id);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart. Please try again.');
      return false;
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    if (!user || !cart) {
      setError('Please sign in to manage your cart');
      return false;
    }

    setError(null);

    try {
      // Find the item to remove
      const itemToRemove = cart.items.find((item: CartItem) => item.productId === productId);
      if (!itemToRemove) {
        setError('Item not found in cart');
        return false;
      }

      await cartService.removeFromCart(user.id, itemToRemove.id);
      
      // Refresh cart data
      const updatedCart = await cartService.getUserCart(user.id);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError('Failed to remove item from cart. Please try again.');
      return false;
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<boolean> => {
    if (!user || !cart) {
      setError('Please sign in to manage your cart');
      return false;
    }

    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return false;
    }

    setError(null);

    try {
      // Find the item to update
      const itemToUpdate = cart.items.find((item: CartItem) => item.productId === productId);
      if (!itemToUpdate) {
        setError('Item not found in cart');
        return false;
      }

      await cartService.updateCartItemQuantity(user.id, itemToUpdate.id, quantity);
      
      // Refresh cart data
      const updatedCart = await cartService.getUserCart(user.id);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      setError('Failed to update quantity. Please try again.');
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!user) {
      setError('Please sign in to clear your cart');
      return false;
    }

    setError(null);

    try {
      await cartService.clearCart(user.id);
      setCart(null);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart. Please try again.');
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
