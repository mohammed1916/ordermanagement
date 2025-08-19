'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { Product } from '@/types';
import mockProducts from '@/data/products';

export default function ProductDetails() {
    const { addToCart } = useCart();
    const params = useParams();
    const productId = params?.productId as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        const found = mockProducts.find(p => p.id === productId);
        if (found) {
            setProduct(found);
            setSelectedSize(found.sizes[0]);
            setSelectedColor(found.colors[0]?.name || '');
        }
    }, [productId]);

    const handleAddToCart = () => {
        if (!product) return;
        if (!selectedSize) return setError('Please select a size');
        if (!selectedColor) return setError('Please select a color');
        setError('');
        setIsAddingToCart(true);

        setIsAddingToCart(true);
        
        addToCart(product, quantity, selectedSize, selectedColor);
        setIsAddingToCart(false);
        setAddedToCart(true);

        setTimeout(() => setAddedToCart(false), 3000);
            };

    if (!product) {
        return <div className="p-10 text-gray-500">Loading product...</div>;
    }

    const handleViewCart = () => {
        window.location.href = '/cart';
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="relative h-[350px] w-full overflow-hidden rounded-lg shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-full z-0 bg-white"  />
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="relative z-10 w-full h-full object-contain"
                    />
                </div>

                <div>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{product.name}</h1>
                            <p className="text-2xl text-gray-700 mt-2">₹ {product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <FavoriteButton product={product} size="lg" />
                        </div>
                    </div>
                    <p className="text-gray-600 mt-4">{product.description}</p>

                    {/* Size Selection */}
                    <div className="mt-6">
                        <h3 className="font-medium">Size</h3>
                        <div className="flex gap-2 mt-2">
                            {product.sizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-4 py-2 border rounded ${selectedSize === size
                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                        : 'border-gray-300'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="mt-6">
                        <h3 className="font-medium">Color</h3>
                            <div className="flex gap-3 mt-2">
                            {product.colors.map(color => {
                                const isSingleColor = product.colors.length === 1;
                                return (
                                <button
                                    key={color.name}
                                    type="button"
                                    disabled={!product.inStock || isSingleColor}
                                    onClick={() => setSelectedColor(color.name)}
                                    title={isSingleColor ? 'Color' : 'Select this color'}
                                    className={`
                                    w-8 h-8 rounded-full border-2
                                    ${color.class}
                                    ${!isSingleColor ? 'transition-transform duration-300 hover:scale-110 cursor-pointer' : 'cursor-default'}
                                    ${selectedColor === color.name ? 'border-blue-600' : 'border-gray-300'}
                                    ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                    aria-label={isSingleColor ? `Color: ${color.name}` : `Select ${color.name} color`}
                                />
                                );
                            })}
                            </div>

                    </div>

                    {/* Quantity Selector */}
                    <div className="mt-6">
                        <h3 className="font-medium">Quantity</h3>
                        <div className="flex items-center mt-2">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-3 py-1 border border-gray-300 rounded-l bg-gray-50"
                            >-</button>
                            <input
                                title='Quantity'
                                placeholder='1'
                                type="number"
                                min="1"
                                max={product.countAvailable}
                                value={quantity}
                                onChange={e => {
                                    const val = parseInt(e.target.value) || 1;
                                    setQuantity(Math.min(product.countAvailable ?? 0, Math.max(1, val)));
                                }}
                                className="w-16 text-center border-y border-gray-300"
                            />
                            <button
                                onClick={() => setQuantity(prev => Math.min(product.countAvailable ?? 0, prev + 1))}
                                className="px-3 py-1 border border-gray-300 rounded-r bg-gray-50"
                            >+</button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 mt-4">{error}</p>}

                    {/* Add to Cart */}
                    <div className="mt-8">
                        <button
                            title='Add to Cart'
                            type='button'
                            onClick={handleAddToCart}
                            disabled={isAddingToCart || !product.inStock}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isAddingToCart
                                ? 'Adding...'
                                : addedToCart
                                    ? 'Added to Cart!'
                                    : product.inStock
                                        ? 'Add to Cart'
                                        : 'Out of Stock'}
                        </button>
                        <div className="mt-4"></div>
                        {<button
                            title='View Cart'
                            type='button'
                            onClick={handleViewCart}
                            className="w-full bg-black text-white py-3 px-6 rounded hover:bg-gray-800 disabled:bg-gray-400"
                        >
                            View Cart
                        </button>}
                    </div>
                </div>
            </div>
        </div>
    );
}
