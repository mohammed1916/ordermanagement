'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCartFromFirestore, saveCartToFirestore } from '@/lib/firestore/cart';
import { CartItem, Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface CartState {
  items: CartItem[];
  total: number;
}

interface CartContextType {
  cart: CartState;
  addToCart: (product: Product, quantity: number, size: string, color: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartState>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        setIsLoading(true);
        const fetchedCart = await getCartFromFirestore(user.id);
        if (fetchedCart) {
          setCart(fetchedCart);
        } else {
          setCart({ items: [], total: 0 });
        }
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  const updateFirestoreCart = async (updatedItems: CartItem[]) => {
    const total = updatedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const newCart = { items: updatedItems, total };
    setCart(newCart);
    if (user) await saveCartToFirestore(user.id, newCart);
  };

  const addToCart = (product: Product, quantity: number, size: string, color: string) => {
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.id === product.id && item.size === size && item.color === color
    );

    const updatedItems = [...cart.items];

    if (existingIndex >= 0) {
      updatedItems[existingIndex].quantity += quantity;
    } else {
      updatedItems.push({ product, quantity, size, color });
    }

    updateFirestoreCart(updatedItems);
  };

  const removeFromCart = (productId: string) => {
    const updatedItems = cart.items.filter(item => item.product.id !== productId);
    updateFirestoreCart(updatedItems);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const updatedItems = cart.items.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    updateFirestoreCart(updatedItems);
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
    if (user) saveCartToFirestore(user.id, { items: [], total: 0 });
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
