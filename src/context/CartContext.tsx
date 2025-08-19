'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { cartService } from '@/lib/firestore/services';
import { Cart, CartItem } from '@/lib/firestore/schemas';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface CartContextType {
  cart: Cart | null;
  addToCart: (product: Product, quantity: number, size: string, color: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  const addToCart = async (product: Product, quantity: number, size: string, color: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to add items to cart');
    }

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
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error; // Re-throw to allow caller to handle
    }
  };

  const removeFromCart = async (productId: string): Promise<void> => {
    if (!user || !cart) {
      throw new Error('User must be logged in and have a cart to remove items');
    }

    try {
      // Find the item to remove
      const itemToRemove = cart.items.find((item: CartItem) => item.productId === productId);
      if (!itemToRemove) {
        throw new Error('Item not found in cart');
      }

      await cartService.removeFromCart(user.id, itemToRemove.id);
      
      // Refresh cart data
      const updatedCart = await cartService.getUserCart(user.id);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error; // Re-throw to allow caller to handle
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<void> => {
    if (!user || !cart) {
      throw new Error('User must be logged in and have a cart to update quantities');
    }

    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    try {
      // Find the item to update
      const itemToUpdate = cart.items.find((item: CartItem) => item.productId === productId);
      if (!itemToUpdate) {
        throw new Error('Item not found in cart');
      }

      await cartService.updateCartItemQuantity(user.id, itemToUpdate.id, quantity);
      
      // Refresh cart data
      const updatedCart = await cartService.getUserCart(user.id);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error; // Re-throw to allow caller to handle
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to clear cart');
    }

    try {
      await cartService.clearCart(user.id);
      setCart(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error; // Re-throw to allow caller to handle
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
