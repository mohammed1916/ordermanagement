'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mockProducts from '@/data/products';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiSearch, 
  FiGrid, 
  FiList, 
  FiChevronDown,
  FiShoppingCart,
  FiHeart,
  FiEye,
  FiTrendingUp
} from 'react-icons/fi';

type ViewMode = 'grid' | 'list';
type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest';

interface FilterState {
  category: string;
  priceRange: string;
  size: string;
  color: string;
}

const ProductCategories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: 'all',
    size: 'all',
    color: 'all'
  });

  const { addToCart } = useCart();
  const toast = useToast();

  // Filter options
  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'new', label: 'New Arrivals' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-500', label: 'Under ₹500' },
    { value: '500-1000', label: '₹500 - ₹1000' },
    { value: '1000-2000', label: '₹1000 - ₹2000' },
    { value: '2000+', label: 'Over ₹2000' }
  ];

  const sizes = [
    { value: 'all', label: 'All Sizes' },
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' }
  ];

  const colors = [
    { value: 'all', label: 'All Colors' },
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' }
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' }
  ];

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = mockProducts.filter((product: Product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || product.category.includes(filters.category);
      
      const matchesPriceRange = (() => {
        if (filters.priceRange === 'all') return true;
        const price = product.price;
        switch (filters.priceRange) {
          case '0-500': return price < 500;
          case '500-1000': return price >= 500 && price <= 1000;
          case '1000-2000': return price >= 1000 && price <= 2000;
          case '2000+': return price > 2000;
          default: return true;
        }
      })();

      const matchesSize = filters.size === 'all' || product.sizes.includes(filters.size);
      const matchesColor = filters.color === 'all' || product.colors.some((c: any) => c.name.toLowerCase() === filters.color);

      return matchesSearch && matchesCategory && matchesPriceRange && matchesSize && matchesColor;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a: Product, b: Product) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a: Product, b: Product) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a: Product, b: Product) => parseInt(b.id) - parseInt(a.id));
        break;
      default:
        break;
    }

    return filtered;
  }, [searchTerm, filters, sortBy]);

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleQuickAdd = async (product: Product) => {
    setIsLoading(true);
    try {
      const defaultSize = product.sizes[0];
      const defaultColor = product.colors[0];
      
      await addToCart(product, 1, defaultSize, defaultColor.name);

      toast.success('Added to Cart', `${product.name} has been added to your cart!`);
    } catch (error) {
      toast.error('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      priceRange: 'all',
      size: 'all',
      color: 'all'
    });
    setSearchTerm('');
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length + 
                           (searchTerm ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto max-w-6xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Discover Your Style
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Explore our curated collection of premium clothing and accessories
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center items-center gap-4"
          >
            <div className="flex items-center gap-2 text-sm">
              <FiTrendingUp className="w-5 h-5" />
              <span>Trending Now</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <FilterDropdown
              label="Category"
              options={categories}
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
            />
            <FilterDropdown
              label="Price Range"
              options={priceRanges}
              value={filters.priceRange}
              onChange={(value) => handleFilterChange('priceRange', value)}
            />
            <FilterDropdown
              label="Size"
              options={sizes}
              value={filters.size}
              onChange={(value) => handleFilterChange('size', value)}
            />
            <FilterDropdown
              label="Color"
              options={colors}
              value={filters.color}
              onChange={(value) => handleFilterChange('color', value)}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {filteredAndSortedProducts.length} products found
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear filters ({activeFiltersCount})
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <FilterDropdown
                label="Sort by"
                options={sortOptions}
                value={sortBy}
                onChange={(value) => setSortBy(value as SortOption)}
              />

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-l-lg transition-colors`}
                  aria-label="Grid view"
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-r-lg transition-colors`}
                  aria-label="List view"
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid/List */}
        <AnimatePresence mode="wait">
          {filteredAndSortedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16 bg-white rounded-xl shadow-lg"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <FiSearch className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We couldn't find any products matching your search criteria. 
                Try adjusting your filters or search terms.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-6'
              }
            >
              {filteredAndSortedProducts.map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {viewMode === 'grid' ? (
                    <ProductGridCard 
                      product={product} 
                      onQuickAdd={handleQuickAdd}
                      isLoading={isLoading}
                    />
                  ) : (
                    <ProductListCard 
                      product={product} 
                      onQuickAdd={handleQuickAdd}
                      isLoading={isLoading}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Filter Dropdown Component
interface FilterDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors min-w-[140px] justify-between"
      >
        <span className="text-sm">
          <span className="text-gray-500">{label}:</span>{' '}
          <span className="font-medium">{selectedOption?.label}</span>
        </span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  value === option.value ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Product Grid Card Component
interface ProductCardProps {
  product: Product;
  onQuickAdd: (product: Product) => void;
  isLoading: boolean;
}

const ProductGridCard: React.FC<ProductCardProps> = ({ product, onQuickAdd, isLoading }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-square relative">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 flex items-center justify-center gap-3"
            >
              <Link
                href={`/shop/product/${product.id}`}
                className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                aria-label="View product details"
              >
                <FiEye className="w-5 h-5 text-gray-700" />
              </Link>
              <button 
                className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                aria-label="Add to wishlist"
              >
                <FiHeart className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => onQuickAdd(product)}
                disabled={isLoading}
                className="p-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50"
                aria-label="Add to cart"
              >
                <FiShoppingCart className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          <span className="text-sm text-gray-600">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {product.colors.slice(0, 4).map((color, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 border-gray-200 ${color.class}`}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-gray-500">+{product.colors.length - 4}</span>
          )}
        </div>

        <Link
          href={`/shop/product/${product.id}`}
          className="block w-full py-2 text-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

// Product List Card Component
const ProductListCard: React.FC<ProductCardProps> = ({ product, onQuickAdd, isLoading }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-80 h-64 md:h-48">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                <span className="text-sm text-gray-600">
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Colors: </span>
                  <div className="inline-flex items-center gap-1 ml-1">
                    {product.colors.slice(0, 5).map((color, index) => (
                      <div
                        key={index}
                        className={`w-5 h-5 rounded-full border-2 border-gray-200 ${color.class}`}
                      />
                    ))}
                    {product.colors.length > 5 && (
                      <span className="text-xs text-gray-500 ml-1">+{product.colors.length - 5}</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Sizes: </span>
                  <span className="text-sm text-gray-700">{product.sizes.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/shop/product/${product.id}`}
                className="flex-1 py-3 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                View Details
              </Link>
              <button
                onClick={() => onQuickAdd(product)}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
              >
                <FiShoppingCart className="w-5 h-5" />
                Quick Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCategories;
