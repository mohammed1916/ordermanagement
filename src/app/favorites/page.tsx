'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiEye } from 'react-icons/fi';

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const { favorites, isLoading, error } = useFavorites();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = async (product: any) => {
    try {
      // For favorites, we'll add with default size and color (can be enhanced later)
      const defaultSize = product.sizes[0] || 'M';
      const defaultColor = product.colors[0]?.name || 'Black';
      
      await addToCart(product, 1, defaultSize, defaultColor);
      addToast({
        title: 'Success',
        message: 'Item added to cart',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to add to cart',
        type: 'error'
      });
    }
  };

  // Show favorites error if there's a context error
  useEffect(() => {
    if (error) {
      addToast({
        title: 'Error',
        message: error,
        type: 'error'
      });
    }
  }, [error, addToast]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your favorites.</p>
          <Link
            href="/account"
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {favorites.length === 0 
              ? 'You haven\'t added any favorites yet.' 
              : `${favorites.length} item${favorites.length !== 1 ? 's' : ''} in your favorites`
            }
          </p>
        </div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <FiEye className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start exploring our collection and click the heart icon on products you love to add them here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {favorites.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                  
                  {/* Favorite button overlay */}
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full">
                    <FavoriteButton product={product} size="md" />
                  </div>
                  
                  {/* Stock status badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={`/shop/product/${product.id}`}
                      className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                      aria-label="View product details"
                    >
                      <FiEye className="w-5 h-5 text-gray-700" />
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className="p-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Add to cart"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-sm text-gray-600">
                      {product.inStock ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {product.colors.slice(0, 4).map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className={`w-4 h-4 rounded-full border-2 border-gray-200 ${color.class}`}
                      />
                    ))}
                    {product.colors.length > 4 && (
                      <span className="text-xs text-gray-500 ml-1">+{product.colors.length - 4}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
