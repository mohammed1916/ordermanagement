'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import mockProducts from '@/data/products';
import { useParams } from 'next/navigation';

export default function ProductCategories() {
  const params = useParams();
  const category =
    typeof params?.category === 'string'
      ? params.category
      : Array.isArray(params?.category)
      ? params.category[0]
      : 'all';

  const [filters, setFilters] = useState<{
    category: string;
    size: string;
    color: string;
    sortBy: string;
  }>({
    category: 'all',
    size: 'all',
    color: 'all',
    sortBy: 'default',
  });

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const size = searchParams.get('size') || 'all';
    const color = searchParams.get('color') || 'all';
    const sortBy = searchParams.get('sortBy') || 'default';

    setFilters({
      category,
      size,
      color,
      sortBy,
    });
  }, [category]);

  useEffect(() => {
    let filteredProducts = [...mockProducts];

    if (filters.category !== 'all') {
      filteredProducts = filteredProducts.filter((product) => {
        const categories = Array.isArray(product.category) ? product.category : [product.category];
        return categories.includes(filters.category);
      });
    }

    if (filters.size !== 'all') {
      filteredProducts = filteredProducts.filter((product) =>
        product.sizes.includes(filters.size)
      );
    }

    if (filters.color !== 'all') {
      filteredProducts = filteredProducts.filter(product =>
        product.colors.some(c => c.name === filters.color)
      );
    }

    switch (filters.sortBy) {
      case 'price-low-high':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-a-z':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-z-a':
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    setProducts(filteredProducts);
  }, [filters]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shop T-Shirts</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between mb-8">
        <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Categories</option>
              <option value="men">Men</option>
              <option value="new">New Arrivals</option>
              <option value="sale">Sale</option>
            </select>
          </div>

          {/* Size */}
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
            <select
              id="size"
              value={filters.size}
              onChange={(e) => handleFilterChange('size', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Sizes</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <select
              id="color"
              value={filters.color}
              onChange={(e) => handleFilterChange('color', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Colors</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Sky Blue">Sky Blue</option>
              <option value="Deep Blue">Deep Blue</option>
              <option value="Green">Green</option>
              <option value="Maroon">Maroon</option>
              <option value="Peach">Peach</option>
            </select>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="default">Featured</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-a-z">Name: A to Z</option>
            <option value="name-z-a">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Products */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/shop/product/${product.id}`} className="group">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-500">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-gray-600">₹ {product.price.toFixed(2)}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    {product.colors.map((color) => (
                      <div
                        key={color.name}
                        className={`w-4 h-4 rounded-full border border-gray-300 ${color.class}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
