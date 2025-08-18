// src/app/cart/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import withAuth from '@/components/hoc/withAuth';

function Cart() {
    const { cart, updateQuantity, removeFromCart, isLoading } = useCart();

    // Early return for loading state
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto text-center py-16">
                <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
                <p className="text-gray-600 mb-8">Loading cart...</p>
            </div>
        );
    }

    // Early return for empty cart or no cart data
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto text-center py-16">
                <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
                <p className="text-gray-600 mb-8">Your cart is currently empty.</p>
                <Link href="/shop" className="bg-blue-500 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-600 transition duration-200">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    // Validate cart pricing data
    const hasValidPricing = cart && cart.pricing && 
                           typeof cart.pricing.subtotal === 'number' && 
                           typeof cart.pricing.shipping === 'number' && 
                           typeof cart.pricing.tax === 'number' && 
                           typeof cart.pricing.total === 'number';

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <ul role="list" className="divide-y divide-gray-200">
                            {cart.items.map((item) => (
                                <li key={`${item.productId}-${item.size}-${item.color}`} className="p-6">
                                    <div className="flex items-center">
                                        {/* Product Image */}
                                        <div className="w-24 h-24  rounded-md flex-shrink-0" >
                                            <img
                                                src={item.productImage}
                                                alt={item.productName}
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="ml-6 flex-1">
                                            <div className="flex justify-between">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    <Link href={`/product/${item.productId}`} className="hover:text-blue-500">
                                                        {item.productName}
                                                    </Link>
                                                </h3>
                                                <p className="text-lg font-medium text-gray-900">
                                                    ₹{item.totalPrice.toFixed(2)}
                                                </p>
                                            </div>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Size: {item.size} | Color: { item.color }
                                            </p>

                                            <div className="flex items-center justify-between mt-4">
                                                {/* Quantity Selector */}
                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-3 py-1">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => removeFromCart(item.productId)}
                                                    className="text-sm font-medium text-red-600 hover:text-red-500"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-6">
                        <Link href="/shop" className="text-blue-500 hover:text-blue-600 font-medium flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            Continue Shopping
                        </Link>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="md:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <p className="text-gray-600">Subtotal</p>
                                <p className="text-gray-900 font-medium">
                                    {hasValidPricing ? 
                                        `₹${cart.pricing.subtotal.toFixed(2)}` : 
                                        'No info available'}
                                </p>
                            </div>

                            <div className="flex justify-between">
                                <p className="text-gray-600">Shipping</p>
                                <p className="text-gray-900 font-medium">
                                    {hasValidPricing ? 
                                        (cart.pricing.shipping === 0 ? 'Free' : `₹${cart.pricing.shipping.toFixed(2)}`) : 
                                        'No info available'}
                                </p>
                            </div>

                            <div className="flex justify-between">
                                <p className="text-gray-600">Tax</p>
                                <p className="text-gray-900 font-medium">
                                    {hasValidPricing ? 
                                        `₹${cart.pricing.tax.toFixed(2)}` : 
                                        'No info available'}
                                </p>
                            </div>

                            <div className="border-t border-gray-200 pt-3 mt-3">
                                <div className="flex justify-between font-medium">
                                    <p className="text-gray-900">Total</p>
                                    <p className="text-gray-900">
                                        {hasValidPricing ? 
                                            `₹${cart.pricing.total.toFixed(2)}` : 
                                            'No info available'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/checkout"
                                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition duration-200"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>

                        <div className="mt-4 text-center text-sm text-gray-500">
                            <p>We accept</p>
                            <div className="flex justify-center space-x-2 mt-2">
                                <div className="w-10 h-6 bg-gray-200 rounded" />
                                <div className="w-10 h-6 bg-gray-200 rounded" />
                                <div className="w-10 h-6 bg-gray-200 rounded" />
                                <div className="w-10 h-6 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(Cart);