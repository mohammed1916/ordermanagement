'use client';

import React from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/components/ui/Toast';
import { Product } from '@/types';

interface FavoriteButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  product, 
  size = 'md',
  className = '' 
}) => {
  const { isFavorite, addToFavorites, removeFromFavorites, isLoading, error } = useFavorites();
  const { addToast } = useToast();
  const favorite = isFavorite(product.id);

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    let success = false;
    
    if (favorite) {
      success = await removeFromFavorites(product.id);
      if (success) {
        addToast({
          title: 'Success',
          message: 'Removed from favorites',
          type: 'success'
        });
      }
    } else {
      success = await addToFavorites(product);
      if (success) {
        addToast({
          title: 'Success',
          message: 'Added to favorites',
          type: 'success'
        });
      }
    }

    // Show error toast if operation failed
    if (!success && error) {
      addToast({
        title: 'Error',
        message: error,
        type: 'error'
      });
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200 ease-in-out
        rounded-full p-1.5
        hover:scale-110 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1
        ${favorite 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-400'
        }
        ${className}
      `}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
      suppressHydrationWarning={true}
    >
      <svg
        className={`${sizeClasses[size]} transition-all duration-200`}
        fill={favorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={favorite ? 0 : 2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </svg>
    </button>
  );
};
