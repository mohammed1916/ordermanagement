'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => Promise<boolean>;
  removeFromFavorites: (productId: string) => Promise<boolean>;
  isFavorite: (productId: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    // Return a safe fallback instead of throwing
    return {
      favorites: [],
      addToFavorites: async () => false,
      removeFromFavorites: async () => false,
      isFavorite: () => false,
      isLoading: false,
      error: 'Favorites provider not found'
    };
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`favorites_${user.id}`);
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse favorites from localStorage:', error);
          localStorage.removeItem(`favorites_${user.id}`);
        }
      }
    } else {
      setFavorites([]);
    }
  }, [user]);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (user && favorites.length >= 0) {
      try {
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
      } catch (error) {
        console.error('Failed to save favorites to localStorage:', error);
      }
    }
  }, [favorites, user]);

  const addToFavorites = useCallback(async (product: Product): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to add items to favorites');
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      setFavorites(prev => {
        // Check if already in favorites
        if (prev.some(item => item.id === product.id)) {
          return prev;
        }
        return [...prev, product];
      });

      // In production, you would sync with your backend here:
      // await favoritesService.addToFavorites(user.id, product.id);
      
      return true;
    } catch (error) {
      // Revert the optimistic update on error
      setFavorites(prev => prev.filter(item => item.id !== product.id));
      setError('Failed to add item to favorites');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const removeFromFavorites = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to remove items from favorites');
      return false;
    }

    setIsLoading(true);
    setError(null);
    const previousFavorites = favorites;
    
    try {
      // Optimistic update
      setFavorites(prev => prev.filter(item => item.id !== productId));

      // In production, you would sync with your backend here:
      // await favoritesService.removeFromFavorites(user.id, productId);
      
      return true;
    } catch (error) {
      // Revert the optimistic update on error
      setFavorites(previousFavorites);
      setError('Failed to remove item from favorites');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, favorites]);

  const isFavorite = useCallback((productId: string) => {
    return favorites.some(item => item.id === productId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      isLoading,
      error
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};
